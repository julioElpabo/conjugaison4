import bcrypt from 'bcryptjs'
import type { RowDataPacket } from 'mysql2/promise'
import { assertLearnerRateLimit, learnerClientIp } from '../../services/learner-rate-limit'
import { createLearnerSession, getLearnerSession } from '../../utils/learner-session'
import { readLimitedJsonBody } from '../../utils/limited-json-body'

interface PasswordBody {
  currentPassword?: unknown
  newPassword?: unknown
  confirmation?: unknown
}

interface AccountRow extends RowDataPacket {
  passwordHash: string
  sessionVersion: number
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await getLearnerSession(event)
  if (!learner) throw createError({ statusCode: 401, statusMessage: 'Authentification requise' })

  const body = await readLimitedJsonBody<PasswordBody>(event, 8 * 1024)
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''
  const confirmation = typeof body.confirmation === 'string' ? body.confirmation : ''
  if (
    !currentPassword
    || currentPassword.length > 200
    || newPassword.length < 10
    || newPassword.length > 200
    || confirmation !== newPassword
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Données du mot de passe invalides' })
  }

  await Promise.all([
    assertLearnerRateLimit(event, {
      bucket: 'password-account',
      identity: String(learner.id),
      maximum: 5,
      windowSeconds: 60 * 60,
    }),
    assertLearnerRateLimit(event, {
      bucket: 'password-ip',
      identity: learnerClientIp(event),
      maximum: 20,
      windowSeconds: 60 * 60,
    }),
  ])

  const newPasswordHash = await bcrypt.hash(newPassword, 12)
  const connection = await useDatabase().getConnection()
  let nextSessionVersion = 0
  try {
    await connection.beginTransaction()
    const [[account]] = await connection.execute<AccountRow[]>(`
      SELECT password_hash AS passwordHash, session_version AS sessionVersion
      FROM learner_accounts
      WHERE id=? AND deleted_at IS NULL
      FOR UPDATE
    `, [learner.id])
    if (!account || !await bcrypt.compare(currentPassword, account.passwordHash)) {
      throw createError({ statusCode: 401, statusMessage: 'Le mot de passe actuel est incorrect' })
    }
    if (await bcrypt.compare(newPassword, account.passwordHash)) {
      throw createError({ statusCode: 400, statusMessage: 'Choisis un nouveau mot de passe différent de l’actuel' })
    }

    nextSessionVersion = Number(account.sessionVersion) + 1
    await connection.execute(`
      UPDATE learner_accounts
      SET password_hash=?, session_version=?
      WHERE id=?
    `, [newPasswordHash, nextSessionVersion, learner.id])
    await connection.execute('DELETE FROM learner_sessions WHERE account_id=?', [learner.id])
    await connection.execute(`
      INSERT INTO learner_login_events (account_id, event_type)
      VALUES (?, 'password-change')
    `, [learner.id])
    await connection.commit()
  }
  catch (error) {
    await connection.rollback().catch(() => {})
    throw error
  }
  finally {
    connection.release()
  }

  await createLearnerSession(event, learner.id, nextSessionVersion)
  return { ok: true }
})

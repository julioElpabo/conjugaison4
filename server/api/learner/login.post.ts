import bcrypt from 'bcryptjs'
import type { RowDataPacket } from 'mysql2/promise'
import { assertLearnerRateLimit, learnerClientIp } from '../../services/learner-rate-limit'
import { normalizeLearnerUsername } from '../../services/learner-username'
import { createLearnerSession } from '../../utils/learner-session'
import { readLimitedJsonBody } from '../../utils/limited-json-body'

const DUMMY_PASSWORD_HASH = '$2b$12$ty1Uz4EKY7VWSotpC21BLenXpmauqgEttD16EEzo2wp8oeuu2aawq'

interface AccountRow extends RowDataPacket {
  id: number
  username: string
  passwordHash: string
  sessionVersion: number
  status: string
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const body = await readLimitedJsonBody<{ username?: unknown, password?: unknown }>(event, 8 * 1024)
  const username = normalizeLearnerUsername(body.username)
  const password = typeof body.password === 'string' ? body.password : ''
  if (!username || username.length > 80 || !password || password.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiants invalides' })
  }
  await Promise.all([
    assertLearnerRateLimit(event, {
      bucket: 'login-ip',
      identity: learnerClientIp(event),
      maximum: 30,
      windowSeconds: 10 * 60,
    }),
    assertLearnerRateLimit(event, {
      bucket: 'login-identity',
      identity: `${learnerClientIp(event)}:${username}`,
      maximum: 10,
      windowSeconds: 10 * 60,
    }),
  ])
  const [[account]] = await useDatabase().execute<AccountRow[]>(`
    SELECT id, username, password_hash AS passwordHash,
           session_version AS sessionVersion, status
    FROM learner_accounts
    WHERE username_normalized = ? AND deleted_at IS NULL
    LIMIT 1
  `, [username])
  const valid = await bcrypt.compare(password, account?.passwordHash || DUMMY_PASSWORD_HASH)
  if (!account || !valid || !['pending', 'active'].includes(account.status)) {
    throw createError({ statusCode: 401, statusMessage: 'Pseudonyme ou mot de passe incorrect' })
  }
  await useDatabase().execute(`
    UPDATE learner_accounts
    SET last_login_at = CURRENT_TIMESTAMP, deletion_scheduled_at = NULL
    WHERE id = ?
  `, [account.id])
  await useDatabase().execute(
    "INSERT INTO learner_login_events (account_id, event_type) VALUES (?, 'login')",
    [account.id],
  )
  await createLearnerSession(event, account.id, account.sessionVersion)
  return {
    ok: true,
    username: account.username,
    user: { id: account.id, username: account.username },
  }
})

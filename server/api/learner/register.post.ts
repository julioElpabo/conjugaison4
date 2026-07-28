import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import type { ResultSetHeader } from 'mysql2/promise'
import { availableLearnerUsername, isGeneratedLearnerUsername, normalizeLearnerUsername } from '../../services/learner-username'
import { assertLearnerRateLimit, learnerClientIp } from '../../services/learner-rate-limit'
import { assertTurnstile } from '../../services/turnstile'
import {
  assertUsernameProof,
  clearLearnerRegistrationFlow,
  createUsernameProof,
  requireLearnerRegistrationFlow,
} from '../../utils/learner-registration'
import { createLearnerSession } from '../../utils/learner-session'
import { readLimitedJsonBody } from '../../utils/limited-json-body'
import { normalizeLocale } from '../../../shared/i18n/locales'

interface RegistrationBody {
  username?: unknown
  usernameProof?: unknown
  password?: unknown
  privacyAccepted?: unknown
  website?: unknown
  turnstileToken?: unknown
  interfaceLocale?: unknown
}

function recoveryCode() {
  const raw = randomBytes(12).toString('hex').toUpperCase()
  return raw.match(/.{1,4}/gu)?.join('-') || raw
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const flow = requireLearnerRegistrationFlow(event, true)
  const body = await readLimitedJsonBody<RegistrationBody>(event, 8 * 1024)
  const username = normalizeLearnerUsername(body.username)
  const password = typeof body.password === 'string' ? body.password : ''
  const honeypot = typeof body.website === 'string' ? body.website.trim() : ''
  const interfaceLocale = normalizeLocale(body.interfaceLocale, 'fr')

  await Promise.all([
    assertLearnerRateLimit(event, {
      bucket: 'register-flow',
      identity: flow.id,
      maximum: 3,
      windowSeconds: 60 * 60,
    }),
    assertLearnerRateLimit(event, {
      bucket: 'register-ip',
      identity: learnerClientIp(event),
      maximum: 50,
      windowSeconds: 24 * 60 * 60,
    }),
  ])

  if (
    honeypot
    || !isGeneratedLearnerUsername(username)
    || password.length < 10
    || password.length > 200
    || body.privacyAccepted !== true
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Données d’inscription invalides' })
  }
  assertUsernameProof(flow, username, body.usernameProof)
  await assertTurnstile(event, body.turnstileToken, 'learner_register')

  const code = recoveryCode()
  const [passwordHash, recoveryCodeHash] = await Promise.all([
    bcrypt.hash(password, 12),
    bcrypt.hash(code, 12),
  ])
  const database = useDatabase()
  const connection = await database.getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.execute<ResultSetHeader>(`
      INSERT INTO learner_accounts
        (username, username_normalized, password_hash, recovery_code_hash, status,
         privacy_notice_version, deletion_scheduled_at)
      VALUES (?, ?, ?, ?, 'pending', 'prototype-2026-07', CURRENT_TIMESTAMP + INTERVAL 48 HOUR)
    `, [username, username, passwordHash, recoveryCodeHash])
    await connection.execute(
      "INSERT INTO learner_login_events (account_id, event_type) VALUES (?, 'registration')",
      [result.insertId],
    )
    await connection.execute(
      'INSERT INTO learner_preferences (account_id, interface_locale, color_theme) VALUES (?, ?, \'light\')',
      [result.insertId, interfaceLocale],
    )
    await connection.commit()
    await createLearnerSession(event, result.insertId, 1)
    clearLearnerRegistrationFlow(event)
    return {
      ok: true,
      username,
      recoveryCode: code,
      user: { id: result.insertId, username },
    }
  } catch (error) {
    await connection.rollback().catch(() => {})
    if (
      error
      && typeof error === 'object'
      && 'errno' in error
      && Number((error as { errno?: unknown }).errno) === 1062
    ) {
      const replacement = await availableLearnerUsername(database, [username])
      throw createError({
        statusCode: 409,
        statusMessage: 'Ce pseudonyme vient d’être attribué',
        data: {
          username: replacement,
          proof: createUsernameProof(flow, replacement),
        },
      })
    }
    throw error
  } finally {
    connection.release()
  }
})

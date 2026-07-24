import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'
import type { PoolConnection, RowDataPacket } from 'mysql2/promise'

const MAX_FAILURES = 5
const WINDOW_MS = 15 * 60 * 1000
const BLOCK_MS = 15 * 60 * 1000

interface AttemptRow extends RowDataPacket {
  keyHash: string
  failureCount: number
  windowStartedAt: Date | string
  blockedUntil: Date | string | null
}

function hashKey(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function requestKeys(event: H3Event, email: string) {
  // Le proxy nginx de Plesk remplace X-Forwarded-For avant de transmettre la
  // requête à Passenger ; sa première valeur représente donc le client.
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  return [
    hashKey(`ip:${ip}`),
    hashKey(`email:${email.trim().toLocaleLowerCase('fr-CH')}`),
  ]
}

function timestamp(value: Date | string | null) {
  return value ? new Date(value).getTime() : 0
}

function tooManyAttempts(event: H3Event, retryAt: number): never {
  const retryAfter = Math.max(1, Math.ceil((retryAt - Date.now()) / 1000))
  setResponseHeader(event, 'Retry-After', retryAfter)
  throw createError({
    statusCode: 429,
    statusMessage: 'Trop de tentatives de connexion. Réessayez plus tard.',
  })
}

export async function assertAdminLoginAllowed(event: H3Event, email: string) {
  const keys = requestKeys(event, email)
  const [rows] = await useDatabase().execute<AttemptRow[]>(`
    SELECT key_hash AS keyHash, failure_count AS failureCount,
           window_started_at AS windowStartedAt, blocked_until AS blockedUntil
    FROM admin_login_rate_limits
    WHERE key_hash IN (?, ?)
  `, keys)
  const blockedUntil = rows.reduce((latest, row) => Math.max(latest, timestamp(row.blockedUntil)), 0)
  if (blockedUntil > Date.now()) tooManyAttempts(event, blockedUntil)
}

async function recordKeyFailure(connection: PoolConnection, keyHash: string, now: number) {
  const [[row]] = await connection.execute<AttemptRow[]>(`
    SELECT key_hash AS keyHash, failure_count AS failureCount,
           window_started_at AS windowStartedAt, blocked_until AS blockedUntil
    FROM admin_login_rate_limits
    WHERE key_hash = ?
    FOR UPDATE
  `, [keyHash])

  const withinWindow = row && timestamp(row.windowStartedAt) > now - WINDOW_MS
  const failureCount = withinWindow ? Number(row.failureCount) + 1 : 1
  const blockedUntil = failureCount >= MAX_FAILURES ? new Date(now + BLOCK_MS) : null
  const windowStartedAt = withinWindow ? new Date(row.windowStartedAt) : new Date(now)

  await connection.execute(`
    INSERT INTO admin_login_rate_limits
      (key_hash, failure_count, window_started_at, blocked_until, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
      failure_count=VALUES(failure_count),
      window_started_at=VALUES(window_started_at),
      blocked_until=VALUES(blocked_until),
      updated_at=CURRENT_TIMESTAMP
  `, [keyHash, failureCount, windowStartedAt, blockedUntil])
}

export async function recordAdminLoginFailure(event: H3Event, email: string) {
  const keys = requestKeys(event, email)
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const now = Date.now()
    for (const key of [...keys].sort()) await recordKeyFailure(connection, key, now)
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export async function clearAdminLoginFailures(event: H3Event, email: string) {
  const keys = requestKeys(event, email)
  await useDatabase().execute(
    'DELETE FROM admin_login_rate_limits WHERE key_hash IN (?, ?)',
    keys,
  )
}

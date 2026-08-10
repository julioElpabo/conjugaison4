import type { RowDataPacket } from 'mysql2/promise'

interface AccountRow extends RowDataPacket {
  createdAt: Date
  lastLoginAt: Date | null
  lastSeenAt: Date | null
}

interface SummaryRow extends RowDataPacket {
  loginCount: number
  exerciseCount: number
  correctCount: number
  incorrectCount: number
}

interface LoginRow extends RowDataPacket {
  id: number
  eventType: string
  occurredAt: Date
}

interface RunRow extends RowDataPacket {
  id: number
  label: string
  presentation: string
  isReview: number
  startedAt: Date
  occurredAt: Date
  completedAt: Date | null
  correctCount: number
  incorrectCount: number
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const rawId = getRouterParam(event, 'id') || ''
  const id = /^\d+$/u.test(rawId) ? Number(rawId) : 0
  if (!Number.isSafeInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Utilisateur invalide' })
  }

  const database = useDatabase()
  const [[[account]], [[summary]], [loginRows], [runRows]] = await Promise.all([
    database.execute<AccountRow[]>(`
      SELECT a.created_at AS createdAt, a.last_login_at AS lastLoginAt,
             NULLIF(GREATEST(
               COALESCE((SELECT MAX(s.last_seen_at) FROM learner_sessions s WHERE s.account_id=a.id), '1970-01-01'),
               COALESCE((SELECT MAX(COALESCE(r.last_answered_at, r.started_at))
                         FROM learner_challenge_runs r WHERE r.account_id=a.id), '1970-01-01')
             ), '1970-01-01') AS lastSeenAt
      FROM learner_accounts a
      WHERE a.id=? AND a.deleted_at IS NULL
    `, [id]),
    database.execute<SummaryRow[]>(`
      SELECT
        (SELECT COUNT(*) FROM learner_login_events
         WHERE account_id=? AND event_type='login') AS loginCount,
        COUNT(CASE WHEN last_answered_at IS NOT NULL THEN 1 END) AS exerciseCount,
        COALESCE(SUM(correct_count), 0) AS correctCount,
        COALESCE(SUM(incorrect_count), 0) AS incorrectCount
      FROM learner_challenge_runs
      WHERE account_id=?
    `, [id, id]),
    database.execute<LoginRow[]>(`
      SELECT id, event_type AS eventType, occurred_at AS occurredAt
      FROM learner_login_events
      WHERE account_id=?
      ORDER BY occurred_at DESC, id DESC
      LIMIT 150
    `, [id]),
    database.execute<RunRow[]>(`
      SELECT id, challenge_label AS label, presentation, is_review AS isReview,
             started_at AS startedAt, COALESCE(last_answered_at, started_at) AS occurredAt,
             completed_at AS completedAt, correct_count AS correctCount,
             incorrect_count AS incorrectCount
      FROM learner_challenge_runs
      WHERE account_id=?
      ORDER BY occurredAt DESC, id DESC
      LIMIT 150
    `, [id]),
  ])

  if (!account) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })

  const events = [
    ...loginRows.map(row => ({
      id: `connection-${row.id}`,
      type: row.eventType === 'registration'
        ? 'registration' as const
        : row.eventType === 'login'
          ? 'login' as const
          : 'account' as const,
      occurredAt: row.occurredAt,
      eventType: row.eventType,
    })),
    ...runRows.map(row => ({
      id: `exercise-${row.id}`,
      type: 'exercise' as const,
      occurredAt: row.occurredAt,
      startedAt: row.startedAt,
      label: row.label,
      presentation: row.presentation,
      isReview: Boolean(row.isReview),
      completed: Boolean(row.completedAt),
      correctCount: Number(row.correctCount),
      incorrectCount: Number(row.incorrectCount),
    })),
  ]
    .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime())
    .slice(0, 200)

  return {
    summary: {
      createdAt: account.createdAt,
      lastLoginAt: account.lastLoginAt,
      lastSeenAt: account.lastSeenAt,
      loginCount: Number(summary?.loginCount || 0),
      exerciseCount: Number(summary?.exerciseCount || 0),
      correctCount: Number(summary?.correctCount || 0),
      incorrectCount: Number(summary?.incorrectCount || 0),
    },
    events,
  }
})

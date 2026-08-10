import type { RowDataPacket } from 'mysql2/promise'

interface LearnerRow extends RowDataPacket {
  id: number
  username: string
  status: string
  createdAt: Date
  lastLoginAt: Date | null
  lastActivityAt: Date | null
  exerciseCount: number
  correctCount: number
  incorrectCount: number
  recentExerciseCount: number
  activeDaysLast30: number
}

interface CountRow extends RowDataPacket {
  total: number
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const query = getQuery(event)
  const offset = Math.min(1_000_000, Math.max(0, Number(query.offset) || 0))
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50))
  const database = useDatabase()
  const [[users], [[count]]] = await Promise.all([
    database.execute<LearnerRow[]>(`
      SELECT a.id, a.username, a.status, a.created_at AS createdAt,
             a.last_login_at AS lastLoginAt,
             MAX(r.last_answered_at) AS lastActivityAt,
             COUNT(CASE WHEN r.last_answered_at IS NOT NULL THEN 1 END) AS exerciseCount,
             COUNT(CASE WHEN r.last_answered_at >= CURRENT_TIMESTAMP - INTERVAL 30 DAY THEN 1 END) AS recentExerciseCount,
             COUNT(DISTINCT CASE
               WHEN r.last_answered_at >= CURRENT_TIMESTAMP - INTERVAL 30 DAY
               THEN DATE(r.last_answered_at)
             END) AS activeDaysLast30,
             COALESCE(SUM(r.correct_count), 0) AS correctCount,
             COALESCE(SUM(r.incorrect_count), 0) AS incorrectCount
      FROM learner_accounts a
      LEFT JOIN learner_challenge_runs r ON r.account_id=a.id
      WHERE a.deleted_at IS NULL
      GROUP BY a.id, a.username, a.status, a.created_at, a.last_login_at
      ORDER BY exerciseCount DESC, lastActivityAt DESC, a.id ASC
      LIMIT ${limit + 1} OFFSET ${offset}
    `),
    database.execute<CountRow[]>(`
      SELECT COUNT(*) AS total
      FROM learner_accounts
      WHERE deleted_at IS NULL
    `),
  ])
  const page = users.slice(0, limit).map(user => ({
    id: Number(user.id),
    username: user.username,
    status: user.status,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    lastActivityAt: user.lastActivityAt,
    exerciseCount: Number(user.exerciseCount),
    correctCount: Number(user.correctCount),
    incorrectCount: Number(user.incorrectCount),
    recentExerciseCount: Number(user.recentExerciseCount),
    activeDaysLast30: Number(user.activeDaysLast30),
  }))
  return {
    users: page,
    total: Number(count?.total || 0),
    nextOffset: offset + page.length,
    hasMore: users.length > limit,
  }
})

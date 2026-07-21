import type { RowDataPacket } from 'mysql2/promise'

interface FeedbackRow extends RowDataPacket {
  id: number
  feedbackType: 'useful' | 'unclear' | 'error' | 'remark'
  origin: 'user' | 'automatic'
  errorCode: string | null
  severity: 'warning' | 'error' | null
  fingerprint: string | null
  occurrenceCount: number
  firstSeenAt: Date | string | null
  lastSeenAt: Date | string | null
  comment: string | null
  sessionId: string | null
  exerciseRunId: string | null
  questionNumber: number | null
  helpId: number | null
  helpName: string | null
  coachId: number | null
  coachName: string | null
  verbId: number | null
  verb: string | null
  tenseId: number | null
  tense: string | null
  mode: string | null
  person: string | null
  expectedAnswer: string | null
  contextJson: string | null
  questionJson: string | null
  exerciseContextJson: string | null
  attemptsJson: string | null
  messagesJson: string | null
  displayedHelpJson: string | null
  displayedHelpHtml: string | null
  uiContextJson: string | null
  userAgent: string | null
  validationStatus: 'unvalidated' | 'validated'
  validatedAt: Date | string | null
  moderationStatus: 'active' | 'removed'
  moderationNote: string | null
  moderatedAt: Date | string | null
  deletedAt: Date | string | null
  createdAt: Date | string
}

function parseJson(value: string | null) {
  if (!value) return null
  try {
    return JSON.parse(value)
  }
  catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const database = useDatabase()
  const query = getQuery(event)
  const limit = Math.min(500, Math.max(1, Number.parseInt(String(query.limit || '250'), 10) || 250))
  const origin = query.origin === 'automatic' ? 'automatic' : 'user'
  const [rows] = await database.execute<FeedbackRow[]>(`
    SELECT
      id,
      feedback_type AS feedbackType,
      origin,
      error_code AS errorCode,
      severity,
      fingerprint,
      occurrence_count AS occurrenceCount,
      first_seen_at AS firstSeenAt,
      last_seen_at AS lastSeenAt,
      comment,
      session_id AS sessionId,
      exercise_run_id AS exerciseRunId,
      question_number AS questionNumber,
      help_id AS helpId,
      help_name AS helpName,
      coach_id AS coachId,
      coach_name AS coachName,
      verb_id AS verbId,
      verb,
      tense_id AS tenseId,
      tense,
      mode,
      person,
      expected_answer AS expectedAnswer,
      context_json AS contextJson,
      question_json AS questionJson,
      exercise_context_json AS exerciseContextJson,
      attempts_json AS attemptsJson,
      messages_json AS messagesJson,
      displayed_help_json AS displayedHelpJson,
      displayed_help_html AS displayedHelpHtml,
      ui_context_json AS uiContextJson,
      user_agent AS userAgent,
      validation_status AS validationStatus,
      validated_at AS validatedAt,
      moderation_status AS moderationStatus,
      moderation_note AS moderationNote,
      moderated_at AS moderatedAt,
      deleted_at AS deletedAt,
      created_at AS createdAt
    FROM coach_help_feedback
    WHERE origin=?
    ORDER BY created_at ASC, id ASC
    LIMIT ${limit}
  `, [origin])

  return {
    feedbacks: rows.map(row => ({
      id: Number(row.id),
      feedbackType: row.feedbackType,
      origin: row.origin,
      errorCode: row.errorCode,
      severity: row.severity,
      fingerprint: row.fingerprint,
      occurrenceCount: Number(row.occurrenceCount || 1),
      firstSeenAt: row.firstSeenAt,
      lastSeenAt: row.lastSeenAt,
      comment: row.comment,
      sessionId: row.sessionId,
      exerciseRunId: row.exerciseRunId,
      questionNumber: row.questionNumber === null ? null : Number(row.questionNumber),
      helpId: row.helpId === null ? null : Number(row.helpId),
      helpName: row.helpName,
      coachId: row.coachId === null ? null : Number(row.coachId),
      coachName: row.coachName,
      verbId: row.verbId === null ? null : Number(row.verbId),
      verb: row.verb,
      tenseId: row.tenseId === null ? null : Number(row.tenseId),
      tense: row.tense,
      mode: row.mode,
      person: row.person,
      expectedAnswer: row.expectedAnswer,
      context: parseJson(row.contextJson),
      question: parseJson(row.questionJson),
      exerciseContext: parseJson(row.exerciseContextJson),
      attempts: parseJson(row.attemptsJson) || [],
      messages: parseJson(row.messagesJson) || [],
      displayedHelp: parseJson(row.displayedHelpJson),
      displayedHelpHtml: row.displayedHelpHtml,
      uiContext: parseJson(row.uiContextJson),
      userAgent: row.userAgent,
      validationStatus: row.validationStatus,
      validatedAt: row.validatedAt,
      moderationStatus: row.moderationStatus,
      moderationNote: row.moderationNote,
      moderatedAt: row.moderatedAt,
      deletedAt: row.deletedAt,
      createdAt: row.createdAt,
    })),
  }
})

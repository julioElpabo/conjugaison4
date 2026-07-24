type CoachHelpFeedbackType = 'useful' | 'unclear' | 'error' | 'remark'

interface CoachHelpFeedbackBody {
  feedbackType?: unknown
  comment?: unknown
  context?: unknown
  displayedHelp?: unknown
  displayedHelpHtml?: unknown
  uiContext?: unknown
}

const FEEDBACK_TYPES = new Set<CoachHelpFeedbackType>(['useful', 'unclear', 'error', 'remark'])

function shortText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) || null : null
}

function numericId(value: unknown) {
  const numberValue = Number(value)
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null
}

function contextRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function jsonText(value: unknown) {
  try {
    return JSON.stringify(value ?? null)
  }
  catch {
    return JSON.stringify({ serializationError: true })
  }
}

export default defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.feedback)
  const body = await readLimitedJsonBody<CoachHelpFeedbackBody>(event, 256 * 1024)
  const feedbackType = typeof body?.feedbackType === 'string' && FEEDBACK_TYPES.has(body.feedbackType as CoachHelpFeedbackType)
    ? body.feedbackType as CoachHelpFeedbackType
    : null

  if (!feedbackType) {
    throw createError({ statusCode: 400, statusMessage: 'Type de retour inconnu' })
  }

  const context = contextRecord(body?.context)
  const comment = shortText(body?.comment, 2000)
  const userAgent = shortText(getHeader(event, 'user-agent'), 500)
  const displayedHelp = body?.displayedHelp ?? null
  const displayedHelpHtml = shortText(body?.displayedHelpHtml, 120_000)
  const uiContext = contextRecord(body?.uiContext)

  await useDatabase().execute(
    `INSERT INTO coach_help_feedback
      (feedback_type, comment, session_id, exercise_run_id, question_number, help_id, help_name, coach_id, coach_name,
       verb_id, verb, tense_id, tense, mode, person, expected_answer, context_json, question_json, exercise_context_json,
       attempts_json, messages_json, displayed_help_json, displayed_help_html, ui_context_json, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      feedbackType,
      comment,
      shortText(context.sessionId, 120),
      shortText(context.exerciseRunId, 120),
      numericId(context.questionNumber),
      numericId(context.helpId),
      shortText(context.helpName, 120),
      numericId(context.coachId),
      shortText(context.coachName, 120),
      numericId(context.verbId),
      shortText(context.verb, 120),
      numericId(context.tenseId),
      shortText(context.tense, 120),
      shortText(context.mode, 120),
      shortText(context.person, 80),
      shortText(context.expectedAnswer, 300),
      jsonText(context),
      jsonText(context.currentQuestion ?? null),
      jsonText(context.exerciseContext ?? null),
      jsonText(context.attempts ?? []),
      jsonText(context.messages ?? []),
      jsonText(displayedHelp),
      displayedHelpHtml,
      jsonText(uiContext),
      userAgent,
    ],
  )

  return { ok: true }
})
import { assertPublicApiRateLimit, PUBLIC_RATE_LIMITS } from '../services/public-api-rate-limit'
import { readLimitedJsonBody } from '../utils/limited-json-body'

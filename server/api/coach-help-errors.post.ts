import { createHash } from 'node:crypto'
import type { CoachHelpBlock } from '../../shared/types/coach'
import type { ConjugationTense, ExerciseQuestion, Verb } from '../../shared/types/conjugation'
import { auditRenderedCoachHelp, automaticHelpErrorsForRecording } from '../../shared/utils/coach-help-audit'
import { assertPublicApiRateLimit, PUBLIC_RATE_LIMITS } from '../services/public-api-rate-limit'
import { readLimitedJsonBody } from '../utils/limited-json-body'

interface AutomaticHelpErrorBody {
  context?: unknown
  blocks?: unknown
  question?: unknown
  verb?: unknown
  tense?: unknown
  clientAudit?: unknown
  renderedHtml?: unknown
  displayedHelp?: unknown
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function shortText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) || null : null
}

function numericId(value: unknown) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

function jsonText(value: unknown) {
  try {
    return JSON.stringify(value ?? null)
  }
  catch {
    return JSON.stringify({ serializationError: true })
  }
}

function fingerprint(parts: unknown[]) {
  return createHash('sha256').update(JSON.stringify(parts)).digest('hex')
}

export default defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.automaticHelpError)
  const body = await readLimitedJsonBody<AutomaticHelpErrorBody>(event, 768 * 1024)
  const context = record(body?.context)
  const question = record(body?.question) as unknown as ExerciseQuestion
  const verb = record(body?.verb) as unknown as Verb
  const tenseRecord = record(body?.tense)
  const tense = Object.keys(tenseRecord).length ? tenseRecord as unknown as ConjugationTense : undefined
  const blocks = Array.isArray(body?.blocks) ? body.blocks as CoachHelpBlock[] : []
  const renderedHtml = typeof body?.renderedHtml === 'string' ? body.renderedHtml.slice(0, 500_000) : ''

  if (!question?.reponsesPourCorrige || !verb?.infinitif || !blocks.length || !renderedHtml) {
    throw createError({ statusCode: 400, statusMessage: 'Contexte de vérification incomplet' })
  }

  const audit = auditRenderedCoachHelp({ renderedHtml, blocks, question, verb, tense })
  const errors = automaticHelpErrorsForRecording(audit, body?.clientAudit)
  if (!errors.length) return { ok: true, recorded: 0, status: audit.status }

  const expectedAnswer = question.reponsesPourCorrige.join(' ou ')
  const userAgent = shortText(getHeader(event, 'user-agent'), 500)
  const displayedHelp = body?.displayedHelp ?? null
  const database = useDatabase()

  for (const issue of errors) {
    const issueFingerprint = fingerprint([
      issue.code,
      numericId(context.caractereId),
      shortText(context.helpApproach, 40),
      numericId(question.verbeId || context.verbId),
      numericId(question.tenseId || context.tenseId),
      numericId(question.personId),
      question.mode,
      question.temps,
      question.pronom || question.saisiePrefixe,
      expectedAnswer,
      question.agreementReminder?.kind,
      question.agreementReminder?.gender,
      question.agreementReminder?.number,
    ])
    const enrichedContext = {
      ...context,
      automaticAudit: {
        serverStatus: audit.status,
        clientAudit: body?.clientAudit ?? null,
        issue,
        serverIssues: audit.issues,
        checkedAt: new Date().toISOString(),
      },
    }

    await database.execute(
      `INSERT INTO coach_help_feedback
        (feedback_type, origin, error_code, severity, fingerprint, occurrence_count, first_seen_at, last_seen_at,
         comment, session_id, exercise_run_id, question_number, help_id, help_name, coach_id, coach_name,
         verb_id, verb, tense_id, tense, mode, person, expected_answer, context_json, question_json,
         exercise_context_json, attempts_json, messages_json, displayed_help_json, displayed_help_html,
         ui_context_json, user_agent)
       VALUES ('error', 'automatic', ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
         ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         occurrence_count=occurrence_count + 1,
         last_seen_at=CURRENT_TIMESTAMP,
         validation_status='unvalidated',
         validated_at=NULL,
         comment=VALUES(comment),
         context_json=VALUES(context_json),
         question_json=VALUES(question_json),
         exercise_context_json=VALUES(exercise_context_json),
         attempts_json=VALUES(attempts_json),
         messages_json=VALUES(messages_json),
         displayed_help_json=VALUES(displayed_help_json),
         displayed_help_html=VALUES(displayed_help_html),
         user_agent=VALUES(user_agent)`,
      [
        issue.code,
        issue.severity,
        issueFingerprint,
        `${issue.title} — ${issue.detail}`,
        shortText(context.sessionId, 120),
        shortText(context.exerciseRunId, 120),
        numericId(context.questionNumber),
        numericId(context.helpId),
        shortText(context.helpName, 120),
        numericId(context.coachId),
        shortText(context.coachName, 120),
        numericId(question.verbeId || context.verbId),
        shortText(question.infinitif || context.verb, 120),
        numericId(question.tenseId || context.tenseId),
        shortText(question.temps || context.tense, 120),
        shortText(question.mode || context.mode, 120),
        shortText(question.pronom || question.saisiePrefixe || context.person, 80),
        shortText(expectedAnswer, 300),
        jsonText(enrichedContext),
        jsonText(question),
        jsonText(context.exerciseContext ?? null),
        jsonText(context.attempts ?? []),
        jsonText(context.messages ?? []),
        jsonText(displayedHelp),
        renderedHtml,
        jsonText(context.uiContext ?? null),
        userAgent,
      ],
    )
  }

  return { ok: true, recorded: errors.length, status: audit.status }
})

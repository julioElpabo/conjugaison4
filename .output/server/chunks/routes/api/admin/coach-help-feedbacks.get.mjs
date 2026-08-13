import { d as defineEventHandler, u as useDatabase, a as getQuery } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:url';
import 'node:fs/promises';

function parseJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
const coachHelpFeedbacks_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const database = useDatabase();
  const query = getQuery(event);
  const limit = Math.min(500, Math.max(1, Number.parseInt(String(query.limit || "250"), 10) || 250));
  const origin = query.origin === "automatic" ? "automatic" : "user";
  const sortDirection = query.sort === "desc" ? "DESC" : "ASC";
  const [rows] = await database.execute(`
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
    ORDER BY created_at ${sortDirection}, id ${sortDirection}
    LIMIT ${limit}
  `, [origin]);
  return {
    feedbacks: rows.map((row) => ({
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
      createdAt: row.createdAt
    }))
  };
});

export { coachHelpFeedbacks_get as default };
//# sourceMappingURL=coach-help-feedbacks.get.mjs.map

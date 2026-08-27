import { d as defineEventHandler, c as createError, E as getHeader, u as useDatabase } from '../../nitro/nitro.mjs';
import { createHash } from 'node:crypto';
import { a as assertPublicApiRateLimit, P as PUBLIC_RATE_LIMITS } from '../../_/public-api-rate-limit.mjs';
import { r as readLimitedJsonBody } from '../../_/limited-json-body.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'web-push';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

const FEEDBACK_TYPES = /* @__PURE__ */ new Set(["useful", "unclear", "error", "remark"]);
function shortText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) || null : null;
}
function numericId(value) {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
}
function contextRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function jsonText(value) {
  try {
    return JSON.stringify(value != null ? value : null);
  } catch {
    return JSON.stringify({ serializationError: true });
  }
}
const coachHelpFeedback_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e;
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.feedback);
  const body = await readLimitedJsonBody(event, 256 * 1024);
  const feedbackType = typeof (body == null ? void 0 : body.feedbackType) === "string" && FEEDBACK_TYPES.has(body.feedbackType) ? body.feedbackType : null;
  if (!feedbackType) {
    throw createError({ statusCode: 400, statusMessage: "Type de retour inconnu" });
  }
  const context = contextRecord(body == null ? void 0 : body.context);
  const comment = shortText(body == null ? void 0 : body.comment, 2e3);
  const userAgent = shortText(getHeader(event, "user-agent"), 500);
  const displayedHelp = (_a = body == null ? void 0 : body.displayedHelp) != null ? _a : null;
  const displayedHelpHtml = shortText(body == null ? void 0 : body.displayedHelpHtml, 12e4);
  const uiContext = contextRecord(body == null ? void 0 : body.uiContext);
  const sessionId = shortText(context.sessionId, 120);
  const exerciseRunId = shortText(context.exerciseRunId, 120);
  const questionNumber = numericId(context.questionNumber);
  const helpId = numericId(context.helpId);
  const fingerprint = sessionId && exerciseRunId && questionNumber ? createHash("sha256").update(["user", sessionId, exerciseRunId, questionNumber, helpId || "automatic"].join("|")).digest("hex") : null;
  await useDatabase().execute(
    `INSERT INTO coach_help_feedback
      (feedback_type, fingerprint, comment, session_id, exercise_run_id, question_number, help_id, help_name, coach_id, coach_name,
       verb_id, verb, tense_id, tense, mode, person, expected_answer, context_json, question_json, exercise_context_json,
       attempts_json, messages_json, displayed_help_json, displayed_help_html, ui_context_json, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       feedback_type=VALUES(feedback_type), comment=VALUES(comment), help_id=VALUES(help_id), help_name=VALUES(help_name),
       coach_id=VALUES(coach_id), coach_name=VALUES(coach_name), verb_id=VALUES(verb_id), verb=VALUES(verb),
       tense_id=VALUES(tense_id), tense=VALUES(tense), mode=VALUES(mode), person=VALUES(person),
       expected_answer=VALUES(expected_answer), context_json=VALUES(context_json), question_json=VALUES(question_json),
       exercise_context_json=VALUES(exercise_context_json), attempts_json=VALUES(attempts_json), messages_json=VALUES(messages_json),
       displayed_help_json=VALUES(displayed_help_json), displayed_help_html=VALUES(displayed_help_html),
       ui_context_json=VALUES(ui_context_json), user_agent=VALUES(user_agent), validation_status='unvalidated',
       validated_at=NULL, moderation_status='active', moderation_note=NULL, moderated_at=NULL, deleted_at=NULL,
       created_at=CURRENT_TIMESTAMP`,
    [
      feedbackType,
      fingerprint,
      comment,
      sessionId,
      exerciseRunId,
      questionNumber,
      helpId,
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
      jsonText((_b = context.currentQuestion) != null ? _b : null),
      jsonText((_c = context.exerciseContext) != null ? _c : null),
      jsonText((_d = context.attempts) != null ? _d : []),
      jsonText((_e = context.messages) != null ? _e : []),
      jsonText(displayedHelp),
      displayedHelpHtml,
      jsonText(uiContext),
      userAgent
    ]
  );
  return { ok: true };
});

export { coachHelpFeedback_post as default };
//# sourceMappingURL=coach-help-feedback.post.mjs.map

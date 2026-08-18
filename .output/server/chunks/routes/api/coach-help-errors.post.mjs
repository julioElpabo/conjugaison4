import { d as defineEventHandler, c as createError, E as getHeader, u as useDatabase } from '../../nitro/nitro.mjs';
import { createHash } from 'node:crypto';
import { a as auditRenderedCoachHelp, b as automaticHelpErrorsForRecording } from '../../_/coach-help-audit.mjs';
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
import '../../_/near-future.mjs';
import '../../_/coach.mjs';

function record(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function shortText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) || null : null;
}
function numericId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
function jsonText(value) {
  try {
    return JSON.stringify(value != null ? value : null);
  } catch {
    return JSON.stringify({ serializationError: true });
  }
}
function fingerprint(parts) {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}
const coachHelpErrors_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.automaticHelpError);
  const body = await readLimitedJsonBody(event, 768 * 1024);
  const context = record(body == null ? void 0 : body.context);
  const question = record(body == null ? void 0 : body.question);
  const verb = record(body == null ? void 0 : body.verb);
  const tenseRecord = record(body == null ? void 0 : body.tense);
  const tense = Object.keys(tenseRecord).length ? tenseRecord : void 0;
  const blocks = Array.isArray(body == null ? void 0 : body.blocks) ? body.blocks : [];
  const renderedHtml = typeof (body == null ? void 0 : body.renderedHtml) === "string" ? body.renderedHtml.slice(0, 5e5) : "";
  if (!(question == null ? void 0 : question.reponsesPourCorrige) || !(verb == null ? void 0 : verb.infinitif) || !blocks.length || !renderedHtml) {
    throw createError({ statusCode: 400, statusMessage: "Contexte de v\xE9rification incomplet" });
  }
  const audit = auditRenderedCoachHelp({ renderedHtml, blocks, question, verb, tense });
  const errors = automaticHelpErrorsForRecording(audit, body == null ? void 0 : body.clientAudit);
  if (!errors.length) return { ok: true, recorded: 0, status: audit.status };
  const expectedAnswer = question.reponsesPourCorrige.join(" ou ");
  const userAgent = shortText(getHeader(event, "user-agent"), 500);
  const displayedHelp = (_a = body == null ? void 0 : body.displayedHelp) != null ? _a : null;
  const database = useDatabase();
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
      (_b = question.agreementReminder) == null ? void 0 : _b.kind,
      (_c = question.agreementReminder) == null ? void 0 : _c.gender,
      (_d = question.agreementReminder) == null ? void 0 : _d.number
    ]);
    const enrichedContext = {
      ...context,
      automaticAudit: {
        serverStatus: audit.status,
        clientAudit: (_e = body == null ? void 0 : body.clientAudit) != null ? _e : null,
        issue,
        serverIssues: audit.issues,
        checkedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
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
        `${issue.title} \u2014 ${issue.detail}`,
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
        jsonText((_f = context.exerciseContext) != null ? _f : null),
        jsonText((_g = context.attempts) != null ? _g : []),
        jsonText((_h = context.messages) != null ? _h : []),
        jsonText(displayedHelp),
        renderedHtml,
        jsonText((_i = context.uiContext) != null ? _i : null),
        userAgent
      ]
    );
  }
  return { ok: true, recorded: errors.length, status: audit.status };
});

export { coachHelpErrors_post as default };
//# sourceMappingURL=coach-help-errors.post.mjs.map

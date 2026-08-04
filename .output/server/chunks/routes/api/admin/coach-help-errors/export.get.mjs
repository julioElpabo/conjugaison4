import { d as defineEventHandler, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
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

function prettyJson(value) {
  if (!value) return "null";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
const export_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const [rows] = await useDatabase().execute(`
    SELECT id, error_code AS errorCode, severity, comment,
      occurrence_count AS occurrenceCount, first_seen_at AS firstSeenAt, last_seen_at AS lastSeenAt,
      verb, tense, mode, person, expected_answer AS expectedAnswer,
      question_json AS questionJson, context_json AS contextJson,
      displayed_help_html AS displayedHelpHtml
    FROM coach_help_feedback
    WHERE origin='automatic' AND validation_status='unvalidated' AND moderation_status='active'
    ORDER BY created_at ASC, id ASC
  `);
  const introduction = [
    "Analyse et corrige les erreurs automatiques suivantes dans les aides de conjugaison.",
    "Travaille sur la cause g\xE9n\xE9rale lorsque plusieurs formes partagent la m\xEAme logique.",
    "Apr\xE8s correction, ajoute ou adapte les tests d\xE9terministes correspondants."
  ].join("\n");
  const entries = rows.map((row) => [
    `## Erreur automatique #${row.id} \u2014 ${row.errorCode || "code inconnu"}`,
    `S\xE9v\xE9rit\xE9 : ${row.severity || "error"} \xB7 occurrences : ${Number(row.occurrenceCount || 1)}`,
    `Contexte : ${[row.person, row.verb, row.tense, row.mode].filter(Boolean).join(" | ") || "non renseign\xE9"}`,
    `R\xE9ponse officielle : ${row.expectedAnswer || "non renseign\xE9e"}`,
    `Diagnostic : ${row.comment || "non renseign\xE9"}`,
    `Premi\xE8re d\xE9tection : ${row.firstSeenAt || "\u2014"} \xB7 derni\xE8re d\xE9tection : ${row.lastSeenAt || "\u2014"}`,
    "Question :",
    "```json",
    prettyJson(row.questionJson),
    "```",
    "Contexte enregistr\xE9 :",
    "```json",
    prettyJson(row.contextJson),
    "```",
    "Aide affich\xE9e :",
    "```html",
    row.displayedHelpHtml || "",
    "```"
  ].join("\n"));
  return {
    count: rows.length,
    prompt: rows.length ? `${introduction}

${entries.join("\n\n")}` : ""
  };
});

export { export_get as default };
//# sourceMappingURL=export.get.mjs.map

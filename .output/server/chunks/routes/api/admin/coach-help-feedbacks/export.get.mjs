import { d as defineEventHandler, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'web-push';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

function prettyJson(value) {
  if (!value) return "null";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
const feedbackLabels = {
  useful: "Utile",
  unclear: "Pas clair",
  error: "Erreur",
  remark: "Remarque"
};
const export_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const [rows] = await useDatabase().execute(`
    SELECT id, feedback_type AS feedbackType, comment,
      session_id AS sessionId, exercise_run_id AS exerciseRunId, question_number AS questionNumber,
      help_name AS helpName, coach_name AS coachName,
      verb, tense, mode, person, expected_answer AS expectedAnswer,
      context_json AS contextJson, question_json AS questionJson,
      exercise_context_json AS exerciseContextJson, attempts_json AS attemptsJson,
      messages_json AS messagesJson, displayed_help_json AS displayedHelpJson,
      displayed_help_html AS displayedHelpHtml, ui_context_json AS uiContextJson,
      created_at AS createdAt
    FROM coach_help_feedback
    WHERE origin='user'
    ORDER BY created_at ASC, id ASC
  `);
  const introduction = [
    "Analyse tous les feedbacks utilisateurs ci-dessous et apporte les am\xE9liorations utiles au projet.",
    "Ne traite pas chaque exemple comme un cas isol\xE9 : cherche la cause g\xE9n\xE9rale et corrige toutes les situations \xE9quivalentes.",
    "Un retour \xAB Utile \xBB confirme un comportement \xE0 pr\xE9server. Pour les autres retours, confronte la remarque \xE0 la question, \xE0 la r\xE9ponse officielle et \xE0 l\u2019aide r\xE9ellement affich\xE9e.",
    "Ajoute ou adapte les tests qui prot\xE8gent les comportements corrig\xE9s."
  ].join("\n");
  const entries = rows.map((row) => {
    var _a;
    return [
      `## Feedback #${row.id} \u2014 ${feedbackLabels[row.feedbackType]}`,
      `Contexte : ${[row.person, row.verb, row.tense, row.mode].filter(Boolean).join(" | ") || "non renseign\xE9"}`,
      `Coach : ${row.coachName || "non renseign\xE9"} \xB7 aide : ${row.helpName || "non renseign\xE9e"} \xB7 question : ${(_a = row.questionNumber) != null ? _a : "\u2014"}`,
      `R\xE9ponse officielle : ${row.expectedAnswer || "non renseign\xE9e"}`,
      `Commentaire utilisateur : ${row.comment || "aucun commentaire"}`,
      `Session : ${row.sessionId || "\u2014"} \xB7 exercice : ${row.exerciseRunId || "\u2014"}`,
      `Re\xE7u : ${row.createdAt}`,
      "Question compl\xE8te :",
      "```json",
      prettyJson(row.questionJson),
      "```",
      "Contexte de l\u2019exercice :",
      "```json",
      prettyJson(row.exerciseContextJson),
      "```",
      "Tentatives et r\xE9ponse utilisateur :",
      "```json",
      prettyJson(row.attemptsJson),
      "```",
      "Messages du chat :",
      "```json",
      prettyJson(row.messagesJson),
      "```",
      "Contexte complet enregistr\xE9 :",
      "```json",
      prettyJson(row.contextJson),
      "```",
      "Structure de l\u2019aide affich\xE9e :",
      "```json",
      prettyJson(row.displayedHelpJson),
      "```",
      "HTML de l\u2019aide affich\xE9e :",
      "```html",
      row.displayedHelpHtml || "",
      "```",
      "Contexte visuel :",
      "```json",
      prettyJson(row.uiContextJson),
      "```"
    ].join("\n");
  });
  return {
    count: rows.length,
    prompt: rows.length ? `${introduction}

${entries.join("\n\n")}` : ""
  };
});

export { export_get as default };
//# sourceMappingURL=export.get.mjs.map

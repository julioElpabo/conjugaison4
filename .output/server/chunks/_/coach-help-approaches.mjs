import { c as createError } from '../nitro/nitro.mjs';
import { a as COACH_HELP_ENGINE_KEYS } from './coach.mjs';

async function listCoachHelpApproaches(database) {
  const [rows] = await database.execute(`SELECT a.id,a.name,a.engine_key AS engineKey,a.status,
    a.sort_order AS sortOrder,COUNT(c.id) AS characterCount
    FROM coach_help_approaches a
    LEFT JOIN coach_characters c ON c.help_approach_id=a.id
    GROUP BY a.id,a.name,a.engine_key,a.sort_order
    ORDER BY a.sort_order,a.name,a.id`);
  return rows.map((row) => ({ ...row, characterCount: Number(row.characterCount) }));
}
function text(value, maximum) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}
function parseCoachHelpApproachPayload(value) {
  const body = value && typeof value === "object" ? value : {};
  const name = text(body.name, 80);
  const engineKey = text(body.engineKey, 40);
  const status = text(body.status, 20);
  const sortOrder = Number(body.sortOrder);
  if (!name || !COACH_HELP_ENGINE_KEYS.includes(engineKey) || !["draft", "published", "disabled"].includes(status) || !Number.isInteger(sortOrder)) {
    throw createError({ statusCode: 400, statusMessage: "Approche d\u2019aide invalide" });
  }
  return { name, engineKey, status, sortOrder };
}
function coachHelpApproachSlug(name) {
  return name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "").slice(0, 80) || "approche";
}

export { coachHelpApproachSlug as c, listCoachHelpApproaches as l, parseCoachHelpApproachPayload as p };
//# sourceMappingURL=coach-help-approaches.mjs.map

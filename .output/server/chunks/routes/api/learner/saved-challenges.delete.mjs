import { $ as PublicInputError, d as defineEventHandler, s as setResponseHeader, c as createError, u as useDatabase } from '../../../nitro/nitro.mjs';
import { g as getLearnerSession } from '../../../_/learner-session.mjs';
import { r as readLimitedJsonBody } from '../../../_/limited-json-body.mjs';
import { n as normalizeDefiCode } from '../../../_/defis.mjs';
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

function parseSavedChallengeRemoval(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new PublicInputError("S\xE9lection invalide");
  const body = value;
  if (Object.keys(body).some((key) => key !== "codes") || !Array.isArray(body.codes) || !body.codes.length) {
    throw new PublicInputError("S\xE9lection invalide");
  }
  return [...new Set(body.codes.map((code) => {
    if (typeof code !== "string") throw new PublicInputError("Code de d\xE9fi invalide");
    return normalizeDefiCode(code);
  }))];
}
async function removeSavedChallenges(database, accountId, codes) {
  if (!codes.length) return 0;
  const [result] = await database.execute(`
    DELETE saved FROM learner_saved_challenges saved
    INNER JOIN defis d ON d.id = saved.defi_id
    WHERE saved.account_id = ? AND d.name IN (${codes.map(() => "?").join(", ")})
  `, [accountId, ...codes]);
  return result.affectedRows;
}

const savedChallenges_delete = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await getLearnerSession(event);
  if (!learner) throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  try {
    const codes = parseSavedChallengeRemoval(await readLimitedJsonBody(event, 262144));
    const removedCount = await removeSavedChallenges(useDatabase(), learner.id, codes);
    return { codes, removedCount };
  } catch (error) {
    if (error instanceof PublicInputError) throw createError({ statusCode: 400, statusMessage: error.message });
    throw error;
  }
});

export { savedChallenges_delete as default };
//# sourceMappingURL=saved-challenges.delete.mjs.map

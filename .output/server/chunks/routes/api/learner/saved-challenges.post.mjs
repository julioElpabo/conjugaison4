import { d as defineEventHandler, u as useDatabase, Y as PublicInputError, c as createError } from '../../../nitro/nitro.mjs';
import { n as normalizeDefiCode, g as getDefi, D as DefiNotFoundError, a as DefiStorageError } from '../../../_/defis.mjs';
import { r as readLimitedJsonBody } from '../../../_/limited-json-body.mjs';
import { r as requireLearnerDataSubject } from '../../../_/learner-data-subject.mjs';
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
import '../../../_/session.mjs';
import '../../../_/learner-session.mjs';

const savedChallenges_post = defineEventHandler(async (event) => {
  const learner = await requireLearnerDataSubject(event);
  try {
    const body = await readLimitedJsonBody(event, 1024);
    const code = normalizeDefiCode(typeof (body == null ? void 0 : body.code) === "string" ? body.code : void 0);
    await getDefi(code);
    const [[defi]] = await useDatabase().execute(
      "SELECT id FROM defis WHERE name=? ORDER BY id DESC LIMIT 1",
      [code]
    );
    if (!defi) throw new DefiNotFoundError("D\xE9fi introuvable");
    const [result] = await useDatabase().execute(`
      INSERT IGNORE INTO learner_saved_challenges (account_id, defi_id)
      VALUES (?, ?)
    `, [learner.id, defi.id]);
    return { code, added: Number(result.affectedRows || 0) > 0 };
  } catch (error) {
    if (error instanceof PublicInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message });
    }
    if (error instanceof DefiNotFoundError) {
      throw createError({ statusCode: 404, statusMessage: "D\xE9fi introuvable" });
    }
    if (error instanceof DefiStorageError) {
      throw createError({ statusCode: 422, statusMessage: "Ce d\xE9fi est illisible" });
    }
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    console.error("[learner] Impossible d\u2019enregistrer le d\xE9fi dans le compte.", error);
    throw createError({ statusCode: 500, statusMessage: "Impossible d\u2019enregistrer ce d\xE9fi" });
  }
});

export { savedChallenges_post as default };
//# sourceMappingURL=saved-challenges.post.mjs.map

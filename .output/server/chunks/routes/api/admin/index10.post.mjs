import { d as defineEventHandler, r as readBody, c as createError, u as useDatabase, I as refreshVerbMetadata } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
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

const index_post = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const body = await readBody(event);
  const infinitif = typeof (body == null ? void 0 : body.infinitif) === "string" ? body.infinitif.trim().slice(0, 255) : "";
  const participePresent = typeof (body == null ? void 0 : body.participePresent) === "string" ? body.participePresent.trim().slice(0, 255) : "";
  const participePasse = typeof (body == null ? void 0 : body.participePasse) === "string" ? body.participePasse.trim().slice(0, 255) : "";
  const auxiliaire = typeof (body == null ? void 0 : body.auxiliaire) === "string" ? body.auxiliaire.trim().slice(0, 255) : "";
  if (!infinitif || !auxiliaire) {
    throw createError({ statusCode: 400, statusMessage: "Infinitif et auxiliaire requis" });
  }
  try {
    const database = useDatabase();
    const [result] = await database.execute(`
      INSERT INTO verbes (infinitif, \`participe_pr\xE9sent\`, \`participe_pass\xE9\`, auxiliaire)
      VALUES (?, ?, ?, ?)
    `, [infinitif, participePresent, participePasse, auxiliaire]);
    await refreshVerbMetadata(database, result.insertId);
    return { ok: true, id: result.insertId };
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "ER_DUP_ENTRY") {
      throw createError({ statusCode: 409, statusMessage: "Ce verbe existe d\xE9j\xE0" });
    }
    throw error;
  }
});

export { index_post as default };
//# sourceMappingURL=index10.post.mjs.map

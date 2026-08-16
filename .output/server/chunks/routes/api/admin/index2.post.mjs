import { d as defineEventHandler, p as parseChallengePresetCategoryPayload, r as readBody, u as useDatabase, c as createError } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

const index_post = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const payload = parseChallengePresetCategoryPayload(await readBody(event));
  try {
    const [result] = await useDatabase().execute(`INSERT INTO challenge_preset_categories
      (slug,name,description,sort_order,is_active) VALUES (?,?,?,?,?)`, [
      payload.slug,
      payload.name,
      payload.description,
      payload.sortOrder,
      payload.isActive ? 1 : 0
    ]);
    return { ok: true, id: result.insertId };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ER_DUP_ENTRY") {
      throw createError({ statusCode: 409, statusMessage: "Cette cat\xE9gorie existe d\xE9j\xE0" });
    }
    throw error;
  }
});

export { index_post as default };
//# sourceMappingURL=index2.post.mjs.map

import { d as defineEventHandler, s as setResponseHeader, g as getRouterParam, c as createError, u as useDatabase } from '../../../../nitro/nitro.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  requireAdministrator(event);
  setResponseHeader(event, "Cache-Control", "no-store");
  const rawId = getRouterParam(event, "id") || "";
  const id = /^\d+$/u.test(rawId) ? Number(rawId) : 0;
  if (!Number.isSafeInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: "Utilisateur invalide" });
  }
  const [result] = await useDatabase().execute(
    "DELETE FROM learner_accounts WHERE id=? AND deleted_at IS NULL",
    [id]
  );
  if (result.affectedRows !== 1) {
    throw createError({ statusCode: 404, statusMessage: "Utilisateur introuvable" });
  }
  return { ok: true };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

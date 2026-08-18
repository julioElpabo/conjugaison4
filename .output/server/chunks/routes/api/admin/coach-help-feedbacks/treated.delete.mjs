import { d as defineEventHandler, r as readBody, c as createError, u as useDatabase } from '../../../../nitro/nitro.mjs';
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

const treated_delete = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const body = await readBody(event);
  const origin = (body == null ? void 0 : body.origin) === "user" ? "user" : (body == null ? void 0 : body.origin) === "automatic" ? "automatic" : null;
  if (!origin) {
    throw createError({ statusCode: 400, statusMessage: "Origine inconnue" });
  }
  const includeRemoved = origin === "user" && (body == null ? void 0 : body.includeRemoved) === true;
  const [result] = await useDatabase().execute(
    `DELETE FROM coach_help_feedback
     WHERE origin=?
       AND (validation_status='validated' OR (?=1 AND moderation_status='removed'))`,
    [origin, includeRemoved ? 1 : 0]
  );
  return { ok: true, count: Number(result.affectedRows || 0) };
});

export { treated_delete as default };
//# sourceMappingURL=treated.delete.mjs.map

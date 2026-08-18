import { d as defineEventHandler, c as createError } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import { a as sendAdminPushTest } from '../../../../_/admin-push-notifications.mjs';
import { r as readLimitedJsonBody } from '../../../../_/limited-json-body.mjs';
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

const test_post = defineEventHandler(async (event) => {
  const administrator = requireAdministrator(event);
  const body = await readLimitedJsonBody(event, 8 * 1024);
  const endpoint = typeof (body == null ? void 0 : body.endpoint) === "string" ? body.endpoint.trim() : "";
  if (!endpoint) throw createError({ statusCode: 400, statusMessage: "Abonnement manquant" });
  await sendAdminPushTest(administrator.id, endpoint);
  return { ok: true };
});

export { test_post as default };
//# sourceMappingURL=test.post.mjs.map

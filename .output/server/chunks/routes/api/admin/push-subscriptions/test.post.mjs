import { d as defineEventHandler, c as createError } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import { randomUUID } from 'node:crypto';
import { a as sendAdminPushTest } from '../../../../_/admin-push-notifications.mjs';
import { r as readLimitedJsonBody } from '../../../../_/limited-json-body.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'web-push';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';
import '../../../../_/google-analytics.mjs';

const test_post = defineEventHandler(async (event) => {
  const administrator = requireAdministrator(event);
  const body = await readLimitedJsonBody(event, 8 * 1024);
  const endpoint = typeof (body == null ? void 0 : body.endpoint) === "string" ? body.endpoint.trim() : "";
  const suppliedTestId = typeof (body == null ? void 0 : body.testId) === "string" ? body.testId.trim() : "";
  if (!endpoint) throw createError({ statusCode: 400, statusMessage: "Abonnement manquant" });
  if (suppliedTestId && !/^[a-zA-Z0-9-]{8,80}$/u.test(suppliedTestId)) {
    throw createError({ statusCode: 400, statusMessage: "Identifiant de test invalide" });
  }
  const testId = suppliedTestId || randomUUID();
  const receipt = await sendAdminPushTest(administrator.id, endpoint, testId);
  return { ok: true, accepted: true, pushServiceStatus: receipt.statusCode, testId };
});

export { test_post as default };
//# sourceMappingURL=test.post.mjs.map

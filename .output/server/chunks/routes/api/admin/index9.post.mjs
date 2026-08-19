import { d as defineEventHandler, c as createError } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import { i as initializeAdminPushBaseline, s as saveAdminPushSubscription } from '../../../_/admin-push-notifications.mjs';
import { r as readLimitedJsonBody } from '../../../_/limited-json-body.mjs';
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
import '../../../_/google-analytics.mjs';
import '../../../_/daily-sessions.mjs';

const index_post = defineEventHandler(async (event) => {
  var _a, _b;
  const administrator = requireAdministrator(event);
  const body = await readLimitedJsonBody(event, 16 * 1024);
  const endpoint = typeof (body == null ? void 0 : body.endpoint) === "string" ? body.endpoint.trim() : "";
  const p256dh = typeof ((_a = body == null ? void 0 : body.keys) == null ? void 0 : _a.p256dh) === "string" ? body.keys.p256dh.trim() : "";
  const auth = typeof ((_b = body == null ? void 0 : body.keys) == null ? void 0 : _b.auth) === "string" ? body.keys.auth.trim() : "";
  if (!endpoint.startsWith("https://") || endpoint.length > 4096 || !p256dh || !auth) {
    throw createError({ statusCode: 400, statusMessage: "Abonnement Web Push invalide" });
  }
  await initializeAdminPushBaseline();
  const preferences = await saveAdminPushSubscription(administrator.id, { endpoint, keys: { p256dh, auth } });
  return { ok: true, preferences };
});

export { index_post as default };
//# sourceMappingURL=index9.post.mjs.map

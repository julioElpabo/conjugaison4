import { d as defineEventHandler, c as createError } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import { A as ADMIN_PUSH_PREFERENCE_KEYS, u as updateAdminPushPreferences } from '../../../../_/admin-push-notifications.mjs';
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
import '../../../../_/google-analytics.mjs';
import '../../../../_/daily-sessions.mjs';

const preferences_put = defineEventHandler(async (event) => {
  const administrator = requireAdministrator(event);
  const body = await readLimitedJsonBody(event, 8 * 1024);
  const endpoint = typeof (body == null ? void 0 : body.endpoint) === "string" ? body.endpoint.trim() : "";
  if (!endpoint || !(body == null ? void 0 : body.preferences) || typeof body.preferences !== "object") {
    throw createError({ statusCode: 400, statusMessage: "Pr\xE9f\xE9rences de notifications invalides" });
  }
  const preferences = Object.fromEntries(ADMIN_PUSH_PREFERENCE_KEYS.map((key) => {
    var _a;
    return [key, (_a = body.preferences) == null ? void 0 : _a[key]];
  }));
  if (Object.values(preferences).some((value) => typeof value !== "boolean")) {
    throw createError({ statusCode: 400, statusMessage: "Chaque pr\xE9f\xE9rence doit \xEAtre activ\xE9e ou d\xE9sactiv\xE9e" });
  }
  return {
    ok: true,
    preferences: await updateAdminPushPreferences(
      administrator.id,
      endpoint,
      preferences
    )
  };
});

export { preferences_put as default };
//# sourceMappingURL=preferences.put.mjs.map

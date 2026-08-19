import { d as defineEventHandler } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import { g as getAdminPushPublicKey } from '../../../_/admin-push-notifications.mjs';
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

const index_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  return { publicKey: await getAdminPushPublicKey() };
});

export { index_get as default };
//# sourceMappingURL=index11.get.mjs.map

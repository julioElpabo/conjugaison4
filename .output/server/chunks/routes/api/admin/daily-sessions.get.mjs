import { d as defineEventHandler, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import { d as dailySessionSnapshot } from '../../../_/daily-sessions.mjs';
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

const dailySessions_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  return dailySessionSnapshot(useDatabase());
});

export { dailySessions_get as default };
//# sourceMappingURL=daily-sessions.get.mjs.map

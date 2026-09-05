import { d as defineEventHandler, K as getExerciseSummaryAdminStats } from '../../../nitro/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  return await getExerciseSummaryAdminStats();
});

export { index_get as default };
//# sourceMappingURL=index9.get.mjs.map

import { d as defineEventHandler, F as deleteExpiredExerciseSummaries } from '../../../nitro/nitro.mjs';
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

const index_delete = defineEventHandler(async (event) => {
  requireAdministrator(event);
  return {
    ok: true,
    count: await deleteExpiredExerciseSummaries()
  };
});

export { index_delete as default };
//# sourceMappingURL=index.delete.mjs.map

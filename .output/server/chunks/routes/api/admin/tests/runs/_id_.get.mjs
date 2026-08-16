import { d as defineEventHandler, g as getRouterParam, c as createError } from '../../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../../_/session.mjs';
import { g as getAdminTestJob } from '../../../../../_/admin-test-jobs.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';
import 'node:os';
import '../../../../../_/admin-tests.mjs';
import 'node:child_process';
import '../../../../../_/coaches.mjs';
import '../../../../../_/coach.mjs';
import '../../../../../_/coach-dialogue.mjs';

const _id__get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const job = await getAdminTestJob(getRouterParam(event, "id") || "");
  if (!job) throw createError({ statusCode: 404, statusMessage: "Ex\xE9cution de tests introuvable" });
  return job;
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map

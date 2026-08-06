import { d as defineEventHandler, r as readBody, y as setResponseStatus } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import { s as startAdminTestJob } from '../../../../_/admin-test-jobs.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:url';
import 'node:fs/promises';
import 'node:os';
import '../../../../_/admin-tests.mjs';
import 'node:child_process';
import '../../../../_/coaches.mjs';
import '../../../../_/coach.mjs';
import '../../../../_/coach-dialogue.mjs';

const run_post = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const body = await readBody(event);
  const files = Array.isArray(body == null ? void 0 : body.files) ? body.files.filter((file) => typeof file === "string") : [];
  const job = await startAdminTestJob(files);
  setResponseStatus(event, 202);
  return { jobId: job.id };
});

export { run_post as default };
//# sourceMappingURL=run.post.mjs.map

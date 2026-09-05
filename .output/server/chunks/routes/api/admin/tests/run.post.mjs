import { d as defineEventHandler, r as readBody, L as getRequestURL, y as useRuntimeConfig, M as setResponseStatus } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import { s as startAdminTestJob } from '../../../../_/admin-test-jobs.mjs';
import { r as runAdminTests } from '../../../../_/admin-tests.mjs';
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
import 'node:os';
import 'node:child_process';
import '../../../../_/coaches.mjs';
import '../../../../_/coach.mjs';
import '../../../../_/coach-dialogue.mjs';

const run_post = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const body = await readBody(event);
  const files = Array.isArray(body == null ? void 0 : body.files) ? body.files.filter((file) => typeof file === "string") : [];
  getRequestURL(event).origin;
  const configuredOrigin = String(useRuntimeConfig(event).public.siteUrl || "").replace(/\/$/u, "");
  const baseUrl = configuredOrigin;
  const job = await startAdminTestJob(files, {
    run: (selectedFiles) => runAdminTests(selectedFiles, { baseUrl })
  });
  setResponseStatus(event, 202);
  return { jobId: job.id };
});

export { run_post as default };
//# sourceMappingURL=run.post.mjs.map

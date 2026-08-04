import { d as defineEventHandler, r as readBody } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import { r as runAdminTests } from '../../../../_/admin-tests.mjs';
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
import 'node:child_process';
import '../../../../_/coaches.mjs';
import '../../../../_/coach.mjs';
import '../../../../_/coach-dialogue.mjs';

const run_post = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const body = await readBody(event);
  const files = Array.isArray(body == null ? void 0 : body.files) ? body.files.filter((file) => typeof file === "string") : [];
  return runAdminTests(files);
});

export { run_post as default };
//# sourceMappingURL=run.post.mjs.map

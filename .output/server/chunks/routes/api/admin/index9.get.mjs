import { d as defineEventHandler } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import { a as availableAdminTests } from '../../../_/admin-tests.mjs';
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
import 'node:child_process';
import '../../../_/coaches.mjs';
import '../../../_/coach.mjs';
import '../../../_/coach-dialogue.mjs';

const index_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  return { tests: await availableAdminTests() };
});

export { index_get as default };
//# sourceMappingURL=index9.get.mjs.map

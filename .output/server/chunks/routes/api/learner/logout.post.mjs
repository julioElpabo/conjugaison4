import { d as defineEventHandler, s as setResponseHeader } from '../../../nitro/nitro.mjs';
import { c as clearLearnerSession } from '../../../_/learner-session.mjs';
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

const logout_post = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  await clearLearnerSession(event);
  return { ok: true };
});

export { logout_post as default };
//# sourceMappingURL=logout.post.mjs.map

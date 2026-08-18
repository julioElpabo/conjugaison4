import { d as defineEventHandler, s as setResponseHeader, c as createError } from '../../../nitro/nitro.mjs';
import { g as getLearnerSession } from '../../../_/learner-session.mjs';
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

const me_get = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const user = await getLearnerSession(event, true);
  if (!user) throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  return { user: { id: user.id, username: user.username } };
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map

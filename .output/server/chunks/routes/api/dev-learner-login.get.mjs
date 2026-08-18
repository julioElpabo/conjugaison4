import { d as defineEventHandler, c as createError } from '../../nitro/nitro.mjs';
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

const devLearnerLogin_get = defineEventHandler(async (event) => {
  {
    throw createError({ statusCode: 404, statusMessage: "Page introuvable" });
  }
});

export { devLearnerLogin_get as default };
//# sourceMappingURL=dev-learner-login.get.mjs.map

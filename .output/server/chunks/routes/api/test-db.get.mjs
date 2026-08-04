import { d as defineEventHandler, c as createError } from '../../nitro/nitro.mjs';
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

const testDb_get = defineEventHandler(async () => {
  {
    throw createError({ statusCode: 404, statusMessage: "Page introuvable" });
  }
});

export { testDb_get as default };
//# sourceMappingURL=test-db.get.mjs.map

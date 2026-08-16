import { d as defineEventHandler, c as createError } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
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

const index_post = defineEventHandler(async (event) => {
  requireAdministrator(event);
  throw createError({ statusCode: 405, statusMessage: "Cr\xE9ez l\u2019aide depuis son caract\xE8re" });
});

export { index_post as default };
//# sourceMappingURL=index6.post.mjs.map

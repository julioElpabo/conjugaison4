import { d as defineEventHandler } from '../../../nitro/nitro.mjs';
import { g as getAdminSession } from '../../../_/session.mjs';
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

const me_get = defineEventHandler((event) => {
  return { user: getAdminSession(event) };
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map

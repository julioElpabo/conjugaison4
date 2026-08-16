import { d as defineEventHandler, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import { l as listCoachHelps } from '../../../_/coach-helps.mjs';
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
import '../../../_/coach.mjs';

const index_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  return { helps: await listCoachHelps(useDatabase()) };
});

export { index_get as default };
//# sourceMappingURL=index6.get.mjs.map

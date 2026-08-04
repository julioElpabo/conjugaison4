import { d as defineEventHandler, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import { l as listCoachCaracteres } from '../../../_/coaches.mjs';
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
import '../../../_/coach.mjs';
import '../../../_/coach-dialogue.mjs';

const index_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  return { characters: await listCoachCaracteres(useDatabase()) };
});

export { index_get as default };
//# sourceMappingURL=index4.get.mjs.map

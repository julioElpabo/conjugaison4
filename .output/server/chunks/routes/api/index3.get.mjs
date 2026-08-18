import { d as defineEventHandler, u as useDatabase } from '../../nitro/nitro.mjs';
import { c as listCoaches } from '../../_/coaches.mjs';
import { e as explanationLocaleForEvent } from '../../_/locale.mjs';
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
import '../../_/coach.mjs';
import '../../_/coach-dialogue.mjs';

const index_get = defineEventHandler(async (event) => {
  const coaches = await listCoaches(useDatabase(), true, explanationLocaleForEvent(event));
  return { coaches };
});

export { index_get as default };
//# sourceMappingURL=index3.get.mjs.map

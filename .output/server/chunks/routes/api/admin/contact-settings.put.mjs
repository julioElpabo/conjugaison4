import { d as defineEventHandler, D as validateContactSettings, u as useDatabase, E as saveContactSettings, B as getContactSettings } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import { r as readLimitedJsonBody } from '../../../_/limited-json-body.mjs';
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

const contactSettings_put = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const body = await readLimitedJsonBody(event, 8 * 1024);
  const settings = validateContactSettings(body);
  const database = useDatabase();
  await saveContactSettings(database, settings);
  return { ok: true, settings: await getContactSettings(database) };
});

export { contactSettings_put as default };
//# sourceMappingURL=contact-settings.put.mjs.map

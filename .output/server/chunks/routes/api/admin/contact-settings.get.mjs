import { d as defineEventHandler, s as setResponseHeader, A as getContactSettings } from '../../../nitro/nitro.mjs';
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

const contactSettings_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  setResponseHeader(event, "Cache-Control", "no-store");
  return { settings: await getContactSettings() };
});

export { contactSettings_get as default };
//# sourceMappingURL=contact-settings.get.mjs.map

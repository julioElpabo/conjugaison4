import { d as defineEventHandler, s as setResponseHeader, B as getContactSettings } from '../../nitro/nitro.mjs';
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

const contactSettings_get = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "private, max-age=60");
  const settings = await getContactSettings();
  return {
    enabled: settings.enabled,
    subjectMinLength: settings.subjectMinLength,
    subjectMaxLength: settings.subjectMaxLength,
    messageMinLength: settings.messageMinLength,
    messageMaxLength: settings.messageMaxLength
  };
});

export { contactSettings_get as default };
//# sourceMappingURL=contact-settings.get.mjs.map

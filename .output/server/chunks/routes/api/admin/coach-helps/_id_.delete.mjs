import { d as defineEventHandler, c as createError } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  requireAdministrator(event);
  throw createError({ statusCode: 405, statusMessage: "L\u2019aide permanente d\u2019un caract\xE8re ne peut pas \xEAtre supprim\xE9e" });
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

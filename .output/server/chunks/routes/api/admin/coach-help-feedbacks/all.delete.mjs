import { d as defineEventHandler, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
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

const all_delete = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const [result] = await useDatabase().execute(
    `DELETE FROM coach_help_feedback WHERE origin='user'`
  );
  return { ok: true, count: Number(result.affectedRows || 0) };
});

export { all_delete as default };
//# sourceMappingURL=all.delete.mjs.map

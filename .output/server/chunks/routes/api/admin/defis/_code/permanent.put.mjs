import { d as defineEventHandler, g as getRouterParam, c as createError, u as useDatabase } from '../../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../../_/session.mjs';
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

const permanent_put = defineEventHandler(async (event) => {
  var _a;
  requireAdministrator(event);
  const code = ((_a = getRouterParam(event, "code")) != null ? _a : "").trim().toUpperCase();
  if (!/^[A-Z2-9]{2}(?:-[A-Z2-9]{2}){3}$/.test(code)) {
    throw createError({ statusCode: 400, statusMessage: "Code de d\xE9fi invalide" });
  }
  const [result] = await useDatabase().execute(`
    UPDATE defis SET isANePasEffacer = 1, modified = CURRENT_TIMESTAMP WHERE name = ?
  `, [code]);
  if (result.affectedRows === 0) {
    throw createError({ statusCode: 404, statusMessage: "D\xE9fi introuvable" });
  }
  return { ok: true };
});

export { permanent_put as default };
//# sourceMappingURL=permanent.put.mjs.map

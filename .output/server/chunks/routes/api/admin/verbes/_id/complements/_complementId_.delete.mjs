import { d as defineEventHandler, g as getRouterParam, c as createError, u as useDatabase } from '../../../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../../../_/session.mjs';
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

const _complementId__delete = defineEventHandler(async (event) => {
  var _a, _b;
  requireAdministrator(event);
  const verbId = Number.parseInt((_a = getRouterParam(event, "id")) != null ? _a : "", 10);
  const complementId = Number.parseInt((_b = getRouterParam(event, "complementId")) != null ? _b : "", 10);
  if (!Number.isInteger(verbId) || verbId < 1 || !Number.isInteger(complementId) || complementId < 1) {
    throw createError({ statusCode: 400, statusMessage: "Verbe ou compl\xE9ment invalide" });
  }
  const [result] = await useDatabase().execute(`
    UPDATE complements_verbaux c
    INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
    INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
    SET c.actif=0
    WHERE c.id=? AND vs.verbe_id=? AND c.actif=1
  `, [complementId, verbId]);
  if (result.affectedRows !== 1) {
    throw createError({ statusCode: 404, statusMessage: "Compl\xE9ment introuvable" });
  }
  return { ok: true };
});

export { _complementId__delete as default };
//# sourceMappingURL=_complementId_.delete.mjs.map

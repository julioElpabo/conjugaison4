import { d as defineEventHandler, g as getRouterParam, c as createError, r as readBody, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import { p as parseCoachHelpApproachPayload } from '../../../../_/coach-help-approaches.mjs';
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
import '../../../../_/coach.mjs';

const _id__put = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "Approche d\u2019aide invalide" });
  const profile = parseCoachHelpApproachPayload(await readBody(event));
  const database = useDatabase();
  const [result] = await database.execute(
    "UPDATE coach_help_approaches SET name=?,engine_key=?,status=?,sort_order=? WHERE id=?",
    [profile.name, profile.engineKey, profile.status, profile.sortOrder, id]
  );
  if (!result.affectedRows) {
    const [existing] = await database.execute("SELECT id FROM coach_help_approaches WHERE id=? LIMIT 1", [id]);
    if (!existing.length) throw createError({ statusCode: 404, statusMessage: "Approche d\u2019aide introuvable" });
  }
  return { ok: true };
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map

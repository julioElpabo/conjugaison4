import { d as defineEventHandler, g as getRouterParam, c as createError, r as readBody, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import { p as parseCoachHelpPayload, r as replaceCoachHelpBlocks } from '../../../../_/coach-helps.mjs';
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
import '../../../../_/coach.mjs';

const _id__put = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "Aide invalide" });
  const { profile, blocks } = parseCoachHelpPayload(await readBody(event));
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      `UPDATE coach_help_templates SET
      name=?,description=?,header_title=?,header_description=?,status=? WHERE id=? AND deleted_at IS NULL`,
      [profile.name, profile.description, profile.headerTitle, profile.headerDescription, profile.status, id]
    );
    if (!result.affectedRows) throw createError({ statusCode: 404, statusMessage: "Aide introuvable" });
    await replaceCoachHelpBlocks(connection, id, blocks);
    await connection.commit();
    return { ok: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map

import { d as defineEventHandler, g as getRouterParam, c as createError, r as readBody, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import { p as parseMediaPayload } from '../../../../_/coaches.mjs';
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
import '../../../../_/coach-dialogue.mjs';

const _id__put = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "M\xE9dia invalide" });
  const item = parseMediaPayload(await readBody(event));
  await useDatabase().execute(`UPDATE coach_media SET name=?,file_path=?,media_type=?,category=?,alt_text=?,rights_status=?,
    safety_status=?,is_active=?,file_size=? WHERE id=?`, [
    item.name,
    item.filePath,
    item.mediaType,
    item.category,
    item.altText,
    item.rightsStatus,
    item.safetyStatus,
    item.isActive ? 1 : 0,
    item.fileSize,
    id
  ]);
  return { ok: true };
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map

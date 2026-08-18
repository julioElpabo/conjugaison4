import { d as defineEventHandler, g as getRouterParam, c as createError, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import { unlink } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:crypto';
import 'web-push';
import 'mysql2/promise';
import 'node:url';

const _id__delete = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "M\xE9dia invalide" });
  const database = useDatabase();
  const [rows] = await database.execute("SELECT file_path AS filePath FROM coach_media WHERE id=?", [id]);
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: "M\xE9dia introuvable" });
  await database.execute("DELETE FROM coach_media WHERE id=?", [id]);
  const filePath = rows[0].filePath;
  let fileDeleted = false;
  if (filePath.startsWith("/coach-media/")) {
    const mediaRoot = resolve(process.cwd(), "public", "coach-media");
    const target = resolve(process.cwd(), "public", filePath.replace(/^\/+/u, ""));
    if (target === mediaRoot || target.startsWith(`${mediaRoot}${sep}`)) {
      try {
        await unlink(target);
        fileDeleted = true;
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
  }
  return { ok: true, fileDeleted };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

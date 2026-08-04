import { d as defineEventHandler, g as getRouterParam, c as createError, r as readBody, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import { b as parseCoachPayload } from '../../../../_/coaches.mjs';
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
import '../../../../_/coach.mjs';
import '../../../../_/coach-dialogue.mjs';

const _id__put = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "Coach invalide" });
  const { profile } = parseCoachPayload(await readBody(event));
  await useDatabase().execute(`UPDATE coaches SET slug=?, first_name=?, last_name=?, gender=?, avatar_path=?, description=?, likes=?, character_id=?,
    theme_color=?, status=?, sort_order=? WHERE id=?`, [
    profile.slug,
    profile.firstName,
    profile.lastName,
    profile.gender,
    profile.avatarPath,
    profile.description,
    profile.likes,
    profile.caractereId,
    profile.themeColor,
    profile.status,
    profile.sortOrder,
    id
  ]);
  return { ok: true };
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map

import { d as defineEventHandler, r as readBody, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import { b as parseCoachPayload } from '../../../_/coaches.mjs';
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
import '../../../_/coach.mjs';
import '../../../_/coach-dialogue.mjs';

const index_post = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const { profile } = parseCoachPayload(await readBody(event));
  const [result] = await useDatabase().execute(`INSERT INTO coaches
    (slug, first_name, last_name, gender, avatar_path, description, likes, character_id, personality, pedagogical_style, theme_color, status, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', '', ?, ?, ?)`, [
    profile.slug,
    profile.firstName,
    profile.lastName,
    profile.gender,
    profile.avatarPath,
    profile.description,
    profile.likes,
    profile.caractereId,
    profile.themeColor,
    "draft",
    profile.sortOrder
  ]);
  return { ok: true, id: result.insertId };
});

export { index_post as default };
//# sourceMappingURL=index8.post.mjs.map

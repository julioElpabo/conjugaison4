import { d as defineEventHandler, r as readBody, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import { p as parseCoachHelpApproachPayload, c as coachHelpApproachSlug } from '../../../_/coach-help-approaches.mjs';
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
import '../../../_/coach.mjs';

const index_post = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const profile = parseCoachHelpApproachPayload(await readBody(event));
  const database = useDatabase();
  const root = coachHelpApproachSlug(profile.name);
  let slug = root;
  for (let index = 2; ; index += 1) {
    const [existing] = await database.execute("SELECT id FROM coach_help_approaches WHERE slug=? LIMIT 1", [slug]);
    if (!existing.length) break;
    const suffix = `-${index}`;
    slug = `${root.slice(0, 80 - suffix.length)}${suffix}`;
  }
  const [result] = await database.execute(
    "INSERT INTO coach_help_approaches (slug,name,engine_key,status,sort_order) VALUES (?,?,?,?,?)",
    [slug, profile.name, profile.engineKey, profile.status, profile.sortOrder]
  );
  return { ok: true, id: result.insertId };
});

export { index_post as default };
//# sourceMappingURL=index5.post.mjs.map

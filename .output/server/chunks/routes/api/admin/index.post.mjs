import { d as defineEventHandler, r as readBody, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import bcrypt from 'bcryptjs';
import { p as parseAdminUserInput, a as assertPrivilegeExists, b as assertUserIdentityAvailable } from '../../../_/admin-users.mjs';
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

const index_post = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const input = parseAdminUserInput(await readBody(event), true);
  input.privilegeId = 1;
  const database = useDatabase();
  await Promise.all([
    assertPrivilegeExists(database, input.privilegeId),
    assertUserIdentityAvailable(database, input.email, input.username)
  ]);
  const password = await bcrypt.hash(input.password, 12);
  const [result] = await database.execute(`
    INSERT INTO users (prenom, nom, email, username, password, privilege_id, created, modified)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `, [input.prenom, input.nom, input.email, input.username, password, input.privilegeId]);
  return { ok: true, id: result.insertId };
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map

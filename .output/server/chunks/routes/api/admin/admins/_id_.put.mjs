import { d as defineEventHandler, g as getRouterParam, c as createError, r as readBody, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator, c as createAdminSession } from '../../../../_/session.mjs';
import bcrypt from 'bcryptjs';
import { p as parseAdminUserInput, a as assertPrivilegeExists, b as assertUserIdentityAvailable } from '../../../../_/admin-users.mjs';
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

const _id__put = defineEventHandler(async (event) => {
  const administrator = requireAdministrator(event);
  const id = Number.parseInt(getRouterParam(event, "id") || "", 10);
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "Utilisateur invalide" });
  const input = parseAdminUserInput(await readBody(event), false);
  input.privilegeId = 1;
  const database = useDatabase();
  const [[existing]] = await database.execute("SELECT id FROM users WHERE id = ? AND privilege_id = 1 LIMIT 1", [id]);
  if (!existing) throw createError({ statusCode: 404, statusMessage: "Utilisateur introuvable" });
  await Promise.all([
    assertPrivilegeExists(database, input.privilegeId),
    assertUserIdentityAvailable(database, input.email, input.username, id)
  ]);
  const values = [input.prenom, input.nom, input.email, input.username, input.privilegeId];
  let passwordClause = "";
  if (input.password) {
    passwordClause = ", password = ?";
    values.push(await bcrypt.hash(input.password, 12));
  }
  values.push(id);
  const [result] = await database.execute(`
    UPDATE users SET prenom = ?, nom = ?, email = ?, username = ?, privilege_id = ?,
      modified = CURRENT_TIMESTAMP ${passwordClause}
    WHERE id = ?
  `, values);
  if (result.affectedRows !== 1) throw createError({ statusCode: 404, statusMessage: "Utilisateur introuvable" });
  if (administrator.id === id) {
    createAdminSession(event, {
      id,
      prenom: input.prenom,
      nom: input.nom,
      email: input.email,
      username: input.username,
      privilegeId: input.privilegeId
    });
  }
  return { ok: true, id };
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map

import { d as defineEventHandler, g as getRouterParam, c as createError, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  const administrator = requireAdministrator(event);
  const id = Number.parseInt(getRouterParam(event, "id") || "", 10);
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "Utilisateur invalide" });
  if (administrator.id === id) throw createError({ statusCode: 400, statusMessage: "Vous ne pouvez pas supprimer votre propre compte" });
  const database = useDatabase();
  const [[user]] = await database.execute("SELECT id, privilege_id AS privilegeId FROM users WHERE id = ? AND privilege_id = 1 LIMIT 1", [id]);
  if (!user) throw createError({ statusCode: 404, statusMessage: "Utilisateur introuvable" });
  if (Number(user.privilegeId) === 1) {
    const [[administrators]] = await database.execute("SELECT COUNT(*) AS count FROM users WHERE privilege_id = 1");
    if (Number((administrators == null ? void 0 : administrators.count) || 0) <= 1) {
      throw createError({ statusCode: 400, statusMessage: "Le dernier administrateur ne peut pas \xEAtre supprim\xE9" });
    }
  }
  const [result] = await database.execute("DELETE FROM users WHERE id = ?", [id]);
  if (result.affectedRows !== 1) throw createError({ statusCode: 404, statusMessage: "Utilisateur introuvable" });
  return { ok: true };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

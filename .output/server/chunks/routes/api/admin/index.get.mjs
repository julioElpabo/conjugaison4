import { d as defineEventHandler, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
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

const index_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const database = useDatabase();
  const [users] = await database.execute(`
      SELECT u.id, u.prenom, u.nom, u.email, u.username,
        u.created, u.modified
      FROM users u
      WHERE u.privilege_id = 1
      ORDER BY u.nom, u.prenom, u.id
    `);
  return { users };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map

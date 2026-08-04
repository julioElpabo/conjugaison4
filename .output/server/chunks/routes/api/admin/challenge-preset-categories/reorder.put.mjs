import { d as defineEventHandler, r as readBody, c as createError, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
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

const reorder_put = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const body = await readBody(event);
  const orderedIds = Array.isArray(body == null ? void 0 : body.orderedIds) ? body.orderedIds.map(Number) : [];
  if (!orderedIds.length || orderedIds.some((id) => !Number.isInteger(id) || id < 1) || new Set(orderedIds).size !== orderedIds.length) {
    throw createError({ statusCode: 400, statusMessage: "Ordre des cat\xE9gories invalide" });
  }
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      "SELECT id FROM challenge_preset_categories FOR UPDATE"
    );
    const storedIds = rows.map((row) => Number(row.id)).sort((a, b) => a - b);
    const requestedIds = [...orderedIds].sort((a, b) => a - b);
    if (storedIds.length !== requestedIds.length || storedIds.some((id, index) => id !== requestedIds[index])) {
      throw createError({ statusCode: 409, statusMessage: "La liste des cat\xE9gories a chang\xE9, rechargez la page" });
    }
    for (const [index, id] of orderedIds.entries()) {
      await connection.execute("UPDATE challenge_preset_categories SET sort_order=? WHERE id=?", [index + 1, id]);
    }
    await connection.commit();
    return { ok: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export { reorder_put as default };
//# sourceMappingURL=reorder.put.mjs.map

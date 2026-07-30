import { d as defineEventHandler, g as getRouterParam, c as createError, u as useDatabase } from '../../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../../_/session.mjs';
import { d as deleteCaracterePermanently } from '../../../../../_/coach-caracteres.mjs';

const permanent_delete$1 = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "Caract\xE8re invalide" });
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const deleted = await deleteCaracterePermanently(connection, id);
    if (!deleted) throw createError({ statusCode: 404, statusMessage: "Caract\xE8re introuvable" });
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return { ok: true };
});

const permanent_delete$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: permanent_delete$1
}, Symbol.toStringTag, { value: 'Module' }));

const permanent_delete = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: permanent_delete$1
}, Symbol.toStringTag, { value: 'Module' }));

export { permanent_delete as a, permanent_delete$2 as p };
//# sourceMappingURL=permanent.delete.mjs.map

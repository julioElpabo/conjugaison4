import { d as defineEventHandler, g as getRouterParam, c as createError, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';

const _id__delete$1 = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "Caract\xE8re invalide" });
  await useDatabase().execute("UPDATE coach_characters SET status='disabled' WHERE id=?", [id]);
  return { ok: true };
});

const _id__delete$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__delete$1
}, Symbol.toStringTag, { value: 'Module' }));

const _id__delete = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__delete$1
}, Symbol.toStringTag, { value: 'Module' }));

export { _id__delete$2 as _, _id__delete as a };
//# sourceMappingURL=_id_.delete.mjs.map

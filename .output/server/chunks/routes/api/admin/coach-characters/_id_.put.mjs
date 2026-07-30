import { d as defineEventHandler, g as getRouterParam, c as createError, r as readBody, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import { d as parseCaracterePayload } from '../../../../_/coaches.mjs';
import { r as replaceCaractereChildren } from '../../../../_/coach-caracteres.mjs';

const _id__put$1 = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: "Caract\xE8re invalide" });
  const { profile, replies, assignments, rules } = parseCaracterePayload(await readBody(event));
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      `UPDATE coach_characters SET slug=?,name=?,masculine_name=?,emoticon=?,
      pedagogical_style=?,help_approach_id=?,status=?,sort_order=? WHERE id=?`,
      [
        profile.slug,
        profile.masculineName,
        profile.masculineName,
        profile.emoticon,
        profile.pedagogicalStyle,
        profile.helpApproachId,
        profile.status,
        profile.sortOrder,
        id
      ]
    );
    await replaceCaractereChildren(connection, id, replies, assignments, rules);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return { ok: true };
});

const _id__put$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__put$1
}, Symbol.toStringTag, { value: 'Module' }));

const _id__put = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: _id__put$1
}, Symbol.toStringTag, { value: 'Module' }));

export { _id__put$2 as _, _id__put as a };
//# sourceMappingURL=_id_.put.mjs.map

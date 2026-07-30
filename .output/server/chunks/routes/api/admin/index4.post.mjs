import { d as defineEventHandler, r as readBody, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
import { d as parseCaracterePayload } from '../../../_/coaches.mjs';
import { r as replaceCaractereChildren } from '../../../_/coach-caracteres.mjs';

const index_post$1 = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const body = await readBody(event);
  const { profile, replies, assignments, rules } = parseCaracterePayload(body);
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      `INSERT INTO coach_characters
      (slug,name,masculine_name,emoticon,pedagogical_style,help_approach_id,status,sort_order)
      VALUES (?,?,?,?,?,?,?,?)`,
      [
        profile.slug,
        profile.masculineName,
        profile.masculineName,
        profile.emoticon,
        profile.pedagogicalStyle,
        profile.helpApproachId,
        profile.status,
        profile.sortOrder
      ]
    );
    await replaceCaractereChildren(connection, result.insertId, replies, assignments, rules);
    await connection.commit();
    return { ok: true, id: result.insertId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

const index_post$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_post$1
}, Symbol.toStringTag, { value: 'Module' }));

const index_post = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: index_post$1
}, Symbol.toStringTag, { value: 'Module' }));

export { index_post as a, index_post$2 as i };
//# sourceMappingURL=index4.post.mjs.map

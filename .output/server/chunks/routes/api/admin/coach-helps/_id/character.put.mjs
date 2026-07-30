import { d as defineEventHandler, c as createError } from '../../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../../_/session.mjs';

const caractere_put = defineEventHandler(async (event) => {
  requireAdministrator(event);
  throw createError({ statusCode: 405, statusMessage: "L\u2019association caract\xE8re\u2013aide est permanente" });
});

const caractere_put$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: caractere_put
}, Symbol.toStringTag, { value: 'Module' }));

const character_put = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: caractere_put
}, Symbol.toStringTag, { value: 'Module' }));

export { character_put as a, caractere_put$1 as c };
//# sourceMappingURL=character.put.mjs.map

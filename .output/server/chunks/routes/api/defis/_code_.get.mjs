import { d as defineEventHandler, g as getRouterParam, c as createError } from '../../../nitro/nitro.mjs';
import { n as normalizeDefiCode, g as getDefi, D as DefiNotFoundError } from '../../../_/defis.mjs';
import { P as PublicInputError } from '../../../_/public-api-validation.mjs';
import { a as assertPublicApiRateLimit, P as PUBLIC_RATE_LIMITS } from '../../../_/public-api-rate-limit.mjs';
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
import '../../../_/challenge-defaults.mjs';

const _code__get = defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.challengeRead);
  let code;
  try {
    code = normalizeDefiCode(getRouterParam(event, "code"));
  } catch (error) {
    if (error instanceof PublicInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message });
    }
    throw error;
  }
  try {
    return { code, ...await getDefi(code) };
  } catch (error) {
    if (error instanceof DefiNotFoundError) {
      throw createError({ statusCode: 404, statusMessage: "D\xE9fi introuvable" });
    }
    console.error("Impossible de charger le d\xE9fi", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Impossible de charger le d\xE9fi"
    });
  }
});

export { _code__get as default };
//# sourceMappingURL=_code_.get.mjs.map

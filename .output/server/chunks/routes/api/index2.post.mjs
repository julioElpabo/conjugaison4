import { d as defineEventHandler, c as createError } from '../../nitro/nitro.mjs';
import { s as saveDefi } from '../../_/defis.mjs';
import { p as parseDefiDefinition, P as PublicInputError } from '../../_/public-api-validation.mjs';
import { a as assertPublicApiRateLimit, P as PUBLIC_RATE_LIMITS } from '../../_/public-api-rate-limit.mjs';
import { r as readLimitedJsonBody } from '../../_/limited-json-body.mjs';
import { g as getLearnerSession } from '../../_/learner-session.mjs';
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
import '../../_/challenge-defaults.mjs';

const index_post = defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.challengeCreate);
  let definition;
  try {
    definition = parseDefiDefinition(await readLimitedJsonBody(event, 32 * 1024));
  } catch (error) {
    if (error instanceof PublicInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message });
    }
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    throw createError({ statusCode: 400, statusMessage: "Corps JSON invalide" });
  }
  try {
    const learner = await getLearnerSession(event);
    return { code: await saveDefi(definition, learner == null ? void 0 : learner.id) };
  } catch (error) {
    if (error instanceof PublicInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message });
    }
    console.error("Impossible de sauvegarder le d\xE9fi", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Impossible de sauvegarder le d\xE9fi"
    });
  }
});

export { index_post as default };
//# sourceMappingURL=index2.post.mjs.map

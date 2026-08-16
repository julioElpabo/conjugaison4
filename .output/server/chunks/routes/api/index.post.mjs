import { d as defineEventHandler, I as saveExerciseSummary, G as ExerciseSummaryInputError, c as createError } from '../../nitro/nitro.mjs';
import { a as assertPublicApiRateLimit, P as PUBLIC_RATE_LIMITS } from '../../_/public-api-rate-limit.mjs';
import { r as readLimitedJsonBody } from '../../_/limited-json-body.mjs';
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

const index_post = defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.summaryCreate);
  try {
    const body = await readLimitedJsonBody(event, 768 * 1024);
    return { token: await saveExerciseSummary(body) };
  } catch (error) {
    if (error instanceof ExerciseSummaryInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message });
    }
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    console.error("Impossible de partager le bilan", error);
    throw createError({ statusCode: 500, statusMessage: "Impossible de partager le bilan" });
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map

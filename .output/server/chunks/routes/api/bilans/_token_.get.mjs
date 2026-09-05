import { d as defineEventHandler, Q as getExerciseSummary, g as getRouterParam, s as setResponseHeader, R as ExerciseSummaryInputError, c as createError, S as ExerciseSummaryNotFoundError } from '../../../nitro/nitro.mjs';
import { a as assertPublicApiRateLimit, P as PUBLIC_RATE_LIMITS } from '../../../_/public-api-rate-limit.mjs';
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

const _token__get = defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.summaryRead);
  try {
    const summary = await getExerciseSummary(getRouterParam(event, "token") || "");
    setResponseHeader(event, "Cache-Control", "public, max-age=300");
    return summary;
  } catch (error) {
    if (error instanceof ExerciseSummaryInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message });
    }
    if (error instanceof ExerciseSummaryNotFoundError) {
      throw createError({ statusCode: 404, statusMessage: "Bilan introuvable" });
    }
    console.error("Impossible de charger le bilan partag\xE9", error);
    throw createError({ statusCode: 500, statusMessage: "Impossible de charger le bilan partag\xE9" });
  }
});

export { _token__get as default };
//# sourceMappingURL=_token_.get.mjs.map

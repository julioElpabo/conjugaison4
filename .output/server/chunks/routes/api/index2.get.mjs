import { d as defineEventHandler, i as parsePublicationLocale, a as getQuery, c as createError, T as listPublicChallengePublications, u as useDatabase } from '../../nitro/nitro.mjs';
import { a as assertPublicApiRateLimit, P as PUBLIC_RATE_LIMITS } from '../../_/public-api-rate-limit.mjs';
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

const index_get = defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.challengeRead);
  let locale;
  try {
    locale = parsePublicationLocale(getQuery(event).locale);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Langue invalide" });
  }
  return { publications: await listPublicChallengePublications(useDatabase(), locale) };
});

export { index_get as default };
//# sourceMappingURL=index2.get.mjs.map

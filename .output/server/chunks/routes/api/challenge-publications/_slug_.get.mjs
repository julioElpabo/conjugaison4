import { d as defineEventHandler, h as parsePublicationLocale, a as getQuery, c as createError, g as getRouterParam, W as resolveChallengePublication, u as useDatabase } from '../../../nitro/nitro.mjs';
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

const _slug__get = defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.challengeRead);
  let locale;
  try {
    locale = parsePublicationLocale(getQuery(event).locale);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Langue invalide" });
  }
  const slug = String(getRouterParam(event, "slug") || "").trim().toLocaleLowerCase("fr");
  if (!slug || slug.length > 120) throw createError({ statusCode: 400, statusMessage: "Slug invalide" });
  const resolution = await resolveChallengePublication(useDatabase(), locale, slug);
  if (!resolution) throw createError({ statusCode: 404, statusMessage: "D\xE9fi public introuvable" });
  return resolution;
});

export { _slug__get as default };
//# sourceMappingURL=_slug_.get.mjs.map

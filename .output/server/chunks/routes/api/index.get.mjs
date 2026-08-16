import { d as defineEventHandler, J as getCachedCatalogue, K as setResponseHeaders, c as createError } from '../../nitro/nitro.mjs';
import { e as explanationLocaleForEvent } from '../../_/locale.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:url';
import 'node:fs/promises';

const index_get = defineEventHandler(async (event) => {
  try {
    const locale = explanationLocaleForEvent(event);
    const { catalogue, status } = await getCachedCatalogue(locale);
    setResponseHeaders(event, {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      "Vary": "Cookie, Accept-Language",
      "X-Catalogue-Cache": status,
      "X-Content-Language": locale
    });
    return catalogue;
  } catch (error) {
    console.error("Impossible de charger le catalogue de conjugaison", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Impossible de charger le catalogue"
    });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map

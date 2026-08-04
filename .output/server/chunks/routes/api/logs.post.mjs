import { d as defineEventHandler, c as createError, u as useDatabase } from '../../nitro/nitro.mjs';
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
import 'node:url';
import 'node:fs/promises';

const EVENT_COLUMNS = {
  homepage: "homepage",
  print: "creationpdf",
  "challenge-save": "sauvedefi",
  "challenge-load": "chargedefi",
  exercise: "exercersimple",
  result: "resultatsimple"
};
const logs_post = defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.telemetry);
  const body = await readLimitedJsonBody(event, 8 * 1024);
  const eventName = typeof (body == null ? void 0 : body.event) === "string" ? body.event : "";
  const column = EVENT_COLUMNS[eventName];
  if (!column) {
    throw createError({ statusCode: 400, statusMessage: "\xC9v\xE9nement inconnu" });
  }
  await useDatabase().execute(`INSERT INTO logs (\`${column}\`) VALUES (1)`);
  return { ok: true };
});

export { logs_post as default };
//# sourceMappingURL=logs.post.mjs.map

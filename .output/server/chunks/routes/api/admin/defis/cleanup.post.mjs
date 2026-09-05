import { d as defineEventHandler, s as setResponseHeader, H as parseCleanupRequest, c as createError, I as deleteInactiveDefis, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../_/session.mjs';
import { r as readLimitedJsonBody } from '../../../../_/limited-json-body.mjs';
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

const cleanup_post = defineEventHandler(async (event) => {
  requireAdministrator(event);
  setResponseHeader(event, "Cache-Control", "no-store");
  const body = await readLimitedJsonBody(event, 1024);
  let request;
  try {
    request = parseCleanupRequest(body);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Confirmation de suppression invalide" });
  }
  return deleteInactiveDefis(useDatabase(), request.cutoff);
});

export { cleanup_post as default };
//# sourceMappingURL=cleanup.post.mjs.map

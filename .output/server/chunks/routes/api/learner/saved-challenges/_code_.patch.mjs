import { d as defineEventHandler, s as setResponseHeader, c as createError, g as getRouterParam, ac as parseSavedChallengeMetadata, ad as updateSavedChallengeMetadata, u as useDatabase, Y as PublicInputError } from '../../../../nitro/nitro.mjs';
import { g as getLearnerSession } from '../../../../_/learner-session.mjs';
import { r as readLimitedJsonBody } from '../../../../_/limited-json-body.mjs';
import { n as normalizeDefiCode } from '../../../../_/defis.mjs';
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

const _code__patch = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await getLearnerSession(event);
  if (!learner) throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  try {
    const code = normalizeDefiCode(getRouterParam(event, "code"));
    const metadata = parseSavedChallengeMetadata(await readLimitedJsonBody(event, 8192));
    if (!await updateSavedChallengeMetadata(useDatabase(), learner.id, code, metadata)) {
      throw createError({ statusCode: 404, statusMessage: "D\xE9fi absent de ton compte" });
    }
    return { code, ...metadata };
  } catch (error) {
    if (error instanceof PublicInputError) throw createError({ statusCode: 400, statusMessage: error.message });
    throw error;
  }
});

export { _code__patch as default };
//# sourceMappingURL=_code_.patch.mjs.map

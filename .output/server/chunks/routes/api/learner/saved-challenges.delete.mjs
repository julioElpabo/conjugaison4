import { d as defineEventHandler, s as setResponseHeader, c as createError, au as parseSavedChallengeRemoval, av as removeSavedChallenges, u as useDatabase, a1 as PublicInputError } from '../../../nitro/nitro.mjs';
import { g as getLearnerSession } from '../../../_/learner-session.mjs';
import { r as readLimitedJsonBody } from '../../../_/limited-json-body.mjs';
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

const savedChallenges_delete = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await getLearnerSession(event);
  if (!learner) throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  try {
    const codes = parseSavedChallengeRemoval(await readLimitedJsonBody(event, 262144));
    const removedCount = await removeSavedChallenges(useDatabase(), learner.id, codes);
    return { codes, removedCount };
  } catch (error) {
    if (error instanceof PublicInputError) throw createError({ statusCode: 400, statusMessage: error.message });
    throw error;
  }
});

export { savedChallenges_delete as default };
//# sourceMappingURL=saved-challenges.delete.mjs.map

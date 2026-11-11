import { d as defineEventHandler, s as setResponseHeader, c as createError, aB as parseSavedChallengeMove, aC as moveSavedChallenges, u as useDatabase, a1 as PublicInputError, ag as SavedChallengeFolderError } from '../../../../nitro/nitro.mjs';
import { g as getLearnerSession } from '../../../../_/learner-session.mjs';
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

const move_post = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await getLearnerSession(event);
  if (!learner) throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  try {
    const { codes, folderId } = parseSavedChallengeMove(await readLimitedJsonBody(event, 262144));
    await moveSavedChallenges(useDatabase(), learner.id, codes, folderId);
    return { codes, folderId };
  } catch (error) {
    if (error instanceof PublicInputError) throw createError({ statusCode: 400, statusMessage: error.message });
    if (error instanceof SavedChallengeFolderError) throw createError({ statusCode: error.statusCode, statusMessage: error.message });
    throw error;
  }
});

export { move_post as default };
//# sourceMappingURL=move.post.mjs.map

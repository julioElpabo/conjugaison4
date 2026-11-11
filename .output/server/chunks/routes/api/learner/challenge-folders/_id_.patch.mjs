import { d as defineEventHandler, s as setResponseHeader, c as createError, g as getRouterParam, ah as parseChallengeFolderId, aj as parseChallengeFolderPatch, ak as updateChallengeFolder, u as useDatabase, a1 as PublicInputError, ag as SavedChallengeFolderError } from '../../../../nitro/nitro.mjs';
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

const _id__patch = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await getLearnerSession(event);
  if (!learner) throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  try {
    const rawId = getRouterParam(event, "id") || "";
    const id = parseChallengeFolderId(/^\d+$/u.test(rawId) ? Number(rawId) : void 0);
    const patch = parseChallengeFolderPatch(await readLimitedJsonBody(event, 2048));
    return { folder: await updateChallengeFolder(useDatabase(), learner.id, id, patch) };
  } catch (error) {
    if (error instanceof PublicInputError) throw createError({ statusCode: 400, statusMessage: error.message });
    if (error instanceof SavedChallengeFolderError) throw createError({ statusCode: error.statusCode, statusMessage: error.message });
    throw error;
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map

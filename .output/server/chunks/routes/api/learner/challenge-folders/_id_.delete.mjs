import { d as defineEventHandler, s as setResponseHeader, c as createError, g as getRouterParam, ah as parseChallengeFolderId, ai as deleteChallengeFolder, u as useDatabase, a1 as PublicInputError, ag as SavedChallengeFolderError } from '../../../../nitro/nitro.mjs';
import { g as getLearnerSession } from '../../../../_/learner-session.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await getLearnerSession(event);
  if (!learner) throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  try {
    const rawId = getRouterParam(event, "id") || "";
    const id = parseChallengeFolderId(/^\d+$/u.test(rawId) ? Number(rawId) : void 0);
    await deleteChallengeFolder(useDatabase(), learner.id, id);
    return { deletedId: id };
  } catch (error) {
    if (error instanceof PublicInputError) throw createError({ statusCode: 400, statusMessage: error.message });
    if (error instanceof SavedChallengeFolderError) throw createError({ statusCode: error.statusCode, statusMessage: error.message });
    throw error;
  }
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map

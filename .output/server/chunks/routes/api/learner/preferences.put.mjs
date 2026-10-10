import { d as defineEventHandler, s as setResponseHeader, c as createError, ah as parseLearnerPreferencesPatch, $ as PublicInputError, ai as updateLearnerPreferences, u as useDatabase } from '../../../nitro/nitro.mjs';
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

const preferences_put = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await getLearnerSession(event);
  if (!learner) throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  const body = await readLimitedJsonBody(event, 4 * 1024);
  let patch;
  try {
    patch = parseLearnerPreferencesPatch(body);
  } catch (error) {
    if (error instanceof PublicInputError) throw createError({ statusCode: 400, statusMessage: error.message });
    throw error;
  }
  return updateLearnerPreferences(useDatabase(), learner.id, patch);
});

export { preferences_put as default };
//# sourceMappingURL=preferences.put.mjs.map

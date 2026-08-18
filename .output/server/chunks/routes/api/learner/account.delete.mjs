import { d as defineEventHandler, s as setResponseHeader, c as createError, u as useDatabase } from '../../../nitro/nitro.mjs';
import { g as getLearnerSession, c as clearLearnerSession } from '../../../_/learner-session.mjs';
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

const account_delete = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await getLearnerSession(event);
  if (!learner) throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  const [result] = await useDatabase().execute(
    "DELETE FROM learner_accounts WHERE id = ?",
    [learner.id]
  );
  if (result.affectedRows !== 1) {
    throw createError({ statusCode: 409, statusMessage: "Le compte n\u2019a pas pu \xEAtre supprim\xE9" });
  }
  await clearLearnerSession(event);
  return { ok: true };
});

export { account_delete as default };
//# sourceMappingURL=account.delete.mjs.map

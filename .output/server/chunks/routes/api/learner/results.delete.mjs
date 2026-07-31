import { d as defineEventHandler, s as setResponseHeader, c as createError, u as useDatabase } from '../../../nitro/nitro.mjs';
import { g as getLearnerSession } from '../../../_/learner-session.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

const results_delete = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await getLearnerSession(event);
  if (!learner) throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      "DELETE FROM learner_skill_daily_stats WHERE account_id = ?",
      [learner.id]
    );
    await connection.execute(
      "DELETE FROM learner_challenge_runs WHERE account_id = ?",
      [learner.id]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return { ok: true };
});

export { results_delete as default };
//# sourceMappingURL=results.delete.mjs.map

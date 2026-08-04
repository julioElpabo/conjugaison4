import { d as defineEventHandler, s as setResponseHeader, c as createError, u as useDatabase } from '../../../../nitro/nitro.mjs';
import { l as learnerRunIdentifier, b as learnerChallengeSnapshot, c as learnerChallengeFingerprint, d as learnerChallengeLabel, e as learnerQuestionSnapshot } from '../../../../_/learner-progress.mjs';
import { g as getLearnerSession } from '../../../../_/learner-session.mjs';
import { r as readLimitedJsonBody } from '../../../../_/limited-json-body.mjs';
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

const plan_post = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await getLearnerSession(event);
  if (!learner) throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  const body = await readLimitedJsonBody(event, 256 * 1024);
  const runId = learnerRunIdentifier(body.runId);
  const challenge = learnerChallengeSnapshot(body.challenge);
  const fingerprint = learnerChallengeFingerprint(challenge, body.challengeFingerprint);
  const label = learnerChallengeLabel(body.challengeLabel);
  const presentation = body.presentation === "chat" ? "chat" : "classic";
  const questionIndexOffset = Math.min(1e3, Math.max(0, Number(body.questionIndexOffset) || 0));
  if (!Array.isArray(body.questions) || !body.questions.length || body.questions.length > 200) {
    throw createError({ statusCode: 400, statusMessage: "Plan de questions invalide" });
  }
  const questions = body.questions.map((question) => learnerQuestionSnapshot(question));
  const database = useDatabase();
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [runResult] = await connection.execute(`
      INSERT INTO learner_challenge_runs
        (account_id, client_run_id, challenge_fingerprint, challenge_label,
         challenge_config_json, presentation, is_review)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id),
        challenge_config_json=IF(
          learner_challenge_runs.is_review=1,
          VALUES(challenge_config_json),
          learner_challenge_runs.challenge_config_json
        )
    `, [
      learner.id,
      runId,
      fingerprint,
      label,
      JSON.stringify(challenge),
      presentation,
      body.isReview === true ? 1 : 0
    ]);
    await connection.query(`
      INSERT INTO learner_run_questions
        (run_id, question_index, question_json, result_status, attempt_number)
      VALUES ${questions.map(() => "(?, ?, ?, NULL, NULL)").join(", ")}
      ON DUPLICATE KEY UPDATE
        question_json=IF(result_status IS NULL, VALUES(question_json), question_json)
    `, questions.flatMap((question, index) => [
      runResult.insertId,
      questionIndexOffset + index,
      JSON.stringify(question)
    ]));
    await connection.commit();
    return { recorded: questions.length };
  } catch (error) {
    await connection.rollback().catch(() => {
    });
    throw error;
  } finally {
    connection.release();
  }
});

export { plan_post as default };
//# sourceMappingURL=plan.post.mjs.map

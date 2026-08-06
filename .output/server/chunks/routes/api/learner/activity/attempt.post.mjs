import { d as defineEventHandler, s as setResponseHeader, c as createError, Q as validateConjugationAnswer, R as validateAnswer, S as diagnoseLearnerError, u as useDatabase, T as LEARNER_ERROR_DETECTOR_VERSION, U as applicableLearnerErrorTypes } from '../../../../nitro/nitro.mjs';
import { l as learnerRunIdentifier, a as learnerAttemptIdentifier, b as learnerChallengeSnapshot, c as learnerChallengeFingerprint, d as learnerChallengeLabel, e as learnerQuestionSnapshot, f as learnerFormKey } from '../../../../_/learner-progress.mjs';
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

const attempt_post = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await getLearnerSession(event);
  if (!learner) throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  const body = await readLimitedJsonBody(event, 32 * 1024);
  const runId = learnerRunIdentifier(body.runId);
  const attemptId = learnerAttemptIdentifier(body.attemptId);
  const challenge = learnerChallengeSnapshot(body.challenge);
  const fingerprint = learnerChallengeFingerprint(challenge, body.challengeFingerprint);
  const label = learnerChallengeLabel(body.challengeLabel);
  const presentation = body.presentation === "chat" ? "chat" : "classic";
  const question = learnerQuestionSnapshot(body.question);
  const answer = typeof body.answer === "string" ? body.answer.trim().slice(0, 500) : "";
  const questionIndex = Math.min(1e3, Math.max(0, Number(body.questionIndex) || 0));
  const attemptNumber = Number(body.attemptNumber) === 2 ? 2 : 1;
  if (!answer || typeof body.correct !== "boolean") {
    throw createError({ statusCode: 400, statusMessage: "Tentative invalide" });
  }
  const correct = (challenge.exerciseKind === "conjugation" ? validateConjugationAnswer(answer, question) : validateAnswer(answer, question.reponses)).isCorrect;
  const diagnostics = correct ? [] : diagnoseLearnerError(answer, question);
  const database = useDatabase();
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [runResult] = await connection.execute(`
      INSERT INTO learner_challenge_runs
        (account_id, client_run_id, challenge_fingerprint, challenge_label,
         challenge_config_json, presentation, is_review)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
    `, [
      learner.id,
      runId,
      fingerprint,
      label,
      JSON.stringify(challenge),
      presentation,
      body.isReview === true ? 1 : 0
    ]);
    const runDatabaseId = runResult.insertId;
    const formKey = learnerFormKey(question, challenge.exerciseKind);
    const questionJson = correct ? null : JSON.stringify(question);
    const formValues = [
      attemptId,
      questionIndex,
      question.verbeId || null,
      question.tenseId || null,
      question.personId || null,
      question.infinitif || "",
      question.temps || "",
      question.mode || "",
      questionJson,
      correct ? 0 : 1,
      correct ? 1 : 0
    ];
    const [formInsert] = await connection.execute(`
      INSERT INTO learner_run_forms
        (run_id, form_key, last_client_attempt_id, question_index, verb_id,
         tense_id, person_id, infinitive, tense_label, mode_label, question_json,
         attempt_count, incorrect_count, is_mastered)
      VALUES (?, ?, '', ?, ?, ?, ?, ?, ?, ?, NULL, 0, 0, 0)
      ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
    `, [
      runDatabaseId,
      formKey,
      questionIndex,
      question.verbeId || null,
      question.tenseId || null,
      question.personId || null,
      question.infinitif || "",
      question.temps || "",
      question.mode || ""
    ]);
    const formDatabaseId = formInsert.insertId;
    const [formUpdate] = await connection.execute(`
      UPDATE learner_run_forms
      SET last_client_attempt_id=?, question_index=?, verb_id=?, tense_id=?,
          person_id=?, infinitive=?, tense_label=?, mode_label=?,
          question_json=?, attempt_count=attempt_count + 1,
          incorrect_count=incorrect_count + ?, is_mastered=?,
          last_answered_at=CURRENT_TIMESTAMP
      WHERE id=? AND last_client_attempt_id<>?
    `, [...formValues, formDatabaseId, attemptId]);
    const recorded = formUpdate.affectedRows > 0;
    if (recorded) {
      await connection.execute(`
        INSERT INTO learner_run_questions
          (run_id, question_index, question_json, result_status, attempt_number)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE question_json=VALUES(question_json),
          result_status=VALUES(result_status),
          attempt_number=VALUES(attempt_number)
      `, [
        runDatabaseId,
        questionIndex,
        JSON.stringify(question),
        correct ? "correct" : "incorrect",
        attemptNumber
      ]);
    }
    if (recorded && !correct) {
      const [attemptInsert] = await connection.execute(`
        INSERT IGNORE INTO learner_answer_attempts
          (run_id, client_attempt_id, question_index, form_key, verb_id, tense_id,
           person_id, infinitive, tense_label, mode_label, question_json,
           learner_answer, is_correct)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `, [
        runDatabaseId,
        attemptId,
        questionIndex,
        formKey,
        question.verbeId || null,
        question.tenseId || null,
        question.personId || null,
        question.infinitif || "",
        question.temps || "",
        question.mode || "",
        JSON.stringify(question),
        answer
      ]);
      if (attemptInsert.insertId && diagnostics.length) {
        await connection.query(`
          INSERT IGNORE INTO learner_attempt_error_tags
            (attempt_id, error_type_code, is_primary, confidence, is_initial,
             detector_version, evidence_json)
          VALUES ${diagnostics.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ")}
        `, diagnostics.flatMap((diagnostic) => [
          attemptInsert.insertId,
          diagnostic.code,
          diagnostic.primary ? 1 : 0,
          diagnostic.confidence,
          attemptNumber === 1 ? 1 : 0,
          LEARNER_ERROR_DETECTOR_VERSION,
          diagnostic.evidence ? JSON.stringify(diagnostic.evidence) : null
        ]));
      }
    }
    if (recorded) {
      if (attemptNumber === 1) {
        const applicableTypes = applicableLearnerErrorTypes(question);
        const errorTypes = new Set(diagnostics.map((diagnostic) => diagnostic.code));
        if (applicableTypes.length) {
          await connection.query(`
            INSERT INTO learner_skill_daily_stats
              (account_id, stat_date, error_type_code, opportunities, errors)
            VALUES ${applicableTypes.map(() => "(?, CURRENT_DATE, ?, 1, ?)").join(", ")}
            ON DUPLICATE KEY UPDATE
              opportunities=opportunities + VALUES(opportunities),
              errors=errors + VALUES(errors)
          `, applicableTypes.flatMap((code) => [
            learner.id,
            code,
            errorTypes.has(code) ? 1 : 0
          ]));
        }
      }
      await connection.execute(`
        UPDATE learner_challenge_runs runs
        SET last_answered_at=CURRENT_TIMESTAMP,
            completed_at=IF(
              (
                SELECT COUNT(*)
                FROM learner_run_questions completed_questions
                WHERE completed_questions.run_id=runs.id
                  AND completed_questions.question_index < GREATEST(
                    1,
                    COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(
                      runs.challenge_config_json,
                      '$.questionCount'
                    )) AS UNSIGNED), 1)
                  )
                  AND completed_questions.result_status IN ('correct', 'incorrect')
              ) >= GREATEST(
                1,
                COALESCE(CAST(JSON_UNQUOTE(JSON_EXTRACT(
                  runs.challenge_config_json,
                  '$.questionCount'
                )) AS UNSIGNED), 1)
              ),
              COALESCE(completed_at, CURRENT_TIMESTAMP),
              NULL
            ),
            correct_count=correct_count + ?,
            incorrect_count=incorrect_count + ?
        WHERE id=?
      `, [
        correct ? 1 : 0,
        correct ? 0 : 1,
        runDatabaseId
      ]);
    }
    await connection.commit();
    return { recorded, challengeFingerprint: fingerprint };
  } catch (error) {
    await connection.rollback().catch(() => {
    });
    throw error;
  } finally {
    connection.release();
  }
});

export { attempt_post as default };
//# sourceMappingURL=attempt.post.mjs.map

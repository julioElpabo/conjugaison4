import { d as defineEventHandler, s as setResponseHeader, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireLearnerDataSubject } from '../../../_/learner-data-subject.mjs';
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
import '../../../_/session.mjs';
import '../../../_/learner-session.mjs';

const challengeTrainings_get = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await requireLearnerDataSubject(event);
  const database = useDatabase();
  const [rows] = await database.execute(`
    SELECT grouped.challenge_fingerprint AS fingerprint,
           MAX(grouped.challenge_label) AS label,
           MAX(COALESCE(grouped.completed_at, grouped.last_answered_at)) AS lastTrainedAt,
           COUNT(*) AS sessionCount,
           (
             SELECT latest.correct_count
             FROM learner_challenge_runs latest
             WHERE latest.account_id=grouped.account_id
               AND latest.challenge_fingerprint=grouped.challenge_fingerprint
               AND latest.is_review=0
               AND latest.last_answered_at IS NOT NULL
               AND (latest.correct_count + latest.incorrect_count) > 0
             ORDER BY COALESCE(latest.completed_at, latest.last_answered_at) DESC, latest.id DESC
             LIMIT 1
           ) AS latestCorrectCount,
           (
             SELECT latest.incorrect_count
             FROM learner_challenge_runs latest
             WHERE latest.account_id=grouped.account_id
               AND latest.challenge_fingerprint=grouped.challenge_fingerprint
               AND latest.is_review=0
               AND latest.last_answered_at IS NOT NULL
               AND (latest.correct_count + latest.incorrect_count) > 0
             ORDER BY COALESCE(latest.completed_at, latest.last_answered_at) DESC, latest.id DESC
             LIMIT 1
           ) AS latestIncorrectCount
    FROM learner_challenge_runs grouped
    WHERE grouped.account_id=?
      AND grouped.is_review=0
      AND grouped.last_answered_at IS NOT NULL
      AND (grouped.correct_count + grouped.incorrect_count) > 0
    GROUP BY grouped.account_id, grouped.challenge_fingerprint
    ORDER BY lastTrainedAt DESC
    LIMIT 500
  `, [learner.id]);
  return {
    trainings: rows.map((row) => {
      const correctCount = Number(row.latestCorrectCount);
      const incorrectCount = Number(row.latestIncorrectCount);
      const totalCount = correctCount + incorrectCount;
      return {
        fingerprint: row.fingerprint,
        label: row.label,
        lastTrainedAt: row.lastTrainedAt,
        sessionCount: Number(row.sessionCount),
        latestSuccessPercent: totalCount ? Math.round(correctCount / totalCount * 100) : 0
      };
    })
  };
});

export { challengeTrainings_get as default };
//# sourceMappingURL=challenge-trainings.get.mjs.map

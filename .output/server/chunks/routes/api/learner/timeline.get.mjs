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

const timeline_get = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await getLearnerSession(event);
  if (!learner) throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  const database = useDatabase();
  const [[formRows], [loginRows]] = await Promise.all([
    database.execute(`
      SELECT f.id, f.last_answered_at AS occurredAt,
             f.is_mastered AS mastered, f.attempt_count AS attemptCount,
             f.incorrect_count AS incorrectCount,
             f.infinitive, f.tense_label AS tense, f.mode_label AS mode,
             r.challenge_fingerprint AS fingerprint,
             r.challenge_label AS challengeLabel
      FROM learner_run_forms f
      INNER JOIN learner_challenge_runs r ON r.id=f.run_id
      WHERE r.account_id=?
      ORDER BY f.last_answered_at DESC, f.id DESC
      LIMIT 500
    `, [learner.id]),
    database.execute(`
      SELECT id, occurred_at AS occurredAt, event_type AS eventType
      FROM learner_login_events
      WHERE account_id=?
      ORDER BY occurred_at DESC, id DESC
      LIMIT 100
    `, [learner.id])
  ]);
  const events = [
    ...formRows.map((row) => ({
      id: `form-${row.id}`,
      type: "answer",
      occurredAt: row.occurredAt,
      correct: Boolean(row.mastered),
      attemptCount: Number(row.attemptCount),
      incorrectCount: Number(row.incorrectCount),
      infinitive: row.infinitive,
      tense: row.tense,
      mode: row.mode,
      challengeFingerprint: row.fingerprint,
      challengeLabel: row.challengeLabel
    })),
    ...loginRows.map((row) => ({
      id: `login-${row.id}`,
      type: "login",
      occurredAt: row.occurredAt,
      eventType: row.eventType
    }))
  ].sort((left, right) => new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime());
  const challengeMap = /* @__PURE__ */ new Map();
  for (const row of formRows) {
    if (!challengeMap.has(row.fingerprint)) challengeMap.set(row.fingerprint, row.challengeLabel);
  }
  return {
    events,
    challenges: [...challengeMap].map(([fingerprint, label]) => ({ fingerprint, label }))
  };
});

export { timeline_get as default };
//# sourceMappingURL=timeline.get.mjs.map

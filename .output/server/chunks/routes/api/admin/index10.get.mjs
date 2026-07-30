import { d as defineEventHandler, q as setResponseHeader, i as getQuery, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../_/session.mjs';
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

const index_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  setResponseHeader(event, "Cache-Control", "no-store");
  const query = getQuery(event);
  const offset = Math.min(1e6, Math.max(0, Number(query.offset) || 0));
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
  const database = useDatabase();
  const [[users], [[count]]] = await Promise.all([
    database.execute(`
      SELECT a.id, a.username, a.status, a.created_at AS createdAt,
             a.last_login_at AS lastLoginAt,
             MAX(r.last_answered_at) AS lastActivityAt,
             COUNT(CASE WHEN r.last_answered_at IS NOT NULL THEN 1 END) AS exerciseCount,
             COALESCE(SUM(r.correct_count), 0) AS correctCount,
             COALESCE(SUM(r.incorrect_count), 0) AS incorrectCount
      FROM learner_accounts a
      LEFT JOIN learner_challenge_runs r ON r.account_id=a.id
      WHERE a.deleted_at IS NULL
      GROUP BY a.id, a.username, a.status, a.created_at, a.last_login_at
      ORDER BY exerciseCount DESC, lastActivityAt DESC, a.id ASC
      LIMIT ${limit + 1} OFFSET ${offset}
    `),
    database.execute(`
      SELECT COUNT(*) AS total
      FROM learner_accounts
      WHERE deleted_at IS NULL
    `)
  ]);
  const page = users.slice(0, limit).map((user) => ({
    id: Number(user.id),
    username: user.username,
    status: user.status,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    lastActivityAt: user.lastActivityAt,
    exerciseCount: Number(user.exerciseCount),
    correctCount: Number(user.correctCount),
    incorrectCount: Number(user.incorrectCount)
  }));
  return {
    users: page,
    total: Number((count == null ? void 0 : count.total) || 0),
    nextOffset: offset + page.length,
    hasMore: users.length > limit
  };
});

export { index_get as default };
//# sourceMappingURL=index10.get.mjs.map

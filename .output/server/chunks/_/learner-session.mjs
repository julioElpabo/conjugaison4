import { w as getCookie, u as useDatabase, v as deleteCookie, t as setCookie, J as getRequestURL } from '../nitro/nitro.mjs';
import { randomBytes, createHash } from 'node:crypto';

const COOKIE_NAME = "learner_session";
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60;
function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}
async function createLearnerSession(event, accountId, sessionVersion) {
  const token = randomBytes(32).toString("base64url");
  await useDatabase().execute(`
    INSERT INTO learner_sessions (account_id, token_hash, session_version, expires_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP + INTERVAL ? SECOND)
  `, [accountId, tokenHash(token), sessionVersion, SESSION_DURATION_SECONDS]);
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: getRequestURL(event).protocol === "https:",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS
  });
}
async function getLearnerSession(event, activate = false) {
  const token = getCookie(event, COOKIE_NAME);
  if (!token || !/^[A-Za-z0-9_-]{40,80}$/u.test(token)) return null;
  const database = useDatabase();
  const [[row]] = await database.execute(`
    SELECT s.id AS sessionId, a.id AS accountId, a.username, a.status,
           a.session_version AS sessionVersion
    FROM learner_sessions s
    JOIN learner_accounts a ON a.id = s.account_id
    WHERE s.token_hash = ?
      AND s.expires_at > CURRENT_TIMESTAMP
      AND s.session_version = a.session_version
      AND a.deleted_at IS NULL
      AND a.status IN ('pending', 'active')
    LIMIT 1
  `, [tokenHash(token)]);
  if (!row) {
    deleteCookie(event, COOKIE_NAME, { path: "/" });
    return null;
  }
  await database.execute(
    "UPDATE learner_sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?",
    [row.sessionId]
  );
  if (activate && row.status === "pending") {
    await database.execute(`
      UPDATE learner_accounts
      SET status = 'active', activated_at = COALESCE(activated_at, CURRENT_TIMESTAMP),
          last_login_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [row.accountId]);
    row.status = "active";
  }
  return { id: row.accountId, username: row.username, status: row.status };
}
async function clearLearnerSession(event) {
  const token = getCookie(event, COOKIE_NAME);
  if (token) {
    await useDatabase().execute(
      "DELETE FROM learner_sessions WHERE token_hash = ?",
      [tokenHash(token)]
    );
  }
  deleteCookie(event, COOKIE_NAME, { path: "/" });
}

export { createLearnerSession as a, clearLearnerSession as c, getLearnerSession as g };
//# sourceMappingURL=learner-session.mjs.map

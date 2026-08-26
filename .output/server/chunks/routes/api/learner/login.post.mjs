import { d as defineEventHandler, s as setResponseHeader, y as normalizeLocale, c as createError, u as useDatabase } from '../../../nitro/nitro.mjs';
import bcrypt from 'bcryptjs';
import { a as assertLearnerRateLimit, l as learnerClientIp } from '../../../_/learner-rate-limit.mjs';
import { n as normalizeLearnerUsername } from '../../../_/learner-username.mjs';
import { a as createLearnerSession } from '../../../_/learner-session.mjs';
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

const DUMMY_PASSWORD_HASH = "$2b$12$ty1Uz4EKY7VWSotpC21BLenXpmauqgEttD16EEzo2wp8oeuu2aawq";
const login_post = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const body = await readLimitedJsonBody(event, 8 * 1024);
  const username = normalizeLearnerUsername(body.username);
  const password = typeof body.password === "string" ? body.password : "";
  const interfaceLocale = normalizeLocale(body.interfaceLocale, "fr");
  if (!username || username.length > 80 || !password || password.length > 200) {
    throw createError({ statusCode: 400, statusMessage: "Identifiants invalides" });
  }
  await Promise.all([
    assertLearnerRateLimit(event, {
      bucket: "login-ip",
      identity: learnerClientIp(event),
      maximum: 30,
      windowSeconds: 10 * 60
    }),
    assertLearnerRateLimit(event, {
      bucket: "login-identity",
      identity: `${learnerClientIp(event)}:${username}`,
      maximum: 10,
      windowSeconds: 10 * 60
    })
  ]);
  const [[account]] = await useDatabase().execute(`
    SELECT id, username, password_hash AS passwordHash,
           session_version AS sessionVersion, status
    FROM learner_accounts
    WHERE username_normalized = ? AND deleted_at IS NULL
    LIMIT 1
  `, [username]);
  const valid = await bcrypt.compare(password, (account == null ? void 0 : account.passwordHash) || DUMMY_PASSWORD_HASH);
  if (!account || !valid || !["pending", "active"].includes(account.status)) {
    throw createError({ statusCode: 401, statusMessage: "Pseudonyme ou mot de passe incorrect" });
  }
  await useDatabase().execute(`
    UPDATE learner_accounts
    SET status = 'active',
        activated_at = COALESCE(activated_at, CURRENT_TIMESTAMP),
        last_login_at = CURRENT_TIMESTAMP,
        deletion_scheduled_at = NULL
    WHERE id = ?
  `, [account.id]);
  await useDatabase().execute(
    "INSERT INTO learner_login_events (account_id, event_type) VALUES (?, 'login')",
    [account.id]
  );
  await useDatabase().execute(`
    INSERT INTO learner_preferences (account_id, interface_locale, color_theme)
    VALUES (?, ?, 'light')
    ON DUPLICATE KEY UPDATE interface_locale=VALUES(interface_locale)
  `, [account.id, interfaceLocale]);
  await createLearnerSession(event, account.id, account.sessionVersion);
  return {
    ok: true,
    username: account.username,
    user: { id: account.id, username: account.username }
  };
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map

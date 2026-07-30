import { u as useDatabase, A as getRequestIP, q as setResponseHeader, c as createError, d as defineEventHandler, r as readBody, n as normalizeLocale } from '../../../nitro/nitro.mjs';
import { c as createAdminSession } from '../../../_/session.mjs';
import bcrypt from 'bcryptjs';
import { createHash } from 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1e3;
const BLOCK_MS = 15 * 60 * 1e3;
function hashKey(value) {
  return createHash("sha256").update(value).digest("hex");
}
function requestKeys(event, email) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  return [
    hashKey(`ip:${ip}`),
    hashKey(`email:${email.trim().toLocaleLowerCase("fr-CH")}`)
  ];
}
function timestamp(value) {
  return value ? new Date(value).getTime() : 0;
}
function tooManyAttempts(event, retryAt) {
  const retryAfter = Math.max(1, Math.ceil((retryAt - Date.now()) / 1e3));
  setResponseHeader(event, "Retry-After", retryAfter);
  throw createError({
    statusCode: 429,
    statusMessage: "Trop de tentatives de connexion. R\xE9essayez plus tard."
  });
}
async function assertAdminLoginAllowed(event, email) {
  const keys = requestKeys(event, email);
  const [rows] = await useDatabase().execute(`
    SELECT key_hash AS keyHash, failure_count AS failureCount,
           window_started_at AS windowStartedAt, blocked_until AS blockedUntil
    FROM admin_login_rate_limits
    WHERE key_hash IN (?, ?)
  `, keys);
  const blockedUntil = rows.reduce((latest, row) => Math.max(latest, timestamp(row.blockedUntil)), 0);
  if (blockedUntil > Date.now()) tooManyAttempts(event, blockedUntil);
}
async function recordKeyFailure(connection, keyHash, now) {
  const [[row]] = await connection.execute(`
    SELECT key_hash AS keyHash, failure_count AS failureCount,
           window_started_at AS windowStartedAt, blocked_until AS blockedUntil
    FROM admin_login_rate_limits
    WHERE key_hash = ?
    FOR UPDATE
  `, [keyHash]);
  const withinWindow = row && timestamp(row.windowStartedAt) > now - WINDOW_MS;
  const failureCount = withinWindow ? Number(row.failureCount) + 1 : 1;
  const blockedUntil = failureCount >= MAX_FAILURES ? new Date(now + BLOCK_MS) : null;
  const windowStartedAt = withinWindow ? new Date(row.windowStartedAt) : new Date(now);
  await connection.execute(`
    INSERT INTO admin_login_rate_limits
      (key_hash, failure_count, window_started_at, blocked_until, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
      failure_count=VALUES(failure_count),
      window_started_at=VALUES(window_started_at),
      blocked_until=VALUES(blocked_until),
      updated_at=CURRENT_TIMESTAMP
  `, [keyHash, failureCount, windowStartedAt, blockedUntil]);
}
async function recordAdminLoginFailure(event, email) {
  const keys = requestKeys(event, email);
  const connection = await useDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const now = Date.now();
    for (const key of [...keys].sort()) await recordKeyFailure(connection, key, now);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
async function clearAdminLoginFailures(event, email) {
  const keys = requestKeys(event, email);
  await useDatabase().execute(
    "DELETE FROM admin_login_rate_limits WHERE key_hash IN (?, ?)",
    keys
  );
}

const DUMMY_PASSWORD_HASH = "$2b$12$ty1Uz4EKY7VWSotpC21BLenXpmauqgEttD16EEzo2wp8oeuu2aawq";
const login_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const email = typeof (body == null ? void 0 : body.email) === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof (body == null ? void 0 : body.password) === "string" ? body.password : "";
  if (!email || !password || email.length > 254 || password.length > 200) {
    throw createError({ statusCode: 400, statusMessage: "Identifiants invalides" });
  }
  await assertAdminLoginAllowed(event, email);
  const [rows] = await useDatabase().execute(`
    SELECT id, prenom, nom, email, username, password, privilege_id,
           interface_locale, explanation_locale
    FROM users
    WHERE LOWER(email) = ?
    LIMIT 1
  `, [email]);
  const row = rows[0];
  const compatibleHash = (_a = row == null ? void 0 : row.password.replace(/^\$2y\$/, "$2b$")) != null ? _a : DUMMY_PASSWORD_HASH;
  const passwordIsValid = await bcrypt.compare(password, compatibleHash);
  if (!row || !passwordIsValid || row.privilege_id !== 1) {
    await recordAdminLoginFailure(event, email);
    throw createError({ statusCode: 401, statusMessage: "Email ou mot de passe incorrect" });
  }
  await clearAdminLoginFailures(event, email);
  const user = {
    id: row.id,
    prenom: row.prenom,
    nom: row.nom,
    email: row.email,
    username: row.username,
    privilegeId: row.privilege_id,
    interfaceLocale: normalizeLocale(row.interface_locale),
    explanationLocale: normalizeLocale(row.explanation_locale)
  };
  createAdminSession(event, user);
  return { user };
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map

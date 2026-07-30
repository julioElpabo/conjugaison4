import { m as useRuntimeConfig, t as getRequestURL, c as createError, d as defineEventHandler, q as setResponseHeader, n as normalizeLocale, u as useDatabase, _ as CURRENT_PRIVACY_NOTICE_VERSION } from '../../../nitro/nitro.mjs';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { n as normalizeLearnerUsername, i as isGeneratedLearnerUsername, a as availableLearnerUsername } from '../../../_/learner-username.mjs';
import { a as assertLearnerRateLimit, l as learnerClientIp } from '../../../_/learner-rate-limit.mjs';
import { r as requireLearnerRegistrationFlow, b as assertUsernameProof, d as clearLearnerRegistrationFlow, a as createUsernameProof } from '../../../_/learner-registration.mjs';
import { a as createLearnerSession } from '../../../_/learner-session.mjs';
import { r as readLimitedJsonBody } from '../../../_/limited-json-body.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

async function assertTurnstile(event, token, expectedAction) {
  const secret = useRuntimeConfig().turnstileSecretKey;
  const expectedHostname = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).hostname;
  if (typeof secret !== "string" || !secret.trim()) {
    if (["localhost", "127.0.0.1", "::1"].includes(expectedHostname)) return;
    throw createError({ statusCode: 503, statusMessage: "Protection antibot indisponible" });
  }
  const responseToken = typeof token === "string" ? token.trim() : "";
  if (!responseToken || responseToken.length > 2048) {
    throw createError({ statusCode: 400, statusMessage: "V\xE9rification antibot manquante" });
  }
  const result = await $fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: {
        secret,
        response: responseToken
      }
    }
  ).catch(() => null);
  if (!(result == null ? void 0 : result.success) || result.hostname !== expectedHostname || result.action && result.action !== expectedAction) {
    throw createError({ statusCode: 400, statusMessage: "V\xE9rification antibot refus\xE9e" });
  }
}

function recoveryCode() {
  var _a;
  const raw = randomBytes(12).toString("hex").toUpperCase();
  return ((_a = raw.match(/.{1,4}/gu)) == null ? void 0 : _a.join("-")) || raw;
}
const register_post = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const flow = requireLearnerRegistrationFlow(event, true);
  const body = await readLimitedJsonBody(event, 8 * 1024);
  const username = normalizeLearnerUsername(body.username);
  const password = typeof body.password === "string" ? body.password : "";
  const honeypot = typeof body.website === "string" ? body.website.trim() : "";
  const interfaceLocale = normalizeLocale(body.interfaceLocale, "fr");
  await Promise.all([
    assertLearnerRateLimit(event, {
      bucket: "register-flow",
      identity: flow.id,
      maximum: 3,
      windowSeconds: 60 * 60
    }),
    assertLearnerRateLimit(event, {
      bucket: "register-ip",
      identity: learnerClientIp(event),
      maximum: 50,
      windowSeconds: 24 * 60 * 60
    })
  ]);
  if (honeypot || !isGeneratedLearnerUsername(username) || password.length < 10 || password.length > 200 || body.privacyAccepted !== true) {
    throw createError({ statusCode: 400, statusMessage: "Donn\xE9es d\u2019inscription invalides" });
  }
  assertUsernameProof(flow, username, body.usernameProof);
  await assertTurnstile(event, body.turnstileToken, "learner_register");
  const code = recoveryCode();
  const [passwordHash, recoveryCodeHash] = await Promise.all([
    bcrypt.hash(password, 12),
    bcrypt.hash(code, 12)
  ]);
  const database = useDatabase();
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(`
      INSERT INTO learner_accounts
        (username, username_normalized, password_hash, recovery_code_hash, status,
         privacy_notice_version, deletion_scheduled_at)
      VALUES (?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP + INTERVAL 48 HOUR)
    `, [username, username, passwordHash, recoveryCodeHash, CURRENT_PRIVACY_NOTICE_VERSION]);
    await connection.execute(
      "INSERT INTO learner_login_events (account_id, event_type) VALUES (?, 'registration')",
      [result.insertId]
    );
    await connection.execute(
      "INSERT INTO learner_preferences (account_id, interface_locale, color_theme) VALUES (?, ?, 'light')",
      [result.insertId, interfaceLocale]
    );
    await connection.commit();
    await createLearnerSession(event, result.insertId, 1);
    clearLearnerRegistrationFlow(event);
    return {
      ok: true,
      username,
      recoveryCode: code,
      user: { id: result.insertId, username }
    };
  } catch (error) {
    await connection.rollback().catch(() => {
    });
    if (error && typeof error === "object" && "errno" in error && Number(error.errno) === 1062) {
      const replacement = await availableLearnerUsername(database, [username]);
      throw createError({
        statusCode: 409,
        statusMessage: "Ce pseudonyme vient d\u2019\xEAtre attribu\xE9",
        data: {
          username: replacement,
          proof: createUsernameProof(flow, replacement)
        }
      });
    }
    throw error;
  } finally {
    connection.release();
  }
});

export { register_post as default };
//# sourceMappingURL=register.post.mjs.map

import { m as getCookie, c as createError, k as deleteCookie, j as setCookie, z as getRequestURL, n as useRuntimeConfig } from '../nitro/nitro.mjs';
import { randomBytes, timingSafeEqual, createHmac } from 'node:crypto';

const COOKIE_NAME = "learner_registration";
const FLOW_DURATION_SECONDS = 30 * 60;
const MINIMUM_FORM_AGE_MS = 1500;
function secret() {
  const configured = useRuntimeConfig().learnerSessionSecret;
  if (typeof configured === "string" && configured.length >= 32) return configured;
  {
    throw new Error("LEARNER_SESSION_SECRET doit contenir au moins 32 caract\xE8res en production");
  }
}
function signature(value) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}
function safelyEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
function encode(flow) {
  const payload = Buffer.from(JSON.stringify(flow)).toString("base64url");
  return `${payload}.${signature(payload)}`;
}
function decode(value) {
  if (!value) return null;
  const [payload, receivedSignature, extra] = value.split(".");
  if (!payload || !receivedSignature || extra || !safelyEqual(signature(payload), receivedSignature)) return null;
  try {
    const flow = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof flow.id !== "string" || !/^[a-f0-9]{32}$/u.test(flow.id) || !Number.isFinite(flow.issuedAt) || !Number.isFinite(flow.expiresAt) || flow.expiresAt <= Date.now()) return null;
    return flow;
  } catch {
    return null;
  }
}
function createLearnerRegistrationFlow(event) {
  const now = Date.now();
  const flow = {
    id: randomBytes(16).toString("hex"),
    issuedAt: now,
    expiresAt: now + FLOW_DURATION_SECONDS * 1e3
  };
  setCookie(event, COOKIE_NAME, encode(flow), {
    httpOnly: true,
    sameSite: "lax",
    secure: getRequestURL(event).protocol === "https:",
    path: "/",
    maxAge: FLOW_DURATION_SECONDS
  });
  return flow;
}
function requireLearnerRegistrationFlow(event, minimumAge = false) {
  const flow = decode(getCookie(event, COOKIE_NAME));
  if (!flow) {
    throw createError({ statusCode: 403, statusMessage: "Parcours d\u2019inscription expir\xE9" });
  }
  if (minimumAge && Date.now() - flow.issuedAt < MINIMUM_FORM_AGE_MS) {
    throw createError({ statusCode: 400, statusMessage: "Formulaire envoy\xE9 trop rapidement" });
  }
  return flow;
}
function clearLearnerRegistrationFlow(event) {
  deleteCookie(event, COOKIE_NAME, { path: "/" });
}
function createUsernameProof(flow, username) {
  return signature(`username:${flow.id}:${username}`);
}
function assertUsernameProof(flow, username, proof) {
  const received = typeof proof === "string" ? proof : "";
  if (!received || !safelyEqual(createUsernameProof(flow, username), received)) {
    throw createError({ statusCode: 400, statusMessage: "Proposition de pseudonyme invalide" });
  }
}

export { assertUsernameProof as a, createUsernameProof as b, clearLearnerRegistrationFlow as c, createLearnerRegistrationFlow as d, requireLearnerRegistrationFlow as r };
//# sourceMappingURL=learner-registration.mjs.map

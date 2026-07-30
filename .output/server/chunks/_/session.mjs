import { c as createError, s as setCookie, j as deleteCookie, k as getCookie, m as useRuntimeConfig } from '../nitro/nitro.mjs';
import { timingSafeEqual, createHmac } from 'node:crypto';

const COOKIE_NAME = "conjugaison_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;
function getSecret() {
  const secret = useRuntimeConfig().sessionSecret;
  if (typeof secret !== "string" || secret.length < 4) {
    throw new Error("SESSION_SECRET doit \xEAtre configur\xE9 pour utiliser l\u2019administration");
  }
  if (secret.length < 32) {
    throw new Error("SESSION_SECRET doit contenir au moins 32 caract\xE8res en production");
  }
  return secret;
}
function sign(encodedPayload) {
  return createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");
}
function encode(payload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload)}`;
}
function decode(token) {
  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra) {
    return null;
  }
  const expected = Buffer.from(sign(encodedPayload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!Number.isInteger(payload.id) || payload.expiresAt <= Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
function createAdminSession(event, user) {
  const payload = {
    ...user,
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1e3
  };
  setCookie(event, COOKIE_NAME, encode(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS
  });
  if (user.interfaceLocale) {
    setCookie(event, "interface_locale", user.interfaceLocale, { sameSite: "lax", path: "/", maxAge: 365 * 24 * 60 * 60 });
  }
  if (user.explanationLocale) {
    setCookie(event, "explanation_locale", user.explanationLocale, { sameSite: "lax", path: "/", maxAge: 365 * 24 * 60 * 60 });
  }
}
function clearAdminSession(event) {
  deleteCookie(event, COOKIE_NAME, { path: "/" });
}
function getAdminSession(event) {
  const token = getCookie(event, COOKIE_NAME);
  if (!token) {
    return null;
  }
  const payload = decode(token);
  if (!payload) {
    return null;
  }
  const { expiresAt: _expiresAt, ...user } = payload;
  return user;
}
function requireAdministrator(event) {
  const user = getAdminSession(event);
  if (!user || user.privilegeId !== 1) {
    throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  }
  return user;
}

export { clearAdminSession as a, createAdminSession as c, getAdminSession as g, requireAdministrator as r };
//# sourceMappingURL=session.mjs.map

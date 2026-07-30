import { m as useRuntimeConfig, y as getRequestURL, c as createError } from '../nitro/nitro.mjs';

async function assertTurnstile(event, token, expectedAction, options = {}) {
  const config = useRuntimeConfig();
  const secret = config.turnstileSecretKey;
  const siteKey = config.public.turnstileSiteKey;
  const expectedHostname = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).hostname;
  if (typeof secret !== "string" || !secret.trim()) {
    if (["localhost", "127.0.0.1", "::1"].includes(expectedHostname)) return;
    if (options.optionalWhenUnconfigured && !String(siteKey || "").trim()) return;
    throw createError({ statusCode: 503, statusMessage: "Protection antibot indisponible" });
  }
  if (!String(siteKey || "").trim()) {
    throw createError({ statusCode: 503, statusMessage: "Protection antibot incompl\xE8te" });
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

export { assertTurnstile as a };
//# sourceMappingURL=turnstile.mjs.map

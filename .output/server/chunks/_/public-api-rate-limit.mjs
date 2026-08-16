import { u as useDatabase, s as setResponseHeader, c as createError, E as getRequestIP } from '../nitro/nitro.mjs';
import { createHash } from 'node:crypto';

const PUBLIC_RATE_LIMITS = {
  telemetry: { bucket: "telemetry", maximum: 180, windowSeconds: 60 },
  questionnaire: { bucket: "questionnaire", maximum: 60, windowSeconds: 60 },
  tenseExamples: { bucket: "tense-examples", maximum: 30, windowSeconds: 60 },
  challengeCreate: { bucket: "challenge-create", maximum: 30, windowSeconds: 60 * 60 },
  challengeRead: { bucket: "challenge-read", maximum: 180, windowSeconds: 60 },
  summaryCreate: { bucket: "summary-create", maximum: 30, windowSeconds: 60 * 60 },
  summaryRead: { bucket: "summary-read", maximum: 180, windowSeconds: 60 },
  feedback: { bucket: "feedback", maximum: 12, windowSeconds: 10 * 60 },
  automaticHelpError: { bucket: "automatic-help-error", maximum: 30, windowSeconds: 10 * 60 },
  speech: { bucket: "speech", maximum: 40, windowSeconds: 60 }
};
function clientKey(event, bucket) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  return createHash("sha256").update(`${bucket}:${ip}`).digest("hex");
}
async function assertPublicApiRateLimit(event, limit) {
  const now = /* @__PURE__ */ new Date();
  const boundary = new Date(now.getTime() - limit.windowSeconds * 1e3);
  const keyHash = clientKey(event, limit.bucket);
  const database = useDatabase();
  await database.execute(`
    INSERT INTO public_api_rate_limits
      (key_hash, bucket, request_count, window_started_at, updated_at)
    VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
      request_count=IF(window_started_at < ?, 1, request_count + 1),
      window_started_at=IF(window_started_at < ?, VALUES(window_started_at), window_started_at),
      updated_at=CURRENT_TIMESTAMP
  `, [keyHash, limit.bucket, now, boundary, boundary]);
  const [[row]] = await database.execute(`
    SELECT request_count AS requestCount, window_started_at AS windowStartedAt
    FROM public_api_rate_limits
    WHERE key_hash = ?
  `, [keyHash]);
  const count = Number((row == null ? void 0 : row.requestCount) || 0);
  const startedAt = row ? new Date(row.windowStartedAt).getTime() : now.getTime();
  const resetAt = startedAt + limit.windowSeconds * 1e3;
  const remaining = Math.max(0, limit.maximum - count);
  setResponseHeader(event, "RateLimit-Limit", limit.maximum);
  setResponseHeader(event, "RateLimit-Remaining", remaining);
  setResponseHeader(event, "RateLimit-Reset", Math.max(1, Math.ceil((resetAt - Date.now()) / 1e3)));
  if (count <= limit.maximum) return;
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1e3));
  setResponseHeader(event, "Retry-After", retryAfter);
  throw createError({
    statusCode: 429,
    statusMessage: "Too Many Requests",
    message: "Trop de requ\xEAtes. R\xE9essayez dans quelques instants.",
    data: {
      rateLimitBucket: limit.bucket,
      retryAfter,
      maximum: limit.maximum,
      windowSeconds: limit.windowSeconds
    }
  });
}

export { PUBLIC_RATE_LIMITS as P, assertPublicApiRateLimit as a };
//# sourceMappingURL=public-api-rate-limit.mjs.map

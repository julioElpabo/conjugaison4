import { u as useDatabase, q as setResponseHeader, c as createError, w as getRequestIP } from '../nitro/nitro.mjs';
import { createHash } from 'node:crypto';

async function assertLearnerRateLimit(event, limit) {
  const now = /* @__PURE__ */ new Date();
  const boundary = new Date(now.getTime() - limit.windowSeconds * 1e3);
  const keyHash = createHash("sha256").update(`${limit.bucket}:${limit.identity}`).digest("hex");
  const database = useDatabase();
  await database.execute(`
    INSERT INTO learner_registration_rate_limits
      (key_hash, bucket, request_count, window_started_at, updated_at)
    VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
      request_count=IF(window_started_at < ?, 1, request_count + 1),
      window_started_at=IF(window_started_at < ?, VALUES(window_started_at), window_started_at),
      updated_at=CURRENT_TIMESTAMP
  `, [keyHash, limit.bucket, now, boundary, boundary]);
  const [[row]] = await database.execute(`
    SELECT request_count AS requestCount, window_started_at AS windowStartedAt
    FROM learner_registration_rate_limits WHERE key_hash = ?
  `, [keyHash]);
  const count = Number((row == null ? void 0 : row.requestCount) || 0);
  if (count <= limit.maximum) return;
  const startedAt = row ? new Date(row.windowStartedAt).getTime() : now.getTime();
  const retryAfter = Math.max(1, Math.ceil((startedAt + limit.windowSeconds * 1e3 - Date.now()) / 1e3));
  setResponseHeader(event, "Retry-After", retryAfter);
  throw createError({
    statusCode: 429,
    statusMessage: "Trop de tentatives",
    message: "Trop de tentatives. R\xE9essayez plus tard."
  });
}
function learnerClientIp(event) {
  return getRequestIP(event, { xForwardedFor: true }) || "unknown";
}

export { assertLearnerRateLimit as a, learnerClientIp as l };
//# sourceMappingURL=learner-rate-limit.mjs.map

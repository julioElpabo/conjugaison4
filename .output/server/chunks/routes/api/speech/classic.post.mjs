import { d as defineEventHandler, c as createError, $ as synthesizeClassicSpeech, K as setResponseHeaders } from '../../../nitro/nitro.mjs';
import { r as readClassicSpeechToken } from '../../../_/classic-speech-token.mjs';
import { c as coachSpeechVoiceGender } from '../../../_/coach-speech-voice.mjs';
import { a as assertPublicApiRateLimit, P as PUBLIC_RATE_LIMITS } from '../../../_/public-api-rate-limit.mjs';
import { r as readLimitedJsonBody } from '../../../_/limited-json-body.mjs';
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

const classic_post = defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.speech);
  const body = await readLimitedJsonBody(event, 8 * 1024);
  if (typeof (body == null ? void 0 : body.token) !== "string" || body.token.length > 4096) throw createError({ statusCode: 400, statusMessage: "Jeton audio invalide" });
  const coachId = Number(body.coachId);
  if (body.coachId !== void 0 && (!Number.isInteger(coachId) || coachId <= 0)) {
    throw createError({ statusCode: 400, statusMessage: "Coach audio invalide" });
  }
  if (body.voiceGender !== void 0 && !["female", "male"].includes(String(body.voiceGender))) {
    throw createError({ statusCode: 400, statusMessage: "Voix audio invalide" });
  }
  try {
    const voiceGender = body.coachId !== void 0 ? await coachSpeechVoiceGender(coachId) : body.voiceGender;
    const result = await synthesizeClassicSpeech(
      readClassicSpeechToken(body.token),
      voiceGender
    );
    setResponseHeaders(event, {
      "Content-Type": result.mimeType,
      "Cache-Control": "private, max-age=3600",
      "X-Speech-Cache": result.cached ? "HIT" : "MISS",
      "X-Speech-Voice": result.voice
    });
    return result.audio;
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    console.error("[speech] Lecture Azure impossible.", error);
    throw createError({ statusCode: 503, statusMessage: "Lecture audio momentan\xE9ment indisponible" });
  }
});

export { classic_post as default };
//# sourceMappingURL=classic.post.mjs.map

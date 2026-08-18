import { d as defineEventHandler, c as createError, a8 as synthesizeClassicSpeech, R as setResponseHeaders } from '../../../nitro/nitro.mjs';
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
import 'web-push';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

const MAX_COACH_MESSAGE_LENGTH = 1200;
function decodeHtmlEntities(value) {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"'
  };
  return value.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);/giu, (entity, code) => {
    var _a;
    const point = code.startsWith("#x") ? Number.parseInt(code.slice(2), 16) : code.startsWith("#") ? Number.parseInt(code.slice(1), 10) : Number.NaN;
    if (Number.isInteger(point) && point >= 0 && point <= 1114111) return String.fromCodePoint(point);
    return (_a = named[code.toLocaleLowerCase("en")]) != null ? _a : entity;
  });
}
function normalizeCoachSpeechText(value) {
  return decodeHtmlEntities(value).replace(/<(?:br|hr)\s*\/?>/giu, ". ").replace(/<\/(?:p|div|li|blockquote|h[1-6])>/giu, ". ").replace(/<[^>]*>/gu, " ").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/gu, " ").replace(/\s+/gu, " ").replace(/(?:\.\s*){2,}/gu, ". ").trim();
}
const coach_post = defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.speech);
  const body = await readLimitedJsonBody(event, 8 * 1024);
  const coachId = Number(body.coachId);
  if (body.coachId !== void 0 && (!Number.isInteger(coachId) || coachId <= 0)) {
    throw createError({ statusCode: 400, statusMessage: "Coach audio invalide" });
  }
  if (body.voiceGender !== void 0 && !["female", "male"].includes(String(body.voiceGender))) {
    throw createError({ statusCode: 400, statusMessage: "Voix audio invalide" });
  }
  if (body.speechKind !== void 0 && !["definition", "help", "help-conjugation"].includes(String(body.speechKind))) {
    throw createError({ statusCode: 400, statusMessage: "Type de lecture audio invalide" });
  }
  const isDefinition = body.speechKind === "definition";
  const isHelp = body.speechKind === "help";
  const isHelpConjugation = body.speechKind === "help-conjugation";
  const text = typeof body.text === "string" ? normalizeCoachSpeechText(body.text) : "";
  const verb = typeof body.verb === "string" ? normalizeCoachSpeechText(body.verb) : "";
  const definition = typeof body.definition === "string" ? normalizeCoachSpeechText(body.definition) : "";
  const segments = Array.isArray(body.segments) ? body.segments.map((segment) => typeof segment === "string" ? normalizeCoachSpeechText(segment) : "") : [];
  if (isDefinition) {
    if (!verb || !definition || verb.length + definition.length > MAX_COACH_MESSAGE_LENGTH) {
      throw createError({ statusCode: 400, statusMessage: "D\xE9finition audio invalide" });
    }
  } else if (isHelpConjugation) {
    if (!segments.length || segments.length > 12 || segments.some((segment) => !segment) || segments.join(" ").length > MAX_COACH_MESSAGE_LENGTH) {
      throw createError({ statusCode: 400, statusMessage: "Conjugaison audio invalide" });
    }
  } else if (!text || text.length > MAX_COACH_MESSAGE_LENGTH) {
    throw createError({ statusCode: 400, statusMessage: "Message audio invalide" });
  }
  try {
    const voiceGender = body.coachId !== void 0 ? await coachSpeechVoiceGender(coachId) : body.voiceGender;
    const result = await synthesizeClassicSpeech(
      isDefinition ? { purpose: "definition", segments: [`Le verbe ${verb} veut dire :`, definition] } : isHelpConjugation ? { purpose: "help-conjugation", segments } : { purpose: isHelp ? "help-message" : "coach-message", segments: [text] },
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
    console.error("[speech] Lecture d\u2019un message du coach impossible.", error);
    throw createError({ statusCode: 503, statusMessage: "Lecture audio momentan\xE9ment indisponible" });
  }
});

export { coach_post as default, normalizeCoachSpeechText };
//# sourceMappingURL=coach.post.mjs.map

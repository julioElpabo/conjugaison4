import { d as defineEventHandler, c as createError } from '../../nitro/nitro.mjs';
import { g as generateQuestionnaire, Q as QuestionnaireSelectionError } from '../../_/questionnaire.mjs';
import { a as parseQuestionnaireRequest, P as PublicInputError } from '../../_/public-api-validation.mjs';
import { a as assertPublicApiRateLimit, P as PUBLIC_RATE_LIMITS } from '../../_/public-api-rate-limit.mjs';
import { r as readLimitedJsonBody } from '../../_/limited-json-body.mjs';
import { a as addClassicSpeechTokens } from '../../_/classic-speech-token.mjs';
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
import '../../_/radical-reference.mjs';
import '../../_/pronominal-formatter.mjs';
import '../../_/exercise-instructions.mjs';
import '../../_/passive-voice.mjs';
import '../../_/near-future.mjs';
import '../../_/challenge-defaults.mjs';

const index_post = defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.questionnaire);
  let request;
  try {
    request = parseQuestionnaireRequest(await readLimitedJsonBody(event, 32 * 1024));
  } catch (error) {
    if (error instanceof PublicInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message });
    }
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    throw createError({ statusCode: 400, statusMessage: "Corps JSON invalide" });
  }
  try {
    const questions = await generateQuestionnaire(request);
    if (questions.length === 0) {
      throw createError({
        statusCode: 422,
        statusMessage: "Aucune question disponible pour cette s\xE9lection"
      });
    }
    return request.exerciseKind === "conjugation" && request.learningSupportMode === "cif-fle" ? questions.map(addClassicSpeechTokens) : questions;
  } catch (error) {
    if (error instanceof QuestionnaireSelectionError) {
      throw createError({ statusCode: 400, statusMessage: error.message });
    }
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error("Impossible de g\xE9n\xE9rer le questionnaire", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Impossible de g\xE9n\xE9rer le questionnaire"
    });
  }
});

export { index_post as default };
//# sourceMappingURL=index3.post.mjs.map

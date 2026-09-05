import { y as useRuntimeConfig } from '../nitro/nitro.mjs';
import { createDecipheriv, randomBytes, createCipheriv, createHash } from 'node:crypto';

function tokenKey() {
  const config = useRuntimeConfig();
  const secret = String(
    process.env.CLASSIC_SPEECH_TOKEN_SECRET || process.env.SESSION_SECRET || process.env.AZURE_SPEECH_KEY || process.env.AZURE_SPEECH_KEY1 || process.env.DB_PASSWORD || config.classicSpeechTokenSecret || ""
  );
  if (secret.length < 16) throw new Error("Un secret serveur robuste est requis pour s\xE9curiser les jetons audio.");
  return createHash("sha256").update(`classic-speech:${secret}`).digest();
}
function createClassicSpeechToken(payload) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", tokenKey(), iv);
  const clear = Buffer.from(JSON.stringify({ ...payload, version: 1, expiresAt: Date.now() + 24 * 60 * 60 * 1e3 }));
  const encrypted = Buffer.concat([cipher.update(clear), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
}
function readClassicSpeechToken(token) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Jeton audio invalide.");
  const [iv, tag, encrypted] = parts.map((part) => Buffer.from(part, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", tokenKey(), iv);
  decipher.setAuthTag(tag);
  const payload = JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8"));
  if (payload.version !== 1 || !["question", "answer"].includes(payload.purpose) || !Array.isArray(payload.segments)) throw new Error("Jeton audio invalide.");
  if (payload.expiresAt < Date.now()) throw new Error("Jeton audio expir\xE9.");
  if (!payload.segments.length || payload.segments.some((segment) => typeof segment !== "string" || segment.length > 180)) throw new Error("Phrase audio invalide.");
  return payload;
}
function normalized(value) {
  return (value || "").trim().toLocaleLowerCase("fr");
}
function spokenTenseAndMode(tense, mode) {
  const tenseLabel = normalized(tense);
  const modeLabel = normalized(mode);
  const tensePrefix = /^[aeiouyhàâäéèêëîïôöùûü]/u.test(tenseLabel) ? `\xE0 l\u2019${tenseLabel}` : `au ${tenseLabel}`;
  const modePhrase = {
    indicatif: "de l\u2019indicatif",
    conditionnel: "du conditionnel",
    subjonctif: "du subjonctif",
    imp\u00E9ratif: "de l\u2019imp\xE9ratif",
    imperatif: "de l\u2019imp\xE9ratif",
    infinitif: "de l\u2019infinitif",
    participe: "du participe"
  };
  return [tensePrefix, modePhrase[modeLabel] || (modeLabel ? `du ${modeLabel}` : "")].filter(Boolean).join(" ");
}
function addClassicSpeechTokens(question) {
  const answer = question.reponsesPourCorrige[0] || question.reponses[0];
  if (!answer) return question;
  const questionSegments = question.infinitif && question.temps && question.mode ? [
    ...question.pronom ? [question.pronom] : [],
    question.infinitif,
    spokenTenseAndMode(question.temps, question.mode)
  ] : question.consigne ? [question.consigne] : [];
  return {
    ...question,
    speech: {
      ...questionSegments.length ? { questionToken: createClassicSpeechToken({ purpose: "question", segments: questionSegments }) } : {},
      answerToken: createClassicSpeechToken({ purpose: "answer", segments: answer.trim().split(/\s+/u) })
    }
  };
}

export { addClassicSpeechTokens as a, readClassicSpeechToken as r };
//# sourceMappingURL=classic-speech-token.mjs.map

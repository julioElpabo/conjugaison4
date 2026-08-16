import { u as useDatabase, c as createError } from '../nitro/nitro.mjs';

async function coachSpeechVoiceGender(coachId) {
  var _a;
  const [rows] = await useDatabase().execute(`
    SELECT gender
    FROM coaches
    WHERE id=? AND status='published'
    LIMIT 1
  `, [coachId]);
  const gender = (_a = rows[0]) == null ? void 0 : _a.gender;
  if (gender !== "female" && gender !== "male") {
    throw createError({ statusCode: 400, statusMessage: "Coach audio invalide" });
  }
  return gender;
}

export { coachSpeechVoiceGender as c };
//# sourceMappingURL=coach-speech-voice.mjs.map

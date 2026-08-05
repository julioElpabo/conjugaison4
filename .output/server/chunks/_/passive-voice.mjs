const TENSE_IDENTIFICATION_INSTRUCTION = "Quel est le mode et le temps de cette forme conjugu\xE9e ?";
const MODE_IDENTIFICATION_INSTRUCTION = "Quel est le mode de cette forme conjugu\xE9e ?";

const NON_PASSIVIZABLE_INFINITIVES = /* @__PURE__ */ new Set([
  "avoir",
  "falloir",
  "pleuvoir",
  "savoir"
]);
function normalizedInfinitive(value) {
  return value.trim().toLocaleLowerCase("fr-CH");
}
function isPassivizableInfinitive(infinitive) {
  return !NON_PASSIVIZABLE_INFINITIVES.has(normalizedInfinitive(infinitive));
}

export { MODE_IDENTIFICATION_INSTRUCTION as M, TENSE_IDENTIFICATION_INSTRUCTION as T, isPassivizableInfinitive as i };
//# sourceMappingURL=passive-voice.mjs.map

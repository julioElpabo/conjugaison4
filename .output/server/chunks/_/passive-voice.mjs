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

export { isPassivizableInfinitive as i };
//# sourceMappingURL=passive-voice.mjs.map

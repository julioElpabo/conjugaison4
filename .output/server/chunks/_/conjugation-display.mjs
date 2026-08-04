const MODE_ORDER = /* @__PURE__ */ new Map([
  ["indicatif", 10],
  ["subjonctif", 20],
  ["conditionnel", 30],
  ["imp\xE9ratif", 40],
  ["participe", 50],
  ["infinitif", 60],
  ["g\xE9rondif", 70]
]);
const TENSE_ORDER = /* @__PURE__ */ new Map([
  ["indicatif:pr\xE9sent", 10],
  ["indicatif:futur proche", 15],
  ["indicatif:pass\xE9 compos\xE9", 20],
  ["indicatif:imparfait", 30],
  ["indicatif:plus-que-parfait", 40],
  ["indicatif:pass\xE9 simple", 50],
  ["indicatif:pass\xE9 ant\xE9rieur", 60],
  ["indicatif:futur", 70],
  ["indicatif:futur ant\xE9rieur", 80],
  ["subjonctif:pr\xE9sent", 10],
  ["subjonctif:pass\xE9", 20],
  ["subjonctif:imparfait", 30],
  ["subjonctif:plus-que-parfait", 40],
  ["conditionnel:pr\xE9sent", 10],
  ["conditionnel:pass\xE9 1", 20],
  ["conditionnel:pass\xE9 2", 30],
  ["imp\xE9ratif:pr\xE9sent", 10],
  ["imp\xE9ratif:pass\xE9", 20],
  ["infinitif:pr\xE9sent", 10],
  ["infinitif:pass\xE9", 20]
]);
function key(value) {
  return value.trim().toLocaleLowerCase("fr-CH");
}
function conjugationModeOrder(mode) {
  var _a;
  return (_a = MODE_ORDER.get(key(mode))) != null ? _a : 999;
}
function conjugationTenseOrder(mode, tense) {
  var _a;
  return (_a = TENSE_ORDER.get(`${key(mode)}:${key(tense)}`)) != null ? _a : 999;
}
function conjugationTenseLabel(mode, tense) {
  const normalizedMode = key(mode);
  const normalizedTense = key(tense);
  if (normalizedMode === "indicatif" && normalizedTense === "futur") return "futur simple";
  if (normalizedMode === "conditionnel" && normalizedTense === "pass\xE9 1") return "pass\xE9 premi\xE8re forme";
  if (normalizedMode === "conditionnel" && normalizedTense === "pass\xE9 2") return "pass\xE9 deuxi\xE8me forme";
  return tense;
}
function isFiniteConjugationMode(mode) {
  return ["indicatif", "subjonctif", "conditionnel", "imp\xE9ratif"].includes(key(mode));
}

export { conjugationTenseOrder as a, conjugationTenseLabel as b, conjugationModeOrder as c, isFiniteConjugationMode as i };
//# sourceMappingURL=conjugation-display.mjs.map

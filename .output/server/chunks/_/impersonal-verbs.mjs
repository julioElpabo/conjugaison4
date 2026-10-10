const IMPERSONAL_INFINITIVES = /* @__PURE__ */ new Set([
  "falloir",
  "pleuvoir",
  "neiger",
  "bruiner",
  "venter",
  "s'agir"
]);
function isImpersonalVerb(infinitive, impersonal) {
  const normalized = infinitive.trim().normalize("NFC").toLocaleLowerCase("fr").replace(/’/gu, "'");
  return Boolean(impersonal) || IMPERSONAL_INFINITIVES.has(normalized);
}

export { isImpersonalVerb as i };
//# sourceMappingURL=impersonal-verbs.mjs.map

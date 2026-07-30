function normalizeComplementPreposition(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLocaleLowerCase("fr");
  return normalized === "\xE0" || normalized === "de" ? normalized : null;
}
function withoutComplementPreposition(value, preposition) {
  const text = value.replace(/\s+/gu, " ").trim();
  if (preposition === "\xE0") {
    if (/^aux\s+/iu.test(text)) return `les ${text.replace(/^aux\s+/iu, "")}`;
    if (/^au\s+/iu.test(text)) return `le ${text.replace(/^au\s+/iu, "")}`;
    return text.replace(/^à\s+/iu, "");
  }
  if (/^des\s+/iu.test(text)) return `les ${text.replace(/^des\s+/iu, "")}`;
  if (/^du\s+/iu.test(text)) return `le ${text.replace(/^du\s+/iu, "")}`;
  if (/^d['’]/iu.test(text)) return text.replace(/^d['’]/iu, "");
  return text.replace(/^de\s+/iu, "");
}
function withComplementPreposition(value, preposition) {
  const phrase = withoutComplementPreposition(value, preposition);
  if (!phrase) return "";
  if (preposition === "\xE0") {
    if (/^le\s+/iu.test(phrase)) return `au ${phrase.replace(/^le\s+/iu, "")}`;
    if (/^les\s+/iu.test(phrase)) return `aux ${phrase.replace(/^les\s+/iu, "")}`;
    return `\xE0 ${phrase}`;
  }
  if (/^le\s+/iu.test(phrase)) return `du ${phrase.replace(/^le\s+/iu, "")}`;
  if (/^les\s+/iu.test(phrase)) return `des ${phrase.replace(/^les\s+/iu, "")}`;
  const firstLetter = phrase.normalize("NFD").replace(/\p{Diacritic}/gu, "").charAt(0).toLocaleLowerCase("fr");
  return "aeiouyh".includes(firstLetter) ? `d\u2019${phrase}` : `de ${phrase}`;
}

export { withoutComplementPreposition as a, normalizeComplementPreposition as n, withComplementPreposition as w };
//# sourceMappingURL=complement-preposition.mjs.map

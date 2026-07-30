function explicitAnteposedText(value, gender, number) {
  var _a, _b;
  const text = value.replace(/\s+/g, " ").trim();
  if (number === "pluriel") {
    return text.replace(/^(?:des|ses|quelques)\s+/iu, "les ");
  }
  const elided = (_a = text.match(/^(?:de\s+)?l[’'](.+)$/iu)) == null ? void 0 : _a[1];
  if (elided) return `l\u2019${elided}`;
  const withoutDeterminer = (_b = text.match(/^(?:une?|du|de la|le|la|ce|cet|cette|ma|ta|sa)\s+(.+)$/iu)) == null ? void 0 : _b[1];
  if (!withoutDeterminer) return text;
  const initial = withoutDeterminer.normalize("NFD").replace(/\p{Diacritic}/gu, "").charAt(0).toLowerCase();
  if ("aeiouy".includes(initial)) return `l\u2019${withoutDeterminer}`;
  return `${gender === "feminin" ? "la" : "le"} ${withoutDeterminer}`;
}
function resolveAnteposedComplement(value, gender, number) {
  const inferred = inferAnteposedComplement(value);
  if (!gender || !number) return inferred;
  return {
    text: explicitAnteposedText(value, gender, number),
    gender,
    number
  };
}
function inferAnteposedComplement(value) {
  const text = value.replace(/\s+/g, " ").trim();
  const pluralGenders = /* @__PURE__ */ new Map([
    ["des chaussures", "feminin"],
    ["des documents", "masculin"],
    ["des lunettes", "feminin"],
    ["des l\xE9gumes", "masculin"],
    ["des pommes", "feminin"],
    ["les cl\xE9s", "feminin"],
    ["les consignes", "feminin"],
    ["les documents", "masculin"],
    ["les informations", "feminin"],
    ["les jouets", "masculin"],
    ["les l\xE9gumes", "masculin"],
    ["les oiseaux", "masculin"],
    ["les outils", "masculin"],
    ["les rideaux", "masculin"],
    ["les vitres", "feminin"],
    ["les v\xEAtements", "masculin"],
    ["quelques lignes", "feminin"],
    ["ses affaires", "feminin"],
    ["ses cheveux", "masculin"],
    ["ses cl\xE9s", "feminin"],
    ["ses livres", "masculin"],
    ["ses mains", "feminin"],
    ["ses v\xEAtements", "masculin"]
  ]);
  const pluralGender = pluralGenders.get(text.toLocaleLowerCase("fr-CH"));
  if (pluralGender) {
    return {
      text: text.replace(/^(?:des|ses|les|quelques)\s+/iu, "les "),
      gender: pluralGender,
      number: "pluriel"
    };
  }
  const rules = [
    [/^une\s+(.+)$/iu, "la", "feminin"],
    [/^un\s+(.+)$/iu, "le", "masculin"],
    [/^de la\s+(.+)$/iu, "la", "feminin"],
    [/^du\s+(.+)$/iu, "le", "masculin"],
    [/^la\s+(.+)$/iu, "la", "feminin", true],
    [/^le\s+(.+)$/iu, "le", "masculin", true],
    [/^cette\s+(.+)$/iu, "cette", "feminin", true],
    [/^ce\s+(.+)$/iu, "ce", "masculin", true],
    [/^cet\s+(.+)$/iu, "cet", "masculin", true],
    [/^sa\s+(.+)$/iu, "la", "feminin"],
    [/^ma\s+(.+)$/iu, "la", "feminin"],
    [/^ta\s+(.+)$/iu, "la", "feminin"]
  ];
  for (const [pattern, determiner, gender, originalDeterminer] of rules) {
    const match = text.match(pattern);
    if (match == null ? void 0 : match[1]) {
      const noun = match[1];
      const initial = noun.normalize("NFD").replace(/\p{Diacritic}/gu, "").charAt(0).toLowerCase();
      if (initial === "h" && !originalDeterminer) return null;
      const anteposed = ["le", "la"].includes(determiner) && "aeiouy".includes(initial) ? `l\u2019${noun}` : `${determiner} ${noun}`;
      return { text: anteposed, gender, number: "singulier" };
    }
  }
  return null;
}

export { inferAnteposedComplement as i, resolveAnteposedComplement as r };
//# sourceMappingURL=complement-placement.mjs.map

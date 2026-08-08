const tenseDefinitions = {
  indicatif: [
    { slug: "present", label: "pr\xE9sent" },
    { slug: "imparfait", label: "imparfait" },
    { slug: "passe-compose", label: "pass\xE9 compos\xE9" },
    { slug: "plus-que-parfait", label: "plus-que-parfait" },
    { slug: "passe-simple", label: "pass\xE9 simple" },
    { slug: "passe-anterieur", label: "pass\xE9 ant\xE9rieur" },
    { slug: "futur-simple", label: "futur simple" },
    { slug: "futur-anterieur", label: "futur ant\xE9rieur" },
    { slug: "futur-proche", label: "futur proche" }
  ],
  subjonctif: [
    { slug: "present", label: "pr\xE9sent" },
    { slug: "passe", label: "pass\xE9" },
    { slug: "imparfait", label: "imparfait" },
    { slug: "plus-que-parfait", label: "plus-que-parfait" }
  ],
  conditionnel: [
    { slug: "present", label: "pr\xE9sent" },
    { slug: "passe-premiere-forme", label: "pass\xE9 premi\xE8re forme" },
    { slug: "passe-deuxieme-forme", label: "pass\xE9 deuxi\xE8me forme" }
  ],
  imperatif: [
    { slug: "present", label: "pr\xE9sent" },
    { slug: "passe", label: "pass\xE9" }
  ],
  participe: [
    { slug: "present", label: "pr\xE9sent" },
    { slug: "passe", label: "pass\xE9" },
    { slug: "gerondif-present", label: "g\xE9rondif pr\xE9sent" },
    { slug: "gerondif-passe", label: "g\xE9rondif pass\xE9" }
  ]
};
function modeTensePages(mode) {
  return tenseDefinitions[mode].map((tense) => ({
    slug: tense.slug,
    label: tense.label,
    path: `/${mode}/${tense.slug}`
  }));
}
function modeTensePage(mode, tenseSlug) {
  return modeTensePages(mode).find((tense) => tense.slug === tenseSlug);
}
const MODE_TENSE_PATHS = Object.keys(tenseDefinitions).flatMap((mode) => modeTensePages(mode).map((tense) => tense.path));

export { MODE_TENSE_PATHS as M, modeTensePage as a, modeTensePages as m };
//# sourceMappingURL=mode-tense-pages.mjs.map

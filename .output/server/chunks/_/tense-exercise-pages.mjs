const pages = [
  {
    slug: "present-indicatif",
    label: "pr\xE9sent de l\u2019indicatif",
    linkLabel: "Exercices sur le pr\xE9sent de l\u2019indicatif",
    mode: "indicatif",
    queryTense: "pr\xE9sent",
    title: "Exercices de pr\xE9sent de l\u2019indicatif en ligne | Tatitotu",
    h1: "Exercices sur le pr\xE9sent de l\u2019indicatif",
    description: "Entra\xEEnez-vous au pr\xE9sent de l\u2019indicatif avec des exercices de conjugaison interactifs et gratuits. Choisissez vos verbes et exercez-vous en ligne.",
    intro: "Travaillez le pr\xE9sent de l\u2019indicatif avec les verbes de votre choix. Le temps est d\xE9j\xE0 s\xE9lectionn\xE9 : vous pouvez adapter les questions, puis commencer directement en ligne.",
    explanation: "Le pr\xE9sent sert \xE0 exprimer une action actuelle, une habitude ou une v\xE9rit\xE9 g\xE9n\xE9rale. Il permet aussi de raconter avec vivacit\xE9 un \xE9v\xE9nement.",
    related: ["imparfait", "passe-compose", "futur-simple", "subjonctif-present"]
  },
  {
    slug: "imparfait",
    label: "imparfait",
    linkLabel: "Exercices sur l\u2019imparfait",
    mode: "indicatif",
    queryTense: "imparfait",
    title: "Exercices d\u2019imparfait en ligne | Tatitotu",
    h1: "Exercices sur l\u2019imparfait",
    description: "Entra\xEEnez-vous \xE0 l\u2019imparfait avec des exercices de conjugaison interactifs et gratuits. S\xE9lectionnez vos verbes et commencez en ligne.",
    intro: "R\xE9visez l\u2019imparfait dans un exercice personnalis\xE9. Ce temps est pr\xE9s\xE9lectionn\xE9 ; il ne vous reste qu\u2019\xE0 choisir les verbes et les options qui vous conviennent.",
    explanation: "L\u2019imparfait d\xE9crit souvent une habitude, une action en cours ou le d\xE9cor d\u2019un r\xE9cit pass\xE9. Ses terminaisons sont -ais, -ais, -ait, -ions, -iez et -aient.",
    related: ["present-indicatif", "passe-compose", "plus-que-parfait", "passe-simple"]
  },
  {
    slug: "passe-compose",
    label: "pass\xE9 compos\xE9",
    linkLabel: "Exercices sur le pass\xE9 compos\xE9",
    mode: "indicatif",
    queryTense: "pass\xE9 compos\xE9",
    title: "Exercices de pass\xE9 compos\xE9 en ligne | Tatitotu",
    h1: "Exercices sur le pass\xE9 compos\xE9",
    description: "Entra\xEEnez-vous au pass\xE9 compos\xE9 avec des exercices de conjugaison interactifs et gratuits. Choisissez les verbes et exercez-vous directement en ligne.",
    intro: "Entra\xEEnez-vous \xE0 former le pass\xE9 compos\xE9 avec les verbes de votre choix. Le bon temps est d\xE9j\xE0 s\xE9lectionn\xE9 dans le g\xE9n\xE9rateur d\u2019exercices.",
    explanation: "Le pass\xE9 compos\xE9 associe avoir ou \xEAtre au pr\xE9sent \xE0 un participe pass\xE9. Il exprime g\xE9n\xE9ralement une action achev\xE9e et demande de surveiller le choix de l\u2019auxiliaire et les accords.",
    related: ["imparfait", "plus-que-parfait", "passe-simple", "passe-anterieur"]
  },
  {
    slug: "plus-que-parfait",
    label: "plus-que-parfait",
    linkLabel: "Exercices sur le plus-que-parfait",
    mode: "indicatif",
    queryTense: "plus-que-parfait",
    title: "Exercices de plus-que-parfait en ligne | Tatitotu",
    h1: "Exercices sur le plus-que-parfait",
    description: "Pratiquez le plus-que-parfait avec des exercices gratuits et personnalisables. Choisissez vos verbes et entra\xEEnez-vous directement en ligne.",
    intro: "Consolidez le plus-que-parfait gr\xE2ce \xE0 un exercice cibl\xE9. Le g\xE9n\xE9rateur s\xE9lectionne ce temps pour vous et vous laisse choisir les verbes \xE0 travailler.",
    explanation: "Le plus-que-parfait situe une action avant une autre action pass\xE9e. Il se construit avec avoir ou \xEAtre \xE0 l\u2019imparfait, suivi du participe pass\xE9.",
    related: ["imparfait", "passe-compose", "passe-anterieur", "conditionnel-passe"]
  },
  {
    slug: "futur-simple",
    label: "futur simple",
    linkLabel: "Exercices sur le futur simple",
    mode: "indicatif",
    queryTense: "futur simple",
    title: "Exercices de futur simple en ligne | Tatitotu",
    h1: "Exercices sur le futur simple",
    description: "Entra\xEEnez-vous au futur simple avec des exercices de conjugaison gratuits. S\xE9lectionnez les verbes, personnalisez les questions et commencez en ligne.",
    intro: "Pr\xE9parez un exercice consacr\xE9 au futur simple en quelques clics. Le temps est pr\xE9s\xE9lectionn\xE9 et le choix des verbes reste enti\xE8rement personnalisable.",
    explanation: "Le futur simple exprime un fait \xE0 venir, une pr\xE9vision ou une promesse. Ses terminaisons sont -ai, -as, -a, -ons, -ez et -ont, avec quelques radicaux irr\xE9guliers.",
    related: ["present-indicatif", "futur-anterieur", "conditionnel-present", "passe-compose"]
  },
  {
    slug: "futur-anterieur",
    label: "futur ant\xE9rieur",
    linkLabel: "Exercices sur le futur ant\xE9rieur",
    mode: "indicatif",
    queryTense: "futur ant\xE9rieur",
    title: "Exercices de futur ant\xE9rieur en ligne | Tatitotu",
    h1: "Exercices sur le futur ant\xE9rieur",
    description: "R\xE9visez le futur ant\xE9rieur avec des exercices interactifs gratuits. Choisissez vos verbes et travaillez ce temps compos\xE9 directement en ligne.",
    intro: "Exercez-vous au futur ant\xE9rieur avec une s\xE9lection de verbes adapt\xE9e \xE0 vos besoins. Le moteur d\u2019exercices s\u2019ouvre avec ce temps d\xE9j\xE0 choisi.",
    explanation: "Le futur ant\xE9rieur pr\xE9sente une action qui sera termin\xE9e avant une autre action future. Il emploie avoir ou \xEAtre au futur simple, puis le participe pass\xE9.",
    related: ["futur-simple", "plus-que-parfait", "passe-anterieur", "conditionnel-passe"]
  },
  {
    slug: "passe-simple",
    label: "pass\xE9 simple",
    linkLabel: "Exercices sur le pass\xE9 simple",
    mode: "indicatif",
    queryTense: "pass\xE9 simple",
    title: "Exercices de pass\xE9 simple en ligne | Tatitotu",
    h1: "Exercices sur le pass\xE9 simple",
    description: "Entra\xEEnez-vous au pass\xE9 simple avec des exercices de conjugaison gratuits et personnalisables. Choisissez les verbes \xE0 r\xE9viser en ligne.",
    intro: "Travaillez les formes du pass\xE9 simple dans un exercice cibl\xE9. Le temps est d\xE9j\xE0 s\xE9lectionn\xE9 afin que vous puissiez vous concentrer sur les verbes utiles.",
    explanation: "Le pass\xE9 simple raconte des actions achev\xE9es qui font progresser un r\xE9cit, surtout \xE0 l\u2019\xE9crit. Ses radicaux et terminaisons varient selon les familles de verbes.",
    related: ["imparfait", "passe-compose", "passe-anterieur", "plus-que-parfait"]
  },
  {
    slug: "passe-anterieur",
    label: "pass\xE9 ant\xE9rieur",
    linkLabel: "Exercices sur le pass\xE9 ant\xE9rieur",
    mode: "indicatif",
    queryTense: "pass\xE9 ant\xE9rieur",
    title: "Exercices de pass\xE9 ant\xE9rieur en ligne | Tatitotu",
    h1: "Exercices sur le pass\xE9 ant\xE9rieur",
    description: "Pratiquez le pass\xE9 ant\xE9rieur avec des exercices de conjugaison gratuits. S\xE9lectionnez les verbes et entra\xEEnez-vous \xE0 ce temps compos\xE9 en ligne.",
    intro: "R\xE9visez le pass\xE9 ant\xE9rieur sans reconfigurer tout le g\xE9n\xE9rateur : ce temps est pr\xE9s\xE9lectionn\xE9 et vous gardez la main sur les verbes et les options.",
    explanation: "Le pass\xE9 ant\xE9rieur marque une action accomplie juste avant une autre action au pass\xE9 simple. Il se forme avec avoir ou \xEAtre au pass\xE9 simple et un participe pass\xE9.",
    related: ["passe-simple", "plus-que-parfait", "passe-compose", "futur-anterieur"]
  },
  {
    slug: "conditionnel-present",
    label: "conditionnel pr\xE9sent",
    linkLabel: "Exercices sur le conditionnel pr\xE9sent",
    mode: "conditionnel",
    queryTense: "pr\xE9sent",
    title: "Exercices de conditionnel pr\xE9sent en ligne | Tatitotu",
    h1: "Exercices sur le conditionnel pr\xE9sent",
    description: "Entra\xEEnez-vous au conditionnel pr\xE9sent avec des exercices gratuits et interactifs. Choisissez les verbes et personnalisez votre entra\xEEnement en ligne.",
    intro: "Cr\xE9ez un exercice consacr\xE9 au conditionnel pr\xE9sent. Le mode et le temps sont d\xE9j\xE0 choisis ; s\xE9lectionnez simplement les verbes que vous voulez r\xE9viser.",
    explanation: "Le conditionnel pr\xE9sent exprime une hypoth\xE8se, un souhait ou une demande att\xE9nu\xE9e. Il reprend souvent le radical du futur et les terminaisons de l\u2019imparfait.",
    related: ["conditionnel-passe", "futur-simple", "imparfait", "subjonctif-present"]
  },
  {
    slug: "conditionnel-passe",
    label: "conditionnel pass\xE9",
    linkLabel: "Exercices sur le conditionnel pass\xE9",
    mode: "conditionnel",
    queryTense: "pass\xE9 premi\xE8re forme",
    title: "Exercices de conditionnel pass\xE9 en ligne | Tatitotu",
    h1: "Exercices sur le conditionnel pass\xE9",
    description: "Entra\xEEnez-vous au conditionnel pass\xE9 avec des exercices interactifs gratuits. Choisissez vos verbes et travaillez ce temps compos\xE9 en ligne.",
    intro: "Entra\xEEnez-vous au conditionnel pass\xE9 avec un exercice personnalisable. Sa premi\xE8re forme, la plus courante, est pr\xE9s\xE9lectionn\xE9e dans le moteur.",
    explanation: "Le conditionnel pass\xE9 \xE9voque notamment une possibilit\xE9 non r\xE9alis\xE9e, un regret ou une information non confirm\xE9e. Il associe l\u2019auxiliaire au conditionnel pr\xE9sent au participe pass\xE9.",
    related: ["conditionnel-present", "plus-que-parfait", "futur-anterieur", "subjonctif-passe"]
  },
  {
    slug: "subjonctif-present",
    label: "subjonctif pr\xE9sent",
    linkLabel: "Exercices sur le subjonctif pr\xE9sent",
    mode: "subjonctif",
    queryTense: "pr\xE9sent",
    title: "Exercices de subjonctif pr\xE9sent en ligne | Tatitotu",
    h1: "Exercices sur le subjonctif pr\xE9sent",
    description: "Pratiquez le subjonctif pr\xE9sent avec des exercices de conjugaison gratuits. Choisissez vos verbes et entra\xEEnez-vous directement en ligne.",
    intro: "Travaillez le subjonctif pr\xE9sent avec les verbes de votre choix. Le g\xE9n\xE9rateur pr\xE9pare une s\xE9lection cibl\xE9e sur ce mode et ce temps.",
    explanation: "Le subjonctif pr\xE9sent appara\xEEt souvent apr\xE8s une expression de volont\xE9, de n\xE9cessit\xE9, de doute ou d\u2019\xE9motion. Il est fr\xE9quemment introduit par \xAB que \xBB.",
    related: ["subjonctif-passe", "present-indicatif", "conditionnel-present", "passe-compose"]
  },
  {
    slug: "subjonctif-passe",
    label: "subjonctif pass\xE9",
    linkLabel: "Exercices sur le subjonctif pass\xE9",
    mode: "subjonctif",
    queryTense: "pass\xE9",
    title: "Exercices de subjonctif pass\xE9 en ligne | Tatitotu",
    h1: "Exercices sur le subjonctif pass\xE9",
    description: "R\xE9visez le subjonctif pass\xE9 avec des exercices gratuits et personnalisables. S\xE9lectionnez vos verbes et exercez-vous en ligne.",
    intro: "Concentrez votre entra\xEEnement sur le subjonctif pass\xE9. Le bon temps est pr\xE9s\xE9lectionn\xE9 ; vous pouvez ensuite adapter les verbes et les options.",
    explanation: "Le subjonctif pass\xE9 exprime une action accomplie envisag\xE9e avec doute, volont\xE9, jugement ou \xE9motion. Il se forme avec avoir ou \xEAtre au subjonctif pr\xE9sent et le participe pass\xE9.",
    related: ["subjonctif-present", "conditionnel-passe", "passe-compose", "plus-que-parfait"]
  }
];
const TENSE_EXERCISE_PAGES = pages;
const TENSE_EXERCISE_PATHS = pages.map((page) => `/exercices/${page.slug}`);
const bySlug = new Map(pages.map((page) => [page.slug, page]));
function tenseExercisePage(slug) {
  return bySlug.get(slug);
}
function relatedTenseExercisePages(page) {
  return page.related.flatMap((slug) => {
    const related = bySlug.get(slug);
    return related ? [related] : [];
  });
}

export { TENSE_EXERCISE_PATHS as T, TENSE_EXERCISE_PAGES as a, relatedTenseExercisePages as r, tenseExercisePage as t };
//# sourceMappingURL=tense-exercise-pages.mjs.map

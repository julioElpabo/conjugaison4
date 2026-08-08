import { _ as __nuxt_component_0 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { i as isModeLandingSlug, m as modeLandingPage } from '../_/mode-landing-pages.mjs';
import { a as modeTensePage } from '../_/mode-tense-pages.mjs';
import { m as modeTensePedagogy } from '../_/mode-tense-pedagogy.mjs';
import { g as useRoute, f as useLanguagePreferences, k as createError, u as useHead } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:url';
import 'node:fs/promises';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const imperfectEndings = [
  { label: "Tous les groupes", endings: "-ais \xB7 -ais \xB7 -ait \xB7 -ions \xB7 -iez \xB7 -aient", example: "je parlais \xB7 nous finissions \xB7 ils prenaient", note: "Les terminaisons sont identiques ; c\u2019est le radical, tir\xE9 de \xAB nous \xBB au pr\xE9sent, qui change." }
];
const futureEndings = [
  { label: "Tous les groupes", endings: "-ai \xB7 -as \xB7 -a \xB7 -ons \xB7 -ez \xB7 -ont", example: "je parlerai \xB7 nous finirons \xB7 ils prendront", note: "Les terminaisons sont communes. Les verbes en -re perdent leur e final et certains verbes ont un radical irr\xE9gulier." }
];
const compoundGroups = (auxiliaryTense, avoir, etre) => [
  { label: `Auxiliaire avoir \u2014 ${auxiliaryTense}`, endings: avoir, example: "j\u2019ai parl\xE9 \xB7 nous avons fini" },
  { label: `Auxiliaire \xEAtre \u2014 ${auxiliaryTense}`, endings: etre, example: "elle est partie \xB7 ils sont venus", note: "Avec \xEAtre, le participe pass\xE9 s\u2019accorde g\xE9n\xE9ralement avec le sujet." },
  { label: "Participe pass\xE9 du verbe", endings: "1er groupe : -\xE9 \xB7 2e groupe : -i \xB7 3e groupe : formes variables", example: "parl\xE9 \xB7 fini \xB7 pris / venu / fait", note: "Le groupe aide \xE0 pr\xE9voir les formes r\xE9guli\xE8res, mais le 3e groupe doit souvent \xEAtre appris par familles." }
];
const subjunctivePresentGroups = [
  { label: "1er groupe", endings: "-e \xB7 -es \xB7 -e \xB7 -ions \xB7 -iez \xB7 -ent", example: "que je parle \xB7 que nous parlions \xB7 qu\u2019ils parlent" },
  { label: "2e groupe", endings: "-isse \xB7 -isses \xB7 -isse \xB7 -issions \xB7 -issiez \xB7 -issent", example: "que je finisse \xB7 que nous finissions \xB7 qu\u2019ils finissent" },
  { label: "3e groupe", endings: "-e \xB7 -es \xB7 -e \xB7 -ions \xB7 -iez \xB7 -ent", example: "que je prenne \xB7 que nous prenions \xB7 qu\u2019ils prennent", note: "Les terminaisons sont r\xE9guli\xE8res, mais les radicaux sont souvent variables. \xCAtre, avoir, aller, faire, pouvoir, savoir et vouloir ont notamment des formes particuli\xE8res." }
];
const endings = {
  "indicatif:present": {
    intro: "Au pr\xE9sent, les terminaisons d\xE9pendent r\xE9ellement du groupe du verbe.",
    groups: [
      { label: "1er groupe \u2014 verbes en -er", endings: "-e \xB7 -es \xB7 -e \xB7 -ons \xB7 -ez \xB7 -ent", example: "je parle \xB7 tu parles \xB7 nous parlons" },
      { label: "2e groupe \u2014 verbes r\xE9guliers en -ir", endings: "-is \xB7 -is \xB7 -it \xB7 -issons \xB7 -issez \xB7 -issent", example: "je finis \xB7 nous finissons \xB7 ils finissent" },
      { label: "3e groupe", endings: "-s \xB7 -s \xB7 -t/-d \xB7 -ons \xB7 -ez \xB7 -ent", example: "je prends \xB7 il prend \xB7 vous prenez", note: "Ce sont des terminaisons fr\xE9quentes, pas une r\xE8gle unique. Partir, prendre, pouvoir ou venir ne se construisent pas exactement de la m\xEAme fa\xE7on." }
    ]
  },
  "indicatif:imparfait": { intro: "\xC0 l\u2019imparfait, les trois groupes partagent la m\xEAme s\xE9rie de terminaisons.", groups: imperfectEndings },
  "indicatif:passe-compose": { intro: "Le pass\xE9 compos\xE9 n\u2019ajoute pas une terminaison au verbe principal : il combine un auxiliaire au pr\xE9sent et un participe pass\xE9.", groups: compoundGroups("pr\xE9sent", "ai \xB7 as \xB7 a \xB7 avons \xB7 avez \xB7 ont", "suis \xB7 es \xB7 est \xB7 sommes \xB7 \xEAtes \xB7 sont") },
  "indicatif:plus-que-parfait": { intro: "Le plus-que-parfait combine un auxiliaire \xE0 l\u2019imparfait et le participe pass\xE9 du verbe.", groups: compoundGroups("imparfait", "avais \xB7 avais \xB7 avait \xB7 avions \xB7 aviez \xB7 avaient", "\xE9tais \xB7 \xE9tais \xB7 \xE9tait \xB7 \xE9tions \xB7 \xE9tiez \xB7 \xE9taient") },
  "indicatif:passe-simple": {
    intro: "Au pass\xE9 simple, le groupe permet de rep\xE9rer les grandes s\xE9ries, mais le 3e groupe comprend plusieurs familles.",
    groups: [
      { label: "1er groupe", endings: "-ai \xB7 -as \xB7 -a \xB7 -\xE2mes \xB7 -\xE2tes \xB7 -\xE8rent", example: "je parlai \xB7 nous parl\xE2mes \xB7 ils parl\xE8rent" },
      { label: "2e groupe", endings: "-is \xB7 -is \xB7 -it \xB7 -\xEEmes \xB7 -\xEEtes \xB7 -irent", example: "je finis \xB7 nous fin\xEEmes \xB7 ils finirent" },
      { label: "3e groupe \u2014 s\xE9rie en -i-", endings: "-is \xB7 -is \xB7 -it \xB7 -\xEEmes \xB7 -\xEEtes \xB7 -irent", example: "je pris \xB7 il prit \xB7 ils prirent" },
      { label: "3e groupe \u2014 s\xE9rie en -u-", endings: "-us \xB7 -us \xB7 -ut \xB7 -\xFBmes \xB7 -\xFBtes \xB7 -urent", example: "je pus \xB7 il put \xB7 ils purent" },
      { label: "Venir et tenir", endings: "-ins \xB7 -ins \xB7 -int \xB7 -\xEEnmes \xB7 -\xEEntes \xB7 -inrent", example: "je vins \xB7 il vint \xB7 ils vinrent", note: "Les formes du radical sont \xE0 apprendre par familles de verbes." }
    ]
  },
  "indicatif:passe-anterieur": { intro: "Le pass\xE9 ant\xE9rieur combine un auxiliaire au pass\xE9 simple et un participe pass\xE9.", groups: compoundGroups("pass\xE9 simple", "eus \xB7 eus \xB7 eut \xB7 e\xFBmes \xB7 e\xFBtes \xB7 eurent", "fus \xB7 fus \xB7 fut \xB7 f\xFBmes \xB7 f\xFBtes \xB7 furent") },
  "indicatif:futur-simple": { intro: "Au futur simple, les terminaisons sont communes aux trois groupes ; les diff\xE9rences concernent surtout le radical.", groups: futureEndings },
  "indicatif:futur-anterieur": { intro: "Le futur ant\xE9rieur combine un auxiliaire au futur simple et un participe pass\xE9.", groups: compoundGroups("futur simple", "aurai \xB7 auras \xB7 aura \xB7 aurons \xB7 aurez \xB7 auront", "serai \xB7 seras \xB7 sera \xB7 serons \xB7 serez \xB7 seront") },
  "indicatif:futur-proche": {
    intro: "Le futur proche se construit avec aller au pr\xE9sent. Le verbe principal reste \xE0 l\u2019infinitif : son groupe ne change donc pas la construction.",
    groups: [
      { label: "Aller au pr\xE9sent", endings: "vais \xB7 vas \xB7 va \xB7 allons \xB7 allez \xB7 vont", example: "je vais parler \xB7 nous allons finir \xB7 ils vont partir" },
      { label: "Verbe principal", endings: "infinitif inchang\xE9", example: "parler \xB7 finir \xB7 prendre" }
    ]
  },
  "subjonctif:present": { intro: "Les terminaisons du subjonctif pr\xE9sent sont largement communes, mais les radicaux r\xE9v\xE8lent certaines diff\xE9rences entre groupes.", groups: subjunctivePresentGroups },
  "subjonctif:passe": { intro: "Le subjonctif pass\xE9 combine un auxiliaire au subjonctif pr\xE9sent et un participe pass\xE9.", groups: compoundGroups("subjonctif pr\xE9sent", "aie \xB7 aies \xB7 ait \xB7 ayons \xB7 ayez \xB7 aient", "sois \xB7 sois \xB7 soit \xB7 soyons \xB7 soyez \xB7 soient") },
  "subjonctif:imparfait": {
    intro: "Le subjonctif imparfait se rattache aux familles du pass\xE9 simple.",
    groups: [
      { label: "1er groupe", endings: "-asse \xB7 -asses \xB7 -\xE2t \xB7 -assions \xB7 -assiez \xB7 -assent", example: "que je parlasse \xB7 qu\u2019il parl\xE2t \xB7 qu\u2019ils parlassent" },
      { label: "2e groupe", endings: "-isse \xB7 -isses \xB7 -\xEEt \xB7 -issions \xB7 -issiez \xB7 -issent", example: "que je finisse \xB7 qu\u2019il fin\xEEt \xB7 qu\u2019ils finissent" },
      { label: "3e groupe \u2014 s\xE9rie en -i-", endings: "-isse \xB7 -isses \xB7 -\xEEt \xB7 -issions \xB7 -issiez \xB7 -issent", example: "que je prisse \xB7 qu\u2019il pr\xEEt \xB7 qu\u2019ils prissent" },
      { label: "3e groupe \u2014 s\xE9rie en -u-", endings: "-usse \xB7 -usses \xB7 -\xFBt \xB7 -ussions \xB7 -ussiez \xB7 -ussent", example: "que je pusse \xB7 qu\u2019il p\xFBt \xB7 qu\u2019ils pussent" },
      { label: "Venir et tenir", endings: "-insse \xB7 -insses \xB7 -\xEEnt \xB7 -inssions \xB7 -inssiez \xB7 -inssent", example: "que je vinsse \xB7 qu\u2019il v\xEEnt \xB7 qu\u2019ils vinssent", note: "La voyelle d\xE9pend de la forme du pass\xE9 simple du verbe." }
    ]
  },
  "subjonctif:plus-que-parfait": { intro: "Cette forme litt\xE9raire combine un auxiliaire au subjonctif imparfait et un participe pass\xE9.", groups: compoundGroups("subjonctif imparfait", "eusse \xB7 eusses \xB7 e\xFBt \xB7 eussions \xB7 eussiez \xB7 eussent", "fusse \xB7 fusses \xB7 f\xFBt \xB7 fussions \xB7 fussiez \xB7 fussent") },
  "conditionnel:present": { intro: "Les trois groupes prennent les terminaisons de l\u2019imparfait sur le radical du futur.", groups: imperfectEndings.map((group) => ({ ...group, example: "je parlerais \xB7 nous finirions \xB7 ils viendraient", note: "Le radical suit les m\xEAmes r\xE8gles et les m\xEAmes irr\xE9gularit\xE9s qu\u2019au futur simple." })) },
  "conditionnel:passe-premiere-forme": { intro: "La premi\xE8re forme combine un auxiliaire au conditionnel pr\xE9sent et un participe pass\xE9.", groups: compoundGroups("conditionnel pr\xE9sent", "aurais \xB7 aurais \xB7 aurait \xB7 aurions \xB7 auriez \xB7 auraient", "serais \xB7 serais \xB7 serait \xB7 serions \xB7 seriez \xB7 seraient") },
  "conditionnel:passe-deuxieme-forme": { intro: "La deuxi\xE8me forme combine un auxiliaire au subjonctif imparfait et un participe pass\xE9.", groups: compoundGroups("subjonctif imparfait", "eusse \xB7 eusses \xB7 e\xFBt \xB7 eussions \xB7 eussiez \xB7 eussent", "fusse \xB7 fusses \xB7 f\xFBt \xB7 fussions \xB7 fussiez \xB7 fussent") },
  "imperatif:present": {
    intro: "L\u2019imp\xE9ratif n\u2019existe qu\u2019\xE0 trois personnes : tu, nous et vous. Le pronom sujet n\u2019est pas exprim\xE9.",
    groups: [
      { label: "1er groupe", endings: "-e \xB7 -ons \xB7 -ez", example: "parle \xB7 parlons \xB7 parlez", note: "\xC0 la forme affirmative devant \xAB en \xBB ou \xAB y \xBB, le -s r\xE9appara\xEEt : \xAB vas-y \xBB, \xAB parles-en \xBB." },
      { label: "2e groupe", endings: "-is \xB7 -issons \xB7 -issez", example: "finis \xB7 finissons \xB7 finissez" },
      { label: "3e groupe", endings: "-s/-x \xB7 -ons \xB7 -ez", example: "prends \xB7 prenons \xB7 prenez", note: "Les radicaux et certaines terminaisons varient. \xCAtre, avoir, savoir et vouloir ont des formes particuli\xE8res." }
    ]
  },
  "imperatif:passe": { intro: "L\u2019imp\xE9ratif pass\xE9 combine l\u2019auxiliaire \xE0 l\u2019imp\xE9ratif pr\xE9sent et un participe pass\xE9 ; seules les personnes tu, nous et vous existent.", groups: [
    { label: "Auxiliaire avoir", endings: "aie \xB7 ayons \xB7 ayez", example: "aie termin\xE9 \xB7 ayons termin\xE9 \xB7 ayez termin\xE9" },
    { label: "Auxiliaire \xEAtre", endings: "sois \xB7 soyons \xB7 soyez", example: "sois revenu \xB7 soyons partis \xB7 soyez arriv\xE9s", note: "Le participe pass\xE9 s\u2019accorde avec le sujet sous-entendu." }
  ] },
  "participe:present": {
    intro: "Le participe pr\xE9sent a une seule terminaison. Le groupe aide surtout \xE0 retrouver le radical.",
    groups: [
      { label: "Tous les groupes", endings: "-ant sur le radical de \xAB nous \xBB au pr\xE9sent", example: "parlant \xB7 finissant \xB7 prenant" },
      { label: "Exceptions", endings: "ayant \xB7 \xE9tant \xB7 sachant", example: "avoir \u2192 ayant \xB7 \xEAtre \u2192 \xE9tant \xB7 savoir \u2192 sachant" }
    ]
  },
  "participe:passe": {
    intro: "C\u2019est ici que la relation avec le groupe est la plus utile pour les verbes r\xE9guliers.",
    groups: [
      { label: "1er groupe", endings: "-\xE9", example: "parler \u2192 parl\xE9 \xB7 aimer \u2192 aim\xE9" },
      { label: "2e groupe", endings: "-i", example: "finir \u2192 fini \xB7 choisir \u2192 choisi" },
      { label: "3e groupe", endings: "-i, -u, -is, -it\u2026", example: "parti \xB7 venu \xB7 pris \xB7 \xE9crit", note: "Il n\u2019existe pas de terminaison unique : les formes s\u2019apprennent par familles." }
    ]
  },
  "participe:gerondif-present": {
    intro: "Le g\xE9rondif pr\xE9sent ajoute \xAB en \xBB devant le participe pr\xE9sent ; sa terminaison ne varie pas selon la personne.",
    groups: [
      { label: "Tous les groupes", endings: "en + radical de \xAB nous \xBB + -ant", example: "en parlant \xB7 en finissant \xB7 en prenant" },
      { label: "Exceptions", endings: "en ayant \xB7 en \xE9tant \xB7 en sachant", example: "en ayant du temps \xB7 en \xE9tant pr\xEAt \xB7 en sachant cela" }
    ]
  },
  "participe:gerondif-passe": {
    intro: "Le g\xE9rondif pass\xE9 combine \xAB en \xBB, un auxiliaire au participe pr\xE9sent et le participe pass\xE9 du verbe.",
    groups: [
      { label: "Avec avoir", endings: "en ayant + participe pass\xE9", example: "en ayant parl\xE9 \xB7 en ayant fini \xB7 en ayant compris" },
      { label: "Avec \xEAtre", endings: "en \xE9tant + participe pass\xE9", example: "en \xE9tant parti \xB7 en \xE9tant arriv\xE9e", note: "Avec \xEAtre, le participe pass\xE9 s\u2019accorde avec le sujet." }
    ]
  }
};
function modeTenseEndings(mode, tenseSlug) {
  return endings[`${mode}:${tenseSlug}`];
}

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[temps]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { interfaceLocale, localePath } = useLanguagePreferences();
    const modeSlug = String(route.params.mode || "");
    const tenseSlug = String(route.params.temps || "");
    if (!isModeLandingSlug(modeSlug)) {
      throw createError({ statusCode: 404, statusMessage: "Mode introuvable" });
    }
    const tense = modeTensePage(modeSlug, tenseSlug);
    const pedagogy = modeTensePedagogy(modeSlug, tenseSlug);
    const endingsGuide = modeTenseEndings(modeSlug, tenseSlug);
    if (!tense || !pedagogy || !endingsGuide) {
      throw createError({ statusCode: 404, statusMessage: "Temps introuvable" });
    }
    const mode = computed(() => modeLandingPage(modeSlug, interfaceLocale.value));
    const endingPronouns = computed(() => {
      if (modeSlug === "participe") return [];
      if (modeSlug === "imperatif") return ["(tu)", "(nous)", "(vous)"];
      if (modeSlug === "subjonctif") return ["que je / j’", "que tu", "qu’il / elle / on", "que nous", "que vous", "qu’ils / elles"];
      return ["je / j’", "tu", "il / elle / on", "nous", "vous", "ils / elles"];
    });
    function endingForms(endings) {
      return endings.split("·").map((ending) => ending.trim());
    }
    const endingTableGroups = computed(() => endingsGuide.groups.filter((group) => endingForms(group.endings).length === endingPronouns.value.length));
    const endingReferenceGroups = computed(() => endingsGuide.groups.filter((group) => !endingTableGroups.value.includes(group)));
    const learnUrl = computed(() => localePath("/apprendre"));
    const frenchUseTitle = computed(() => {
      if (modeSlug === "participe") {
        const form = tenseSlug === "present" ? "le participe présent" : tenseSlug === "passe" ? "le participe passé" : `${/^[aeiouyéèêàâîïôöùûü]/iu.test(tense.label) ? "l’" : "le "}${tense.label}`;
        return `Quand choisir ${form} ?`;
      }
      const tenseArticle = /^[aeiouyéèêàâîïôöùûü]/iu.test(tense.label) ? "l’" : "le ";
      const modeArticle = /^[aeiouyéèêàâîïôöùûü]/iu.test(mode.value.modeName) ? "de l’" : "du ";
      return `Quand choisir ${tenseArticle}${tense.label} ${modeArticle}${mode.value.modeName} ?`;
    });
    const copy = computed(() => ({
      fr: { title: `${tense.label} — ${mode.value.modeName}`, description: `${tense.label} du mode ${mode.value.modeName} : emplois, terminaisons et exemples contextualisés.`, endings: "Les terminaisons", uses: frenchUseTitle.value, examples: "Phrases exemples : pourquoi employer ce temps ?", examplesIntro: `Chaque phrase met en évidence un usage du ${tense.label}. Le contexte fournit les indices et la justification explique précisément pourquoi ce temps convient.`, example: "Phrase exemple", context: "Situation et indices", reason: "Justification de l’usage du temps", back: "Retour", practise: `Créer un exercice au ${tense.label}` },
      de: { title: `${tense.label} — ${mode.value.modeName}`, description: `Verstehe die Wahl von ${tense.label} im Modus ${mode.value.modeName} anhand konkreter Situationen.`, endings: "Endungen", uses: `Wann verwendet man ${tense.label} im ${mode.value.modeName}?`, examples: "Beispiele: Warum diese Zeit verwenden?", examplesIntro: "Jeder Satz zeigt eine Verwendung dieser Zeit. Der Kontext liefert die Hinweise und die Begründung erklärt die Wahl.", example: "Beispielsatz", context: "Situation und Hinweise", reason: "Begründung der Zeitwahl", back: "Zurück zu Lernen", practise: `Übung: ${tense.label}` },
      en: { title: `${tense.label} — ${mode.value.modeName}`, description: `Understand why ${tense.label} is chosen within the ${mode.value.modeName} through concrete situations.`, endings: "Endings", uses: `When should you use the ${tense.label} ${mode.value.modeName}?`, examples: "Example sentences: why use this tense?", examplesIntro: "Each sentence illustrates one use of the tense. The context provides the clues and the explanation justifies the choice.", example: "Example sentence", context: "Situation and clues", reason: "Why this tense is used", back: "Back to Learn", practise: `Practise ${tense.label}` },
      it: { title: `${tense.label} — ${mode.value.modeName}`, description: `Comprendi perché si sceglie ${tense.label} nel modo ${mode.value.modeName} attraverso situazioni concrete.`, endings: "Desinenze", uses: `Quando scegliere ${tense.label} del ${mode.value.modeName}?`, examples: "Frasi di esempio: perché usare questo tempo?", examplesIntro: "Ogni frase mostra un uso del tempo. Il contesto fornisce gli indizi e la spiegazione giustifica la scelta.", example: "Frase di esempio", context: "Situazione e indizi", reason: "Giustificazione dell’uso del tempo", back: "Torna a Imparare", practise: `Esercitati: ${tense.label}` },
      es: { title: `${tense.label} — ${mode.value.modeName}`, description: `Comprende por qué se elige ${tense.label} en el modo ${mode.value.modeName} mediante situaciones concretas.`, endings: "Terminaciones", uses: `¿Cuándo elegir ${tense.label} del ${mode.value.modeName}?`, examples: "Frases de ejemplo: ¿por qué usar este tiempo?", examplesIntro: "Cada frase muestra un uso del tiempo. El contexto aporta las pistas y la explicación justifica la elección.", example: "Frase de ejemplo", context: "Situación y pistas", reason: "Justificación del uso del tiempo", back: "Volver a Aprender", practise: `Practicar ${tense.label}` }
    })[interfaceLocale.value]);
    const exerciseUrl = computed(() => ({
      path: localePath("/"),
      query: { mode: modeSlug, temps: tense.label }
    }));
    useHead(() => ({
      title: `${copy.value.title} : emplois, exemples et exercices`,
      meta: [
        { name: "description", content: copy.value.description },
        { property: "og:title", content: copy.value.title },
        { property: "og:description", content: copy.value.description },
        { property: "og:type", content: "website" }
      ],
      script: [{
        key: "mode-tense-learning-resource",
        type: "application/ld+json",
        textContent: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: copy.value.title,
          description: copy.value.description,
          learningResourceType: "Lesson",
          educationalUse: ["Instruction", "Practice"],
          inLanguage: "fr",
          teaches: `Conjugaison française : ${tense.label} — ${mode.value.modeName}`,
          isAccessibleForFree: true
        })
      }]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "tense-page" }, _attrs))} data-v-89bbcd68>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "tense-page__back",
        to: unref(learnUrl)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span aria-hidden="true" data-v-89bbcd68${_scopeId}>←</span> ${ssrInterpolate(unref(copy).back)}`);
          } else {
            return [
              createVNode("span", { "aria-hidden": "true" }, "←"),
              createTextVNode(" " + toDisplayString(unref(copy).back), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<header class="tense-page__hero" data-v-89bbcd68><p data-v-89bbcd68>${ssrInterpolate(unref(mode).modeName)} · ${ssrInterpolate(unref(tense).label)}</p><h1 data-v-89bbcd68>${ssrInterpolate(unref(copy).title)}</h1></header><div class="tense-page__content" data-v-89bbcd68><section class="tense-page__panel tense-page__panel--uses" data-v-89bbcd68><h2 data-v-89bbcd68>${ssrInterpolate(unref(copy).uses)}</h2><ul data-v-89bbcd68><!--[-->`);
      ssrRenderList(unref(pedagogy).uses, (use) => {
        _push(`<li data-v-89bbcd68>${ssrInterpolate(use)}</li>`);
      });
      _push(`<!--]--></ul></section><section class="tense-page__endings" data-v-89bbcd68><header data-v-89bbcd68><h2 data-v-89bbcd68>${ssrInterpolate(unref(copy).endings)}</h2><p data-v-89bbcd68>${ssrInterpolate(unref(endingsGuide).intro)}</p></header>`);
      if (unref(endingPronouns).length && unref(endingTableGroups).length) {
        _push(`<div class="tense-page__table-wrap" data-v-89bbcd68><table data-v-89bbcd68><thead data-v-89bbcd68><tr data-v-89bbcd68><th scope="col" data-v-89bbcd68>Pronom</th><!--[-->`);
        ssrRenderList(unref(endingTableGroups), (group) => {
          _push(`<th scope="col" data-v-89bbcd68>${ssrInterpolate(group.label)}</th>`);
        });
        _push(`<!--]--></tr></thead><tbody data-v-89bbcd68><!--[-->`);
        ssrRenderList(unref(endingPronouns), (pronoun, index) => {
          _push(`<tr data-v-89bbcd68><th scope="row" data-v-89bbcd68>${ssrInterpolate(pronoun)}</th><!--[-->`);
          ssrRenderList(unref(endingTableGroups), (group) => {
            _push(`<td data-v-89bbcd68><strong data-v-89bbcd68>${ssrInterpolate(endingForms(group.endings)[index])}</strong></td>`);
          });
          _push(`<!--]--></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(endingReferenceGroups).length) {
        _push(`<div class="tense-page__table-wrap tense-page__table-wrap--reference" data-v-89bbcd68><table data-v-89bbcd68><thead data-v-89bbcd68><tr data-v-89bbcd68><th scope="col" data-v-89bbcd68>Groupe ou élément</th><th scope="col" data-v-89bbcd68>Terminaison ou construction</th><th scope="col" data-v-89bbcd68>Exemple</th></tr></thead><tbody data-v-89bbcd68><!--[-->`);
        ssrRenderList(unref(endingReferenceGroups), (group) => {
          _push(`<tr data-v-89bbcd68><th scope="row" data-v-89bbcd68>${ssrInterpolate(group.label)}</th><td data-v-89bbcd68><strong data-v-89bbcd68>${ssrInterpolate(group.endings)}</strong></td><td data-v-89bbcd68>${ssrInterpolate(group.example)}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="tense-page__ending-notes" data-v-89bbcd68><!--[-->`);
      ssrRenderList(unref(endingsGuide).groups.filter((item) => item.note), (group) => {
        _push(`<p data-v-89bbcd68><strong data-v-89bbcd68>${ssrInterpolate(group.label)} :</strong> ${ssrInterpolate(group.note)}</p>`);
      });
      _push(`<!--]--></div></section><section class="tense-page__examples"${ssrRenderAttr("aria-labelledby", `${unref(modeSlug)}-${unref(tenseSlug)}-examples`)} data-v-89bbcd68><header data-v-89bbcd68><p data-v-89bbcd68>02</p><div data-v-89bbcd68><h2${ssrRenderAttr("id", `${unref(modeSlug)}-${unref(tenseSlug)}-examples`)} data-v-89bbcd68>${ssrInterpolate(unref(copy).examples)}</h2><p data-v-89bbcd68>${ssrInterpolate(unref(copy).examplesIntro)}</p></div></header><div data-v-89bbcd68><!--[-->`);
      ssrRenderList(unref(pedagogy).examples, (example, index) => {
        _push(`<article data-v-89bbcd68><p class="tense-page__example-label" data-v-89bbcd68>${ssrInterpolate(unref(copy).example)} ${ssrInterpolate(String(index + 1).padStart(2, "0"))}</p><blockquote data-v-89bbcd68>${ssrInterpolate(example.sentence)}</blockquote><dl data-v-89bbcd68><div data-v-89bbcd68><dt data-v-89bbcd68>${ssrInterpolate(unref(copy).context)}</dt><dd data-v-89bbcd68>${ssrInterpolate(example.context)}</dd></div><div data-v-89bbcd68><dt data-v-89bbcd68>${ssrInterpolate(unref(copy).reason)}</dt><dd data-v-89bbcd68>${ssrInterpolate(example.reason)}</dd></div></dl></article>`);
      });
      _push(`<!--]--></div></section></div><footer class="tense-page__actions" data-v-89bbcd68>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "tense-page__footer-back",
        to: unref(learnUrl)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span aria-hidden="true" data-v-89bbcd68${_scopeId}>←</span> ${ssrInterpolate(unref(copy).back)}`);
          } else {
            return [
              createVNode("span", { "aria-hidden": "true" }, "←"),
              createTextVNode(" " + toDisplayString(unref(copy).back), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "is-primary",
        to: unref(exerciseUrl)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(copy).practise)} <span aria-hidden="true" data-v-89bbcd68${_scopeId}>→</span>`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(copy).practise) + " ", 1),
              createVNode("span", { "aria-hidden": "true" }, "→")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</footer></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/modes/[mode]/[temps].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _temps_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-89bbcd68"]]);

export { _temps_ as default };
//# sourceMappingURL=_temps_-BkkPpQEC.mjs.map

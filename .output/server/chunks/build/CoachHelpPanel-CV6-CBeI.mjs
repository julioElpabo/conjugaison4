import { defineComponent, useTemplateRef, ref, computed, watch, mergeProps, unref, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderComponent, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { b as COACH_EXPLANATION_APPROACHES } from '../_/coach.mjs';
import { c as coachHelpProfile, d as decomposeConjugationForm, e as buildConjugationEndingsHtml, f as buildConjugationBaseHtml, g as buildPassiveVoiceHelpHtml, h as buildPassiveVoiceMethodHtml, i as buildCompleteConjugationAdviceHtml, n as normalizeCoachHelpEngineKey, a as auditRenderedCoachHelp } from '../_/coach-help-audit.mjs';
import { ap as grammarModeCode } from '../nitro/nitro.mjs';
import { a as bareNearFutureInfinitive, n as nearFutureReflexivePronoun, c as isPronominalNearFutureInfinitive, i as isNearFutureTense } from '../_/near-future.mjs';
import { f as useLanguagePreferences } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const COACH_CONDENSED_TENSE_RULES = {
  "indicatif:present": {
    label: "Indicatif pr\xE9sent",
    rule: "Radical du pr\xE9sent, parfois variable + terminaison de la personne.",
    example: "chant- + -ons = chantons"
  },
  "indicatif:futur proche": {
    label: "Futur proche",
    rule: "Verbe \xAB aller \xBB au pr\xE9sent + infinitif du verbe.",
    notes: ["Ce n'est pas un temps comme les autres. Il est utilis\xE9 pour une action proche."],
    example: "je vais + chanter = je vais chanter"
  },
  "indicatif:imparfait": {
    label: "Indicatif imparfait",
    rule: "Forme avec \xAB nous \xBB au pr\xE9sent, sans \xAB -ons \xBB + terminaison de l\u2019imparfait.",
    notes: ["Exception : \xEAtre \u2192 \xE9t-."],
    example: "nous chantons \u2192 chant- + -ait = chantait"
  },
  "indicatif:futur": {
    label: "Indicatif futur",
    rule: "Radical du futur, souvent l\u2019infinitif sans le \xAB e \xBB final des verbes en \xAB -re \xBB + terminaison du futur.",
    example: "chanter- + -ons = chanterons"
  },
  "indicatif:passe simple": {
    label: "Indicatif pass\xE9 simple",
    rule: "Radical du pass\xE9 simple + terminaison de sa s\xE9rie.",
    example: "chant- + -\xE8rent = chant\xE8rent"
  },
  "indicatif:passe compose": {
    label: "Indicatif pass\xE9 compos\xE9",
    rule: "Auxiliaire au pr\xE9sent + participe pass\xE9.",
    example: "il a + chant\xE9 = il a chant\xE9"
  },
  "indicatif:futur anterieur": {
    label: "Indicatif futur ant\xE9rieur",
    rule: "Auxiliaire au futur + participe pass\xE9.",
    example: "il aura + chant\xE9 = il aura chant\xE9"
  },
  "indicatif:plus-que-parfait": {
    label: "Indicatif plus-que-parfait",
    rule: "Auxiliaire \xE0 l\u2019imparfait + participe pass\xE9.",
    example: "il avait + chant\xE9 = il avait chant\xE9"
  },
  "indicatif:passe anterieur": {
    label: "Indicatif pass\xE9 ant\xE9rieur",
    rule: "Auxiliaire au pass\xE9 simple + participe pass\xE9.",
    example: "il eut + chant\xE9 = il eut chant\xE9"
  },
  "imperatif:present": {
    label: "Imp\xE9ratif pr\xE9sent",
    rule: "Forme du pr\xE9sent avec \xAB tu \xBB, \xAB nous \xBB ou \xAB vous \xBB, sans le sujet.",
    notes: ["Avec \xAB tu \xBB des verbes en \xAB -er \xBB, enl\xE8ve g\xE9n\xE9ralement le \xAB s \xBB."],
    example: "tu chantes \u2192 chante !"
  },
  "imperatif:passe": {
    label: "Imp\xE9ratif pass\xE9",
    rule: "Auxiliaire \xE0 l\u2019imp\xE9ratif pr\xE9sent + participe pass\xE9.",
    example: "aie + chant\xE9 = aie chant\xE9 !"
  },
  "subjonctif:present": {
    label: "Subjonctif pr\xE9sent",
    rule: "Formes avec \xAB ils \xBB et \xAB nous \xBB au pr\xE9sent, sans \xAB -ent \xBB ou \xAB -ons \xBB + terminaison du subjonctif.",
    example: "ils chantent \u2192 chant- + -ions = que nous chantions"
  },
  "subjonctif:passe": {
    label: "Subjonctif pass\xE9",
    rule: "Auxiliaire au subjonctif pr\xE9sent + participe pass\xE9.",
    example: "qu\u2019il ait + chant\xE9 = qu\u2019il ait chant\xE9"
  },
  "subjonctif:imparfait": {
    label: "Subjonctif imparfait",
    rule: "Prends la forme avec \xAB il \xBB au pass\xE9 simple.",
    notes: ["Enl\xE8ve le \xAB t \xBB final s\u2019il y en a.", "Puis ajoute la terminaison du subjonctif imparfait."],
    example: "il finit \u2192 fini- + -sse = que je finisse"
  },
  "subjonctif:plus-que-parfait": {
    label: "Subjonctif plus-que-parfait",
    rule: "Auxiliaire au subjonctif imparfait + participe pass\xE9.",
    example: "qu\u2019il e\xFBt + chant\xE9 = qu\u2019il e\xFBt chant\xE9"
  },
  "conditionnel:present": {
    label: "Conditionnel pr\xE9sent",
    rule: "Radical du futur + terminaison de l\u2019imparfait.",
    example: "chanter- + -ait = chanterait"
  },
  "conditionnel:passe 1": {
    label: "Conditionnel pass\xE9, premi\xE8re forme",
    rule: "Auxiliaire au conditionnel pr\xE9sent + participe pass\xE9.",
    example: "il aurait + chant\xE9 = il aurait chant\xE9"
  },
  "conditionnel:passe 2": {
    label: "Conditionnel pass\xE9, deuxi\xE8me forme",
    rule: "Auxiliaire au subjonctif imparfait + participe pass\xE9.",
    example: "il e\xFBt + chant\xE9 = il e\xFBt chant\xE9"
  },
  "participe:present": {
    label: "Participe pr\xE9sent",
    rule: "Forme avec \xAB nous \xBB au pr\xE9sent, sans \xAB -ons \xBB + \xAB -ant \xBB.",
    example: "nous chantons \u2192 chant- + -ant = chantant"
  },
  "participe:passe": {
    label: "Participe pass\xE9",
    rule: "Le participe pass\xE9 est une forme \xE0 apprendre.",
    notes: ["Il est utilis\xE9 dans les temps compos\xE9s."],
    example: "chanter \u2192 chant\xE9"
  },
  "gerondif:present": {
    label: "G\xE9rondif pr\xE9sent",
    rule: "\xAB en \xBB + participe pr\xE9sent.",
    example: "en + chantant = en chantant"
  },
  "gerondif:passe": {
    label: "G\xE9rondif pass\xE9",
    rule: "\xAB en \xBB + participe pr\xE9sent de l\u2019auxiliaire + participe pass\xE9.",
    example: "en + ayant + chant\xE9 = en ayant chant\xE9"
  }
};
function normalizedRulePart(value) {
  return (value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLocaleLowerCase("fr");
}
function coachCondensedTenseRule(mode, tense) {
  const key = `${normalizedRulePart(mode)}:${normalizedRulePart(tense)}`;
  return COACH_CONDENSED_TENSE_RULES[key] || {
    label: [mode, tense].filter(Boolean).join(" \xB7 ") || "Conjugaison",
    rule: "Rep\xE8re le mode et le temps, puis construis la forme avec le radical et la terminaison adapt\xE9s.",
    example: "chant- + -ons = chantons"
  };
}

const modeNames = {
  de: { indicatif: "Indikativ", imperatif: "Imperativ", subjonctif: "Subjunktiv", conditionnel: "Konditional", participe: "Partizip", gerondif: "Gerundium" },
  en: { indicatif: "Indicative", imperatif: "Imperative", subjonctif: "Subjunctive", conditionnel: "Conditional", participe: "Participle", gerondif: "Gerund" },
  it: { indicatif: "Indicativo", imperatif: "Imperativo", subjonctif: "Congiuntivo", conditionnel: "Condizionale", participe: "Participio", gerondif: "Gerundio" },
  es: { indicatif: "Indicativo", imperatif: "Imperativo", subjonctif: "Subjuntivo", conditionnel: "Condicional", participe: "Participio", gerondif: "Gerundio" }
};
const tenseNames = {
  de: { present: "Pr\xE4sens", "futur proche": "nahes Futur", imparfait: "Imparfait", futur: "Futur", "passe simple": "Pass\xE9 simple", "passe compose": "Pass\xE9 compos\xE9", "futur anterieur": "Futur ant\xE9rieur", "plus-que-parfait": "Plusquamperfekt", "passe anterieur": "Pass\xE9 ant\xE9rieur", passe: "Vergangenheit", "passe 1": "Vergangenheit, erste Form", "passe 2": "Vergangenheit, zweite Form" },
  en: { present: "present", "futur proche": "near future", imparfait: "imperfect", futur: "future", "passe simple": "simple past", "passe compose": "compound past", "futur anterieur": "future perfect", "plus-que-parfait": "pluperfect", "passe anterieur": "past anterior", passe: "past", "passe 1": "past, first form", "passe 2": "past, second form" },
  it: { present: "presente", "futur proche": "futuro prossimo", imparfait: "imperfetto", futur: "futuro", "passe simple": "passato remoto", "passe compose": "passato prossimo", "futur anterieur": "futuro anteriore", "plus-que-parfait": "trapassato prossimo", "passe anterieur": "passato anteriore", passe: "passato", "passe 1": "passato, prima forma", "passe 2": "passato, seconda forma" },
  es: { present: "presente", "futur proche": "futuro pr\xF3ximo", imparfait: "imperfecto", futur: "futuro", "passe simple": "pasado simple", "passe compose": "pasado compuesto", "futur anterieur": "futuro anterior", "plus-que-parfait": "pluscuamperfecto", "passe anterieur": "pasado anterior", passe: "pasado", "passe 1": "pasado, primera forma", "passe 2": "pasado, segunda forma" }
};
const rules = {
  "indicatif:present": { de: "Pr\xE4sensstamm, manchmal ver\xE4nderlich, + Personalendung.", en: "Present-tense stem, which may vary, + the personal ending.", it: "Radice del presente, talvolta variabile, + desinenza della persona.", es: "Ra\xEDz del presente, a veces variable, + terminaci\xF3n de la persona." },
  "indicatif:futur proche": { de: "\xAB aller \xBB im Pr\xE4sens + Infinitiv des Verbs.", en: "\xAB aller \xBB in the present tense + verb infinitive.", it: "\xAB aller \xBB al presente + infinito del verbo.", es: "\xAB aller \xBB en presente + infinitivo del verbo." },
  "indicatif:imparfait": { de: "Form mit \xAB nous \xBB im Pr\xE4sens ohne \xAB -ons \xBB + Imparfait-Endung.", en: "Present-tense \xAB nous \xBB form without \xAB -ons \xBB + imperfect ending.", it: "Forma con \xAB nous \xBB al presente senza \xAB -ons \xBB + desinenza dell\u2019imperfetto.", es: "Forma de \xAB nous \xBB en presente sin \xAB -ons \xBB + terminaci\xF3n del imperfecto." },
  "indicatif:futur": { de: "Futurstamm, meist der Infinitiv ohne das letzte \xAB e \xBB bei Verben auf \xAB -re \xBB, + Futurendung.", en: "Future stem, usually the infinitive without the final \xAB e \xBB of \xAB -re \xBB verbs, + future ending.", it: "Radice del futuro, spesso l\u2019infinito senza la \xAB e \xBB finale dei verbi in \xAB -re \xBB, + desinenza del futuro.", es: "Ra\xEDz del futuro, normalmente el infinitivo sin la \xAB e \xBB final de los verbos en \xAB -re \xBB, + terminaci\xF3n del futuro." },
  "indicatif:passe simple": { de: "Stamm des Pass\xE9 simple + Endung der entsprechenden Reihe.", en: "Simple-past stem + the ending from its pattern.", it: "Radice del passato remoto + desinenza della serie corrispondente.", es: "Ra\xEDz del pasado simple + terminaci\xF3n de su serie." },
  "indicatif:passe compose": { de: "Hilfsverb im Pr\xE4sens + Partizip Perfekt.", en: "Auxiliary in the present tense + past participle.", it: "Ausiliare al presente + participio passato.", es: "Auxiliar en presente + participio pasado." },
  "indicatif:futur anterieur": { de: "Hilfsverb im Futur + Partizip Perfekt.", en: "Auxiliary in the future tense + past participle.", it: "Ausiliare al futuro + participio passato.", es: "Auxiliar en futuro + participio pasado." },
  "indicatif:plus-que-parfait": { de: "Hilfsverb im Imparfait + Partizip Perfekt.", en: "Auxiliary in the imperfect + past participle.", it: "Ausiliare all\u2019imperfetto + participio passato.", es: "Auxiliar en imperfecto + participio pasado." },
  "indicatif:passe anterieur": { de: "Hilfsverb im Pass\xE9 simple + Partizip Perfekt.", en: "Auxiliary in the simple past + past participle.", it: "Ausiliare al passato remoto + participio passato.", es: "Auxiliar en pasado simple + participio pasado." },
  "imperatif:present": { de: "Pr\xE4sensform mit \xAB tu \xBB, \xAB nous \xBB oder \xAB vous \xBB, ohne Subjekt.", en: "Present-tense form with \xAB tu \xBB, \xAB nous \xBB or \xAB vous \xBB, without the subject.", it: "Forma del presente con \xAB tu \xBB, \xAB nous \xBB o \xAB vous \xBB, senza il soggetto.", es: "Forma del presente con \xAB tu \xBB, \xAB nous \xBB o \xAB vous \xBB, sin el sujeto." },
  "imperatif:passe": { de: "Hilfsverb im Imperativ Pr\xE4sens + Partizip Perfekt.", en: "Auxiliary in the present imperative + past participle.", it: "Ausiliare all\u2019imperativo presente + participio passato.", es: "Auxiliar en imperativo presente + participio pasado." },
  "subjonctif:present": { de: "Pr\xE4sensformen mit \xAB ils \xBB und \xAB nous \xBB ohne \xAB -ent \xBB bzw. \xAB -ons \xBB + Subjunktivendung.", en: "Present-tense \xAB ils \xBB and \xAB nous \xBB forms without \xAB -ent \xBB or \xAB -ons \xBB + subjunctive ending.", it: "Forme del presente con \xAB ils \xBB e \xAB nous \xBB senza \xAB -ent \xBB o \xAB -ons \xBB + desinenza del congiuntivo.", es: "Formas de presente con \xAB ils \xBB y \xAB nous \xBB sin \xAB -ent \xBB o \xAB -ons \xBB + terminaci\xF3n del subjuntivo." },
  "subjonctif:passe": { de: "Hilfsverb im Subjunktiv Pr\xE4sens + Partizip Perfekt.", en: "Auxiliary in the present subjunctive + past participle.", it: "Ausiliare al congiuntivo presente + participio passato.", es: "Auxiliar en subjuntivo presente + participio pasado." },
  "subjonctif:imparfait": { de: "Nimm die Form mit \xAB il \xBB im Pass\xE9 simple.", en: "Use the \xAB il \xBB form in the simple past.", it: "Prendi la forma con \xAB il \xBB al passato remoto.", es: "Toma la forma con \xAB il \xBB en pasado simple." },
  "subjonctif:plus-que-parfait": { de: "Hilfsverb im Subjunktiv Imparfait + Partizip Perfekt.", en: "Auxiliary in the imperfect subjunctive + past participle.", it: "Ausiliare al congiuntivo imperfetto + participio passato.", es: "Auxiliar en subjuntivo imperfecto + participio pasado." },
  "conditionnel:present": { de: "Futurstamm + Imparfait-Endung.", en: "Future stem + imperfect ending.", it: "Radice del futuro + desinenza dell\u2019imperfetto.", es: "Ra\xEDz del futuro + terminaci\xF3n del imperfecto." },
  "conditionnel:passe 1": { de: "Hilfsverb im Konditional Pr\xE4sens + Partizip Perfekt.", en: "Auxiliary in the present conditional + past participle.", it: "Ausiliare al condizionale presente + participio passato.", es: "Auxiliar en condicional presente + participio pasado." },
  "conditionnel:passe 2": { de: "Hilfsverb im Subjunktiv Imparfait + Partizip Perfekt.", en: "Auxiliary in the imperfect subjunctive + past participle.", it: "Ausiliare al congiuntivo imperfetto + participio passato.", es: "Auxiliar en subjuntivo imperfecto + participio pasado." },
  "participe:present": { de: "Pr\xE4sensform mit \xAB nous \xBB ohne \xAB -ons \xBB + \xAB -ant \xBB.", en: "Present-tense \xAB nous \xBB form without \xAB -ons \xBB + \xAB -ant \xBB.", it: "Forma del presente con \xAB nous \xBB senza \xAB -ons \xBB + \xAB -ant \xBB.", es: "Forma de presente con \xAB nous \xBB sin \xAB -ons \xBB + \xAB -ant \xBB." },
  "participe:passe": { de: "Das Partizip Perfekt ist eine Form, die gelernt werden muss.", en: "The past participle is a form that must be learnt.", it: "Il participio passato \xE8 una forma da imparare.", es: "El participio pasado es una forma que hay que aprender." },
  "gerondif:present": { de: "\xAB en \xBB + Partizip Pr\xE4sens.", en: "\xAB en \xBB + present participle.", it: "\xAB en \xBB + participio presente.", es: "\xAB en \xBB + participio presente." },
  "gerondif:passe": { de: "\xAB en \xBB + Partizip Pr\xE4sens des Hilfsverbs + Partizip Perfekt.", en: "\xAB en \xBB + present participle of the auxiliary + past participle.", it: "\xAB en \xBB + participio presente dell\u2019ausiliare + participio passato.", es: "\xAB en \xBB + participio presente del auxiliar + participio pasado." }
};
const noteTranslations = {
  "Ce n'est pas un temps comme les autres. Il est utilis\xE9 pour une action proche.": { de: "Diese Zeitform bezeichnet eine Handlung in naher Zukunft.", en: "This tense describes an action in the near future.", it: "Questo tempo indica un\u2019azione nel futuro prossimo.", es: "Este tiempo indica una acci\xF3n en un futuro pr\xF3ximo." },
  "Exception : \xEAtre \u2192 \xE9t-.": { de: "Ausnahme: \xEAtre \u2192 \xE9t-.", en: "Exception: \xEAtre \u2192 \xE9t-.", it: "Eccezione: \xEAtre \u2192 \xE9t-.", es: "Excepci\xF3n: \xEAtre \u2192 \xE9t-." },
  "Avec \xAB tu \xBB des verbes en \xAB -er \xBB, enl\xE8ve g\xE9n\xE9ralement le \xAB s \xBB.": { de: "Bei \xAB tu \xBB f\xE4llt bei Verben auf \xAB -er \xBB das \xAB s \xBB normalerweise weg.", en: "With \xAB tu \xBB, usually remove the \xAB s \xBB from \xAB -er \xBB verbs.", it: "Con \xAB tu \xBB, nei verbi in \xAB -er \xBB elimina generalmente la \xAB s \xBB.", es: "Con \xAB tu \xBB, en los verbos en \xAB -er \xBB se suele quitar la \xAB s \xBB." },
  "Enl\xE8ve le \xAB t \xBB final s\u2019il y en a.": { de: "Entferne ein eventuell vorhandenes \xAB t \xBB am Ende.", en: "Remove the final \xAB t \xBB if there is one.", it: "Togli la \xAB t \xBB finale, se presente.", es: "Quita la \xAB t \xBB final, si la hay." },
  "Puis ajoute la terminaison du subjonctif imparfait.": { de: "F\xFCge dann die Endung des Subjunktiv Imparfait hinzu.", en: "Then add the imperfect-subjunctive ending.", it: "Poi aggiungi la desinenza del congiuntivo imperfetto.", es: "Despu\xE9s a\xF1ade la terminaci\xF3n del subjuntivo imperfecto." },
  "Il est utilis\xE9 dans les temps compos\xE9s.": { de: "Es wird in den zusammengesetzten Zeitformen verwendet.", en: "It is used in compound tenses.", it: "Si usa nei tempi composti.", es: "Se utiliza en los tiempos compuestos." },
  "Ne construis pas sa r\xE9ponse \xE0 partir de la forme habituelle du pr\xE9sent.": { de: "Bilde die Antwort nicht aus der \xFCblichen Pr\xE4sensform.", en: "Do not build the answer from the usual present-tense form.", it: "Non costruire la risposta partendo dalla forma abituale del presente.", es: "No construyas la respuesta a partir de la forma habitual del presente." },
  "La r\xE8gle \xAB nous au pr\xE9sent sans -ons \xBB ne fonctionne pas pour ce verbe.": { de: "Die Regel \xAB nous im Pr\xE4sens ohne -ons \xBB funktioniert bei diesem Verb nicht.", en: "The \u201Cpresent-tense nous form without -ons\u201D rule does not work for this verb.", it: "La regola \xAB nous al presente senza -ons \xBB non funziona per questo verbo.", es: "La regla \xAB nous en presente sin -ons \xBB no funciona con este verbo." },
  "Exception : le participe pr\xE9sent de ce verbe est irr\xE9gulier et doit \xEAtre appris par c\u0153ur.": { de: "Ausnahme: Das Partizip Pr\xE4sens dieses Verbs ist unregelm\xE4\xDFig und muss auswendig gelernt werden.", en: "Exception: this verb has an irregular present participle that must be learnt by heart.", it: "Eccezione: il participio presente di questo verbo \xE8 irregolare e va imparato a memoria.", es: "Excepci\xF3n: el participio presente de este verbo es irregular y debe aprenderse de memoria." },
  "Avec un verbe pronominal, place \xAB me, te, se, nous, vous, se \xBB devant l\u2019infinitif.": { de: "Bei einem reflexiven Verb stehen \xAB me, te, se, nous, vous, se \xBB vor dem Infinitiv.", en: "With a pronominal verb, place \xAB me, te, se, nous, vous, se \xBB before the infinitive.", it: "Con un verbo pronominale, metti \xAB me, te, se, nous, vous, se \xBB davanti all\u2019infinito.", es: "Con un verbo pronominal, coloca \xAB me, te, se, nous, vous, se \xBB delante del infinitivo." },
  "Avec un verbe pronominal, v\xE9rifie l\u2019accord du participe pass\xE9 : il d\xE9pend de la fonction du pronom et d\u2019un \xE9ventuel COD.": { de: "Pr\xFCfe bei einem reflexiven Verb die Angleichung des Partizips Perfekt: Sie h\xE4ngt von der Funktion des Pronomens und einem m\xF6glichen direkten Objekt ab.", en: "With a pronominal verb, check past-participle agreement: it depends on the pronoun\u2019s function and any direct object.", it: "Con un verbo pronominale, verifica la concordanza del participio passato: dipende dalla funzione del pronome e da un eventuale complemento oggetto.", es: "Con un verbo pronominal, comprueba la concordancia del participio pasado: depende de la funci\xF3n del pronombre y de un posible complemento directo." },
  "Avec \xAB \xEAtre \xBB, le participe pass\xE9 s\u2019accorde avec le sujet.": { de: "Mit \xAB \xEAtre \xBB wird das Partizip Perfekt an das Subjekt angeglichen.", en: "With \xAB \xEAtre \xBB, the past participle agrees with the subject.", it: "Con \xAB \xEAtre \xBB, il participio passato concorda con il soggetto.", es: "Con \xAB \xEAtre \xBB, el participio pasado concuerda con el sujeto." }
};
const ruleOverrides = {
  "Exception : ce verbe a des formes particuli\xE8res \xE0 l\u2019imp\xE9ratif, \xE0 apprendre par c\u0153ur.": { de: "Ausnahme: Dieses Verb hat besondere Imperativformen, die auswendig gelernt werden m\xFCssen.", en: "Exception: this verb has special imperative forms that must be learnt by heart.", it: "Eccezione: questo verbo ha forme particolari all\u2019imperativo, da imparare a memoria.", es: "Excepci\xF3n: este verbo tiene formas especiales de imperativo que deben aprenderse de memoria." },
  "Exception : ce verbe a un participe pr\xE9sent irr\xE9gulier, \xE0 apprendre par c\u0153ur.": { de: "Ausnahme: Dieses Verb hat ein unregelm\xE4\xDFiges Partizip Pr\xE4sens, das auswendig gelernt werden muss.", en: "Exception: this verb has an irregular present participle that must be learnt by heart.", it: "Eccezione: questo verbo ha un participio presente irregolare, da imparare a memoria.", es: "Excepci\xF3n: este verbo tiene un participio presente irregular que debe aprenderse de memoria." }
};
function localizedCondensedTenseRule(locale, key, source) {
  var _a, _b, _c;
  if (locale === "fr") return source;
  const [mode = "", tense = ""] = key.split(":");
  const modeLabel = modeNames[locale][mode] || mode;
  const tenseLabel = tenseNames[locale][tense] || tense;
  return {
    ...source,
    label: `${modeLabel} ${tenseLabel}`.trim(),
    rule: ((_a = ruleOverrides[source.rule]) == null ? void 0 : _a[locale]) || ((_b = rules[key]) == null ? void 0 : _b[locale]) || source.rule,
    notes: (_c = source.notes) == null ? void 0 : _c.map((note) => {
      var _a2;
      return ((_a2 = noteTranslations[note]) == null ? void 0 : _a2[locale]) || note;
    })
  };
}
const condensedExampleLabel = {
  fr: "Exemple :",
  de: "Beispiel:",
  en: "Example:",
  it: "Esempio:",
  es: "Ejemplo:"
};

function areOnlyIndicativeTenses(tenses) {
  return tenses.length > 0 && tenses.every((tense) => {
    var _a, _b;
    return ((_a = tense.mode) == null ? void 0 : _a.code) === "indicative" || grammarModeCode((_b = tense.mode) == null ? void 0 : _b.name) === "indicative";
  });
}
function withoutIndicativeMode(value) {
  return value.replace(/\s*\(\s*indicatif\s*\)/giu, "").replace(/\b(?:du\s+indicatif|de\s+l[’']indicatif)\b/giu, "").replace(/\b(?:le\s+)?mode\s+indicatif\s+(?:et|,)\s+(?:le\s+)?temps\s+/giu, (match) => /^\p{Lu}/u.test(match) ? "Le temps " : "le temps ").replace(/\bindicatif\s*([·–—-])\s*/giu, "").replace(/([·–—-])\s*indicatif\b/giu, "").replace(/\bindicatif\b/giu, "").replace(/[ \t]+(<\/(?:b|em|figcaption|strong)>)/giu, "$1").replace(/[ \t]+([,.;:!?])/gu, "$1").replace(/[ \t]{2,}/gu, " ").replace(/[ \t]+\n/gu, "\n").trim();
}

function automaticCoachHelpApproach(help) {
  var _a, _b, _c;
  if (typeof help === "string") return normalizeCoachHelpEngineKey(help);
  const profileId = (_a = help == null ? void 0 : help.blocks.find((block) => block.profileId)) == null ? void 0 : _a.profileId;
  if (profileId) return profileId;
  const legacy = ((_b = help == null ? void 0 : help.blocks.find((block) => block.content.trim() === "{contextualBaseHelp}")) == null ? void 0 : _b.explanationApproach) || ((_c = help == null ? void 0 : help.blocks.find((block) => COACH_EXPLANATION_APPROACHES.includes(block.explanationApproach))) == null ? void 0 : _c.explanationApproach);
  return normalizeCoachHelpEngineKey(legacy);
}
const AUTOMATIC_BLOCKS = {
  definition: { type: "normal", title: "D\xE9finition", content: "{definitionHelp}" },
  "complete-with-answers": { type: "normal", title: "", content: "{contextualBaseHelp}" },
  "complete-advice": { type: "normal", title: "", content: "{completeAdviceHelp}" },
  "condensed-verb-group": { type: "normal", title: "Groupe du verbe", content: "{condensedVerbGroupHelp}" },
  "condensed-tense-rule": { type: "normal", title: "", content: "{condensedTenseRuleHelp}" }
};
function defaultCoachHelpBlocks(approach = "complete-avec-reponses") {
  const profile = coachHelpProfile(approach);
  return profile.blocks.map((blockId, index) => ({
    id: -8001 - index,
    ...AUTOMATIC_BLOCKS[blockId],
    explanationApproach: profile.legacyPresentation,
    profileId: profile.id,
    isActive: true,
    sortOrder: index + 1,
    children: []
  }));
}
const NEAR_FUTURE_CORE_TOKENS = /* @__PURE__ */ new Set([
  "{contextualBaseHelp}",
  "{completeAdviceHelp}",
  "{condensedVerbGroupHelp}",
  "{condensedTenseRuleHelp}"
]);
const PASSIVE_METHOD_BLOCK_ID = -8103;
const PASSIVE_HELP_BLOCK_ID = -8104;
function visibleCoachHelpBlocks(help, context) {
  const blocks = defaultCoachHelpBlocks(automaticCoachHelpApproach(help));
  const profile = coachHelpProfile(automaticCoachHelpApproach(help));
  const isPassive = (context == null ? void 0 : context.voice) === "passive";
  const isNearFuture = Boolean(context && isNearFutureTense({ code: context.tenseCode, name: context.temps }));
  if (!isPassive && !isNearFuture) return blocks;
  const result = blocks.filter((block) => !NEAR_FUTURE_CORE_TOKENS.has(block.content.trim()));
  if (isPassive) result.push(
    {
      id: PASSIVE_METHOD_BLOCK_ID,
      type: "normal",
      title: "Marche \xE0 suivre",
      content: profile.revealsAnswers ? "{passiveVoiceMethodHelp}" : "{passiveVoiceMethodAdviceHelp}",
      explanationApproach: profile.legacyPresentation,
      profileId: profile.id,
      isActive: true,
      sortOrder: result.length + 1,
      children: []
    },
    {
      id: PASSIVE_HELP_BLOCK_ID,
      type: "info",
      title: "Comprendre la voix passive",
      content: profile.revealsAnswers ? "{passiveVoiceHelp}" : profile.id === "tres-condensee" ? "{passiveVoiceCondensedHelp}" : "{passiveVoiceAdviceHelp}",
      explanationApproach: profile.legacyPresentation,
      profileId: profile.id,
      isActive: true,
      sortOrder: result.length + 2,
      children: []
    }
  );
  if (isNearFuture) result.push(
    {
      id: -8101,
      type: "normal",
      title: "Futur proche",
      content: "{nearFutureHelp}",
      explanationApproach: profile.legacyPresentation,
      profileId: profile.id,
      isActive: true,
      sortOrder: blocks.length + 1,
      children: []
    },
    {
      id: -8102,
      type: "normal",
      title: "Verbe aller",
      content: "{nearFutureAllerHelp}",
      explanationApproach: profile.legacyPresentation,
      profileId: profile.id,
      isActive: true,
      sortOrder: blocks.length + 2,
      children: []
    }
  );
  return result;
}
function literaryIdentificationCoachHelpBlocks() {
  const mode = (id, title, description, examples) => ({
    id,
    type: "info",
    title,
    content: `<p>${description}</p><p><strong>Exemples :</strong> ${examples}</p>`,
    explanationApproach: "cif-falc",
    profileId: "complete",
    isActive: true,
    sortOrder: id,
    children: []
  });
  return [
    {
      id: -8201,
      type: "normal",
      title: "D\xE9finition du verbe",
      content: "{definitionHelp}",
      explanationApproach: "cif-falc",
      profileId: "complete",
      isActive: true,
      sortOrder: 1,
      children: []
    },
    {
      id: -8202,
      type: "normal",
      title: "Reconna\xEEtre les modes",
      content: "<p>Observe ce que la forme verbale exprime dans la phrase.</p>",
      explanationApproach: "cif-falc",
      profileId: "complete",
      isActive: true,
      sortOrder: 2,
      children: [
        mode(-8211, "Indicatif", "Il pr\xE9sente un fait, une action ou une situation comme r\xE9elle ou certaine.", "<em>Il arrive.</em> \xB7 <em>Il arrivait.</em> \xB7 <em>Il arrivera.</em>"),
        mode(-8212, "Subjonctif", "Il exprime souvent un souhait, une n\xE9cessit\xE9, un doute ou une possibilit\xE9. Il est fr\xE9quemment introduit par \xAB que \xBB.", "<em>Il faut qu\u2019il arrive.</em> \xB7 <em>Je souhaite qu\u2019il vienne.</em>"),
        mode(-8213, "Conditionnel", "Il exprime une action soumise \xE0 une condition, une hypoth\xE8se ou une information incertaine.", "<em>Il arriverait s\u2019il pouvait.</em> \xB7 <em>Elle viendrait peut-\xEAtre.</em>"),
        mode(-8214, "Imp\xE9ratif", "Il sert \xE0 donner un ordre, un conseil ou une consigne. Le sujet n\u2019est g\xE9n\xE9ralement pas \xE9crit.", "<em>Arrive \xE0 l\u2019heure !</em> \xB7 <em>Prenons le temps.</em>")
      ]
    }
  ];
}
const AUTOMATIC_LETTER_G_HELP_ID = -9001;
const AUTOMATIC_LETTER_C_HELP_ID = -9002;
const AUTOMATIC_COD_BEFORE_HELP_ID = -9003;
const AUTOMATIC_PARTICIPLE_AGREEMENT_HELP_ID = -9004;
const AUTOMATIC_PRONOMINAL_HELP_ID = -9005;
function automaticOrthographyHelpKind(block) {
  if (block.id === AUTOMATIC_LETTER_G_HELP_ID) return "g";
  if (block.id === AUTOMATIC_LETTER_C_HELP_ID) return "c";
  return null;
}
function escapedCoachText(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function bareHelpInfinitive(value = "") {
  return value.trim().toLocaleLowerCase("fr").replace(/^(?:se\s+|s[’']\s*)/u, "");
}
function helpSubjectKey(value) {
  var _a;
  const subject = normalizedGrammar(value).replace(/^(?:que\s+|qu[’'])/u, "");
  if (/^(?:je|j')/u.test(subject)) return "je";
  if (/^tu\b/u.test(subject)) return "tu";
  if (/^(?:il|elle|on|ils|elles)\b/u.test(subject)) return ((_a = subject.match(/^(?:il|elle|on|ils|elles)/u)) == null ? void 0 : _a[0]) || subject;
  if (/^nous\b/u.test(subject)) return "nous";
  if (/^vous\b/u.test(subject)) return "vous";
  return subject;
}
function helpStartsWithVowelSound(value) {
  const first = normalizedGrammar(value).charAt(0);
  return "aeiouy".includes(first);
}
function displayedHelpConjugatedForm(subject, form, infinitive) {
  const cleanSubject = subject.trim();
  const cleanForm = form.trim();
  if (!cleanSubject) return cleanForm.replace(/^./u, (letter) => letter.toLocaleUpperCase("fr"));
  const pronominal = /^(?:se\s+|s['’])/iu.test(infinitive.trim());
  if (pronominal) {
    const key = helpSubjectKey(cleanSubject);
    const reflexive = key === "je" ? helpStartsWithVowelSound(cleanForm) ? "m\u2019" : "me" : key === "tu" ? helpStartsWithVowelSound(cleanForm) ? "t\u2019" : "te" : ["il", "elle", "on", "ils", "elles"].includes(key) ? helpStartsWithVowelSound(cleanForm) ? "s\u2019" : "se" : key === "nous" ? "nous" : key === "vous" ? "vous" : "";
    const separator = reflexive.endsWith("\u2019") ? "" : " ";
    return `${cleanSubject} ${reflexive}${separator}${cleanForm}`.replace(/^./u, (letter) => letter.toLocaleUpperCase("fr"));
  }
  if (helpSubjectKey(cleanSubject) === "je" && helpStartsWithVowelSound(cleanForm)) return `J\u2019${cleanForm}`;
  return `${cleanSubject} ${cleanForm}`.replace(/^./u, (letter) => letter.toLocaleUpperCase("fr"));
}
function automaticLetterBlock(id, title, content) {
  return {
    id,
    type: "normal",
    title,
    content,
    explanationApproach: "cif-falc",
    isActive: true,
    sortOrder: Number.MAX_SAFE_INTEGER,
    children: []
  };
}
function visibleHelpText(value = "") {
  return value.replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim();
}
function letterGHelp(verb, answerText = "") {
  const escapedVerb = escapedCoachText(verb);
  const contextualExample = verb.endsWith("ger") ? /pas besoin de e|suivie de i/iu.test(visibleHelpText(answerText)) ? `<p><strong>Avec ${escapedVerb} :</strong> devant <strong>i</strong>, le <strong>g</strong> fait d\xE9j\xE0 le son \xAB j \xBB. Le <strong>e</strong> n\u2019est donc pas utile dans cette r\xE9ponse.</p>` : `<p><strong>Avec ${escapedVerb} :</strong> on \xE9crit <strong>ge</strong> devant <strong>a</strong> ou <strong>o</strong> pour garder le son \xAB j \xBB.</p>` : `<p><strong>Avec ${escapedVerb} :</strong> le <strong>u</strong> apr\xE8s <strong>g</strong> garde le son \xAB g \xBB.</p>`;
  const rule = verb.endsWith("ger") ? `<p>La lettre <strong>g</strong> fait le son \xAB j \xBB devant <strong>e</strong>, <strong>i</strong> ou <strong>y</strong>.</p>${contextualExample}` : `<p>La lettre <strong>g</strong> peut faire le son \xAB j \xBB devant <strong>e</strong>, <strong>i</strong> ou <strong>y</strong>.</p><p>Pour garder le son \xAB g \xBB, on ajoute souvent un <strong>u</strong> muet : <em>guitare</em>, <em>guerre</em>.</p>${contextualExample}`;
  return automaticLetterBlock(
    AUTOMATIC_LETTER_G_HELP_ID,
    "La lettre G",
    rule
  );
}
function letterCHelp(verb) {
  const escapedVerb = escapedCoachText(verb);
  return automaticLetterBlock(
    AUTOMATIC_LETTER_C_HELP_ID,
    "La lettre C et la c\xE9dille",
    `<p><strong>La lettre c peut faire deux sons.</strong></p><table><tbody><tr><th>Le son \xAB k \xBB</th><td>caf\xE9 \xB7 colle \xB7 cube \xB7 courir</td></tr><tr><th>Devant e, i ou y : le son \xAB s \xBB</th><td>cerise \xB7 citron \xB7 cygne</td></tr><tr><th>Pour garder le son \xAB s \xBB devant a, o ou u</th><td>Ajoute une c\xE9dille : \xE7a \xB7 gar\xE7on \xB7 re\xE7u</td></tr></tbody></table><p><strong>Avec ${escapedVerb} :</strong> la c\xE9dille sert seulement devant <strong>a</strong>, <strong>o</strong> ou <strong>u</strong>.</p>`
  );
}
function automaticOrthographyHelpBlocks(values) {
  const verb = bareHelpInfinitive(values.verb);
  const text = `${values.correctAnswers || ""} ${visibleHelpText(values.contextualBaseHelp || "")}`;
  const normalizedText = text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("fr");
  if (!verb) return [];
  if (verb.endsWith("ger") && (/\b\p{L}*ge[ao]\p{L}*/iu.test(text) || /pas besoin de e|lettre g est suivie de i/u.test(normalizedText))) return [letterGHelp(verb, text)];
  if (verb.endsWith("guer") && /\b\p{L}*gu\p{L}*/iu.test(text)) return [letterGHelp(verb, text)];
  if (verb.endsWith("cer") && (/\b\p{L}*ç[ao]\p{L}*/iu.test(text) || /cedille ne sert pas|ç redevient c/u.test(normalizedText))) return [letterCHelp(verb)];
  return [];
}
function automaticCodBeforeHelpBlock(values) {
  var _a;
  const cod = ((_a = values.COD) == null ? void 0 : _a.trim()) || "";
  if (!cod || values.isCODplace_avant !== "oui") return [];
  return [{
    id: AUTOMATIC_COD_BEFORE_HELP_ID,
    type: "info",
    title: "Le COD plac\xE9 avant",
    content: `<p><strong>\xAB ${escapedCoachText(cod)} \xBB</strong> est le compl\xE9ment d\u2019objet direct (COD) et il est plac\xE9 avant le verbe.</p><p>Ne le confonds pas avec le sujet : pour conjuguer le verbe, cherche qui fait l\u2019action.</p><p>\xC0 un temps compos\xE9 avec <strong>avoir</strong>, le participe pass\xE9 s\u2019accorde avec le COD lorsqu\u2019il est plac\xE9 avant.</p>`,
    explanationApproach: "cif-falc",
    profileId: "complete",
    isActive: true,
    sortOrder: Number.MAX_SAFE_INTEGER - 1,
    children: []
  }];
}
function automaticParticipleAgreementHelpBlock(values) {
  var _a, _b;
  if (!values.isCompound) return [];
  const cod = ((_a = values.COD) == null ? void 0 : _a.trim()) || "";
  const coi = ((_b = values.COI) == null ? void 0 : _b.trim()) || "";
  if (!cod && !coi) return [];
  const auxiliary = normalizedGrammar(values.auxiliary || "") === "etre" ? "\xEAtre" : "avoir";
  let content = "";
  if (coi) {
    content = `<p><strong>\xAB ${escapedCoachText(coi)} \xBB</strong> est un compl\xE9ment d\u2019objet indirect (COI).</p><p>Un COI ne commande pas l\u2019accord du participe pass\xE9.</p>${auxiliary === "\xEAtre" ? "<p>Avec <strong>\xEAtre</strong>, v\xE9rifie n\xE9anmoins l\u2019accord avec le sujet ou la r\xE8gle propre au verbe pronominal.</p>" : ""}`;
  } else if (values.isCODplace_avant === "oui") {
    content = `<p><strong>\xAB ${escapedCoachText(cod)} \xBB</strong> est un compl\xE9ment d\u2019objet direct (COD) plac\xE9 avant le verbe.</p>${auxiliary === "avoir" ? "<p>Avec <strong>avoir</strong>, le participe pass\xE9 s\u2019accorde avec le COD plac\xE9 avant.</p>" : "<p>Avec <strong>\xEAtre</strong>, v\xE9rifie aussi la r\xE8gle d\u2019accord avec le sujet ou celle du verbe pronominal.</p>"}`;
  } else {
    content = `<p><strong>\xAB ${escapedCoachText(cod)} \xBB</strong> est un compl\xE9ment d\u2019objet direct (COD) plac\xE9 apr\xE8s le verbe.</p>${auxiliary === "avoir" ? "<p>Avec <strong>avoir</strong>, ce COD plac\xE9 apr\xE8s ne commande pas l\u2019accord du participe pass\xE9.</p>" : "<p>Avec <strong>\xEAtre</strong>, v\xE9rifie l\u2019accord avec le sujet ou la r\xE8gle propre au verbe pronominal.</p>"}`;
  }
  return [{
    id: AUTOMATIC_PARTICIPLE_AGREEMENT_HELP_ID,
    type: "info",
    title: "Accord du participe pass\xE9",
    content,
    explanationApproach: "concise",
    profileId: "tres-condensee",
    isActive: true,
    sortOrder: Number.MAX_SAFE_INTEGER,
    children: []
  }];
}
function automaticPronominalHelpBlock(values) {
  var _a;
  if (!((_a = values.pronominalHelp) == null ? void 0 : _a.trim())) return [];
  return [{
    id: AUTOMATIC_PRONOMINAL_HELP_ID,
    type: "info",
    title: "Verbe pronominal",
    content: "{pronominalHelp}",
    explanationApproach: "concise",
    profileId: "tres-condensee",
    isActive: true,
    sortOrder: Number.MAX_SAFE_INTEGER - 1,
    children: []
  }];
}
function conditionalCoachHelpBlocks(profileId, values) {
  const profile = coachHelpProfile(profileId);
  return profile.conditionalBlocks.flatMap((blockId) => {
    if (blockId === "pronominal") return automaticPronominalHelpBlock(values);
    if (blockId === "orthography") return automaticOrthographyHelpBlocks(values);
    if (blockId === "cod-before") return automaticCodBeforeHelpBlock(values);
    if (blockId === "participle-agreement") return automaticParticipleAgreementHelpBlock(values);
    return [];
  });
}
function buildContextualBaseTitle(infinitive, typeHInitial) {
  const verb = infinitive.trim();
  if (!verb) return "Trouve le radical";
  const normalizedVerb = verb.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("fr");
  const elides = /^[aeiouy]/u.test(normalizedVerb) || normalizedVerb.startsWith("h") && typeHInitial !== "aspire";
  return `Trouve le radical ${elides ? "d\u2019" : "de "}${verb}`;
}
function buildDefinitionHelpHtml(values) {
  var _a, _b;
  const verb = ((_a = values.verb) == null ? void 0 : _a.trim()) || "";
  const definition = ((_b = values.definition) == null ? void 0 : _b.trim()) || "";
  if (!verb && !definition) return "";
  if (!definition) return `<p><strong>${escapedCoachText(verb)}</strong></p>`;
  if (!verb) return `<p>${escapedCoachText(definition)}</p>`;
  return `<p><strong>${escapedCoachText(verb)}</strong> = ${escapedCoachText(definition)}</p>`;
}
const semanticDefinitionFallbacks = {
  de: {
    mouvement: "eine Bewegung oder Fortbewegung ausdr\xFCcken",
    position: "eine Position oder einen Positionswechsel ausdr\xFCcken",
    perception: "eine Sinneswahrnehmung ausdr\xFCcken",
    manipulation: "eine Handlung an einem Gegenstand ausdr\xFCcken",
    "creation-transformation": "eine Erschaffung oder Ver\xE4nderung ausdr\xFCcken",
    communication: "Worte, Gedanken oder Informationen mitteilen",
    cognition: "einen Gedanken, ein Wissen oder einen Lernvorgang ausdr\xFCcken",
    emotion: "ein Gef\xFChl, einen Geschmack oder eine Bewertung ausdr\xFCcken",
    modalite: "ausdr\xFCcken, was m\xF6glich, notwendig oder erw\xFCnscht ist",
    "relation-sociale": "eine Beziehung oder Handlung mit anderen Personen ausdr\xFCcken",
    echange: "einen Austausch, eine Gabe oder eine Weitergabe ausdr\xFCcken",
    corps: "eine Handlung oder ein Bed\xFCrfnis des K\xF6rpers ausdr\xFCcken",
    nature: "ein Naturph\xE4nomen beschreiben",
    "action-processus": "eine Handlung oder einen Vorgang ausdr\xFCcken"
  },
  en: {
    mouvement: "express movement or travel",
    position: "express a position or a change of position",
    perception: "express something perceived through the senses",
    manipulation: "express an action performed on an object",
    "creation-transformation": "express creation or transformation",
    communication: "communicate words, ideas or information",
    cognition: "express thought, knowledge or learning",
    emotion: "express an emotion, preference or appreciation",
    modalite: "indicate what is possible, necessary or desired",
    "relation-sociale": "express a relationship or an action involving other people",
    echange: "express an exchange, a gift or a transfer",
    corps: "express an action or a need of the body",
    nature: "describe a natural phenomenon",
    "action-processus": "express an action or a process"
  },
  it: {
    mouvement: "esprimere un movimento o uno spostamento",
    position: "esprimere una posizione o un cambiamento di posizione",
    perception: "esprimere ci\xF2 che si percepisce con i sensi",
    manipulation: "esprimere un\u2019azione compiuta su un oggetto",
    "creation-transformation": "esprimere una creazione o una trasformazione",
    communication: "comunicare parole, idee o informazioni",
    cognition: "esprimere un pensiero, una conoscenza o un apprendimento",
    emotion: "esprimere un\u2019emozione, un gusto o un apprezzamento",
    modalite: "indicare ci\xF2 che \xE8 possibile, necessario o desiderato",
    "relation-sociale": "esprimere una relazione o un\u2019azione con altre persone",
    echange: "esprimere uno scambio, un dono o una trasmissione",
    corps: "esprimere un\u2019azione o un bisogno del corpo",
    nature: "descrivere un fenomeno naturale",
    "action-processus": "esprimere un\u2019azione o un processo"
  },
  es: {
    mouvement: "expresar un movimiento o un desplazamiento",
    position: "expresar una posici\xF3n o un cambio de posici\xF3n",
    perception: "expresar lo que se percibe con los sentidos",
    manipulation: "expresar una acci\xF3n realizada sobre un objeto",
    "creation-transformation": "expresar una creaci\xF3n o una transformaci\xF3n",
    communication: "comunicar palabras, ideas o informaci\xF3n",
    cognition: "expresar un pensamiento, un conocimiento o un aprendizaje",
    emotion: "expresar una emoci\xF3n, un gusto o una valoraci\xF3n",
    modalite: "indicar lo que es posible, necesario o deseado",
    "relation-sociale": "expresar una relaci\xF3n o una acci\xF3n con otras personas",
    echange: "expresar un intercambio, un regalo o una transmisi\xF3n",
    corps: "expresar una acci\xF3n o una necesidad del cuerpo",
    nature: "describir un fen\xF3meno natural",
    "action-processus": "expresar una acci\xF3n o un proceso"
  }
};
const genericDefinitionFallbacks = {
  de: "ein franz\xF6sisches Verb; erschlie\xDFe seine genaue Bedeutung aus dem Satz",
  en: "a French verb; use the sentence to identify its precise meaning",
  it: "un verbo francese; usa la frase per individuarne il significato preciso",
  es: "un verbo franc\xE9s; usa la frase para identificar su significado exacto"
};
function localizedCoachVerbDefinition(verb, locale) {
  var _a;
  if (!verb) return "";
  if (locale === "fr") return ((_a = verb.meaning) == null ? void 0 : _a.trim()) || "";
  const definitions = verb.categoriesSemantiques.map((category) => semanticDefinitionFallbacks[locale][category]).filter((definition) => Boolean(definition));
  return [...new Set(definitions)].join("; ") || genericDefinitionFallbacks[locale];
}
function isCondensedPronominalVerb(verb) {
  var _a;
  const infinitive = ((_a = verb == null ? void 0 : verb.infinitif) == null ? void 0 : _a.trim()) || "";
  return /^(?:se\s+|s[’'])/iu.test(infinitive) || Boolean((verb == null ? void 0 : verb.typePronominal) && verb.typePronominal !== "aucun");
}
function reflexivePronounInAnswer(subject, answer) {
  var _a;
  const key = helpSubjectKey(subject);
  const source = answer.trim();
  if (key === "tu") {
    const imperative = source.match(/-toi\b/iu);
    if (imperative) return "toi";
  }
  if (key === "nous" && /-nous\b/iu.test(source)) return "nous";
  if (key === "vous" && /-vous\b/iu.test(source)) return "vous";
  const alternatives = key === "je" ? ["m\u2019", "m'", "me"] : key === "tu" ? ["t\u2019", "t'", "te"] : ["il", "elle", "on", "ils", "elles"].includes(key) ? ["s\u2019", "s'", "se"] : key === "nous" ? ["nous"] : key === "vous" ? ["vous"] : [];
  return ((_a = alternatives.find((candidate) => {
    const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    const lookahead = candidate.endsWith("\u2019") || candidate.endsWith("'") ? "(?=\\p{L})" : "(?=\\s|$)";
    return new RegExp(`(?:^|\\s)${escaped}${lookahead}`, "iu").test(source);
  })) == null ? void 0 : _a.replace("'", "\u2019")) || "";
}
function fallbackReflexivePronoun(subject, infinitive, verb) {
  const key = helpSubjectKey(subject);
  const lexical = bareHelpInfinitive(infinitive);
  const first = normalizedGrammar(lexical).charAt(0);
  const elides = "aeiouy".includes(first) || first === "h" && (verb == null ? void 0 : verb.typeHInitial) !== "aspire";
  if (key === "je") return elides ? "m\u2019" : "me";
  if (key === "tu") return elides ? "t\u2019" : "te";
  if (["il", "elle", "on", "ils", "elles"].includes(key)) return elides ? "s\u2019" : "se";
  if (key === "nous") return "nous";
  if (key === "vous") return "vous";
  return "";
}
function buildPronominalCoachHelpHtml(question, verb) {
  const infinitive = question.infinitif || (verb == null ? void 0 : verb.infinitif) || "";
  if (!isCondensedPronominalVerb(verb || { infinitif: infinitive })) return "";
  const subject = question.pronom || question.saisiePrefixe || "";
  const subjectLabel = helpSubjectKey(subject);
  const contextualPronoun = reflexivePronounInAnswer(subject, question.conjugaison1 || "") || fallbackReflexivePronoun(subject, infinitive, verb);
  const contextualHelp = subjectLabel && contextualPronoun ? ["m\u2019", "t\u2019", "s\u2019"].includes(contextualPronoun) ? `<p><strong>Dans cette question :</strong> avec <strong>${escapedCoachText(subjectLabel)}</strong>, \xE9cris <strong>${escapedCoachText(contextualPronoun)}</strong> avec une apostrophe, car la forme suivante commence par un son voyelle.</p>` : ["me", "te", "se"].includes(contextualPronoun) ? `<p><strong>Dans cette question :</strong> avec <strong>${escapedCoachText(subjectLabel)}</strong>, \xE9cris <strong>${escapedCoachText(contextualPronoun)}</strong> sans apostrophe.</p>` : `<p><strong>Dans cette question :</strong> avec <strong>${escapedCoachText(subjectLabel)}</strong>, utilise <strong>${escapedCoachText(contextualPronoun)}</strong>.</p>` : "";
  const imperative = normalizedGrammar(question.mode || "") === "imperatif" ? "<p><strong>\xC0 l\u2019imp\xE9ratif affirmatif :</strong> le pronom passe apr\xE8s le verbe : <em>lave-toi, lavons-nous, lavez-vous</em>.</p>" : "";
  return `<p>Un verbe pronominal sert souvent \xE0 montrer que le sujet fait l\u2019action sur lui-m\xEAme.</p><p><strong>Exemple :</strong><br><em>Je me lave.</em> Je fais l\u2019action de laver sur moi-m\xEAme.</p><details><summary>Choisir le pronom : me, te, se\u2026</summary><table><tbody><tr><th>je</th><td>me ou m\u2019</td></tr><tr><th>tu</th><td>te ou t\u2019</td></tr><tr><th>il, elle, on</th><td>se ou s\u2019</td></tr><tr><th>nous</th><td>nous</td></tr><tr><th>vous</th><td>vous</td></tr><tr><th>ils, elles</th><td>se ou s\u2019</td></tr></tbody></table><p>Devant une voyelle ou un <strong>h muet</strong>, <strong>me</strong>, <strong>te</strong> et <strong>se</strong> deviennent <strong>m\u2019</strong>, <strong>t\u2019</strong> et <strong>s\u2019</strong>.</p>${contextualHelp}${imperative}</details>`;
}
function condensedVerbAuxiliary(verb) {
  if (isCondensedPronominalVerb(verb)) return "\xEAtre";
  const auxiliary = normalizedGrammar((verb == null ? void 0 : verb.auxiliaire) || "");
  return auxiliary === "etre" ? "\xEAtre" : auxiliary === "avoir" ? "avoir" : "";
}
function contextualCondensedTenseRule(mode, tense, verb) {
  const source = coachCondensedTenseRule(mode, tense);
  const key = `${normalizedGrammar(mode || "")}:${normalizedGrammar(tense || "")}`;
  const infinitive = bareHelpInfinitive((verb == null ? void 0 : verb.infinitif) || "");
  const auxiliary = condensedVerbAuxiliary(verb);
  let rule = source.rule;
  let example = source.example;
  const notes = [...source.notes || []];
  if (key === "imperatif:present" && ["avoir", "etre", "savoir", "vouloir"].includes(normalizedGrammar(infinitive))) {
    rule = "Exception : ce verbe a des formes particuli\xE8res \xE0 l\u2019imp\xE9ratif, \xE0 apprendre par c\u0153ur.";
    notes.splice(0, notes.length, "Ne construis pas sa r\xE9ponse \xE0 partir de la forme habituelle du pr\xE9sent.");
  }
  if (key === "participe:present" && ["avoir", "etre", "savoir"].includes(normalizedGrammar(infinitive))) {
    rule = "Exception : ce verbe a un participe pr\xE9sent irr\xE9gulier, \xE0 apprendre par c\u0153ur.";
    notes.splice(0, notes.length, "La r\xE8gle \xAB nous au pr\xE9sent sans -ons \xBB ne fonctionne pas pour ce verbe.");
  }
  if (key === "gerondif:present" && ["avoir", "etre", "savoir"].includes(normalizedGrammar(infinitive))) {
    rule = "\xAB en \xBB + participe pr\xE9sent.";
    notes.push("Exception : le participe pr\xE9sent de ce verbe est irr\xE9gulier et doit \xEAtre appris par c\u0153ur.");
  }
  if (key === "indicatif:futur proche" && isCondensedPronominalVerb(verb)) {
    notes.push("Avec un verbe pronominal, place \xAB me, te, se, nous, vous, se \xBB devant l\u2019infinitif.");
    example = "je vais + me lever = je vais me lever";
  }
  const compoundKeys = /* @__PURE__ */ new Set([
    "indicatif:passe compose",
    "indicatif:futur anterieur",
    "indicatif:plus-que-parfait",
    "indicatif:passe anterieur",
    "imperatif:passe",
    "subjonctif:passe",
    "subjonctif:plus-que-parfait",
    "conditionnel:passe 1",
    "conditionnel:passe 2",
    "gerondif:passe"
  ]);
  if (auxiliary && compoundKeys.has(key)) {
    rule = source.rule.replace(/^Auxiliaire/u, `Auxiliaire \xAB ${auxiliary} \xBB`);
    if (auxiliary === "\xEAtre") {
      notes.push(isCondensedPronominalVerb(verb) ? "Avec un verbe pronominal, v\xE9rifie l\u2019accord du participe pass\xE9 : il d\xE9pend de la fonction du pronom et d\u2019un \xE9ventuel COD." : "Avec \xAB \xEAtre \xBB, le participe pass\xE9 s\u2019accorde avec le sujet.");
    }
    const examplesWithEtre = {
      "indicatif:passe compose": "elle est + arriv\xE9e = elle est arriv\xE9e",
      "indicatif:futur anterieur": "elle sera + arriv\xE9e = elle sera arriv\xE9e",
      "indicatif:plus-que-parfait": "elle \xE9tait + arriv\xE9e = elle \xE9tait arriv\xE9e",
      "indicatif:passe anterieur": "elle fut + arriv\xE9e = elle fut arriv\xE9e",
      "imperatif:passe": "soyez + partis = soyez partis !",
      "subjonctif:passe": "qu\u2019elle soit + arriv\xE9e = qu\u2019elle soit arriv\xE9e",
      "subjonctif:plus-que-parfait": "qu\u2019elle f\xFBt + arriv\xE9e = qu\u2019elle f\xFBt arriv\xE9e",
      "conditionnel:passe 1": "elle serait + arriv\xE9e = elle serait arriv\xE9e",
      "conditionnel:passe 2": "elle f\xFBt + arriv\xE9e = elle f\xFBt arriv\xE9e",
      "gerondif:passe": "en + \xE9tant + arriv\xE9 = en \xE9tant arriv\xE9"
    };
    if (auxiliary === "\xEAtre" && examplesWithEtre[key]) example = examplesWithEtre[key];
  }
  if (normalizedGrammar(infinitive) === "chanter") {
    example = example.replaceAll("chanter", "parler").replaceAll("chant", "parl");
  }
  return { ...source, rule, notes, example };
}
function buildCondensedTenseRuleHtml(mode, tense, verb, locale = "fr") {
  const key = `${normalizedGrammar(mode || "")}:${normalizedGrammar(tense || "")}`;
  const rule = localizedCondensedTenseRule(locale, key, contextualCondensedTenseRule(mode, tense, verb));
  const notes = (rule.notes || []).map((note) => `<p>${escapedCoachText(note)}</p>`).join("");
  return `<p><strong>${escapedCoachText(rule.label)}</strong></p><p>${escapedCoachText(rule.rule)}</p>${notes}<p><strong>${condensedExampleLabel[locale]}</strong><br><code>${escapedCoachText(rule.example)}</code></p>`;
}
function condensedReferenceFormExplanation(mode = "", tense = "", currentSubject = "", auxiliary = "avoir", pronominal = false) {
  const key = `${normalizedGrammar(mode)}:${normalizedGrammar(tense)}`;
  const useVous = normalizedGrammar(currentSubject).includes("nous");
  const choice = useVous ? 1 : 0;
  const simpleGuides = {
    "indicatif:present": { reference: "Infinitif : \xAB chanter \xBB \u2192 radical <code>chant-</code>.", endings: ["-ons", "-ez"], forms: ["nous chantons", "vous chantez"] },
    "indicatif:imparfait": { reference: "Forme rep\xE8re : \xAB nous chantons \xBB \u2192 radical <code>chant-</code>.", endings: ["-ions", "-iez"], forms: ["nous chantions", "vous chantiez"] },
    "indicatif:futur": { reference: "Infinitif : \xAB chanter \xBB \u2192 radical du futur <code>chanter-</code>.", endings: ["-ons", "-ez"], forms: ["nous chanterons", "vous chanterez"] },
    "indicatif:passe simple": { reference: "Infinitif : \xAB chanter \xBB \u2192 radical <code>chant-</code>.", endings: ["-\xE2mes", "-\xE2tes"], forms: ["nous chant\xE2mes", "vous chant\xE2tes"] },
    "imperatif:present": { reference: "Forme rep\xE8re au pr\xE9sent : \xAB nous chantons \xBB ou \xAB vous chantez \xBB. Enl\xE8ve le sujet.", endings: ["-ons", "-ez"], forms: ["chantons !", "chantez !"], omitSubject: true },
    "subjonctif:present": { reference: "Forme rep\xE8re : \xAB ils chantent \xBB \u2192 radical <code>chant-</code>.", endings: ["-ions", "-iez"], forms: ["que nous chantions", "que vous chantiez"] },
    "subjonctif:imparfait": { reference: "Forme rep\xE8re : \xAB il chanta \xBB \u2192 radical <code>chanta-</code>.", endings: ["-ssions", "-ssiez"], forms: ["que nous chantassions", "que vous chantassiez"] },
    "conditionnel:present": { reference: "Forme rep\xE8re au futur : \xAB nous chanterons \xBB \u2192 radical <code>chanter-</code>.", endings: ["-ions", "-iez"], forms: ["nous chanterions", "vous chanteriez"] }
  };
  const compoundGuides = {
    "indicatif:passe compose": { auxiliaryTense: "pr\xE9sent" },
    "indicatif:futur anterieur": { auxiliaryTense: "futur" },
    "indicatif:plus-que-parfait": { auxiliaryTense: "imparfait" },
    "indicatif:passe anterieur": { auxiliaryTense: "pass\xE9 simple" },
    "imperatif:passe": { auxiliaryTense: "imp\xE9ratif pr\xE9sent", omitSubject: true },
    "subjonctif:passe": { auxiliaryTense: "subjonctif pr\xE9sent" },
    "subjonctif:plus-que-parfait": { auxiliaryTense: "subjonctif imparfait" },
    "conditionnel:passe 1": { auxiliaryTense: "conditionnel pr\xE9sent" },
    "conditionnel:passe 2": { auxiliaryTense: "subjonctif imparfait" }
  };
  const simple = simpleGuides[key];
  if (simple) {
    return `<details><summary>Qu\u2019est-ce que c\u2019est ?</summary><p>Une forme rep\xE8re est une forme du verbe que tu as apprise par c\u0153ur.</p><p><strong>Exemple :</strong></p><p>Trouve le radical. ${simple.reference}</p></details>`;
  }
  const compound = compoundGuides[key];
  if (compound) {
    const formsByAuxiliary = {
      avoir: {
        pr\u00E9sent: ["nous avons", "vous avez"],
        futur: ["nous aurons", "vous aurez"],
        imparfait: ["nous avions", "vous aviez"],
        "pass\xE9 simple": ["nous e\xFBmes", "vous e\xFBtes"],
        "imp\xE9ratif pr\xE9sent": ["ayons", "ayez"],
        "subjonctif pr\xE9sent": ["que nous ayons", "que vous ayez"],
        "subjonctif imparfait": ["que nous eussions", "que vous eussiez"],
        "conditionnel pr\xE9sent": ["nous aurions", "vous auriez"]
      },
      \u00EAtre: {
        pr\u00E9sent: ["nous sommes", "vous \xEAtes"],
        futur: ["nous serons", "vous serez"],
        imparfait: ["nous \xE9tions", "vous \xE9tiez"],
        "pass\xE9 simple": ["nous f\xFBmes", "vous f\xFBtes"],
        "imp\xE9ratif pr\xE9sent": ["soyons", "soyez"],
        "subjonctif pr\xE9sent": ["que nous soyons", "que vous soyez"],
        "subjonctif imparfait": ["que nous fussions", "que vous fussiez"],
        "conditionnel pr\xE9sent": ["nous serions", "vous seriez"]
      }
    };
    const selectedAuxiliary = normalizedGrammar(auxiliary) === "etre" ? "\xEAtre" : "avoir";
    const auxiliaryForm = formsByAuxiliary[selectedAuxiliary][compound.auxiliaryTense][choice];
    const agreement = selectedAuxiliary === "\xEAtre" ? pronominal ? "<p>3. Pour un verbe pronominal, v\xE9rifie l\u2019accord du participe pass\xE9 selon la fonction du pronom et la pr\xE9sence \xE9ventuelle d\u2019un COD.</p>" : "<p>3. Avec \xAB \xEAtre \xBB, accorde le participe pass\xE9 avec le sujet.</p>" : "";
    return `<details><summary>Qu\u2019est-ce que c\u2019est ?</summary><p>Une forme rep\xE8re est une forme du verbe que tu as apprise par c\u0153ur.</p><p><strong>Exemple :</strong></p><p>1. Forme rep\xE8re de l\u2019auxiliaire \xAB ${selectedAuxiliary} \xBB ${tenseWithArticle(compound.auxiliaryTense)} : <code>${auxiliaryForm}</code>.</p><p>2. La terminaison est port\xE9e par l\u2019auxiliaire. Ajoute ensuite le participe pass\xE9.</p>${agreement}</details>`;
  }
  const nonPersonalGuides = {
    "participe:present": ["\xAB nous chantons \xBB \u2192 radical <code>chant-</code>", "Ajoute <code>-ant</code>.", "<code>chant- + -ant = chantant</code>"],
    "participe:passe": ["Infinitif : <code>chanter</code>.", "Apprends sa forme au participe pass\xE9 : <code>chant\xE9</code>.", "<code>chanter \u2192 chant\xE9</code>"],
    "gerondif:present": ["Participe pr\xE9sent de \xAB chanter \xBB : <code>chantant</code>.", "Ajoute <code>en</code>.", "<code>en + chantant = en chantant</code>"],
    "gerondif:passe": ["Participe pr\xE9sent de l\u2019auxiliaire \xAB avoir \xBB : <code>ayant</code>.", "Ajoute le participe pass\xE9 <code>chant\xE9</code>.", "<code>en + ayant + chant\xE9 = en ayant chant\xE9</code>"]
  };
  const nonPersonal = nonPersonalGuides[key];
  if (nonPersonal) {
    return `<details><summary>Qu\u2019est-ce que c\u2019est ?</summary><p>Une forme rep\xE8re est une forme du verbe que tu as apprise par c\u0153ur.</p><p><strong>Exemple :</strong></p><p>Ce mode n\u2019a pas de personne grammaticale.</p><p>1. ${nonPersonal[0]}.</p><p>2. ${nonPersonal[1]}</p><p>3. Construis la r\xE9ponse : ${nonPersonal[2]}.</p></details>`;
  }
  return "<details><summary>Qu\u2019est-ce que c\u2019est ?</summary><p>Une forme rep\xE8re est une forme du verbe que tu as apprise par c\u0153ur.</p></details>";
}
function buildCondensedVerbGroupHtml(verb, context = {}, locale = "fr") {
  var _a;
  const infinitive = ((_a = verb == null ? void 0 : verb.infinitif) == null ? void 0 : _a.trim()) || "Ce verbe";
  const group = verb == null ? void 0 : verb.groupeConjugaison;
  const missingGroup = {
    fr: "groupe non renseign\xE9.",
    de: "Verbgruppe nicht angegeben.",
    en: "verb group not specified.",
    it: "gruppo del verbo non indicato.",
    es: "grupo del verbo no indicado."
  };
  if (!group) return `<p><strong>${escapedCoachText(infinitive)}</strong> : ${missingGroup[locale]}</p>`;
  const groupLabels = {
    fr: `${group}${group === 1 ? "er" : "e"} groupe`,
    de: `${group}. Verbgruppe`,
    en: `${group}${group === 1 ? "st" : group === 2 ? "nd" : "rd"} group`,
    it: `${group}\xBA gruppo`,
    es: `${group}.${group === 1 || group === 3 ? "er" : "\xBA"} grupo`
  };
  const membership = {
    fr: "appartient au",
    de: "geh\xF6rt zur",
    en: "belongs to the",
    it: "appartiene al",
    es: "pertenece al"
  };
  const consequencesByLocale = {
    fr: {
      1: ["Conjugaison g\xE9n\xE9ralement r\xE9guli\xE8re.", "Attention : le radical ne s\u2019\xE9crit pas toujours de la m\xEAme fa\xE7on."],
      2: ["Conjugaison r\xE9guli\xE8re, sur le mod\xE8le de \xAB finir \xBB. Le radical prend souvent \xAB -iss- \xBB."],
      3: ["Conjugaison souvent irr\xE9guli\xE8re : le radical et les terminaisons peuvent changer. Appuie-toi sur les formes rep\xE8res."]
    },
    de: {
      1: ["Die Konjugation ist normalerweise regelm\xE4\xDFig.", "Achtung: Der Stamm wird nicht immer gleich geschrieben."],
      2: ["Regelm\xE4\xDFige Konjugation nach dem Muster von \xAB finir \xBB. Der Stamm enth\xE4lt h\xE4ufig \xAB -iss- \xBB."],
      3: ["Die Konjugation ist oft unregelm\xE4\xDFig: Stamm und Endungen k\xF6nnen sich \xE4ndern. Orientiere dich an den gelernten Referenzformen."]
    },
    en: {
      1: ["The conjugation is generally regular.", "Be careful: the stem is not always spelt in the same way."],
      2: ["Regular conjugation based on the pattern of \xAB finir \xBB. The stem often contains \xAB -iss- \xBB."],
      3: ["The conjugation is often irregular: the stem and endings may change. Use the reference forms you have learnt."]
    },
    it: {
      1: ["La coniugazione \xE8 generalmente regolare.", "Attenzione: la radice non si scrive sempre nello stesso modo."],
      2: ["Coniugazione regolare sul modello di \xAB finir \xBB. La radice contiene spesso \xAB -iss- \xBB."],
      3: ["La coniugazione \xE8 spesso irregolare: la radice e le desinenze possono cambiare. Usa le forme di riferimento imparate."]
    },
    es: {
      1: ["La conjugaci\xF3n suele ser regular.", "Atenci\xF3n: la ra\xEDz no siempre se escribe de la misma manera."],
      2: ["Conjugaci\xF3n regular seg\xFAn el modelo de \xAB finir \xBB. La ra\xEDz suele contener \xAB -iss- \xBB."],
      3: ["La conjugaci\xF3n suele ser irregular: la ra\xEDz y las terminaciones pueden cambiar. Usa las formas de referencia aprendidas."]
    }
  };
  const consequences = consequencesByLocale[locale][group];
  const consequenceParagraphs = consequences.map((consequence) => `<p>${escapedCoachText(consequence)}</p>`).join("");
  const foreignThirdGroupAdvice = {
    de: "<p>Bei Verben der 3. Gruppe helfen gelernte Referenzformen dabei, den richtigen Stamm und die richtige Endung zu finden.</p>",
    en: "<p>For third-group verbs, use learnt reference forms to find the correct stem and ending.</p>",
    it: "<p>Per i verbi del 3\xBA gruppo, usa le forme di riferimento imparate per trovare la radice e la desinenza corrette.</p>",
    es: "<p>Para los verbos del 3.er grupo, usa las formas de referencia aprendidas para encontrar la ra\xEDz y la terminaci\xF3n correctas.</p>"
  };
  const referenceFormExplanation = group === 3 ? locale === "fr" ? condensedReferenceFormExplanation(context.mode, context.tense, context.subject, condensedVerbAuxiliary(verb) || "avoir", isCondensedPronominalVerb(verb)) : foreignThirdGroupAdvice[locale] : "";
  return `<p><strong>${escapedCoachText(infinitive)}</strong> ${membership[locale]} <strong>${groupLabels[locale]}</strong>.</p>${consequenceParagraphs}${referenceFormExplanation}`;
}
function renderCoachHelpContent(content, values, approach = "cif-falc") {
  var _a, _b, _c;
  const replacements = {
    coach: ((_a = values.coach) == null ? void 0 : _a.firstName.trim()) || "",
    verb: values.verb || "",
    definition: values.definition || "",
    definitionHelp: values.definitionHelp || buildDefinitionHelpHtml(values),
    helpTitle: values.helpTitle || "",
    mode: values.mode || "",
    tense: values.tense || "",
    subject: values.subject || "",
    correctAnswers: values.correctAnswers || "",
    auxiliaryAnswer: values.auxiliaryAnswer || "",
    pastParticipleAnswer: values.pastParticipleAnswer || "",
    unagreedPastParticiple: values.unagreedPastParticiple || "",
    COD: values.COD || "",
    isCODplace_avant: values.isCODplace_avant || "non",
    COI: values.COI || "",
    isCOIplace_avant: values.isCOIplace_avant || "non",
    endingsHelp: ((_b = values.endingsHelpByApproach) == null ? void 0 : _b[approach]) || values.endingsHelp || "",
    contextualBaseHelp: ((_c = values.contextualBaseHelpByApproach) == null ? void 0 : _c[approach]) || values.contextualBaseHelp || "",
    completeAdviceHelp: values.completeAdviceHelp || "",
    condensedVerbGroupHelp: values.condensedVerbGroupHelp || "",
    condensedTenseRuleHelp: values.condensedTenseRuleHelp || "",
    nearFutureHelp: values.nearFutureHelp || "",
    nearFutureAllerHelp: values.nearFutureAllerHelp || "",
    passiveVoiceHelp: values.passiveVoiceHelp || "",
    passiveVoiceAdviceHelp: values.passiveVoiceAdviceHelp || "",
    passiveVoiceCondensedHelp: values.passiveVoiceCondensedHelp || "",
    passiveVoiceMethodHelp: values.passiveVoiceMethodHelp || "",
    passiveVoiceMethodAdviceHelp: values.passiveVoiceMethodAdviceHelp || "",
    pronominalHelp: values.pronominalHelp || "",
    referenceFormHelp: values.referenceFormHelp || values.nousFormHelp || "",
    nousFormHelp: values.nousFormHelp || "",
    conjugationBase: values.conjugationBase || "",
    conjugationEnding: values.conjugationEnding || "",
    referenceMode: values.referenceMode || "",
    referenceTense: values.referenceTense || "",
    referenceSubject: values.referenceSubject || "",
    referenceForm: values.referenceForm || "",
    referenceRadical: values.referenceRadical || "",
    removedEnding: values.removedEnding || ""
  };
  const rendered = content.replace(/\{(coach|verb|definition|definitionHelp|helpTitle|mode|tense|subject|correctAnswers|auxiliaryAnswer|pastParticipleAnswer|unagreedPastParticiple|COD|isCODplace_avant|COI|isCOIplace_avant|endingsHelp|contextualBaseHelp|completeAdviceHelp|condensedVerbGroupHelp|condensedTenseRuleHelp|nearFutureHelp|nearFutureAllerHelp|passiveVoiceHelp|passiveVoiceAdviceHelp|passiveVoiceCondensedHelp|passiveVoiceMethodHelp|passiveVoiceMethodAdviceHelp|pronominalHelp|referenceFormHelp|nousFormHelp|conjugationBase|conjugationEnding|referenceMode|referenceTense|referenceSubject|referenceForm|referenceRadical|removedEnding)\}/gu, (_match, key) => replacements[key] || "");
  return values.omitIndicativeMode ? withoutIndicativeMode(rendered) : rendered;
}
function startsWithVowelForArticle(value) {
  const first = value.trim().normalize("NFD").replace(/\p{Diacritic}/gu, "").charAt(0).toLocaleLowerCase("fr");
  return "aeiouy".includes(first);
}
function tenseWithArticle(value) {
  const tense = value.trim();
  return startsWithVowelForArticle(tense) ? `\xE0 l\u2019${tense}` : `au ${tense}`;
}
function modeWithArticle(value) {
  const mode = value.trim();
  return startsWithVowelForArticle(mode) ? `de l\u2019${mode}` : `du ${mode}`;
}
const nearFutureHelpCopy = {
  fr: {
    construction: "Le futur proche se construit avec \xAB aller \xBB au pr\xE9sent, suivi de l\u2019infinitif du verbe.",
    usage: "Ce n'est pas un temps comme les autres. Il est utilis\xE9 pour une action proche.",
    formulaPresent: "au pr\xE9sent",
    example: "Un exemple :",
    reflexive: (example) => `Pour un verbe pronominal, place le pronom r\xE9fl\xE9chi devant l\u2019infinitif : <code>${example}</code>.`
  },
  de: {
    construction: "Das nahe Futur wird mit \xAB aller \xBB im Pr\xE4sens und dem Infinitiv des Verbs gebildet.",
    usage: "Es bezeichnet eine Handlung, die in naher Zukunft stattfinden wird.",
    formulaPresent: "im Pr\xE4sens",
    example: "Beispiel:",
    reflexive: (example) => `Bei einem reflexiven Verb steht das Reflexivpronomen vor dem Infinitiv: <code>${example}</code>.`
  },
  en: {
    construction: "The near future is formed with \xAB aller \xBB in the present tense followed by the infinitive of the verb.",
    usage: "It describes an action that will happen in the near future.",
    formulaPresent: "in the present tense",
    example: "Example:",
    reflexive: (example) => `With a pronominal verb, place the reflexive pronoun before the infinitive: <code>${example}</code>.`
  },
  it: {
    construction: "Il futuro prossimo si forma con \xAB aller \xBB al presente, seguito dall\u2019infinito del verbo.",
    usage: "Indica un\u2019azione che avverr\xE0 in un futuro vicino.",
    formulaPresent: "al presente",
    example: "Esempio:",
    reflexive: (example) => `Con un verbo pronominale, metti il pronome riflessivo davanti all\u2019infinito: <code>${example}</code>.`
  },
  es: {
    construction: "El futuro pr\xF3ximo se forma con \xAB aller \xBB en presente, seguido del infinitivo del verbo.",
    usage: "Indica una acci\xF3n que ocurrir\xE1 en un futuro cercano.",
    formulaPresent: "en presente",
    example: "Ejemplo:",
    reflexive: (example) => `Con un verbo pronominal, coloca el pronombre reflexivo delante del infinitivo: <code>${example}</code>.`
  }
};
function buildNearFutureCoachHelpHtml(verb, locale = "fr") {
  var _a;
  const infinitive = ((_a = verb == null ? void 0 : verb.infinitif) == null ? void 0 : _a.trim()) || "chanter";
  const lexicalInfinitive = bareNearFutureInfinitive(infinitive) || "chanter";
  const copy = nearFutureHelpCopy[locale];
  const reflexiveExample = `je vais ${nearFutureReflexivePronoun(4, infinitive, verb == null ? void 0 : verb.typeHInitial)}${escapedCoachText(lexicalInfinitive)}`;
  const pronominal = isPronominalNearFutureInfinitive(infinitive) ? `<p>${copy.reflexive(reflexiveExample)}</p>` : "";
  return `<p><strong>${copy.construction}</strong></p><p>${copy.usage}</p><p><code>aller ${copy.formulaPresent} + ${escapedCoachText(lexicalInfinitive)}</code></p><p><strong>${copy.example}</strong><br><code>Il va ouvrir la porte.</code></p>${pronominal}`;
}
function buildNearFutureAllerHelpHtml(locale = "fr") {
  const summary = {
    fr: "Aller au pr\xE9sent",
    de: "aller im Pr\xE4sens",
    en: "aller in the present tense",
    it: "aller al presente",
    es: "aller en presente"
  };
  return `<details><summary>${summary[locale]}</summary><table><tbody><tr><th>je</th><td>vais</td></tr><tr><th>tu</th><td>vas</td></tr><tr><th>il, elle, on</th><td>va</td></tr><tr><th>nous</th><td>allons</td></tr><tr><th>vous</th><td>allez</td></tr><tr><th>ils, elles</th><td>vont</td></tr></tbody></table></details>`;
}
function normalizedGrammar(value) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLocaleLowerCase("fr");
}
function strongContext(tense, mode) {
  const normalizedMode = normalizedGrammar(mode);
  if (normalizedMode === "conditionnel") {
    return `<strong>au conditionnel ${escapedCoachText(tense)}</strong>`;
  }
  if (normalizedMode === "imperatif") {
    return `<strong>\xE0 l\u2019imp\xE9ratif ${escapedCoachText(tense)}</strong>`;
  }
  if (normalizedMode === "participe") {
    return `<strong>au participe ${escapedCoachText(tense)}</strong>`;
  }
  if (normalizedMode === "gerondif") {
    return `<strong>au g\xE9rondif ${escapedCoachText(tense)}</strong>`;
  }
  if (normalizedMode === "infinitif") {
    return `<strong>\xE0 l\u2019infinitif ${escapedCoachText(tense)}</strong>`;
  }
  return `<strong>${escapedCoachText(tenseWithArticle(tense))}</strong> <strong>${escapedCoachText(modeWithArticle(mode))}</strong>`;
}
function buildReferenceFormHelpHtml(question, verb, tense) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const infinitive = (question.infinitif || (verb == null ? void 0 : verb.infinitif) || "").trim();
  const tenseName = (question.temps || (tense == null ? void 0 : tense.name) || "").trim();
  const modeName = (question.mode || ((_a = tense == null ? void 0 : tense.mode) == null ? void 0 : _a.name) || "").trim();
  if (!infinitive || !tenseName || !modeName) return "";
  const reference = ((_b = question.radicalReference) == null ? void 0 : _b.validated) === false ? void 0 : question.radicalReference;
  const targetContext = strongContext(tenseName, modeName);
  if ((reference == null ? void 0 : reference.kind) === "infinitive") {
    const displayedForm = reference.form.replace(/^./u, (letter) => letter.toLocaleUpperCase("fr"));
    return `<p>Pour conjuguer le verbe <strong>${escapedCoachText(infinitive)}</strong> ${targetContext}, pars de son <strong>infinitif</strong>.</p><p>La forme rep\xE8re est <mark><strong>${escapedCoachText(displayedForm)}</strong></mark>.</p>`;
  }
  if ((reference == null ? void 0 : reference.kind) === "memorized-stem") {
    return `<p>Pour conjuguer le verbe <strong>${escapedCoachText(infinitive)}</strong> ${targetContext}, apprends son <strong>radical particulier</strong>.</p><p>Le radical \xE0 retenir est <mark><strong>${escapedCoachText(reference.form)}</strong></mark>.</p>`;
  }
  const referenceSubject = ((_c = reference == null ? void 0 : reference.referenceSubject) == null ? void 0 : _c.trim()) || "";
  const referenceMode = ((_d = reference == null ? void 0 : reference.referenceMode) == null ? void 0 : _d.trim()) || modeName;
  const referenceTense = ((_e = reference == null ? void 0 : reference.referenceTense) == null ? void 0 : _e.trim()) || tenseName;
  if ((reference == null ? void 0 : reference.form) && referenceSubject) {
    const sameContext = normalizedGrammar(referenceMode) === normalizedGrammar(modeName) && normalizedGrammar(referenceTense) === normalizedGrammar(tenseName);
    const referenceContext = strongContext(referenceTense, referenceMode);
    const instruction = sameContext ? `Voici la forme rep\xE8re du verbe <strong>${escapedCoachText(infinitive)}</strong> ${referenceContext}. Apprends-la par c\u0153ur, c\u2019est tr\xE8s utile :` : `Pour conjuguer le verbe <strong>${escapedCoachText(infinitive)}</strong> ${targetContext}, utilise sa forme rep\xE8re ${referenceContext}. Apprends-la par c\u0153ur, c\u2019est tr\xE8s utile :`;
    const displayedForm = displayedHelpConjugatedForm(referenceSubject, reference.form, infinitive);
    return `<p>${instruction}</p><p><mark><strong>${escapedCoachText(displayedForm)}</strong></mark></p>`;
  }
  const subject = (question.pronom || question.saisiePrefixe || "").trim();
  const nonPersonal = ["participe", "gerondif", "infinitif"].includes(normalizedGrammar(modeName));
  const fallbackForm = ((_f = question.reponsesPourCorrige.find((value) => value.trim())) == null ? void 0 : _f.trim()) || ((_g = question.conjugaison1) == null ? void 0 : _g.trim()) || ((_h = reference == null ? void 0 : reference.form) == null ? void 0 : _h.trim()) || "";
  if (nonPersonal) {
    return `<p>Le <strong>${escapedCoachText(modeName)}</strong> ne se conjugue pas avec un pronom personnel.</p><p>Pour le verbe <strong>${escapedCoachText(infinitive)}</strong>, la forme \xE0 retenir est <mark><strong>${escapedCoachText(fallbackForm)}</strong></mark>.</p>`;
  }
  if (subject && fallbackForm) {
    return `<p>Cette forme ne se d\xE9duit pas s\xFBrement d\u2019une autre personne. Apprends par c\u0153ur la forme du verbe <strong>${escapedCoachText(infinitive)}</strong> ${targetContext} avec le pronom <strong>${escapedCoachText(subject)}</strong>.</p><p>La forme \xE0 retenir est <mark><strong>${escapedCoachText(fallbackForm)}</strong></mark>.</p>`;
  }
  return `<p>Pour le verbe <strong>${escapedCoachText(infinitive)}</strong> ${targetContext}, aucune personne unique ne suffit comme forme rep\xE8re.</p>`;
}
function agreedParticipleInAnswer(answer, baseParticiple) {
  if (!baseParticiple) return "";
  const escaped = baseParticiple.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const match = answer.match(new RegExp(`(?:^|[\\s\u2019'])(${escaped}(?:e|s|es)?)(?=$|[\\s.,!?;:\u2019'])`, "iu"));
  return (match == null ? void 0 : match[1]) || baseParticiple;
}
function auxiliaryPart(form, baseParticiple) {
  const trimmed = form.trim();
  if (!trimmed || !baseParticiple) return "";
  const escaped = baseParticiple.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return trimmed.replace(new RegExp(`\\s+${escaped}(?:e|s|es)?$`, "iu"), "").trim();
}
function coachHelpQuestionVariables(question, verb, tense, locale = "fr") {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
  const complement = ((_a = question.agreementReminder) == null ? void 0 : _a.complement) || question.complement || "";
  const isCod = question.complementFunction === "cod" || ((_b = question.agreementReminder) == null ? void 0 : _b.kind) === "cod-before" || ((_c = question.agreementReminder) == null ? void 0 : _c.kind) === "cod-after";
  const isCoi = question.complementFunction === "coi" || ((_d = question.agreementReminder) == null ? void 0 : _d.kind) === "coi";
  const baseParticiple = ((_e = verb == null ? void 0 : verb.participePasse) == null ? void 0 : _e.trim()) || "";
  const firstCorrectAnswer = question.reponsesPourCorrige.find((answer) => answer.trim()) || "";
  const decomposition = decomposeConjugationForm(question, verb, tense);
  const endingsHelpByApproach = Object.fromEntries(COACH_EXPLANATION_APPROACHES.map((approach) => [
    approach,
    buildConjugationEndingsHtml(question, verb, tense, approach)
  ]));
  const contextualBaseHelpByApproach = Object.fromEntries(COACH_EXPLANATION_APPROACHES.map((approach) => [
    approach,
    buildConjugationBaseHtml(question, verb, tense, approach)
  ]));
  const passiveVoiceHelp = buildPassiveVoiceHelpHtml(question, verb, tense, true);
  const passiveVoiceAdviceHelp = buildPassiveVoiceHelpHtml(question, verb, tense, false);
  const passiveVoiceCondensedHelp = buildPassiveVoiceHelpHtml(question, verb, tense, false, true);
  const passiveVoiceMethodHelp = buildPassiveVoiceMethodHtml(question, verb, tense, true);
  const passiveVoiceMethodAdviceHelp = buildPassiveVoiceMethodHtml(question, verb, tense, false);
  const referenceFormHelp = buildReferenceFormHelpHtml(question, verb, tense);
  const infinitive = question.infinitif || (verb == null ? void 0 : verb.infinitif) || "";
  return {
    verb: infinitive,
    mode: question.mode || "",
    tense: question.temps || "",
    subject: question.pronom || question.saisiePrefixe || "",
    correctAnswers: [...new Set(question.reponsesPourCorrige.map((answer) => answer.trim()).filter(Boolean))].join(" ou "),
    auxiliaryAnswer: question.isCompound ? auxiliaryPart(question.conjugaison1 || "", baseParticiple) : "",
    pastParticipleAnswer: question.isCompound ? ((_f = question.agreementReminder) == null ? void 0 : _f.participle) || agreedParticipleInAnswer(firstCorrectAnswer, baseParticiple) : "",
    unagreedPastParticiple: baseParticiple,
    COD: isCod ? complement : "",
    isCODplace_avant: isCod && (question.complementPosition === "before" || ((_g = question.agreementReminder) == null ? void 0 : _g.kind) === "cod-before") ? "oui" : "non",
    COI: isCoi ? complement : "",
    isCOIplace_avant: isCoi && question.complementPosition === "before" ? "oui" : "non",
    isCompound: Boolean(question.isCompound || (tense == null ? void 0 : tense.isCompound)),
    auxiliary: isCondensedPronominalVerb(verb) ? "\xEAtre" : ((_h = verb == null ? void 0 : verb.auxiliaire) == null ? void 0 : _h.trim()) || "",
    endingsHelp: endingsHelpByApproach["cif-falc"],
    endingsHelpByApproach,
    contextualBaseHelp: contextualBaseHelpByApproach["cif-falc"],
    contextualBaseHelpByApproach,
    completeAdviceHelp: buildCompleteConjugationAdviceHtml(question, verb, tense),
    condensedVerbGroupHelp: buildCondensedVerbGroupHtml(verb, {
      mode: question.mode || ((_i = tense == null ? void 0 : tense.mode) == null ? void 0 : _i.name),
      tense: question.temps || (tense == null ? void 0 : tense.name),
      subject: question.pronom || question.saisiePrefixe
    }, locale),
    condensedTenseRuleHelp: buildCondensedTenseRuleHtml(question.mode || ((_j = tense == null ? void 0 : tense.mode) == null ? void 0 : _j.name), question.temps || (tense == null ? void 0 : tense.name), verb, locale),
    nearFutureHelp: buildNearFutureCoachHelpHtml(verb, locale),
    nearFutureAllerHelp: buildNearFutureAllerHelpHtml(locale),
    passiveVoiceHelp,
    passiveVoiceAdviceHelp,
    passiveVoiceCondensedHelp,
    passiveVoiceMethodHelp,
    passiveVoiceMethodAdviceHelp,
    pronominalHelp: buildPronominalCoachHelpHtml(question, verb),
    contextualBaseTitle: buildContextualBaseTitle(infinitive, verb == null ? void 0 : verb.typeHInitial),
    referenceFormHelp,
    nousFormHelp: referenceFormHelp,
    conjugationBase: decomposition ? `${decomposition.base}-` : "",
    conjugationEnding: decomposition ? `-${decomposition.ending}` : "",
    referenceMode: ((_k = question.radicalReference) == null ? void 0 : _k.referenceMode) || "",
    referenceTense: ((_l = question.radicalReference) == null ? void 0 : _l.referenceTense) || "",
    referenceSubject: ((_m = question.radicalReference) == null ? void 0 : _m.referenceSubject) || "",
    referenceForm: ((_n = question.radicalReference) == null ? void 0 : _n.form) || "",
    referenceRadical: ((_o = question.radicalReference) == null ? void 0 : _o.kind) !== "memorized-form" && ((_p = question.radicalReference) == null ? void 0 : _p.radical) ? `${question.radicalReference.radical}-` : "",
    removedEnding: ((_q = question.radicalReference) == null ? void 0 : _q.removableEnding) ? `-${question.radicalReference.removableEnding}` : ""
  };
}

const ALLOWED_TAGS = /* @__PURE__ */ new Set([
  "b",
  "blockquote",
  "br",
  "code",
  "details",
  "del",
  "em",
  "figcaption",
  "figure",
  "i",
  "kbd",
  "li",
  "mark",
  "ol",
  "p",
  "s",
  "small",
  "span",
  "strong",
  "summary",
  "sub",
  "sup",
  "samp",
  "table",
  "tbody",
  "td",
  "th",
  "tr",
  "u",
  "ul",
  "var"
]);
const VOID_TAGS = /* @__PURE__ */ new Set(["br"]);
const BLOCKED_ELEMENTS = /<\s*(script|style|iframe|object|embed|svg|math|template|noscript)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/giu;
const HTML_COMMENT = /<!--[\s\S]*?-->/gu;
const HTML_TAG = /<\s*(\/?)\s*([a-z][a-z0-9-]*)(?:\s[^>]*)?>/giu;
function sanitizeCoachHtml(value) {
  const withoutBlockedContent = value.replace(BLOCKED_ELEMENTS, "").replace(HTML_COMMENT, "");
  return withoutBlockedContent.replace(HTML_TAG, (_tag, closing, rawName) => {
    const name = rawName.toLowerCase();
    if (!ALLOWED_TAGS.has(name)) return "";
    if (VOID_TAGS.has(name)) return `<${name}>`;
    return closing ? `</${name}>` : `<${name}>`;
  });
}

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "CoachHelpBlockView",
  __ssrInlineRender: true,
  props: {
    block: {},
    values: {}
  },
  setup(__props) {
    const { ui, uiLabel } = useLanguagePreferences();
    const props = __props;
    const activeChildren = computed(() => (props.block.children || []).filter((child) => child.isActive));
    const isRadicalBlock = computed(() => ["{contextualBaseHelp}", "{completeAdviceHelp}"].includes(props.block.content.trim()));
    const isDefinitionBlock = computed(() => props.block.content.trim() === "{definitionHelp}");
    const isLiteraryDefinitionBlock = computed(() => props.block.id === -8201);
    const isCondensedTenseRuleBlock = computed(() => props.block.content.trim() === "{condensedTenseRuleHelp}");
    const isResultBlock = computed(() => props.block.title.trim().normalize("NFD").replace(new RegExp("\\p{Diacritic}", "gu"), "").toLocaleLowerCase("fr") === "resultat");
    const orthographyKind = computed(() => automaticOrthographyHelpKind(props.block));
    const renderedTitle = computed(() => isDefinitionBlock.value ? isLiteraryDefinitionBlock.value ? uiLabel(props.block.title) : ui("Définition") : isRadicalBlock.value ? "" : uiLabel(props.block.title));
    const renderedContent = computed(() => sanitizeCoachHtml(renderCoachHelpContent(props.block.content, props.values, props.block.explanationApproach || "cif-falc")));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CoachHelpBlockView = __nuxt_component_0$1;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: ["coach-help-block", [`coach-help-block--${__props.block.type}`, { "coach-help-block--orthography": unref(orthographyKind), "coach-help-block--radical": unref(isRadicalBlock), "coach-help-block--definition": unref(isDefinitionBlock), "coach-help-block--result": unref(isResultBlock) }]]
      }, _attrs))} data-v-fcb15739>`);
      if (unref(renderedTitle)) {
        _push(`<h3 data-v-fcb15739>`);
        if (unref(orthographyKind)) {
          _push(`<span class="coach-help-block__letter" aria-hidden="true" data-v-fcb15739>${ssrInterpolate(unref(orthographyKind).toUpperCase())}</span>`);
        } else if (unref(isDefinitionBlock)) {
          _push(`<span class="coach-help-block__info-icon" aria-hidden="true" data-v-fcb15739>i</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(renderedTitle))}</h3>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(renderedContent)) {
        _push(`<div class="${ssrRenderClass([{ "coach-help-block__content--radical": unref(isRadicalBlock), "coach-help-block__content--condensed-tense-rule": unref(isCondensedTenseRuleBlock) }, "coach-help-block__content"])}" data-v-fcb15739>${unref(renderedContent) ?? ""}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeChildren).length) {
        _push(`<div class="coach-help-block__children" data-v-fcb15739><!--[-->`);
        ssrRenderList(unref(activeChildren), (child, index) => {
          _push(ssrRenderComponent(_component_CoachHelpBlockView, {
            key: `${child.id}-${index}`,
            block: child,
            values: __props.values
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/coach/CoachHelpBlockView.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-fcb15739"]]), { __name: "CoachHelpBlockView" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CoachHelpPanel",
  __ssrInlineRender: true,
  props: {
    blocks: {},
    values: {},
    headerTitle: { default: "{helpTitle}" },
    headerDescription: { default: "" },
    questionNumber: { default: 1 },
    coachColor: { default: "#295f72" },
    embedded: { type: Boolean, default: false },
    showClose: { type: Boolean, default: true },
    showFeedback: { type: Boolean, default: true },
    includeAutomaticOrthography: { type: Boolean, default: true },
    enableAutomaticAudit: { type: Boolean, default: true },
    feedbackContext: {}
  },
  emits: ["close", "contentScroll", "previewScroll"],
  setup(__props, { emit: __emit }) {
    const { ui, uiLabel } = useLanguagePreferences();
    const props = __props;
    const content = useTemplateRef("content");
    useTemplateRef("feedbackTextarea");
    const feedbackType = ref("");
    const feedbackComment = ref("");
    const feedbackStatus = ref("idle");
    const feedbackError = ref("");
    const feedbackOptions = computed(() => [
      { type: "useful", label: ui("Utile"), icon: "✓" },
      { type: "unclear", label: ui("Pas clair"), icon: "?" },
      { type: "error", label: ui("Erreur"), icon: "!" },
      { type: "remark", label: ui("Remarque"), icon: "✎" }
    ]);
    const activeProfile = computed(() => coachHelpProfile(props.blocks.find((block) => block.profileId)?.profileId));
    const renderedBlocks = computed(() => [
      ...props.blocks.map((block, blockIndex) => ({ block, blockIndex })).filter((item) => item.block.isActive),
      ...props.includeAutomaticOrthography ? conditionalCoachHelpBlocks(activeProfile.value.id, props.values).map((block) => ({ block, blockIndex: null })) : []
    ]);
    const sourceRenderedHtml = computed(() => renderedBlocks.value.map((item) => renderHelpBlockSnapshot(item.block, item.blockIndex)).map(snapshotHtml).join("\n"));
    const automaticAuditInput = computed(() => {
      const context = props.feedbackContext || {};
      const question = context.currentQuestion;
      const verb = context.currentVerb;
      const tense = context.currentTense;
      return question && verb ? { question, verb, tense } : null;
    });
    const automaticAudit = computed(() => props.enableAutomaticAudit && automaticAuditInput.value ? auditRenderedCoachHelp({
      renderedHtml: sourceRenderedHtml.value,
      blocks: renderedBlocks.value.map((item) => item.block),
      question: automaticAuditInput.value.question,
      verb: automaticAuditInput.value.verb,
      tense: automaticAuditInput.value.tense
    }) : null);
    const safeFallbackBlock = computed(() => ({
      id: -990001,
      type: "warning",
      title: ui("Aide sécurisée"),
      content: `<p>${ui("Une incohérence a été détectée dans l’explication détaillée. La réponse officielle à retenir est :")}</p><p><mark><strong>{correctAnswers}</strong></mark></p>`,
      explanationApproach: "cif-falc",
      isActive: true,
      sortOrder: 1,
      children: []
    }));
    const safeAdviceFallbackBlock = computed(() => ({
      id: -990002,
      type: "warning",
      title: ui("Aide sécurisée"),
      content: `<p>${ui("Une incohérence a été détectée dans cette explication. Repère le temps et la personne, cherche le radical, puis choisis la terminaison correspondante.")}</p>`,
      explanationApproach: "cif-falc",
      profileId: "complete",
      isActive: true,
      sortOrder: 1,
      children: []
    }));
    const displayedBlocks = computed(() => automaticAudit.value?.status === "failed" ? [{ block: activeProfile.value.revealsAnswers ? safeFallbackBlock.value : safeAdviceFallbackBlock.value, blockIndex: null }] : renderedBlocks.value);
    const renderedHeaderTitle = computed(() => renderCoachHelpContent("{helpTitle}", props.values));
    const renderedHeaderDescription = computed(() => sanitizeCoachHtml(renderCoachHelpContent(props.headerDescription, props.values)));
    const feedbackRequiresComment = computed(() => feedbackType.value !== "" && feedbackType.value !== "useful");
    const displayedHelpSnapshot = computed(() => ({
      header: {
        title: renderedHeaderTitle.value,
        descriptionHtml: renderedHeaderDescription.value
      },
      blocks: renderedBlocks.value.map((item) => renderHelpBlockSnapshot(item.block, item.blockIndex)),
      values: props.values
    }));
    let lastAutomaticErrorReport = "";
    function resetFeedback() {
      feedbackType.value = "";
      feedbackComment.value = "";
      feedbackStatus.value = "idle";
      feedbackError.value = "";
    }
    function preferredScrollBehavior() {
      return "auto";
    }
    function scrollContentToTop() {
      void nextTick(() => {
        (void 0).requestAnimationFrame(() => {
          content.value?.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
        });
      });
    }
    function renderedBlockTitle(block) {
      const content2 = block.content.trim();
      if (content2 === "{definitionHelp}") return block.id === -8201 ? uiLabel(block.title) : ui("Définition");
      if (content2 === "{contextualBaseHelp}") return "";
      return uiLabel(block.title);
    }
    function renderHelpBlockSnapshot(block, blockIndex) {
      const children = (block.children || []).filter((child) => child.isActive);
      return {
        id: block.id,
        sourceIndex: blockIndex,
        type: block.type,
        title: renderedBlockTitle(block),
        sourceTitle: block.title,
        sourceContent: block.content,
        explanationApproach: block.explanationApproach,
        renderedHtml: sanitizeCoachHtml(renderCoachHelpContent(block.content, props.values, block.explanationApproach || "cif-falc")),
        children: children.map((child, index) => renderHelpBlockSnapshot(child, index))
      };
    }
    function snapshotHtml(snapshot) {
      const children = Array.isArray(snapshot.children) ? snapshot.children : [];
      return [String(snapshot.renderedHtml || ""), ...children.map(snapshotHtml)].join("\n");
    }
    async function reportAutomaticErrors() {
      const input = automaticAuditInput.value;
      const audit = automaticAudit.value;
      const errors = audit?.issues.filter((issue) => issue.severity === "error") || [];
      if (props.embedded || !input || !errors.length || !props.feedbackContext?.sessionId) return;
      const reportKey = JSON.stringify([
        props.feedbackContext.exerciseRunId,
        props.feedbackContext.questionNumber,
        errors.map((issue) => issue.code)
      ]);
      if (reportKey === lastAutomaticErrorReport) return;
      lastAutomaticErrorReport = reportKey;
      try {
        await $fetch("/api/coach-help-errors", {
          method: "POST",
          body: {
            context: { ...props.feedbackContext, uiContext: currentUiContext() },
            blocks: renderedBlocks.value.map((item) => item.block),
            question: input.question,
            verb: input.verb,
            tense: input.tense,
            clientAudit: audit,
            renderedHtml: sourceRenderedHtml.value,
            displayedHelp: displayedHelpSnapshot.value
          }
        });
      } catch {
        if (lastAutomaticErrorReport === reportKey) lastAutomaticErrorReport = "";
      }
    }
    function currentUiContext() {
      return {};
    }
    watch(() => props.questionNumber, () => {
      resetFeedback();
      scrollContentToTop();
      void reportAutomaticErrors();
    });
    watch(sourceRenderedHtml, () => {
      void reportAutomaticErrors();
    }, { flush: "post" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CoachHelpBlockView = __nuxt_component_0$1;
      _push(`<aside${ssrRenderAttrs(mergeProps({
        "data-tour": "chat-help",
        class: ["coach-help-panel", { "coach-help-panel--embedded": __props.embedded }],
        style: { "--coach-color": __props.coachColor },
        role: "region",
        "aria-labelledby": "coach-help-title"
      }, _attrs))} data-v-6f306b55><span class="coach-help-badge" data-v-6f306b55>${ssrInterpolate(unref(ui)("Aide"))}</span><header class="coach-help-header" data-v-6f306b55><div data-v-6f306b55><h2 id="coach-help-title" data-v-6f306b55>${ssrInterpolate(unref(renderedHeaderTitle))}</h2>`);
      if (unref(renderedHeaderDescription)) {
        _push(`<div class="coach-help-header__description" data-v-6f306b55>${unref(renderedHeaderDescription) ?? ""}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.showClose) {
        _push(`<button type="button"${ssrRenderAttr("aria-label", unref(ui)("Fermer l’aide"))} data-v-6f306b55>×</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header><div class="coach-help-content" data-v-6f306b55><!--[-->`);
      ssrRenderList(unref(displayedBlocks), (item) => {
        _push(ssrRenderComponent(_component_CoachHelpBlockView, {
          key: `${item.block.id}-${item.blockIndex ?? "automatic"}`,
          "data-help-block-index": item.blockIndex,
          block: item.block,
          values: __props.values
        }, null, _parent));
      });
      _push(`<!--]-->`);
      if (__props.showFeedback) {
        _push(`<section class="coach-help-feedback" aria-labelledby="coach-help-feedback-title" data-v-6f306b55><h3 id="coach-help-feedback-title" class="sr-only" data-v-6f306b55>${ssrInterpolate(unref(ui)("Retour sur l’aide automatique"))}</h3><p data-v-6f306b55>${ssrInterpolate(unref(ui)("Cette aide est générée automatiquement. Elle peut contenir une erreur ou manquer de clarté. Les retours permettent de l’améliorer."))}</p><div class="coach-help-feedback__actions" role="group"${ssrRenderAttr("aria-label", unref(ui)("Retour sur cette aide"))} data-v-6f306b55><!--[-->`);
        ssrRenderList(unref(feedbackOptions), (option) => {
          _push(`<button type="button" class="${ssrRenderClass({ "is-selected": unref(feedbackType) === option.type })}"${ssrIncludeBooleanAttr(unref(feedbackStatus) === "sending") ? " disabled" : ""} data-v-6f306b55><span aria-hidden="true" data-v-6f306b55>${ssrInterpolate(option.icon)}</span> ${ssrInterpolate(option.label)}</button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(feedbackRequiresComment) && unref(feedbackStatus) !== "sent") {
          _push(`<form class="coach-help-feedback__form" data-v-6f306b55><label for="coach-help-feedback-comment" data-v-6f306b55>${ssrInterpolate(unref(ui)("Remarque optionnelle"))}</label><textarea id="coach-help-feedback-comment" rows="3" maxlength="2000"${ssrRenderAttr("placeholder", unref(ui)("Précision utile pour corriger ou améliorer l’aide…"))} data-v-6f306b55>${ssrInterpolate(unref(feedbackComment))}</textarea><button type="submit"${ssrIncludeBooleanAttr(unref(feedbackStatus) === "sending") ? " disabled" : ""} data-v-6f306b55>${ssrInterpolate(unref(feedbackStatus) === "sending" ? unref(ui)("Envoi…") : unref(ui)("Envoyer le retour"))}</button></form>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(feedbackStatus) === "sent") {
          _push(`<p class="coach-help-feedback__status" data-v-6f306b55>${ssrInterpolate(unref(ui)("Retour enregistré."))}</p>`);
        } else if (unref(feedbackError)) {
          _push(`<p class="coach-help-feedback__error" data-v-6f306b55>${ssrInterpolate(unref(feedbackError))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><footer class="coach-help-footer" data-v-6f306b55><button type="button" data-v-6f306b55>${ssrInterpolate(unref(ui)("Fermer"))}</button></footer></aside>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/coach/CoachHelpPanel.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-6f306b55"]]), { __name: "CoachHelpPanel" });

export { __nuxt_component_0 as _, automaticCoachHelpApproach as a, conditionalCoachHelpBlocks as b, coachHelpQuestionVariables as c, areOnlyIndicativeTenses as d, localizedCoachVerbDefinition as e, literaryIdentificationCoachHelpBlocks as l, renderCoachHelpContent as r, sanitizeCoachHtml as s, visibleCoachHelpBlocks as v, withoutIndicativeMode as w };
//# sourceMappingURL=CoachHelpPanel-CV6-CBeI.mjs.map

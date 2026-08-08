import { _ as __nuxt_component_0 } from './LearningSubnav-CV5szJr4.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { i as isExerciseLandingSlug, e as exerciseLandingPage } from '../_/exercise-landing-pages.mjs';
import { M as MODE_LANDING_SLUGS, m as modeLandingPage } from '../_/mode-landing-pages.mjs';
import { m as modeTensePages } from '../_/mode-tense-pages.mjs';
import { g as useRoute, f as useLanguagePreferences, k as createError, n as navigateTo, u as useHead, o as useSeoMeta } from './server.mjs';
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

const translations = {
  present: {
    fr: {
      title: "La formation du pr\xE9sent selon le groupe",
      intro: "Le sujet donne la personne ; le groupe et la famille du verbe permettent ensuite de choisir le radical et la terminaison.",
      groups: [
        { label: "1er groupe", explanation: "Pour la plupart des verbes en -er, enl\xE8ve -er et ajoute les terminaisons du pr\xE9sent.", note: "Le s de \xAB tu \xBB et le -ent de \xAB ils \xBB ne s\u2019entendent g\xE9n\xE9ralement pas." },
        { label: "2e groupe", explanation: "Ces verbes en -ir font -issons avec nous. Ils utilisent le radical court au singulier et -iss- au pluriel.", note: "Tous les verbes en -ir ne sont pas du 2e groupe : partir et venir appartiennent au 3e." },
        { label: "3e groupe", explanation: "Il n\u2019existe pas une seule s\xE9rie. Le radical peut changer et les terminaisons d\xE9pendent de la famille du verbe.", note: "Apprends en priorit\xE9 les formes je, nous et ils : elles r\xE9v\xE8lent souvent les diff\xE9rents radicaux." }
      ],
      specialTitle: "Cas particuliers fr\xE9quents",
      specialCases: ["-ger : nous mangeons pour conserver le son [\u0292].", "-cer : nous lan\xE7ons avec une c\xE9dille.", "-yer : j\u2019essaie ou j\u2019essaye, mais nous essayons.", "-eler et -eter : j\u2019appelle, je jette ; certains verbes prennent plut\xF4t \xE8, comme j\u2019ach\xE8te."]
    },
    de: {
      title: "Pr\xE4sensbildung nach Verbgruppe",
      intro: "Das Subjekt bestimmt die Person; Verbgruppe und Verbfamilie bestimmen anschlie\xDFend Stamm und Endung.",
      groups: [
        { label: "1. Gruppe", explanation: "Bei den meisten Verben auf -er wird -er entfernt und die Pr\xE4sensendung angef\xFCgt.", note: "Das s bei tu und -ent bei ils sind normalerweise nicht h\xF6rbar." },
        { label: "2. Gruppe", explanation: "Diese Verben auf -ir bilden mit nous die Endung -issons. Im Singular steht der kurze Stamm, im Plural -iss-.", note: "Nicht alle Verben auf -ir geh\xF6ren zur 2. Gruppe: partir und venir geh\xF6ren zur 3." },
        { label: "3. Gruppe", explanation: "Es gibt kein einheitliches Muster. Stamm und Endungen h\xE4ngen von der Verbfamilie ab.", note: "Lerne besonders die Formen je, nous und ils; sie zeigen oft die verschiedenen St\xE4mme." }
      ],
      specialTitle: "H\xE4ufige Besonderheiten",
      specialCases: ["-ger: nous mangeons erh\xE4lt den Laut [\u0292].", "-cer: nous lan\xE7ons mit Cedille.", "-yer: j\u2019essaie oder j\u2019essaye, aber nous essayons.", "-eler und -eter: j\u2019appelle, je jette; manche Verben nehmen stattdessen \xE8, etwa j\u2019ach\xE8te."]
    },
    en: {
      title: "Forming the present tense by verb group",
      intro: "The subject determines the person; the verb\u2019s group and family then determine the stem and ending.",
      groups: [
        { label: "First group", explanation: "For most verbs ending in -er, remove -er and add the present-tense endings.", note: "The s in the tu form and -ent in the ils form are generally silent." },
        { label: "Second group", explanation: "These -ir verbs form -issons with nous. They use the short stem in the singular and -iss- in the plural.", note: "Not every -ir verb belongs to this group: partir and venir are third-group verbs." },
        { label: "Third group", explanation: "There is no single pattern. The stem may change and endings depend on the verb family.", note: "Learn the je, nous and ils forms first; they often reveal the different stems." }
      ],
      specialTitle: "Common special cases",
      specialCases: ["-ger: nous mangeons keeps the [\u0292] sound.", "-cer: nous lan\xE7ons takes a cedilla.", "-yer: j\u2019essaie or j\u2019essaye, but nous essayons.", "-eler and -eter: j\u2019appelle, je jette; some verbs take \xE8 instead, such as j\u2019ach\xE8te."]
    },
    it: {
      title: "Formazione del presente secondo il gruppo",
      intro: "Il soggetto indica la persona; il gruppo e la famiglia del verbo determinano poi radice e desinenza.",
      groups: [
        { label: "1\xB0 gruppo", explanation: "Per la maggior parte dei verbi in -er, elimina -er e aggiungi le desinenze del presente.", note: "La s di tu e -ent di ils generalmente non si pronunciano." },
        { label: "2\xB0 gruppo", explanation: "Questi verbi in -ir formano -issons con nous. Usano la radice breve al singolare e -iss- al plurale.", note: "Non tutti i verbi in -ir appartengono al 2\xB0 gruppo: partir e venir sono del 3\xB0." },
        { label: "3\xB0 gruppo", explanation: "Non esiste un unico modello. La radice pu\xF2 cambiare e le desinenze dipendono dalla famiglia.", note: "Impara prima le forme je, nous e ils: spesso mostrano le diverse radici." }
      ],
      specialTitle: "Casi particolari frequenti",
      specialCases: ["-ger: nous mangeons conserva il suono [\u0292].", "-cer: nous lan\xE7ons prende la cediglia.", "-yer: j\u2019essaie o j\u2019essaye, ma nous essayons.", "-eler e -eter: j\u2019appelle, je jette; alcuni verbi prendono invece \xE8, come j\u2019ach\xE8te."]
    },
    es: {
      title: "Formaci\xF3n del presente seg\xFAn el grupo",
      intro: "El sujeto indica la persona; el grupo y la familia del verbo determinan despu\xE9s la ra\xEDz y la terminaci\xF3n.",
      groups: [
        { label: "1.er grupo", explanation: "En la mayor\xEDa de los verbos en -er, se elimina -er y se a\xF1aden las terminaciones del presente.", note: "La s de tu y -ent de ils normalmente no se pronuncian." },
        { label: "2.\xBA grupo", explanation: "Estos verbos en -ir forman -issons con nous. Usan la ra\xEDz corta en singular y -iss- en plural.", note: "No todos los verbos en -ir pertenecen al 2.\xBA grupo: partir y venir son del 3.\xBA." },
        { label: "3.er grupo", explanation: "No existe un \xFAnico modelo. La ra\xEDz puede cambiar y las terminaciones dependen de la familia.", note: "Aprende primero las formas je, nous e ils: suelen mostrar las distintas ra\xEDces." }
      ],
      specialTitle: "Casos particulares frecuentes",
      specialCases: ["-ger: nous mangeons conserva el sonido [\u0292].", "-cer: nous lan\xE7ons lleva cedilla.", "-yer: j\u2019essaie o j\u2019essaye, pero nous essayons.", "-eler y -eter: j\u2019appelle, je jette; algunos verbos llevan \xE8, como j\u2019ach\xE8te."]
    }
  },
  imparfait: {
    fr: {
      title: "La formation de l\u2019imparfait selon le groupe",
      intro: "La m\xE9thode est presque identique pour tous les groupes : pars de la forme \xAB nous \xBB au pr\xE9sent, enl\xE8ve -ons et ajoute la terminaison.",
      groups: [
        { label: "1er groupe", explanation: "Le radical vient de nous au pr\xE9sent : nous chantons \u2192 chant-. Ajoute ensuite -ais, -ais, -ait, -ions, -iez, -aient.", note: "Les verbes en -ger et -cer conservent l\u2019orthographe n\xE9cessaire au son : je mangeais, je lan\xE7ais." },
        { label: "2e groupe", explanation: "La forme nous finissons donne le radical finiss-. Ce -iss- reste \xE0 toutes les personnes de l\u2019imparfait.", note: "Ne reviens pas directement \xE0 l\u2019infinitif finir : utilise toujours nous finissons." },
        { label: "3e groupe", explanation: "La forme nous au pr\xE9sent fournit aussi le radical : nous prenons \u2192 pren-, nous venons \u2192 ven-.", note: "Seul \xEAtre est vraiment exceptionnel : son radical est \xE9t-." }
      ],
      specialTitle: "Cas particuliers fr\xE9quents",
      specialCases: ["\xEAtre : j\u2019\xE9tais, nous \xE9tions.", "-ier : nous \xE9tudiions et vous \xE9tudiiez conservent deux i.", "-yer : nous payions et vous payiez conservent le y du radical de nous.", "Les terminaisons -ais, -ait et -aient se prononcent de la m\xEAme mani\xE8re."]
    },
    de: {
      title: "Imparfait-Bildung nach Verbgruppe",
      intro: "Die Methode ist f\xFCr fast alle Gruppen gleich: Nimm die nous-Form im Pr\xE4sens, entferne -ons und f\xFCge die Endung an.",
      groups: [
        { label: "1. Gruppe", explanation: "Der Stamm kommt von nous im Pr\xE4sens: nous chantons \u2192 chant-. Erg\xE4nze -ais, -ais, -ait, -ions, -iez, -aient.", note: "Verben auf -ger und -cer bewahren die n\xF6tige Schreibweise: je mangeais, je lan\xE7ais." },
        { label: "2. Gruppe", explanation: "Nous finissons ergibt den Stamm finiss-. Dieses -iss- bleibt in allen Personen erhalten.", note: "Gehe nicht direkt vom Infinitiv finir aus; verwende immer nous finissons." },
        { label: "3. Gruppe", explanation: "Auch hier liefert nous im Pr\xE4sens den Stamm: nous prenons \u2192 pren-, nous venons \u2192 ven-.", note: "Nur \xEAtre ist wirklich unregelm\xE4\xDFig: Der Stamm lautet \xE9t-." }
      ],
      specialTitle: "H\xE4ufige Besonderheiten",
      specialCases: ["\xEAtre: j\u2019\xE9tais, nous \xE9tions.", "-ier: nous \xE9tudiions und vous \xE9tudiiez behalten zwei i.", "-yer: nous payions und vous payiez behalten das y.", "Die Endungen -ais, -ait und -aient werden gleich ausgesprochen."]
    },
    en: {
      title: "Forming the imperfect by verb group",
      intro: "The method is almost identical for every group: take the present nous form, remove -ons and add the ending.",
      groups: [
        { label: "First group", explanation: "The stem comes from the present nous form: nous chantons \u2192 chant-. Add -ais, -ais, -ait, -ions, -iez, -aient.", note: "Verbs ending in -ger and -cer keep the spelling needed for the sound: je mangeais, je lan\xE7ais." },
        { label: "Second group", explanation: "Nous finissons gives the stem finiss-. This -iss- remains in every imperfect form.", note: "Do not work directly from the infinitive finir; always use nous finissons." },
        { label: "Third group", explanation: "The present nous form also gives the stem: nous prenons \u2192 pren-, nous venons \u2192 ven-.", note: "Only \xEAtre is truly exceptional: its stem is \xE9t-." }
      ],
      specialTitle: "Common special cases",
      specialCases: ["\xEAtre: j\u2019\xE9tais, nous \xE9tions.", "-ier: nous \xE9tudiions and vous \xE9tudiiez keep two i\u2019s.", "-yer: nous payions and vous payiez keep the y.", "The endings -ais, -ait and -aient sound the same."]
    },
    it: {
      title: "Formazione dell\u2019imperfetto secondo il gruppo",
      intro: "Il metodo \xE8 quasi uguale per tutti i gruppi: prendi la forma nous del presente, elimina -ons e aggiungi la desinenza.",
      groups: [
        { label: "1\xB0 gruppo", explanation: "La radice viene da nous al presente: nous chantons \u2192 chant-. Aggiungi -ais, -ais, -ait, -ions, -iez, -aient.", note: "I verbi in -ger e -cer conservano la grafia necessaria: je mangeais, je lan\xE7ais." },
        { label: "2\xB0 gruppo", explanation: "Nous finissons d\xE0 la radice finiss-. Questo -iss- resta in tutte le persone.", note: "Non partire direttamente dall\u2019infinito finir: usa sempre nous finissons." },
        { label: "3\xB0 gruppo", explanation: "Anche qui la forma nous del presente d\xE0 la radice: nous prenons \u2192 pren-, nous venons \u2192 ven-.", note: "Solo \xEAtre \xE8 davvero irregolare: la radice \xE8 \xE9t-." }
      ],
      specialTitle: "Casi particolari frequenti",
      specialCases: ["\xEAtre: j\u2019\xE9tais, nous \xE9tions.", "-ier: nous \xE9tudiions e vous \xE9tudiiez conservano due i.", "-yer: nous payions e vous payiez conservano la y.", "Le desinenze -ais, -ait e -aient hanno la stessa pronuncia."]
    },
    es: {
      title: "Formaci\xF3n del imperfecto seg\xFAn el grupo",
      intro: "El m\xE9todo es casi igual para todos los grupos: toma la forma nous del presente, elimina -ons y a\xF1ade la terminaci\xF3n.",
      groups: [
        { label: "1.er grupo", explanation: "La ra\xEDz viene de nous en presente: nous chantons \u2192 chant-. A\xF1ade -ais, -ais, -ait, -ions, -iez, -aient.", note: "Los verbos en -ger y -cer conservan la graf\xEDa necesaria: je mangeais, je lan\xE7ais." },
        { label: "2.\xBA grupo", explanation: "Nous finissons da la ra\xEDz finiss-. Este -iss- se mantiene en todas las personas.", note: "No partas directamente del infinitivo finir: usa siempre nous finissons." },
        { label: "3.er grupo", explanation: "La forma nous del presente tambi\xE9n da la ra\xEDz: nous prenons \u2192 pren-, nous venons \u2192 ven-.", note: "Solo \xEAtre es realmente irregular: su ra\xEDz es \xE9t-." }
      ],
      specialTitle: "Casos particulares frecuentes",
      specialCases: ["\xEAtre: j\u2019\xE9tais, nous \xE9tions.", "-ier: nous \xE9tudiions y vous \xE9tudiiez conservan dos \xEDes.", "-yer: nous payions y vous payiez conservan la y.", "Las terminaciones -ais, -ait y -aient se pronuncian igual."]
    }
  },
  "passe-compose": {
    fr: {
      title: "La formation du pass\xE9 compos\xE9 selon le groupe",
      intro: "Le groupe aide surtout \xE0 former le participe pass\xE9. Il faut ensuite choisir avoir ou \xEAtre au pr\xE9sent et v\xE9rifier l\u2019accord.",
      groups: [
        { label: "1er groupe", explanation: "Le participe pass\xE9 des verbes r\xE9guliers en -er se termine en -\xE9 : chanter \u2192 chant\xE9.", note: "Ne confonds pas l\u2019infinitif en -er et le participe pass\xE9 en -\xE9." },
        { label: "2e groupe", explanation: "Le participe pass\xE9 r\xE9gulier se termine en -i : finir \u2192 fini, choisir \u2192 choisi.", note: "Le -iss- du pr\xE9sent dispara\xEEt au participe pass\xE9 : fini, et non finissi." },
        { label: "3e groupe", explanation: "Les participes pass\xE9s sont vari\xE9s : pris, venu, fait, lu, \xE9crit, ouvert. Ils doivent souvent \xEAtre appris.", note: "Regroupe les verbes par famille et v\xE9rifie aussi leur auxiliaire." }
      ],
      specialTitle: "Auxiliaires et accords",
      specialCases: ["Avec avoir, le participe reste g\xE9n\xE9ralement invariable, sauf si le COD est plac\xE9 avant.", "Avec \xEAtre, le participe s\u2019accorde g\xE9n\xE9ralement avec le sujet.", "Les verbes pronominaux utilisent \xEAtre, mais leur accord d\xE9pend de la fonction du pronom.", "Certains verbes acceptent avoir ou \xEAtre selon leur sens : elle est sortie, elle a sorti le livre."]
    },
    de: {
      title: "Pass\xE9-compos\xE9-Bildung nach Verbgruppe",
      intro: "Die Gruppe hilft vor allem bei der Bildung des Partizips. Danach w\xE4hlst du avoir oder \xEAtre im Pr\xE4sens und pr\xFCfst die Angleichung.",
      groups: [
        { label: "1. Gruppe", explanation: "Das regelm\xE4\xDFige Partizip der Verben auf -er endet auf -\xE9: chanter \u2192 chant\xE9.", note: "Verwechsle den Infinitiv auf -er nicht mit dem Partizip auf -\xE9." },
        { label: "2. Gruppe", explanation: "Das regelm\xE4\xDFige Partizip endet auf -i: finir \u2192 fini, choisir \u2192 choisi.", note: "Das -iss- des Pr\xE4sens verschwindet: fini, nicht finissi." },
        { label: "3. Gruppe", explanation: "Die Partizipien sind verschieden: pris, venu, fait, lu, \xE9crit, ouvert. Sie m\xFCssen oft gelernt werden.", note: "Lerne Verbfamilien gemeinsam und pr\xFCfe auch das Hilfsverb." }
      ],
      specialTitle: "Hilfsverben und Angleichung",
      specialCases: ["Mit avoir bleibt das Partizip meist unver\xE4ndert, au\xDFer wenn das direkte Objekt davorsteht.", "Mit \xEAtre stimmt das Partizip normalerweise mit dem Subjekt \xFCberein.", "Pronominalverben verwenden \xEAtre; die Angleichung h\xE4ngt aber von der Funktion des Pronomens ab.", "Einige Verben verwenden je nach Bedeutung avoir oder \xEAtre: elle est sortie, elle a sorti le livre."]
    },
    en: {
      title: "Forming the perfect tense by verb group",
      intro: "The group mainly helps form the past participle. Then choose avoir or \xEAtre in the present and check agreement.",
      groups: [
        { label: "First group", explanation: "The regular past participle of -er verbs ends in -\xE9: chanter \u2192 chant\xE9.", note: "Do not confuse the -er infinitive with the -\xE9 past participle." },
        { label: "Second group", explanation: "The regular past participle ends in -i: finir \u2192 fini, choisir \u2192 choisi.", note: "The present-tense -iss- disappears: fini, not finissi." },
        { label: "Third group", explanation: "Past participles vary: pris, venu, fait, lu, \xE9crit, ouvert. They often need to be learnt.", note: "Learn verbs in families and check which auxiliary they use." }
      ],
      specialTitle: "Auxiliaries and agreement",
      specialCases: ["With avoir, the participle is usually unchanged unless a direct object comes before it.", "With \xEAtre, the participle generally agrees with the subject.", "Pronominal verbs use \xEAtre, but agreement depends on the pronoun\u2019s function.", "Some verbs use avoir or \xEAtre according to meaning: elle est sortie, elle a sorti le livre."]
    },
    it: {
      title: "Formazione del pass\xE9 compos\xE9 secondo il gruppo",
      intro: "Il gruppo aiuta soprattutto a formare il participio passato. Poi bisogna scegliere avoir o \xEAtre al presente e controllare l\u2019accordo.",
      groups: [
        { label: "1\xB0 gruppo", explanation: "Il participio passato regolare dei verbi in -er termina in -\xE9: chanter \u2192 chant\xE9.", note: "Non confondere l\u2019infinito in -er con il participio in -\xE9." },
        { label: "2\xB0 gruppo", explanation: "Il participio passato regolare termina in -i: finir \u2192 fini, choisir \u2192 choisi.", note: "La sequenza -iss- del presente scompare: fini, non finissi." },
        { label: "3\xB0 gruppo", explanation: "I participi sono vari: pris, venu, fait, lu, \xE9crit, ouvert. Spesso vanno imparati.", note: "Studia i verbi per famiglie e controlla anche l\u2019ausiliare." }
      ],
      specialTitle: "Ausiliari e accordi",
      specialCases: ["Con avoir, il participio resta generalmente invariato, salvo un COD posto prima.", "Con \xEAtre, il participio concorda generalmente con il soggetto.", "I verbi pronominali usano \xEAtre, ma l\u2019accordo dipende dalla funzione del pronome.", "Alcuni verbi usano avoir o \xEAtre secondo il senso: elle est sortie, elle a sorti le livre."]
    },
    es: {
      title: "Formaci\xF3n del pass\xE9 compos\xE9 seg\xFAn el grupo",
      intro: "El grupo ayuda sobre todo a formar el participio pasado. Despu\xE9s hay que elegir avoir o \xEAtre en presente y comprobar la concordancia.",
      groups: [
        { label: "1.er grupo", explanation: "El participio regular de los verbos en -er termina en -\xE9: chanter \u2192 chant\xE9.", note: "No confundas el infinitivo en -er con el participio en -\xE9." },
        { label: "2.\xBA grupo", explanation: "El participio regular termina en -i: finir \u2192 fini, choisir \u2192 choisi.", note: "El -iss- del presente desaparece: fini, no finissi." },
        { label: "3.er grupo", explanation: "Los participios son variados: pris, venu, fait, lu, \xE9crit, ouvert. A menudo hay que aprenderlos.", note: "Estudia los verbos por familias y comprueba tambi\xE9n el auxiliar." }
      ],
      specialTitle: "Auxiliares y concordancia",
      specialCases: ["Con avoir, el participio suele permanecer invariable, salvo si el complemento directo aparece antes.", "Con \xEAtre, el participio concuerda normalmente con el sujeto.", "Los verbos pronominales usan \xEAtre, pero la concordancia depende de la funci\xF3n del pronombre.", "Algunos verbos usan avoir o \xEAtre seg\xFAn el sentido: elle est sortie, elle a sorti le livre."]
    }
  }
};
const sharedGroups = {
  present: [
    { model: "chanter", formula: "chant- + e, es, e, ons, ez, ent", forms: ["je chante", "tu chantes", "il chante", "nous chantons", "vous chantez", "ils chantent"] },
    { model: "finir", formula: "fini- / finiss- + s, s, t, ons, ez, ent", forms: ["je finis", "tu finis", "il finit", "nous finissons", "vous finissez", "ils finissent"] },
    { model: "prendre", formula: "prend- / pren- / prenn-", forms: ["je prends", "tu prends", "il prend", "nous prenons", "vous prenez", "ils prennent"] }
  ],
  imparfait: [
    { model: "chanter", formula: "nous chantons \u2192 chant- + terminaisons", forms: ["je chantais", "tu chantais", "il chantait", "nous chantions", "vous chantiez", "ils chantaient"] },
    { model: "finir", formula: "nous finissons \u2192 finiss- + terminaisons", forms: ["je finissais", "tu finissais", "il finissait", "nous finissions", "vous finissiez", "ils finissaient"] },
    { model: "prendre", formula: "nous prenons \u2192 pren- + terminaisons", forms: ["je prenais", "tu prenais", "il prenait", "nous prenions", "vous preniez", "ils prenaient"] }
  ],
  "passe-compose": [
    { model: "chanter", formula: "avoir au pr\xE9sent + chant\xE9", forms: ["j\u2019ai chant\xE9", "tu as chant\xE9", "il a chant\xE9", "nous avons chant\xE9", "vous avez chant\xE9", "ils ont chant\xE9"] },
    { model: "finir", formula: "avoir au pr\xE9sent + fini", forms: ["j\u2019ai fini", "tu as fini", "il a fini", "nous avons fini", "vous avez fini", "ils ont fini"] },
    { model: "prendre", formula: "avoir au pr\xE9sent + pris", forms: ["j\u2019ai pris", "tu as pris", "il a pris", "nous avons pris", "vous avez pris", "ils ont pris"] }
  ]
};
function tenseGroupGuide(slug, locale) {
  const translated = translations[slug][locale];
  return {
    title: translated.title,
    intro: translated.intro,
    groups: translated.groups.map((group, index) => ({ ...group, ...sharedGroups[slug][index] })),
    specialTitle: translated.specialTitle,
    specialCases: translated.specialCases
  };
}

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[parcours]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const { interfaceLocale, localePath } = useLanguagePreferences();
    const slug = String(route.params.parcours || "");
    if (!isExerciseLandingSlug(slug)) {
      throw createError({ statusCode: 404, statusMessage: "Parcours introuvable" });
    }
    [__temp, __restore] = withAsyncContext(() => navigateTo(localePath(`/indicatif/${slug}`), { redirectCode: 301 })), await __temp, __restore();
    const page = computed(() => exerciseLandingPage(slug, interfaceLocale.value));
    const groupGuide = computed(() => tenseGroupGuide(slug, interfaceLocale.value));
    const modeNavigation = computed(() => MODE_LANDING_SLUGS.map((modeSlug) => ({
      key: modeSlug,
      label: modeLandingPage(modeSlug, interfaceLocale.value).modeName,
      to: localePath("/apprendre")
    })));
    const tenseNavigation = computed(() => modeTensePages("indicatif").map((tense) => ({
      key: tense.slug,
      label: tense.label,
      to: localePath(tense.path)
    })));
    const navigationLabels = computed(() => ({
      fr: { modes: "Les modes", tenses: "indicatif" },
      de: { modes: "Die Modi", tenses: "indicatif" },
      en: { modes: "French moods", tenses: "indicatif" },
      it: { modes: "I modi", tenses: "indicatif" },
      es: { modes: "Los modos", tenses: "indicatif" }
    })[interfaceLocale.value]);
    const exerciseUrl = computed(() => ({
      path: localePath("/"),
      query: { parcours: slug }
    }));
    useHead(() => ({
      title: page.value.metaTitle,
      meta: [
        { name: "description", content: page.value.description },
        { property: "og:title", content: page.value.metaTitle },
        { property: "og:description", content: page.value.description },
        { property: "og:type", content: "website" }
      ]
    }));
    useSeoMeta({
      twitterCard: "summary"
    });
    const learningResource = computed(() => ({
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: page.value.title,
      description: page.value.description,
      learningResourceType: "Exercise",
      educationalUse: "Practice",
      inLanguage: interfaceLocale.value,
      teaches: `Conjugaison française : ${page.value.tenseName}`,
      isAccessibleForFree: true
    }));
    useHead(() => ({
      script: [{
        key: "exercise-learning-resource",
        type: "application/ld+json",
        textContent: JSON.stringify(learningResource.value)
      }]
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LearningSubnav = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<main${ssrRenderAttrs(mergeProps({ class: "exercise-landing" }, _attrs))} data-v-da3f5c02><div class="exercise-landing__navigation" data-v-da3f5c02>`);
      _push(ssrRenderComponent(_component_LearningSubnav, {
        label: unref(navigationLabels).modes,
        items: unref(modeNavigation),
        "active-key": "indicatif"
      }, null, _parent));
      _push(ssrRenderComponent(_component_LearningSubnav, {
        label: unref(navigationLabels).tenses,
        items: unref(tenseNavigation),
        "active-key": unref(slug)
      }, null, _parent));
      _push(`</div><header class="exercise-landing__hero" data-v-da3f5c02><p data-v-da3f5c02>${ssrInterpolate(unref(page).eyebrow)}</p><h1 data-v-da3f5c02>${ssrInterpolate(unref(page).title)}</h1><p data-v-da3f5c02>${ssrInterpolate(unref(page).description)}</p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "exercise-landing__primary",
        to: unref(exerciseUrl)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(page).ctaLabel)}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(page).ctaLabel), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</header><div class="exercise-landing__content" data-v-da3f5c02><section class="exercise-landing__rule" data-v-da3f5c02><p class="exercise-landing__number" data-v-da3f5c02>01</p><div data-v-da3f5c02><h2 data-v-da3f5c02>${ssrInterpolate(unref(page).ruleTitle)}</h2><p data-v-da3f5c02>${ssrInterpolate(unref(page).rule)}</p></div></section><section class="exercise-landing__cards"${ssrRenderAttr("aria-labelledby", `${unref(slug)}-examples`)} data-v-da3f5c02><h2${ssrRenderAttr("id", `${unref(slug)}-examples`)} data-v-da3f5c02>${ssrInterpolate(unref(page).examplesTitle)}</h2><ul data-v-da3f5c02><!--[-->`);
      ssrRenderList(unref(page).examples, (example) => {
        _push(`<li data-v-da3f5c02>${ssrInterpolate(example)}</li>`);
      });
      _push(`<!--]--></ul></section><section class="exercise-landing__cards exercise-landing__cards--watch"${ssrRenderAttr("aria-labelledby", `${unref(slug)}-watch`)} data-v-da3f5c02><h2${ssrRenderAttr("id", `${unref(slug)}-watch`)} data-v-da3f5c02>${ssrInterpolate(unref(page).watchTitle)}</h2><ul data-v-da3f5c02><!--[-->`);
      ssrRenderList(unref(page).watchItems, (item) => {
        _push(`<li data-v-da3f5c02>${ssrInterpolate(item)}</li>`);
      });
      _push(`<!--]--></ul></section><section class="group-guide"${ssrRenderAttr("aria-labelledby", `${unref(slug)}-groups`)} data-v-da3f5c02><header data-v-da3f5c02><p class="exercise-landing__number" data-v-da3f5c02>02</p><div data-v-da3f5c02><h2${ssrRenderAttr("id", `${unref(slug)}-groups`)} data-v-da3f5c02>${ssrInterpolate(unref(groupGuide).title)}</h2><p data-v-da3f5c02>${ssrInterpolate(unref(groupGuide).intro)}</p></div></header><div class="group-guide__grid" data-v-da3f5c02><!--[-->`);
      ssrRenderList(unref(groupGuide).groups, (group) => {
        _push(`<article data-v-da3f5c02><header data-v-da3f5c02><span data-v-da3f5c02>${ssrInterpolate(group.label)}</span><strong data-v-da3f5c02>${ssrInterpolate(group.model)}</strong></header><p data-v-da3f5c02>${ssrInterpolate(group.explanation)}</p><code data-v-da3f5c02>${ssrInterpolate(group.formula)}</code><ul data-v-da3f5c02><!--[-->`);
        ssrRenderList(group.forms, (form) => {
          _push(`<li data-v-da3f5c02>${ssrInterpolate(form)}</li>`);
        });
        _push(`<!--]--></ul><small data-v-da3f5c02>${ssrInterpolate(group.note)}</small></article>`);
      });
      _push(`<!--]--></div><aside data-v-da3f5c02><h3 data-v-da3f5c02>${ssrInterpolate(unref(groupGuide).specialTitle)}</h3><ul data-v-da3f5c02><!--[-->`);
      ssrRenderList(unref(groupGuide).specialCases, (item) => {
        _push(`<li data-v-da3f5c02>${ssrInterpolate(item)}</li>`);
      });
      _push(`<!--]--></ul></aside></section><section class="exercise-landing__cta" data-v-da3f5c02><div data-v-da3f5c02><p data-v-da3f5c02>${ssrInterpolate(unref(page).eyebrow)}</p><h2 data-v-da3f5c02>${ssrInterpolate(unref(page).ctaTitle)}</h2><span data-v-da3f5c02>${ssrInterpolate(unref(page).ctaText)}</span></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: unref(exerciseUrl) }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(page).ctaLabel)} <span aria-hidden="true" data-v-da3f5c02${_scopeId}>→</span>`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(page).ctaLabel) + " ", 1),
              createVNode("span", { "aria-hidden": "true" }, "→")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section></div></main>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/exercices/[parcours].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _parcours_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-da3f5c02"]]);

export { _parcours_ as default };
//# sourceMappingURL=_parcours_-B1nmhSHG.mjs.map

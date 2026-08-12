import { _ as __nuxt_component_0 } from './nuxt-link-icjx6oE7.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrRenderComponent } from 'vue/server-renderer';
import { M as MODE_LANDING_SLUGS, m as modeLandingPage } from '../_/mode-landing-pages.mjs';
import { m as modeTensePages } from '../_/mode-tense-pages.mjs';
import { f as useLanguagePreferences, u as useHead } from './server.mjs';
import { u as useSiteAnalytics } from './useSiteAnalytics-D1wpWTOZ.mjs';
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
import './state-DjsguMyT.mjs';

const EXERCISE_LANDING_SLUGS = ["present", "imparfait", "passe-compose"];
const pages = {
  present: {
    tenseName: "pr\xE9sent",
    translations: {
      fr: {
        title: "Exercices de conjugaison au pr\xE9sent",
        metaTitle: "Exercices de conjugaison au pr\xE9sent gratuits",
        description: "R\xE9vise le pr\xE9sent de l\u2019indicatif avec un exercice personnalis\xE9 \xE0 r\xE9aliser en ligne ou \xE0 imprimer avec son corrig\xE9.",
        eyebrow: "Indicatif \xB7 pr\xE9sent",
        ruleTitle: "\xC0 quoi sert le pr\xE9sent ?",
        rule: "Le pr\xE9sent exprime une action actuelle, une habitude ou une v\xE9rit\xE9 g\xE9n\xE9rale. Les terminaisons d\xE9pendent du groupe du verbe et certains verbes fr\xE9quents ont un radical irr\xE9gulier.",
        examplesTitle: "Trois rep\xE8res",
        examples: ["Je parle avec mon voisin.", "Nous finissons notre travail.", "Ils prennent le train."],
        watchTitle: "Points \xE0 surveiller",
        watchItems: ["L\u2019accord avec le sujet.", "Les terminaisons -e, -es, -ent que l\u2019on n\u2019entend pas toujours.", "Les verbes fr\xE9quents comme \xEAtre, avoir, aller et faire."],
        ctaTitle: "Construis ton exercice au pr\xE9sent",
        ctaText: "Le pr\xE9sent sera d\xE9j\xE0 s\xE9lectionn\xE9. Choisis simplement les verbes, le nombre de questions et la mani\xE8re de t\u2019exercer.",
        ctaLabel: "Commencer un exercice au pr\xE9sent"
      },
      de: {
        title: "\xDCbungen zum franz\xF6sischen Pr\xE4sens",
        metaTitle: "Kostenlose \xDCbungen zum franz\xF6sischen Pr\xE4sens",
        description: "\xDCbe das franz\xF6sische Pr\xE4sens mit einer pers\xF6nlichen Online-\xDCbung oder einem Arbeitsblatt mit L\xF6sungen.",
        eyebrow: "Indikativ \xB7 Pr\xE4sens",
        ruleTitle: "Wann verwendet man das Pr\xE4sens?",
        rule: "Das Pr\xE4sens beschreibt eine aktuelle Handlung, eine Gewohnheit oder eine allgemeine Wahrheit. Die Endungen h\xE4ngen von der Verbgruppe ab; h\xE4ufige Verben haben teilweise einen unregelm\xE4\xDFigen Stamm.",
        examplesTitle: "Drei Beispiele",
        examples: ["Je parle avec mon voisin.", "Nous finissons notre travail.", "Ils prennent le train."],
        watchTitle: "Darauf solltest du achten",
        watchItems: ["Die \xDCbereinstimmung mit dem Subjekt.", "Die oft nicht h\xF6rbaren Endungen -e, -es und -ent.", "H\xE4ufige Verben wie \xEAtre, avoir, aller und faire."],
        ctaTitle: "Erstelle deine Pr\xE4sens\xFCbung",
        ctaText: "Das Pr\xE4sens ist bereits ausgew\xE4hlt. W\xE4hle nur noch die Verben, die Anzahl der Fragen und die \xDCbungsform.",
        ctaLabel: "Pr\xE4sens\xFCbung starten"
      },
      en: {
        title: "French present-tense exercises",
        metaTitle: "Free French present-tense exercises",
        description: "Practise the French present tense with a personalised online exercise or a printable worksheet with answers.",
        eyebrow: "Indicative \xB7 present",
        ruleTitle: "When is the present tense used?",
        rule: "The present tense describes a current action, a habit or a general truth. Endings depend on the verb group, and some common verbs have an irregular stem.",
        examplesTitle: "Three examples",
        examples: ["Je parle avec mon voisin.", "Nous finissons notre travail.", "Ils prennent le train."],
        watchTitle: "Points to watch",
        watchItems: ["Agreement with the subject.", "The often silent endings -e, -es and -ent.", "Common verbs such as \xEAtre, avoir, aller and faire."],
        ctaTitle: "Build your present-tense exercise",
        ctaText: "The present tense is already selected. Just choose the verbs, the number of questions and how you want to practise.",
        ctaLabel: "Start a present-tense exercise"
      },
      it: {
        title: "Esercizi sul presente francese",
        metaTitle: "Esercizi gratuiti sul presente francese",
        description: "Ripassa il presente francese con un esercizio personalizzato online o una scheda stampabile con le soluzioni.",
        eyebrow: "Indicativo \xB7 presente",
        ruleTitle: "Quando si usa il presente?",
        rule: "Il presente esprime un\u2019azione attuale, un\u2019abitudine o una verit\xE0 generale. Le desinenze dipendono dal gruppo del verbo e alcuni verbi frequenti hanno una radice irregolare.",
        examplesTitle: "Tre esempi",
        examples: ["Je parle avec mon voisin.", "Nous finissons notre travail.", "Ils prennent le train."],
        watchTitle: "Punti da controllare",
        watchItems: ["L\u2019accordo con il soggetto.", "Le desinenze -e, -es e -ent, spesso non pronunciate.", "I verbi frequenti come \xEAtre, avoir, aller e faire."],
        ctaTitle: "Crea il tuo esercizio al presente",
        ctaText: "Il presente \xE8 gi\xE0 selezionato. Scegli i verbi, il numero di domande e il modo in cui vuoi esercitarti.",
        ctaLabel: "Inizia un esercizio al presente"
      },
      es: {
        title: "Ejercicios de presente en franc\xE9s",
        metaTitle: "Ejercicios gratuitos de presente en franc\xE9s",
        description: "Practica el presente franc\xE9s con un ejercicio personalizado en l\xEDnea o una ficha imprimible con soluciones.",
        eyebrow: "Indicativo \xB7 presente",
        ruleTitle: "\xBFCu\xE1ndo se usa el presente?",
        rule: "El presente expresa una acci\xF3n actual, un h\xE1bito o una verdad general. Las terminaciones dependen del grupo verbal y algunos verbos frecuentes tienen una ra\xEDz irregular.",
        examplesTitle: "Tres ejemplos",
        examples: ["Je parle avec mon voisin.", "Nous finissons notre travail.", "Ils prennent le train."],
        watchTitle: "Puntos importantes",
        watchItems: ["La concordancia con el sujeto.", "Las terminaciones -e, -es y -ent, que a menudo no se oyen.", "Los verbos frecuentes como \xEAtre, avoir, aller y faire."],
        ctaTitle: "Crea tu ejercicio de presente",
        ctaText: "El presente ya est\xE1 seleccionado. Elige los verbos, el n\xFAmero de preguntas y la forma de practicar.",
        ctaLabel: "Empezar un ejercicio de presente"
      }
    }
  },
  imparfait: {
    tenseName: "imparfait",
    translations: {
      fr: {
        title: "Exercices de conjugaison \xE0 l\u2019imparfait",
        metaTitle: "Exercices de conjugaison \xE0 l\u2019imparfait gratuits",
        description: "Entra\xEEne-toi \xE0 conjuguer les verbes \xE0 l\u2019imparfait avec un exercice personnalis\xE9, disponible en ligne et \xE0 imprimer.",
        eyebrow: "Indicatif \xB7 imparfait",
        ruleTitle: "Comment former l\u2019imparfait ?",
        rule: "On part g\xE9n\xE9ralement de la forme \xAB nous \xBB au pr\xE9sent, on retire -ons, puis on ajoute -ais, -ais, -ait, -ions, -iez ou -aient. Le verbe \xEAtre utilise le radical \xE9t-.",
        examplesTitle: "Trois rep\xE8res",
        examples: ["Je regardais la montagne.", "Nous choisissions un livre.", "Vous \xE9tiez d\xE9j\xE0 l\xE0."],
        watchTitle: "Points \xE0 surveiller",
        watchItems: ["Les terminaisons -ais, -ait et -aient se prononcent de la m\xEAme fa\xE7on.", "Les verbes en -ger conservent parfois un e : je mangeais.", "Les verbes en -cer prennent une c\xE9dille : je commen\xE7ais."],
        ctaTitle: "Construis ton exercice \xE0 l\u2019imparfait",
        ctaText: "L\u2019imparfait sera d\xE9j\xE0 s\xE9lectionn\xE9. Tu pourras choisir les verbes et adapter la longueur de l\u2019exercice.",
        ctaLabel: "Commencer un exercice \xE0 l\u2019imparfait"
      },
      de: {
        title: "\xDCbungen zum franz\xF6sischen Imparfait",
        metaTitle: "Kostenlose \xDCbungen zum franz\xF6sischen Imparfait",
        description: "\xDCbe das franz\xF6sische Imparfait mit einer pers\xF6nlichen Online-\xDCbung oder einem Arbeitsblatt zum Ausdrucken.",
        eyebrow: "Indikativ \xB7 Imparfait",
        ruleTitle: "Wie bildet man das Imparfait?",
        rule: "Meist nimmt man die nous-Form im Pr\xE4sens, entfernt -ons und erg\xE4nzt -ais, -ais, -ait, -ions, -iez oder -aient. Das Verb \xEAtre verwendet den Stamm \xE9t-.",
        examplesTitle: "Drei Beispiele",
        examples: ["Je regardais la montagne.", "Nous choisissions un livre.", "Vous \xE9tiez d\xE9j\xE0 l\xE0."],
        watchTitle: "Darauf solltest du achten",
        watchItems: ["-ais, -ait und -aient werden gleich ausgesprochen.", "Verben auf -ger behalten manchmal ein e: je mangeais.", "Verben auf -cer erhalten eine Cedille: je commen\xE7ais."],
        ctaTitle: "Erstelle deine Imparfait-\xDCbung",
        ctaText: "Das Imparfait ist bereits ausgew\xE4hlt. Du kannst die Verben und die L\xE4nge der \xDCbung bestimmen.",
        ctaLabel: "Imparfait-\xDCbung starten"
      },
      en: {
        title: "French imperfect-tense exercises",
        metaTitle: "Free French imperfect-tense exercises",
        description: "Practise the French imperfect tense with a personalised online exercise or printable worksheet.",
        eyebrow: "Indicative \xB7 imperfect",
        ruleTitle: "How is the imperfect formed?",
        rule: "Usually, take the present-tense nous form, remove -ons, then add -ais, -ais, -ait, -ions, -iez or -aient. The verb \xEAtre uses the stem \xE9t-.",
        examplesTitle: "Three examples",
        examples: ["Je regardais la montagne.", "Nous choisissions un livre.", "Vous \xE9tiez d\xE9j\xE0 l\xE0."],
        watchTitle: "Points to watch",
        watchItems: ["The endings -ais, -ait and -aient sound the same.", "Verbs ending in -ger sometimes keep an e: je mangeais.", "Verbs ending in -cer take a cedilla: je commen\xE7ais."],
        ctaTitle: "Build your imperfect-tense exercise",
        ctaText: "The imperfect is already selected. Choose the verbs and adjust the length of the exercise.",
        ctaLabel: "Start an imperfect-tense exercise"
      },
      it: {
        title: "Esercizi sull\u2019imperfetto francese",
        metaTitle: "Esercizi gratuiti sull\u2019imperfetto francese",
        description: "Esercitati con l\u2019imperfetto francese grazie a un esercizio personalizzato online o a una scheda stampabile.",
        eyebrow: "Indicativo \xB7 imperfetto",
        ruleTitle: "Come si forma l\u2019imperfetto?",
        rule: "In genere si prende la forma nous del presente, si elimina -ons e si aggiunge -ais, -ais, -ait, -ions, -iez o -aient. Il verbo \xEAtre usa la radice \xE9t-.",
        examplesTitle: "Tre esempi",
        examples: ["Je regardais la montagne.", "Nous choisissions un livre.", "Vous \xE9tiez d\xE9j\xE0 l\xE0."],
        watchTitle: "Punti da controllare",
        watchItems: ["Le desinenze -ais, -ait e -aient hanno la stessa pronuncia.", "I verbi in -ger conservano talvolta una e: je mangeais.", "I verbi in -cer prendono la cediglia: je commen\xE7ais."],
        ctaTitle: "Crea il tuo esercizio all\u2019imperfetto",
        ctaText: "L\u2019imperfetto \xE8 gi\xE0 selezionato. Scegli i verbi e adatta la lunghezza dell\u2019esercizio.",
        ctaLabel: "Inizia un esercizio all\u2019imperfetto"
      },
      es: {
        title: "Ejercicios de imperfecto en franc\xE9s",
        metaTitle: "Ejercicios gratuitos de imperfecto en franc\xE9s",
        description: "Practica el imperfecto franc\xE9s con un ejercicio personalizado en l\xEDnea o una ficha imprimible.",
        eyebrow: "Indicativo \xB7 imperfecto",
        ruleTitle: "\xBFC\xF3mo se forma el imperfecto?",
        rule: "Normalmente se toma la forma nous del presente, se elimina -ons y se a\xF1ade -ais, -ais, -ait, -ions, -iez o -aient. El verbo \xEAtre usa la ra\xEDz \xE9t-.",
        examplesTitle: "Tres ejemplos",
        examples: ["Je regardais la montagne.", "Nous choisissions un livre.", "Vous \xE9tiez d\xE9j\xE0 l\xE0."],
        watchTitle: "Puntos importantes",
        watchItems: ["Las terminaciones -ais, -ait y -aient se pronuncian igual.", "Los verbos en -ger conservan a veces una e: je mangeais.", "Los verbos en -cer llevan cedilla: je commen\xE7ais."],
        ctaTitle: "Crea tu ejercicio de imperfecto",
        ctaText: "El imperfecto ya est\xE1 seleccionado. Elige los verbos y adapta la longitud del ejercicio.",
        ctaLabel: "Empezar un ejercicio de imperfecto"
      }
    }
  },
  "passe-compose": {
    tenseName: "pass\xE9 compos\xE9",
    translations: {
      fr: {
        title: "Exercices de conjugaison au pass\xE9 compos\xE9",
        metaTitle: "Exercices de conjugaison au pass\xE9 compos\xE9 gratuits",
        description: "Travaille le pass\xE9 compos\xE9, le choix de l\u2019auxiliaire et les accords gr\xE2ce \xE0 un exercice personnalis\xE9 en ligne ou \xE0 imprimer.",
        eyebrow: "Indicatif \xB7 pass\xE9 compos\xE9",
        ruleTitle: "Comment former le pass\xE9 compos\xE9 ?",
        rule: "Le pass\xE9 compos\xE9 associe l\u2019auxiliaire avoir ou \xEAtre au pr\xE9sent et le participe pass\xE9 du verbe. Avec \xEAtre, le participe pass\xE9 s\u2019accorde g\xE9n\xE9ralement avec le sujet.",
        examplesTitle: "Trois rep\xE8res",
        examples: ["Tu as termin\xE9 ton travail.", "Elles sont arriv\xE9es t\xF4t.", "Nous avons pris le train."],
        watchTitle: "Points \xE0 surveiller",
        watchItems: ["Le choix entre les auxiliaires avoir et \xEAtre.", "La forme parfois irr\xE9guli\xE8re du participe pass\xE9.", "L\u2019accord du participe pass\xE9 avec \xEAtre, et dans certains cas avec avoir."],
        ctaTitle: "Construis ton exercice au pass\xE9 compos\xE9",
        ctaText: "Le pass\xE9 compos\xE9 sera d\xE9j\xE0 s\xE9lectionn\xE9. Choisis les verbes pour travailler la formation, les auxiliaires et les accords.",
        ctaLabel: "Commencer un exercice au pass\xE9 compos\xE9"
      },
      de: {
        title: "\xDCbungen zum franz\xF6sischen Pass\xE9 compos\xE9",
        metaTitle: "Kostenlose \xDCbungen zum franz\xF6sischen Pass\xE9 compos\xE9",
        description: "\xDCbe das Pass\xE9 compos\xE9, die Wahl des Hilfsverbs und die Angleichung mit einer pers\xF6nlichen Online- oder Druck\xFCbung.",
        eyebrow: "Indikativ \xB7 Pass\xE9 compos\xE9",
        ruleTitle: "Wie bildet man das Pass\xE9 compos\xE9?",
        rule: "Das Pass\xE9 compos\xE9 besteht aus avoir oder \xEAtre im Pr\xE4sens und dem Partizip Perfekt. Mit \xEAtre stimmt das Partizip normalerweise mit dem Subjekt \xFCberein.",
        examplesTitle: "Drei Beispiele",
        examples: ["Tu as termin\xE9 ton travail.", "Elles sont arriv\xE9es t\xF4t.", "Nous avons pris le train."],
        watchTitle: "Darauf solltest du achten",
        watchItems: ["Die Wahl zwischen avoir und \xEAtre.", "Die manchmal unregelm\xE4\xDFige Form des Partizips.", "Die Angleichung mit \xEAtre und in bestimmten F\xE4llen mit avoir."],
        ctaTitle: "Erstelle deine Pass\xE9-compos\xE9-\xDCbung",
        ctaText: "Das Pass\xE9 compos\xE9 ist bereits ausgew\xE4hlt. W\xE4hle Verben, um Bildung, Hilfsverben und Angleichung zu \xFCben.",
        ctaLabel: "Pass\xE9-compos\xE9-\xDCbung starten"
      },
      en: {
        title: "French perfect-tense exercises",
        metaTitle: "Free French perfect-tense exercises",
        description: "Practise the French perfect tense, auxiliary choice and agreement with a personalised online or printable exercise.",
        eyebrow: "Indicative \xB7 perfect tense",
        ruleTitle: "How is the perfect tense formed?",
        rule: "The French perfect tense combines avoir or \xEAtre in the present with the verb\u2019s past participle. With \xEAtre, the participle generally agrees with the subject.",
        examplesTitle: "Three examples",
        examples: ["Tu as termin\xE9 ton travail.", "Elles sont arriv\xE9es t\xF4t.", "Nous avons pris le train."],
        watchTitle: "Points to watch",
        watchItems: ["Choosing between avoir and \xEAtre.", "Past participles that have an irregular form.", "Agreement with \xEAtre and, in some cases, with avoir."],
        ctaTitle: "Build your perfect-tense exercise",
        ctaText: "The perfect tense is already selected. Choose verbs to practise its formation, auxiliaries and agreements.",
        ctaLabel: "Start a perfect-tense exercise"
      },
      it: {
        title: "Esercizi sul pass\xE9 compos\xE9 francese",
        metaTitle: "Esercizi gratuiti sul pass\xE9 compos\xE9 francese",
        description: "Esercitati con il pass\xE9 compos\xE9, la scelta dell\u2019ausiliare e gli accordi grazie a un esercizio personalizzato.",
        eyebrow: "Indicativo \xB7 pass\xE9 compos\xE9",
        ruleTitle: "Come si forma il pass\xE9 compos\xE9?",
        rule: "Il pass\xE9 compos\xE9 unisce l\u2019ausiliare avoir o \xEAtre al presente e il participio passato del verbo. Con \xEAtre, il participio concorda generalmente con il soggetto.",
        examplesTitle: "Tre esempi",
        examples: ["Tu as termin\xE9 ton travail.", "Elles sont arriv\xE9es t\xF4t.", "Nous avons pris le train."],
        watchTitle: "Punti da controllare",
        watchItems: ["La scelta tra avoir e \xEAtre.", "La forma talvolta irregolare del participio passato.", "L\u2019accordo con \xEAtre e, in alcuni casi, con avoir."],
        ctaTitle: "Crea il tuo esercizio al pass\xE9 compos\xE9",
        ctaText: "Il pass\xE9 compos\xE9 \xE8 gi\xE0 selezionato. Scegli i verbi per esercitare formazione, ausiliari e accordi.",
        ctaLabel: "Inizia un esercizio al pass\xE9 compos\xE9"
      },
      es: {
        title: "Ejercicios de pass\xE9 compos\xE9 en franc\xE9s",
        metaTitle: "Ejercicios gratuitos de pass\xE9 compos\xE9 en franc\xE9s",
        description: "Practica el pass\xE9 compos\xE9, la elecci\xF3n del auxiliar y las concordancias con un ejercicio personalizado.",
        eyebrow: "Indicativo \xB7 pass\xE9 compos\xE9",
        ruleTitle: "\xBFC\xF3mo se forma el pass\xE9 compos\xE9?",
        rule: "El pass\xE9 compos\xE9 combina el auxiliar avoir o \xEAtre en presente y el participio pasado del verbo. Con \xEAtre, el participio concuerda normalmente con el sujeto.",
        examplesTitle: "Tres ejemplos",
        examples: ["Tu as termin\xE9 ton travail.", "Elles sont arriv\xE9es t\xF4t.", "Nous avons pris le train."],
        watchTitle: "Puntos importantes",
        watchItems: ["La elecci\xF3n entre avoir y \xEAtre.", "La forma a veces irregular del participio pasado.", "La concordancia con \xEAtre y, en algunos casos, con avoir."],
        ctaTitle: "Crea tu ejercicio de pass\xE9 compos\xE9",
        ctaText: "El pass\xE9 compos\xE9 ya est\xE1 seleccionado. Elige los verbos para practicar su formaci\xF3n, los auxiliares y las concordancias.",
        ctaLabel: "Empezar un ejercicio de pass\xE9 compos\xE9"
      }
    }
  }
};
function exerciseLandingPage(slug, locale) {
  const page = pages[slug];
  return { slug, tenseName: page.tenseName, ...page.translations[locale] };
}

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "apprendre",
  __ssrInlineRender: true,
  setup(__props) {
    const { ui, localePath, interfaceLocale } = useLanguagePreferences();
    useSiteAnalytics();
    useHead(() => ({
      title: ui("Apprendre la conjugaison"),
      meta: [{ name: "description", content: ui("Une synthèse claire des règles essentielles de la conjugaison française.") }]
    }));
    const modeExplorerCopy = computed(() => ({
      fr: { eyebrow: "Le sens et le temps", title: "Comprendre les modes et choisir un temps", intro: "Sélectionne un mode pour comprendre ce qu’il exprime. Tu verras ensuite ses exemples, les points à surveiller et uniquement les temps qui lui appartiennent.", tabsLabel: "Choisir un mode", tenseHelp: "Choisis ensuite un temps pour approfondir son rôle, sa formation et ses emplois." },
      de: { eyebrow: "Bedeutung und Zeit", title: "Modi verstehen und eine Zeit wählen", intro: "Wähle einen Modus, um seine Bedeutung zu verstehen. Danach siehst du Beispiele, wichtige Hinweise und nur die dazugehörigen Zeiten.", tabsLabel: "Einen Modus wählen", tenseHelp: "Wähle anschließend eine Zeitform, um Funktion, Bildung und Gebrauch zu vertiefen." },
      en: { eyebrow: "Meaning and tense", title: "Understand moods and choose a tense", intro: "Select a mood to understand what it expresses. You will then see examples, points to watch and only the tenses that belong to it.", tabsLabel: "Choose a mood", tenseHelp: "Then choose a tense to explore its role, formation and uses." },
      it: { eyebrow: "Significato e tempo", title: "Capire i modi e scegliere un tempo", intro: "Seleziona un modo per capire che cosa esprime. Vedrai poi gli esempi, i punti importanti e soltanto i tempi che gli appartengono.", tabsLabel: "Scegliere un modo", tenseHelp: "Scegli quindi un tempo per approfondirne ruolo, formazione e usi." },
      es: { eyebrow: "Significado y tiempo", title: "Comprender los modos y elegir un tiempo", intro: "Selecciona un modo para comprender qué expresa. Después verás ejemplos, puntos importantes y únicamente los tiempos que le corresponden.", tabsLabel: "Elegir un modo", tenseHelp: "Elige después un tiempo para profundizar en su función, formación y usos." }
    })[interfaceLocale.value]);
    const sections = computed(() => [
      { id: "modes", number: "01", title: modeExplorerCopy.value.title, description: modeExplorerCopy.value.tabsLabel },
      { id: "bases", number: "02", title: ui("Comprendre le verbe"), description: ui("Radical, terminaison, groupes et auxiliaires.") },
      { id: "accords", number: "03", title: ui("Réussir les accords"), description: ui("Sujet, auxiliaires et participe passé.") },
      { id: "orthographe", number: "04", title: ui("Éviter les pièges"), description: ui("Modifications du radical et terminaisons à surveiller.") }
    ]);
    const exerciseJourneys = computed(() => EXERCISE_LANDING_SLUGS.map((slug) => exerciseLandingPage(slug, interfaceLocale.value)));
    const learningModes = computed(() => MODE_LANDING_SLUGS.map((slug) => ({
      ...modeLandingPage(slug, interfaceLocale.value),
      tenses: modeTensePages(slug).map((tense) => ({ ...tense, to: localePath(tense.path) }))
    })));
    const selectedLearningMode = ref("indicatif");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "learning-page" }, _attrs))} data-v-be249c52><header class="learning-hero" data-v-be249c52><p class="learning-eyebrow" data-v-be249c52>${ssrInterpolate(unref(ui)("Les règles essentielles"))}</p><h1 data-v-be249c52>${ssrInterpolate(unref(ui)("Apprendre la conjugaison française"))}</h1></header><nav class="learning-summary"${ssrRenderAttr("aria-label", unref(ui)("Sommaire des règles"))} data-v-be249c52><!--[-->`);
      ssrRenderList(unref(sections), (section) => {
        _push(`<button type="button" data-v-be249c52><span data-v-be249c52>${ssrInterpolate(section.number)}</span><strong data-v-be249c52>${ssrInterpolate(section.title)}</strong><small data-v-be249c52>${ssrInterpolate(section.description)}</small></button>`);
      });
      _push(`<!--]--></nav><main class="learning-content" data-v-be249c52><section id="modes" class="rule-section" data-v-be249c52><header data-v-be249c52><span data-v-be249c52>01</span><div data-v-be249c52><p class="learning-eyebrow" data-v-be249c52>${ssrInterpolate(unref(modeExplorerCopy).eyebrow)}</p><h2 data-v-be249c52>${ssrInterpolate(unref(modeExplorerCopy).title)}</h2><p class="mode-explorer-intro" data-v-be249c52>${ssrInterpolate(unref(modeExplorerCopy).intro)}</p></div></header><div class="mode-selector" role="tablist"${ssrRenderAttr("aria-label", unref(modeExplorerCopy).tabsLabel)} data-v-be249c52><!--[-->`);
      ssrRenderList(unref(learningModes), (mode) => {
        _push(`<button${ssrRenderAttr("id", `mode-tab-${mode.slug}`)} type="button" role="tab"${ssrRenderAttr("aria-controls", `mode-panel-${mode.slug}`)}${ssrRenderAttr("aria-selected", unref(selectedLearningMode) === mode.slug)}${ssrRenderAttr("tabindex", unref(selectedLearningMode) === mode.slug ? 0 : -1)} class="${ssrRenderClass({ "is-active": unref(selectedLearningMode) === mode.slug })}" data-v-be249c52><strong data-v-be249c52>${ssrInterpolate(mode.modeName)}</strong></button>`);
      });
      _push(`<!--]--></div><!--[-->`);
      ssrRenderList(unref(learningModes), (mode) => {
        _push(`<div${ssrRenderAttr("id", `mode-panel-${mode.slug}`)} class="mode-explorer-panel" role="tabpanel"${ssrRenderAttr("aria-labelledby", `mode-tab-${mode.slug}`)} style="${ssrRenderStyle(unref(selectedLearningMode) === mode.slug ? null : { display: "none" })}" data-v-be249c52><div class="mode-explorer-purpose" data-v-be249c52><p data-v-be249c52>${ssrInterpolate(mode.eyebrow)}</p><h3 data-v-be249c52>${ssrInterpolate(mode.purposeTitle)}</h3><p data-v-be249c52>${ssrInterpolate(mode.purpose)}</p></div><div class="mode-explorer-details" data-v-be249c52><section data-v-be249c52><h4 data-v-be249c52>${ssrInterpolate(mode.examplesTitle)}</h4><ul data-v-be249c52><!--[-->`);
        ssrRenderList(mode.examples, (example) => {
          _push(`<li data-v-be249c52>${ssrInterpolate(example)}</li>`);
        });
        _push(`<!--]--></ul></section><section data-v-be249c52><h4 data-v-be249c52>${ssrInterpolate(mode.watchTitle)}</h4><ul data-v-be249c52><!--[-->`);
        ssrRenderList(mode.watchItems, (item) => {
          _push(`<li data-v-be249c52>${ssrInterpolate(item)}</li>`);
        });
        _push(`<!--]--></ul></section></div><section class="mode-explorer-tenses"${ssrRenderAttr("aria-labelledby", `mode-panel-${mode.slug}-tenses`)} data-v-be249c52><header data-v-be249c52><h4${ssrRenderAttr("id", `mode-panel-${mode.slug}-tenses`)} data-v-be249c52>${ssrInterpolate(mode.tensesTitle)}</h4><p data-v-be249c52>${ssrInterpolate(unref(modeExplorerCopy).tenseHelp)}</p></header><nav${ssrRenderAttr("aria-label", mode.tensesTitle)} data-v-be249c52><!--[-->`);
        ssrRenderList(mode.tenses, (tense) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: tense.slug,
            to: tense.to
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<strong data-v-be249c52${_scopeId}>${ssrInterpolate(tense.label)}</strong><span aria-hidden="true" data-v-be249c52${_scopeId}>→</span>`);
              } else {
                return [
                  createVNode("strong", null, toDisplayString(tense.label), 1),
                  createVNode("span", { "aria-hidden": "true" }, "→")
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></nav></section><div class="mode-explorer-actions" data-v-be249c52><p data-v-be249c52>${ssrInterpolate(mode.ctaText)}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: { path: unref(localePath)("/exercices-de-conjugaison"), query: { mode: mode.slug } }
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(mode.ctaLabel)} <span aria-hidden="true" data-v-be249c52${_scopeId}>→</span>`);
            } else {
              return [
                createTextVNode(toDisplayString(mode.ctaLabel) + " ", 1),
                createVNode("span", { "aria-hidden": "true" }, "→")
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</div></div>`);
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "mode-training-button",
        to: { path: unref(localePath)("/exercices-de-conjugaison"), query: { identifier: "mode-temps" } }
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span data-v-be249c52${_scopeId}>S’entraîner à reconnaître les modes et les temps</span><span aria-hidden="true" data-v-be249c52${_scopeId}>→</span>`);
          } else {
            return [
              createVNode("span", null, "S’entraîner à reconnaître les modes et les temps"),
              createVNode("span", { "aria-hidden": "true" }, "→")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</section><section id="bases" class="rule-section" data-v-be249c52><header data-v-be249c52><span data-v-be249c52>02</span><div data-v-be249c52><p class="learning-eyebrow" data-v-be249c52>${ssrInterpolate(unref(ui)("Les fondations"))}</p><h2 data-v-be249c52>${ssrInterpolate(unref(ui)("Comprendre le verbe"))}</h2></div></header><div class="rule-grid rule-grid--three" data-v-be249c52><article data-v-be249c52><h3 data-v-be249c52>${ssrInterpolate(unref(ui)("Radical + terminaison"))}</h3><p data-v-be249c52>${ssrInterpolate(unref(ui)("Une forme conjuguée associe généralement un radical, qui porte le sens, et une terminaison, qui indique la personne, le mode et le temps."))}</p><p class="rule-example" data-v-be249c52><strong data-v-be249c52>nous chantions</strong><span data-v-be249c52>chant- + -ions</span></p></article><article data-v-be249c52><h3 data-v-be249c52>${ssrInterpolate(unref(ui)("Les trois groupes"))}</h3><ul data-v-be249c52><li data-v-be249c52><strong data-v-be249c52>${ssrInterpolate(unref(ui)("1er groupe :"))}</strong> ${ssrInterpolate(unref(ui)("verbes en -er, sauf aller."))}</li><li data-v-be249c52><strong data-v-be249c52>${ssrInterpolate(unref(ui)("2e groupe :"))}</strong> ${ssrInterpolate(unref(ui)("verbes en -ir faisant -issons."))}</li><li data-v-be249c52><strong data-v-be249c52>${ssrInterpolate(unref(ui)("3e groupe :"))}</strong> ${ssrInterpolate(unref(ui)("tous les autres verbes, souvent irréguliers."))}</li></ul></article><article data-v-be249c52><h3 data-v-be249c52>${ssrInterpolate(unref(ui)("Être et avoir"))}</h3><p data-v-be249c52>${ssrInterpolate(unref(ui)("Ces deux verbes ont leurs propres conjugaisons et servent aussi d’auxiliaires pour former les temps composés."))}</p><p class="rule-example" data-v-be249c52><strong data-v-be249c52>elle a fini</strong><span data-v-be249c52>${ssrInterpolate(unref(ui)("auxiliaire + participe passé"))}</span></p></article></div></section><section id="accords" class="rule-section" data-v-be249c52><header data-v-be249c52><span data-v-be249c52>03</span><div data-v-be249c52><p class="learning-eyebrow" data-v-be249c52>${ssrInterpolate(unref(ui)("Les correspondances"))}</p><h2 data-v-be249c52>${ssrInterpolate(unref(ui)("Réussir les accords"))}</h2></div></header><div class="agreement-flow" data-v-be249c52><article data-v-be249c52><span data-v-be249c52>1</span><div data-v-be249c52><h3 data-v-be249c52>${ssrInterpolate(unref(ui)("Trouver le sujet"))}</h3><p data-v-be249c52>${ssrInterpolate(unref(ui)("Le verbe s’accorde en personne et en nombre avec son sujet, même lorsque celui-ci est éloigné."))}</p><em data-v-be249c52>Les élèves de cette classe réussissent.</em></div></article><article data-v-be249c52><span data-v-be249c52>2</span><div data-v-be249c52><h3 data-v-be249c52>${ssrInterpolate(unref(ui)("Identifier l’auxiliaire"))}</h3><p data-v-be249c52>${ssrInterpolate(unref(ui)("Avec être, le participe passé s’accorde généralement avec le sujet."))}</p><em data-v-be249c52>Elles sont arrivées.</em></div></article><article data-v-be249c52><span data-v-be249c52>3</span><div data-v-be249c52><h3 data-v-be249c52>${ssrInterpolate(unref(ui)("Repérer le COD avec avoir"))}</h3><p data-v-be249c52>${ssrInterpolate(unref(ui)("Avec avoir, le participe passé s’accorde avec le COD seulement si celui-ci est placé avant."))}</p><em data-v-be249c52>Les lettres qu’il a écrites.</em></div></article></div><aside class="rule-note rule-note--warning" data-v-be249c52><strong data-v-be249c52>${ssrInterpolate(unref(ui)("Verbes pronominaux"))}</strong><p data-v-be249c52>${ssrInterpolate(unref(ui)("Leur accord dépend de la fonction du pronom. Il faut déterminer si celui-ci est COD, COI ou fait partie du verbe."))}</p></aside></section><section id="orthographe" class="rule-section" data-v-be249c52><header data-v-be249c52><span data-v-be249c52>04</span><div data-v-be249c52><p class="learning-eyebrow" data-v-be249c52>${ssrInterpolate(unref(ui)("Les pièges fréquents"))}</p><h2 data-v-be249c52>${ssrInterpolate(unref(ui)("Préserver le son et l’orthographe"))}</h2></div></header><div class="trap-grid" data-v-be249c52><article data-v-be249c52><h3 data-v-be249c52>-ger et -cer</h3><p data-v-be249c52>${ssrInterpolate(unref(ui)("On ajoute parfois un e après g ou une cédille pour conserver le son."))}</p><em data-v-be249c52>nous mangeons · nous plaçons</em></article><article data-v-be249c52><h3 data-v-be249c52>-yer</h3><p data-v-be249c52>${ssrInterpolate(unref(ui)("Le y peut devenir i devant un e muet. Pour certains verbes, les deux graphies sont admises."))}</p><em data-v-be249c52>j’emploie · nous employons</em></article><article data-v-be249c52><h3 data-v-be249c52>e / è</h3><p data-v-be249c52>${ssrInterpolate(unref(ui)("Certains verbes changent l’accent lorsque la syllabe suivante contient un e muet."))}</p><em data-v-be249c52>je lève · nous levons</em></article><article data-v-be249c52><h3 data-v-be249c52>${ssrInterpolate(unref(ui)("Consonne doublée"))}</h3><p data-v-be249c52>${ssrInterpolate(unref(ui)("Certains verbes en -eler et -eter doublent la consonne ; d’autres prennent un accent grave."))}</p><em data-v-be249c52>j’appelle · j’achète</em></article><article data-v-be249c52><h3 data-v-be249c52>-é ou -er ?</h3><p data-v-be249c52>${ssrInterpolate(unref(ui)("Remplace le verbe par « vendre » : si « vendu » convient, écris le participe passé ; si « vendre » convient, écris l’infinitif."))}</p><em data-v-be249c52>j’ai mangé · je vais manger</em></article><article data-v-be249c52><h3 data-v-be249c52>-rai ou -rais ?</h3><p data-v-be249c52>${ssrInterpolate(unref(ui)("Le futur exprime ce qui arrivera ; le conditionnel dépend d’une condition ou atténue une demande."))}</p><em data-v-be249c52>je viendrai · je viendrais si…</em></article></div></section><section class="learning-journeys" aria-labelledby="journeys-title" data-v-be249c52><header data-v-be249c52><p class="learning-eyebrow" data-v-be249c52>${ssrInterpolate(unref(ui)("À toi de jouer"))}</p><h2 id="journeys-title" data-v-be249c52>${ssrInterpolate(unref(ui)("Passe de la règle à la pratique"))}</h2></header><div data-v-be249c52><!--[-->`);
      ssrRenderList(unref(exerciseJourneys), (journey) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: journey.slug,
          to: unref(localePath)(`/indicatif/${journey.slug}`)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span data-v-be249c52${_scopeId}>${ssrInterpolate(journey.eyebrow)}</span><strong data-v-be249c52${_scopeId}>${ssrInterpolate(journey.title)}</strong><small data-v-be249c52${_scopeId}>${ssrInterpolate(journey.description)}</small>`);
            } else {
              return [
                createVNode("span", null, toDisplayString(journey.eyebrow), 1),
                createVNode("strong", null, toDisplayString(journey.title), 1),
                createVNode("small", null, toDisplayString(journey.description), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></section><section class="learning-actions" aria-labelledby="continue-title" data-v-be249c52><div data-v-be249c52><p class="learning-eyebrow" data-v-be249c52>${ssrInterpolate(unref(ui)("À toi de jouer"))}</p><h2 id="continue-title" data-v-be249c52>${ssrInterpolate(unref(ui)("Passe de la règle à la pratique"))}</h2><p data-v-be249c52>${ssrInterpolate(unref(ui)("Consulte un modèle complet ou crée un exercice ciblé pour vérifier ce que tu viens d’apprendre."))}</p></div><div data-v-be249c52>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: unref(localePath)("/consulter")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(ui)("Consulter un verbe"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(ui)("Consulter un verbe")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "is-primary",
        to: unref(localePath)("/exercices-de-conjugaison")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(ui)("S’exercer"))}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(ui)("S’exercer")), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></section></main></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/apprendre.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const apprendre = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-be249c52"]]);

export { apprendre as default };
//# sourceMappingURL=apprendre-BPTEGMxZ.mjs.map

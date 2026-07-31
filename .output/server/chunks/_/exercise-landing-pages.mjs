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
function isExerciseLandingSlug(value) {
  return EXERCISE_LANDING_SLUGS.includes(value);
}
function exerciseLandingPage(slug, locale) {
  const page = pages[slug];
  return { slug, tenseName: page.tenseName, ...page.translations[locale] };
}

export { EXERCISE_LANDING_SLUGS as E, exerciseLandingPage as e, isExerciseLandingSlug as i };
//# sourceMappingURL=exercise-landing-pages.mjs.map

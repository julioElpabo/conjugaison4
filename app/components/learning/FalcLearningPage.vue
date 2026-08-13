<script setup lang="ts">
import type { AppLocale } from '~~/shared/i18n/locales'

interface FalcLearningCopy {
  title: string
  groupsTitle: string
  groupsIntro: string
  groups: Array<{ title: string, text: string, example: string, easy?: boolean }>
  tensesTitle: string
  tensesIntro: string
  tenses: Array<{ title: string, use: string, rule: string, example: string }>
  practiceTitle: string
  practiceText: string
  practiceButton: string
}

const { interfaceLocale, localePath } = useLanguagePreferences()

const copyByLocale = {
  fr: {
    title: 'Apprendre simplement',
    groupsTitle: 'Les 3 groupes de verbes',
    groupsIntro: 'Le groupe aide à conjuguer un verbe.',
    groups: [
      { title: '1er groupe', text: 'Les verbes finissent par -er. Ces verbes sont souvent faciles à conjuguer.', example: 'parler · aimer · jouer', easy: true },
      { title: '2e groupe', text: 'Les verbes finissent par -ir. Avec nous, ils finissent par -issons.', example: 'finir → nous finissons' },
      { title: '3e groupe', text: 'Ces verbes sont difficiles. Il y a beaucoup d’exceptions. Il faut souvent apprendre les verbes un par un.', example: 'aller · venir · prendre' },
    ],
    tensesTitle: '6 temps utiles',
    tensesIntro: 'Chaque temps indique quand ou comment se passe une action.',
    tenses: [
      { title: 'Présent', use: 'Pour parler de maintenant ou d’une habitude.', rule: 'La fin du verbe change avec la personne.', example: 'Maintenant, il mange. · Il habite dans cette maison.' },
      { title: 'Passé composé', use: 'Pour parler d’une action terminée.', rule: 'On utilise avoir ou être, puis le participe passé.', example: 'Hier, nous avons regardé un film. · Ce matin, elle est partie en vacances.' },
      { title: 'Imparfait', use: 'Pour décrire le passé ou parler d’une habitude passée.', rule: 'Les fins sont : -ais, -ais, -ait, -ions, -iez, -aient.', example: 'Avant, je jouais ici.' },
      { title: 'Futur', use: 'Pour parler de ce qui arrivera plus tard.', rule: 'Les fins sont : -ai, -as, -a, -ons, -ez, -ont.', example: 'Demain, je partirai.' },
      { title: 'Futur proche', use: 'Pour parler de ce qui va bientôt arriver.', rule: 'On utilise aller au présent, puis le verbe à l’infinitif.', example: 'Je vais manger.' },
      { title: 'Impératif présent', use: 'Pour donner un ordre, un conseil ou une consigne.', rule: 'On utilise tu, nous ou vous. On n’écrit pas le sujet.', example: 'Ferme la porte. · Asseyez-vous.' },
    ],
    practiceTitle: 'Tu veux essayer ?',
    practiceText: 'Choisis des verbes et fais un exercice.',
    practiceButton: 'Faire un exercice',
  },
  de: {
    title: 'Einfach lernen',
    groupsTitle: 'Die 3 Verbgruppen',
    groupsIntro: 'Die Gruppe hilft dir, ein Verb zu konjugieren.',
    groups: [
      { title: '1. Gruppe', text: 'Die Verben enden auf -er. Diese Verben sind oft leicht zu konjugieren.', example: 'parler · aimer · jouer', easy: true },
      { title: '2. Gruppe', text: 'Die Verben enden auf -ir. Mit nous enden sie auf -issons.', example: 'finir → nous finissons' },
      { title: '3. Gruppe', text: 'Diese Verben sind schwierig. Es gibt viele Ausnahmen. Oft musst du die Verben einzeln lernen.', example: 'aller · venir · prendre' },
    ],
    tensesTitle: '6 wichtige Zeitformen',
    tensesIntro: 'Jede Zeitform zeigt, wann oder wie etwas geschieht.',
    tenses: [
      { title: 'Präsens', use: 'Für etwas, das jetzt oder regelmäßig geschieht.', rule: 'Die Endung des Verbs ändert sich mit der Person.', example: 'Maintenant, il mange. · Il habite dans cette maison.' },
      { title: 'Passé composé', use: 'Für eine abgeschlossene Handlung.', rule: 'Du verwendest avoir oder être und dann das Partizip Perfekt.', example: 'Hier, nous avons regardé un film. · Ce matin, elle est partie en vacances.' },
      { title: 'Imparfait', use: 'Für eine Beschreibung oder Gewohnheit in der Vergangenheit.', rule: 'Die Endungen sind: -ais, -ais, -ait, -ions, -iez, -aient.', example: 'Avant, je jouais ici.' },
      { title: 'Futur', use: 'Für etwas, das später geschehen wird.', rule: 'Die Endungen sind: -ai, -as, -a, -ons, -ez, -ont.', example: 'Demain, je partirai.' },
      { title: 'Nahes Futur', use: 'Für etwas, das bald geschehen wird.', rule: 'Du verwendest aller im Präsens und dann den Infinitiv.', example: 'Je vais manger.' },
      { title: 'Imperativ Präsens', use: 'Für einen Befehl, einen Rat oder eine Anweisung.', rule: 'Du verwendest tu, nous oder vous. Das Subjekt wird nicht geschrieben.', example: 'Ferme la porte. · Asseyez-vous.' },
    ],
    practiceTitle: 'Möchtest du es versuchen?',
    practiceText: 'Wähle Verben und mache eine Übung.',
    practiceButton: 'Eine Übung machen',
  },
  en: {
    title: 'Learn simply',
    groupsTitle: 'The 3 verb groups',
    groupsIntro: 'A verb’s group helps you conjugate it.',
    groups: [
      { title: 'Group 1', text: 'The verbs end in -er. These verbs are often easy to conjugate.', example: 'parler · aimer · jouer', easy: true },
      { title: 'Group 2', text: 'The verbs end in -ir. With nous, they end in -issons.', example: 'finir → nous finissons' },
      { title: 'Group 3', text: 'These verbs are difficult. There are many exceptions. You often need to learn the verbs one by one.', example: 'aller · venir · prendre' },
    ],
    tensesTitle: '6 useful tenses',
    tensesIntro: 'Each tense shows when or how an action happens.',
    tenses: [
      { title: 'Present', use: 'For something happening now or regularly.', rule: 'The verb ending changes with the person.', example: 'Maintenant, il mange. · Il habite dans cette maison.' },
      { title: 'Compound past', use: 'For a completed action.', rule: 'Use avoir or être, followed by the past participle.', example: 'Hier, nous avons regardé un film. · Ce matin, elle est partie en vacances.' },
      { title: 'Imperfect', use: 'To describe the past or a past habit.', rule: 'The endings are: -ais, -ais, -ait, -ions, -iez, -aient.', example: 'Avant, je jouais ici.' },
      { title: 'Future', use: 'For something that will happen later.', rule: 'The endings are: -ai, -as, -a, -ons, -ez, -ont.', example: 'Demain, je partirai.' },
      { title: 'Near future', use: 'For something that is going to happen soon.', rule: 'Use aller in the present, followed by the infinitive.', example: 'Je vais manger.' },
      { title: 'Present imperative', use: 'To give an order, advice or an instruction.', rule: 'Use tu, nous or vous. Do not write the subject.', example: 'Ferme la porte. · Asseyez-vous.' },
    ],
    practiceTitle: 'Want to try?',
    practiceText: 'Choose some verbs and do an exercise.',
    practiceButton: 'Do an exercise',
  },
  it: {
    title: 'Imparare in modo semplice',
    groupsTitle: 'I 3 gruppi di verbi',
    groupsIntro: 'Il gruppo aiuta a coniugare un verbo.',
    groups: [
      { title: '1° gruppo', text: 'I verbi finiscono in -er. Questi verbi sono spesso facili da coniugare.', example: 'parler · aimer · jouer', easy: true },
      { title: '2° gruppo', text: 'I verbi finiscono in -ir. Con nous finiscono in -issons.', example: 'finir → nous finissons' },
      { title: '3° gruppo', text: 'Questi verbi sono difficili. Ci sono molte eccezioni. Spesso bisogna imparare i verbi uno per uno.', example: 'aller · venir · prendre' },
    ],
    tensesTitle: '6 tempi utili',
    tensesIntro: 'Ogni tempo indica quando o come avviene un’azione.',
    tenses: [
      { title: 'Presente', use: 'Per parlare di adesso o di un’abitudine.', rule: 'La desinenza del verbo cambia con la persona.', example: 'Maintenant, il mange. · Il habite dans cette maison.' },
      { title: 'Passato prossimo', use: 'Per parlare di un’azione conclusa.', rule: 'Si usa avoir o être, poi il participio passato.', example: 'Hier, nous avons regardé un film. · Ce matin, elle est partie en vacances.' },
      { title: 'Imperfetto', use: 'Per descrivere il passato o un’abitudine passata.', rule: 'Le desinenze sono: -ais, -ais, -ait, -ions, -iez, -aient.', example: 'Avant, je jouais ici.' },
      { title: 'Futuro', use: 'Per parlare di ciò che accadrà più tardi.', rule: 'Le desinenze sono: -ai, -as, -a, -ons, -ez, -ont.', example: 'Demain, je partirai.' },
      { title: 'Futuro prossimo', use: 'Per parlare di ciò che accadrà presto.', rule: 'Si usa aller al presente, poi il verbo all’infinito.', example: 'Je vais manger.' },
      { title: 'Imperativo presente', use: 'Per dare un ordine, un consiglio o un’istruzione.', rule: 'Si usa tu, nous o vous. Il soggetto non si scrive.', example: 'Ferme la porte. · Asseyez-vous.' },
    ],
    practiceTitle: 'Vuoi provare?',
    practiceText: 'Scegli dei verbi e fai un esercizio.',
    practiceButton: 'Fai un esercizio',
  },
  es: {
    title: 'Aprender de forma sencilla',
    groupsTitle: 'Los 3 grupos de verbos',
    groupsIntro: 'El grupo ayuda a conjugar un verbo.',
    groups: [
      { title: '1.er grupo', text: 'Los verbos terminan en -er. Estos verbos suelen ser fáciles de conjugar.', example: 'parler · aimer · jouer', easy: true },
      { title: '2.º grupo', text: 'Los verbos terminan en -ir. Con nous terminan en -issons.', example: 'finir → nous finissons' },
      { title: '3.er grupo', text: 'Estos verbos son difíciles. Hay muchas excepciones. A menudo hay que aprender los verbos uno por uno.', example: 'aller · venir · prendre' },
    ],
    tensesTitle: '6 tiempos útiles',
    tensesIntro: 'Cada tiempo indica cuándo o cómo sucede una acción.',
    tenses: [
      { title: 'Presente', use: 'Para hablar de ahora o de una costumbre.', rule: 'La terminación del verbo cambia con la persona.', example: 'Maintenant, il mange. · Il habite dans cette maison.' },
      { title: 'Pretérito perfecto', use: 'Para hablar de una acción terminada.', rule: 'Se usa avoir o être, seguido del participio pasado.', example: 'Hier, nous avons regardé un film. · Ce matin, elle est partie en vacances.' },
      { title: 'Imperfecto', use: 'Para describir el pasado o una costumbre pasada.', rule: 'Las terminaciones son: -ais, -ais, -ait, -ions, -iez, -aient.', example: 'Avant, je jouais ici.' },
      { title: 'Futuro', use: 'Para hablar de lo que sucederá más tarde.', rule: 'Las terminaciones son: -ai, -as, -a, -ons, -ez, -ont.', example: 'Demain, je partirai.' },
      { title: 'Futuro próximo', use: 'Para hablar de lo que va a suceder pronto.', rule: 'Se usa aller en presente, seguido del infinitivo.', example: 'Je vais manger.' },
      { title: 'Imperativo presente', use: 'Para dar una orden, un consejo o una instrucción.', rule: 'Se usa tu, nous o vous. El sujeto no se escribe.', example: 'Ferme la porte. · Asseyez-vous.' },
    ],
    practiceTitle: '¿Quieres probar?',
    practiceText: 'Elige verbos y haz un ejercicio.',
    practiceButton: 'Hacer un ejercicio',
  },
} satisfies Record<AppLocale, FalcLearningCopy>

const copy = computed(() => copyByLocale[interfaceLocale.value])
</script>

<template>
  <main class="falc-learning">
    <header class="falc-learning__hero">
      <h1>{{ copy.title }}</h1>
    </header>

    <section class="falc-learning__section" aria-labelledby="falc-groups-title">
      <header>
        <h2 id="falc-groups-title">{{ copy.groupsTitle }}</h2>
        <p>{{ copy.groupsIntro }}</p>
      </header>
      <div class="falc-learning__groups">
        <article v-for="group in copy.groups" :key="group.title" :class="{ 'is-easy': group.easy }">
          <h3>{{ group.title }}</h3>
          <p>{{ group.text }}</p>
          <strong>{{ group.example }}</strong>
        </article>
      </div>
    </section>

    <section class="falc-learning__section" aria-labelledby="falc-tenses-title">
      <header>
        <h2 id="falc-tenses-title">{{ copy.tensesTitle }}</h2>
        <p>{{ copy.tensesIntro }}</p>
      </header>
      <div class="falc-learning__tenses">
        <article v-for="(tense, index) in copy.tenses" :key="tense.title">
          <span aria-hidden="true">{{ index + 1 }}</span>
          <div>
            <h3>{{ tense.title }}</h3>
            <p>{{ tense.use }}</p>
            <p>{{ tense.rule }}</p>
            <strong>{{ tense.example }}</strong>
          </div>
        </article>
      </div>
    </section>

    <section class="falc-learning__practice" aria-labelledby="falc-practice-title">
      <div>
        <h2 id="falc-practice-title">{{ copy.practiceTitle }}</h2>
        <p>{{ copy.practiceText }}</p>
      </div>
      <NuxtLink :to="localePath('/exercices-de-conjugaison')">{{ copy.practiceButton }} →</NuxtLink>
    </section>
  </main>
</template>

<style scoped>
.falc-learning {
  display: grid;
  width: min(900px, 100%);
  margin: 0 auto;
  gap: 24px;
  color: var(--ink);
}

.falc-learning__hero {
  padding: clamp(24px, 5vw, 42px);
  border: 2px solid var(--brand);
  border-radius: 24px;
  background: white;
  text-align: center;
}

.falc-learning__hero h1 {
  margin: 0;
  color: var(--brand-dark);
  font-size: clamp(2.2rem, 7vw, 4rem);
  line-height: 1.05;
}

.falc-learning__section {
  padding: clamp(20px, 4vw, 32px);
  border: 2px solid var(--line);
  border-radius: 24px;
  background: white;
}

.falc-learning__section > header { margin-bottom: 20px; }
.falc-learning__section h2, .falc-learning__practice h2 { margin: 0; color: var(--brand-dark); font-size: clamp(1.7rem, 4vw, 2.25rem); }
.falc-learning__section > header p { margin: 8px 0 0; font-size: 1.1rem; line-height: 1.5; }

.falc-learning__groups { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.falc-learning__groups article { padding: 20px; border: 2px solid var(--line); border-radius: 18px; background: var(--soft); }
.falc-learning__groups article.is-easy { border-color: var(--brand); background: var(--brand-pale); }
.falc-learning__groups h3, .falc-learning__tenses h3 { margin: 0; color: var(--brand-dark); font-size: 1.3rem; }
.falc-learning__groups p { min-height: 7.5em; margin: 12px 0; font-size: 1.05rem; line-height: 1.5; }
.falc-learning__groups strong { color: var(--brand-dark); line-height: 1.5; }

.falc-learning__tenses { display: grid; gap: 12px; }
.falc-learning__tenses article { display: flex; padding: 20px; align-items: flex-start; gap: 18px; border: 2px solid var(--line); border-radius: 18px; background: var(--soft); }
.falc-learning__tenses article > span { display: grid; flex: 0 0 42px; width: 42px; height: 42px; place-items: center; border-radius: 50%; color: white; background: var(--brand); font-size: 1.1rem; font-weight: 900; }
.falc-learning__tenses p { margin: 9px 0 0; font-size: 1.05rem; line-height: 1.5; }
.falc-learning__tenses strong { display: inline-block; margin-top: 12px; padding: 8px 12px; border-radius: 10px; color: var(--brand-dark); background: white; font-size: 1.05rem; }

.falc-learning__practice { display: flex; padding: clamp(22px, 4vw, 32px); align-items: center; justify-content: space-between; gap: 24px; border-radius: 24px; color: white; background: var(--brand-dark); }
.falc-learning__practice h2 { color: white; }
.falc-learning__practice p { margin: 8px 0 0; font-size: 1.1rem; line-height: 1.5; }
.falc-learning__practice a { flex: 0 0 auto; padding: 14px 20px; border-radius: 12px; color: var(--brand-dark); background: white; font-size: 1.05rem; font-weight: 900; text-decoration: none; }
.falc-learning__practice a:focus-visible { outline: 4px solid var(--accent); outline-offset: 4px; }

@media (max-width: 700px) {
  .falc-learning__groups { grid-template-columns: 1fr; }
  .falc-learning__groups p { min-height: 0; }
  .falc-learning__practice { align-items: stretch; flex-direction: column; }
  .falc-learning__practice a { text-align: center; }
}

@media (max-width: 460px) {
  .falc-learning__tenses article { flex-direction: column; }
}
</style>

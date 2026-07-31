<script setup lang="ts">
import { MODE_LANDING_SLUGS, modeLandingPage } from '~~/shared/data/mode-landing-pages'
import { modeTensePages } from '~~/shared/data/mode-tense-pages'

const { interfaceLocale, localePath } = useLanguagePreferences()

const modes = computed(() => MODE_LANDING_SLUGS.map(slug => ({
  ...modeLandingPage(slug, interfaceLocale.value),
  to: localePath(`/modes/${slug}`),
})))
const tenseGroups = computed(() => MODE_LANDING_SLUGS.map(slug => ({
  mode: modeLandingPage(slug, interfaceLocale.value),
  to: localePath(`/modes/${slug}`),
  tenses: modeTensePages(slug).map(tense => ({ ...tense, to: localePath(tense.path) })),
})))
const copy = computed(() => ({
  fr: { eyebrow: 'Comprendre avant de pratiquer', title: 'Choisis d’abord un mode, puis un temps', intro: 'Le mode exprime le regard porté sur l’action. Le temps la situe et précise son déroulement. Commence par le mode pour faire un choix qui a du sens.', modesStep: 'Étape 1', modesTitle: 'Quel mode correspond à ton intention ?', modesText: 'Fait, souhait, hypothèse, consigne ou forme non personnelle : ouvre un mode pour comprendre ce qu’il permet d’exprimer.', discover: 'Découvrir ce mode', tensesStep: 'Étape 2', tensesTitle: 'Puis choisis un temps dans ce mode', tensesText: 'Chaque page explique le rôle précis du temps, sa formation et plusieurs exemples contextualisés.' },
  de: { eyebrow: 'Verstehen vor dem Üben', title: 'Wähle zuerst einen Modus, dann eine Zeit', intro: 'Der Modus zeigt die Haltung zur Handlung; die Zeit ordnet sie ein. Beginne mit dem Modus, damit deine Wahl sinnvoll ist.', modesStep: 'Schritt 1', modesTitle: 'Welcher Modus passt zu deiner Absicht?', modesText: 'Öffne einen Modus und entdecke, was er ausdrückt.', discover: 'Modus entdecken', tensesStep: 'Schritt 2', tensesTitle: 'Wähle dann eine Zeit in diesem Modus', tensesText: 'Jede Seite erklärt Rolle, Bildung und Verwendung anhand konkreter Beispiele.' },
  en: { eyebrow: 'Understand before practising', title: 'Choose a mood first, then a tense', intro: 'The mood conveys how an action is viewed; the tense locates and shapes it. Start with the mood so that your choice is meaningful.', modesStep: 'Step 1', modesTitle: 'Which mood matches your intention?', modesText: 'Open a mood to understand what it allows you to express.', discover: 'Discover this mood', tensesStep: 'Step 2', tensesTitle: 'Then choose a tense within that mood', tensesText: 'Each page explains its precise role, formation and use through contextualised examples.' },
  it: { eyebrow: 'Capire prima di esercitarsi', title: 'Scegli prima un modo, poi un tempo', intro: 'Il modo esprime il punto di vista sull’azione; il tempo la situa e la precisa. Inizia dal modo per dare senso alla scelta.', modesStep: 'Passaggio 1', modesTitle: 'Quale modo corrisponde alla tua intenzione?', modesText: 'Apri un modo per capire cosa permette di esprimere.', discover: 'Scopri questo modo', tensesStep: 'Passaggio 2', tensesTitle: 'Poi scegli un tempo in questo modo', tensesText: 'Ogni pagina spiega ruolo, formazione e uso con esempi contestualizzati.' },
  es: { eyebrow: 'Comprender antes de practicar', title: 'Elige primero un modo y después un tiempo', intro: 'El modo expresa la perspectiva sobre la acción; el tiempo la sitúa y la precisa. Empieza por el modo para que tu elección tenga sentido.', modesStep: 'Paso 1', modesTitle: '¿Qué modo corresponde a tu intención?', modesText: 'Abre un modo para entender qué permite expresar.', discover: 'Descubrir este modo', tensesStep: 'Paso 2', tensesTitle: 'Después elige un tiempo de ese modo', tensesText: 'Cada página explica su función, formación y uso con ejemplos contextualizados.' },
}[interfaceLocale.value]))

useHead(() => ({
  title: copy.value.title,
  meta: [{ name: 'description', content: copy.value.intro }],
}))
</script>

<template>
  <main class="exercise-map">
    <header class="exercise-map__hero">
      <p>{{ copy.eyebrow }}</p>
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.intro }}</p>
    </header>

    <section class="exercise-map__modes" aria-labelledby="mode-choice-title">
      <header>
        <span>{{ copy.modesStep }}</span>
        <div><h2 id="mode-choice-title">{{ copy.modesTitle }}</h2><p>{{ copy.modesText }}</p></div>
      </header>
      <div>
        <NuxtLink v-for="mode in modes" :key="mode.slug" :to="mode.to">
          <span>{{ mode.eyebrow }}</span>
          <h3>{{ mode.modeName }}</h3>
          <p>{{ mode.purpose }}</p>
          <strong>{{ copy.discover }} <span aria-hidden="true">→</span></strong>
        </NuxtLink>
      </div>
    </section>

    <section class="exercise-map__tenses" aria-labelledby="tense-choice-title">
      <header>
        <span>{{ copy.tensesStep }}</span>
        <div><h2 id="tense-choice-title">{{ copy.tensesTitle }}</h2><p>{{ copy.tensesText }}</p></div>
      </header>
      <div class="exercise-map__tense-groups">
        <article v-for="group in tenseGroups" :key="group.mode.slug">
          <header><h3>{{ group.mode.modeName }}</h3><NuxtLink :to="group.to">{{ copy.discover }} →</NuxtLink></header>
          <nav :aria-label="`${copy.tensesTitle} : ${group.mode.modeName}`">
            <NuxtLink v-for="tense in group.tenses" :key="tense.slug" :to="tense.to">{{ tense.label }} <span aria-hidden="true">→</span></NuxtLink>
          </nav>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.exercise-map { width: 100%; min-width: 0; max-width: 1120px; margin: 0 auto; color: var(--ink); font-family: "Funnel Sans", "Avenir Next", Avenir, system-ui, sans-serif; }
.exercise-map__hero { max-width: 850px; margin: 10px auto 48px; text-align: center; }
.exercise-map__hero > p:first-child { margin: 0 0 8px; color: var(--accent); font-size: .76rem; font-weight: 850; letter-spacing: .14em; text-transform: uppercase; }
.exercise-map__hero h1 { margin: 0; color: #294c4b; font-size: clamp(2.25rem, 6vw, 4.65rem); letter-spacing: -.055em; line-height: 1.02; }
.exercise-map__hero > p:last-child { max-width: 730px; margin: 22px auto 0; color: var(--muted); font-size: 1.12rem; line-height: 1.7; }
.exercise-map > section { padding: clamp(24px, 5vw, 40px); border: 1px solid var(--line); border-radius: 25px; background: var(--surface); box-shadow: 0 16px 40px rgb(42 65 61 / 7%); }
.exercise-map > section + section { margin-top: 22px; }
.exercise-map > section > header { display: grid; grid-template-columns: auto 1fr; gap: 22px; }
.exercise-map > section > header > span { margin-top: 5px; color: var(--accent); font-size: .76rem; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
.exercise-map h2 { margin: 0 0 7px; color: var(--brand-dark); font-size: clamp(1.55rem, 4vw, 2.5rem); letter-spacing: -.035em; }
.exercise-map > section > header p { max-width: 800px; margin: 0; color: var(--muted); line-height: 1.65; }
.exercise-map__modes > div { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); margin-top: 26px; gap: 11px; }
.exercise-map__modes > div > a { display: flex; min-width: 0; min-height: 260px; padding: 20px; flex-direction: column; border: 1px solid var(--line); border-radius: 18px; color: var(--ink); background: var(--surface-soft); text-decoration: none; transition: transform .16s ease, border-color .16s ease; }
.exercise-map__modes > div > a:hover { transform: translateY(-3px); border-color: var(--brand); }
.exercise-map__modes a > span { color: var(--accent); font-size: .68rem; font-weight: 850; letter-spacing: .07em; text-transform: uppercase; }
.exercise-map__modes h3 { margin: 13px 0 8px; color: var(--brand-dark); font-size: 1.22rem; text-transform: capitalize; }
.exercise-map__modes p { margin: 0; color: var(--muted); font-size: .88rem; line-height: 1.5; }
.exercise-map__modes strong { margin-top: auto; padding-top: 16px; color: var(--brand-dark); font-size: .82rem; }
.exercise-map__tense-groups { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 26px; gap: 13px; }
.exercise-map__tense-groups article { padding: 21px; border: 1px solid var(--line); border-radius: 18px; background: var(--surface-soft); }
.exercise-map__tense-groups article > header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.exercise-map__tense-groups h3 { margin: 0; color: var(--brand-dark); font-size: 1.2rem; text-transform: capitalize; }
.exercise-map__tense-groups header a { color: var(--muted); font-size: .78rem; font-weight: 750; text-decoration: none; }
.exercise-map__tense-groups nav { display: flex; margin-top: 16px; flex-wrap: wrap; gap: 7px; }
.exercise-map__tense-groups nav a { padding: 9px 11px; border: 1px solid var(--line); border-radius: 10px; color: var(--brand-dark); background: var(--surface); font-size: .86rem; font-weight: 780; text-decoration: none; text-transform: capitalize; }
.exercise-map__tense-groups nav a:hover { border-color: var(--brand); background: var(--brand-pale); }
@media (max-width: 930px) { .exercise-map__modes > div { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 720px) {
  .exercise-map { width: min(100%, calc(100vw - 20px)); }
  .exercise-map__modes > div, .exercise-map__tense-groups { grid-template-columns: 1fr; }
  .exercise-map__modes > div > a { min-height: 0; }
}
</style>

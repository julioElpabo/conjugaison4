<script setup lang="ts">
import type { ChallengePublicationSummary } from '~~/shared/types/challenge-publication'

const { interfaceLocale, localePath } = useLanguagePreferences()
const copy = computed(() => ({
  fr: {
    eyebrow: 'Français langue étrangère',
    title: 'Exercices de conjugaison FLE gratuits et personnalisables',
    intro: 'Entraîne-toi à conjuguer les verbes français utiles pour comprendre, parler et écrire dans les situations de la vie quotidienne.',
    whyTitle: 'Apprendre la conjugaison française en FLE',
    whyText: 'Ces exercices s’adressent aux personnes qui apprennent le français comme langue étrangère, ainsi qu’aux enseignants et formateurs qui recherchent un entraînement interactif. Les parcours progressifs commencent par les verbes les plus fréquents avant d’introduire davantage de temps et de formes.',
    benefits: ['Des verbes fréquents et directement utiles', 'Des parcours progressifs du niveau CIF 1 au niveau CIF 4', 'Des temps et des verbes que tu peux modifier selon ton objectif'],
    howTitle: 'Un exercice FLE adapté à ton objectif',
    howText: 'Choisis un parcours ci-dessous. Avant de commencer, tu peux conserver la sélection proposée ou modifier les verbes, les temps et les options. Tu obtiens ainsi un exercice de conjugaison adapté à ton niveau et à ce que tu veux réviser.',
    listTitle: 'Choisir un exercice de conjugaison FLE',
    start: 'Commencer cet exercice',
    library: 'Voir tous les défis officiels',
    empty: 'Aucun exercice FLE n’est disponible pour le moment.',
    meta: 'Exercices gratuits et interactifs de conjugaison FLE. Travaille les verbes français utiles par niveau et personnalise les verbes et les temps.',
  },
  de: {
    eyebrow: 'Französisch als Fremdsprache', title: 'Kostenlose und anpassbare FLE-Konjugationsübungen', intro: 'Übe nützliche französische Verben, um Alltagssituationen besser zu verstehen und dich mündlich wie schriftlich auszudrücken.',
    whyTitle: 'Französische Konjugation als Fremdsprache lernen', whyText: 'Die Übungen richten sich an Lernende von Französisch als Fremdsprache sowie an Lehrpersonen. Die progressiven Lernwege beginnen mit den häufigsten Verben und führen schrittweise zu weiteren Zeiten und Formen.',
    benefits: ['Häufige und sofort nützliche Verben', 'Progressive Lernwege von CIF 1 bis CIF 4', 'Verben und Zeitformen passend zu deinem Ziel ändern'],
    howTitle: 'Eine FLE-Übung passend zu deinem Lernziel', howText: 'Wähle unten einen Lernweg. Vor dem Start kannst du die vorgeschlagene Auswahl übernehmen oder Verben, Zeitformen und Optionen anpassen.',
    listTitle: 'FLE-Konjugationsübung auswählen', start: 'Übung starten', library: 'Alle offiziellen Aufgaben ansehen', empty: 'Zurzeit ist keine FLE-Übung verfügbar.',
    meta: 'Kostenlose interaktive FLE-Übungen zur französischen Konjugation. Übe nützliche Verben nach Niveau und passe Verben und Zeitformen an.',
  },
  en: {
    eyebrow: 'French as a foreign language', title: 'Free, customisable FLE French conjugation exercises', intro: 'Practise useful French verbs for understanding, speaking and writing in everyday situations.',
    whyTitle: 'Learn French conjugation as a foreign language', whyText: 'These exercises are designed for learners of French as a foreign language and for teachers looking for interactive practice. Progressive pathways begin with frequent verbs before introducing more tenses and forms.',
    benefits: ['Frequent verbs you can use straight away', 'Progressive pathways from CIF level 1 to CIF level 4', 'Verbs and tenses you can change to match your goal'],
    howTitle: 'FLE practice tailored to your goal', howText: 'Choose a pathway below. Before starting, keep the suggested selection or change the verbs, tenses and options to create practice at the right level.',
    listTitle: 'Choose an FLE French conjugation exercise', start: 'Start this exercise', library: 'See all official challenges', empty: 'No FLE exercise is currently available.',
    meta: 'Free interactive FLE French conjugation exercises. Practise useful French verbs by level and customise the verbs and tenses.',
  },
  it: {
    eyebrow: 'Francese lingua straniera', title: 'Esercizi gratuiti e personalizzabili di coniugazione FLE', intro: 'Esercitati con i verbi francesi utili per capire, parlare e scrivere nelle situazioni quotidiane.',
    whyTitle: 'Imparare la coniugazione francese come lingua straniera', whyText: 'Gli esercizi sono pensati per chi impara il francese come lingua straniera e per gli insegnanti. I percorsi progressivi iniziano dai verbi più frequenti e introducono gradualmente altri tempi e forme.',
    benefits: ['Verbi frequenti e subito utili', 'Percorsi progressivi dal livello CIF 1 al CIF 4', 'Verbi e tempi modificabili secondo il tuo obiettivo'],
    howTitle: 'Un esercizio FLE adatto al tuo obiettivo', howText: 'Scegli un percorso qui sotto. Prima di iniziare puoi mantenere la selezione proposta oppure modificare verbi, tempi e opzioni.',
    listTitle: 'Scegli un esercizio di coniugazione FLE', start: 'Inizia l’esercizio', library: 'Vedi tutte le sfide ufficiali', empty: 'Al momento non è disponibile alcun esercizio FLE.',
    meta: 'Esercizi gratuiti e interattivi di coniugazione FLE. Allenati con i verbi francesi utili e personalizza verbi e tempi.',
  },
  es: {
    eyebrow: 'Francés como lengua extranjera', title: 'Ejercicios gratuitos y personalizables de conjugación FLE', intro: 'Practica los verbos franceses útiles para comprender, hablar y escribir en situaciones cotidianas.',
    whyTitle: 'Aprender conjugación francesa como lengua extranjera', whyText: 'Los ejercicios están pensados para quienes aprenden francés como lengua extranjera y para docentes. Los recorridos progresivos empiezan con los verbos más frecuentes e introducen poco a poco más tiempos y formas.',
    benefits: ['Verbos frecuentes y útiles desde el principio', 'Recorridos progresivos del nivel CIF 1 al CIF 4', 'Verbos y tiempos que puedes cambiar según tu objetivo'],
    howTitle: 'Un ejercicio FLE adaptado a tu objetivo', howText: 'Elige un recorrido. Antes de empezar, puedes mantener la selección propuesta o modificar los verbos, los tiempos y las opciones.',
    listTitle: 'Elige un ejercicio de conjugación FLE', start: 'Empezar el ejercicio', library: 'Ver todos los retos oficiales', empty: 'No hay ningún ejercicio FLE disponible por el momento.',
    meta: 'Ejercicios gratuitos e interactivos de conjugación FLE. Practica verbos franceses útiles y personaliza los verbos y tiempos.',
  },
})[interfaceLocale.value])

const { data: response } = await useFetch<{ publications: ChallengePublicationSummary[] }>('/api/challenge-publications', {
  query: computed(() => ({ locale: interfaceLocale.value })),
})
const fleOrder = new Map([
  ['CIF1', 1], ['CIF2', 2], ['CIF3', 3], ['CIF4', 4], ['100-verbes-utiles-allophones', 5],
])
const exercises = computed(() => (response.value?.publications ?? [])
  .filter(publication => publication.categorySlug === 'cif')
  .toSorted((left, right) => (fleOrder.get(left.presetKey) ?? 99) - (fleOrder.get(right.presetKey) ?? 99)))
const config = useRuntimeConfig()
const pageUrl = computed(() => `${String(config.public.siteUrl).replace(/\/$/u, '')}${localePath('/conjugaison-fle')}`)

useHead(() => ({
  title: `${copy.value.title} | TATITOTU`,
  titleTemplate: null,
  meta: [
    { name: 'description', content: copy.value.meta },
    { property: 'og:title', content: copy.value.title },
    { property: 'og:description', content: copy.value.meta },
    { property: 'og:type', content: 'website' },
  ],
  script: [{
    key: 'fle-conjugation-collection',
    type: 'application/ld+json',
    textContent: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: copy.value.title,
      description: copy.value.meta,
      url: pageUrl.value,
      inLanguage: interfaceLocale.value,
      isPartOf: { '@type': 'WebSite', name: 'TATITOTU' },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: exercises.value.map((exercise, index) => ({
          '@type': 'ListItem', position: index + 1, name: exercise.title,
          url: `${String(config.public.siteUrl).replace(/\/$/u, '')}${localePath(`/defis/${exercise.slug}`)}`,
        })),
      },
    }),
  }],
}))
</script>

<template>
  <main class="fle-page">
    <header class="fle-page__hero">
      <p>{{ copy.eyebrow }}</p>
      <h1>{{ copy.title }}</h1>
      <span>{{ copy.intro }}</span>
    </header>

    <section class="fle-page__explanation">
      <div>
        <h2>{{ copy.whyTitle }}</h2>
        <p>{{ copy.whyText }}</p>
      </div>
      <ul>
        <li v-for="benefit in copy.benefits" :key="benefit">{{ benefit }}</li>
      </ul>
      <div>
        <h2>{{ copy.howTitle }}</h2>
        <p>{{ copy.howText }}</p>
      </div>
    </section>

    <section class="fle-page__exercises">
      <div class="fle-page__heading">
        <h2>{{ copy.listTitle }}</h2>
        <NuxtLink :to="localePath('/defis')">{{ copy.library }} →</NuxtLink>
      </div>
      <p v-if="!exercises.length" class="fle-page__empty">{{ copy.empty }}</p>
      <div v-else class="fle-page__grid">
        <article v-for="exercise in exercises" :key="exercise.id">
          <h3>{{ exercise.title }}</h3>
          <p>{{ exercise.description }}</p>
          <NuxtLink :to="localePath(`/defis/${exercise.slug}`)">{{ copy.start }} <span aria-hidden="true">→</span></NuxtLink>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.fle-page{display:grid;width:min(1080px,calc(100vw - 32px));margin:0 auto;padding:34px 0 70px;gap:34px;color:var(--ink)}
.fle-page__hero{max-width:900px;margin:0 auto;text-align:center}.fle-page__hero>p{margin:0 0 10px;color:var(--accent);font-size:.8rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.fle-page__hero h1{margin:0;color:var(--brand-dark);font-size:clamp(2.1rem,5.5vw,4rem);letter-spacing:.018em;line-height:1.08;text-wrap:balance}.fle-page__hero>span{display:block;max-width:780px;margin:20px auto 0;color:var(--muted);font-size:1.08rem;line-height:1.65}
.fle-page__explanation{display:grid;padding:28px;border:1px solid var(--line);border-radius:22px;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;background:color-mix(in srgb,var(--surface) 94%,var(--brand-pale));box-shadow:0 12px 32px rgb(42 65 61 / 6%)}.fle-page__explanation>div:last-child{grid-column:1/-1}.fle-page h2{margin:0;color:var(--brand-dark);letter-spacing:.012em}.fle-page__explanation p{margin:12px 0 0;color:var(--muted);line-height:1.68}.fle-page__explanation ul{display:grid;margin:0;padding:0;align-content:start;gap:10px;list-style:none}.fle-page__explanation li{position:relative;padding:11px 14px 11px 42px;border-radius:13px;color:var(--brand-dark);background:var(--surface);font-weight:750;line-height:1.4}.fle-page__explanation li::before{position:absolute;top:10px;left:13px;content:'✓';color:var(--accent);font-weight:950}
.fle-page__exercises{display:grid;gap:16px}.fle-page__heading{display:flex;align-items:baseline;justify-content:space-between;gap:16px}.fle-page__heading>a,.fle-page article a{color:var(--accent);font-weight:850}.fle-page__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}.fle-page article,.fle-page__empty{padding:22px;border:1px solid var(--line);border-radius:18px;background:var(--surface);box-shadow:0 10px 28px rgb(42 65 61 / 5%)}.fle-page article{display:flex;flex-direction:column}.fle-page article h3{margin:0;color:var(--brand-dark);letter-spacing:.008em}.fle-page article p{color:var(--muted);line-height:1.6}.fle-page article a{margin-top:auto}.fle-page__empty{text-align:center;color:var(--muted)}
@media(max-width:700px){.fle-page{padding-top:26px}.fle-page__explanation{padding:20px;grid-template-columns:1fr}.fle-page__explanation>div:last-child{grid-column:auto}.fle-page__heading{display:grid}.fle-page__grid{grid-template-columns:1fr}}
</style>

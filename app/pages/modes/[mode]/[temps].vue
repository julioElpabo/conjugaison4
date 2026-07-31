<script setup lang="ts">
import { MODE_LANDING_SLUGS, isModeLandingSlug, modeLandingPage } from '~~/shared/data/mode-landing-pages'
import { modeTensePage, modeTensePages } from '~~/shared/data/mode-tense-pages'

const route = useRoute()
const { interfaceLocale, localePath } = useLanguagePreferences()
const modeSlug = String(route.params.mode || '')
const tenseSlug = String(route.params.temps || '')

if (!isModeLandingSlug(modeSlug)) {
  throw createError({ statusCode: 404, statusMessage: 'Mode introuvable' })
}

const tense = modeTensePage(modeSlug, tenseSlug)
if (!tense || tense.path.startsWith('/exercices/')) {
  throw createError({ statusCode: 404, statusMessage: 'Temps introuvable' })
}

const mode = computed(() => modeLandingPage(modeSlug, interfaceLocale.value))
const modeNavigation = computed(() => MODE_LANDING_SLUGS.map(slug => ({
  key: slug,
  label: modeLandingPage(slug, interfaceLocale.value).modeName,
  to: localePath(`/modes/${slug}`),
})))
const tenseNavigation = computed(() => modeTensePages(modeSlug).map(item => ({
  key: item.slug,
  label: item.label,
  to: localePath(item.path),
})))
const copy = computed(() => ({
  fr: { modes: 'Les modes', tenses: mode.value.modeName, title: `${tense.label} — ${mode.value.modeName}`, description: `Découvre la place du ${tense.label} dans le mode ${mode.value.modeName}, puis entraîne-toi avec les verbes de ton choix.`, section: 'Comprendre ce temps', examples: 'Exemples dans ce mode', back: `Revenir au ${mode.value.modeName}`, practise: `Créer un exercice au ${tense.label}` },
  de: { modes: 'Die Modi', tenses: mode.value.modeName, title: `${tense.label} — ${mode.value.modeName}`, description: `Entdecke die Rolle von ${tense.label} im Modus ${mode.value.modeName} und übe anschließend mit eigenen Verben.`, section: 'Diese Zeit verstehen', examples: 'Beispiele in diesem Modus', back: `Zurück zu ${mode.value.modeName}`, practise: `Übung: ${tense.label}` },
  en: { modes: 'French moods', tenses: mode.value.modeName, title: `${tense.label} — ${mode.value.modeName}`, description: `Learn where ${tense.label} fits within the French ${mode.value.modeName}, then practise with your choice of verbs.`, section: 'Understand this tense', examples: 'Examples in this mood', back: `Back to ${mode.value.modeName}`, practise: `Practise ${tense.label}` },
  it: { modes: 'I modi', tenses: mode.value.modeName, title: `${tense.label} — ${mode.value.modeName}`, description: `Scopri il ruolo di ${tense.label} nel modo ${mode.value.modeName}, poi esercitati con i verbi che preferisci.`, section: 'Capire questo tempo', examples: 'Esempi in questo modo', back: `Torna a ${mode.value.modeName}`, practise: `Esercitati: ${tense.label}` },
  es: { modes: 'Los modos', tenses: mode.value.modeName, title: `${tense.label} — ${mode.value.modeName}`, description: `Descubre el papel de ${tense.label} en el modo ${mode.value.modeName} y practica con los verbos que elijas.`, section: 'Comprender este tiempo', examples: 'Ejemplos en este modo', back: `Volver a ${mode.value.modeName}`, practise: `Practicar ${tense.label}` },
}[interfaceLocale.value]))
const exerciseUrl = computed(() => ({
  path: localePath('/'),
  query: { mode: modeSlug, temps: tense.label },
}))

useHead(() => ({
  title: `${copy.value.title} : règles et exercices`,
  meta: [
    { name: 'description', content: copy.value.description },
    { property: 'og:title', content: copy.value.title },
    { property: 'og:description', content: copy.value.description },
    { property: 'og:type', content: 'website' },
  ],
}))
</script>

<template>
  <main class="tense-page">
    <div class="tense-page__navigation">
      <LearningSubnav :label="copy.modes" :items="modeNavigation" :active-key="modeSlug" />
      <LearningSubnav :label="copy.tenses" :items="tenseNavigation" :active-key="tenseSlug" />
    </div>

    <header class="tense-page__hero">
      <p>{{ mode.modeName }} · {{ tense.label }}</p>
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.description }}</p>
    </header>

    <div class="tense-page__content">
      <section>
        <h2>{{ copy.section }}</h2>
        <p>{{ mode.purpose }}</p>
      </section>
      <section>
        <h2>{{ copy.examples }}</h2>
        <ul><li v-for="example in mode.examples" :key="example">{{ example }}</li></ul>
      </section>
    </div>

    <footer class="tense-page__actions">
      <NuxtLink :to="localePath(`/modes/${modeSlug}`)">{{ copy.back }}</NuxtLink>
      <NuxtLink class="is-primary" :to="exerciseUrl">{{ copy.practise }} <span aria-hidden="true">→</span></NuxtLink>
    </footer>
  </main>
</template>

<style scoped>
.tense-page { width: 100%; min-width: 0; max-width: 1120px; margin: 0 auto; color: var(--ink); font-family: "Funnel Sans", "Avenir Next", Avenir, system-ui, sans-serif; }
.tense-page__navigation { display: grid; justify-items: center; }
.tense-page__navigation :deep(.learning-subnav:first-child) { margin-bottom: 10px; }
.tense-page__hero { max-width: 850px; margin: 14px auto 44px; text-align: center; }
.tense-page__hero > p:first-child { margin: 0 0 8px; color: var(--accent); font-size: .76rem; font-weight: 850; letter-spacing: .14em; text-transform: uppercase; }
.tense-page__hero h1 { margin: 0; color: #294c4b; font-size: clamp(2.2rem, 6vw, 4.55rem); letter-spacing: -.055em; line-height: 1.02; text-transform: capitalize; }
.tense-page__hero > p:last-child { max-width: 720px; margin: 22px auto 0; color: var(--muted); font-size: 1.12rem; line-height: 1.7; }
.tense-page__content { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.tense-page__content section { padding: clamp(24px, 5vw, 40px); border: 1px solid var(--line); border-radius: 24px; background: var(--surface); box-shadow: 0 16px 40px rgb(42 65 61 / 7%); }
.tense-page h2 { margin: 0 0 13px; color: var(--brand-dark); font-size: clamp(1.35rem, 3vw, 2rem); }
.tense-page__content p, .tense-page__content li { color: var(--muted); line-height: 1.65; }
.tense-page__content ul { display: grid; margin: 0; padding-left: 20px; gap: 10px; }
.tense-page__actions { display: flex; margin-top: 18px; padding: 24px; align-items: center; justify-content: flex-end; border-radius: 20px; gap: 12px; background: #294c4b; }
.tense-page__actions a { padding: 11px 15px; border-radius: 11px; color: white; font-weight: 800; text-decoration: none; }
.tense-page__actions a.is-primary { color: #294c4b; background: #f4c943; }
@media (max-width: 720px) {
  .tense-page { width: min(100%, calc(100vw - 20px)); }
  .tense-page__content { grid-template-columns: 1fr; }
  .tense-page__actions { align-items: stretch; flex-direction: column; text-align: center; }
}
</style>

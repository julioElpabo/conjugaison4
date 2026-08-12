<script setup lang="ts">
import { relatedTenseExercisePages, tenseExercisePage } from '~~/shared/data/tense-exercise-pages'

const route = useRoute()
const { localePath } = useLanguagePreferences()
const requestedSlug = String(route.params.parcours || '')
const canonicalSlug = requestedSlug === 'present' ? 'present-indicatif' : requestedSlug

// L'ancienne URL reste valide, mais pointe vers le slug explicite et canonique.
if (requestedSlug === 'present') {
  await navigateTo(localePath('/exercices/present-indicatif'), { redirectCode: 301, replace: true })
}

const page = tenseExercisePage(canonicalSlug)
if (!page) {
  throw createError({ statusCode: 404, statusMessage: 'Temps introuvable' })
}

const relatedPages = relatedTenseExercisePages(page)
const generalExercisesUrl = computed(() => localePath('/exercices-de-conjugaison'))
const startsWithVowel = /^[aeiouyéèêàâîïôöùûü]/iu.test(page.label)
const practiceLabel = `${startsWithVowel ? 'à l’' : 'au '}${page.label}`
const definiteLabel = `${startsWithVowel ? 'l’' : 'le '}${page.label}`
const exerciseUrl = computed(() => ({
  path: generalExercisesUrl.value,
  query: { mode: page.mode, temps: page.queryTense },
}))

useHead(() => ({
  title: page.title,
  titleTemplate: null,
  meta: [
    { name: 'description', content: page.description },
    { property: 'og:title', content: page.title },
    { property: 'og:description', content: page.description },
    { property: 'og:type', content: 'website' },
  ],
  script: [{
    key: 'tense-exercise-learning-resource',
    type: 'application/ld+json',
    textContent: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: page.h1,
      description: page.description,
      learningResourceType: 'Exercise',
      educationalUse: 'Practice',
      inLanguage: 'fr',
      teaches: `Conjugaison française : ${page.label}`,
      isAccessibleForFree: true,
    }),
  }],
}))

useSeoMeta({ twitterCard: 'summary' })
</script>

<template>
  <main class="tense-exercise-page">
    <header class="tense-exercise-page__hero">
      <p>Exercices de conjugaison · {{ page.mode }}</p>
      <h1>{{ page.h1 }}</h1>
      <p>{{ page.intro }}</p>
      <NuxtLink class="exercise-landing__primary" :to="exerciseUrl">Commencer les exercices {{ practiceLabel }}</NuxtLink>
    </header>

    <section class="tense-exercise-page__practice" aria-labelledby="practice-title">
      <div>
        <p>Temps présélectionné</p>
        <h2 id="practice-title">Créez votre exercice {{ practiceLabel }}</h2>
        <span>Choisissez les verbes, le nombre de questions et le format de votre entraînement.</span>
      </div>
      <NuxtLink :to="exerciseUrl">Commencer les exercices {{ practiceLabel }} <span aria-hidden="true">→</span></NuxtLink>
    </section>

    <section class="tense-exercise-page__explanation">
      <h2>À quoi sert {{ definiteLabel }} ?</h2>
      <p>{{ page.explanation }}</p>
    </section>

    <nav class="tense-exercise-page__related" aria-labelledby="related-title">
      <h2 id="related-title">Autres exercices de conjugaison</h2>
      <ul>
        <li v-for="related in relatedPages" :key="related.slug">
          <NuxtLink :to="localePath(`/exercices/${related.slug}`)">{{ related.label }}</NuxtLink>
        </li>
      </ul>
    </nav>

    <NuxtLink class="tense-exercise-page__back" :to="generalExercisesUrl"><span aria-hidden="true">←</span> Retour aux exercices de conjugaison</NuxtLink>
  </main>
</template>

<style scoped>
.tense-exercise-page { display: grid; width: 100%; max-width: 980px; min-width: 0; margin: 0 auto; gap: 18px; color: var(--ink); font-family: "Funnel Sans", "Avenir Next", Avenir, system-ui, sans-serif; }
.tense-exercise-page h2 { margin: 0 0 12px; color: var(--brand-dark); font-size: clamp(1.35rem, 3vw, 2rem); letter-spacing: -.025em; }
.tense-exercise-page__hero { max-width: 820px; margin: 18px auto 30px; text-align: center; }
.tense-exercise-page__hero > p:first-child, .tense-exercise-page__practice p { margin: 0 0 8px; color: var(--accent); font-size: .76rem; font-weight: 850; letter-spacing: .13em; text-transform: uppercase; }
.tense-exercise-page__hero h1 { margin: 0; color: #294c4b; font-size: clamp(2.3rem, 6vw, 4.5rem); letter-spacing: -.055em; line-height: 1.03; }
.tense-exercise-page__hero > p:nth-of-type(2) { max-width: 730px; margin: 22px auto 28px; color: var(--muted); font-size: 1.08rem; line-height: 1.7; }
.exercise-landing__primary, .tense-exercise-page__practice a { display: inline-flex; max-width: 100%; padding: 13px 19px; align-items: center; justify-content: center; border-radius: 12px; color: white; background: var(--brand); font-weight: 820; text-align: center; text-decoration: none; box-shadow: 0 12px 28px rgb(41 76 75 / 18%); }
.exercise-landing__primary:hover, .tense-exercise-page__practice a:hover { background: var(--brand-dark); transform: translateY(-1px); }
.tense-exercise-page__practice { display: flex; padding: clamp(25px, 5vw, 40px); align-items: center; justify-content: space-between; border-radius: 23px; gap: 28px; background: #294c4b; }
.tense-exercise-page__practice h2 { color: white; }
.tense-exercise-page__practice div > span { display: block; max-width: 600px; color: rgb(255 255 255 / 78%); line-height: 1.6; }
.tense-exercise-page__practice a { flex: 0 0 auto; color: #294c4b; background: #f4c943; box-shadow: none; }
.tense-exercise-page__explanation, .tense-exercise-page__related { padding: clamp(24px, 5vw, 34px); border: 1px solid var(--line); border-radius: 21px; background: var(--surface); box-shadow: 0 12px 32px rgb(42 65 61 / 6%); }
.tense-exercise-page__explanation p { max-width: 820px; margin: 0; color: var(--muted); font-size: 1.02rem; line-height: 1.7; }
.tense-exercise-page__related { background: color-mix(in srgb, var(--surface) 92%, var(--brand)); }
.tense-exercise-page__related ul { display: flex; margin: 0; padding: 0; flex-wrap: wrap; gap: 9px; list-style: none; }
.tense-exercise-page__related a { display: inline-flex; padding: 9px 13px; border: 1px solid var(--line); border-radius: 999px; color: var(--brand-dark); background: var(--surface); font-weight: 780; text-decoration: none; }
.tense-exercise-page__related a:hover { border-color: var(--brand); background: var(--brand-pale); }
.tense-exercise-page__back { justify-self: start; padding: 10px 13px; color: var(--brand-dark); font-weight: 800; text-decoration: none; }
.tense-exercise-page__back:hover { text-decoration: underline; }
@media (max-width: 720px) {
  .tense-exercise-page { width: min(100%, calc(100vw - 20px)); }
  .tense-exercise-page__hero h1 { overflow-wrap: anywhere; }
  .tense-exercise-page__practice { align-items: stretch; flex-direction: column; }
  .tense-exercise-page__practice a { width: 100%; box-sizing: border-box; }
}
</style>

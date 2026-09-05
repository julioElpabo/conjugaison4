<script setup lang="ts">
import { localeLanguageTag } from '~~/shared/i18n/locales'
import WizardChallengeWorkspace from '~/components/challenge/WizardChallengeWorkspace.vue'
import { TENSE_EXERCISE_PAGES } from '~~/shared/data/tense-exercise-pages'

const { ui, interfaceLocale, localePath } = useLanguagePreferences()
const config = useRuntimeConfig()
const route = useRoute()
const description = computed(() => ui('Exercices de conjugaison française gratuits, interactifs et personnalisables. Entraînez-vous aux temps et aux verbes de votre choix, sans publicité.'))
const pageTitle = computed(() => interfaceLocale.value === 'fr'
  ? 'Exercices de conjugaison française gratuits | TATITOTU'
  : `${ui('Exercices de conjugaison française gratuits et sans publicité')} | TATITOTU`)
const pageUrl = computed(() => `${String(config.public.siteUrl).replace(/\/$/u, '')}${route.path}`)

useHead(() => ({
  title: pageTitle.value,
  titleTemplate: null,
  meta: [
    { name: 'description', content: description.value },
    { property: 'og:description', content: description.value },
  ],
  script: [{
    key: 'exercise-learning-resource',
    type: 'application/ld+json',
    textContent: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: pageTitle.value,
      description: description.value,
      url: pageUrl.value,
      learningResourceType: 'Interactive resource',
      educationalUse: ['Instruction', 'Practice'],
      inLanguage: localeLanguageTag(interfaceLocale.value),
      teaches: ui('Conjugaison française'),
      isAccessibleForFree: true,
    }),
  }],
}))
</script>

<template>
  <div>
    <WizardChallengeWorkspace :home-heading="ui('Exercices de conjugaison française')" />
    <section class="tense-links" aria-labelledby="tense-links-title">
      <h2 id="tense-links-title">Exercices par temps</h2>
      <ul>
        <li v-for="page in TENSE_EXERCISE_PAGES" :key="page.slug">
          <NuxtLink :to="localePath(`/exercices/${page.slug}`)">{{ page.linkLabel }}</NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.tense-links { max-width: 980px; margin: 34px auto 8px; padding: 22px 25px; border: 1px solid var(--line); border-radius: 18px; background: color-mix(in srgb, var(--surface) 95%, var(--brand)); box-shadow: 0 10px 28px rgb(42 65 61 / 5%); }
.tense-links h2 { margin: 0 0 13px; color: var(--brand-dark); font-size: 1.25rem; }
.tense-links ul { display: flex; margin: 0; padding: 0; flex-wrap: wrap; gap: 7px 18px; list-style: none; }
.tense-links a { color: var(--muted); font-size: .9rem; line-height: 1.5; text-decoration-thickness: 1px; text-underline-offset: 3px; }
.tense-links a:hover { color: var(--brand-dark); }
@media (max-width: 720px) { .tense-links { margin-inline: 10px; } }
</style>

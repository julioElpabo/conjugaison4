<script setup lang="ts">
import WizardChallengeWorkspace from '~/components/challenge/WizardChallengeWorkspace.vue'

const { ui, interfaceLocale } = useLanguagePreferences()
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
      inLanguage: interfaceLocale.value,
      teaches: ui('Conjugaison française'),
      isAccessibleForFree: true,
    }),
  }],
}))
</script>

<template>
  <WizardChallengeWorkspace :home-heading="ui('Exercices de conjugaison française')" />
</template>

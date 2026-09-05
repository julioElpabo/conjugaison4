<script setup lang="ts">
import { localeLanguageTag } from '~~/shared/i18n/locales'
import WizardChallengeWorkspace from '~/components/challenge/WizardChallengeWorkspace.vue'
const { ui, interfaceLocale } = useLanguagePreferences()
const config = useRuntimeConfig()
const route = useRoute()
const description = computed(() => ui('TATITOTU est un outil gratuit et multilingue pour apprendre et enseigner la conjugaison française, quel que soit le pays.'))
const pageUrl = computed(() => `${String(config.public.siteUrl).replace(/\/$/u, '')}${route.path}`)

useHead(() => ({
  title: `TATITOTU · ${ui('Exercices de conjugaison française gratuits et sans publicité')}`,
  meta: [
    {
      name: 'description',
      content: description.value,
    },
    { property: 'og:description', content: description.value },
  ],
  script: [{
    key: 'home-learning-resource',
    type: 'application/ld+json',
    textContent: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: 'TATITOTU',
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
  <WizardChallengeWorkspace />
</template>

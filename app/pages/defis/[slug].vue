<script setup lang="ts">
import WizardChallengeWorkspace from '~/components/challenge/WizardChallengeWorkspace.vue'
import type { ChallengePublicationResolution } from '~~/shared/types/challenge-publication'

const route = useRoute()
const config = useRuntimeConfig()
const { interfaceLocale, localePath } = useLanguagePreferences()
const requestedSlug = String(route.params.slug || '')
const { data: resolution, error } = await useFetch<ChallengePublicationResolution>(`/api/challenge-publications/${encodeURIComponent(requestedSlug)}`, {
  query: { locale: interfaceLocale.value },
})

if (error.value || !resolution.value) {
  throw createError({ statusCode: 404, statusMessage: 'Défi public introuvable' })
}
if (resolution.value.kind === 'redirect') {
  await navigateTo(localePath(`/defis/${resolution.value.slug}`, resolution.value.locale), { redirectCode: 301, replace: true })
}
if (resolution.value.kind !== 'publication') {
  throw createError({ statusCode: 404, statusMessage: 'Défi public introuvable' })
}

const publication = resolution.value.publication
const editHint = {
  fr: {
    before: 'Les boutons',
    between: 'et',
    after: 'te permettent de voir quels sont les verbes et les temps que tu vas travailler. Tu peux aussi les modifier. Bon travail !',
    verbsLabel: 'Modifier les verbes à travailler',
    tensesLabel: 'Modifier les temps à travailler',
  },
  de: {
    before: 'Mit den Schaltflächen',
    between: 'und',
    after: 'zeigen dir, welche Verben und Zeitformen du üben wirst. Du kannst sie auch ändern. Viel Erfolg!',
    verbsLabel: 'Verben zum Üben ändern',
    tensesLabel: 'Zeitformen zum Üben ändern',
  },
  en: {
    before: 'Buttons',
    between: 'and',
    after: 'show you which verbs and tenses you are going to practise. You can also change them. Keep up the good work!',
    verbsLabel: 'Change the verbs to practise',
    tensesLabel: 'Change the tenses to practise',
  },
  it: {
    before: 'I pulsanti',
    between: 'e',
    after: 'ti permettono di vedere quali verbi e tempi eserciterai. Puoi anche modificarli. Buon lavoro!',
    verbsLabel: 'Modifica i verbi da esercitare',
    tensesLabel: 'Modifica i tempi da esercitare',
  },
  es: {
    before: 'Los botones',
    between: 'y',
    after: 'te permiten ver qué verbos y tiempos vas a practicar. También puedes modificarlos. ¡Buen trabajo!',
    verbsLabel: 'Modificar los verbos que quieres practicar',
    tensesLabel: 'Modificar los tiempos que quieres practicar',
  },
}[publication.locale]
const canonicalPath = `/${publication.locale}/defis/${publication.slug}`
const frenchAlternate = publication.translations.find(alternate => alternate.locale === 'fr')
usePageSeoOverride().setPageSeoOverride({
  canonicalPath,
  alternates: publication.translations,
  xDefaultPath: frenchAlternate?.path ?? canonicalPath,
  robots: publication.isIndexable ? 'index, follow' : 'noindex, follow',
})
const pageUrl = `${String(config.public.siteUrl).replace(/\/$/u, '')}${canonicalPath}`

useHead({
  title: publication.metaTitle || publication.title,
  titleTemplate: null,
  meta: [
    { name: 'description', content: publication.metaDescription || publication.description },
    { property: 'og:title', content: publication.metaTitle || publication.title },
    { property: 'og:description', content: publication.metaDescription || publication.description },
    { property: 'og:type', content: 'website' },
  ],
  script: [{
    key: 'challenge-learning-resource',
    type: 'application/ld+json',
    textContent: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: publication.title,
      description: publication.description,
      url: pageUrl,
      learningResourceType: 'Exercise',
      educationalUse: 'Practice',
      inLanguage: publication.locale,
      teaches: 'French conjugation',
      isAccessibleForFree: true,
    }),
  }],
})
</script>

<template>
  <main class="public-challenge">
    <WizardChallengeWorkspace
      :initial-preset-id="publication.presetKey"
      :launch-category="publication.categoryName"
      :launch-description="publication.description"
      :launch-edit-hint="editHint"
      :launch-title="publication.title"
      embedded
      start-at-launch
    />
  </main>
</template>

<style scoped>
.public-challenge{display:grid;width:100%;gap:20px}
</style>

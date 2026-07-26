<script setup lang="ts">
import WizardChallengeWorkspace from '~/components/challenge/WizardChallengeWorkspace.vue'
const { ui } = useLanguagePreferences()

const route = useRoute()
const code = computed(() => String(route.params.code ?? ''))

useHead(() => ({
  title: ui('Défi {code} · Conjugaison', { code: code.value }),
  meta: [
    { name: 'description', content: ui('Ouvrir et réaliser le défi de conjugaison {code}.', { code: code.value }) }
  ]
}))
</script>

<template>
  <WizardChallengeWorkspace :initial-code="code" />
</template>

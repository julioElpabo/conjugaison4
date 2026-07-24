<script setup lang="ts">
import WizardChallengeWorkspace from '~/components/challenge/WizardChallengeWorkspace.vue'
const { ui } = useLanguagePreferences()

useHead(() => ({
  title: ui('Nouveau parcours'),
  meta: [
    {
      name: 'description',
      content: ui('Composez un défi de conjugaison en choisissant les verbes, les modes et les temps.')
    }
  ]
}))
</script>

<template>
  <WizardChallengeWorkspace />
</template>

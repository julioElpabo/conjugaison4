<script setup lang="ts">
import WizardChallengeWorkspace from '~/components/challenge/WizardChallengeWorkspace.vue'

useHead({
  title: 'Nouveau parcours',
  meta: [
    {
      name: 'description',
      content: 'Composez rapidement un défi de conjugaison en choisissant les verbes, les modes et les temps.'
    }
  ]
})
</script>

<template>
  <WizardChallengeWorkspace />
</template>

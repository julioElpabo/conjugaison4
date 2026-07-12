<script setup lang="ts">
import ChallengeWorkspace from '~/components/challenge/ChallengeWorkspace.vue'

useHead({
  title: 'Défi de conjugaison',
  meta: [
    {
      name: 'description',
      content: 'Créez un exercice de conjugaison personnalisé, entraînez-vous en ligne ou imprimez une fiche avec son corrigé.'
    }
  ]
})
</script>

<template>
  <ChallengeWorkspace />
</template>

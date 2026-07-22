<script setup lang="ts">
import ChallengeWorkspace from '~/components/challenge/ChallengeWorkspace.vue'
const { ui } = useLanguagePreferences()

useHead(() => ({ title: `${ui('Accueil')} · ${ui('Défi de conjugaison')}` }))
</script>

<template>
  <ChallengeWorkspace />
</template>

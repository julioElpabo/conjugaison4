<script setup lang="ts">
import ChallengeWorkspace from '~/components/challenge/ChallengeWorkspace.vue'

const route = useRoute()
const code = computed(() => String(route.params.code ?? ''))

useHead(() => ({
  title: `Défi ${code.value} · Conjugaison`,
  meta: [
    { name: 'description', content: `Ouvrir et réaliser le défi de conjugaison ${code.value}.` }
  ]
}))
</script>

<template>
  <ChallengeWorkspace :initial-code="code" />
</template>

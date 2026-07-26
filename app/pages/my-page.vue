<script setup lang="ts">
definePageMeta({ middleware: 'learner-auth' })

useHead({
  title: 'Mon espace',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>

<template>
  <LearnerSpace />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'learner-auth' })

const { ui } = useLanguagePreferences()

useHead(() => ({
  title: ui('Mon espace'),
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
}))
</script>

<template>
  <LearnerSpace />
</template>

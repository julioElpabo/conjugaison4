<script setup lang="ts">
const { localePath } = useLanguagePreferences()

await navigateTo(localePath('/apprendre'), {
  redirectCode: 301,
  replace: true,
})
</script>

<template>
  <div />
</template>

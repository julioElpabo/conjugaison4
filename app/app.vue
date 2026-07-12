<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'fr' },
  titleTemplate: title => title ? `${title} · Défis de conjugaison` : 'Défis de conjugaison',
  meta: [
    {
      name: 'description',
      content: 'Créez des défis de conjugaison, entraînez-vous et imprimez vos questionnaires.'
    }
  ]
})
</script>

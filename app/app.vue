<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage :page-key="localizedPageKey" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { stripLocaleFromPath } from '~~/shared/i18n/locales'

const { ui } = useLanguagePreferences()

function localizedPageKey(route: RouteLocationNormalizedLoaded) {
  return stripLocaleFromPath(route.path)
}

useHead(() => ({
  titleTemplate: title => title ? `${title} · ${ui('Défis de conjugaison')}` : ui('Défis de conjugaison'),
  meta: [
    { name: 'theme-color', content: '#344758' },
    {
      name: 'description',
      content: ui('Créez des défis de conjugaison, entraînez-vous et imprimez vos questionnaires.')
    }
  ],
  script: [{
    id: 'theme-init',
    innerHTML: `(function(){try{var t=localStorage.getItem('conjugaison.theme');if(t!=='light'&&t!=='dark')t='light';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})()`
  }]
}))
</script>

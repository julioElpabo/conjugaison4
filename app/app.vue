<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage :page-key="localizedPageKey" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { localizePath, stripLocaleFromPath, SUPPORTED_LOCALES } from '~~/shared/i18n/locales'

const { ui, interfaceLocale } = useLanguagePreferences()
const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = computed(() => String(config.public.siteUrl).replace(/\/$/u, ''))
const routeWithoutLocale = computed(() => stripLocaleFromPath(route.path))
const canonicalUrl = computed(() => `${siteUrl.value}${localizePath(routeWithoutLocale.value, interfaceLocale.value)}`)
const privatePath = computed(() => /^(?:\/admin(?:\/|$)|\/(?:signin|my-page|mon-compte|nouveau-defi)(?:\/|$)|\/defi(?:\/|$))/u.test(routeWithoutLocale.value))

function localizedPageKey(route: RouteLocationNormalizedLoaded) {
  return stripLocaleFromPath(route.path)
}

useHead(() => ({
  titleTemplate: title => title ? `${title} · ${ui('Défis de conjugaison')}` : ui('Défis de conjugaison'),
  meta: [
    { name: 'theme-color', content: '#344758' },
    { name: 'robots', content: privatePath.value ? 'noindex, nofollow' : 'index, follow' },
    { property: 'og:site_name', content: 'TATITOTU' },
    { property: 'og:url', content: canonicalUrl.value },
    {
      name: 'description',
      content: ui('Créez des défis de conjugaison, entraînez-vous et imprimez vos questionnaires.')
    }
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
    ...SUPPORTED_LOCALES.map(locale => ({
      rel: 'alternate',
      hreflang: locale,
      href: `${siteUrl.value}${localizePath(routeWithoutLocale.value, locale)}`,
    })),
    {
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${siteUrl.value}${localizePath(routeWithoutLocale.value, 'fr')}`,
    },
  ],
  script: [{
    id: 'theme-init',
    src: '/theme-init.js'
  }]
}))
</script>

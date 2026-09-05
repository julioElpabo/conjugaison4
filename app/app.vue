<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage :page-key="localizedPageKey" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { localeLanguageTag, localizePath, stripLocaleFromPath, SUPPORTED_LOCALES } from '~~/shared/i18n/locales'

const { ui, interfaceLocale } = useLanguagePreferences()
const route = useRoute()
const config = useRuntimeConfig()
const siteUrl = computed(() => String(config.public.siteUrl).replace(/\/$/u, ''))
const routeWithoutLocale = computed(() => stripLocaleFromPath(route.path))
const { pageSeoOverride } = usePageSeoOverride()
const canonicalUrl = computed(() => `${siteUrl.value}${pageSeoOverride.value?.canonicalPath ?? localizePath(routeWithoutLocale.value, interfaceLocale.value)}`)
const alternateLinks = computed(() => pageSeoOverride.value?.alternates.map(alternate => ({
  rel: 'alternate',
  hreflang: localeLanguageTag(alternate.locale),
  href: `${siteUrl.value}${alternate.path}`,
})) ?? SUPPORTED_LOCALES.map(locale => ({
  rel: 'alternate',
  hreflang: localeLanguageTag(locale),
  href: `${siteUrl.value}${localizePath(routeWithoutLocale.value, locale)}`,
})))
const xDefaultPath = computed(() => pageSeoOverride.value?.xDefaultPath ?? localizePath(routeWithoutLocale.value, 'fr'))
const privatePath = computed(() => /^(?:\/admin(?:\/|$)|\/(?:signin|my-page|mon-compte|nouveau-defi)(?:\/|$)|\/(?:defi|bilan)(?:\/|$))/u.test(routeWithoutLocale.value))

function localizedPageKey(route: RouteLocationNormalizedLoaded) {
  return stripLocaleFromPath(route.path)
}

useHead(() => ({
  titleTemplate: title => title ? `${title} · ${ui('Défis de conjugaison')}` : ui('Défis de conjugaison'),
  meta: [
    { name: 'theme-color', content: '#344758' },
    { name: 'robots', content: pageSeoOverride.value?.robots ?? (privatePath.value ? 'noindex, nofollow' : 'index, follow') },
    { property: 'og:site_name', content: 'TATITOTU' },
    { property: 'og:url', content: canonicalUrl.value },
    {
      name: 'description',
      content: ui('Créez des défis de conjugaison, entraînez-vous et imprimez vos questionnaires.')
    }
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
    ...alternateLinks.value,
    {
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${siteUrl.value}${xDefaultPath.value}`,
    },
  ],
  script: [{
    id: 'theme-init',
    src: '/theme-init.js'
  }]
}))
</script>

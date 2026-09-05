import {
  DEFAULT_INTERFACE_LOCALE,
  localeFromPath,
  localizePath,
  normalizeLocale,
} from '~~/shared/i18n/locales'
import { permanentLegacyRedirect } from '~~/shared/seo/legacy-redirects'

export default defineNuxtRouteMiddleware((to) => {
  usePageSeoOverride().setPageSeoOverride(null)
  const interfaceLocale = useCookie<string>('interface_locale', {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  })
  const legacyRedirect = permanentLegacyRedirect(to.path)

  if (legacyRedirect && legacyRedirect !== to.path) {
    const destinationLocale = localeFromPath(legacyRedirect)
    if (destinationLocale) interfaceLocale.value = destinationLocale
    return navigateTo({
      path: legacyRedirect,
      query: to.query,
      hash: to.hash,
    }, {
      redirectCode: 301,
      replace: true,
    })
  }

  const routeLocale = localeFromPath(to.path)

  if (routeLocale) {
    if (interfaceLocale.value !== routeLocale) interfaceLocale.value = routeLocale
    if (to.path.replace(/^\/(?:fr|de|en|it|es|nl-NL|nl)(?=\/|$)/u, '') === '/charts') {
      return navigateTo({
        path: localizePath('/admin/charts', routeLocale),
        query: to.query,
        hash: to.hash,
      }, {
        redirectCode: 301,
        replace: true,
      })
    }
    return
  }

  const locale = normalizeLocale(interfaceLocale.value, DEFAULT_INTERFACE_LOCALE)
  interfaceLocale.value = locale
  const path = to.path === '/charts' ? '/admin/charts' : to.path
  return navigateTo({
    path: localizePath(path, locale),
    query: to.query,
    hash: to.hash,
  }, {
    redirectCode: 302,
    replace: true,
  })
})

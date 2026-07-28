import {
  DEFAULT_INTERFACE_LOCALE,
  localeFromPath,
  localizePath,
  normalizeLocale,
} from '~~/shared/i18n/locales'

export default defineNuxtRouteMiddleware((to) => {
  const interfaceLocale = useCookie<string>('interface_locale', {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  })
  const routeLocale = localeFromPath(to.path)

  if (routeLocale) {
    if (interfaceLocale.value !== routeLocale) interfaceLocale.value = routeLocale
    if (to.path.replace(/^\/(?:fr|de|en|it|es)(?=\/|$)/u, '') === '/charts') {
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

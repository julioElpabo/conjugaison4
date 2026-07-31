import type { AnalyticsEventName } from '~~/shared/types/analytics'
import { stripLocaleFromPath } from '~~/shared/i18n/locales'

export function useSiteAnalytics() {
  const route = useRoute()

  function track(name: AnalyticsEventName, metadata?: Record<string, string | number | boolean>) {
    if (!import.meta.client) return
    void $fetch('/api/analytics/event', {
      method: 'POST',
      body: { name, path: route.fullPath, metadata },
    }).catch(() => {})
    const gtag = (globalThis as typeof globalThis & { gtag?: (...args: unknown[]) => void }).gtag
    const normalized = stripLocaleFromPath(route.path)
    const isSignIn = normalized === '/signin'
    const isLearnerSpace = normalized === '/my-page'
    const isAdministration = normalized === '/admin' || normalized.startsWith('/admin/')
    if (!isSignIn && !isAdministration) {
      gtag?.('event', name, {
        ...(metadata || {}),
        ...(isLearnerSpace ? { user_type: 'learner' } : {}),
      })
    }
  }

  return { track }
}

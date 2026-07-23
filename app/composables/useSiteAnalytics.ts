import type { AnalyticsEventName } from '~~/shared/types/analytics'

export function useSiteAnalytics() {
  const route = useRoute()

  function track(name: AnalyticsEventName, metadata?: Record<string, string | number | boolean>) {
    if (!import.meta.client) return
    void $fetch('/api/analytics/event', {
      method: 'POST',
      body: { name, path: route.fullPath, metadata },
    }).catch(() => {})
    const gtag = (globalThis as typeof globalThis & { gtag?: (...args: unknown[]) => void }).gtag
    gtag?.('event', name, metadata || {})
  }

  return { track }
}

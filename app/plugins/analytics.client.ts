import { stripLocaleFromPath } from '~~/shared/i18n/locales'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const config = useRuntimeConfig()
  const { interfaceLocale } = useLanguagePreferences()
  const measurementId = String(config.public.ga4MeasurementId || '').trim()
  const googleEnabled = Boolean(measurementId) && !['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
  let timer: number | undefined

  type AnalyticsWindow = Window & {
    dataLayer?: unknown[][]
    gtag?: (...args: unknown[]) => void
  }
  const analyticsWindow = window as unknown as AnalyticsWindow
  if (googleEnabled) {
    analyticsWindow.dataLayer = analyticsWindow.dataLayer || []
    analyticsWindow.gtag = analyticsWindow.gtag || ((...args: unknown[]) => analyticsWindow.dataLayer!.push(args))
    analyticsWindow.gtag('js', new Date())
    analyticsWindow.gtag('config', measurementId, { send_page_view: false })
    useHead({
      script: [{ src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`, async: true }],
    })
  }

  function isAdministration() {
    const path = stripLocaleFromPath(route.path)
    return path === '/admin' || path.startsWith('/admin/')
  }

  function heartbeat(pageView = false) {
    if (document.visibilityState !== 'visible') return
    if (isAdministration()) return
    void $fetch('/api/analytics/heartbeat', {
      method: 'POST',
      body: { path: route.fullPath, locale: interfaceLocale.value, pageView },
    }).catch(() => {})
  }

  function googlePageView() {
    if (!googleEnabled || isAdministration()) return
    analyticsWindow.gtag?.('event', 'page_view', {
      page_location: window.location.href,
      page_path: route.fullPath,
      page_title: document.title,
    })
  }

  watch(() => route.fullPath, () => {
    heartbeat(true)
    googlePageView()
  }, { immediate: true })
  watch(interfaceLocale, () => heartbeat(false))
  const onVisibility = () => heartbeat(false)
  document.addEventListener('visibilitychange', onVisibility)
  timer = window.setInterval(() => heartbeat(false), 45_000)

  return {
    provide: {
      stopAnalyticsHeartbeat: () => {
        if (timer) window.clearInterval(timer)
        document.removeEventListener('visibilitychange', onVisibility)
      },
    },
  }
})

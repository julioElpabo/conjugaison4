import { stripLocaleFromPath } from '~~/shared/i18n/locales'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const config = useRuntimeConfig()
  const { interfaceLocale } = useLanguagePreferences()
  const { consent } = useAnalyticsConsent()
  const measurementId = String(config.public.ga4MeasurementId || '').trim()
  const isSignInPath = (path: string) => {
    const normalized = stripLocaleFromPath(path)
    return normalized === '/signin'
  }
  const googleAvailable = Boolean(measurementId)
    && !['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
  let heartbeatTimer: number | undefined
  let googleLoadTimer: number | undefined
  let googleInitialized = false
  let analyticsStarted = false

  type AnalyticsWindow = Window & {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
  const analyticsWindow = window as unknown as AnalyticsWindow
  const interactionEvents = ['pointerdown', 'keydown'] as const

  function isAdministration() {
    const path = stripLocaleFromPath(route.path)
    return path === '/admin' || path.startsWith('/admin/')
  }

  function removeGoogleLoadTriggers() {
    if (googleLoadTimer) window.clearTimeout(googleLoadTimer)
    googleLoadTimer = undefined
    for (const eventName of interactionEvents) {
      window.removeEventListener(eventName, loadGoogleAnalytics)
    }
  }

  function loadGoogleAnalytics() {
    if (consent.value !== 'accepted' || document.querySelector('script[data-google-analytics]')) return
    removeGoogleLoadTriggers()
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
    script.async = true
    script.dataset.googleAnalytics = 'true'
    document.head.appendChild(script)
  }

  function initializeGoogleAnalytics() {
    if (!googleAvailable || googleInitialized || consent.value !== 'accepted') return
    googleInitialized = true
    analyticsWindow.dataLayer = analyticsWindow.dataLayer || []
    analyticsWindow.gtag = analyticsWindow.gtag || function (..._args: unknown[]) {
      analyticsWindow.dataLayer!.push(arguments)
    }
    analyticsWindow.gtag('js', new Date())
    analyticsWindow.gtag('config', measurementId, {
      send_page_view: false,
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })
    googleLoadTimer = window.setTimeout(loadGoogleAnalytics, 8_000)
    for (const eventName of interactionEvents) {
      window.addEventListener(eventName, loadGoogleAnalytics, { once: true, passive: true })
    }
  }

  function forgetGoogleCookies() {
    removeGoogleLoadTriggers()
    document.querySelector('script[data-google-analytics]')?.remove()
    const cookieNames = document.cookie.split(';')
      .map(cookie => cookie.split('=')[0]?.trim() || '')
      .filter(name => name === '_ga' || name.startsWith('_ga_'))
    const domains = ['', window.location.hostname, '.tatitotu.ch']
    for (const name of cookieNames) {
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ''}`
      }
    }
    analyticsWindow.gtag = undefined
    analyticsWindow.dataLayer = undefined
    googleInitialized = false
  }

  function aggregatePageView() {
    if (isAdministration()) return
    void $fetch('/api/analytics/page-view', {
      method: 'POST',
      body: { path: route.fullPath },
    }).catch(() => {})
  }

  function heartbeat(pageView = false) {
    if (consent.value !== 'accepted' || document.visibilityState !== 'visible' || isAdministration()) return
    void $fetch('/api/analytics/heartbeat', {
      method: 'POST',
      body: { path: route.fullPath, locale: interfaceLocale.value, pageView },
    }).catch(() => {})
  }

  function googlePageView() {
    if (consent.value !== 'accepted' || !googleAvailable || isAdministration() || isSignInPath(route.path)) return
    const pagePath = stripLocaleFromPath(route.path).replace(/^\/defi\/[^/]+$/u, '/defi/:code')
    analyticsWindow.gtag?.('event', 'page_view', {
      page_location: `${window.location.origin}${pagePath}`,
      page_path: pagePath,
      page_title: document.title,
    })
  }

  watch(() => route.fullPath, () => {
    aggregatePageView()
    if (analyticsStarted && consent.value === 'accepted') {
      heartbeat(true)
      googlePageView()
    }
  }, { immediate: true })

  watch(consent, (value, previous) => {
    if (value === 'accepted') {
      initializeGoogleAnalytics()
      if (previous !== 'accepted') {
        analyticsStarted = true
        heartbeat(true)
        googlePageView()
      }
    }
    else if (value === 'refused') {
      analyticsStarted = false
      forgetGoogleCookies()
    }
  }, { immediate: true })

  watch(interfaceLocale, () => heartbeat(false))
  const onVisibility = () => heartbeat(false)
  document.addEventListener('visibilitychange', onVisibility)
  heartbeatTimer = window.setInterval(() => heartbeat(false), 45_000)

  return {
    provide: {
      stopAnalyticsHeartbeat: () => {
        if (heartbeatTimer) window.clearInterval(heartbeatTimer)
        document.removeEventListener('visibilitychange', onVisibility)
        removeGoogleLoadTriggers()
      },
    },
  }
})

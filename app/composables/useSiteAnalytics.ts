import type { AnalyticsEventName } from '~~/shared/types/analytics'
import { stripLocaleFromPath } from '~~/shared/i18n/locales'

export function useSiteAnalytics() {
  const route = useRoute()
  const { interfaceLocale } = useLanguagePreferences()
  const { consent } = useAnalyticsConsent()
  const usedLanguageLocales = useState<string[]>('analytics-used-language-locales', () => [])
  const usedLanguagesStorageKey = 'tatitotu.analytics.used-languages'

  function sendEvent(name: AnalyticsEventName, metadata?: Record<string, string | number | boolean>) {
    if (consent.value !== 'accepted') return
    const observedMetadata = {
      ...(metadata || {}),
      locale: interfaceLocale.value,
      theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
      falc: document.documentElement.dataset.falcMode === 'true',
    }
    void $fetch('/api/analytics/event', {
      method: 'POST',
      body: { name, path: route.fullPath, metadata: observedMetadata },
    }).catch(() => {})
    const gtag = (globalThis as typeof globalThis & { gtag?: (...args: unknown[]) => void }).gtag
    const normalized = stripLocaleFromPath(route.path)
    const isSignIn = normalized === '/signin'
    const isLearnerSpace = normalized === '/my-page'
    const isAdministration = normalized === '/admin' || normalized.startsWith('/admin/')
    if (!isSignIn && !isAdministration) {
      gtag?.('event', name, {
        ...observedMetadata,
        ...(isLearnerSpace ? { user_type: 'learner' } : {}),
      })
    }
  }

  function isMeaningfulLanguageUsage(name: AnalyticsEventName, metadata?: Record<string, string | number | boolean>) {
    if ([
      'challenge_preset_selected', 'challenge_load', 'challenge_save',
      'exercise_started', 'exercise_completed', 'answer_submitted',
      'answer_correct', 'answer_retry', 'help_opened', 'coach_selected',
      'print_opened', 'pdf_downloaded', 'word_downloaded',
      'account_registered', 'account_login',
    ].includes(name)) return true
    return name === 'feature_selected'
      && typeof metadata?.feature === 'string'
      && !['language.change', 'theme.change'].includes(metadata.feature)
  }

  function registerFirstLanguageUsage(locale: string) {
    try {
      const stored = JSON.parse(sessionStorage.getItem(usedLanguagesStorageKey) || '[]')
      const locales = Array.isArray(stored) ? stored.filter(value => typeof value === 'string') : []
      if (locales.includes(locale)) return false
      sessionStorage.setItem(usedLanguagesStorageKey, JSON.stringify([...locales, locale]))
      return true
    }
    catch {
      if (usedLanguageLocales.value.includes(locale)) return false
      usedLanguageLocales.value = [...usedLanguageLocales.value, locale]
      return true
    }
  }

  function track(name: AnalyticsEventName, metadata?: Record<string, string | number | boolean>) {
    if (!import.meta.client) return
    sendEvent(name, metadata)
    const locale = interfaceLocale.value
    if (isMeaningfulLanguageUsage(name, metadata) && registerFirstLanguageUsage(locale)) {
      sendEvent('language_used', {
        locale,
        activity: name,
        ...(typeof metadata?.feature === 'string' ? { feature: metadata.feature } : {}),
      })
    }
  }

  return { track }
}

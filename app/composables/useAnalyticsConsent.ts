import {
  ANALYTICS_CONSENT_ACCEPTED,
  ANALYTICS_CONSENT_COOKIE_NAME,
  ANALYTICS_CONSENT_REFUSED,
} from '~~/shared/data/analytics-consent'

export type AnalyticsConsent = 'accepted' | 'refused' | null

function consentFromCookie(value: string | null | undefined): AnalyticsConsent {
  if (value === ANALYTICS_CONSENT_ACCEPTED) return 'accepted'
  if (value === ANALYTICS_CONSENT_REFUSED) return 'refused'
  return null
}

export function useAnalyticsConsent() {
  const cookie = useCookie<string | null>(ANALYTICS_CONSENT_COOKIE_NAME, {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    secure: import.meta.env.PROD,
  })
  const consent = useState<AnalyticsConsent>('analytics-consent', () => consentFromCookie(cookie.value))
  const preferencesOpen = useState<boolean>('analytics-preferences-open', () => false)

  function choose(value: Exclude<AnalyticsConsent, null>) {
    consent.value = value
    cookie.value = value === 'accepted' ? ANALYTICS_CONSENT_ACCEPTED : ANALYTICS_CONSENT_REFUSED
    preferencesOpen.value = false
  }

  function openPreferences() {
    preferencesOpen.value = true
  }

  return { consent, preferencesOpen, choose, openPreferences }
}

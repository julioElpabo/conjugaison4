import {
  DEFAULT_LANGUAGE_PREFERENCES,
  normalizeLocale,
  type AppLocale,
  type LanguagePreferences,
} from '~~/shared/i18n/locales'
import { translateAppMessage, type AppMessageKey, type MessageParameters } from '~~/shared/i18n/messages'
import { isUiMessage, translateUiMessage, type UiMessage } from '~~/shared/i18n/ui-messages'

export function useLanguagePreferences() {
  const cookieOptions = { maxAge: 60 * 60 * 24 * 365, path: '/', sameSite: 'lax' as const }
  const interfaceCookie = useCookie<string>('interface_locale', { ...cookieOptions, default: () => DEFAULT_LANGUAGE_PREFERENCES.interfaceLocale })
  const explanationCookie = useCookie<string>('explanation_locale', { ...cookieOptions, default: () => DEFAULT_LANGUAGE_PREFERENCES.explanationLocale })
  const interfaceLocale = computed<AppLocale>({
    get: () => normalizeLocale(interfaceCookie.value),
    set: value => { interfaceCookie.value = normalizeLocale(value) },
  })
  const explanationLocale = computed<AppLocale>({
    get: () => normalizeLocale(explanationCookie.value),
    set: value => { explanationCookie.value = normalizeLocale(value) },
  })
  const preferences = computed<LanguagePreferences>(() => ({
    interfaceLocale: interfaceLocale.value,
    explanationLocale: explanationLocale.value,
  }))

  function setInterfaceLocale(locale: AppLocale) {
    interfaceLocale.value = locale
  }

  function setExplanationLocale(locale: AppLocale) {
    explanationLocale.value = locale
  }

  function t(key: AppMessageKey, parameters?: MessageParameters) {
    return translateAppMessage(interfaceLocale.value, key, parameters)
  }

  function ui(message: UiMessage, parameters?: MessageParameters) {
    return translateUiMessage(interfaceLocale.value, message, parameters)
  }

  /** Traduit les libellés grammaticaux issus de l’API et laisse le reste intact. */
  function uiLabel(message?: string | null) {
    if (!message) return ''
    const normalized = message.trim()
    if (isUiMessage(normalized)) return translateUiMessage(interfaceLocale.value, normalized)
    const lower = normalized.toLocaleLowerCase('fr-CH')
    if (!isUiMessage(lower)) return message
    const translated = translateUiMessage(interfaceLocale.value, lower)
    return /^\p{Lu}/u.test(normalized)
      ? translated.charAt(0).toLocaleUpperCase(interfaceLocale.value) + translated.slice(1)
      : translated
  }

  useHead(() => ({ htmlAttrs: { lang: interfaceLocale.value } }))

  return { interfaceLocale, explanationLocale, preferences, setInterfaceLocale, setExplanationLocale, t, ui, uiLabel }
}

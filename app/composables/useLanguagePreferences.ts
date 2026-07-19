import {
  DEFAULT_LANGUAGE_PREFERENCES,
  normalizeLocale,
  type AppLocale,
  type LanguagePreferences,
} from '~~/shared/i18n/locales'
import { translateAppMessage, type AppMessageKey, type MessageParameters } from '~~/shared/i18n/messages'

export function useLanguagePreferences() {
  const interfaceCookie = useCookie<string>('interface_locale', { default: () => DEFAULT_LANGUAGE_PREFERENCES.interfaceLocale, sameSite: 'lax' })
  const explanationCookie = useCookie<string>('explanation_locale', { default: () => DEFAULT_LANGUAGE_PREFERENCES.explanationLocale, sameSite: 'lax' })
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

  useHead(() => ({ htmlAttrs: { lang: interfaceLocale.value } }))

  return { interfaceLocale, explanationLocale, preferences, setInterfaceLocale, setExplanationLocale, t }
}


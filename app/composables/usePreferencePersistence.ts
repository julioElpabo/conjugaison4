const COOKIE_OPTIONS = { maxAge: 60 * 60 * 24 * 365, path: '/', sameSite: 'lax' as const, secure: Boolean(import.meta.env?.PROD) }
const PREFERENCE_COOKIES = ['interface_locale', 'explanation_locale', 'tense_classification']

export function usePreferencePersistence() {
  // Ce cookie conserve le choix de mémorisation, même lorsque les préférences sont effacées.
  const cookie = useCookie<'enabled' | 'disabled'>('tatitotu_remember_preferences', COOKIE_OPTIONS)
  const rememberPreferences = useState('remember-presentation-preferences', () => cookie.value !== 'disabled')
  const theme = useState<string>('color-theme', () => 'light')
  const falcMode = useState<boolean>('falc-mode', () => false)

  function setRememberPreferences(enabled: boolean) {
    cookie.value = enabled ? 'enabled' : 'disabled'
    rememberPreferences.value = enabled
    if (!import.meta.client) return
    if (!enabled) {
      for (const name of PREFERENCE_COOKIES) {
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`
      }
    }
    try {
      if (enabled) {
        localStorage.setItem('conjugaison.theme', theme.value)
        localStorage.setItem('conjugaison.falc-mode', String(falcMode.value))
      } else {
        localStorage.removeItem('conjugaison.theme')
        localStorage.removeItem('conjugaison.falc-mode')
      }
    } catch {
      // Le choix reste applicable lorsque le navigateur bloque le stockage local.
    }
  }

  return { rememberPreferences, setRememberPreferences }
}

/** Conserve le réglage en mémoire lorsque sa sauvegarde dans le navigateur est désactivée. */
export function usePreferenceCookie<T>(name: string, initialValue: T) {
  const { rememberPreferences } = usePreferencePersistence()
  const cookie = useCookie<T | null | undefined>(name, COOKIE_OPTIONS)
  const value = useState<T>(`presentation-preference-${name}`, () => rememberPreferences.value ? cookie.value ?? initialValue : initialValue)
  if (!rememberPreferences.value) cookie.value = null
  watch(value, next => { if (rememberPreferences.value) cookie.value = next }, { flush: 'sync' })
  watch(rememberPreferences, enabled => { cookie.value = enabled ? value.value : null }, { flush: 'sync' })
  return value
}

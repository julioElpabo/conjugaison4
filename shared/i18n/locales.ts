export const SUPPORTED_LOCALES = ['fr', 'de', 'en', 'it', 'es'] as const
export type AppLocale = typeof SUPPORTED_LOCALES[number]

export const DEFAULT_INTERFACE_LOCALE: AppLocale = 'fr'
export const DEFAULT_EXPLANATION_LOCALE: AppLocale = 'fr'

export interface LanguagePreferences {
  /** Langue des boutons, menus et messages de navigation. */
  interfaceLocale: AppLocale
  /** Langue des explications pédagogiques; la langue apprise reste le français. */
  explanationLocale: AppLocale
}

export const DEFAULT_LANGUAGE_PREFERENCES: LanguagePreferences = {
  interfaceLocale: DEFAULT_INTERFACE_LOCALE,
  explanationLocale: DEFAULT_EXPLANATION_LOCALE,
}

export function normalizeLocale(value: unknown, fallback: AppLocale = DEFAULT_INTERFACE_LOCALE): AppLocale {
  if (typeof value !== 'string') return fallback
  const language = value.trim().toLocaleLowerCase().split(/[-_]/u)[0]
  return SUPPORTED_LOCALES.includes(language as AppLocale) ? language as AppLocale : fallback
}

export function localeFallbacks(locale: AppLocale): AppLocale[] {
  return locale === 'fr' ? ['fr'] : [locale, 'fr']
}

const LOCALE_PATH_PATTERN = /^\/(fr|de|en|it|es)(?=\/|$)/u

export function localeFromPath(path: string): AppLocale | null {
  const match = path.match(LOCALE_PATH_PATTERN)
  return match?.[1] ? normalizeLocale(match[1]) : null
}

export function stripLocaleFromPath(path: string): string {
  const stripped = path.replace(LOCALE_PATH_PATTERN, '')
  return stripped || '/'
}

export function localizePath(path: string, locale: AppLocale): string {
  const absolutePath = path.startsWith('/') ? path : `/${path}`
  const unlocalizedPath = stripLocaleFromPath(absolutePath)
  return unlocalizedPath === '/' ? `/${locale}/` : `/${locale}${unlocalizedPath}`
}

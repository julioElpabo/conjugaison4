export const SUPPORTED_LOCALES = ['fr', 'de', 'en', 'it', 'es', 'nl', 'nl-NL'] as const
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
  const tag = value.trim().toLowerCase().replace('_', '-')
  if (tag === 'nl-nl') return 'nl-NL'
  const language = tag.split('-')[0]
  return SUPPORTED_LOCALES.includes(language as AppLocale) ? language as AppLocale : fallback
}

export function localeFallbacks(locale: AppLocale): AppLocale[] {
  return locale === 'fr' ? ['fr'] : locale === 'nl-NL' ? ['nl-NL', 'nl', 'fr'] : [locale, 'fr']
}

const LOCALE_PATH_PATTERN = /^\/(fr|de|en|it|es|nl-NL|nl)(?=\/|$)/u

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

/** Le code historique nl conserve les liens et préférences des utilisateurs belges. */
export function localeLanguageTag(locale: AppLocale): string {
  return locale === 'nl' ? 'nl-BE' : locale
}

import { SUPPORTED_LOCALES } from '../i18n/locales'

const LOCALE_PATTERN = SUPPORTED_LOCALES.join('|')
const LOCALIZED_LEGACY_HOME = new RegExp(`^/(${LOCALE_PATTERN})/accueil/?$`, 'u')
const LOCALIZED_MODE_PATH = new RegExp(`^/(${LOCALE_PATTERN})/modes(?:/([^/]+)(?:/([^/]+))?)?$`, 'u')

function withoutTrailingSlash(path: string) {
  return path.length > 1 ? path.replace(/\/+$/u, '') : path
}

/**
 * Maps the former French URLs to their final localized destination.
 * These URLs predate the multilingual structure and must remain permanent
 * redirects so search engines and external links transfer their signals.
 */
export function permanentLegacyRedirect(path: string) {
  const localizedHome = path.match(LOCALIZED_LEGACY_HOME)
  if (localizedHome) return `/${localizedHome[1]}/`

  const normalizedPath = withoutTrailingSlash(path)

  const localizedModePath = normalizedPath.match(LOCALIZED_MODE_PATH)
  if (localizedModePath) {
    const [, locale, mode, tense] = localizedModePath
    return mode && tense ? `/${locale}/${mode}/${tense}` : `/${locale}/apprendre`
  }

  if (normalizedPath === '/' || normalizedPath === '/accueil') return '/fr/'
  if (normalizedPath === '/exercices') return '/fr/apprendre'
  if (normalizedPath === '/modes') return '/fr/apprendre'
  if (['/apprendre', '/consulter'].includes(normalizedPath)) {
    return `/fr${normalizedPath}`
  }

  const formerExerciseJourney = normalizedPath.match(/^\/exercices\/([^/]+)$/u)
  if (formerExerciseJourney) {
    return `/fr/indicatif/${formerExerciseJourney[1]}`
  }

  const modePath = normalizedPath.match(/^\/modes\/([^/]+)(?:\/([^/]+))?$/u)
  if (modePath) {
    const [, mode, tense] = modePath
    return tense ? `/fr/${mode}/${tense}` : '/fr/apprendre'
  }

  return null
}

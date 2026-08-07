import { SUPPORTED_LOCALES } from '../i18n/locales'

const LOCALE_PATTERN = SUPPORTED_LOCALES.join('|')
const LOCALIZED_LEGACY_HOME = new RegExp(`^/(${LOCALE_PATTERN})/accueil/?$`, 'u')

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

  if (normalizedPath === '/' || normalizedPath === '/accueil') return '/fr/'
  if (['/apprendre', '/consulter', '/exercices'].includes(normalizedPath)) {
    return `/fr${normalizedPath}`
  }

  const formerExerciseJourney = normalizedPath.match(/^\/exercices\/([^/]+)$/u)
  if (formerExerciseJourney) {
    return `/fr/modes/indicatif/${formerExerciseJourney[1]}`
  }

  if (/^\/modes\/[^/]+(?:\/[^/]+)?$/u.test(normalizedPath)) {
    return `/fr${normalizedPath}`
  }

  return null
}

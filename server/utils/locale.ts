import type { H3Event } from 'h3'
import { getCookie, getHeader, getQuery } from 'h3'
import { normalizeLocale, type AppLocale } from '../../shared/i18n/locales'

function requestedLocale(event: H3Event, queryKey: string, cookieKey: string): AppLocale {
  const query = getQuery(event)[queryKey]
  const cookie = getCookie(event, cookieKey)
  const header = getHeader(event, 'accept-language')?.split(',')[0]
  return normalizeLocale(query || cookie || header || 'fr')
}

export function interfaceLocaleForEvent(event: H3Event): AppLocale {
  return requestedLocale(event, 'interfaceLocale', 'interface_locale')
}

export function explanationLocaleForEvent(event: H3Event): AppLocale {
  return requestedLocale(event, 'explanationLocale', 'explanation_locale')
}


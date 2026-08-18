import type { AppLocale } from '../i18n/locales'

export interface PageSeoAlternate {
  locale: AppLocale
  path: string
}

export interface PageSeoOverride {
  canonicalPath: string
  alternates: PageSeoAlternate[]
  xDefaultPath?: string
  robots?: 'index, follow' | 'noindex, follow' | 'noindex, nofollow'
}

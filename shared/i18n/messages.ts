import type { AppLocale } from './locales'

export type MessageParameters = Record<string, string | number>

const frenchMessages = {
  'language.interface': 'Langue de l’interface',
  'language.explanations': 'Langue des explications',
  'language.french': 'Français',
  'language.german': 'Allemand',
  'language.english': 'Anglais',
  'language.italian': 'Italien',
  'language.spanish': 'Espagnol',
  'common.close': 'Fermer',
  'common.loading': 'Chargement…',
  'common.save': 'Enregistrer',
  'common.cancel': 'Annuler',
} as const

export type AppMessageKey = keyof typeof frenchMessages
type MessageCatalogue = Partial<Record<AppMessageKey, string>>

/** Les catalogues non français seront remplis progressivement sans changer les clés du code. */
export const appMessages: Record<AppLocale, MessageCatalogue> = {
  fr: frenchMessages,
  de: {},
  en: {},
  it: {},
  es: {},
}

export function translateAppMessage(locale: AppLocale, key: AppMessageKey, parameters: MessageParameters = {}): string {
  const template = appMessages[locale][key] || frenchMessages[key] || key
  return template.replace(/\{([a-zA-Z0-9_]+)\}/gu, (_match, name: string) => String(parameters[name] ?? `{${name}}`))
}


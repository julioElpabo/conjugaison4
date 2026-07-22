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

export const appMessages: Record<AppLocale, MessageCatalogue> = {
  fr: frenchMessages,
  de: {
    'language.interface': 'Sprache der Benutzeroberfläche',
    'language.explanations': 'Sprache der Erklärungen',
    'language.french': 'Französisch',
    'language.german': 'Deutsch',
    'language.english': 'Englisch',
    'language.italian': 'Italienisch',
    'language.spanish': 'Spanisch',
    'common.close': 'Schließen',
    'common.loading': 'Wird geladen…',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
  },
  en: {
    'language.interface': 'Interface language',
    'language.explanations': 'Explanation language',
    'language.french': 'French',
    'language.german': 'German',
    'language.english': 'English',
    'language.italian': 'Italian',
    'language.spanish': 'Spanish',
    'common.close': 'Close',
    'common.loading': 'Loading…',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
  },
  it: {
    'language.interface': 'Lingua dell’interfaccia',
    'language.explanations': 'Lingua delle spiegazioni',
    'language.french': 'Francese',
    'language.german': 'Tedesco',
    'language.english': 'Inglese',
    'language.italian': 'Italiano',
    'language.spanish': 'Spagnolo',
    'common.close': 'Chiudi',
    'common.loading': 'Caricamento…',
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
  },
  es: {
    'language.interface': 'Idioma de la interfaz',
    'language.explanations': 'Idioma de las explicaciones',
    'language.french': 'Francés',
    'language.german': 'Alemán',
    'language.english': 'Inglés',
    'language.italian': 'Italiano',
    'language.spanish': 'Español',
    'common.close': 'Cerrar',
    'common.loading': 'Cargando…',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
  },
}

export function translateAppMessage(locale: AppLocale, key: AppMessageKey, parameters: MessageParameters = {}): string {
  const template = appMessages[locale][key] || frenchMessages[key] || key
  return template.replace(/\{([a-zA-Z0-9_]+)\}/gu, (_match, name: string) => String(parameters[name] ?? `{${name}}`))
}

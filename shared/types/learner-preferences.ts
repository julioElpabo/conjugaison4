import type { AppLocale } from '../i18n/locales'

export type TenseClassification = 'traditional' | 'modern'

export interface LearnerPreferences {
  interfaceLocale: AppLocale
  colorTheme: 'light' | 'dark'
  tenseClassification: TenseClassification
}

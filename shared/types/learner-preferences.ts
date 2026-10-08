export type TenseClassification = 'traditional' | 'modern'

export interface LearnerPreferences {
  interfaceLocale: string
  colorTheme: 'light' | 'dark'
  tenseClassification: TenseClassification
}

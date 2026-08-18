import type { AppLocale } from '../i18n/locales'
import type { ChallengePreset } from './conjugation'

export interface ChallengePublicationSummary {
  id: number
  presetId: number
  presetKey: string
  locale: AppLocale
  slug: string
  title: string
  description: string
  categorySlug: string
  categoryName: string
}

export interface ChallengePublicationPage extends ChallengePublicationSummary {
  metaTitle: string
  metaDescription: string
  isIndexable: boolean
  updatedAt: string
  translations: ChallengePublicationAlternate[]
  preset: ChallengePreset
}

export interface AdminChallengePublication {
  id: number
  presetId: number
  locale: AppLocale
  slug: string
  title: string
  metaTitle: string
  description: string
  metaDescription: string
  isPublished: boolean
  isIndexable: boolean
  createdAt: string
  updatedAt: string
}

export interface ChallengePublicationInput {
  slug: string | null
  title: string
  metaTitle: string
  description: string
  metaDescription: string
  isPublished: boolean
  isIndexable: boolean
}

export interface ChallengePublicationAlternate {
  locale: AppLocale
  path: string
}

export type ChallengePublicationResolution =
  | { kind: 'publication', publication: ChallengePublicationPage }
  | { kind: 'redirect', locale: AppLocale, slug: string }

export interface ChallengePublicationDeploymentEntry extends ChallengePublicationInput {
  presetKey: string
  locale: AppLocale
  overwriteExisting: boolean
}

export interface ChallengePublicationDeploymentBatch {
  schemaVersion: 1
  batchId: string | null
  publications: ChallengePublicationDeploymentEntry[]
}

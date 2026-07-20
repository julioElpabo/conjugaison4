/**
 * Only reviews produced by the model-backed campaign may use this version.
 * Bumping it also hides the former rule-based rows that were unfortunately
 * persisted under the old `semantic-ai-review-v1` name.
 */
export const COACH_HELP_REVIEW_VERSION = 'semantic-ai-review-v2'

export const COACH_HELP_AUTOMATIC_AUDIT_VERSION = 'automatic-semantic-audit-v1'

export type CoachHelpVerbReviewStatus = 'approved' | 'rejected'

export interface CoachHelpReviewLayers {
  models: { complete: boolean, checked: number }
  irregular: { complete: boolean, checked: number }
  suspicious: { complete: boolean, checked: number }
  sample: { complete: boolean, checked: number, keys?: string[] }
}

import { challengePresetGroupLabels } from '../data/challenge-presets'
import type { ChallengePreset } from '../types/conjugation'

export function challengePresetTrackingTitle(preset: ChallengePreset): string {
  const groupLabel = preset.groupLabel
    || challengePresetGroupLabels[preset.group]
    || preset.group
  return [groupLabel, preset.label].filter(Boolean).join(' | ')
}

export function challengePresetTrackingDescription(randomCount?: number | null): string {
  return Number.isInteger(randomCount) && Number(randomCount) > 0
    ? `${Number(randomCount)} au hasard`
    : 'Tous les verbes'
}

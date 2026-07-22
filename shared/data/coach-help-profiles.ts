import { COACH_HELP_ENGINE_KEYS, type CoachExplanationApproach, type CoachHelpEngineKey } from '../types/coach'

export type CoachAutomaticHelpBlockId =
  | 'definition'
  | 'complete-with-answers'
  | 'complete-advice'
  | 'condensed-verb-group'
  | 'condensed-tense-rule'

export type CoachConditionalHelpBlockId = 'orthography' | 'cod-before' | 'participle-agreement'

export interface CoachHelpProfile {
  id: CoachHelpEngineKey
  label: string
  description: string
  blocks: readonly CoachAutomaticHelpBlockId[]
  revealsAnswers: boolean
  highlightsTarget: boolean
  conditionalBlocks: readonly CoachConditionalHelpBlockId[]
  legacyPresentation: CoachExplanationApproach
}

export const COACH_HELP_PROFILES: Record<CoachHelpEngineKey, CoachHelpProfile> = {
  'complete-avec-reponses': {
    id: 'complete-avec-reponses',
    label: 'Complète avec réponses',
    description: 'Explication détaillée avec réponses et surlignages.',
    blocks: ['definition', 'complete-with-answers'],
    revealsAnswers: true,
    highlightsTarget: true,
    conditionalBlocks: ['orthography'],
    legacyPresentation: 'cif-falc',
  },
  complete: {
    id: 'complete',
    label: 'Complète sans réponses',
    description: 'Explication détaillée et conseils, sans révéler la réponse.',
    blocks: ['definition', 'complete-advice'],
    revealsAnswers: false,
    highlightsTarget: false,
    conditionalBlocks: ['orthography', 'cod-before'],
    legacyPresentation: 'cif-falc',
  },
  'tres-condensee': {
    id: 'tres-condensee',
    label: 'Très condensée',
    description: 'Un rappel du groupe et une règle courte adaptée au mode et au temps.',
    blocks: ['definition', 'condensed-verb-group', 'condensed-tense-rule'],
    revealsAnswers: false,
    highlightsTarget: false,
    conditionalBlocks: ['participle-agreement'],
    legacyPresentation: 'concise',
  },
  allophone: {
    id: 'allophone',
    label: 'Allophone',
    description: 'Pour l’instant identique à l’aide complète avec réponses.',
    blocks: ['definition', 'complete-with-answers'],
    revealsAnswers: true,
    highlightsTarget: true,
    conditionalBlocks: ['orthography'],
    legacyPresentation: 'cif-falc',
  },
}

const LEGACY_ENGINE_KEYS: Record<string, CoachHelpEngineKey> = {
  'cif-falc': 'complete-avec-reponses',
  concise: 'tres-condensee',
  'grammatical-technical': 'complete',
  'guided-discovery': 'allophone',
}

export function normalizeCoachHelpEngineKey(value: unknown): CoachHelpEngineKey {
  if (typeof value === 'string' && COACH_HELP_ENGINE_KEYS.includes(value as CoachHelpEngineKey)) return value as CoachHelpEngineKey
  if (typeof value === 'string' && LEGACY_ENGINE_KEYS[value]) return LEGACY_ENGINE_KEYS[value]
  return 'complete-avec-reponses'
}

export function coachHelpProfile(value: unknown): CoachHelpProfile {
  return COACH_HELP_PROFILES[normalizeCoachHelpEngineKey(value)]
}

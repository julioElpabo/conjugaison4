import type { ComplementOption, ComplementPlacement, ExerciseKind, IdentificationSource, LiteraryRegister, PastSimplePronouns, VoiceMode } from '../types/conjugation'
import { DEFAULT_COMPLEMENT_OPTIONS } from './complement-options'

export const DEFAULT_SHARED_CHALLENGE_OPTIONS: {
  exerciseKind: ExerciseKind
  identificationSource: IdentificationSource
  literaryRegister: LiteraryRegister
  pastSimplePronouns: PastSimplePronouns
  inclusivePronouns: boolean
  includeOnPronoun: boolean
  voiceMode: VoiceMode
  includeComplements: boolean
  complementPlacement: ComplementPlacement
  complementOptions: ComplementOption[]
} = {
  exerciseKind: 'conjugation',
  identificationSource: 'selected-verbs',
  literaryRegister: 'all',
  pastSimplePronouns: 'all',
  inclusivePronouns: false,
  includeOnPronoun: false,
  voiceMode: 'active',
  includeComplements: true,
  complementPlacement: 'after',
  complementOptions: [...DEFAULT_COMPLEMENT_OPTIONS],
}

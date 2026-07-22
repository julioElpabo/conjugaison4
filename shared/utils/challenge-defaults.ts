import type { ComplementOption, ComplementPlacement, ExerciseKind, PastSimplePronouns } from '../types/conjugation'
import { DEFAULT_COMPLEMENT_OPTIONS } from './complement-options'

export const DEFAULT_SHARED_CHALLENGE_OPTIONS: {
  exerciseKind: ExerciseKind
  pastSimplePronouns: PastSimplePronouns
  inclusivePronouns: boolean
  includeComplements: boolean
  complementPlacement: ComplementPlacement
  complementOptions: ComplementOption[]
} = {
  exerciseKind: 'conjugation',
  pastSimplePronouns: 'all',
  inclusivePronouns: false,
  includeComplements: true,
  complementPlacement: 'after',
  complementOptions: [...DEFAULT_COMPLEMENT_OPTIONS],
}

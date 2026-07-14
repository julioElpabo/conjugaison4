import type { ClassicComplementChoice, ComplementPlacement } from '../types/conjugation'

export function classicComplementChoiceConfig(choice: ClassicComplementChoice): {
  includeComplements: boolean
  complementPlacement: ComplementPlacement
} {
  return {
    includeComplements: choice !== 'none',
    complementPlacement: choice === 'none' ? 'after' : choice,
  }
}

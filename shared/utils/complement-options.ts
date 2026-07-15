import type { ComplementOption, ComplementPlacement } from '../types/conjugation'

export const DEFAULT_COMPLEMENT_OPTIONS: ComplementOption[] = ['cod-after', 'coi-after']
export const COMPLEMENT_OPTIONS: ComplementOption[] = ['cod-after', 'cod-before', 'coi-after', 'coi-before']

export function normalizeComplementOptions(value: unknown): ComplementOption[] {
  if (!Array.isArray(value)) return []
  return COMPLEMENT_OPTIONS.filter(option => value.includes(option))
}

export function legacyComplementOptions(includeComplements: boolean, placement: ComplementPlacement): ComplementOption[] {
  if (!includeComplements) return []
  if (placement === 'before') return ['cod-before']
  if (placement === 'mixed') return ['cod-after', 'cod-before', 'coi-after']
  return [...DEFAULT_COMPLEMENT_OPTIONS]
}

export function legacyComplementConfig(options: readonly ComplementOption[]) {
  const hasBefore = options.some(option => option.endsWith('-before'))
  const hasAfter = options.some(option => option.endsWith('-after'))
  return {
    includeComplements: options.length > 0,
    complementPlacement: (hasBefore && hasAfter ? 'mixed' : hasBefore ? 'before' : 'after') as ComplementPlacement,
  }
}

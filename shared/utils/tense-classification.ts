import type { ConjugationMode, ConjugationTense } from '../types/conjugation'
import type { TenseClassification } from '../types/learner-preferences'

export const MERGED_TENSE_INFORMATION = 'Aussi appelé conditionnel passé deuxième forme dans la classification traditionnelle.'

export interface ClassifiedTense extends ConjugationTense {
  selectionIds: number[]
  information?: typeof MERGED_TENSE_INFORMATION
}

const normalized = (name: string) => name.trim().toLocaleLowerCase('fr-CH')

/** Change la présentation sans modifier les identifiants des défis existants. */
export function classifyTenses(
  modes: readonly ConjugationMode[],
  tenses: readonly ConjugationTense[],
  classification: TenseClassification,
): ClassifiedTense[] {
  const entries = tenses.map(tense => ({ ...tense, selectionIds: [tense.id] }))
  if (classification === 'traditional') return entries

  const modeId = (name: string) => modes.find(mode => normalized(mode.name) === name)?.id
  const conditionalId = modeId('conditionnel')
  const indicativeId = modeId('indicatif')
  const subjunctiveId = modeId('subjonctif')
  const secondPast = tenses.find(tense => tense.modeId === conditionalId && normalized(tense.name) === 'passé 2')
  const pluperfect = tenses.find(tense => tense.modeId === subjunctiveId && normalized(tense.name) === 'plus-que-parfait')

  return entries.flatMap((tense): ClassifiedTense[] => {
    if (tense.id === pluperfect?.id) {
      return [{ ...tense, selectionIds: secondPast ? [tense.id, secondPast.id] : [tense.id], information: MERGED_TENSE_INFORMATION }]
    }
    if (tense.modeId !== conditionalId) return [tense]
    if (normalized(tense.name) === 'passé 2' && pluperfect) return []
    if (indicativeId !== undefined && normalized(tense.name) === 'présent') {
      return [{ ...tense, modeId: indicativeId, name: 'conditionnel présent' }]
    }
    if (indicativeId !== undefined && normalized(tense.name) === 'passé 1') {
      return [{ ...tense, modeId: indicativeId, name: 'conditionnel passé' }]
    }
    return [tense]
  })
}

export function isClassifiedTenseSelected(tense: ClassifiedTense, selectedIds: ReadonlySet<number>) {
  return tense.selectionIds.some(id => selectedIds.has(id))
}

/** Décocher l’entrée fusionnée décoche ses deux sources ; la cocher choisit le subjonctif. */
export function classifiedTenseToggleIds(tense: ClassifiedTense, selectedIds: ReadonlySet<number>) {
  const selected = tense.selectionIds.filter(id => selectedIds.has(id))
  return selected.length ? selected : [tense.id]
}

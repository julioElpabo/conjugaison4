import type { ConjugationSourceRow } from './question-formatter'

export interface CompoundAuxiliaryForm {
  personne_id: number
  mode_name: string
  temps_name: string
  conjugaison1: string
}

const compoundAuxiliaryTense: Record<string, [string, string]> = {
  'indicatif:passé composé': ['indicatif', 'présent'],
  'indicatif:plus-que-parfait': ['indicatif', 'imparfait'],
  'indicatif:passé antérieur': ['indicatif', 'passé simple'],
  'indicatif:futur antérieur': ['indicatif', 'futur'],
  'subjonctif:passé': ['subjonctif', 'présent'],
  'subjonctif:plus-que-parfait': ['subjonctif', 'imparfait'],
  'conditionnel:passé 1': ['conditionnel', 'présent'],
  'conditionnel:passé 2': ['subjonctif', 'imparfait'],
  'impératif:passé': ['impératif', 'présent'],
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase('fr').normalize('NFC')
}

export function findCompoundAuxiliaryForm(
  row: Pick<ConjugationSourceRow, 'personne_id' | 'mode_name' | 'temps_name'>,
  auxiliaryForms: readonly CompoundAuxiliaryForm[],
) {
  const target = compoundAuxiliaryTense[`${normalized(row.mode_name)}:${normalized(row.temps_name)}`]
  if (!target) return null
  return auxiliaryForms.find(form => (
    Number(form.personne_id) === Number(row.personne_id)
    && normalized(form.mode_name) === target[0]
    && normalized(form.temps_name) === target[1]
  )) ?? null
}

function participleForPerson(participle: string, personId: number) {
  const form = participle.trim()
  if (![7, 8, 9].includes(Number(personId)) || /[sx]$/u.test(form)) return form
  return `${form}s`
}

export function useEtreForIntransitiveCompound<T extends ConjugationSourceRow>(
  row: T,
  auxiliaryForms: readonly CompoundAuxiliaryForm[],
): T {
  if (!Number(row.is_compound)) return row
  const auxiliary = findCompoundAuxiliaryForm(row, auxiliaryForms)
  if (!auxiliary?.conjugaison1?.trim()) {
    throw new Error(`Forme de l’auxiliaire être introuvable pour ${row.mode_name} · ${row.temps_name} · personne ${row.personne_id}.`)
  }
  const conjugaison1 = `${auxiliary.conjugaison1.trim()} ${participleForPerson(row.participe_passe, row.personne_id)}`
  const nousAuxiliary = findCompoundAuxiliaryForm({ ...row, personne_id: 7 }, auxiliaryForms)
  const nousForm = nousAuxiliary?.conjugaison1?.trim()
    ? `${nousAuxiliary.conjugaison1.trim()} ${participleForPerson(row.participe_passe, 7)}`
    : row.nous_form
  return {
    ...row,
    auxiliaire: 'être',
    conjugaison1,
    conjugaison2: '',
    conjugaison3: '',
    nous_form: nousForm,
  }
}

export function resolveVariableAuxiliary<T extends ConjugationSourceRow>(
  row: T,
  auxiliaryForms: readonly CompoundAuxiliaryForm[],
): T {
  if (
    normalized(row.infinitif) === 'sortir'
    && Number(row.is_compound)
    && row.complement_function !== 'cod'
  ) {
    return useEtreForIntransitiveCompound(row, auxiliaryForms)
  }
  return row
}

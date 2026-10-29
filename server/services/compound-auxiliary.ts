import type { ConjugationSourceRow } from './question-formatter'
import { AUXILIARY_SIMPLE_TENSES, compoundSimpleTense } from '../../shared/utils/compound-auxiliaries'
import { hasVariableAuxiliary, prefersEtreWithoutComplement } from '../../shared/utils/variable-auxiliary'

export interface CompoundAuxiliaryForm {
  personne_id: number
  mode_name: string
  temps_name: string
  conjugaison1: string
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase('fr').normalize('NFC')
}

export function findCompoundAuxiliaryForm(
  row: Pick<ConjugationSourceRow, 'personne_id' | 'mode_name' | 'temps_name'>,
  auxiliaryForms: readonly CompoundAuxiliaryForm[],
) {
  const target = compoundSimpleTense(row.mode_name, row.temps_name)
  if (!target) return null
  return auxiliaryForms.find(form => (
    Number(form.personne_id) === Number(row.personne_id)
    && normalized(form.mode_name) === target.mode
    && normalized(form.temps_name) === target.tense
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
    hasVariableAuxiliary(row.infinitif)
    && normalized(row.infinitif) !== 'demeurer'
    && Number(row.is_compound)
    && Boolean(row.complement_phrase || row.complement_anteposed)
    && row.complement_function !== 'cod'
  ) {
    return useEtreForIntransitiveCompound(row, auxiliaryForms)
  }
  return row
}

/** Construit chaque auxiliaire séparément pour appliquer ensuite son accord. */
export function variableAuxiliaryRows(row: ConjugationSourceRow): ConjugationSourceRow[] {
  if (!Number(row.is_compound) || !hasVariableAuxiliary(row.infinitif)) return [row]
  const target = compoundSimpleTense(row.mode_name, row.temps_name)
  const paradigm = target && AUXILIARY_SIMPLE_TENSES.find(item => (
    normalized(item.mode) === normalized(target.mode) && normalized(item.tense) === normalized(target.tense)
  ))
  if (!paradigm) return [row]
  const person = normalized(row.mode_name) === 'impératif'
    ? [5, 7, 8].indexOf(Number(row.personne_id))
    : Number(row.personne_id) - 4
  const contextual = Boolean(row.complement_phrase || row.complement_anteposed)
  const auxiliaries: Array<'avoir' | 'être'> = contextual
    ? row.complement_function === 'cod' ? ['avoir'] : []
    : prefersEtreWithoutComplement(row.infinitif) || normalized(row.auxiliaire) === 'être' ? ['être', 'avoir'] : ['avoir', 'être']
  if (!auxiliaries.length) return [row]
  return auxiliaries.map(auxiliary => {
    const form = paradigm.forms[auxiliary][person]
    if (!form) throw new Error(`Auxiliaire introuvable pour ${row.mode_name} · ${row.temps_name} · personne ${row.personne_id}.`)
    const participle = auxiliary === 'être'
      ? participleForPerson(row.participe_passe, row.personne_id)
      : row.participe_passe.trim()
    return {
      ...row,
      auxiliaire: auxiliary,
      conjugaison1: `${form} ${participle}`,
      conjugaison2: '',
      conjugaison3: '',
      nous_form: `${paradigm.forms[auxiliary][normalized(row.mode_name) === 'impératif' ? 1 : 3]} ${auxiliary === 'être' ? participleForPerson(row.participe_passe, 7) : row.participe_passe.trim()}`,
    }
  })
}

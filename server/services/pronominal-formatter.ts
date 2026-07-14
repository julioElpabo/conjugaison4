import type { ConjugationSourceRow } from './question-formatter'
import type { RowDataPacket } from 'mysql2/promise'

export interface PronominalSourceRow extends RowDataPacket, ConjugationSourceRow {
  pronominal_use_id: number
  infinitif_pronominal: string
  type_h_initial: string | null
  regle_accord: string
  base_conjugaison1: string
  base_conjugaison2: string
  base_conjugaison3: string
  personnes_autorisees?: string | number[] | null
}

interface AuxiliaryForm {
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

function elidesBefore(form: string, hType: string | null) {
  const normalizedForm = normalized(form)
  const first = normalizedForm.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0)
  if ('aeiouy'.includes(first)) return true
  return first === 'h' && hType !== 'aspire'
}

function proclitic(personId: number, form: string, hType: string | null) {
  const elided = elidesBefore(form, hType)
  if (personId === 4) return elided ? "m'" : 'me '
  if (personId === 5) return elided ? "t'" : 'te '
  if (personId === 7) return 'nous '
  if (personId === 8) return 'vous '
  return elided ? "s'" : 'se '
}

function pronominalizeSimple(form: string, personId: number, mode: string, hType: string | null) {
  if (!form.trim()) return ''
  if (normalized(mode) === 'impératif') {
    const suffix = personId === 5 ? 'toi' : personId === 7 ? 'nous' : 'vous'
    return `${form.trim()}-${suffix}`
  }
  return `${proclitic(personId, form, hType)}${form.trim()}`
}

function participleForPerson(participle: string, personId: number, agreementRule: string) {
  const form = participle.trim()
  if (agreementRule === 'invariable' || ![7, 8, 9].includes(Number(personId)) || /[sx]$/u.test(form)) {
    return form
  }
  return `${form}s`
}

export function generatePronominalRow(row: PronominalSourceRow, auxiliaryForms: readonly AuxiliaryForm[]): ConjugationSourceRow {
  const forms = [row.base_conjugaison1, row.base_conjugaison2, row.base_conjugaison3]
  let generated: string[]

  if (Number(row.is_compound)) {
    const target = compoundAuxiliaryTense[`${normalized(row.mode_name)}:${normalized(row.temps_name)}`]
    const auxiliary = target && auxiliaryForms.find(form => (
      Number(form.personne_id) === Number(row.personne_id)
      && normalized(form.mode_name) === target[0]
      && normalized(form.temps_name) === target[1]
    ))
    const auxiliaryForm = auxiliary?.conjugaison1?.trim() ?? ''
    if (!auxiliaryForm) {
      generated = []
    } else if (normalized(row.mode_name) === 'impératif') {
      const suffix = Number(row.personne_id) === 5 ? 'toi' : Number(row.personne_id) === 7 ? 'nous' : 'vous'
      generated = [`${auxiliaryForm}-${suffix} ${participleForPerson(row.participe_passe, row.personne_id, row.regle_accord)}`]
    } else {
      generated = [`${proclitic(row.personne_id, auxiliaryForm, null)}${auxiliaryForm} ${participleForPerson(row.participe_passe, row.personne_id, row.regle_accord)}`]
    }
  } else {
    generated = forms.map(form => pronominalizeSimple(form, row.personne_id, row.mode_name, row.type_h_initial))
  }

  return {
    ...row,
    id: -(Number(row.pronominal_use_id) * 100000 + Number(row.id)),
    verbe_id: -Number(row.pronominal_use_id),
    infinitif: row.infinitif_pronominal,
    auxiliaire: Number(row.is_compound) ? 'être' : row.auxiliaire,
    conjugaison1: generated[0] ?? '',
    conjugaison2: generated[1] ?? '',
    conjugaison3: generated[2] ?? '',
    agreement_rule: row.regle_accord,
  }
}

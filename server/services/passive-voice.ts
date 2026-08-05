import type { ExerciseQuestion } from '../types/public-api'

export interface PassiveSourceRow {
  id: number
  verbe_id: number
  personne_id: number
  temp_id: number
  conjugaison1: string
  infinitif: string
  participe_passe: string
  temps_name: string
  tense_code?: ExerciseQuestion['tenseCode']
  is_compound: number
  mode_name: string
  mode_code?: ExerciseQuestion['modeCode']
}

export interface PassiveComplement {
  id: number
  texte_antepose: string | null
  genre: string | null
  nombre: string | null
}

export interface PassiveAuxiliaryForm {
  personne_id: number
  mode_name: string
  temps_name: string
  conjugaison1: string
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase('fr-CH')
}

function unique(values: string[]) {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))]
}

function capitalize(value: string) {
  return value ? value.charAt(0).toLocaleUpperCase('fr-CH') + value.slice(1) : value
}

function startsWithVowel(value: string) {
  const first = value.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLowerCase()
  return 'aeiouy'.includes(first)
}

function subjunctiveSubject(subject: string) {
  return startsWithVowel(subject) ? `qu'${subject}` : `que ${subject}`
}

export function agreePassiveParticiple(participle: string, gender: string | null, number: string | null) {
  let result = participle.trim()
  if (!result) return ''
  if (normalized(gender || '') === 'feminin') {
    const exceptions: Record<string, string> = {
      absous: 'absoute', dissous: 'dissoute', dû: 'due', mû: 'mue', crû: 'crue',
    }
    result = exceptions[result] ?? (result.endsWith('e') ? result : `${result}e`)
  }
  if (normalized(number || '') === 'pluriel' && !/[sx]$/u.test(result)) result += 's'
  return result
}

export function passiveAuxiliaryForm(
  row: PassiveSourceRow,
  auxiliaryForms: readonly PassiveAuxiliaryForm[],
) {
  if (row.tense_code === 'near-future' || normalized(row.temps_name) === 'futur proche') {
    const active = row.conjugaison1.trim()
    return active.endsWith(row.infinitif)
      ? `${active.slice(0, -row.infinitif.length)}être`.trim()
      : null
  }
  return auxiliaryForms.find(form => (
    Number(form.personne_id) === Number(row.personne_id)
    && normalized(form.mode_name) === normalized(row.mode_name)
    && normalized(form.temps_name) === normalized(row.temps_name)
  ))?.conjugaison1.trim() || null
}

export function formatPassiveQuestion(
  row: PassiveSourceRow,
  complement: PassiveComplement,
  auxiliaryForms: readonly PassiveAuxiliaryForm[],
): ExerciseQuestion | null {
  const subject = complement.texte_antepose?.trim() || ''
  const auxiliary = passiveAuxiliaryForm(row, auxiliaryForms)
  const participle = agreePassiveParticiple(row.participe_passe, complement.genre, complement.nombre)
  if (!subject || !auxiliary || !participle) return null

  const agent = 'par quelqu’un'
  const verbPhrase = `${auxiliary} ${participle}`
  const subjunctive = normalized(row.mode_name) === 'subjonctif'
  const subjectPrefix = subjunctive ? subjunctiveSubject(subject) : subject
  const fullWithoutAgent = `${subjectPrefix} ${verbPhrase}`
  const fullWithAgent = `${fullWithoutAgent} ${agent}`
  const displayedSentence = `${capitalize(fullWithAgent)}.`

  return {
    id: `p-${row.id}-${complement.id}`,
    verbeId: Number(row.verbe_id),
    tenseId: Number(row.temp_id),
    personId: Number(row.personne_id),
    titre: row.infinitif,
    instruction: 'Conjugue le verbe à la voix passive.',
    consigne: `${capitalize(subjectPrefix)} … ${agent} | ${row.infinitif} | ${row.temps_name} (${row.mode_name})`,
    reponses: unique([
      verbPhrase,
      `${verbPhrase} ${agent}`,
      fullWithoutAgent,
      fullWithAgent,
      displayedSentence,
    ]),
    reponsesPourCorrige: [displayedSentence],
    infinitif: row.infinitif,
    pronom: subject,
    temps: row.temps_name,
    mode: row.mode_name,
    ...(row.tense_code ? { tenseCode: row.tense_code } : {}),
    ...(row.mode_code ? { modeCode: row.mode_code } : {}),
    isCompound: Boolean(row.is_compound),
    voice: 'passive',
    passiveSubject: subject,
    passiveAgent: agent,
    conjugaison1: verbPhrase,
    conjugaison2: '',
    conjugaison3: '',
    complement: agent,
    complementPosition: 'after',
    saisiePrefixe: capitalize(subjectPrefix),
  }
}

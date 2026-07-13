import type { ExerciseQuestion } from '../types/public-api'

export interface ConjugationSourceRow {
  id: number
  verbe_id: number
  personne_id: number
  temp_id: number
  conjugaison1: string
  conjugaison2: string
  conjugaison3: string
  infinitif: string
  auxiliaire: string
  participe_passe: string
  temps_name: string
  is_compound: number
  mode_name: string
}

function unique(values: string[]) {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))]
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase('fr-CH')
}

function startsWithVowel(value: string) {
  const first = value.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLowerCase()
  return 'aeiouy'.includes(first)
}

// Le h aspiré est une propriété lexicale : il ne peut pas être déduit de
// l'orthographe. Le catalogue contient actuellement « habiter » (h muet) et
// « haïr » (h aspiré). Toute nouvelle exception doit être ajoutée ici.
const ASPIRATED_H_INFINITIVES = new Set(['haïr'])

function startsWithElidableSound(value: string, infinitive = '') {
  const normalizedValue = normalized(value).normalize('NFC')
  if (startsWithVowel(normalizedValue)) return true
  if (!normalizedValue.startsWith('h')) return false

  const normalizedInfinitive = normalized(infinitive).normalize('NFC')
  if (ASPIRATED_H_INFINITIVES.has(normalizedInfinitive)) return false

  // Permet aussi à formatAnswer d'être utilisé seul, sans ligne de verbe.
  if (/^ha(?:i|ï)/u.test(normalizedValue)) return false
  return true
}

function masculineSingularForm(form: string, participle: string) {
  if (!participle) return form.endsWith('s') ? form.slice(0, -1) : form
  const endings = [
    `${participle}es`,
    `${participle}e`,
    ...(/[sx]$/u.test(participle) ? [] : [`${participle}s`]),
    participle,
  ]
  const ending = endings.find(candidate => form.endsWith(candidate))
  if (ending) return `${form.slice(0, -ending.length)}${participle}`
  return form
}

function applyAgreement(
  form: string,
  pronoun: string,
  compound: boolean,
  auxiliary: string,
  participle: string
) {
  if (!compound || normalized(auxiliary) !== 'être') return form

  const stem = masculineSingularForm(form, participle)
  if (pronoun === 'elle') return `${stem}e`
  if (pronoun === 'elles') return `${stem}es`
  if (pronoun === 'iel') return `${stem}(e)`
  if (pronoun === 'iels') return `${stem}(e)s`
  return form
}

function agreementVariants(
  form: string,
  pronoun: string,
  compound: boolean,
  auxiliary: string,
  participle: string
) {
  const canonical = applyAgreement(form, pronoun, compound, auxiliary, participle)
  const variants = [canonical]
  if (!compound || normalized(auxiliary) !== 'être') return variants

  const stem = masculineSingularForm(form, participle)
  if (pronoun === 'iel') {
    variants.push(stem, `${stem}e`, `${stem}.e`)
  } else if (pronoun === 'iels') {
    variants.push(form, `${stem}es`, `${stem}.e.s`)
  } else if (['je', 'tu'].includes(pronoun)) {
    variants.push(stem, `${stem}e`)
  } else if (pronoun === 'nous') {
    variants.push(`${stem}es`)
  } else if (pronoun === 'vous') {
    variants.push(stem, `${stem}e`, `${stem}s`, `${stem}es`)
  }
  return unique(variants)
}

function withPronoun(pronoun: string, form: string, infinitive = '') {
  return pronoun === 'je' && startsWithElidableSound(form, infinitive) ? `j'${form}` : `${pronoun} ${form}`
}

export function formatAnswer(pronoun: string, form: string, mode: string, infinitive = '') {
  const normalizedMode = normalized(mode)
  if (normalizedMode === 'impératif') return `${form}!`

  const phrase = withPronoun(pronoun, form, infinitive)
  if (normalizedMode === 'subjonctif') {
    return `${startsWithVowel(pronoun) ? "qu'" : 'que '}${phrase}`
  }
  return phrase
}

function answerVariants(row: ConjugationSourceRow, pronoun: string) {
  const baseForms = unique([row.conjugaison1, row.conjugaison2, row.conjugaison3])
  const answers: string[] = []
  for (const baseForm of baseForms) {
    for (const form of agreementVariants(
      baseForm,
      pronoun,
      Boolean(row.is_compound),
      row.auxiliaire,
      row.participe_passe
    )) {
      const canonical = formatAnswer(pronoun, form, row.mode_name, row.infinitif)
      answers.push(canonical, form)
      if (normalized(row.mode_name) === 'impératif') {
        answers.push(form.replace(/!$/, ''))
      } else {
        answers.push(withPronoun(pronoun, form, row.infinitif))
      }
    }
  }
  return unique(answers)
}

export function formatConjugationQuestion(
  row: ConjugationSourceRow,
  pronoun: string
): ExerciseQuestion {
  const correctedForms = unique([row.conjugaison1, row.conjugaison2, row.conjugaison3])
    .map(form => applyAgreement(
      form,
      pronoun,
      Boolean(row.is_compound),
      row.auxiliaire,
      row.participe_passe
    ))
    .map(form => formatAnswer(pronoun, form, row.mode_name, row.infinitif))

  return {
    id: `c-${row.id}`,
    verbeId: Number(row.verbe_id),
    tenseId: Number(row.temp_id),
    personId: Number(row.personne_id),
    titre: row.infinitif,
    consigne: `${pronoun} | ${row.infinitif} | ${row.temps_name} (${row.mode_name})`,
    reponses: answerVariants(row, pronoun),
    reponsesPourCorrige: unique(correctedForms),
    infinitif: row.infinitif,
    pronom: pronoun,
    temps: row.temps_name,
    mode: row.mode_name,
    conjugaison1: row.conjugaison1,
    conjugaison2: row.conjugaison2 || '',
    conjugaison3: row.conjugaison3 || ''
  }
}

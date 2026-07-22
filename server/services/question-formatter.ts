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
  tense_code?: ExerciseQuestion['tenseCode']
  is_compound: number
  mode_name: string
  mode_code?: ExerciseQuestion['modeCode']
  nous_form?: string | null
  radical_reference?: ExerciseQuestion['radicalReference']
  agreement_rule?: string | null
  complement_phrase?: string | null
  complement_position?: 'after' | 'before'
  complement_anteposed?: string | null
  complement_gender?: string | null
  complement_number?: string | null
  complement_function?: 'cod' | 'coi' | null
  complement_preposition?: string | null
  complement_relative_pronoun?: string | null
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
  participle: string,
  agreementRule?: string | null,
) {
  if (!compound || normalized(auxiliary) !== 'être') return form
  if (agreementRule === 'invariable') return masculineSingularForm(form, participle)

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
  participle: string,
  agreementRule?: string | null,
  allowInvariableConstruction = false,
) {
  const canonical = applyAgreement(form, pronoun, compound, auxiliary, participle, agreementRule)
  const variants = [canonical]
  if (!compound || normalized(auxiliary) !== 'être') return variants

  const stem = masculineSingularForm(form, participle)
  if (agreementRule === 'invariable') return [stem]
  if (agreementRule === 'selon_construction' && allowInvariableConstruction) variants.push(stem)
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

function allowsInvariableConstruction(row: ConjugationSourceRow) {
  return row.agreement_rule === 'selon_construction'
    && row.complement_position === 'after'
    && row.complement_function === 'cod'
}

function withPronoun(pronoun: string, form: string, infinitive = '') {
  return pronoun === 'je' && startsWithElidableSound(form, infinitive) ? `j'${form}` : `${pronoun} ${form}`
}

function withComplement(answer: string, complement: string) {
  const trimmed = answer.trim()
  const punctuation = trimmed.match(/[!?]$/u)?.[0] ?? ''
  const stem = punctuation ? trimmed.slice(0, -1).trimEnd() : trimmed
  return `${stem} ${complement.trim()}${punctuation ? ` ${punctuation}` : ''}`
}

function agreedParticiple(participle: string, gender?: string | null, number?: string | null) {
  let result = participle
  if (gender === 'feminin') {
    const exceptions: Record<string, string> = {
      absous: 'absoute', dissous: 'dissoute', dû: 'due', mû: 'mue', crû: 'crue',
    }
    result = exceptions[result] ?? (result.endsWith('e') ? result : `${result}e`)
  }
  if (number === 'pluriel' && !/[sx]$/u.test(result)) result += 's'
  return result
}

function applyAnteposedCodAgreement(form: string, row: ConjugationSourceRow) {
  if (row.complement_position !== 'before'
      || row.complement_function === 'coi'
      || !row.is_compound
      || normalized(row.auxiliaire) !== 'avoir'
      || !row.participe_passe
      || !row.complement_gender
      || !row.complement_number
      || !form.endsWith(row.participe_passe)) {
    return form
  }
  const agreed = agreedParticiple(row.participe_passe, row.complement_gender, row.complement_number)
  return `${form.slice(0, -row.participe_passe.length)}${agreed}`
}

function withoutSubjunctiveLink(value: string) {
  return value.replace(/^que\s+/iu, '').replace(/^qu['’]/iu, '')
}

function splitAnteposedCodComplement(complement: string, relativePronoun?: string | null) {
  if (relativePronoun) return { antecedent: complement.trim(), postposed: '' }
  const match = complement.trim().match(
    /^(.+?)\s+((?:à\s+(?:l['’]|la\b|le\b|un\b|une\b|des\b)|au\b|aux\b|dans\b|sur\b|sous(?!-)\b|chez\b|vers\b|en\b|pour\b|par\b|avec\b|sans\b).*)$/iu
  )
  return match
    ? { antecedent: match[1]!.trim(), postposed: match[2]!.trim() }
    : { antecedent: complement.trim(), postposed: '' }
}

function anteposedComplementGrammar(
  antecedent: string,
  relativePronoun?: string | null,
  gender?: string | null,
  number?: string | null,
) {
  const normalizedGender = normalized(gender || '').normalize('NFD').replace(/\p{Diacritic}/gu, '')
  const normalizedNumber = normalized(number || '')
  if ((normalizedGender === 'masculin' || normalizedGender === 'feminin')
      && (normalizedNumber === 'singulier' || normalizedNumber === 'pluriel')) {
    return { gender: normalizedGender, number: normalizedNumber }
  }

  const relative = normalized(relativePronoun || '').normalize('NFD').replace(/\p{Diacritic}/gu, '')
  if (['auxquelles', 'desquelles'].includes(relative)) return { gender: 'feminin', number: 'pluriel' }
  if (['auxquels', 'desquels'].includes(relative)) return { gender: 'masculin', number: 'pluriel' }
  if (['a laquelle', 'de laquelle'].includes(relative)) return { gender: 'feminin', number: 'singulier' }
  if (['auquel', 'duquel'].includes(relative)) return { gender: 'masculin', number: 'singulier' }

  const determiner = normalized(antecedent).match(/^(l['’]|le(?=\s)|la(?=\s)|les(?=\s)|un(?=\s)|une(?=\s)|des(?=\s)|ce(?=\s)|cet(?=\s)|cette(?=\s)|ces(?=\s))/u)?.[1]
  if (['les', 'des', 'ces'].includes(determiner || '')) return { gender: 'masculin', number: 'pluriel' }
  if (['la', 'une', 'cette'].includes(determiner || '')) return { gender: 'feminin', number: 'singulier' }
  return { gender: 'masculin', number: 'singulier' }
}

function subjunctiveRelativeAntecedent(
  antecedent: string,
  relativePronoun?: string | null,
  gender?: string | null,
  number?: string | null,
) {
  const grammar = anteposedComplementGrammar(antecedent, relativePronoun, gender, number)
  const nounPhrase = antecedent.trim().replace(
    /^(?:l['’]|le\s+|la\s+|les\s+|un\s+|une\s+|des\s+|ce\s+|cet\s+|cette\s+|ces\s+)/iu,
    '',
  )
  const plural = grammar.number === 'pluriel'
  const feminine = grammar.gender === 'feminin'
  const article = plural ? 'les' : feminine ? 'la' : 'le'
  const only = plural ? (feminine ? 'seules' : 'seuls') : (feminine ? 'seule' : 'seul')
  return `${plural ? 'Ce sont' : "C'est"} ${article} ${only} ${nounPhrase}`
}

function withRelativeLink(relativePronoun: string | null | undefined, pronoun: string, clause: string) {
  if (relativePronoun) return `${relativePronoun} ${clause}`
  return startsWithVowel(pronoun) ? `qu'${clause}` : `que ${clause}`
}

function withAnteposedComplement(
  answer: string,
  pronoun: string,
  mode: string,
  complement: string,
  relativePronoun?: string | null,
  gender?: string | null,
  number?: string | null,
) {
  const { antecedent, postposed } = splitAnteposedCodComplement(complement, relativePronoun)
  if (normalized(mode) === 'subjonctif') {
    const framedAntecedent = subjunctiveRelativeAntecedent(antecedent, relativePronoun, gender, number)
    const clause = withoutSubjunctiveLink(answer)
    return [framedAntecedent, withRelativeLink(relativePronoun, pronoun, clause), postposed].filter(Boolean).join(' ')
  }
  if (relativePronoun) {
    return `${antecedent} ${relativePronoun} ${answer}`
  }
  const clause = startsWithVowel(pronoun) ? `qu'${answer}` : `que ${answer}`
  return [antecedent, clause, postposed].filter(Boolean).join(' ')
}

function relativeSubjectPrefix(pronoun: string, form: string, mode: string, infinitive: string) {
  const formatted = formatAnswer(pronoun, form, mode, infinitive)
  const prefix = formatted.endsWith(form) ? formatted.slice(0, -form.length).trimEnd() : pronoun
  return normalized(mode) === 'subjonctif' ? withoutSubjunctiveLink(prefix) : prefix
}

function inputPrefix(
  pronoun: string,
  form: string,
  mode: string,
  infinitive: string,
  position?: 'after' | 'before',
) {
  if (normalized(mode) === 'impératif') return ''
  const formatted = formatAnswer(pronoun, form, mode, infinitive)
  const base = formatted.endsWith(form)
    ? formatted.slice(0, -form.length).trimEnd()
    : pronoun
  if (position !== 'before' || normalized(mode) === 'subjonctif') return base
  return startsWithVowel(pronoun) ? `qu'${base}` : `que ${base}`
}

export function formatAnswer(pronoun: string, form: string, mode: string, infinitive = '') {
  const normalizedMode = normalized(mode)
  if (normalizedMode === 'impératif') return `${form.trimEnd()} !`

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
      row.participe_passe,
      row.agreement_rule,
      allowsInvariableConstruction(row),
    )) {
      const agreedForm = applyAnteposedCodAgreement(form, row)
      const canonical = formatAnswer(pronoun, agreedForm, row.mode_name, row.infinitif)
      answers.push(canonical, agreedForm)
      if (normalized(row.mode_name) === 'impératif') {
        answers.push(agreedForm.replace(/!$/, ''))
      } else {
        answers.push(withPronoun(pronoun, agreedForm, row.infinitif))
      }
      if (row.complement_position === 'before' && row.complement_anteposed) {
        answers.push(withAnteposedComplement(canonical, pronoun, row.mode_name, row.complement_anteposed, row.complement_relative_pronoun, row.complement_gender, row.complement_number))
      }
    }
  }
  const baseAnswers = unique(answers)
  return row.complement_phrase && row.complement_position !== 'before'
    ? unique([...baseAnswers, ...baseAnswers.map(answer => withComplement(answer, row.complement_phrase!))])
    : baseAnswers
}

export function formatConjugationQuestion(
  row: ConjugationSourceRow,
  pronoun: string
): ExerciseQuestion {
  const anteposedComplement = row.complement_position === 'before' && row.complement_anteposed
    ? splitAnteposedCodComplement(row.complement_anteposed, row.complement_relative_pronoun)
    : null
  const sourceForms = unique([row.conjugaison1, row.conjugaison2, row.conjugaison3])
  const correctedForms = (row.agreement_rule === 'selon_construction'
    ? sourceForms.flatMap(form => agreementVariants(
        form,
        pronoun,
        Boolean(row.is_compound),
        row.auxiliaire,
        row.participe_passe,
        row.agreement_rule,
        allowsInvariableConstruction(row),
      ))
    : sourceForms.map(form => applyAgreement(
        form,
        pronoun,
        Boolean(row.is_compound),
        row.auxiliaire,
        row.participe_passe,
        row.agreement_rule,
      )))
    .map(form => applyAnteposedCodAgreement(form, row))
    .map(form => formatAnswer(pronoun, form, row.mode_name, row.infinitif))
  const displayedCorrections = row.complement_position === 'before' && row.complement_anteposed
    ? correctedForms.map(answer => withAnteposedComplement(answer, pronoun, row.mode_name, row.complement_anteposed!, row.complement_relative_pronoun, row.complement_gender, row.complement_number))
    : row.complement_phrase
      ? correctedForms.map(answer => withComplement(answer, row.complement_phrase!))
    : correctedForms
  const prompt = row.complement_position === 'before' && row.complement_anteposed
    ? normalized(row.mode_name) === 'subjonctif'
      ? `${subjunctiveRelativeAntecedent(anteposedComplement!.antecedent, row.complement_relative_pronoun, row.complement_gender, row.complement_number)} ${withRelativeLink(row.complement_relative_pronoun, pronoun, relativeSubjectPrefix(pronoun, row.conjugaison1, row.mode_name, row.infinitif))} …${anteposedComplement!.postposed ? ` ${anteposedComplement!.postposed}` : ''} | ${row.infinitif} | ${row.temps_name} (${row.mode_name})`
      : row.complement_relative_pronoun
        ? `${anteposedComplement!.antecedent} ${row.complement_relative_pronoun} ${relativeSubjectPrefix(pronoun, row.conjugaison1, row.mode_name, row.infinitif)} … | ${row.infinitif} | ${row.temps_name} (${row.mode_name})`
        : `${anteposedComplement!.antecedent} ${inputPrefix(pronoun, row.conjugaison1, row.mode_name, row.infinitif, 'before')} …${anteposedComplement!.postposed ? ` ${anteposedComplement!.postposed}` : ''} | ${row.infinitif} | ${row.temps_name} (${row.mode_name})`
    : row.complement_phrase
    ? `${normalized(row.mode_name) === 'impératif' ? '' : `${pronoun} `}… ${row.complement_phrase} | ${row.infinitif} | ${row.temps_name} (${row.mode_name})`
    : `${normalized(row.mode_name) === 'impératif' ? '' : `${pronoun} | `}${row.infinitif} | ${row.temps_name} (${row.mode_name})`
  const displayedComplement = row.complement_position === 'before'
    ? anteposedComplement?.antecedent
    : row.complement_phrase
  const hasAvoirParticipleRule = Boolean(row.is_compound)
    && normalized(row.auxiliaire) === 'avoir'
    && Boolean(displayedComplement)
    && (row.complement_function === 'cod' || row.complement_function === 'coi')
  const agreementReminder = hasAvoirParticipleRule
    ? {
        kind: (row.complement_function === 'coi'
          ? 'coi'
          : row.complement_position === 'before' ? 'cod-before' : 'cod-after') as 'cod-before' | 'cod-after' | 'coi',
        infinitive: row.infinitif,
        complement: displayedComplement!,
        preposition: row.complement_preposition,
        participle: row.complement_function === 'cod' && row.complement_position === 'before'
          && row.complement_gender && row.complement_number
          ? agreedParticiple(row.participe_passe, row.complement_gender, row.complement_number)
          : row.participe_passe,
        gender: (row.complement_gender as 'masculin' | 'feminin' | null | undefined) ?? null,
        number: (row.complement_number as 'singulier' | 'pluriel' | null | undefined) ?? null,
      }
    : undefined

  return {
    id: `c-${row.id}`,
    verbeId: Number(row.verbe_id),
    tenseId: Number(row.temp_id),
    personId: Number(row.personne_id),
    titre: row.infinitif,
    consigne: prompt,
    reponses: answerVariants(row, pronoun),
    reponsesPourCorrige: unique(displayedCorrections),
    infinitif: row.infinitif,
    pronom: pronoun,
    temps: row.temps_name,
    mode: row.mode_name,
    ...(row.tense_code ? { tenseCode: row.tense_code } : {}),
    ...(row.mode_code ? { modeCode: row.mode_code } : {}),
    isCompound: Boolean(row.is_compound),
    conjugaison1: row.conjugaison1,
    conjugaison2: row.conjugaison2 || '',
    conjugaison3: row.conjugaison3 || '',
    nousForm: row.nous_form || null,
    ...(row.radical_reference ? { radicalReference: row.radical_reference } : {}),
    complement: row.complement_position === 'before'
      ? row.complement_anteposed || undefined
      : row.complement_phrase || undefined,
    complementPosition: row.complement_position,
    complementFunction: row.complement_function || undefined,
    relativePronoun: row.complement_relative_pronoun || undefined,
    saisiePrefixe: row.complement_position === 'before' && row.complement_relative_pronoun
      ? relativeSubjectPrefix(pronoun, row.conjugaison1, row.mode_name, row.infinitif)
      : inputPrefix(pronoun, row.conjugaison1, row.mode_name, row.infinitif, row.complement_position),
    ...(agreementReminder ? { agreementReminder } : {}),
  }
}

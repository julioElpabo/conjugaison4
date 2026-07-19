import type { ExerciseQuestion } from '../types/conjugation'

export interface RadicalPrincipalForm {
  mode: string
  tense: string
  personId: number
  pronoun: string
  form: string
}

export interface RadicalReferenceRequest {
  infinitive: string
  mode: string
  tense: string
  personId: number | null
  conjugation: string
  isCompound?: boolean
}

function normalized(value: string | null | undefined) {
  return (value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/’/gu, "'").trim().toLocaleLowerCase('fr')
}

function bareInfinitive(value: string) {
  return value.replace(/^(?:se\s+|s['’])/iu, '').trim()
}

function conjugatedCore(value: string) {
  return value.trim().replace(/[.!?…]+$/gu, '').replace(/^(?:me|te|se|nous|vous)\s+/iu, '').replace(/^[mts]['’]/iu, '').trim()
}

const PERSON_INDEX = new Map([[4, 0], [5, 1], [6, 2], [7, 3], [8, 4], [9, 5]])
const IMPERFECT_ENDINGS = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient']
const FUTURE_ENDINGS = ['ai', 'as', 'a', 'ons', 'ez', 'ont']
const SUBJUNCTIVE_PRESENT_ENDINGS = ['e', 'es', 'e', 'ions', 'iez', 'ent']
const SUBJUNCTIVE_IMPERFECT_ENDINGS = ['sse', 'sses', 't', 'ssions', 'ssiez', 'ssent']

function targetStem(request: RadicalReferenceRequest, endings: readonly string[]) {
  const index = request.personId === null ? undefined : PERSON_INDEX.get(request.personId)
  const ending = index === undefined ? '' : endings[index] || ''
  const form = conjugatedCore(request.conjugation)
  if (!ending || form.length <= ending.length || !normalized(form).endsWith(normalized(ending))) return null
  return { ending, stem: form.slice(0, -ending.length) }
}

function referenceForm(forms: readonly RadicalPrincipalForm[], mode: string, tense: string, pronoun: string) {
  return forms.find(item => normalized(item.mode) === normalized(mode)
    && normalized(item.tense) === normalized(tense)
    && normalized(item.pronoun) === normalized(pronoun)
    && item.form.trim())
}

function adjustPresentNousStem(stem: string, infinitive: string, targetEnding: string) {
  const bare = normalized(bareInfinitive(infinitive))
  if (/^i/u.test(normalized(targetEnding)) && bare.endsWith('ger') && normalized(stem).endsWith('ge')) {
    return { stem: stem.slice(0, -1), note: 'Devant i, le e utilisé devant a ou o pour conserver le son doux de g disparaît.' }
  }
  if (/^i/u.test(normalized(targetEnding)) && bare.endsWith('cer') && normalized(stem).endsWith('ç')) {
    return { stem: `${stem.slice(0, -1)}c`, note: 'Devant i, la cédille n’est plus nécessaire : ç redevient c.' }
  }
  return { stem, note: '' }
}

function fromRemovableForm(
  source: RadicalPrincipalForm | undefined,
  removableEnding: string,
  expectedStem: string,
  kind: NonNullable<ExerciseQuestion['radicalReference']>['kind'],
  label: string,
  targetEnding = '',
  infinitive = '',
): ExerciseQuestion['radicalReference'] | undefined {
  const form = conjugatedCore(source?.form || '')
  if (!form || !normalized(form).endsWith(normalized(removableEnding)) || form.length <= removableEnding.length) return undefined
  const rawStem = form.slice(0, -removableEnding.length)
  const adjusted = adjustPresentNousStem(rawStem, infinitive, targetEnding)
  if (normalized(adjusted.stem) !== normalized(expectedStem)) return undefined
  return {
    kind,
    label,
    form,
    removableEnding,
    radical: adjusted.stem,
    ...(targetEnding ? { targetEnding } : {}),
    referenceMode: source?.mode,
    referenceTense: source?.tense,
    referenceSubject: source?.pronoun,
    strategy: 'remove-ending',
    ...(adjusted.note ? { orthographicAdjustment: adjusted.note } : {}),
    validated: true,
  }
}

/**
 * Choisit une forme repère indépendante de la réponse et ne la renvoie que si
 * la transformation reproduit effectivement le radical de la forme stockée.
 */
export function buildRadicalReference(
  request: RadicalReferenceRequest,
  forms: readonly RadicalPrincipalForm[],
): ExerciseQuestion['radicalReference'] | undefined {
  if (request.isCompound) return undefined
  const mode = normalized(request.mode)
  const tense = normalized(request.tense)
  const infinitive = normalized(bareInfinitive(request.infinitive))

  if (mode === 'indicatif' && tense === 'present') {
    const source = referenceForm(forms, 'indicatif', 'présent', 'nous')
    const sourceForm = conjugatedCore(source?.form || '')
    const removableEnding = ['issons', 'ons'].find(ending => normalized(sourceForm).endsWith(ending)) || ''
    if (sourceForm && removableEnding && sourceForm.length > removableEnding.length) {
      const radical = sourceForm.slice(0, -removableEnding.length)
      const targetForm = conjugatedCore(request.conjugation)
      if (normalized(targetForm).startsWith(normalized(radical))) {
        return {
          kind: 'present-nous', label: 'nous au présent', form: sourceForm, removableEnding,
          radical, targetEnding: targetForm.slice(radical.length), referenceMode: 'indicatif',
          referenceTense: 'présent', referenceSubject: 'nous', strategy: 'remove-ending', validated: true,
        }
      }
    }
  }

  if (mode === 'indicatif' && tense === 'imparfait') {
    const target = targetStem(request, IMPERFECT_ENDINGS)
    if (!target) return undefined
    if (infinitive === 'etre') {
      if (normalized(target.stem) !== 'et') return undefined
      return {
        kind: 'memorized-stem', label: 'radical propre de être', form: 'ét-', removableEnding: '', radical: target.stem,
        targetEnding: target.ending, referenceMode: 'indicatif', referenceTense: 'imparfait', referenceSubject: '', strategy: 'memorize-stem', validated: true,
      }
    }
    const reference = fromRemovableForm(referenceForm(forms, 'indicatif', 'présent', 'nous'), 'ons', target.stem, 'present-nous', 'nous au présent', target.ending, request.infinitive)
    if (reference) return reference
  }

  if ((mode === 'indicatif' && tense === 'futur') || (mode === 'conditionnel' && tense === 'present')) {
    const target = targetStem(request, mode === 'indicatif' ? FUTURE_ENDINGS : IMPERFECT_ENDINGS)
    if (!target) return undefined
    const reference = fromRemovableForm(referenceForm(forms, 'indicatif', 'futur', 'je'), 'ai', target.stem, 'future-stem', 'je au futur', target.ending, request.infinitive)
    if (reference) return reference
    const bare = bareInfinitive(request.infinitive)
    const regularStem = normalized(bare).endsWith('re') ? bare.slice(0, -1) : bare
    if (normalized(regularStem) === normalized(target.stem)) {
      return {
        kind: 'infinitive', label: 'infinitif', form: bare, removableEnding: normalized(bare).endsWith('re') ? bare.slice(-1) : '', radical: target.stem,
        targetEnding: target.ending, referenceMode: 'infinitif', referenceTense: 'présent', referenceSubject: '', strategy: 'remove-ending', validated: true,
      }
    }
  }

  if (mode === 'indicatif' && tense === 'passe simple') {
    const source = referenceForm(forms, 'indicatif', 'passé simple', 'il')
    const sourceForm = conjugatedCore(source?.form || '')
    const series = normalized(sourceForm).endsWith('int')
      ? { singular: 'in', sourceEnding: 'int', endings: ['ins', 'ins', 'int', 'înmes', 'întes', 'inrent'] }
      : normalized(sourceForm).endsWith('ut')
        ? { singular: 'u', sourceEnding: 'ut', endings: ['us', 'us', 'ut', 'ûmes', 'ûtes', 'urent'] }
        : normalized(sourceForm).endsWith('it')
          ? { singular: 'i', sourceEnding: 'it', endings: ['is', 'is', 'it', 'îmes', 'îtes', 'irent'] }
          : normalized(sourceForm).endsWith('a')
            ? { singular: 'a', sourceEnding: 'a', endings: ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent'] }
            : null
    const index = request.personId === null ? undefined : PERSON_INDEX.get(request.personId)
    if (!series || index === undefined) return undefined
    const sourceRadical = sourceForm.slice(0, -series.sourceEnding.length)
    const targetEnding = series.endings[index]!
    const bare = normalized(bareInfinitive(request.infinitive))
    const adjustment = series.singular === 'a' && index === 5 && bare.endsWith('ger') && normalized(sourceRadical).endsWith('ge')
      ? { stem: sourceRadical.slice(0, -1), note: 'Devant è, le g garde déjà son son doux : le e de la forme en a disparaît.' }
      : series.singular === 'a' && index === 5 && bare.endsWith('cer') && normalized(sourceRadical).endsWith('ç')
        ? { stem: `${sourceRadical.slice(0, -1)}c`, note: 'Devant è, la cédille n’est plus nécessaire : ç redevient c.' }
        : { stem: sourceRadical, note: '' }
    const radical = adjustment.stem
    const expected = `${radical}${targetEnding}`
    if (normalized(expected) !== normalized(conjugatedCore(request.conjugation))) return undefined
    return {
      kind: 'past-simple-il', label: 'il au passé simple', form: sourceForm, removableEnding: series.sourceEnding,
      radical, targetEnding, referenceMode: 'indicatif', referenceTense: 'passé simple', referenceSubject: 'il',
      strategy: 'remove-ending', ...(adjustment.note ? { orthographicAdjustment: adjustment.note } : {}), validated: true,
    }
  }

  if (mode === 'subjonctif' && tense === 'present') {
    const target = targetStem(request, SUBJUNCTIVE_PRESENT_ENDINGS)
    if (!target || request.personId === null) {
      if (['etre', 'avoir', 'aller', 'faire', 'pouvoir', 'savoir', 'vouloir', 'valoir', 'falloir'].includes(infinitive)) {
        const wholeForm = conjugatedCore(request.conjugation)
        if (!wholeForm) return undefined
        return {
          kind: 'memorized-form', label: `forme particulière de ${bareInfinitive(request.infinitive)}`,
          form: wholeForm, removableEnding: '', radical: wholeForm,
          referenceMode: request.mode, referenceTense: request.tense, referenceSubject: '', strategy: 'memorize-stem', validated: true,
        }
      }
      return undefined
    }
    const useNous = request.personId === 7 || request.personId === 8
    const reference = fromRemovableForm(
      referenceForm(forms, 'indicatif', 'présent', useNous ? 'nous' : 'ils'),
      useNous ? 'ons' : 'ent', target.stem, useNous ? 'present-nous' : 'present-ils', `${useNous ? 'nous' : 'ils'} au présent`, target.ending, request.infinitive,
    )
    if (reference) return reference
  }

  if (mode === 'subjonctif' && tense === 'imparfait') {
    const target = targetStem(request, SUBJUNCTIVE_IMPERFECT_ENDINGS)
    const source = referenceForm(forms, 'indicatif', 'passé simple', 'il')
    const form = conjugatedCore(source?.form || '')
    if (!target) return undefined
    if (form) {
      const radical = normalized(form).endsWith('a') ? form : form.slice(0, -1)
      if (normalized(radical) === normalized(target.stem)) {
        return {
          kind: 'past-simple-il', label: 'il au passé simple', form, removableEnding: normalized(form).endsWith('a') ? '' : form.slice(-1), radical,
          targetEnding: target.ending, referenceMode: 'indicatif', referenceTense: 'passé simple', referenceSubject: 'il', strategy: 'remove-ending', validated: true,
        }
      }
    }
  }

  if ((mode === 'participe' && tense === 'present') || (mode === 'gerondif' && tense === 'present')) {
    const source = referenceForm(forms, 'indicatif', 'présent', 'nous')
    const targetForm = conjugatedCore(request.conjugation.replace(/^en\s+/iu, ''))
    if (!targetForm.endsWith('ant') || targetForm.length <= 3) return undefined
    return fromRemovableForm(source, 'ons', targetForm.slice(0, -3), 'present-nous', 'nous au présent', 'ant', request.infinitive)
  }

  if (mode === 'imperatif' && tense === 'present' && request.personId !== null) {
    const source = forms.find(item => normalized(item.mode) === 'indicatif' && normalized(item.tense) === 'present' && item.personId === request.personId)
    const sourceCore = conjugatedCore(source?.form || '')
    const targetCore = conjugatedCore(request.conjugation)
    if (!targetCore) return undefined
    if (sourceCore) {
      const expected = request.personId === 5 && /(?:es|as)$/iu.test(sourceCore) ? sourceCore.slice(0, -1) : sourceCore
      if (normalized(expected) === normalized(targetCore)) {
        return {
          kind: 'present-same-person', label: `${source?.pronoun || ''} à l’indicatif présent`.trim(), form: sourceCore,
          removableEnding: sourceCore.slice(expected.length), radical: expected, referenceMode: 'indicatif', referenceTense: 'présent',
          referenceSubject: source?.pronoun || '', strategy: sourceCore === expected ? 'reuse-form' : 'remove-ending', validated: true,
        }
      }
    }
  }

  const memorized = mode === 'indicatif' && tense === 'imparfait'
    ? targetStem(request, IMPERFECT_ENDINGS)
    : mode === 'indicatif' && tense === 'futur'
      ? targetStem(request, FUTURE_ENDINGS)
      : mode === 'conditionnel' && tense === 'present'
        ? targetStem(request, IMPERFECT_ENDINGS)
        : mode === 'subjonctif' && tense === 'present'
          ? targetStem(request, SUBJUNCTIVE_PRESENT_ENDINGS)
          : mode === 'subjonctif' && tense === 'imparfait'
            ? targetStem(request, SUBJUNCTIVE_IMPERFECT_ENDINGS)
            : null
  if (memorized) {
    return {
      kind: 'memorized-stem', label: `radical particulier de ${bareInfinitive(request.infinitive)}`,
      form: `${memorized.stem}-`, removableEnding: '', radical: memorized.stem, targetEnding: memorized.ending,
      referenceMode: request.mode, referenceTense: request.tense, referenceSubject: '', strategy: 'memorize-stem', validated: true,
    }
  }

  if (mode === 'imperatif' && tense === 'present' && conjugatedCore(request.conjugation)) {
    const wholeForm = conjugatedCore(request.conjugation)
    return {
      kind: 'memorized-form', label: `forme particulière de ${bareInfinitive(request.infinitive)}`,
      form: wholeForm, removableEnding: '', radical: wholeForm,
      referenceMode: request.mode, referenceTense: request.tense, referenceSubject: '', strategy: 'memorize-stem', validated: true,
    }
  }

  return undefined
}

import type { ExerciseQuestion } from '../types/conjugation'
import { buildRadicalReference, type RadicalPrincipalForm } from './radical-reference'

/** Conserve les preuves du diagnostic pour la reprise, sans les médias du questionnaire. */
export function compactLearnerQuestion(question: ExerciseQuestion): ExerciseQuestion {
  return {
    exerciseKind: question.exerciseKind,
    titre: question.titre,
    instruction: question.instruction,
    consigne: question.consigne,
    reponses: [...question.reponses],
    reponsesPourCorrige: [...question.reponsesPourCorrige],
    futureSimpleAnswers: question.futureSimpleAnswers
      ? [...question.futureSimpleAnswers]
      : undefined,
    conjugationConfusions: question.conjugationConfusions
      ? question.conjugationConfusions.map(confusion => ({
          tense: confusion.tense,
          mode: confusion.mode,
          answers: [...confusion.answers],
        }))
      : undefined,
    verbeId: question.verbeId,
    tenseId: question.tenseId,
    personId: question.personId,
    infinitif: question.infinitif,
    pronom: question.pronom,
    temps: question.temps,
    mode: question.mode,
    isCompound: question.isCompound,
    pastParticiple: question.pastParticiple,
    voice: question.voice,
    passiveSubject: question.passiveSubject,
    passiveAgent: question.passiveAgent,
    auxiliaryChoices: question.auxiliaryChoices ? [...question.auxiliaryChoices] : undefined,
    preferredAuxiliary: question.preferredAuxiliary,
    conjugaison1: question.conjugaison1,
    conjugaison2: question.conjugaison2,
    conjugaison3: question.conjugaison3,
    radicalReference: cloneDiagnosticReference(question.radicalReference),
    complement: question.complement,
    complementPosition: question.complementPosition,
    complementFunction: question.complementFunction,
    saisiePrefixe: question.saisiePrefixe,
    agreementReminder: question.agreementReminder
      ? { ...question.agreementReminder }
      : undefined,
    literaryCitation: question.literaryCitation
      ? { ...question.literaryCitation }
      : undefined,
  }
}

function cloneDiagnosticReference(reference: ExerciseQuestion['radicalReference']): ExerciseQuestion['radicalReference'] {
  if (!reference) return undefined
  // Les questions viennent aussi de tableaux réactifs Vue : structuredClone rejette leurs Proxy.
  return {
    ...reference,
    ...(reference.paradigmForms ? { paradigmForms: reference.paradigmForms.map(form => ({ ...form })) } : {}),
    ...(reference.imperativePresentReferences ? { imperativePresentReferences: reference.imperativePresentReferences.map(form => ({ ...form })) } : {}),
    ...(reference.subjunctivePresentReferences ? { subjunctivePresentReferences: reference.subjunctivePresentReferences.map(form => ({ ...form })) } : {}),
    ...(reference.subjunctivePresentForms ? { subjunctivePresentForms: reference.subjunctivePresentForms.map(form => ({ ...form })) } : {}),
  }
}

/** Reconstruit les transformations validées plutôt que de faire confiance au drapeau reçu. */
export function restoreDiagnosticReference(
  question: ExerciseQuestion,
  source: Record<string, unknown> | null,
): ExerciseQuestion['radicalReference'] {
  const legacy = question.radicalReference
  if (!source) return legacy
  const text = (value: unknown) => typeof value === 'string' ? value.trim().slice(0, 300) : ''
  const personIds: Record<string, number> = { je: 4, tu: 5, il: 6, nous: 7, vous: 8, ils: 9 }
  const forms: RadicalPrincipalForm[] = (legacy?.paradigmForms || []).map(item => ({
    ...item, mode: question.mode || '', tense: question.temps || '', pronoun: item.subject,
  })).filter(item => !(Array.isArray(source.subjunctivePresentForms) && item.mode === 'subjonctif' && item.tense === 'présent'))
  if (Array.isArray(source.subjunctivePresentForms)) {
    for (const item of source.subjunctivePresentForms.slice(0, 12)) {
      if (!item || typeof item !== 'object') continue
      const personId = Number(item.personId)
      if (![4, 5, 6, 7, 8, 9].includes(personId) || !text(item.form)) continue
      forms.push({ mode: 'subjonctif', tense: 'présent', personId, pronoun: text(item.subject), form: text(item.form) })
    }
  }
  const referenceSubject = text(source.referenceSubject)
  if (personIds[referenceSubject] && text(source.form)) {
    forms.push({
      mode: text(source.referenceMode), tense: text(source.referenceTense),
      personId: personIds[referenceSubject]!, pronoun: referenceSubject, form: text(source.form),
    })
  }
  for (const key of ['imperativePresentReferences', 'subjunctivePresentReferences'] as const) {
    if (!Array.isArray(source[key])) continue
    for (const item of source[key].slice(0, 6)) {
      if (!item || typeof item !== 'object') continue
      const subject = text(item.subject)
      if (!personIds[subject] || !text(item.form)) continue
      forms.push({ mode: 'indicatif', tense: 'présent', personId: personIds[subject]!, pronoun: subject, form: text(item.form) })
    }
  }
  // Sans la forme de base, les anciens instantanés conservent leur comportement prudent.
  if (!question.conjugaison1 || !question.infinitif) return legacy
  const rebuilt = buildRadicalReference({
    infinitive: question.infinitif, mode: question.mode || '', tense: question.temps || '',
    personId: question.personId ?? null, conjugation: question.conjugaison1, isCompound: question.isCompound,
  }, forms)
  return rebuilt ? { ...rebuilt, ...(legacy?.paradigmForms?.length ? { paradigmForms: legacy.paradigmForms } : {}) } : legacy
}

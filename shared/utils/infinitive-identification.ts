import type { UiMessage } from '../i18n/ui-messages'
import type { ExerciseQuestion, Verb } from '../types/conjugation'
import { normalizeAnswer } from './answer'

export const INFINITIVE_IDENTIFICATION_INSTRUCTION = 'Quel est l’infinitif du verbe surligné\u00a0?'
export const INFINITIVE_AMBIGUITY_NOTICE = 'Cette forme peut correspondre à plusieurs verbes. Un infinitif possible suffit.'

/** Les accents distinguent les formes ; seule la ponctuation finale est ignorée. */
export function infinitiveFormKey(form: string) {
  return normalizeAnswer(form.replace(/[.!?…]+\s*$/u, ''))
}

export function infinitiveAnswers(infinitives: readonly string[]) {
  const answers = [...new Set(infinitives.map(value => value.trim()).filter(Boolean))]
  // Graphie rectifiée admise, même si le catalogue garde la graphie historique.
  if (answers.includes('asseoir')) answers.push('assoir')
  return [...new Set(answers)]
}

type HelpTranslate = (message: UiMessage, parameters?: Record<string, string | number>) => string
const french: HelpTranslate = (message, parameters = {}) => message.replace(/\{(\w+)\}/gu, (_, key) => String(parameters[key] ?? `{${key}}`))

export function infinitiveHelpVerb(infinitive: string, verbs: readonly Verb[]) {
  const key = normalizeAnswer(infinitive, { ignoreWhitespace: false })
  const verbKey = (verb: Verb) => normalizeAnswer(verb.infinitif, { ignoreWhitespace: false })
  return verbs.find(verb => verbKey(verb) === key)
    || verbs.find(verb => verbKey(verb) === key.replace(/^(?:se\s+|s')/u, ''))
}

/** Chaque réponse possible garde son propre groupe : finir et partir ne se classent pas pareil. */
export function infinitiveIdentificationGroupHints(question: ExerciseQuestion, verbs: readonly Verb[], translate: HelpTranslate = french) {
  return [...new Set(question.reponsesPourCorrige.map(infinitive => {
    const verb = infinitiveHelpVerb(infinitive, verbs)
    const group = verb?.groupeConjugaison
    const groupLabel = group === 1 ? translate('1er groupe') : group === 2 ? translate('2e groupe') : group === 3 ? translate('3e groupe') : ''
    return groupLabel ? translate('Ce verbe fait partie du {group}.', { group: groupLabel }) : ''
  }).filter(Boolean))]
}

export function infinitiveIdentificationEndingHints(question: ExerciseQuestion, translate: HelpTranslate = french) {
  return [...new Set(question.reponsesPourCorrige.map(infinitive => {
    const ending = infinitive.match(/(?:oir|er|[iï]r|re)$/u)?.[0]
    return ending ? translate('Son infinitif se termine par « -{ending} ».', { ending }) : ''
  }).filter(Boolean))]
}

export function infinitiveIdentificationHint(question: ExerciseQuestion, translate: HelpTranslate = french) {
  if (question.reponsesPourCorrige.length > 1) return translate(INFINITIVE_AMBIGUITY_NOTICE)
  if (/^(?:se\s|s[’'])/iu.test(question.infinitif || '')) {
    return translate('C’est un verbe pronominal : conserve « se » ou « s’ » devant son infinitif.')
  }
  if (question.isCompound) {
    return translate('Repère le participe passé. Cherche l’infinitif du verbe principal, pas celui de l’auxiliaire.')
  }
  const infinitive = question.reponsesPourCorrige[0] || ''
  const ending = infinitive.match(/(?:oir|er|[iï]r|re)$/u)?.[0]
  return ending
    ? translate('Son infinitif se termine par « -{ending} ».', { ending })
    : translate('L’infinitif est la forme du verbe donnée dans le dictionnaire.')
}

export function infinitiveIdentificationFeedback(question: ExerciseQuestion, answer?: string, translate: HelpTranslate = french) {
  if (question.reponsesPourCorrige.length > 1) {
    return translate('Sans autre contexte, plusieurs infinitifs conviennent. Une seule de ces réponses suffit.')
  }
  if (/^(?:se\s|s[’'])/iu.test(question.infinitif || '')) {
    return translate('Le pronom fait partie du verbe pronominal : on le conserve sous la forme « se » ou « s’ » à l’infinitif.')
  }
  if (question.isCompound) {
    return ['avoir', 'être'].includes(normalizeAnswer(answer || ''))
      ? translate('Tu as donné l’infinitif de l’auxiliaire. Ici, on cherche celui du verbe principal, porté par le participe passé.')
      : translate('À un temps composé, l’auxiliaire accompagne le verbe principal. C’est l’infinitif de ce dernier qu’on cherche.')
  }
  return translate('L’infinitif est la forme du verbe donnée dans le dictionnaire.')
}

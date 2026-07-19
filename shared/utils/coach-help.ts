import { COACH_EXPLANATION_APPROACHES, type CoachExplanationApproach, type CoachHelpBlock, type CoachHelpBlockType, type CoachHelpTemplate, type CoachProfile } from '../types/coach'
import type { ConjugationTense, ExerciseQuestion, Verb } from '../types/conjugation'
import { withoutIndicativeMode } from './chat-mode-display'
import { buildConjugationBaseHtml, buildConjugationEndingsHtml, decomposeConjugationForm } from './conjugation-help'

const DEFAULT_TITLES: Record<CoachHelpBlockType, string> = {
  normal: '',
  warning: '',
  danger: '',
}

export function coachHelpBlockTitle(block: CoachHelpBlock): string {
  return block.title.trim() || DEFAULT_TITLES[block.type]
}

export function defaultCoachHelpBlocks(): CoachHelpBlock[] {
  return []
}

export function visibleCoachHelpBlocks(help?: CoachHelpTemplate | null): CoachHelpBlock[] {
  const configured = help?.status === 'published'
    ? help.blocks.filter(block => block.isActive).sort((left, right) => left.sortOrder - right.sortOrder)
    : []
  return configured.length ? configured : defaultCoachHelpBlocks()
}

const AUTOMATIC_LETTER_G_HELP_ID = -9_001
const AUTOMATIC_LETTER_C_HELP_ID = -9_002

export function automaticOrthographyHelpKind(block: Pick<CoachHelpBlock, 'id'>): 'g' | 'c' | null {
  if (block.id === AUTOMATIC_LETTER_G_HELP_ID) return 'g'
  if (block.id === AUTOMATIC_LETTER_C_HELP_ID) return 'c'
  return null
}

function escapedCoachText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function bareHelpInfinitive(value = ''): string {
  return value.trim().toLocaleLowerCase('fr').replace(/^(?:se\s+|s[’']\s*)/u, '')
}

function automaticLetterBlock(id: number, title: string, content: string): CoachHelpBlock {
  return {
    id,
    type: 'normal',
    title,
    content,
    explanationApproach: 'cif-falc',
    isActive: true,
    sortOrder: Number.MAX_SAFE_INTEGER,
    children: [],
  }
}

function letterGHelp(verb: string): CoachHelpBlock {
  const escapedVerb = escapedCoachText(verb)
  const stem = verb.slice(0, -2)
  const contextualExample = verb.endsWith('ger')
    ? `<p><strong>Avec ${escapedVerb} :</strong> on écrit <strong>nous ${escapedCoachText(`${stem}eons`)}</strong> et <strong>il ${escapedCoachText(`${stem}eait`)}</strong> pour garder le son « j ». Devant <strong>i</strong>, le g fait déjà le son « j » : <strong>nous ${escapedCoachText(`${stem}ions`)}</strong>.</p>`
    : `<p><strong>Avec ${escapedVerb} :</strong> le <strong>u</strong> reste dans les formes du verbe : <strong>nous ${escapedCoachText(`${stem}ons`)}</strong>, <strong>je ${escapedCoachText(`${stem}ais`)}</strong>, <strong>nous ${escapedCoachText(`${stem}ions`)}</strong>.</p>`

  return automaticLetterBlock(
    AUTOMATIC_LETTER_G_HELP_ID,
    'La lettre G',
    `<p><strong>La lettre g peut faire deux sons.</strong></p><table><tbody><tr><th>Le son « g »</th><td>gare · gomme · légume · grimper</td></tr><tr><th>Devant e, i ou y : le son « j »</th><td>rouge · girafe · gymnase</td></tr><tr><th>Pour garder le son « g » devant e, i ou y</th><td>Ajoute un u muet : bague · guerre · guitare</td></tr></tbody></table>${contextualExample}`,
  )
}

function letterCHelp(verb: string): CoachHelpBlock {
  const escapedVerb = escapedCoachText(verb)
  const stem = verb.slice(0, -2)
  const cedillaStem = stem.endsWith('c') ? `${stem.slice(0, -1)}ç` : stem
  return automaticLetterBlock(
    AUTOMATIC_LETTER_C_HELP_ID,
    'La lettre C et la cédille',
    `<p><strong>La lettre c peut faire deux sons.</strong></p><table><tbody><tr><th>Le son « k »</th><td>café · colle · cube · courir</td></tr><tr><th>Devant e, i ou y : le son « s »</th><td>cerise · citron · cygne</td></tr><tr><th>Pour garder le son « s » devant a, o ou u</th><td>Ajoute une cédille : ça · garçon · reçu</td></tr></tbody></table><p><strong>Avec ${escapedVerb} :</strong> on écrit <strong>nous ${escapedCoachText(`${cedillaStem}ons`)}</strong> et <strong>il ${escapedCoachText(`${cedillaStem}ait`)}</strong>. Devant <strong>i</strong>, le c fait déjà le son « s » : <strong>nous ${escapedCoachText(`${stem}ions`)}</strong>.</p>`,
  )
}

/** Blocs de lecture ajoutés en fin d’aide seulement lorsque l’orthographe du verbe les rend utiles. */
export function automaticOrthographyHelpBlocks(values: Pick<CoachHelpContentValues, 'verb'>): CoachHelpBlock[] {
  const verb = bareHelpInfinitive(values.verb)
  if (!verb) return []
  if (verb.endsWith('ger') || verb.endsWith('guer')) return [letterGHelp(verb)]
  if (verb.endsWith('cer')) return [letterCHelp(verb)]
  return []
}

export interface CoachHelpContentValues {
  coach?: Pick<CoachProfile, 'firstName'>
  verb?: string
  definition?: string
  helpTitle?: string
  mode?: string
  tense?: string
  subject?: string
  correctAnswers?: string
  auxiliaryAnswer?: string
  pastParticipleAnswer?: string
  unagreedPastParticiple?: string
  COD?: string
  isCODplace_avant?: string
  COI?: string
  isCOIplace_avant?: string
  endingsHelp?: string
  endingsHelpByApproach?: Partial<Record<CoachExplanationApproach, string>>
  contextualBaseHelp?: string
  contextualBaseHelpByApproach?: Partial<Record<CoachExplanationApproach, string>>
  conjugationBase?: string
  conjugationEnding?: string
  referenceMode?: string
  referenceTense?: string
  referenceSubject?: string
  referenceForm?: string
  referenceRadical?: string
  removedEnding?: string
  omitIndicativeMode?: boolean
}

export function coachHelpBlockUsesPedagogicalApproach(content: string): boolean {
  return /\{(?:endingsHelp|contextualBaseHelp)\}/u.test(content)
}

export function renderCoachHelpContent(content: string, values: CoachHelpContentValues, approach: CoachExplanationApproach = 'cif-falc'): string {
  const replacements: Record<string, string> = {
    coach: values.coach?.firstName.trim() || '',
    verb: values.verb || '',
    definition: values.definition || '',
    helpTitle: values.helpTitle || '',
    mode: values.mode || '',
    tense: values.tense || '',
    subject: values.subject || '',
    correctAnswers: values.correctAnswers || '',
    auxiliaryAnswer: values.auxiliaryAnswer || '',
    pastParticipleAnswer: values.pastParticipleAnswer || '',
    unagreedPastParticiple: values.unagreedPastParticiple || '',
    COD: values.COD || '',
    isCODplace_avant: values.isCODplace_avant || 'non',
    COI: values.COI || '',
    isCOIplace_avant: values.isCOIplace_avant || 'non',
    endingsHelp: values.endingsHelpByApproach?.[approach] || values.endingsHelp || '',
    contextualBaseHelp: values.contextualBaseHelpByApproach?.[approach] || values.contextualBaseHelp || '',
    conjugationBase: values.conjugationBase || '',
    conjugationEnding: values.conjugationEnding || '',
    referenceMode: values.referenceMode || '',
    referenceTense: values.referenceTense || '',
    referenceSubject: values.referenceSubject || '',
    referenceForm: values.referenceForm || '',
    referenceRadical: values.referenceRadical || '',
    removedEnding: values.removedEnding || '',
  }
  const rendered = content.replace(/\{(coach|verb|definition|helpTitle|mode|tense|subject|correctAnswers|auxiliaryAnswer|pastParticipleAnswer|unagreedPastParticiple|COD|isCODplace_avant|COI|isCOIplace_avant|endingsHelp|contextualBaseHelp|conjugationBase|conjugationEnding|referenceMode|referenceTense|referenceSubject|referenceForm|referenceRadical|removedEnding)\}/gu, (_match, key: string) => replacements[key] || '')
  return values.omitIndicativeMode ? withoutIndicativeMode(rendered) : rendered
}

function agreedParticipleInAnswer(answer: string, baseParticiple: string): string {
  if (!baseParticiple) return ''
  const escaped = baseParticiple.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
  const match = answer.match(new RegExp(`(?:^|[\\s’'])(${escaped}(?:e|s|es)?)(?=$|[\\s.,!?;:’'])`, 'iu'))
  return match?.[1] || baseParticiple
}

function auxiliaryPart(form: string, baseParticiple: string): string {
  const trimmed = form.trim()
  if (!trimmed || !baseParticiple) return ''
  const escaped = baseParticiple.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
  return trimmed.replace(new RegExp(`\\s+${escaped}(?:e|s|es)?$`, 'iu'), '').trim()
}

export function coachHelpQuestionVariables(question: ExerciseQuestion, verb?: Verb, tense?: ConjugationTense) {
  const complement = question.agreementReminder?.complement || question.complement || ''
  const isCod = question.complementFunction === 'cod' || question.agreementReminder?.kind === 'cod-before' || question.agreementReminder?.kind === 'cod-after'
  const isCoi = question.complementFunction === 'coi' || question.agreementReminder?.kind === 'coi'
  const baseParticiple = verb?.participePasse?.trim() || ''
  const firstCorrectAnswer = question.reponsesPourCorrige.find(answer => answer.trim()) || ''
  const decomposition = decomposeConjugationForm(question, verb, tense)
  const endingsHelpByApproach = Object.fromEntries(COACH_EXPLANATION_APPROACHES.map(approach => [
    approach,
    buildConjugationEndingsHtml(question, verb, tense, approach),
  ])) as Record<CoachExplanationApproach, string>
  const contextualBaseHelpByApproach = Object.fromEntries(COACH_EXPLANATION_APPROACHES.map(approach => [
    approach,
    buildConjugationBaseHtml(question, verb, tense, approach),
  ])) as Record<CoachExplanationApproach, string>
  return {
    verb: question.infinitif || verb?.infinitif || '',
    mode: question.mode || '',
    tense: question.temps || '',
    subject: question.pronom || question.saisiePrefixe || '',
    correctAnswers: [...new Set(question.reponsesPourCorrige.map(answer => answer.trim()).filter(Boolean))].join(' ou '),
    auxiliaryAnswer: question.isCompound ? auxiliaryPart(question.conjugaison1 || '', baseParticiple) : '',
    pastParticipleAnswer: question.isCompound
      ? question.agreementReminder?.participle || agreedParticipleInAnswer(firstCorrectAnswer, baseParticiple)
      : '',
    unagreedPastParticiple: baseParticiple,
    COD: isCod ? complement : '',
    isCODplace_avant: isCod && question.complementPosition === 'before' ? 'oui' : 'non',
    COI: isCoi ? complement : '',
    isCOIplace_avant: isCoi && question.complementPosition === 'before' ? 'oui' : 'non',
    endingsHelp: endingsHelpByApproach['cif-falc'],
    endingsHelpByApproach,
    contextualBaseHelp: contextualBaseHelpByApproach['cif-falc'],
    contextualBaseHelpByApproach,
    conjugationBase: decomposition ? `${decomposition.base}-` : '',
    conjugationEnding: decomposition ? `-${decomposition.ending}` : '',
    referenceMode: question.radicalReference?.referenceMode || '',
    referenceTense: question.radicalReference?.referenceTense || '',
    referenceSubject: question.radicalReference?.referenceSubject || '',
    referenceForm: question.radicalReference?.form || '',
    referenceRadical: question.radicalReference?.kind !== 'memorized-form' && question.radicalReference?.radical ? `${question.radicalReference.radical}-` : '',
    removedEnding: question.radicalReference?.removableEnding ? `-${question.radicalReference.removableEnding}` : '',
  }
}

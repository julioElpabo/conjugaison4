import type { CoachHelpBlock, CoachHelpBlockType, CoachHelpTemplate, CoachProfile } from '../types/coach'
import type { ConjugationTense, ExerciseQuestion, Verb } from '../types/conjugation'
import { buildConjugationEndingsHtml } from './conjugation-help'

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
}

export function renderCoachHelpContent(content: string, values: CoachHelpContentValues): string {
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
    endingsHelp: values.endingsHelp || '',
  }
  return content.replace(/\{(coach|verb|definition|helpTitle|mode|tense|subject|correctAnswers|auxiliaryAnswer|pastParticipleAnswer|unagreedPastParticiple|COD|isCODplace_avant|COI|isCOIplace_avant|endingsHelp)\}/gu, (_match, key: string) => replacements[key] || '')
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
    endingsHelp: buildConjugationEndingsHtml(question, verb, tense),
  }
}

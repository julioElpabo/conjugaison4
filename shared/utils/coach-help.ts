import { COACH_EXPLANATION_APPROACHES, type CoachExplanationApproach, type CoachHelpBlock, type CoachHelpBlockType, type CoachHelpTemplate, type CoachProfile } from '../types/coach'
import type { ConjugationTense, ExerciseQuestion, Verb } from '../types/conjugation'
import { withoutIndicativeMode } from './chat-mode-display'
import { buildConjugationBaseHtml, buildConjugationEndingsHtml, decomposeConjugationForm } from './conjugation-help'

const DEFAULT_TITLES: Record<CoachHelpBlockType, string> = {
  normal: '',
  info: '',
  success: '',
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
  definitionHelp?: string
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
  contextualBaseTitle?: string
  referenceFormHelp?: string
  /** Ancien nom conservé pour les blocs déjà enregistrés. */
  nousFormHelp?: string
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

export function buildContextualBaseTitle(infinitive: string, typeHInitial?: Verb['typeHInitial']): string {
  const verb = infinitive.trim()
  if (!verb) return 'Trouve le radical'
  const normalizedVerb = verb.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr')
  const elides = /^[aeiouy]/u.test(normalizedVerb) || (normalizedVerb.startsWith('h') && typeHInitial !== 'aspire')
  return `Trouve le radical ${elides ? 'd’' : 'de '}${verb}`
}

/** Définition FALC du verbe courant, prête à être affichée dans un bloc automatique. */
export function buildDefinitionHelpHtml(values: Pick<CoachHelpContentValues, 'verb' | 'definition'>): string {
  const verb = values.verb?.trim() || ''
  const definition = values.definition?.trim() || ''
  if (!verb && !definition) return ''
  if (!definition) return `<p><strong>${escapedCoachText(verb)}</strong></p>`
  if (!verb) return `<p>${escapedCoachText(definition)}</p>`
  return `<p><strong>${escapedCoachText(verb)}</strong> = ${escapedCoachText(definition)}</p>`
}

export function renderCoachHelpContent(content: string, values: CoachHelpContentValues, approach: CoachExplanationApproach = 'cif-falc'): string {
  const replacements: Record<string, string> = {
    coach: values.coach?.firstName.trim() || '',
    verb: values.verb || '',
    definition: values.definition || '',
    definitionHelp: values.definitionHelp || buildDefinitionHelpHtml(values),
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
    referenceFormHelp: values.referenceFormHelp || values.nousFormHelp || '',
    nousFormHelp: values.nousFormHelp || '',
    conjugationBase: values.conjugationBase || '',
    conjugationEnding: values.conjugationEnding || '',
    referenceMode: values.referenceMode || '',
    referenceTense: values.referenceTense || '',
    referenceSubject: values.referenceSubject || '',
    referenceForm: values.referenceForm || '',
    referenceRadical: values.referenceRadical || '',
    removedEnding: values.removedEnding || '',
  }
  const rendered = content.replace(/\{(coach|verb|definition|definitionHelp|helpTitle|mode|tense|subject|correctAnswers|auxiliaryAnswer|pastParticipleAnswer|unagreedPastParticiple|COD|isCODplace_avant|COI|isCOIplace_avant|endingsHelp|contextualBaseHelp|referenceFormHelp|nousFormHelp|conjugationBase|conjugationEnding|referenceMode|referenceTense|referenceSubject|referenceForm|referenceRadical|removedEnding)\}/gu, (_match, key: string) => replacements[key] || '')
  return values.omitIndicativeMode ? withoutIndicativeMode(rendered) : rendered
}

function startsWithVowelForArticle(value: string) {
  const first = value.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLocaleLowerCase('fr')
  return 'aeiouy'.includes(first)
}

function tenseWithArticle(value: string) {
  const tense = value.trim()
  return startsWithVowelForArticle(tense) ? `à l’${tense}` : `au ${tense}`
}

function modeWithArticle(value: string) {
  const mode = value.trim()
  return startsWithVowelForArticle(mode) ? `de l’${mode}` : `du ${mode}`
}

function normalizedGrammar(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLocaleLowerCase('fr')
}

function strongContext(tense: string, mode: string) {
  const normalizedMode = normalizedGrammar(mode)
  if (normalizedMode === 'conditionnel') {
    return `<strong>au conditionnel ${escapedCoachText(tense)}</strong>`
  }
  if (normalizedMode === 'imperatif') {
    return `<strong>à l’impératif ${escapedCoachText(tense)}</strong>`
  }
  if (normalizedMode === 'participe') {
    return `<strong>au participe ${escapedCoachText(tense)}</strong>`
  }
  if (normalizedMode === 'gerondif') {
    return `<strong>au gérondif ${escapedCoachText(tense)}</strong>`
  }
  if (normalizedMode === 'infinitif') {
    return `<strong>à l’infinitif ${escapedCoachText(tense)}</strong>`
  }
  return `<strong>${escapedCoachText(tenseWithArticle(tense))}</strong> <strong>${escapedCoachText(modeWithArticle(mode))}</strong>`
}

/** Forme principale choisie par la stratégie grammaticale, jamais « nous » par défaut. */
export function buildReferenceFormHelpHtml(question: ExerciseQuestion, verb?: Verb, tense?: ConjugationTense) {
  const infinitive = (question.infinitif || verb?.infinitif || '').trim()
  const tenseName = (question.temps || tense?.name || '').trim()
  const modeName = (question.mode || tense?.mode?.name || '').trim()
  if (!infinitive || !tenseName || !modeName) return ''

  const reference = question.radicalReference?.validated === false ? undefined : question.radicalReference
  const targetContext = strongContext(tenseName, modeName)
  if (reference?.kind === 'infinitive') {
    const displayedForm = reference.form.replace(/^./u, letter => letter.toLocaleUpperCase('fr'))
    return `<p>Pour conjuguer le verbe <strong>${escapedCoachText(infinitive)}</strong> ${targetContext}, pars de son <strong>infinitif</strong>.</p><p>La forme repère est <mark><strong><i>♥</i> ${escapedCoachText(displayedForm)}</strong></mark>.</p>`
  }
  if (reference?.kind === 'memorized-stem') {
    return `<p>Pour conjuguer le verbe <strong>${escapedCoachText(infinitive)}</strong> ${targetContext}, apprends son <strong>radical particulier</strong>.</p><p>Le radical à retenir est <mark><strong>${escapedCoachText(reference.form)}</strong></mark>.</p>`
  }

  const referenceSubject = reference?.referenceSubject?.trim() || ''
  const referenceMode = reference?.referenceMode?.trim() || modeName
  const referenceTense = reference?.referenceTense?.trim() || tenseName
  if (reference?.form && referenceSubject) {
    const sameContext = normalizedGrammar(referenceMode) === normalizedGrammar(modeName)
      && normalizedGrammar(referenceTense) === normalizedGrammar(tenseName)
    const instruction = sameContext
      ? `Apprends par cœur la forme du verbe <strong>${escapedCoachText(infinitive)}</strong> ${targetContext} avec le pronom <strong>${escapedCoachText(referenceSubject)}</strong> :`
      : `Pour conjuguer le verbe <strong>${escapedCoachText(infinitive)}</strong> ${targetContext}, apprends par cœur sa forme repère avec le pronom <strong>${escapedCoachText(referenceSubject)}</strong> :`
    const displayedForm = `${referenceSubject} ${reference.form}`.replace(/^./u, letter => letter.toLocaleUpperCase('fr'))
    return `<p>${instruction}</p><p><mark><strong><i>♥</i> ${escapedCoachText(displayedForm)}</strong></mark></p>`
  }

  const subject = (question.pronom || question.saisiePrefixe || '').trim()
  const nonPersonal = ['participe', 'gerondif', 'infinitif'].includes(normalizedGrammar(modeName))
  const fallbackForm = question.reponsesPourCorrige.find(value => value.trim())?.trim()
    || question.conjugaison1?.trim()
    || reference?.form?.trim()
    || ''
  if (nonPersonal) {
    return `<p>Le <strong>${escapedCoachText(modeName)}</strong> ne se conjugue pas avec un pronom personnel.</p><p>Pour le verbe <strong>${escapedCoachText(infinitive)}</strong>, la forme à retenir est <mark><strong>${escapedCoachText(fallbackForm)}</strong></mark>.</p>`
  }
  if (subject && fallbackForm) {
    return `<p>Cette forme ne se déduit pas sûrement d’une autre personne. Apprends par cœur la forme du verbe <strong>${escapedCoachText(infinitive)}</strong> ${targetContext} avec le pronom <strong>${escapedCoachText(subject)}</strong>.</p><p>La forme à retenir est <mark><strong>${escapedCoachText(fallbackForm)}</strong></mark>.</p>`
  }
  return `<p>Pour le verbe <strong>${escapedCoachText(infinitive)}</strong> ${targetContext}, aucune personne unique ne suffit comme forme repère.</p>`
}

/** Compatibilité des aides déjà enregistrées avec {nousFormHelp}. */
export function buildNousFormHelpHtml(question: ExerciseQuestion, verb?: Verb, tense?: ConjugationTense) {
  return buildReferenceFormHelpHtml(question, verb, tense)
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
  const referenceFormHelp = buildReferenceFormHelpHtml(question, verb, tense)
  const infinitive = question.infinitif || verb?.infinitif || ''
  return {
    verb: infinitive,
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
    contextualBaseTitle: buildContextualBaseTitle(infinitive, verb?.typeHInitial),
    referenceFormHelp,
    nousFormHelp: referenceFormHelp,
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

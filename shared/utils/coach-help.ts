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

export function automaticCoachHelpApproach(help?: CoachHelpTemplate | CoachExplanationApproach | null): CoachExplanationApproach {
  if (typeof help === 'string') return help
  return help?.blocks.find(block => block.content.trim() === '{contextualBaseHelp}')?.explanationApproach
    || help?.blocks.find(block => COACH_EXPLANATION_APPROACHES.includes(block.explanationApproach))?.explanationApproach
    || 'cif-falc'
}

/** Structure entièrement pilotée par le moteur grammatical. */
export function defaultCoachHelpBlocks(approach: CoachExplanationApproach = 'cif-falc'): CoachHelpBlock[] {
  return [
    {
      id: -8_001,
      type: 'normal',
      title: 'Définition',
      content: '{definitionHelp}',
      explanationApproach: approach,
      isActive: true,
      sortOrder: 1,
      children: [],
    },
    {
      id: -8_002,
      type: 'normal',
      title: '',
      content: '{contextualBaseHelp}',
      explanationApproach: approach,
      isActive: true,
      sortOrder: 2,
      children: [],
    },
  ]
}

export function visibleCoachHelpBlocks(help?: CoachHelpTemplate | CoachExplanationApproach | null): CoachHelpBlock[] {
  return defaultCoachHelpBlocks(automaticCoachHelpApproach(help))
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

function helpSubjectKey(value: string) {
  const subject = normalizedGrammar(value).replace(/^(?:que\s+|qu[’'])/u, '')
  if (/^(?:je|j')/u.test(subject)) return 'je'
  if (/^tu\b/u.test(subject)) return 'tu'
  if (/^(?:il|elle|on|ils|elles)\b/u.test(subject)) return subject.match(/^(?:il|elle|on|ils|elles)/u)?.[0] || subject
  if (/^nous\b/u.test(subject)) return 'nous'
  if (/^vous\b/u.test(subject)) return 'vous'
  return subject
}

function helpStartsWithVowelSound(value: string) {
  const first = normalizedGrammar(value).charAt(0)
  return 'aeiouy'.includes(first)
}

function displayedHelpConjugatedForm(subject: string, form: string, infinitive: string) {
  const cleanSubject = subject.trim()
  const cleanForm = form.trim()
  if (!cleanSubject) return cleanForm.replace(/^./u, letter => letter.toLocaleUpperCase('fr'))
  const pronominal = /^(?:se\s+|s['’])/iu.test(infinitive.trim())
  if (pronominal) {
    const key = helpSubjectKey(cleanSubject)
    const reflexive = key === 'je'
      ? helpStartsWithVowelSound(cleanForm) ? 'm’' : 'me'
      : key === 'tu'
        ? helpStartsWithVowelSound(cleanForm) ? 't’' : 'te'
        : ['il', 'elle', 'on', 'ils', 'elles'].includes(key)
          ? helpStartsWithVowelSound(cleanForm) ? 's’' : 'se'
          : key === 'nous'
            ? 'nous'
            : key === 'vous'
              ? 'vous'
              : ''
    const separator = reflexive.endsWith('’') ? '' : ' '
    return `${cleanSubject} ${reflexive}${separator}${cleanForm}`.replace(/^./u, letter => letter.toLocaleUpperCase('fr'))
  }
  if (helpSubjectKey(cleanSubject) === 'je' && helpStartsWithVowelSound(cleanForm)) return `J’${cleanForm}`
  return `${cleanSubject} ${cleanForm}`.replace(/^./u, letter => letter.toLocaleUpperCase('fr'))
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

function visibleHelpText(value = '') {
  return value
    .replace(/<[^>]+>/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
}

function letterGHelp(verb: string, answerText = ''): CoachHelpBlock {
  const escapedVerb = escapedCoachText(verb)
  const contextualExample = verb.endsWith('ger')
    ? /pas besoin de e|suivie de i/iu.test(visibleHelpText(answerText))
      ? `<p><strong>Avec ${escapedVerb} :</strong> devant <strong>i</strong>, le <strong>g</strong> fait déjà le son « j ». Le <strong>e</strong> n’est donc pas utile dans cette réponse.</p>`
      : `<p><strong>Avec ${escapedVerb} :</strong> on écrit <strong>ge</strong> devant <strong>a</strong> ou <strong>o</strong> pour garder le son « j ».</p>`
    : `<p><strong>Avec ${escapedVerb} :</strong> le <strong>u</strong> après <strong>g</strong> garde le son « g ».</p>`
  const rule = verb.endsWith('ger')
    ? `<p>La lettre <strong>g</strong> fait le son « j » devant <strong>e</strong>, <strong>i</strong> ou <strong>y</strong>.</p>${contextualExample}`
    : `<p>La lettre <strong>g</strong> peut faire le son « j » devant <strong>e</strong>, <strong>i</strong> ou <strong>y</strong>.</p><p>Pour garder le son « g », on ajoute souvent un <strong>u</strong> muet : <em>guitare</em>, <em>guerre</em>.</p>${contextualExample}`

  return automaticLetterBlock(
    AUTOMATIC_LETTER_G_HELP_ID,
    'La lettre G',
    rule,
  )
}

function letterCHelp(verb: string): CoachHelpBlock {
  const escapedVerb = escapedCoachText(verb)
  return automaticLetterBlock(
    AUTOMATIC_LETTER_C_HELP_ID,
    'La lettre C et la cédille',
    `<p><strong>La lettre c peut faire deux sons.</strong></p><table><tbody><tr><th>Le son « k »</th><td>café · colle · cube · courir</td></tr><tr><th>Devant e, i ou y : le son « s »</th><td>cerise · citron · cygne</td></tr><tr><th>Pour garder le son « s » devant a, o ou u</th><td>Ajoute une cédille : ça · garçon · reçu</td></tr></tbody></table><p><strong>Avec ${escapedVerb} :</strong> la cédille sert seulement devant <strong>a</strong>, <strong>o</strong> ou <strong>u</strong>.</p>`,
  )
}

/** Blocs de lecture ajoutés en fin d’aide seulement lorsque l’orthographe du verbe les rend utiles. */
export function automaticOrthographyHelpBlocks(values: Pick<CoachHelpContentValues, 'verb'> & Partial<Pick<CoachHelpContentValues, 'correctAnswers' | 'contextualBaseHelp'>>): CoachHelpBlock[] {
  const verb = bareHelpInfinitive(values.verb)
  const text = `${values.correctAnswers || ''} ${visibleHelpText(values.contextualBaseHelp || '')}`
  const normalizedText = text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr')
  if (!verb) return []
  if (verb.endsWith('ger') && (/\b\p{L}*ge[ao]\p{L}*/iu.test(text) || /pas besoin de e|lettre g est suivie de i/u.test(normalizedText))) return [letterGHelp(verb, text)]
  if (verb.endsWith('guer') && /\b\p{L}*gu\p{L}*/iu.test(text)) return [letterGHelp(verb, text)]
  if (verb.endsWith('cer') && (/\b\p{L}*ç[ao]\p{L}*/iu.test(text) || /cedille ne sert pas|ç redevient c/u.test(normalizedText))) return [letterCHelp(verb)]
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
    return `<p>Pour conjuguer le verbe <strong>${escapedCoachText(infinitive)}</strong> ${targetContext}, pars de son <strong>infinitif</strong>.</p><p>La forme repère est <mark><strong>${escapedCoachText(displayedForm)}</strong></mark>.</p>`
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
    const referenceContext = strongContext(referenceTense, referenceMode)
    const instruction = sameContext
      ? `Voici la forme repère du verbe <strong>${escapedCoachText(infinitive)}</strong> ${referenceContext}. Apprends-la par cœur, c’est très utile :`
      : `Pour conjuguer le verbe <strong>${escapedCoachText(infinitive)}</strong> ${targetContext}, utilise sa forme repère ${referenceContext}. Apprends-la par cœur, c’est très utile :`
    const displayedForm = displayedHelpConjugatedForm(referenceSubject, reference.form, infinitive)
    return `<p>${instruction}</p><p><mark><strong>${escapedCoachText(displayedForm)}</strong></mark></p>`
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

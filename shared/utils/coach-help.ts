import { COACH_EXPLANATION_APPROACHES, type CoachExplanationApproach, type CoachHelpBlock, type CoachHelpBlockType, type CoachHelpEngineKey, type CoachHelpTemplate, type CoachProfile } from '../types/coach'
import { coachHelpProfile, normalizeCoachHelpEngineKey, type CoachAutomaticHelpBlockId } from '../data/coach-help-profiles'
import { coachCondensedTenseRule } from '../data/coach-condensed-tense-rules'
import type { ConjugationTense, ExerciseQuestion, Verb } from '../types/conjugation'
import { withoutIndicativeMode } from './chat-mode-display'
import { buildCompleteConjugationAdviceHtml, buildConjugationBaseHtml, buildConjugationEndingsHtml, decomposeConjugationForm } from './conjugation-help'

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

export function automaticCoachHelpApproach(help?: CoachHelpTemplate | CoachHelpEngineKey | CoachExplanationApproach | null): CoachHelpEngineKey {
  if (typeof help === 'string') return normalizeCoachHelpEngineKey(help)
  const profileId = help?.blocks.find(block => block.profileId)?.profileId
  if (profileId) return profileId
  const legacy = help?.blocks.find(block => block.content.trim() === '{contextualBaseHelp}')?.explanationApproach
    || help?.blocks.find(block => COACH_EXPLANATION_APPROACHES.includes(block.explanationApproach))?.explanationApproach
  return normalizeCoachHelpEngineKey(legacy)
}

const AUTOMATIC_BLOCKS: Record<CoachAutomaticHelpBlockId, Pick<CoachHelpBlock, 'type' | 'title' | 'content'>> = {
  definition: { type: 'normal', title: 'Définition', content: '{definitionHelp}' },
  'complete-with-answers': { type: 'normal', title: '', content: '{contextualBaseHelp}' },
  'complete-advice': { type: 'normal', title: '', content: '{completeAdviceHelp}' },
  'condensed-verb-group': { type: 'normal', title: 'Groupe du verbe', content: '{condensedVerbGroupHelp}' },
  'condensed-tense-rule': { type: 'normal', title: '', content: '{condensedTenseRuleHelp}' },
}

/** La composition vient du profil : ajouter une exception revient à déclarer un bloc et sa règle. */
export function defaultCoachHelpBlocks(approach: CoachHelpEngineKey | CoachExplanationApproach = 'complete-avec-reponses'): CoachHelpBlock[] {
  const profile = coachHelpProfile(approach)
  return profile.blocks.map((blockId, index) => ({
    id: -8_001 - index,
    ...AUTOMATIC_BLOCKS[blockId],
    explanationApproach: profile.legacyPresentation,
    profileId: profile.id,
    isActive: true,
    sortOrder: index + 1,
    children: [],
  }))
}

export function visibleCoachHelpBlocks(help?: CoachHelpTemplate | CoachHelpEngineKey | CoachExplanationApproach | null): CoachHelpBlock[] {
  return defaultCoachHelpBlocks(automaticCoachHelpApproach(help))
}

const AUTOMATIC_LETTER_G_HELP_ID = -9_001
const AUTOMATIC_LETTER_C_HELP_ID = -9_002
const AUTOMATIC_COD_BEFORE_HELP_ID = -9_003
const AUTOMATIC_PARTICIPLE_AGREEMENT_HELP_ID = -9_004

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

function automaticCodBeforeHelpBlock(values: CoachHelpContentValues): CoachHelpBlock[] {
  const cod = values.COD?.trim() || ''
  if (!cod || values.isCODplace_avant !== 'oui') return []
  return [{
    id: AUTOMATIC_COD_BEFORE_HELP_ID,
    type: 'info',
    title: 'Le COD placé avant',
    content: `<p><strong>« ${escapedCoachText(cod)} »</strong> est le complément d’objet direct (COD) et il est placé avant le verbe.</p><p>Ne le confonds pas avec le sujet : pour conjuguer le verbe, cherche qui fait l’action.</p><p>À un temps composé avec <strong>avoir</strong>, le participe passé s’accorde avec le COD lorsqu’il est placé avant.</p>`,
    explanationApproach: 'cif-falc',
    profileId: 'complete',
    isActive: true,
    sortOrder: Number.MAX_SAFE_INTEGER - 1,
    children: [],
  }]
}

function automaticParticipleAgreementHelpBlock(values: CoachHelpContentValues): CoachHelpBlock[] {
  if (!values.isCompound) return []
  const cod = values.COD?.trim() || ''
  const coi = values.COI?.trim() || ''
  if (!cod && !coi) return []

  const auxiliary = normalizedGrammar(values.auxiliary || '') === 'etre' ? 'être' : 'avoir'
  let content = ''
  if (coi) {
    content = `<p><strong>« ${escapedCoachText(coi)} »</strong> est un complément d’objet indirect (COI).</p><p>Un COI ne commande pas l’accord du participe passé.</p>${auxiliary === 'être' ? '<p>Avec <strong>être</strong>, vérifie néanmoins l’accord avec le sujet ou la règle propre au verbe pronominal.</p>' : ''}`
  } else if (values.isCODplace_avant === 'oui') {
    content = `<p><strong>« ${escapedCoachText(cod)} »</strong> est un complément d’objet direct (COD) placé avant le verbe.</p>${auxiliary === 'avoir' ? '<p>Avec <strong>avoir</strong>, le participe passé s’accorde avec le COD placé avant.</p>' : '<p>Avec <strong>être</strong>, vérifie aussi la règle d’accord avec le sujet ou celle du verbe pronominal.</p>'}`
  } else {
    content = `<p><strong>« ${escapedCoachText(cod)} »</strong> est un complément d’objet direct (COD) placé après le verbe.</p>${auxiliary === 'avoir' ? '<p>Avec <strong>avoir</strong>, ce COD placé après ne commande pas l’accord du participe passé.</p>' : '<p>Avec <strong>être</strong>, vérifie l’accord avec le sujet ou la règle propre au verbe pronominal.</p>'}`
  }

  return [{
    id: AUTOMATIC_PARTICIPLE_AGREEMENT_HELP_ID,
    type: 'info',
    title: 'Accord du participe passé',
    content,
    explanationApproach: 'concise',
    profileId: 'tres-condensee',
    isActive: true,
    sortOrder: Number.MAX_SAFE_INTEGER,
    children: [],
  }]
}

/** Résout les blocs exceptionnels déclarés par le profil avec les données de la question. */
export function conditionalCoachHelpBlocks(profileId: CoachHelpEngineKey | undefined, values: CoachHelpContentValues): CoachHelpBlock[] {
  const profile = coachHelpProfile(profileId)
  return profile.conditionalBlocks.flatMap((blockId) => {
    if (blockId === 'orthography') return automaticOrthographyHelpBlocks(values)
    if (blockId === 'cod-before') return automaticCodBeforeHelpBlock(values)
    if (blockId === 'participle-agreement') return automaticParticipleAgreementHelpBlock(values)
    return []
  })
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
  isCompound?: boolean
  auxiliary?: string
  endingsHelp?: string
  endingsHelpByApproach?: Partial<Record<CoachExplanationApproach, string>>
  contextualBaseHelp?: string
  contextualBaseHelpByApproach?: Partial<Record<CoachExplanationApproach, string>>
  completeAdviceHelp?: string
  condensedVerbGroupHelp?: string
  condensedTenseRuleHelp?: string
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
  return /\{(?:endingsHelp|contextualBaseHelp|completeAdviceHelp|condensedTenseRuleHelp)\}/u.test(content)
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

type CondensedVerb = Pick<Verb, 'infinitif'> & Partial<Pick<Verb, 'groupeConjugaison' | 'auxiliaire' | 'typePronominal' | 'participePresent'>>

function isCondensedPronominalVerb(verb?: CondensedVerb) {
  const infinitive = verb?.infinitif?.trim() || ''
  return /^(?:se\s+|s[’'])/iu.test(infinitive) || Boolean(verb?.typePronominal && verb.typePronominal !== 'aucun')
}

function condensedVerbAuxiliary(verb?: CondensedVerb) {
  if (isCondensedPronominalVerb(verb)) return 'être'
  const auxiliary = normalizedGrammar(verb?.auxiliaire || '')
  return auxiliary === 'etre' ? 'être' : auxiliary === 'avoir' ? 'avoir' : ''
}

function contextualCondensedTenseRule(mode?: string, tense?: string, verb?: CondensedVerb) {
  const source = coachCondensedTenseRule(mode, tense)
  const key = `${normalizedGrammar(mode || '')}:${normalizedGrammar(tense || '')}`
  const infinitive = bareHelpInfinitive(verb?.infinitif || '')
  const auxiliary = condensedVerbAuxiliary(verb)
  let rule = source.rule
  let example = source.example
  const notes = [...(source.notes || [])]

  if (key === 'imperatif:present' && ['avoir', 'etre', 'savoir', 'vouloir'].includes(normalizedGrammar(infinitive))) {
    rule = 'Exception : ce verbe a des formes particulières à l’impératif, à apprendre par cœur.'
    notes.splice(0, notes.length, 'Ne construis pas sa réponse à partir de la forme habituelle du présent.')
  }

  if (key === 'participe:present' && ['avoir', 'etre', 'savoir'].includes(normalizedGrammar(infinitive))) {
    rule = 'Exception : ce verbe a un participe présent irrégulier, à apprendre par cœur.'
    notes.splice(0, notes.length, 'La règle « nous au présent sans -ons » ne fonctionne pas pour ce verbe.')
  }

  if (key === 'gerondif:present' && ['avoir', 'etre', 'savoir'].includes(normalizedGrammar(infinitive))) {
    rule = '« en » + participe présent.'
    notes.push('Exception : le participe présent de ce verbe est irrégulier et doit être appris par cœur.')
  }

  const compoundKeys = new Set([
    'indicatif:passe compose', 'indicatif:futur anterieur', 'indicatif:plus-que-parfait', 'indicatif:passe anterieur',
    'imperatif:passe', 'subjonctif:passe', 'subjonctif:plus-que-parfait',
    'conditionnel:passe 1', 'conditionnel:passe 2', 'gerondif:passe',
  ])
  if (auxiliary && compoundKeys.has(key)) {
    rule = source.rule.replace(/^Auxiliaire/u, `Auxiliaire « ${auxiliary} »`)
    if (auxiliary === 'être') {
      notes.push(isCondensedPronominalVerb(verb)
        ? 'Avec un verbe pronominal, vérifie l’accord du participe passé : il dépend de la fonction du pronom et d’un éventuel COD.'
        : 'Avec « être », le participe passé s’accorde avec le sujet.')
    }
    const examplesWithEtre: Record<string, string> = {
      'indicatif:passe compose': 'elle est + arrivée = elle est arrivée',
      'indicatif:futur anterieur': 'elle sera + arrivée = elle sera arrivée',
      'indicatif:plus-que-parfait': 'elle était + arrivée = elle était arrivée',
      'indicatif:passe anterieur': 'elle fut + arrivée = elle fut arrivée',
      'imperatif:passe': 'soyez + partis = soyez partis !',
      'subjonctif:passe': 'qu’elle soit + arrivée = qu’elle soit arrivée',
      'subjonctif:plus-que-parfait': 'qu’elle fût + arrivée = qu’elle fût arrivée',
      'conditionnel:passe 1': 'elle serait + arrivée = elle serait arrivée',
      'conditionnel:passe 2': 'elle fût + arrivée = elle fût arrivée',
      'gerondif:passe': 'en + étant + arrivé = en étant arrivé',
    }
    if (auxiliary === 'être' && examplesWithEtre[key]) example = examplesWithEtre[key]
  }

  // L’exemple modèle ne doit jamais donner par hasard la réponse du verbe demandé.
  if (normalizedGrammar(infinitive) === 'chanter') {
    example = example.replaceAll('chanter', 'parler').replaceAll('chant', 'parl')
  }

  return { ...source, rule, notes, example }
}

export function buildCondensedTenseRuleHtml(mode?: string, tense?: string, verb?: CondensedVerb) {
  const rule = contextualCondensedTenseRule(mode, tense, verb)
  const notes = rule.notes.map(note => `<p>${escapedCoachText(note)}</p>`).join('')
  return `<p><strong>${escapedCoachText(rule.label)}</strong></p><p>${escapedCoachText(rule.rule)}</p>${notes}<p><strong>Exemple :</strong><br><code>${escapedCoachText(rule.example)}</code></p>`
}

function condensedReferenceFormExplanation(mode = '', tense = '', currentSubject = '', auxiliary = 'avoir', pronominal = false) {
  const key = `${normalizedGrammar(mode)}:${normalizedGrammar(tense)}`
  const useVous = normalizedGrammar(currentSubject).includes('nous')
  const subject = useVous ? 'vous' : 'nous'
  const choice = useVous ? 1 : 0
  const simpleGuides: Record<string, { reference: string, endings: [string, string], forms: [string, string], omitSubject?: boolean }> = {
    'indicatif:present': { reference: 'Infinitif : « chanter » → radical <code>chant-</code>.', endings: ['-ons', '-ez'], forms: ['nous chantons', 'vous chantez'] },
    'indicatif:imparfait': { reference: 'Forme repère : « nous chantons » → radical <code>chant-</code>.', endings: ['-ions', '-iez'], forms: ['nous chantions', 'vous chantiez'] },
    'indicatif:futur': { reference: 'Infinitif : « chanter » → radical du futur <code>chanter-</code>.', endings: ['-ons', '-ez'], forms: ['nous chanterons', 'vous chanterez'] },
    'indicatif:passe simple': { reference: 'Infinitif : « chanter » → radical <code>chant-</code>.', endings: ['-âmes', '-âtes'], forms: ['nous chantâmes', 'vous chantâtes'] },
    'imperatif:present': { reference: 'Forme repère au présent : « nous chantons » ou « vous chantez ». Enlève le sujet.', endings: ['-ons', '-ez'], forms: ['chantons !', 'chantez !'], omitSubject: true },
    'subjonctif:present': { reference: 'Forme repère : « ils chantent » → radical <code>chant-</code>.', endings: ['-ions', '-iez'], forms: ['que nous chantions', 'que vous chantiez'] },
    'subjonctif:imparfait': { reference: 'Forme repère : « il chanta » → radical <code>chanta-</code>.', endings: ['-ssions', '-ssiez'], forms: ['que nous chantassions', 'que vous chantassiez'] },
    'conditionnel:present': { reference: 'Forme repère au futur : « nous chanterons » → radical <code>chanter-</code>.', endings: ['-ions', '-iez'], forms: ['nous chanterions', 'vous chanteriez'] },
  }
  const compoundGuides: Record<string, { auxiliaryTense: string, omitSubject?: boolean }> = {
    'indicatif:passe compose': { auxiliaryTense: 'présent' },
    'indicatif:futur anterieur': { auxiliaryTense: 'futur' },
    'indicatif:plus-que-parfait': { auxiliaryTense: 'imparfait' },
    'indicatif:passe anterieur': { auxiliaryTense: 'passé simple' },
    'imperatif:passe': { auxiliaryTense: 'impératif présent', omitSubject: true },
    'subjonctif:passe': { auxiliaryTense: 'subjonctif présent' },
    'subjonctif:plus-que-parfait': { auxiliaryTense: 'subjonctif imparfait' },
    'conditionnel:passe 1': { auxiliaryTense: 'conditionnel présent' },
    'conditionnel:passe 2': { auxiliaryTense: 'subjonctif imparfait' },
  }
  const simple = simpleGuides[key]
  if (simple) {
    return `<details><summary>Qu’est-ce que c’est ?</summary><p>Une forme repère est une forme du verbe que tu as apprise par cœur.</p><p><strong>Exemple :</strong></p><p>Trouve le radical. ${simple.reference}</p></details>`
  }
  const compound = compoundGuides[key]
  if (compound) {
    const formsByAuxiliary: Record<string, Record<string, [string, string]>> = {
      avoir: {
        présent: ['nous avons', 'vous avez'], futur: ['nous aurons', 'vous aurez'], imparfait: ['nous avions', 'vous aviez'],
        'passé simple': ['nous eûmes', 'vous eûtes'], 'impératif présent': ['ayons', 'ayez'],
        'subjonctif présent': ['que nous ayons', 'que vous ayez'], 'subjonctif imparfait': ['que nous eussions', 'que vous eussiez'],
        'conditionnel présent': ['nous aurions', 'vous auriez'],
      },
      être: {
        présent: ['nous sommes', 'vous êtes'], futur: ['nous serons', 'vous serez'], imparfait: ['nous étions', 'vous étiez'],
        'passé simple': ['nous fûmes', 'vous fûtes'], 'impératif présent': ['soyons', 'soyez'],
        'subjonctif présent': ['que nous soyons', 'que vous soyez'], 'subjonctif imparfait': ['que nous fussions', 'que vous fussiez'],
        'conditionnel présent': ['nous serions', 'vous seriez'],
      },
    }
    const selectedAuxiliary = normalizedGrammar(auxiliary) === 'etre' ? 'être' : 'avoir'
    const auxiliaryForm = formsByAuxiliary[selectedAuxiliary]![compound.auxiliaryTense]![choice]
    const agreement = selectedAuxiliary === 'être'
      ? pronominal
        ? '<p>3. Pour un verbe pronominal, vérifie l’accord du participe passé selon la fonction du pronom et la présence éventuelle d’un COD.</p>'
        : '<p>3. Avec « être », accorde le participe passé avec le sujet.</p>'
      : ''
    return `<details><summary>Qu’est-ce que c’est ?</summary><p>Une forme repère est une forme du verbe que tu as apprise par cœur.</p><p><strong>Exemple :</strong></p><p>1. Forme repère de l’auxiliaire « ${selectedAuxiliary} » ${tenseWithArticle(compound.auxiliaryTense)} : <code>${auxiliaryForm}</code>.</p><p>2. La terminaison est portée par l’auxiliaire. Ajoute ensuite le participe passé.</p>${agreement}</details>`
  }
  const nonPersonalGuides: Record<string, [string, string, string]> = {
    'participe:present': ['« nous chantons » → radical <code>chant-</code>', 'Ajoute <code>-ant</code>.', '<code>chant- + -ant = chantant</code>'],
    'participe:passe': ['Infinitif : <code>chanter</code>.', 'Apprends sa forme au participe passé : <code>chanté</code>.', '<code>chanter → chanté</code>'],
    'gerondif:present': ['Participe présent de « chanter » : <code>chantant</code>.', 'Ajoute <code>en</code>.', '<code>en + chantant = en chantant</code>'],
    'gerondif:passe': ['Participe présent de l’auxiliaire « avoir » : <code>ayant</code>.', 'Ajoute le participe passé <code>chanté</code>.', '<code>en + ayant + chanté = en ayant chanté</code>'],
  }
  const nonPersonal = nonPersonalGuides[key]
  if (nonPersonal) {
    return `<details><summary>Qu’est-ce que c’est ?</summary><p>Une forme repère est une forme du verbe que tu as apprise par cœur.</p><p><strong>Exemple :</strong></p><p>Ce mode n’a pas de personne grammaticale.</p><p>1. ${nonPersonal[0]}.</p><p>2. ${nonPersonal[1]}</p><p>3. Construis la réponse : ${nonPersonal[2]}.</p></details>`
  }
  return '<details><summary>Qu’est-ce que c’est ?</summary><p>Une forme repère est une forme du verbe que tu as apprise par cœur.</p></details>'
}

export function buildCondensedVerbGroupHtml(verb?: CondensedVerb, context: { mode?: string, tense?: string, subject?: string } = {}) {
  const infinitive = verb?.infinitif?.trim() || 'Ce verbe'
  const group = verb?.groupeConjugaison
  if (!group) return `<p><strong>${escapedCoachText(infinitive)}</strong> : groupe non renseigné.</p>`
  const label = `${group}${group === 1 ? 'er' : 'e'} groupe`
  const consequences = group === 1
    ? ['Conjugaison généralement régulière.', 'Attention : le radical ne s’écrit pas toujours de la même façon.']
    : group === 2
      ? ['Conjugaison régulière, sur le modèle de « finir ». Le radical prend souvent « -iss- ».']
      : ['Conjugaison souvent irrégulière : le radical et les terminaisons peuvent changer. Appuie-toi sur les formes repères.']
  const consequenceParagraphs = consequences.map(consequence => `<p>${escapedCoachText(consequence)}</p>`).join('')
  const referenceFormExplanation = group === 3
    ? condensedReferenceFormExplanation(context.mode, context.tense, context.subject, condensedVerbAuxiliary(verb) || 'avoir', isCondensedPronominalVerb(verb))
    : ''
  return `<p><strong>${escapedCoachText(infinitive)}</strong> appartient au <strong>${label}</strong>.</p>${consequenceParagraphs}${referenceFormExplanation}`
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
    completeAdviceHelp: values.completeAdviceHelp || '',
    condensedVerbGroupHelp: values.condensedVerbGroupHelp || '',
    condensedTenseRuleHelp: values.condensedTenseRuleHelp || '',
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
  const rendered = content.replace(/\{(coach|verb|definition|definitionHelp|helpTitle|mode|tense|subject|correctAnswers|auxiliaryAnswer|pastParticipleAnswer|unagreedPastParticiple|COD|isCODplace_avant|COI|isCOIplace_avant|endingsHelp|contextualBaseHelp|completeAdviceHelp|condensedVerbGroupHelp|condensedTenseRuleHelp|referenceFormHelp|nousFormHelp|conjugationBase|conjugationEnding|referenceMode|referenceTense|referenceSubject|referenceForm|referenceRadical|removedEnding)\}/gu, (_match, key: string) => replacements[key] || '')
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
    isCODplace_avant: isCod && (question.complementPosition === 'before' || question.agreementReminder?.kind === 'cod-before') ? 'oui' : 'non',
    COI: isCoi ? complement : '',
    isCOIplace_avant: isCoi && question.complementPosition === 'before' ? 'oui' : 'non',
    isCompound: Boolean(question.isCompound || tense?.isCompound),
    auxiliary: isCondensedPronominalVerb(verb) ? 'être' : verb?.auxiliaire?.trim() || '',
    endingsHelp: endingsHelpByApproach['cif-falc'],
    endingsHelpByApproach,
    contextualBaseHelp: contextualBaseHelpByApproach['cif-falc'],
    contextualBaseHelpByApproach,
    completeAdviceHelp: buildCompleteConjugationAdviceHtml(question, verb, tense),
    condensedVerbGroupHelp: buildCondensedVerbGroupHtml(verb, {
      mode: question.mode || tense?.mode?.name,
      tense: question.temps || tense?.name,
      subject: question.pronom || question.saisiePrefixe,
    }),
    condensedTenseRuleHelp: buildCondensedTenseRuleHtml(question.mode || tense?.mode?.name, question.temps || tense?.name, verb),
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

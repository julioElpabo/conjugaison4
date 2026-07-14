import type {
  ChallengeConfig,
  ChallengePreset,
  ChallengePresetGroup,
  ComplementPlacement,
  LegacyChallengeTuple,
  TenseId,
  Verb,
  VerbId,
} from '../types/conjugation.ts'

type FilterableVerbField =
  | 'groupeConjugaison'
  | 'terminaison'
  | 'typePronominal'
  | 'niveauDifficulte'
  | 'registrePrincipal'
  | 'particularites'
  | 'niveauxScolaires'
  | 'parcoursCif'
  | 'categoriesSemantiques'

export type VerbCriterion =
  | { field: FilterableVerbField, operator: 'equals', value: string | number }
  | { field: FilterableVerbField, operator: 'not-equals', value: string | number }
  | { field: FilterableVerbField, operator: 'includes', value: string }
  | { field: FilterableVerbField, operator: 'not-in', value: readonly (string | number)[] }
  | { field: FilterableVerbField, operator: 'gte', value: number }
  | { field: 'complementExample', operator: 'has-anteposable-cod' }

export interface ChallengePresetDefinition {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly group: ChallengePresetGroup
  readonly criteria: readonly VerbCriterion[]
  readonly tenseIds: readonly TenseId[]
  readonly questionCount: number
  readonly includeComplements?: boolean
  readonly complementPlacement?: ComplementPlacement
}

const personalPresent = [1] as const
const coreTenses = [1, 2, 3, 4, 5, 6] as const
const secondaryTenses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15] as const

export const challengePresetDefinitions = [
  { id: '5P', label: '5P', description: 'Verbes et temps usuels de 5P.', group: 'school', criteria: [{ field: 'niveauxScolaires', operator: 'includes', value: '5P' }], tenseIds: [1, 2], questionCount: 20 },
  { id: '6P', label: '6P', description: 'Verbes et temps usuels de 6P.', group: 'school', criteria: [{ field: 'niveauxScolaires', operator: 'includes', value: '6P' }], tenseIds: [1, 2, 3, 5], questionCount: 20 },
  { id: '7H', label: '7H', description: 'Programme de conjugaison de 7H.', group: 'school', criteria: [{ field: 'niveauxScolaires', operator: 'includes', value: '7H' }], tenseIds: [1, 2, 3, 5, 9, 14], questionCount: 20 },
  { id: '8H', label: '8H', description: 'Programme de conjugaison de 8H.', group: 'school', criteria: [{ field: 'niveauxScolaires', operator: 'includes', value: '8H' }], tenseIds: [1, 2, 3, 4, 5, 6, 7, 9, 14], questionCount: 20 },
  { id: '9H', label: '9H', description: 'Programme de conjugaison de 9H.', group: 'school', criteria: [{ field: 'niveauxScolaires', operator: 'includes', value: '9H' }], tenseIds: secondaryTenses, questionCount: 20 },
  { id: '10H', label: '10H', description: 'Programme de conjugaison de 10H.', group: 'school', criteria: [{ field: 'niveauxScolaires', operator: 'includes', value: '10H' }], tenseIds: secondaryTenses, questionCount: 20 },
  { id: '11H', label: '11H', description: 'Programme de conjugaison de 11H.', group: 'school', criteria: [{ field: 'niveauxScolaires', operator: 'includes', value: '11H' }], tenseIds: secondaryTenses, questionCount: 20 },
  { id: 'groupe1', label: 'Premier groupe', description: 'Tous les verbes du premier groupe.', group: 'verb-group', criteria: [{ field: 'groupeConjugaison', operator: 'equals', value: 1 }], tenseIds: personalPresent, questionCount: 20 },
  { id: 'groupe2', label: 'Deuxième groupe', description: 'Tous les verbes du deuxième groupe.', group: 'verb-group', criteria: [{ field: 'groupeConjugaison', operator: 'equals', value: 2 }], tenseIds: personalPresent, questionCount: 20 },
  { id: 'groupe3', label: 'Troisième groupe', description: 'Tous les verbes du troisième groupe.', group: 'verb-group', criteria: [{ field: 'groupeConjugaison', operator: 'equals', value: 3 }], tenseIds: personalPresent, questionCount: 20 },
  { id: 'groupe3ir', label: 'Troisième groupe en -ir', description: 'Verbes du troisième groupe terminés par -ir.', group: 'verb-group', criteria: [{ field: 'groupeConjugaison', operator: 'equals', value: 3 }, { field: 'terminaison', operator: 'equals', value: 'ir' }], tenseIds: personalPresent, questionCount: 20 },
  { id: 'groupe3oir', label: 'Troisième groupe en -oir', description: 'Verbes du troisième groupe terminés par -oir.', group: 'verb-group', criteria: [{ field: 'groupeConjugaison', operator: 'equals', value: 3 }, { field: 'terminaison', operator: 'equals', value: 'oir' }], tenseIds: personalPresent, questionCount: 20 },
  { id: 'groupe3autres', label: 'Autres verbes du troisième groupe', description: 'Verbes du troisième groupe hors terminaisons -ir et -oir.', group: 'verb-group', criteria: [{ field: 'groupeConjugaison', operator: 'equals', value: 3 }, { field: 'terminaison', operator: 'not-in', value: ['ir', 'oir'] }], tenseIds: personalPresent, questionCount: 20 },
  { id: 'ger', label: 'Verbes en -ger', description: 'Particularités orthographiques des verbes en -ger.', group: 'spelling', criteria: [{ field: 'particularites', operator: 'includes', value: 'ger' }], tenseIds: coreTenses, questionCount: 20 },
  { id: 'cer', label: 'Verbes en -cer', description: 'Particularités orthographiques des verbes en -cer.', group: 'spelling', criteria: [{ field: 'particularites', operator: 'includes', value: 'cer' }], tenseIds: coreTenses, questionCount: 20 },
  { id: 'ger-cer', label: 'Verbes en -ger et -cer', description: 'Entraînement combiné aux verbes en -ger et -cer.', group: 'spelling', criteria: [], tenseIds: coreTenses, questionCount: 20 },
  { id: 'sens-mouvement', label: 'Mouvement et déplacement', description: 'Aller, venir, partir et autres verbes de déplacement.', group: 'semantic', criteria: [{ field: 'categoriesSemantiques', operator: 'includes', value: 'mouvement' }], tenseIds: coreTenses, questionCount: 20 },
  { id: 'sens-communication', label: 'Communication', description: 'Dire, parler, répondre, expliquer et raconter.', group: 'semantic', criteria: [{ field: 'categoriesSemantiques', operator: 'includes', value: 'communication' }], tenseIds: coreTenses, questionCount: 20 },
  { id: 'sens-cognition', label: 'Pensée et connaissance', description: 'Penser, savoir, comprendre, apprendre et décider.', group: 'semantic', criteria: [{ field: 'categoriesSemantiques', operator: 'includes', value: 'cognition' }], tenseIds: coreTenses, questionCount: 20 },
  { id: 'sens-emotion', label: 'Émotions et appréciation', description: 'Aimer, préférer, craindre, rire et ressentir.', group: 'semantic', criteria: [{ field: 'categoriesSemantiques', operator: 'includes', value: 'emotion' }], tenseIds: coreTenses, questionCount: 20 },
  { id: 'sens-corps', label: 'Corps et besoins', description: 'Manger, boire, dormir et prendre soin de soi.', group: 'semantic', criteria: [{ field: 'categoriesSemantiques', operator: 'includes', value: 'corps' }], tenseIds: coreTenses, questionCount: 20 },
  { id: 'cod-apres-passe-compose', label: '1. COD après le verbe', description: 'Reconnaître qu’un COD placé après ne commande pas l’accord du participe passé.', group: 'agreement', criteria: [{ field: 'complementExample', operator: 'has-anteposable-cod' }], tenseIds: [5], questionCount: 20, includeComplements: true, complementPlacement: 'after' },
  { id: 'cod-avant-passe-compose', label: '2. COD avant le verbe', description: 'Accorder le participe passé avec un COD antéposé au passé composé.', group: 'agreement', criteria: [{ field: 'complementExample', operator: 'has-anteposable-cod' }], tenseIds: [5], questionCount: 20, includeComplements: true, complementPlacement: 'before' },
  { id: 'cod-avant-indicatif-compose', label: '3. Tous les temps composés', description: 'Accorder le COD antéposé aux quatre temps composés de l’indicatif.', group: 'agreement', criteria: [{ field: 'complementExample', operator: 'has-anteposable-cod' }], tenseIds: [5, 6, 7, 8], questionCount: 30, includeComplements: true, complementPlacement: 'before' },
  { id: 'cod-mixte-indicatif-compose', label: '4. Avant ou après ?', description: 'Décider s’il faut accorder selon la position du COD dans la phrase.', group: 'agreement', criteria: [{ field: 'complementExample', operator: 'has-anteposable-cod' }], tenseIds: [5, 6, 7, 8], questionCount: 30, includeComplements: true, complementPlacement: 'mixed' },
  { id: 'cod-mixte-tous-modes', label: '5. Défi expert', description: 'COD avant ou après avec les temps composés de l’indicatif, du subjonctif et du conditionnel.', group: 'agreement', criteria: [{ field: 'complementExample', operator: 'has-anteposable-cod' }], tenseIds: [5, 6, 7, 8, 11, 17, 15, 19], questionCount: 40, includeComplements: true, complementPlacement: 'mixed' },
  { id: 'rares', label: 'Verbes rares', description: 'Verbes marqués comme rares ou vieillis.', group: 'training', criteria: [{ field: 'registrePrincipal', operator: 'equals', value: 'rare' }], tenseIds: coreTenses, questionCount: 20 },
  { id: 'difficiles', label: 'Verbes difficiles', description: 'Conjugaisons de difficulté élevée.', group: 'training', criteria: [{ field: 'niveauDifficulte', operator: 'gte', value: 3 }], tenseIds: coreTenses, questionCount: 20 },
  { id: 'pronominaux', label: 'Verbes pronominaux', description: 'Tous les verbes pronominaux du catalogue.', group: 'training', criteria: [{ field: 'typePronominal', operator: 'not-equals', value: 'aucun' }], tenseIds: coreTenses, questionCount: 20 },
  { id: 'CIF1', label: 'CIF 1', description: 'Premier parcours CIF historique.', group: 'training', criteria: [{ field: 'parcoursCif', operator: 'includes', value: 'CIF1' }], tenseIds: [1], questionCount: 10 },
  { id: 'CIF2', label: 'CIF 2', description: 'Deuxième parcours CIF historique.', group: 'training', criteria: [{ field: 'parcoursCif', operator: 'includes', value: 'CIF2' }], tenseIds: [1], questionCount: 20 },
  { id: 'CIF3', label: 'CIF 3', description: 'Troisième parcours CIF historique.', group: 'training', criteria: [{ field: 'parcoursCif', operator: 'includes', value: 'CIF3' }], tenseIds: [1, 2, 3, 4], questionCount: 20 },
  { id: 'CIF4', label: 'CIF 4', description: 'Quatrième parcours CIF historique.', group: 'training', criteria: [{ field: 'parcoursCif', operator: 'includes', value: 'CIF4' }], tenseIds: coreTenses, questionCount: 20 },
] as const satisfies readonly ChallengePresetDefinition[]

export type ChallengePresetId = (typeof challengePresetDefinitions)[number]['id']

function matchesCriterion(verb: Verb, criterion: VerbCriterion) {
  if (criterion.operator === 'has-anteposable-cod') {
    return verb.complementExample?.functionObject === 'cod'
      && Boolean(verb.complementExample.before)
  }
  const value = verb[criterion.field]
  if (criterion.operator === 'includes') return Array.isArray(value) && value.includes(criterion.value)
  if (criterion.operator === 'not-in') return !criterion.value.includes(value as string | number)
  if (criterion.operator === 'gte') return typeof value === 'number' && value >= criterion.value
  if (criterion.operator === 'not-equals') return value !== criterion.value
  return value === criterion.value
}

function verbsForDefinition(definition: ChallengePresetDefinition, verbs: readonly Verb[]) {
  if (definition.id === 'pronominaux') {
    return verbs.filter(verb => verb.isPronominalForm || verb.typePronominal !== 'aucun')
  }
  const lexicalVerbs = verbs.filter(verb => !verb.isPronominalForm)
  if (definition.id === 'ger-cer') {
    return lexicalVerbs.filter(verb => verb.particularites.includes('ger') || verb.particularites.includes('cer'))
  }
  return lexicalVerbs.filter(verb => definition.criteria.every(criterion => matchesCriterion(verb, criterion)))
}

export function resolveChallengePresets(verbs: readonly Verb[]): ChallengePreset[] {
  return challengePresetDefinitions.map(definition => ({
    id: definition.id,
    label: definition.label,
    description: definition.description,
    group: definition.group,
    criteria: definition.criteria.map(criterion => ({ ...criterion })),
    verbIds: verbsForDefinition(definition, verbs).map(verb => verb.id),
    tenseIds: [...definition.tenseIds],
    questionCount: definition.questionCount,
    exerciseKind: 'conjugation',
    pastSimplePronouns: 'all',
    inclusivePronouns: false,
    includeComplements: 'includeComplements' in definition ? definition.includeComplements : false,
    complementPlacement: 'complementPlacement' in definition ? definition.complementPlacement : 'after',
  }))
}

export function isChallengePresetId(value: string): value is ChallengePresetId {
  return challengePresetDefinitions.some(definition => definition.id === value)
}

export function getChallengePreset(id: string, verbs: readonly Verb[]): ChallengePreset | null {
  return resolveChallengePresets(verbs).find(preset => preset.id === id) ?? null
}

function uniquePositiveIds(ids: readonly number[]): number[] {
  return [...new Set(ids.filter(id => Number.isInteger(id) && id > 0))]
}

export function challengeConfigToLegacyTuple(config: ChallengeConfig): LegacyChallengeTuple {
  return [[...config.verbIds], [...config.tenseIds], config.questionCount]
}

export function challengeConfigFromLegacyTuple(tuple: LegacyChallengeTuple): ChallengeConfig {
  return {
    verbIds: uniquePositiveIds(tuple[0]),
    tenseIds: uniquePositiveIds(tuple[1]),
    questionCount: Number.isInteger(tuple[2]) && tuple[2] > 0 ? tuple[2] : 20,
    exerciseKind: 'conjugation',
    pastSimplePronouns: 'all',
    inclusivePronouns: false,
    includeComplements: false,
    complementPlacement: 'after',
  }
}

export interface PresetCompatibility {
  isCompatible: boolean
  missingVerbIds: VerbId[]
  missingTenseIds: TenseId[]
}

export function inspectPresetCompatibility(preset: ChallengeConfig, availableVerbIds: Iterable<VerbId>, availableTenseIds: Iterable<TenseId>): PresetCompatibility {
  const verbs = new Set(availableVerbIds)
  const tenses = new Set(availableTenseIds)
  const missingVerbIds = preset.verbIds.filter(id => !verbs.has(id))
  const missingTenseIds = preset.tenseIds.filter(id => !tenses.has(id))
  return { isCompatible: missingVerbIds.length === 0 && missingTenseIds.length === 0, missingVerbIds, missingTenseIds }
}

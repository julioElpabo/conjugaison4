import type {
  ChallengeConfig,
  ChallengePreset,
  ChallengePresetGroup,
  LegacyChallengeTuple,
  TenseId,
  VerbId,
} from '../types/conjugation.ts'

interface PresetDefinition {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly group: ChallengePresetGroup
  readonly verbIds: readonly VerbId[]
  readonly tenseIds: readonly TenseId[]
  readonly questionCount: number
}

const presetDefinitions = [
  {
    id: '5P',
    label: '5P',
    description: 'Verbes et temps usuels de 5P.',
    group: 'school',
    verbIds: [1, 4, 2, 74, 49, 31, 3, 25, 10, 6],
    tenseIds: [1, 2],
    questionCount: 20,
  },
  {
    id: '6P',
    label: '6P',
    description: 'Verbes et temps usuels de 6P.',
    group: 'school',
    verbIds: [1, 4, 2, 87, 49, 31, 3, 96, 10, 6, 94, 75, 58, 5, 41, 95, 66, 77, 19, 9],
    tenseIds: [1, 2, 3, 5],
    questionCount: 20,
  },
  {
    id: '7H',
    label: '7H',
    description: 'Programme de conjugaison de 7H.',
    group: 'school',
    verbIds: [1, 4, 2, 74, 49, 31, 3, 57, 10, 6, 94, 75, 58, 5, 41, 95, 66, 19, 9, 35, 42, 32, 43],
    tenseIds: [1, 2, 3, 5, 9, 14],
    questionCount: 20,
  },
  {
    id: '8H',
    label: '8H',
    description: 'Programme de conjugaison de 8H.',
    group: 'school',
    verbIds: [1, 4, 2, 87, 49, 31, 3, 96, 10, 6, 94, 75, 58, 5, 41, 95, 66, 77, 19, 9, 35, 42, 32, 43, 33, 38, 22, 51, 37, 12, 11, 13, 84, 72],
    tenseIds: [1, 2, 3, 4, 5, 6, 7, 9, 14],
    questionCount: 20,
  },
  {
    id: '9H',
    label: '9H',
    description: 'Programme de conjugaison de 9H.',
    group: 'school',
    verbIds: [1, 4, 3, 31, 5, 2, 19, 10, 6, 11, 15, 34, 95, 108, 107, 7, 87, 58, 8, 9, 96, 57, 63, 60, 109, 20, 28, 97, 66, 59, 72, 48, 88, 75, 92, 67, 53, 98, 84, 83, 85, 50, 32],
    tenseIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15],
    questionCount: 20,
  },
  {
    id: '10H',
    label: '10H',
    description: 'Programme de conjugaison de 10H.',
    group: 'school',
    verbIds: [65, 38, 17, 99, 44, 49, 100, 77, 18, 94, 12, 51, 56, 101, 102, 22, 42, 45],
    tenseIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15],
    questionCount: 20,
  },
  {
    id: '11H',
    label: '11H',
    description: 'Programme de conjugaison de 11H.',
    group: 'school',
    verbIds: [52, 103, 54, 13, 104, 76, 78, 105, 79, 37, 24, 106, 16, 27, 69],
    tenseIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15],
    questionCount: 20,
  },
  {
    id: 'groupe1',
    label: 'Premier groupe',
    description: 'Verbes réguliers et particularités du premier groupe.',
    group: 'verb-group',
    verbIds: [32, 87, 33, 100, 116, 103, 92, 104, 101, 73, 74, 75, 78, 35, 80, 18, 81, 36, 38, 110, 39, 94, 40, 106, 82, 41, 42, 43, 99, 88, 91, 86],
    tenseIds: [1],
    questionCount: 20,
  },
  {
    id: 'groupe2',
    label: 'Deuxième groupe',
    description: 'Verbes du deuxième groupe au présent.',
    group: 'verb-group',
    verbIds: [89, 118, 120, 49, 24, 123, 90],
    tenseIds: [1],
    questionCount: 20,
  },
  {
    id: 'groupe3',
    label: 'Troisième groupe',
    description: 'Principaux verbes et irrégularités du troisième groupe.',
    group: 'verb-group',
    verbIds: [50, 31, 55, 113, 23, 52, 14, 7, 117, 45, 54, 13, 112, 108, 76, 46, 114, 20, 21, 77, 98, 22, 34, 105, 79, 102, 119, 109, 15, 31, 47, 56, 48, 57, 1, 3, 11, 37, 121, 25, 122, 58, 115, 26, 53, 16, 27, 83, 84, 28, 59, 29, 60, 51, 61, 124, 5, 95, 17, 96, 62, 63, 107, 30, 44, 64, 10, 97, 65, 66, 85, 125, 67, 8, 111, 69, 12, 70, 9, 71, 72, 19, 6],
    tenseIds: [1],
    questionCount: 20,
  },
  {
    id: 'groupe3ir',
    label: 'Troisième groupe en -ir',
    description: 'Verbes en -ir classés dans le troisième groupe.',
    group: 'verb-group',
    verbIds: [52, 117, 77, 98, 79, 56, 37, 121, 53, 83, 84, 59, 97, 65, 66, 85, 89, 71],
    tenseIds: [1],
    questionCount: 20,
  },
  {
    id: 'groupe3oir',
    label: 'Troisième groupe en -oir',
    description: 'Verbes du troisième groupe se terminant en -oir.',
    group: 'verb-group',
    verbIds: [14, 45, 4, 119, 15, 11],
    tenseIds: [1],
    questionCount: 20,
  },
  {
    id: 'groupe3autres',
    label: 'Autres verbes du troisième groupe',
    description: 'Autres familles du troisième groupe.',
    group: 'verb-group',
    verbIds: [113, 23, 7, 54, 13, 112, 108, 76, 46, 114, 20, 21, 22, 34, 105, 102, 109, 31, 47, 48, 57, 3, 25, 122, 58, 115, 26, 16, 27, 28, 29, 60, 51, 61, 124, 5, 95, 17, 96, 62, 63, 107, 30, 44, 64, 10, 125, 67, 68, 111, 69, 12, 70, 72, 19, 6],
    tenseIds: [1],
    questionCount: 20,
  },
  {
    id: 'ger',
    label: 'Verbes en -ger',
    description: 'Entraînement aux particularités orthographiques des verbes en -ger.',
    group: 'spelling',
    verbIds: [73, 91, 93, 94, 103, 149, 167, 202, 203, 235, 241, 264, 270, 271, 272, 273, 276, 277, 278, 301, 303, 311],
    tenseIds: [1, 2, 3, 4, 5, 6],
    questionCount: 20,
  },
  {
    id: 'cer',
    label: 'Verbes en -cer',
    description: 'Entraînement aux particularités orthographiques des verbes en -cer.',
    group: 'spelling',
    // L'ancien preset contenait l'ID 262, absent de la base cible conjugaison4.
    verbIds: [75, 88, 92, 110, 204, 205, 258, 265, 266, 267, 268, 269, 302],
    tenseIds: [1, 2, 3, 4, 5, 6],
    questionCount: 20,
  },
  {
    id: 'ger-cer',
    label: 'Verbes en -ger et -cer',
    description: 'Entraînement combiné aux verbes en -ger et -cer.',
    group: 'spelling',
    verbIds: [73, 91, 93, 94, 103, 149, 167, 202, 203, 235, 241, 264, 270, 271, 272, 273, 276, 277, 278, 301, 303, 311, 75, 88, 92, 110, 204, 205, 258, 265, 266, 267, 268, 269, 302],
    tenseIds: [1, 2, 3, 4, 5, 6],
    questionCount: 20,
  },
  {
    id: 'rares',
    label: 'Verbes rares',
    description: 'Une sélection de verbes peu fréquents.',
    group: 'training',
    verbIds: [52, 113, 117, 119, 121, 123, 124, 160, 161, 180, 281, 282, 283, 291],
    tenseIds: [1, 2, 3, 4, 5, 6],
    questionCount: 20,
  },
  {
    id: 'difficiles',
    label: 'Verbes difficiles',
    description: 'Une sélection de conjugaisons réputées difficiles.',
    group: 'training',
    verbIds: [22, 23, 24, 25, 26, 30, 43, 52, 53, 55, 56, 69, 71, 79, 101, 105, 112, 196, 249, 307],
    tenseIds: [1, 2, 3, 4, 5, 6],
    questionCount: 20,
  },
  {
    id: 'pronominaux',
    label: 'Verbes pronominaux',
    description: 'Entraînement aux verbes pronominaux.',
    group: 'training',
    verbIds: [174, 246, 247, 251, 286, 288, 289, 290, 291, 292, 293, 294, 295, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320],
    tenseIds: [1, 2, 3, 4, 5, 6],
    questionCount: 20,
  },
  {
    id: 'CIF1',
    label: 'CIF 1',
    description: 'Premier parcours CIF historique.',
    group: 'training',
    verbIds: [1, 2, 3, 4],
    tenseIds: [1],
    questionCount: 10,
  },
  {
    id: 'CIF2',
    label: 'CIF 2',
    description: 'Deuxième parcours CIF historique.',
    group: 'training',
    verbIds: [32, 87, 2, 4, 74, 31, 1, 3, 50, 86],
    tenseIds: [1],
    questionCount: 20,
  },
  {
    id: 'CIF3',
    label: 'CIF 3',
    description: 'Troisième parcours CIF historique.',
    group: 'training',
    verbIds: [7, 8, 9],
    tenseIds: [1, 2, 3, 4],
    questionCount: 20,
  },
  {
    id: 'CIF4',
    label: 'CIF 4',
    description: 'Quatrième parcours CIF historique.',
    group: 'training',
    verbIds: [10, 11, 12, 13],
    tenseIds: [1, 2, 3, 4, 5, 6],
    questionCount: 20,
  },
] as const satisfies readonly PresetDefinition[]

export type ChallengePresetId = (typeof presetDefinitions)[number]['id']

function uniquePositiveIds(ids: readonly number[]): number[] {
  return [...new Set(ids.filter(id => Number.isInteger(id) && id > 0))]
}

/** Catalogue directement consommable par le sélecteur de défis. */
export const challengePresets: ChallengePreset[] = presetDefinitions.map(definition => ({
  ...definition,
  verbIds: uniquePositiveIds(definition.verbIds),
  tenseIds: uniquePositiveIds(definition.tenseIds),
  exerciseKind: 'conjugation',
  pastSimplePronouns: 'all',
  inclusivePronouns: false,
}))

/** Index pratique pour les URLs et les menus historiques (`7H`, `ger`, etc.). */
export const CHALLENGE_PRESETS = Object.fromEntries(
  challengePresets.map(preset => [preset.id, preset]),
) as Record<ChallengePresetId, ChallengePreset>

export function isChallengePresetId(value: string): value is ChallengePresetId {
  return Object.hasOwn(CHALLENGE_PRESETS, value)
}

/** Retourne une copie modifiable afin de préserver le catalogue partagé. */
export function getChallengePreset(id: string): ChallengePreset | null {
  if (!isChallengePresetId(id)) {
    return null
  }

  const preset = CHALLENGE_PRESETS[id]
  return {
    ...preset,
    verbIds: [...preset.verbIds],
    tenseIds: [...preset.tenseIds],
  }
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
  }
}

export interface PresetCompatibility {
  isCompatible: boolean
  missingVerbIds: VerbId[]
  missingTenseIds: TenseId[]
}

/** Permet au backend de détecter clairement un futur décalage avec la BDD. */
export function inspectPresetCompatibility(
  preset: ChallengeConfig,
  availableVerbIds: Iterable<VerbId>,
  availableTenseIds: Iterable<TenseId>,
): PresetCompatibility {
  const verbs = new Set(availableVerbIds)
  const tenses = new Set(availableTenseIds)
  const missingVerbIds = preset.verbIds.filter(id => !verbs.has(id))
  const missingTenseIds = preset.tenseIds.filter(id => !tenses.has(id))

  return {
    isCompatible: missingVerbIds.length === 0 && missingTenseIds.length === 0,
    missingVerbIds,
    missingTenseIds,
  }
}


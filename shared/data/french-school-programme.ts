import type { TenseId } from '../types/conjugation.ts'

export const frenchSchoolProgrammeSource = 'https://generateur-conjugaison.fr/'

export const frenchSchoolLevels = [
  'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e',
] as const

export type FrenchSchoolLevel = (typeof frenchSchoolLevels)[number]

/** Verbes introduits à chaque niveau par le générateur de référence. */
export const frenchSchoolIntroducedVerbs: Record<FrenchSchoolLevel, readonly string[]> = {
  CP: ['être', 'avoir'],
  CE1: [
    'aimer', 'chanter', 'trouver', 'parler', 'rouler', 'porter', 'travailler',
    'jouer', 'crier', 'remuer', 'manger', 'ranger', 'bouger', 'nager',
  ],
  CE2: [
    'appeler', 'geler', 'jeter', 'acheter', 'commencer', 'lancer', 'tracer',
    'placer', 'céder', 'aboyer', 'nettoyer', 'employer', 'envoyer', 'essayer',
    'payer', 'essuyer', 'faire', 'aller', 'dire', 'venir', 'pouvoir', 'voir',
    'vouloir', 'prendre',
  ],
  CM1: ['finir', 'grandir', 'rougir', 'salir', 'guérir', 'obéir', 'réussir'],
  CM2: [],
  '6e': [],
  '5e': [
    'partir', 'sortir', 'mettre', 'rendre', 'vendre', 'entendre', 'tenir',
    'ouvrir', 'dormir', 'servir', 'courir', 'savoir', 'devoir',
  ],
  '4e': [],
  '3e': [],
}

/** Temps et modes introduits à chaque niveau, avec les identifiants du catalogue. */
export const frenchSchoolIntroducedTenseIds: Record<FrenchSchoolLevel, readonly TenseId[]> = {
  CP: [1],
  CE1: [2, 3, 5],
  CE2: [],
  CM1: [],
  CM2: [4, 7],
  '6e': [14, 9],
  '5e': [6, 8],
  '4e': [15, 10],
  '3e': [11],
}

function cumulativeValues<T>(values: Record<FrenchSchoolLevel, readonly T[]>) {
  const result = {} as Record<FrenchSchoolLevel, readonly T[]>
  const accumulated: T[] = []
  for (const level of frenchSchoolLevels) {
    accumulated.push(...values[level])
    result[level] = [...accumulated]
  }
  return result
}

export const frenchSchoolVerbInfinitives = cumulativeValues(frenchSchoolIntroducedVerbs)
export const frenchSchoolTenseIds = cumulativeValues(frenchSchoolIntroducedTenseIds)

export interface FrenchSchoolMissingVerbClone {
  readonly infinitive: string
  readonly model: string
  readonly replacements: readonly (readonly [string, string])[]
}

/**
 * Verbes de la source absents du catalogue historique. Chaque forme est dérivée
 * d'un modèle déjà validé appartenant exactement à la même famille.
 */
export const frenchSchoolMissingVerbClones: readonly FrenchSchoolMissingVerbClone[] = [
  { infinitive: 'rouler', model: 'aimer', replacements: [['aim', 'roul']] },
  { infinitive: 'remuer', model: 'tuer', replacements: [['tu', 'remu']] },
  { infinitive: 'geler', model: 'peler', replacements: [['pèl', 'gèl'], ['pel', 'gel']] },
  { infinitive: 'tracer', model: 'placer', replacements: [['pla', 'tra']] },
  { infinitive: 'aboyer', model: 'employer', replacements: [['emplo', 'abo']] },
  { infinitive: 'nettoyer', model: 'employer', replacements: [['emplo', 'netto']] },
  { infinitive: 'salir', model: 'finir', replacements: [['fin', 'sal']] },
]

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

export function transformFrenchSchoolVerbForm(
  value: string,
  clone: FrenchSchoolMissingVerbClone,
) {
  return clone.replacements.reduce(
    (form, [source, target]) => form.replace(
      new RegExp(`\\b${escapeRegExp(source)}`, 'gu'),
      target,
    ),
    value,
  )
}

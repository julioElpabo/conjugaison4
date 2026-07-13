/** Identifiants numériques issus de la base MySQL de conjugaison4. */
export type VerbId = number
export type TenseId = number
export type ModeId = number
export type PersonId = number

export interface VerbSummary {
  id: VerbId
  infinitif: string
}

export interface Verb extends VerbSummary {
  participePresent: string | null
  participePasse: string | null
  auxiliaire: string | null
  groupeConjugaison: 1 | 2 | 3 | null
  familleConjugaison: string | null
  terminaison: string | null
  typePronominal: 'aucun' | 'occasionnel' | 'essentiel'
  estImpersonnel: boolean
  estDefectif: boolean
  personnesDisponibles: number[]
  typeHInitial: 'muet' | 'aspire' | null
  niveauDifficulte: number | null
  niveauCecrl: string | null
  rangFrequence: number | null
  registrePrincipal: string | null
  formeCanonique: string
  statutValidation: 'genere' | 'a_verifier' | 'valide'
  particularites: string[]
  niveauxScolaires: string[]
  parcoursCif: string[]
  categoriesSemantiques: string[]
}

export interface ConjugationMode {
  id: ModeId
  name: string
  order: number
}

export interface ConjugationTense {
  id: TenseId
  modeId: ModeId
  name: string
  isCompound: boolean
  selected: boolean
  mode?: Pick<ConjugationMode, 'id' | 'name' | 'order'>
}

export interface GrammaticalPerson {
  id: PersonId
  label: string
  pronom: string
  order: number
}

export type PastSimplePronouns = 'all' | 'third-person-only'
export type ExerciseKind = 'conjugation' | 'tense-identification'

/**
 * Configuration moderne d'un exercice. Les listes sont en lecture seule afin
 * qu'un preset partagé ne puisse pas être modifié accidentellement par l'UI.
 */
export interface ChallengeConfig {
  verbIds: VerbId[]
  tenseIds: TenseId[]
  questionCount: number
  exerciseKind: ExerciseKind
  pastSimplePronouns: PastSimplePronouns
  inclusivePronouns: boolean
}

/** Format historique stocké dans la table `defis`. */
export type LegacyChallengeTuple = readonly [
  readonly VerbId[],
  readonly TenseId[],
  number,
]

export type ChallengePresetGroup =
  | 'school'
  | 'verb-group'
  | 'spelling'
  | 'semantic'
  | 'training'

export interface ChallengePreset extends ChallengeConfig {
  id: string
  label: string
  description: string
  group: ChallengePresetGroup
  criteria?: readonly unknown[]
}

/** Forme compatible avec les questionnaires de l'application historique. */
export interface ExerciseQuestion {
  id?: string | number
  titre: string
  consigne: string
  reponses: readonly string[]
  reponsesPourCorrige: readonly string[]
  verbeId?: VerbId
  tenseId?: TenseId
  personId?: PersonId | null
  infinitif?: string
  pronom?: string
  temps?: string
  mode?: string
  conjugaison1?: string
  conjugaison2?: string | null
  conjugaison3?: string | null
}

export type ExerciseAttemptStatus = 'correct' | 'incorrect'

export interface ExerciseAttempt {
  question: ExerciseQuestion
  answer: string
  status: ExerciseAttemptStatus
  matchedAnswer?: string
}

export interface ExerciseResult {
  attempts: readonly ExerciseAttempt[]
  correctCount: number
  incorrectCount: number
  totalCount: number
  scorePercent: number
}

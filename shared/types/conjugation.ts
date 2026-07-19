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
  /** Définition courte du sens principal, utilisée notamment par l’aide pédagogique. */
  meaning?: string | null
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
  pronominalisable?: boolean
  isPronominalForm?: boolean
  baseVerbId?: number | null
  pronominalUseId?: number | null
  pronominalType?: string | null
  pronounFunction?: string | null
  agreementRule?: string | null
  requiredPreposition?: string | null
  complementExample?: {
    functionObject: 'cod' | 'coi'
    after: string
    before: string | null
  } | null
  complementFunctions?: ('cod' | 'coi')[]
  anteposableComplementFunctions?: ('cod' | 'coi')[]
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
  example?: string
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
export type ComplementPlacement = 'after' | 'mixed' | 'before'
export type ClassicComplementChoice = 'none' | ComplementPlacement
export type ComplementOption = 'cod-after' | 'cod-before' | 'coi-after' | 'coi-before'

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
  includeComplements: boolean
  complementPlacement: ComplementPlacement
  complementOptions: ComplementOption[]
}

/** Format historique stocké dans la table `defis`. */
export type LegacyChallengeTuple = readonly [
  readonly VerbId[],
  readonly TenseId[],
  number,
]

export type ChallengePresetGroup =
  | 'school'
  | 'cif'
  | 'verb-group'
  | 'spelling'
  | 'semantic'

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
  instruction?: string
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
  isCompound?: boolean
  conjugaison1?: string
  conjugaison2?: string | null
  conjugaison3?: string | null
  /** Forme déjà connue servant à construire le radical sans partir de la réponse attendue. */
  radicalReference?: {
    kind: 'present-nous' | 'present-ils' | 'present-same-person' | 'infinitive' | 'future-stem' | 'past-simple-il' | 'memorized-stem' | 'memorized-form'
    label: string
    form: string
    removableEnding: string
    radical: string
    targetEnding?: string
    referenceMode?: string
    referenceTense?: string
    referenceSubject?: string
    strategy?: 'remove-ending' | 'reuse-form' | 'memorize-stem'
    orthographicAdjustment?: string
    validated?: boolean
  }
  complement?: string
  complementPosition?: 'after' | 'before'
  complementFunction?: 'cod' | 'coi'
  relativePronoun?: string
  /** Préfixe grammatical affiché juste avant le champ de réponse (ex. « il », « j’ », « qu’elle »). */
  saisiePrefixe?: string
  agreementReminder?: {
    kind: 'cod-before' | 'cod-after' | 'coi'
    infinitive: string
    complement: string
    preposition?: string | null
    participle: string
    gender?: 'masculin' | 'feminin' | null
    number?: 'singulier' | 'pluriel' | null
  }
}

export type ExerciseAttemptStatus = 'correct' | 'incorrect'

export interface ExerciseAttempt {
  question: ExerciseQuestion
  answer: string
  status: ExerciseAttemptStatus
  attemptNumber?: 1 | 2
  matchedAnswer?: string
}

export interface ExerciseResult {
  attempts: readonly ExerciseAttempt[]
  correctCount: number
  incorrectCount: number
  totalCount: number
  scorePercent: number
}

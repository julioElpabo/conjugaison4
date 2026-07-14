import type {
  ChallengeConfig as CoreChallengeConfig,
  ChallengePreset,
  ConjugationMode,
  ConjugationTense,
  ExerciseKind,
  ComplementPlacement,
  PastSimplePronouns,
  Verb
} from '~~/shared/types/conjugation'

export type { ComplementPlacement, ConjugationMode, ExerciseKind, PastSimplePronouns, Verb }
export type Tense = ConjugationTense

export interface Catalogue {
  verbes: Verb[]
  modes: ConjugationMode[]
  temps: Tense[]
  presets: ChallengePreset[]
}

export interface PrintOptions {
  title: string
  showGrade: boolean
  showVerbs: boolean
  showTenses: boolean
  showFirstName: boolean
  showLastName: boolean
  showDate: boolean
  showRandomNumber: boolean
}

export interface ChallengeConfig extends CoreChallengeConfig {
  printOptions: PrintOptions
}

export interface SharedChallenge {
  code: string
  verbIds: number[]
  tenseIds: number[]
  questionCount: number
  exerciseKind?: ExerciseKind
  pastSimplePronouns?: PastSimplePronouns
  inclusivePronouns?: boolean
  includeComplements?: boolean
  complementPlacement?: ComplementPlacement
  printOptions?: Partial<PrintOptions>
}

const createDefaultPrintOptions = (): PrintOptions => ({
  title: 'Défi de conjugaison',
  showGrade: true,
  showVerbs: false,
  showTenses: false,
  showFirstName: true,
  showLastName: true,
  showDate: true,
  showRandomNumber: true
})

const createDefaultChallenge = (): ChallengeConfig => ({
  verbIds: [1, 2, 3, 4],
  tenseIds: [1, 3, 4, 5],
  questionCount: 20,
  exerciseKind: 'conjugation',
  pastSimplePronouns: 'all',
  inclusivePronouns: false,
  includeComplements: false,
  complementPlacement: 'after',
  printOptions: createDefaultPrintOptions()
})

export function useChallengeBuilder() {
  const catalogue = useState<Catalogue>('challenge-catalogue', () => ({
    verbes: [],
    modes: [],
    temps: [],
    presets: []
  }))
  const challenge = useState<ChallengeConfig>('challenge-config', createDefaultChallenge)
  const catalogueStatus = useState<'idle' | 'loading' | 'success' | 'error'>('challenge-catalogue-status', () => 'idle')
  const catalogueError = useState<string>('challenge-catalogue-error', () => '')

  const selectedVerbs = computed(() => {
    const byId = new Map(catalogue.value.verbes.map(verb => [verb.id, verb]))
    return challenge.value.verbIds
      .map(id => byId.get(id))
      .filter((verb): verb is Verb => Boolean(verb))
  })

  const selectedTenses = computed(() => {
    const byId = new Map(catalogue.value.temps.map(tense => [tense.id, tense]))
    return challenge.value.tenseIds
      .map(id => byId.get(id))
      .filter((tense): tense is Tense => Boolean(tense))
  })

  const isReady = computed(() => (
    challenge.value.verbIds.length > 0
    && challenge.value.tenseIds.length > 0
    && challenge.value.questionCount > 0
  ))

  async function loadCatalogue(force = false) {
    if (!force && catalogueStatus.value === 'success') {
      return catalogue.value
    }

    catalogueStatus.value = 'loading'
    catalogueError.value = ''

    try {
      const response = await $fetch<Catalogue>('/api/catalogue')
      catalogue.value = {
        verbes: [...response.verbes].sort((a, b) => a.infinitif.localeCompare(b.infinitif, 'fr')),
        modes: [...response.modes].sort((a, b) => a.order - b.order || a.id - b.id),
        temps: [...response.temps],
        presets: [...response.presets]
      }

      const validVerbIds = new Set(catalogue.value.verbes.map(verb => verb.id))
      const validTenseIds = new Set(catalogue.value.temps.map(tense => tense.id))
      const defaultSelectedTenses = catalogue.value.temps.filter(tense => tense.selected).map(tense => tense.id)

      challenge.value.verbIds = challenge.value.verbIds.filter(id => validVerbIds.has(id))
      challenge.value.tenseIds = challenge.value.tenseIds.filter(id => validTenseIds.has(id))

      if (challenge.value.verbIds.length === 0) {
        challenge.value.verbIds = catalogue.value.verbes.slice(0, 4).map(verb => verb.id)
      }
      if (challenge.value.tenseIds.length === 0) {
        challenge.value.tenseIds = defaultSelectedTenses.length > 0
          ? defaultSelectedTenses
          : catalogue.value.temps.slice(0, 1).map(tense => tense.id)
      }

      catalogueStatus.value = 'success'
      return catalogue.value
    } catch (error) {
      catalogueStatus.value = 'error'
      catalogueError.value = getChallengeErrorMessage(error, 'Impossible de charger le catalogue.')
      throw error
    }
  }

  function addVerb(id: number) {
    if (!challenge.value.verbIds.includes(id)) {
      challenge.value.verbIds = [...challenge.value.verbIds, id]
    }
  }

  function removeVerb(id: number) {
    challenge.value.verbIds = challenge.value.verbIds.filter(verbId => verbId !== id)
  }

  function clearVerbs() {
    challenge.value.verbIds = []
  }

  function toggleTense(id: number) {
    challenge.value.tenseIds = challenge.value.tenseIds.includes(id)
      ? challenge.value.tenseIds.filter(tenseId => tenseId !== id)
      : [...challenge.value.tenseIds, id]
  }

  function selectAllTenses() {
    challenge.value.tenseIds = catalogue.value.temps.map(tense => tense.id)
  }

  function clearTenses() {
    challenge.value.tenseIds = []
  }

  function applySelection(selection: Pick<ChallengeConfig, 'verbIds' | 'tenseIds' | 'questionCount'>) {
    const validVerbIds = new Set(catalogue.value.verbes.map(verb => verb.id))
    const validTenseIds = new Set(catalogue.value.temps.map(tense => tense.id))

    challenge.value = {
      ...challenge.value,
      verbIds: selection.verbIds.filter(id => validVerbIds.has(id)),
      tenseIds: selection.tenseIds.filter(id => validTenseIds.has(id)),
      questionCount: selection.questionCount
    }
  }

  function applySharedChallenge(shared: SharedChallenge) {
    applySelection(shared)
    challenge.value = {
      ...challenge.value,
      exerciseKind: shared.exerciseKind ?? challenge.value.exerciseKind,
      pastSimplePronouns: shared.pastSimplePronouns ?? challenge.value.pastSimplePronouns,
      inclusivePronouns: shared.inclusivePronouns ?? challenge.value.inclusivePronouns,
      includeComplements: shared.includeComplements ?? false,
      complementPlacement: shared.complementPlacement ?? 'after',
      printOptions: {
        ...challenge.value.printOptions,
        ...(shared.printOptions ?? {})
      }
    }
  }

  return {
    catalogue,
    challenge,
    catalogueStatus,
    catalogueError,
    selectedVerbs,
    selectedTenses,
    isReady,
    loadCatalogue,
    addVerb,
    removeVerb,
    clearVerbs,
    toggleTense,
    selectAllTenses,
    clearTenses,
    applySelection,
    applySharedChallenge
  }
}

export function getChallengeErrorMessage(error: unknown, fallback = 'Une erreur est survenue.') {
  if (error && typeof error === 'object') {
    const candidate = error as {
      data?: { statusMessage?: string, message?: string }
      statusMessage?: string
      message?: string
    }
    return candidate.data?.statusMessage
      || candidate.data?.message
      || candidate.statusMessage
      || candidate.message
      || fallback
  }

  return fallback
}

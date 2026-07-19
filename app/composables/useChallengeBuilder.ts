import type {
  ChallengeConfig as CoreChallengeConfig,
  ChallengePreset,
  ConjugationMode,
  ConjugationTense,
  ExerciseKind,
  ComplementPlacement,
  ComplementOption,
  PastSimplePronouns,
  Verb
} from '~~/shared/types/conjugation'
import { DEFAULT_COMPLEMENT_OPTIONS, legacyComplementConfig, legacyComplementOptions } from '~~/shared/utils/complement-options'

export type { ComplementOption, ComplementPlacement, ConjugationMode, ExerciseKind, PastSimplePronouns, Verb }
export type Tense = ConjugationTense

export interface Catalogue {
  verbes: Verb[]
  modes: ConjugationMode[]
  temps: Tense[]
  presets: ChallengePreset[]
}

export interface PrintOptions {
  title: string
  questionSpacingMm: number
  titleSpacingMm: number
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
  complementOptions?: ComplementOption[]
  printOptions?: Partial<PrintOptions>
}

const createDefaultPrintOptions = (): PrintOptions => ({
  title: 'Défi de conjugaison',
  questionSpacingMm: 8,
  titleSpacingMm: 30,
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
  includeComplements: true,
  complementPlacement: 'after',
  complementOptions: [...DEFAULT_COMPLEMENT_OPTIONS],
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
    const modesById = new Map(catalogue.value.modes.map(mode => [mode.id, mode]))
    return challenge.value.tenseIds
      .map(id => byId.get(id))
      .filter((tense): tense is Tense => Boolean(tense))
      .map(tense => ({ ...tense, mode: tense.mode || modesById.get(tense.modeId) }))
  })

  const isReady = computed(() => (
    challenge.value.verbIds.length > 0
    && challenge.value.tenseIds.length > 0
    && challenge.value.questionCount > 0
  ))

  function defaultTenseIds() {
    const indicative = catalogue.value.modes.find(mode => mode.name.toLocaleLowerCase('fr') === 'indicatif')
    if (!indicative) return [1, 3, 4, 5]
    const defaultNames = new Set(['présent', 'imparfait', 'passé composé', 'futur', 'futur simple'])
    return catalogue.value.temps
      .filter(tense => tense.modeId === indicative.id && defaultNames.has(tense.name.toLocaleLowerCase('fr')))
      .map(tense => tense.id)
  }

  async function loadCatalogue(force = false) {
    const hasTenseExamples = catalogue.value.temps.length > 0
      && catalogue.value.temps.every(tense => Boolean(tense.example?.trim()))

    if (!force && catalogueStatus.value === 'success' && hasTenseExamples) {
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
      const defaultSelectedTenses = defaultTenseIds()

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

  function selectDefaultTenses() {
    challenge.value.tenseIds = defaultTenseIds()
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
    const complementOptions = shared.complementOptions
      ?? (shared.includeComplements === undefined
        ? [...DEFAULT_COMPLEMENT_OPTIONS]
        : legacyComplementOptions(shared.includeComplements, shared.complementPlacement ?? 'after'))
    const legacy = legacyComplementConfig(complementOptions)
    challenge.value = {
      ...challenge.value,
      exerciseKind: shared.exerciseKind ?? challenge.value.exerciseKind,
      pastSimplePronouns: shared.pastSimplePronouns ?? challenge.value.pastSimplePronouns,
      inclusivePronouns: shared.inclusivePronouns ?? challenge.value.inclusivePronouns,
      includeComplements: legacy.includeComplements,
      complementPlacement: legacy.complementPlacement,
      complementOptions,
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
    selectDefaultTenses,
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

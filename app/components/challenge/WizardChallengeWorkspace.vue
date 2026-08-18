<script setup lang="ts">
import type { Component, ShallowRef } from 'vue'
const { ui, localePath, interfaceLocale, setInterfaceLocale } = useLanguagePreferences()
import type { ChallengePreset, ComplementOption, ExerciseQuestion, LearnerExerciseTrackingContext } from '~~/shared/types/conjugation'
import { challengePresetGroupLabels } from '~~/shared/data/challenge-presets'
import { challengePresetTrackingDescription, challengePresetTrackingTitle } from '~~/shared/utils/challenge-preset-tracking'
import { legacyComplementConfig, legacyComplementOptions } from '~~/shared/utils/complement-options'
import { guidedTourCopy } from '~~/shared/i18n/guided-tour'
import type { AppLocale } from '~~/shared/i18n/locales'
import type { CoachProfile } from '~~/shared/types/coach'
import {
  GUIDED_TOUR_COMPLETED_STORAGE_KEY,
  GUIDED_TOUR_REMINDER_STORAGE_KEY,
  parseGuidedTourReminderState,
  postponedGuidedTourState,
  registerGuidedTourHomepageVisit,
  shouldRemindAboutGuidedTour,
} from '~~/shared/utils/guided-tour-reminder'
import type { DriveStep, Driver } from 'driver.js'
import { createDefaultChallenge, getChallengeErrorMessage, useChallengeBuilder, type ChallengeConfig as BuilderChallengeConfig } from '~/composables/useChallengeBuilder'
import { normalizeChallengeCode, useChallengeApi } from '~/composables/useChallengeApi'
import ChallengeActions from './ChallengeActions.vue'
import ChallengeOptions from './ChallengeOptions.vue'
import PresetPicker from './PresetPicker.vue'
import ShareChallengeDialog from './ShareChallengeDialog.vue'
import TensePicker from './TensePicker.vue'
import VerbPicker from './VerbPicker.vue'
import '~/assets/css/main.css'

interface LaunchEditHint {
  before: string
  between: string
  after: string
  verbsLabel: string
  tensesLabel: string
}

const props = defineProps<{
  initialCode?: string
  initialPresetId?: string
  homeHeading?: string
  embedded?: boolean
  startAtLaunch?: boolean
  launchCategory?: string
  launchTitle?: string
  launchDescription?: string
  launchEditHint?: LaunchEditHint
}>()

type WizardStep = 0 | 1 | 2 | 3 | 4
type TourFormat = 'quick' | 'complete'
type ClassicExerciseExposed = {
  showDemoCorrection: () => void
  showTourProgress: () => void
}
type ChatExerciseExposed = {
  showDemoHelp: () => void
  hideDemoHelp: () => void
  waitUntilTourReady: () => Promise<void>
}

let classicExercisePromise: Promise<Component> | undefined
let chatExercisePromise: Promise<Component> | undefined
let coachPickerPromise: Promise<Component> | undefined

function loadClassicExercise() {
  classicExercisePromise ??= import('../exercise/ClassicExercise.vue')
    .then(module => module.default)
    .catch((error) => {
      classicExercisePromise = undefined
      throw error
    })
  return classicExercisePromise
}

function loadChatExercise() {
  chatExercisePromise ??= import('../exercise/ChatExercise.vue')
    .then(module => module.default)
    .catch((error) => {
      chatExercisePromise = undefined
      throw error
    })
  return chatExercisePromise
}

function loadCoachPicker() {
  coachPickerPromise ??= import('../exercise/CoachPicker.vue')
    .then(module => module.default)
    .catch((error) => {
      coachPickerPromise = undefined
      throw error
    })
  return coachPickerPromise
}

const ClassicExercise = defineAsyncComponent(loadClassicExercise)
const ChatExercise = defineAsyncComponent(loadChatExercise)
const CoachPicker = defineAsyncComponent(loadCoachPicker)

interface TourSnapshot {
  challenge: BuilderChallengeConfig
  currentStep: WizardStep
  presetExpanded: boolean
  presetStage: 'groups' | 'presets'
  activePresetId?: string
  sourcePresetId?: string
  sourcePresetRandomCount: number | null
  isPrefilledChallenge: boolean
  isPresetVerbEditing: boolean
  showLaunchSummary: boolean
}

const {
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
} = useChallengeBuilder()

const api = useChallengeApi()
const { track } = useSiteAnalytics()
const route = useRoute()
const requestUrl = useRequestURL()
const wizardInitialized = useState('wizard-challenge-initialized', () => false)
const homeResetRequested = useState('home-reset-requested', () => false)
const newChallengeRequested = useState('new-challenge-requested', () => false)
const guidedTourRequested = useState('guided-tour-requested', () => false)
const guidedTourDisabled = ref(false)
const wizardAtHome = useState('wizard-at-home', () => true)
const falcMode = useState<boolean>('falc-mode', () => false)
const currentStep = ref<WizardStep>(0)
const falcHomePanel = ref<'code' | 'presets' | null>(null)
const isPreparingStep4 = ref(false)
const highlightChallengeLoader = ref(false)
const presetStage = ref<'groups' | 'presets'>('groups')
const presetExpanded = ref(false)
const challengeCode = ref('')
const codeError = ref('')
const actionError = ref('')
const notice = ref('')
const busyAction = ref<'exercise' | 'print' | 'save' | 'load' | null>(null)
const activePresetId = ref<string>()
const sourcePresetId = ref<string>()
const sourcePresetRandomCount = ref<number | null>(null)
const isPrefilledChallenge = ref(false)
const isPresetVerbEditing = ref(false)
const questions = ref<ExerciseQuestion[]>([])
const printQuestions = ref<ExerciseQuestion[]>([])
const shareCode = ref('')
const shareTitle = ref('')
const shareDescription = ref('')
const shareError = ref('')
const savedChallengeTitle = ref('')
const savedChallengeDescription = ref('')
const exerciseTracking = ref<LearnerExerciseTrackingContext>()
const isExerciseOpen = ref(false)
const exercisePresentation = ref<'classic' | 'chat'>('classic')
const isPrintOpen = ref(false)
const printPreviewComponent: ShallowRef<Component | null> = shallowRef(null)
const isShareOpen = ref(false)
const isCoachPickerOpen = ref(false)
const selectedCoach = ref<CoachProfile | null>(null)
const exposedUsageFeatures = new Set<string>()
const classicExerciseRef = useTemplateRef<ClassicExerciseExposed>('classic-exercise')
const chatExerciseRef = useTemplateRef<ChatExerciseExposed>('chat-exercise')
const chatExerciseVerbs = computed(() => {
  if (challenge.value.identificationSource !== 'literary-corpus'
    || challenge.value.exerciseKind !== 'tense-identification') return selectedVerbs.value
  const questionVerbIds = new Set(questions.value.map(question => Number(question.verbeId)))
  const literaryVerbs = catalogue.value.verbes.filter(verb => questionVerbIds.has(verb.id))
  return literaryVerbs.length ? literaryVerbs : selectedVerbs.value
})
const identificationTenses = computed(() => {
  const modes = new Map(catalogue.value.modes.map(mode => [mode.id, mode]))
  return catalogue.value.temps.map(tense => ({ ...tense, mode: tense.mode || modes.get(tense.modeId) }))
})
// Cet état doit survivre au changement d’URL effectué par le sélecteur de langue.
const isTourWelcomeOpen = useState('guided-tour-welcome-open', () => false)
const tourWelcomeSource = useState<'initial' | 'reminder' | 'manual' | null>('guided-tour-welcome-source', () => null)
const tourActive = ref(false)
const tourSecondaryWizardStep = ref<WizardStep | null>(null)
const tourWizardIndicatorStyle = ref<Record<string, string>>({})
const tourCopy = computed(() => guidedTourCopy(interfaceLocale.value))
const tourLanguageOptions = computed<{ value: AppLocale, label: string, flag: string }[]>(() => [
  { value: 'fr', label: ui('Français'), flag: '🇫🇷' },
  { value: 'de', label: ui('Allemand'), flag: '🇩🇪' },
  { value: 'en', label: ui('Anglais'), flag: '🇬🇧' },
  { value: 'it', label: ui('Italien'), flag: '🇮🇹' },
  { value: 'es', label: ui('Espagnol'), flag: '🇪🇸' },
])
const revealedPresetVerbIds = ref<number[]>([])
const revealedPresetTenseIds = ref<number[]>([])
const presetTenseRevealPending = ref(false)
const prefilledOptionsRevealPending = ref(false)
const showLaunchSummary = ref(false)
const conjugationInstructionRaw = ref('')
const conjugationQuestionContextRaw = ref('')
const conjugationQuestionRaw = ref('')
const conjugationExampleRaw = ref('')
const conjugationExamplePrefixRaw = ref('')
const conjugationExampleEmphasisRaw = ref('')
const conjugationExampleSuffixRaw = ref('')
const conjugationLiteraryCitationRaw = ref<ExerciseQuestion['literaryCitation']>()
const conjugationExampleLoading = ref(false)
let conjugationExampleRequest = 0
let presetRevealTimers: ReturnType<typeof setTimeout>[] = []
let tourDriver: Driver | null = null
let tourSnapshot: TourSnapshot | null = null
let tourCompleted = false
let trackedTourFormat: TourFormat | null = null
let tourPromptTimer: ReturnType<typeof setTimeout> | undefined
let guidedTourMediaQuery: MediaQueryList | undefined
let exercisePreloadIdleId: number | undefined
let exercisePreloadTimer: ReturnType<typeof setTimeout> | undefined
let exercisePreloadStarted = false

async function preloadExerciseSurfaces() {
  if (!import.meta.client || exercisePreloadStarted) return
  exercisePreloadStarted = true
  // Les téléchargements sont séquentiels pour ne pas concurrencer l'affichage de l'étape en cours.
  for (const loader of [loadClassicExercise, loadCoachPicker, loadChatExercise]) {
    await Promise.allSettled([loader()])
  }
}

function scheduleExercisePreload() {
  if (!import.meta.client || exercisePreloadStarted || exercisePreloadIdleId !== undefined || exercisePreloadTimer) return
  const start = () => {
    exercisePreloadIdleId = undefined
    exercisePreloadTimer = undefined
    void preloadExerciseSurfaces()
  }
  if ('requestIdleCallback' in window) {
    exercisePreloadIdleId = window.requestIdleCallback(start, { timeout: 2_000 })
    return
  }
  exercisePreloadTimer = setTimeout(start, 650)
}

watch(isPrintOpen, async (open) => {
  if (!open || printPreviewComponent.value) return
  printPreviewComponent.value = markRaw((await import('./PrintPreview.vue')).default)
})

const displayedVerbIds = computed(() => tourActive.value || isPrefilledChallenge.value ? revealedPresetVerbIds.value : challenge.value.verbIds)
const displayedTenseIds = computed(() => tourActive.value || isPrefilledChallenge.value ? revealedPresetTenseIds.value : challenge.value.tenseIds)
const displayedSelectedVerbs = computed(() => {
  const displayedIds = new Set(displayedVerbIds.value)
  return selectedVerbs.value.filter(verb => displayedIds.has(verb.id))
})

function cancelPresetReveal() {
  presetRevealTimers.forEach(timer => clearTimeout(timer))
  presetRevealTimers = []
}

function refreshTourHighlight() {
  if (!tourActive.value) return
  void nextTick().then(() => {
    requestAnimationFrame(() => {
      if (tourActive.value) tourDriver?.refresh()
    })
  })
}

function revealIds(ids: number[], target: Ref<number[]>, duration = 1_000) {
  target.value = []
  if (!ids.length) return
  if (import.meta.server) {
    target.value = [...ids]
    return
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    target.value = [...ids]
    refreshTourHighlight()
    return
  }
  const interval = duration / ids.length
  ids.forEach((id, index) => {
    presetRevealTimers.push(setTimeout(() => {
      target.value = [...target.value, id]
      refreshTourHighlight()
    }, Math.round(index * interval)))
  })
}

function withExampleSubject(value: string) {
  const subject = challenge.value.inclusivePronouns
    ? 'iel'
    : challenge.value.includeOnPronoun ? 'on' : 'il'
  return value.replace(/\b(?:il|elle|iel)\b/iu, match => (
    /^\p{Lu}/u.test(match) ? subject.charAt(0).toLocaleUpperCase('fr') + subject.slice(1) : subject
  ))
}

function capitalizeExampleSentence(value: string) {
  return value.replace(/\p{L}/u, letter => letter.toLocaleUpperCase('fr'))
}

const conjugationInstruction = computed(() => conjugationInstructionRaw.value)
const conjugationQuestionContext = computed(() => withExampleSubject(conjugationQuestionContextRaw.value))
const conjugationQuestion = computed(() => capitalizeExampleSentence(withExampleSubject(conjugationQuestionRaw.value)))
const conjugationExample = computed(() => capitalizeExampleSentence(withExampleSubject(conjugationExampleRaw.value)))
const conjugationExamplePrefix = computed(() => capitalizeExampleSentence(withExampleSubject(conjugationExamplePrefixRaw.value)))
const conjugationExampleEmphasis = computed(() => {
  const emphasis = withExampleSubject(conjugationExampleEmphasisRaw.value)
  return conjugationExamplePrefixRaw.value ? emphasis : capitalizeExampleSentence(emphasis)
})
const conjugationExampleSuffix = computed(() => withExampleSubject(conjugationExampleSuffixRaw.value))

function expectedAnswerParts(question: ExerciseQuestion | undefined) {
  const answer = question?.reponsesPourCorrige[0] ?? ''
  if (!question || !answer) return { prefix: '', emphasis: '', suffix: '' }
  if (!question.conjugaison1) return { prefix: '', emphasis: answer, suffix: '' }

  let start = 0
  let end = answer.length
  if (question.complementPosition === 'before' && question.complement && answer.startsWith(question.complement)) {
    start = question.complement.length
    while (/\s/u.test(answer[start] ?? '')) start += 1
    if (question.relativePronoun && answer.slice(start).startsWith(question.relativePronoun)) {
      start += question.relativePronoun.length
      while (/\s/u.test(answer[start] ?? '')) start += 1
    }
  }
  if (question.saisiePrefixe && answer.slice(start).startsWith(question.saisiePrefixe)) {
    start += question.saisiePrefixe.length
    while (/\s/u.test(answer[start] ?? '')) start += 1
  }
  if (question.complementPosition === 'after' && question.complement) {
    const complementStart = answer.lastIndexOf(question.complement)
    if (complementStart >= start) {
      end = complementStart
      while (end > start && /\s/u.test(answer[end - 1] ?? '')) end -= 1
    }
  }
  if (start >= end) return { prefix: '', emphasis: answer, suffix: '' }
  return {
    prefix: answer.slice(0, start),
    emphasis: answer.slice(start, end),
    suffix: answer.slice(end),
  }
}

const shareUrl = computed(() => shareCode.value
  ? new URL(localePath(`/defi/${encodeURIComponent(shareCode.value)}`), requestUrl.origin).toString()
  : '')

const stepStatus = computed(() => ({
  verbs: selectedVerbs.value.length,
  tenses: selectedTenses.value.length
}))
const activePreset = computed(() => catalogue.value.presets.find(preset => preset.id === activePresetId.value) ?? null)
const sourcePreset = computed(() => catalogue.value.presets.find(preset => preset.id === sourcePresetId.value) ?? null)
const activePresetGroupLabel = computed(() => activePreset.value
  ? activePreset.value.groupLabel ?? challengePresetGroupLabels[activePreset.value.group] ?? activePreset.value.group
  : '')
const activePresetTitleGroupLabel = computed(() => activePreset.value?.group === 'school'
  ? ui('Niveau scolaire suisse')
  : activePresetGroupLabel.value)
const activePresetDisplayTitle = computed(() => activePreset.value
  ? [activePresetTitleGroupLabel.value, activePreset.value.label]
      .filter(Boolean)
      .join(' | ')
  : '')
const showSavedChallengeSummary = computed(() => (
  isPrefilledChallenge.value
  && Boolean(savedChallengeTitle.value || savedChallengeDescription.value)
))
const heroTitle = computed(() => {
  if (currentStep.value === 0) return 'TATITOTU'
  if (activePreset.value) return activePresetDisplayTitle.value
  if (isPrefilledChallenge.value && challengeCode.value) return `Défi ${challengeCode.value}`
  return ui('Construire mon défi')
})

function requestedLandingTense() {
  const requested = Array.isArray(route.query.parcours) ? route.query.parcours[0] : route.query.parcours
  const tenseByJourney: Record<string, string> = {
    present: 'présent',
    imparfait: 'imparfait',
    'passe-compose': 'passé composé',
  }
  return requested ? tenseByJourney[requested] : undefined
}

function requestedLandingMode() {
  const requested = Array.isArray(route.query.mode) ? route.query.mode[0] : route.query.mode
  const modeByJourney: Record<string, string> = {
    indicatif: 'indicatif',
    subjonctif: 'subjonctif',
    conditionnel: 'conditionnel',
    imperatif: 'impératif',
    participe: 'participe',
  }
  return requested ? modeByJourney[requested] : undefined
}

function requestedModeTense() {
  const requested = Array.isArray(route.query.temps) ? route.query.temps[0] : route.query.temps
  if (!requested) return undefined
  const tenseAliases: Record<string, string> = {
    'futur simple': 'futur',
    'passé première forme': 'passé 1',
    'passé deuxième forme': 'passé 2',
    'gérondif présent': 'présent',
    'gérondif passé': 'passé',
  }
  return tenseAliases[requested] ?? requested
}

function requestedLearningIdentification() {
  const requested = Array.isArray(route.query.identifier) ? route.query.identifier[0] : route.query.identifier
  return requested === 'mode-temps'
}

const SIMPLE_LEARNING_VERBS = [
  'aimer',
  'parler',
  'regarder',
  'travailler',
  'jouer',
  'demander',
  'donner',
  'habiter',
  'chercher',
  'penser',
] as const

function commonLearningVerbIds(count = 10) {
  const verbsByInfinitive = new Map(catalogue.value.verbes.map(verb => [verb.infinitif.toLocaleLowerCase('fr'), verb]))
  return SIMPLE_LEARNING_VERBS
    .slice(0, count)
    .map(infinitive => verbsByInfinitive.get(infinitive)?.id)
    .filter((id): id is number => id !== undefined)
}

try {
  await loadCatalogue()
  if (!wizardInitialized.value) {
    clearVerbs()
    clearTenses()
    wizardInitialized.value = true
  }
  const landingTense = requestedLandingTense()
  const landingMode = requestedLandingMode()
  const modeTense = requestedModeTense()
  const learningIdentification = requestedLearningIdentification()
  if ((landingTense || landingMode || learningIdentification) && !props.initialCode) {
    const indicative = catalogue.value.modes.find(mode => mode.name.toLocaleLowerCase('fr') === 'indicatif')
    const tense = landingTense ? catalogue.value.temps.find(candidate => (
      candidate.name.toLocaleLowerCase('fr') === landingTense
      && (!indicative || candidate.modeId === indicative.id)
    )) : undefined
    const requestedModeName = landingMode === 'participe' && String(route.query.temps || '').startsWith('gérondif')
      ? 'gérondif'
      : landingMode
    const mode = requestedModeName ? catalogue.value.modes.find(candidate => candidate.name.toLocaleLowerCase('fr') === requestedModeName) : undefined
    const selectedModeTense = mode && modeTense ? catalogue.value.temps.find(candidate => (
      candidate.modeId === mode.id
      && candidate.name.toLocaleLowerCase('fr') === modeTense
    )) : undefined
    const tenseIds = learningIdentification
      ? catalogue.value.temps.map(candidate => candidate.id)
      : tense
        ? [tense.id]
        : selectedModeTense ? [selectedModeTense.id]
        : mode ? catalogue.value.temps.filter(candidate => candidate.modeId === mode.id).map(candidate => candidate.id) : []
    if (tenseIds.length) {
      const defaults = createDefaultChallenge()
      challenge.value = {
        ...defaults,
        verbIds: commonLearningVerbIds(),
        tenseIds,
        questionCount: 10,
        exerciseKind: learningIdentification ? 'tense-identification' : defaults.exerciseKind,
        identificationSource: learningIdentification ? 'literary-corpus' : defaults.identificationSource,
        complementOptions: [...defaults.complementOptions],
        printOptions: { ...defaults.printOptions },
      }
      activePresetId.value = undefined
      sourcePresetId.value = undefined
      sourcePresetRandomCount.value = null
      isPrefilledChallenge.value = true
      revealedPresetVerbIds.value = [...challenge.value.verbIds]
      revealedPresetTenseIds.value = [...challenge.value.tenseIds]
      currentStep.value = 4
      showLaunchSummary.value = true
    }
  }
  if (props.initialPresetId && !props.initialCode && !landingTense && !landingMode && !learningIdentification) {
    const preset = catalogue.value.presets.find(candidate => candidate.id === props.initialPresetId)
    if (preset) {
      selectPreset(preset)
      if (props.startAtLaunch && isReady.value) {
        cancelPresetReveal()
        revealedPresetVerbIds.value = [...challenge.value.verbIds]
        revealedPresetTenseIds.value = [...challenge.value.tenseIds]
        presetTenseRevealPending.value = false
        prefilledOptionsRevealPending.value = false
        goToStep(4)
        showLaunchSummary.value = true
      }
    }
  }
  if (props.initialCode) {
    challengeCode.value = normalizeChallengeCode(props.initialCode)
    await restoreChallenge()
  }
} catch {
  // Le composable fournit le message d'erreur affiché dans la page.
}

function logUsage(event: 'homepage' | 'print' | 'challenge-save' | 'challenge-load' | 'exercise') {
  if (import.meta.server) return
  const detailedEvent = { homepage: 'homepage', print: 'print_opened', 'challenge-save': 'challenge_save', 'challenge-load': 'challenge_load', exercise: 'exercise_started' } as const
  track(detailedEvent[event], event === 'exercise' ? { presentation: exercisePresentation.value, exerciseKind: challenge.value.exerciseKind } : undefined)
}

function exposeUsageFeature(feature: string) {
  if (!import.meta.client || tourActive.value || exposedUsageFeatures.has(feature)) return
  exposedUsageFeatures.add(feature)
  track('feature_exposed', { feature })
}

function complementAnalyticsValue() {
  const options = challenge.value.complementOptions
  const hasCod = options.some(option => option.startsWith('cod-'))
  const hasCoi = options.some(option => option.startsWith('coi-'))
  return hasCod && hasCoi ? 'cod-coi' : hasCod ? 'cod' : hasCoi ? 'coi' : 'none'
}

function questionCountBand() {
  const count = challenge.value.questionCount
  return count <= 5 ? '1-5' : count <= 10 ? '6-10' : count <= 20 ? '11-20' : '21+'
}

function exerciseUsageMetadata(presentation: 'classic' | 'chat' | 'print') {
  return {
    feature: presentation === 'chat' ? 'exercise.chat' : presentation === 'print' ? 'print.preview' : 'exercise.classic',
    presentation,
    exerciseKind: challenge.value.exerciseKind,
    source: sourcePresetId.value ? 'preset' : challengeCode.value ? 'code' : 'custom',
    voiceMode: challenge.value.voiceMode,
    learningSupportMode: challenge.value.learningSupportMode,
    complements: complementAnalyticsValue(),
    complementPlacement: challenge.value.complementPlacement,
    questionCountBand: questionCountBand(),
    inclusivePronouns: challenge.value.inclusivePronouns,
    includeOnPronoun: challenge.value.includeOnPronoun,
    identificationSource: challenge.value.identificationSource,
    ...(sourcePresetId.value ? { preset: sourcePresetId.value } : {}),
  }
}

function syncGuidedTourAvailability() {
  guidedTourDisabled.value = guidedTourMediaQuery?.matches === true
  if (!guidedTourDisabled.value) return
  if (tourPromptTimer) clearTimeout(tourPromptTimer)
  isTourWelcomeOpen.value = false
  guidedTourRequested.value = false
  if (tourActive.value) tourDriver?.destroy()
}

onMounted(() => {
  guidedTourMediaQuery = window.matchMedia('(max-width: 640px)')
  syncGuidedTourAvailability()
  guidedTourMediaQuery.addEventListener('change', syncGuidedTourAvailability)
  wizardAtHome.value = currentStep.value === 0
  logUsage('homepage')
  exposeUsageFeature('preset.library')
  exposeUsageFeature('builder.custom')
  exposeUsageFeature('challenge.load')
  try {
    if (sessionStorage.getItem('highlight-home-challenge-loader') === '1') {
      sessionStorage.removeItem('highlight-home-challenge-loader')
      highlightChallengeLoader.value = true
    }
  } catch {
    // L'accueil fonctionne normalement si le stockage du navigateur est indisponible.
  }
  if (guidedTourDisabled.value) return
  try {
    const completed = localStorage.getItem(GUIDED_TOUR_COMPLETED_STORAGE_KEY) === 'completed'
    let reminderState = parseGuidedTourReminderState(localStorage.getItem(GUIDED_TOUR_REMINDER_STORAGE_KEY))

    // Conserve le choix des personnes ayant cliqué avant le passage au stockage persistant.
    if (!reminderState && sessionStorage.getItem('tatitotu-guided-tour-postponed') === '1') {
      reminderState = postponedGuidedTourState()
      localStorage.setItem(GUIDED_TOUR_REMINDER_STORAGE_KEY, JSON.stringify(reminderState))
      sessionStorage.removeItem('tatitotu-guided-tour-postponed')
    }

    if (!completed && !reminderState) {
      tourPromptTimer = setTimeout(() => {
        if (!falcMode.value && currentStep.value === 0 && !tourActive.value && !isTourWelcomeOpen.value) {
          tourWelcomeSource.value = 'initial'
          isTourWelcomeOpen.value = true
        }
      }, 900)
    }
    else if (!completed && reminderState && !reminderState.reminderShown) {
      reminderState = registerGuidedTourHomepageVisit(reminderState)
      localStorage.setItem(GUIDED_TOUR_REMINDER_STORAGE_KEY, JSON.stringify(reminderState))
      if (shouldRemindAboutGuidedTour(reminderState)) {
        tourPromptTimer = setTimeout(() => {
          if (falcMode.value || currentStep.value !== 0 || tourActive.value || isTourWelcomeOpen.value) return
          try {
            localStorage.setItem(GUIDED_TOUR_REMINDER_STORAGE_KEY, JSON.stringify({
              ...reminderState,
              reminderShown: true,
            }))
          } catch {
            // Le rappel peut tout de même être affiché si le stockage devient indisponible.
          }
          tourWelcomeSource.value = 'reminder'
          isTourWelcomeOpen.value = true
        }, 900)
      }
    }
  } catch {
    // La visite reste accessible manuellement si le stockage est indisponible.
  }
})

async function retryCatalogue() {
  try {
    await loadCatalogue(true)
  } catch {
    // L'état d'erreur est déjà exposé par le composable.
  }
}

function clearMessages() {
  actionError.value = ''
  notice.value = ''
  codeError.value = ''
}

function onChallengeCodeInput(event: Event) {
  const element = event.currentTarget as HTMLElement
  const original = element.textContent ?? ''
  const value = original.replace(/[^a-z0-9-]/giu, '').slice(0, 11)
  if (value !== original) {
    element.textContent = value
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(element)
    range.collapse(false)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }
  challengeCode.value = value
  codeError.value = ''
}

function markAsCustom() {
  cancelPresetReveal()
  revealedPresetVerbIds.value = [...challenge.value.verbIds]
  revealedPresetTenseIds.value = [...challenge.value.tenseIds]
  presetTenseRevealPending.value = false
  prefilledOptionsRevealPending.value = false
  isPrefilledChallenge.value = false
  activePresetId.value = undefined
  clearMessages()
}

function goToStep(step: WizardStep) {
  if (isPreparingStep4.value) return
  if (falcMode.value && step === 4) return
  showLaunchSummary.value = false
  if (step === 0) {
    currentStep.value = 0
    return
  }
  if (step === 2 && selectedVerbs.value.length === 0) return
  if ((step === 3 || step === 4) && !isReady.value) return
  currentStep.value = step
  if (step === 4) {
    exposeUsageFeature('exercise.classic')
    exposeUsageFeature('exercise.chat')
    exposeUsageFeature('print.preview')
    exposeUsageFeature('challenge.share')
  }
  if (step === 1 && isPrefilledChallenge.value) {
    cancelPresetReveal()
    revealedPresetVerbIds.value = []
    nextTick(() => revealIds(challenge.value.verbIds, revealedPresetVerbIds))
  }
  if (step === 2 && isPrefilledChallenge.value) {
    cancelPresetReveal()
    presetTenseRevealPending.value = false
    revealedPresetTenseIds.value = []
    nextTick(() => revealIds(challenge.value.tenseIds, revealedPresetTenseIds))
  }
  if (step === 3) void refreshConjugationExample()
}

async function startCustomChallenge() {
  track('feature_selected', { feature: 'builder.custom' })
  restartChallenge()
  goToStep(1)
  await nextTick()
  document.getElementById('verb-search-input')?.focus({ preventScroll: true })
}

function applyFalcTenseDefaults() {
  const defaultNames = new Set(['présent', 'imparfait', 'passé composé', 'futur', 'futur simple'])
  const indicativeModeIds = new Set(catalogue.value.modes
    .filter(mode => mode.name.toLocaleLowerCase('fr') === 'indicatif')
    .map(mode => mode.id))
  challenge.value.tenseIds = catalogue.value.temps
    .filter(tense => indicativeModeIds.has(tense.modeId) && defaultNames.has(tense.name.toLocaleLowerCase('fr')))
    .map(tense => tense.id)
}

function applyFalcExerciseDefaults() {
  challenge.value.exerciseKind = 'conjugation'
  challenge.value.voiceMode = 'active'
  challenge.value.includeComplements = false
  challenge.value.complementOptions = []
}

function nextStep() {
  if (currentStep.value === 1 && selectedVerbs.value.length) goToStep(2)
  else if (currentStep.value === 2 && selectedTenses.value.length) goToStep(3)
  else if (currentStep.value === 3) {
    if (falcMode.value) void prepareExercise('classic')
    else void prepareStep4()
  }
}

async function prepareStep4() {
  if (!isReady.value || isPreparingStep4.value) return
  if (currentStep.value !== 3) {
    goToStep(4)
    return
  }
  isPreparingStep4.value = true
  await new Promise(resolve => setTimeout(resolve, 1_000))
  isPreparingStep4.value = false
  goToStep(4)
  exposeUsageFeature('exercise.classic')
  exposeUsageFeature('exercise.chat')
  exposeUsageFeature('print.preview')
  exposeUsageFeature('challenge.share')
}

function previousStep() {
  if (currentStep.value === 1) {
    restartChallenge()
    return
  }
  if (currentStep.value > 1) goToStep((currentStep.value - 1) as WizardStep)
}

function restartChallenge() {
  cancelPresetReveal()
  clearVerbs()
  clearTenses()
  if (falcMode.value) applyFalcTenseDefaults()
  challenge.value.questionCount = 10
  challenge.value.exerciseKind = 'conjugation'
  challenge.value.pastSimplePronouns = 'all'
  challenge.value.inclusivePronouns = false
  challenge.value.includeOnPronoun = false
  challenge.value.voiceMode = 'active'
  challenge.value.includeComplements = true
  challenge.value.complementPlacement = 'after'
  challenge.value.complementOptions = ['cod-after', 'coi-after']
  if (falcMode.value) applyFalcExerciseDefaults()
  activePresetId.value = undefined
  sourcePresetId.value = undefined
  sourcePresetRandomCount.value = null
  prefilledOptionsRevealPending.value = false
  isPrefilledChallenge.value = false
  isPresetVerbEditing.value = false
  presetExpanded.value = false
  presetStage.value = 'groups'
  challengeCode.value = ''
  codeError.value = ''
  notice.value = ''
  actionError.value = ''
  selectedCoach.value = null
  questions.value = []
  printQuestions.value = []
  shareCode.value = ''
  shareTitle.value = ''
  shareDescription.value = ''
  shareError.value = ''
  savedChallengeTitle.value = ''
  savedChallengeDescription.value = ''
  isExerciseOpen.value = false
  isPrintOpen.value = false
  isShareOpen.value = false
  isCoachPickerOpen.value = false
  showLaunchSummary.value = false
  clearMessages()
  goToStep(0)
}

function tourQuestions(): ExerciseQuestion[] {
  const demoVerb = catalogue.value.verbes.find(verb => verb.infinitif.toLocaleLowerCase('fr') === 'être')
  const compoundTenses = catalogue.value.temps.filter(tense => tense.isCompound)
  const demoTense = catalogue.value.temps.find(tense => (
    tense.name.toLocaleLowerCase('fr') === 'passé composé'
    && (tense.mode?.name.toLocaleLowerCase('fr') === 'indicatif'
      || catalogue.value.modes.find(mode => mode.id === tense.modeId)?.name.toLocaleLowerCase('fr') === 'indicatif')
  )) ?? compoundTenses[0]
  const mode = demoTense?.mode?.name
    ?? catalogue.value.modes.find(item => item.id === demoTense?.modeId)?.name
    ?? 'indicatif'
  const infinitive = 'être'
  const tenseName = demoTense?.name ?? 'passé composé'
  const forms = [
    { subject: 'tu', answer: 'as été', personId: 5 },
    { subject: 'il', answer: 'a été', personId: 6 },
    { subject: 'nous', answer: 'avons été', personId: 7 },
    { subject: 'vous', answer: 'avez été', personId: 8 },
    { subject: 'ils', answer: 'ont été', personId: 9 },
    { subject: 'je', answer: 'ai été', personId: 4 },
  ]

  return Array.from({ length: 10 }, (_, index) => {
    const { subject, answer, personId } = forms[index % forms.length]!
    return {
    id: `guided-tour-${index + 1}`,
    titre: `${infinitive} · ${tenseName}`,
    instruction: 'Conjugue le verbe à la forme demandée.',
    consigne: `${subject} | ${infinitive} | ${tenseName}`,
    reponses: [answer],
    reponsesPourCorrige: [answer],
    verbeId: demoVerb?.id,
    tenseId: demoTense?.id,
    personId,
    infinitif: infinitive,
    pronom: subject,
    temps: tenseName,
    mode,
    tenseCode: demoTense?.code,
    modeCode: demoTense?.mode?.code,
    isCompound: true,
    conjugaison1: answer,
    }
  })
}

function fallbackTourCoach(): CoachProfile {
  const reply = (id: number, eventType: CoachProfile['replies'][number]['eventType'], content: string) => ({
    id,
    eventType,
    content,
    weight: 1,
    isActive: true,
  })
  return {
    id: -1,
    slug: 'guide-demo',
    firstName: 'Camille',
    lastName: '',
    gender: 'female',
    avatarPath: '/coach-media/people/portrait1.jpg',
    description: 'Je t’aide à avancer étape par étape.',
    likes: 'les mots et les défis',
    caractereId: -1,
    caractereName: 'Guide',
    personality: 'calme et encourageante',
    pedagogicalStyle: 'aide progressive',
    helpApproach: 'complete',
    themeColor: '#397b75',
    status: 'published',
    sortOrder: 0,
    replies: [
      reply(-1, 'introduction', 'Bonjour ! Nous allons essayer ce défi ensemble.'),
      reply(-2, 'question', 'À toi pour la question {questionNumber}.'),
      reply(-3, 'help-announcement', 'Regardons ensemble comment construire la réponse.'),
      reply(-4, 'correct', 'Bravo, c’est juste !'),
      reply(-5, 'incorrect', 'Ce n’est pas encore cela. Observe bien la forme demandée.'),
      reply(-6, 'finish', 'Le défi est terminé. Bravo pour ton travail !'),
      reply(-7, 'restart', 'C’est reparti !'),
      reply(-8, 'correct-alternative', 'Cette réponse est également correcte.'),
    ],
    media: [],
    assignments: [],
    rules: [],
  }
}

async function loadTourCoach() {
  try {
    const response = await $fetch<{ coaches: CoachProfile[] }>('/api/coaches')
    return response.coaches.find(coach => coach.status === 'published' && coach.helpApproach === 'complete')
      ?? response.coaches.find(coach => coach.status === 'published')
      ?? response.coaches[0]
      ?? fallbackTourCoach()
  } catch {
    return fallbackTourCoach()
  }
}

function prepareTourChallenge() {
  const complementVerb = catalogue.value.verbes.find(verb => (
    verb.infinitif.toLocaleLowerCase('fr') === 'manger'
    && (verb.complementFunctions?.includes('cod') || verb.complementExample?.functionObject === 'cod')
  )) ?? catalogue.value.verbes.find(verb => (
    verb.complementFunctions?.includes('cod') || verb.complementExample?.functionObject === 'cod'
  ))
  const preferredVerbs = [
    complementVerb?.id,
    ...['être', 'avoir'].map(name => catalogue.value.verbes.find(verb => verb.infinitif.toLocaleLowerCase('fr') === name)?.id),
  ]
    .filter((id): id is number => id !== undefined)
  const verbIds = [...new Set([
    ...preferredVerbs,
    ...catalogue.value.verbes.map(verb => verb.id),
  ])].slice(0, 20)
  const preferredTenseNames = ['présent', 'imparfait', 'futur simple', 'passé composé', 'plus-que-parfait', 'conditionnel présent']
  const tenseIds = [...new Set([
    ...preferredTenseNames.map(name => catalogue.value.temps.find(tense => tense.name.toLocaleLowerCase('fr') === name)?.id),
    ...catalogue.value.temps.map(tense => tense.id),
  ].filter((id): id is number => id !== undefined))].slice(0, 6)

  challenge.value = {
    ...challenge.value,
    verbIds,
    tenseIds,
    questionCount: 10,
    exerciseKind: 'conjugation',
    pastSimplePronouns: 'all',
    inclusivePronouns: false,
    includeOnPronoun: false,
    voiceMode: 'active',
    includeComplements: true,
    complementPlacement: 'after',
    complementOptions: ['cod-after'],
    printOptions: {
      ...challenge.value.printOptions,
      title: 'Défi de démonstration',
      showVerbs: true,
      showTenses: true,
    },
  }
  questions.value = tourQuestions()
  printQuestions.value = [...questions.value]
  activePresetId.value = undefined
  sourcePresetId.value = undefined
  sourcePresetRandomCount.value = null
  isPrefilledChallenge.value = false
  isPresetVerbEditing.value = false
  showLaunchSummary.value = false
  presetStage.value = 'groups'
  presetExpanded.value = false
  revealedPresetVerbIds.value = []
  revealedPresetTenseIds.value = []
  currentStep.value = 0
}

function closeTourWindows() {
  isExerciseOpen.value = false
  isCoachPickerOpen.value = false
  isPrintOpen.value = false
  isShareOpen.value = false
}

function setTourOptionsExample() {
  conjugationExampleRequest += 1
  conjugationExampleLoading.value = false
  conjugationInstructionRaw.value = 'Conjugue le verbe au présent.'
  conjugationQuestionContextRaw.value = 'il | manger | présent'
  conjugationQuestionRaw.value = ''
  conjugationExampleRaw.value = 'Il mange une pomme.'
  conjugationExamplePrefixRaw.value = 'Il mange '
  conjugationExampleEmphasisRaw.value = 'une pomme'
  conjugationExampleSuffixRaw.value = '.'
  conjugationLiteraryCitationRaw.value = undefined
}

async function showTourBuilderStep(step: WizardStep, secondaryFocus: WizardStep | null = null) {
  closeTourWindows()
  currentStep.value = step
  presetExpanded.value = false
  revealedPresetVerbIds.value = step >= 2 ? [...challenge.value.verbIds] : revealedPresetVerbIds.value
  revealedPresetTenseIds.value = step >= 3 ? [...challenge.value.tenseIds] : revealedPresetTenseIds.value
  if (step === 3) setTourOptionsExample()
  await nextTick()
  tourSecondaryWizardStep.value = secondaryFocus
  if (secondaryFocus === null) return
  await nextTick()
  const stepElement = document.querySelector<HTMLElement>(`[data-tour-wizard-step="${secondaryFocus}"]`)
  if (!stepElement) return
  tourWizardIndicatorStyle.value = {
    left: `${stepElement.offsetLeft - 5}px`,
    top: `${stepElement.offsetTop - 5}px`,
    width: `${stepElement.offsetWidth + 10}px`,
    height: `${stepElement.offsetHeight + 10}px`,
  }
}

async function openTourChat(showHelp: boolean) {
  closeTourWindows()
  currentStep.value = 4
  selectedCoach.value ??= await loadTourCoach()
  if (!tourActive.value) return
  await loadChatExercise()
  exercisePresentation.value = 'chat'
  isExerciseOpen.value = true
  await nextTick()
  await chatExerciseRef.value?.waitUntilTourReady()
  if (!tourActive.value) return
  if (showHelp) chatExerciseRef.value?.showDemoHelp()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}

function tourSteps(format: TourFormat): DriveStep[] {
  const copy = tourCopy.value
  type TourScene = {
    element?: string
    secondaryWizardStep?: WizardStep
    title: string
    description: string
    activate: () => void | Promise<void>
  }

  const homeScene = (element: string, title: string, description: string): TourScene => ({
    element,
    title,
    description,
    activate: async () => {
      closeTourWindows()
      cancelPresetReveal()
      currentStep.value = 0
      presetExpanded.value = false
      challengeCode.value = ''
      await nextTick()
      const codeElement = document.getElementById('wizard-challenge-code')
      if (codeElement) codeElement.textContent = ''
    },
  })

  const scenes: TourScene[] = [
    homeScene('[data-tour="build-custom"]', copy.buildTitle, copy.buildDescription),
    {
      element: '[data-tour="wizard-steps"]',
      title: copy.stepsTitle,
      description: copy.stepsDescription,
      activate: () => showTourBuilderStep(1),
    },
    {
      element: '[data-tour="verbs"]',
      secondaryWizardStep: 1,
      title: copy.verbsTitle,
      description: copy.verbsDescription,
      activate: async () => {
        cancelPresetReveal()
        revealedPresetVerbIds.value = []
        await showTourBuilderStep(1, 1)
        revealIds(challenge.value.verbIds, revealedPresetVerbIds, 2_000)
      },
    },
    {
      element: '[data-tour="tenses"]',
      secondaryWizardStep: 2,
      title: copy.tensesTitle,
      description: copy.tensesDescription,
      activate: async () => {
        cancelPresetReveal()
        revealedPresetVerbIds.value = [...challenge.value.verbIds]
        revealedPresetTenseIds.value = []
        await showTourBuilderStep(2, 2)
        revealIds(challenge.value.tenseIds, revealedPresetTenseIds, 2_000)
      },
    },
    {
      element: '[data-tour="options"]',
      secondaryWizardStep: 3,
      title: copy.optionsTitle,
      description: copy.optionsDescription,
      activate: () => showTourBuilderStep(3, 3),
    },
    {
      element: '[data-tour="options-complements"]',
      secondaryWizardStep: 3,
      title: copy.complementsTitle,
      description: copy.complementsDescription,
      activate: () => showTourBuilderStep(3, 3),
    },
    {
      element: '[data-tour="options-preview"]',
      secondaryWizardStep: 3,
      title: copy.previewTitle,
      description: copy.previewDescription,
      activate: () => showTourBuilderStep(3, 3),
    },
    {
      element: '[data-tour="actions"]',
      secondaryWizardStep: 4,
      title: copy.createTitle,
      description: copy.createDescription,
      activate: () => showTourBuilderStep(4, 4),
    },
    {
      element: '[data-tour="classic-exercise"]',
      title: copy.classicTitle,
      description: copy.classicDescription,
      activate: async () => {
        closeTourWindows()
        currentStep.value = 4
        await loadClassicExercise()
        exercisePresentation.value = 'classic'
        isExerciseOpen.value = true
        await nextTick()
        classicExerciseRef.value?.showTourProgress()
      },
    },
    {
      element: '[data-tour="coach-complete-group"]',
      title: copy.coachTitle,
      description: copy.coachDescription,
      activate: async () => {
        closeTourWindows()
        currentStep.value = 4
        await loadCoachPicker()
        isCoachPickerOpen.value = true
        await nextTick()
      },
    },
    {
      element: '[data-tour="chat-dialog"]',
      title: copy.chatTitle,
      description: copy.chatDescription,
      activate: () => openTourChat(false),
    },
    {
      element: '[data-tour="chat-help"]',
      title: copy.helpTitle,
      description: copy.helpDescription,
      activate: () => openTourChat(true),
    },
    {
      element: '[data-tour="print-preview"]',
      title: copy.printTitle,
      description: copy.printDescription,
      activate: async () => {
        closeTourWindows()
        currentStep.value = 4
        printQuestions.value = [...questions.value]
        isPrintOpen.value = true
        await nextTick()
      },
    },
    {
      element: '[data-tour="share-dialog"]',
      title: copy.shareTitle,
      description: copy.shareDescription,
      activate: async () => {
        closeTourWindows()
        currentStep.value = 4
        shareCode.value = 'DE-MO-20-26'
        isShareOpen.value = true
        await nextTick()
      },
    },
    {
      element: '[data-tour="code-loader"]',
      title: copy.resumeTitle,
      description: copy.resumeDescription,
      activate: async () => {
        closeTourWindows()
        currentStep.value = 0
        presetExpanded.value = false
        challengeCode.value = 'DE-MO-20-26'
        await nextTick()
        const codeElement = document.getElementById('wizard-challenge-code')
        if (codeElement) codeElement.textContent = challengeCode.value
      },
    },
    {
      element: '[data-tour="falc-mode"]',
      title: copy.falcTitle,
      description: copy.falcDescription,
      activate: async () => {
        closeTourWindows()
        currentStep.value = 0
        await nextTick()
      },
    },
    {
      element: '[data-tour="learner-account"]',
      title: copy.accountTitle,
      description: copy.accountDescription,
      activate: async () => {
        closeTourWindows()
        currentStep.value = 0
        await nextTick()
      },
    },
    {
      title: copy.completedTitle,
      description: copy.completedDescription,
      activate: async () => {
        closeTourWindows()
        currentStep.value = 0
        await nextTick()
      },
    },
  ]

  const quickSceneIndexes = [0, 1, 2, 3, 4, 7, 8, 9, 11, 13, 14, 16, 17]
  const activeScenes = format === 'quick'
    ? quickSceneIndexes.map(index => scenes[index]!)
    : scenes
  let moving = false

  const waitForScenePlacement = async (index: number, scene: TourScene, activeDriver: Driver) => {
    const startedAt = Date.now()
    while (tourActive.value && Date.now() - startedAt < 8_000) {
      const expectedElement = scene.element ? document.querySelector(scene.element) : undefined
      const activeElement = document.querySelector('.driver-active-element')
      const isPlaced = activeDriver.getActiveIndex() === index
        && (!scene.element || (expectedElement && activeElement === expectedElement))
      if (isPlaced) {
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
        return
      }
      await new Promise(resolve => setTimeout(resolve, 16))
    }
  }

  const moveToScene = async (index: number, activeDriver: Driver) => {
    if (moving || !tourActive.value || !activeScenes[index]) return
    track('tour_step', { tourFormat: format, step: index + 1 })
    moving = true
    document.body.classList.add('guided-tour-transitioning')
    try {
      const scene = activeScenes[index]
      if (scene.secondaryWizardStep === undefined) tourSecondaryWizardStep.value = null
      await scene.activate()
      if (!tourActive.value) return
      await nextTick()
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
      if (!tourActive.value) return
      const targetElement = scene.element
        ? document.querySelector<HTMLElement>(scene.element)
        : null
      const originalScrollIntoView = targetElement?.scrollIntoView
      if (targetElement) targetElement.scrollIntoView = () => {}
      try {
        activeDriver.moveTo(index)
      } finally {
        if (targetElement && originalScrollIntoView) targetElement.scrollIntoView = originalScrollIntoView
      }
      await waitForScenePlacement(index, scene, activeDriver)
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      activeDriver.refresh()
    } finally {
      document.body.classList.remove('guided-tour-transitioning')
      moving = false
    }
  }

  return activeScenes.map((scene, index) => ({
    ...(scene.element ? { element: scene.element, waitForElement: 8_000 } : {}),
    disableActiveInteraction: true,
    popover: {
      title: scene.title,
      description: scene.description,
      side: 'bottom',
      align: 'center',
      showButtons: [
        ...(index > 0 ? ['previous' as const] : []),
        'next' as const,
        'close' as const,
      ],
      ...(index < activeScenes.length - 1
        ? { onNextClick: (_element, _step, { driver: activeDriver }) => void moveToScene(index + 1, activeDriver) }
        : {}),
      ...(index > 0
        ? { onPrevClick: (_element, _step, { driver: activeDriver }) => void moveToScene(index - 1, activeDriver) }
        : {}),
    },
  }))
}

function restoreAfterTour() {
  if (trackedTourFormat && !tourCompleted) track('tour_abandoned', { tourFormat: trackedTourFormat })
  cancelPresetReveal()
  closeTourWindows()
  tourSecondaryWizardStep.value = null
  document.body.classList.remove('guided-tour-active')
  document.body.classList.remove('guided-tour-transitioning')
  const snapshot = tourSnapshot
  if (snapshot) {
    challenge.value = snapshot.challenge
    currentStep.value = snapshot.currentStep
    presetExpanded.value = snapshot.presetExpanded
    presetStage.value = snapshot.presetStage
    activePresetId.value = snapshot.activePresetId
    sourcePresetId.value = snapshot.sourcePresetId
    sourcePresetRandomCount.value = snapshot.sourcePresetRandomCount
    isPrefilledChallenge.value = snapshot.isPrefilledChallenge
    isPresetVerbEditing.value = snapshot.isPresetVerbEditing
    showLaunchSummary.value = snapshot.showLaunchSummary
  }
  challengeCode.value = ''
  const codeElement = document.getElementById('wizard-challenge-code')
  if (codeElement) codeElement.textContent = ''
  questions.value = []
  printQuestions.value = []
  shareCode.value = ''
  selectedCoach.value = null
  tourSnapshot = null
  tourDriver = null
  tourActive.value = false
  if (currentStep.value === 3) void refreshConjugationExample()
  if (tourCompleted) {
    try {
      localStorage.setItem(GUIDED_TOUR_COMPLETED_STORAGE_KEY, 'completed')
      localStorage.removeItem(GUIDED_TOUR_REMINDER_STORAGE_KEY)
    } catch {
      // La visite fonctionne même sans stockage persistant.
    }
  }
  tourCompleted = false
  trackedTourFormat = null
}

async function startGuidedTour(format: TourFormat) {
  if (guidedTourDisabled.value || tourActive.value || catalogueStatus.value !== 'success') return
  isTourWelcomeOpen.value = false
  tourWelcomeSource.value = null
  tourSnapshot = {
    challenge: JSON.parse(JSON.stringify(challenge.value)) as BuilderChallengeConfig,
    currentStep: currentStep.value,
    presetExpanded: presetExpanded.value,
    presetStage: presetStage.value,
    activePresetId: activePresetId.value,
    sourcePresetId: sourcePresetId.value,
    sourcePresetRandomCount: sourcePresetRandomCount.value,
    isPrefilledChallenge: isPrefilledChallenge.value,
    isPresetVerbEditing: isPresetVerbEditing.value,
    showLaunchSummary: showLaunchSummary.value,
  }
  closeTourWindows()
  prepareTourChallenge()
  tourActive.value = true
  tourCompleted = false
  trackedTourFormat = format
  track('tour_started', { tourFormat: format })
  document.body.classList.add('guided-tour-active')
  void preloadExerciseSurfaces()
  await nextTick()

  try {
    const [{ driver }] = await Promise.all([
      import('driver.js'),
      import('driver.js/dist/driver.css'),
    ])
    const copy = tourCopy.value
    const steps = tourSteps(format)
    tourDriver = driver({
      animate: false,
      smoothScroll: false,
      allowClose: true,
      allowScroll: true,
      overlayOpacity: .68,
      stagePadding: 12,
      stageRadius: 14,
      popoverClass: 'tatitotu-tour-popover',
      showProgress: true,
      nextBtnText: copy.next,
      prevBtnText: copy.previous,
      doneBtnText: copy.finish,
      progressText: copy.progress,
      steps,
      onPopoverRender: (popover) => {
        popover.closeButton.setAttribute('aria-label', copy.close)
        popover.closeButton.title = copy.close
      },
      onDoneClick: (_element, _step, { driver: activeDriver }) => {
        tourCompleted = true
        track('tour_completed', { tourFormat: format, step: steps.length })
        activeDriver.destroy()
      },
      onDestroyed: restoreAfterTour,
    })
    tourDriver.drive()
    track('tour_step', { tourFormat: format, step: 1 })
  } catch {
    restoreAfterTour()
    isTourWelcomeOpen.value = true
  }
}

function postponeTour() {
  isTourWelcomeOpen.value = false
  try {
    if (tourWelcomeSource.value === 'initial') {
      localStorage.setItem(GUIDED_TOUR_REMINDER_STORAGE_KEY, JSON.stringify(postponedGuidedTourState()))
    }
  } catch {
    // Le bouton reste fonctionnel sans stockage.
  }
  tourWelcomeSource.value = null
}

function openTourMenu() {
  if (guidedTourDisabled.value || falcMode.value || tourActive.value) return
  tourWelcomeSource.value = 'manual'
  isTourWelcomeOpen.value = true
}

watch(guidedTourRequested, (requested) => {
  if (!requested) return
  openTourMenu()
  guidedTourRequested.value = false
}, { immediate: true })

watch(homeResetRequested, (requested) => {
  if (!requested) return
  restartChallenge()
  homeResetRequested.value = false
}, { immediate: true })

watch(newChallengeRequested, (requested) => {
  if (!requested) return
  newChallengeRequested.value = false
  void startCustomChallenge()
}, { immediate: true })

function shuffledSample(ids: readonly number[], count: number) {
  const result = [...ids]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[randomIndex]] = [result[randomIndex]!, result[index]!]
  }
  return result.slice(0, count)
}

function selectPreset(preset: ChallengePreset, randomCount?: number) {
  cancelPresetReveal()
  applySelection({
    verbIds: randomCount ? shuffledSample(preset.verbIds, randomCount) : [...preset.verbIds],
    tenseIds: [...preset.tenseIds],
    questionCount: preset.questionCount
  })
  challenge.value.exerciseKind = preset.exerciseKind
  challenge.value.identificationSource = preset.identificationSource
  challenge.value.pastSimplePronouns = preset.pastSimplePronouns
  challenge.value.inclusivePronouns = preset.inclusivePronouns
  challenge.value.includeOnPronoun = preset.includeOnPronoun
  challenge.value.learningSupportMode = preset.learningSupportMode
  challenge.value.voiceMode = preset.voiceMode
  challenge.value.includeComplements = preset.includeComplements
  challenge.value.complementPlacement = preset.complementPlacement
  challenge.value.complementOptions = preset.complementOptions ?? legacyComplementOptions(preset.includeComplements, preset.complementPlacement)
  activePresetId.value = preset.id
  sourcePresetId.value = preset.id
  sourcePresetRandomCount.value = randomCount ?? null
  savedChallengeTitle.value = ''
  savedChallengeDescription.value = ''
  isPrefilledChallenge.value = true
  isPresetVerbEditing.value = false
  revealedPresetVerbIds.value = []
  revealedPresetTenseIds.value = []
  presetTenseRevealPending.value = true
  prefilledOptionsRevealPending.value = true
  notice.value = ''
  actionError.value = ''
  track('challenge_preset_selected', { preset: preset.id, exerciseKind: preset.exerciseKind })
  goToStep(1)
}

async function restoreChallenge() {
  const normalized = normalizeChallengeCode(challengeCode.value)
  if (!/^[A-Z0-9]{2}(?:-[A-Z0-9]{2}){3}$/.test(normalized)) {
    codeError.value = ui('Le code doit ressembler à AB-CD-EF-23.')
    return
  }

  busyAction.value = 'load'
  track('feature_selected', { feature: 'challenge.load' })
  codeError.value = ''
  actionError.value = ''
  notice.value = ''
  try {
    const restored = await api.loadChallenge(normalized)
    applySharedChallenge(restored)
    savedChallengeTitle.value = restored.title || ''
    savedChallengeDescription.value = restored.description || ''
    prefilledOptionsRevealPending.value = true
    isPrefilledChallenge.value = true
    activePresetId.value = undefined
    sourcePresetId.value = undefined
    sourcePresetRandomCount.value = null
    isPresetVerbEditing.value = false
    challengeCode.value = restored.code
    notice.value = `Le défi « ${restored.title || restored.code} » est chargé. Tu peux l’utiliser ou le modifier.`
    goToStep(4)
    logUsage('challenge-load')
  } catch (error) {
    track('feature_failed', { feature: 'challenge.load' })
    codeError.value = getChallengeErrorMessage(error, ui('Ce code ne correspond à aucun défi.'))
  } finally {
    busyAction.value = null
  }
}

function onAddVerb(id: number) {
  markAsCustom()
  addVerb(id)
}

function onRemoveVerb(id: number) {
  markAsCustom()
  removeVerb(id)
}

function onToggleTense(id: number) {
  markAsCustom()
  toggleTense(id)
}

function updateComplementOptions(options: ComplementOption[]) {
  const legacy = legacyComplementConfig(options)
  challenge.value.complementOptions = options
  challenge.value.includeComplements = legacy.includeComplements
  challenge.value.complementPlacement = legacy.complementPlacement
  markAsCustom()
}

async function refreshConjugationExample() {
  if (!isReady.value) {
    conjugationInstructionRaw.value = ''
    conjugationQuestionContextRaw.value = ''
    conjugationQuestionRaw.value = ''
    conjugationExampleRaw.value = ''
    conjugationExamplePrefixRaw.value = ''
    conjugationExampleEmphasisRaw.value = ''
    conjugationExampleSuffixRaw.value = ''
    conjugationLiteraryCitationRaw.value = undefined
    conjugationExampleLoading.value = false
    return
  }

  const request = ++conjugationExampleRequest
  const loadingStartedAt = Date.now()
  conjugationExampleLoading.value = true
  try {
    const exampleComplementOption = challenge.value.complementOptions.filter((option) => {
      const functionObject = option.slice(0, 3) as 'cod' | 'coi'
      return selectedVerbs.value.some((verb) => {
        const supportsFunction = verb.complementFunctions?.includes(functionObject)
          || verb.complementExample?.functionObject === functionObject
        return supportsFunction && (!option.endsWith('-before')
          || verb.anteposableComplementFunctions?.includes(functionObject)
          || (functionObject === 'cod' && Boolean(verb.complementExample?.before)))
      })
    }).at(-1)
    const exampleComplementPlacement: 'before' | 'after' = exampleComplementOption?.endsWith('-before') ? 'before' : 'after'
    const needsComplement = challenge.value.exerciseKind === 'conjugation'
      && Boolean(exampleComplementOption)
    const exampleConfig = {
      ...challenge.value,
      questionCount: 50,
      inclusivePronouns: false,
      includeOnPronoun: false,
      voiceMode: challenge.value.voiceMode,
      includeComplements: needsComplement,
      complementPlacement: exampleComplementPlacement,
      complementOptions: exampleComplementOption ? [exampleComplementOption] : [],
    }
    const needsAnteposedComplement = challenge.value.exerciseKind === 'conjugation'
      && needsComplement
      && exampleComplementOption?.endsWith('-before')
    const matchesSelectedComplement = (question: ExerciseQuestion) => (
      !needsComplement
      || (question.complementFunction === exampleComplementOption?.slice(0, 3)
        && (needsAnteposedComplement
          ? question.complementPosition === 'before' && Boolean(question.complement)
          : question.complementPosition === 'after' && Boolean(question.complement)))
    )
    const isPreferredExample = (question: ExerciseQuestion) => (
      question.pronom === 'il' || question.personId === 6
    )
    const findExample = async (config: typeof exampleConfig, attempts = 3, requireSelectedComplement = true) => {
      let fallback: ExerciseQuestion | undefined
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
          const generated = await api.generateQuestions(config)
          const candidates = requireSelectedComplement
            ? generated.filter(matchesSelectedComplement)
            : generated
          const found = candidates.find(isPreferredExample)
          if (found) return found
          fallback ??= candidates[0]
        } catch {
          // Une sélection sans temps composé ne produit aucune question antéposée.
          // Le repli dédié ci-dessous essaiera alors un temps composé compatible.
          break
        }
      }
      return fallback
    }

    let example = await findExample(exampleConfig)
    const complementVerbIds = selectedVerbs.value
      .filter(verb => Boolean(verb.complementExample))
      .map(verb => verb.id)
    if (!example && needsComplement && !needsAnteposedComplement && complementVerbIds.length) {
      example = await findExample({
        ...exampleConfig,
        verbIds: complementVerbIds,
      }, 4)
    }
    if (!example && needsAnteposedComplement) {
      const fallbackTense = catalogue.value.temps.find(tense => tense.isCompound && tense.name === 'passé composé')
        ?? catalogue.value.temps.find(tense => tense.isCompound)
      const anteposableVerbIds = selectedVerbs.value
        .filter(verb => Boolean(verb.complementExample?.before))
        .map(verb => verb.id)
      if (fallbackTense) {
        example = await findExample({
          ...exampleConfig,
          verbIds: anteposableVerbIds.length ? anteposableVerbIds : exampleConfig.verbIds,
          tenseIds: [fallbackTense.id],
        }, 4)
      }
    }
    if (!example) {
      example = await findExample({
        ...exampleConfig,
        includeComplements: false,
        complementOptions: [],
      }, 4, false)
    }

    if (request === conjugationExampleRequest) {
      conjugationInstructionRaw.value = example?.instruction ?? ''
      const subject = example?.pronom ?? 'il'
      const modeAndTense = example?.temps && example?.mode
        ? `${example.temps} (${example.mode})`
        : ''
      conjugationQuestionContextRaw.value = example
        ? (challenge.value.exerciseKind === 'conjugation'
            ? [subject, example.infinitif, modeAndTense].filter(Boolean).join(' | ')
            : '')
        : ''
      const prompt = example?.consigne.split('|')[0]?.trim() ?? ''
      conjugationQuestionRaw.value = prompt === subject ? '' : prompt
      conjugationExampleRaw.value = example?.reponsesPourCorrige[0] ?? ''
      const expectedParts = expectedAnswerParts(example)
      conjugationExamplePrefixRaw.value = expectedParts.prefix
      conjugationExampleEmphasisRaw.value = expectedParts.emphasis
      conjugationExampleSuffixRaw.value = expectedParts.suffix
      conjugationLiteraryCitationRaw.value = example?.literaryCitation
    }
  } catch {
    if (request === conjugationExampleRequest) {
      conjugationInstructionRaw.value = ''
      conjugationQuestionContextRaw.value = ''
      conjugationQuestionRaw.value = ''
      conjugationExampleRaw.value = ''
      conjugationExamplePrefixRaw.value = ''
      conjugationExampleEmphasisRaw.value = ''
      conjugationExampleSuffixRaw.value = ''
      conjugationLiteraryCitationRaw.value = undefined
    }
  } finally {
    const remainingSpinnerTime = 1000 - (Date.now() - loadingStartedAt)
    if (remainingSpinnerTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingSpinnerTime))
    }
    if (request === conjugationExampleRequest) conjugationExampleLoading.value = false
  }
}

watch(
  [
    () => challenge.value.verbIds.join(','),
    () => challenge.value.tenseIds.join(','),
    () => challenge.value.includeComplements,
    () => challenge.value.complementPlacement,
    () => challenge.value.complementOptions.join(','),
    () => challenge.value.exerciseKind,
    () => challenge.value.identificationSource,
    () => challenge.value.inclusivePronouns,
    () => challenge.value.includeOnPronoun,
    () => challenge.value.voiceMode,
  ],
  () => {
    if (currentStep.value === 3) void refreshConjugationExample()
  },
)

watch(currentStep, async (step) => {
  if (import.meta.server) return
  wizardAtHome.value = step === 0
  await nextTick()
  if (step > 0) scheduleExercisePreload()
  document.querySelector<HTMLElement>('.wizard-panel')?.focus({ preventScroll: true })
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
})

onBeforeUnmount(() => {
  guidedTourMediaQuery?.removeEventListener('change', syncGuidedTourAvailability)
  if (exercisePreloadIdleId !== undefined && 'cancelIdleCallback' in window) window.cancelIdleCallback(exercisePreloadIdleId)
  if (exercisePreloadTimer) clearTimeout(exercisePreloadTimer)
  cancelPresetReveal()
  if (tourPromptTimer) clearTimeout(tourPromptTimer)
  tourDriver?.destroy()
  document.body.classList.remove('guided-tour-active')
})

function beginExerciseTracking(presentation: 'classic' | 'chat') {
  if (tourActive.value) {
    exerciseTracking.value = undefined
    return
  }
  const preset = sourcePreset.value
  exerciseTracking.value = createLearnerTrackingContext({
    challengeLabel: savedChallengeTitle.value
      || (preset ? challengePresetTrackingTitle(preset) : '')
      || (challengeCode.value ? `Défi ${challengeCode.value}` : 'Défi personnalisé'),
    presentation,
    challenge: {
      description: savedChallengeDescription.value
        || (preset ? challengePresetTrackingDescription(sourcePresetRandomCount.value) : undefined),
      verbIds: [...challenge.value.verbIds],
      tenseIds: [...challenge.value.tenseIds],
      questionCount: challenge.value.questionCount,
      exerciseKind: challenge.value.exerciseKind,
      identificationSource: challenge.value.identificationSource,
      pastSimplePronouns: challenge.value.pastSimplePronouns,
      inclusivePronouns: challenge.value.inclusivePronouns,
      includeOnPronoun: challenge.value.includeOnPronoun,
      learningSupportMode: challenge.value.learningSupportMode,
      voiceMode: challenge.value.voiceMode,
      includeComplements: challenge.value.includeComplements,
      complementPlacement: challenge.value.complementPlacement,
      complementOptions: [...challenge.value.complementOptions],
    },
  })
}

async function prepareExercise(mode: 'classic' | 'chat') {
  if (!isReady.value) return
  if (falcMode.value) {
    mode = 'classic'
    applyFalcExerciseDefaults()
  }
  if (mode === 'chat') {
    track('feature_selected', exerciseUsageMetadata('chat'))
    busyAction.value = 'exercise'
    clearMessages()
    try {
      await loadCoachPicker()
      void loadChatExercise()
      isCoachPickerOpen.value = true
    } catch (error) {
      track('feature_failed', exerciseUsageMetadata('chat'))
      actionError.value = getChallengeErrorMessage(error, ui('Impossible de préparer le questionnaire.'))
    } finally {
      busyAction.value = null
    }
    return
  }
  track('feature_selected', exerciseUsageMetadata('classic'))
  busyAction.value = 'exercise'
  clearMessages()
  try {
    const [generated] = await Promise.all([
      api.generateQuestions(challenge.value),
      loadClassicExercise(),
    ])
    questions.value = generated
    if (!questions.value.length) throw new Error(ui('Aucune question ne correspond à cette sélection.'))
    exercisePresentation.value = 'classic'
    beginExerciseTracking('classic')
    isExerciseOpen.value = true
  } catch (error) {
    track('feature_failed', exerciseUsageMetadata('classic'))
    actionError.value = getChallengeErrorMessage(error, ui('Impossible de préparer le questionnaire.'))
  } finally {
    busyAction.value = null
  }
}

watch(falcMode, (enabled) => {
  falcHomePanel.value = null
  if (!enabled) return
  if (tourPromptTimer) clearTimeout(tourPromptTimer)
  isTourWelcomeOpen.value = false
  if (tourActive.value) tourDriver?.destroy()
  isCoachPickerOpen.value = false
  isPrintOpen.value = false
  isShareOpen.value = false
  if (exercisePresentation.value === 'chat') isExerciseOpen.value = false
  exercisePresentation.value = 'classic'
  if (currentStep.value === 4) currentStep.value = 3
  applyFalcExerciseDefaults()
  if (currentStep.value <= 2) applyFalcTenseDefaults()
})

function closeClassicExercise() {
  if (falcMode.value) {
    restartChallenge()
    void navigateTo(localePath('/'))
    return
  }
  isExerciseOpen.value = false
}

async function launchWithCoach(coach: CoachProfile) {
  if (!isReady.value || falcMode.value) return
  selectedCoach.value = coach
  track('coach_selected', { coach: coach.id })
  isCoachPickerOpen.value = false
  busyAction.value = 'exercise'
  clearMessages()
  try {
    const [generated] = await Promise.all([
      api.generateQuestions(challenge.value),
      loadChatExercise(),
    ])
    questions.value = generated
    if (!questions.value.length) throw new Error(ui('Aucune question ne correspond à cette sélection.'))
    exercisePresentation.value = 'chat'
    beginExerciseTracking('chat')
    isExerciseOpen.value = true
  } catch (error) {
    track('feature_failed', exerciseUsageMetadata('chat'))
    actionError.value = getChallengeErrorMessage(error, ui('Impossible de préparer le questionnaire.'))
  } finally {
    busyAction.value = null
  }
}

async function regenerateChatQuestions() {
  const generated = await api.generateQuestions(challenge.value)
  if (!generated.length) throw new Error(ui('Aucune nouvelle question ne correspond à cette sélection.'))
  questions.value = generated
}

async function preparePrint() {
  if (!isReady.value || falcMode.value) return
  track('feature_selected', exerciseUsageMetadata('print'))
  busyAction.value = 'print'
  clearMessages()
  try {
    printQuestions.value = await api.generateQuestions(challenge.value)
    if (!printQuestions.value.length) throw new Error(ui('Aucune question ne correspond à cette sélection.'))
    isPrintOpen.value = true
    track('print_opened', exerciseUsageMetadata('print'))
  } catch (error) {
    track('feature_failed', { feature: 'print.preview' })
    actionError.value = getChallengeErrorMessage(error, ui('Impossible de préparer la fiche à imprimer.'))
  } finally {
    busyAction.value = null
  }
}

function saveChallenge() {
  if (!isReady.value || falcMode.value) return
  track('feature_selected', { feature: 'challenge.share' })
  shareCode.value = ''
  shareError.value = ''
  shareTitle.value = activePreset.value?.label || savedChallengeTitle.value || ui('Défi de conjugaison')
  shareDescription.value = savedChallengeDescription.value
  isShareOpen.value = true
}

async function createSharedChallenge(title: string, description: string) {
  busyAction.value = 'save'
  shareError.value = ''
  clearMessages()
  try {
    const result = await api.saveChallenge(challenge.value, title, description)
    shareCode.value = result.code
    shareTitle.value = title
    shareDescription.value = description
    savedChallengeTitle.value = title
    savedChallengeDescription.value = description
    logUsage('challenge-save')
  } catch (error) {
    track('feature_failed', { feature: 'challenge.share' })
    shareError.value = getChallengeErrorMessage(error, ui('Impossible de sauvegarder ce défi.'))
  } finally {
    busyAction.value = null
  }
}
</script>

<template>
  <div class="wizard-entry-page">
    <div class="challenge-page wizard-page">
      <header v-if="!props.startAtLaunch" class="wizard-hero">
        <p v-if="currentStep === 0 && !falcMode" class="wizard-hero__brand">{{ heroTitle }}</p>
        <h1 v-if="currentStep === 0 && !falcMode && !props.embedded" class="wizard-hero__subtitle">{{ props.homeHeading || ui('Exercices de conjugaison française, gratuits et sans publicité') }}</h1>
        <h2 v-if="currentStep === 0 && !falcMode && props.embedded" class="wizard-hero__subtitle">{{ props.homeHeading || ui('Exercices de conjugaison française, gratuits et sans publicité') }}</h2>
        <h1 v-if="currentStep !== 0 && !falcMode && !props.embedded" :class="{ 'wizard-hero__preset': isPrefilledChallenge }">{{ heroTitle }}</h1>
        <h2 v-if="currentStep !== 0 && !falcMode && props.embedded" :class="{ 'wizard-hero__preset': isPrefilledChallenge }">{{ heroTitle }}</h2>
        <button v-if="currentStep === 0 && !falcMode && !guidedTourDisabled" class="tour-entry-button" type="button" @click="openTourMenu">
          <span aria-hidden="true">?</span>{{ tourCopy.discover }}
        </button>
      </header>

      <main class="wizard-shell">
      <div v-if="catalogueStatus === 'loading'" class="page-state" role="status">
        <span class="loader" aria-hidden="true" /> {{ ui('Chargement du catalogue de conjugaison…') }} </div>

      <div v-else-if="catalogueStatus === 'error'" class="page-state page-state--error" role="alert">
        <strong>{{ ui('Le catalogue n’a pas pu être chargé.') }}</strong>
        <span>{{ catalogueError }}</span>
        <button class="primary-button" type="button" @click="retryCatalogue">{{ ui('Réessayer') }}</button>
      </div>

      <template v-else>
        <p v-if="actionError" class="workspace-message workspace-message--error" role="alert">{{ actionError }}</p>
        <p v-else-if="notice" class="workspace-message workspace-message--success" aria-live="polite">{{ notice }}</p>

        <section
          class="wizard-panel"
          :class="{ 'wizard-panel--autocomplete-open': currentStep === 1 }"
          tabindex="-1"
          aria-labelledby="wizard-title"
        >
          <h2 id="wizard-title" class="sr-only">{{ ui('Composer un défi personnalisé') }}</h2>

          <nav v-if="currentStep !== 0" class="wizard-steps" :class="{ 'wizard-steps--falc': falcMode }" data-tour="wizard-steps" :aria-label="ui('Étapes de création du défi')">
            <button
              class="wizard-step-tab wizard-step-tab--verbs"
              data-tour-wizard-step="1"
              :class="{
                'is-active': currentStep === 1,
                'is-complete': stepStatus.verbs > 0,
                'tour-secondary-focus': tourSecondaryWizardStep === 1,
              }"
              type="button"
              @click="goToStep(1)"
            >
              <span>1</span><span><strong>{{ ui('Verbes') }}</strong><small v-if="!falcMode">{{ stepStatus.verbs ? ui(stepStatus.verbs > 1 ? '{count} choisis' : '{count} choisi', { count: stepStatus.verbs }) : ui('À choisir') }}</small></span>
            </button>
            <span class="wizard-steps__line" aria-hidden="true" />
            <button
              class="wizard-step-tab wizard-step-tab--tenses"
              data-tour-wizard-step="2"
              :class="{
                'is-active': currentStep === 2,
                'is-complete': stepStatus.tenses > 0,
                'tour-secondary-focus': tourSecondaryWizardStep === 2,
              }"
              type="button"
              :disabled="stepStatus.verbs === 0"
              @click="goToStep(2)"
            >
              <span>2</span><span><strong><span class="mobile-label-hidden">{{ falcMode ? ui('Temps') : ui('Modes et temps') }}</span><span class="mobile-label-only">{{ ui('Temps') }}</span></strong><small v-if="!falcMode">{{ stepStatus.tenses ? ui(stepStatus.tenses > 1 ? '{count} choisis' : '{count} choisi', { count: stepStatus.tenses }) : ui('À choisir') }}</small></span>
            </button>
            <span class="wizard-steps__line" aria-hidden="true" />
            <button
              data-tour-wizard-step="3"
              :class="{
                'is-active': currentStep === 3,
                'is-complete': currentStep === 4,
                'tour-secondary-focus': tourSecondaryWizardStep === 3,
              }"
              type="button"
              :disabled="!isReady"
              @click="goToStep(3)"
            >
              <span>3</span><span><strong>{{ ui('Options') }}</strong><small v-if="!falcMode">{{ ui('Finaliser le défi') }}</small></span>
            </button>
            <span v-if="!falcMode" class="wizard-steps__line" aria-hidden="true" />
            <button
              v-if="!falcMode"
              data-tour-wizard-step="4"
              :class="{
                'is-active': currentStep === 4,
                'tour-secondary-focus': tourSecondaryWizardStep === 4,
              }"
              type="button"
              :disabled="!isReady || isPreparingStep4"
              @click="prepareStep4"
            >
              <span>4</span><span><strong>{{ props.startAtLaunch ? ui('Commencer') : ui('Créer') }}</strong><small>{{ ui('Utiliser le défi') }}</small></span>
            </button>
            <span
              v-if="tourSecondaryWizardStep !== null"
              class="tour-wizard-step-indicator"
              :style="tourWizardIndicatorStyle"
              aria-hidden="true"
            />
          </nav>

          <div class="wizard-content" :class="{ 'wizard-content--home': currentStep === 0 }">
            <div v-if="isPreparingStep4" class="wizard-step-preparing" role="status" aria-live="polite">
              <span class="loader wizard-step-preparing__spinner" aria-hidden="true" />
              <strong>{{ ui('Préparation de ton défi…') }}</strong>
            </div>

            <div v-else-if="currentStep === 0" class="wizard-home" :class="{ 'wizard-home--falc': falcMode }" data-tour="home">
              <template v-if="falcMode">
                <div
                  v-if="falcHomePanel === null"
                  class="falc-home-actions"
                  style="display: flex; flex-direction: column"
                >
                  <button class="falc-home-action" type="button" @click="falcHomePanel = 'code'">{{ ui('J’ai un code') }}</button>
                  <button class="falc-home-action" type="button" @click="falcHomePanel = 'presets'">{{ ui('Choisir un défi') }}</button>
                  <button class="falc-home-action falc-home-action--primary" type="button" @click="startCustomChallenge">{{ ui('Créer mon exercice') }}</button>
                </div>
                <div v-else-if="falcHomePanel === 'code'" class="falc-home-panel code-loader" role="search" :aria-label="ui('Charger un défi avec son code')">
                  <button class="falc-panel-back" type="button" :aria-label="ui('Retour')" @click="falcHomePanel = null">←</button>
                  <label id="wizard-falc-code-label" for="wizard-falc-code">{{ ui('Écris le code du défi') }}</label>
                  <div class="code-loader__control">
                    <div id="wizard-falc-code" class="code-loader__code-entry" role="textbox" contenteditable="plaintext-only" aria-labelledby="wizard-falc-code-label" data-placeholder="AB-CD-EF-23" :aria-invalid="Boolean(codeError)" @input="onChallengeCodeInput" @keydown.enter.prevent="restoreChallenge"></div>
                    <button class="primary-button" type="button" :disabled="busyAction === 'load'" @click="restoreChallenge">{{ busyAction === 'load' ? ui('Chargement…') : ui('Ouvrir le défi') }}</button>
                  </div>
                  <p v-if="codeError" class="code-loader__error" role="alert">{{ codeError }}</p>
                </div>
                <div v-else class="falc-home-panel">
                  <button class="falc-panel-back" type="button" :aria-label="ui('Retour')" @click="falcHomePanel = null">←</button>
                  <h2>{{ ui('Choisis un défi') }}</h2>
                  <PresetPicker compact :presets="catalogue.presets" :verbs="catalogue.verbes" :modes="catalogue.modes" :tenses="catalogue.temps" :active-preset-id="activePresetId" @select="selectPreset" @stage-change="presetStage = $event" />
                </div>
              </template>
              <template v-else>
                <div
                  class="code-loader"
                  data-tour="code-loader"
                  :class="{ 'is-arrival-highlighted': highlightChallengeLoader }"
                  role="search"
                  :aria-label="ui('Charger un défi avec son code')"
                  @pointerdown="highlightChallengeLoader = false"
                >
                  <div class="code-loader__heading">
                    <span class="code-loader__icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 3v12" />
                        <path d="m7 10 5 5 5-5" />
                        <path d="M5 21h14" />
                      </svg>
                    </span>
                    <div><strong>{{ ui('Tu as reçu un défi ?') }}</strong><small>{{ ui('Colle son code pour le reprendre immédiatement.') }}</small></div>
                  </div>
                  <div class="code-loader__control">
                    <span id="wizard-challenge-code-label" class="sr-only">{{ ui('Code du défi') }}</span>
                    <div
                      id="wizard-challenge-code"
                      class="code-loader__code-entry"
                      role="textbox"
                      contenteditable="plaintext-only"
                      aria-labelledby="wizard-challenge-code-label"
                      data-placeholder="AB-CD-EF-23"
                      :aria-invalid="Boolean(codeError)"
                      @input="onChallengeCodeInput"
                      @keydown.enter.prevent="restoreChallenge"
                    ></div>
                    <button class="primary-button wizard-home__outline-action" type="button" :disabled="catalogueStatus !== 'success' || busyAction === 'load'" @click="restoreChallenge">
                      {{ busyAction === 'load' ? ui('Chargement…') : ui('Charger') }}
                    </button>
                  </div>
                  <p v-if="codeError" class="code-loader__error" role="alert">{{ codeError }}</p>
                </div>

                <div class="wizard-home__choices">
                  <button
                    v-if="!presetExpanded"
                    class="wizard-home__choice wizard-home__choice--preset is-collapsed"
                    data-tour="presets"
                    type="button"
                    @click="presetExpanded = true"
                  >
                    <span class="wizard-home__choice-icon" aria-hidden="true">★</span>
                    <div>
                      <h2>{{ ui('Tu veux travailler un de nos défis ?') }}</h2>
                    </div>
                    <span class="secondary-button wizard-home__outline-action" aria-hidden="true">{{ ui('Découvrir') }}</span>
                  </button>
                  <article
                    v-else
                    class="wizard-home__choice wizard-home__choice--preset"
                    data-tour="presets"
                    :class="{ 'is-preset-selection': presetStage === 'presets' }"
                  >
                    <span class="wizard-home__choice-icon" aria-hidden="true">★</span>
                    <div>
                      <h2>{{ ui('Tu veux travailler un de nos défis ?') }}</h2>
                    </div>
                    <PresetPicker
                      class="wizard-home__inline-presets"
                      compact
                      :presets="catalogue.presets"
                      :verbs="catalogue.verbes"
                      :modes="catalogue.modes"
                      :tenses="catalogue.temps"
                      :active-preset-id="activePresetId"
                      @select="selectPreset"
                      @stage-change="presetStage = $event"
                    />
                  </article>

                  <article class="wizard-home__choice wizard-home__choice--custom" data-tour="build-custom">
                    <span class="wizard-home__choice-icon" aria-hidden="true">✎</span>
                    <div>
                      <h2>{{ ui('Tu veux construire ton propre défi ?') }}</h2>
                      <p>{{ ui('Choisis les verbes, les modes, les temps et les options.') }}</p>
                    </div>
                    <button class="primary-button" :class="{ 'wizard-next-pulse': !highlightChallengeLoader }" type="button" @click="startCustomChallenge">{{ ui('Construire un nouveau défi →') }}</button>
                  </article>
                </div>
                <div class="wizard-home__separator" aria-hidden="true"></div>
                <section class="wizard-home__seo-intro" aria-labelledby="home-features-title">
                  <header>
                    <p class="wizard-home__seo-eyebrow">{{ ui('Tout pour progresser') }}</p>
                    <h2 id="home-features-title">{{ ui('Des exercices de conjugaison adaptés à tes besoins') }}</h2>
                    <p>{{ ui('TATITOTU propose des exercices de conjugaison française entièrement gratuits, interactifs et personnalisables, sans publicité.') }}</p>
                  </header>
                  <div class="wizard-home__feature-grid">
                    <article>
                      <h3>{{ ui('Pour les élèves') }}</h3>
                      <p>{{ ui('Choisis les verbes, les modes et les temps que tu souhaites travailler, personnalise les questions, puis commence ton entraînement.') }}</p>
                      <p>{{ ui('Les exercices peuvent être réalisés dans un format classique ou sous la forme d’un dialogue avec un coach virtuel qui t’aide pour chaque question.') }}</p>
                    </article>
                    <article>
                      <h3>{{ ui('Pour les enseignants') }}</h3>
                      <p>{{ ui('Tes propres exercices peuvent être partagés avec tes élèves.') }}</p>
                      <p>{{ ui('Les élèves peuvent aussi te partager leurs bilans pour un meilleur suivi.') }}</p>
                      <p>{{ ui('Tu peux aussi imprimer l’exercice en PDF ou DOCX avec corrigé.') }}</p>
                    </article>
                    <article>
                      <h3>{{ ui('Des ressources utiles') }}</h3>
                      <p>{{ ui('Pour apprendre et réviser, le site propose aussi des explications sur les modes et les temps.') }}</p>
                      <p>{{ ui('Tu peux également consulter la conjugaison complète des verbes français, les règles d’accord du participe passé et les principales difficultés à éviter.') }}</p>
                    </article>
                  </div>
                </section>
              </template>
            </div>

            <div v-else-if="currentStep === 1" class="wizard-step wizard-step--selection" aria-labelledby="verbs-title">
              <div class="wizard-step__actions wizard-step__actions--split">
                <button class="secondary-button" type="button" :aria-label="ui('Étape précédente')" @click="previousStep">{{ falcMode ? '←' : ui('← Nouveau défi') }}</button>
                <div class="wizard-step__controls">
                  <button class="primary-button wizard-step__cta wizard-next-pulse" type="button" :aria-label="ui('Étape suivante')" :disabled="!selectedVerbs.length" @click="nextStep"> {{ falcMode ? '→' : ui('Choisir les temps →') }} </button>
                </div>
              </div>
              <div v-if="activePreset && !isPresetVerbEditing" class="wizard-step__intro wizard-step__intro--selection">
                <h2 id="verbs-title">{{ ui('Verbes du défi') }}</h2>
              </div>
              <section v-if="activePreset && !isPresetVerbEditing" class="preset-verb-overview">
                <header>
                  <div>
                    <p>{{ selectedVerbs.length }} {{ selectedVerbs.length === 1 ? ui('verbe') : ui('verbes') }} {{ selectedVerbs.length === 1 ? ui('sélectionné') : ui('sélectionnés') }}</p>
                    <button class="preset-verb-overview__edit" type="button" @click="isPresetVerbEditing = true">{{ ui('Modifier la liste') }}</button>
                  </div>
                </header>
                <TransitionGroup tag="ul" name="preset-verb">
                  <li v-for="verb in displayedSelectedVerbs" :key="verb.id">{{ verb.infinitif }}</li>
                </TransitionGroup>
              </section>
              <template v-else>
                <div class="wizard-step__intro wizard-step__intro--selection">
                  <h2 id="verbs-title">{{ isPrefilledChallenge ? ui('Verbes du défi') : ui('Choisis les verbes') }}</h2>
                </div>
                <VerbPicker
                  data-tour="verbs"
                  :verbs="catalogue.verbes"
                  :selected-ids="displayedVerbIds"
                  :falc-mode="falcMode"
                  @add="onAddVerb"
                  @remove="onRemoveVerb"
                  @clear="markAsCustom(); clearVerbs()"
                />
              </template>
              <div class="wizard-step__bottom-actions">
                <button class="primary-button wizard-step__cta wizard-next-pulse" type="button" :aria-label="ui('Étape suivante')" :disabled="!selectedVerbs.length" @click="nextStep"> {{ falcMode ? '→' : ui('Choisir les temps →') }} </button>
              </div>
            </div>

            <div v-else-if="currentStep === 2" class="wizard-step wizard-step--selection" aria-labelledby="tenses-title">
              <div class="wizard-step__actions wizard-step__actions--split">
                <button class="secondary-button" type="button" :aria-label="ui('Étape précédente')" @click="previousStep">{{ falcMode ? '←' : ui('← Verbes') }}</button>
                <div class="wizard-step__controls">
                  <button class="primary-button wizard-step__cta wizard-next-pulse" type="button" :aria-label="ui('Étape suivante')" :disabled="!selectedTenses.length" @click="nextStep"> {{ falcMode ? '→' : ui('Choisir les options →') }} </button>
                </div>
              </div>
              <div class="wizard-step__intro wizard-step__intro--selection">
                <h2>{{ falcMode ? ui('Choisis les temps') : isPrefilledChallenge ? ui('Modes et temps') : ui('Choisis les modes et les temps') }}</h2>
              </div>
              <TensePicker
                data-tour="tenses"
                :modes="catalogue.modes"
                :tenses="catalogue.temps"
                :verbs="selectedVerbs"
                :selected-ids="displayedTenseIds"
                :past-simple-pronouns="challenge.pastSimplePronouns"
                :falc-mode="falcMode"
                @toggle="onToggleTense"
                @select-all="markAsCustom(); selectAllTenses()"
                @clear="markAsCustom(); clearTenses(); challenge.pastSimplePronouns = 'all'"
                @update-past-simple-pronouns="challenge.pastSimplePronouns = $event; markAsCustom()"
              />
              <div class="wizard-step__bottom-actions">
                <button class="primary-button wizard-step__cta wizard-next-pulse" type="button" :aria-label="ui('Étape suivante')" :disabled="!selectedTenses.length" @click="nextStep"> {{ falcMode ? '→' : ui('Choisir les options →') }} </button>
              </div>
            </div>

            <div v-else-if="currentStep === 3" class="wizard-step wizard-review">
              <div class="wizard-step__actions wizard-step__actions--split">
                <button class="secondary-button" type="button" :aria-label="ui('Étape précédente')" @click="previousStep">
                  ← <template v-if="!falcMode"><span class="mobile-label-hidden">{{ ui('Modes et temps') }}</span><span class="mobile-label-only">{{ ui('Temps') }}</span></template>
                </button>
                <div class="wizard-step__controls">
                  <button class="primary-button wizard-step__cta wizard-step__cta--launch wizard-next-pulse" type="button" @click="nextStep">{{ falcMode ? ui('Commencer') : ui('Créer le défi') }}</button>
                </div>
              </div>
              <div v-if="!falcMode" class="wizard-step__intro wizard-step__intro--selection">
                <h2>{{ ui('Options du défi') }}</h2>
              </div>

              <ChallengeOptions
                data-tour="options"
                :question-count="challenge.questionCount"
                :exercise-kind="challenge.exerciseKind"
                :identification-source="challenge.identificationSource"
                :inclusive-pronouns="challenge.inclusivePronouns"
                :include-on-pronoun="challenge.includeOnPronoun"
                :learning-support-mode="challenge.learningSupportMode"
                :voice-mode="challenge.voiceMode"
                :complement-options="challenge.complementOptions"
                :complement-verbs="selectedVerbs"
                :conjugation-instruction="conjugationInstruction"
                :conjugation-question-context="conjugationQuestionContext"
                :conjugation-question="conjugationQuestion"
                :conjugation-example="conjugationExample"
                :conjugation-example-prefix="conjugationExamplePrefix"
                :conjugation-example-emphasis="conjugationExampleEmphasis"
                :conjugation-example-suffix="conjugationExampleSuffix"
                :conjugation-literary-citation="conjugationLiteraryCitationRaw"
                :conjugation-example-loading="conjugationExampleLoading"
                :reveal-prefilled-options="prefilledOptionsRevealPending"
                :grid-layout="!falcMode"
                :falc-mode="falcMode"
                id-prefix="wizard-step-options"
                @prefilled-options-reveal-start="prefilledOptionsRevealPending = false"
                @update-question-count="challenge.questionCount = $event; markAsCustom()"
                @update-exercise-kind="challenge.exerciseKind = $event; markAsCustom()"
                @update-identification-source="challenge.identificationSource = $event; markAsCustom()"
                @update-inclusive-pronouns="challenge.inclusivePronouns = $event; markAsCustom()"
                @update-include-on-pronoun="challenge.includeOnPronoun = $event; markAsCustom()"
                @update-learning-support-mode="challenge.learningSupportMode = $event; markAsCustom()"
                @update-voice-mode="challenge.voiceMode = $event; markAsCustom()"
                @update-complement-options="updateComplementOptions"
              />

              <div v-if="!falcMode" class="wizard-step__bottom-actions">
                <button class="primary-button wizard-step__cta wizard-step__cta--launch wizard-next-pulse" type="button" @click="nextStep">{{ falcMode ? ui('Commencer') : ui('Créer le défi') }}</button>
              </div>

            </div>

            <div v-else class="wizard-step wizard-launch-step">
              <div v-if="!props.startAtLaunch" class="wizard-step__actions wizard-step__actions--split">
                <button class="secondary-button" type="button" @click="previousStep">{{ ui('← Options') }}</button>
              </div>
              <section v-if="showLaunchSummary || showSavedChallengeSummary" class="launch-summary" :aria-labelledby="launchTitle || activePreset || savedChallengeTitle ? 'launch-challenge-title' : undefined">
                <div class="launch-summary__heading" :class="{ 'launch-summary__heading--public': launchTitle }">
                  <div>
                    <p v-if="launchCategory || activePreset" class="builder-card__eyebrow">{{ launchCategory || activePresetGroupLabel }}</p>
                    <h1 v-if="launchTitle" id="launch-challenge-title">{{ launchTitle }}</h1>
                    <h2 v-else-if="activePreset || savedChallengeTitle" id="launch-challenge-title">{{ activePreset?.label || savedChallengeTitle }}</h2>
                  </div>
                  <div class="launch-summary__counts">
                    <span>{{ ui(selectedVerbs.length > 1 ? '{count} verbes' : '{count} verbe', { count: selectedVerbs.length }) }}</span>
                    <span>{{ ui('{count} temps', { count: selectedTenses.length }) }}</span>
                  </div>
                </div>
                <p v-if="launchDescription || activePreset?.description || savedChallengeDescription" class="launch-summary__description">{{ launchDescription || activePreset?.description || savedChallengeDescription }}</p>
                <p v-if="launchEditHint" class="launch-summary__edit-hint">
                  <span>{{ launchEditHint.before }}</span>
                  <button class="launch-summary__step launch-summary__step--verbs" type="button" :aria-label="launchEditHint.verbsLabel" @click="goToStep(1)">1</button>
                  <span>{{ launchEditHint.between }}</span>
                  <button class="launch-summary__step launch-summary__step--tenses" type="button" :aria-label="launchEditHint.tensesLabel" @click="goToStep(2)">2</button>
                  <span>{{ launchEditHint.after }}</span>
                </p>
              </section>
              <ChallengeActions
                data-tour="actions"
                :ready="isReady"
                :busy-action="busyAction"
                @exercise="prepareExercise"
                @print="preparePrint"
                @save="saveChallenge"
              />
            </div>
          </div>

        </section>

      </template>
      </main>

      <ClassicExercise ref="classic-exercise" v-if="isExerciseOpen && exercisePresentation === 'classic'" :questions="questions" :exercise-kind="challenge.exerciseKind" :identification-tenses="identificationTenses" :tracking-context="exerciseTracking" :analytics-metadata="exerciseUsageMetadata('classic')" @close="closeClassicExercise" />
      <ChatExercise ref="chat-exercise" v-if="isExerciseOpen && exercisePresentation === 'chat' && selectedCoach" :questions="questions" :exercise-kind="challenge.exerciseKind" :coach="selectedCoach" :verbs="chatExerciseVerbs" :tenses="selectedTenses" :identification-tenses="identificationTenses" :regenerate-questions="regenerateChatQuestions" :tracking-context="exerciseTracking" :learning-support-mode="challenge.learningSupportMode" :analytics-metadata="exerciseUsageMetadata('chat')" :tour-demo="tourActive" @change-coach="selectedCoach = $event" @close="isExerciseOpen = false" />
      <CoachPicker v-if="isCoachPickerOpen && !falcMode" :tour-demo="tourActive" :learning-support-mode="challenge.learningSupportMode" @close="isCoachPickerOpen = false" @select="launchWithCoach" />
      <component :is="printPreviewComponent" v-if="isPrintOpen && !falcMode && printPreviewComponent" :questions="printQuestions" :verbs="selectedVerbs" :tenses="selectedTenses" :exercise-kind="challenge.exerciseKind" :options="challenge.printOptions" :requested-question-count="challenge.questionCount" :regenerating="busyAction === 'print'" :analytics-metadata="exerciseUsageMetadata('print')" @update-options="challenge.printOptions = $event" @regenerate="preparePrint" @close="isPrintOpen = false" />
      <ShareChallengeDialog
        v-if="isShareOpen && !falcMode"
        :code="shareCode"
        :url="shareUrl"
        :busy="busyAction === 'save'"
        :error="shareError"
        :initial-title="shareTitle"
        :initial-description="shareDescription"
        @close="isShareOpen = false"
        @save="createSharedChallenge"
      />
      <Teleport to="body">
        <div v-if="isTourWelcomeOpen && !guidedTourDisabled" class="tour-welcome-backdrop" @click.self="postponeTour">
          <section class="tour-welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="tour-welcome-title">
            <div class="tour-welcome-dialog__languages" role="group" :aria-label="ui('Langue de l’interface')">
              <button
                v-for="option in tourLanguageOptions"
                :key="option.value"
                type="button"
                :class="{ 'is-active': interfaceLocale === option.value }"
                :aria-label="option.label"
                :aria-pressed="interfaceLocale === option.value"
                :title="option.label"
                @click="setInterfaceLocale(option.value)"
              >
                <span aria-hidden="true">{{ option.flag }}</span>
              </button>
            </div>
            <button class="tour-welcome-dialog__close" type="button" :aria-label="tourWelcomeSource === 'reminder' ? ui('Fermer') : tourCopy.later" @click="postponeTour">×</button>
            <span class="tour-welcome-dialog__icon" aria-hidden="true">?</span>
            <h2 id="tour-welcome-title">{{ tourCopy.welcomeTitle }}</h2>
            <p>{{ tourCopy.welcomeBody }}</p>
            <div class="tour-welcome-dialog__choices">
              <button type="button" @click="startGuidedTour('quick')">
                <strong>{{ tourCopy.quickTitle }}</strong>
                <small>{{ tourCopy.quickMeta }}</small>
              </button>
              <button type="button" @click="startGuidedTour('complete')">
                <strong>{{ tourCopy.fullTitle }}</strong>
                <small>{{ tourCopy.fullMeta }}</small>
              </button>
            </div>
            <button class="tour-welcome-dialog__later" type="button" @click="postponeTour">
              {{ tourWelcomeSource === 'reminder' ? ui('Fermer') : tourCopy.later }}
            </button>
          </section>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.wizard-entry-page { font-family: "Funnel Sans", "Avenir Next", Avenir, system-ui, sans-serif; }
.wizard-page { overflow: hidden; padding-bottom: 70px; border-radius: 26px; }
.wizard-hero { max-width: 820px; margin: 0 auto; padding: 42px 24px 24px; text-align: center; }
.wizard-hero h1, .wizard-hero__brand { margin: 0; color: #294c4b; font-size: clamp(2.2rem, 5vw, 4rem); letter-spacing: .018em; line-height: 1.05; }
.wizard-hero__brand { letter-spacing: .18em; text-indent: .18em; }
.wizard-hero h1:not(.wizard-hero__subtitle) { letter-spacing: .035em; opacity: .62; }
.wizard-hero h1.wizard-hero__preset { font-size: clamp(1.75rem, 4vw, 3.15rem); line-height: 1.1; }
.wizard-hero h1.wizard-hero__subtitle { max-width: 650px; margin: 12px auto 0; color: var(--ink); font-size: 1.08rem; font-weight: 650; letter-spacing: 0; line-height: 1.5; }
.tour-entry-button { display: inline-flex; margin-top: 13px; padding: 7px 13px 7px 8px; align-items: center; gap: 8px; color: #0b4f69; border: 2px solid #e4ad00; border-radius: 999px; background: #fff3a8; box-shadow: 0 5px 15px rgb(70 52 0 / 14%), 0 0 0 4px rgb(255 215 43 / 12%); cursor: pointer; font-size: .84rem; font-weight: 800; }
.tour-entry-button span { display: grid; width: 22px; height: 22px; place-items: center; color: #493a08; border: 1px solid #c99500; border-radius: 50%; background: #ffd943; font-size: .75rem; font-weight: 900; }
.tour-entry-button:hover, .tour-entry-button:focus-visible { color: #083f54; border-color: #c99500; background: #ffe978; outline: 0; box-shadow: 0 7px 20px rgb(70 52 0 / 20%), 0 0 0 5px rgb(255 215 43 / 24%); }
.wizard-shell { position: relative; width: min(1120px, calc(100% - 40px)); margin: 0 auto; }
.tour-welcome-backdrop { position: fixed; z-index: 3000; inset: 0; display: grid; padding: max(14px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) max(14px, env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left)); place-items: start; background: rgb(14 32 41 / 70%); backdrop-filter: blur(6px); }
.tour-welcome-dialog { position: relative; width: min(620px, 100%); padding: clamp(66px, 9vw, 76px) clamp(24px, 5vw, 40px) clamp(24px, 5vw, 40px); color: #263b43; border: 3px solid #e4ad00; border-radius: 24px; background: white; box-shadow: 0 30px 90px rgb(70 52 0 / 42%), 0 0 0 8px rgb(255 215 43 / 20%); text-align: center; }
.tour-welcome-dialog__close { position: absolute; top: 14px; right: 14px; width: 38px; height: 38px; color: #5c4908; border: 1px solid #c99a08; border-radius: 50%; background: rgb(255 255 255 / 58%); cursor: pointer; font-size: 1.4rem; }
.tour-welcome-dialog__languages { position: absolute; top: 14px; left: 50%; display: inline-flex; min-height: 38px; padding: 3px 5px; align-items: center; gap: 2px; border: 1px solid #d5e1e4; border-radius: 999px; background: #f6f9f9; transform: translateX(-50%); }
.tour-welcome-dialog__languages button { display: grid; width: 31px; height: 30px; padding: 0; place-items: center; border: 0; border-radius: 50%; background: transparent; cursor: pointer; font-size: 1.05rem; line-height: 1; }
.tour-welcome-dialog__languages button:hover, .tour-welcome-dialog__languages button:focus-visible { background: #e5eff1; outline: 2px solid #126d8a; outline-offset: 0; }
.tour-welcome-dialog__languages button.is-active { background: #fff3a8; box-shadow: inset 0 0 0 2px #e4ad00; }
.tour-welcome-dialog__icon { display: grid; width: 54px; height: 54px; margin: 0 auto 14px; place-items: center; color: white; border-radius: 17px; background: #126d8a; font-size: 1.55rem; font-weight: 900; box-shadow: 0 10px 26px rgb(18 109 138 / 28%); }
.tour-welcome-dialog h2 { margin: 0; color: #0b4f69; font-size: clamp(1.55rem, 4vw, 2.15rem); }
.tour-welcome-dialog > p { max-width: 500px; margin: 10px auto 24px; color: #344e57; line-height: 1.55; }
.tour-welcome-dialog__choices { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.tour-welcome-dialog__choices button { display: grid; min-height: 112px; padding: 18px; align-content: center; gap: 7px; color: #263b43; border: 1px solid #c99a08; border-radius: 16px; background: rgb(255 255 255 / 78%); cursor: pointer; text-align: left; }
.tour-welcome-dialog__choices button:last-child { border-color: #b28200; background: rgb(238 246 247 / 88%); }
.tour-welcome-dialog__choices button:hover, .tour-welcome-dialog__choices button:focus-visible { border-color: #126d8a; background: rgb(255 255 255 / 76%); outline: 0; box-shadow: 0 0 0 4px rgb(18 109 138 / 16%); }
.tour-welcome-dialog__choices strong { color: #0b4f69; font-size: 1.08rem; }
.tour-welcome-dialog__choices small { color: #46616a; line-height: 1.35; }
.tour-welcome-dialog__later { margin-top: 20px; padding: 8px 12px; color: #46616a; border: 0; background: transparent; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
:global(body.guided-tour-active .driver-active-element) {
  outline: 3px solid #f2bd16 !important;
  outline-offset: 5px;
  box-shadow:
    0 0 0 7px rgb(255 221 64 / 24%),
    0 18px 48px rgb(81 61 0 / 28%) !important;
  transition: box-shadow 120ms ease, outline-color 120ms ease;
}
.wizard-steps button.tour-secondary-focus {
  position: relative;
  z-index: 10001;
  border-radius: 12px;
  background: #f6faf8;
}
.tour-wizard-step-indicator {
  position: absolute;
  z-index: 10002;
  box-sizing: border-box;
  pointer-events: none;
  border: 3px solid #f2bd16;
  border-radius: 17px;
  box-shadow:
    0 0 0 7px rgb(255 221 64 / 24%),
    0 18px 48px rgb(81 61 0 / 28%);
  transition:
    left 420ms cubic-bezier(.22, 1, .36, 1),
    top 420ms cubic-bezier(.22, 1, .36, 1),
    width 420ms cubic-bezier(.22, 1, .36, 1),
    height 420ms cubic-bezier(.22, 1, .36, 1);
}
:global(body.guided-tour-transitioning .driver-popover) {
  visibility: hidden !important;
}
:global(body.guided-tour-active .chat-dialogs),
:global(body.guided-tour-active .chat-help-enter-active),
:global(body.guided-tour-active .chat-help-leave-active) {
  transition: none !important;
}
:global(.tatitotu-tour-popover) { top: max(14px, env(safe-area-inset-top)) !important; right: auto !important; bottom: auto !important; left: max(14px, env(safe-area-inset-left)) !important; min-width: min(330px, calc(100vw - 28px)); max-width: min(390px, calc(100vw - 28px)); padding: 20px; transform: none !important; color: #263b43; border: 3px solid #e4ad00; border-radius: 16px; background: white; box-shadow: 0 20px 55px rgb(70 52 0 / 36%), 0 0 0 6px rgb(255 215 43 / 20%); }
:global(.tatitotu-tour-popover .driver-popover-title) { padding-right: 24px; color: #0b4f69; font-family: inherit; font-size: 1.12rem; line-height: 1.3; }
:global(.tatitotu-tour-popover .driver-popover-description) { color: #344e57; font-family: inherit; font-size: .93rem; line-height: 1.5; }
:global(.tatitotu-tour-popover .driver-popover-description ol) { margin: 9px 0 0; padding-left: 1.5rem; }
:global(.tatitotu-tour-popover .driver-popover-description li) { padding-left: 3px; font-weight: 700; }
:global(.tatitotu-tour-popover .driver-popover-description li + li) { margin-top: 4px; }
:global(.tatitotu-tour-popover .driver-popover-description mark) { padding: 1px 4px; color: #3f3100; border-radius: 4px; background: #ffd43b; font-weight: 850; }
:global(.tatitotu-tour-popover .driver-popover-close-btn) { color: #536a72; }
:global(.tatitotu-tour-popover .driver-popover-progress-text) { color: #536a72; }
:global(.tatitotu-tour-popover .driver-popover-footer-btn) { padding: 8px 13px; color: #263b43; border-color: #c99a08; border-radius: 9px; background: #f6f8f8; font-family: inherit; font-size: .86rem; font-weight: 760; text-shadow: none; }
:global(.tatitotu-tour-popover .driver-popover-next-btn) { color: #3f3100; border-color: #e4ad00; background: #e4ad00; }
:global(.tatitotu-tour-popover .driver-popover-next-btn:hover),
:global(.tatitotu-tour-popover .driver-popover-next-btn:focus-visible) { color: #302500; border-color: #c99500; background: #f2bd13; outline: 0; box-shadow: 0 0 0 3px rgb(228 173 0 / 24%); }
:global(.tatitotu-tour-popover .driver-popover-arrow) { display: none !important; }
.code-loader { display: grid; width: 100%; grid-template-columns: minmax(230px, 1fr) minmax(330px, .9fr); align-items: center; gap: 12px 28px; margin: 0; padding: 18px; border: 1px solid #b8d3cb; border-radius: 16px; background: white; box-shadow: 0 9px 25px rgb(42 65 61 / 7%); }
.code-loader__heading { display: flex; align-items: center; gap: 11px; }
.code-loader__heading > div { display: grid; }
.code-loader__heading small { color: var(--muted); }
.code-loader__icon { display: grid; width: 38px; height: 38px; flex: 0 0 38px; place-items: center; color: white; background: var(--brand); border-radius: 11px; font-size: 1.2rem; font-weight: 900; }
.code-loader__icon svg { width: 21px; height: 21px; }
.code-loader__control { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
.code-loader__code-entry { width: 100%; min-height: 46px; padding: 9px 13px; overflow: hidden; border: 1px solid #9ebdb4; border-radius: 10px; color: var(--ink); background: white; font-weight: 800; letter-spacing: .08em; line-height: 26px; text-transform: uppercase; white-space: nowrap; }
.code-loader__code-entry:empty::before { color: #7f8583; content: attr(data-placeholder); pointer-events: none; }
.code-loader__code-entry:focus { border-color: var(--brand); box-shadow: 0 0 0 4px rgb(52 95 88 / 12%); outline: 0; }
.code-loader__error { grid-column: 2; margin: -4px 0 0; color: var(--danger); font-size: .82rem; }
.wizard-panel { overflow: hidden; border: 1px solid rgba(174, 199, 191, .95); border-radius: 24px; background: rgb(255 255 255 / 94%); box-shadow: var(--shadow); outline: 0; }
.wizard-panel--autocomplete-open { overflow: visible; }
.wizard-steps { position: relative; display: grid; grid-template-columns: minmax(125px, 1fr) 50px minmax(165px, 1.15fr) 50px minmax(120px, 1fr) 50px minmax(115px, .9fr); align-items: center; padding: 17px 24px; border-bottom: 1px solid var(--line); background: #f6faf8; }
.wizard-steps--falc { grid-template-columns: minmax(125px, 1fr) 50px minmax(165px, 1.15fr) 50px minmax(120px, 1fr); }
.wizard-home--falc {
  display: grid;
  min-height: 470px;
  padding: 0 !important;
  place-items: center;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
.wizard-home--falc .falc-home-actions {
  width: min(620px, 100%);
  padding: 0 !important;
  gap: 18px;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
.wizard-home--falc .falc-home-actions > .falc-home-action {
  display: block;
  width: 100%;
  max-width: none;
  margin: 0;
  flex: 0 0 auto;
}
.falc-home-action { min-height: 82px; padding: 18px 24px; color: var(--brand-dark); border: 2px solid #8ebbc7; border-radius: 18px; background: white; box-shadow: 0 8px 20px rgb(24 73 85 / 10%); cursor: pointer; font-size: clamp(1.15rem, 3vw, 1.45rem); font-weight: 850; }
.falc-home-action:hover, .falc-home-action:focus-visible { border-color: var(--brand); outline: 4px solid rgb(23 107 135 / 15%); }
.falc-home-action--primary { color: white; background: var(--brand); }
.falc-home-panel { position: relative; width: min(760px, 100%); padding: 28px; border: 1px solid var(--line); border-radius: 18px; background: white; }
.falc-home-panel.code-loader { grid-template-columns: 1fr; }
.falc-home-panel .code-loader__error { grid-column: 1; }
.falc-panel-back { width: 44px; height: 44px; margin-bottom: 16px; color: var(--brand-dark); border: 1px solid var(--line); border-radius: 50%; background: var(--surface-soft); cursor: pointer; font-size: 1.4rem; font-weight: 900; }
.wizard-steps button { display: flex; min-width: 0; padding: 7px; align-items: center; gap: 10px; text-align: left; color: #71817d; background: transparent; border: 0; }
.wizard-steps button > span:first-child { display: grid; width: 35px; height: 35px; flex: 0 0 35px; place-items: center; border: 2px solid #b8c7c3; border-radius: 50%; background: white; font-weight: 850; }
.wizard-steps button > span:last-child { display: grid; min-width: 0; }
.wizard-steps button strong { color: currentColor; font-size: .93rem; }
.wizard-steps button small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wizard-steps button.is-active { position: relative; z-index: 2; color: var(--brand-dark); }
.wizard-steps button.is-active > span:first-child { position: relative; z-index: 1; color: white; border-color: var(--brand); background: var(--brand); box-shadow: 0 0 0 5px var(--brand-pale); transform: scale(1.16); animation: wizard-step-active-pulse 1.55s ease-in-out infinite; will-change: box-shadow, transform; }
.wizard-steps button.is-complete:not(.is-active) > span:first-child { color: var(--success); border-color: #83b39b; background: var(--success-pale); }
.wizard-steps button.wizard-step-tab--verbs:not(.is-active) > span:first-child { color: var(--verb-accent); border-color: color-mix(in srgb, var(--verb-accent) 58%, transparent); background: var(--verb-accent-soft); }
.wizard-steps button.wizard-step-tab--verbs { --wizard-step-pulse-color: var(--verb-accent); }
.wizard-steps .wizard-step-tab--verbs.is-active > span:first-child { color: white; border-color: var(--verb-accent); background: var(--verb-accent); }
.wizard-steps .wizard-step-tab--verbs.is-active > span:first-child { box-shadow: 0 0 0 5px color-mix(in srgb, var(--verb-accent) 18%, transparent); }
.wizard-steps button.wizard-step-tab--tenses:not(.is-active) > span:first-child { color: var(--tense-accent); border-color: color-mix(in srgb, var(--tense-accent) 58%, transparent); background: var(--tense-accent-soft); }
.wizard-steps button.wizard-step-tab--tenses { --wizard-step-pulse-color: var(--tense-accent); }
.wizard-steps .wizard-step-tab--tenses.is-active > span:first-child { color: #302711; border-color: var(--tense-accent); background: var(--tense-accent); }
.wizard-steps .wizard-step-tab--tenses.is-active > span:first-child { box-shadow: 0 0 0 5px color-mix(in srgb, var(--tense-accent) 18%, transparent); }
.wizard-steps button:disabled { cursor: default; opacity: .5; }
.wizard-steps__line { position: relative; width: 18px; height: 1px; margin: 0; justify-self: center; color: #b9c9c5; background: currentColor; }
.wizard-steps__line::after { position: absolute; top: 50%; right: -1px; width: 5px; height: 5px; border-top: 1px solid currentColor; border-right: 1px solid currentColor; content: ''; transform: translateY(-50%) rotate(45deg); transform-origin: center; }
.wizard-content { position: relative; min-height: 480px; padding: 30px clamp(18px, 5vw, 58px) 34px; }
.wizard-content--home { padding: clamp(20px, 4vw, 42px); }
.wizard-home { display: grid; max-width: 930px; margin: 0 auto; gap: 18px; }
.wizard-home__choices { display: grid; grid-template-columns: 1fr; gap: 18px; }
.wizard-home__separator { width: 72px; height: 1px; margin: 14px auto -18px; background: color-mix(in srgb, var(--brand) 30%, transparent); }
.wizard-home__seo-intro { width: 100%; min-width: 0; margin-top: 32px; overflow: hidden; border: 1px solid color-mix(in srgb, var(--brand) 30%, var(--line)); border-radius: 19px; color: var(--muted); background: linear-gradient(145deg, color-mix(in srgb, var(--brand-pale) 68%, var(--surface)), var(--surface) 58%); box-shadow: 0 10px 28px rgb(42 65 61 / 8%); }
.wizard-home__seo-intro > header { max-width: 760px; margin: 0 auto; padding: 22px 24px 18px; text-align: center; }
.wizard-home__seo-eyebrow { margin: 0 0 4px !important; color: var(--brand) !important; font-size: .7rem; font-weight: 850; letter-spacing: .13em; text-transform: uppercase; }
.wizard-home__seo-intro h2 { margin: 0; color: var(--brand-dark); font-size: clamp(1.3rem, 2.5vw, 1.75rem); letter-spacing: .018em; line-height: 1.18; }
.wizard-home__seo-intro > header > p:last-child { margin: 9px 0 0; font-size: .93rem; line-height: 1.45; }
.wizard-home__feature-grid { display: grid; min-width: 0; padding: 0 16px 16px; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.wizard-home__feature-grid article { min-width: 0; padding: 17px; border: 1px solid color-mix(in srgb, var(--brand) 18%, var(--line)); border-radius: 14px; background: color-mix(in srgb, var(--surface) 94%, transparent); box-shadow: 0 5px 15px rgb(42 65 61 / 5%); }
.wizard-home__feature-grid h3 { margin: 0 0 10px; color: var(--brand-dark); font-size: 1rem; line-height: 1.2; }
.wizard-home__feature-grid p { margin: 0; font-size: .8rem; line-height: 1.43; text-align: left; }
.wizard-home__feature-grid p + p { margin-top: 8px; }
.wizard-home__choice { display: grid; min-height: 170px; padding: 24px; align-content: start; grid-template-columns: auto 1fr; gap: 18px; border: 1px solid #b8d3cb; border-radius: 18px; background: #f8fbfa; }
.wizard-home__choice:is(button) { width: 100%; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.wizard-home__choice:is(button):hover { border-color: #83afa4; background: var(--brand-pale); }
.wizard-home__choice:is(button):focus-visible { border-color: var(--brand); box-shadow: 0 0 0 4px rgb(52 95 88 / 14%); outline: 0; }
.wizard-home__choice--custom { border-color: #8bb9c6; background: #eff9fb; }
.wizard-home__choice-icon { display: grid; width: 48px; height: 48px; place-items: center; color: white; border-radius: 14px; background: var(--brand); font-size: 1.35rem; font-weight: 900; }
.wizard-home__choice h2 { margin: 1px 0 8px; color: var(--brand-dark); font-size: clamp(1.2rem, 2.2vw, 1.55rem); line-height: 1.15; }
.wizard-home__choice--preset .wizard-home__choice-icon { width: 38px; height: 38px; border-radius: 11px; font-size: 1.2rem; }
.wizard-home__choice--preset h2 { margin-top: 6px; font-size: 1rem; letter-spacing: 0; line-height: 1.25; }
.wizard-home__choice--preset.is-collapsed { min-height: 82px; padding-right: 18px; align-content: center; align-items: center; grid-template-columns: auto 1fr auto; }
.wizard-home__choice--preset.is-collapsed > .secondary-button { grid-column: 3; align-self: center; justify-self: end; margin: 0; }
.wizard-home__outline-action { display: inline-flex; width: 10rem; max-width: 100%; min-height: 43px; padding: 9px 16px; align-items: center; justify-content: center; color: var(--brand); border: 1px solid var(--brand); border-radius: 10px; background: transparent; font: inherit; font-weight: 750; line-height: 1.35; text-align: center; transition: color 150ms ease, border-color 150ms ease, background-color 150ms ease; }
.code-loader__control .wizard-home__outline-action:hover:not(:disabled),
.wizard-home__choice--preset.is-collapsed:hover > .wizard-home__outline-action { color: white; border-color: var(--brand); background: var(--brand); }
.wizard-home__choice--preset.is-preset-selection { min-height: 0; padding-block: 16px; }
.wizard-home__choice--custom { min-height: 130px; align-content: center; align-items: center; grid-template-columns: auto 1fr; }
.wizard-home__choice.wizard-home__choice--custom > button { grid-column: 1 / -1; align-self: center; justify-self: center; margin: 0; }
.wizard-home__choice p { margin: 0; color: var(--muted); line-height: 1.45; }
.wizard-home__choice button { grid-column: 1 / -1; align-self: end; justify-self: start; margin-top: auto; }
.wizard-home__inline-presets { grid-column: 1 / -1; }
.wizard-hero__subtitle, .tour-entry-button, .wizard-content--home :is(h1, h2, h3, h4, h5, h6, strong, b, button) { letter-spacing: .045em; }
.wizard-step { max-width: 930px; margin: 0 auto; }
.wizard-step-preparing { display: grid; min-height: 420px; place-content: center; justify-items: center; gap: 15px; color: var(--brand-dark); text-align: center; }
.wizard-step-preparing__spinner { width: 42px; height: 42px; border-width: 5px; }
.wizard-step-preparing strong { font-size: 1.15rem; }
.wizard-step--selection { padding-top: 0; }
.wizard-step__actions { display: flex; margin-bottom: 30px; align-items: flex-start; justify-content: flex-end; }
.wizard-step__actions--split { align-items: center; justify-content: space-between; }
.wizard-step__controls { display: flex; align-items: center; gap: 8px; }
.wizard-step__bottom-actions { display: flex; margin: 30px -18px -4px; padding: 24px 18px 4px; justify-content: flex-end; border-top: 1px solid var(--line); background: linear-gradient(180deg, color-mix(in srgb, var(--brand-pale) 32%, transparent), transparent); }
.wizard-step__cta { min-height: 54px; padding: 13px 25px; border-radius: 13px; font-size: 1.05rem; font-weight: 400; letter-spacing: .035em; }
.wizard-step__actions > .secondary-button { font-weight: 400; letter-spacing: .035em; }
.wizard-step__cta--launch { display: inline-flex; min-height: 54px; padding: 13px 25px; align-items: center; justify-content: center; gap: 9px; border-radius: 13px; font-size: 1.05rem; }
.wizard-next-pulse:not(:disabled) { animation: wizard-next-pulse 2s infinite; transform-origin: center; }
.wizard-step__intro { margin-bottom: 22px; text-align: center; }
.wizard-step__intro--selection { text-align: left; }
.wizard-step__intro h2 { margin: 0; color: var(--brand-dark); font-size: clamp(1.75rem, 3vw, 2.5rem); letter-spacing: .035em; }
.wizard-step__intro p { max-width: 610px; margin: 8px auto 0; color: var(--muted); line-height: 1.5; }
.wizard-step__intro--selection p { margin-inline: 0; }
.wizard-step :deep(.builder-card) { box-shadow: none; }
.wizard-step :deep(.builder-card__header) { display: none; }
.wizard-step :deep(.verb-search) { padding-top: 23px; }
.preset-verb-overview { display: grid; padding: clamp(20px, 4vw, 30px); border: 1px solid var(--line); border-radius: 18px; gap: 22px; background: color-mix(in srgb, var(--surface) 92%, var(--verb-accent-soft)); }
.preset-verb-overview > header { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.preset-verb-overview h2 { margin: 0; color: var(--brand-dark); font-size: clamp(1.55rem, 3vw, 2.2rem); letter-spacing: .018em; }
.preset-verb-overview p { margin: 5px 0 0; color: var(--muted); }
.preset-verb-overview__edit { margin: 7px 0 0; padding: 0; color: var(--brand-dark); border: 0; background: transparent; cursor: pointer; font: inherit; font-size: .9rem; font-weight: 400; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
.preset-verb-overview__edit:hover { color: var(--brand); }
.preset-verb-overview__edit:focus-visible { border-radius: 3px; outline: 3px solid color-mix(in srgb, var(--brand) 28%, transparent); outline-offset: 3px; }
.preset-verb-overview ul { display: flex; margin: 0; padding: 0; flex-wrap: wrap; gap: 10px; list-style: none; }
.preset-verb-overview li { padding: 9px 14px; border: 1px solid color-mix(in srgb, var(--verb-accent) 45%, var(--line)); border-radius: 999px; color: var(--ink); background: var(--surface); font-weight: 400; }
.preset-verb-enter-active { transition: opacity 240ms ease, transform 240ms ease; }
.preset-verb-enter-from { opacity: 0; transform: translateY(9px) scale(.88); }
.wizard-review, .wizard-launch-step { padding-top: 0; }
.mobile-label-only { display: none; }
.wizard-review :deep(.options-card) { margin: 0 0 18px; box-shadow: none; }
.wizard-review :deep(.challenge-launch) { margin-top: 18px; box-shadow: none; }
.wizard-launch-step :deep(.challenge-launch) { margin-top: 0; box-shadow: none; }
.launch-summary { margin-bottom: 18px; padding: clamp(22px, 2vw, 32px); border: 1px solid var(--line); border-radius: 17px; background: #f8fbfa; }
.launch-summary__heading { display: flex; align-items: start; justify-content: space-between; gap: 18px; }
.launch-summary__heading :is(h1, h2) { margin: 2px 0 0; color: var(--brand-dark); font-size: clamp(1.35rem, 2.5vw, 1.8rem); letter-spacing: .018em; line-height: 1.18; }
.launch-summary__heading--public { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: 'category counts' 'title title'; align-items: center; }
.launch-summary__heading--public > div:first-child { display: contents; }
.launch-summary__heading--public .builder-card__eyebrow { grid-area: category; }
.launch-summary__heading--public h1 { min-width: 0; max-width: 100%; grid-area: title; overflow-wrap: break-word; text-wrap: balance; white-space: normal; }
.launch-summary__heading--public .launch-summary__counts { grid-area: counts; }
.launch-summary__counts { display: flex; flex: 0 0 auto; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.launch-summary__counts span { padding: 6px 10px; border-radius: 999px; color: var(--brand-dark); background: var(--brand-pale); font-size: .82rem; font-weight: 800; }
.launch-summary__description { margin: 9px 0 16px; color: var(--muted); line-height: 1.45; }
.launch-summary__edit-hint { display: block; margin: 0; color: var(--muted); line-height: 1.8; }
.launch-summary__step { display: inline-grid; width: 23px; height: 23px; margin: 0 3px; padding: 0; place-items: center; vertical-align: middle; border: 1.5px solid; border-radius: 50%; cursor: pointer; font: inherit; font-size: .76em; font-weight: 850; line-height: 1; transition: box-shadow 160ms ease, transform 160ms ease; }
.launch-summary__step--verbs { color: var(--verb-accent); border-color: color-mix(in srgb, var(--verb-accent) 58%, transparent); background: var(--verb-accent-soft); }
.launch-summary__step--tenses { color: #7d5c06; border-color: color-mix(in srgb, var(--tense-accent) 72%, transparent); background: color-mix(in srgb, var(--tense-accent) 22%, var(--surface)); }
.launch-summary__step:hover { transform: translateY(-1px); }
.launch-summary__step:focus-visible { outline: 3px solid color-mix(in srgb, currentColor 25%, transparent); outline-offset: 2px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@keyframes wizard-next-pulse {
  0%, 6% {
    box-shadow: 0 0 0 0 rgb(31 123 145 / 0%);
    transform: scale(1);
    animation-timing-function: cubic-bezier(.2, .9, .3, 1);
  }
  16% {
    box-shadow: 0 0 0 8px rgb(31 123 145 / 18%);
    transform: scale(1.035);
    animation-timing-function: cubic-bezier(.16, 1, .3, 1);
  }
  62%, 100% {
    box-shadow: 0 0 0 0 rgb(31 123 145 / 0%);
    transform: scale(1);
  }
}

@keyframes wizard-step-active-pulse {
  0%, 100% {
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--wizard-step-pulse-color, var(--brand)) 25%, transparent);
    transform: scale(1.12);
  }
  50% {
    box-shadow: 0 0 0 11px color-mix(in srgb, var(--wizard-step-pulse-color, var(--brand)) 9%, transparent);
    transform: scale(1.24);
  }
}

@keyframes challenge-loader-arrival-flash {
  0%, 100% {
    box-shadow: 0 0 0 0 rgb(31 123 145 / 0%);
    filter: brightness(1);
    transform: scale(1);
  }
  50% {
    border-color: #42a8bd;
    box-shadow: 0 0 0 7px rgb(31 123 145 / 23%), 0 12px 30px rgb(31 123 145 / 18%);
    filter: brightness(1.14);
    transform: scale(1.012);
  }
}

.code-loader.is-arrival-highlighted {
  transform-origin: center;
  animation:
    challenge-loader-arrival-flash 230ms ease-in-out 3,
    wizard-next-pulse 2s 760ms infinite;
}

@media (prefers-reduced-motion: reduce) {
  .wizard-next-pulse:not(:disabled) { animation: none; }
  .wizard-steps button.is-active > span:first-child { box-shadow: 0 0 0 6px color-mix(in srgb, var(--wizard-step-pulse-color, var(--brand)) 18%, transparent); transform: scale(1.16); animation: none; }
  .tour-wizard-step-indicator { transition: none; }
  .code-loader.is-arrival-highlighted {
    border-color: #42a8bd;
    box-shadow: 0 0 0 5px rgb(31 123 145 / 18%);
    animation: none;
  }
  .preset-verb-enter-active { transition: none; }
}

@media (max-width: 640px) {
  .tour-entry-button { display: none; }
}

@media (max-width: 820px) {
  .wizard-hero { padding: 28px 16px 18px; }
  .wizard-hero h1.wizard-hero__subtitle { margin-top: 9px; font-size: .98rem; }
  .wizard-shell { width: min(100% - 20px, 650px); }
  .code-loader { grid-template-columns: 1fr; gap: 10px; }
  .code-loader__error { grid-column: 1; }
  .wizard-home__choice { min-height: 190px; }
  .wizard-home__feature-grid { grid-template-columns: 1fr; }
  .wizard-home__choice--preset.is-collapsed,
  .wizard-home__choice--custom { min-height: 0; }
  .wizard-steps { grid-template-columns: 1fr 10px 1fr 10px 1fr 10px 1fr; padding: 13px 6px; }
  .wizard-steps--falc { grid-template-columns: 1fr 10px 1fr 10px 1fr; }
  .wizard-steps__line { width: 8px; margin: 0; }
  .wizard-steps__line::after { width: 5px; height: 5px; }
  .wizard-steps button { justify-content: center; padding: 5px 2px; }
  .wizard-steps button > span:last-child small { display: none; }
  .wizard-steps button strong { font-size: .75rem; text-align: center; }
  .wizard-steps button > span:first-child { width: 31px; height: 31px; flex-basis: 31px; }
  .wizard-steps button { flex-direction: column; gap: 4px; }
  .wizard-content { min-height: 430px; padding: 22px 12px 24px; }
  .wizard-step--selection { padding-top: 0; }
  .preset-verb-overview > header { align-items: stretch; flex-direction: column; }
  .wizard-review, .wizard-launch-step { padding-top: 0; }
  .launch-summary__heading--public h1 { white-space: normal; }
  .wizard-step__actions { margin-bottom: 22px; }
  .wizard-step__intro { padding: 0 8px; }
  .wizard-step__controls { justify-content: flex-end; flex-wrap: wrap; }
  .wizard-review :deep(.challenge-launch) { padding: 17px 12px; }
  .tour-welcome-dialog__choices { grid-template-columns: 1fr; }
  .tour-welcome-dialog__choices button { min-height: 88px; }
}

@media (max-width: 470px) {
  .mobile-label-hidden { display: none; }
  .mobile-label-only { display: inline; }
  .code-loader__heading small { font-size: .78rem; }
  .code-loader__control { grid-template-columns: 1fr; }
  .code-loader__control button { width: 100%; }
  .wizard-home__choice { padding: 18px; grid-template-columns: 40px 1fr; gap: 13px; }
  .wizard-home__seo-intro > header { padding: 20px 18px 16px; }
  .wizard-home__feature-grid { padding: 0 10px 10px; }
  .wizard-home__choice-icon { width: 40px; height: 40px; border-radius: 11px; }
  .wizard-home__choice--preset.is-collapsed,
  .wizard-home__choice--custom { grid-template-columns: 40px 1fr; }
  .wizard-home__choice--preset.is-collapsed > .secondary-button { width: 100%; grid-column: 1 / -1; grid-row: 3; justify-self: stretch; }
  .wizard-step--selection,
  .wizard-review,
  .wizard-launch-step { padding-top: 0; }
  .wizard-step__actions,
  .wizard-step__actions--split {
    position: static;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 9px;
    margin-bottom: 22px;
  }
  .wizard-step__actions--split > .secondary-button {
    grid-column: 1;
    justify-self: start;
  }
  .wizard-step__controls { display: contents; }
  .wizard-step__controls > .secondary-button {
    grid-column: 1;
    justify-self: start;
  }
  .wizard-step__controls > .primary-button {
    width: max-content;
    max-width: 100%;
    grid-column: 2;
    justify-self: end;
    text-align: center;
  }
  .wizard-step__controls > .secondary-button:only-child {
    grid-column: 1 / -1;
    justify-self: center;
  }
  .wizard-step__controls .primary-button,
  .wizard-step__controls .secondary-button {
    padding-inline: 8px;
    font-size: .8rem;
    white-space: nowrap;
  }
  .wizard-step__controls .wizard-step__cta {
    min-height: 48px;
    padding-inline: 13px;
    font-size: .88rem;
  }
}
</style>

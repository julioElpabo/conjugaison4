<script setup lang="ts">
import type {
  ConjugationTense,
  ExerciseQuestion,
  LearnerChallengeSnapshot,
  LearnerExerciseTrackingContext,
  Verb,
} from '~~/shared/types/conjugation'
import type { CoachProfile } from '~~/shared/types/coach'
import type { Catalogue } from '~/composables/useChallengeBuilder'
import type { AppLocale } from '~~/shared/i18n/locales'
import { learnerSpaceCopy, learnerSpaceText } from '~~/shared/i18n/learner-space'
import {
  localizedLearnerErrorDomain,
  localizedLearnerErrorLabel,
  localizedLearnerErrorMessageForCode,
} from '~~/shared/i18n/learner-errors'
import type {
  LearnerErrorProgressCard,
  LearnerErrorProgressPoint,
  LearnerErrorProgressSummary,
} from '~~/shared/utils/learner-error-progress'
import type {
  ChallengeProgressPoint,
  ChallengeProgressSummary,
} from '~~/shared/utils/challenge-progress'
import { shuffledQuestionOrder } from '~~/shared/utils/question-order'
import ChatExercise from '~/components/exercise/ChatExercise.vue'
import ClassicExercise from '~/components/exercise/ClassicExercise.vue'
import CoachPicker from '~/components/exercise/CoachPicker.vue'
import '~/assets/css/main.css'

const props = withDefaults(defineProps<{
  inspectedLearner?: { id: number, username: string }
  readOnly?: boolean
}>(), {
  inspectedLearner: undefined,
  readOnly: false,
})

type UserTab = 'challenges' | 'progress' | 'history' | 'preferences' | 'account'
type AccountAction = 'results' | 'account'

interface DashboardChallenge {
  id: number
  fingerprint: string
  label: string
  description: string
  challenge: LearnerChallengeSnapshot
  presentation: string
  isReview: boolean
  lastActivityAt: string
  completedAt: string | null
  correctCount: number
  incorrectCount: number
  scorePercent: number
  unresolvedCount: number
  retryQuestions: ExerciseQuestion[]
  exactQuestions: ExerciseQuestion[]
}

interface DashboardResponse {
  challenges: DashboardChallenge[]
  nextOffset: number
  hasMore: boolean
}

interface ChallengeTraining {
  fingerprint: string
  label: string
  lastTrainedAt: string
  sessionCount: number
  latestSuccessPercent: number
}

interface ChallengeTrainingsResponse {
  trainings: ChallengeTraining[]
}

interface ChallengeTrainingError {
  id: number
  answeredAt: string
  infinitive: string
  tense: string
  mode: string
  person: string
  learnerAnswer: string
  expectedAnswers: readonly string[]
  question: ExerciseQuestion | null
  explanations: string[]
}

interface ChallengeTrainingSession extends ChallengeProgressPoint {
  title: string
  errors: ChallengeTrainingError[]
}

interface ChallengeTrainingProgressResponse extends ChallengeProgressSummary {
  challenge: LearnerChallengeSnapshot | null
  achievement: {
    bestSuccessPercent: number
    bestAnsweredQuestionCount: number
    questionCount: number
    completedWithoutError: boolean
  }
  sessions: ChallengeTrainingSession[]
}

interface LearnerPreferences {
  interfaceLocale: AppLocale
  colorTheme: 'light' | 'dark'
}

const { user: sessionLearner, clearUser } = useLearnerAuth()
const learner = computed(() => props.inspectedLearner || sessionLearner.value)
const { interfaceLocale, localePath, setInterfaceLocale, ui } = useLanguagePreferences()
const copy = computed(() => learnerSpaceCopy(interfaceLocale.value))
const text = (key: keyof ReturnType<typeof learnerSpaceCopy>, parameters: Record<string, string | number> = {}) =>
  learnerSpaceText(copy.value, key, parameters)
const { applyTheme } = useColorTheme()
const { flushProgress } = useLearnerProgress()
const route = useRoute()
const requestFetch = useRequestFetch()
const requestedTab = (value: unknown): UserTab => (
  ['challenges', 'progress', 'history', 'preferences', 'account'].includes(String(value))
    ? String(value) as UserTab
    : 'challenges'
)
const activeTab = ref<UserTab>(requestedTab(route.query.tab))
const learnerProgress = ref<LearnerErrorProgressSummary>()
const learnerProgressPending = ref(false)
const learnerProgressError = ref('')
const progressExplanationOpen = ref(false)
const challengeTrainings = ref<ChallengeTraining[]>([])
const challengeTrainingsPending = ref(false)
const challengeTrainingsError = ref('')
const selectedTrainingFingerprint = ref('')
const selectedTrainingProgress = ref<ChallengeTrainingProgressResponse>()
const selectedTrainingProgressPending = ref(false)
const selectedTrainingProgressError = ref('')
const hoveredTrainingPointId = ref<number>()
const reviewQuestions = ref<ExerciseQuestion[]>([])
const reviewTracking = ref<LearnerExerciseTrackingContext>()
const reviewOpen = ref(false)
const reviewRequireSuccess = ref(false)
const exercisePresentation = ref<'classic' | 'chat'>('classic')
const selectedCoach = ref<CoachProfile>()
const coachPickerOpen = ref(false)
const selectedWork = ref<{
  challenge: DashboardChallenge
  scope: 'same' | 'random' | 'incorrect' | 'targeted'
  targetQuestions?: ExerciseQuestion[]
}>()
const workMenuFingerprint = ref('')
const catalogue = ref<Catalogue>()
const challengeStarting = ref<string>()
const challengeStartError = ref('')
const expandedDescriptions = ref(new Set<string>())
const truncatedDescriptions = ref(new Set<string>())
const challengeDescriptionElements = new Map<string, HTMLElement>()
const preferencesSaving = ref(false)
const preferencesSaved = ref(false)
const preferencesError = ref('')
const accountDialog = ref<AccountAction>()
const accountActionPending = ref(false)
const accountActionError = ref('')
const resultsDeleted = ref(false)
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmation: '',
})
const passwordChanging = ref(false)
const passwordChanged = ref(false)
const passwordError = ref('')
const dashboardLoadingMore = ref(false)
const siteHeaderHeight = ref(68)
const challengeLoader = useTemplateRef<HTMLElement>('challenge-loader')
let challengeObserver: IntersectionObserver | null = null
let siteHeaderObserver: ResizeObserver | undefined
let challengeDescriptionObserver: ResizeObserver | undefined
let trainingProgressRequest = 0
const randomCoachAvatar = useState<string>('challenge-random-coach-avatar', () => '')
const workMenuLeft = ref(0)

function learnerApi(path: string, query: Record<string, string | number> = {}) {
  const parameters = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) parameters.set(key, String(value))
  if (props.inspectedLearner?.id) parameters.set('adminLearnerId', String(props.inspectedLearner.id))
  const suffix = parameters.size ? `?${parameters.toString()}` : ''
  return `/api/learner/${path}${suffix}`
}

const dashboardKey = `learner-dashboard-${learner.value?.id || 'anonymous'}`
const preferencesKey = `learner-preferences-${learner.value?.id || 'anonymous'}`
const stickyTabsStyle = computed(() => ({
  '--learner-tabs-sticky-top': `${siteHeaderHeight.value}px`,
}))

const { data: dashboard, pending: dashboardPending } = await useAsyncData(
  dashboardKey,
  () => requestFetch<DashboardResponse>(learnerApi('dashboard', { offset: 0, limit: 6 })),
)
const { data: storedPreferences } = await useAsyncData(
  preferencesKey,
  () => requestFetch<LearnerPreferences>(learnerApi('preferences')),
)

const preferredLocale = ref<AppLocale>(storedPreferences.value?.interfaceLocale || interfaceLocale.value)
const preferredTheme = ref<'light' | 'dark'>(storedPreferences.value?.colorTheme || 'light')
const localeOptions = computed<Array<{ value: AppLocale, label: string, flag: string }>>(() => [
  { value: 'fr', label: ui('Français'), flag: '🇫🇷' },
  { value: 'de', label: ui('Allemand'), flag: '🇩🇪' },
  { value: 'en', label: ui('Anglais'), flag: '🇬🇧' },
  { value: 'it', label: ui('Italien'), flag: '🇮🇹' },
  { value: 'es', label: ui('Espagnol'), flag: '🇪🇸' },
])

onMounted(() => {
  if (!props.readOnly) applyTheme(preferredTheme.value, false)
  if (!props.readOnly && preferredLocale.value !== interfaceLocale.value) {
    setInterfaceLocale(preferredLocale.value)
  }
  observeChallengeLoader()
  if (activeTab.value === 'challenges') void loadChallengeTrainings()
  if (activeTab.value === 'progress') void loadLearnerProgress()
  if (!randomCoachAvatar.value) void loadRandomCoachAvatar()
  if (activeTab.value === 'account' && route.hash === '#change-password') {
    void nextTick(() => {
      document.getElementById('change-password')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
  document.addEventListener('pointerdown', closeWorkMenuOnOutside)
  document.addEventListener('pointerdown', closeProgressExplanationOnOutside)
  document.addEventListener('keydown', closeAccountDialogOnEscape)
  const siteHeader = document.querySelector<HTMLElement>('.site-header')
  if (siteHeader) {
    const updateSiteHeaderHeight = () => {
      siteHeaderHeight.value = Math.ceil(siteHeader.getBoundingClientRect().height)
    }
    updateSiteHeaderHeight()
    siteHeaderObserver = new ResizeObserver(updateSiteHeaderHeight)
    siteHeaderObserver.observe(siteHeader)
  }
  challengeDescriptionObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const descriptionId = entry.target.getAttribute('data-description-id')
      if (descriptionId && !descriptionIsExpanded(descriptionId)) {
        updateDescriptionTruncation(descriptionId, entry.target as HTMLElement)
      }
    }
  })
  for (const element of challengeDescriptionElements.values()) {
    challengeDescriptionObserver.observe(element)
  }
})

onBeforeUnmount(() => {
  challengeObserver?.disconnect()
  siteHeaderObserver?.disconnect()
  challengeDescriptionObserver?.disconnect()
  document.removeEventListener('pointerdown', closeWorkMenuOnOutside)
  document.removeEventListener('pointerdown', closeProgressExplanationOnOutside)
  document.removeEventListener('keydown', closeAccountDialogOnEscape)
})

watch(
  [activeTab, () => dashboard.value?.hasMore],
  () => nextTick(observeChallengeLoader),
)

watch(activeTab, (tab) => {
  if (tab === 'progress') void loadLearnerProgress()
  if (tab === 'challenges') void loadChallengeTrainings()
})

watch(interfaceLocale, () => {
  if (activeTab.value === 'progress') void loadLearnerProgress(true)
  if (activeTab.value === 'challenges') void loadChallengeTrainings(true)
})

watch(
  [() => route.query.tab, () => route.hash],
  async ([tab]) => {
    activeTab.value = requestedTab(tab)
    if (activeTab.value === 'account' && route.hash === '#change-password') {
      await nextTick()
      document.getElementById('change-password')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  },
)

const displayUsername = computed(() => {
  const username = learner.value?.username || ''
  return username ? username.charAt(0).toLocaleUpperCase('fr-CH') + username.slice(1) : ''
})

const challengeDays = computed(() => {
  const groups: Array<{ key: string, label: string, challenges: DashboardChallenge[] }> = []
  for (const challenge of dashboard.value?.challenges || []) {
    const key = challengeDayKey(challenge.lastActivityAt)
    const current = groups.at(-1)
    if (current?.key === key) current.challenges.push(challenge)
    else groups.push({
      key,
      label: challengeDayLabel(challenge.lastActivityAt),
      challenges: [challenge],
    })
  }
  return groups
})

const selectedTraining = computed(() => challengeTrainings.value.find(
  training => training.fingerprint === selectedTrainingFingerprint.value,
))

interface TrainingChartCoordinate {
  x: number
  y: number
  point: ChallengeProgressPoint
}

const trainingChartCoordinates = computed<TrainingChartCoordinate[]>(() => {
  const points = selectedTrainingProgress.value?.points || []
  if (!points.length) return []
  const left = 42
  const right = 624
  const top = 16
  const bottom = 156
  const timestamps = points.map(point => new Date(point.occurredAt).getTime())
  const first = timestamps[0]!
  const last = timestamps.at(-1)!
  return points.map((point, index) => ({
    x: first === last
      ? (left + right) / 2
      : left + (timestamps[index]! - first) / (last - first) * (right - left),
    y: bottom - point.successPercent / 100 * (bottom - top),
    point,
  }))
})

const trainingChartPolyline = computed(() => trainingChartCoordinates.value
  .map(coordinate => `${coordinate.x},${coordinate.y}`)
  .join(' '))

const hoveredTrainingCoordinate = computed(() => trainingChartCoordinates.value.find(
  coordinate => coordinate.point.id === hoveredTrainingPointId.value,
))

const trainingSessions = computed(() => [...(selectedTrainingProgress.value?.sessions || [])]
  .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()))

const allTrainingErrorQuestions = computed(() => trainingSessions.value.flatMap(session => session.errors
  .map(error => error.question)
  .filter((question): question is ExerciseQuestion => Boolean(question))))

function trainingDateLabel(value: string, includeTime = false) {
  return new Intl.DateTimeFormat(interfaceLocale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    timeZone: 'Europe/Zurich',
  }).format(new Date(value))
}

function trainingSuccessColor(rate: number) {
  const normalized = Math.max(0, Math.min(100, rate)) / 100
  const red = { red: 239, green: 103, blue: 96 }
  const yellow = { red: 214, green: 163, blue: 62 }
  const green = { red: 58, green: 166, blue: 111 }
  const start = normalized <= .5 ? red : yellow
  const end = normalized <= .5 ? yellow : green
  const ratio = normalized <= .5 ? normalized * 2 : (normalized - .5) * 2
  const channel = (from: number, to: number) => Math.round(from + (to - from) * ratio)
  return `rgb(${channel(start.red, end.red)} ${channel(start.green, end.green)} ${channel(start.blue, end.blue)})`
}

function trainingPointRadius(totalCount: number) {
  const totals = trainingChartCoordinates.value.map(coordinate => coordinate.point.totalCount)
  const minimum = Math.min(...totals)
  const maximum = Math.max(...totals)
  const minimumRadius = 7
  const maximumRadius = 18
  if (!totals.length || minimum === maximum) return (minimumRadius + maximumRadius) / 2
  const normalized = (
    Math.sqrt(Math.max(minimum, totalCount)) - Math.sqrt(minimum)
  ) / (
    Math.sqrt(maximum) - Math.sqrt(minimum)
  )
  return minimumRadius + Math.max(0, Math.min(1, normalized)) * (maximumRadius - minimumRadius)
}

async function loadChallengeTrainings(force = false) {
  if (challengeTrainingsPending.value || (challengeTrainings.value.length && !force)) return
  challengeTrainingsPending.value = true
  challengeTrainingsError.value = ''
  try {
    const response = await $fetch<ChallengeTrainingsResponse>(learnerApi('challenge-trainings'), {
      credentials: 'same-origin',
    })
    challengeTrainings.value = response.trainings
    const selectedStillExists = response.trainings.some(
      training => training.fingerprint === selectedTrainingFingerprint.value,
    )
    if (!selectedStillExists) selectedTrainingFingerprint.value = response.trainings[0]?.fingerprint || ''
    if (selectedTrainingFingerprint.value) await loadTrainingProgress(selectedTrainingFingerprint.value)
  }
  catch {
    challengeTrainingsError.value = copy.value.trainingsLoadError
  }
  finally {
    challengeTrainingsPending.value = false
  }
}

async function selectTraining(training: ChallengeTraining) {
  selectedTrainingFingerprint.value = training.fingerprint
  hoveredTrainingPointId.value = undefined
  await loadTrainingProgress(training.fingerprint)
}

async function loadTrainingProgress(fingerprint: string) {
  const request = ++trainingProgressRequest
  selectedTrainingProgressPending.value = true
  selectedTrainingProgressError.value = ''
  try {
    const summary = await $fetch<ChallengeTrainingProgressResponse>(learnerApi('challenge-progress', {
      fingerprint,
      locale: interfaceLocale.value,
    }), {
      credentials: 'same-origin',
    })
    if (request === trainingProgressRequest) selectedTrainingProgress.value = summary
  }
  catch {
    if (request === trainingProgressRequest) {
      selectedTrainingProgress.value = undefined
      selectedTrainingProgressError.value = copy.value.challengeProgressLoadError
    }
  }
  finally {
    if (request === trainingProgressRequest) selectedTrainingProgressPending.value = false
  }
}

function trainingSessionId(sessionId: number) {
  return `training-session-${sessionId}`
}

function sessionTrainingQuestions(session: ChallengeTrainingSession) {
  return session.errors
    .map(error => error.question)
    .filter((question): question is ExerciseQuestion => Boolean(question))
}

function trainingChallenge(sessionId: number, reportTitle: string): DashboardChallenge | undefined {
  const training = selectedTraining.value
  const challenge = selectedTrainingProgress.value?.challenge
  if (!training || !challenge) return undefined
  return {
    id: -Math.abs(sessionId || 1),
    fingerprint: training.fingerprint,
    label: training.label,
    description: challenge.description || '',
    challenge: {
      ...challenge,
      trainingReportTitle: reportTitle,
    },
    presentation: 'classic',
    isReview: true,
    lastActivityAt: training.lastTrainedAt,
    completedAt: null,
    correctCount: 0,
    incorrectCount: 0,
    scorePercent: training.latestSuccessPercent,
    unresolvedCount: 0,
    retryQuestions: [],
    exactQuestions: [],
  }
}

function openTrainingWorkMenu(
  questions: ExerciseQuestion[],
  menuKey: string,
  sessionId: number,
  reportTitle: string,
  event: MouseEvent,
) {
  if (!questions.length || props.readOnly) return
  const challenge = trainingChallenge(sessionId, reportTitle)
  if (!challenge) return
  const isClosing = workMenuFingerprint.value === menuKey
  selectedWork.value = {
    challenge,
    scope: 'targeted',
    targetQuestions: [...questions],
  }
  workMenuFingerprint.value = isClosing ? '' : menuKey
  if (!isClosing) positionWorkMenu(event.currentTarget as HTMLElement)
}

function scrollToTrainingSession(point: ChallengeProgressPoint) {
  const target = document.getElementById(trainingSessionId(point.id))
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.setTimeout(() => target.focus({ preventScroll: true }), 450)
}

function challengeDateParts(value: string) {
  return new Intl.DateTimeFormat(interfaceLocale.value, {
    timeZone: 'Europe/Zurich',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(new Date(value))
}

function challengeDayKey(value: string) {
  const parts = new Intl.DateTimeFormat('fr-CH', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value))
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function challengeDayLabel(value: string) {
  const values = Object.fromEntries(challengeDateParts(value).map(part => [part.type, part.value]))
  return `${values.weekday} ${values.day} ${values.month} ${values.year}`
}

function formattedChallengeTime(value: string) {
  return new Intl.DateTimeFormat(interfaceLocale.value, {
    timeZone: 'Europe/Zurich',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function falseQuestionsLabel(count: number) {
  if (interfaceLocale.value === 'de') return count === 1 ? 'Die falsche Frage' : `Die ${count} falschen Fragen`
  if (interfaceLocale.value === 'en') return count === 1 ? 'The incorrect question' : `The ${count} incorrect questions`
  if (interfaceLocale.value === 'it') return count === 1 ? 'La domanda sbagliata' : `Le ${count} domande sbagliate`
  if (interfaceLocale.value === 'es') return count === 1 ? 'La pregunta incorrecta' : `Las ${count} preguntas incorrectas`
  return count === 1 ? 'La question fausse' : `Les ${count} questions fausses`
}

function pluralLabel(count: number, forms: Record<AppLocale, [string, string]>) {
  const [one, many] = forms[interfaceLocale.value]
  return `${count} ${count === 1 ? one : many}`
}

function resultCountLabel(correct: number, incorrect: number) {
  const correctText = pluralLabel(correct, {
    fr: ['réussite', 'réussites'], de: ['Erfolg', 'Erfolge'], en: ['success', 'successes'],
    it: ['risposta corretta', 'risposte corrette'], es: ['acierto', 'aciertos'],
  })
  const incorrectText = pluralLabel(incorrect, {
    fr: ['erreur', 'erreurs'], de: ['Fehler', 'Fehler'], en: ['mistake', 'mistakes'],
    it: ['errore', 'errori'], es: ['error', 'errores'],
  })
  return `${correctText} · ${incorrectText}`
}

function trainingCountLabel(count: number) {
  return pluralLabel(count, {
    fr: ['entraînement', 'entraînements'], de: ['Training', 'Trainings'], en: ['practice session', 'practice sessions'],
    it: ['allenamento', 'allenamenti'], es: ['entrenamiento', 'entrenamientos'],
  })
}

function occurrenceCountLabel(count: number) {
  return pluralLabel(count, {
    fr: ['occurrence', 'occurrences'], de: ['Sitzung', 'Sitzungen'], en: ['session', 'sessions'],
    it: ['sessione', 'sessioni'], es: ['sesión', 'sesiones'],
  })
}

function questionCountLabel(count: number) {
  return pluralLabel(count, {
    fr: ['question', 'questions'], de: ['Frage', 'Fragen'], en: ['question', 'questions'],
    it: ['domanda', 'domande'], es: ['pregunta', 'preguntas'],
  })
}

function successPercentLabel(rate: number) {
  const suffix = { fr: 'de réussite', de: 'Erfolg', en: 'success', it: 'di successo', es: 'de aciertos' }[interfaceLocale.value]
  return `${rate}% ${suffix}`
}

function successEvolutionLabel(label: string) {
  const prefix = {
    fr: 'Évolution du pourcentage de réussite pour', de: 'Entwicklung der Erfolgsquote für',
    en: 'Success rate over time for', it: 'Evoluzione della percentuale di successo per',
    es: 'Evolución del porcentaje de aciertos para',
  }[interfaceLocale.value]
  return `${prefix} ${label}`
}

function trainingPointLabel(point: ChallengeProgressPoint) {
  const ending = {
    fr: 'Voir les erreurs de cette session.', de: 'Fehler dieser Sitzung anzeigen.',
    en: 'View the mistakes from this session.', it: 'Vedi gli errori di questa sessione.',
    es: 'Ver los errores de esta sesión.',
  }[interfaceLocale.value]
  return `${trainingDateLabel(point.occurredAt, true)}: ${successPercentLabel(point.successPercent)}. ${ending}`
}

function responseSummaryLabel(correct: number, incorrect: number) {
  return resultCountLabel(correct, incorrect)
}

function questionsOutOfLabel(answered: number, total: number) {
  const middle = { fr: 'questions sur', de: 'Fragen von', en: 'questions out of', it: 'domande su', es: 'preguntas de' }[interfaceLocale.value]
  return `${answered} ${middle} ${total}`
}

function trainingErrorsTitle(date: string) {
  const prefix = {
    fr: 'Entraînement des erreurs du', de: 'Fehlertraining vom', en: 'Mistake practice from',
    it: 'Allenamento sugli errori del', es: 'Entrenamiento de errores del',
  }[interfaceLocale.value]
  return `${prefix} ${trainingDateLabel(date)}`
}

function localizedTrainingReportTitle(title: string) {
  if (!title || interfaceLocale.value === 'fr') return title
  if (title === learnerSpaceCopy('fr').trainChallengeErrors) return copy.value.trainChallengeErrors
  const frenchPrefix = 'Entraînement des erreurs du '
  if (title.startsWith(frenchPrefix)) {
    const suffix = title.slice(frenchPrefix.length)
    const prefix = {
      de: 'Fehlertraining vom ',
      en: 'Mistake practice from ',
      it: 'Allenamento sugli errori del ',
      es: 'Entrenamiento de errores del ',
    }[interfaceLocale.value]
    return `${prefix}${suffix}`
  }
  return title
}

function trainQuestionsLabel(count: number) {
  const prefix = { fr: 'Entraîner ces', de: 'Diese', en: 'Practise these', it: 'Allenare queste', es: 'Practicar estas' }[interfaceLocale.value]
  const suffix = interfaceLocale.value === 'de'
    ? (count === 1 ? 'Frage trainieren' : 'Fragen trainieren')
    : questionCountLabel(count).replace(String(count), '').trim()
  return interfaceLocale.value === 'de' ? `${prefix} ${count} ${suffix}` : `${prefix} ${count} ${suffix}`
}

function sessionResultLabel(correct: number, total: number) {
  const middle = { fr: 'réussites sur', de: 'Erfolge von', en: 'successes out of', it: 'risposte corrette su', es: 'aciertos de' }[interfaceLocale.value]
  return `${correct} ${middle} ${total}`
}

function errorEvolutionLabel(label: string) {
  const prefix = {
    fr: 'Évolution du taux d’erreurs pour', de: 'Entwicklung der Fehlerquote für',
    en: 'Error rate over time for', it: 'Evoluzione della percentuale di errori per',
    es: 'Evolución del porcentaje de errores para',
  }[interfaceLocale.value]
  return `${prefix} ${label}`
}

function chartPointLabel(rate: number, errors: number, opportunities: number) {
  const values = {
    fr: `${rate}% de fautes, ${errors} sur ${opportunities} occasions testées`,
    de: `${rate}% Fehler, ${errors} von ${opportunities} geprüften Gelegenheiten`,
    en: `${rate}% mistakes, ${errors} out of ${opportunities} tested opportunities`,
    it: `${rate}% di errori, ${errors} su ${opportunities} occasioni verificate`,
    es: `${rate}% de errores, ${errors} de ${opportunities} ocasiones evaluadas`,
  }
  return values[interfaceLocale.value]
}

function totalOpportunitiesLabel(count: number) {
  const values = {
    fr: `${count} occasion${count === 1 ? '' : 's'} réellement testée${count === 1 ? '' : 's'} au total`,
    de: `${count} tatsächlich geprüfte ${count === 1 ? 'Gelegenheit' : 'Gelegenheiten'} insgesamt`,
    en: `${count} ${count === 1 ? 'opportunity' : 'opportunities'} actually tested in total`,
    it: `${count} ${count === 1 ? 'occasione realmente verificata' : 'occasioni realmente verificate'} in totale`,
    es: `${count} ${count === 1 ? 'ocasión realmente evaluada' : 'ocasiones realmente evaluadas'} en total`,
  }
  return values[interfaceLocale.value]
}

function mistakeCountLabel(count: number) {
  return pluralLabel(count, {
    fr: ['faute', 'fautes'], de: ['Fehler', 'Fehler'], en: ['mistake', 'mistakes'],
    it: ['errore', 'errori'], es: ['error', 'errores'],
  })
}

function progressCardDomain(card: LearnerErrorProgressCard) {
  return localizedLearnerErrorDomain(card.domain, interfaceLocale.value)
}

function progressCardLabel(card: LearnerErrorProgressCard) {
  return localizedLearnerErrorLabel(card.code, card.label, interfaceLocale.value)
}

function progressCardAdvice(card: LearnerErrorProgressCard) {
  return localizedLearnerErrorMessageForCode(card.code, card.advice, interfaceLocale.value)
}

async function loadLearnerProgress(force = false) {
  if (learnerProgressPending.value || (learnerProgress.value && !force)) return
  learnerProgressPending.value = true
  learnerProgressError.value = ''
  try {
    learnerProgress.value = await $fetch<LearnerErrorProgressSummary>(learnerApi('progress', {
      locale: interfaceLocale.value,
    }), {
      credentials: 'same-origin',
    })
  }
  catch {
    learnerProgressError.value = copy.value.progressLoadError
  }
  finally {
    learnerProgressPending.value = false
  }
}

function progressTrendLabel(card: LearnerErrorProgressCard) {
  if (card.isStale) return copy.value.retest
  if (card.trend === 'improving') {
    const count = Math.abs(card.trendDelta || 0)
    return interfaceLocale.value === 'de' ? `${count} Fehlerpunkte weniger`
      : interfaceLocale.value === 'en' ? `${count} fewer error points`
        : interfaceLocale.value === 'it' ? `${count} punti di errore in meno`
          : interfaceLocale.value === 'es' ? `${count} puntos de error menos`
            : `${count} points d’erreur en moins`
  }
  if (card.trend === 'worsening') {
    const count = Math.abs(card.trendDelta || 0)
    return interfaceLocale.value === 'de' ? `${count} Fehlerpunkte mehr`
      : interfaceLocale.value === 'en' ? `${count} more error points`
        : interfaceLocale.value === 'it' ? `${count} punti di errore in più`
          : interfaceLocale.value === 'es' ? `${count} puntos de error más`
            : `${count} points d’erreur en plus`
  }
  if (card.trend === 'stable') return copy.value.stableRate
  return copy.value.tooFewComparable
}

function progressLastTestLabel(card: LearnerErrorProgressCard) {
  if (card.daysSinceLastTest === 0) return copy.value.testedToday
  if (card.daysSinceLastTest === 1) return copy.value.testedYesterday
  const count = card.daysSinceLastTest
  return interfaceLocale.value === 'de' ? `Vor ${count} Tagen getestet`
    : interfaceLocale.value === 'en' ? `Tested ${count} days ago`
      : interfaceLocale.value === 'it' ? `Verificato ${count} giorni fa`
        : interfaceLocale.value === 'es' ? `Evaluado hace ${count} días`
          : `Testé il y a ${count} jours`
}

function progressDateLabel(value: string) {
  return new Intl.DateTimeFormat(interfaceLocale.value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Zurich',
  }).format(new Date(`${value}T12:00:00Z`))
}

interface ProgressChartCoordinate {
  x: number
  y: number
  point: LearnerErrorProgressPoint
  rate: number
}

function progressRate(errorRate: number) {
  return errorRate
}

function progressCurrentRate(card: LearnerErrorProgressCard) {
  return progressRate(card.currentRate)
}

function progressChartCoordinates(card: LearnerErrorProgressCard): ProgressChartCoordinate[] {
  const points = card.points
  if (!points.length) return []
  const left = 42
  const right = 624
  const top = 16
  const bottom = 156
  return points.map((point, index) => ({
    x: points.length === 1
      ? (left + right) / 2
      : left + index / (points.length - 1) * (right - left),
    y: bottom - progressRate(point.errorRate) / 100 * (bottom - top),
    point,
    rate: progressRate(point.errorRate),
  }))
}

function progressMetricColor(rate: number) {
  const riskRate = rate
  const green = { red: 58, green: 166, blue: 111 }
  const yellow = { red: 214, green: 163, blue: 62 }
  const red = { red: 239, green: 103, blue: 96 }
  const start = riskRate <= 10 ? green : yellow
  const end = riskRate <= 10 ? yellow : red
  const ratio = riskRate <= 10
    ? Math.max(0, riskRate) / 10
    : Math.min(10, riskRate - 10) / 10
  const channel = (from: number, to: number) => Math.round(from + (to - from) * ratio)
  return `rgb(${channel(start.red, end.red)} ${channel(start.green, end.green)} ${channel(start.blue, end.blue)})`
}

function progressGradientId(card: LearnerErrorProgressCard) {
  return `progress-rate-errors-${card.code.replaceAll('.', '-')}`
}

function progressCardId(card: LearnerErrorProgressCard) {
  return `progress-card-${card.code.replaceAll('.', '-')}`
}

function closeProgressExplanationOnOutside(event: PointerEvent) {
  const target = event.target
  if (target instanceof Element && target.closest('.progress-explanation')) return
  progressExplanationOpen.value = false
}

function progressChartSegments(card: LearnerErrorProgressCard) {
  const coordinates = progressChartCoordinates(card)
  const segments: ProgressChartCoordinate[][] = []
  for (const coordinate of coordinates) {
    const current = segments.at(-1)
    const previous = current?.at(-1)
    const gap = previous
      ? (Date.parse(`${coordinate.point.date}T00:00:00Z`) - Date.parse(`${previous.point.date}T00:00:00Z`)) / 86_400_000
      : 0
    if (!current || gap > 45) segments.push([coordinate])
    else current.push(coordinate)
  }
  return segments
}

function descriptionIsExpanded(fingerprint: string) {
  return expandedDescriptions.value.has(fingerprint)
}

function descriptionIsTruncated(fingerprint: string) {
  return truncatedDescriptions.value.has(fingerprint)
}

function updateDescriptionTruncation(fingerprint: string, element = challengeDescriptionElements.get(fingerprint)) {
  if (!element || descriptionIsExpanded(fingerprint)) return
  const isTruncated = element.scrollHeight > element.clientHeight + 1
  if (truncatedDescriptions.value.has(fingerprint) === isTruncated) return
  const next = new Set(truncatedDescriptions.value)
  if (isTruncated) next.add(fingerprint)
  else next.delete(fingerprint)
  truncatedDescriptions.value = next
}

function setChallengeDescriptionElement(fingerprint: string, element: unknown) {
  const previous = challengeDescriptionElements.get(fingerprint)
  if (previous) challengeDescriptionObserver?.unobserve(previous)
  if (!(element instanceof HTMLElement)) {
    challengeDescriptionElements.delete(fingerprint)
    return
  }
  element.dataset.descriptionId = fingerprint
  challengeDescriptionElements.set(fingerprint, element)
  challengeDescriptionObserver?.observe(element)
  void nextTick(() => updateDescriptionTruncation(fingerprint, element))
}

function toggleDescription(fingerprint: string) {
  const next = new Set(expandedDescriptions.value)
  if (next.has(fingerprint)) next.delete(fingerprint)
  else next.add(fingerprint)
  expandedDescriptions.value = next
  if (!next.has(fingerprint)) {
    void nextTick(() => updateDescriptionTruncation(fingerprint))
  }
}

async function loadRandomCoachAvatar() {
  try {
    const response = await $fetch<{ coaches: CoachProfile[] }>('/api/coaches')
    const coaches = response.coaches.filter(coach => coach.avatarPath)
    randomCoachAvatar.value = coaches[Math.floor(Math.random() * coaches.length)]?.avatarPath || ''
  }
  catch {
    // Le pictogramme de secours reste affiché.
  }
}

function positionWorkMenu(anchor: HTMLElement) {
  void nextTick(() => {
    const container = anchor.closest('.challenge-work') as HTMLElement | null
    const menu = container?.querySelector<HTMLElement>('.challenge-presentation-menu')
    if (!menu || !container) return
    const anchorRect = anchor.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const anchorCenter = anchorRect.left + anchorRect.width / 2
    workMenuLeft.value = anchorCenter - containerRect.left - menu.offsetWidth / 2
  })
}

function closeWorkMenuOnOutside(event: PointerEvent) {
  const target = event.target
  if (target instanceof Element && target.closest('.challenge-work')) return
  workMenuFingerprint.value = ''
}

function openWorkMenu(challenge: DashboardChallenge, scope: 'same' | 'random' | 'incorrect', event: MouseEvent) {
  if (scope === 'incorrect' && !challenge.retryQuestions.length) return
  const menuKey = `${challenge.id}-${scope}`
  const isClosing = workMenuFingerprint.value === menuKey
  selectedWork.value = { challenge, scope }
  workMenuFingerprint.value = isClosing ? '' : menuKey
  if (!isClosing) positionWorkMenu(event.currentTarget as HTMLElement)
}

async function questionsForSelectedWork() {
  const work = selectedWork.value
  if (!work) return []
  if (work.scope === 'targeted') return shuffledQuestionOrder(work.targetQuestions || [])
  if (work.scope === 'same' || work.scope === 'random') {
    if (work.challenge.exactQuestions.length) {
      return work.scope === 'random'
        ? shuffledQuestionOrder(work.challenge.exactQuestions)
        : [...work.challenge.exactQuestions]
    }
    const preserved = [...work.challenge.retryQuestions]
      .slice(0, work.challenge.challenge.questionCount)
    const missingCount = Math.max(0, work.challenge.challenge.questionCount - preserved.length)
    if (!missingCount) {
      return work.scope === 'random' ? shuffledQuestionOrder(preserved) : preserved
    }
    const generated = await $fetch<ExerciseQuestion[]>('/api/questionnaires', {
      method: 'POST',
      body: {
        ...work.challenge.challenge,
        questionCount: missingCount,
      },
    })
    const questions = [...preserved, ...generated]
      .slice(0, work.challenge.challenge.questionCount)
    return work.scope === 'random' ? shuffledQuestionOrder(questions) : questions
  }
  if (work.scope === 'incorrect') return shuffledQuestionOrder(work.challenge.retryQuestions)
  return await $fetch<ExerciseQuestion[]>('/api/questionnaires', {
    method: 'POST',
    body: work.challenge.challenge,
  })
}

async function ensureCatalogue() {
  if (catalogue.value) return catalogue.value
  catalogue.value = await $fetch<Catalogue>('/api/catalogue')
  return catalogue.value
}

function challengeVerbs(challenge: DashboardChallenge): Verb[] {
  const ids = new Set(challenge.challenge.verbIds)
  return catalogue.value?.verbes.filter(verb => ids.has(verb.id)) || []
}

function challengeTenses(challenge: DashboardChallenge): ConjugationTense[] {
  const ids = new Set(challenge.challenge.tenseIds)
  const modes = new Map(catalogue.value?.modes.map(mode => [mode.id, mode]) || [])
  return (catalogue.value?.temps.filter(tense => ids.has(tense.id)) || [])
    .map(tense => ({ ...tense, mode: tense.mode || modes.get(tense.modeId) }))
}

async function launchSelectedWork(presentation: 'classic' | 'chat', coach?: CoachProfile) {
  const work = selectedWork.value
  if (!work || challengeStarting.value) return
  challengeStarting.value = String(work.challenge.id)
  challengeStartError.value = ''
  try {
    if (presentation === 'chat') await ensureCatalogue()
    const {
      trainingReportTitle: _trainingReportTitle,
      ...standardChallenge
    } = work.challenge.challenge
    const trackedChallenge = work.scope === 'targeted'
      ? work.challenge.challenge
      : standardChallenge
    reviewQuestions.value = await questionsForSelectedWork()
    if (!reviewQuestions.value.length) throw new Error('Aucune question disponible')
    reviewRequireSuccess.value = work.scope === 'incorrect' || work.scope === 'targeted'
    exercisePresentation.value = presentation
    selectedCoach.value = coach
    reviewTracking.value = createLearnerTrackingContext({
      challengeFingerprint: work.challenge.fingerprint,
      challengeLabel: work.challenge.label,
      challenge: trackedChallenge,
      presentation,
      isReview: work.scope === 'incorrect',
    })
    workMenuFingerprint.value = ''
    reviewOpen.value = true
  }
  catch {
    challengeStartError.value = copy.value.prepareError
  }
  finally {
    challengeStarting.value = undefined
  }
}

function choosePresentation(presentation: 'classic' | 'chat') {
  if (presentation === 'chat') {
    workMenuFingerprint.value = ''
    coachPickerOpen.value = true
    return
  }
  void launchSelectedWork('classic')
}

function launchWithCoach(coach: CoachProfile) {
  coachPickerOpen.value = false
  void launchSelectedWork('chat', coach)
}

async function regenerateChatQuestions() {
  reviewQuestions.value = await questionsForSelectedWork()
}

function observeChallengeLoader() {
  challengeObserver?.disconnect()
  challengeObserver = null
  if (activeTab.value !== 'challenges' || !dashboard.value?.hasMore || !challengeLoader.value) return
  challengeObserver = new IntersectionObserver((entries) => {
    if (entries.some(entry => entry.isIntersecting)) void loadMoreChallenges()
  }, { rootMargin: '240px 0px' })
  challengeObserver.observe(challengeLoader.value)
}

async function loadMoreChallenges() {
  if (dashboardLoadingMore.value || !dashboard.value?.hasMore) return
  dashboardLoadingMore.value = true
  try {
    const page = await $fetch<DashboardResponse>(learnerApi('dashboard', {
      offset: dashboard.value.nextOffset,
      limit: 6,
    }), {
      credentials: 'same-origin',
    })
    const known = new Set(dashboard.value.challenges.map(challenge => challenge.id))
    dashboard.value = {
      ...page,
      challenges: [
        ...dashboard.value.challenges,
        ...page.challenges.filter(challenge => !known.has(challenge.id)),
      ],
    }
  }
  finally {
    dashboardLoadingMore.value = false
    await nextTick()
    observeChallengeLoader()
  }
}

async function refreshVisibleChallenges() {
  const visibleCount = Math.max(6, dashboard.value?.challenges.length || 0)
  dashboard.value = await $fetch<DashboardResponse>(learnerApi('dashboard', {
    offset: 0,
    limit: visibleCount,
  }), {
    credentials: 'same-origin',
  })
  await nextTick()
  observeChallengeLoader()
}

async function closeReview() {
  reviewOpen.value = false
  await flushProgress()
  const refreshTrainings = activeTab.value === 'challenges'
    ? loadChallengeTrainings(true)
    : Promise.resolve()
  await Promise.all([
    refreshVisibleChallenges(),
    refreshTrainings,
    learnerProgress.value ? loadLearnerProgress(true) : Promise.resolve(),
  ])
}

async function savePreferences(nextLocale = preferredLocale.value, nextTheme = preferredTheme.value) {
  if (props.readOnly || preferencesSaving.value) return
  preferencesSaving.value = true
  preferencesSaved.value = false
  preferencesError.value = ''
  preferredLocale.value = nextLocale
  preferredTheme.value = nextTheme
  try {
    await $fetch(learnerApi('preferences'), {
      method: 'PUT',
      body: { interfaceLocale: nextLocale, colorTheme: nextTheme },
    })
    applyTheme(nextTheme)
    preferencesSaved.value = true
    if (nextLocale !== interfaceLocale.value) setInterfaceLocale(nextLocale)
  }
  catch {
    preferencesError.value = copy.value.preferencesSaveError
  }
  finally {
    preferencesSaving.value = false
  }
}

function passwordRequestMessage(error: unknown) {
  if (!error || typeof error !== 'object') return ''
  const candidate = error as {
    statusMessage?: string
    data?: { statusMessage?: string, message?: string }
  }
  const message = candidate.data?.statusMessage || candidate.data?.message || candidate.statusMessage || ''
  if (interfaceLocale.value === 'fr') return message
  if (message.includes('actuel est incorrect')) return copy.value.currentPasswordError
  if (message.includes('différent de l’actuel')) return copy.value.passwordSameError
  return message ? copy.value.passwordChangeError : ''
}

async function changePassword() {
  if (props.readOnly || passwordChanging.value) return
  passwordChanged.value = false
  passwordError.value = ''
  if (passwordForm.newPassword.length < 10 || passwordForm.newPassword.length > 200) {
    passwordError.value = copy.value.passwordLengthError
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmation) {
    passwordError.value = copy.value.passwordMismatchError
    return
  }
  if (passwordForm.currentPassword === passwordForm.newPassword) {
    passwordError.value = copy.value.passwordSameError
    return
  }
  passwordChanging.value = true
  try {
    await $fetch('/api/learner/password', {
      method: 'PUT',
      credentials: 'same-origin',
      body: {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmation: passwordForm.confirmation,
      },
    })
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmation = ''
    passwordChanged.value = true
  }
  catch (error) {
    passwordError.value = passwordRequestMessage(error)
      || copy.value.passwordChangeError
  }
  finally {
    passwordChanging.value = false
  }
}

function openAccountDialog(action: AccountAction) {
  if (props.readOnly) return
  accountActionError.value = ''
  accountDialog.value = action
}

function closeAccountDialog() {
  if (accountActionPending.value) return
  accountDialog.value = undefined
  accountActionError.value = ''
}

function closeAccountDialogOnEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  closeAccountDialog()
  progressExplanationOpen.value = false
}

async function confirmAccountAction() {
  if (!accountDialog.value || accountActionPending.value) return
  accountActionPending.value = true
  accountActionError.value = ''
  const action = accountDialog.value
  try {
    if (action === 'results') {
      await $fetch('/api/learner/results', { method: 'DELETE' })
      dashboard.value = { challenges: [], nextOffset: 0, hasMore: false }
      learnerProgress.value = undefined
      resultsDeleted.value = true
      accountDialog.value = undefined
      return
    }

    await $fetch('/api/learner/account', { method: 'DELETE' })
    clearUser()
    await navigateTo(localePath('/signin'))
  }
  catch {
    accountActionError.value = action === 'results'
      ? copy.value.deleteResultsError
      : copy.value.deleteAccountError
  }
  finally {
    accountActionPending.value = false
  }
}
</script>

<template>
  <div class="learner-space" :class="{ 'learner-space--dark': preferredTheme === 'dark' }">
    <header class="learner-space__hero">
      <div>
        <h1>{{ copy.hello }} {{ displayUsername }}</h1>
      </div>
      <nav class="learner-space__hero-actions" :aria-label="copy.personalSettings">
        <button
          :class="{ 'is-active': activeTab === 'preferences' }"
          type="button"
          @click="activeTab = 'preferences'"
        >
          {{ copy.preferences }}
        </button>
        <button
          :class="{ 'is-active': activeTab === 'account' }"
          type="button"
          @click="activeTab = 'account'"
        >
          {{ copy.account }}
        </button>
      </nav>
    </header>

    <nav class="learner-tabs" :style="stickyTabsStyle" :aria-label="copy.spaceSections">
      <button :class="{ 'is-active': activeTab === 'history' }" type="button" @click="activeTab = 'history'">
        {{ copy.history }}
      </button>
      <button :class="{ 'is-active': activeTab === 'progress' }" type="button" @click="activeTab = 'progress'">
        {{ copy.commonErrors }}
      </button>
      <button
        class="learner-tabs__primary"
        :class="{ 'is-active': activeTab === 'challenges' }"
        type="button"
        @click="activeTab = 'challenges'"
      >
        <span aria-hidden="true">✦</span>
        {{ copy.improve }}
      </button>
    </nav>

    <section v-if="activeTab === 'challenges' || activeTab === 'history'" class="learner-panel" aria-labelledby="challenges-title">
      <div class="learner-panel__heading">
        <div>
          <p class="learner-eyebrow">{{ activeTab === 'history' ? copy.findActivities : copy.resumeAndConsolidate }}</p>
          <h2 id="challenges-title">{{ activeTab === 'history' ? copy.history : copy.improve }}</h2>
        </div>
      </div>

      <aside class="learner-section-intro">
        <strong>{{ activeTab === 'history' ? copy.reviewJourney : copy.chooseTraining }}</strong>
        <p v-if="activeTab === 'history'">
          {{ copy.historyIntro }}
        </p>
        <p v-else>
          {{ copy.improveIntro }}
        </p>
      </aside>

      <template v-if="activeTab === 'history'">
        <p v-if="dashboardPending" class="learner-empty">{{ copy.loadingChallenges }}</p>
        <template v-else-if="dashboard?.challenges.length">
        <ol class="challenge-history" :aria-label="copy.challengeHistory">
          <li v-for="day in challengeDays" :key="day.key" class="challenge-history__day">
            <time class="challenge-history__date" :datetime="day.key">{{ day.label }}</time>
            <ol class="challenge-history__day-list">
              <li
                v-for="(challenge, challengeIndex) in day.challenges"
                :key="challenge.id"
                :class="{
                  'is-left': challengeIndex % 2 === 0,
                  'is-right': challengeIndex % 2 !== 0,
                  'is-work-menu-open': selectedWork?.challenge.id === challenge.id && workMenuFingerprint,
                }"
              >
                <span class="challenge-history__dot" aria-hidden="true" />
                <article class="challenge-card">
                  <div class="challenge-card__top">
                    <div>
                      <span>{{ formattedChallengeTime(challenge.lastActivityAt) }}</span>
                      <h3>{{ challenge.label }}</h3>
                    </div>
                  </div>
                  <div v-if="challenge.description" class="challenge-card__description">
                    <p
                      :ref="element => setChallengeDescriptionElement(String(challenge.id), element)"
                      :class="{ 'is-expanded': descriptionIsExpanded(String(challenge.id)) }"
                    >
                      {{ challenge.description }}
                    </p>
                    <button
                      v-if="descriptionIsTruncated(String(challenge.id))"
                      type="button"
                      :aria-expanded="descriptionIsExpanded(String(challenge.id))"
                      @click="toggleDescription(String(challenge.id))"
                    >
                      {{ descriptionIsExpanded(String(challenge.id)) ? copy.showLess : copy.showAll }}
                    </button>
                  </div>
                  <div class="challenge-card__bar" aria-hidden="true">
                    <span :style="{ width: `${challenge.scorePercent}%` }" />
                  </div>
                  <p>
                    {{ resultCountLabel(challenge.correctCount, challenge.incorrectCount) }}
                  </p>
                  <div v-if="!readOnly" class="challenge-work">
                    <strong>{{ copy.retrainChallenge }}</strong>
                    <div>
                      <button
                        type="button"
                        class="review-button"
                        :disabled="Boolean(challengeStarting)"
                        :title="challenge.exactQuestions.length ? copy.sameDraw : copy.oldDraw"
                        :aria-expanded="workMenuFingerprint === `${challenge.id}-same`"
                        @click="openWorkMenu(challenge, 'same', $event)"
                      >
                        {{ copy.sameOrder }}
                      </button>
                      <button
                        type="button"
                        class="review-button"
                        :disabled="Boolean(challengeStarting)"
                        :aria-expanded="workMenuFingerprint === `${challenge.id}-random`"
                        @click="openWorkMenu(challenge, 'random', $event)"
                      >
                        {{ copy.randomOrder }}
                      </button>
                      <button
                        v-if="challenge.unresolvedCount > 0"
                        type="button"
                        class="review-button"
                        :disabled="Boolean(challengeStarting)"
                        :aria-expanded="workMenuFingerprint === `${challenge.id}-incorrect`"
                        @click="openWorkMenu(challenge, 'incorrect', $event)"
                      >
                        {{ falseQuestionsLabel(challenge.unresolvedCount) }}
                      </button>
                    </div>
                    <div
                      v-if="selectedWork?.challenge.id === challenge.id && workMenuFingerprint"
                      class="challenge-presentation-menu"
                      :style="{ left: `${workMenuLeft}px` }"
                      role="group"
                      :aria-label="copy.choosePresentation"
                    >
                      <button
                        class="action-button action-button--primary"
                        type="button"
                        :disabled="Boolean(challengeStarting)"
                        @click="choosePresentation('classic')"
                      >
                        <span class="action-button__icon" aria-hidden="true">●</span>
                        <span>
                          <strong>{{ copy.classic }}</strong>
                        </span>
                      </button>
                      <button
                        class="action-button action-button--chat"
                        type="button"
                        :disabled="Boolean(challengeStarting)"
                        @click="choosePresentation('chat')"
                      >
                        <span class="action-button__icon" aria-hidden="true">
                          <img v-if="randomCoachAvatar" :src="randomCoachAvatar" alt="">
                          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                          </svg>
                        </span>
                        <span>
                          <strong>{{ copy.withCoach }}</strong>
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            </ol>
          </li>
        </ol>
        <p v-if="challengeStartError" class="preferences-error" role="alert">{{ challengeStartError }}</p>
        <button
          v-if="dashboard.hasMore"
          ref="challenge-loader"
          class="challenge-loader"
          type="button"
          :disabled="dashboardLoadingMore"
          @click="loadMoreChallenges"
        >
          {{ dashboardLoadingMore ? copy.loadingOlder : copy.loadOlder }}
        </button>
        </template>
        <div v-else class="learner-empty">
          <strong>{{ copy.noChallenge }}</strong>
          <span>{{ copy.futureAnswers }}</span>
        </div>
      </template>

      <template v-else>
        <p v-if="challengeTrainingsError" class="preferences-error" role="alert">{{ challengeTrainingsError }}</p>
        <p v-if="challengeTrainingsPending && !challengeTrainings.length" class="learner-empty">
          {{ copy.groupingTrainings }}
        </p>
        <div v-else-if="challengeTrainings.length" class="challenge-training-layout">
          <nav class="challenge-training-list" :aria-label="copy.trainedChallenges">
            <button
              v-for="training in challengeTrainings"
              :key="training.fingerprint"
              type="button"
              :class="{ 'is-active': selectedTrainingFingerprint === training.fingerprint }"
              :aria-current="selectedTrainingFingerprint === training.fingerprint ? 'true' : undefined"
              @click="selectTraining(training)"
            >
              <span>{{ training.label }}</span>
              <small>{{ trainingDateLabel(training.lastTrainedAt) }}</small>
              <b>
                {{ trainingCountLabel(training.sessionCount) }}
                · {{ training.latestSuccessPercent }}%
              </b>
            </button>
          </nav>

          <section class="challenge-training-analysis" aria-live="polite">
            <header v-if="selectedTraining">
              <div>
                <p>{{ copy.successEvolution }}</p>
                <h3>{{ selectedTraining.label }}</h3>
              </div>
            </header>

            <p v-if="selectedTrainingProgressError" class="preferences-error" role="alert">
              {{ selectedTrainingProgressError }}
            </p>
            <div v-else-if="selectedTrainingProgressPending" class="challenge-training-state">
              {{ copy.calculatingProgress }}
            </div>
            <template v-else-if="selectedTrainingProgress?.points.length">
              <div class="challenge-training-chart">
                <div class="challenge-training-chart__plot">
                  <svg viewBox="0 0 640 190" role="img" :aria-label="successEvolutionLabel(selectedTraining?.label || '')">
                    <defs>
                      <linearGradient
                        id="training-success-gradient"
                        x1="0"
                        y1="156"
                        x2="0"
                        y2="16"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stop-color="#ef6760" />
                        <stop offset="50%" stop-color="#d6a33e" />
                        <stop offset="100%" stop-color="#3aa66f" />
                      </linearGradient>
                    </defs>
                    <g class="challenge-training-chart__grid">
                      <line x1="42" x2="624" y1="16" y2="16" />
                      <line x1="42" x2="624" y1="86" y2="86" />
                      <line x1="42" x2="624" y1="156" y2="156" />
                    </g>
                    <polyline
                      v-if="trainingChartCoordinates.length > 1"
                      :points="trainingChartPolyline"
                    />
                    <circle
                      v-for="coordinate in trainingChartCoordinates"
                      :key="coordinate.point.id"
                      :cx="coordinate.x"
                      :cy="coordinate.y"
                      :style="{ stroke: trainingSuccessColor(coordinate.point.successPercent) }"
                      :class="{ 'is-active': hoveredTrainingPointId === coordinate.point.id }"
                      role="button"
                      tabindex="0"
                      :aria-label="trainingPointLabel(coordinate.point)"
                      :r="trainingPointRadius(coordinate.point.totalCount)
                        + (hoveredTrainingPointId === coordinate.point.id ? 2 : 0)"
                      @pointerenter="hoveredTrainingPointId = coordinate.point.id"
                      @pointerleave="hoveredTrainingPointId = undefined"
                      @focus="hoveredTrainingPointId = coordinate.point.id"
                      @blur="hoveredTrainingPointId = undefined"
                      @click="scrollToTrainingSession(coordinate.point)"
                      @keydown.enter.prevent="scrollToTrainingSession(coordinate.point)"
                      @keydown.space.prevent="scrollToTrainingSession(coordinate.point)"
                    />
                    <text
                      v-for="coordinate in trainingChartCoordinates"
                      :key="`count-${coordinate.point.id}`"
                      class="challenge-training-chart__point-count"
                      :x="coordinate.x"
                      :y="coordinate.y"
                      aria-hidden="true"
                    >
                      {{ coordinate.point.totalCount }}
                    </text>
                  </svg>
                  <div
                    v-if="hoveredTrainingCoordinate"
                    class="challenge-training-chart__tooltip"
                    :style="{
                      left: `${Math.max(18, Math.min(82, hoveredTrainingCoordinate.x / 640 * 100))}%`,
                      top: `${hoveredTrainingCoordinate.y / 190 * 100}%`,
                    }"
                    role="tooltip"
                  >
                    <strong>{{ successPercentLabel(hoveredTrainingCoordinate.point.successPercent) }}</strong>
                    <span>{{ trainingDateLabel(hoveredTrainingCoordinate.point.occurredAt, true) }}</span>
                    <small>
                      {{ hoveredTrainingCoordinate.point.correctCount }}/{{ hoveredTrainingCoordinate.point.totalCount }}
                      {{ responseSummaryLabel(hoveredTrainingCoordinate.point.correctCount, hoveredTrainingCoordinate.point.incorrectCount) }}
                    </small>
                    <b>{{ copy.clickSession }}</b>
                  </div>
                  <div class="challenge-training-chart__rate-axis" aria-hidden="true">
                    <span class="is-high">100%</span>
                    <span class="is-middle">50%</span>
                    <span class="is-low">0%</span>
                  </div>
                  <div class="challenge-training-chart__date-axis" aria-hidden="true">
                    <span>{{ trainingDateLabel(selectedTrainingProgress.points[0]!.occurredAt) }}</span>
                    <span>{{ trainingDateLabel(selectedTrainingProgress.points.at(-1)!.occurredAt) }}</span>
                  </div>
                </div>
                <footer>
                  <span>
                    {{ occurrenceCountLabel(selectedTrainingProgress.points.length) }}
                  </span>
                </footer>
              </div>

              <section class="challenge-training-achievement" :aria-label="copy.achievementLabel">
                <div>
                  <span>{{ copy.bestResult }}</span>
                  <strong>
                    <span class="challenge-training-achievement__rate">
                      {{ successPercentLabel(selectedTrainingProgress.achievement.bestSuccessPercent) }}
                    </span>
                    <small>
                      {{ selectedTrainingProgress.achievement.bestAnsweredQuestionCount }}
                      {{ questionsOutOfLabel(selectedTrainingProgress.achievement.bestAnsweredQuestionCount, selectedTrainingProgress.achievement.questionCount) }}
                    </small>
                  </strong>
                </div>
                <div
                  class="challenge-training-achievement__complete"
                  :class="{ 'is-achieved': selectedTrainingProgress.achievement.completedWithoutError }"
                >
                  <span
                    class="challenge-training-achievement__check"
                    role="img"
                    :aria-label="selectedTrainingProgress.achievement.completedWithoutError
                      ? copy.completeSuccess
                      : copy.notCompleteSuccess"
                    :aria-disabled="!selectedTrainingProgress.achievement.completedWithoutError"
                  >✓</span>
                  <p>
                    <strong>{{ copy.exerciseCompleted }}</strong>
                    <span>({{ questionCountLabel(selectedTrainingProgress.achievement.questionCount) }})</span>
                  </p>
                </div>
              </section>

              <div v-if="!readOnly" class="challenge-work challenge-training-all-work">
                <button
                  type="button"
                  class="challenge-training-all-work__button"
                  :disabled="!allTrainingErrorQuestions.length || Boolean(challengeStarting)"
                  :aria-expanded="workMenuFingerprint === 'training-all'"
                  @click="openTrainingWorkMenu(
                    allTrainingErrorQuestions,
                    'training-all',
                    1,
                    copy.trainChallengeErrors,
                    $event,
                  )"
                >
                  {{ copy.practiseChallengeErrors }}
                </button>
                <div
                  v-if="workMenuFingerprint === 'training-all'"
                  class="challenge-presentation-menu"
                  :style="{ left: `${workMenuLeft}px` }"
                  role="group"
                  :aria-label="copy.choosePresentation"
                >
                  <button
                    class="action-button action-button--primary"
                    type="button"
                    :disabled="Boolean(challengeStarting)"
                    @click="choosePresentation('classic')"
                  >
                    <span class="action-button__icon" aria-hidden="true">●</span>
                    <span><strong>{{ copy.classic }}</strong></span>
                  </button>
                  <button
                    class="action-button action-button--chat"
                    type="button"
                    :disabled="Boolean(challengeStarting)"
                    @click="choosePresentation('chat')"
                  >
                    <span class="action-button__icon" aria-hidden="true">
                      <img v-if="randomCoachAvatar" :src="randomCoachAvatar" alt="">
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                      </svg>
                    </span>
                    <span><strong>{{ copy.withCoach }}</strong></span>
                  </button>
                </div>
              </div>

              <section class="challenge-training-sessions" aria-labelledby="training-sessions-title">
                <header>
                  <div>
                    <p>{{ copy.newestFirst }}</p>
                    <h4 id="training-sessions-title">{{ copy.errorsBySession }}</h4>
                  </div>
                  <span>{{ occurrenceCountLabel(trainingSessions.length) }}</span>
                </header>
                <div class="challenge-training-sessions__list">
                  <article
                    v-for="session in trainingSessions"
                    :id="trainingSessionId(session.id)"
                    :key="session.id"
                    tabindex="-1"
                  >
                    <div v-if="session.errors.length && !readOnly" class="challenge-work challenge-training-session__work">
                      <button
                        type="button"
                        :disabled="Boolean(challengeStarting)"
                        :aria-expanded="workMenuFingerprint === `training-session-work-${session.id}`"
                        @click="openTrainingWorkMenu(
                          sessionTrainingQuestions(session),
                          `training-session-work-${session.id}`,
                          session.id,
                          trainingErrorsTitle(session.occurredAt),
                          $event,
                        )"
                      >
                        {{ trainQuestionsLabel(session.errors.length) }}
                      </button>
                      <div
                        v-if="workMenuFingerprint === `training-session-work-${session.id}`"
                        class="challenge-presentation-menu"
                        :style="{ left: `${workMenuLeft}px` }"
                        role="group"
                        :aria-label="copy.choosePresentation"
                      >
                        <button
                          class="action-button action-button--primary"
                          type="button"
                          :disabled="Boolean(challengeStarting)"
                          @click="choosePresentation('classic')"
                        >
                          <span class="action-button__icon" aria-hidden="true">●</span>
                          <span><strong>{{ copy.classic }}</strong></span>
                        </button>
                        <button
                          class="action-button action-button--chat"
                          type="button"
                          :disabled="Boolean(challengeStarting)"
                          @click="choosePresentation('chat')"
                        >
                          <span class="action-button__icon" aria-hidden="true">
                            <img v-if="randomCoachAvatar" :src="randomCoachAvatar" alt="">
                            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                              <circle cx="12" cy="8" r="4" />
                              <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                            </svg>
                          </span>
                          <span><strong>{{ copy.withCoach }}</strong></span>
                        </button>
                      </div>
                    </div>
                    <header>
                      <div>
                        <h5 v-if="session.title">{{ localizedTrainingReportTitle(session.title) }}</h5>
                        <time :datetime="session.occurredAt">{{ trainingDateLabel(session.occurredAt, true) }}</time>
                        <span>
                          {{ sessionResultLabel(session.correctCount, session.totalCount) }}
                        </span>
                      </div>
                      <strong :style="{ color: trainingSuccessColor(session.successPercent) }">
                        {{ session.successPercent }}%
                      </strong>
                    </header>
                    <ol v-if="session.errors.length">
                      <li v-for="error in session.errors" :key="error.id">
                        <span>
                          {{ [error.infinitive, error.mode, error.tense, error.person].filter(Boolean).join(' · ') }}
                        </span>
                        <div>
                          <span class="challenge-training-error__answer">{{ error.learnerAnswer }}</span>
                          <span aria-hidden="true">→</span>
                          <strong>{{ error.expectedAnswers.join(` ${ui('ou')} `) || copy.unavailableAnswer }}</strong>
                        </div>
                        <p
                          v-for="explanation in error.explanations"
                          :key="explanation"
                          class="challenge-training-error__explanation"
                        >
                          {{ explanation }}
                        </p>
                      </li>
                    </ol>
                    <p v-else class="challenge-training-session__perfect">
                      {{ copy.noSessionError }}
                    </p>
                  </article>
                </div>
              </section>
            </template>
            <div v-else class="challenge-training-state">
              {{ copy.noUsableOccurrence }}
            </div>
          </section>
        </div>
        <div v-else-if="!challengeTrainingsPending" class="learner-empty">
          <strong>{{ copy.noTraining }}</strong>
          <span>{{ copy.noTrainingHint }}</span>
        </div>
      </template>
    </section>

    <section v-else-if="activeTab === 'progress'" class="learner-panel" aria-labelledby="progress-title">
      <div class="learner-panel__heading learner-panel__heading--progress">
        <div>
          <p class="learner-eyebrow">{{ copy.measureProgress }}</p>
          <h2 id="progress-title">{{ copy.commonErrors }}</h2>
        </div>
        <div class="progress-explanation">
          <button
            type="button"
            class="progress-explanation__button"
            :aria-label="copy.progressCalculation"
            aria-controls="progress-explanation-tooltip"
            :aria-expanded="progressExplanationOpen"
            :aria-describedby="progressExplanationOpen ? 'progress-explanation-tooltip' : undefined"
            @click.stop="progressExplanationOpen = !progressExplanationOpen"
          >
            <span aria-hidden="true">i</span>
          </button>
          <div
            v-if="progressExplanationOpen"
            id="progress-explanation-tooltip"
            class="progress-explanation__tooltip"
            role="tooltip"
          >
            <strong>{{ copy.compareRates }}</strong>
            <p>
              {{ text('progressExplanation', { count: learnerProgress?.opportunityWindow || 10 }) }}
            </p>
          </div>
        </div>
      </div>

      <aside class="learner-section-intro">
        <strong>{{ copy.errorsOverTime }}</strong>
        <p>{{ copy.errorsIntro }}</p>
      </aside>

      <p v-if="learnerProgressError" class="preferences-error" role="alert">{{ learnerProgressError }}</p>
      <p v-else-if="learnerProgressPending && !learnerProgress" class="learner-empty">
        {{ copy.analysingProgress }}
      </p>
      <template v-else-if="learnerProgress?.cards.length">
        <div class="error-progress-list">
          <article
            v-for="card in learnerProgress.cards"
            :key="card.code"
            :id="progressCardId(card)"
            class="error-progress-card"
            :class="[
              `is-${card.trend}`,
              'is-errors',
              { 'is-stale': card.isStale },
            ]"
            tabindex="-1"
          >
          <header class="error-progress-card__heading">
            <div>
              <span>{{ progressCardDomain(card) }}</span>
              <h3>{{ progressCardLabel(card) }}</h3>
              <p>{{ progressCardAdvice(card) }}</p>
            </div>
            <div class="error-progress-card__rate">
              <strong>{{ progressCurrentRate(card) }}%</strong>
              <span>{{ copy.errorRate }}</span>
            </div>
          </header>

          <div class="error-progress-card__status">
            <strong>{{ progressTrendLabel(card) }}</strong>
            <span :class="{ 'is-warning': card.isStale }">
              {{ progressLastTestLabel(card) }}
            </span>
          </div>

          <div v-if="card.points.length" class="error-progress-chart">
            <div class="error-progress-chart__plot">
              <svg
                viewBox="0 0 640 190"
                role="img"
                :aria-label="errorEvolutionLabel(progressCardLabel(card))"
              >
                <defs>
                  <linearGradient
                    :id="progressGradientId(card)"
                    x1="0"
                    y1="156"
                    x2="0"
                    y2="16"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stop-color="#3aa66f" />
                    <stop offset="10%" stop-color="#d6a33e" />
                    <stop offset="20%" stop-color="#ef6760" />
                    <stop offset="100%" stop-color="#ef6760" />
                  </linearGradient>
                </defs>
                <g class="error-progress-chart__grid">
                  <line x1="42" x2="624" y1="16" y2="16" />
                  <line x1="42" x2="624" y1="86" y2="86" />
                  <line x1="42" x2="624" y1="156" y2="156" />
                </g>
                <polyline
                  v-for="(segment, segmentIndex) in progressChartSegments(card)"
                  :key="segmentIndex"
                  :points="segment.map(coordinate => `${coordinate.x},${coordinate.y}`).join(' ')"
                  :style="{ stroke: `url(#${progressGradientId(card)})` }"
                />
                <circle
                  v-for="(coordinate, coordinateIndex) in progressChartCoordinates(card)"
                  :key="`${coordinate.point.date}-${coordinate.point.windowStartDate}-${coordinate.point.sequence ?? coordinateIndex}`"
                  :cx="coordinate.x"
                  :cy="coordinate.y"
                  :style="{ stroke: progressMetricColor(coordinate.rate) }"
                  r="5"
                >
                  <title>
                    {{ progressDateLabel(coordinate.point.date) }} :
                    {{ chartPointLabel(coordinate.rate, coordinate.point.errors, coordinate.point.opportunities) }}
                  </title>
                </circle>
              </svg>
              <div
                class="error-progress-chart__rate-axis is-errors"
                aria-hidden="true"
              >
                <span class="is-high">100%</span>
                <span class="is-middle">50%</span>
                <span class="is-low">0%</span>
              </div>
              <div class="error-progress-chart__date-axis" aria-hidden="true">
                <span>{{ progressDateLabel(card.points[0]!.date) }}</span>
                <span>{{ progressDateLabel(card.points.at(-1)!.date) }}</span>
              </div>
            </div>
            <div class="error-progress-chart__legend">
              <span>{{ copy.fewerErrorsBelow }}</span>
              <span>{{ totalOpportunitiesLabel(card.totalOpportunities) }}</span>
            </div>
          </div>
          <div v-else class="error-progress-card__insufficient">
            {{ text('reliableCurve', { count: learnerProgress.minimumEvidence }) }}
          </div>
          <details v-if="card.examples.length" class="error-progress-examples">
            <summary>
              <span class="error-progress-examples__label">
                <span class="error-progress-examples__chevron" aria-hidden="true" />
                {{ copy.seeExamples }}
              </span>
              <small>{{ mistakeCountLabel(card.examples.length) }}</small>
            </summary>
            <ol>
              <li v-for="example in card.examples" :key="example.id">
                <dl>
                  <div>
                    <dt>{{ copy.question }}</dt>
                    <dd>{{ example.question }}</dd>
                  </div>
                  <div>
                    <dt>{{ copy.yourError }}</dt>
                    <dd class="error-progress-examples__wrong">{{ example.learnerAnswer || copy.noAnswer }}</dd>
                  </div>
                  <div>
                    <dt>{{ copy.correction }}</dt>
                    <dd class="error-progress-examples__correct">
                      {{ example.expectedAnswers.join(` ${ui('ou')} `) || copy.unavailableAnswer }}
                    </dd>
                  </div>
                  <div>
                    <dt>{{ copy.reason }}</dt>
                    <dd>{{ localizedLearnerErrorMessageForCode(card.code, example.reason, interfaceLocale) }}</dd>
                  </div>
                </dl>
              </li>
            </ol>
          </details>
          </article>
        </div>
      </template>
      <div v-else class="learner-empty">
        <strong>{{ copy.insufficientData }}</strong>
        <span>{{ copy.futureErrorTypes }}</span>
      </div>
    </section>

    <section v-else-if="activeTab === 'preferences'" class="learner-panel" aria-labelledby="preferences-title">
      <div class="learner-panel__heading">
        <div>
          <p class="learner-eyebrow">{{ copy.adaptInterface }}</p>
          <h2 id="preferences-title">{{ copy.preferences }}</h2>
        </div>
        <span v-if="preferencesSaved" class="preferences-saved">{{ copy.saved }}</span>
      </div>

      <p v-if="preferencesError" class="preferences-error" role="alert">{{ preferencesError }}</p>

      <div class="preference-block">
        <div>
          <h3>{{ copy.language }}</h3>
          <p>{{ copy.languageHint }}</p>
        </div>
        <div class="locale-choices" role="group" :aria-label="copy.preferredLanguage">
          <button
            v-for="option in localeOptions"
            :key="option.value"
            type="button"
            :class="{ 'is-active': preferredLocale === option.value }"
            :disabled="readOnly || preferencesSaving"
            @click="savePreferences(option.value, preferredTheme)"
          >
            <span aria-hidden="true">{{ option.flag }}</span>{{ option.label }}
          </button>
        </div>
      </div>

      <div class="preference-block">
        <div>
          <h3>{{ copy.appearance }}</h3>
          <p>{{ copy.appearanceHint }}</p>
        </div>
        <div class="theme-choices" role="group" :aria-label="copy.preferredAppearance">
          <button
            type="button"
            :class="{ 'is-active': preferredTheme === 'light' }"
            :disabled="readOnly || preferencesSaving"
            @click="savePreferences(preferredLocale, 'light')"
          >
            <span aria-hidden="true">☀️</span> {{ copy.light }}
          </button>
          <button
            type="button"
            :class="{ 'is-active': preferredTheme === 'dark' }"
            :disabled="readOnly || preferencesSaving"
            @click="savePreferences(preferredLocale, 'dark')"
          >
            <span aria-hidden="true">🌙</span> {{ copy.dark }}
          </button>
        </div>
      </div>
    </section>

    <section v-else class="learner-panel account-panel" aria-labelledby="account-title">
      <div class="learner-panel__heading">
        <div>
          <p class="learner-eyebrow">{{ copy.dataSimply }}</p>
          <h2 id="account-title">{{ copy.account }}</h2>
        </div>
      </div>

      <div class="account-privacy">
        <span aria-hidden="true">◌</span>
        <div>
          <h3>{{ copy.privateAccount }}</h3>
          <p>{{ text('privacy', { username: displayUsername }) }}</p>
        </div>
      </div>

      <p v-if="resultsDeleted" class="account-success" role="status">
        {{ copy.resultsDeleted }}
      </p>

      <form
        v-if="!readOnly"
        id="change-password"
        class="account-password"
        @submit.prevent="changePassword"
      >
        <div>
          <h3>{{ copy.changePassword }}</h3>
          <p id="password-help">{{ copy.passwordHint }}</p>
        </div>
        <div class="account-password__fields">
          <label class="is-current">
            <span>{{ copy.currentPassword }}</span>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              name="current-password"
              autocomplete="current-password"
              maxlength="200"
              required
            >
          </label>
          <label>
            <span>{{ copy.newPassword }}</span>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              name="new-password"
              autocomplete="new-password"
              minlength="10"
              maxlength="200"
              aria-describedby="password-help"
              required
            >
          </label>
          <label>
            <span>{{ copy.confirmPassword }}</span>
            <input
              v-model="passwordForm.confirmation"
              type="password"
              name="new-password-confirmation"
              autocomplete="new-password"
              minlength="10"
              maxlength="200"
              required
            >
          </label>
        </div>
        <p v-if="passwordError" class="preferences-error" role="alert">{{ passwordError }}</p>
        <p v-if="passwordChanged" class="account-success" role="status">
          {{ copy.passwordChanged }}
        </p>
        <button
          type="submit"
          class="account-button account-button--primary"
          :disabled="passwordChanging"
        >
          {{ passwordChanging ? copy.changing : copy.changePasswordButton }}
        </button>
      </form>

      <div v-if="!readOnly" class="account-actions">
        <article>
          <div>
            <h3>{{ copy.deleteResults }}</h3>
            <p>{{ copy.deleteResultsHint }}</p>
          </div>
          <button type="button" class="account-button account-button--warning" @click="openAccountDialog('results')">
            {{ copy.deleteResults }}
          </button>
        </article>
        <article>
          <div>
            <h3>{{ copy.deleteAccount }}</h3>
            <p>{{ text('deleteAccountHint', { username: displayUsername }) }}</p>
          </div>
          <button type="button" class="account-button account-button--danger" @click="openAccountDialog('account')">
            {{ copy.deleteAccount }}
          </button>
        </article>
      </div>
    </section>

    <ClassicExercise
      v-if="reviewOpen && reviewTracking && exercisePresentation === 'classic'"
      :questions="reviewQuestions"
      :exercise-kind="reviewTracking.challenge.exerciseKind"
      :tracking-context="reviewTracking"
      :require-success="reviewRequireSuccess"
      @close="closeReview"
    />
    <ChatExercise
      v-if="reviewOpen && reviewTracking && exercisePresentation === 'chat' && selectedCoach && selectedWork"
      :questions="reviewQuestions"
      :coach="selectedCoach"
      :verbs="challengeVerbs(selectedWork.challenge)"
      :tenses="challengeTenses(selectedWork.challenge)"
      :regenerate-questions="regenerateChatQuestions"
      :tracking-context="reviewTracking"
      :require-success="reviewRequireSuccess"
      @close="closeReview"
    />
    <CoachPicker v-if="coachPickerOpen" @close="coachPickerOpen = false" @select="launchWithCoach" />
    <Teleport to="body">
      <div
        v-if="accountDialog"
        class="account-dialog-backdrop"
        role="presentation"
        @click.self="closeAccountDialog"
      >
        <section
          class="account-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="account-dialog-title"
          aria-describedby="account-dialog-description"
        >
          <button
            class="account-dialog__close"
            type="button"
            :aria-label="copy.close"
            autofocus
            :disabled="accountActionPending"
            @click="closeAccountDialog"
          >
            ×
          </button>
          <span class="account-dialog__icon" aria-hidden="true">!</span>
          <h2 id="account-dialog-title">
            {{ accountDialog === 'results' ? copy.deleteAllResultsQuestion : copy.deleteAccountQuestion }}
          </h2>
          <p id="account-dialog-description">
            {{ accountDialog === 'results'
              ? text('deleteResultsDialog', { username: displayUsername })
              : text('deleteAccountDialog', { username: displayUsername }) }}
          </p>
          <p v-if="accountActionError" class="preferences-error" role="alert">{{ accountActionError }}</p>
          <div class="account-dialog__actions">
            <button type="button" :disabled="accountActionPending" @click="closeAccountDialog">{{ copy.cancel }}</button>
            <button
              type="button"
              class="is-danger"
              :disabled="accountActionPending"
              @click="confirmAccountAction"
            >
              {{ accountActionPending
                ? copy.deleting
                : accountDialog === 'results' ? copy.confirmDeleteResults : copy.confirmDeleteAccount }}
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.learner-space{display:grid;max-width:1060px;margin:0 auto;gap:22px}.learner-space__hero{display:flex;padding:30px 34px;align-items:end;justify-content:space-between;gap:24px;border-radius:24px;color:white;background:linear-gradient(125deg,#624193,#8162b2 62%,#9c78ca);box-shadow:0 18px 42px rgb(74 47 112 / 22%)}.learner-space__hero p,.learner-eyebrow{margin:0 0 5px;font-size:.73rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.learner-space__hero h1{margin:0;font-size:clamp(2rem,5vw,3.8rem);letter-spacing:-.055em}.learner-space__hero>span{max-width:300px;opacity:.86;line-height:1.45}.learner-tabs{display:grid;grid-template-columns:repeat(6,1fr);padding:5px;border:1px solid var(--line);border-radius:16px;background:var(--surface-soft)}.learner-tabs button{min-height:46px;padding:9px 14px;border:0;border-radius:12px;color:var(--muted);background:transparent;font:inherit;font-weight:850;cursor:pointer}.learner-tabs button.is-active{color:white;background:#7052a0;box-shadow:0 7px 18px rgb(75 48 113 / 20%)}.learner-panel{display:grid;min-height:430px;padding:clamp(22px,4vw,38px);border:1px solid var(--line);border-radius:24px;gap:25px;background:var(--surface);box-shadow:var(--shadow)}.learner-panel__heading{display:flex;align-items:center;justify-content:space-between;gap:20px}.learner-panel h2{margin:0;color:var(--brand-dark);font-size:clamp(1.7rem,4vw,2.5rem);letter-spacing:-.04em}.learner-eyebrow{color:#7052a0}.learner-primary-link,.review-button{display:inline-flex;min-height:42px;padding:9px 15px;align-items:center;justify-content:center;border:0;border-radius:999px;color:white;background:#7052a0;text-decoration:none;font:inherit;font-size:.86rem;font-weight:850;cursor:pointer}.challenge-history{position:relative;display:grid;margin:0;padding:0 0 0 42px;gap:18px;list-style:none}.challenge-history::before{position:absolute;top:10px;bottom:10px;left:14px;width:3px;border-radius:99px;background:color-mix(in srgb,#7052a0 30%,var(--line));content:""}.challenge-history>li{position:relative}.challenge-history__dot{position:absolute;z-index:1;top:24px;left:-36px;width:17px;height:17px;border:4px solid var(--surface);border-radius:50%;background:#7052a0;box-shadow:0 0 0 2px #7052a0}.challenge-history>li::before{position:absolute;top:31px;left:-22px;width:22px;height:2px;background:color-mix(in srgb,#7052a0 30%,var(--line));content:""}.challenge-card{display:grid;padding:20px;border:1px solid var(--line);border-radius:18px;gap:13px;background:var(--surface-soft)}.challenge-card__top{display:flex;align-items:start;justify-content:space-between;gap:12px}.challenge-card__top span{color:var(--muted);font-size:.74rem}.challenge-card h3{margin:3px 0 0;color:var(--ink);font-size:1.12rem}.challenge-card__top>strong{display:grid;width:52px;height:52px;place-items:center;color:#9a3b35;border-radius:50%;background:color-mix(in srgb,var(--danger) 12%,var(--surface));font-size:.86rem}.challenge-card__top>strong.is-mastered{color:#24734d;background:color-mix(in srgb,var(--success) 14%,var(--surface))}.challenge-card__bar{height:7px;overflow:hidden;border-radius:99px;background:color-mix(in srgb,var(--danger) 16%,var(--surface))}.challenge-card__bar span{display:block;height:100%;border-radius:inherit;background:var(--success)}.challenge-card>p{margin:0;color:var(--muted);font-size:.86rem;line-height:1.45}.challenge-card .challenge-mastered{color:var(--success);font-weight:750}.review-button{justify-self:start;color:#5a3b86;border:1px solid color-mix(in srgb,#7052a0 35%,var(--line));background:color-mix(in srgb,#7052a0 10%,var(--surface))}.challenge-loader{justify-self:center;padding:10px 17px;border:1px solid color-mix(in srgb,#7052a0 32%,var(--line));border-radius:999px;color:#5a3b86;background:color-mix(in srgb,#7052a0 8%,var(--surface));font:inherit;font-size:.82rem;font-weight:850;cursor:pointer}.challenge-loader:disabled{cursor:progress;opacity:.65}.learner-empty{display:grid;min-height:220px;margin:0;place-content:center;gap:6px;color:var(--muted);text-align:center}.learner-empty strong{color:var(--ink);font-size:1.05rem}.timeline-filters{display:flex;align-items:end;justify-content:space-between;gap:16px}.timeline-filters>div{display:flex;padding:4px;border-radius:12px;background:var(--surface-soft)}.timeline-filters button{padding:8px 12px;border:0;border-radius:9px;color:var(--muted);background:transparent;font:inherit;font-size:.82rem;font-weight:800;cursor:pointer}.timeline-filters button.is-active{color:#5b3e86;background:var(--surface);box-shadow:0 3px 10px rgb(36 50 71 / 10%)}.timeline-filters label{display:grid;gap:5px;color:var(--muted);font-size:.72rem;font-weight:850}.timeline-filters select{min-width:220px;padding:9px 32px 9px 11px;border:1px solid var(--line);border-radius:10px;color:var(--ink);background:var(--surface);font:inherit}.progress-score{display:grid;justify-items:end}.progress-score strong{color:var(--success);font-size:1.8rem;line-height:1}.progress-score span{color:var(--muted);font-size:.72rem}.timeline-scroll{overflow-x:auto;padding:8px 5px 20px}.timeline{position:relative;display:flex;width:max-content;min-width:100%;margin:0;padding:0 10px;gap:14px;list-style:none}.timeline::before{position:absolute;top:45px;right:10px;left:10px;height:3px;background:var(--line);content:""}.timeline li{position:relative;display:grid;width:180px;grid-template-rows:25px 28px auto;justify-items:center}.timeline time{color:var(--muted);font-size:.69rem}.timeline__dot{z-index:1;display:block;width:17px;height:17px;margin-top:4px;border:4px solid var(--surface);border-radius:50%;background:#7052a0;box-shadow:0 0 0 2px #7052a0}.timeline li.is-correct .timeline__dot{background:var(--success);box-shadow:0 0 0 2px var(--success)}.timeline li.is-incorrect .timeline__dot{background:var(--danger);box-shadow:0 0 0 2px var(--danger)}.timeline article{display:grid;width:100%;min-height:122px;padding:12px;border:1px solid var(--line);border-radius:13px;gap:3px;background:var(--surface-soft);text-align:left}.timeline article strong{color:var(--ink)}.timeline article span,.timeline article small{color:var(--muted);font-size:.73rem;line-height:1.3}.timeline article b{align-self:end;justify-self:start;color:var(--success);font-size:.7rem}.timeline li.is-incorrect article b{color:var(--danger)}.preference-block{display:grid;padding:22px;border:1px solid var(--line);border-radius:18px;gap:18px;background:var(--surface-soft)}.preference-block h3{margin:0;color:var(--ink);font-size:1.15rem}.preference-block p{margin:5px 0 0;color:var(--muted)}.locale-choices,.theme-choices{display:flex;flex-wrap:wrap;gap:9px}.locale-choices button,.theme-choices button{display:inline-flex;min-height:43px;padding:9px 13px;align-items:center;gap:7px;border:1px solid var(--line);border-radius:11px;color:var(--ink);background:var(--surface);font:inherit;font-size:.84rem;font-weight:750;cursor:pointer}.locale-choices button.is-active,.theme-choices button.is-active{color:#5a3b86;border-color:#8c6cba;background:color-mix(in srgb,#7052a0 10%,var(--surface));box-shadow:inset 0 0 0 1px #8c6cba}.preferences-saved{padding:6px 10px;border-radius:99px;color:var(--success);background:color-mix(in srgb,var(--success) 12%,var(--surface));font-size:.78rem;font-weight:800}.preferences-error{margin:0;padding:10px 12px;border-radius:10px;color:var(--danger);background:color-mix(in srgb,var(--danger) 10%,transparent)}@media(max-width:720px){.learner-space__hero,.learner-panel__heading,.timeline-filters{align-items:stretch;flex-direction:column}.learner-space__hero>span{max-width:none}.learner-tabs{grid-template-columns:1fr}.progress-score{justify-items:start}.timeline-filters label,.timeline-filters select{width:100%}.learner-primary-link{align-self:start}}@media(max-width:480px){.learner-space__hero{padding:24px 20px}.learner-panel{padding:20px 15px}.challenge-history{padding-left:32px}.challenge-history::before{left:10px}.challenge-history__dot{left:-28px}.challenge-history>li::before{left:-14px;width:14px}.locale-choices button{flex:1 1 130px}.theme-choices button{flex:1}}

.learner-space__hero {
  padding: 14px 20px;
  align-items: center;
  gap: 16px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgb(74 47 112 / 16%);
}

.learner-space__hero h1 {
  font-size: clamp(1.15rem, 2.4vw, 1.55rem);
  letter-spacing: -.02em;
}

.learner-space__hero-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.learner-space__hero-actions button {
  min-height: 34px;
  padding: 7px 12px;
  border: 1px solid rgb(255 255 255 / 48%);
  border-radius: 999px;
  color: white;
  background: rgb(255 255 255 / 9%);
  font: inherit;
  font-size: .78rem;
  font-weight: 800;
  cursor: pointer;
}

.learner-space__hero-actions button:hover {
  background: rgb(255 255 255 / 17%);
}

.learner-space__hero-actions button.is-active {
  color: #5b3e86;
  border-color: white;
  background: white;
}

.learner-section-intro {
  display: grid;
  padding: 15px 17px;
  border: 1px solid color-mix(in srgb, #7052a0 24%, var(--line));
  border-radius: 15px;
  gap: 4px;
  background: color-mix(in srgb, #7052a0 6%, var(--surface-soft));
}

.learner-section-intro strong {
  color: var(--learner-purple-heading);
  font-size: .86rem;
}

.learner-section-intro p {
  max-width: 820px;
  margin: 0;
  color: var(--muted);
  font-size: .82rem;
  line-height: 1.5;
}

.learner-tabs button.learner-tabs__primary {
  display: inline-flex;
  border: 1px solid color-mix(in srgb, #7052a0 48%, var(--line));
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: var(--learner-purple-copy);
  background: color-mix(in srgb, #7052a0 11%, var(--surface));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, #7052a0 7%, transparent);
}

.learner-tabs button.learner-tabs__primary:hover {
  border-color: #7052a0;
  background: color-mix(in srgb, #7052a0 17%, var(--surface));
}

.learner-tabs button.learner-tabs__primary.is-active {
  color: white;
  border-color: #7052a0;
  background: #7052a0;
  box-shadow: 0 7px 18px rgb(75 48 113 / 20%);
}

.learner-tabs__primary > span {
  font-size: .9rem;
}

@media (max-width: 720px) {
  .learner-space__hero {
    padding: 12px 16px;
    align-items: center;
    flex-direction: row;
    gap: 5px;
  }

  .learner-space__hero-actions {
    margin-left: auto;
    gap: 5px;
  }

  .learner-space__hero-actions button {
    min-height: 32px;
    padding: 6px 9px;
    font-size: .7rem;
  }

  .learner-section-intro {
    padding: 13px 14px;
  }
}

.challenge-work {
  position: relative;
  display: grid;
  overflow: visible;
  gap: 8px;
}

.challenge-analysis {
  display: grid;
  padding-top: 12px;
  border-top: 1px solid var(--line);
  gap: 8px;
}

.challenge-analysis > strong {
  color: var(--ink);
  font-size: .82rem;
}

.challenge-analysis button {
  justify-self: start;
  min-height: 38px;
  padding: 8px 14px;
  border: 1px solid color-mix(in srgb, #7052a0 38%, var(--line));
  border-radius: 999px;
  color: var(--learner-purple-copy);
  background: color-mix(in srgb, #7052a0 9%, var(--surface));
  font: inherit;
  font-size: .8rem;
  font-weight: 850;
  cursor: pointer;
  transition: color 150ms ease, border-color 150ms ease, background-color 150ms ease, transform 150ms ease;
}

.challenge-analysis button:hover {
  color: #43276f;
  border-color: #8060ad;
  background: color-mix(in srgb, #7052a0 18%, var(--surface));
  transform: translateY(-1px);
}

.learner-space--dark .challenge-analysis button {
  color: #f1eaff;
  border-color: #cdb9f6;
  background: color-mix(in srgb, #9c78ca 28%, var(--surface));
}

.learner-space--dark .challenge-analysis button:hover {
  color: white;
  border-color: #f0e8ff;
  background: color-mix(in srgb, #c3a8ed 48%, var(--surface));
}

.review-overview {
  display: grid;
  justify-items: end;
  color: var(--muted);
}

.review-overview strong {
  color: var(--learner-purple-copy);
  font-size: 1.8rem;
  line-height: 1;
}

.review-overview span {
  font-size: .76rem;
}

.review-insight {
  display: grid;
  padding: 20px 22px;
  border: 1px solid color-mix(in srgb, #7052a0 34%, var(--line));
  border-radius: 18px;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 18px;
  color: var(--ink);
  background: color-mix(in srgb, #7052a0 9%, var(--surface));
}

.review-insight > span {
  display: grid;
  width: 78px;
  height: 78px;
  place-items: center;
  border-radius: 50%;
  color: white;
  background: #7052a0;
  font-size: 1.3rem;
  font-weight: 900;
}

.review-insight strong {
  color: var(--learner-purple-copy);
  font-size: 1.05rem;
}

.review-insight p {
  margin: 5px 0;
  font-size: 1.05rem;
  line-height: 1.45;
}

.review-insight small {
  color: var(--muted);
}

.error-patterns {
  display: grid;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 19px;
  gap: 16px;
  background: var(--surface-soft);
}

.error-patterns > header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
}

.error-patterns h3 {
  margin: 0;
  color: var(--ink);
  font-size: 1.35rem;
}

.error-patterns > header > span,
.error-pattern header small,
.error-pattern > p {
  color: var(--muted);
  font-size: .75rem;
}

.error-patterns__dominant {
  display: flex;
  padding: 13px 15px;
  align-items: center;
  gap: 12px;
  border-radius: 13px;
  color: var(--ink);
  background: color-mix(in srgb, #7052a0 11%, var(--surface));
}

.error-patterns__dominant > strong {
  color: var(--learner-purple-copy);
  font-size: 1.35rem;
}

.error-patterns__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}

.error-pattern {
  display: grid;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 15px;
  align-content: start;
  gap: 9px;
  background: var(--surface);
}

.error-pattern > header {
  position: relative;
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.error-pattern h4 {
  width: fit-content;
  margin: 0;
  padding: 6px 10px;
  border: 1px solid color-mix(in srgb, #7052a0 32%, var(--line));
  border-radius: 999px;
  color: var(--learner-purple-copy);
  background: color-mix(in srgb, #7052a0 10%, var(--surface-soft));
  font-size: .82rem;
  line-height: 1.2;
}

.error-pattern__identity {
  display: grid;
  flex: 1;
  padding-inline: 54px;
  justify-items: center;
  gap: 7px;
  text-align: center;
}

.error-pattern header > strong {
  position: absolute;
  top: 0;
  right: 0;
  color: var(--danger);
  font-size: 1.25rem;
}

.error-pattern__meter {
  height: 6px;
  overflow: hidden;
  border-radius: 99px;
  background: color-mix(in srgb, var(--danger) 12%, var(--surface-soft));
}

.error-pattern__meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--danger);
}

.error-pattern > p {
  margin: 0;
  line-height: 1.4;
}

.error-pattern__trend {
  display: block;
  color: var(--muted);
  font-size: .76rem;
}

.error-pattern.is-improving .error-pattern__trend {
  color: var(--success);
}

.error-pattern.is-worsening .error-pattern__trend {
  color: var(--danger);
}

.error-pattern .error-pattern__advice {
  display: flex;
  width: fit-content;
  padding: 8px 11px;
  border: 1px solid color-mix(in srgb, var(--success) 30%, var(--line));
  border-radius: 999px;
  align-items: baseline;
  gap: 5px;
  color: var(--ink);
  background: color-mix(in srgb, var(--success) 9%, var(--surface-soft));
}

.error-pattern__advice strong {
  color: var(--success);
  white-space: nowrap;
}

.error-pattern__chart {
  margin-top: 4px;
}

.error-pattern__chart-state {
  padding: 15px;
  border: 1px dashed var(--line);
  border-radius: 13px;
  text-align: center;
}

.error-pattern details {
  padding-top: 8px;
  border-top: 1px solid var(--line);
}

.error-pattern summary {
  color: var(--learner-purple-copy);
  cursor: pointer;
  font-size: .76rem;
  font-weight: 850;
}

.error-pattern ul {
  display: grid;
  margin: 10px 0 0;
  padding: 0;
  gap: 9px;
  list-style: none;
}

.error-pattern li {
  display: grid;
  padding: 9px 10px;
  border-radius: 9px;
  gap: 2px;
  background: var(--surface-soft);
  font-size: .74rem;
}

.error-pattern li span {
  color: var(--muted);
}

.error-pattern li del {
  color: var(--danger);
}

.error-pattern li strong {
  color: var(--success);
}

.error-patterns__state {
  display: grid;
  min-height: 90px;
  margin: 0;
  place-content: center;
  gap: 4px;
  color: var(--muted);
  text-align: center;
}

.error-patterns__state strong {
  color: var(--ink);
}

.review-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.review-toolbar > strong {
  color: var(--ink);
}

.review-toolbar > div {
  display: flex;
  padding: 4px;
  border-radius: 13px;
  gap: 3px;
  background: var(--surface-soft);
}

.review-toolbar button {
  min-height: 38px;
  padding: 8px 13px;
  border: 0;
  border-radius: 10px;
  color: var(--muted);
  background: transparent;
  font: inherit;
  font-size: .8rem;
  font-weight: 850;
  cursor: pointer;
}

.review-toolbar button.is-active {
  color: var(--learner-purple-copy);
  background: var(--surface);
  box-shadow: 0 4px 12px rgb(36 30 48 / 11%);
}

.review-forms {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.review-form {
  display: grid;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 17px;
  align-content: start;
  gap: 14px;
  background: var(--surface-soft);
}

.review-form header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.review-form h3 {
  margin: 0;
  color: var(--ink);
  font-size: 1.2rem;
}

.review-form header p {
  margin: 5px 0 0;
  color: var(--muted);
  font-size: .78rem;
}

.review-form header > strong {
  flex: 0 0 auto;
  padding: 6px 9px;
  border-radius: 999px;
  color: var(--danger);
  background: color-mix(in srgb, var(--danger) 11%, var(--surface));
  font-size: .72rem;
}

.review-form__answer {
  display: grid;
  padding: 12px 14px;
  border-left: 4px solid var(--success);
  border-radius: 10px;
  gap: 4px;
  background: color-mix(in srgb, var(--success) 10%, var(--surface));
}

.review-form__answer span,
.review-form__mistakes span {
  color: var(--muted);
  font-size: .72rem;
}

.review-form__answer strong {
  color: var(--ink);
  line-height: 1.4;
}

.review-form__mistakes {
  margin: 0;
  color: var(--muted);
  font-size: .82rem;
  line-height: 1.45;
}

.review-form__mistakes span {
  display: block;
  margin-bottom: 2px;
}

.challenge-card__description {
  display: grid;
  justify-items: start;
  gap: 4px;
}

.challenge-card__description p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--muted);
  font-size: .82rem;
  line-height: 1.45;
  white-space: pre-line;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.challenge-card__description p.is-expanded {
  display: block;
  overflow: visible;
  -webkit-line-clamp: unset;
}

.challenge-card__description button {
  padding: 0;
  border: 0;
  color: var(--learner-purple-copy);
  background: transparent;
  font: inherit;
  font-size: .76rem;
  font-weight: 850;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.challenge-card__description button:hover {
  color: color-mix(in srgb, var(--learner-purple-copy) 72%, white);
}

.learner-space {
  --learner-purple-copy: #5a3b86;
  --learner-purple-heading: #7052a0;
}

.learner-eyebrow {
  color: var(--learner-purple-heading);
}

.review-button,
.challenge-loader,
.timeline-filters button.is-active,
.locale-choices button.is-active,
.theme-choices button.is-active {
  color: var(--learner-purple-copy);
}

.learner-space.learner-space--dark {
  --learner-purple-copy: #cdb9f6;
  --learner-purple-heading: #cdb9f6;
}

.review-button,
.challenge-loader {
  transition:
    color 150ms ease,
    border-color 150ms ease,
    background-color 150ms ease,
    box-shadow 150ms ease,
    transform 150ms ease;
}

.review-button:hover:not(:disabled),
.challenge-loader:hover:not(:disabled) {
  color: #43276f;
  border-color: #8060ad;
  background: color-mix(in srgb, #7052a0 18%, var(--surface));
  box-shadow: 0 6px 16px rgb(69 43 105 / 16%);
  transform: translateY(-1px);
}

.learner-space--dark .review-button,
.learner-space--dark .challenge-loader {
  color: #f1eaff;
  border-color: #cdb9f6;
  background: color-mix(in srgb, #9c78ca 34%, var(--surface));
  box-shadow: 0 5px 14px rgb(0 0 0 / 20%);
}

.learner-space--dark .review-button:hover:not(:disabled),
.learner-space--dark .challenge-loader:hover:not(:disabled) {
  color: #fff;
  border-color: #f0e8ff;
  background: color-mix(in srgb, #c3a8ed 54%, var(--surface));
  box-shadow: 0 8px 22px rgb(0 0 0 / 34%);
}

.learner-space--dark .challenge-work .review-button:disabled {
  color: #bca9e6;
  background: color-mix(in srgb, #9c78ca 22%, var(--surface));
  opacity: .76;
}

.challenge-work > strong {
  color: var(--ink);
  font-size: .82rem;
}

.challenge-work > div {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.challenge-work .review-button:disabled {
  cursor: not-allowed;
  opacity: .48;
}

.challenge-work > .challenge-presentation-menu {
  position: absolute;
  z-index: 1100;
  top: calc(100% + 12px);
  display: grid;
  width: min(360px, calc(100vw - 20px));
  padding: 7px;
  border: 1px solid color-mix(in srgb, #7052a0 28%, var(--line));
  border-radius: 15px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  background: var(--surface);
  box-shadow: 0 14px 30px rgb(45 35 62 / 14%);
}

.challenge-presentation-menu::before {
  position: absolute;
  top: -7px;
  left: 50%;
  width: 13px;
  height: 13px;
  border-top: 1px solid color-mix(in srgb, #7052a0 28%, var(--line));
  border-left: 1px solid color-mix(in srgb, #7052a0 28%, var(--line));
  background: var(--surface);
  content: "";
  transform: translateX(-50%) rotate(45deg);
}

.challenge-presentation-menu .action-button {
  width: 100%;
  min-height: 52px;
  padding: 7px 9px;
  border-radius: 12px;
  gap: 7px;
  cursor: pointer;
}

.challenge-presentation-menu .action-button__icon {
  width: 34px;
  height: 34px;
  flex-basis: 34px;
  border-radius: 10px;
}

.challenge-presentation-menu .action-button strong {
  font-size: .84rem;
  line-height: 1.15;
}

.challenge-history__day-list > li.is-work-menu-open {
  z-index: 1000;
}

.learner-panel:has(.is-work-menu-open),
.challenge-history,
.challenge-history__day,
.challenge-history__day-list,
.challenge-history__day-list > li,
.challenge-card {
  overflow: visible;
}

.learner-panel:has(.is-work-menu-open) {
  position: relative;
  z-index: 900;
}

.challenge-history {
  --timeline-gutter: 38px;
  display: grid;
  margin: 0;
  padding: 0;
  gap: calc(var(--timeline-gutter) * 2.5);
  list-style: none;
}

.challenge-history > .challenge-history__day::before {
  content: none;
}

.challenge-history__day {
  position: relative;
  display: grid;
  gap: 26px;
}

.challenge-history__date {
  position: relative;
  z-index: 2;
  justify-self: center;
  padding: 10px 18px;
  border: 1px solid color-mix(in srgb, #cdb9f6 58%, #7052a0);
  border-radius: 999px;
  color: white;
  background: #7052a0;
  box-shadow: 0 7px 18px rgb(64 39 98 / 22%);
  font-size: clamp(1.15rem, 2.2vw, 1.65rem);
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
  text-transform: lowercase;
}

.learner-space :is(
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  strong,
  b,
  button,
  label,
  .learner-primary-link,
  .challenge-history__date,
  .challenge-mastered,
  .preferences-saved,
  .review-insight > span
) {
  letter-spacing: .035em;
}

.learner-space :is(.learner-space__hero p, .learner-eyebrow) {
  letter-spacing: .14em;
}

.challenge-history__day-list {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.challenge-history__day-list > li {
  position: relative;
}

@media (min-width: 721px) {
  .challenge-history {
    padding-bottom: 40px;
  }

  .challenge-history::before {
    top: 20px;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
  }

  .challenge-history__day-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: calc(var(--timeline-gutter) * 2);
    row-gap: var(--timeline-gutter);
  }

  .challenge-history__day-list > li.is-left {
    grid-column: 1;
  }

  .challenge-history__day-list > li.is-right {
    grid-column: 2;
    margin-top: clamp(80px, 18%, 140px);
  }

  .challenge-history__day-list > li.is-left .challenge-history__dot {
    right: calc(-1 * var(--timeline-gutter) - 9px);
    left: auto;
  }

  .challenge-history__day-list > li.is-right .challenge-history__dot {
    right: auto;
    left: calc(-1 * var(--timeline-gutter) - 9px);
  }

  .challenge-history__day-list > li.is-left::before {
    position: absolute;
    top: 31px;
    right: calc(-1 * var(--timeline-gutter));
    left: auto;
    width: var(--timeline-gutter);
    height: 2px;
    background: color-mix(in srgb,#7052a0 30%,var(--line));
    content: "";
  }

  .challenge-history__day-list > li.is-right::before {
    position: absolute;
    top: 31px;
    right: auto;
    left: calc(-1 * var(--timeline-gutter));
    width: var(--timeline-gutter);
    height: 2px;
    background: color-mix(in srgb,#7052a0 30%,var(--line));
    content: "";
  }
}

@media (max-width: 720px) {
  .review-overview {
    justify-items: start;
  }

  .review-insight {
    grid-template-columns: 1fr;
  }

  .review-insight > span {
    width: 66px;
    height: 66px;
  }

  .review-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .review-toolbar > div {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .review-forms {
    grid-template-columns: 1fr;
  }

  .error-patterns__grid {
    grid-template-columns: 1fr;
  }

  .error-patterns > header {
    align-items: start;
    flex-direction: column;
  }

  .challenge-history {
    padding: 0;
    gap: calc(var(--timeline-gutter) * 2);
  }

  .challenge-history::before {
    top: 20px;
    bottom: 20px;
    left: 14px;
  }

  .challenge-history__date {
    justify-self: start;
    margin-left: 42px;
    padding: 9px 14px;
    text-align: left;
  }

  .challenge-history__day-list {
    grid-column: 1;
    padding-left: 42px;
    gap: var(--timeline-gutter);
  }

  .challenge-history__day-list > li,
  .challenge-history__day-list > li.is-left,
  .challenge-history__day-list > li.is-right {
    grid-column: 1;
    margin-top: 0;
  }

  .challenge-history__day-list > li .challenge-history__dot {
    right: auto;
    left: -36px;
  }

  .challenge-history__day-list > li::before {
    position: absolute;
    top: 31px;
    left: -22px;
    width: 22px;
    height: 2px;
    background: color-mix(in srgb,#7052a0 30%,var(--line));
    content: "";
  }

  .challenge-work > .challenge-presentation-menu {
    width: min(340px, calc(100vw - 20px));
  }
}

.learner-tabs {
  position: sticky;
  z-index: 80;
  top: var(--learner-tabs-sticky-top, 68px);
  grid-template-columns: repeat(3, minmax(0, 1fr));
  box-shadow: 0 10px 24px rgb(20 28 38 / 12%);
}

.challenge-training-list button:focus-visible {
  outline: 3px solid color-mix(in srgb, #7052a0 42%, transparent);
  outline-offset: 3px;
}

.challenge-training-layout {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(220px, .36fr) minmax(0, 1fr);
  align-items: start;
  gap: 18px;
}

.challenge-training-list {
  display: grid;
  max-height: 610px;
  overflow-y: auto;
  padding: 5px;
  border: 1px solid var(--line);
  border-radius: 17px;
  gap: 5px;
  background: var(--surface-soft);
  scrollbar-width: thin;
}

.challenge-training-list button {
  display: grid;
  width: 100%;
  padding: 13px 14px;
  border: 1px solid transparent;
  border-radius: 12px;
  gap: 4px;
  color: var(--ink);
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.challenge-training-list button:hover {
  background: color-mix(in srgb, #7052a0 7%, var(--surface));
}

.challenge-training-list button.is-active {
  border-color: color-mix(in srgb, #7052a0 38%, var(--line));
  background: var(--surface);
  box-shadow: 0 6px 16px rgb(30 31 42 / 9%);
}

.challenge-training-list button > span {
  overflow: hidden;
  font-size: .85rem;
  font-weight: 850;
  line-height: 1.3;
  text-overflow: ellipsis;
}

.challenge-training-list button > small {
  color: var(--muted);
  font-size: .69rem;
}

.challenge-training-list button > b {
  color: var(--success);
  font-size: .68rem;
}

.challenge-training-analysis {
  display: grid;
  min-width: 0;
  min-height: 360px;
  padding: clamp(17px, 2.5vw, 24px);
  border: 1px solid var(--line);
  border-radius: 19px;
  gap: 15px;
  background: var(--surface-soft);
}

.challenge-training-analysis > header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.challenge-training-analysis > header p {
  margin: 0 0 3px;
  color: var(--learner-purple-heading);
  font-size: .69rem;
  font-weight: 900;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.challenge-training-analysis > header h3 {
  margin: 0;
  color: var(--ink);
  font-size: clamp(1.05rem, 2.2vw, 1.35rem);
}

.challenge-training-chart {
  min-width: 0;
  padding: 13px 13px 10px;
  border: 1px solid var(--line);
  border-radius: 15px;
  background: var(--surface);
}

.challenge-training-chart__plot {
  position: relative;
}

.challenge-training-chart svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.challenge-training-chart__grid line {
  stroke: color-mix(in srgb, var(--line) 78%, transparent);
  stroke-width: 1;
}

.challenge-training-chart polyline {
  fill: none;
  stroke: url("#training-success-gradient");
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 4;
}

.challenge-training-chart circle {
  fill: var(--surface);
  stroke-width: 3;
  cursor: pointer;
  transition: filter 150ms ease, r 150ms ease, stroke-width 150ms ease;
}

.challenge-training-chart circle:hover,
.challenge-training-chart circle:focus,
.challenge-training-chart circle.is-active {
  outline: none;
  stroke-width: 4;
  filter: drop-shadow(0 3px 4px rgb(20 26 31 / 30%));
}

.challenge-training-chart__point-count {
  fill: var(--ink);
  font: 400 9px/1 system-ui, sans-serif;
  letter-spacing: .12em;
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
}

.challenge-training-chart circle:focus-visible {
  filter: drop-shadow(0 0 5px color-mix(in srgb, #7052a0 72%, transparent));
}

.challenge-training-chart__tooltip {
  position: absolute;
  z-index: 5;
  display: grid;
  width: min(230px, 52%);
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, #7052a0 32%, var(--line));
  border-radius: 11px;
  gap: 2px;
  color: var(--ink);
  background: var(--surface);
  box-shadow: 0 10px 25px rgb(19 22 31 / 22%);
  pointer-events: none;
  transform: translate(-50%, calc(-100% - 12px));
}

.challenge-training-chart__tooltip strong {
  color: var(--success);
  font-size: .8rem;
}

.challenge-training-chart__tooltip span,
.challenge-training-chart__tooltip small {
  color: var(--muted);
  font-size: .67rem;
  line-height: 1.35;
}

.challenge-training-chart__tooltip b {
  margin-top: 3px;
  color: var(--learner-purple-copy);
  font-size: .65rem;
}

.challenge-training-chart__rate-axis,
.challenge-training-chart__date-axis {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.challenge-training-chart__rate-axis span {
  position: absolute;
  left: 0;
  font: 400 11px system-ui, sans-serif !important;
  transform: translateY(-50%);
}

.challenge-training-chart__rate-axis .is-high {
  top: 8.421%;
  color: #3aa66f !important;
}

.challenge-training-chart__rate-axis .is-middle {
  top: 45.263%;
  color: #d6a33e !important;
}

.challenge-training-chart__rate-axis .is-low {
  top: 82.105%;
  color: #ef6760 !important;
}

.challenge-training-chart__date-axis {
  right: 2.5%;
  bottom: 0;
  left: 6.5625%;
  top: auto;
  display: flex;
  align-items: end;
  justify-content: space-between;
}

.challenge-training-chart__date-axis span {
  color: #fff !important;
  font: 400 10px system-ui, sans-serif !important;
}

.challenge-training-chart footer {
  display: flex;
  padding-top: 9px;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: .68rem;
}

.challenge-training-achievement {
  display: grid;
  grid-template-columns: minmax(260px, .95fr) minmax(0, 1.55fr);
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface-soft);
}

.challenge-training-achievement > div {
  display: flex;
  min-height: 92px;
  padding: 16px 18px;
  align-items: center;
  gap: 14px;
}

.challenge-training-achievement > div:first-child {
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  border-right: 1px solid var(--line);
}

.challenge-training-achievement > div:first-child span {
  color: var(--muted);
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .05em;
  text-transform: uppercase;
}

.challenge-training-achievement > div:first-child strong {
  display: grid;
  color: var(--learner-purple-copy);
  gap: 9px;
  font-size: 1.35rem;
  line-height: 1.2;
}

.challenge-training-achievement__rate {
  white-space: nowrap;
}

.challenge-training-achievement > div:first-child strong small {
  display: block;
  color: inherit;
  font-size: .78rem;
  font-weight: 800;
}

.challenge-training-achievement__check {
  display: grid;
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  place-items: center;
  border: 3px solid color-mix(in srgb, var(--success) 36%, var(--line));
  border-radius: 50%;
  color: color-mix(in srgb, var(--success) 34%, var(--muted));
  background: color-mix(in srgb, var(--success) 6%, var(--surface));
  font-size: 2.15rem;
  font-weight: 900;
  line-height: 1;
  opacity: .52;
  filter: grayscale(.45);
}

.challenge-training-achievement__complete p {
  display: grid;
  margin: 0;
  gap: 3px;
}

.challenge-training-achievement__complete p strong {
  color: var(--ink);
  line-height: 1.25;
}

.challenge-training-achievement__complete p span {
  color: var(--muted);
  font-size: .78rem;
}

.challenge-training-achievement__complete.is-achieved {
  background: color-mix(in srgb, var(--success) 10%, var(--surface));
}

.challenge-training-achievement__complete.is-achieved .challenge-training-achievement__check {
  border-color: var(--success);
  color: white;
  background: var(--success);
  box-shadow: 0 6px 18px color-mix(in srgb, var(--success) 32%, transparent);
  opacity: 1;
  filter: none;
}

.challenge-training-achievement__complete.is-achieved p strong {
  color: var(--success);
}

.challenge-training-all-work {
  width: 100%;
}

.challenge-training-all-work__button,
.challenge-training-session__work > button {
  min-height: 42px;
  padding: 9px 16px;
  border: 1px solid color-mix(in srgb, #7052a0 42%, var(--line));
  border-radius: 12px;
  color: var(--learner-purple-copy);
  background: color-mix(in srgb, #7052a0 10%, var(--surface));
  font: inherit;
  font-size: .78rem;
  font-weight: 850;
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease, transform 150ms ease;
}

.challenge-training-all-work__button {
  width: 100%;
  min-height: 48px;
  font-size: .84rem;
}

.challenge-training-session__work {
  justify-items: center;
}

.challenge-training-session__work > button {
  justify-self: center;
}

.challenge-training-all-work__button:hover:not(:disabled),
.challenge-training-session__work > button:hover:not(:disabled) {
  border-color: #7052a0;
  background: color-mix(in srgb, #7052a0 18%, var(--surface));
  transform: translateY(-1px);
}

.challenge-training-all-work__button:focus-visible,
.challenge-training-session__work > button:focus-visible {
  outline: 3px solid color-mix(in srgb, #7052a0 38%, transparent);
  outline-offset: 3px;
}

.challenge-training-all-work__button:disabled,
.challenge-training-session__work > button:disabled {
  cursor: not-allowed;
  opacity: .5;
}

.challenge-training-sessions {
  display: grid;
  margin-top: 5px;
  gap: 12px;
}

.challenge-training-sessions > header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 15px;
}

.challenge-training-sessions > header p {
  margin: 0 0 2px;
  color: var(--muted);
  font-size: .67rem;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.challenge-training-sessions > header h4 {
  margin: 0;
  color: var(--ink);
  font-size: 1.05rem;
}

.challenge-training-sessions > header > span {
  color: var(--muted);
  font-size: .72rem;
}

.challenge-training-sessions__list {
  display: grid;
  gap: 10px;
}

.challenge-training-sessions__list > article {
  display: grid;
  scroll-margin-top: calc(var(--learner-tabs-sticky-top, 68px) + 82px);
  padding: 15px;
  border: 1px solid var(--line);
  border-radius: 14px;
  gap: 12px;
  background: var(--surface);
}

.challenge-training-sessions__list > article:focus {
  outline: none;
}

.challenge-training-sessions__list > article:focus-visible {
  border-color: #8060ad;
  box-shadow: 0 0 0 4px color-mix(in srgb, #7052a0 18%, transparent);
}

.challenge-training-sessions__list > article > header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.challenge-training-sessions__list > article > header > div {
  display: grid;
  gap: 2px;
}

.challenge-training-sessions__list h5 {
  margin: 0 0 3px;
  color: var(--ink);
  font-size: .9rem;
  line-height: 1.35;
}

.challenge-training-sessions__list time {
  color: var(--ink);
  font-size: .79rem;
  font-weight: 850;
}

.challenge-training-sessions__list > article > header span {
  color: var(--muted);
  font-size: .68rem;
}

.challenge-training-sessions__list > article > header strong {
  font-size: 1.08rem;
}

.challenge-training-sessions__list ol {
  display: grid;
  margin: 0;
  padding: 0;
  gap: 7px;
  list-style: none;
}

.challenge-training-sessions__list li {
  display: grid;
  padding: 10px 11px;
  border-left: 3px solid var(--danger);
  border-radius: 8px;
  gap: 5px;
  background: color-mix(in srgb, var(--danger) 7%, var(--surface-soft));
}

.challenge-training-sessions__list li > span {
  color: var(--muted);
  font-size: .66rem;
}

.challenge-training-sessions__list li > div {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 7px;
  font-size: .78rem;
}

.challenge-training-error__answer {
  color: var(--danger);
}

.challenge-training-error__explanation {
  margin: 2px 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  color: var(--learner-purple-copy);
  background: color-mix(in srgb, #7052a0 9%, var(--surface));
  font-size: .72rem;
  line-height: 1.45;
}

.challenge-training-sessions__list li strong {
  color: var(--success);
}

.challenge-training-session__perfect {
  margin: 0;
  padding: 9px 11px;
  border-radius: 9px;
  color: var(--success);
  background: color-mix(in srgb, var(--success) 9%, var(--surface-soft));
  font-size: .75rem;
  font-weight: 750;
}

.challenge-training-state {
  display: grid;
  min-height: 260px;
  place-content: center;
  color: var(--muted);
  text-align: center;
}

.progress-explanation {
  position: relative;
  align-self: start;
}

.progress-explanation__button {
  display: grid;
  width: 42px;
  height: 42px;
  padding: 0;
  place-items: center;
  border: 1px solid color-mix(in srgb, #7052a0 38%, var(--line));
  border-radius: 50%;
  color: var(--learner-purple-copy);
  background: color-mix(in srgb, #7052a0 9%, var(--surface));
  font: inherit;
  cursor: pointer;
  transition: transform 150ms ease, border-color 150ms ease, background-color 150ms ease;
}

.progress-explanation__button span {
  font-family: Georgia, serif;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1;
}

.progress-explanation__button:hover,
.progress-explanation__button[aria-expanded="true"] {
  border-color: #7052a0;
  background: color-mix(in srgb, #7052a0 17%, var(--surface));
  transform: translateY(-1px);
}

.progress-explanation__button:focus-visible {
  outline: 3px solid color-mix(in srgb, #7052a0 42%, transparent);
  outline-offset: 3px;
}

.progress-explanation__tooltip {
  position: absolute;
  z-index: 20;
  top: calc(100% + 10px);
  right: 0;
  width: min(410px, calc(100vw - 48px));
  padding: 16px 18px;
  border: 1px solid color-mix(in srgb, #7052a0 34%, var(--line));
  border-radius: 15px;
  color: var(--ink);
  background: var(--surface);
  box-shadow: 0 16px 40px rgb(22 24 35 / 20%);
}

.progress-explanation__tooltip::before {
  position: absolute;
  top: -6px;
  right: 15px;
  width: 11px;
  height: 11px;
  border-top: 1px solid color-mix(in srgb, #7052a0 34%, var(--line));
  border-left: 1px solid color-mix(in srgb, #7052a0 34%, var(--line));
  background: var(--surface);
  content: "";
  transform: rotate(45deg);
}

.progress-explanation__tooltip p {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: .84rem;
  line-height: 1.55;
}

.error-progress-list {
  display: grid;
  gap: 18px;
}

.error-progress-card {
  display: grid;
  scroll-margin-top: calc(var(--learner-tabs-sticky-top, 68px) + 82px);
  padding: clamp(18px, 3vw, 26px);
  border: 1px solid var(--line);
  border-radius: 20px;
  gap: 17px;
  background: var(--surface-soft);
}

.error-progress-card:focus {
  outline: none;
}

.error-progress-card:focus-visible {
  border-color: #8060ad;
  box-shadow: 0 0 0 4px color-mix(in srgb, #7052a0 18%, transparent);
}

.error-progress-card.is-stale {
  border-style: dashed;
}

.error-progress-card__heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 20px;
}

.error-progress-card__heading > div:first-child > span {
  color: var(--learner-purple-heading);
  font-size: .7rem;
  font-weight: 900;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.error-progress-card h3 {
  margin: 4px 0 0;
  color: var(--ink);
  font-size: clamp(1.15rem, 2.5vw, 1.45rem);
}

.error-progress-card__heading p {
  max-width: 680px;
  margin: 7px 0 0;
  color: var(--muted);
  font-size: .83rem;
  line-height: 1.5;
}

.error-progress-card__rate {
  display: grid;
  min-width: 92px;
  padding: 12px 14px;
  border-radius: 15px;
  justify-items: center;
  color: var(--danger);
  background: color-mix(in srgb, var(--danger) 10%, var(--surface));
}

.error-progress-card__rate strong {
  font-size: 1.55rem;
  line-height: 1;
}

.error-progress-card__rate span {
  margin-top: 4px;
  color: var(--muted);
  font-size: .68rem;
}

.error-progress-card.is-successes .error-progress-card__rate {
  color: var(--success);
  background: color-mix(in srgb, var(--success) 12%, var(--surface));
}

.error-progress-card__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.error-progress-card__status strong {
  color: var(--muted);
  font-size: .8rem;
}

.error-progress-card.is-improving .error-progress-card__status strong {
  color: var(--success);
}

.error-progress-card.is-worsening .error-progress-card__status strong {
  color: var(--danger);
}

.error-progress-card__status > span {
  padding: 5px 9px;
  border-radius: 999px;
  color: var(--muted);
  background: var(--surface);
  font-size: .7rem;
  font-weight: 800;
}

.error-progress-card__status > span.is-warning {
  color: #8a5a10;
  background: color-mix(in srgb, #e6a936 15%, var(--surface));
}

.error-progress-chart {
  min-width: 0;
  padding: 14px 14px 11px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface);
}

.error-progress-chart__plot {
  position: relative;
}

.error-progress-chart svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.error-progress-chart__grid line {
  stroke: color-mix(in srgb, var(--line) 78%, transparent);
  stroke-width: 1;
}

.error-progress-chart text {
  fill: var(--muted);
  font: 11px system-ui, sans-serif;
}

.error-progress-chart polyline {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 4;
}

.error-progress-chart circle {
  fill: var(--surface);
  stroke-width: 3;
}

.error-progress-chart__rate-axis,
.error-progress-chart__date-axis {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.error-progress-chart__rate-axis span {
  position: absolute;
  left: 0;
  font: 400 11px system-ui, sans-serif !important;
  transform: translateY(-50%);
}

.error-progress-chart__rate-axis .is-high {
  top: 8.421%;
}

.error-progress-chart__rate-axis .is-low {
  top: 82.105%;
}

.error-progress-chart__rate-axis.is-errors .is-high,
.error-progress-chart__rate-axis.is-successes .is-low {
  color: #ef6760 !important;
}

.error-progress-chart__rate-axis .is-middle {
  top: 45.263%;
  color: #d6a33e !important;
}

.error-progress-chart__rate-axis.is-errors .is-low,
.error-progress-chart__rate-axis.is-successes .is-high {
  color: #3aa66f !important;
}

.error-progress-chart__date-axis {
  right: 2.5%;
  bottom: 0;
  left: 6.5625%;
  top: auto;
  display: flex;
  align-items: end;
  justify-content: space-between;
}

.error-progress-chart__date-axis span {
  color: #fff !important;
  font: 400 10px system-ui, sans-serif !important;
}

.error-progress-chart__legend {
  display: flex;
  padding-top: 9px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: .69rem;
}

.error-progress-chart__legend span:first-child {
  color: var(--success);
  font-weight: 850;
}

.error-progress-card.is-successes .error-progress-chart__legend span:first-child {
  color: var(--success);
}

.error-progress-card__insufficient {
  padding: 15px;
  border: 1px dashed var(--line);
  border-radius: 13px;
  color: var(--muted);
  background: var(--surface);
  font-size: .78rem;
  text-align: center;
}

.error-progress-examples {
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 15px;
  background: var(--surface);
}

.error-progress-examples summary {
  display: flex;
  min-height: 48px;
  padding: 12px 15px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--ink);
  cursor: pointer;
  font-size: .86rem;
  font-weight: 850;
  list-style: none;
}

.error-progress-examples summary::-webkit-details-marker {
  display: none;
}

.error-progress-examples__chevron {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-right: 2px solid var(--learner-purple-heading);
  border-bottom: 2px solid var(--learner-purple-heading);
  flex: 0 0 auto;
  transform: rotate(-45deg);
  transition: transform .18s ease;
}

.error-progress-examples[open] .error-progress-examples__chevron {
  transform: rotate(45deg) translate(-2px, -2px);
}

.error-progress-examples__label {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.error-progress-examples summary small {
  margin-left: auto;
  color: var(--muted);
  font-size: .7rem;
  font-weight: 750;
}

.error-progress-examples > ol {
  display: grid;
  margin: 0;
  padding: 0 15px 15px;
  gap: 11px;
  list-style: none;
}

.error-progress-examples > ol > li {
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface-soft);
}

.error-progress-examples dl {
  display: grid;
  margin: 0;
  gap: 9px;
}

.error-progress-examples dl > div {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  gap: 10px;
}

.error-progress-examples dt {
  color: var(--muted);
  font-size: .68rem;
  font-weight: 900;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.error-progress-examples dd {
  min-width: 0;
  margin: 0;
  color: var(--ink);
  font-size: .8rem;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.error-progress-examples__wrong {
  color: var(--danger) !important;
  text-decoration: line-through;
  text-decoration-thickness: 1px;
}

.error-progress-examples__correct {
  color: var(--success) !important;
  font-weight: 800;
}

.learner-space--dark .error-progress-card__status > span.is-warning {
  color: #ffd88d;
}

.account-panel {
  align-content: start;
}

.account-privacy {
  display: grid;
  padding: clamp(18px, 3vw, 26px);
  border: 1px solid color-mix(in srgb, #7052a0 30%, var(--line));
  border-radius: 20px;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 17px;
  background: color-mix(in srgb, #7052a0 8%, var(--surface));
}

.account-privacy > span {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 15px;
  color: white;
  background: #7052a0;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
}

.account-privacy h3,
.account-password h3,
.account-actions h3 {
  margin: 0;
  color: var(--ink);
  font-size: 1.08rem;
}

.account-privacy p,
.account-password > div > p,
.account-actions p {
  margin: 7px 0 0;
  color: var(--muted);
  line-height: 1.6;
}

.account-privacy strong,
.account-actions strong {
  color: var(--learner-purple-copy);
}

.account-success {
  margin: 0;
  padding: 12px 15px;
  border: 1px solid color-mix(in srgb, var(--success) 35%, var(--line));
  border-radius: 13px;
  color: var(--success);
  background: color-mix(in srgb, var(--success) 10%, var(--surface));
  font-weight: 800;
}

.account-password {
  display: grid;
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: 18px;
  gap: 18px;
  background: var(--surface-soft);
  scroll-margin-top: calc(var(--learner-tabs-sticky-top, 68px) + 82px);
}

.account-password__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.account-password__fields label {
  display: grid;
  gap: 7px;
  color: var(--ink);
  font-size: .8rem;
  font-weight: 800;
}

.account-password__fields label.is-current {
  grid-column: 1 / -1;
}

.account-password__fields input {
  width: 100%;
  min-height: 45px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 11px;
  color: var(--ink);
  background: var(--surface);
  font: inherit;
}

.account-password__fields input:focus {
  border-color: #8060ad;
  outline: 3px solid color-mix(in srgb, #7052a0 20%, transparent);
}

.account-password .account-success,
.account-password .preferences-error {
  margin: 0;
}

.account-password .account-button {
  justify-self: start;
}

.account-actions {
  display: grid;
  gap: 13px;
}

.account-actions article {
  display: flex;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 18px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: var(--surface-soft);
}

.account-button {
  flex: 0 0 auto;
  min-height: 44px;
  padding: 9px 16px;
  border: 1px solid;
  border-radius: 999px;
  font: inherit;
  font-size: .84rem;
  font-weight: 850;
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease, transform 150ms ease;
}

.account-button:hover {
  transform: translateY(-1px);
}

.account-button--primary {
  color: white;
  border-color: #7052a0;
  background: #7052a0;
}

.account-button--primary:hover {
  border-color: #5a3b86;
  background: #5a3b86;
}

.account-button:disabled {
  opacity: .58;
  cursor: wait;
  transform: none;
}

.account-button--warning {
  color: #7c4c15;
  border-color: #d6ab77;
  background: color-mix(in srgb, #dc9b46 15%, var(--surface));
}

.account-button--warning:hover {
  border-color: #bd7d2d;
  background: color-mix(in srgb, #dc9b46 25%, var(--surface));
}

.account-button--danger {
  color: #9d3731;
  border-color: color-mix(in srgb, var(--danger) 48%, var(--line));
  background: color-mix(in srgb, var(--danger) 10%, var(--surface));
}

.account-button--danger:hover {
  color: #7f211c;
  border-color: var(--danger);
  background: color-mix(in srgb, var(--danger) 18%, var(--surface));
}

.learner-space--dark .account-button--warning {
  color: #ffdda9;
  border-color: #c9914a;
}

.learner-space--dark .account-button--warning:hover {
  color: #fff2d9;
  border-color: #e8b870;
}

.learner-space--dark .account-button--danger {
  color: #ffb7b0;
  border-color: #c9756d;
}

.learner-space--dark .account-button--danger:hover {
  color: #ffe0dc;
  border-color: #ee9b93;
}

.account-dialog-backdrop {
  position: fixed;
  z-index: 5000;
  inset: 0;
  display: grid;
  padding: 20px;
  place-items: center;
  background: rgb(15 18 26 / 68%);
  backdrop-filter: blur(5px);
}

.account-dialog {
  position: relative;
  display: grid;
  width: min(520px, 100%);
  padding: clamp(25px, 5vw, 38px);
  border: 1px solid var(--line);
  border-radius: 25px;
  justify-items: center;
  gap: 14px;
  color: var(--ink);
  background: var(--surface);
  box-shadow: 0 28px 80px rgb(10 13 20 / 36%);
  text-align: center;
}

.account-dialog__close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 50%;
  color: var(--muted);
  background: var(--surface-soft);
  font: inherit;
  font-size: 1.45rem;
  cursor: pointer;
}

.account-dialog__icon {
  display: grid;
  width: 62px;
  height: 62px;
  place-items: center;
  border-radius: 50%;
  color: white;
  background: var(--danger);
  box-shadow: 0 0 0 9px color-mix(in srgb, var(--danger) 12%, transparent);
  font-size: 1.8rem;
  font-weight: 900;
}

.account-dialog h2 {
  margin: 7px 0 0;
  color: var(--ink);
  font-size: clamp(1.35rem, 4vw, 1.8rem);
}

.account-dialog > p {
  margin: 0;
  color: var(--muted);
  line-height: 1.55;
}

.account-dialog > p strong {
  color: var(--ink);
}

.account-dialog__actions {
  display: flex;
  width: 100%;
  margin-top: 6px;
  justify-content: center;
  gap: 9px;
}

.account-dialog__actions button {
  min-height: 44px;
  padding: 9px 16px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--ink);
  background: var(--surface-soft);
  font: inherit;
  font-size: .82rem;
  font-weight: 850;
  cursor: pointer;
}

.account-dialog__actions .is-danger {
  color: white;
  border-color: var(--danger);
  background: var(--danger);
}

.account-dialog button:disabled {
  opacity: .58;
  cursor: wait;
}

@media (max-width: 850px) and (min-width: 721px) {
  .learner-tabs button {
    padding-inline: 7px;
    font-size: .78rem;
  }
}

@media (max-width: 720px) {
  .learner-tabs {
    grid-template-columns: repeat(3, minmax(138px, 1fr));
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scrollbar-width: thin;
  }

  .learner-panel__heading--progress {
    align-items: flex-start;
    flex-direction: row;
  }

  .challenge-training-layout {
    grid-template-columns: 1fr;
  }

  .challenge-training-list {
    max-height: 245px;
  }

  .challenge-training-chart footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .challenge-training-chart__tooltip {
    width: min(210px, 62%);
  }

  .challenge-training-achievement {
    grid-template-columns: 1fr;
  }

  .challenge-training-achievement > div:first-child {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .challenge-training-sessions > header {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .error-progress-card__heading {
    grid-template-columns: 1fr;
  }

  .error-progress-card__rate {
    min-width: 0;
    justify-self: start;
    grid-template-columns: auto auto;
    align-items: baseline;
    gap: 6px;
  }

  .error-progress-card__status,
  .error-progress-chart__legend {
    align-items: flex-start;
    flex-direction: column;
  }

  .error-progress-examples dl > div {
    grid-template-columns: 1fr;
    gap: 3px;
  }

  .account-actions article {
    align-items: stretch;
    flex-direction: column;
  }

  .account-button {
    align-self: start;
  }

  .account-password__fields {
    grid-template-columns: 1fr;
  }

  .account-password__fields label.is-current {
    grid-column: auto;
  }
}

@media (max-width: 480px) {
  .progress-explanation__tooltip {
    position: fixed;
    top: 50%;
    right: 18px;
    left: 18px;
    width: auto;
    transform: translateY(-50%);
  }

  .progress-explanation__tooltip::before {
    display: none;
  }

  .account-privacy {
    grid-template-columns: 1fr;
  }

  .account-dialog__actions {
    flex-direction: column-reverse;
  }

  .account-dialog__actions button {
    width: 100%;
  }
}
</style>

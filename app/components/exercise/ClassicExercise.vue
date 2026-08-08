<script setup lang="ts">
import { faArrowUpFromBracket, faPrint } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import LearnerErrorFeedback from '~/components/exercise/LearnerErrorFeedback.vue'
import ShareExerciseSummaryDialog from '~/components/exercise/ShareExerciseSummaryDialog.vue'
import { isModeLandingSlug, modeLandingPage } from '~~/shared/data/mode-landing-pages'
import { modeTensePedagogy } from '~~/shared/data/mode-tense-pedagogy'
import type { ConjugationTense, ExerciseAttempt, ExerciseKind, ExerciseQuestion, LearnerErrorDetail, LearnerExerciseTrackingContext } from '~~/shared/types/conjugation'
import { grammarTenseCode } from '~~/shared/utils/grammar-codes'
import {
  conjugationAnswerPlaceholder,
  conjugationRequiresSubjectPronoun,
  findConjugationConfusions,
  findImpossibleSingularEnding,
  getAlternativeCorrections,
  impossibleSingularEndingReminderMessage,
  isFutureSimpleInsteadOfNearFuture,
} from '~~/shared/utils/answer'
import { diagnoseCoachAgreement, diagnoseCoachAnswer } from '~~/shared/utils/coach-feedback'
import { evaluateExerciseAnswer } from '~~/shared/utils/exercise-attempt'
import { identificationFormParts } from '~~/shared/utils/identification-form'
import {
  learnerErrorDetails,
  mergeLearnerErrorDetails,
} from '~~/shared/utils/learner-error-diagnostics'

const { interfaceLocale, localePath, ui, uiLabel } = useLanguagePreferences()

const props = defineProps<{
  questions: ExerciseQuestion[]
  exerciseKind: ExerciseKind
  identificationTenses?: ConjugationTense[]
  trackingContext?: LearnerExerciseTrackingContext
  requireSuccess?: boolean
  analyticsMetadata?: Record<string, string | number | boolean>
}>()
const { track } = useSiteAnalytics()
const { recordAttempt, recordQuestionPlan } = useLearnerProgress()

const emit = defineEmits<{
  close: []
}>()

const currentIndex = ref(0)
const answer = ref('')
const selectedIdentificationMode = ref('')
const lastIncorrectIdentificationAnswer = ref('')
const isSmallScreen = ref(false)
const feedback = ref<'idle' | 'correct' | 'incorrect'>('idle')
const retryAlreadyOffered = ref(false)
const retryMessageVisible = ref(false)
const missingPronounMessageVisible = ref(false)
const futureSimpleConfusion = ref(false)
const conjugationConfusions = ref<ReturnType<typeof findConjugationConfusions>>([])
const impossibleSingularEnding = ref<ReturnType<typeof findImpossibleSingularEnding>>(null)
const agreementError = ref(false)
const auxiliaryError = ref<{ learner: string, expected: string }>()
const attempts = ref<ExerciseAttempt[]>([])
const pendingErrorLabels = ref<string[]>([])
const pendingErrorDetails = ref<LearnerErrorDetail[]>([])
const detectedErrorDetails = ref<LearnerErrorDetail[]>([])
const isFinished = ref(false)
const printSummaryOpen = ref(false)
const shareSummaryOpen = ref(false)
const closeConfirmationOpen = ref(false)
const answerInput = useTemplateRef<HTMLInputElement>('answer-input')
const keepExerciseButton = useTemplateRef<HTMLButtonElement>('keep-exercise-button')
const dialog = useTemplateRef<HTMLElement>('exercise-dialog')
const exerciseAnalyticsMetadata = computed(() => ({
  ...props.analyticsMetadata,
  presentation: 'classic',
  exerciseKind: props.exerciseKind,
}))

useDialogFocus(dialog, handleEscapeClose, answerInput)

const currentQuestion = computed(() => props.questions[currentIndex.value])
const currentSubjectMustBeTyped = computed(() => Boolean(
  currentQuestion.value && props.exerciseKind === 'conjugation'
  && conjugationRequiresSubjectPronoun(currentQuestion.value),
))
const currentAnswerPlaceholder = computed(() => currentQuestion.value
  ? conjugationAnswerPlaceholder(currentQuestion.value)
  : '')
const isModeIdentificationExercise = computed(() => props.exerciseKind === 'mode-identification')
const isTenseIdentificationExercise = computed(() => props.exerciseKind === 'tense-identification')
const isIdentificationExercise = computed(() => isModeIdentificationExercise.value || isTenseIdentificationExercise.value)
const currentIdentificationFormParts = computed(() => currentQuestion.value && isIdentificationExercise.value
  ? identificationFormParts(currentQuestion.value)
  : null)
const fixedModeChoices = computed(() => [
  { value: 'indicatif', label: ui('Indicatif') },
  { value: 'impératif', label: ui('Impératif') },
  { value: 'subjonctif', label: ui('Subjonctif') },
  { value: 'conditionnel', label: ui('Conditionnel') },
  { value: 'infinitif', label: ui('Infinitif') },
])
const displayedModeChoices = computed(() => fixedModeChoices.value)
interface ClassicTenseChoice {
  name: string
  label: string
  isCompound: boolean
}
const selectedModeTenseChoices = computed(() => {
  const tenses = new Map<string, ClassicTenseChoice>()
  const sources = props.identificationTenses?.length
    ? props.identificationTenses.map(tense => ({ id: tense.id, mode: tense.mode?.name, tense: tense.name, isCompound: tense.isCompound, selected: tense.selected }))
    : props.questions.map(question => ({ id: question.tenseId, mode: question.mode, tense: question.temps, isCompound: Boolean(question.isCompound), selected: true }))
  for (const source of sources) {
    if (normalizedGrammarChoice(source.mode) !== normalizedGrammarChoice(selectedIdentificationMode.value)) continue
    const name = source.tense?.trim()
    if (!name) continue
    const key = normalizedGrammarChoice(name)
    if (key === 'futur proche') continue
    if (!tenses.has(key)) tenses.set(key, {
      name,
      label: uiLabel(name),
      isCompound: source.isCompound,
    })
  }
  return [...tenses.values()].sort((left, right) => left.label.localeCompare(right.label, 'fr'))
})
const selectedModeTenseRows = computed(() => pairClassicTenseChoices(
  selectedIdentificationMode.value,
  selectedModeTenseChoices.value,
))

const answerPlaceholder = computed(() => isIdentificationExercise.value && isSmallScreen.value
  ? ui('Écris ta réponse')
  : isModeIdentificationExercise.value
    ? ui('Écris ta réponse ou clique directement sur le mode correct')
    : isTenseIdentificationExercise.value
      ? ui('Écris ta réponse ou clique directement sur le mode puis sur le temps correct')
      : '')
const questionNumberOffset = computed(() => props.trackingContext?.questionIndexOffset || 0)
const displayedQuestionNumber = computed(() => questionNumberOffset.value + currentIndex.value + 1)
const displayedQuestionCount = computed(() => questionNumberOffset.value
  ? props.trackingContext?.challenge.questionCount || props.questions.length
  : props.questions.length)
const correctCount = computed(() => attempts.value.filter(attempt => attempt.status === 'correct').length)
const scorePercent = computed(() => attempts.value.length
  ? Math.round(correctCount.value / attempts.value.length * 100)
  : 0)
const correction = computed(() => currentQuestion.value?.reponsesPourCorrige.join(` ${ui('ou')} `) ?? '')
const alternativeCorrections = computed(() => currentQuestion.value
  ? getAlternativeCorrections(answer.value, currentQuestion.value.reponsesPourCorrige)
  : [])
const alternativeText = computed(() => alternativeCorrections.value.join(` ${ui('ou')} `))
const alternativePunctuation = computed(() => /[.!?]$/u.test(alternativeText.value) ? '' : '.')
const agreementReminder = computed(() => currentQuestion.value?.agreementReminder)
const conjugationConfusionText = computed(() => {
  const question = currentQuestion.value
  const confusion = conjugationConfusions.value[0]
  if (!question || !confusion) return ''
  return ui(
    'Ta forme est correcte pour le mode {sourceMode}, au temps {sourceTense}. Ici, il fallait le mode {targetMode}, au temps {targetTense}.',
    {
      sourceMode: uiLabel(confusion.mode),
      sourceTense: uiLabel(confusion.tense),
      targetMode: uiLabel(question.mode),
      targetTense: uiLabel(question.temps),
    },
  )
})
const impossibleSingularEndingText = computed(() => impossibleSingularEnding.value
  ? ui(impossibleSingularEndingReminderMessage(impossibleSingularEnding.value))
  : '')
const agreementFeatures = computed(() => {
  const reminder = agreementReminder.value
  if (!reminder?.gender || !reminder.number) return ''
  return `${uiLabel(reminder.gender === 'feminin' ? 'féminin' : 'masculin')} ${uiLabel(reminder.number)}`
})
const indirectRecognition = computed(() => {
  const preposition = agreementReminder.value?.preposition || 'à'
  return `${agreementReminder.value?.infinitive} ${preposition} qui ? / ${preposition} quoi ?`
})
const agreementExplanation = computed(() => {
  const reminder = agreementReminder.value
  if (!reminder) return agreementError.value
    ? ui('Le participe passé n’a pas le bon accord. Compare sa terminaison avec la correction.')
    : ''
  const values = {
    complement: reminder.complement,
    verb: reminder.infinitive,
    participle: reminder.participle,
    features: agreementFeatures.value ? `, ${agreementFeatures.value}` : '',
  }
  if (reminder.kind === 'cod-before') return feedback.value === 'correct'
    ? ui('C’est juste : le COD « {complement} » est placé avant le verbe « {verb} ». Avec avoir, le participe passé s’accorde donc avec ce COD{features} : « {participle} ».', values)
    : ui('Ici, le COD « {complement} » est placé avant le verbe « {verb} ». Avec avoir, il commande l’accord du participe passé{features} : « {participle} ».', values)
  if (reminder.kind === 'cod-after') return feedback.value === 'correct'
    ? ui('C’est juste : le COD « {complement} » est placé après le verbe « {verb} ». Avec avoir, on n’accorde pas le participe passé avec un COD placé après : il reste « {participle} ».', values)
    : ui('Ici, le COD « {complement} » est placé après le verbe « {verb} ». Il ne commande donc aucun accord : le participe passé reste « {participle} ».', values)
  return feedback.value === 'correct'
    ? ui('C’est juste : « {complement} » n’est pas un COD, mais un COI du verbe « {verb} ». Un COI ne commande jamais l’accord du participe passé employé avec avoir : il reste « {participle} ».', values)
    : ui('Attention : « {complement} » n’est pas un COD, mais un COI du verbe « {verb} ». Il ne faut pas accorder le participe avec ce complément : il reste « {participle} ».', values)
})
const auxiliaryErrorText = computed(() => {
  const error = auxiliaryError.value
  const question = currentQuestion.value
  if (!error || !question) return ''
  return ui(
    'L’auxiliaire « {learnerAuxiliary} » ne convient pas. Avec {person} au {tense}, il fallait « {expectedAuxiliary} ».',
    {
      learnerAuxiliary: error.learner,
      expectedAuxiliary: error.expected,
      person: question.pronom || question.saisiePrefixe || ui('cette personne'),
      tense: uiLabel(question.temps),
    },
  )
})
const identificationChoiceHelpMessages = computed(() => {
  const question = currentQuestion.value
  const submittedAnswer = normalizedGrammarChoice(lastIncorrectIdentificationAnswer.value)
  if (!isIdentificationExercise.value || !question || !submittedAnswer) return []

  const selectedMode = displayedModeChoices.value.find(choice => submittedAnswer.includes(normalizedGrammarChoice(choice.value)))?.value || ''
  if (!selectedMode) return []

  const messages: string[] = []
  const selectedModeSlug = normalizedGrammarChoice(selectedMode)
  if (normalizedGrammarChoice(selectedMode) !== normalizedGrammarChoice(question.mode) && isModeLandingSlug(selectedModeSlug)) {
    const modeHelp = modeLandingPage(selectedModeSlug, interfaceLocale.value)
    messages.push(`${uiLabel(selectedMode)} : ${modeHelp.purpose}`)
  }

  if (!isTenseIdentificationExercise.value) return messages
  const tenseSources = props.identificationTenses?.length
    ? props.identificationTenses.map(tense => ({ mode: tense.mode?.name, name: tense.name }))
    : props.questions.map(item => ({ mode: item.mode, name: item.temps }))
  const selectedTense = tenseSources
    .filter(tense => normalizedGrammarChoice(tense.mode) === selectedModeSlug && tense.name)
    .sort((left, right) => normalizedGrammarChoice(right.name).length - normalizedGrammarChoice(left.name).length)
    .find(tense => submittedAnswer.includes(normalizedGrammarChoice(tense.name)))?.name || ''
  if (!selectedTense || grammarTenseCode(selectedTense) === grammarTenseCode(question.temps)) return messages

  const tenseSlugByCode = {
    present: 'present',
    'near-future': 'futur-proche',
    imperfect: 'imparfait',
    future: 'futur-simple',
    'simple-past': 'passe-simple',
    'compound-past': 'passe-compose',
    'future-perfect': 'futur-anterieur',
    pluperfect: 'plus-que-parfait',
    'past-anterior': 'passe-anterieur',
    past: 'passe',
    'past-first-form': 'passe-premiere-forme',
    'past-second-form': 'passe-deuxieme-forme',
  } as const
  const tenseCode = grammarTenseCode(selectedTense)
  const tenseSlug = tenseCode ? tenseSlugByCode[tenseCode] : undefined
  const tenseHelp = isModeLandingSlug(selectedModeSlug) && tenseSlug
    ? modeTensePedagogy(selectedModeSlug, tenseSlug)
    : undefined
  if (tenseHelp) messages.push(`${uiLabel(selectedTense)} — ${uiLabel(selectedMode)} : ${tenseHelp.summary}`)
  return messages
})
const retryGuidanceMessages = computed(() => {
  if (isIdentificationExercise.value) return identificationChoiceHelpMessages.value
  const messages: string[] = []
  if (futureSimpleConfusion.value) {
    messages.push(ui('Ta conjugaison est correcte au futur simple, mais la question demande le futur proche. Au futur simple, le verbe est conjugué en un seul mot (« tu mangeras »). Au futur proche, on utilise « aller » au présent suivi de l’infinitif (« tu vas manger »).'))
  }
  if (conjugationConfusionText.value) messages.push(conjugationConfusionText.value)
  if (impossibleSingularEndingText.value) messages.push(impossibleSingularEndingText.value)
  if (auxiliaryErrorText.value) messages.push(auxiliaryErrorText.value)
  if (agreementError.value && agreementExplanation.value) messages.push(agreementExplanation.value)
  return messages
})
const agreementRecognition = computed(() => {
  const reminder = agreementReminder.value
  if (!reminder) return ''
  return reminder.kind === 'coi'
    ? ui('Pour reconnaître le COI, repère sa préposition et pose la question « {question} ».', { question: indirectRecognition.value })
    : ui('Pour reconnaître le COD, pose « {verb} qui ? » ou « {verb} quoi ? ». Il répond sans préposition.', { verb: reminder.infinitive })
})
const titleMessage = computed(() => {
  if (scorePercent.value >= 90) return ui('Excellent !')
  if (scorePercent.value >= 60) return ui('Bravo !')
  if (scorePercent.value >= 40) return ui('Bel effort !')
  return ui('Continue, tu progresses !')
})
const summaryItems = computed(() => attempts.value.map((attempt, index) => ({
  index: index + 1,
  status: attempt.status,
  questionLabel: attempt.question.consigne,
  learnerAnswer: attempt.answer,
  expectedAnswer: attempt.question.reponsesPourCorrige.join(` ${ui('ou')} `)
    || attempt.question.reponses.join(` ${ui('ou')} `),
  errorLabels: attempt.errorLabels || [],
  errorDetails: attempt.errorDetails || [],
})))
const incorrectSummaryForms = computed(() => attempts.value.map(attempt => (
  isIdentificationExercise.value && attempt.status === 'incorrect'
    ? identificationFormParts(attempt.question)
    : null
)))
const summaryVerbs = computed(() => [...new Set(props.questions.flatMap(question => (
  question.infinitif ? [question.infinitif] : []
)))])
const summaryTenses = computed(() => {
  const seen = new Set<string>()
  return props.questions.flatMap((question) => {
    const key = `${question.mode || ''}\u0000${question.temps || ''}`
    if (!question.temps || seen.has(key)) return []
    seen.add(key)
    return [{ name: question.temps, mode: question.mode }]
  })
})

function mergeErrorLabels(...groups: string[][]) {
  return [...new Set(groups.flat())]
}

function normalizedGrammarChoice(value?: string | null) {
  return (value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLocaleLowerCase('fr')
}

function consultVerbPath(id: number) {
  return `${localePath('/consulter')}?verbe=${encodeURIComponent(String(id))}`
}

function pairClassicTenseChoices(mode: string, choices: ClassicTenseChoice[]) {
  const normalizedMode = normalizedGrammarChoice(mode)
  const pairsByMode: Record<string, Array<[string | null, string | null]>> = {
    indicatif: [
      ['present', 'passe compose'],
      ['imparfait', 'plus-que-parfait'],
      ['passe simple', 'passe anterieur'],
      ['futur', 'futur anterieur'],
    ],
    imperatif: [['present', 'passe']],
    subjonctif: [
      ['present', 'passe'],
      ['imparfait', 'plus-que-parfait'],
    ],
    conditionnel: [
      ['present', 'passe 1'],
      [null, 'passe 2'],
    ],
  }
  const byName = new Map(choices.map(choice => [normalizedGrammarChoice(choice.name), choice]))
  const used = new Set<string>()
  const rows: Array<{ key: string, simple: ClassicTenseChoice | null, compound: ClassicTenseChoice | null }> = []
  for (const [simpleName, compoundName] of pairsByMode[normalizedMode] || []) {
    const simple = simpleName ? byName.get(simpleName) || null : null
    const compound = compoundName ? byName.get(compoundName) || null : null
    if (!simple && !compound) continue
    if (simpleName && simple) used.add(simpleName)
    if (compoundName && compound) used.add(compoundName)
    rows.push({ key: `${simpleName || 'empty'}:${compoundName || 'empty'}`, simple, compound })
  }
  for (const choice of choices) {
    const key = normalizedGrammarChoice(choice.name)
    if (used.has(key)) continue
    rows.push({
      key,
      simple: choice.isCompound ? null : choice,
      compound: choice.isCompound ? choice : null,
    })
  }
  return rows
}

function chooseIdentificationMode(mode: string) {
  if (!isIdentificationExercise.value || feedback.value !== 'idle') return
  if (isModeIdentificationExercise.value) {
    answer.value = mode
    submitAnswer()
    return
  }
  selectedIdentificationMode.value = mode
}

function submitIdentificationTense(tense: { name: string }) {
  if (!isTenseIdentificationExercise.value || !selectedIdentificationMode.value || feedback.value !== 'idle') return
  answer.value = `${tense.name} ${selectedIdentificationMode.value}`
  submitAnswer()
}

function submitAnswer() {
  const question = currentQuestion.value
  if (!question || feedback.value !== 'idle' || !answer.value.trim()) {
    return
  }

  const { result, shouldRetry, missingSubjectPronoun } = evaluateExerciseAnswer(
    answer.value,
    question,
    retryAlreadyOffered.value,
    !isIdentificationExercise.value,
  )
  if (missingSubjectPronoun) {
    missingPronounMessageVisible.value = true
    retryMessageVisible.value = false
    detectedErrorDetails.value = []
    nextTick(() => {
      answerInput.value?.focus()
      answerInput.value?.select()
    })
    return
  }
  missingPronounMessageVisible.value = false
  lastIncorrectIdentificationAnswer.value = isIdentificationExercise.value && !result.isCorrect ? answer.value : ''
  const usedFutureSimple = !isIdentificationExercise.value && !result.isCorrect && isFutureSimpleInsteadOfNearFuture(answer.value, question)
  const otherConjugations = isIdentificationExercise.value || result.isCorrect ? [] : findConjugationConfusions(answer.value, question)
  const impossibleEnding = isIdentificationExercise.value || result.isCorrect ? null : findImpossibleSingularEnding(answer.value, question)
  const hasAgreementError = !isIdentificationExercise.value && !result.isCorrect && Boolean(diagnoseCoachAgreement(answer.value, question))
  const diagnostic = isIdentificationExercise.value ? null : diagnoseCoachAnswer(answer.value, question, result.isCorrect)
  const detectedAuxiliaryError = diagnostic?.errorKind === 'auxiliary'
    && diagnostic.learnerAuxiliary
    && diagnostic.expectedAuxiliary
    ? { learner: diagnostic.learnerAuxiliary, expected: diagnostic.expectedAuxiliary }
    : undefined
  const currentErrorDetails = result.isCorrect || isIdentificationExercise.value ? [] : learnerErrorDetails(answer.value, question)
  const currentErrorLabels = currentErrorDetails.map(detail => detail.label)
  const attemptErrorLabels = mergeErrorLabels(pendingErrorLabels.value, currentErrorLabels)
  const attemptErrorDetails = mergeLearnerErrorDetails(pendingErrorDetails.value, currentErrorDetails)
  detectedErrorDetails.value = attemptErrorDetails
  const trackedAttempt: ExerciseAttempt = {
    question,
    answer: answer.value,
    status: result.isCorrect ? 'correct' : 'incorrect',
    attemptNumber: retryAlreadyOffered.value ? 2 : 1,
    ...(result.matchedAnswer ? { matchedAnswer: result.matchedAnswer } : {}),
    ...(attemptErrorLabels.length ? { errorLabels: attemptErrorLabels } : {}),
    ...(attemptErrorDetails.length ? { errorDetails: attemptErrorDetails } : {}),
  }
  track('answer_submitted', exerciseAnalyticsMetadata.value)
  void recordAttempt(
    props.trackingContext,
    trackedAttempt,
    currentIndex.value,
  )
  if (shouldRetry) {
    track('answer_retry', exerciseAnalyticsMetadata.value)
    retryAlreadyOffered.value = true
    retryMessageVisible.value = true
    futureSimpleConfusion.value = usedFutureSimple
    conjugationConfusions.value = otherConjugations
    impossibleSingularEnding.value = impossibleEnding
    agreementError.value = hasAgreementError
    auxiliaryError.value = detectedAuxiliaryError
    pendingErrorLabels.value = attemptErrorLabels
    pendingErrorDetails.value = attemptErrorDetails
    nextTick(() => {
      answerInput.value?.focus()
      answerInput.value?.select()
    })
    return
  }

  retryMessageVisible.value = false
  futureSimpleConfusion.value = usedFutureSimple
  conjugationConfusions.value = otherConjugations
  impossibleSingularEnding.value = impossibleEnding
  agreementError.value = hasAgreementError
  auxiliaryError.value = detectedAuxiliaryError
  feedback.value = result.isCorrect ? 'correct' : 'incorrect'
  if (result.isCorrect) track('answer_correct', exerciseAnalyticsMetadata.value)
  if (props.requireSuccess) attempts.value[currentIndex.value] = trackedAttempt
  else attempts.value.push(trackedAttempt)
}

function showDemoCorrection() {
  if (feedback.value !== 'idle') return
  answer.value = currentQuestion.value?.reponses[0] ?? currentQuestion.value?.reponsesPourCorrige[0] ?? ''
  submitAnswer()
}

function showTourProgress() {
  if (props.questions.length < 6) return
  currentIndex.value = 5
  answer.value = ''
  selectedIdentificationMode.value = ''
  lastIncorrectIdentificationAnswer.value = ''
  feedback.value = 'idle'
  retryAlreadyOffered.value = false
  retryMessageVisible.value = false
  missingPronounMessageVisible.value = false
  futureSimpleConfusion.value = false
  conjugationConfusions.value = []
  impossibleSingularEnding.value = null
  agreementError.value = false
  auxiliaryError.value = undefined
  pendingErrorLabels.value = []
  pendingErrorDetails.value = []
  detectedErrorDetails.value = []
  attempts.value = props.questions.slice(0, 5).map((question, index) => ({
    question,
    answer: index === 1 || index === 4
      ? 'réponse à revoir'
      : question.reponsesPourCorrige[0] ?? question.reponses[0] ?? '',
    status: index === 1 || index === 4 ? 'incorrect' : 'correct',
    attemptNumber: index === 3 ? 2 : 1,
  }))
  nextTick(() => answerInput.value?.focus({ preventScroll: true }))
}

defineExpose({ showDemoCorrection, showTourProgress })

function nextQuestion() {
  if (feedback.value === 'idle') {
    return
  }

  if (props.requireSuccess && feedback.value === 'incorrect') {
    answer.value = ''
    feedback.value = 'idle'
    retryAlreadyOffered.value = true
    retryMessageVisible.value = true
    futureSimpleConfusion.value = false
    conjugationConfusions.value = []
    impossibleSingularEnding.value = null
    agreementError.value = false
    auxiliaryError.value = undefined
    nextTick(() => answerInput.value?.focus())
    return
  }

  if (currentIndex.value >= props.questions.length - 1) {
    isFinished.value = true
    track('exercise_completed', exerciseAnalyticsMetadata.value)
    nextTick(() => dialog.value?.focus())
    return
  }

  currentIndex.value += 1
  answer.value = ''
  selectedIdentificationMode.value = ''
  lastIncorrectIdentificationAnswer.value = ''
  feedback.value = 'idle'
  retryAlreadyOffered.value = false
  retryMessageVisible.value = false
  missingPronounMessageVisible.value = false
  futureSimpleConfusion.value = false
  conjugationConfusions.value = []
  impossibleSingularEnding.value = null
  agreementError.value = false
  auxiliaryError.value = undefined
  pendingErrorLabels.value = []
  pendingErrorDetails.value = []
  detectedErrorDetails.value = []
  nextTick(() => answerInput.value?.focus())
}

function restart() {
  currentIndex.value = 0
  answer.value = ''
  selectedIdentificationMode.value = ''
  lastIncorrectIdentificationAnswer.value = ''
  feedback.value = 'idle'
  retryAlreadyOffered.value = false
  retryMessageVisible.value = false
  missingPronounMessageVisible.value = false
  futureSimpleConfusion.value = false
  conjugationConfusions.value = []
  impossibleSingularEnding.value = null
  agreementError.value = false
  auxiliaryError.value = undefined
  pendingErrorLabels.value = []
  pendingErrorDetails.value = []
  detectedErrorDetails.value = []
  attempts.value = []
  isFinished.value = false
  printSummaryOpen.value = false
  shareSummaryOpen.value = false
  track('exercise_started', exerciseAnalyticsMetadata.value)
  nextTick(() => answerInput.value?.focus())
}

function requestClose() {
  closeConfirmationOpen.value = true
  nextTick(() => keepExerciseButton.value?.focus())
}

function handleEscapeClose() {
  if (shareSummaryOpen.value) shareSummaryOpen.value = false
  else if (printSummaryOpen.value) printSummaryOpen.value = false
  else if (closeConfirmationOpen.value) cancelClose()
  else requestClose()
}

function cancelClose() {
  closeConfirmationOpen.value = false
  nextTick(() => (isFinished.value ? dialog.value : answerInput.value)?.focus())
}

function confirmClose() {
  closeConfirmationOpen.value = false
  emit('close')
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter'
    || event.isComposing
    || event.repeat
    || closeConfirmationOpen.value
    || isFinished.value
    || feedback.value === 'idle') {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  nextQuestion()
}

let smallScreenQuery: MediaQueryList | null = null
function updateSmallScreen(event: MediaQueryList | MediaQueryListEvent) {
  isSmallScreen.value = event.matches
}

onMounted(() => {
  smallScreenQuery = window.matchMedia('(max-width: 760px)')
  updateSmallScreen(smallScreenQuery)
  smallScreenQuery.addEventListener('change', updateSmallScreen)
  document.addEventListener('keydown', onDocumentKeydown)
  void recordQuestionPlan(props.trackingContext, props.questions)
})
onBeforeUnmount(() => {
  smallScreenQuery?.removeEventListener('change', updateSmallScreen)
  document.removeEventListener('keydown', onDocumentKeydown)
  if (!isFinished.value && attempts.value.length) track('exercise_abandoned', exerciseAnalyticsMetadata.value)
})

</script>

<template>
  <Teleport to="body">
    <div class="exercise-overlay" data-tour="classic-exercise" @click.self="requestClose">
      <section
        ref="exercise-dialog"
        class="exercise-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-title"
        tabindex="-1"
      >
        <header class="exercise-header">
          <div>
            <p class="dialog-kicker">{{ ui('Questionnaire') }}</p>
            <h2 id="exercise-title">
              {{ isFinished ? ui('Résultats') : ui('Question {current} sur {total}', { current: displayedQuestionNumber, total: displayedQuestionCount }) }}
            </h2>
          </div>
          <button class="dialog-close" type="button" :aria-label="ui('Quitter l’exercice')" @click="requestClose">×</button>
        </header>

        <div class="exercise-progress" :aria-label="ui('Progression du questionnaire')">
          <span
            v-for="(_, index) in questions"
            :key="index"
            :class="{
              'is-current': !isFinished && index === currentIndex,
              'is-correct': attempts[index]?.status === 'correct' && attempts[index]?.attemptNumber !== 2,
              'is-correct-retry': attempts[index]?.status === 'correct' && attempts[index]?.attemptNumber === 2,
              'is-incorrect': attempts[index]?.status === 'incorrect'
            }"
          />
        </div>

        <div v-if="!isFinished && currentQuestion" class="exercise-question">
          <p v-if="exerciseKind === 'tense-identification' || exerciseKind === 'mode-identification'" class="question-instruction">
            {{ uiLabel(currentQuestion.instruction) }}
          </p>
          <template v-if="exerciseKind === 'conjugation' && currentQuestion.complement">
            <p class="question-context" :aria-label="ui('Contexte grammatical')">
              <span>{{ ui('Verbe :') }} <strong>{{ currentQuestion.infinitif }}</strong></span>
              <i aria-hidden="true">|</i>
              <span>{{ ui('Mode :') }} <strong>{{ uiLabel(currentQuestion.mode) }}</strong></span>
              <i aria-hidden="true">|</i>
              <span>{{ ui('Temps :') }} <strong>{{ uiLabel(currentQuestion.temps) }}</strong></span>
              <template v-if="currentQuestion.pronom">
                <i aria-hidden="true">|</i>
                <span>{{ ui('Personne :') }} <strong>{{ currentQuestion.pronom }}</strong></span>
              </template>
            </p>
            <form
              class="completion-form"
              :class="{ 'is-awaiting-retry': retryMessageVisible || missingPronounMessageVisible }"
              @submit.prevent="feedback === 'idle' ? submitAnswer() : nextQuestion()"
            >
              <label class="completion-form__label" for="exercise-answer">{{ ui('Ta réponse') }}</label>
              <div class="completion-sentence">
                <span v-if="currentQuestion.complementPosition === 'before'">{{ currentQuestion.complement }}</span>
                <span v-if="currentQuestion.saisiePrefixe && !currentSubjectMustBeTyped" class="completion-sentence__prefix">{{ currentQuestion.saisiePrefixe }}</span>
                <input
                  id="exercise-answer"
                  ref="answer-input"
                  v-model="answer"
                  type="text"
                  autocomplete="off"
                  :placeholder="currentSubjectMustBeTyped ? currentAnswerPlaceholder : undefined"
                  :aria-label="ui('Forme conjuguée de {verb}', { verb: currentQuestion.infinitif || '' })"
                  :disabled="feedback !== 'idle'"
                  :class="{
                    'is-valid': feedback === 'correct',
                    'is-invalid': feedback === 'incorrect' || retryMessageVisible
                  }"
                  :aria-invalid="feedback === 'incorrect' || retryMessageVisible"
                  :aria-describedby="feedback !== 'idle' ? 'answer-feedback' : missingPronounMessageVisible ? 'answer-missing-pronoun' : retryMessageVisible ? 'answer-retry' : undefined"
                >
                <span v-if="currentQuestion.complementPosition !== 'before'">
                  {{ currentQuestion.complement }}{{ currentQuestion.mode?.toLocaleLowerCase('fr') === 'impératif' ? ' !' : '' }}
                </span>
              </div>
              <button v-if="feedback === 'idle'" class="primary-button" type="submit" :disabled="!answer.trim()"> {{ ui('Vérifier') }} </button>
              <button v-else class="primary-button" type="submit">
                {{ currentIndex === questions.length - 1 ? ui('Voir mes résultats') : ui('Question suivante') }}
              </button>
            </form>
            <div v-if="missingPronounMessageVisible" id="answer-missing-pronoun" class="answer-retry answer-retry--missing-pronoun" role="status" aria-live="polite">
              <span class="answer-retry__icon" aria-hidden="true">i</span>
              <div><strong>{{ ui('Il manque le pronom') }}</strong></div>
            </div>
            <div v-if="retryMessageVisible" id="answer-retry" class="answer-retry" role="status" aria-live="polite">
              <span class="answer-retry__icon" aria-hidden="true">↻</span>
              <div>
                <strong>{{ ui('Pas encore. Essaie une deuxième fois.') }}</strong>
                <small>{{ ui('Modifie ta réponse ci-dessus, puis clique à nouveau sur « Vérifier ».') }}</small>
              </div>
            </div>
            <aside v-if="retryMessageVisible && retryGuidanceMessages.length" class="answer-retry-hint">
              <strong>{{ ui('Un indice pour t’aider') }}</strong>
              <p v-for="message in retryGuidanceMessages" :key="message">{{ message }}</p>
            </aside>
            <LearnerErrorFeedback
              v-if="retryMessageVisible && detectedErrorDetails.length"
              :details="detectedErrorDetails"
            />
          </template>

          <div v-else-if="currentIdentificationFormParts" class="literary-question">
            <p class="question-text">
              <span>{{ currentIdentificationFormParts.before }}</span><mark>{{ currentIdentificationFormParts.target }}</mark><span>{{ currentIdentificationFormParts.after }}</span>
            </p>
            <small v-if="currentQuestion.literaryCitation">
              {{ currentQuestion.literaryCitation.author }}, <cite>{{ currentQuestion.literaryCitation.work }}</cite>
            </small>
          </div>
          <p v-else class="question-text">{{ currentQuestion.consigne }}</p>
          <div v-if="isIdentificationExercise" class="classic-identification-choices">
            <div v-if="isTenseIdentificationExercise && selectedIdentificationMode" class="classic-tense-choice-step">
              <div class="classic-tense-choice-step__header">
                <button type="button" :disabled="feedback !== 'idle'" @click="selectedIdentificationMode = ''">← {{ ui('Modes') }}</button>
                <strong>{{ ui('Choisis le temps') }}</strong>
              </div>
              <div class="classic-tense-choices" role="group" :aria-label="ui('Choisis le temps')">
                <div v-for="row in selectedModeTenseRows" :key="row.key" class="classic-tense-choice-row">
                  <button
                    v-if="row.simple"
                    type="button"
                    :disabled="feedback !== 'idle'"
                    @click="submitIdentificationTense(row.simple)"
                  >
                    {{ row.simple.label }}
                  </button>
                  <span v-else aria-hidden="true" />
                  <button
                    v-if="row.compound"
                    type="button"
                    :disabled="feedback !== 'idle'"
                    @click="submitIdentificationTense(row.compound)"
                  >
                    {{ row.compound.label }}
                  </button>
                  <span v-else aria-hidden="true" />
                </div>
              </div>
            </div>
            <div v-else class="classic-mode-choices" role="group" :aria-label="ui('Choisis le mode')">
              <button
                v-for="choice in displayedModeChoices"
                :key="choice.value"
                type="button"
                :disabled="feedback !== 'idle'"
                @click="chooseIdentificationMode(choice.value)"
              >
                {{ choice.label }}
              </button>
            </div>
          </div>

          <form
            v-if="!(exerciseKind === 'conjugation' && currentQuestion.complement)"
            class="answer-form"
            :class="{ 'is-awaiting-retry': retryMessageVisible || missingPronounMessageVisible }"
            @submit.prevent="feedback === 'idle' ? submitAnswer() : nextQuestion()"
          >
            <label for="exercise-answer">{{ ui('Ta réponse') }}</label>
            <div class="answer-form__row">
              <input
                id="exercise-answer"
                ref="answer-input"
                v-model="answer"
                type="text"
                autocomplete="off"
                :placeholder="currentSubjectMustBeTyped ? currentAnswerPlaceholder : answerPlaceholder"
                :disabled="feedback !== 'idle'"
                :class="{
                  'is-valid': feedback === 'correct',
                  'is-invalid': feedback === 'incorrect' || retryMessageVisible
                }"
                :aria-invalid="feedback === 'incorrect' || retryMessageVisible"
                :aria-describedby="feedback !== 'idle' ? 'answer-feedback' : missingPronounMessageVisible ? 'answer-missing-pronoun' : retryMessageVisible ? 'answer-retry' : undefined"
              >
              <button v-if="feedback === 'idle'" class="primary-button" type="submit" :disabled="!answer.trim()"> {{ ui('Vérifier') }} </button>
              <button v-else class="primary-button" type="submit">
                {{ currentIndex === questions.length - 1 ? ui('Voir mes résultats') : ui('Question suivante') }}
              </button>
            </div>
          </form>
          <div
            v-if="missingPronounMessageVisible && !(exerciseKind === 'conjugation' && currentQuestion.complement)"
            id="answer-missing-pronoun"
            class="answer-retry answer-retry--missing-pronoun"
            role="status"
            aria-live="polite"
          >
            <span class="answer-retry__icon" aria-hidden="true">i</span>
            <div><strong>{{ ui('Il manque le pronom') }}</strong></div>
          </div>
          <div
            v-if="retryMessageVisible && !(exerciseKind === 'conjugation' && currentQuestion.complement)"
            id="answer-retry"
            class="answer-retry"
            role="status"
            aria-live="polite"
          >
            <span class="answer-retry__icon" aria-hidden="true">↻</span>
            <div>
              <strong>{{ ui('Pas encore. Essaie une deuxième fois.') }}</strong>
              <small>{{ ui('Modifie ta réponse ci-dessus, puis clique à nouveau sur « Vérifier ».') }}</small>
            </div>
          </div>
          <aside
            v-if="retryMessageVisible && retryGuidanceMessages.length && !(exerciseKind === 'conjugation' && currentQuestion.complement)"
            class="answer-retry-hint"
          >
            <strong>{{ ui('Un indice pour t’aider') }}</strong>
            <p v-for="message in retryGuidanceMessages" :key="message">{{ message }}</p>
          </aside>
          <LearnerErrorFeedback
            v-if="retryMessageVisible && detectedErrorDetails.length && !(exerciseKind === 'conjugation' && currentQuestion.complement)"
            :details="detectedErrorDetails"
          />

          <div
            v-if="feedback !== 'idle'"
            id="answer-feedback"
            data-tour="classic-correction"
            class="answer-feedback"
            :class="`answer-feedback--${feedback}`"
            aria-live="polite"
          >
            <strong>{{ feedback === 'correct' ? ui('Bravo, c’est juste !') : ui('Pas tout à fait.') }}</strong>
            <p v-if="feedback === 'incorrect'">{{ ui('La réponse attendue était :') }} <strong>{{ correction }}</strong>.</p>
            <p v-else-if="alternativeCorrections.length"> {{ ui('On peut aussi répondre :') }} <strong>{{ alternativeText }}</strong>{{ alternativePunctuation }}
            </p>
            <p v-else>{{ ui('Tu peux passer à la question suivante.') }}</p>

            <LearnerErrorFeedback v-if="detectedErrorDetails.length" :details="detectedErrorDetails" />

            <aside v-if="futureSimpleConfusion" class="grammar-reminder">
              <strong>{{ ui('Futur proche ou futur simple ?') }}</strong>
              <p>{{ ui('Ta conjugaison est correcte au futur simple, mais la question demande le futur proche. Au futur simple, le verbe est conjugué en un seul mot (« tu mangeras »). Au futur proche, on utilise « aller » au présent suivi de l’infinitif (« tu vas manger »).') }}</p>
            </aside>

            <aside v-else-if="conjugationConfusionText" class="grammar-reminder">
              <strong>{{ ui('Attention au temps et au mode') }}</strong>
              <p>{{ conjugationConfusionText }}</p>
            </aside>

            <aside v-if="impossibleSingularEndingText" class="grammar-reminder">
              <strong>{{ ui('Attention à la personne') }}</strong>
              <p>{{ impossibleSingularEndingText }}</p>
            </aside>

            <aside v-if="auxiliaryErrorText" class="grammar-reminder">
              <strong>{{ ui('Attention à l’auxiliaire') }}</strong>
              <p>{{ auxiliaryErrorText }}</p>
            </aside>

            <aside v-if="agreementReminder || agreementError" class="grammar-reminder">
              <strong>{{ ui('Rappel de la règle') }}</strong>

              <p>{{ agreementExplanation }}</p>
              <small>{{ agreementRecognition }}</small>
            </aside>
          </div>
        </div>

        <div v-else class="exercise-results">
          <div class="results-hero">
            <p>{{ titleMessage }}</p>
            <strong>{{ scorePercent }}%</strong>
            <span>{{ ui(correctCount > 1 ? '{correct} bonnes réponses sur {total}' : '{correct} bonne réponse sur {total}', { correct: correctCount, total: attempts.length }) }}</span>
          </div>

          <div class="results-table-wrap">
            <table class="results-table">
              <caption>{{ ui('Récapitulatif des réponses') }}</caption>
              <thead>
                <tr>
                  <th scope="col">{{ ui('Question') }}</th>
                  <th scope="col">{{ ui('Ta réponse') }}</th>
                  <th scope="col">{{ ui('Correction') }}</th>
                  <th scope="col">{{ ui('Résultat') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(attempt, index) in attempts" :key="index">
                  <td>
                    <blockquote v-if="incorrectSummaryForms[index]" class="result-identification-citation">
                      <p>
                        <span>{{ incorrectSummaryForms[index]?.before }}</span><mark>{{ incorrectSummaryForms[index]?.target }}</mark><span>{{ incorrectSummaryForms[index]?.after }}</span>
                      </p>
                      <footer v-if="attempt.question.literaryCitation">
                        {{ attempt.question.literaryCitation.author }}, <cite>{{ attempt.question.literaryCitation.work }}</cite>
                      </footer>
                    </blockquote>
                    <span v-else>{{ attempt.question.consigne }}</span>
                    <LearnerErrorFeedback
                      v-if="attempt.errorDetails?.length"
                      :details="attempt.errorDetails"
                      compact
                    />
                    <NuxtLink
                      v-if="attempt.question.verbeId"
                      class="result-consult-verb"
                      :to="consultVerbPath(attempt.question.verbeId)"
                      target="_blank"
                      rel="noopener"
                    >
                      {{ ui('Consulter le verbe') }}
                    </NuxtLink>
                  </td>
                  <td>{{ attempt.answer }}</td>
                  <td>{{ attempt.question.reponsesPourCorrige.join(` ${ui('ou')} `) }}</td>
                  <td>
                    <span
                      :class="{
                        'result-good': attempt.status === 'correct' && attempt.attemptNumber !== 2,
                        'result-good--retry': attempt.status === 'correct' && attempt.attemptNumber === 2,
                        'result-bad': attempt.status === 'incorrect'
                      }"
                      :aria-label="attempt.status === 'correct' && attempt.attemptNumber === 2 ? ui('Juste au deuxième essai') : undefined"
                    >
                      {{ attempt.status === 'correct' ? ui('Juste') : ui('À revoir') }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="dialog-actions exercise-results__actions">
            <button class="secondary-button exercise-result-action" type="button" @click="shareSummaryOpen = true"><span aria-hidden="true"><FontAwesomeIcon :icon="faArrowUpFromBracket" /></span>{{ ui('Partager mon bilan') }}</button>
            <button class="secondary-button exercise-result-action" type="button" @click="printSummaryOpen = true"><span aria-hidden="true"><FontAwesomeIcon :icon="faPrint" /></span>{{ ui('Imprimer mon bilan') }}</button>
            <button class="primary-button exercise-result-action" type="button" @click="restart"><span aria-hidden="true">↻</span>{{ ui('Recommencer') }}</button>
            <button class="secondary-button exercise-results__close" type="button" @click="emit('close')">{{ ui('Fermer') }}</button>
          </div>
        </div>

        <div v-if="closeConfirmationOpen" class="exercise-close-confirmation" @click.self="cancelClose">
          <section role="alertdialog" aria-modal="true" aria-labelledby="close-confirmation-title" aria-describedby="close-confirmation-description">
            <span class="exercise-close-confirmation__icon" aria-hidden="true">?</span>
            <h3 id="close-confirmation-title">{{ ui('Quitter l’exercice ?') }}</h3>
            <p id="close-confirmation-description">{{ ui('Ta progression actuelle sera perdue.') }}</p>
            <div class="exercise-close-confirmation__actions">
              <button ref="keep-exercise-button" class="secondary-button" type="button" @click="cancelClose">{{ ui('Continuer l’exercice') }}</button>
              <button class="primary-button exercise-close-confirmation__leave" type="button" @click="confirmClose">{{ ui('Quitter') }}</button>
            </div>
          </section>
        </div>
      </section>
      <ExerciseSummaryPrintPreview
        v-if="printSummaryOpen"
        :items="summaryItems"
        :score="scorePercent"
        :correct-count="correctCount"
        :verbs="summaryVerbs"
        :tenses="summaryTenses"
        @close="printSummaryOpen = false"
      />
      <ShareExerciseSummaryDialog
        v-if="shareSummaryOpen"
        presentation="classic"
        :items="summaryItems"
        :verbs="summaryVerbs"
        :tenses="summaryTenses"
        @close="shareSummaryOpen = false"
      />
    </div>
  </Teleport>
</template>

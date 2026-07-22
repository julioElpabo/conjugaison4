<script setup lang="ts">
import type { ConjugationTense, ExerciseAttempt, ExerciseQuestion, Verb } from '~~/shared/types/conjugation'
import type { CoachEvent, CoachMedia, CoachMessageContext, CoachProfile } from '~~/shared/types/coach'
import type { AnswerComparison } from '~~/shared/utils/answer-difference'
import { getAlternativeCorrections, validateAnswer } from '~~/shared/utils/answer'
import { buildAnswerComparison } from '~~/shared/utils/answer-difference'
import { createCoachDialogueState, createVariedCoachReaction } from '~~/shared/utils/coach-dialogue'
import {
  answerTurnPlan,
  CHAT_BUBBLE_DELAY_MS,
  CHAT_CORRECT_DELAY_MS,
  CHAT_INCORRECT_DELAY_MS,
  COACH_STREAK_LENGTH,
  chatReactionAllowsMedia,
  nextConsecutiveCorrectCount,
} from '~~/shared/utils/coach-conversation'
import { diagnoseCoachAnswer } from '~~/shared/utils/coach-feedback'
import { coachQuestionBubbles } from '~~/shared/utils/coach-question'
import { buildTargetedConjugationHelp, isHelpCommand } from '~~/shared/utils/conjugation-help'
import { coachHelpQuestionVariables, visibleCoachHelpBlocks } from '~~/shared/utils/coach-help'
import {
  CHAT_HELP_REMINDER_DELAY_MS,
  CHAT_HELP_REMINDER_INCORRECT_COUNT,
  coachHelpReminderMessage,
  nextConsecutiveIncorrectCount,
} from '~~/shared/utils/coach-help-reminder'
import { sanitizeCoachHtml } from '~~/shared/utils/safe-html'
import { areOnlyIndicativeTenses, withoutIndicativeMode } from '~~/shared/utils/chat-mode-display'

const props = defineProps<{
  questions: ExerciseQuestion[]
  coach: CoachProfile
  verbs: Verb[]
  tenses: ConjugationTense[]
  regenerateQuestions: () => Promise<void>
}>()

const emit = defineEmits<{ close: [] }>()

interface ChatMessage {
  id: number
  author: 'coach' | 'learner'
  text: string
  tone?: 'success' | 'error'
  media?: CoachMedia
  emphasis?: boolean
  questionIndex?: number
  answerComparison?: AnswerComparison
  kind?: 'help-reminder'
  helpAlreadyOpen?: boolean
}

const currentIndex = ref(0)
const answer = ref('')
const attempts = ref<ExerciseAttempt[]>([])
const messages = ref<ChatMessage[]>([])
const waitingForNext = ref(false)
const nextQuestionDelay = ref(CHAT_INCORRECT_DELAY_MS)
const deliveringFeedback = ref(false)
const posingQuestion = ref(false)
const consecutiveCorrectCount = ref(0)
const consecutiveIncorrectCount = ref(0)
const finished = ref(false)
const finalSummaryPreparing = ref(false)
const finalSummaryVisible = ref(false)
const regeneratingQuestions = ref(false)
const restartError = ref('')
const printSummaryOpen = ref(false)
const closeConfirmationOpen = ref(false)
const helpOpen = ref(false)
const helpQuestionIndex = ref<number | null>(null)
const sequence = ref(0)
const lastMediaQuestion = ref(-100)
const allowMotion = ref(true)
const chatSessionId = ref('')
const exerciseRunId = ref('')
const input = useTemplateRef<HTMLInputElement>('chat-answer')
const keepChatButton = useTemplateRef<HTMLButtonElement>('keep-chat-button')
const thread = useTemplateRef<HTMLElement>('chat-thread')
const summary = useTemplateRef<HTMLElement>('chat-summary')
const dialog = useTemplateRef<HTMLElement>('chat-dialogs')
let conversationVersion = 0
let coachQueue: Promise<void> = Promise.resolve()
let lastCoachBubbleAt = 0
let dialogueState = createCoachDialogueState()
let questionScrollFrame: number | null = null
let helpReminderTimer: number | null = null
const CHAT_HELP_OPEN_DELAY_MS = 500
const CHAT_MESSAGES_AFTER_HELP_DELAY_MS = 1000

useDialogFocus(dialog, handleEscapeClose, input)

const currentQuestion = computed(() => props.questions[currentIndex.value])
const helpQuestion = computed(() => props.questions[helpQuestionIndex.value ?? currentIndex.value])
const helpVerb = computed(() => {
  const question = helpQuestion.value
  if (!question) return undefined
  return props.verbs.find(verb => verb.id === question.verbeId)
    || props.verbs.find(verb => normalizedInfinitive(verb.infinitif) === normalizedInfinitive(question.infinitif))
})
const helpTense = computed(() => {
  const question = helpQuestion.value
  if (!question) return undefined
  return props.tenses.find(tense => tense.id === question.tenseId)
    || props.tenses.find(tense => normalizedInfinitive(tense.name) === normalizedInfinitive(question.temps))
})
const targetedHelp = computed(() => helpQuestion.value
  ? buildTargetedConjugationHelp(helpQuestion.value, helpVerb.value, helpTense.value)
  : null)
const helpBlocks = computed(() => visibleCoachHelpBlocks(props.coach.helpApproach))
const correctCount = computed(() => attempts.value.filter(item => item.status === 'correct').length)
const score = computed(() => attempts.value.length
  ? Math.round(correctCount.value / attempts.value.length * 100)
  : 0)
const omitIndicativeMode = computed(() => areOnlyIndicativeTenses(props.tenses))
const attemptSummaries = computed(() => attempts.value.map((attempt, index) => {
  const bubbles = coachQuestionBubbles(attempt.question, { omitIndicativeMode: omitIndicativeMode.value })
  const formula = omitIndicativeMode.value ? withoutIndicativeMode(bubbles.formula) : bubbles.formula
  return {
    index: index + 1,
    questionIndex: index,
    status: attempt.status,
    questionLabel: formula,
    learnerAnswer: attempt.answer,
    expectedAnswer: attempt.question.reponsesPourCorrige.join(' ou ') || attempt.question.reponses.join(' ou '),
  }
}))
const hasIncorrectMedia = computed(() => props.coach.assignments.some(assignment => assignment.isActive
  && assignment.eventType === 'incorrect'
  && props.coach.media.some(item => item.id === assignment.mediaId
    && item.isActive
    && item.category === 'encouragement'
    && (item.mediaType === 'animation' || item.mediaType === 'emoji'))))

function normalizedInfinitive(value?: string | null) {
  return (value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLocaleLowerCase('fr')
}

function randomIdentifier(prefix: string) {
  const cryptoId = globalThis.crypto?.randomUUID?.()
  return `${prefix}-${cryptoId || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`}`
}

function resetExerciseRunId() {
  exerciseRunId.value = randomIdentifier('exercise')
}

function compactVerb(verb: Verb) {
  return {
    id: verb.id,
    infinitif: verb.infinitif,
    meaning: verb.meaning,
    auxiliaire: verb.auxiliaire,
    participePasse: verb.participePasse,
    groupeConjugaison: verb.groupeConjugaison,
    familleConjugaison: verb.familleConjugaison,
    particularites: verb.particularites,
  }
}

function compactTense(tense: ConjugationTense) {
  return {
    id: tense.id,
    name: tense.name,
    code: tense.code,
    modeId: tense.modeId,
    mode: tense.mode,
    isCompound: tense.isCompound,
    selected: tense.selected,
  }
}

const helpValues = computed(() => helpQuestion.value ? {
  coach: props.coach,
  ...coachHelpQuestionVariables(helpQuestion.value, helpVerb.value, helpTense.value),
  definition: helpVerb.value?.meaning?.trim() || targetedHelp.value?.meaning || '',
  helpTitle: targetedHelp.value?.title || '',
  omitIndicativeMode: omitIndicativeMode.value,
} : { coach: props.coach })
const helpFeedbackContext = computed(() => {
  const questionIndex = helpQuestionIndex.value ?? currentIndex.value
  const question = helpQuestion.value
  return {
    sessionId: chatSessionId.value,
    exerciseRunId: exerciseRunId.value,
    capturedAt: new Date().toISOString(),
    coachId: props.coach.id,
    coachName: props.coach.firstName,
    coach: {
      id: props.coach.id,
      slug: props.coach.slug,
      firstName: props.coach.firstName,
      caractereId: props.coach.caractereId,
      caractereName: props.coach.caractereName,
      pedagogicalStyle: props.coach.pedagogicalStyle,
      helpApproach: props.coach.helpApproach,
      themeColor: props.coach.themeColor,
    },
    caractereId: props.coach.caractereId,
    caractereName: props.coach.caractereName,
    helpApproach: props.coach.helpApproach,
    helpName: `Aide automatique — ${props.coach.caractereName}`,
    questionNumber: question ? questionIndex + 1 : undefined,
    questionIndex,
    questionCount: props.questions.length,
    verbId: question?.verbeId,
    verb: question?.infinitif,
    tenseId: question?.tenseId,
    tense: question?.temps,
    mode: question?.mode,
    person: question?.pronom || question?.saisiePrefixe,
    expectedAnswer: question?.reponsesPourCorrige.join(' ou '),
    currentAnswerDraft: answer.value,
    currentQuestion: question || null,
    currentVerb: helpVerb.value || null,
    currentTense: helpTense.value || null,
    exerciseContext: {
      currentIndex: currentIndex.value,
      questionCount: props.questions.length,
      questions: props.questions,
      selectedVerbs: props.verbs.map(compactVerb),
      selectedTenses: props.tenses.map(compactTense),
      omitIndicativeMode: omitIndicativeMode.value,
      score: score.value,
      correctCount: correctCount.value,
      consecutiveCorrectCount: consecutiveCorrectCount.value,
      waitingForNext: waitingForNext.value,
      finished: finished.value,
    },
    attempts: attempts.value,
    messages: messages.value,
  }
})

function openHelp(candidate: string) {
  addMessage('learner', candidate)
  answer.value = ''
  helpQuestionIndex.value = null
  helpOpen.value = true
  restartHelpReminderTimer()
}

function openHelpForQuestion(questionIndex: number) {
  if (!Number.isInteger(questionIndex) || !props.questions[questionIndex]) return
  helpQuestionIndex.value = questionIndex
  helpOpen.value = true
  restartHelpReminderTimer()
}

function showLatestHelp() {
  helpQuestionIndex.value = null
  helpOpen.value = true
  restartHelpReminderTimer()
  scrollThreadToBottom()
}

function closeHelp() {
  helpOpen.value = false
  helpQuestionIndex.value = null
  focusAnswerInput()
}

function focusAnswerInput() {
  void nextTick(() => {
    window.requestAnimationFrame(() => input.value?.focus({ preventScroll: true }))
  })
}

function scrollThreadToBottom() {
  void nextTick(() => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const container = thread.value
        container?.scrollTo({
          top: container.scrollHeight,
          behavior: allowMotion.value ? 'smooth' : 'auto',
        })
      })
    })
  })
}

function scrollThreadToSummary() {
  void nextTick(() => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const container = thread.value
        const target = summary.value
        if (!container || !target) return
        const top = container.scrollTop + target.getBoundingClientRect().top - container.getBoundingClientRect().top - 8
        container.scrollTo({ top, behavior: allowMotion.value ? 'smooth' : 'auto' })
      })
    })
  })
}

function scrollThreadToMessage(messageId: number) {
  if (questionScrollFrame !== null) window.cancelAnimationFrame(questionScrollFrame)
  void nextTick(() => {
    questionScrollFrame = window.requestAnimationFrame(() => {
      questionScrollFrame = window.requestAnimationFrame(() => {
        questionScrollFrame = null
        const container = thread.value
        const target = container?.querySelector<HTMLElement>(`[data-chat-message-id="${messageId}"]`)
        if (!container || !target) return
        const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 4
        container.scrollTo({
          top: Math.max(0, top),
          behavior: allowMotion.value ? 'smooth' : 'auto',
        })
      })
    })
  })
}

function revealChatMessageEnd(messageId: number) {
  void nextTick(() => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const container = thread.value
        const target = container?.querySelector<HTMLElement>(`[data-chat-message-id="${messageId}"]`)
        if (!container || !target) return
        const overflow = target.getBoundingClientRect().bottom - container.getBoundingClientRect().bottom
        if (overflow <= 0) return
        // Le rappel doit être visible immédiatement : un second défilement fluide peut
        // interrompre celui de l'annonce précédente et ne laisser voir que la bordure.
        container.scrollTo({ top: container.scrollTop + overflow + 12, behavior: 'auto' })
      })
    })
  })
}

function mediaLoaded() {
  scrollThreadToBottom()
}

function addMessage(author: ChatMessage['author'], text: string, tone?: ChatMessage['tone'], questionIndex?: number) {
  messages.value.push({ id: ++sequence.value, author, text, ...(tone ? { tone } : {}), ...(questionIndex === undefined ? {} : { questionIndex }) })
  scrollThreadToBottom()
}

function contextFor(question?: ExerciseQuestion): CoachMessageContext {
  const reminder = question?.agreementReminder
  const instruction = question ? [question.instruction, question.consigne].filter(Boolean).join('\n') : undefined
  return {
    instruction: instruction && omitIndicativeMode.value ? withoutIndicativeMode(instruction) : instruction,
    verb: question?.infinitif || reminder?.infinitive,
    complement: reminder?.complement || question?.complement,
    participle: reminder?.participle,
    gender: reminder?.gender === 'feminin' ? 'féminin' : reminder?.gender === 'masculin' ? 'masculin' : undefined,
    number: reminder?.number || undefined,
    mode: question?.mode,
    tense: question?.temps,
    expectedAnswer: question?.reponsesPourCorrige.join(' ou '),
    questionNumber: question ? currentIndex.value + 1 : undefined,
  }
}

function wait(milliseconds: number) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds))
}

function clearHelpReminderTimer() {
  if (helpReminderTimer === null) return
  window.clearTimeout(helpReminderTimer)
  helpReminderTimer = null
}

function restartHelpReminderTimer() {
  clearHelpReminderTimer()
  if (waitingForNext.value || posingQuestion.value || finished.value || !currentQuestion.value) return
  const version = conversationVersion
  const questionIndex = currentIndex.value
  helpReminderTimer = window.setTimeout(() => {
    helpReminderTimer = null
    if (version !== conversationVersion || questionIndex !== currentIndex.value
      || waitingForNext.value || posingQuestion.value || finished.value) return
    void suggestHelp()
  }, CHAT_HELP_REMINDER_DELAY_MS)
}

function enqueueCoachBubble(createMessage: () => Omit<ChatMessage, 'id' | 'author'>) {
  const version = conversationVersion
  coachQueue = coachQueue.then(async () => {
    const remainingDelay = Math.max(0, CHAT_BUBBLE_DELAY_MS - (Date.now() - lastCoachBubbleAt))
    if (remainingDelay) await wait(remainingDelay)
    if (version !== conversationVersion) return
    messages.value.push({ id: ++sequence.value, author: 'coach', ...createMessage() })
    lastCoachBubbleAt = Date.now()
    scrollThreadToBottom()
  })
  return coachQueue
}

function addCoachText(text: string, tone?: ChatMessage['tone'], emphasis = false) {
  return enqueueCoachBubble(() => ({ text, ...(tone ? { tone } : {}), ...(emphasis ? { emphasis: true } : {}) }))
}

async function addHelpReminderCard() {
  await enqueueCoachBubble(() => ({
    text: coachHelpReminderMessage(helpOpen.value),
    kind: 'help-reminder',
    helpAlreadyOpen: helpOpen.value,
  }))
  const reminder = messages.value.at(-1)
  if (reminder?.kind === 'help-reminder') revealChatMessageEnd(reminder.id)
}

async function suggestHelp() {
  const question = currentQuestion.value
  if (!question || finished.value) return
  await addCoachReaction('help-announcement', contextFor(question))
  await addHelpReminderCard()
}

function addAnswerComparison(
  learnerAnswer: string,
  expectedAnswers: readonly string[],
  displayExpectedAnswers: readonly string[],
) {
  const answerComparison = buildAnswerComparison(learnerAnswer, expectedAnswers, displayExpectedAnswers)
  if (!answerComparison) return Promise.resolve()
  return enqueueCoachBubble(() => ({ text: '', tone: 'error', answerComparison }))
}

async function addCoachReaction(eventType: CoachEvent, context: CoachMessageContext, tone?: ChatMessage['tone']) {
  const rule = props.coach.rules.find(item => item.eventType === eventType)
  const cooledDown = currentIndex.value - lastMediaQuestion.value >= (rule?.cooldownQuestions || 0)
  const reaction = createVariedCoachReaction(props.coach, eventType, context, dialogueState, {
    allowMotion: allowMotion.value,
    mediaAllowed: chatReactionAllowsMedia(eventType, cooledDown, hasIncorrectMedia.value),
  })
  if (!reaction.text.trim() && !reaction.media) return false
  if (reaction.media) {
    lastMediaQuestion.value = currentIndex.value
  }
  const text = omitIndicativeMode.value ? withoutIndicativeMode(reaction.text) : reaction.text
  await enqueueCoachBubble(() => ({ text, ...(tone ? { tone } : {}), ...(reaction.media ? { media: reaction.media } : {}) }))
  return true
}

async function askCurrentQuestion() {
  const question = currentQuestion.value
  if (!question) return
  posingQuestion.value = true
  const firstQuestionMessageId = sequence.value + 1
  if (currentIndex.value > 0) await addCoachReaction('question', contextFor(question))
  if (question.instruction) await addCoachText(question.instruction, undefined, true)
  const bubbles = coachQuestionBubbles(question, { omitIndicativeMode: omitIndicativeMode.value })
  await addCoachText(bubbles.formula, undefined, true)
  if (bubbles.sentence) await addCoachText(bubbles.sentence, undefined, true)
  posingQuestion.value = false
  restartHelpReminderTimer()
  scrollThreadToMessage(firstQuestionMessageId)
  focusAnswerInput()
}

async function runChatOpening(eventType: Extract<CoachEvent, 'introduction' | 'restart'>) {
  const version = conversationVersion
  posingQuestion.value = true

  await wait(CHAT_HELP_OPEN_DELAY_MS)
  if (version !== conversationVersion) return
  helpQuestionIndex.value = null
  helpOpen.value = true

  await wait(CHAT_MESSAGES_AFTER_HELP_DELAY_MS)
  if (version !== conversationVersion) return
  await addCoachReaction(eventType, {})
  if (version !== conversationVersion) return
  await askCurrentQuestion()
}

async function submit() {
  const question = currentQuestion.value
  const candidate = answer.value.trim()
  if (!question || !candidate || waitingForNext.value || posingQuestion.value || finished.value) return
  clearHelpReminderTimer()
  if (isHelpCommand(candidate)) {
    openHelp(candidate)
    return
  }
  const version = conversationVersion

  addMessage('learner', candidate, undefined, currentIndex.value)
  lastCoachBubbleAt = Date.now()
  const result = validateAnswer(candidate, question.reponses)
  answer.value = ''

  attempts.value.push({
    question,
    answer: candidate,
    status: result.isCorrect ? 'correct' : 'incorrect',
    ...(result.matchedAnswer ? { matchedAnswer: result.matchedAnswer } : {})
  })
  consecutiveCorrectCount.value = nextConsecutiveCorrectCount(consecutiveCorrectCount.value, result.isCorrect)
  consecutiveIncorrectCount.value = nextConsecutiveIncorrectCount(consecutiveIncorrectCount.value, result.isCorrect)
  const shouldSuggestHelp = consecutiveIncorrectCount.value >= CHAT_HELP_REMINDER_INCORRECT_COUNT
  const reachedStreak = consecutiveCorrectCount.value === COACH_STREAK_LENGTH
  waitingForNext.value = true
  deliveringFeedback.value = true

  const alternatives = result.isCorrect ? getAlternativeCorrections(candidate, question.reponsesPourCorrige) : []
  const diagnostic = diagnoseCoachAnswer(candidate, question, result.isCorrect)
  const incorrectEvent = diagnostic.errorKind === 'agreement' && question.agreementReminder
    ? question.agreementReminder.kind
    : 'incorrect'
  const plan = answerTurnPlan({
    correct: result.isCorrect,
    hasAlternative: alternatives.length > 0,
    streak: reachedStreak,
    hasNext: currentIndex.value < props.questions.length - 1,
    incorrectEvent,
  })
  nextQuestionDelay.value = result.isCorrect ? CHAT_CORRECT_DELAY_MS : CHAT_INCORRECT_DELAY_MS
  let comparisonDisplayed = false
  for (const step of plan) {
    if (step.kind === 'reaction') {
      const isIncorrectReaction = step.eventType === 'incorrect' || step.eventType === 'cod-before'
        || step.eventType === 'cod-after' || step.eventType === 'coi'
      const isCorrectReaction = step.eventType === 'correct' || step.eventType === 'correct-alternative' || step.eventType === 'streak'
      const displayed = await addCoachReaction(step.eventType, contextFor(question), isIncorrectReaction ? 'error' : isCorrectReaction ? 'success' : undefined)
      if (!displayed && isIncorrectReaction && step.eventType !== 'incorrect') {
        await addCoachReaction('incorrect', contextFor(question), 'error')
      }
      if (isIncorrectReaction && !comparisonDisplayed) {
        // Le texte de correction peut contenir tout le contexte de la phrase
        // (« Ce sont… que j’… »), alors que l'élève ne saisit que les blancs.
        // On compare donc en priorité avec les formes réellement validées.
        const officialAnswers = question.reponses.length ? question.reponses : question.reponsesPourCorrige
        await addAnswerComparison(candidate, officialAnswers, question.reponsesPourCorrige)
        comparisonDisplayed = true
      }
      if (step.eventType === 'streak') consecutiveCorrectCount.value = 0
    }
  }
  if (shouldSuggestHelp) {
    await suggestHelp()
    consecutiveIncorrectCount.value = 0
  }
  deliveringFeedback.value = false
  const delay = plan.find(step => step.kind === 'delay')
  await wait(delay?.kind === 'delay' ? delay.milliseconds : 0)
  if (version === conversationVersion && waitingForNext.value && !finished.value) await continueChat()
}

async function continueChat() {
  if (!waitingForNext.value || deliveringFeedback.value) return
  if (currentIndex.value >= props.questions.length - 1) {
    const version = conversationVersion
    finished.value = true
    waitingForNext.value = false
    finalSummaryPreparing.value = true
    scrollThreadToBottom()
    await wait(2000)
    if (version !== conversationVersion) return
    finalSummaryPreparing.value = false
    finalSummaryVisible.value = true
    scrollThreadToSummary()
    return
  }

  currentIndex.value += 1
  waitingForNext.value = false
  await askCurrentQuestion()
}

async function restart() {
  conversationVersion += 1
  restartError.value = ''
  resetExerciseRunId()
  coachQueue = Promise.resolve()
  lastCoachBubbleAt = 0
  dialogueState = createCoachDialogueState()
  currentIndex.value = 0
  answer.value = ''
  attempts.value = []
  messages.value = []
  waitingForNext.value = false
  deliveringFeedback.value = false
  posingQuestion.value = false
  consecutiveCorrectCount.value = 0
  consecutiveIncorrectCount.value = 0
  finished.value = false
  finalSummaryPreparing.value = false
  finalSummaryVisible.value = false
  printSummaryOpen.value = false
  helpOpen.value = false
  helpQuestionIndex.value = null
  lastMediaQuestion.value = -100
  await runChatOpening('restart')
}

async function restartWithNewQuestions() {
  if (regeneratingQuestions.value) return
  regeneratingQuestions.value = true
  restartError.value = ''
  try {
    await props.regenerateQuestions()
    await nextTick()
    await restart()
  } catch {
    restartError.value = 'Impossible de préparer de nouvelles questions. Le défi actuel reste disponible.'
  } finally {
    regeneratingQuestions.value = false
  }
}

function requestClose() {
  closeConfirmationOpen.value = true
  nextTick(() => keepChatButton.value?.focus())
}

function handleEscapeClose() {
  if (printSummaryOpen.value) printSummaryOpen.value = false
  else if (closeConfirmationOpen.value) cancelClose()
  else if (helpOpen.value) closeHelp()
  else requestClose()
}

function cancelClose() {
  closeConfirmationOpen.value = false
  nextTick(() => (finished.value ? dialog.value : input.value)?.focus())
}

function confirmClose() {
  closeConfirmationOpen.value = false
  emit('close')
}

onMounted(async () => {
  chatSessionId.value = randomIdentifier('chat')
  resetExerciseRunId()
  allowMotion.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  await runChatOpening('introduction')
})

onBeforeUnmount(() => {
  clearHelpReminderTimer()
  if (questionScrollFrame !== null) window.cancelAnimationFrame(questionScrollFrame)
  conversationVersion += 1
})
</script>

<template>
  <Teleport to="body">
    <div class="chat-overlay" @click.self="requestClose">
      <div ref="chat-dialogs" class="chat-dialogs" :class="{ 'chat-dialogs--with-help': helpOpen, 'chat-dialogs--confirming': closeConfirmationOpen }" :style="{ '--coach-color': coach.themeColor }" role="dialog" aria-modal="true" aria-labelledby="chat-title" tabindex="-1" @click.self="requestClose">
      <section class="chat-dialog" role="region" aria-labelledby="chat-title">
        <header class="chat-header">
          <img class="coach-avatar" :src="coach.avatarPath" alt="">
          <div class="chat-header__identity">
            <h2 id="chat-title">{{ coach.firstName }}</h2>
            <p v-if="coach.likes" class="chat-header__likes"><strong>Aime&nbsp;:</strong> {{ coach.likes }}</p>
          </div>
          <div class="chat-header__actions">
            <button type="button" class="chat-close" aria-label="Quitter le chat" @click="requestClose">×</button>
          </div>
        </header>

        <div class="chat-progress" aria-label="Progression">
          <span :style="{ width: `${finished ? 100 : (currentIndex / questions.length) * 100}%` }" />
        </div>

        <div v-if="!finished && currentQuestion" class="chat-instruction">
          <span>Question {{ currentIndex + 1 }}/{{ questions.length }}</span>
        </div>

        <div ref="chat-thread" class="chat-thread" aria-live="polite">
          <div
            v-for="message in messages"
            :key="message.id"
            class="chat-message"
            :data-chat-message-id="message.id"
            :class="[
              `chat-message--${message.author}`,
              message.tone ? `chat-message--${message.tone}` : '',
              { 'chat-message--comparison': !!message.answerComparison },
              { 'chat-message--help-reminder': message.kind === 'help-reminder' },
              { 'chat-message--help-link': message.author === 'learner' && message.questionIndex !== undefined },
              { 'is-help-selected': helpOpen && message.questionIndex !== undefined && message.questionIndex === helpQuestionIndex },
            ]"
            :role="message.author === 'learner' && message.questionIndex !== undefined ? 'button' : undefined"
            :tabindex="message.author === 'learner' && message.questionIndex !== undefined ? 0 : undefined"
            :aria-label="message.author === 'learner' && message.questionIndex !== undefined ? `Voir l’aide de la question ${message.questionIndex + 1} pour la réponse ${message.text}` : undefined"
            @click="message.author === 'learner' && message.questionIndex !== undefined && openHelpForQuestion(message.questionIndex)"
            @keydown.enter.prevent="message.author === 'learner' && message.questionIndex !== undefined && openHelpForQuestion(message.questionIndex)"
            @keydown.space.prevent="message.author === 'learner' && message.questionIndex !== undefined && openHelpForQuestion(message.questionIndex)"
          >
            <div v-if="message.kind === 'help-reminder'" class="chat-help-reminder">
              <span class="chat-help-reminder__icon" aria-hidden="true">?</span>
              <span class="chat-help-reminder__content">
                <strong>Besoin d’un coup de pouce&nbsp;?</strong>
                <span>{{ message.text }}<template v-if="!message.helpAlreadyOpen">, ou clique sur ce bouton&nbsp;:</template></span>
                <button v-if="!message.helpAlreadyOpen" type="button" class="chat-help-reminder__button" @click="showLatestHelp">
                  Ouvrir l’aide
                </button>
              </span>
            </div>
            <div v-else-if="message.answerComparison" class="answer-comparison">
              <strong>{{ message.answerComparison.mode === 'focused' ? 'Regarde où ça change :' : 'Repars de la correction complète :' }}</strong>
              <div class="answer-comparison__line answer-comparison__line--learner">
                <small>Ta réponse</small>
                <p>
                  <span
                    v-for="(part, partIndex) in message.answerComparison.learnerParts"
                    :key="`learner-${partIndex}`"
                    :class="`answer-comparison__part--${part.kind}`"
                  >{{ part.text }}</span>
                </p>
              </div>
              <div class="answer-comparison__line answer-comparison__line--expected">
                <small>Correction</small>
                <p>
                  <span
                    v-for="(part, partIndex) in message.answerComparison.expectedParts"
                    :key="`expected-${partIndex}`"
                    :class="`answer-comparison__part--${part.kind}`"
                  >{{ part.text }}</span>
                </p>
              </div>
              <small v-if="message.answerComparison.mode === 'full'" class="answer-comparison__guidance">
                Les deux réponses sont très différentes : observe d’abord la construction complète.
              </small>
            </div>
            <span
              v-else-if="message.text && message.author === 'coach'"
              class="chat-message__text"
              :class="{ 'chat-message__text--emphasis': message.emphasis }"
              v-html="sanitizeCoachHtml(message.text)"
            />
            <strong v-else-if="message.text && message.emphasis">{{ message.text }}</strong>
            <span v-else-if="message.text">{{ message.text }}</span>
            <video v-if="message.media?.mediaType === 'video'" :src="message.media.filePath" :aria-label="message.media.altText" muted playsinline controls @loadedmetadata="mediaLoaded" />
            <img v-else-if="message.media" :class="{ 'chat-media--emoji': message.media.mediaType === 'emoji' }" :src="message.media.filePath" :alt="message.media.altText" @load="mediaLoaded">
          </div>

          <div v-if="finalSummaryPreparing" class="chat-summary-loading" role="status" aria-live="polite">
            <span aria-hidden="true" />
            <strong>Création du bilan</strong>
          </div>

          <section v-if="finalSummaryVisible" ref="chat-summary" class="chat-summary-tool" aria-labelledby="chat-summary-title">
            <header>
              <div>
                <h3 id="chat-summary-title">Bilan du défi</h3>
              </div>
              <strong>{{ score }} %</strong>
            </header>
            <ol class="chat-summary-list">
              <li
                v-for="item in attemptSummaries"
                :key="item.index"
                :class="[`is-${item.status}`, { 'is-help-selected': helpOpen && item.questionIndex === helpQuestionIndex }]"
                :style="{ '--summary-item-index': `${item.index - 1}` }"
                role="button"
                tabindex="0"
                :aria-label="`Voir l’aide de la question ${item.index} : ${item.questionLabel}`"
                @click="openHelpForQuestion(item.questionIndex)"
                @keydown.enter.prevent="openHelpForQuestion(item.questionIndex)"
                @keydown.space.prevent="openHelpForQuestion(item.questionIndex)"
              >
                <span class="chat-summary-list__status" aria-hidden="true">{{ item.status === 'correct' ? '✓' : '×' }}</span>
                <div>
                  <strong class="chat-summary-list__question">
                    <span>Question {{ item.index }}</span>
                    <span>{{ item.questionLabel }}</span>
                  </strong>
                  <dl>
                    <div>
                      <dt>Réponse donnée</dt>
                      <dd>{{ item.learnerAnswer }}</dd>
                    </div>
                    <div>
                      <dt>Bonne réponse</dt>
                      <dd>{{ item.expectedAnswer }}</dd>
                    </div>
                  </dl>
                </div>
              </li>
            </ol>
            <footer>
              <strong>{{ correctCount }} / {{ attempts.length }}</strong>
              <span>réponse{{ correctCount > 1 ? 's' : '' }} juste{{ correctCount > 1 ? 's' : '' }}</span>
            </footer>
          </section>

          <div v-if="finalSummaryVisible" class="chat-message chat-message--coach chat-restart-prompt">
            <span>Tu veux refaire ce défi&nbsp;?</span>
            <div class="chat-restart-prompt__actions">
              <button type="button" class="chat-restart-prompt__same" :disabled="regeneratingQuestions" @click="restart">Avec les mêmes questions</button>
              <button type="button" class="chat-restart-prompt__new" :disabled="regeneratingQuestions" @click="restartWithNewQuestions">
                {{ regeneratingQuestions ? 'Préparation…' : 'Avec d’autres questions' }}
              </button>
              <button type="button" class="chat-restart-prompt__quit" :disabled="regeneratingQuestions" @click="emit('close')">Quitter le chat</button>
              <button type="button" class="chat-restart-prompt__print" :disabled="regeneratingQuestions" @click="printSummaryOpen = true">Imprimer le bilan</button>
            </div>
            <small v-if="restartError" class="chat-restart-prompt__error" role="alert">{{ restartError }}</small>
          </div>
        </div>

        <form v-if="!finished" class="chat-composer" @submit.prevent="submit">
          <label class="sr-only" for="chat-answer">Ta réponse</label>
          <input
            id="chat-answer"
            ref="chat-answer"
            v-model="answer"
            type="text"
            autocomplete="off"
            :disabled="waitingForNext"
            :placeholder="helpOpen ? 'Écris ta réponse…' : 'Écris ta réponse ou « Aide »…'"
          >
          <button type="submit" :disabled="waitingForNext || posingQuestion || deliveringFeedback || !answer.trim()">
            {{ posingQuestion ? 'Question…' : deliveringFeedback ? 'Réponse…' : waitingForNext ? 'Suite…' : 'Envoyer' }}
          </button>
        </form>

        <button
          v-if="helpOpen && helpQuestionIndex !== null"
          type="button"
          class="chat-latest-help"
          :class="{ 'chat-latest-help--above-composer': !finished }"
          :aria-label="finished ? 'Revenir à l’aide de la dernière question' : 'Revenir à l’aide de la question actuelle'"
          :title="finished ? 'Voir l’aide de la dernière question' : 'Voir l’aide de la question actuelle'"
          @click="showLatestHelp"
        >
          <span aria-hidden="true">↓</span>
        </button>

        <div v-if="closeConfirmationOpen" class="chat-close-confirmation" @click.self="cancelClose">
          <section role="alertdialog" aria-modal="true" aria-labelledby="chat-close-title" aria-describedby="chat-close-description">
            <span class="chat-close-confirmation__icon" aria-hidden="true">?</span>
            <h3 id="chat-close-title">Quitter le chat ?</h3>
            <p id="chat-close-description">Ta progression actuelle sera perdue.</p>
            <div class="chat-close-confirmation__actions">
              <button ref="keep-chat-button" class="secondary-button" type="button" @click="cancelClose">Continuer l’exercice</button>
              <button class="primary-button chat-close-confirmation__leave" type="button" @click="confirmClose">Quitter</button>
            </div>
          </section>
        </div>
      </section>

      <Transition name="chat-help" appear>
        <CoachHelpPanel
          v-if="helpOpen && targetedHelp"
          :blocks="helpBlocks"
          :values="helpValues"
          header-title="{helpTitle}"
          header-description=""
          :question-number="(helpQuestionIndex ?? currentIndex) + 1"
          :coach-color="coach.themeColor"
          :feedback-context="helpFeedbackContext"
          @content-scroll="restartHelpReminderTimer"
          @close="closeHelp"
        />
      </Transition>
      </div>
      <ExerciseSummaryPrintPreview
        v-if="printSummaryOpen"
        :items="attemptSummaries"
        :score="score"
        :correct-count="correctCount"
        :verbs="verbs.map(verb => verb.infinitif)"
        :tenses="tenses.map(tense => ({ name: tense.name, mode: tense.mode?.name }))"
        @close="printSummaryOpen = false"
      />
    </div>
  </Teleport>
</template>

<style scoped>
.chat-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(25 44 58 / 68%);
  backdrop-filter: blur(5px);
}

.chat-dialogs {
  position: relative;
  display: flex;
  width: min(760px, calc(100vw - 40px));
  height: min(760px, calc(100vh - 40px));
  min-width: 0;
  gap: 16px;
  outline: none;
  transition: width .24s ease;
}

.chat-dialogs :deep(:is(strong, b, h1, h2, h3, h4, h5, h6, button, dt, dd, summary)),
.chat-dialogs :deep(.chat-message__text--emphasis),
.chat-dialogs :deep(.chat-instruction > span),
.chat-dialogs :deep(.chat-help-requested-form),
.chat-dialogs :deep(.coach-help-block--header > .coach-help-block__content) {
  letter-spacing: .03em;
}

.chat-dialogs--with-help {
  width: min(1240px, calc(100vw - 40px));
  transition-duration: .5s;
  transition-timing-function: ease-out;
}

.chat-dialogs :deep(.coach-help-badge) {
  transition: opacity .15s ease, visibility .15s ease;
}

.chat-dialogs--confirming :deep(.coach-help-badge) {
  visibility: hidden;
  opacity: 0;
}

.chat-dialog {
  position: relative;
  display: grid;
  min-width: 0;
  height: 100%;
  flex: 1 1 760px;
  grid-template-rows: auto 4px auto minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 50%);
  border-radius: 24px;
  background: #eef7fa;
  box-shadow: 0 30px 80px rgb(12 29 39 / 35%);
}

.chat-help-dialog {
  display: grid;
  width: min(440px, 38vw);
  min-width: 360px;
  height: 100%;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 68%);
  border-radius: 24px;
  color: #263b43;
  background: #f8fcfb;
  box-shadow: 0 30px 80px rgb(12 29 39 / 32%);
}

.chat-help-header {
  display: flex;
  padding: 22px 22px 18px;
  align-items: flex-start;
  gap: 16px;
  color: white;
  background: linear-gradient(135deg, var(--coach-color, #295f72), #187b83);
}

.chat-help-header > div {
  min-width: 0;
  flex: 1;
}

.chat-help-header h2,
.chat-help-header p {
  margin: 0;
}

.chat-help-header h2 {
  font-size: 1.35rem;
  line-height: 1.15;
}

.chat-help-header p {
  margin-top: 6px;
  color: rgb(255 255 255 / 84%);
  font-size: .9rem;
}

.chat-help-header button {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border: 1px solid rgb(255 255 255 / 58%);
  border-radius: 12px;
  color: white;
  background: rgb(255 255 255 / 10%);
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
}

.chat-help-header button:hover,
.chat-help-header button:focus-visible {
  background: rgb(255 255 255 / 22%);
}

.chat-help-content {
  display: flex;
  overflow-y: auto;
  padding: 16px;
  flex-direction: column;
  gap: 12px;
}

.chat-help-card {
  padding: 16px;
  border: 1px solid #cfe0dc;
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 14px rgb(37 75 78 / 6%);
}

.chat-help-card h3 {
  display: flex;
  margin: 0 0 11px;
  align-items: center;
  gap: 9px;
  color: #17566a;
  font-size: .96rem;
}

.chat-help-card h3 > span {
  display: inline-grid;
  width: 25px;
  height: 25px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  color: white;
  background: #267a87;
  font-size: .76rem;
}

.chat-help-card p {
  margin: 0;
  line-height: 1.52;
}

.chat-help-custom-content {
  margin-bottom: 12px !important;
  color: #405b63;
  white-space: pre-line;
}

.chat-help-card--intro,
.chat-help-card--custom {
  border-color: color-mix(in srgb, var(--coach-color, #295f72) 28%, #cfe0dc);
  background: color-mix(in srgb, var(--coach-color, #295f72) 5%, white);
}

.chat-help-requested-form {
  margin-bottom: 10px !important;
  color: #17566a;
  font-weight: 850;
}

.chat-help-meaning {
  color: #405b63;
}

.chat-help-card dl {
  display: grid;
  margin: 14px 0 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.chat-help-card dl > div {
  padding: 9px 10px;
  border-radius: 10px;
  background: #eef6f4;
}

.chat-help-card dt {
  color: #6b7e81;
  font-size: .67rem;
  font-weight: 800;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.chat-help-card dd {
  margin: 3px 0 0;
  color: #25484f;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.chat-help-endings {
  display: grid;
  margin-top: 12px;
  padding: 11px 12px;
  gap: 3px;
  border-left: 4px solid #d59a1c;
  border-radius: 5px 10px 10px 5px;
  background: #fff7df;
}

.chat-help-endings strong {
  color: #7d5709;
  font-size: .76rem;
  text-transform: uppercase;
}

.chat-help-endings span {
  line-height: 1.45;
}

.chat-help-exception {
  display: grid;
  margin-top: 12px;
  padding: 12px;
  gap: 4px;
  border: 2px solid #c8753d;
  border-radius: 11px;
  color: #653515;
  background: #fff0e5;
}

.chat-help-exception strong {
  font-size: .76rem;
  letter-spacing: .05em;
  text-transform: uppercase;
}

.chat-help-exception span {
  line-height: 1.45;
}

.chat-help-card ul,
.chat-help-card ol {
  margin: 0;
  padding-left: 1.25rem;
}

.chat-help-card li {
  padding-left: .25rem;
  line-height: 1.48;
}

.chat-help-card li + li {
  margin-top: 7px;
}

.chat-help-card--warning {
  border-color: #ead7a6;
  background: #fffbef;
}

.chat-help-card--warning h3 {
  color: #76530c;
}

.chat-help-card--warning h3 > span {
  color: #4c3504;
  background: #e1ad3d;
}

.chat-help-footer {
  display: grid;
  padding: 14px 16px 16px;
  gap: 10px;
  border-top: 1px solid #d6e4e1;
  background: white;
}

.chat-help-footer p {
  margin: 0;
  color: #65797e;
  font-size: .75rem;
  text-align: center;
}

.chat-help-footer button {
  padding: 11px 16px;
  border: 0;
  border-radius: 12px;
  color: white;
  background: #176b87;
  cursor: pointer;
  font-weight: 800;
}

.chat-help-enter-active {
  transform-origin: right center;
  transition: opacity .5s ease-out, transform .5s ease-out;
  will-change: opacity, transform;
}

.chat-help-leave-active {
  transform-origin: right center;
  transition: opacity .18s ease-in, transform .2s ease-in;
}

.chat-help-enter-from,
.chat-help-leave-to {
  opacity: 0;
  transform: translateX(32px) scale(.975);
}

:global(:root[data-theme='dark'] .chat-help-dialog) {
  color: #dce8e9;
  border-color: #60777d;
  background: #13262b;
}

:global(:root[data-theme='dark'] .chat-help-card),
:global(:root[data-theme='dark'] .chat-help-footer) {
  border-color: #3e595d;
  background: #1b3035;
}

:global(:root[data-theme='dark'] .chat-help-card h3) {
  color: #b5e4e7;
}

:global(:root[data-theme='dark'] .chat-help-requested-form) {
  color: #b5e4e7;
}

:global(:root[data-theme='dark'] .chat-help-meaning),
:global(:root[data-theme='dark'] .chat-help-footer p) {
  color: #bfd0d2;
}

:global(:root[data-theme='dark'] .chat-help-card dl > div) {
  background: #243e42;
}

:global(:root[data-theme='dark'] .chat-help-card dt) {
  color: #a8bdc0;
}

:global(:root[data-theme='dark'] .chat-help-card dd) {
  color: #edf5f5;
}

:global(:root[data-theme='dark'] .chat-help-endings) {
  color: #f4e4bb;
  background: #3b321b;
}

:global(:root[data-theme='dark'] .chat-help-endings strong) {
  color: #f1cb71;
}

:global(:root[data-theme='dark'] .chat-help-exception) {
  color: #f3d1bd;
  border-color: #b96c3b;
  background: #3c271e;
}

:global(:root[data-theme='dark'] .chat-help-card--warning) {
  color: #f0e3c2;
  border-color: #665631;
  background: #332c1c;
}

:global(:root[data-theme='dark'] .chat-help-card--warning h3) {
  color: #f1ce78;
}

.chat-close-confirmation {
  position: fixed;
  z-index: 3;
  inset: 0;
  display: grid;
  padding: 22px;
  place-items: center;
  background: rgb(10 28 35 / 64%);
  backdrop-filter: blur(5px);
}

.chat-close-confirmation > section {
  width: min(440px, 100%);
  padding: 30px;
  text-align: center;
  border: 1px solid rgb(255 255 255 / 72%);
  border-radius: 22px;
  color: #26383f;
  background: #fbfdfd;
  box-shadow: 0 26px 70px rgb(8 25 32 / 34%);
}

.chat-close-confirmation__icon {
  display: grid;
  width: 52px;
  height: 52px;
  margin: 0 auto 15px;
  place-items: center;
  border-radius: 16px;
  color: white;
  background: var(--coach-color, #295f72);
  font-size: 1.65rem;
  font-weight: 850;
}

.chat-close-confirmation h3 {
  margin: 0;
  color: #244f60;
  font-size: 1.55rem;
}

.chat-close-confirmation p {
  margin: 8px 0 24px;
  color: #64777e;
}

.chat-close-confirmation__actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.chat-close-confirmation__leave {
  border-color: #a84b43;
  background: #a84b43;
}

.chat-close-confirmation__leave:hover:not(:disabled) {
  border-color: #873a34;
  background: #873a34;
}

:global(:root[data-theme='dark']) .chat-close-confirmation {
  background: rgb(5 16 21 / 76%);
}

:global(:root[data-theme='dark']) .chat-close-confirmation > section {
  color: #dce8ec;
  background: #17292e;
  border-color: #60777d;
}

:global(:root[data-theme='dark']) .chat-close-confirmation h3 {
  color: #b8dfe7;
}

:global(:root[data-theme='dark']) .chat-close-confirmation p {
  color: #b7c9cd;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 16px 20px;
  color: white;
  background: var(--coach-color, #295f72);
}

.coach-avatar {
  width: 120px;
  height: 120px;
  flex: 0 0 auto;
  object-fit: cover;
  border: 2px solid rgb(255 255 255 / 72%);
  border-radius: 50%;
  color: #244859;
  font-weight: 800;
  background: #aee4ee;
}

.chat-header h2,
.chat-header p {
  margin: 0;
}

.chat-header h2 {
  color: white;
  font-size: clamp(1.15rem, 2vw, 1.4rem);
  line-height: 1.15;
  letter-spacing: .015em;
}

.chat-header__identity {
  display: grid;
  min-width: 0;
  max-width: 560px;
  gap: 7px;
}

.chat-header__likes {
  width: fit-content;
  padding: 4px 9px;
  color: #e2f2f5;
  background: rgb(255 255 255 / 11%);
  border-radius: 999px;
  font-size: .82rem;
  line-height: 1.35;
}

.chat-header__likes strong {
  color: white;
}

.chat-header__actions {
  display: flex;
  margin-left: auto;
  align-items: center;
  gap: 8px;
}

.chat-header__actions button {
  border: 0;
  color: white;
  cursor: pointer;
}

.chat-close {
  padding: 4px;
  background: transparent;
  font-size: 1.8rem;
  line-height: 1;
}

.chat-progress {
  background: #d7e7ec;
}

.chat-progress span {
  display: block;
  height: 100%;
  background: #52b989;
  transition: width .25s ease;
}

.chat-instruction {
  display: flex;
  min-width: 0;
  padding: 13px 24px;
  align-items: baseline;
  gap: 12px;
  border-bottom: 1px solid #d4e4e9;
  background: #f8fcfd;
}

.chat-instruction span {
  flex: 0 0 auto;
  color: #59717d;
  font-size: .78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.chat-thread {
  display: flex;
  overflow-y: auto;
  flex-direction: column;
  gap: 10px;
  padding: 24px;
}

.chat-message {
  display: grid;
  width: fit-content;
  max-width: min(82%, 560px);
  padding: 11px 15px;
  border-radius: 17px 17px 17px 5px;
  line-height: 1.45;
  background: white;
  box-shadow: 0 3px 14px rgb(50 78 92 / 9%);
}

.chat-message > span,
.chat-message > strong {
  white-space: pre-line;
}

.chat-message__text--emphasis {
  font-weight: 800;
}

.chat-message__text :deep(p),
.chat-message__text :deep(blockquote),
.chat-message__text :deep(ul),
.chat-message__text :deep(ol) {
  margin: 0;
}

.chat-message__text :deep(p + p),
.chat-message__text :deep(p + ul),
.chat-message__text :deep(p + ol),
.chat-message__text :deep(ul + p),
.chat-message__text :deep(ol + p) {
  margin-top: .55em;
}

.chat-message__text :deep(ul),
.chat-message__text :deep(ol) {
  padding-left: 1.4em;
}

.chat-message img,
.chat-message video {
  width: min(320px, 100%);
  max-height: 220px;
  margin-top: 9px;
  object-fit: contain;
  border-radius: 11px;
}

.chat-message .chat-media--emoji {
  width: 3em;
  height: 3em;
  max-width: 3em;
  max-height: 3em;
  object-fit: contain;
}

.chat-message--learner {
  align-self: flex-end;
  border-radius: 17px 17px 5px 17px;
  color: white;
  background: #27758e;
}

.chat-message--help-link {
  cursor: pointer;
  transition: transform .16s ease, box-shadow .16s ease, outline-color .16s ease;
}

.chat-message--help-link:hover,
.chat-message--help-link:focus-visible {
  transform: translateY(-1px);
  outline: 3px solid rgb(111 203 224 / 72%);
  outline-offset: 2px;
  box-shadow: 0 7px 18px rgb(25 80 99 / 22%);
}

.chat-message--help-link.is-help-selected {
  outline: 3px solid #f0c64d;
  outline-offset: 2px;
}

.chat-latest-help {
  position: absolute;
  z-index: 4;
  right: 18px;
  bottom: 18px;
  display: grid;
  width: 64px;
  height: 58px;
  padding: 0;
  place-items: center;
  border: 5px solid #f0c64d;
  border-radius: 20px 20px 7px 20px;
  color: white;
  background: #27758e;
  box-shadow: 0 6px 18px rgb(25 80 99 / 25%);
  cursor: pointer;
  transition: transform .16s ease, box-shadow .16s ease, background-color .16s ease;
}

.chat-latest-help--above-composer {
  bottom: 84px;
}

.chat-latest-help > span {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transform: translateY(-1px);
}

.chat-latest-help:hover,
.chat-latest-help:focus-visible {
  outline: none;
  background: #1f657d;
  box-shadow: 0 9px 22px rgb(25 80 99 / 34%);
  transform: translateY(-2px);
}

.chat-message--success {
  color: #185f3c;
  background: #dcf5e7;
}

.chat-message--error {
  color: #8b312b;
  background: #ffebe9;
}

.chat-message--help-reminder {
  width: min(92%, 600px);
  max-width: 600px;
  padding: 0;
  overflow: hidden;
  border: 2px solid #f0c64d;
  color: #173e49;
  background: linear-gradient(135deg, #fff9dc, #f6f0c8);
  box-shadow: 0 8px 24px rgb(111 85 15 / 20%);
}

.chat-help-reminder {
  display: flex;
  align-items: center;
  padding: 15px 17px;
  gap: 13px;
}

.chat-help-reminder__icon {
  display: grid;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 50%;
  color: #173e49;
  background: #f0c64d;
  font-size: 1.4rem;
  font-weight: 950;
  box-shadow: inset 0 0 0 3px rgb(255 255 255 / 48%);
}

.chat-help-reminder__content {
  display: grid;
  gap: 4px;
}

.chat-help-reminder__content > strong {
  font-size: .95rem;
  font-weight: 900;
}

.chat-help-reminder__content > span {
  line-height: 1.35;
}

.chat-help-reminder__button {
  width: fit-content;
  margin-top: 2px;
  padding: 9px 15px;
  border: 2px solid #173e49;
  border-radius: 10px;
  color: white;
  background: #27758e;
  font: inherit;
  font-weight: 850;
  cursor: pointer;
  box-shadow: 0 3px 0 #173e49;
  transition: transform .14s ease, box-shadow .14s ease, background-color .14s ease;
}

.chat-help-reminder__button:hover,
.chat-help-reminder__button:focus-visible {
  outline: 3px solid rgb(39 117 142 / 28%);
  outline-offset: 2px;
  background: #1f657d;
  transform: translateY(-1px);
  box-shadow: 0 4px 0 #173e49;
}

.chat-help-reminder__button:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 #173e49;
}

:global(:root[data-theme='dark']) .chat-message--help-reminder {
  border-color: #f0c64d;
  color: #f5f0d4;
  background: linear-gradient(135deg, #3f3923, #302f25);
  box-shadow: 0 8px 24px rgb(0 0 0 / 30%);
}

:global(:root[data-theme='dark']) .chat-help-reminder__button {
  border-color: #f0c64d;
  color: #102b33;
  background: #f0c64d;
  box-shadow: 0 3px 0 #9c7b1f;
}

:global(:root[data-theme='dark']) .chat-help-reminder__button:hover,
:global(:root[data-theme='dark']) .chat-help-reminder__button:focus-visible {
  background: #ffda62;
  box-shadow: 0 4px 0 #9c7b1f;
}

.chat-message--comparison {
  width: min(92%, 560px);
}

.answer-comparison {
  display: grid;
  gap: 9px;
}

.answer-comparison > strong {
  color: inherit;
  font-size: .9rem;
}

.answer-comparison__line {
  display: grid;
  padding: 9px 11px;
  gap: 3px;
  border: 1px solid rgb(139 49 43 / 16%);
  border-radius: 10px;
  background: rgb(255 255 255 / 72%);
}

.answer-comparison__line > small {
  color: #795d59;
  font-size: .65rem;
  font-weight: 900;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.answer-comparison__line p {
  margin: 0;
  color: #3e3533;
  font-size: 1.04rem;
  line-height: 1.55;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.answer-comparison__part--changed,
.answer-comparison__part--extra {
  padding: 1px 2px;
  border-radius: 4px;
  font-weight: 900;
}

.answer-comparison__line--learner .answer-comparison__part--changed {
  color: #872f29;
  background: #ffd2ce;
  text-decoration: underline 2px;
  text-underline-offset: 3px;
}

.answer-comparison__line--learner .answer-comparison__part--extra {
  color: #493600;
  background: #f6d85d;
  box-shadow: 0 0 0 2px rgb(230 185 54 / 20%);
  text-decoration: line-through 2px;
}

.answer-comparison__line--expected {
  border-color: #d5b13e;
  background: #fffdf4;
}

.answer-comparison__line--expected .answer-comparison__part--changed {
  color: #493600;
  background: #f6d85d;
  box-shadow: 0 0 0 2px rgb(230 185 54 / 20%);
}

.answer-comparison__guidance {
  color: inherit;
  font-size: .76rem;
  line-height: 1.4;
  opacity: .88;
}

:global(:root[data-theme='dark']) .answer-comparison > strong {
  color: #ffd3cf;
}

:global(:root[data-theme='dark']) .answer-comparison__line {
  border-color: #714b48;
  background: rgb(20 35 39 / 68%);
}

:global(:root[data-theme='dark']) .answer-comparison__line > small,
:global(:root[data-theme='dark']) .answer-comparison__guidance {
  color: #d2b7b3;
}

:global(:root[data-theme='dark']) .answer-comparison__line p {
  color: #f1e8e6;
}

:global(:root[data-theme='dark']) .answer-comparison__line--learner .answer-comparison__part--changed {
  color: #ffe4e1;
  background: #783f3a;
}

:global(:root[data-theme='dark']) .answer-comparison__line--learner .answer-comparison__part--extra {
  color: #211900;
  background: #e8c84f;
}

:global(:root[data-theme='dark']) .answer-comparison__line--expected {
  border-color: #aa8a31;
  background: #302d21;
}

:global(:root[data-theme='dark']) .answer-comparison__line--expected .answer-comparison__part--changed {
  color: #211900;
  background: #e8c84f;
}

.chat-summary-loading {
  display: inline-flex;
  margin: 16px auto 8px;
  padding: 12px 16px;
  align-items: center;
  gap: 10px;
  border: 1px solid #bed8df;
  border-radius: 999px;
  color: #2e6271;
  background: rgb(255 255 255 / 82%);
  box-shadow: 0 6px 18px rgb(30 74 88 / 9%);
}

.chat-summary-loading > span {
  width: 20px;
  height: 20px;
  border: 3px solid #cfe2e7;
  border-top-color: #176b87;
  border-radius: 50%;
  animation: chat-summary-spinner .7s linear infinite;
}

.chat-summary-loading > strong {
  font-size: .9rem;
}

.chat-summary-tool {
  display: grid;
  width: calc(100% - 20px);
  margin: 16px auto 8px;
  padding: 16px;
  gap: 13px;
  align-self: stretch;
  border: 1px solid #bed8df;
  border-radius: 18px;
  color: #254550;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 88%), rgb(241 249 250 / 94%)),
    #f4fbfc;
  box-shadow: 0 8px 26px rgb(30 74 88 / 10%);
  animation: chat-summary-card-in .42s ease-out both;
}

.chat-summary-tool > header {
  display: grid;
  margin: -16px -16px 2px;
  padding: 17px 16px 15px;
  place-items: center;
  gap: 9px;
  text-align: center;
  border-bottom: 1px solid #176b87;
  border-radius: 17px 17px 0 0;
  background: linear-gradient(135deg, #176b87, #2f8791);
}

.chat-summary-tool > header > div {
  display: grid;
  gap: 3px;
  justify-items: center;
}

.chat-summary-tool > header p {
  margin: 0;
  color: rgb(255 255 255 / 78%);
  font-size: .7rem;
  font-weight: 900;
  letter-spacing: .1em;
  text-transform: uppercase;
}

.chat-summary-tool h3 {
  margin: 0;
  color: #173f55;
  font-size: clamp(1.5rem, 4vw, 2rem);
  line-height: 1.1;
}

.chat-summary-tool > header h3 {
  color: white;
}

.chat-summary-tool > header > strong {
  padding: 6px 12px;
  border-radius: 999px;
  color: #174f61;
  background: rgb(255 255 255 / 92%);
  border: 1px solid rgb(255 255 255 / 72%);
  font-size: .95rem;
}

.chat-summary-list {
  display: grid;
  margin: 0;
  padding: 0;
  gap: 9px;
  list-style: none;
}

.chat-summary-list li {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  padding: 12px;
  border: 1px solid #d2e2e6;
  border-radius: 14px;
  background: white;
  opacity: 0;
  transform: translateY(10px);
  animation: chat-summary-item-in .34s ease-out both;
  animation-delay: calc(.16s + var(--summary-item-index, 0) * .11s);
  cursor: pointer;
  transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease;
}

.chat-summary-list li:hover,
.chat-summary-list li:focus-visible {
  outline: none;
  border-color: #65aabd;
  box-shadow: 0 5px 16px rgb(30 91 109 / 16%);
  transform: translateY(-1px);
}

.chat-summary-list li.is-help-selected {
  outline: 3px solid #e6b936;
  outline-offset: 2px;
}

.chat-summary-list li.is-correct {
  border-color: #bde4cf;
}

.chat-summary-list li.is-incorrect {
  border-color: #f0c1bd;
}

.chat-summary-list__status {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 50%;
  color: white;
  font-size: 1.2rem;
  font-weight: 900;
  line-height: 1;
}

.chat-summary-list li.is-correct .chat-summary-list__status {
  background: #43aa73;
}

.chat-summary-list li.is-incorrect .chat-summary-list__status {
  background: #d75b52;
}

.chat-summary-list__question {
  display: block;
  color: #173f55;
  font-size: .94rem;
}

.chat-summary-list__question span + span {
  margin-left: .45em;
  color: #2d7083;
  font-weight: 800;
}

.chat-summary-list dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
}

.chat-summary-list dl > div {
  min-width: 0;
  padding: 8px 10px;
  border-radius: 10px;
  background: #eef6f8;
}

.chat-summary-list dt {
  color: #6a7e84;
  font-size: .64rem;
  font-weight: 900;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.chat-summary-list dd {
  margin: 2px 0 0;
  color: #173f55;
  font-weight: 850;
  overflow-wrap: anywhere;
}

.chat-summary-tool > footer {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 6px;
  color: #526b73;
}

.chat-summary-tool > footer strong {
  color: #176b87;
  font-size: 1.35rem;
}

@keyframes chat-summary-card-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes chat-summary-item-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes chat-summary-spinner {
  to {
    transform: rotate(360deg);
  }
}

.chat-restart-prompt {
  width: min(100%, 620px);
  max-width: min(96%, 620px);
  margin-inline: auto;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.chat-restart-prompt__actions {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.chat-restart-prompt__actions button {
  min-height: 42px;
  padding: 8px 12px;
  border: 1px solid #bfd4da;
  border-radius: 12px;
  color: #174253;
  background: white;
  cursor: pointer;
  font-weight: 850;
  line-height: 1.25;
  transition: transform .16s ease, border-color .16s ease, background-color .16s ease, box-shadow .16s ease;
}

.chat-restart-prompt__actions button:hover:not(:disabled),
.chat-restart-prompt__actions button:focus-visible {
  transform: translateY(-2px);
  border-color: #367e8e;
  box-shadow: 0 6px 14px rgb(25 79 94 / 14%);
  outline: none;
}

.chat-restart-prompt__actions button:disabled {
  cursor: wait;
  opacity: .65;
}

.chat-restart-prompt__same {
  color: white;
  border-color: #176b87;
  background: #176b87;
}

.chat-restart-prompt__same:hover:not(:disabled),
.chat-restart-prompt__same:focus-visible {
  border-color: #10556c;
  background: #105f78;
}

.chat-restart-prompt__new {
  color: #174f5f;
  border-color: #82b9c5;
  background: #e8f6f8;
}

.chat-restart-prompt__new:hover:not(:disabled),
.chat-restart-prompt__new:focus-visible {
  background: #d9f0f3;
}

.chat-restart-prompt__actions .chat-restart-prompt__quit {
  min-height: 36px;
  grid-column: 1 / -1;
  color: #667b82;
  background: transparent;
}

.chat-restart-prompt__actions .chat-restart-prompt__quit:hover:not(:disabled),
.chat-restart-prompt__actions .chat-restart-prompt__quit:focus-visible {
  color: #3e5d66;
  background: #f3f7f8;
}

.chat-restart-prompt__actions .chat-restart-prompt__print {
  min-height: 38px;
  grid-column: 1 / -1;
  color: #174f61;
  border-style: dashed;
  background: #f5fafb;
}

.chat-restart-prompt__actions .chat-restart-prompt__print:hover:not(:disabled),
.chat-restart-prompt__actions .chat-restart-prompt__print:focus-visible {
  border-style: solid;
  background: #e8f4f6;
}

.chat-restart-prompt__error {
  color: #9a403a;
  font-size: .78rem;
  line-height: 1.35;
}

:global(:root[data-theme='dark']) .chat-summary-tool {
  color: #dbe8ea;
  border-color: #3f5e65;
  background:
    linear-gradient(180deg, rgb(27 48 53 / 92%), rgb(20 38 43 / 96%)),
    #172b30;
  box-shadow: 0 8px 26px rgb(0 0 0 / 18%);
}

:global(:root[data-theme='dark']) .chat-summary-loading {
  color: #d9eef1;
  border-color: #3f5e65;
  background: rgb(27 48 53 / 86%);
  box-shadow: 0 8px 24px rgb(0 0 0 / 20%);
}

:global(:root[data-theme='dark']) .chat-summary-loading > span {
  border-color: #39575f;
  border-top-color: #87d6df;
}

:global(:root[data-theme='dark']) .chat-summary-tool > header p {
  color: rgb(255 255 255 / 76%);
}

:global(:root[data-theme='dark']) .chat-summary-tool > header {
  border-bottom-color: #347b87;
  background: linear-gradient(135deg, #1d6175, #2a6f76);
}

:global(:root[data-theme='dark']) .chat-summary-tool h3,
:global(:root[data-theme='dark']) .chat-summary-list__question,
:global(:root[data-theme='dark']) .chat-summary-list dd {
  color: #e8f5f6;
}

:global(:root[data-theme='dark']) .chat-summary-tool > footer,
:global(:root[data-theme='dark']) .chat-summary-list__question span + span {
  color: #b9ccd0;
}

:global(:root[data-theme='dark']) .chat-summary-tool > header > strong {
  color: white;
  border-color: rgb(255 255 255 / 36%);
  background: rgb(11 35 42 / 34%);
}

:global(:root[data-theme='dark']) .chat-summary-list li {
  border-color: #3c5960;
  background: #1e363b;
}

:global(:root[data-theme='dark']) .chat-summary-list li.is-correct {
  border-color: #326f50;
}

:global(:root[data-theme='dark']) .chat-summary-list li.is-incorrect {
  border-color: #7b443f;
}

:global(:root[data-theme='dark']) .chat-summary-list dl > div {
  background: #162a2f;
}

:global(:root[data-theme='dark']) .chat-summary-list dt {
  color: #9db5ba;
}

:global(:root[data-theme='dark']) .chat-restart-prompt__actions button {
  color: #dff3f6;
  border-color: #4a6870;
  background: #162a2f;
}

:global(:root[data-theme='dark']) .chat-restart-prompt__same {
  color: white;
  border-color: #2c839d;
  background: #176b87;
}

:global(:root[data-theme='dark']) .chat-restart-prompt__new {
  color: #dff3f6;
  border-color: #497f89;
  background: #23434a;
}

:global(:root[data-theme='dark']) .chat-restart-prompt__same:hover:not(:disabled),
:global(:root[data-theme='dark']) .chat-restart-prompt__same:focus-visible {
  background: #105f78;
}

:global(:root[data-theme='dark']) .chat-restart-prompt__new:hover:not(:disabled),
:global(:root[data-theme='dark']) .chat-restart-prompt__new:focus-visible {
  background: #2b5058;
}

:global(:root[data-theme='dark']) .chat-restart-prompt__actions .chat-restart-prompt__quit {
  color: #b5c8cc;
  background: transparent;
}

:global(:root[data-theme='dark']) .chat-restart-prompt__actions .chat-restart-prompt__quit:hover:not(:disabled),
:global(:root[data-theme='dark']) .chat-restart-prompt__actions .chat-restart-prompt__quit:focus-visible {
  color: #d7e8eb;
  background: #203a40;
}

:global(:root[data-theme='dark']) .chat-restart-prompt__actions .chat-restart-prompt__print {
  color: #cce9ed;
  border-color: #52737a;
  background: #1b3439;
}

:global(:root[data-theme='dark']) .chat-restart-prompt__actions .chat-restart-prompt__print:hover:not(:disabled),
:global(:root[data-theme='dark']) .chat-restart-prompt__actions .chat-restart-prompt__print:focus-visible {
  background: #27474e;
}

:global(:root[data-theme='dark']) .chat-restart-prompt__error {
  color: #efaaa4;
}

.chat-composer {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #d4e1e6;
  background: white;
}

.chat-composer input {
  min-width: 0;
  flex: 1;
  padding: 12px 14px;
  border: 1px solid #bfd0d7;
  border-radius: 12px;
}

.chat-composer button {
  padding: 0 18px;
  border: 0;
  border-radius: 12px;
  color: white;
  background: #176b87;
  cursor: pointer;
}

.chat-composer button:disabled {
  cursor: not-allowed;
  opacity: .5;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

@media (max-width: 760px) {
  .chat-dialogs,
  .chat-dialogs--with-help {
    width: min(760px, calc(100vw - 40px));
  }

  .chat-help-dialog {
    position: absolute;
    z-index: 2;
    inset: 0;
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 600px) {
  .chat-overlay {
    padding: 0;
  }

  .chat-dialogs,
  .chat-dialogs--with-help {
    width: 100vw;
    height: 100vh;
  }

  .chat-dialog {
    height: 100vh;
    border-radius: 0;
  }

  .chat-help-dialog {
    border-radius: 0;
  }

  .chat-thread {
    padding: 16px;
  }

  .chat-latest-help {
    right: 12px;
    bottom: 12px;
  }

  .chat-latest-help--above-composer {
    bottom: 80px;
  }

  .chat-summary-tool {
    width: 100%;
    margin-inline: 0;
    padding: 13px;
  }

  .chat-summary-list li {
    grid-template-columns: 30px minmax(0, 1fr);
  }

  .chat-summary-list dl {
    grid-template-columns: 1fr;
  }

  .chat-restart-prompt__actions {
    grid-template-columns: 1fr;
  }

  .chat-restart-prompt__actions .chat-restart-prompt__quit {
    grid-column: auto;
  }

  .chat-restart-prompt__actions .chat-restart-prompt__print {
    grid-column: auto;
  }

  .coach-avatar {
    width: 94px;
    height: 94px;
  }

  .chat-header {
    padding: 12px;
    gap: 9px;
  }

  .chat-header__actions {
    gap: 3px;
  }

  .chat-instruction {
    padding: 11px 16px;
    flex-wrap: wrap;
    gap: 4px 10px;
  }

  .chat-close-confirmation__actions {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chat-dialogs,
  .chat-help-enter-active,
  .chat-help-leave-active,
  .chat-summary-tool,
  .chat-summary-list li,
  .chat-summary-loading > span {
    transition: none;
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>

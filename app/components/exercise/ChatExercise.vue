<script setup lang="ts">
import type { ConjugationTense, ExerciseAttempt, ExerciseQuestion, Verb } from '~~/shared/types/conjugation'
import type { CoachEvent, CoachMedia, CoachMessageContext, CoachProfile } from '~~/shared/types/coach'
import { getAlternativeCorrections, validateAnswer } from '~~/shared/utils/answer'
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
import { sanitizeCoachHtml } from '~~/shared/utils/safe-html'
import { areOnlyIndicativeTenses, withoutIndicativeMode } from '~~/shared/utils/chat-mode-display'

const props = defineProps<{
  questions: ExerciseQuestion[]
  coach: CoachProfile
  verbs: Verb[]
  tenses: ConjugationTense[]
}>()

const emit = defineEmits<{ close: [] }>()

interface ChatMessage {
  id: number
  author: 'coach' | 'learner'
  text: string
  tone?: 'success' | 'error'
  media?: CoachMedia
  emphasis?: boolean
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
const finished = ref(false)
const closeConfirmationOpen = ref(false)
const helpOpen = ref(false)
const sequence = ref(0)
const lastMediaQuestion = ref(-100)
const allowMotion = ref(true)
const input = useTemplateRef<HTMLInputElement>('chat-answer')
const keepChatButton = useTemplateRef<HTMLButtonElement>('keep-chat-button')
const thread = useTemplateRef<HTMLElement>('chat-thread')
const dialog = useTemplateRef<HTMLElement>('chat-dialogs')
let conversationVersion = 0
let coachQueue: Promise<void> = Promise.resolve()
let lastCoachBubbleAt = 0
let dialogueState = createCoachDialogueState()
let automaticHelpTimer: number | undefined

useDialogFocus(dialog, handleEscapeClose, input)

const currentQuestion = computed(() => props.questions[currentIndex.value])
const currentVerb = computed(() => {
  const question = currentQuestion.value
  if (!question) return undefined
  return props.verbs.find(verb => verb.id === question.verbeId)
    || props.verbs.find(verb => normalizedInfinitive(verb.infinitif) === normalizedInfinitive(question.infinitif))
})
const currentTense = computed(() => {
  const question = currentQuestion.value
  if (!question) return undefined
  return props.tenses.find(tense => tense.id === question.tenseId)
    || props.tenses.find(tense => normalizedInfinitive(tense.name) === normalizedInfinitive(question.temps))
})
const targetedHelp = computed(() => currentQuestion.value
  ? buildTargetedConjugationHelp(currentQuestion.value, currentVerb.value, currentTense.value)
  : null)
const helpBlocks = computed(() => visibleCoachHelpBlocks(props.coach.help))
const correctCount = computed(() => attempts.value.filter(item => item.status === 'correct').length)
const score = computed(() => attempts.value.length
  ? Math.round(correctCount.value / attempts.value.length * 100)
  : 0)
const omitIndicativeMode = computed(() => areOnlyIndicativeTenses(props.tenses))
const hasIncorrectMedia = computed(() => props.coach.assignments.some(assignment => assignment.isActive
  && assignment.eventType === 'incorrect'
  && props.coach.media.some(item => item.id === assignment.mediaId
    && item.isActive
    && item.category === 'encouragement'
    && (item.mediaType === 'animation' || item.mediaType === 'emoji'))))

function normalizedInfinitive(value?: string | null) {
  return (value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLocaleLowerCase('fr')
}

const helpValues = computed(() => currentQuestion.value ? {
  coach: props.coach,
  ...coachHelpQuestionVariables(currentQuestion.value, currentVerb.value, currentTense.value),
  definition: currentVerb.value?.meaning?.trim() || targetedHelp.value?.meaning || '',
  helpTitle: targetedHelp.value?.title || '',
  omitIndicativeMode: omitIndicativeMode.value,
} : { coach: props.coach })

function openHelp(candidate: string) {
  cancelAutomaticHelp()
  addMessage('learner', candidate)
  answer.value = ''
  helpOpen.value = true
}

function closeHelp() {
  cancelAutomaticHelp()
  helpOpen.value = false
  focusAnswerInput()
}

function cancelAutomaticHelp() {
  if (automaticHelpTimer === undefined) return
  window.clearTimeout(automaticHelpTimer)
  automaticHelpTimer = undefined
}

function scheduleAutomaticHelp() {
  cancelAutomaticHelp()
  const version = conversationVersion
  automaticHelpTimer = window.setTimeout(() => {
    automaticHelpTimer = undefined
    if (version === conversationVersion && !finished.value) helpOpen.value = true
  }, 2000)
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
        if (thread.value) thread.value.scrollTop = thread.value.scrollHeight
      })
    })
  })
}

function mediaLoaded() {
  scrollThreadToBottom()
}

function addMessage(author: ChatMessage['author'], text: string, tone?: ChatMessage['tone']) {
  messages.value.push({ id: ++sequence.value, author, text, ...(tone ? { tone } : {}) })
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
  if (currentIndex.value > 0) await addCoachReaction('question', contextFor(question))
  if (question.instruction) await addCoachText(question.instruction, undefined, true)
  const bubbles = coachQuestionBubbles(question, { omitIndicativeMode: omitIndicativeMode.value })
  await addCoachText(bubbles.formula, undefined, true)
  if (bubbles.sentence) await addCoachText(bubbles.sentence, undefined, true)
  posingQuestion.value = false
  focusAnswerInput()
}

async function submit() {
  const question = currentQuestion.value
  const candidate = answer.value.trim()
  if (!question || !candidate || waitingForNext.value || posingQuestion.value || finished.value) return
  if (isHelpCommand(candidate)) {
    openHelp(candidate)
    return
  }
  const version = conversationVersion

  addMessage('learner', candidate)
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
  for (const step of plan) {
    if (step.kind === 'reaction') {
      const isIncorrectReaction = step.eventType === 'incorrect' || step.eventType === 'cod-before'
        || step.eventType === 'cod-after' || step.eventType === 'coi'
      const isCorrectReaction = step.eventType === 'correct' || step.eventType === 'correct-alternative' || step.eventType === 'streak'
      const displayed = await addCoachReaction(step.eventType, contextFor(question), isIncorrectReaction ? 'error' : isCorrectReaction ? 'success' : undefined)
      if (!displayed && isIncorrectReaction && step.eventType !== 'incorrect') {
        await addCoachReaction('incorrect', contextFor(question), 'error')
      }
      if (step.eventType === 'streak') consecutiveCorrectCount.value = 0
    }
  }
  deliveringFeedback.value = false
  const delay = plan.find(step => step.kind === 'delay')
  await wait(delay?.kind === 'delay' ? delay.milliseconds : 0)
  if (version === conversationVersion && waitingForNext.value && !finished.value) await continueChat()
}

async function continueChat() {
  if (!waitingForNext.value || deliveringFeedback.value) return
  if (currentIndex.value >= props.questions.length - 1) {
    finished.value = true
    waitingForNext.value = false
    await addCoachReaction('finish', {
      score: score.value,
      correctCount: correctCount.value,
      questionCount: attempts.value.length,
    })
    return
  }

  currentIndex.value += 1
  waitingForNext.value = false
  await askCurrentQuestion()
}

async function restart() {
  conversationVersion += 1
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
  finished.value = false
  helpOpen.value = false
  lastMediaQuestion.value = -100
  await addCoachReaction('restart', {})
  await askCurrentQuestion()
  scheduleAutomaticHelp()
}

function requestClose() {
  closeConfirmationOpen.value = true
  nextTick(() => keepChatButton.value?.focus())
}

function handleEscapeClose() {
  if (closeConfirmationOpen.value) cancelClose()
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
  allowMotion.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  focusAnswerInput()
  await addCoachReaction('introduction', {})
  await askCurrentQuestion()
  scheduleAutomaticHelp()
})

onBeforeUnmount(() => {
  cancelAutomaticHelp()
  conversationVersion += 1
})
</script>

<template>
  <Teleport to="body">
    <div class="chat-overlay" @click.self="requestClose">
      <div ref="chat-dialogs" class="chat-dialogs" :class="{ 'chat-dialogs--with-help': helpOpen }" :style="{ '--coach-color': coach.themeColor }" role="dialog" aria-modal="true" aria-labelledby="chat-title" tabindex="-1" @click.self="requestClose">
      <section class="chat-dialog" role="region" aria-labelledby="chat-title">
        <header class="chat-header">
          <img class="coach-avatar" :src="coach.avatarPath" alt="">
          <div>
            <h2 id="chat-title">{{ coach.firstName }}</h2>
            <p v-if="coach.description">{{ coach.description }}</p>
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
            :class="[
              `chat-message--${message.author}`,
              message.tone ? `chat-message--${message.tone}` : '',
            ]"
          >
            <span
              v-if="message.text && message.author === 'coach'"
              class="chat-message__text"
              :class="{ 'chat-message__text--emphasis': message.emphasis }"
              v-html="sanitizeCoachHtml(message.text)"
            />
            <strong v-else-if="message.text && message.emphasis">{{ message.text }}</strong>
            <span v-else-if="message.text">{{ message.text }}</span>
            <video v-if="message.media?.mediaType === 'video'" :src="message.media.filePath" :aria-label="message.media.altText" muted playsinline controls @loadedmetadata="mediaLoaded" />
            <img v-else-if="message.media" :class="{ 'chat-media--emoji': message.media.mediaType === 'emoji' }" :src="message.media.filePath" :alt="message.media.altText" @load="mediaLoaded">
          </div>

          <section v-if="finished" class="chat-score">
            <strong>{{ score }} %</strong>
            <span>{{ correctCount }} réponse{{ correctCount > 1 ? 's' : '' }} juste{{ correctCount > 1 ? 's' : '' }} sur {{ attempts.length }}</span>
          </section>
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
            {{ posingQuestion ? 'Question…' : deliveringFeedback ? 'Réponse…' : waitingForNext ? `Suite dans ${nextQuestionDelay / 1000} s…` : 'Envoyer' }}
          </button>
        </form>

        <div v-else class="chat-actions">
          <button type="button" class="secondary-button" @click="emit('close')">Fermer</button>
          <button type="button" class="primary-button" @click="restart">Recommencer</button>
        </div>

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
          :header-title="coach.help?.headerTitle"
          :header-description="coach.help?.headerDescription"
          :question-number="currentIndex + 1"
          :coach-color="coach.themeColor"
          @close="closeHelp"
        />
      </Transition>
      </div>
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

.chat-help-kicker {
  display: block;
  margin-bottom: 7px;
  color: rgb(255 255 255 / 78%);
  font-size: .7rem;
  font-weight: 850;
  letter-spacing: .07em;
  text-transform: uppercase;
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
  font-size: 1rem;
}

.chat-header p {
  margin-top: 3px;
  color: #cfe8ef;
  font-size: .78rem;
}

.chat-header p span {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #69d695;
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

.chat-message--success {
  color: #185f3c;
  background: #dcf5e7;
}

.chat-message--error {
  color: #8b312b;
  background: #ffebe9;
}

.chat-score {
  display: flex;
  margin: 16px auto;
  align-items: center;
  flex-direction: column;
  gap: 4px;
}

.chat-score strong {
  color: #176b87;
  font-size: 2.8rem;
}

.chat-composer,
.chat-actions {
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

.chat-actions {
  justify-content: flex-end;
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
  .chat-help-leave-active {
    transition: none;
  }
}
</style>

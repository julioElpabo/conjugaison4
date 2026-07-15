<script setup lang="ts">
import type { ExerciseAttempt, ExerciseQuestion } from '~~/shared/types/conjugation'
import type { CoachEvent, CoachMedia, CoachMessageContext, CoachProfile } from '~~/shared/types/coach'
import { getAlternativeCorrections } from '~~/shared/utils/answer'
import { createCoachDialogueState, createVariedCoachReaction } from '~~/shared/utils/coach-dialogue'
import { answerTurnPlan, CHAT_BUBBLE_DELAY_MS } from '~~/shared/utils/coach-conversation'
import { createCoachFeedback, createCoachFeedbackState, diagnoseCoachAnswer } from '~~/shared/utils/coach-feedback'
import { evaluateExerciseAnswer } from '~~/shared/utils/exercise-attempt'

const props = defineProps<{
  questions: ExerciseQuestion[]
  coach: CoachProfile
}>()

const emit = defineEmits<{ close: [] }>()

interface ChatMessage {
  id: number
  author: 'coach' | 'learner'
  text: string
  tone?: 'success' | 'error'
  media?: CoachMedia
  emphasis?: boolean
  largeEmoji?: boolean
}

const currentIndex = ref(0)
const answer = ref('')
const attempts = ref<ExerciseAttempt[]>([])
const messages = ref<ChatMessage[]>([])
const waitingForNext = ref(false)
const deliveringFeedback = ref(false)
const posingQuestion = ref(false)
const retryAlreadyOffered = ref(false)
const finished = ref(false)
const copyState = ref<'idle' | 'copied' | 'error'>('idle')
const sequence = ref(0)
const lastMediaQuestion = ref(-100)
const allowMotion = ref(true)
const input = useTemplateRef<HTMLInputElement>('chat-answer')
const thread = useTemplateRef<HTMLElement>('chat-thread')
const dialog = useTemplateRef<HTMLElement>('chat-dialog')
let conversationVersion = 0
let coachQueue: Promise<void> = Promise.resolve()
let lastCoachBubbleAt = 0
let dialogueState = createCoachDialogueState()
let feedbackState = createCoachFeedbackState()

useDialogFocus(dialog, () => emit('close'), input)

const currentQuestion = computed(() => props.questions[currentIndex.value])
const correctCount = computed(() => attempts.value.filter(item => item.status === 'correct').length)
const score = computed(() => attempts.value.length
  ? Math.round(correctCount.value / attempts.value.length * 100)
  : 0)

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

function chatExport() {
  return {
    schema: 'conjugaison4.coach-chat',
    version: 1,
    exportedAt: new Date().toISOString(),
    coach: {
      id: props.coach.id,
      name: `${props.coach.firstName} ${props.coach.lastName}`,
      character: props.coach.characterName,
      personality: props.coach.personality,
      pedagogicalStyle: props.coach.pedagogicalStyle,
    },
    exercise: {
      currentQuestion: Math.min(currentIndex.value + 1, props.questions.length),
      questionCount: props.questions.length,
      finished: finished.value,
      correctCount: correctCount.value,
      answeredCount: attempts.value.length,
      score: score.value,
      reducedMotion: !allowMotion.value,
    },
    questions: props.questions.map((question, index) => ({
      number: index + 1,
      infinitive: question.infinitif,
      person: question.pronom,
      mode: question.mode,
      tense: question.temps,
      instruction: [question.instruction, question.consigne].filter(Boolean).join('\n'),
      expectedAnswers: question.reponsesPourCorrige,
      complement: question.complement || null,
      agreementReminder: question.agreementReminder || null,
    })),
    messages: messages.value.map(message => ({
      order: message.id,
      author: message.author,
      text: message.text,
      tone: message.tone || null,
      instruction: Boolean(message.emphasis),
      largeEmoji: Boolean(message.largeEmoji),
      media: message.media ? {
        id: message.media.id,
        name: message.media.name,
        type: message.media.mediaType,
        category: message.media.category,
        path: message.media.filePath,
      } : null,
    })),
    attempts: attempts.value.map((attempt, index) => ({
      question: index + 1,
      answer: attempt.answer,
      status: attempt.status,
      matchedAnswer: attempt.matchedAnswer || null,
    })),
  }
}

async function copyChat() {
  const json = JSON.stringify(chatExport(), null, 2)
  copyState.value = 'idle'
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(json)
    else {
      const textarea = document.createElement('textarea')
      textarea.value = json
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      if (!document.execCommand('copy')) throw new Error('Copie refusée')
      textarea.remove()
    }
    copyState.value = 'copied'
  } catch {
    copyState.value = 'error'
  }
  window.setTimeout(() => { copyState.value = 'idle' }, 2500)
}

function addMessage(author: ChatMessage['author'], text: string, tone?: ChatMessage['tone']) {
  messages.value.push({ id: ++sequence.value, author, text, ...(tone ? { tone } : {}) })
  scrollThreadToBottom()
}

function contextFor(question?: ExerciseQuestion): CoachMessageContext {
  const reminder = question?.agreementReminder
  return {
    instruction: question ? [question.instruction, question.consigne].filter(Boolean).join('\n') : undefined,
    verb: question?.infinitif || reminder?.infinitive,
    complement: reminder?.complement || question?.complement,
    participle: reminder?.participle,
    gender: reminder?.gender === 'feminin' ? 'féminin' : reminder?.gender === 'masculin' ? 'masculin' : undefined,
    number: reminder?.number || undefined,
    mode: question?.mode,
    tense: question?.temps,
    expectedAnswer: question?.reponsesPourCorrige.join(' ou '),
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

function addCoachReaction(eventType: CoachEvent, context: CoachMessageContext, tone?: ChatMessage['tone'], options: { randomizedCorrect?: boolean, overrideText?: string } = {}) {
  const rule = props.coach.rules.find(item => item.eventType === eventType)
  const cooledDown = currentIndex.value - lastMediaQuestion.value >= (rule?.cooldownQuestions || 0)
  const reaction = createVariedCoachReaction(props.coach, eventType, context, dialogueState, {
    allowMotion: allowMotion.value, mediaAllowed: options.randomizedCorrect || cooledDown, animatedOnly: options.randomizedCorrect,
  })
  let largeEmoji = false
  if (!options.overrideText && options.randomizedCorrect && Math.random() < 0.4) {
    const emoticons = ['👏', '🎉', '✅', '🌟', '🥳']
    reaction.text = emoticons[Math.floor(Math.random() * emoticons.length)] || '👏'
    largeEmoji = true
  }
  if (reaction.media) {
    lastMediaQuestion.value = currentIndex.value
  }
  return enqueueCoachBubble(() => ({ text: options.overrideText || reaction.text, ...(tone ? { tone } : {}), ...(reaction.media ? { media: reaction.media } : {}), ...(largeEmoji ? { largeEmoji: true } : {}) }))
}

async function askCurrentQuestion() {
  const question = currentQuestion.value
  if (!question) return
  posingQuestion.value = true
  await addCoachReaction('question', contextFor(question))
  if (question.instruction) await addCoachText(question.instruction, undefined, true)
  await addCoachText(question.consigne, undefined, true)
  posingQuestion.value = false
  await nextTick()
  input.value?.focus()
}

async function submit() {
  const question = currentQuestion.value
  const candidate = answer.value.trim()
  if (!question || !candidate || waitingForNext.value || finished.value) return
  const version = conversationVersion

  addMessage('learner', candidate)
  lastCoachBubbleAt = Date.now()
  const { result, shouldRetry } = evaluateExerciseAnswer(
    candidate,
    question.reponses,
    retryAlreadyOffered.value,
  )
  answer.value = ''
  if (shouldRetry) {
    retryAlreadyOffered.value = true
    waitingForNext.value = true
    deliveringFeedback.value = true
    await addCoachReaction('encouragement', contextFor(question), undefined, {
      overrideText: 'Ce n’est pas encore ça. Vérifie ta réponse et essaie encore une fois.',
    })
    deliveringFeedback.value = false
    waitingForNext.value = false
    await nextTick()
    input.value?.focus()
    return
  }

  attempts.value.push({
    question,
    answer: candidate,
    status: result.isCorrect ? 'correct' : 'incorrect',
    ...(result.matchedAnswer ? { matchedAnswer: result.matchedAnswer } : {})
  })
  waitingForNext.value = true
  deliveringFeedback.value = true

  const alternatives = result.isCorrect ? getAlternativeCorrections(candidate, question.reponsesPourCorrige) : []
  const diagnostic = diagnoseCoachAnswer(candidate, question, result.isCorrect)
  const feedback = createCoachFeedback(diagnostic, question, feedbackState, { hasAlternative: alternatives.length > 0 })
  const plan = answerTurnPlan({
    correct: result.isCorrect,
    hasAlternative: alternatives.length > 0,
    streak: result.isCorrect && correctCount.value > 0 && correctCount.value % 3 === 0,
    hasNext: currentIndex.value < props.questions.length - 1,
  })
  for (const step of plan) {
    if (step.kind === 'reaction') {
      const isAnswerReaction = step.eventType === 'correct' || step.eventType === 'correct-alternative' || step.eventType === 'incorrect'
      const tone = step.eventType === 'incorrect' ? 'error' : isAnswerReaction || step.eventType === 'streak' ? 'success' : undefined
      await addCoachReaction(step.eventType, contextFor(question), tone, {
        randomizedCorrect: step.eventType === 'correct' || step.eventType === 'correct-alternative',
        ...(isAnswerReaction ? { overrideText: feedback.text } : {}),
      })
    } else if (step.kind === 'alternative') {
      const alternativeText = alternatives.join(' ou ')
      const punctuation = /[.!?]$/u.test(alternativeText) ? '' : '.'
      await addCoachText(`On peut aussi répondre : ${alternativeText}${punctuation}`, 'success')
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
  retryAlreadyOffered.value = false
  waitingForNext.value = false
  await askCurrentQuestion()
}

async function restart() {
  conversationVersion += 1
  coachQueue = Promise.resolve()
  lastCoachBubbleAt = 0
  dialogueState = createCoachDialogueState()
  feedbackState = createCoachFeedbackState()
  currentIndex.value = 0
  answer.value = ''
  attempts.value = []
  messages.value = []
  waitingForNext.value = false
  deliveringFeedback.value = false
  posingQuestion.value = false
  retryAlreadyOffered.value = false
  finished.value = false
  lastMediaQuestion.value = -100
  await addCoachReaction('restart', {})
  await askCurrentQuestion()
}

onMounted(() => {
  allowMotion.value = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  void addCoachReaction('introduction', {})
  void askCurrentQuestion()
})

onBeforeUnmount(() => { conversationVersion += 1 })
</script>

<template>
  <Teleport to="body">
    <div class="chat-overlay">
      <section ref="chat-dialog" class="chat-dialog" :style="{ '--coach-color': coach.themeColor }" role="dialog" aria-modal="true" aria-labelledby="chat-title" tabindex="-1">
        <header class="chat-header">
          <img class="coach-avatar" :src="coach.avatarPath" alt="">
          <div>
            <h2 id="chat-title">{{ coach.firstName }} {{ coach.lastName }}</h2>
            <p>Personnage virtuel · coach de conjugaison</p>
          </div>
          <div class="chat-header__actions">
            <button type="button" class="chat-copy" :title="copyState === 'error' ? 'La copie a échoué' : 'Copier toute la conversation au format JSON'" @click="copyChat">
              {{ copyState === 'copied' ? 'Copié ✓' : copyState === 'error' ? 'Échec' : 'Copier le chat' }}
            </button>
            <button type="button" class="chat-close" aria-label="Quitter le chat" @click="emit('close')">×</button>
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
              message.largeEmoji ? 'chat-message--large-emoji' : ''
            ]"
          >
            <strong v-if="message.emphasis">{{ message.text }}</strong>
            <span v-else>{{ message.text }}</span>
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
            :disabled="waitingForNext || posingQuestion"
            placeholder="Écris ta réponse…"
          >
          <button type="submit" :disabled="waitingForNext || posingQuestion || deliveringFeedback || !answer.trim()">
            {{ posingQuestion ? 'Question…' : deliveringFeedback ? 'Réponse…' : waitingForNext ? 'Suite dans 3 s…' : 'Envoyer' }}
          </button>
        </form>

        <div v-else class="chat-actions">
          <button type="button" class="secondary-button" @click="emit('close')">Fermer</button>
          <button type="button" class="primary-button" @click="restart">Recommencer</button>
        </div>
      </section>
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

.chat-dialog {
  display: grid;
  width: min(760px, 100%);
  height: min(760px, calc(100vh - 40px));
  grid-template-rows: auto 4px auto minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 50%);
  border-radius: 24px;
  background: #eef7fa;
  box-shadow: 0 30px 80px rgb(12 29 39 / 35%);
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

.chat-copy {
  padding: 8px 11px;
  border: 1px solid rgb(255 255 255 / 48%) !important;
  border-radius: 8px;
  background: rgb(255 255 255 / 13%);
  font-size: .75rem;
  font-weight: 800;
  white-space: nowrap;
}

.chat-copy:hover,
.chat-copy:focus-visible {
  background: rgb(255 255 255 / 23%);
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

.chat-message--large-emoji > span {
  font-size: 3em;
  line-height: 1;
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

@media (max-width: 600px) {
  .chat-overlay {
    padding: 0;
  }

  .chat-dialog {
    height: 100vh;
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

  .chat-copy {
    padding: 7px;
    font-size: .68rem;
  }

  .chat-instruction {
    padding: 11px 16px;
    flex-wrap: wrap;
    gap: 4px 10px;
  }
}
</style>

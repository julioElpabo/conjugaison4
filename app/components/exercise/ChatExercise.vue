<script setup lang="ts">
import type { ExerciseAttempt, ExerciseQuestion } from '~~/shared/types/conjugation'
import { validateAnswer } from '~~/shared/utils/answer'

const props = defineProps<{
  questions: ExerciseQuestion[]
}>()

const emit = defineEmits<{ close: [] }>()

interface ChatMessage {
  id: number
  author: 'coach' | 'learner'
  text: string
  tone?: 'success' | 'error'
}

const currentIndex = ref(0)
const answer = ref('')
const attempts = ref<ExerciseAttempt[]>([])
const messages = ref<ChatMessage[]>([])
const waitingForNext = ref(false)
const finished = ref(false)
const sequence = ref(0)
const input = useTemplateRef<HTMLInputElement>('chat-answer')
const thread = useTemplateRef<HTMLElement>('chat-thread')

const currentQuestion = computed(() => props.questions[currentIndex.value])
const correctCount = computed(() => attempts.value.filter(item => item.status === 'correct').length)
const score = computed(() => attempts.value.length
  ? Math.round(correctCount.value / attempts.value.length * 100)
  : 0)

function addMessage(author: ChatMessage['author'], text: string, tone?: ChatMessage['tone']) {
  messages.value.push({ id: ++sequence.value, author, text, ...(tone ? { tone } : {}) })
  nextTick(() => {
    if (thread.value) thread.value.scrollTop = thread.value.scrollHeight
  })
}

function askCurrentQuestion() {
  const question = currentQuestion.value
  if (!question) return
  addMessage('coach', `Question ${currentIndex.value + 1}/${props.questions.length} — ${question.consigne}`)
  nextTick(() => input.value?.focus())
}

function submit() {
  const question = currentQuestion.value
  const candidate = answer.value.trim()
  if (!question || !candidate || waitingForNext.value || finished.value) return

  addMessage('learner', candidate)
  const result = validateAnswer(candidate, question.reponses)
  attempts.value.push({
    question,
    answer: candidate,
    status: result.isCorrect ? 'correct' : 'incorrect',
    ...(result.matchedAnswer ? { matchedAnswer: result.matchedAnswer } : {})
  })

  if (result.isCorrect) {
    addMessage('coach', 'Exactement, bravo !', 'success')
  } else {
    addMessage(
      'coach',
      `Presque. La réponse attendue était : ${question.reponsesPourCorrige.join(' ou ')}.`,
      'error'
    )
  }

  answer.value = ''
  waitingForNext.value = true
}

function continueChat() {
  if (!waitingForNext.value) return
  if (currentIndex.value >= props.questions.length - 1) {
    finished.value = true
    waitingForNext.value = false
    addMessage('coach', `Défi terminé : ${correctCount.value}/${attempts.value.length}, soit ${score.value} %.`)
    return
  }

  currentIndex.value += 1
  waitingForNext.value = false
  askCurrentQuestion()
}

function restart() {
  currentIndex.value = 0
  answer.value = ''
  attempts.value = []
  messages.value = []
  waitingForNext.value = false
  finished.value = false
  addMessage('coach', 'On recommence. Prêt ?')
  askCurrentQuestion()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  document.body.classList.add('dialog-open')
  addMessage('coach', 'Bonjour ! Je vais te proposer quelques conjugaisons.')
  askCurrentQuestion()
})

onBeforeUnmount(() => document.body.classList.remove('dialog-open'))
</script>

<template>
  <Teleport to="body">
    <div class="chat-overlay" @keydown="onKeydown">
      <section class="chat-dialog" role="dialog" aria-modal="true" aria-labelledby="chat-title">
        <header class="chat-header">
          <div class="coach-avatar" aria-hidden="true">T</div>
          <div>
            <h2 id="chat-title">Coach Tatitotu</h2>
            <p><span /> En ligne · défi de conjugaison</p>
          </div>
          <button type="button" aria-label="Quitter le chat" @click="emit('close')">×</button>
        </header>

        <div class="chat-progress" aria-label="Progression">
          <span :style="{ width: `${finished ? 100 : (currentIndex / questions.length) * 100}%` }" />
        </div>

        <div ref="chat-thread" class="chat-thread" aria-live="polite">
          <div
            v-for="message in messages"
            :key="message.id"
            class="chat-message"
            :class="[
              `chat-message--${message.author}`,
              message.tone ? `chat-message--${message.tone}` : ''
            ]"
          >
            {{ message.text }}
          </div>

          <section v-if="finished" class="chat-score">
            <strong>{{ score }} %</strong>
            <span>{{ correctCount }} réponse{{ correctCount > 1 ? 's' : '' }} juste{{ correctCount > 1 ? 's' : '' }} sur {{ attempts.length }}</span>
          </section>
        </div>

        <form v-if="!finished" class="chat-composer" @submit.prevent="waitingForNext ? continueChat() : submit()">
          <label class="sr-only" for="chat-answer">Ta réponse</label>
          <input
            id="chat-answer"
            ref="chat-answer"
            v-model="answer"
            type="text"
            autocomplete="off"
            :disabled="waitingForNext"
            placeholder="Écris ta réponse…"
          >
          <button type="submit" :disabled="!waitingForNext && !answer.trim()">
            {{ waitingForNext ? 'Continuer' : 'Envoyer' }}
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
  grid-template-rows: auto 4px 1fr auto;
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
  background: #295f72;
}

.coach-avatar {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  place-items: center;
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

.chat-header > button {
  margin-left: auto;
  border: 0;
  color: white;
  font-size: 1.8rem;
  background: transparent;
  cursor: pointer;
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

.chat-thread {
  display: flex;
  overflow-y: auto;
  flex-direction: column;
  gap: 10px;
  padding: 24px;
}

.chat-message {
  width: fit-content;
  max-width: min(82%, 560px);
  padding: 11px 15px;
  border-radius: 17px 17px 17px 5px;
  line-height: 1.45;
  background: white;
  box-shadow: 0 3px 14px rgb(50 78 92 / 9%);
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
}
</style>

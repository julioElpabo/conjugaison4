<script setup lang="ts">
import type { ExerciseAttempt, ExerciseQuestion } from '~~/shared/types/conjugation'
import { validateAnswer } from '~~/shared/utils/answer'

const props = defineProps<{
  questions: ExerciseQuestion[]
  exerciseKind: 'conjugation' | 'tense-identification'
}>()

const emit = defineEmits<{
  close: []
}>()

const currentIndex = ref(0)
const answer = ref('')
const feedback = ref<'idle' | 'correct' | 'incorrect'>('idle')
const attempts = ref<ExerciseAttempt[]>([])
const isFinished = ref(false)
const answerInput = useTemplateRef<HTMLInputElement>('answer-input')
const dialog = useTemplateRef<HTMLElement>('exercise-dialog')

const currentQuestion = computed(() => props.questions[currentIndex.value])
const correctCount = computed(() => attempts.value.filter(attempt => attempt.status === 'correct').length)
const scorePercent = computed(() => attempts.value.length
  ? Math.round(correctCount.value / attempts.value.length * 100)
  : 0)
const correction = computed(() => currentQuestion.value?.reponsesPourCorrige.join(' ou ') ?? '')
const titleMessage = computed(() => {
  if (scorePercent.value >= 90) return 'Excellent !'
  if (scorePercent.value >= 60) return 'Bravo !'
  if (scorePercent.value >= 40) return 'Bel effort !'
  return 'Continue, tu progresses !'
})

onMounted(() => {
  document.body.classList.add('dialog-open')
  nextTick(() => answerInput.value?.focus())
})

onBeforeUnmount(() => {
  document.body.classList.remove('dialog-open')
})

function submitAnswer() {
  const question = currentQuestion.value
  if (!question || feedback.value !== 'idle' || !answer.value.trim()) {
    return
  }

  const result = validateAnswer(answer.value, question.reponses)
  feedback.value = result.isCorrect ? 'correct' : 'incorrect'
  attempts.value.push({
    question,
    answer: answer.value,
    status: result.isCorrect ? 'correct' : 'incorrect',
    ...(result.matchedAnswer ? { matchedAnswer: result.matchedAnswer } : {})
  })
}

function nextQuestion() {
  if (feedback.value === 'idle') {
    return
  }

  if (currentIndex.value >= props.questions.length - 1) {
    isFinished.value = true
    nextTick(() => dialog.value?.focus())
    return
  }

  currentIndex.value += 1
  answer.value = ''
  feedback.value = 'idle'
  nextTick(() => answerInput.value?.focus())
}

function restart() {
  currentIndex.value = 0
  answer.value = ''
  feedback.value = 'idle'
  attempts.value = []
  isFinished.value = false
  nextTick(() => answerInput.value?.focus())
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="exercise-overlay" @keydown="onKeydown">
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
            <p class="dialog-kicker">Questionnaire</p>
            <h2 id="exercise-title">
              {{ isFinished ? 'Résultats' : `Question ${currentIndex + 1} sur ${questions.length}` }}
            </h2>
          </div>
          <button class="dialog-close" type="button" aria-label="Quitter l’exercice" @click="emit('close')">×</button>
        </header>

        <div class="exercise-progress" aria-label="Progression du questionnaire">
          <span
            v-for="(_, index) in questions"
            :key="index"
            :class="{
              'is-current': !isFinished && index === currentIndex,
              'is-correct': attempts[index]?.status === 'correct',
              'is-incorrect': attempts[index]?.status === 'incorrect'
            }"
          />
        </div>

        <div v-if="!isFinished && currentQuestion" class="exercise-question">
          <p v-if="exerciseKind === 'tense-identification'" class="question-instruction">
            Trouve le mode et le temps de cette forme :
          </p>
          <p class="question-text">{{ currentQuestion.consigne }}</p>

          <form class="answer-form" @submit.prevent="feedback === 'idle' ? submitAnswer() : nextQuestion()">
            <label for="exercise-answer">Ta réponse</label>
            <div class="answer-form__row">
              <input
                id="exercise-answer"
                ref="answer-input"
                v-model="answer"
                type="text"
                autocomplete="off"
                :disabled="feedback !== 'idle'"
                :class="{
                  'is-valid': feedback === 'correct',
                  'is-invalid': feedback === 'incorrect'
                }"
                :aria-invalid="feedback === 'incorrect'"
                :aria-describedby="feedback !== 'idle' ? 'answer-feedback' : undefined"
              >
              <button v-if="feedback === 'idle'" class="primary-button" type="submit" :disabled="!answer.trim()">
                Vérifier
              </button>
              <button v-else class="primary-button" type="submit">
                {{ currentIndex === questions.length - 1 ? 'Voir mes résultats' : 'Question suivante' }}
              </button>
            </div>
          </form>

          <div
            v-if="feedback !== 'idle'"
            id="answer-feedback"
            class="answer-feedback"
            :class="`answer-feedback--${feedback}`"
            aria-live="polite"
          >
            <strong>{{ feedback === 'correct' ? 'Bravo, c’est juste !' : 'Pas tout à fait.' }}</strong>
            <p v-if="feedback === 'incorrect'">La réponse attendue était : <strong>{{ correction }}</strong>.</p>
            <p v-else>Tu peux passer à la question suivante.</p>
          </div>
        </div>

        <div v-else class="exercise-results">
          <div class="results-hero">
            <p>{{ titleMessage }}</p>
            <strong>{{ scorePercent }}%</strong>
            <span>{{ correctCount }} bonne{{ correctCount > 1 ? 's' : '' }} réponse{{ correctCount > 1 ? 's' : '' }} sur {{ attempts.length }}</span>
          </div>

          <div class="results-table-wrap">
            <table class="results-table">
              <caption>Récapitulatif des réponses</caption>
              <thead>
                <tr>
                  <th scope="col">Question</th>
                  <th scope="col">Ta réponse</th>
                  <th scope="col">Correction</th>
                  <th scope="col">Résultat</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(attempt, index) in attempts" :key="index">
                  <td>{{ attempt.question.consigne }}</td>
                  <td>{{ attempt.answer }}</td>
                  <td>{{ attempt.question.reponsesPourCorrige.join(' ou ') }}</td>
                  <td>
                    <span :class="attempt.status === 'correct' ? 'result-good' : 'result-bad'">
                      {{ attempt.status === 'correct' ? 'Juste' : 'À revoir' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="dialog-actions">
            <button class="secondary-button" type="button" @click="emit('close')">Fermer</button>
            <button class="primary-button" type="button" @click="restart">Recommencer</button>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>

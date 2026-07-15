<script setup lang="ts">
import type { ExerciseAttempt, ExerciseQuestion } from '~~/shared/types/conjugation'
import { getAlternativeCorrections } from '~~/shared/utils/answer'
import { evaluateExerciseAnswer } from '~~/shared/utils/exercise-attempt'

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
const retryAlreadyOffered = ref(false)
const retryMessageVisible = ref(false)
const attempts = ref<ExerciseAttempt[]>([])
const isFinished = ref(false)
const answerInput = useTemplateRef<HTMLInputElement>('answer-input')
const dialog = useTemplateRef<HTMLElement>('exercise-dialog')

useDialogFocus(dialog, () => emit('close'), answerInput)

const currentQuestion = computed(() => props.questions[currentIndex.value])
const correctCount = computed(() => attempts.value.filter(attempt => attempt.status === 'correct').length)
const scorePercent = computed(() => attempts.value.length
  ? Math.round(correctCount.value / attempts.value.length * 100)
  : 0)
const correction = computed(() => currentQuestion.value?.reponsesPourCorrige.join(' ou ') ?? '')
const alternativeCorrections = computed(() => currentQuestion.value
  ? getAlternativeCorrections(answer.value, currentQuestion.value.reponsesPourCorrige)
  : [])
const alternativeText = computed(() => alternativeCorrections.value.join(' ou '))
const alternativePunctuation = computed(() => /[.!?]$/u.test(alternativeText.value) ? '' : '.')
const agreementReminder = computed(() => currentQuestion.value?.agreementReminder)
const agreementFeatures = computed(() => {
  const reminder = agreementReminder.value
  if (!reminder?.gender || !reminder.number) return ''
  return `${reminder.gender === 'feminin' ? 'féminin' : 'masculin'} ${reminder.number}`
})
const indirectRecognition = computed(() => {
  const preposition = agreementReminder.value?.preposition || 'à'
  return `${agreementReminder.value?.infinitive} ${preposition} qui ? / ${preposition} quoi ?`
})
const titleMessage = computed(() => {
  if (scorePercent.value >= 90) return 'Excellent !'
  if (scorePercent.value >= 60) return 'Bravo !'
  if (scorePercent.value >= 40) return 'Bel effort !'
  return 'Continue, tu progresses !'
})

function submitAnswer() {
  const question = currentQuestion.value
  if (!question || feedback.value !== 'idle' || !answer.value.trim()) {
    return
  }

  const { result, shouldRetry } = evaluateExerciseAnswer(
    answer.value,
    question.reponses,
    retryAlreadyOffered.value,
  )
  if (shouldRetry) {
    retryAlreadyOffered.value = true
    retryMessageVisible.value = true
    nextTick(() => {
      answerInput.value?.focus()
      answerInput.value?.select()
    })
    return
  }

  retryMessageVisible.value = false
  feedback.value = result.isCorrect ? 'correct' : 'incorrect'
  attempts.value.push({
    question,
    answer: answer.value,
    status: result.isCorrect ? 'correct' : 'incorrect',
    attemptNumber: retryAlreadyOffered.value ? 2 : 1,
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
  retryAlreadyOffered.value = false
  retryMessageVisible.value = false
  nextTick(() => answerInput.value?.focus())
}

function restart() {
  currentIndex.value = 0
  answer.value = ''
  feedback.value = 'idle'
  retryAlreadyOffered.value = false
  retryMessageVisible.value = false
  attempts.value = []
  isFinished.value = false
  nextTick(() => answerInput.value?.focus())
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter'
    || event.isComposing
    || event.repeat
    || isFinished.value
    || feedback.value === 'idle') {
    return
  }

  event.preventDefault()
  event.stopPropagation()
  nextQuestion()
}

onMounted(() => document.addEventListener('keydown', onDocumentKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onDocumentKeydown))

</script>

<template>
  <Teleport to="body">
    <div class="exercise-overlay">
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
              'is-correct': attempts[index]?.status === 'correct' && attempts[index]?.attemptNumber !== 2,
              'is-correct-retry': attempts[index]?.status === 'correct' && attempts[index]?.attemptNumber === 2,
              'is-incorrect': attempts[index]?.status === 'incorrect'
            }"
          />
        </div>

        <div v-if="!isFinished && currentQuestion" class="exercise-question">
          <p v-if="exerciseKind === 'tense-identification'" class="question-instruction">
            {{ currentQuestion.instruction }}
          </p>
          <template v-if="exerciseKind === 'conjugation' && currentQuestion.complement">
            <p class="question-context" aria-label="Contexte grammatical">
              <span>Verbe : <strong>{{ currentQuestion.infinitif }}</strong></span>
              <i aria-hidden="true">|</i>
              <span>Mode : <strong>{{ currentQuestion.mode }}</strong></span>
              <i aria-hidden="true">|</i>
              <span>Temps : <strong>{{ currentQuestion.temps }}</strong></span>
              <template v-if="currentQuestion.mode?.toLocaleLowerCase('fr') === 'impératif'">
                <i aria-hidden="true">|</i>
                <span>Personne : <strong>{{ currentQuestion.pronom }}</strong></span>
              </template>
            </p>

            <form class="completion-form" @submit.prevent="feedback === 'idle' ? submitAnswer() : nextQuestion()">
              <div class="completion-sentence">
                <span v-if="currentQuestion.complementPosition === 'before'">{{ currentQuestion.complement }}</span>
                <span v-if="currentQuestion.saisiePrefixe" class="completion-sentence__prefix">{{ currentQuestion.saisiePrefixe }}</span>
                <input
                  id="exercise-answer"
                  ref="answer-input"
                  v-model="answer"
                  type="text"
                  autocomplete="off"
                  :aria-label="`Forme conjuguée de ${currentQuestion.infinitif}`"
                  :disabled="feedback !== 'idle'"
                  :class="{
                    'is-valid': feedback === 'correct',
                    'is-invalid': feedback === 'incorrect' || retryMessageVisible
                  }"
                  :aria-invalid="feedback === 'incorrect' || retryMessageVisible"
                  :aria-describedby="feedback !== 'idle' ? 'answer-feedback' : retryMessageVisible ? 'answer-retry' : undefined"
                >
                <span v-if="currentQuestion.complementPosition !== 'before'">
                  {{ currentQuestion.complement }}{{ currentQuestion.mode?.toLocaleLowerCase('fr') === 'impératif' ? ' !' : '' }}
                </span>
              </div>
              <button v-if="feedback === 'idle'" class="primary-button" type="submit" :disabled="!answer.trim()">
                Vérifier
              </button>
              <button v-else class="primary-button" type="submit">
                {{ currentIndex === questions.length - 1 ? 'Voir mes résultats' : 'Question suivante' }}
              </button>
            </form>
            <p v-if="retryMessageVisible" id="answer-retry" class="answer-retry" aria-live="polite">
              Pas encore. Vérifie ta réponse et essaie une deuxième fois.
            </p>
          </template>

          <p v-else class="question-text">{{ currentQuestion.consigne }}</p>

          <form v-if="!(exerciseKind === 'conjugation' && currentQuestion.complement)" class="answer-form" @submit.prevent="feedback === 'idle' ? submitAnswer() : nextQuestion()">
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
                  'is-invalid': feedback === 'incorrect' || retryMessageVisible
                }"
                :aria-invalid="feedback === 'incorrect' || retryMessageVisible"
                :aria-describedby="feedback !== 'idle' ? 'answer-feedback' : retryMessageVisible ? 'answer-retry' : undefined"
              >
              <button v-if="feedback === 'idle'" class="primary-button" type="submit" :disabled="!answer.trim()">
                Vérifier
              </button>
              <button v-else class="primary-button" type="submit">
                {{ currentIndex === questions.length - 1 ? 'Voir mes résultats' : 'Question suivante' }}
              </button>
            </div>
          </form>
          <p v-if="retryMessageVisible && !(exerciseKind === 'conjugation' && currentQuestion.complement)" id="answer-retry" class="answer-retry" aria-live="polite">
            Pas encore. Vérifie ta réponse et essaie une deuxième fois.
          </p>

          <div
            v-if="feedback !== 'idle'"
            id="answer-feedback"
            class="answer-feedback"
            :class="`answer-feedback--${feedback}`"
            aria-live="polite"
          >
            <strong>{{ feedback === 'correct' ? 'Bravo, c’est juste !' : 'Pas tout à fait.' }}</strong>
            <p v-if="feedback === 'incorrect'">La réponse attendue était : <strong>{{ correction }}</strong>.</p>
            <p v-else-if="alternativeCorrections.length">
              On peut aussi répondre : <strong>{{ alternativeText }}</strong>{{ alternativePunctuation }}
            </p>
            <p v-else>Tu peux passer à la question suivante.</p>

            <aside v-if="agreementReminder" class="grammar-reminder">
              <strong>Rappel de la règle</strong>

              <template v-if="agreementReminder.kind === 'cod-before'">
                <p v-if="feedback === 'correct'">
                  C’est juste : le COD <strong>« {{ agreementReminder.complement }} »</strong> est placé avant
                  le verbe <strong>« {{ agreementReminder.infinitive }} »</strong>. Avec l’auxiliaire
                  <em>avoir</em>, le participe passé s’accorde donc avec ce COD<span v-if="agreementFeatures">,
                  {{ agreementFeatures }}</span> : <strong>« {{ agreementReminder.participle }} »</strong>.
                </p>
                <p v-else>
                  Ici, le COD <strong>« {{ agreementReminder.complement }} »</strong> est placé avant le verbe
                  <strong>« {{ agreementReminder.infinitive }} »</strong>. Avec <em>avoir</em>, il commande
                  l’accord du participe passé<span v-if="agreementFeatures"> au {{ agreementFeatures }}</span> :
                  <strong>« {{ agreementReminder.participle }} »</strong>.
                </p>
                <small>
                  Pour reconnaître le COD, pose « {{ agreementReminder.infinitive }} qui ? » ou
                  « {{ agreementReminder.infinitive }} quoi ? ». Il répond sans préposition.
                </small>
              </template>

              <template v-else-if="agreementReminder.kind === 'cod-after'">
                <p v-if="feedback === 'correct'">
                  C’est juste : le COD <strong>« {{ agreementReminder.complement }} »</strong> est placé après
                  le verbe <strong>« {{ agreementReminder.infinitive }} »</strong>. Avec <em>avoir</em>, on
                  n’accorde pas le participe passé avec un COD placé après : il reste
                  <strong>« {{ agreementReminder.participle }} »</strong>.
                </p>
                <p v-else>
                  Ici, le COD <strong>« {{ agreementReminder.complement }} »</strong> est placé après le verbe
                  <strong>« {{ agreementReminder.infinitive }} »</strong>. Il ne commande donc aucun accord :
                  le participe passé reste <strong>« {{ agreementReminder.participle }} »</strong>.
                </p>
                <small>
                  Pour reconnaître le COD, pose « {{ agreementReminder.infinitive }} qui ? » ou
                  « {{ agreementReminder.infinitive }} quoi ? ». Il répond sans préposition.
                </small>
              </template>

              <template v-else>
                <p v-if="feedback === 'correct'">
                  C’est juste : <strong>« {{ agreementReminder.complement }} »</strong> n’est pas un COD,
                  mais un COI du verbe <strong>« {{ agreementReminder.infinitive }} »</strong>. Un COI ne
                  commande jamais l’accord du participe passé employé avec <em>avoir</em> : il reste
                  <strong>« {{ agreementReminder.participle }} »</strong>.
                </p>
                <p v-else>
                  Attention : <strong>« {{ agreementReminder.complement }} »</strong> n’est pas un COD, mais
                  un COI du verbe <strong>« {{ agreementReminder.infinitive }} »</strong>. Si tu as accordé le
                  participe avec ce complément, il ne fallait pas : il reste
                  <strong>« {{ agreementReminder.participle }} »</strong>.
                </p>
                <small>
                  Pour reconnaître le COI, repère sa préposition et pose la question
                  « {{ indirectRecognition }} ».
                </small>
              </template>
            </aside>
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
                    <span
                      :class="{
                        'result-good': attempt.status === 'correct' && attempt.attemptNumber !== 2,
                        'result-good--retry': attempt.status === 'correct' && attempt.attemptNumber === 2,
                        'result-bad': attempt.status === 'incorrect'
                      }"
                      :aria-label="attempt.status === 'correct' && attempt.attemptNumber === 2 ? 'Juste au deuxième essai' : undefined"
                    >
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

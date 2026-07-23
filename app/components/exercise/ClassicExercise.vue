<script setup lang="ts">
const { ui, uiLabel } = useLanguagePreferences()
import type { ExerciseAttempt, ExerciseQuestion } from '~~/shared/types/conjugation'
import { getAlternativeCorrections } from '~~/shared/utils/answer'
import { evaluateExerciseAnswer } from '~~/shared/utils/exercise-attempt'

const props = defineProps<{
  questions: ExerciseQuestion[]
  exerciseKind: 'conjugation' | 'tense-identification'
}>()
const { track } = useSiteAnalytics()

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
const closeConfirmationOpen = ref(false)
const answerInput = useTemplateRef<HTMLInputElement>('answer-input')
const keepExerciseButton = useTemplateRef<HTMLButtonElement>('keep-exercise-button')
const dialog = useTemplateRef<HTMLElement>('exercise-dialog')

useDialogFocus(dialog, handleEscapeClose, answerInput)

const currentQuestion = computed(() => props.questions[currentIndex.value])
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
  if (!reminder) return ''
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
  track('answer_submitted', { presentation: 'classic', exerciseKind: props.exerciseKind })
  if (shouldRetry) {
    track('answer_retry', { presentation: 'classic', exerciseKind: props.exerciseKind })
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
  if (result.isCorrect) track('answer_correct', { presentation: 'classic', exerciseKind: props.exerciseKind })
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
    track('exercise_completed', { presentation: 'classic', exerciseKind: props.exerciseKind })
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
  track('exercise_started', { presentation: 'classic', exerciseKind: props.exerciseKind })
  nextTick(() => answerInput.value?.focus())
}

function requestClose() {
  closeConfirmationOpen.value = true
  nextTick(() => keepExerciseButton.value?.focus())
}

function handleEscapeClose() {
  if (closeConfirmationOpen.value) cancelClose()
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

onMounted(() => document.addEventListener('keydown', onDocumentKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onDocumentKeydown))

</script>

<template>
  <Teleport to="body">
    <div class="exercise-overlay" @click.self="requestClose">
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
              {{ isFinished ? ui('Résultats') : ui('Question {current} sur {total}', { current: currentIndex + 1, total: questions.length }) }}
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
          <p v-if="exerciseKind === 'tense-identification'" class="question-instruction">
            {{ uiLabel(currentQuestion.instruction) }}
          </p>
          <template v-if="exerciseKind === 'conjugation' && currentQuestion.complement">
            <p class="question-context" :aria-label="ui('Contexte grammatical')">
              <span>{{ ui('Verbe :') }} <strong>{{ currentQuestion.infinitif }}</strong></span>
              <i aria-hidden="true">|</i>
              <span>{{ ui('Mode :') }} <strong>{{ uiLabel(currentQuestion.mode) }}</strong></span>
              <i aria-hidden="true">|</i>
              <span>{{ ui('Temps :') }} <strong>{{ uiLabel(currentQuestion.temps) }}</strong></span>
              <template v-if="currentQuestion.mode?.toLocaleLowerCase('fr') === 'impératif'">
                <i aria-hidden="true">|</i>
                <span>{{ ui('Personne :') }} <strong>{{ currentQuestion.pronom }}</strong></span>
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
                  :aria-label="ui('Forme conjuguée de {verb}', { verb: currentQuestion.infinitif || '' })"
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
              <button v-if="feedback === 'idle'" class="primary-button" type="submit" :disabled="!answer.trim()"> {{ ui('Vérifier') }} </button>
              <button v-else class="primary-button" type="submit">
                {{ currentIndex === questions.length - 1 ? ui('Voir mes résultats') : ui('Question suivante') }}
              </button>
            </form>
            <p v-if="retryMessageVisible" id="answer-retry" class="answer-retry" aria-live="polite"> {{ ui('Pas encore. Vérifie ta réponse et essaie une deuxième fois.') }} </p>
          </template>

          <p v-else class="question-text">{{ currentQuestion.consigne }}</p>

          <form v-if="!(exerciseKind === 'conjugation' && currentQuestion.complement)" class="answer-form" @submit.prevent="feedback === 'idle' ? submitAnswer() : nextQuestion()">
            <label for="exercise-answer">{{ ui('Ta réponse') }}</label>
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
              <button v-if="feedback === 'idle'" class="primary-button" type="submit" :disabled="!answer.trim()"> {{ ui('Vérifier') }} </button>
              <button v-else class="primary-button" type="submit">
                {{ currentIndex === questions.length - 1 ? ui('Voir mes résultats') : ui('Question suivante') }}
              </button>
            </div>
          </form>
          <p v-if="retryMessageVisible && !(exerciseKind === 'conjugation' && currentQuestion.complement)" id="answer-retry" class="answer-retry" aria-live="polite"> {{ ui('Pas encore. Vérifie ta réponse et essaie une deuxième fois.') }} </p>

          <div
            v-if="feedback !== 'idle'"
            id="answer-feedback"
            class="answer-feedback"
            :class="`answer-feedback--${feedback}`"
            aria-live="polite"
          >
            <strong>{{ feedback === 'correct' ? ui('Bravo, c’est juste !') : ui('Pas tout à fait.') }}</strong>
            <p v-if="feedback === 'incorrect'">{{ ui('La réponse attendue était :') }} <strong>{{ correction }}</strong>.</p>
            <p v-else-if="alternativeCorrections.length"> {{ ui('On peut aussi répondre :') }} <strong>{{ alternativeText }}</strong>{{ alternativePunctuation }}
            </p>
            <p v-else>{{ ui('Tu peux passer à la question suivante.') }}</p>

            <aside v-if="agreementReminder" class="grammar-reminder">
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
                  <td>{{ attempt.question.consigne }}</td>
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

          <div class="dialog-actions">
            <button class="secondary-button" type="button" @click="emit('close')">{{ ui('Fermer') }}</button>
            <button class="primary-button" type="button" @click="restart">{{ ui('Recommencer') }}</button>
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
    </div>
  </Teleport>
</template>

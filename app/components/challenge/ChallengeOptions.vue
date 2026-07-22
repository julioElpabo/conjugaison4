<script setup lang="ts">
import type { ComplementOption, ExerciseKind, Verb } from '~/composables/useChallengeBuilder'

const props = defineProps<{
  questionCount: number
  exerciseKind: ExerciseKind
  inclusivePronouns: boolean
  complementOptions: ComplementOption[]
  complementVerbs?: Verb[]
  eyebrow?: string
  idPrefix?: string
  gridLayout?: boolean
  conjugationInstruction?: string
  conjugationQuestionContext?: string
  conjugationQuestion?: string
  conjugationExample?: string
  conjugationExamplePrefix?: string
  conjugationExampleEmphasis?: string
  conjugationExampleSuffix?: string
  conjugationExampleLoading?: boolean
  revealPrefilledOptions?: boolean
}>()

const emit = defineEmits<{
  updateQuestionCount: [value: number]
  updateExerciseKind: [value: ExerciseKind]
  updateInclusivePronouns: [value: boolean]
  updateComplementOptions: [value: ComplementOption[]]
  prefilledOptionsRevealStart: []
}>()

const complementsOpen = ref(Boolean(props.gridLayout))
const selectedComplementVerbs = computed(() => (props.complementVerbs ?? []).filter(verb => Boolean(verb.complementExample)))
const complementsAvailable = computed(() => (
  props.exerciseKind === 'conjugation' && selectedComplementVerbs.value.length > 0
))
const codAvailable = computed(() => selectedComplementVerbs.value.some(verb => verb.complementFunctions?.includes('cod') || verb.complementExample?.functionObject === 'cod'))
const coiAvailable = computed(() => selectedComplementVerbs.value.some(verb => verb.complementFunctions?.includes('coi') || verb.complementExample?.functionObject === 'coi'))
const codBeforeAvailable = computed(() => selectedComplementVerbs.value.some(verb => verb.anteposableComplementFunctions?.includes('cod') || Boolean(verb.complementExample?.before)))
const coiBeforeAvailable = computed(() => selectedComplementVerbs.value.some(verb => verb.anteposableComplementFunctions?.includes('coi')))
const idPrefix = computed(() => props.idPrefix ?? 'challenge-options')
const optionsTitleId = computed(() => `${idPrefix.value}-title`)
const questionCountId = computed(() => `${idPrefix.value}-question-count`)
const exerciseKindName = computed(() => `${idPrefix.value}-exercise-kind`)
const complementPanelId = computed(() => `${idPrefix.value}-complement-panel`)
const hasConjugationExample = computed(() => Boolean(
  (props.conjugationInstruction || props.conjugationQuestionContext || props.conjugationQuestion)
  && props.conjugationExample,
))
const identificationQuestion = computed(() => {
  const question = props.conjugationQuestion?.trim() ?? ''
  return question && !/[.!?]$/u.test(question) ? `${question}.` : question
})
const exampleRevealStage = ref(0)
const exampleRevealTimers: ReturnType<typeof setTimeout>[] = []
const displayedQuestionCount = ref(props.questionCount)
const displayedComplementOptions = ref<ComplementOption[]>([...props.complementOptions])
const prefilledRevealRunning = ref(false)
let questionCountAnimationFrame: number | undefined
const prefilledRevealTimers: ReturnType<typeof setTimeout>[] = []

function clearPrefilledRevealTimers() {
  if (questionCountAnimationFrame !== undefined) {
    cancelAnimationFrame(questionCountAnimationFrame)
    questionCountAnimationFrame = undefined
  }
  while (prefilledRevealTimers.length) clearTimeout(prefilledRevealTimers.pop())
}

function finishPrefilledReveal() {
  clearPrefilledRevealTimers()
  displayedQuestionCount.value = props.questionCount
  displayedComplementOptions.value = [...props.complementOptions]
  prefilledRevealRunning.value = false
}

function revealPrefilledOptions() {
  if (!import.meta.client || prefilledRevealRunning.value) return
  emit('prefilledOptionsRevealStart')
  clearPrefilledRevealTimers()

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finishPrefilledReveal()
    return
  }

  const targetCount = Math.max(0, props.questionCount)
  const targetOptions = [...props.complementOptions]
  const duration = 500
  const startedAt = performance.now()
  prefilledRevealRunning.value = true
  displayedQuestionCount.value = 0
  displayedComplementOptions.value = []

  const animateCount = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration)
    displayedQuestionCount.value = Math.round(targetCount * progress)
    if (progress < 1) questionCountAnimationFrame = requestAnimationFrame(animateCount)
    else questionCountAnimationFrame = undefined
  }
  questionCountAnimationFrame = requestAnimationFrame(animateCount)

  targetOptions.forEach((option, index) => {
    prefilledRevealTimers.push(setTimeout(() => {
      displayedComplementOptions.value = [...displayedComplementOptions.value, option]
    }, Math.round((index / targetOptions.length) * duration)))
  })
  prefilledRevealTimers.push(setTimeout(finishPrefilledReveal, duration))
}

function clearExampleRevealTimers() {
  while (exampleRevealTimers.length) clearTimeout(exampleRevealTimers.pop())
}

watch(
  () => props.conjugationExampleLoading,
  (loading) => {
    clearExampleRevealTimers()
    exampleRevealStage.value = 0
    if (loading) return
    exampleRevealTimers.push(
      setTimeout(() => { exampleRevealStage.value = 1 }, 80),
      setTimeout(() => { exampleRevealStage.value = 2 }, 280),
    )
  },
  { immediate: true },
)

watch(() => props.questionCount, value => {
  if (!prefilledRevealRunning.value) displayedQuestionCount.value = value
})

watch(() => props.complementOptions, value => {
  if (!prefilledRevealRunning.value) displayedComplementOptions.value = [...value]
}, { deep: true })

watch(() => props.revealPrefilledOptions, reveal => {
  if (reveal) revealPrefilledOptions()
})

onMounted(() => {
  if (props.revealPrefilledOptions) revealPrefilledOptions()
})

onBeforeUnmount(() => {
  clearExampleRevealTimers()
  clearPrefilledRevealTimers()
})

function onQuestionCountChange(event: Event) {
  if (prefilledRevealRunning.value) finishPrefilledReveal()
  const rawValue = (event.target as HTMLInputElement).value
  if (rawValue === '') return
  const value = Number(rawValue)
  if (!Number.isFinite(value)) return
  emit('updateQuestionCount', Math.min(99, Math.max(1, Math.round(value))))
}

function onExerciseKindChange(event: Event) {
  emit('updateExerciseKind', (event.target as HTMLInputElement).value as ExerciseKind)
}

function toggleComplementOption(option: ComplementOption, checked: boolean) {
  if (prefilledRevealRunning.value) finishPrefilledReveal()
  const next = new Set(props.complementOptions)
  if (checked) next.add(option)
  else next.delete(option)
  emit('updateComplementOptions', [...next])
}

watch(complementsAvailable, (available) => {
  if (!available) complementsOpen.value = false
  else if (props.gridLayout) complementsOpen.value = true
}, { immediate: true })

</script>

<template>
  <section
    class="builder-card options-card"
    :class="{ 'options-card--grid': gridLayout, 'options-card--revealing': prefilledRevealRunning }"
    :aria-labelledby="optionsTitleId"
  >
    <div class="builder-card__header">
      <div>
        <p class="builder-card__eyebrow">{{ eyebrow ?? 'Étape 3' }}</p>
        <h2 :id="optionsTitleId">Mes options</h2>
      </div>
    </div>

    <div class="options-layout" :class="{ 'options-layout--columns': gridLayout }">
    <div class="options-fields" :class="{ 'options-fields--columns': gridLayout }">
      <div class="options-main-column">
        <label class="field-stack question-count-field" :for="questionCountId">
          <span>Nombre de questions</span>
          <input
            :id="questionCountId"
            type="number"
            inputmode="numeric"
            min="1"
            max="99"
            step="1"
            :value="displayedQuestionCount"
            @input="onQuestionCountChange"
          >
        </label>

        <label class="check-row">
          <input
            type="checkbox"
            :checked="inclusivePronouns"
            @change="emit('updateInclusivePronouns', ($event.target as HTMLInputElement).checked)"
          >
          <span>
            Inclure les pronoms <strong>iel / iels</strong>
            <small>Ils apparaîtront ponctuellement dans les questions.</small>
          </span>
        </label>

        <fieldset class="option-fieldset">
          <legend>Type d’exercice</legend>
          <div class="segmented-control">
            <label>
              <input
                type="radio"
                :name="exerciseKindName"
                value="conjugation"
                :checked="exerciseKind === 'conjugation'"
                @change="onExerciseKindChange"
              >
              <span>Conjuguer</span>
            </label>
            <label>
              <input
                type="radio"
                :name="exerciseKindName"
                value="tense-identification"
                :checked="exerciseKind === 'tense-identification'"
                @change="onExerciseKindChange"
              >
              <span>Trouver le mode et le temps</span>
            </label>
          </div>
        </fieldset>

      </div>

      <div
        class="complement-options"
        :class="{
          'complement-options--disabled': !complementsAvailable,
          'complement-options--hidden': gridLayout && exerciseKind === 'tense-identification',
        }"
        :aria-hidden="gridLayout && exerciseKind === 'tense-identification' ? 'true' : undefined"
      >
      <h3 v-if="gridLayout" class="complement-options__title">Compléments d’objets&nbsp;:</h3>
      <p v-if="gridLayout" class="complement-options__description">Ajoute des compléments d’objets directs ou indirects.</p>
      <button
        v-else
        class="complement-options__trigger"
        type="button"
        :disabled="!complementsAvailable"
        :aria-expanded="complementsOpen"
        :aria-controls="complementPanelId"
        @click="complementsOpen = !complementsOpen"
      >
        <span>Compléments d’objets&nbsp;: <small>nouveau</small></span>
        <span aria-hidden="true">{{ complementsOpen ? '−' : '+' }}</span>
      </button>
      <p v-if="!complementsAvailable" class="complement-options__unavailable">
        {{ exerciseKind !== 'conjugation'
          ? 'Disponible uniquement pour un exercice de conjugaison.'
          : 'Les verbes choisis ne proposent pas de complément.' }}
      </p>

      <Transition name="complement-panel">
        <fieldset v-if="gridLayout || complementsOpen" :id="complementPanelId" class="complement-options__panel">
          <legend class="sr-only">Présentation des compléments d’objets</legend>
          <label>
            <input type="checkbox" :disabled="!complementsAvailable || !codAvailable" :checked="displayedComplementOptions.includes('cod-after')" @change="toggleComplementOption('cod-after', ($event.target as HTMLInputElement).checked)">
            <span><strong>COD placé après</strong></span>
          </label>
          <label>
            <input type="checkbox" :disabled="!complementsAvailable || !codBeforeAvailable" :checked="displayedComplementOptions.includes('cod-before')" @change="toggleComplementOption('cod-before', ($event.target as HTMLInputElement).checked)">
            <span><strong>COD placé avant</strong></span>
          </label>
          <label>
            <input type="checkbox" :disabled="!complementsAvailable || !coiAvailable" :checked="displayedComplementOptions.includes('coi-after')" @change="toggleComplementOption('coi-after', ($event.target as HTMLInputElement).checked)">
            <span><strong>COI placé après</strong></span>
          </label>
          <label>
            <input type="checkbox" :disabled="!complementsAvailable || !coiBeforeAvailable" :checked="displayedComplementOptions.includes('coi-before')" @change="toggleComplementOption('coi-before', ($event.target as HTMLInputElement).checked)">
            <span><strong>COI placé avant</strong></span>
          </label>
        </fieldset>
      </Transition>
      </div>
    </div>

    <div
      v-if="gridLayout && (conjugationExampleLoading || hasConjugationExample)"
      class="conjugation-example"
      :class="{ 'conjugation-example--wide': exerciseKind === 'tense-identification' }"
      aria-live="polite"
      aria-atomic="true"
    >
      <div class="conjugation-example__header">
        <span class="conjugation-example__preview-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
        <div class="conjugation-example__heading">
          <span>Aperçu d’une question</span>
        </div>
      </div>

      <div class="conjugation-example__screen">
        <div v-if="conjugationExampleLoading" class="conjugation-example__loading" role="status">
          <span class="conjugation-example__spinner" aria-hidden="true" />
          <span class="sr-only">Préparation de l’aperçu</span>
        </div>

        <div v-else class="conjugation-example__body">
          <Transition name="example-item">
            <div v-if="exampleRevealStage >= 1" class="conjugation-example__question">
              <span class="conjugation-example__block-label">Exemple de question</span>
              <p v-if="exerciseKind === 'tense-identification' && conjugationInstruction && conjugationQuestion" class="conjugation-example__question-line">
                <span class="conjugation-example__context">{{ conjugationInstruction }}</span>
                <span class="conjugation-example__question-separator" aria-hidden="true">—</span>
                <span class="conjugation-example__prompt">{{ identificationQuestion }}</span>
              </p>
              <template v-else>
                <p v-if="conjugationInstruction" class="conjugation-example__instruction">{{ conjugationInstruction }}</p>
                <p v-if="conjugationQuestionContext" class="conjugation-example__question-line">
                  <span class="conjugation-example__context">{{ conjugationQuestionContext }}</span>
                </p>
              </template>
            </div>
          </Transition>

          <Transition name="example-item">
            <div v-if="exampleRevealStage >= 2" class="conjugation-example__correction">
              <span>Réponse attendue</span>
              <p>
                <template v-if="conjugationExampleEmphasis">
                  <span>{{ conjugationExamplePrefix }}</span><strong>{{ conjugationExampleEmphasis }}</strong><span>{{ conjugationExampleSuffix }}</span>
                </template>
                <span v-else>{{ conjugationExample }}</span>
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
    </div>

  </section>
</template>

<style scoped>
.options-card--grid { padding-bottom: 0; }
.options-layout--columns { display: grid; padding: 24px; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: stretch; gap: 16px; }
.options-layout--columns > .options-fields { display: contents; }
.options-layout--columns > .options-fields > * { min-width: 0; margin: 0; padding: 18px; border: 1px solid #bfd2cc; border-radius: 15px; background: #fbfdfc; }
.options-main-column { display: grid; align-content: start; gap: 18px; }
.options-main-column > * { margin: 0; }
.options-main-column > .check-row { padding: 15px 4px; }
.options-main-column > .option-fieldset { padding: 14px 0 0; }
.question-count-field { display: grid; grid-template-columns: minmax(0, 1fr) 62px; grid-template-rows: 46px; align-items: center; gap: 0 10px; }
.question-count-field > span:first-child { display: flex; height: 46px; align-items: center; line-height: 1.2; }
.question-count-field > input { width: 62px; min-width: 0; height: 46px; padding-inline: 8px 5px; align-self: center; text-align: center; }
.field-hint { display: block; margin-top: 6px; color: var(--muted); font-size: .72rem; }
.conjugation-example { margin: 10px 24px 28px; padding: 20px; overflow: hidden; border: 2px dashed #aa94c5; border-radius: 20px; background: linear-gradient(145deg, #f6f2fb, #f0eaf8 62%, #eae2f4); box-shadow: 0 12px 30px rgb(77 55 105 / 12%); color: var(--brand-dark); }
.options-layout--columns > .conjugation-example { min-width: 0; margin: 0; border-radius: 15px; }
.options-layout--columns > .conjugation-example--wide { grid-column: 2 / -1; }
.conjugation-example__header { display: grid; min-height: 62px; margin-bottom: 17px; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 13px; }
.conjugation-example__preview-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 50%; color: #695284; background: #e3d9f0; box-shadow: 0 0 0 6px rgb(105 82 132 / 8%); font-size: 1.05rem; }
.conjugation-example__preview-icon svg { width: 23px; height: 23px; }
.conjugation-example__heading { display: grid; gap: 2px; }
.conjugation-example__heading > span { color: #695284; font-size: 1.08rem; font-weight: 850; letter-spacing: .025em; text-transform: uppercase; }
.conjugation-example__screen { color: var(--brand-dark); }
.conjugation-example__block-label,
.conjugation-example__correction > span { color: var(--muted); font-size: .7rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
.conjugation-example__loading { display: grid; min-height: 180px; place-content: center; place-items: center; gap: 14px; color: var(--muted); text-align: center; }
.conjugation-example__spinner { width: 38px; height: 38px; border: 4px solid #d5e4df; border-top-color: var(--brand); border-radius: 50%; animation: example-spinner 700ms linear infinite; }
.conjugation-example__body { display: grid; align-content: start; gap: 26px; }
.conjugation-example__question { display: grid; padding: 15px 17px; gap: 8px; border: 1px solid #c9d9d5; border-radius: 12px; background: rgb(255 255 255 / 62%); }
.conjugation-example__question p { margin: 0; }
.conjugation-example__instruction { color: var(--brand-dark); font-size: 1.08rem; font-weight: 850; }
.conjugation-example__question-line { display: flex; align-items: center; flex-wrap: wrap; gap: 7px 10px; }
.conjugation-example__context { color: var(--muted); font-size: .86rem; font-weight: 700; }
.conjugation-example__question-separator { color: #9bb0aa; font-weight: 700; }
.conjugation-example__prompt { color: var(--ink); font-size: 1.25rem; font-weight: 800; letter-spacing: .025em; line-height: 1.45; }
.conjugation-example__question-line .conjugation-example__prompt { font-size: 1.05rem; }
.conjugation-example__correction { display: grid; padding: 15px 17px; gap: 8px; border: 1px solid #acd1bb; border-radius: 12px; background: rgb(255 255 255 / 62%); }
.conjugation-example__correction p { margin: 0; color: var(--success); font-size: 1.05rem; font-weight: 400; line-height: 1.4; white-space: pre-wrap; }
.conjugation-example__correction p > span { color: inherit; font: inherit; font-weight: 400; letter-spacing: normal; text-transform: none; }
.conjugation-example__correction strong { color: var(--success); font-size: inherit; font-weight: 850; letter-spacing: .025em; }
.example-item-enter-active { transition: opacity 230ms ease, transform 230ms ease; }
.example-item-enter-from { opacity: 0; transform: translateY(10px); }
@keyframes example-spinner { to { transform: rotate(360deg); } }
@keyframes prefilled-option-check {
  0% { opacity: .25; transform: scale(.55); }
  70% { transform: scale(1.18); }
  100% { opacity: 1; transform: scale(1); }
}
.complement-options { margin-bottom: 18px; }
.complement-options__title { margin: 0 0 12px; color: var(--brand-dark); font-size: 1rem; font-weight: 800; }
.complement-options__description { margin: -5px 0 12px; color: var(--muted); font-size: .82rem; line-height: 1.4; }
.complement-options__trigger { display: flex; width: 100%; min-height: 48px; padding: 10px 13px; align-items: center; justify-content: space-between; gap: 12px; color: var(--brand-dark); background: var(--brand-pale); border: 1px solid #a9c9bf; border-radius: 11px; font-weight: 850; text-align: left; }
.complement-options__trigger:disabled { cursor: not-allowed; filter: grayscale(.65); opacity: .55; }
.complement-options--disabled { background: #f3f5f4; }
.complement-options--hidden { display: none; }
.complement-options__unavailable { margin: 10px 3px 0; color: var(--muted); font-size: .82rem; line-height: 1.35; }
.complement-options__trigger > span:first-child { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.complement-options__trigger small { padding: 3px 7px; color: white; background: var(--brand); border-radius: 999px; font-size: .62rem; font-weight: 900; letter-spacing: .06em; line-height: 1; text-transform: uppercase; }
.complement-options__trigger > span:last-child { font-size: 1.25rem; font-weight: 500; }
.complement-options__panel { display: grid; margin: 8px 0 0; padding: 8px; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; border: 1px solid var(--line); border-radius: 12px; }
.options-fields--columns .complement-options__panel { grid-template-columns: 1fr; }
.complement-options__panel label { display: flex; min-width: 0; padding: 9px; align-items: flex-start; gap: 8px; border: 1px solid #d6e2de; border-radius: 9px; background: #f9fbfa; }
.complement-options__panel input { margin-top: 3px; }
.options-card--revealing .complement-options__panel input:checked { animation: prefilled-option-check 220ms cubic-bezier(.2, .9, .3, 1); }
.complement-options__panel label > span { display: grid; min-width: 0; gap: 2px; }
.complement-options__panel strong { color: var(--brand-dark); font-size: .92rem; }
.complement-options__panel label:has(input:disabled) { opacity: .5; }
.complement-options__panel small { color: var(--muted); font-size: .9rem; line-height: 1.45; }
.complement-options__panel small b { color: var(--ink); font-weight: 800; }
.complement-panel-enter-active, .complement-panel-leave-active { transition: opacity 160ms ease, transform 160ms ease; }
.complement-panel-enter-from, .complement-panel-leave-to { opacity: 0; transform: translateY(-5px); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 620px) {
  .options-layout--columns { padding: 19px 14px; grid-template-columns: 1fr; }
  .options-layout--columns > .conjugation-example { padding: 15px; }
}
@media (min-width: 621px) and (max-width: 820px) {
  .options-layout--columns { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .options-layout--columns > .conjugation-example { grid-column: 1 / -1; }
}
@media (max-width: 520px) { .complement-options__panel { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) {
  .complement-panel-enter-active,
  .complement-panel-leave-active,
  .example-item-enter-active { transition: none; }
  .conjugation-example__spinner { animation-duration: 1.4s; }
  .options-card--revealing .complement-options__panel input:checked { animation: none; }
}
</style>

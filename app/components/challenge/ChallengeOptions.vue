<script setup lang="ts">
import type { ClassicComplementChoice } from '~~/shared/types/conjugation'
import type { ComplementPlacement, ExerciseKind, Verb } from '~/composables/useChallengeBuilder'
import { classicComplementChoiceConfig } from '~~/shared/utils/classic-complement-choice'

const props = defineProps<{
  questionCount: number
  exerciseKind: ExerciseKind
  inclusivePronouns: boolean
  includeComplements: boolean
  complementPlacement: ComplementPlacement
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
}>()

const emit = defineEmits<{
  updateQuestionCount: [value: number]
  updateExerciseKind: [value: ExerciseKind]
  updateInclusivePronouns: [value: boolean]
  updateIncludeComplements: [value: boolean]
  updateComplementPlacement: [value: ComplementPlacement]
}>()

const complementsOpen = ref(Boolean(props.gridLayout))
const selectedComplementVerbs = computed(() => (props.complementVerbs ?? []).filter(verb => Boolean(verb.complementExample)))
const beforeComplementVerb = computed(() => (
  selectedComplementVerbs.value.find(verb => Boolean(verb.complementExample?.before)) ?? null
))
const complementsAvailable = computed(() => (
  props.exerciseKind === 'conjugation' && selectedComplementVerbs.value.length > 0
))
const beforeComplementsAvailable = computed(() => Boolean(beforeComplementVerb.value))
const idPrefix = computed(() => props.idPrefix ?? 'challenge-options')
const optionsTitleId = computed(() => `${idPrefix.value}-title`)
const questionCountId = computed(() => `${idPrefix.value}-question-count`)
const questionCountHintId = computed(() => `${idPrefix.value}-question-count-hint`)
const exerciseKindName = computed(() => `${idPrefix.value}-exercise-kind`)
const complementChoiceName = computed(() => `${idPrefix.value}-complement-choice`)
const complementPanelId = computed(() => `${idPrefix.value}-complement-panel`)
const complementChoice = computed<ClassicComplementChoice>(() => (
  props.includeComplements ? props.complementPlacement : 'none'
))
const hasConjugationExample = computed(() => Boolean(
  (props.conjugationInstruction || props.conjugationQuestionContext || props.conjugationQuestion)
  && props.conjugationExample,
))
const exampleRevealStage = ref(0)
const exampleRevealTimers: ReturnType<typeof setTimeout>[] = []

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
      setTimeout(() => { exampleRevealStage.value = 3 }, 480),
    )
  },
  { immediate: true },
)

onBeforeUnmount(clearExampleRevealTimers)

function onQuestionCountChange(event: Event) {
  const rawValue = (event.target as HTMLInputElement).value
  if (rawValue === '') return
  const value = Number(rawValue)
  if (!Number.isFinite(value)) return
  emit('updateQuestionCount', Math.min(100, Math.max(1, Math.round(value))))
}

function onExerciseKindChange(event: Event) {
  emit('updateExerciseKind', (event.target as HTMLInputElement).value as ExerciseKind)
}

function onComplementChoiceChange(event: Event) {
  const choice = (event.target as HTMLInputElement).value as ClassicComplementChoice
  const config = classicComplementChoiceConfig(choice)
  emit('updateIncludeComplements', config.includeComplements)
  emit('updateComplementPlacement', config.complementPlacement)
}

watch(complementsAvailable, (available) => {
  if (!available) complementsOpen.value = false
  else if (props.gridLayout) complementsOpen.value = true
}, { immediate: true })

</script>

<template>
  <section class="builder-card options-card" :class="{ 'options-card--grid': gridLayout }" :aria-labelledby="optionsTitleId">
    <div class="builder-card__header">
      <div>
        <p class="builder-card__eyebrow">{{ eyebrow ?? 'Étape 3' }}</p>
        <h2 :id="optionsTitleId">Mes options</h2>
      </div>
    </div>

    <div class="options-fields" :class="{ 'options-fields--columns': gridLayout }">
      <div class="options-main-column">
        <label class="field-stack" :for="questionCountId">
          <span>Nombre de questions</span>
          <input
            :id="questionCountId"
            type="number"
            inputmode="numeric"
            min="1"
            max="100"
            step="1"
            :value="questionCount"
            :aria-describedby="questionCountHintId"
            @input="onQuestionCountChange"
          >
          <small :id="questionCountHintId" class="field-hint">Entre 1 et 100 questions.</small>
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
      <h3 v-if="gridLayout" class="complement-options__title">Compléments d’objets</h3>
      <button
        v-else
        class="complement-options__trigger"
        type="button"
        :disabled="!complementsAvailable"
        :aria-expanded="complementsOpen"
        :aria-controls="complementPanelId"
        @click="complementsOpen = !complementsOpen"
      >
        <span>Compléments d’objets <small>nouveau</small></span>
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
            <input :name="complementChoiceName" type="radio" value="none" :disabled="!complementsAvailable" :checked="complementChoice === 'none'" @change="onComplementChoiceChange">
            <span><strong>Sans complément</strong></span>
          </label>
          <label>
            <input :name="complementChoiceName" type="radio" value="after" :disabled="!complementsAvailable" :checked="complementChoice === 'after'" @change="onComplementChoiceChange">
            <span><strong>Après le verbe</strong></span>
          </label>
          <label>
            <input :name="complementChoiceName" type="radio" value="before" :disabled="!complementsAvailable || !beforeComplementsAvailable" :checked="complementChoice === 'before'" @change="onComplementChoiceChange">
            <span><strong>Avant le verbe</strong></span>
          </label>
          <label>
            <input :name="complementChoiceName" type="radio" value="mixed" :disabled="!complementsAvailable || !beforeComplementsAvailable" :checked="complementChoice === 'mixed'" @change="onComplementChoiceChange">
            <span><strong>Un mélange</strong></span>
          </label>
        </fieldset>
      </Transition>
      </div>
    </div>

    <div
      v-if="gridLayout && (conjugationExampleLoading || hasConjugationExample)"
      class="conjugation-example"
      aria-live="polite"
      aria-atomic="true"
    >
      <div class="conjugation-example__header">
        <span class="conjugation-example__preview-icon" aria-hidden="true">▶</span>
        <div class="conjugation-example__heading">
          <span>Exemple</span>
        </div>
      </div>

      <div class="conjugation-example__screen">
        <div class="conjugation-example__screen-header">
          <div>
            <span>Exercice classique</span>
            <strong>Question 1</strong>
          </div>
          <div class="conjugation-example__progress" aria-hidden="true">
            <i class="is-current" />
            <i />
            <i />
            <i />
          </div>
        </div>

        <div v-if="conjugationExampleLoading" class="conjugation-example__loading" role="status">
          <span class="conjugation-example__spinner" aria-hidden="true" />
          <span class="sr-only">Préparation de l’aperçu</span>
        </div>

        <div v-else class="conjugation-example__body">
          <Transition name="example-item">
            <div v-if="exampleRevealStage >= 1" class="conjugation-example__question">
              <p v-if="conjugationInstruction" class="conjugation-example__instruction">{{ conjugationInstruction }}</p>
              <p v-if="conjugationQuestionContext" class="conjugation-example__question-line">
                <span class="conjugation-example__context">{{ conjugationQuestionContext }}</span>
                <span v-if="conjugationQuestion" class="conjugation-example__question-separator" aria-hidden="true">—</span>
                <span v-if="conjugationQuestion" class="conjugation-example__prompt">{{ conjugationQuestion }}</span>
              </p>
              <p v-else-if="conjugationQuestion" class="conjugation-example__prompt">{{ conjugationQuestion }}</p>
            </div>
          </Transition>

          <Transition name="example-item">
            <div v-if="exampleRevealStage >= 2" class="conjugation-example__answer">
              <span>Ta réponse</span>
              <div>
                <span aria-hidden="true" />
                <button type="button" disabled>Vérifier</button>
              </div>
            </div>
          </Transition>

          <Transition name="example-item">
            <div v-if="exampleRevealStage >= 3" class="conjugation-example__correction">
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

  </section>
</template>

<style scoped>
.options-card--grid { padding-bottom: 0; }
.options-fields--columns { display: grid; padding: 24px; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; gap: 16px; }
.options-fields--columns > * { min-width: 0; margin: 0; padding: 18px; border: 1px solid #bfd2cc; border-radius: 15px; background: #fbfdfc; }
.options-main-column { display: grid; align-content: start; gap: 18px; }
.options-main-column > * { margin: 0; }
.options-main-column > .check-row { padding: 15px 4px; }
.options-main-column > .option-fieldset { padding: 14px 0 0; }
.field-hint { display: block; margin-top: 6px; color: var(--muted); font-size: .72rem; }
.conjugation-example { margin: 10px 24px 28px; padding: 20px; overflow: hidden; border: 0; border-radius: 20px; background: linear-gradient(145deg, #123f52, #17394b 62%, #203346); box-shadow: 0 18px 42px rgb(22 53 66 / 24%); color: white; }
.conjugation-example__header { display: grid; min-height: 62px; margin-bottom: 17px; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 13px; }
.conjugation-example__preview-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 50%; color: #133e50; background: #bfeaf0; box-shadow: 0 0 0 6px rgb(191 234 240 / 10%); font-size: .88rem; }
.conjugation-example__heading { display: grid; gap: 2px; }
.conjugation-example__heading > span { color: #c6edf2; font-size: 1.08rem; font-weight: 850; letter-spacing: .025em; text-transform: uppercase; }
.conjugation-example__heading > strong { color: white; font-size: 1.2rem; line-height: 1.2; }
.conjugation-example__screen { overflow: hidden; border: 1px solid rgb(255 255 255 / 30%); border-radius: 14px; background: white; box-shadow: 0 10px 26px rgb(4 25 34 / 24%); color: var(--brand-dark); }
.conjugation-example__screen-header { display: flex; min-height: 68px; padding: 13px 17px; align-items: center; justify-content: space-between; gap: 18px; border-bottom: 1px solid #d9e5e1; background: #f5faf8; }
.conjugation-example__screen-header > div:first-child { display: grid; gap: 1px; }
.conjugation-example__screen-header span,
.conjugation-example__answer > span,
.conjugation-example__correction > span { color: var(--muted); font-size: .7rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
.conjugation-example__screen-header strong { font-size: 1.08rem; }
.conjugation-example__progress { display: flex; align-items: center; gap: 5px; }
.conjugation-example__progress i { width: 24px; height: 5px; border-radius: 999px; background: #d6e2de; }
.conjugation-example__progress i.is-current { background: var(--brand); }
.conjugation-example__loading { display: grid; min-height: 280px; padding: 30px; place-content: center; place-items: center; gap: 14px; color: var(--muted); text-align: center; }
.conjugation-example__spinner { width: 38px; height: 38px; border: 4px solid #d5e4df; border-top-color: var(--brand); border-radius: 50%; animation: example-spinner 700ms linear infinite; }
.conjugation-example__body { display: grid; min-height: 280px; padding: 24px; align-content: start; gap: 18px; }
.conjugation-example__question { display: grid; gap: 10px; }
.conjugation-example__question p { margin: 0; }
.conjugation-example__instruction { color: var(--brand-dark); font-size: 1.08rem; font-weight: 850; }
.conjugation-example__question-line { display: flex; min-height: 48px; padding: 10px 13px; align-items: center; flex-wrap: wrap; gap: 7px 10px; border-radius: 9px; background: #f2f7f5; }
.conjugation-example__context { color: var(--muted); font-size: .86rem; font-weight: 700; }
.conjugation-example__question-separator { color: #9bb0aa; font-weight: 700; }
.conjugation-example__prompt { color: var(--ink); font-size: 1.25rem; font-weight: 800; letter-spacing: .025em; line-height: 1.45; }
.conjugation-example__question-line .conjugation-example__prompt { font-size: 1.05rem; }
.conjugation-example__answer { display: grid; gap: 7px; }
.conjugation-example__answer > div { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
.conjugation-example__answer > div > span { min-height: 46px; border: 1px solid #bfcfca; border-radius: 11px; background: white; box-shadow: inset 0 0 0 1px rgb(52 95 88 / 3%); }
.conjugation-example__answer button { padding: 10px 16px; border: 0; border-radius: 10px; color: white; background: var(--brand); opacity: .55; }
.conjugation-example__correction { display: grid; padding: 13px 15px; gap: 4px; border: 1px solid #acd1bb; border-radius: 11px; background: var(--success-pale); }
.conjugation-example__correction p { margin: 0; color: var(--success); font-size: 1.05rem; font-weight: 400; line-height: 1.4; white-space: pre-wrap; }
.conjugation-example__correction p > span { color: inherit; font: inherit; font-weight: 400; letter-spacing: normal; text-transform: none; }
.conjugation-example__correction strong { color: var(--success); font-size: inherit; font-weight: 850; letter-spacing: .025em; }
.example-item-enter-active { transition: opacity 230ms ease, transform 230ms ease; }
.example-item-enter-from { opacity: 0; transform: translateY(10px); }
@keyframes example-spinner { to { transform: rotate(360deg); } }
.complement-options { margin-bottom: 18px; }
.complement-options__title { margin: 0 0 12px; color: var(--brand-dark); font-size: 1rem; font-weight: 800; }
.complement-options__trigger { display: flex; width: 100%; min-height: 48px; padding: 10px 13px; align-items: center; justify-content: space-between; gap: 12px; color: var(--brand-dark); background: var(--brand-pale); border: 1px solid #a9c9bf; border-radius: 11px; font-weight: 850; text-align: left; }
.complement-options__trigger:disabled { cursor: not-allowed; filter: grayscale(.65); opacity: .55; }
.complement-options--disabled { background: #f3f5f4; }
.complement-options--hidden { visibility: hidden; }
.complement-options__unavailable { margin: 10px 3px 0; color: var(--muted); font-size: .82rem; line-height: 1.35; }
.complement-options__trigger > span:first-child { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.complement-options__trigger small { padding: 3px 7px; color: white; background: var(--brand); border-radius: 999px; font-size: .62rem; font-weight: 900; letter-spacing: .06em; line-height: 1; text-transform: uppercase; }
.complement-options__trigger > span:last-child { font-size: 1.25rem; font-weight: 500; }
.complement-options__panel { display: grid; margin: 8px 0 0; padding: 8px; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; border: 1px solid var(--line); border-radius: 12px; }
.options-fields--columns .complement-options__panel { grid-template-columns: 1fr; }
.complement-options__panel label { display: flex; min-width: 0; padding: 9px; align-items: flex-start; gap: 8px; border: 1px solid #d6e2de; border-radius: 9px; background: #f9fbfa; }
.complement-options__panel input { margin-top: 3px; }
.complement-options__panel label > span { display: grid; min-width: 0; gap: 2px; }
.complement-options__panel strong { color: var(--brand-dark); font-size: .92rem; }
.complement-options__panel label:has(input:disabled) { opacity: .5; }
.complement-options__panel small { color: var(--muted); font-size: .9rem; line-height: 1.45; }
.complement-options__panel small b { color: var(--ink); font-weight: 800; }
.complement-panel-enter-active, .complement-panel-leave-active { transition: opacity 160ms ease, transform 160ms ease; }
.complement-panel-enter-from, .complement-panel-leave-to { opacity: 0; transform: translateY(-5px); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 620px) {
  .options-fields--columns { padding: 19px 14px; grid-template-columns: 1fr; }
  .conjugation-example { margin: 8px 14px 19px; padding: 15px; }
  .conjugation-example__heading > strong { font-size: 1.05rem; }
  .conjugation-example__screen-header { align-items: flex-start; flex-direction: column; gap: 10px; }
  .conjugation-example__body { padding: 18px 14px; }
  .conjugation-example__answer > div { grid-template-columns: 1fr; }
  .conjugation-example__answer button { justify-self: end; }
}
@media (max-width: 520px) { .complement-options__panel { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) {
  .complement-panel-enter-active,
  .complement-panel-leave-active,
  .example-item-enter-active { transition: none; }
  .conjugation-example__spinner { animation-duration: 1.4s; }
}
</style>

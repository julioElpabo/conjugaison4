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

      <div class="complement-options" :class="{ 'complement-options--disabled': !complementsAvailable }">
      <button
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
        <fieldset v-if="complementsOpen" :id="complementPanelId" class="complement-options__panel">
          <legend class="sr-only">Présentation des compléments d’objets</legend>
          <label>
            <input :name="complementChoiceName" type="radio" value="none" :checked="complementChoice === 'none'" @change="onComplementChoiceChange">
            <span><strong>Sans complément</strong></span>
          </label>
          <label>
            <input :name="complementChoiceName" type="radio" value="after" :checked="complementChoice === 'after'" @change="onComplementChoiceChange">
            <span><strong>Après le verbe</strong></span>
          </label>
          <label>
            <input :name="complementChoiceName" type="radio" value="before" :disabled="!beforeComplementsAvailable" :checked="complementChoice === 'before'" @change="onComplementChoiceChange">
            <span><strong>Avant le verbe</strong></span>
          </label>
          <label>
            <input :name="complementChoiceName" type="radio" value="mixed" :disabled="!beforeComplementsAvailable" :checked="complementChoice === 'mixed'" @change="onComplementChoiceChange">
            <span><strong>Un mélange</strong></span>
          </label>
        </fieldset>
      </Transition>
      </div>
    </div>

    <div v-if="gridLayout" class="conjugation-example" aria-live="polite">
      <p>Exemple de conjugaison</p>
      <div>
        <span>Question</span>
        <template v-if="conjugationExampleLoading"><strong>Préparation…</strong></template>
        <template v-else-if="conjugationInstruction || conjugationQuestionContext || conjugationQuestion">
          <strong v-if="conjugationInstruction" class="conjugation-example__instruction">{{ conjugationInstruction }}</strong>
          <strong v-if="conjugationQuestionContext" class="conjugation-example__context">{{ conjugationQuestionContext }}</strong>
          <strong v-if="conjugationQuestion">{{ conjugationQuestion }}</strong>
        </template>
        <strong v-else>Exemple indisponible</strong>
      </div>
      <div>
        <span>Réponse attendue</span>
        <strong>{{ conjugationExampleLoading ? 'Préparation…' : (conjugationExample || 'Exemple indisponible') }}</strong>
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
.conjugation-example { display: grid; margin: 0 24px 24px; padding: 18px; grid-template-columns: 1fr; gap: 12px; border: 1px solid #bfd2cc; border-radius: 15px; background: var(--brand-pale); color: var(--brand-dark); }
.conjugation-example p { grid-column: 1 / -1; margin: 0 0 2px; font-weight: 900; }
.conjugation-example > div { display: grid; padding: 13px; gap: 5px; border-radius: 10px; background: rgb(255 255 255 / 70%); }
.conjugation-example span { font-size: .72rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
.conjugation-example strong { font-size: 1.02rem; line-height: 1.45; }
.conjugation-example__instruction { color: var(--brand-dark); font-size: 1.08rem; }
.conjugation-example__context { padding-bottom: 7px; border-bottom: 1px solid #c9dcd6; color: var(--muted); font-weight: 700; }
.complement-options { margin-bottom: 18px; }
.complement-options__trigger { display: flex; width: 100%; min-height: 48px; padding: 10px 13px; align-items: center; justify-content: space-between; gap: 12px; color: var(--brand-dark); background: var(--brand-pale); border: 1px solid #a9c9bf; border-radius: 11px; font-weight: 850; text-align: left; }
.complement-options__trigger:disabled { cursor: not-allowed; filter: grayscale(.65); opacity: .55; }
.complement-options--disabled { background: #f3f5f4; }
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
  .conjugation-example { margin: 0 14px 19px; }
}
@media (max-width: 520px) { .complement-options__panel { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .complement-panel-enter-active, .complement-panel-leave-active { transition: none; } }
</style>

<script setup lang="ts">
import type {
  ExerciseKind
} from '~/composables/useChallengeBuilder'

const props = defineProps<{
  questionCount: number
  exerciseKind: ExerciseKind
  inclusivePronouns: boolean
}>()

const emit = defineEmits<{
  updateQuestionCount: [value: number]
  updateExerciseKind: [value: ExerciseKind]
  updateInclusivePronouns: [value: boolean]
}>()

const quantities = [5, 10, 20, 30, 40, 50]

function onQuestionCountChange(event: Event) {
  emit('updateQuestionCount', Number((event.target as HTMLSelectElement).value))
}

function onExerciseKindChange(event: Event) {
  emit('updateExerciseKind', (event.target as HTMLInputElement).value as ExerciseKind)
}

</script>

<template>
  <section class="builder-card options-card" aria-labelledby="options-title">
    <div class="builder-card__header">
      <div>
        <p class="builder-card__eyebrow">Étape 3</p>
        <h2 id="options-title">Mes options</h2>
      </div>
    </div>

    <label class="field-stack" for="question-count">
      <span>Nombre de questions</span>
      <select id="question-count" :value="questionCount" @change="onQuestionCountChange">
        <option v-for="quantity in quantities" :key="quantity" :value="quantity">
          {{ quantity }} questions
        </option>
      </select>
    </label>

    <fieldset class="option-fieldset">
      <legend>Type d’exercice</legend>
      <div class="segmented-control">
        <label>
          <input
            type="radio"
            name="exercise-kind"
            value="conjugation"
            :checked="exerciseKind === 'conjugation'"
            @change="onExerciseKindChange"
          >
          <span>Conjuguer</span>
        </label>
        <label>
          <input
            type="radio"
            name="exercise-kind"
            value="tense-identification"
            :checked="exerciseKind === 'tense-identification'"
            @change="onExerciseKindChange"
          >
          <span>Trouver le mode et le temps</span>
        </label>
      </div>
    </fieldset>

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

  </section>
</template>

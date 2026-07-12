<script setup lang="ts">
import type {
  ExerciseKind,
  PrintOptions
} from '~/composables/useChallengeBuilder'

const props = defineProps<{
  questionCount: number
  exerciseKind: ExerciseKind
  inclusivePronouns: boolean
  printOptions: PrintOptions
}>()

const emit = defineEmits<{
  updateQuestionCount: [value: number]
  updateExerciseKind: [value: ExerciseKind]
  updateInclusivePronouns: [value: boolean]
  updatePrintOptions: [value: PrintOptions]
}>()

const quantities = [5, 10, 20, 30, 40, 50]

function setPrintOption<K extends keyof PrintOptions>(key: K, value: PrintOptions[K]) {
  emit('updatePrintOptions', {
    ...props.printOptions,
    [key]: value
  })
}

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

    <details class="print-options">
      <summary>Options de la fiche à imprimer</summary>

      <label class="field-stack" for="print-title">
        <span>Titre de la fiche</span>
        <input
          id="print-title"
          type="text"
          :value="printOptions.title"
          @input="setPrintOption('title', ($event.target as HTMLInputElement).value)"
        >
      </label>

      <div class="check-grid">
        <label class="check-row check-row--compact">
          <input type="checkbox" :checked="printOptions.showGrade" @change="setPrintOption('showGrade', ($event.target as HTMLInputElement).checked)">
          <span>Espace pour la note</span>
        </label>
        <label class="check-row check-row--compact">
          <input type="checkbox" :checked="printOptions.showVerbs" @change="setPrintOption('showVerbs', ($event.target as HTMLInputElement).checked)">
          <span>Liste des verbes</span>
        </label>
        <label class="check-row check-row--compact">
          <input type="checkbox" :checked="printOptions.showTenses" @change="setPrintOption('showTenses', ($event.target as HTMLInputElement).checked)">
          <span>Liste des temps</span>
        </label>
        <label class="check-row check-row--compact">
          <input type="checkbox" :checked="printOptions.showFirstName" @change="setPrintOption('showFirstName', ($event.target as HTMLInputElement).checked)">
          <span>Prénom</span>
        </label>
        <label class="check-row check-row--compact">
          <input type="checkbox" :checked="printOptions.showLastName" @change="setPrintOption('showLastName', ($event.target as HTMLInputElement).checked)">
          <span>Nom</span>
        </label>
        <label class="check-row check-row--compact">
          <input type="checkbox" :checked="printOptions.showDate" @change="setPrintOption('showDate', ($event.target as HTMLInputElement).checked)">
          <span>Date</span>
        </label>
        <label class="check-row check-row--compact">
          <input type="checkbox" :checked="printOptions.showRandomNumber" @change="setPrintOption('showRandomNumber', ($event.target as HTMLInputElement).checked)">
          <span>Numéro questionnaire/corrigé</span>
        </label>
      </div>
    </details>
  </section>
</template>

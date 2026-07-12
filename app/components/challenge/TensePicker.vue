<script setup lang="ts">
import type {
  ConjugationMode,
  PastSimplePronouns,
  Tense
} from '~/composables/useChallengeBuilder'

const props = defineProps<{
  modes: ConjugationMode[]
  tenses: Tense[]
  selectedIds: number[]
  pastSimplePronouns: PastSimplePronouns
}>()

const emit = defineEmits<{
  toggle: [id: number]
  selectAll: []
  clear: []
  updatePastSimplePronouns: [value: PastSimplePronouns]
}>()

const selectedSet = computed(() => new Set(props.selectedIds))
const groups = computed(() => props.modes
  .map(mode => ({
    mode,
    tenses: props.tenses.filter(tense => tense.modeId === mode.id)
  }))
  .filter(group => group.tenses.length > 0))

const showsPastSimpleOption = computed(() => (
  selectedSet.value.has(4) || selectedSet.value.has(8)
))

function onPastSimplePronounsChange(event: Event) {
  const value = (event.target as HTMLInputElement).value as PastSimplePronouns
  emit('updatePastSimplePronouns', value)
}
</script>

<template>
  <section class="builder-card tense-picker" aria-labelledby="tenses-title">
    <div class="builder-card__header">
      <div>
        <p class="builder-card__eyebrow">Étape 2</p>
        <h2 id="tenses-title">Mes temps</h2>
      </div>
      <span class="count-badge" :aria-label="`${selectedIds.length} temps sélectionnés`">
        {{ selectedIds.length }}
      </span>
    </div>

    <div class="selection-toolbar">
      <button class="text-button" type="button" @click="emit('selectAll')">
        Tout cocher
      </button>
      <button class="text-button text-button--danger" type="button" @click="emit('clear')">
        Tout décocher
      </button>
    </div>

    <div class="tense-groups">
      <fieldset v-for="group in groups" :key="group.mode.id" class="tense-group">
        <legend>{{ group.mode.name }}</legend>
        <div class="tense-group__items">
          <label v-for="tense in group.tenses" :key="tense.id" class="switch-row">
            <input
              type="checkbox"
              :checked="selectedSet.has(tense.id)"
              @change="emit('toggle', tense.id)"
            >
            <span class="switch-row__control" aria-hidden="true" />
            <span>
              {{ tense.name }}
              <small v-if="tense.isCompound">temps composé</small>
            </span>
          </label>
        </div>
      </fieldset>
    </div>

    <fieldset v-if="showsPastSimpleOption" class="inline-choice">
      <legend>Au passé simple et au passé antérieur</legend>
      <label>
        <input
          type="radio"
          name="past-simple-pronouns"
          value="all"
          :checked="pastSimplePronouns === 'all'"
          @change="onPastSimplePronounsChange"
        >
        Tous les pronoms
      </label>
      <label>
        <input
          type="radio"
          name="past-simple-pronouns"
          value="third-person-only"
          :checked="pastSimplePronouns === 'third-person-only'"
          @change="onPastSimplePronounsChange"
        >
        Seulement il / elle et ils / elles
      </label>
    </fieldset>
  </section>
</template>

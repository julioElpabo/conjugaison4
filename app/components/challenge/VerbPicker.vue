<script setup lang="ts">
const { ui } = useLanguagePreferences()
import type { Verb } from '~/composables/useChallengeBuilder'
import { matchingVerbs, normalizeVerbSearch } from '~~/shared/utils/verb-search'

const props = defineProps<{
  verbs: Verb[]
  selectedIds: number[]
}>()

const emit = defineEmits<{
  add: [id: number]
  remove: [id: number]
  clear: []
}>()

const query = ref('')
const input = useTemplateRef<HTMLInputElement>('verb-input')

const selectedIdSet = computed(() => new Set(props.selectedIds))
const selectedVerbs = computed(() => {
  const byId = new Map(props.verbs.map(verb => [verb.id, verb]))
  return props.selectedIds
    .map(id => byId.get(id))
    .filter((verb): verb is Verb => Boolean(verb))
})
const selectedChipScale = computed(() => {
  const count = selectedVerbs.value.length
  if (count <= 3) return 1.35
  return Math.max(1, 1.35 - (count - 3) / 20)
})
const selectedChipStyle = computed<Record<string, string>>(() => {
  const scale = selectedChipScale.value
  const mobileScale = 1 + (scale - 1) * 0.55
  return {
    '--selected-chip-gap': `${7 * scale}px`,
    '--selected-chip-inner-gap': `${6 * scale}px`,
    '--selected-chip-padding-block': `${7 * scale}px`,
    '--selected-chip-padding-end': `${8 * scale}px`,
    '--selected-chip-padding-start': `${11 * scale}px`,
    '--selected-chip-font-size': `${0.87 * scale}rem`,
    '--selected-chip-button-size': `${21 * scale}px`,
    '--selected-chip-button-font-size': `${scale}rem`,
    '--selected-chip-mobile-gap': `${7 * mobileScale}px`,
    '--selected-chip-mobile-inner-gap': `${6 * mobileScale}px`,
    '--selected-chip-mobile-padding-block': `${7 * mobileScale}px`,
    '--selected-chip-mobile-padding-end': `${8 * mobileScale}px`,
    '--selected-chip-mobile-padding-start': `${11 * mobileScale}px`,
    '--selected-chip-mobile-font-size': `${0.87 * mobileScale}rem`,
    '--selected-chip-mobile-button-size': `${21 * mobileScale}px`,
    '--selected-chip-mobile-button-font-size': `${mobileScale}rem`,
  }
})
const suggestions = computed(() => {
  const needle = normalizeVerbSearch(query.value)
  if (!needle) {
    return []
  }

  return matchingVerbs(
    props.verbs.filter(verb => !selectedIdSet.value.has(verb.id)),
    query.value,
  )
    .slice(0, 8)
})

function addVerb(verb: Verb) {
  emit('add', verb.id)
  query.value = ''
  nextTick(() => input.value?.focus())
}

function addFirstSuggestion() {
  const verb = suggestions.value[0]
  if (verb) {
    addVerb(verb)
  }
}
</script>

<template>
  <section class="builder-card verb-picker" aria-labelledby="verbs-title">
    <div class="builder-card__header">
      <div>
        <p class="builder-card__eyebrow">{{ ui('Étape 1') }}</p>
        <h2 id="verbs-title">{{ ui('Mes verbes') }}</h2>
      </div>
      <span class="count-badge" :aria-label="`${selectedIds.length} verbes sélectionnés`">
        {{ selectedIds.length }}
      </span>
    </div>

    <div class="verb-search">
      <label for="verb-search-input">{{ ui('Ajouter un verbe') }}</label>
      <div class="verb-search__control">
        <input
          id="verb-search-input"
          ref="verb-input"
          v-model="query"
          type="search"
          autocomplete="off"
          :placeholder="ui('Ex. aller, être, finir…')"
          :aria-expanded="suggestions.length > 0"
          aria-controls="verb-suggestions"
          @keydown.enter.prevent="addFirstSuggestion"
        >
        <button
          class="icon-button icon-button--add"
          type="button"
          :disabled="suggestions.length === 0"
          :aria-label="ui('Ajouter le premier verbe proposé')"
          @click="addFirstSuggestion"
        >
          +
        </button>
      </div>

      <ul
        v-if="suggestions.length > 0"
        id="verb-suggestions"
        class="verb-suggestions"
        role="listbox"
        :aria-label="ui('Verbes proposés')"
      >
        <li v-for="verb in suggestions" :key="verb.id" role="option">
          <button type="button" @click="addVerb(verb)">
            <strong>{{ verb.infinitif }}</strong>
            <span v-if="verb.isPronominalForm && verb.baseVerbId">{{ ui('forme pronominale générée') }}</span>
            <span v-else-if="verb.auxiliaire">{{ ui('auxiliaire') }} {{ verb.auxiliaire }}</span>
          </button>
        </li>
      </ul>

      <p v-else-if="query" class="field-hint" aria-live="polite">
        Aucun nouveau verbe ne commence par « {{ query }} ».
      </p>
    </div>

    <div class="selection-toolbar">
      <p>{{ selectedVerbs.length ? ui('Verbes retenus') : ui('Aucun verbe sélectionné') }}</p>
      <button
        v-if="selectedVerbs.length"
        class="text-button text-button--danger"
        type="button"
        @click="emit('clear')"
      > {{ ui('Tout supprimer') }} </button>
    </div>

    <TransitionGroup
      v-if="selectedVerbs.length"
      tag="ul"
      name="verb-chip"
      class="selected-chips selected-chips--adaptive"
      :style="selectedChipStyle"
      :aria-label="ui('Verbes sélectionnés')"
    >
      <li v-for="verb in selectedVerbs" :key="verb.id">
        <span>{{ verb.infinitif }}</span>
        <button type="button" :aria-label="ui('Retirer le verbe {verb}', { verb: verb.infinitif })" @click="emit('remove', verb.id)">×</button>
      </li>
    </TransitionGroup>
  </section>
</template>

<style scoped>
.verb-chip-enter-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.verb-chip-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(.88);
}

@media (prefers-reduced-motion: reduce) {
  .verb-chip-enter-active {
    transition: none;
  }
}
</style>

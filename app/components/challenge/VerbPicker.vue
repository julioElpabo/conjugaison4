<script setup lang="ts">
import type { Verb } from '~/composables/useChallengeBuilder'

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

const normalizeForSearch = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('fr')
  .trim()

const selectedIdSet = computed(() => new Set(props.selectedIds))
const selectedVerbs = computed(() => {
  const byId = new Map(props.verbs.map(verb => [verb.id, verb]))
  return props.selectedIds
    .map(id => byId.get(id))
    .filter((verb): verb is Verb => Boolean(verb))
})

const suggestions = computed(() => {
  const needle = normalizeForSearch(query.value)
  if (!needle) {
    return []
  }

  return props.verbs
    .filter(verb => !selectedIdSet.value.has(verb.id))
    .filter(verb => normalizeForSearch(verb.infinitif).startsWith(needle))
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
        <p class="builder-card__eyebrow">Étape 1</p>
        <h2 id="verbs-title">Mes verbes</h2>
      </div>
      <span class="count-badge" :aria-label="`${selectedIds.length} verbes sélectionnés`">
        {{ selectedIds.length }}
      </span>
    </div>

    <div class="verb-search">
      <label for="verb-search-input">Ajouter un verbe</label>
      <div class="verb-search__control">
        <input
          id="verb-search-input"
          ref="verb-input"
          v-model="query"
          type="search"
          autocomplete="off"
          placeholder="Ex. aller, être, finir…"
          :aria-expanded="suggestions.length > 0"
          aria-controls="verb-suggestions"
          @keydown.enter.prevent="addFirstSuggestion"
        >
        <button
          class="icon-button icon-button--add"
          type="button"
          :disabled="suggestions.length === 0"
          aria-label="Ajouter le premier verbe proposé"
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
        aria-label="Verbes proposés"
      >
        <li v-for="verb in suggestions" :key="verb.id" role="option">
          <button type="button" @click="addVerb(verb)">
            <strong>{{ verb.infinitif }}</strong>
            <span v-if="verb.auxiliaire">auxiliaire {{ verb.auxiliaire }}</span>
          </button>
        </li>
      </ul>

      <p v-else-if="query" class="field-hint" aria-live="polite">
        Aucun nouveau verbe ne commence par « {{ query }} ».
      </p>
    </div>

    <div class="selection-toolbar">
      <p>{{ selectedVerbs.length ? 'Verbes retenus' : 'Aucun verbe sélectionné' }}</p>
      <button
        v-if="selectedVerbs.length"
        class="text-button text-button--danger"
        type="button"
        @click="emit('clear')"
      >
        Tout supprimer
      </button>
    </div>

    <ul v-if="selectedVerbs.length" class="selected-chips" aria-label="Verbes sélectionnés">
      <li v-for="verb in selectedVerbs" :key="verb.id">
        <span>{{ verb.infinitif }}</span>
        <button
          type="button"
          :aria-label="`Retirer le verbe ${verb.infinitif}`"
          @click="emit('remove', verb.id)"
        >
          ×
        </button>
      </li>
    </ul>
  </section>
</template>

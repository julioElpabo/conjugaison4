<script setup lang="ts">
import { matchingVerbs, normalizeVerbSearch } from '~~/shared/utils/verb-search'

interface CatalogueVerb {
  id: number
  infinitif: string
  participePresent: string
  participePasse: string
  auxiliaire: string
}

const props = defineProps<{
  verbs: CatalogueVerb[]
  selectedId: number | null
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [id: number]
  create: []
}>()

const query = ref('')
const searchOpen = ref(false)
const activeIndex = ref(-1)

const filteredVerbs = computed(() => {
  return matchingVerbs(props.verbs, query.value)
})

const suggestions = computed(() => normalizeVerbSearch(query.value) ? filteredVerbs.value.slice(0, 10) : [])

function openSearch() {
  searchOpen.value = suggestions.value.length > 0
}

function chooseVerb(id: number) {
  const verb = props.verbs.find(item => item.id === id)
  if (verb) query.value = verb.infinitif
  searchOpen.value = false
  activeIndex.value = -1
  emit('select', id)
}

function selectCatalogueVerb(id: number) {
  searchOpen.value = false
  activeIndex.value = -1
  emit('select', id)
}

function clearSearch() {
  query.value = ''
  searchOpen.value = false
  activeIndex.value = -1
}

function onSearchInput() {
  activeIndex.value = suggestions.value.length ? 0 : -1
  openSearch()
}

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    searchOpen.value = false
    activeIndex.value = -1
    return
  }
  if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return

  if (!searchOpen.value) openSearch()
  if (!suggestions.value.length) return

  if (event.key === 'Enter') {
    event.preventDefault()
    const suggestion = suggestions.value[Math.max(0, activeIndex.value)]
    if (suggestion) chooseVerb(suggestion.id)
    return
  }

  event.preventDefault()
  const direction = event.key === 'ArrowDown' ? 1 : -1
  activeIndex.value = (activeIndex.value + direction + suggestions.value.length) % suggestions.value.length
}

function closeSearchAfterInteraction() {
  window.setTimeout(() => { searchOpen.value = false }, 120)
}

watch(suggestions, (items) => {
  if (!items.length) activeIndex.value = -1
  else if (activeIndex.value >= items.length) activeIndex.value = 0
})
</script>

<template>
  <aside class="verb-catalogue" aria-labelledby="verb-catalogue-title">
    <div class="verb-catalogue__heading">
      <div>
        <h2 id="verb-catalogue-title">Catalogue</h2>
        <p>{{ verbs.length }} verbe{{ verbs.length > 1 ? 's' : '' }}</p>
      </div>
      <button class="admin-button admin-button--primary admin-button--small" type="button" @click="emit('create')">
        <span aria-hidden="true">＋</span>
        Ajouter
      </button>
    </div>

    <div class="admin-field verb-catalogue__search">
      <label for="admin-verb-search">Trouver un verbe</label>
      <div class="verb-catalogue__combobox">
        <input
          id="admin-verb-search"
          v-model="query"
          type="search"
          role="combobox"
          autocomplete="off"
          spellcheck="false"
          placeholder="Commencez à écrire, ex. voir"
          aria-autocomplete="list"
          aria-controls="admin-verb-suggestions"
          :aria-expanded="searchOpen"
          :aria-activedescendant="searchOpen && activeIndex >= 0 ? `admin-verb-option-${suggestions[activeIndex]?.id}` : undefined"
          @input="onSearchInput"
          @focus="openSearch"
          @blur="closeSearchAfterInteraction"
          @keydown="onSearchKeydown"
        >
        <button v-if="query" type="button" aria-label="Effacer la recherche" @click="clearSearch">×</button>

        <ul
          v-if="searchOpen"
          id="admin-verb-suggestions"
          class="verb-catalogue__suggestions"
          role="listbox"
          aria-label="Suggestions de verbes"
        >
          <li
            v-for="(verb, index) in suggestions"
            :id="`admin-verb-option-${verb.id}`"
            :key="verb.id"
            role="option"
            :aria-selected="index === activeIndex"
          >
            <button
              type="button"
              :class="{ 'is-active': index === activeIndex }"
              @mousedown.prevent
              @mouseenter="activeIndex = index"
              @click="chooseVerb(verb.id)"
            >
              <strong>{{ verb.infinitif }}</strong>
              <span>auxiliaire {{ verb.auxiliaire }}</span>
            </button>
          </li>
        </ul>
      </div>
      <small v-if="query" class="verb-catalogue__result-count" aria-live="polite">
        {{ filteredVerbs.length }} résultat{{ filteredVerbs.length > 1 ? 's' : '' }}
      </small>
    </div>

    <p v-if="loading" class="admin-muted" role="status">Chargement du catalogue…</p>

    <ul v-else-if="filteredVerbs.length" class="verb-catalogue__list">
      <li v-for="verb in filteredVerbs" :key="verb.id">
        <button
          type="button"
          :class="{ 'is-selected': verb.id === selectedId }"
          :aria-current="verb.id === selectedId ? 'true' : undefined"
          @click="selectCatalogueVerb(verb.id)"
        >
          <span>{{ verb.infinitif }}</span>
          <small>{{ verb.auxiliaire || 'sans auxiliaire' }}</small>
        </button>
      </li>
    </ul>

    <p v-else class="verb-catalogue__empty admin-muted">
      Aucun verbe ne correspond à « {{ query }} ».
    </p>
  </aside>
</template>

<style scoped>
.verb-catalogue {
  min-width: 0;
  padding-right: 20px;
  border-right: 1px solid var(--admin-border);
}

.verb-catalogue__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.verb-catalogue__heading h2,
.verb-catalogue__heading p {
  margin: 0;
}

.verb-catalogue__heading h2 {
  color: var(--admin-navy);
  font-size: 1.25rem;
}

.verb-catalogue__heading p {
  margin-top: 3px;
  color: var(--admin-muted);
  font-size: .78rem;
}

.verb-catalogue__search {
  position: relative;
  margin: 20px 0 12px;
}

.verb-catalogue__search > label {
  color: var(--admin-navy);
  font-size: .8rem;
  font-weight: 800;
}

.verb-catalogue__combobox {
  position: relative;
}

.verb-catalogue__combobox > input {
  padding-right: 36px;
}

.verb-catalogue__combobox > button {
  position: absolute;
  z-index: 3;
  top: 50%;
  right: 7px;
  width: 27px;
  height: 27px;
  padding: 0;
  color: var(--admin-muted);
  background: transparent;
  border: 0;
  border-radius: 6px;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1.25rem;
}

.verb-catalogue__combobox > button:hover {
  color: var(--admin-navy);
  background: #e9f1f5;
}

.verb-catalogue__suggestions {
  position: absolute;
  z-index: 20;
  top: calc(100% + 5px);
  right: 0;
  left: 0;
  max-height: 330px;
  margin: 0;
  padding: 5px;
  overflow-y: auto;
  background: white;
  border: 1px solid #a9bfcb;
  border-radius: 9px;
  box-shadow: 0 12px 30px rgb(25 55 72 / 18%);
  list-style: none;
}

.verb-catalogue__suggestions button {
  display: flex;
  width: 100%;
  padding: 8px 9px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--admin-navy);
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.verb-catalogue__suggestions button.is-active,
.verb-catalogue__suggestions button:hover {
  background: var(--admin-cyan);
}

.verb-catalogue__suggestions span {
  color: var(--admin-muted);
  font-size: .7rem;
  white-space: nowrap;
}

.verb-catalogue__result-count {
  color: var(--admin-muted);
  font-size: .7rem;
}

.verb-catalogue__list {
  display: grid;
  max-height: 690px;
  margin: 0;
  padding: 0 5px 0 0;
  gap: 4px;
  overflow-y: auto;
  list-style: none;
  scrollbar-color: #a9c4d1 transparent;
}

.verb-catalogue__list button {
  display: flex;
  width: 100%;
  min-height: 43px;
  padding: 8px 10px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--admin-navy);
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
}

.verb-catalogue__list button:hover {
  background: #f2f8fa;
}

.verb-catalogue__list button:focus-visible {
  outline: 3px solid rgb(23 107 135 / 22%);
}

.verb-catalogue__list button.is-selected {
  color: var(--admin-blue-dark);
  background: var(--admin-cyan);
  border-color: #9ed3e1;
  font-weight: 850;
}

.verb-catalogue__list small {
  color: var(--admin-muted);
  font-size: .7rem;
  font-weight: 500;
}

.verb-catalogue__empty {
  padding: 16px 4px;
}

@media (max-width: 840px) {
  .verb-catalogue {
    padding: 0 0 20px;
    border-right: 0;
    border-bottom: 1px solid var(--admin-border);
  }

  .verb-catalogue__list {
    grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
    max-height: 265px;
  }
}
</style>

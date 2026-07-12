<script setup lang="ts">
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

const filteredVerbs = computed(() => {
  const needle = query.value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('fr')

  if (!needle) {
    return props.verbs
  }

  return props.verbs.filter((verb) => {
    const infinitive = verb.infinitif
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('fr')
    return infinitive.includes(needle)
  })
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

    <label class="admin-field verb-catalogue__search">
      <span>Rechercher un verbe</span>
      <input v-model="query" type="search" autocomplete="off" placeholder="Ex. finir">
    </label>

    <p v-if="loading" class="admin-muted" role="status">Chargement du catalogue…</p>

    <ul v-else-if="filteredVerbs.length" class="verb-catalogue__list">
      <li v-for="verb in filteredVerbs" :key="verb.id">
        <button
          type="button"
          :class="{ 'is-selected': verb.id === selectedId }"
          :aria-current="verb.id === selectedId ? 'true' : undefined"
          @click="emit('select', verb.id)"
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
  margin: 20px 0 12px;
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

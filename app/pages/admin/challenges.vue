<script setup lang="ts">
import type { ChallengePreset, ComplementOption, ConjugationMode, ConjugationTense, Verb } from '~~/shared/types/conjugation'
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

interface PresetCategory {
  id: number
  slug: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
}

interface AdminPreset extends ChallengePreset {
  databaseId: number
  categoryId: number
  sortOrder: number
  isActive: boolean
  verbSelectionMode: 'criteria' | 'explicit'
}

interface AdminResponse {
  categories: PresetCategory[]
  presets: AdminPreset[]
  verbs: Verb[]
  modes: ConjugationMode[]
  tenses: ConjugationTense[]
}

const COMPLEMENT_OPTIONS: Array<{ value: ComplementOption, label: string }> = [
  { value: 'cod-after', label: 'COD après le verbe' },
  { value: 'cod-before', label: 'COD avant le verbe' },
  { value: 'coi-after', label: 'COI après le verbe' },
  { value: 'coi-before', label: 'COI avant le verbe' },
]

const { user, handleUnauthorized } = useAdminAuth()
const tab = ref<'presets' | 'categories'>('presets')
const categories = ref<PresetCategory[]>([])
const presets = ref<AdminPreset[]>([])
const verbs = ref<Verb[]>([])
const modes = ref<ConjugationMode[]>([])
const tenses = ref<ConjugationTense[]>([])
const presetDraft = ref<AdminPreset | null>(null)
const categoryDraft = ref<PresetCategory | null>(null)
const openPresetCategoryId = ref<number | null>(null)
const draggedPresetId = ref<number | null>(null)
const dragOverPresetId = ref<number | null>(null)
const draggedCategoryId = ref<number | null>(null)
const dragOverCategoryId = ref<number | null>(null)
const verbSearch = ref('')
const loading = ref(false)
const presetSaving = ref(false)
const categorySaving = ref(false)
const saving = computed(() => presetSaving.value || categorySaving.value)
const presetAutosaveState = ref<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle')
const categoryAutosaveState = ref<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle')
const error = ref('')
const success = ref('')
let loadedForUserId: number | null = null
let presetAutosaveTimer: ReturnType<typeof setTimeout> | null = null
let categoryAutosaveTimer: ReturnType<typeof setTimeout> | null = null
let lastPresetSnapshot = ''
let lastCategorySnapshot = ''
let suspendAutosave = false

useHead({ title: 'Défis — Administration' })

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const sortedCategories = computed(() => [...categories.value].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'fr')))
const sortedPresets = computed(() => [...presets.value].sort((a, b) => {
  const categoryA = categories.value.find(category => category.id === a.categoryId)
  const categoryB = categories.value.find(category => category.id === b.categoryId)
  return (categoryA?.sortOrder ?? 0) - (categoryB?.sortOrder ?? 0)
    || a.sortOrder - b.sortOrder
    || a.label.localeCompare(b.label, 'fr')
}))
const presetGroups = computed(() => sortedCategories.value
  .map(category => ({
    category,
    presets: sortedPresets.value.filter(preset => preset.categoryId === category.id),
  }))
  .filter(group => group.presets.length))
const filteredVerbs = computed(() => {
  const query = verbSearch.value.trim().toLocaleLowerCase('fr')
  return verbs.value.filter(verb => !query || verb.infinitif.toLocaleLowerCase('fr').includes(query))
})
const selectedVerbs = computed(() => {
  const selectedIds = new Set(presetDraft.value?.verbIds ?? [])
  const known = verbs.value
    .filter(verb => selectedIds.has(verb.id))
    .sort((a, b) => a.infinitif.localeCompare(b.infinitif, 'fr') || a.id - b.id)
  const knownIds = new Set(known.map(verb => verb.id))
  const missing = [...selectedIds]
    .filter(id => !knownIds.has(id))
    .map(id => ({ id, infinitif: `Verbe ${id}` }))
  return [...known, ...missing]
})
const tensesByMode = computed(() => modes.value.map(mode => ({
  mode,
  tenses: tenses.value.filter(tense => tense.modeId === mode.id),
})).filter(group => group.tenses.length))
const presetAutosaveLabel = computed(() => {
  if (presetAutosaveState.value === 'saving') return 'Enregistrement…'
  if (presetAutosaveState.value === 'dirty') return 'Modification en attente — complète les champs obligatoires si nécessaire.'
  if (presetAutosaveState.value === 'error') return 'Échec de l’enregistrement automatique.'
  return 'Toutes les modifications sont enregistrées.'
})
const categoryAutosaveLabel = computed(() => {
  if (categoryAutosaveState.value === 'saving') return 'Enregistrement…'
  if (categoryAutosaveState.value === 'dirty') return 'Modification en attente — complète le nom et l’identifiant.'
  if (categoryAutosaveState.value === 'error') return 'Échec de l’enregistrement automatique.'
  return 'Toutes les modifications sont enregistrées.'
})

function setPresetDraft(preset: AdminPreset | null) {
  suspendAutosave = true
  presetDraft.value = preset ? clone(preset) : null
  lastPresetSnapshot = presetDraft.value ? JSON.stringify(presetDraft.value) : ''
  presetAutosaveState.value = presetDraft.value ? 'saved' : 'idle'
  suspendAutosave = false
}

function setCategoryDraft(category: PresetCategory | null) {
  suspendAutosave = true
  categoryDraft.value = category ? clone(category) : null
  lastCategorySnapshot = categoryDraft.value ? JSON.stringify(categoryDraft.value) : ''
  categoryAutosaveState.value = categoryDraft.value ? 'saved' : 'idle'
  suspendAutosave = false
}

function nextPresetOrder(categoryId: number) {
  return presets.value
    .filter(preset => preset.categoryId === categoryId && preset.databaseId !== presetDraft.value?.databaseId)
    .reduce((maximum, preset) => Math.max(maximum, preset.sortOrder), 0) + 1
}

function assignNextPresetOrder() {
  if (presetDraft.value) presetDraft.value.sortOrder = nextPresetOrder(presetDraft.value.categoryId)
}

async function selectPreset(preset: AdminPreset) {
  await flushPresetAutosave()
  setPresetDraft(preset)
  openPresetCategoryId.value = preset.categoryId
  verbSearch.value = ''
  error.value = ''
  success.value = ''
}

async function createPreset() {
  await flushPresetAutosave()
  const category = sortedCategories.value[0]
  openPresetCategoryId.value = category?.id ?? null
  setPresetDraft({
    databaseId: 0,
    id: '',
    label: '',
    description: '',
    group: category?.slug ?? '',
    groupLabel: category?.name ?? '',
    categoryId: category?.id ?? 0,
    verbIds: [],
    tenseIds: [],
    questionCount: 20,
    exerciseKind: 'conjugation',
    pastSimplePronouns: 'all',
    inclusivePronouns: false,
    includeComplements: true,
    complementPlacement: 'mixed',
    complementOptions: ['cod-after', 'coi-after'],
    sortOrder: nextPresetOrder(category?.id ?? 0),
    isActive: true,
    verbSelectionMode: 'explicit',
  })
  lastPresetSnapshot = ''
  presetAutosaveState.value = 'dirty'
  error.value = ''
  success.value = ''
}

function togglePresetCategory(categoryId: number) {
  openPresetCategoryId.value = openPresetCategoryId.value === categoryId ? null : categoryId
}

function startPresetDrag(preset: AdminPreset, event: DragEvent) {
  if (!preset.databaseId) return
  draggedPresetId.value = preset.databaseId
  dragOverPresetId.value = preset.databaseId
  event.dataTransfer?.setData('text/plain', String(preset.databaseId))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function endPresetDrag() {
  draggedPresetId.value = null
  dragOverPresetId.value = null
}

function overPresetDrag(preset: AdminPreset, event: DragEvent) {
  const dragged = presets.value.find(item => item.databaseId === draggedPresetId.value)
  if (!dragged || dragged.categoryId !== preset.categoryId) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  dragOverPresetId.value = preset.databaseId
}

async function dropPreset(preset: AdminPreset, event: DragEvent) {
  event.preventDefault()
  const dragged = presets.value.find(item => item.databaseId === draggedPresetId.value)
  if (!dragged || dragged.databaseId === preset.databaseId || dragged.categoryId !== preset.categoryId) {
    endPresetDrag()
    return
  }
  const categoryPresets = sortedPresets.value.filter(item => item.categoryId === preset.categoryId)
  const originalOrders = new Map(categoryPresets.map(item => [item.databaseId, item.sortOrder]))
  const reordered = categoryPresets.filter(item => item.databaseId !== dragged.databaseId)
  let targetIndex = reordered.findIndex(item => item.databaseId === preset.databaseId)
  const target = event.currentTarget as HTMLElement | null
  if (target && event.clientY > target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2) targetIndex += 1
  reordered.splice(Math.max(0, targetIndex), 0, dragged)
  for (const [index, item] of reordered.entries()) item.sortOrder = index + 1
  if (presetDraft.value && presetDraft.value.categoryId === preset.categoryId) {
    const selected = reordered.find(item => item.databaseId === presetDraft.value?.databaseId)
    if (selected) presetDraft.value.sortOrder = selected.sortOrder
    lastPresetSnapshot = JSON.stringify(presetDraft.value)
    cancelPresetAutosave()
  }
  presetAutosaveState.value = 'saving'
  endPresetDrag()
  try {
    await $fetch('/api/admin/challenge-presets/reorder', {
      method: 'PUT',
      body: { categoryId: preset.categoryId, orderedIds: reordered.map(item => item.databaseId) },
    })
    presetAutosaveState.value = 'saved'
  } catch (caught) {
    for (const item of categoryPresets) item.sortOrder = originalOrders.get(item.databaseId) ?? item.sortOrder
    if (presetDraft.value && presetDraft.value.categoryId === preset.categoryId) {
      const restored = categoryPresets.find(item => item.databaseId === presetDraft.value?.databaseId)
      if (restored) presetDraft.value.sortOrder = restored.sortOrder
      lastPresetSnapshot = JSON.stringify(presetDraft.value)
    }
    presetAutosaveState.value = 'error'
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible d’enregistrer le nouvel ordre.')
  }
}

function startCategoryDrag(category: PresetCategory, event: DragEvent) {
  if (!category.id) return
  draggedCategoryId.value = category.id
  dragOverCategoryId.value = category.id
  event.dataTransfer?.setData('text/plain', String(category.id))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function endCategoryDrag() {
  draggedCategoryId.value = null
  dragOverCategoryId.value = null
}

function overCategoryDrag(category: PresetCategory, event: DragEvent) {
  if (!draggedCategoryId.value) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  dragOverCategoryId.value = category.id
}

async function dropCategory(category: PresetCategory, event: DragEvent) {
  event.preventDefault()
  const dragged = categories.value.find(item => item.id === draggedCategoryId.value)
  if (!dragged || dragged.id === category.id) {
    endCategoryDrag()
    return
  }
  const ordered = [...sortedCategories.value]
  const originalOrders = new Map(ordered.map(item => [item.id, item.sortOrder]))
  const reordered = ordered.filter(item => item.id !== dragged.id)
  let targetIndex = reordered.findIndex(item => item.id === category.id)
  const target = event.currentTarget as HTMLElement | null
  if (target && event.clientY > target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2) targetIndex += 1
  reordered.splice(Math.max(0, targetIndex), 0, dragged)
  for (const [index, item] of reordered.entries()) item.sortOrder = index + 1
  if (categoryDraft.value) {
    const selected = reordered.find(item => item.id === categoryDraft.value?.id)
    if (selected) categoryDraft.value.sortOrder = selected.sortOrder
    lastCategorySnapshot = JSON.stringify(categoryDraft.value)
    cancelCategoryAutosave()
  }
  categoryAutosaveState.value = 'saving'
  endCategoryDrag()
  try {
    await $fetch('/api/admin/challenge-preset-categories/reorder', {
      method: 'PUT',
      body: { orderedIds: reordered.map(item => item.id) },
    })
    for (const preset of presets.value) {
      const presetCategory = reordered.find(item => item.id === preset.categoryId)
      if (presetCategory) preset.groupOrder = presetCategory.sortOrder
    }
    categoryAutosaveState.value = 'saved'
  } catch (caught) {
    for (const item of ordered) item.sortOrder = originalOrders.get(item.id) ?? item.sortOrder
    if (categoryDraft.value) {
      const restored = ordered.find(item => item.id === categoryDraft.value?.id)
      if (restored) categoryDraft.value.sortOrder = restored.sortOrder
      lastCategorySnapshot = JSON.stringify(categoryDraft.value)
    }
    categoryAutosaveState.value = 'error'
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible d’enregistrer l’ordre des catégories.')
  }
}

async function selectCategory(category: PresetCategory) {
  await flushCategoryAutosave()
  setCategoryDraft(category)
  error.value = ''
  success.value = ''
}

async function createCategory() {
  await flushCategoryAutosave()
  setCategoryDraft({
    id: 0,
    slug: '',
    name: '',
    description: '',
    sortOrder: categories.value.length + 1,
    isActive: true,
  })
  lastCategorySnapshot = ''
  categoryAutosaveState.value = 'dirty'
  error.value = ''
  success.value = ''
}

function toggleId(ids: number[], id: number) {
  const index = ids.indexOf(id)
  if (index >= 0) ids.splice(index, 1)
  else ids.push(id)
}

function toggleVerb(id: number) {
  if (!presetDraft.value) return
  const wasSelected = presetDraft.value.verbIds.includes(id)
  toggleId(presetDraft.value.verbIds, id)
  if (!wasSelected) verbSearch.value = ''
}

function inputChecked(event: Event) {
  return (event.target as HTMLInputElement).checked
}

function setComplementOption(option: ComplementOption, checked: boolean) {
  if (!presetDraft.value) return
  const current = presetDraft.value.complementOptions
  if (checked && !current.includes(option)) current.push(option)
  if (!checked) presetDraft.value.complementOptions = current.filter(item => item !== option)
}

function setAllVisibleVerbs(selected: boolean) {
  if (!presetDraft.value) return
  const visibleIds = new Set(filteredVerbs.value.map(verb => verb.id))
  presetDraft.value.verbIds = selected
    ? [...new Set([...presetDraft.value.verbIds, ...visibleIds])]
    : presetDraft.value.verbIds.filter(id => !visibleIds.has(id))
}

function setModeTenses(modeId: number, selected: boolean) {
  if (!presetDraft.value) return
  const ids = new Set(tenses.value.filter(tense => tense.modeId === modeId).map(tense => tense.id))
  presetDraft.value.tenseIds = selected
    ? [...new Set([...presetDraft.value.tenseIds, ...ids])]
    : presetDraft.value.tenseIds.filter(id => !ids.has(id))
}

async function load(preferredPresetId?: number, preferredCategoryId?: number) {
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch<AdminResponse>('/api/admin/challenge-presets')
    categories.value = response.categories
    presets.value = response.presets
    verbs.value = response.verbs
    modes.value = response.modes
    tenses.value = response.tenses
    const selectedPresetId = preferredPresetId ?? presetDraft.value?.databaseId
    const selectedPreset = presets.value.find(item => item.databaseId === selectedPresetId) ?? presets.value[0]
    setPresetDraft(selectedPreset ?? null)
    openPresetCategoryId.value = null
    const selectedCategoryId = preferredCategoryId ?? categoryDraft.value?.id
    const selectedCategory = categories.value.find(item => item.id === selectedCategoryId) ?? sortedCategories.value[0]
    setCategoryDraft(selectedCategory ?? null)
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de charger les défis.')
  } finally {
    loading.value = false
  }
}

function presetCanBeSaved(draft: AdminPreset) {
  return Boolean(draft.id.trim() && draft.label.trim() && draft.categoryId
    && draft.verbIds.length && draft.tenseIds.length)
}

function categoryCanBeSaved(draft: PresetCategory) {
  return Boolean(draft.slug.trim() && draft.name.trim())
}

function cancelPresetAutosave() {
  if (presetAutosaveTimer) clearTimeout(presetAutosaveTimer)
  presetAutosaveTimer = null
}

function cancelCategoryAutosave() {
  if (categoryAutosaveTimer) clearTimeout(categoryAutosaveTimer)
  categoryAutosaveTimer = null
}

function schedulePresetAutosave() {
  cancelPresetAutosave()
  const draft = presetDraft.value
  if (!draft || JSON.stringify(draft) === lastPresetSnapshot) return
  presetAutosaveState.value = 'dirty'
  if (!presetCanBeSaved(draft)) return
  presetAutosaveTimer = setTimeout(() => { void savePreset() }, 650)
}

function scheduleCategoryAutosave() {
  cancelCategoryAutosave()
  const draft = categoryDraft.value
  if (!draft || JSON.stringify(draft) === lastCategorySnapshot) return
  categoryAutosaveState.value = 'dirty'
  if (!categoryCanBeSaved(draft)) return
  categoryAutosaveTimer = setTimeout(() => { void saveCategory() }, 650)
}

async function flushPresetAutosave() {
  cancelPresetAutosave()
  const draft = presetDraft.value
  if (draft && JSON.stringify(draft) !== lastPresetSnapshot && presetCanBeSaved(draft)) await savePreset()
}

async function flushCategoryAutosave() {
  cancelCategoryAutosave()
  const draft = categoryDraft.value
  if (draft && JSON.stringify(draft) !== lastCategorySnapshot && categoryCanBeSaved(draft)) await saveCategory()
}

async function savePreset() {
  const draft = presetDraft.value
  if (!draft || presetSaving.value || !presetCanBeSaved(draft)) return
  cancelPresetAutosave()
  error.value = ''
  success.value = ''
  presetSaving.value = true
  presetAutosaveState.value = 'saving'
  const submitted = clone(draft)
  let saveSucceeded = false
  try {
    const endpoint = submitted.databaseId ? `/api/admin/challenge-presets/${submitted.databaseId}` : '/api/admin/challenge-presets'
    const response = await $fetch<{ id?: number, orders?: Array<{ id: number, sortOrder: number }> }>(endpoint, {
      method: submitted.databaseId ? 'PUT' : 'POST',
      body: submitted,
    })
    const id = response.id ?? submitted.databaseId
    if (presetDraft.value === draft) {
      const changedDuringSave = JSON.stringify(draft) !== JSON.stringify(submitted)
      const orderChangedDuringSave = draft.sortOrder !== submitted.sortOrder
      draft.databaseId = id
      draft.verbSelectionMode = 'explicit'
      for (const order of response.orders ?? []) {
        const listed = presets.value.find(item => item.databaseId === order.id)
        if (listed) listed.sortOrder = order.sortOrder
      }
      const appliedOrder = response.orders?.find(order => order.id === id)?.sortOrder
      if (appliedOrder && !orderChangedDuringSave) draft.sortOrder = appliedOrder
      const category = categories.value.find(item => item.id === draft.categoryId)
      draft.group = category?.slug ?? draft.group
      draft.groupLabel = category?.name ?? draft.groupLabel
      draft.groupOrder = category?.sortOrder ?? draft.groupOrder
      const saved = clone(draft)
      const index = presets.value.findIndex(item => item.databaseId === id)
      if (index >= 0) presets.value[index] = saved
      else presets.value.push(saved)
      const stored = clone(submitted)
      stored.databaseId = id
      stored.verbSelectionMode = 'explicit'
      if (appliedOrder) stored.sortOrder = appliedOrder
      const storedCategory = categories.value.find(item => item.id === stored.categoryId)
      stored.group = storedCategory?.slug ?? stored.group
      stored.groupLabel = storedCategory?.name ?? stored.groupLabel
      stored.groupOrder = storedCategory?.sortOrder ?? stored.groupOrder
      lastPresetSnapshot = JSON.stringify(stored)
      presetAutosaveState.value = changedDuringSave ? 'dirty' : 'saved'
      saveSucceeded = true
    }
  } catch (caught) {
    presetAutosaveState.value = 'error'
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible d’enregistrer automatiquement ce défi.')
  } finally {
    presetSaving.value = false
    if (saveSucceeded && presetDraft.value && JSON.stringify(presetDraft.value) !== lastPresetSnapshot) schedulePresetAutosave()
  }
}

async function deletePreset() {
  const draft = presetDraft.value
  if (!draft?.databaseId || saving.value || !confirm(`Supprimer le défi « ${draft.label} » ?`)) return
  cancelPresetAutosave()
  presetSaving.value = true
  try {
    await $fetch(`/api/admin/challenge-presets/${draft.databaseId}`, { method: 'DELETE' })
    setPresetDraft(null)
    await load()
    success.value = 'Défi supprimé.'
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de supprimer ce défi.')
  } finally {
    presetSaving.value = false
  }
}

async function saveCategory() {
  const draft = categoryDraft.value
  if (!draft || categorySaving.value || !categoryCanBeSaved(draft)) return
  cancelCategoryAutosave()
  error.value = ''
  success.value = ''
  categorySaving.value = true
  categoryAutosaveState.value = 'saving'
  const submitted = clone(draft)
  let saveSucceeded = false
  try {
    const endpoint = submitted.id ? `/api/admin/challenge-preset-categories/${submitted.id}` : '/api/admin/challenge-preset-categories'
    const response = await $fetch<{ id?: number }>(endpoint, { method: submitted.id ? 'PUT' : 'POST', body: submitted })
    const id = response.id ?? submitted.id
    if (categoryDraft.value === draft) {
      const changedDuringSave = JSON.stringify(draft) !== JSON.stringify(submitted)
      draft.id = id
      const saved = clone(draft)
      const index = categories.value.findIndex(item => item.id === id)
      if (index >= 0) categories.value[index] = saved
      else categories.value.push(saved)
      const stored = clone(submitted)
      stored.id = id
      lastCategorySnapshot = JSON.stringify(stored)
      categoryAutosaveState.value = changedDuringSave ? 'dirty' : 'saved'
      saveSucceeded = true
    }
  } catch (caught) {
    categoryAutosaveState.value = 'error'
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible d’enregistrer automatiquement cette catégorie.')
  } finally {
    categorySaving.value = false
    if (saveSucceeded && categoryDraft.value && JSON.stringify(categoryDraft.value) !== lastCategorySnapshot) scheduleCategoryAutosave()
  }
}

async function deleteCategory() {
  const draft = categoryDraft.value
  if (!draft?.id || saving.value || !confirm(`Supprimer la catégorie « ${draft.name} » ?`)) return
  cancelCategoryAutosave()
  categorySaving.value = true
  try {
    await $fetch(`/api/admin/challenge-preset-categories/${draft.id}`, { method: 'DELETE' })
    setCategoryDraft(null)
    await load()
    success.value = 'Catégorie supprimée.'
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de supprimer cette catégorie.')
  } finally {
    categorySaving.value = false
  }
}

watch(presetDraft, () => {
  if (!suspendAutosave) schedulePresetAutosave()
}, { deep: true })

watch(categoryDraft, () => {
  if (!suspendAutosave) scheduleCategoryAutosave()
}, { deep: true })

onBeforeUnmount(() => {
  cancelPresetAutosave()
  cancelCategoryAutosave()
})

watch(user, (currentUser) => {
  if (!currentUser) {
    loadedForUserId = null
    return
  }
  if (loadedForUserId !== currentUser.id) {
    loadedForUserId = currentUser.id
    void load()
  }
}, { immediate: true })
</script>

<template>
  <AdminAuthBoundary>
    <AdminShell>
      <div class="challenge-admin">
        <header class="admin-section-heading challenge-admin__heading">
          <div>
            <p class="admin-eyebrow">Catalogue d’exercices</p>
            <h1>Gestion des défis</h1>
            <p class="admin-muted">Configure les défis proposés, leurs verbes, leurs temps et toutes leurs options.</p>
          </div>
          <div class="challenge-tabs" role="tablist" aria-label="Gestion des défis">
            <button type="button" :class="{ active: tab === 'presets' }" @click="tab = 'presets'">Défis</button>
            <button type="button" :class="{ active: tab === 'categories' }" @click="tab = 'categories'">Catégories</button>
          </div>
        </header>

        <p v-if="error" class="admin-notice admin-notice--error" role="alert">{{ error }}</p>
        <p v-if="success" class="admin-notice admin-notice--success" role="status">{{ success }}</p>
        <p v-if="loading" class="admin-muted">Chargement…</p>

        <div v-else-if="tab === 'presets'" class="challenge-workspace">
          <aside class="challenge-list admin-card">
            <header><strong>Défis</strong><button type="button" class="admin-button admin-button--small admin-button--primary" @click="createPreset">Nouveau</button></header>
            <section v-for="group in presetGroups" :key="group.category.id" class="challenge-list__group">
              <h2>
                <button type="button" :aria-expanded="openPresetCategoryId === group.category.id" :aria-controls="`preset-category-${group.category.id}`" @click="togglePresetCategory(group.category.id)">
                  <span>{{ group.category.name }}</span><small>{{ group.presets.length }}</small><i aria-hidden="true">⌄</i>
                </button>
              </h2>
              <div v-show="openPresetCategoryId === group.category.id" :id="`preset-category-${group.category.id}`" class="challenge-list__items">
                <button v-for="preset in group.presets" :key="preset.databaseId" type="button" draggable="true" :class="{ selected: preset.databaseId === presetDraft?.databaseId, dragging: preset.databaseId === draggedPresetId, 'drag-over': preset.databaseId === dragOverPresetId && preset.databaseId !== draggedPresetId }" :title="`Glisser pour déplacer ${preset.label}`" @click="selectPreset(preset)" @dragstart="startPresetDrag(preset, $event)" @dragover="overPresetDrag(preset, $event)" @drop="dropPreset(preset, $event)" @dragend="endPresetDrag">
                  <b class="drag-handle" aria-hidden="true">⠿</b><span><strong>{{ preset.label }}</strong><small>№ {{ preset.sortOrder }} · {{ preset.verbIds.length }} verbes · {{ preset.tenseIds.length }} temps</small></span>
                  <i :class="{ inactive: !preset.isActive }">{{ preset.isActive ? 'Actif' : 'Masqué' }}</i>
                </button>
              </div>
            </section>
          </aside>

          <form v-if="presetDraft" class="challenge-editor admin-card" @submit.prevent>
            <div class="editor-title"><div><p class="admin-eyebrow">{{ presetDraft.databaseId ? 'Défi existant' : 'Nouveau défi' }}</p><h2>{{ presetDraft.label || 'Sans nom' }}</h2></div><label class="switch"><input v-model="presetDraft.isActive" type="checkbox"><span>Visible</span></label></div>
            <section class="editor-section">
              <h3>Informations</h3>
              <div class="field-grid">
                <label class="admin-field"><span>Nom *</span><input v-model="presetDraft.label" required></label>
                <label class="admin-field"><span>Identifiant *</span><input v-model="presetDraft.id" required pattern="[A-Za-z0-9][A-Za-z0-9_-]*"></label>
                <label class="admin-field"><span>Catégorie *</span><select v-model.number="presetDraft.categoryId" required @change="assignNextPresetOrder"><option v-for="category in sortedCategories" :key="category.id" :value="category.id">{{ category.name }}</option></select></label>
                <label class="admin-field"><span>Ordre dans la catégorie</span><input v-model.number="presetDraft.sortOrder" type="number" min="1" :max="presets.filter(preset => preset.categoryId === presetDraft!.categoryId && preset.databaseId !== presetDraft!.databaseId).length + 1" required></label>
                <label class="admin-field wide"><span>Description</span><textarea v-model="presetDraft.description" rows="2" maxlength="500" /></label>
              </div>
            </section>

            <section class="editor-section">
              <div class="section-heading"><div><h3>Verbes</h3><small>{{ presetDraft.verbIds.length }} sélectionné(s)</small></div></div>
              <div class="selected-verbs" :class="{ empty: !selectedVerbs.length }">
                <div class="selected-verbs__heading">
                  <strong>Verbes sélectionnés</strong>
                  <button v-if="selectedVerbs.length" type="button" @click="presetDraft.verbIds = []">Tout retirer</button>
                </div>
                <p v-if="!selectedVerbs.length">Aucun verbe sélectionné.</p>
                <div v-else class="selected-verbs__badges">
                  <button v-for="verb in selectedVerbs" :key="verb.id" type="button" :aria-label="`Retirer ${verb.infinitif}`" :title="`Retirer ${verb.infinitif}`" @click="toggleId(presetDraft.verbIds, verb.id)">
                    <span>{{ verb.infinitif }}</span><i aria-hidden="true">×</i>
                  </button>
                </div>
              </div>
              <div class="verb-catalogue-heading"><strong>Tous les verbes</strong><input v-model="verbSearch" class="search" type="search" placeholder="Rechercher un verbe…"></div>
              <div class="selection-actions"><button type="button" class="admin-button admin-button--small" @click="setAllVisibleVerbs(true)">Sélectionner les résultats</button><button type="button" class="admin-button admin-button--small" @click="setAllVisibleVerbs(false)">Retirer les résultats</button></div>
              <div class="choice-grid verb-grid">
                <label v-for="verb in filteredVerbs" :key="verb.id" :class="{ selected: presetDraft.verbIds.includes(verb.id) }"><input type="checkbox" :checked="presetDraft.verbIds.includes(verb.id)" @change="toggleVerb(verb.id)"><span>{{ verb.infinitif }}</span></label>
              </div>
            </section>

            <section class="editor-section">
              <div class="section-heading"><div><h3>Temps</h3><small>{{ presetDraft.tenseIds.length }} sélectionné(s)</small></div></div>
              <div class="tense-groups">
                <div v-for="group in tensesByMode" :key="group.mode.id"><header><strong>{{ group.mode.name }}</strong><span><button type="button" @click="setModeTenses(group.mode.id, true)">Tous</button><button type="button" @click="setModeTenses(group.mode.id, false)">Aucun</button></span></header><div class="choice-grid"><label v-for="tense in group.tenses" :key="tense.id" :class="{ selected: presetDraft.tenseIds.includes(tense.id) }"><input type="checkbox" :checked="presetDraft.tenseIds.includes(tense.id)" @change="toggleId(presetDraft!.tenseIds, tense.id)"><span>{{ tense.name }}</span></label></div></div>
              </div>
            </section>

            <section class="editor-section">
              <h3>Options</h3>
              <div class="field-grid">
                <label class="admin-field"><span>Nombre de questions</span><input v-model.number="presetDraft.questionCount" type="number" min="1" max="100" required></label>
                <label class="admin-field"><span>Type d’exercice</span><select v-model="presetDraft.exerciseKind"><option value="conjugation">Conjugaison</option><option value="tense-identification">Identifier le temps</option></select></label>
                <label class="admin-field"><span>Pronoms au passé simple</span><select v-model="presetDraft.pastSimplePronouns"><option value="all">Tous les pronoms</option><option value="third-person-only">3e personnes seulement</option></select></label>
                <label class="check-line"><input v-model="presetDraft.inclusivePronouns" type="checkbox"><span>Inclure les pronoms « on » et « elles »</span></label>
              </div>
              <div><strong class="option-title">Compléments proposés</strong><div class="choice-grid complement-grid"><label v-for="option in COMPLEMENT_OPTIONS" :key="option.value" :class="{ selected: presetDraft.complementOptions.includes(option.value) }"><input type="checkbox" :checked="presetDraft.complementOptions.includes(option.value)" @change="setComplementOption(option.value, inputChecked($event))"><span>{{ option.label }}</span></label></div></div>
            </section>

            <footer class="editor-actions"><button v-if="presetDraft.databaseId" type="button" class="admin-button danger" :disabled="saving" @click="deletePreset">Supprimer</button><span /><p class="autosave-status" :class="`is-${presetAutosaveState}`" aria-live="polite"><i aria-hidden="true" />{{ presetAutosaveLabel }} <button v-if="presetAutosaveState === 'error'" type="button" @click="savePreset">Réessayer</button></p></footer>
          </form>
          <div v-else class="empty admin-card"><p>Sélectionne un défi ou crée-en un nouveau.</p></div>
        </div>

        <div v-else class="challenge-workspace category-workspace">
          <aside class="challenge-list category-list admin-card">
            <header><strong>Catégories</strong><button type="button" class="admin-button admin-button--small admin-button--primary" @click="createCategory">Nouvelle</button></header>
            <button v-for="category in sortedCategories" :key="category.id" type="button" draggable="true" :class="{ selected: category.id === categoryDraft?.id, dragging: category.id === draggedCategoryId, 'drag-over': category.id === dragOverCategoryId && category.id !== draggedCategoryId }" :title="`Glisser pour déplacer ${category.name}`" @click="selectCategory(category)" @dragstart="startCategoryDrag(category, $event)" @dragover="overCategoryDrag(category, $event)" @drop="dropCategory(category, $event)" @dragend="endCategoryDrag">
              <b class="drag-handle" aria-hidden="true">⠿</b><span><strong>{{ category.name }}</strong><small>№ {{ category.sortOrder }} · {{ presets.filter(preset => preset.categoryId === category.id).length }} défi(s)</small></span><i :class="{ inactive: !category.isActive }">{{ category.isActive ? 'Active' : 'Masquée' }}</i>
            </button>
          </aside>
          <form v-if="categoryDraft" class="challenge-editor admin-card category-editor" @submit.prevent>
            <div class="editor-title"><div><p class="admin-eyebrow">Catégorie</p><h2>{{ categoryDraft.name || 'Sans nom' }}</h2></div><label class="switch"><input v-model="categoryDraft.isActive" type="checkbox"><span>Visible</span></label></div>
            <div class="field-grid"><label class="admin-field"><span>Nom *</span><input v-model="categoryDraft.name" required></label><label class="admin-field"><span>Identifiant *</span><input v-model="categoryDraft.slug" required></label><label class="admin-field"><span>Ordre</span><input v-model.number="categoryDraft.sortOrder" type="number" required></label><label class="admin-field wide"><span>Description</span><textarea v-model="categoryDraft.description" rows="4" maxlength="500" /></label></div>
            <p class="admin-muted">Une catégorie masquée masque aussi tous ses défis dans le catalogue public.</p>
            <footer class="editor-actions"><button v-if="categoryDraft.id" type="button" class="admin-button danger" :disabled="saving" @click="deleteCategory">Supprimer</button><span /><p class="autosave-status" :class="`is-${categoryAutosaveState}`" aria-live="polite"><i aria-hidden="true" />{{ categoryAutosaveLabel }} <button v-if="categoryAutosaveState === 'error'" type="button" @click="saveCategory">Réessayer</button></p></footer>
          </form>
        </div>
      </div>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.challenge-admin{display:grid;gap:22px}.challenge-admin__heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.challenge-admin__heading h1,.editor-title h2,.editor-section h3{margin:0}.challenge-admin__heading .admin-muted{max-width:720px;margin:7px 0 0}.challenge-tabs{display:flex;padding:4px;border:1px solid var(--admin-border);border-radius:11px;background:#edf3f5}.challenge-tabs button{padding:8px 14px;border:0;border-radius:8px;color:var(--admin-muted);background:transparent;font-weight:850;cursor:pointer}.challenge-tabs button.active{color:white;background:var(--admin-blue)}.challenge-workspace{display:grid;grid-template-columns:minmax(240px,310px) minmax(0,1fr);align-items:start;gap:18px}.challenge-list{display:grid;max-height:calc(100vh - 180px);padding:10px;gap:5px;overflow:auto;position:sticky;top:16px}.challenge-list>header{display:flex;align-items:center;justify-content:space-between;padding:7px 6px 11px}.challenge-list__group{display:grid;gap:4px}.challenge-list__group+ .challenge-list__group{margin-top:6px}.challenge-list__group h2{margin:0}.challenge-list__group h2>button{display:grid;width:100%;padding:10px;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:8px;color:var(--admin-blue);border:0;border-bottom:1px solid var(--admin-border);background:transparent;text-align:left;font-size:.72rem;font-weight:900;letter-spacing:.07em;text-transform:uppercase;cursor:pointer}.challenge-list__group h2 small{display:grid;min-width:22px;height:22px;padding:0 5px;place-items:center;color:var(--admin-muted);border-radius:999px;background:#eaf1f3;font-size:.66rem;letter-spacing:0}.challenge-list__group h2 i{padding:0;color:var(--admin-blue);background:transparent;font-size:1rem;transform:rotate(-90deg);transition:transform .15s}.challenge-list__group h2 button[aria-expanded='true'] i{transform:rotate(0)}.challenge-list__items{display:grid;padding-top:3px;gap:4px}.challenge-list__items>button,.challenge-list>button{display:flex;width:100%;padding:11px;align-items:center;justify-content:space-between;gap:9px;border:1px solid transparent;border-radius:10px;color:var(--admin-text);background:transparent;text-align:left;cursor:pointer}.challenge-list__items>button:hover,.challenge-list>button:hover{background:#f0f6f7}.challenge-list__items>button.selected,.challenge-list>button.selected{border-color:#8fc3cf;background:#e9f5f7}.challenge-list__items>button span,.challenge-list>button span{display:grid;min-width:0;gap:2px}.challenge-list__items>button small,.challenge-list>button small{overflow:hidden;color:var(--admin-muted);text-overflow:ellipsis;white-space:nowrap}.challenge-list i{padding:3px 6px;color:#27715a;border-radius:999px;background:#dff1e9;font-size:.66rem;font-style:normal;font-weight:850}.challenge-list i.inactive{color:#7b6350;background:#eee6df}.challenge-editor{display:grid;padding:clamp(18px,3vw,30px);gap:24px}.editor-title{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.switch,.check-line{display:flex;align-items:center;gap:8px;font-weight:800}.switch{padding:8px 11px;border:1px solid var(--admin-border);border-radius:9px}.editor-section{display:grid;padding-top:20px;border-top:1px solid var(--admin-border);gap:14px}.field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.field-grid .wide{grid-column:1/-1}.admin-field textarea{resize:vertical}.section-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}.section-heading>div{display:flex;align-items:baseline;gap:9px}.section-heading small{color:var(--admin-muted)}.search{width:min(300px,100%);padding:9px 11px;border:1px solid var(--admin-border);border-radius:9px}.selected-verbs{display:grid;padding:12px;border:1px solid #9fcbd4;border-radius:12px;background:#f0f9fa;gap:9px}.selected-verbs.empty{padding:12px;text-align:left}.selected-verbs__heading,.verb-catalogue-heading{display:flex;align-items:center;justify-content:space-between;gap:12px}.selected-verbs__heading strong,.verb-catalogue-heading>strong{color:var(--admin-navy);font-size:.8rem}.selected-verbs__heading button{padding:0;border:0;color:var(--admin-blue);background:transparent;font-size:.75rem;font-weight:800;cursor:pointer}.selected-verbs p{margin:0;color:var(--admin-muted);font-size:.82rem}.selected-verbs__badges{display:flex;max-height:116px;gap:6px;flex-wrap:wrap;overflow:auto}.selected-verbs__badges button{display:inline-flex;padding:5px 7px 5px 9px;align-items:center;gap:6px;color:#174a57;border:1px solid #83bdca;border-radius:999px;background:white;font-size:.76rem;font-weight:800;cursor:pointer}.selected-verbs__badges button:hover{color:#8f352e;border-color:#d89a94;background:#fff5f4}.selected-verbs__badges i{font-size:1rem;font-style:normal;line-height:.8}.selection-actions{display:flex;gap:8px;flex-wrap:wrap}.choice-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:7px}.choice-grid label{display:flex;min-width:0;padding:8px 10px;align-items:center;gap:8px;border:1px solid var(--admin-border);border-radius:8px;background:#fafcfc;font-size:.82rem;cursor:pointer}.choice-grid label.selected{border-color:#72b3c4;background:#e9f6f8}.choice-grid label span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.verb-grid{max-height:320px;padding:2px;overflow:auto}.tense-groups{display:grid;gap:13px}.tense-groups>div{display:grid;padding:12px;border:1px solid var(--admin-border);border-radius:11px;gap:9px}.tense-groups header{display:flex;align-items:center;justify-content:space-between}.tense-groups header span{display:flex;gap:9px}.tense-groups header button{padding:0;border:0;color:var(--admin-blue);background:transparent;font-size:.75rem;font-weight:800;cursor:pointer}.complement-grid{margin-top:8px}.option-title{display:block;font-size:.82rem}.editor-actions{display:grid;grid-template-columns:auto 1fr auto;align-items:center;padding-top:18px;border-top:1px solid var(--admin-border)}.admin-button.danger{color:#9c342f;border-color:#d9aaa6}.empty{padding:40px;text-align:center}.category-workspace{max-width:1050px}.category-editor{gap:18px}:global(:root[data-theme='dark'] .challenge-tabs),:global(:root[data-theme='dark'] .choice-grid label),:global(:root[data-theme='dark'] .tense-groups>div){border-color:rgb(128 181 190 / 30%);background:rgb(24 46 51 / 36%)}:global(:root[data-theme='dark'] .selected-verbs){border-color:rgb(132 202 213 / 42%);background:rgb(39 80 88 / 28%)}:global(:root[data-theme='dark'] .selected-verbs__heading strong),:global(:root[data-theme='dark'] .verb-catalogue-heading>strong){color:#c6e4e7}:global(:root[data-theme='dark'] .selected-verbs__badges button){color:#cce9ed;border-color:rgb(132 202 213 / 42%);background:rgb(24 50 56 / 72%)}:global(:root[data-theme='dark'] .challenge-list__group h2 small){color:#a9c2c7;background:rgb(61 97 104 / 36%)}:global(:root[data-theme='dark'] .challenge-list__items>button:hover),:global(:root[data-theme='dark'] .challenge-list>button:hover){background:rgb(62 103 111 / 22%)}:global(:root[data-theme='dark'] .challenge-list__items>button.selected),:global(:root[data-theme='dark'] .challenge-list>button.selected),:global(:root[data-theme='dark'] .choice-grid label.selected){border-color:rgb(132 202 213 / 48%);background:rgb(50 102 112 / 36%)}
@media(max-width:900px){.challenge-workspace{grid-template-columns:1fr}.challenge-list{position:static;max-height:280px}.challenge-admin__heading{align-items:flex-start;flex-direction:column}}
@media(max-width:600px){.field-grid{grid-template-columns:1fr}.field-grid .wide{grid-column:auto}.editor-title,.section-heading{align-items:flex-start;flex-direction:column}.choice-grid{grid-template-columns:1fr}.editor-actions{display:flex;justify-content:space-between;flex-wrap:wrap}.editor-actions>span{display:none}}
.autosave-status{display:flex;max-width:620px;align-items:center;justify-content:flex-end;gap:7px;margin:0;color:var(--admin-muted);font-size:.78rem;font-weight:750;text-align:right}.autosave-status>i{width:9px;height:9px;flex:0 0 auto;border-radius:50%;background:#4d967c}.autosave-status.is-dirty>i,.autosave-status.is-saving>i{background:#d29a2e}.autosave-status.is-saving>i{animation:challenge-autosave-pulse .9s ease-in-out infinite}.autosave-status.is-error{color:#9c342f}.autosave-status.is-error>i{background:#b94a42}.autosave-status button{padding:0;border:0;color:var(--admin-blue);background:transparent;font:inherit;text-decoration:underline;cursor:pointer}@keyframes challenge-autosave-pulse{50%{opacity:.3}}
.challenge-list__items>button{cursor:grab}.challenge-list__items>button:active{cursor:grabbing}.challenge-list__items>button.dragging{opacity:.38}.challenge-list__items>button.drag-over{border-color:var(--admin-blue);box-shadow:0 3px 0 var(--admin-blue)}.drag-handle{flex:0 0 auto;color:#8aa2a9;font-size:1.05rem;font-weight:400;line-height:1}.challenge-list__items>button:hover .drag-handle{color:var(--admin-blue)}
.category-list>button{cursor:grab}.category-list>button:active{cursor:grabbing}.category-list>button.dragging{opacity:.38}.category-list>button.drag-over{border-color:var(--admin-blue);box-shadow:0 3px 0 var(--admin-blue)}.category-list>button:hover .drag-handle{color:var(--admin-blue)}
.challenge-list__group h2>button{min-height:44px}.challenge-list__group h2>button>span:first-child{justify-self:start;align-self:center;text-align:left}.category-list>button>span{flex:1;align-self:center;text-align:left}
.challenge-list__items>button>span{flex:1;align-items:start;text-align:left}.challenge-list__items>button>span>strong{justify-self:start;text-align:left}
</style>

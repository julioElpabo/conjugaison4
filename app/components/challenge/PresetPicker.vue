<script setup lang="ts">
import type { ChallengePreset } from '~~/shared/types/conjugation'

const props = defineProps<{
  presets: ChallengePreset[]
  activePresetId?: string
}>()

const emit = defineEmits<{
  select: [preset: ChallengePreset, randomCount?: number]
}>()

const groupLabels: Record<string, string> = {
  school: 'Niveaux scolaires',
  'verb-group': 'Groupes de verbes',
  spelling: 'Difficultés particulières',
  semantic: 'Sens des verbes',
  training: 'Entraînements'
}

const groupedPresets = computed(() => {
  const groups = new Map<string, ChallengePreset[]>()
  props.presets.forEach((preset) => {
    const current = groups.get(preset.group) ?? []
    current.push(preset)
    groups.set(preset.group, current)
  })
  return [...groups.entries()].map(([id, presets]) => ({
    id,
    label: groupLabels[id] ?? id,
    presets
  }))
})

const activeGroupId = ref('school')
const activeGroup = computed(() => (
  groupedPresets.value.find(group => group.id === activeGroupId.value)
  ?? groupedPresets.value[0]
))
const mobilePresetId = ref('')
const mobilePreset = computed(() => props.presets.find(preset => preset.id === mobilePresetId.value))

function selectMobilePreset(event: Event) {
  mobilePresetId.value = (event.target as HTMLSelectElement).value
  if (mobilePreset.value) {
    emit('select', mobilePreset.value)
  }
}

function onGroupKeydown(event: KeyboardEvent, index: number) {
  let nextIndex: number | undefined
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % groupedPresets.value.length
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + groupedPresets.value.length) % groupedPresets.value.length
  if (event.key === 'Home') nextIndex = 0
  if (event.key === 'End') nextIndex = groupedPresets.value.length - 1
  if (nextIndex === undefined) return

  event.preventDefault()
  const nextGroup = groupedPresets.value[nextIndex]
  if (!nextGroup) return
  activeGroupId.value = nextGroup.id
  nextTick(() => document.getElementById(`preset-tab-${nextGroup.id}`)?.focus())
}

function selectRandom(preset: ChallengePreset, count: number) {
  emit('select', preset, Math.min(count, preset.verbIds.length))
}
</script>

<template>
  <section class="preset-panel" aria-labelledby="presets-title">
    <div class="preset-panel__intro">
      <div>
        <p class="builder-card__eyebrow">Pour démarrer rapidement</p>
        <h2 id="presets-title">Défis prêts à l’emploi</h2>
      </div>
      <p>Choisissez un niveau ou une famille de verbes, puis ajustez librement la sélection.</p>
    </div>

    <label class="preset-mobile-select">
      <span>Choisir un défi prêt à l’emploi</span>
      <select :value="activePresetId ?? mobilePresetId" @change="selectMobilePreset">
        <option value="">Choisir un niveau ou un entraînement…</option>
        <optgroup v-for="group in groupedPresets" :key="group.id" :label="group.label">
          <option v-for="preset in group.presets" :key="preset.id" :value="preset.id">
            {{ preset.label }} — {{ preset.verbIds.length }} verbes
          </option>
        </optgroup>
      </select>
    </label>

    <div class="preset-groups" role="tablist" aria-label="Catégories de défis">
      <button
        v-for="(group, index) in groupedPresets"
        :id="`preset-tab-${group.id}`"
        :key="group.id"
        class="preset-group-button"
        :class="{ 'preset-group-button--active': activeGroup?.id === group.id }"
        type="button"
        role="tab"
        :aria-selected="activeGroup?.id === group.id"
        :aria-controls="`preset-content-${group.id}`"
        :tabindex="activeGroup?.id === group.id ? 0 : -1"
        @click="activeGroupId = group.id"
        @keydown="onGroupKeydown($event, index)"
      >
        {{ group.label }}
      </button>
    </div>

    <div
      v-if="activeGroup"
      :id="`preset-content-${activeGroup.id}`"
      class="preset-list"
      role="tabpanel"
      :aria-labelledby="`preset-tab-${activeGroup.id}`"
    >
      <article
        v-for="preset in activeGroup.presets"
        :key="preset.id"
        class="preset-card"
        :class="{ 'preset-card--active': activePresetId === preset.id }"
      >
        <button type="button" @click="emit('select', preset)">
          <strong>{{ preset.label }}</strong>
          <span>{{ preset.description }}</span>
          <small>{{ preset.verbIds.length }} verbes · {{ preset.questionCount }} questions</small>
        </button>
        <div v-if="preset.verbIds.length > 5" class="preset-card__random">
          Au hasard :
          <button type="button" @click="selectRandom(preset, 1)">1</button>
          <button type="button" @click="selectRandom(preset, 5)">5</button>
          <button type="button" @click="selectRandom(preset, 10)">10</button>
        </div>
      </article>
    </div>
  </section>
</template>

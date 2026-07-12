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

    <div class="preset-groups" role="tablist" aria-label="Catégories de défis">
      <button
        v-for="group in groupedPresets"
        :id="`preset-tab-${group.id}`"
        :key="group.id"
        class="preset-group-button"
        :class="{ 'preset-group-button--active': activeGroup?.id === group.id }"
        type="button"
        role="tab"
        :aria-selected="activeGroup?.id === group.id"
        :aria-controls="`preset-content-${group.id}`"
        @click="activeGroupId = group.id"
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

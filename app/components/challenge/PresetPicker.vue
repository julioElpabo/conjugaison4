<script setup lang="ts">
import { challengePresetGroupLabels, challengePresetGroupOrder } from '~~/shared/data/challenge-presets'
import type { ChallengePreset } from '~~/shared/types/conjugation'

const props = defineProps<{
  presets: ChallengePreset[]
  activePresetId?: string
  compact?: boolean
}>()

const emit = defineEmits<{
  select: [preset: ChallengePreset, randomCount?: number]
  stageChange: [stage: 'groups' | 'presets']
}>()

const groupedPresets = computed(() => {
  const groups = new Map<ChallengePreset['group'], ChallengePreset[]>()
  props.presets.forEach((preset) => {
    const current = groups.get(preset.group) ?? []
    current.push(preset)
    groups.set(preset.group, current)
  })
  return [...groups.entries()]
    .map(([id, presets]) => ({ id, label: challengePresetGroupLabels[id], presets }))
    .sort((left, right) => challengePresetGroupOrder.indexOf(left.id) - challengePresetGroupOrder.indexOf(right.id))
})

const activeGroupId = ref('school')
const activeGroup = computed(() => (
  groupedPresets.value.find(group => group.id === activeGroupId.value)
  ?? groupedPresets.value[0]
))
const mobilePresetId = ref('')
const mobilePreset = computed(() => props.presets.find(preset => preset.id === mobilePresetId.value))
const compactStage = ref<'groups' | 'presets'>('groups')
const compactTransitionName = ref<'preset-slide-forward' | 'preset-slide-back'>('preset-slide-forward')
const selectedCompactPresetId = ref<string | null>(null)
let compactTouchStartX: number | null = null

function openCompactGroup(groupId: string) {
  activeGroupId.value = groupId
  selectedCompactPresetId.value = null
  compactTransitionName.value = 'preset-slide-forward'
  compactStage.value = 'presets'
  emit('stageChange', 'presets')
}

function showCompactGroups() {
  selectedCompactPresetId.value = null
  compactTransitionName.value = 'preset-slide-back'
  compactStage.value = 'groups'
  emit('stageChange', 'groups')
}

function toggleCompactPreset(presetId: string) {
  selectedCompactPresetId.value = selectedCompactPresetId.value === presetId ? null : presetId
}

function selectCompactPreset(preset: ChallengePreset, randomCount?: number) {
  selectedCompactPresetId.value = null
  emit('select', preset, randomCount)
}

function onCompactTouchStart(event: TouchEvent) {
  compactTouchStartX = event.touches[0]?.clientX ?? null
}

function onCompactTouchEnd(event: TouchEvent) {
  const endX = event.changedTouches[0]?.clientX
  if (compactStage.value === 'presets' && compactTouchStartX !== null && endX !== undefined && endX - compactTouchStartX > 55) {
    showCompactGroups()
  }
  compactTouchStartX = null
}

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
  <section
    class="preset-panel"
    :class="{ 'preset-panel--compact': compact }"
    :aria-labelledby="compact ? undefined : 'presets-title'"
    :aria-label="compact ? 'Défis prêts à l’emploi' : undefined"
  >
    <div v-if="compact" class="preset-story">
      <div class="preset-story__viewport" :class="{ 'is-presets': compactStage === 'presets' }" @touchstart.passive="onCompactTouchStart" @touchend.passive="onCompactTouchEnd">
        <Transition :name="compactTransitionName" mode="out-in">
          <div v-if="compactStage === 'groups'" key="groups" class="preset-story__panel">
            <div class="preset-story__groups">
              <button v-for="group in groupedPresets" :key="group.id" type="button" @click="openCompactGroup(group.id)">
                <span>{{ group.label }}</span><span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <div v-else key="presets" class="preset-story__panel">
            <header class="preset-story__header preset-story__header--presets">
              <button type="button" @click="showCompactGroups">← Catégories</button>
              <strong class="preset-story__category-badge">{{ activeGroup?.label }}</strong>
            </header>
            <div class="preset-story__presets">
              <div
                v-for="preset in activeGroup?.presets ?? []"
                :key="preset.id"
                class="preset-story__preset-choice"
                :class="{ 'is-open': selectedCompactPresetId === preset.id }"
              >
                <button
                  type="button"
                  :class="{ 'is-active': activePresetId === preset.id || selectedCompactPresetId === preset.id }"
                  :aria-expanded="selectedCompactPresetId === preset.id"
                  @click="toggleCompactPreset(preset.id)"
                >
                  {{ preset.label }} <span aria-hidden="true">⌄</span>
                </button>
                <div v-if="selectedCompactPresetId === preset.id" class="preset-story__preset-menu" role="menu">
                  <button type="button" role="menuitem" @click="selectCompactPreset(preset)">Tous</button>
                  <button v-if="preset.verbIds.length >= 3" type="button" role="menuitem" @click="selectCompactPreset(preset, 3)">3 au hasard</button>
                  <button v-if="preset.verbIds.length >= 5" type="button" role="menuitem" @click="selectCompactPreset(preset, 5)">5 au hasard</button>
                  <button v-if="preset.verbIds.length >= 10" type="button" role="menuitem" @click="selectCompactPreset(preset, 10)">10 au hasard</button>
                </div>
              </div>
            </div>
            <p class="preset-story__gesture">Sur mobile, balaie vers la droite pour revenir.</p>
          </div>
        </Transition>
      </div>
    </div>

    <template v-else>
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
    </template>
  </section>
</template>

<style scoped>
.preset-panel--compact {
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.preset-story { display: grid; }
.preset-story__viewport { min-height: 113px; overflow: hidden; }
.preset-story__viewport.is-presets { min-height: 150px; overflow: visible; }
.preset-story__panel { display: grid; gap: 13px; }
.preset-story__header { display: flex; min-height: 34px; align-items: center; justify-content: space-between; gap: 12px; }
.preset-story__header strong { color: var(--brand-dark); font-size: 1rem; }
.preset-story__header > span { color: var(--muted); font-size: .8rem; font-weight: 750; }
.preset-story__header--presets { display: grid; grid-template-columns: auto 1fr; }
.preset-story__header--presets strong { text-align: center; }
.preset-story__header button { padding: 5px 9px; border: 0; border-radius: 8px; color: var(--brand-dark); background: var(--brand-pale); font-weight: 750; }
.preset-story__category-badge { justify-self: center; padding: 9px 14px; border: 1px solid #83afa4; border-radius: 12px; background: var(--brand-pale); box-shadow: inset 0 0 0 1px rgb(52 95 88 / 8%); }
.preset-story__groups { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 9px; }
.preset-story__groups button { display: flex; min-height: 52px; padding: 10px 13px; align-items: center; justify-content: space-between; gap: 8px; border: 1px solid var(--line); border-radius: 12px; color: var(--brand-dark); background: white; font-size: .93rem; font-weight: 400; text-align: left; }
.preset-story__groups button:hover { border-color: #83afa4; background: var(--brand-pale); }
.preset-story__groups button span:last-child { color: var(--brand); font-size: 1.1rem; }
.preset-story__presets { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 9px; }
.preset-story__preset-choice { position: relative; }
.preset-story__preset-choice.is-open { z-index: 4; }
.preset-story__preset-choice > button { width: auto; min-height: 40px; padding: 7px 13px; border: 1px solid var(--line); border-radius: 999px; color: var(--ink); background: white; font-size: .93rem; font-weight: 400; white-space: nowrap; }
.preset-story__preset-choice > button:hover, .preset-story__preset-choice > button.is-active { border-color: var(--brand); background: var(--brand-pale); }
.preset-story__preset-choice > button span { margin-left: 4px; color: var(--brand); }
.preset-story__preset-menu { position: absolute; z-index: 5; top: calc(100% + 5px); left: 50%; display: grid; width: max-content; min-width: 145px; padding: 6px; border: 1px solid #a9c4bc; border-radius: 11px; background: white; box-shadow: 0 12px 30px rgb(35 63 57 / 20%); transform: translateX(-50%); }
.preset-story__preset-menu button { padding: 8px 10px; border: 0; border-radius: 7px; color: var(--ink); background: white; font-size: .86rem; text-align: left; }
.preset-story__preset-menu button:hover, .preset-story__preset-menu button:focus-visible { background: var(--brand-pale); outline: 0; }
.preset-story__gesture { display: none; margin: 0; color: var(--muted); font-size: .75rem; text-align: center; }

.preset-slide-forward-enter-active,
.preset-slide-forward-leave-active,
.preset-slide-back-enter-active,
.preset-slide-back-leave-active { transition: opacity 170ms ease, transform 220ms cubic-bezier(.22, 1, .36, 1); }
.preset-slide-forward-enter-from { opacity: 0; transform: translateX(42px); }
.preset-slide-forward-leave-to { opacity: 0; transform: translateX(-42px); }
.preset-slide-back-enter-from { opacity: 0; transform: translateX(-42px); }
.preset-slide-back-leave-to { opacity: 0; transform: translateX(42px); }

@media (max-width: 700px) {
  .preset-story__viewport { min-height: 174px; }
  .preset-story__viewport.is-presets { min-height: 205px; }
  .preset-story__groups { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .preset-story__gesture { display: block; }
}

@media (max-width: 430px) {
  .preset-story__header--presets { grid-template-columns: 1fr auto; }
  .preset-story__header--presets strong { grid-column: 1 / -1; grid-row: 2; text-align: left; }
}

@media (prefers-reduced-motion: reduce) {
  .preset-slide-forward-enter-active,
  .preset-slide-forward-leave-active,
  .preset-slide-back-enter-active,
  .preset-slide-back-leave-active { transition: none; }
}
</style>

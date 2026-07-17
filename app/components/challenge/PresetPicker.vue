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
const compactGroupId = ref<string | null>(null)
const selectedCompactPresetId = ref<string | null>(null)
const compactGroup = computed(() => groupedPresets.value.find(group => group.id === compactGroupId.value))
const selectedCompactPreset = computed(() => props.presets.find(preset => preset.id === selectedCompactPresetId.value))
const compactBrowser = ref<HTMLElement | null>(null)

function revealCompactColumn(column: number) {
  nextTick(() => {
    const element = compactBrowser.value?.querySelector<HTMLElement>(`[data-browser-column="${column}"]`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' })
  })
}

function openCompactGroup(groupId: string) {
  compactGroupId.value = groupId
  selectedCompactPresetId.value = null
  emit('stageChange', 'presets')
  revealCompactColumn(2)
}

function openCompactPreset(presetId: string) {
  selectedCompactPresetId.value = presetId
  revealCompactColumn(3)
}

function selectCompactPreset(preset: ChallengePreset, randomCount?: number) {
  selectedCompactPresetId.value = null
  emit('select', preset, randomCount)
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
    <div v-if="compact" class="preset-browser">
      <div ref="compactBrowser" class="preset-browser__scroll">
        <div class="preset-browser__columns">
          <section class="preset-browser__column" data-browser-column="1" aria-labelledby="preset-browser-groups">
            <h3 id="preset-browser-groups">Catégories</h3>
            <div class="preset-browser__list">
              <button
                v-for="group in groupedPresets"
                :key="group.id"
                type="button"
                :class="{ 'is-selected': compactGroupId === group.id }"
                :aria-pressed="compactGroupId === group.id"
                @click="openCompactGroup(group.id)"
              >
                <span>{{ group.label }}</span><span class="preset-browser__chevron" aria-hidden="true">›</span>
              </button>
            </div>
          </section>

          <Transition name="browser-column">
            <section v-if="compactGroup" :key="compactGroup.id" class="preset-browser__column" data-browser-column="2" :aria-labelledby="`preset-browser-${compactGroup.id}`">
              <h3 :id="`preset-browser-${compactGroup.id}`">{{ compactGroup.label }}</h3>
              <div class="preset-browser__list">
                <button
                  v-for="preset in compactGroup.presets"
                  :key="preset.id"
                  type="button"
                  :class="{ 'is-selected': selectedCompactPresetId === preset.id || activePresetId === preset.id }"
                  :aria-pressed="selectedCompactPresetId === preset.id"
                  @click="openCompactPreset(preset.id)"
                >
                  <span><strong>{{ preset.label }}</strong></span>
                  <span class="preset-browser__chevron" aria-hidden="true">›</span>
                </button>
              </div>
            </section>
          </Transition>

          <Transition name="browser-column">
            <section v-if="selectedCompactPreset" :key="selectedCompactPreset.id" class="preset-browser__column preset-browser__column--quantity" data-browser-column="3" aria-labelledby="preset-browser-quantity">
              <h3 id="preset-browser-quantity">Nombre de verbes</h3>
              <p>{{ selectedCompactPreset.label }}</p>
              <div class="preset-browser__list">
                <button type="button" @click="selectCompactPreset(selectedCompactPreset)">
                  <span><strong>Tous les verbes</strong></span>
                  <span class="preset-browser__count">{{ selectedCompactPreset.verbIds.length }}</span>
                  <span class="preset-browser__launch" aria-hidden="true">→</span>
                </button>
                <button v-if="selectedCompactPreset.verbIds.length >= 3" type="button" @click="selectCompactPreset(selectedCompactPreset, 3)">
                  <span><strong>3 au hasard</strong></span>
                  <span class="preset-browser__count">3</span>
                  <span class="preset-browser__launch" aria-hidden="true">→</span>
                </button>
                <button v-if="selectedCompactPreset.verbIds.length >= 5" type="button" @click="selectCompactPreset(selectedCompactPreset, 5)">
                  <span><strong>5 au hasard</strong></span>
                  <span class="preset-browser__count">5</span>
                  <span class="preset-browser__launch" aria-hidden="true">→</span>
                </button>
                <button v-if="selectedCompactPreset.verbIds.length >= 10" type="button" @click="selectCompactPreset(selectedCompactPreset, 10)">
                  <span><strong>10 au hasard</strong></span>
                  <span class="preset-browser__count">10</span>
                  <span class="preset-browser__launch" aria-hidden="true">→</span>
                </button>
              </div>
            </section>
          </Transition>
        </div>
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

.preset-browser { display: grid; gap: 10px; }
.preset-browser__scroll { overflow-x: auto; overscroll-behavior-inline: contain; scrollbar-color: #9ab8b0 transparent; scrollbar-width: thin; }
.preset-browser__columns { display: grid; min-width: 100%; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: stretch; border: 1px solid var(--line); border-radius: 15px; background: white; box-shadow: inset 0 1px rgb(255 255 255 / 70%); }
.preset-browser__column { min-width: 0; min-height: 258px; padding: 11px; border-right: 1px solid var(--line); background: #fbfdfc; }
.preset-browser__column:first-child { border-radius: 14px 0 0 14px; }
.preset-browser__column:last-child { border-right: 0; border-radius: 0 14px 14px 0; }
.preset-browser__column h3 { margin: 0; padding: 4px 8px 10px; color: var(--muted); font-size: .74rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
.preset-browser__column--quantity > p { margin: -2px 8px 9px; color: var(--brand-dark); font-size: .9rem; font-weight: 800; }
.preset-browser__list { display: grid; align-content: start; gap: 4px; }
.preset-browser__list button { display: flex; width: 100%; min-height: 42px; padding: 8px 9px 8px 11px; align-items: center; justify-content: space-between; gap: 9px; border: 1px solid transparent; border-radius: 9px; color: var(--ink); background: transparent; font-size: .88rem; line-height: 1.15; text-align: left; }
.preset-browser__list button > span:first-child { display: grid; min-width: 0; gap: 2px; }
.preset-browser__list button strong { color: inherit; font-size: .9rem; line-height: 1.18; overflow-wrap: anywhere; white-space: normal; }
.preset-browser__list button small { color: var(--muted); font-size: .72rem; }
.preset-browser__list button:hover { border-color: #b8d3cb; background: #f0f7f4; }
.preset-browser__list button.is-selected { color: white; border-color: var(--brand); background: var(--brand); box-shadow: 0 5px 13px rgb(52 95 88 / 18%); }
.preset-browser__list button.is-selected small { color: #dbeae6; }
.preset-browser__chevron { flex: 0 0 auto; color: var(--brand); font-size: 1.35rem; line-height: 1; }
.preset-browser__list button.is-selected .preset-browser__chevron { color: white; }
.preset-browser__count { display: grid; min-width: 28px; height: 24px; margin-left: auto; padding: 0 7px; place-items: center; border: 1px solid #d2ddda; border-radius: 999px; color: var(--muted); background: #edf2f0; font-size: .72rem; font-weight: 850; }
.preset-browser__launch { display: grid; width: 25px; height: 25px; flex: 0 0 25px; place-items: center; border-radius: 8px; color: white; background: var(--brand); font-weight: 850; }
.preset-browser__column--quantity .preset-browser__list button:hover { color: var(--brand-dark); border-color: #83afa4; background: var(--brand-pale); }
.browser-column-enter-active { transition: opacity 180ms ease, transform 260ms cubic-bezier(.22, 1, .36, 1); }
.browser-column-enter-from { opacity: 0; transform: translateX(24px); }

@media (max-width: 700px) {
  .preset-browser__columns { width: max-content; min-width: 100%; grid-template-columns: repeat(3, minmax(245px, 78vw)); }
  .preset-browser__column { min-height: 245px; }
}

@media (prefers-reduced-motion: reduce) {
  .browser-column-enter-active { transition: none; }
  .preset-browser__scroll { scroll-behavior: auto; }
}
</style>

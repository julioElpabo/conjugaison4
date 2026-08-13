<script setup lang="ts">
const { ui, uiLabel } = useLanguagePreferences()
import type {
  ConjugationMode,
  PastSimplePronouns,
  Tense,
  Verb
} from '~/composables/useChallengeBuilder'
import { conjugationTenseOrder } from '~~/shared/data/conjugation-display'
import { isNearFutureTense } from '~~/shared/utils/near-future'

const props = defineProps<{
  modes: ConjugationMode[]
  tenses: Tense[]
  verbs: Verb[]
  selectedIds: number[]
  pastSimplePronouns: PastSimplePronouns
  falcMode?: boolean
}>()

const emit = defineEmits<{
  toggle: [id: number]
  selectAll: []
  clear: []
  updatePastSimplePronouns: [value: PastSimplePronouns]
}>()

const selectedSet = computed(() => new Set(props.selectedIds))
const advancedModesOpen = ref(false)
// La restriction il / ils ne concerne que le passé simple.
const isPastSimple = (tense: Tense) => tense.name.toLocaleLowerCase('fr') === 'passé simple'

function toggleTense(tense: Tense) {
  const wasSelected = selectedSet.value.has(tense.id)
  emit('toggle', tense.id)
  if (wasSelected && isPastSimple(tense)) emit('updatePastSimplePronouns', 'all')
}

function updatePastSimplePronouns(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  emit('updatePastSimplePronouns', checked ? 'third-person-only' : 'all')
}
interface TenseExample {
  emphasis: string
  rest: string
}

const examples = ref<Record<number, TenseExample>>({})
const examplesLoading = ref(false)
const exampleVerbs = computed(() => {
  const withCod = props.verbs.filter(verb => verb.complementExample?.functionObject === 'cod')
  return withCod.length ? withCod : props.verbs
})
const exampleRequestKey = computed(() => (
  `${exampleVerbs.value.map(verb => verb.id).join(',')}|${props.tenses.map(tense => tense.id).join(',')}`
))
const groups = computed(() => props.modes
  .map((mode) => {
    const tenses = props.tenses
      .filter(tense => tense.modeId === mode.id)
      .sort((left, right) => conjugationTenseOrder(mode.name, left.name) - conjugationTenseOrder(mode.name, right.name) || left.id - right.id)
    const trailingTenses = tenses.filter(tense => isNearFutureTense(tense))
    const columnTenses = tenses.filter(tense => !isNearFutureTense(tense))
    return {
      mode,
      tenses,
      columns: [
        columnTenses.filter(tense => !tense.isCompound),
        columnTenses.filter(tense => tense.isCompound)
      ].filter(column => column.length > 0),
      trailingTenses,
    }
  })
  .filter(group => group.tenses.length > 0))
const basicModeNames = new Set(['indicatif', 'impératif'])
const basicGroups = computed(() => groups.value.filter(group => basicModeNames.has(group.mode.name.toLocaleLowerCase('fr'))))
const advancedGroups = computed(() => groups.value.filter(group => !basicModeNames.has(group.mode.name.toLocaleLowerCase('fr'))))
const visibleGroups = computed(() => props.falcMode
  ? [...basicGroups.value, ...(advancedModesOpen.value ? advancedGroups.value : [])]
  : groups.value)

watch(() => props.falcMode, () => { advancedModesOpen.value = false })

let exampleRequest = 0
async function loadExamples() {
  const request = ++exampleRequest
  examples.value = {}
  if (!exampleVerbs.value.length || !props.tenses.length) return
  examplesLoading.value = true
  try {
    const response = await $fetch<{ examples: Record<number, TenseExample> }>('/api/tense-examples', {
      method: 'POST',
      body: {
        verbIds: exampleVerbs.value.map(verb => verb.id),
        tenseIds: props.tenses.map(tense => tense.id),
      },
    })
    if (request === exampleRequest) examples.value = response.examples
  } catch {
    if (request === exampleRequest) examples.value = {}
  } finally {
    if (request === exampleRequest) examplesLoading.value = false
  }
}

onMounted(loadExamples)
watch(exampleRequestKey, () => void loadExamples())
</script>

<template>
  <section class="builder-card tense-picker" aria-labelledby="tenses-title">
    <div class="builder-card__header">
      <div>
        <p class="builder-card__eyebrow">{{ ui('Étape 2') }}</p>
        <h2 id="tenses-title">{{ ui('Mes temps') }}</h2>
      </div>
      <span class="count-badge" :aria-label="`${selectedIds.length} temps sélectionnés`">
        {{ selectedIds.length }}
      </span>
    </div>

    <div v-if="!falcMode" class="selection-toolbar">
      <button class="text-button" type="button" @click="emit('selectAll')"> {{ ui('Tout cocher') }} </button>
      <button class="text-button text-button--danger" type="button" @click="emit('clear')"> {{ ui('Tout décocher') }} </button>
    </div>

    <div class="tense-groups">
      <section v-for="group in visibleGroups" :key="group.mode.id" class="tense-group" role="group" :aria-labelledby="`tense-mode-${group.mode.id}`">
        <h3 :id="`tense-mode-${group.mode.id}`" class="tense-group__title">{{ uiLabel(group.mode.name) }}</h3>
        <div class="tense-group__columns" :class="{ 'tense-group__columns--single': group.columns.length === 1 }">
          <div v-for="(column, columnIndex) in group.columns" :key="columnIndex" class="tense-group__column">
            <div class="tense-group__items">
              <template v-for="tense in column" :key="tense.id">
                <div class="tense-entry">
              <div class="tense-row">
                <span class="tense-info">
                  <button
                    type="button"
                    :aria-label="`${ui('Voir un exemple :')} ${uiLabel(tense.name)}`"
                    :aria-describedby="`tense-example-${tense.id}`"
                  >i</button>
                  <span :id="`tense-example-${tense.id}`" class="tense-tooltip" role="tooltip">
                    <template v-if="examples[tense.id]"> {{ ui('Exemple:') }} <strong>{{ examples[tense.id]!.emphasis }}</strong><template v-if="examples[tense.id]!.rest"> {{ examples[tense.id]!.rest }}</template>
                    </template>
                    <template v-else>{{ examplesLoading ? ui('Chargement…') : ui('Exemple momentanément indisponible.') }}</template>
                  </span>
                </span>
                <label class="switch-row">
                  <input
                    type="checkbox"
                    :checked="selectedSet.has(tense.id)"
                    @change="toggleTense(tense)"
                  >
                  <span class="switch-row__control" aria-hidden="true" />
                  <span>{{ uiLabel(tense.name) }}</span>
                </label>
              </div>

              <Transition name="past-simple-option">
                <div
                  v-if="isPastSimple(tense) && selectedSet.has(tense.id)"
                  class="past-simple-option"
                >
                  <label class="past-simple-option__choice">
                    <input
                      type="checkbox"
                      :checked="pastSimplePronouns === 'third-person-only'"
                      @change="updatePastSimplePronouns"
                    >
                    <span>
                      <strong>{{ ui('Uniquement il / ils') }}</strong>
                    </span>
                  </label>
                </div>
              </Transition>

                </div>
              </template>
            </div>
          </div>
        </div>
        <div v-if="group.trailingTenses.length" class="tense-group__trailing">
          <div v-for="tense in group.trailingTenses" :key="tense.id" class="tense-entry">
            <div class="tense-row">
              <span class="tense-info">
                <button
                  type="button"
                  :aria-label="`${ui('Voir un exemple :')} ${uiLabel(tense.name)}`"
                  :aria-describedby="`tense-example-${tense.id}`"
                >i</button>
                <span :id="`tense-example-${tense.id}`" class="tense-tooltip" role="tooltip">
                  <template v-if="examples[tense.id]"> {{ ui('Exemple:') }} <strong>{{ examples[tense.id]!.emphasis }}</strong><template v-if="examples[tense.id]!.rest"> {{ examples[tense.id]!.rest }}</template>
                  </template>
                  <template v-else>{{ examplesLoading ? ui('Chargement…') : ui('Exemple momentanément indisponible.') }}</template>
                </span>
              </span>
              <label class="switch-row">
                <input
                  type="checkbox"
                  :checked="selectedSet.has(tense.id)"
                  @change="toggleTense(tense)"
                >
                <span class="switch-row__control" aria-hidden="true" />
                <span>{{ uiLabel(tense.name) }}</span>
              </label>
            </div>
          </div>
        </div>
      </section>
      <button
        v-if="falcMode && advancedGroups.length"
        class="advanced-modes-button"
        type="button"
        :aria-expanded="advancedModesOpen"
        @click="advancedModesOpen = !advancedModesOpen"
      >
        {{ advancedModesOpen ? ui('Masquer les autres modes') : ui('Voir les autres modes') }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.tense-group__columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 14px;
  align-items: start;
}

.tense-group__columns--single { grid-template-columns: 1fr; }

.advanced-modes-button {
  justify-self: center;
  padding: 7px 12px;
  color: var(--muted);
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface-soft);
  cursor: pointer;
  font-size: .8rem;
  font-weight: 750;
}

.tense-group__trailing {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgb(82 104 98 / 18%);
}

.tense-group__title {
  margin: 0 0 10px;
  color: #526862;
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .11em;
  text-transform: uppercase;
}

.tense-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.tense-row .switch-row {
  flex: 1;
}

.past-simple-option {
  overflow: hidden;
}

.past-simple-option__choice {
  display: flex;
  margin: 8px 0 2px 28px;
  padding: 9px 11px;
  align-items: flex-start;
  gap: 9px;
  color: #4b4433;
  border: 1px solid color-mix(in srgb, var(--tense-accent) 55%, #d8d2c3);
  border-radius: 10px;
  background: color-mix(in srgb, var(--tense-accent) 12%, white);
  cursor: pointer;
  font-size: .78rem;
  line-height: 1.3;
}

.past-simple-option__choice input {
  width: 16px;
  height: 16px;
  margin: 1px 0 0;
  flex: 0 0 auto;
  accent-color: var(--brand);
}

.past-simple-option__choice span {
  display: block;
}

.past-simple-option-enter-active,
.past-simple-option-leave-active {
  max-height: 76px;
  opacity: 1;
  transform: translateY(0);
  transition: max-height 240ms ease, opacity 180ms ease, transform 240ms ease;
}

.past-simple-option-enter-from,
.past-simple-option-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
}

.tense-info {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
}

.tense-info > button {
  display: grid;
  width: 20px;
  height: 20px;
  padding: 0;
  place-items: center;
  color: var(--brand);
  background: #eef7f4;
  border: 1px solid #9dbdb4;
  border-radius: 50%;
  font-family: Georgia, serif;
  font-size: .76rem;
  font-weight: 800;
  line-height: 1;
}

.tense-tooltip {
  position: absolute;
  z-index: 40;
  bottom: calc(100% + 8px);
  left: -8px;
  width: max-content;
  max-width: none;
  padding: 9px 11px;
  visibility: hidden;
  color: white;
  background: #233f3a;
  border-radius: 9px;
  box-shadow: 0 10px 28px rgb(24 54 47 / 24%);
  font-size: .78rem;
  line-height: 1.4;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transform: translateY(4px);
  transition: opacity 140ms ease, transform 140ms ease, visibility 140ms;
}

.tense-tooltip strong {
  margin-right: .28em;
  font-weight: 800;
  letter-spacing: .018em;
}

.tense-tooltip::after {
  position: absolute;
  top: 100%;
  left: 13px;
  border: 6px solid transparent;
  border-top-color: #233f3a;
  content: '';
}

.tense-info:hover .tense-tooltip,
.tense-info:focus-within .tense-tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .tense-tooltip,
  .past-simple-option-enter-active,
  .past-simple-option-leave-active {
    transition: none;
  }
}

@media (max-width: 520px) {
  .tense-group__columns { grid-template-columns: 1fr; }
  .tense-group__column + .tense-group__column { margin-top: 22px; }
}
</style>

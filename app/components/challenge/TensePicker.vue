<script setup lang="ts">
import type {
  ConjugationMode,
  PastSimplePronouns,
  Tense,
  Verb
} from '~/composables/useChallengeBuilder'

const props = defineProps<{
  modes: ConjugationMode[]
  tenses: Tense[]
  verbs: Verb[]
  selectedIds: number[]
  pastSimplePronouns: PastSimplePronouns
}>()

const emit = defineEmits<{
  toggle: [id: number]
  selectAll: []
  clear: []
  updatePastSimplePronouns: [value: PastSimplePronouns]
}>()

const selectedSet = computed(() => new Set(props.selectedIds))
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
    const tenses = props.tenses.filter(tense => tense.modeId === mode.id)
    return {
      mode,
      tenses,
      columns: [
        tenses.filter(tense => !tense.isCompound),
        tenses.filter(tense => tense.isCompound)
      ].filter(column => column.length > 0)
    }
  })
  .filter(group => group.tenses.length > 0))

function isPastSimple(tense: Tense) {
  return tense.name.trim().toLocaleLowerCase('fr').normalize('NFC') === 'passé simple'
}

function onPastSimplePronounsChange(event: Event) {
  const value = (event.target as HTMLInputElement).value as PastSimplePronouns
  emit('updatePastSimplePronouns', value)
}

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
        <p class="builder-card__eyebrow">Étape 2</p>
        <h2 id="tenses-title">Mes temps</h2>
      </div>
      <span class="count-badge" :aria-label="`${selectedIds.length} temps sélectionnés`">
        {{ selectedIds.length }}
      </span>
    </div>

    <div class="selection-toolbar">
      <button class="text-button" type="button" @click="emit('selectAll')">
        Tout cocher
      </button>
      <button class="text-button text-button--danger" type="button" @click="emit('clear')">
        Tout décocher
      </button>
    </div>

    <div class="tense-groups">
      <section v-for="group in groups" :key="group.mode.id" class="tense-group" role="group" :aria-labelledby="`tense-mode-${group.mode.id}`">
        <h3 :id="`tense-mode-${group.mode.id}`" class="tense-group__title">{{ group.mode.name }}</h3>
        <div class="tense-group__columns" :class="{ 'tense-group__columns--single': group.columns.length === 1 }">
          <div v-for="(column, columnIndex) in group.columns" :key="columnIndex" class="tense-group__column">
            <div class="tense-group__items">
              <template v-for="tense in column" :key="tense.id">
                <div class="tense-entry">
              <div class="tense-row">
                <span class="tense-info">
                  <button
                    type="button"
                    :aria-label="`Voir un exemple au ${tense.name}`"
                    :aria-describedby="`tense-example-${tense.id}`"
                  >i</button>
                  <span :id="`tense-example-${tense.id}`" class="tense-tooltip" role="tooltip">
                    <template v-if="examples[tense.id]">
                      Exemple: <strong>{{ examples[tense.id]!.emphasis }}</strong><template v-if="examples[tense.id]!.rest"> {{ examples[tense.id]!.rest }}</template>
                    </template>
                    <template v-else>{{ examplesLoading ? 'Chargement…' : 'Exemple momentanément indisponible.' }}</template>
                  </span>
                </span>
                <label class="switch-row">
                  <input
                    type="checkbox"
                    :checked="selectedSet.has(tense.id)"
                    @change="emit('toggle', tense.id)"
                  >
                  <span class="switch-row__control" aria-hidden="true" />
                  <span>{{ tense.name }}</span>
                </label>
              </div>

              <Transition name="past-simple-options">
                <div v-if="isPastSimple(tense) && selectedSet.has(tense.id)" class="past-simple-options">
                  <fieldset class="inline-choice">
                    <legend>Au passé simple et au passé antérieur</legend>
                    <label>
                      <input type="radio" name="past-simple-pronouns" value="all" :checked="pastSimplePronouns === 'all'" @change="onPastSimplePronounsChange">
                      Tous les pronoms
                    </label>
                    <label>
                      <input type="radio" name="past-simple-pronouns" value="third-person-only" :checked="pastSimplePronouns === 'third-person-only'" @change="onPastSimplePronounsChange">
                      Seulement il / elle et ils / elles
                    </label>
                  </fieldset>
                </div>
              </Transition>
                </div>
              </template>
            </div>
          </div>
        </div>
      </section>
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

.past-simple-options {
  max-height: 220px;
  overflow: hidden;
}

.past-simple-options .inline-choice {
  margin: 2px 0 4px 44px;
  padding: 12px;
}

.past-simple-options-enter-active,
.past-simple-options-leave-active {
  transition: max-height 240ms ease, opacity 180ms ease, transform 240ms ease;
}

.past-simple-options-enter-from,
.past-simple-options-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-7px);
}

@media (prefers-reduced-motion: reduce) {
  .tense-tooltip,
  .past-simple-options-enter-active,
  .past-simple-options-leave-active {
    transition: none;
  }
}

@media (max-width: 520px) {
  .tense-group__columns { grid-template-columns: 1fr; }
  .tense-group__column + .tense-group__column { margin-top: 22px; }
}
</style>

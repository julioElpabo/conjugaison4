<script setup lang="ts">
const { ui } = useLanguagePreferences()
import type { ExerciseQuestion } from '~~/shared/types/conjugation'
import { isPassivizableInfinitive } from '~~/shared/utils/passive-voice'
import type { ComplementOption, ExerciseKind, IdentificationSource, VoiceMode, Verb } from '~/composables/useChallengeBuilder'

const props = defineProps<{
  questionCount: number
  exerciseKind: ExerciseKind
  identificationSource: IdentificationSource
  inclusivePronouns: boolean
  includeOnPronoun: boolean
  voiceMode: VoiceMode
  complementOptions: ComplementOption[]
  complementVerbs?: Verb[]
  eyebrow?: string
  idPrefix?: string
  gridLayout?: boolean
  conjugationInstruction?: string
  conjugationQuestionContext?: string
  conjugationQuestion?: string
  conjugationExample?: string
  conjugationExamplePrefix?: string
  conjugationExampleEmphasis?: string
  conjugationExampleSuffix?: string
  conjugationLiteraryCitation?: ExerciseQuestion['literaryCitation']
  conjugationExampleLoading?: boolean
  revealPrefilledOptions?: boolean
}>()

const emit = defineEmits<{
  updateQuestionCount: [value: number]
  updateExerciseKind: [value: ExerciseKind]
  updateIdentificationSource: [value: IdentificationSource]
  updateInclusivePronouns: [value: boolean]
  updateIncludeOnPronoun: [value: boolean]
  updateVoiceMode: [value: VoiceMode]
  updateComplementOptions: [value: ComplementOption[]]
  prefilledOptionsRevealStart: []
}>()

const complementsOpen = ref(Boolean(props.gridLayout))
const selectedComplementVerbs = computed(() => (props.complementVerbs ?? []).filter(verb => Boolean(verb.complementExample)))
const complementsAvailable = computed(() => (
  props.exerciseKind === 'conjugation'
  && props.voiceMode !== 'passive'
  && selectedComplementVerbs.value.length > 0
))
const passiveAvailable = computed(() => (props.complementVerbs ?? []).some(verb => (
  !verb.isPronominalForm
  && isPassivizableInfinitive(verb.infinitif)
  && verb.complementFunctions?.includes('cod')
)))
const codAvailable = computed(() => selectedComplementVerbs.value.some(verb => verb.complementFunctions?.includes('cod') || verb.complementExample?.functionObject === 'cod'))
const coiAvailable = computed(() => selectedComplementVerbs.value.some(verb => verb.complementFunctions?.includes('coi') || verb.complementExample?.functionObject === 'coi'))
const codBeforeAvailable = computed(() => selectedComplementVerbs.value.some(verb => verb.anteposableComplementFunctions?.includes('cod') || Boolean(verb.complementExample?.before)))
const coiBeforeAvailable = computed(() => selectedComplementVerbs.value.some(verb => verb.anteposableComplementFunctions?.includes('coi')))
const idPrefix = computed(() => props.idPrefix ?? 'challenge-options')
const optionsTitleId = computed(() => `${idPrefix.value}-title`)
const questionCountId = computed(() => `${idPrefix.value}-question-count`)
const exerciseKindName = computed(() => `${idPrefix.value}-exercise-kind`)
const voiceModeName = computed(() => `${idPrefix.value}-voice-mode`)
const identificationSourceName = computed(() => `${idPrefix.value}-identification-source`)
const complementPanelId = computed(() => `${idPrefix.value}-complement-panel`)
const hasConjugationExample = computed(() => Boolean(
  (props.conjugationInstruction || props.conjugationQuestionContext || props.conjugationQuestion)
  && props.conjugationExample,
))
const identificationQuestion = computed(() => {
  const question = props.conjugationQuestion?.trim() ?? ''
  return question && !/[.!?]$/u.test(question) ? `${question}.` : question
})
const exampleRevealStage = ref(0)
const exampleRevealTimers: ReturnType<typeof setTimeout>[] = []
const displayedQuestionCount = ref(props.questionCount)
const displayedComplementOptions = ref<ComplementOption[]>([...props.complementOptions])
const prefilledRevealRunning = ref(false)
const optionsLayout = ref<HTMLElement | null>(null)
let questionCountAnimationFrame: number | undefined
let masonryLayoutFrame: number | undefined
let masonryResizeObserver: ResizeObserver | undefined
let masonryMutationObserver: MutationObserver | undefined
const prefilledRevealTimers: ReturnType<typeof setTimeout>[] = []

function layoutMasonry() {
  masonryLayoutFrame = undefined
  if (!props.gridLayout || !optionsLayout.value) return

  const cards = optionsLayout.value.querySelectorAll<HTMLElement>('.option-group-card, .complement-options, .conjugation-example')
  cards.forEach((card) => {
    masonryResizeObserver?.observe(card)
    if (getComputedStyle(card).display === 'none') {
      card.style.removeProperty('grid-row-end')
      return
    }
    card.style.gridRowEnd = `span ${Math.ceil(card.getBoundingClientRect().height + 16)}`
  })
}

function scheduleMasonryLayout() {
  if (!import.meta.client || masonryLayoutFrame !== undefined) return
  masonryLayoutFrame = requestAnimationFrame(layoutMasonry)
}

function initializeMasonry() {
  if (!props.gridLayout || !optionsLayout.value || !import.meta.client) return
  masonryResizeObserver = new ResizeObserver(scheduleMasonryLayout)
  masonryMutationObserver = new MutationObserver(scheduleMasonryLayout)
  masonryMutationObserver.observe(optionsLayout.value, { childList: true, subtree: true })
  window.addEventListener('resize', scheduleMasonryLayout)
  scheduleMasonryLayout()
}

function clearPrefilledRevealTimers() {
  if (questionCountAnimationFrame !== undefined) {
    cancelAnimationFrame(questionCountAnimationFrame)
    questionCountAnimationFrame = undefined
  }
  while (prefilledRevealTimers.length) clearTimeout(prefilledRevealTimers.pop())
}

function finishPrefilledReveal() {
  clearPrefilledRevealTimers()
  displayedQuestionCount.value = props.questionCount
  displayedComplementOptions.value = [...props.complementOptions]
  prefilledRevealRunning.value = false
}

function revealPrefilledOptions() {
  if (!import.meta.client || prefilledRevealRunning.value) return
  emit('prefilledOptionsRevealStart')
  clearPrefilledRevealTimers()

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finishPrefilledReveal()
    return
  }

  const targetCount = Math.max(0, props.questionCount)
  const targetOptions = [...props.complementOptions]
  const duration = 500
  const startedAt = performance.now()
  prefilledRevealRunning.value = true
  displayedQuestionCount.value = 0
  displayedComplementOptions.value = []

  const animateCount = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration)
    displayedQuestionCount.value = Math.round(targetCount * progress)
    if (progress < 1) questionCountAnimationFrame = requestAnimationFrame(animateCount)
    else questionCountAnimationFrame = undefined
  }
  questionCountAnimationFrame = requestAnimationFrame(animateCount)

  targetOptions.forEach((option, index) => {
    prefilledRevealTimers.push(setTimeout(() => {
      displayedComplementOptions.value = [...displayedComplementOptions.value, option]
    }, Math.round((index / targetOptions.length) * duration)))
  })
  prefilledRevealTimers.push(setTimeout(finishPrefilledReveal, duration))
}

function clearExampleRevealTimers() {
  while (exampleRevealTimers.length) clearTimeout(exampleRevealTimers.pop())
}

watch(
  () => props.conjugationExampleLoading,
  (loading) => {
    clearExampleRevealTimers()
    exampleRevealStage.value = 0
    if (loading) return
    exampleRevealTimers.push(
      setTimeout(() => { exampleRevealStage.value = 1 }, 80),
      setTimeout(() => { exampleRevealStage.value = 2 }, 280),
    )
  },
  { immediate: true },
)

watch(() => props.questionCount, value => {
  if (!prefilledRevealRunning.value) displayedQuestionCount.value = value
})

watch(() => props.complementOptions, value => {
  if (!prefilledRevealRunning.value) displayedComplementOptions.value = [...value]
}, { deep: true })

watch(() => props.revealPrefilledOptions, reveal => {
  if (reveal) revealPrefilledOptions()
})

onMounted(() => {
  if (props.revealPrefilledOptions) revealPrefilledOptions()
  initializeMasonry()
})

onBeforeUnmount(() => {
  clearExampleRevealTimers()
  clearPrefilledRevealTimers()
  if (masonryLayoutFrame !== undefined) cancelAnimationFrame(masonryLayoutFrame)
  masonryResizeObserver?.disconnect()
  masonryMutationObserver?.disconnect()
  if (import.meta.client) window.removeEventListener('resize', scheduleMasonryLayout)
})

function onQuestionCountChange(event: Event) {
  if (prefilledRevealRunning.value) finishPrefilledReveal()
  const rawValue = (event.target as HTMLInputElement).value
  if (rawValue === '') return
  const value = Number(rawValue)
  if (!Number.isFinite(value)) return
  emit('updateQuestionCount', Math.min(99, Math.max(1, Math.round(value))))
}

function onExerciseKindChange(event: Event) {
  const exerciseKind = (event.target as HTMLInputElement).value as ExerciseKind
  emit('updateExerciseKind', exerciseKind)
}

function toggleComplementOption(option: ComplementOption, checked: boolean) {
  if (prefilledRevealRunning.value) finishPrefilledReveal()
  const next = new Set(props.complementOptions)
  if (checked) next.add(option)
  else next.delete(option)
  emit('updateComplementOptions', [...next])
}

watch(complementsAvailable, (available) => {
  if (!available) complementsOpen.value = false
  else if (props.gridLayout) complementsOpen.value = true
}, { immediate: true })

watch(passiveAvailable, (available) => {
  if (!available && props.voiceMode !== 'active') emit('updateVoiceMode', 'active')
}, { immediate: true })

</script>

<template>
  <section
    class="builder-card options-card"
    :class="{ 'options-card--grid': gridLayout, 'options-card--revealing': prefilledRevealRunning }"
    :aria-labelledby="optionsTitleId"
  >
    <div class="builder-card__header">
      <div>
        <p class="builder-card__eyebrow">{{ eyebrow ?? 'Étape 3' }}</p>
        <h2 :id="optionsTitleId">{{ ui('Mes options') }}</h2>
      </div>
    </div>

    <div ref="optionsLayout" class="options-layout" :class="{ 'options-layout--columns': gridLayout }">
      <div class="options-fields" :class="{ 'options-fields--columns': gridLayout }">
      <div class="options-main-column">
        <div class="option-group-card option-group-card--questions">
          <label class="field-stack question-count-field" :for="questionCountId">
            <span>{{ ui('Nombre de questions') }}</span>
            <input
              :id="questionCountId"
              type="number"
              inputmode="numeric"
              min="1"
              max="99"
              step="1"
              :value="displayedQuestionCount"
              @input="onQuestionCountChange"
            >
          </label>
        </div>

        <fieldset class="option-fieldset option-group-card option-group-card--pronouns">
          <legend>{{ ui('Pronoms') }}</legend>
          <label class="check-row">
            <input
              type="checkbox"
              :checked="inclusivePronouns"
              @change="emit('updateInclusivePronouns', ($event.target as HTMLInputElement).checked)"
            >
            <span> {{ ui('Inclure les pronoms') }} <strong>iel / iels</strong>
              <small>{{ ui('Ils apparaîtront ponctuellement dans les questions.') }}</small>
            </span>
          </label>

          <label class="check-row">
            <input
              type="checkbox"
              :checked="includeOnPronoun"
              @change="emit('updateIncludeOnPronoun', ($event.target as HTMLInputElement).checked)"
            >
            <span> {{ ui('Inclure le pronom') }} <strong>on</strong>
              <small>{{ ui('Il apparaîtra ponctuellement dans les questions à la troisième personne du singulier.') }}</small>
            </span>
          </label>
        </fieldset>

        <fieldset class="option-fieldset option-group-card option-group-card--exercise">
          <legend>{{ ui('Type d’exercice') }}</legend>
          <div class="segmented-control">
            <label>
              <input
                type="radio"
                :name="exerciseKindName"
                value="conjugation"
                :checked="exerciseKind === 'conjugation'"
                @change="onExerciseKindChange"
              >
              <span>{{ ui('Conjuguer') }}</span>
            </label>
            <label>
              <input
                type="radio"
                :name="exerciseKindName"
                value="tense-identification"
                :checked="exerciseKind === 'tense-identification'"
                @change="onExerciseKindChange"
              >
              <span>{{ ui('Trouver le mode et le temps') }}</span>
            </label>
          </div>

          <Transition name="identification-options">
            <div
              v-if="exerciseKind === 'tense-identification'"
              class="identification-source-panel"
            >
              <div class="segmented-control segmented-control--stacked">
                <label>
                  <input
                    type="radio"
                    :name="identificationSourceName"
                    value="selected-verbs"
                    :checked="identificationSource === 'selected-verbs'"
                    @change="emit('updateIdentificationSource', 'selected-verbs')"
                  >
                  <span>
                    <strong>{{ ui('Avec mes verbes') }}</strong>
                    <small>{{ ui('Formes conjuguées simples, sans citation.') }}</small>
                  </span>
                </label>
                <label>
                  <input
                    type="radio"
                    :name="identificationSourceName"
                    value="literary-corpus"
                    :checked="identificationSource === 'literary-corpus'"
                    @change="emit('updateIdentificationSource', 'literary-corpus')"
                  >
                  <span>
                    <strong>{{ ui('Avec n’importe quel verbe') }}</strong>
                    <small>{{ ui('Construits avec des phrases littéraires.') }}</small>
                  </span>
                </label>
              </div>
            </div>
          </Transition>
        </fieldset>

        <fieldset
          class="option-fieldset option-group-card option-group-card--voice voice-mode-fieldset"
          :class="{ 'option-group-card--disabled': exerciseKind !== 'conjugation' }"
          :disabled="exerciseKind !== 'conjugation'"
        >
          <legend>{{ ui('Voix du verbe') }}</legend>
          <div class="segmented-control segmented-control--stacked">
            <label>
              <input
                type="radio"
                :name="voiceModeName"
                value="active"
                :checked="voiceMode === 'active'"
                @change="emit('updateVoiceMode', 'active')"
              >
              <span><strong>{{ ui('Active uniquement') }}</strong></span>
            </label>
            <label>
              <input
                type="radio"
                :name="voiceModeName"
                value="passive"
                :checked="voiceMode === 'passive'"
                :disabled="!passiveAvailable"
                @change="emit('updateVoiceMode', 'passive')"
              >
              <span>
                <strong>{{ ui('Passive uniquement') }}</strong>
                <small>{{ ui('Le COD devient le sujet de la phrase.') }}</small>
              </span>
            </label>
            <label>
              <input
                type="radio"
                :name="voiceModeName"
                value="mixed"
                :checked="voiceMode === 'mixed'"
                :disabled="!passiveAvailable"
                @change="emit('updateVoiceMode', 'mixed')"
              >
              <span>
                <strong>{{ ui('Active et passive') }}</strong>
                <small>{{ ui('Les deux voix alterneront dans le défi.') }}</small>
              </span>
            </label>
          </div>
          <small v-if="!passiveAvailable" class="field-hint">{{ ui('Aucun verbe sélectionné ne possède de COD validé.') }}</small>
        </fieldset>

      </div>

      <div
        class="complement-options"
        data-tour="options-complements"
        :class="{
          'complement-options--disabled': !complementsAvailable,
        }"
      >
      <h3 v-if="gridLayout" class="complement-options__title">{{ ui('Compléments d’objets :') }}</h3>
      <p v-if="gridLayout" class="complement-options__description">{{ ui('Ajoute des compléments d’objets directs ou indirects.') }}</p>
      <button
        v-else
        class="complement-options__trigger"
        type="button"
        :disabled="!complementsAvailable"
        :aria-expanded="complementsOpen"
        :aria-controls="complementPanelId"
        @click="complementsOpen = !complementsOpen"
      >
        <span>{{ ui('Compléments d’objets :') }} <small>{{ ui('nouveau') }}</small></span>
        <span aria-hidden="true">{{ complementsOpen ? '−' : '+' }}</span>
      </button>
      <p v-if="!complementsAvailable" class="complement-options__unavailable">
        {{ exerciseKind !== 'conjugation'
          ? ui('Disponible uniquement pour un exercice de conjugaison.')
          : voiceMode === 'passive'
            ? ui('Au passif, le COD devient le sujet : ces options ne s’appliquent pas.')
          : ui('Les verbes choisis ne proposent pas de complément.') }}
      </p>

      <Transition name="complement-panel">
        <fieldset v-if="gridLayout || complementsOpen" :id="complementPanelId" class="complement-options__panel">
          <legend class="sr-only">{{ ui('Présentation des compléments d’objets') }}</legend>
          <label>
            <input type="checkbox" :disabled="!complementsAvailable || !codAvailable" :checked="displayedComplementOptions.includes('cod-after')" @change="toggleComplementOption('cod-after', ($event.target as HTMLInputElement).checked)">
            <span><strong>{{ ui('COD placé après') }}</strong></span>
          </label>
          <label>
            <input type="checkbox" :disabled="!complementsAvailable || !codBeforeAvailable" :checked="displayedComplementOptions.includes('cod-before')" @change="toggleComplementOption('cod-before', ($event.target as HTMLInputElement).checked)">
            <span><strong>{{ ui('COD placé avant') }}</strong></span>
          </label>
          <label>
            <input type="checkbox" :disabled="!complementsAvailable || !coiAvailable" :checked="displayedComplementOptions.includes('coi-after')" @change="toggleComplementOption('coi-after', ($event.target as HTMLInputElement).checked)">
            <span><strong>{{ ui('COI placé après') }}</strong></span>
          </label>
          <label>
            <input type="checkbox" :disabled="!complementsAvailable || !coiBeforeAvailable" :checked="displayedComplementOptions.includes('coi-before')" @change="toggleComplementOption('coi-before', ($event.target as HTMLInputElement).checked)">
            <span><strong>{{ ui('COI placé avant') }}</strong></span>
          </label>
        </fieldset>
      </Transition>
      </div>
    </div>

    <div
      v-if="gridLayout && (conjugationExampleLoading || hasConjugationExample)"
      class="conjugation-example"
      data-tour="options-preview"
      :class="{ 'conjugation-example--wide': exerciseKind === 'tense-identification' }"
      aria-live="polite"
      aria-atomic="true"
    >
      <div class="conjugation-example__header">
        <span class="conjugation-example__preview-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
        <div class="conjugation-example__heading">
          <span>{{ ui('Aperçu d’une question') }}</span>
        </div>
      </div>

      <div class="conjugation-example__screen">
        <div v-if="conjugationExampleLoading" class="conjugation-example__loading" role="status">
          <span class="conjugation-example__spinner" aria-hidden="true" />
          <span class="sr-only">{{ ui('Préparation de l’aperçu') }}</span>
        </div>

        <div v-else class="conjugation-example__body">
          <Transition name="example-item">
            <div v-if="exampleRevealStage >= 1" class="conjugation-example__question">
              <span class="conjugation-example__block-label">{{ ui('Exemple de question') }}</span>
              <template v-if="exerciseKind === 'tense-identification' && conjugationInstruction && conjugationQuestion">
                <p class="conjugation-example__instruction">{{ conjugationInstruction }}</p>
                <blockquote v-if="conjugationLiteraryCitation" class="conjugation-example__citation">
                  <p><span>{{ conjugationLiteraryCitation.before }}</span><mark>{{ conjugationLiteraryCitation.target }}</mark><span>{{ conjugationLiteraryCitation.after }}</span></p>
                  <footer>
                    {{ conjugationLiteraryCitation.author }}, <cite>{{ conjugationLiteraryCitation.work }}</cite>
                  </footer>
                </blockquote>
                <p v-else class="conjugation-example__question-line">
                  <span class="conjugation-example__prompt">{{ identificationQuestion }}</span>
                </p>
              </template>
              <template v-else>
                <p v-if="conjugationInstruction" class="conjugation-example__instruction">{{ conjugationInstruction }}</p>
                <p v-if="conjugationQuestionContext" class="conjugation-example__question-line">
                  <span class="conjugation-example__context">{{ conjugationQuestionContext }}</span>
                </p>
              </template>
            </div>
          </Transition>

          <Transition name="example-item">
            <div v-if="exampleRevealStage >= 2" class="conjugation-example__correction">
              <span>{{ ui('Réponse attendue') }}</span>
              <p>
                <template v-if="conjugationExampleEmphasis">
                  <span>{{ conjugationExamplePrefix }}</span><strong>{{ conjugationExampleEmphasis }}</strong><span>{{ conjugationExampleSuffix }}</span>
                </template>
                <span v-else>{{ conjugationExample }}</span>
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
    </div>

  </section>
</template>

<style scoped>
.options-card--grid { padding-bottom: 0; }
.options-layout--columns { display: grid; padding: 24px; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-auto-flow: row dense; grid-auto-rows: 1px; column-gap: 16px; }
.options-layout--columns > .options-fields { display: contents; }
.options-layout--columns > .options-fields > .options-main-column { display: contents; }
.options-main-column { display: grid; align-content: start; gap: 12px; }
.options-layout:not(.options-layout--columns) .options-main-column { padding: 0 18px; }
.options-main-column > * { margin: 0; }
.options-layout--columns :is(.option-group-card, .complement-options, .conjugation-example) { display: block; width: 100%; min-width: 0; margin: 0 0 16px; align-self: start; }
.options-layout--columns .option-group-card--questions,
.options-layout--columns .option-group-card--voice { grid-column: 1; }
.options-layout--columns .option-group-card--pronouns,
.options-layout--columns > .conjugation-example { grid-column: 2; }
.options-layout--columns .option-group-card--exercise,
.options-layout--columns .complement-options { grid-column: 3; }
.option-group-card { min-width: 0; padding: 15px; border: 1px solid #c8d8d3; border-radius: 13px; background: #fbfdfc; box-shadow: 0 3px 10px rgb(46 67 62 / 5%); }
.option-group-card > legend { padding: 0 5px; color: var(--brand-dark); font-size: .78rem; font-weight: 850; letter-spacing: .055em; text-transform: uppercase; }
.option-group-card .check-row { margin: 0; padding: 9px 0; }
.option-group-card .check-row + .check-row { margin-top: 5px; padding-top: 14px; border-top: 1px solid #dce6e2; }
.option-group-card .segmented-control { margin-top: 4px; }
.option-group-card--questions .field-stack { margin: 0; }
.identification-source-panel { max-width: calc(100% - 18px); margin: 12px 0 0 18px; overflow: hidden; }
.option-group-card--disabled,
.complement-options--disabled { filter: grayscale(.35); opacity: .55; }
.identification-options-enter-active,
.identification-options-leave-active { max-height: 240px; transition: max-height 260ms ease, opacity 210ms ease, transform 210ms ease, margin-top 260ms ease, padding-top 260ms ease; }
.identification-options-enter-from,
.identification-options-leave-to { max-height: 0; margin-top: 0; padding-top: 0; opacity: 0; transform: translateY(-8px); }
.segmented-control--stacked { padding: 7px; grid-template-columns: 1fr; gap: 9px; background: #e7efec; }
.segmented-control--stacked label > span { position: relative; min-height: 62px; padding: 10px 13px 10px 46px; align-content: center; justify-items: start; gap: 2px; background: #f8fbfa; border: 2px solid #b7c9c3; box-shadow: 0 2px 5px rgb(46 67 62 / 8%); text-align: left; transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease, background 150ms ease; }
.segmented-control--stacked label > span::before { position: absolute; left: 15px; top: 50%; width: 18px; height: 18px; content: ''; border: 2px solid #78918a; border-radius: 50%; background: white; box-shadow: inset 0 0 0 4px white; transform: translateY(-50%); }
.segmented-control--stacked label:hover > span { border-color: var(--brand); box-shadow: 0 5px 12px rgb(46 96 80 / 14%); transform: translateY(-1px); }
.segmented-control--stacked input:checked + span { color: var(--brand-dark); background: #f0faf6; border-color: var(--brand); box-shadow: 0 0 0 2px rgb(35 126 96 / 13%), 0 5px 12px rgb(46 96 80 / 12%); }
.segmented-control--stacked input:checked + span::before { border-color: var(--brand); background: var(--brand); }
.segmented-control--stacked small { color: var(--muted); font-size: .68rem; font-weight: 600; }
.question-count-field { display: grid; grid-template-columns: minmax(0, 1fr) 62px; grid-template-rows: 46px; align-items: center; gap: 0 10px; }
.question-count-field > span:first-child { display: flex; height: 46px; align-items: center; line-height: 1.2; }
.question-count-field > input { width: 62px; min-width: 0; height: 46px; padding-inline: 8px 5px; align-self: center; text-align: center; }
.field-hint { display: block; margin-top: 6px; color: var(--muted); font-size: .72rem; }
.conjugation-example { margin: 10px 24px 28px; padding: 20px; overflow: hidden; border: 2px solid #aa94c5; border-radius: 20px; background: linear-gradient(145deg, #f6f2fb, #f0eaf8 62%, #eae2f4); box-shadow: 0 12px 30px rgb(77 55 105 / 12%); color: var(--brand-dark); }
.options-layout--columns > .conjugation-example { border-radius: 15px; }
.conjugation-example__header { display: grid; min-height: 62px; margin-bottom: 17px; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 13px; }
.conjugation-example__preview-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 50%; color: #695284; background: #e3d9f0; box-shadow: 0 0 0 6px rgb(105 82 132 / 8%); font-size: 1.05rem; }
.conjugation-example__preview-icon svg { width: 23px; height: 23px; }
.conjugation-example__heading { display: grid; gap: 2px; }
.conjugation-example__heading > span { color: #695284; font-size: 1.08rem; font-weight: 850; letter-spacing: .025em; text-transform: uppercase; }
.conjugation-example__screen { color: var(--brand-dark); }
.conjugation-example__block-label,
.conjugation-example__correction > span { color: var(--muted); font-size: .7rem; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
.conjugation-example__loading { display: grid; min-height: 180px; place-content: center; place-items: center; gap: 14px; color: var(--muted); text-align: center; }
.conjugation-example__spinner { width: 38px; height: 38px; border: 4px solid #d5e4df; border-top-color: var(--brand); border-radius: 50%; animation: example-spinner 700ms linear infinite; }
.conjugation-example__body { display: grid; align-content: start; gap: 26px; }
.conjugation-example__question { display: grid; padding: 15px 17px; gap: 8px; border: 1px solid #c9d9d5; border-radius: 12px; background: rgb(255 255 255 / 62%); }
.conjugation-example__question p { margin: 0; }
.conjugation-example__instruction { color: var(--brand-dark); font-size: 1.08rem; font-weight: 850; }
.conjugation-example__question-line { display: flex; align-items: center; flex-wrap: wrap; gap: 7px 10px; }
.conjugation-example__context { color: var(--muted); font-size: .86rem; font-weight: 700; }
.conjugation-example__question-separator { color: #9bb0aa; font-weight: 700; }
.conjugation-example__prompt { color: var(--ink); font-size: 1.25rem; font-weight: 800; letter-spacing: .025em; line-height: 1.45; }
.conjugation-example__question-line .conjugation-example__prompt { font-size: 1.05rem; }
.conjugation-example__citation { display: grid; margin: 4px 0 0; gap: 7px; }
.conjugation-example__citation p { color: var(--ink); font-size: 1.08rem; font-weight: 750; line-height: 1.55; }
.conjugation-example__citation mark { padding: 1px 4px; border-radius: 4px; color: #4b3563; background: #eadcf8; box-decoration-break: clone; font-weight: 900; }
.conjugation-example__citation footer { color: var(--muted); font-size: .72rem; font-weight: 700; }
.conjugation-example__correction { display: grid; padding: 15px 17px; gap: 8px; border: 1px solid #acd1bb; border-radius: 12px; background: rgb(255 255 255 / 62%); }
.conjugation-example__correction p { margin: 0; color: var(--success); font-size: 1.05rem; font-weight: 400; line-height: 1.4; white-space: pre-wrap; }
.conjugation-example__correction p > span { color: inherit; font: inherit; font-weight: 400; letter-spacing: normal; text-transform: none; }
.conjugation-example__correction strong { color: var(--success); font-size: inherit; font-weight: 850; letter-spacing: .025em; }
.example-item-enter-active { transition: opacity 230ms ease, transform 230ms ease; }
.example-item-enter-from { opacity: 0; transform: translateY(10px); }
@keyframes example-spinner { to { transform: rotate(360deg); } }
@keyframes prefilled-option-check {
  0% { opacity: .25; transform: scale(.55); }
  70% { transform: scale(1.18); }
  100% { opacity: 1; transform: scale(1); }
}
.complement-options { margin-bottom: 18px; }
.options-layout--columns .complement-options { padding: 18px; border: 1px solid #bfd2cc; border-radius: 15px; background: #fbfdfc; }
.complement-options__title { margin: 0 0 12px; color: var(--brand-dark); font-size: 1rem; font-weight: 800; }
.complement-options__description { margin: -5px 0 12px; color: var(--muted); font-size: .82rem; line-height: 1.4; }
.complement-options__trigger { display: flex; width: 100%; min-height: 48px; padding: 10px 13px; align-items: center; justify-content: space-between; gap: 12px; color: var(--brand-dark); background: var(--brand-pale); border: 1px solid #a9c9bf; border-radius: 11px; font-weight: 850; text-align: left; }
.complement-options__trigger:disabled { cursor: not-allowed; filter: grayscale(.65); opacity: .55; }
.complement-options--disabled { background: #f3f5f4; }
.complement-options__unavailable { margin: 10px 3px 0; color: var(--muted); font-size: .82rem; line-height: 1.35; }
.complement-options__trigger > span:first-child { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.complement-options__trigger small { padding: 3px 7px; color: white; background: var(--brand); border-radius: 999px; font-size: .62rem; font-weight: 900; letter-spacing: .06em; line-height: 1; text-transform: uppercase; }
.complement-options__trigger > span:last-child { font-size: 1.25rem; font-weight: 500; }
.complement-options__panel { display: grid; margin: 8px 0 0; padding: 8px; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; border: 1px solid var(--line); border-radius: 12px; }
.options-fields--columns .complement-options__panel { grid-template-columns: 1fr; }
.complement-options__panel label { display: flex; min-width: 0; padding: 9px; align-items: flex-start; gap: 8px; border: 1px solid #d6e2de; border-radius: 9px; background: #f9fbfa; }
.complement-options__panel input { margin-top: 3px; }
.options-card--revealing .complement-options__panel input:checked { animation: prefilled-option-check 220ms cubic-bezier(.2, .9, .3, 1); }
.complement-options__panel label > span { display: grid; min-width: 0; gap: 2px; }
.complement-options__panel strong { color: var(--brand-dark); font-size: .92rem; }
.complement-options__panel label:has(input:disabled) { opacity: .5; }
.complement-options__panel small { color: var(--muted); font-size: .9rem; line-height: 1.45; }
.complement-options__panel small b { color: var(--ink); font-weight: 800; }
.complement-panel-enter-active, .complement-panel-leave-active { transition: opacity 160ms ease, transform 160ms ease; }
.complement-panel-enter-from, .complement-panel-leave-to { opacity: 0; transform: translateY(-5px); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 620px) {
  .options-layout--columns { padding: 19px 14px; grid-template-columns: 1fr; }
  .options-layout--columns :is(.option-group-card, .complement-options, .conjugation-example) { grid-column: 1; }
  .options-layout--columns > .conjugation-example { padding: 15px; }
}
@media (min-width: 621px) and (max-width: 820px) {
  .options-layout--columns { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .options-layout--columns .option-group-card--questions,
  .options-layout--columns .option-group-card--exercise,
  .options-layout--columns .complement-options { grid-column: 1; }
  .options-layout--columns .option-group-card--pronouns,
  .options-layout--columns .option-group-card--voice,
  .options-layout--columns > .conjugation-example { grid-column: 2; }
}
@media (max-width: 520px) { .complement-options__panel { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) {
  .complement-panel-enter-active,
  .complement-panel-leave-active,
  .identification-options-enter-active,
  .identification-options-leave-active,
  .example-item-enter-active { transition: none; }
  .conjugation-example__spinner { animation-duration: 1.4s; }
  .options-card--revealing .complement-options__panel input:checked { animation: none; }
}
</style>

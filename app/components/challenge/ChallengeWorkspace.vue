<script setup lang="ts">
const { ui, localePath } = useLanguagePreferences()
import type { ChallengePreset, ComplementOption, ExerciseQuestion, LearnerExerciseTrackingContext } from '~~/shared/types/conjugation'
import { legacyComplementConfig, legacyComplementOptions } from '~~/shared/utils/complement-options'
import { challengePresetTrackingDescription, challengePresetTrackingTitle } from '~~/shared/utils/challenge-preset-tracking'
import ChallengeActions from './ChallengeActions.vue'
import ChallengeOptions from './ChallengeOptions.vue'
import LoadChallengeDialog from './LoadChallengeDialog.vue'
import PresetPicker from './PresetPicker.vue'
import PrintPreview from './PrintPreview.vue'
import ShareChallengeDialog from './ShareChallengeDialog.vue'
import TensePicker from './TensePicker.vue'
import VerbPicker from './VerbPicker.vue'
import ChatExercise from '../exercise/ChatExercise.vue'
import ClassicExercise from '../exercise/ClassicExercise.vue'
import CoachPicker from '../exercise/CoachPicker.vue'
import type { CoachProfile } from '~~/shared/types/coach'
import { getChallengeErrorMessage, useChallengeBuilder } from '~/composables/useChallengeBuilder'
import { useChallengeApi } from '~/composables/useChallengeApi'
import '~/assets/css/main.css'

const props = defineProps<{
  initialCode?: string
}>()

const {
  catalogue,
  challenge,
  catalogueStatus,
  catalogueError,
  selectedVerbs,
  selectedTenses,
  isReady,
  loadCatalogue,
  addVerb,
  removeVerb,
  clearVerbs,
  toggleTense,
  selectAllTenses,
  clearTenses,
  applySelection,
  applySharedChallenge
} = useChallengeBuilder()
const api = useChallengeApi()
const { track } = useSiteAnalytics()
const requestUrl = useRequestURL()

const busyAction = ref<'exercise' | 'print' | 'save' | 'load' | null>(null)
const actionError = ref('')
const notice = ref('')
const loadError = ref('')
const activePresetId = ref<string>()
const sourcePresetId = ref<string>()
const sourcePresetRandomCount = ref<number | null>(null)
const questions = ref<ExerciseQuestion[]>([])
const printQuestions = ref<ExerciseQuestion[]>([])
const shareCode = ref('')
const shareTitle = ref('')
const shareDescription = ref('')
const shareError = ref('')
const savedChallengeTitle = ref('')
const savedChallengeDescription = ref('')
const isExerciseOpen = ref(false)
const exercisePresentation = ref<'classic' | 'chat'>('classic')
const isPrintOpen = ref(false)
const isShareOpen = ref(false)
const isLoadOpen = ref(false)
const isCoachPickerOpen = ref(false)
const selectedCoach = ref<CoachProfile | null>(null)
const exerciseTracking = ref<LearnerExerciseTrackingContext>()
const chatExerciseVerbs = computed(() => {
  if (challenge.value.identificationSource !== 'literary-corpus'
    || challenge.value.exerciseKind !== 'tense-identification') return selectedVerbs.value
  const questionVerbIds = new Set(questions.value.map(question => Number(question.verbeId)))
  const literaryVerbs = catalogue.value.verbes.filter(verb => questionVerbIds.has(verb.id))
  return literaryVerbs.length ? literaryVerbs : selectedVerbs.value
})
const identificationTenses = computed(() => {
  const modes = new Map(catalogue.value.modes.map(mode => [mode.id, mode]))
  return catalogue.value.temps.map(tense => ({ ...tense, mode: tense.mode || modes.get(tense.modeId) }))
})
const complementPlacementLabel = computed(() => ({
  after: ui('toujours après'),
  mixed: ui('parfois avant'),
  before: ui('avant si possible')
}[challenge.value.complementPlacement]))
function updateComplementOptions(options: ComplementOption[]) {
  const legacy = legacyComplementConfig(options)
  challenge.value.complementOptions = options
  challenge.value.includeComplements = legacy.includeComplements
  challenge.value.complementPlacement = legacy.complementPlacement
  markAsCustom()
}
const shareUrl = computed(() => shareCode.value
  ? new URL(localePath(`/defi/${encodeURIComponent(shareCode.value)}`), requestUrl.origin).toString()
  : '')

function logUsage(event: 'homepage' | 'print' | 'challenge-save' | 'challenge-load' | 'exercise') {
  if (import.meta.server) return
  const detailedEvent = { homepage: 'homepage', print: 'print_opened', 'challenge-save': 'challenge_save', 'challenge-load': 'challenge_load', exercise: 'exercise_started' } as const
  track(detailedEvent[event], event === 'exercise' ? { presentation: exercisePresentation.value, exerciseKind: challenge.value.exerciseKind } : undefined)
}

function exerciseUsageMetadata(presentation: 'classic' | 'chat') {
  return {
    feature: presentation === 'chat' ? 'exercise.chat' : 'exercise.classic',
    source: sourcePresetId.value ? 'preset' : props.initialCode ? 'code' : 'custom',
    ...(sourcePresetId.value ? { preset: sourcePresetId.value } : {}),
  }
}

onMounted(() => {
  logUsage('homepage')
  for (const feature of ['preset.library', 'builder.custom', 'challenge.load']) {
    track('feature_exposed', { feature })
  }
})
const launchFeaturesExposed = ref(false)
watch(isReady, (ready) => {
  if (!ready || launchFeaturesExposed.value || !import.meta.client) return
  launchFeaturesExposed.value = true
  for (const feature of ['exercise.classic', 'exercise.chat', 'print.preview', 'challenge.share']) {
    track('feature_exposed', { feature })
  }
})

try {
  await loadCatalogue()
} catch {
  // Le composable expose déjà une erreur présentable dans l'interface.
}

async function retryCatalogue() {
  try {
    await loadCatalogue(true)
  } catch {
    // L'état d'erreur est déjà mis à jour par le composable.
  }
}

if (props.initialCode && catalogueStatus.value === 'success') {
  await restoreChallenge(props.initialCode, false)
}

function clearMessages() {
  actionError.value = ''
  notice.value = ''
}

function markAsCustom() {
  activePresetId.value = undefined
  clearMessages()
}

function shuffledSample(ids: readonly number[], count: number) {
  const result = [...ids]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[randomIndex]] = [result[randomIndex]!, result[index]!]
  }
  return result.slice(0, count)
}

function selectPreset(preset: ChallengePreset, randomCount?: number) {
  applySelection({
    verbIds: randomCount ? shuffledSample(preset.verbIds, randomCount) : [...preset.verbIds],
    tenseIds: [...preset.tenseIds],
    questionCount: preset.questionCount
  })
  challenge.value.exerciseKind = preset.exerciseKind
  challenge.value.identificationSource = preset.identificationSource
  challenge.value.pastSimplePronouns = preset.pastSimplePronouns
  challenge.value.inclusivePronouns = preset.inclusivePronouns
  challenge.value.includeOnPronoun = preset.includeOnPronoun
  challenge.value.includeComplements = preset.includeComplements
  challenge.value.complementPlacement = preset.complementPlacement
  challenge.value.complementOptions = preset.complementOptions ?? legacyComplementOptions(preset.includeComplements, preset.complementPlacement)
  activePresetId.value = preset.id
  sourcePresetId.value = preset.id
  sourcePresetRandomCount.value = randomCount ?? null
  savedChallengeTitle.value = ''
  savedChallengeDescription.value = ''
  notice.value = randomCount
    ? `${randomCount} verbes ont été tirés au hasard dans « ${preset.label} ».`
    : `Le défi « ${preset.label} » est chargé.`
  actionError.value = ''
  track('challenge_preset_selected', { preset: preset.id, exerciseKind: preset.exerciseKind })
}

function beginExerciseTracking(presentation: 'classic' | 'chat') {
  const preset = catalogue.value.presets.find(candidate => candidate.id === sourcePresetId.value)
  exerciseTracking.value = createLearnerTrackingContext({
    challengeLabel: savedChallengeTitle.value
      || (preset ? challengePresetTrackingTitle(preset) : 'Défi personnalisé'),
    presentation,
    challenge: {
      description: savedChallengeDescription.value
        || (preset ? challengePresetTrackingDescription(sourcePresetRandomCount.value) : undefined),
      verbIds: [...challenge.value.verbIds],
      tenseIds: [...challenge.value.tenseIds],
      questionCount: challenge.value.questionCount,
      exerciseKind: challenge.value.exerciseKind,
      identificationSource: challenge.value.identificationSource,
      pastSimplePronouns: challenge.value.pastSimplePronouns,
      inclusivePronouns: challenge.value.inclusivePronouns,
      includeOnPronoun: challenge.value.includeOnPronoun,
      includeComplements: challenge.value.includeComplements,
      complementPlacement: challenge.value.complementPlacement,
      complementOptions: [...challenge.value.complementOptions],
    },
  })
}

async function prepareExercise(mode: 'classic' | 'chat') {
  if (!isReady.value) return
  if (!sourcePresetId.value) track('feature_selected', { feature: 'builder.custom' })
  if (mode === 'chat') {
    track('feature_selected', exerciseUsageMetadata('chat'))
    isCoachPickerOpen.value = true
    return
  }
  track('feature_selected', exerciseUsageMetadata('classic'))
  busyAction.value = 'exercise'
  clearMessages()
  try {
    questions.value = await api.generateQuestions(challenge.value)
    if (questions.value.length === 0) {
      throw new Error(ui('Aucune question ne correspond à cette sélection.'))
    }
    exercisePresentation.value = mode
    beginExerciseTracking(mode)
    track('exercise_started', exerciseUsageMetadata(mode))
    isExerciseOpen.value = true
  } catch (error) {
    track('feature_failed', exerciseUsageMetadata('classic'))
    actionError.value = getChallengeErrorMessage(error, ui('Impossible de préparer le questionnaire.'))
  } finally {
    busyAction.value = null
  }
}

async function launchWithCoach(coach: CoachProfile) {
  if (!isReady.value) return
  selectedCoach.value = coach
  track('coach_selected', { coach: coach.id })
  isCoachPickerOpen.value = false
  busyAction.value = 'exercise'
  clearMessages()
  try {
    questions.value = await api.generateQuestions(challenge.value)
    if (!questions.value.length) throw new Error(ui('Aucune question ne correspond à cette sélection.'))
    exercisePresentation.value = 'chat'
    beginExerciseTracking('chat')
    track('exercise_started', exerciseUsageMetadata('chat'))
    isExerciseOpen.value = true
  } catch (error) {
    track('feature_failed', exerciseUsageMetadata('chat'))
    actionError.value = getChallengeErrorMessage(error, ui('Impossible de préparer le questionnaire.'))
  } finally {
    busyAction.value = null
  }
}

async function regenerateChatQuestions() {
  const generated = await api.generateQuestions(challenge.value)
  if (!generated.length) throw new Error(ui('Aucune nouvelle question ne correspond à cette sélection.'))
  questions.value = generated
}

async function preparePrint() {
  if (!isReady.value) return
  track('feature_selected', { feature: 'print.preview' })
  busyAction.value = 'print'
  clearMessages()
  try {
    printQuestions.value = await api.generateQuestions(challenge.value)
    if (printQuestions.value.length === 0) {
      throw new Error(ui('Aucune question ne correspond à cette sélection.'))
    }
    isPrintOpen.value = true
    logUsage('print')
  } catch (error) {
    track('feature_failed', { feature: 'print.preview' })
    actionError.value = getChallengeErrorMessage(error, ui('Impossible de préparer la fiche à imprimer.'))
  } finally {
    busyAction.value = null
  }
}

function saveChallenge() {
  if (!isReady.value) return
  track('feature_selected', { feature: 'challenge.share' })
  const activePreset = catalogue.value.presets.find(preset => preset.id === activePresetId.value)
  shareCode.value = ''
  shareError.value = ''
  shareTitle.value = activePreset?.label || savedChallengeTitle.value || ui('Défi de conjugaison')
  shareDescription.value = savedChallengeDescription.value
  isShareOpen.value = true
}

async function createSharedChallenge(title: string, description: string) {
  busyAction.value = 'save'
  shareError.value = ''
  clearMessages()
  try {
    const result = await api.saveChallenge(challenge.value, title, description)
    shareCode.value = result.code
    shareTitle.value = title
    shareDescription.value = description
    savedChallengeTitle.value = title
    savedChallengeDescription.value = description
    logUsage('challenge-save')
  } catch (error) {
    track('feature_failed', { feature: 'challenge.share' })
    shareError.value = getChallengeErrorMessage(error, ui('Impossible de sauvegarder ce défi.'))
  } finally {
    busyAction.value = null
  }
}

async function restoreChallenge(code: string, closeDialog = true) {
  track('feature_selected', { feature: 'challenge.load' })
  busyAction.value = 'load'
  actionError.value = ''
  loadError.value = ''
  notice.value = ''
  try {
    const restored = await api.loadChallenge(code)
    applySharedChallenge(restored)
    savedChallengeTitle.value = restored.title || ''
    savedChallengeDescription.value = restored.description || ''
    activePresetId.value = undefined
    sourcePresetId.value = undefined
    sourcePresetRandomCount.value = null
    notice.value = `Le défi ${restored.code} est chargé.`
    logUsage('challenge-load')
    if (closeDialog) isLoadOpen.value = false
  } catch (error) {
    track('feature_failed', { feature: 'challenge.load' })
    const message = getChallengeErrorMessage(error, ui('Ce code ne correspond à aucun défi.'))
    if (closeDialog) loadError.value = message
    else actionError.value = message
  } finally {
    busyAction.value = null
  }
}

function onAddVerb(id: number) {
  markAsCustom()
  addVerb(id)
}

function onRemoveVerb(id: number) {
  markAsCustom()
  removeVerb(id)
}

function onToggleTense(id: number) {
  markAsCustom()
  toggleTense(id)
}
</script>

<template>
  <div class="challenge-page">
    <section class="challenge-hero">
      <p class="challenge-hero__eyebrow">{{ savedChallengeTitle ? ui('Défi partagé') : ui('Gratuit · sans publicité · personnalisable') }}</p>
      <h1>{{ savedChallengeTitle || ui('Crée ton défi de conjugaison') }}</h1>
      <p class="challenge-hero__shared-description">{{ savedChallengeDescription || ui('Choisis les verbes et les temps à travailler, puis exerce-toi en ligne ou imprime une fiche avec son corrigé.') }}</p>
    </section>

    <div class="challenge-shell">
      <div v-if="catalogueStatus === 'loading'" class="page-state" role="status">
        <span class="loader" aria-hidden="true" /> {{ ui('Chargement du catalogue de conjugaison…') }} </div>

      <div v-else-if="catalogueStatus === 'error'" class="page-state page-state--error" role="alert">
        <strong>{{ ui('Le catalogue n’a pas pu être chargé.') }}</strong>
        <span>{{ catalogueError }}</span>
        <button class="primary-button" type="button" @click="retryCatalogue">{{ ui('Réessayer') }}</button>
      </div>

      <template v-else>
        <p v-if="actionError" class="workspace-message workspace-message--error" role="alert">{{ actionError }}</p>
        <p v-else-if="notice" class="workspace-message workspace-message--success" aria-live="polite">{{ notice }}</p>

        <div class="challenge-restore">
          <span>{{ ui('Tu as reçu ou enregistré un défi ?') }}</span>
          <button class="text-button" type="button" :disabled="Boolean(busyAction)" @click="isLoadOpen = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg> {{ ui('Charger un défi avec son code') }} </button>
        </div>

        <PresetPicker
          :presets="catalogue.presets"
          :verbs="catalogue.verbes"
          :modes="catalogue.modes"
          :tenses="catalogue.temps"
          :active-preset-id="activePresetId"
          @select="selectPreset"
        />

        <div class="builder-grid">
          <VerbPicker
            :verbs="catalogue.verbes"
            :selected-ids="challenge.verbIds"
            @add="onAddVerb"
            @remove="onRemoveVerb"
            @clear="markAsCustom(); clearVerbs()"
          />

          <TensePicker
            :modes="catalogue.modes"
            :tenses="catalogue.temps"
            :verbs="selectedVerbs"
            :selected-ids="challenge.tenseIds"
            @toggle="onToggleTense"
            @select-all="markAsCustom(); selectAllTenses()"
            @clear="markAsCustom(); clearTenses()"
          />

          <ChallengeOptions
            :question-count="challenge.questionCount"
            :exercise-kind="challenge.exerciseKind"
            :identification-source="challenge.identificationSource"
            :inclusive-pronouns="challenge.inclusivePronouns"
            :include-on-pronoun="challenge.includeOnPronoun"
            :complement-options="challenge.complementOptions"
            :complement-verbs="selectedVerbs"
            @update-question-count="challenge.questionCount = $event; markAsCustom()"
            @update-exercise-kind="challenge.exerciseKind = $event"
            @update-identification-source="challenge.identificationSource = $event"
            @update-inclusive-pronouns="challenge.inclusivePronouns = $event"
            @update-include-on-pronoun="challenge.includeOnPronoun = $event"
            @update-complement-options="updateComplementOptions"
          />
        </div>

        <div class="challenge-summary" :class="{ 'challenge-summary--incomplete': !isReady }" aria-live="polite">
          <div>
            <p class="builder-card__eyebrow">{{ ui('Résumé de ton défi') }}</p>
            <strong v-if="isReady">
              {{ selectedVerbs.length }} {{ selectedVerbs.length === 1 ? ui('verbe') : ui('verbes') }} ·
              {{ selectedTenses.length }} {{ ui('temps') }} ·
              {{ challenge.questionCount }} {{ challenge.questionCount === 1 ? ui('question') : ui('questions') }} </strong>
            <strong v-else>{{ ui('Ton défi n’est pas encore complet') }}</strong>
          </div>
          <p v-if="!isReady">{{ ui('Sélectionne au moins un verbe et un temps pour pouvoir le lancer.') }}</p>
          <p v-else>
            {{ challenge.exerciseKind === 'conjugation' ? ui('Conjuguer les formes demandées') : ui('Trouver le mode et le temps') }}
            <template v-if="challenge.exerciseKind === 'conjugation' && challenge.includeComplements">
              · {{ ui('avec compléments,') }} {{ complementPlacementLabel }}
            </template>
          </p>
        </div>

        <ChallengeActions
          class="challenge-actions--bottom"
          :ready="isReady"
          :busy-action="busyAction"
          @exercise="prepareExercise"
          @print="preparePrint"
          @save="saveChallenge"
        />
      </template>
    </div>

    <ClassicExercise
      v-if="isExerciseOpen && exercisePresentation === 'classic'"
      :questions="questions"
      :exercise-kind="challenge.exerciseKind"
      :identification-tenses="identificationTenses"
      :tracking-context="exerciseTracking"
      :analytics-metadata="exerciseUsageMetadata('classic')"
      @close="isExerciseOpen = false"
    />

    <ChatExercise
      v-if="isExerciseOpen && exercisePresentation === 'chat' && selectedCoach"
      :questions="questions"
      :exercise-kind="challenge.exerciseKind"
      :coach="selectedCoach"
      :verbs="chatExerciseVerbs"
      :tenses="selectedTenses"
      :identification-tenses="identificationTenses"
      :regenerate-questions="regenerateChatQuestions"
      :tracking-context="exerciseTracking"
      :analytics-metadata="exerciseUsageMetadata('chat')"
      @close="isExerciseOpen = false"
    />

    <CoachPicker
      v-if="isCoachPickerOpen"
      @close="isCoachPickerOpen = false"
      @select="launchWithCoach"
    />

    <PrintPreview
      v-if="isPrintOpen"
      :questions="printQuestions"
      :verbs="selectedVerbs"
      :tenses="selectedTenses"
      :exercise-kind="challenge.exerciseKind"
      :options="challenge.printOptions"
      @update-options="challenge.printOptions = $event"
      @close="isPrintOpen = false"
    />

    <ShareChallengeDialog
      v-if="isShareOpen"
      :code="shareCode"
      :url="shareUrl"
      :busy="busyAction === 'save'"
      :error="shareError"
      :initial-title="shareTitle"
      :initial-description="shareDescription"
      @close="isShareOpen = false"
      @save="createSharedChallenge"
    />

    <LoadChallengeDialog
      v-if="isLoadOpen"
      :busy="busyAction === 'load'"
      :error="loadError"
      @close="isLoadOpen = false; loadError = ''"
      @load="restoreChallenge"
    />
  </div>
</template>

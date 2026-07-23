<script setup lang="ts">
const { ui, localePath } = useLanguagePreferences()
import type { ChallengePreset, ComplementOption, ExerciseQuestion } from '~~/shared/types/conjugation'
import { legacyComplementConfig, legacyComplementOptions } from '~~/shared/utils/complement-options'
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
const questions = ref<ExerciseQuestion[]>([])
const printQuestions = ref<ExerciseQuestion[]>([])
const shareCode = ref('')
const isExerciseOpen = ref(false)
const exercisePresentation = ref<'classic' | 'chat'>('classic')
const isPrintOpen = ref(false)
const isShareOpen = ref(false)
const isLoadOpen = ref(false)
const isCoachPickerOpen = ref(false)
const selectedCoach = ref<CoachProfile | null>(null)
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

onMounted(() => logUsage('homepage'))

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
  challenge.value.pastSimplePronouns = preset.pastSimplePronouns
  challenge.value.inclusivePronouns = preset.inclusivePronouns
  challenge.value.includeComplements = preset.includeComplements
  challenge.value.complementPlacement = preset.complementPlacement
  challenge.value.complementOptions = preset.complementOptions ?? legacyComplementOptions(preset.includeComplements, preset.complementPlacement)
  activePresetId.value = preset.id
  notice.value = randomCount
    ? `${randomCount} verbes ont été tirés au hasard dans « ${preset.label} ».`
    : `Le défi « ${preset.label} » est chargé.`
  actionError.value = ''
  track('challenge_preset_selected', { preset: preset.id, exerciseKind: preset.exerciseKind })
}

async function prepareExercise(mode: 'classic' | 'chat') {
  if (!isReady.value) return
  if (mode === 'chat') {
    isCoachPickerOpen.value = true
    return
  }
  busyAction.value = 'exercise'
  clearMessages()
  try {
    questions.value = await api.generateQuestions(challenge.value)
    if (questions.value.length === 0) {
      throw new Error(ui('Aucune question ne correspond à cette sélection.'))
    }
    exercisePresentation.value = mode
    isExerciseOpen.value = true
    logUsage('exercise')
  } catch (error) {
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
    isExerciseOpen.value = true
    logUsage('exercise')
  } catch (error) {
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
    actionError.value = getChallengeErrorMessage(error, ui('Impossible de préparer la fiche à imprimer.'))
  } finally {
    busyAction.value = null
  }
}

async function saveChallenge() {
  if (!isReady.value) return
  busyAction.value = 'save'
  clearMessages()
  try {
    const result = await api.saveChallenge(challenge.value)
    shareCode.value = result.code
    isShareOpen.value = true
    logUsage('challenge-save')
  } catch (error) {
    actionError.value = getChallengeErrorMessage(error, ui('Impossible de sauvegarder ce défi.'))
  } finally {
    busyAction.value = null
  }
}

async function restoreChallenge(code: string, closeDialog = true) {
  busyAction.value = 'load'
  actionError.value = ''
  loadError.value = ''
  notice.value = ''
  try {
    const restored = await api.loadChallenge(code)
    applySharedChallenge(restored)
    activePresetId.value = undefined
    notice.value = `Le défi ${restored.code} est chargé.`
    logUsage('challenge-load')
    if (closeDialog) isLoadOpen.value = false
  } catch (error) {
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
      <p class="challenge-hero__eyebrow">{{ ui('Gratuit · sans publicité · personnalisable') }}</p>
      <h1>{{ ui('Crée ton défi de conjugaison') }}</h1>
      <p>{{ ui('Choisis les verbes et les temps à travailler, puis exerce-toi en ligne ou imprime une fiche avec son corrigé.') }}</p>
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
            :inclusive-pronouns="challenge.inclusivePronouns"
            :complement-options="challenge.complementOptions"
            :complement-verbs="selectedVerbs"
            @update-question-count="challenge.questionCount = $event; markAsCustom()"
            @update-exercise-kind="challenge.exerciseKind = $event"
            @update-inclusive-pronouns="challenge.inclusivePronouns = $event"
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
      @close="isExerciseOpen = false"
    />

    <ChatExercise
      v-if="isExerciseOpen && exercisePresentation === 'chat' && selectedCoach"
      :questions="questions"
      :coach="selectedCoach"
      :verbs="selectedVerbs"
      :tenses="selectedTenses"
      :regenerate-questions="regenerateChatQuestions"
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
      @close="isShareOpen = false"
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

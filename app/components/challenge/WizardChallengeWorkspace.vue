<script setup lang="ts">
import type { ChallengePreset, ComplementOption, ExerciseQuestion } from '~~/shared/types/conjugation'
import { challengePresetGroupLabels } from '~~/shared/data/challenge-presets'
import { legacyComplementConfig, legacyComplementOptions } from '~~/shared/utils/complement-options'
import type { CoachProfile } from '~~/shared/types/coach'
import { getChallengeErrorMessage, useChallengeBuilder } from '~/composables/useChallengeBuilder'
import { normalizeChallengeCode, useChallengeApi } from '~/composables/useChallengeApi'
import ChallengeActions from './ChallengeActions.vue'
import ChallengeOptions from './ChallengeOptions.vue'
import PresetPicker from './PresetPicker.vue'
import PrintPreview from './PrintPreview.vue'
import ShareChallengeDialog from './ShareChallengeDialog.vue'
import TensePicker from './TensePicker.vue'
import VerbPicker from './VerbPicker.vue'
import ChatExercise from '../exercise/ChatExercise.vue'
import ClassicExercise from '../exercise/ClassicExercise.vue'
import CoachPicker from '../exercise/CoachPicker.vue'
import '~/assets/css/main.css'

type WizardStep = 0 | 1 | 2 | 3 | 4

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
const requestUrl = useRequestURL()
const wizardInitialized = useState('wizard-challenge-initialized', () => false)
const homeResetRequested = useState('home-reset-requested', () => false)
const currentStep = ref<WizardStep>(0)
const isPreparingStep4 = ref(false)
const highlightChallengeLoader = ref(false)
const presetStage = ref<'groups' | 'presets'>('groups')
const presetExpanded = ref(false)
const challengeCode = ref('')
const codeError = ref('')
const actionError = ref('')
const notice = ref('')
const busyAction = ref<'exercise' | 'print' | 'save' | 'load' | null>(null)
const activePresetId = ref<string>()
const isPrefilledChallenge = ref(false)
const isPresetVerbEditing = ref(false)
const areAllLaunchVerbsVisible = ref(false)
const questions = ref<ExerciseQuestion[]>([])
const printQuestions = ref<ExerciseQuestion[]>([])
const shareCode = ref('')
const isExerciseOpen = ref(false)
const exercisePresentation = ref<'classic' | 'chat'>('classic')
const isPrintOpen = ref(false)
const isShareOpen = ref(false)
const isCoachPickerOpen = ref(false)
const selectedCoach = ref<CoachProfile | null>(null)
const revealedPresetVerbIds = ref<number[]>([])
const revealedPresetTenseIds = ref<number[]>([])
const presetTenseRevealPending = ref(false)
const prefilledOptionsRevealPending = ref(false)
const showLaunchSummary = ref(false)
const conjugationInstructionRaw = ref('')
const conjugationQuestionContextRaw = ref('')
const conjugationQuestionRaw = ref('')
const conjugationExampleRaw = ref('')
const conjugationExamplePrefixRaw = ref('')
const conjugationExampleEmphasisRaw = ref('')
const conjugationExampleSuffixRaw = ref('')
const conjugationExampleLoading = ref(false)
let conjugationExampleRequest = 0
let presetRevealTimers: ReturnType<typeof setTimeout>[] = []

const displayedVerbIds = computed(() => activePresetId.value ? revealedPresetVerbIds.value : challenge.value.verbIds)
const displayedTenseIds = computed(() => activePresetId.value ? revealedPresetTenseIds.value : challenge.value.tenseIds)

function cancelPresetReveal() {
  presetRevealTimers.forEach(timer => clearTimeout(timer))
  presetRevealTimers = []
}

function revealIds(ids: number[], target: Ref<number[]>) {
  target.value = []
  if (!ids.length) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    target.value = [...ids]
    return
  }
  const interval = 1_000 / ids.length
  ids.forEach((id, index) => {
    presetRevealTimers.push(setTimeout(() => {
      target.value = [...target.value, id]
    }, Math.round(index * interval)))
  })
}

function withExampleSubject(value: string) {
  const subject = challenge.value.inclusivePronouns ? 'iel' : 'il'
  return value.replace(/\b(?:il|elle|iel)\b/iu, match => (
    /^\p{Lu}/u.test(match) ? subject.charAt(0).toLocaleUpperCase('fr') + subject.slice(1) : subject
  ))
}

function capitalizeExampleSentence(value: string) {
  return value.replace(/\p{L}/u, letter => letter.toLocaleUpperCase('fr'))
}

const conjugationInstruction = computed(() => conjugationInstructionRaw.value)
const conjugationQuestionContext = computed(() => withExampleSubject(conjugationQuestionContextRaw.value))
const conjugationQuestion = computed(() => capitalizeExampleSentence(withExampleSubject(conjugationQuestionRaw.value)))
const conjugationExample = computed(() => capitalizeExampleSentence(withExampleSubject(conjugationExampleRaw.value)))
const conjugationExamplePrefix = computed(() => capitalizeExampleSentence(withExampleSubject(conjugationExamplePrefixRaw.value)))
const conjugationExampleEmphasis = computed(() => {
  const emphasis = withExampleSubject(conjugationExampleEmphasisRaw.value)
  return conjugationExamplePrefixRaw.value ? emphasis : capitalizeExampleSentence(emphasis)
})
const conjugationExampleSuffix = computed(() => withExampleSubject(conjugationExampleSuffixRaw.value))

function expectedAnswerParts(question: ExerciseQuestion | undefined) {
  const answer = question?.reponsesPourCorrige[0] ?? ''
  if (!question || !answer) return { prefix: '', emphasis: '', suffix: '' }
  if (!question.conjugaison1) return { prefix: '', emphasis: answer, suffix: '' }

  let start = 0
  let end = answer.length
  if (question.complementPosition === 'before' && question.complement && answer.startsWith(question.complement)) {
    start = question.complement.length
    while (/\s/u.test(answer[start] ?? '')) start += 1
    if (question.relativePronoun && answer.slice(start).startsWith(question.relativePronoun)) {
      start += question.relativePronoun.length
      while (/\s/u.test(answer[start] ?? '')) start += 1
    }
  }
  if (question.saisiePrefixe && answer.slice(start).startsWith(question.saisiePrefixe)) {
    start += question.saisiePrefixe.length
    while (/\s/u.test(answer[start] ?? '')) start += 1
  }
  if (question.complementPosition === 'after' && question.complement) {
    const complementStart = answer.lastIndexOf(question.complement)
    if (complementStart >= start) {
      end = complementStart
      while (end > start && /\s/u.test(answer[end - 1] ?? '')) end -= 1
    }
  }
  if (start >= end) return { prefix: '', emphasis: answer, suffix: '' }
  return {
    prefix: answer.slice(0, start),
    emphasis: answer.slice(start, end),
    suffix: answer.slice(end),
  }
}

const shareUrl = computed(() => shareCode.value
  ? new URL(`/defi/${encodeURIComponent(shareCode.value)}`, requestUrl.origin).toString()
  : '')

const stepStatus = computed(() => ({
  verbs: selectedVerbs.value.length,
  tenses: selectedTenses.value.length
}))
const activePreset = computed(() => catalogue.value.presets.find(preset => preset.id === activePresetId.value) ?? null)
const activePresetGroupLabel = computed(() => activePreset.value
  ? activePreset.value.groupLabel ?? challengePresetGroupLabels[activePreset.value.group] ?? activePreset.value.group
  : '')
const activePresetTitleGroupLabel = computed(() => activePreset.value?.group === 'school'
  ? 'Niveau scolaire suisse'
  : activePresetGroupLabel.value)
const activePresetDisplayTitle = computed(() => activePreset.value
  ? [activePresetTitleGroupLabel.value, activePreset.value.label]
      .filter(Boolean)
      .join(' | ')
  : '')
const heroTitle = computed(() => {
  if (currentStep.value === 0) return 'TATITOTU'
  if (activePreset.value) return activePresetDisplayTitle.value
  if (isPrefilledChallenge.value && challengeCode.value) return `Défi ${challengeCode.value}`
  return 'Construire mon défi'
})
const launchVerbPreview = computed(() => selectedVerbs.value.slice(0, 10))
const remainingLaunchVerbs = computed(() => selectedVerbs.value.slice(10))
try {
  await loadCatalogue()
  if (!wizardInitialized.value) {
    clearVerbs()
    clearTenses()
    wizardInitialized.value = true
  }
} catch {
  // Le composable fournit le message d'erreur affiché dans la page.
}

function logUsage(event: 'homepage' | 'print' | 'challenge-save' | 'challenge-load' | 'exercise') {
  if (import.meta.server) return
  void $fetch('/api/logs', { method: 'POST', body: { event } }).catch(() => {})
}

onMounted(() => {
  logUsage('homepage')
  try {
    if (sessionStorage.getItem('highlight-home-challenge-loader') === '1') {
      sessionStorage.removeItem('highlight-home-challenge-loader')
      highlightChallengeLoader.value = true
    }
  } catch {
    // L'accueil fonctionne normalement si le stockage du navigateur est indisponible.
  }
})

async function retryCatalogue() {
  try {
    await loadCatalogue(true)
  } catch {
    // L'état d'erreur est déjà exposé par le composable.
  }
}

function clearMessages() {
  actionError.value = ''
  notice.value = ''
  codeError.value = ''
}

function onChallengeCodeInput(event: Event) {
  const element = event.currentTarget as HTMLElement
  const original = element.textContent ?? ''
  const value = original.replace(/[^a-z0-9-]/giu, '').slice(0, 11)
  if (value !== original) {
    element.textContent = value
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(element)
    range.collapse(false)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }
  challengeCode.value = value
  codeError.value = ''
}

function markAsCustom() {
  cancelPresetReveal()
  revealedPresetVerbIds.value = [...challenge.value.verbIds]
  revealedPresetTenseIds.value = [...challenge.value.tenseIds]
  presetTenseRevealPending.value = false
  prefilledOptionsRevealPending.value = false
  isPrefilledChallenge.value = false
  activePresetId.value = undefined
  areAllLaunchVerbsVisible.value = false
  clearMessages()
}

function goToStep(step: WizardStep) {
  if (isPreparingStep4.value) return
  showLaunchSummary.value = false
  if (step === 0) {
    currentStep.value = 0
    return
  }
  if (step === 2 && selectedVerbs.value.length === 0) return
  if ((step === 3 || step === 4) && !isReady.value) return
  currentStep.value = step
  if (step === 2 && activePresetId.value && presetTenseRevealPending.value) {
    presetTenseRevealPending.value = false
    nextTick(() => revealIds(challenge.value.tenseIds, revealedPresetTenseIds))
  }
  if (step === 3) void refreshConjugationExample()
}

async function startCustomChallenge() {
  restartChallenge()
  goToStep(1)
  await nextTick()
  document.getElementById('verb-search-input')?.focus({ preventScroll: true })
}

function nextStep() {
  if (currentStep.value === 1 && selectedVerbs.value.length) goToStep(2)
  else if (currentStep.value === 2 && selectedTenses.value.length) goToStep(3)
  else if (currentStep.value === 3) void prepareStep4()
}

async function prepareStep4() {
  if (!isReady.value || isPreparingStep4.value) return
  if (currentStep.value !== 3) {
    goToStep(4)
    return
  }
  isPreparingStep4.value = true
  await new Promise(resolve => setTimeout(resolve, 1_000))
  isPreparingStep4.value = false
  goToStep(4)
}

function previousStep() {
  if (currentStep.value === 1) {
    restartChallenge()
    return
  }
  if (currentStep.value > 1) goToStep((currentStep.value - 1) as WizardStep)
}

function restartChallenge() {
  cancelPresetReveal()
  clearVerbs()
  clearTenses()
  challenge.value.questionCount = 20
  challenge.value.exerciseKind = 'conjugation'
  challenge.value.pastSimplePronouns = 'all'
  challenge.value.inclusivePronouns = false
  challenge.value.includeComplements = true
  challenge.value.complementPlacement = 'after'
  challenge.value.complementOptions = ['cod-after', 'coi-after']
  activePresetId.value = undefined
  prefilledOptionsRevealPending.value = false
  isPrefilledChallenge.value = false
  isPresetVerbEditing.value = false
  areAllLaunchVerbsVisible.value = false
  presetExpanded.value = false
  presetStage.value = 'groups'
  challengeCode.value = ''
  codeError.value = ''
  notice.value = ''
  actionError.value = ''
  selectedCoach.value = null
  questions.value = []
  printQuestions.value = []
  shareCode.value = ''
  isExerciseOpen.value = false
  isPrintOpen.value = false
  isShareOpen.value = false
  isCoachPickerOpen.value = false
  showLaunchSummary.value = false
  clearMessages()
  goToStep(0)
}

watch(homeResetRequested, (requested) => {
  if (!requested) return
  restartChallenge()
  homeResetRequested.value = false
}, { immediate: true })

function shuffledSample(ids: readonly number[], count: number) {
  const result = [...ids]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[randomIndex]] = [result[randomIndex]!, result[index]!]
  }
  return result.slice(0, count)
}

function selectPreset(preset: ChallengePreset, randomCount?: number) {
  cancelPresetReveal()
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
  isPrefilledChallenge.value = true
  isPresetVerbEditing.value = false
  revealedPresetVerbIds.value = []
  revealedPresetTenseIds.value = []
  presetTenseRevealPending.value = true
  prefilledOptionsRevealPending.value = true
  areAllLaunchVerbsVisible.value = false
  notice.value = ''
  actionError.value = ''
  goToStep(1)
  nextTick(() => revealIds(challenge.value.verbIds, revealedPresetVerbIds))
}

async function restoreChallenge() {
  const normalized = normalizeChallengeCode(challengeCode.value)
  if (!/^[A-Z0-9]{2}(?:-[A-Z0-9]{2}){3}$/.test(normalized)) {
    codeError.value = 'Le code doit ressembler à AB-CD-EF-23.'
    return
  }

  busyAction.value = 'load'
  codeError.value = ''
  actionError.value = ''
  notice.value = ''
  try {
    const restored = await api.loadChallenge(normalized)
    applySharedChallenge(restored)
    prefilledOptionsRevealPending.value = true
    isPrefilledChallenge.value = true
    activePresetId.value = undefined
    isPresetVerbEditing.value = false
    areAllLaunchVerbsVisible.value = false
    challengeCode.value = restored.code
    notice.value = `Le défi ${restored.code} est chargé. Tu peux le lancer ou le modifier.`
    showLaunchSummary.value = true
    currentStep.value = 4
    logUsage('challenge-load')
  } catch (error) {
    codeError.value = getChallengeErrorMessage(error, 'Ce code ne correspond à aucun défi.')
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

function updateComplementOptions(options: ComplementOption[]) {
  const legacy = legacyComplementConfig(options)
  challenge.value.complementOptions = options
  challenge.value.includeComplements = legacy.includeComplements
  challenge.value.complementPlacement = legacy.complementPlacement
  markAsCustom()
}

async function refreshConjugationExample() {
  if (!isReady.value) {
    conjugationInstructionRaw.value = ''
    conjugationQuestionContextRaw.value = ''
    conjugationQuestionRaw.value = ''
    conjugationExampleRaw.value = ''
    conjugationExamplePrefixRaw.value = ''
    conjugationExampleEmphasisRaw.value = ''
    conjugationExampleSuffixRaw.value = ''
    conjugationExampleLoading.value = false
    return
  }

  const request = ++conjugationExampleRequest
  const loadingStartedAt = Date.now()
  conjugationExampleLoading.value = true
  try {
    const exampleComplementOption = challenge.value.complementOptions.filter((option) => {
      const functionObject = option.slice(0, 3) as 'cod' | 'coi'
      return selectedVerbs.value.some((verb) => {
        const supportsFunction = verb.complementFunctions?.includes(functionObject)
          || verb.complementExample?.functionObject === functionObject
        return supportsFunction && (!option.endsWith('-before')
          || verb.anteposableComplementFunctions?.includes(functionObject)
          || (functionObject === 'cod' && Boolean(verb.complementExample?.before)))
      })
    }).at(-1)
    const exampleComplementPlacement: 'before' | 'after' = exampleComplementOption?.endsWith('-before') ? 'before' : 'after'
    const needsComplement = challenge.value.exerciseKind === 'conjugation'
      && Boolean(exampleComplementOption)
    const exampleConfig = {
      ...challenge.value,
      questionCount: 50,
      inclusivePronouns: false,
      includeComplements: needsComplement,
      complementPlacement: exampleComplementPlacement,
      complementOptions: exampleComplementOption ? [exampleComplementOption] : [],
    }
    const needsAnteposedComplement = challenge.value.exerciseKind === 'conjugation'
      && needsComplement
      && exampleComplementOption?.endsWith('-before')
    const matchesSelectedComplement = (question: ExerciseQuestion) => (
      !needsComplement
      || (question.complementFunction === exampleComplementOption?.slice(0, 3)
        && (needsAnteposedComplement
          ? question.complementPosition === 'before' && Boolean(question.complement)
          : question.complementPosition === 'after' && Boolean(question.complement)))
    )
    const isPreferredExample = (question: ExerciseQuestion) => (
      question.pronom === 'il' || question.personId === 6
    )
    const findExample = async (config: typeof exampleConfig, attempts = 3, requireSelectedComplement = true) => {
      let fallback: ExerciseQuestion | undefined
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
          const generated = await api.generateQuestions(config)
          const candidates = requireSelectedComplement
            ? generated.filter(matchesSelectedComplement)
            : generated
          const found = candidates.find(isPreferredExample)
          if (found) return found
          fallback ??= candidates[0]
        } catch {
          // Une sélection sans temps composé ne produit aucune question antéposée.
          // Le repli dédié ci-dessous essaiera alors un temps composé compatible.
          break
        }
      }
      return fallback
    }

    let example = await findExample(exampleConfig)
    const complementVerbIds = selectedVerbs.value
      .filter(verb => Boolean(verb.complementExample))
      .map(verb => verb.id)
    if (!example && needsComplement && !needsAnteposedComplement && complementVerbIds.length) {
      example = await findExample({
        ...exampleConfig,
        verbIds: complementVerbIds,
      }, 4)
    }
    if (!example && needsAnteposedComplement) {
      const fallbackTense = catalogue.value.temps.find(tense => tense.isCompound && tense.name === 'passé composé')
        ?? catalogue.value.temps.find(tense => tense.isCompound)
      const anteposableVerbIds = selectedVerbs.value
        .filter(verb => Boolean(verb.complementExample?.before))
        .map(verb => verb.id)
      if (fallbackTense) {
        example = await findExample({
          ...exampleConfig,
          verbIds: anteposableVerbIds.length ? anteposableVerbIds : exampleConfig.verbIds,
          tenseIds: [fallbackTense.id],
        }, 4)
      }
    }
    if (!example) {
      example = await findExample({
        ...exampleConfig,
        includeComplements: false,
        complementOptions: [],
      }, 4, false)
    }

    if (request === conjugationExampleRequest) {
      conjugationInstructionRaw.value = example?.instruction ?? ''
      const subject = example?.pronom ?? 'il'
      const modeAndTense = example?.temps && example?.mode
        ? `${example.temps} (${example.mode})`
        : ''
      conjugationQuestionContextRaw.value = example
        ? (challenge.value.exerciseKind === 'conjugation'
            ? [subject, example.infinitif, modeAndTense].filter(Boolean).join(' | ')
            : '')
        : ''
      const prompt = example?.consigne.split('|')[0]?.trim() ?? ''
      conjugationQuestionRaw.value = prompt === subject ? '' : prompt
      conjugationExampleRaw.value = example?.reponsesPourCorrige[0] ?? ''
      const expectedParts = expectedAnswerParts(example)
      conjugationExamplePrefixRaw.value = expectedParts.prefix
      conjugationExampleEmphasisRaw.value = expectedParts.emphasis
      conjugationExampleSuffixRaw.value = expectedParts.suffix
    }
  } catch {
    if (request === conjugationExampleRequest) {
      conjugationInstructionRaw.value = ''
      conjugationQuestionContextRaw.value = ''
      conjugationQuestionRaw.value = ''
      conjugationExampleRaw.value = ''
      conjugationExamplePrefixRaw.value = ''
      conjugationExampleEmphasisRaw.value = ''
      conjugationExampleSuffixRaw.value = ''
    }
  } finally {
    const remainingSpinnerTime = 1000 - (Date.now() - loadingStartedAt)
    if (remainingSpinnerTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingSpinnerTime))
    }
    if (request === conjugationExampleRequest) conjugationExampleLoading.value = false
  }
}

watch(
  [
    () => challenge.value.verbIds.join(','),
    () => challenge.value.tenseIds.join(','),
    () => challenge.value.includeComplements,
    () => challenge.value.complementPlacement,
    () => challenge.value.complementOptions.join(','),
    () => challenge.value.exerciseKind,
    () => challenge.value.inclusivePronouns,
  ],
  () => {
    if (currentStep.value === 3) void refreshConjugationExample()
  },
)

watch(currentStep, async () => {
  if (import.meta.server) return
  await nextTick()
  document.querySelector<HTMLElement>('.wizard-panel')?.focus({ preventScroll: true })
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
})

onBeforeUnmount(cancelPresetReveal)

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
    if (!questions.value.length) throw new Error('Aucune question ne correspond à cette sélection.')
    exercisePresentation.value = 'classic'
    isExerciseOpen.value = true
    logUsage('exercise')
  } catch (error) {
    actionError.value = getChallengeErrorMessage(error, 'Impossible de préparer le questionnaire.')
  } finally {
    busyAction.value = null
  }
}

async function launchWithCoach(coach: CoachProfile) {
  if (!isReady.value) return
  selectedCoach.value = coach
  isCoachPickerOpen.value = false
  busyAction.value = 'exercise'
  clearMessages()
  try {
    questions.value = await api.generateQuestions(challenge.value)
    if (!questions.value.length) throw new Error('Aucune question ne correspond à cette sélection.')
    exercisePresentation.value = 'chat'
    isExerciseOpen.value = true
    logUsage('exercise')
  } catch (error) {
    actionError.value = getChallengeErrorMessage(error, 'Impossible de préparer le questionnaire.')
  } finally {
    busyAction.value = null
  }
}

async function regenerateChatQuestions() {
  const generated = await api.generateQuestions(challenge.value)
  if (!generated.length) throw new Error('Aucune nouvelle question ne correspond à cette sélection.')
  questions.value = generated
}

async function preparePrint() {
  if (!isReady.value) return
  busyAction.value = 'print'
  clearMessages()
  try {
    printQuestions.value = await api.generateQuestions(challenge.value)
    if (!printQuestions.value.length) throw new Error('Aucune question ne correspond à cette sélection.')
    isPrintOpen.value = true
    logUsage('print')
  } catch (error) {
    actionError.value = getChallengeErrorMessage(error, 'Impossible de préparer la fiche à imprimer.')
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
    actionError.value = getChallengeErrorMessage(error, 'Impossible de sauvegarder ce défi.')
  } finally {
    busyAction.value = null
  }
}
</script>

<template>
  <div class="wizard-entry-page">
    <div class="challenge-page wizard-page">
      <header class="wizard-hero">
        <h1 :class="{ 'wizard-hero__brand': currentStep === 0, 'wizard-hero__preset': currentStep !== 0 && isPrefilledChallenge }">{{ heroTitle }}</h1>
        <p v-if="currentStep === 0" class="wizard-hero__subtitle">Exercices de conjugaison française, gratuits et sans publicité</p>
      </header>

      <main class="wizard-shell">
      <div v-if="catalogueStatus === 'loading'" class="page-state" role="status">
        <span class="loader" aria-hidden="true" />
        Chargement du catalogue de conjugaison…
      </div>

      <div v-else-if="catalogueStatus === 'error'" class="page-state page-state--error" role="alert">
        <strong>Le catalogue n’a pas pu être chargé.</strong>
        <span>{{ catalogueError }}</span>
        <button class="primary-button" type="button" @click="retryCatalogue">Réessayer</button>
      </div>

      <template v-else>
        <p v-if="actionError" class="workspace-message workspace-message--error" role="alert">{{ actionError }}</p>
        <p v-else-if="notice" class="workspace-message workspace-message--success" aria-live="polite">{{ notice }}</p>

        <section
          class="wizard-panel"
          :class="{ 'wizard-panel--autocomplete-open': currentStep === 1 }"
          tabindex="-1"
          aria-labelledby="wizard-title"
        >
          <h2 id="wizard-title" class="sr-only">Composer un défi personnalisé</h2>

          <nav v-if="currentStep !== 0" class="wizard-steps" aria-label="Étapes de création du défi">
            <button class="wizard-step-tab wizard-step-tab--verbs" :class="{ 'is-active': currentStep === 1, 'is-complete': stepStatus.verbs > 0 }" type="button" @click="goToStep(1)">
              <span>1</span><span><strong>Verbes</strong><small>{{ stepStatus.verbs ? `${stepStatus.verbs} choisi${stepStatus.verbs > 1 ? 's' : ''}` : 'À choisir' }}</small></span>
            </button>
            <span class="wizard-steps__line" aria-hidden="true" />
            <button class="wizard-step-tab wizard-step-tab--tenses" :class="{ 'is-active': currentStep === 2, 'is-complete': stepStatus.tenses > 0 }" type="button" :disabled="stepStatus.verbs === 0" @click="goToStep(2)">
              <span>2</span><span><strong><span class="mobile-label-hidden">Modes et temps</span><span class="mobile-label-only">Temps</span></strong><small>{{ stepStatus.tenses ? `${stepStatus.tenses} choisi${stepStatus.tenses > 1 ? 's' : ''}` : 'À choisir' }}</small></span>
            </button>
            <span class="wizard-steps__line" aria-hidden="true" />
            <button :class="{ 'is-active': currentStep === 3, 'is-complete': currentStep === 4 }" type="button" :disabled="!isReady" @click="goToStep(3)">
              <span>3</span><span><strong>Options</strong><small>Finaliser le défi</small></span>
            </button>
            <span class="wizard-steps__line" aria-hidden="true" />
            <button :class="{ 'is-active': currentStep === 4 }" type="button" :disabled="!isReady || isPreparingStep4" @click="prepareStep4">
              <span>4</span><span><strong>Créer</strong><small>Utiliser le défi</small></span>
            </button>
          </nav>

          <div class="wizard-content" :class="{ 'wizard-content--home': currentStep === 0 }">
            <div v-if="isPreparingStep4" class="wizard-step-preparing" role="status" aria-live="polite">
              <span class="loader wizard-step-preparing__spinner" aria-hidden="true" />
              <strong>Préparation de ton défi…</strong>
            </div>

            <div v-else-if="currentStep === 0" class="wizard-home">
                <div
                  class="code-loader"
                  :class="{ 'is-arrival-highlighted': highlightChallengeLoader }"
                  role="search"
                  aria-label="Charger un défi avec son code"
                  @pointerdown="highlightChallengeLoader = false"
                >
                  <div class="code-loader__heading">
                    <span class="code-loader__icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 3v12" />
                        <path d="m7 10 5 5 5-5" />
                        <path d="M5 21h14" />
                      </svg>
                    </span>
                    <div><strong>Tu as reçu un défi&nbsp;?</strong><small>Colle son code pour le reprendre immédiatement.</small></div>
                  </div>
                  <div class="code-loader__control">
                    <span id="wizard-challenge-code-label" class="sr-only">Code du défi</span>
                    <div
                      id="wizard-challenge-code"
                      class="code-loader__code-entry"
                      role="textbox"
                      contenteditable="plaintext-only"
                      aria-labelledby="wizard-challenge-code-label"
                      data-placeholder="AB-CD-EF-23"
                      :aria-invalid="Boolean(codeError)"
                      @input="onChallengeCodeInput"
                      @keydown.enter.prevent="restoreChallenge"
                    ></div>
                    <button class="primary-button" type="button" :disabled="catalogueStatus !== 'success' || busyAction === 'load'" @click="restoreChallenge">
                      {{ busyAction === 'load' ? 'Chargement…' : 'Charger' }}
                    </button>
                  </div>
                  <p v-if="codeError" class="code-loader__error" role="alert">{{ codeError }}</p>
                </div>

                <div class="wizard-home__choices">
                  <button
                    v-if="!presetExpanded"
                    class="wizard-home__choice wizard-home__choice--preset is-collapsed"
                    type="button"
                    @click="presetExpanded = true"
                  >
                    <span class="wizard-home__choice-icon" aria-hidden="true">★</span>
                    <div>
                      <h2>Tu veux travailler un de nos défis&nbsp;?</h2>
                    </div>
                    <span class="secondary-button" aria-hidden="true">Voir</span>
                  </button>
                  <article
                    v-else
                    class="wizard-home__choice wizard-home__choice--preset"
                    :class="{ 'is-preset-selection': presetStage === 'presets' }"
                  >
                    <span class="wizard-home__choice-icon" aria-hidden="true">★</span>
                    <div>
                      <h2>Tu veux travailler un de nos défis&nbsp;?</h2>
                    </div>
                    <PresetPicker
                      class="wizard-home__inline-presets"
                      compact
                      :presets="catalogue.presets"
                      :verbs="catalogue.verbes"
                      :modes="catalogue.modes"
                      :tenses="catalogue.temps"
                      :active-preset-id="activePresetId"
                      @select="selectPreset"
                      @stage-change="presetStage = $event"
                    />
                  </article>

                  <article class="wizard-home__choice wizard-home__choice--custom">
                    <span class="wizard-home__choice-icon" aria-hidden="true">✎</span>
                    <div>
                      <h2>Tu veux construire ton propre défi&nbsp;?</h2>
                      <p>Choisis les verbes, les modes, les temps et les options.</p>
                    </div>
                    <button class="primary-button" :class="{ 'wizard-next-pulse': !highlightChallengeLoader }" type="button" @click="startCustomChallenge">Construire un nouveau défi →</button>
                  </article>
                </div>
            </div>

            <div v-else-if="currentStep === 1" class="wizard-step wizard-step--selection" aria-labelledby="verbs-title">
              <div class="wizard-step__actions wizard-step__actions--split">
                <button class="secondary-button" type="button" @click="previousStep">← Accueil</button>
                <div class="wizard-step__controls">
                  <button class="primary-button wizard-step__cta wizard-next-pulse" type="button" :disabled="!selectedVerbs.length" @click="nextStep">
                    Choisir les temps →
                  </button>
                </div>
              </div>
              <div v-if="activePreset && !isPresetVerbEditing" class="wizard-step__intro wizard-step__intro--selection">
                <h2 id="verbs-title">Verbes du défi</h2>
              </div>
              <section v-if="activePreset && !isPresetVerbEditing" class="preset-verb-overview">
                <header>
                  <div>
                    <p>{{ selectedVerbs.length }} verbe{{ selectedVerbs.length > 1 ? 's' : '' }} sélectionné{{ selectedVerbs.length > 1 ? 's' : '' }}</p>
                    <button class="preset-verb-overview__edit" type="button" @click="isPresetVerbEditing = true">Modifier la liste</button>
                  </div>
                </header>
                <ul>
                  <li v-for="verb in selectedVerbs" :key="verb.id">{{ verb.infinitif }}</li>
                </ul>
              </section>
              <template v-else>
                <div class="wizard-step__intro wizard-step__intro--selection">
                  <h2 id="verbs-title">{{ isPrefilledChallenge ? 'Verbes du défi' : 'Choisis les verbes' }}</h2>
                </div>
                <VerbPicker
                  :verbs="catalogue.verbes"
                  :selected-ids="displayedVerbIds"
                  @add="onAddVerb"
                  @remove="onRemoveVerb"
                  @clear="markAsCustom(); clearVerbs()"
                />
              </template>
              <div class="wizard-step__bottom-actions">
                <button class="primary-button wizard-step__cta wizard-next-pulse" type="button" :disabled="!selectedVerbs.length" @click="nextStep">
                  Choisir les temps →
                </button>
              </div>
            </div>

            <div v-else-if="currentStep === 2" class="wizard-step wizard-step--selection" aria-labelledby="tenses-title">
              <div class="wizard-step__actions wizard-step__actions--split">
                <button class="secondary-button" type="button" @click="previousStep">← Verbes</button>
                <div class="wizard-step__controls">
                  <button class="primary-button wizard-step__cta wizard-next-pulse" type="button" :disabled="!selectedTenses.length" @click="nextStep">
                    Choisir les options →
                  </button>
                </div>
              </div>
              <div class="wizard-step__intro wizard-step__intro--selection">
                <h2>{{ isPrefilledChallenge ? 'Modes et temps' : 'Choisis les modes et les temps' }}</h2>
              </div>
              <TensePicker
                :modes="catalogue.modes"
                :tenses="catalogue.temps"
                :verbs="selectedVerbs"
                :selected-ids="displayedTenseIds"
                @toggle="onToggleTense"
                @select-all="markAsCustom(); selectAllTenses()"
                @clear="markAsCustom(); clearTenses()"
              />
              <div class="wizard-step__bottom-actions">
                <button class="primary-button wizard-step__cta wizard-next-pulse" type="button" :disabled="!selectedTenses.length" @click="nextStep">
                  Choisir les options →
                </button>
              </div>
            </div>

            <div v-else-if="currentStep === 3" class="wizard-step wizard-review">
              <div class="wizard-step__actions wizard-step__actions--split">
                <button class="secondary-button" type="button" @click="previousStep">
                  ← <span class="mobile-label-hidden">Modes et temps</span><span class="mobile-label-only">Temps</span>
                </button>
                <div class="wizard-step__controls">
                  <button class="primary-button wizard-step__cta wizard-step__cta--launch wizard-next-pulse" type="button" @click="nextStep">Créer le défi</button>
                </div>
              </div>
              <div class="wizard-step__intro wizard-step__intro--selection">
                <h2>Options du défi</h2>
              </div>

              <ChallengeOptions
                :question-count="challenge.questionCount"
                :exercise-kind="challenge.exerciseKind"
                :inclusive-pronouns="challenge.inclusivePronouns"
                :complement-options="challenge.complementOptions"
                :complement-verbs="selectedVerbs"
                :conjugation-instruction="conjugationInstruction"
                :conjugation-question-context="conjugationQuestionContext"
                :conjugation-question="conjugationQuestion"
                :conjugation-example="conjugationExample"
                :conjugation-example-prefix="conjugationExamplePrefix"
                :conjugation-example-emphasis="conjugationExampleEmphasis"
                :conjugation-example-suffix="conjugationExampleSuffix"
                :conjugation-example-loading="conjugationExampleLoading"
                :reveal-prefilled-options="prefilledOptionsRevealPending"
                grid-layout
                id-prefix="wizard-step-options"
                @prefilled-options-reveal-start="prefilledOptionsRevealPending = false"
                @update-question-count="challenge.questionCount = $event; markAsCustom()"
                @update-exercise-kind="challenge.exerciseKind = $event; markAsCustom()"
                @update-inclusive-pronouns="challenge.inclusivePronouns = $event; markAsCustom()"
                @update-complement-options="updateComplementOptions"
              />

              <div class="wizard-step__bottom-actions">
                <button class="primary-button wizard-step__cta wizard-step__cta--launch wizard-next-pulse" type="button" @click="nextStep">Créer le défi</button>
              </div>

            </div>

            <div v-else class="wizard-step wizard-launch-step">
              <div class="wizard-step__actions wizard-step__actions--split">
                <button class="secondary-button" type="button" @click="previousStep">← Options</button>
              </div>
              <section v-if="showLaunchSummary" class="launch-summary" aria-labelledby="launch-verbs-title">
                <div class="launch-summary__heading">
                  <div>
                    <p v-if="activePreset" class="builder-card__eyebrow">{{ activePresetGroupLabel }}</p>
                    <h2 id="launch-verbs-title">{{ activePreset?.label ?? 'Verbes choisis' }}</h2>
                  </div>
                  <span>{{ selectedVerbs.length }} verbe{{ selectedVerbs.length > 1 ? 's' : '' }}</span>
                </div>
                <p v-if="activePreset" class="launch-summary__description">{{ activePreset.description }}</p>
                <ul class="launch-verb-list" aria-label="Aperçu des verbes choisis">
                  <li v-for="verb in launchVerbPreview" :key="verb.id">{{ verb.infinitif }}</li>
                </ul>
                <Transition name="launch-verbs-expand">
                  <div v-if="areAllLaunchVerbsVisible" class="launch-verbs-expand">
                    <ul class="launch-verb-list launch-verb-list--remaining" aria-label="Autres verbes choisis">
                      <li v-for="verb in remainingLaunchVerbs" :key="verb.id">{{ verb.infinitif }}</li>
                    </ul>
                  </div>
                </Transition>
                <button
                  v-if="remainingLaunchVerbs.length"
                  class="launch-summary__toggle"
                  type="button"
                  :aria-expanded="areAllLaunchVerbsVisible"
                  @click="areAllLaunchVerbsVisible = !areAllLaunchVerbsVisible"
                >
                  {{ areAllLaunchVerbsVisible ? 'Réduire' : `Voir tout (${selectedVerbs.length})` }}
                  <span aria-hidden="true">{{ areAllLaunchVerbsVisible ? '↑' : '↓' }}</span>
                </button>
              </section>
              <ChallengeActions
                :ready="isReady"
                :busy-action="busyAction"
                @exercise="prepareExercise"
                @print="preparePrint"
                @save="saveChallenge"
              />
            </div>
          </div>

        </section>

      </template>
      </main>

      <ClassicExercise v-if="isExerciseOpen && exercisePresentation === 'classic'" :questions="questions" :exercise-kind="challenge.exerciseKind" @close="isExerciseOpen = false" />
      <ChatExercise v-if="isExerciseOpen && exercisePresentation === 'chat' && selectedCoach" :questions="questions" :coach="selectedCoach" :verbs="selectedVerbs" :tenses="selectedTenses" :regenerate-questions="regenerateChatQuestions" @close="isExerciseOpen = false" />
      <CoachPicker v-if="isCoachPickerOpen" @close="isCoachPickerOpen = false" @select="launchWithCoach" />
      <PrintPreview v-if="isPrintOpen" :questions="printQuestions" :verbs="selectedVerbs" :tenses="selectedTenses" :exercise-kind="challenge.exerciseKind" :options="challenge.printOptions" @update-options="challenge.printOptions = $event" @close="isPrintOpen = false" />
      <ShareChallengeDialog v-if="isShareOpen" :code="shareCode" :url="shareUrl" @close="isShareOpen = false" />
    </div>
  </div>
</template>

<style scoped>
.wizard-entry-page { font-family: "Funnel Sans", "Avenir Next", Avenir, system-ui, sans-serif; }
.wizard-page { overflow: hidden; padding-bottom: 70px; border-radius: 26px; }
.wizard-hero { max-width: 820px; margin: 0 auto; padding: 42px 24px 24px; text-align: center; }
.wizard-hero h1 { margin: 0; color: #294c4b; font-size: clamp(2.2rem, 5vw, 4rem); letter-spacing: -.05em; line-height: 1; }
.wizard-hero h1.wizard-hero__brand { letter-spacing: .18em; text-indent: .18em; }
.wizard-hero h1:not(.wizard-hero__brand) { letter-spacing: .035em; opacity: .62; }
.wizard-hero h1.wizard-hero__preset { font-size: clamp(1.75rem, 4vw, 3.15rem); line-height: 1.1; }
.wizard-hero__subtitle { max-width: 650px; margin: 12px auto 0; color: var(--muted); font-size: 1.08rem; font-weight: 650; line-height: 1.5; }
.wizard-shell { position: relative; width: min(1120px, calc(100% - 40px)); margin: 0 auto; }
.code-loader { display: grid; width: 100%; grid-template-columns: minmax(230px, 1fr) minmax(330px, .9fr); align-items: center; gap: 12px 28px; margin: 0; padding: 18px; border: 1px solid #b8d3cb; border-radius: 16px; background: white; box-shadow: 0 9px 25px rgb(42 65 61 / 7%); }
.code-loader__heading { display: flex; align-items: center; gap: 11px; }
.code-loader__heading > div { display: grid; }
.code-loader__heading small { color: var(--muted); }
.code-loader__icon { display: grid; width: 38px; height: 38px; flex: 0 0 38px; place-items: center; color: white; background: var(--brand); border-radius: 11px; font-size: 1.2rem; font-weight: 900; }
.code-loader__icon svg { width: 21px; height: 21px; }
.code-loader__control { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
.code-loader__code-entry { width: 100%; min-height: 46px; padding: 9px 13px; overflow: hidden; border: 1px solid #9ebdb4; border-radius: 10px; color: var(--ink); background: white; font-weight: 800; letter-spacing: .08em; line-height: 26px; text-transform: uppercase; white-space: nowrap; }
.code-loader__code-entry:empty::before { color: #7f8583; content: attr(data-placeholder); pointer-events: none; }
.code-loader__code-entry:focus { border-color: var(--brand); box-shadow: 0 0 0 4px rgb(52 95 88 / 12%); outline: 0; }
.code-loader__error { grid-column: 2; margin: -4px 0 0; color: var(--danger); font-size: .82rem; }
.wizard-panel { overflow: hidden; border: 1px solid rgba(174, 199, 191, .95); border-radius: 24px; background: rgb(255 255 255 / 94%); box-shadow: var(--shadow); outline: 0; }
.wizard-panel--autocomplete-open { overflow: visible; }
.wizard-steps { display: grid; grid-template-columns: minmax(125px, 1fr) 50px minmax(165px, 1.15fr) 50px minmax(120px, 1fr) 50px minmax(115px, .9fr); align-items: center; padding: 17px 24px; border-bottom: 1px solid var(--line); background: #f6faf8; }
.wizard-steps button { display: flex; min-width: 0; padding: 7px; align-items: center; gap: 10px; text-align: left; color: #71817d; background: transparent; border: 0; }
.wizard-steps button > span:first-child { display: grid; width: 35px; height: 35px; flex: 0 0 35px; place-items: center; border: 2px solid #b8c7c3; border-radius: 50%; background: white; font-weight: 850; }
.wizard-steps button > span:last-child { display: grid; min-width: 0; }
.wizard-steps button strong { color: currentColor; font-size: .93rem; }
.wizard-steps button small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wizard-steps button.is-active { color: var(--brand-dark); }
.wizard-steps button.is-active > span:first-child { color: white; border-color: var(--brand); background: var(--brand); box-shadow: 0 0 0 5px var(--brand-pale); }
.wizard-steps button.is-complete:not(.is-active) > span:first-child { color: var(--success); border-color: #83b39b; background: var(--success-pale); }
.wizard-steps button.wizard-step-tab--verbs:not(.is-active) > span:first-child { color: var(--verb-accent); border-color: color-mix(in srgb, var(--verb-accent) 58%, transparent); background: var(--verb-accent-soft); }
.wizard-steps .wizard-step-tab--verbs.is-active > span:first-child { color: white; border-color: var(--verb-accent); background: var(--verb-accent); }
.wizard-steps .wizard-step-tab--verbs.is-active > span:first-child { box-shadow: 0 0 0 5px color-mix(in srgb, var(--verb-accent) 18%, transparent); }
.wizard-steps button.wizard-step-tab--tenses:not(.is-active) > span:first-child { color: var(--tense-accent); border-color: color-mix(in srgb, var(--tense-accent) 58%, transparent); background: var(--tense-accent-soft); }
.wizard-steps .wizard-step-tab--tenses.is-active > span:first-child { color: #302711; border-color: var(--tense-accent); background: var(--tense-accent); }
.wizard-steps .wizard-step-tab--tenses.is-active > span:first-child { box-shadow: 0 0 0 5px color-mix(in srgb, var(--tense-accent) 18%, transparent); }
.wizard-steps button:disabled { cursor: default; opacity: .5; }
.wizard-steps__line { position: relative; width: 18px; height: 1px; margin: 0; justify-self: center; color: #b9c9c5; background: currentColor; }
.wizard-steps__line::after { position: absolute; top: 50%; right: -1px; width: 5px; height: 5px; border-top: 1px solid currentColor; border-right: 1px solid currentColor; content: ''; transform: translateY(-50%) rotate(45deg); transform-origin: center; }
.wizard-content { position: relative; min-height: 480px; padding: 30px clamp(18px, 5vw, 58px) 34px; }
.wizard-content--home { padding: clamp(20px, 4vw, 42px); }
.wizard-home { display: grid; max-width: 930px; margin: 0 auto; gap: 18px; }
.wizard-home__choices { display: grid; grid-template-columns: 1fr; gap: 18px; }
.wizard-home__choice { display: grid; min-height: 170px; padding: 24px; align-content: start; grid-template-columns: auto 1fr; gap: 18px; border: 1px solid #b8d3cb; border-radius: 18px; background: #f8fbfa; }
.wizard-home__choice:is(button) { width: 100%; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.wizard-home__choice:is(button):hover { border-color: #83afa4; background: var(--brand-pale); }
.wizard-home__choice:is(button):focus-visible { border-color: var(--brand); box-shadow: 0 0 0 4px rgb(52 95 88 / 14%); outline: 0; }
.wizard-home__choice--custom { border-color: #8bb9c6; background: #eff9fb; }
.wizard-home__choice-icon { display: grid; width: 48px; height: 48px; place-items: center; color: white; border-radius: 14px; background: var(--brand); font-size: 1.35rem; font-weight: 900; }
.wizard-home__choice h2 { margin: 1px 0 8px; color: var(--brand-dark); font-size: clamp(1.2rem, 2.2vw, 1.55rem); line-height: 1.15; }
.wizard-home__choice--preset .wizard-home__choice-icon { width: 38px; height: 38px; border-radius: 11px; font-size: 1.2rem; }
.wizard-home__choice--preset h2 { margin-top: 6px; font-size: 1rem; letter-spacing: 0; line-height: 1.25; }
.wizard-home__choice--preset.is-collapsed { min-height: 82px; align-content: center; align-items: center; grid-template-columns: auto 1fr auto; }
.wizard-home__choice--preset.is-collapsed > .secondary-button { grid-column: 3; align-self: center; justify-self: end; margin: 0; }
.wizard-home__choice--preset.is-preset-selection { min-height: 0; padding-block: 16px; }
.wizard-home__choice--custom { min-height: 130px; align-content: center; align-items: center; grid-template-columns: auto 1fr; }
.wizard-home__choice.wizard-home__choice--custom > button { grid-column: 1 / -1; align-self: center; justify-self: center; margin: 0; }
.wizard-home__choice p { margin: 0; color: var(--muted); line-height: 1.45; }
.wizard-home__choice button { grid-column: 1 / -1; align-self: end; justify-self: start; margin-top: auto; }
.wizard-home__inline-presets { grid-column: 1 / -1; }
.wizard-step { max-width: 930px; margin: 0 auto; }
.wizard-step-preparing { display: grid; min-height: 420px; place-content: center; justify-items: center; gap: 15px; color: var(--brand-dark); text-align: center; }
.wizard-step-preparing__spinner { width: 42px; height: 42px; border-width: 5px; }
.wizard-step-preparing strong { font-size: 1.15rem; }
.wizard-step--selection { padding-top: 0; }
.wizard-step__actions { display: flex; margin-bottom: 30px; align-items: flex-start; justify-content: flex-end; }
.wizard-step__actions--split { align-items: center; justify-content: space-between; }
.wizard-step__controls { display: flex; align-items: center; gap: 8px; }
.wizard-step__bottom-actions { display: flex; margin: 30px -18px -4px; padding: 24px 18px 4px; justify-content: flex-end; border-top: 1px solid var(--line); background: linear-gradient(180deg, color-mix(in srgb, var(--brand-pale) 32%, transparent), transparent); }
.wizard-step__cta { min-height: 54px; padding: 13px 25px; border-radius: 13px; font-size: 1.05rem; font-weight: 400; letter-spacing: .035em; }
.wizard-step__actions > .secondary-button { font-weight: 400; letter-spacing: .035em; }
.wizard-step__cta--launch { display: inline-flex; min-height: 54px; padding: 13px 25px; align-items: center; justify-content: center; gap: 9px; border-radius: 13px; font-size: 1.05rem; }
.wizard-next-pulse:not(:disabled) { animation: wizard-next-pulse 2s infinite; transform-origin: center; }
.wizard-step__intro { margin-bottom: 22px; text-align: center; }
.wizard-step__intro--selection { text-align: left; }
.wizard-step__intro h2 { margin: 0; color: var(--brand-dark); font-size: clamp(1.75rem, 3vw, 2.5rem); letter-spacing: .035em; }
.wizard-step__intro p { max-width: 610px; margin: 8px auto 0; color: var(--muted); line-height: 1.5; }
.wizard-step__intro--selection p { margin-inline: 0; }
.wizard-step :deep(.builder-card) { box-shadow: none; }
.wizard-step :deep(.builder-card__header) { display: none; }
.wizard-step :deep(.verb-search) { padding-top: 23px; }
.preset-verb-overview { display: grid; padding: clamp(20px, 4vw, 30px); border: 1px solid var(--line); border-radius: 18px; gap: 22px; background: color-mix(in srgb, var(--surface) 92%, var(--verb-accent-soft)); }
.preset-verb-overview > header { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.preset-verb-overview h2 { margin: 0; color: var(--brand-dark); font-size: clamp(1.55rem, 3vw, 2.2rem); letter-spacing: -.03em; }
.preset-verb-overview p { margin: 5px 0 0; color: var(--muted); }
.preset-verb-overview__edit { margin: 7px 0 0; padding: 0; color: var(--brand-dark); border: 0; background: transparent; cursor: pointer; font: inherit; font-size: .9rem; font-weight: 400; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
.preset-verb-overview__edit:hover { color: var(--brand); }
.preset-verb-overview__edit:focus-visible { border-radius: 3px; outline: 3px solid color-mix(in srgb, var(--brand) 28%, transparent); outline-offset: 3px; }
.preset-verb-overview ul { display: flex; margin: 0; padding: 0; flex-wrap: wrap; gap: 10px; list-style: none; }
.preset-verb-overview li { padding: 9px 14px; border: 1px solid color-mix(in srgb, var(--verb-accent) 45%, var(--line)); border-radius: 999px; color: var(--ink); background: var(--surface); font-weight: 400; }
.wizard-review, .wizard-launch-step { padding-top: 0; }
.mobile-label-only { display: none; }
.wizard-review :deep(.options-card) { margin: 0 0 18px; box-shadow: none; }
.wizard-review :deep(.challenge-launch) { margin-top: 18px; box-shadow: none; }
.wizard-launch-step :deep(.challenge-launch) { margin-top: 0; box-shadow: none; }
.launch-summary { margin-bottom: 18px; padding: 22px; border: 1px solid var(--line); border-radius: 17px; background: #f8fbfa; }
.launch-summary__heading { display: flex; align-items: start; justify-content: space-between; gap: 18px; }
.launch-summary__heading h2 { margin: 2px 0 0; color: var(--brand-dark); font-size: clamp(1.35rem, 2.5vw, 1.8rem); }
.launch-summary__heading > span { flex: 0 0 auto; padding: 6px 10px; border-radius: 999px; color: var(--brand-dark); background: var(--brand-pale); font-size: .82rem; font-weight: 800; }
.launch-summary__description { margin: 9px 0 16px; color: var(--muted); line-height: 1.45; }
.launch-verb-list { display: flex; margin: 0; padding: 0; flex-wrap: wrap; gap: 8px; list-style: none; }
.launch-verb-list li { padding: 6px 11px; border: 1px solid #b8d3cb; border-radius: 999px; color: var(--ink); background: white; font-size: .9rem; }
.launch-verbs-expand { display: grid; grid-template-rows: 1fr; }
.launch-verb-list--remaining { min-height: 0; padding-top: 8px; overflow: hidden; }
.launch-summary__toggle { display: inline-flex; margin-top: 15px; padding: 7px 11px; align-items: center; gap: 7px; border: 0; border-radius: 9px; color: var(--brand-dark); background: var(--brand-pale); font: inherit; font-size: .86rem; font-weight: 800; }
.launch-summary__toggle:hover { background: #dcefe9; }
.launch-verbs-expand-enter-active, .launch-verbs-expand-leave-active { transition: grid-template-rows 360ms cubic-bezier(.22, 1, .36, 1), opacity 220ms ease, transform 300ms ease; }
.launch-verbs-expand-enter-from, .launch-verbs-expand-leave-to { grid-template-rows: 0fr; opacity: 0; transform: translateY(-8px); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@keyframes wizard-next-pulse {
  0%, 6% {
    box-shadow: 0 0 0 0 rgb(31 123 145 / 0%);
    transform: scale(1);
    animation-timing-function: cubic-bezier(.2, .9, .3, 1);
  }
  16% {
    box-shadow: 0 0 0 8px rgb(31 123 145 / 18%);
    transform: scale(1.035);
    animation-timing-function: cubic-bezier(.16, 1, .3, 1);
  }
  62%, 100% {
    box-shadow: 0 0 0 0 rgb(31 123 145 / 0%);
    transform: scale(1);
  }
}

@keyframes challenge-loader-arrival-flash {
  0%, 100% {
    box-shadow: 0 0 0 0 rgb(31 123 145 / 0%);
    filter: brightness(1);
    transform: scale(1);
  }
  50% {
    border-color: #42a8bd;
    box-shadow: 0 0 0 7px rgb(31 123 145 / 23%), 0 12px 30px rgb(31 123 145 / 18%);
    filter: brightness(1.14);
    transform: scale(1.012);
  }
}

.code-loader.is-arrival-highlighted {
  transform-origin: center;
  animation:
    challenge-loader-arrival-flash 230ms ease-in-out 3,
    wizard-next-pulse 2s 760ms infinite;
}

@media (prefers-reduced-motion: reduce) {
  .wizard-next-pulse:not(:disabled) { animation: none; }
  .code-loader.is-arrival-highlighted {
    border-color: #42a8bd;
    box-shadow: 0 0 0 5px rgb(31 123 145 / 18%);
    animation: none;
  }
  .launch-verbs-expand-enter-active, .launch-verbs-expand-leave-active { transition: none; }
}

@media (max-width: 820px) {
  .wizard-hero { padding: 28px 16px 18px; }
  .wizard-hero__subtitle { margin-top: 9px; font-size: .98rem; }
  .wizard-shell { width: min(100% - 20px, 650px); }
  .code-loader { grid-template-columns: 1fr; gap: 10px; }
  .code-loader__error { grid-column: 1; }
  .wizard-home__choice { min-height: 190px; }
  .wizard-home__choice--preset.is-collapsed,
  .wizard-home__choice--custom { min-height: 0; }
  .wizard-steps { grid-template-columns: 1fr 10px 1fr 10px 1fr 10px 1fr; padding: 13px 6px; }
  .wizard-steps__line { width: 8px; margin: 0; }
  .wizard-steps__line::after { width: 5px; height: 5px; }
  .wizard-steps button { justify-content: center; padding: 5px 2px; }
  .wizard-steps button > span:last-child small { display: none; }
  .wizard-steps button strong { font-size: .75rem; text-align: center; }
  .wizard-steps button > span:first-child { width: 31px; height: 31px; flex-basis: 31px; }
  .wizard-steps button { flex-direction: column; gap: 4px; }
  .wizard-content { min-height: 430px; padding: 22px 12px 24px; }
  .wizard-step--selection { padding-top: 0; }
  .preset-verb-overview > header { align-items: stretch; flex-direction: column; }
  .wizard-review, .wizard-launch-step { padding-top: 0; }
  .wizard-step__actions { margin-bottom: 22px; }
  .wizard-step__intro { padding: 0 8px; }
  .wizard-step__controls { justify-content: flex-end; flex-wrap: wrap; }
  .wizard-review :deep(.challenge-launch) { padding: 17px 12px; }
}

@media (max-width: 470px) {
  .mobile-label-hidden { display: none; }
  .mobile-label-only { display: inline; }
  .code-loader__heading small { font-size: .78rem; }
  .code-loader__control { grid-template-columns: 1fr; }
  .code-loader__control button { width: 100%; }
  .wizard-home__choice { padding: 18px; grid-template-columns: 40px 1fr; gap: 13px; }
  .wizard-home__choice-icon { width: 40px; height: 40px; border-radius: 11px; }
  .wizard-home__choice--preset.is-collapsed,
  .wizard-home__choice--custom { grid-template-columns: 40px 1fr; }
  .wizard-home__choice--preset.is-collapsed > .secondary-button { grid-column: 1 / -1; grid-row: 3; justify-self: center; }
  .wizard-step--selection,
  .wizard-review,
  .wizard-launch-step { padding-top: 0; }
  .wizard-step__actions,
  .wizard-step__actions--split {
    position: static;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 9px;
    margin-bottom: 22px;
  }
  .wizard-step__actions--split > .secondary-button {
    grid-column: 1;
    justify-self: start;
  }
  .wizard-step__controls { display: contents; }
  .wizard-step__controls > .secondary-button {
    grid-column: 1;
    justify-self: start;
  }
  .wizard-step__controls > .primary-button {
    width: max-content;
    max-width: 100%;
    grid-column: 2;
    justify-self: end;
    text-align: center;
  }
  .wizard-step__controls > .secondary-button:only-child {
    grid-column: 1 / -1;
    justify-self: center;
  }
  .wizard-step__controls .primary-button,
  .wizard-step__controls .secondary-button {
    padding-inline: 8px;
    font-size: .8rem;
    white-space: nowrap;
  }
  .wizard-step__controls .wizard-step__cta {
    min-height: 48px;
    padding-inline: 13px;
    font-size: .88rem;
  }
}
</style>

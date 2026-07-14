<script setup lang="ts">
import type { ChallengePreset, ExerciseQuestion } from '~~/shared/types/conjugation'
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

type WizardStep = 1 | 2 | 3 | 4
type Drawer = 'presets' | null

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
const currentStep = ref<WizardStep>(1)
const openDrawer = ref<Drawer>(null)
const challengeCode = ref('')
const codeError = ref('')
const actionError = ref('')
const notice = ref('')
const busyAction = ref<'exercise' | 'print' | 'save' | 'load' | null>(null)
const activePresetId = ref<string>()
const questions = ref<ExerciseQuestion[]>([])
const printQuestions = ref<ExerciseQuestion[]>([])
const shareCode = ref('')
const isExerciseOpen = ref(false)
const exercisePresentation = ref<'classic' | 'chat'>('classic')
const isPrintOpen = ref(false)
const isShareOpen = ref(false)
const isCoachPickerOpen = ref(false)
const selectedCoach = ref<CoachProfile | null>(null)
const conjugationInstructionRaw = ref('')
const conjugationQuestionContextRaw = ref('')
const conjugationQuestionRaw = ref('')
const conjugationExampleRaw = ref('')
const conjugationExampleLoading = ref(false)
let conjugationExampleRequest = 0

function withExampleSubject(value: string) {
  const subject = challenge.value.inclusivePronouns ? 'iel' : 'il'
  return value.replace(/\b(?:il|elle|iel)\b/iu, match => (
    /^\p{Lu}/u.test(match) ? subject.charAt(0).toLocaleUpperCase('fr') + subject.slice(1) : subject
  ))
}

const conjugationInstruction = computed(() => conjugationInstructionRaw.value)
const conjugationQuestionContext = computed(() => withExampleSubject(conjugationQuestionContextRaw.value))
const conjugationQuestion = computed(() => withExampleSubject(conjugationQuestionRaw.value))
const conjugationExample = computed(() => withExampleSubject(conjugationExampleRaw.value))

const shareUrl = computed(() => shareCode.value
  ? new URL(`/defi/${encodeURIComponent(shareCode.value)}`, requestUrl.origin).toString()
  : '')

const stepStatus = computed(() => ({
  verbs: selectedVerbs.value.length,
  tenses: selectedTenses.value.length
}))
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

function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && openDrawer.value) openDrawer.value = null
}

onMounted(() => {
  logUsage('homepage')
  document.addEventListener('keydown', onEscape)
})
onBeforeUnmount(() => document.removeEventListener('keydown', onEscape))

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
  activePresetId.value = undefined
  clearMessages()
}

function goToStep(step: WizardStep) {
  if (step === 2 && selectedVerbs.value.length === 0) return
  if ((step === 3 || step === 4) && !isReady.value) return
  currentStep.value = step
  if (step === 3) void refreshConjugationExample()
  nextTick(() => document.querySelector<HTMLElement>('.wizard-panel')?.focus())
}

function nextStep() {
  if (currentStep.value === 1 && selectedVerbs.value.length) goToStep(2)
  else if (currentStep.value === 2 && selectedTenses.value.length) goToStep(3)
  else if (currentStep.value === 3) goToStep(4)
}

function previousStep() {
  if (currentStep.value > 1) goToStep((currentStep.value - 1) as WizardStep)
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
  activePresetId.value = preset.id
  notice.value = randomCount
    ? `${randomCount} verbes ont été tirés au hasard dans « ${preset.label} ».`
    : `Le défi « ${preset.label} » est prêt.`
  actionError.value = ''
  openDrawer.value = null
  currentStep.value = 4
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
    activePresetId.value = undefined
    challengeCode.value = restored.code
    notice.value = `Le défi ${restored.code} est chargé. Tu peux le lancer ou le modifier.`
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

async function refreshConjugationExample() {
  if (!isReady.value) {
    conjugationInstructionRaw.value = ''
    conjugationQuestionContextRaw.value = ''
    conjugationQuestionRaw.value = ''
    conjugationExampleRaw.value = ''
    return
  }

  const request = ++conjugationExampleRequest
  conjugationExampleLoading.value = true
  try {
    const exampleConfig = {
      ...challenge.value,
      questionCount: 50,
      inclusivePronouns: false,
      includeComplements: challenge.value.includeComplements
        && challenge.value.complementPlacement !== 'mixed',
    }
    const needsAnteposedComplement = challenge.value.exerciseKind === 'conjugation'
      && challenge.value.includeComplements
      && challenge.value.complementPlacement === 'before'
    const matchesExample = (question: ExerciseQuestion) => (
      (question.pronom === 'il' || question.personId === 6)
        && (!needsAnteposedComplement || (
          question.complementPosition === 'before'
          && question.agreementReminder
          && !(question.agreementReminder.gender === 'masculin' && question.agreementReminder.number === 'singulier')
        ))
    )
    const findExample = async (config: typeof exampleConfig, attempts = 3) => {
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const generated = await api.generateQuestions(config)
        const found = generated.find(matchesExample)
        if (found) return found
      }
      return undefined
    }

    let example = await findExample(exampleConfig)
    if (!example && needsAnteposedComplement) {
      const fallbackTense = catalogue.value.temps.find(tense => tense.isCompound && tense.name === 'passé composé')
        ?? catalogue.value.temps.find(tense => tense.isCompound)
      const complementVerbIds = selectedVerbs.value
        .filter(verb => Boolean(verb.complementExample?.before))
        .map(verb => verb.id)
      if (fallbackTense) {
        example = await findExample({
          ...exampleConfig,
          verbIds: complementVerbIds.length ? complementVerbIds : exampleConfig.verbIds,
          tenseIds: [fallbackTense.id],
        }, 4)
      }
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
    }
  } catch {
    if (request === conjugationExampleRequest) {
      conjugationInstructionRaw.value = ''
      conjugationQuestionContextRaw.value = ''
      conjugationQuestionRaw.value = ''
      conjugationExampleRaw.value = ''
    }
  } finally {
    if (request === conjugationExampleRequest) conjugationExampleLoading.value = false
  }
}

watch(
  [
    () => challenge.value.verbIds.join(','),
    () => challenge.value.tenseIds.join(','),
    () => challenge.value.includeComplements,
    () => challenge.value.complementPlacement,
    () => challenge.value.exerciseKind,
  ],
  () => {
    if (currentStep.value === 3) void refreshConjugationExample()
  },
)

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
    <div class="code-loader" role="search" aria-label="Charger un défi avec son code">
      <div class="code-loader__heading">
        <span class="code-loader__icon" aria-hidden="true">↗</span>
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

    <div class="challenge-page wizard-page">
      <header class="wizard-hero">
        
        <h1>Que veux-tu travailler&nbsp;?</h1>
     
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
        <div class="mobile-drawer-triggers" aria-label="Raccourcis du constructeur">
          <button type="button" @click="openDrawer = 'presets'"><span aria-hidden="true">★</span> Défis prêts</button>
        </div>

        <p v-if="actionError" class="workspace-message workspace-message--error" role="alert">{{ actionError }}</p>
        <p v-else-if="notice" class="workspace-message workspace-message--success" aria-live="polite">{{ notice }}</p>

        <section class="wizard-panel" tabindex="-1" aria-labelledby="wizard-title">
          <h2 id="wizard-title" class="sr-only">Composer un défi personnalisé</h2>

          <nav class="wizard-steps" aria-label="Étapes de création du défi">
            <button :class="{ 'is-active': currentStep === 1, 'is-complete': stepStatus.verbs > 0 }" type="button" @click="goToStep(1)">
              <span>1</span><span><strong>Verbes</strong><small>{{ stepStatus.verbs ? `${stepStatus.verbs} choisi${stepStatus.verbs > 1 ? 's' : ''}` : 'À choisir' }}</small></span>
            </button>
            <span class="wizard-steps__line" aria-hidden="true" />
            <button :class="{ 'is-active': currentStep === 2, 'is-complete': stepStatus.tenses > 0 }" type="button" :disabled="stepStatus.verbs === 0" @click="goToStep(2)">
              <span>2</span><span><strong>Modes et temps</strong><small>{{ stepStatus.tenses ? `${stepStatus.tenses} choisi${stepStatus.tenses > 1 ? 's' : ''}` : 'À choisir' }}</small></span>
            </button>
            <span class="wizard-steps__line" aria-hidden="true" />
            <button :class="{ 'is-active': currentStep === 3, 'is-complete': currentStep === 4 }" type="button" :disabled="!isReady" @click="goToStep(3)">
              <span>3</span><span><strong>Options</strong><small>Finaliser le défi</small></span>
            </button>
            <span class="wizard-steps__line" aria-hidden="true" />
            <button :class="{ 'is-active': currentStep === 4 }" type="button" :disabled="!isReady" @click="goToStep(4)">
              <span>4</span><span><strong>Lancer</strong><small>Utiliser le défi</small></span>
            </button>
          </nav>

          <div class="wizard-content">
            <div v-if="currentStep === 1" class="wizard-step wizard-step--selection" aria-labelledby="verbs-title">
              <div class="wizard-step__actions">
                <div class="wizard-step__controls">
                  <button class="primary-button wizard-next-pulse" type="button" :disabled="!selectedVerbs.length" @click="nextStep">
                    Choisir les temps →
                  </button>
                </div>
              </div>
              <div class="wizard-step__intro wizard-step__intro--selection">
                <h2>Choisis les verbes</h2>
                <p>Écris un infinitif, puis sélectionne-le dans la liste.</p>
              </div>
              <VerbPicker
                :verbs="catalogue.verbes"
                :selected-ids="challenge.verbIds"
                @add="onAddVerb"
                @remove="onRemoveVerb"
                @clear="markAsCustom(); clearVerbs()"
              />
            </div>

            <div v-else-if="currentStep === 2" class="wizard-step wizard-step--selection" aria-labelledby="tenses-title">
              <div class="wizard-step__actions">
                <div class="wizard-step__controls">
                  <button class="secondary-button" type="button" @click="previousStep">← Retour</button>
                  <button class="primary-button wizard-next-pulse" type="button" :disabled="!selectedTenses.length" @click="nextStep">
                    Choisir les options →
                  </button>
                </div>
              </div>
              <div class="wizard-step__intro wizard-step__intro--selection">
                <h2>Choisis les modes et les temps</h2>
              </div>
              <TensePicker
                :modes="catalogue.modes"
                :tenses="catalogue.temps"
                :verbs="selectedVerbs"
                :selected-ids="challenge.tenseIds"
                :past-simple-pronouns="challenge.pastSimplePronouns"
                @toggle="onToggleTense"
                @select-all="markAsCustom(); selectAllTenses()"
                @clear="markAsCustom(); clearTenses()"
                @update-past-simple-pronouns="challenge.pastSimplePronouns = $event"
              />
            </div>

            <div v-else-if="currentStep === 3" class="wizard-step wizard-review">
              <div class="wizard-step__actions">
                <div class="wizard-step__controls">
                  <button class="secondary-button" type="button" @click="previousStep">← Retour</button>
                  <button class="primary-button wizard-next-pulse" type="button" @click="nextStep">Lancer →</button>
                </div>
              </div>
              <div class="wizard-step__intro">
                <h2>Options du défi</h2>
                <p>Choisis les derniers réglages avant de commencer.</p>
              </div>

              <ChallengeOptions
                :question-count="challenge.questionCount"
                :exercise-kind="challenge.exerciseKind"
                :inclusive-pronouns="challenge.inclusivePronouns"
                :include-complements="challenge.includeComplements"
                :complement-placement="challenge.complementPlacement"
                :complement-verbs="selectedVerbs"
                :conjugation-instruction="conjugationInstruction"
                :conjugation-question-context="conjugationQuestionContext"
                :conjugation-question="conjugationQuestion"
                :conjugation-example="conjugationExample"
                :conjugation-example-loading="conjugationExampleLoading"
                grid-layout
                id-prefix="wizard-step-options"
                @update-question-count="challenge.questionCount = $event; markAsCustom()"
                @update-exercise-kind="challenge.exerciseKind = $event; markAsCustom()"
                @update-inclusive-pronouns="challenge.inclusivePronouns = $event; markAsCustom()"
                @update-include-complements="challenge.includeComplements = $event; markAsCustom()"
                @update-complement-placement="challenge.complementPlacement = $event; markAsCustom()"
              />

            </div>

            <div v-else class="wizard-step wizard-launch-step">
              <div class="wizard-step__actions">
                <div class="wizard-step__controls">
                  <button class="secondary-button" type="button" @click="previousStep">← Retour</button>
                </div>
              </div>
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

        <button class="drawer-tab drawer-tab--left" type="button" :aria-expanded="openDrawer === 'presets'" @click="openDrawer = 'presets'">
          <span aria-hidden="true">★</span><strong>Défis prêts</strong>
        </button>
        <div v-if="openDrawer" class="wizard-drawer-backdrop" @click.self="openDrawer = null">
          <aside class="wizard-drawer" :class="`wizard-drawer--${openDrawer}`" role="dialog" aria-modal="true" :aria-labelledby="`${openDrawer}-drawer-title`">
            <header class="wizard-drawer__header">
              <div>
                <p class="builder-card__eyebrow">Raccourci</p>
                <h2 :id="`${openDrawer}-drawer-title`">Défis prêts à l’emploi</h2>
              </div>
              <button type="button" aria-label="Fermer le volet" @click="openDrawer = null">×</button>
            </header>
            <div class="wizard-drawer__content">
              <PresetPicker :presets="catalogue.presets" :active-preset-id="activePresetId" @select="selectPreset" />
            </div>
          </aside>
        </div>
      </template>
      </main>

      <ClassicExercise v-if="isExerciseOpen && exercisePresentation === 'classic'" :questions="questions" :exercise-kind="challenge.exerciseKind" @close="isExerciseOpen = false" />
      <ChatExercise v-if="isExerciseOpen && exercisePresentation === 'chat' && selectedCoach" :questions="questions" :coach="selectedCoach" @close="isExerciseOpen = false" />
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
.wizard-hero > p:last-child { max-width: 650px; margin: 15px auto 0; color: var(--muted); font-size: 1.08rem; line-height: 1.5; }
.wizard-shell { position: relative; width: min(1120px, calc(100% - 40px)); margin: 0 auto; }
.code-loader { display: grid; width: min(1120px, calc(100% - 40px)); grid-template-columns: minmax(230px, 1fr) minmax(330px, .9fr); align-items: center; gap: 12px 28px; margin: 0 auto 22px; padding: 14px 17px; border: 1px solid #b8d3cb; border-radius: 16px; background: rgb(255 255 255 / 94%); box-shadow: 0 9px 25px rgb(42 65 61 / 7%); }
.code-loader__heading { display: flex; align-items: center; gap: 11px; }
.code-loader__heading > div { display: grid; }
.code-loader__heading small { color: var(--muted); }
.code-loader__icon { display: grid; width: 38px; height: 38px; flex: 0 0 38px; place-items: center; color: white; background: var(--brand); border-radius: 11px; font-size: 1.2rem; font-weight: 900; }
.code-loader__control { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
.code-loader__code-entry { width: 100%; min-height: 46px; padding: 9px 13px; overflow: hidden; border: 1px solid #9ebdb4; border-radius: 10px; color: var(--ink); background: white; font-weight: 800; letter-spacing: .08em; line-height: 26px; text-transform: uppercase; white-space: nowrap; }
.code-loader__code-entry:empty::before { color: #7f8583; content: attr(data-placeholder); pointer-events: none; }
.code-loader__code-entry:focus { border-color: var(--brand); box-shadow: 0 0 0 4px rgb(52 95 88 / 12%); outline: 0; }
.code-loader__error { grid-column: 2; margin: -4px 0 0; color: var(--danger); font-size: .82rem; }
.wizard-panel { overflow: hidden; border: 1px solid rgba(174, 199, 191, .95); border-radius: 24px; background: rgb(255 255 255 / 94%); box-shadow: var(--shadow); outline: 0; }
.wizard-steps { display: grid; grid-template-columns: minmax(125px, 1fr) 30px minmax(165px, 1.15fr) 30px minmax(120px, 1fr) 30px minmax(115px, .9fr); align-items: center; padding: 17px 24px; border-bottom: 1px solid var(--line); background: #f6faf8; }
.wizard-steps button { display: flex; min-width: 0; padding: 7px; align-items: center; gap: 10px; text-align: left; color: #71817d; background: transparent; border: 0; }
.wizard-steps button > span:first-child { display: grid; width: 35px; height: 35px; flex: 0 0 35px; place-items: center; border: 2px solid #b8c7c3; border-radius: 50%; background: white; font-weight: 850; }
.wizard-steps button > span:last-child { display: grid; min-width: 0; }
.wizard-steps button strong { color: currentColor; font-size: .93rem; }
.wizard-steps button small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wizard-steps button.is-active { color: var(--brand-dark); }
.wizard-steps button.is-active > span:first-child { color: white; border-color: var(--brand); background: var(--brand); box-shadow: 0 0 0 5px var(--brand-pale); }
.wizard-steps button.is-complete:not(.is-active) > span:first-child { color: var(--success); border-color: #83b39b; background: var(--success-pale); }
.wizard-steps button:disabled { cursor: default; opacity: .5; }
.wizard-steps__line { height: 2px; background: #d6e0dd; }
.wizard-content { position: relative; min-height: 480px; padding: 30px clamp(18px, 5vw, 58px) 34px; }
.wizard-step { max-width: 820px; margin: 0 auto; }
.wizard-step--selection { padding-top: 54px; }
.wizard-step__actions { position: absolute; top: 30px; right: 30px; display: flex; align-items: flex-start; justify-content: flex-end; }
.wizard-step__controls { display: flex; align-items: center; gap: 8px; }
.wizard-next-pulse:not(:disabled) { animation: wizard-next-pulse 2s infinite; transform-origin: center; }
.wizard-step__intro { margin-bottom: 22px; text-align: center; }
.wizard-step__intro--selection { text-align: left; }
.wizard-step__intro h2 { margin: 0; color: var(--brand-dark); font-size: clamp(1.75rem, 3vw, 2.5rem); letter-spacing: -.04em; }
.wizard-step__intro p { max-width: 610px; margin: 8px auto 0; color: var(--muted); line-height: 1.5; }
.wizard-step__intro--selection p { margin-inline: 0; }
.wizard-step :deep(.builder-card) { box-shadow: none; }
.wizard-step :deep(.builder-card__header) { display: none; }
.wizard-step :deep(.verb-search) { padding-top: 23px; }
.wizard-review, .wizard-launch-step { padding-top: 54px; }
.wizard-review :deep(.options-card) { margin: 0 0 18px; box-shadow: none; }
.wizard-review :deep(.challenge-launch) { margin-top: 18px; box-shadow: none; }
.wizard-launch-step :deep(.challenge-launch) { margin-top: 0; box-shadow: none; }
.drawer-tab { position: fixed; z-index: 30; top: 43%; display: flex; padding: 12px 9px; align-items: center; gap: 7px; color: white; background: var(--brand); border: 0; box-shadow: 0 8px 24px rgb(36 73 66 / 24%); writing-mode: vertical-rl; }
.drawer-tab span { font-size: 1.15rem; }
.drawer-tab--left { left: 0; border-radius: 0 13px 13px 0; transform: rotate(180deg); }
.wizard-drawer-backdrop { position: fixed; z-index: 90; inset: 0; background: rgb(18 36 32 / 38%); }
.wizard-drawer { position: absolute; top: 0; bottom: 0; width: min(560px, calc(100% - 40px)); overflow-y: auto; background: #f5f8f6; box-shadow: 0 0 50px rgb(18 36 32 / 25%); animation: drawer-in 180ms ease-out; }
.wizard-drawer--presets { left: 0; }
.wizard-drawer__header { position: sticky; z-index: 2; top: 0; display: flex; padding: 19px 21px; align-items: center; justify-content: space-between; gap: 18px; border-bottom: 1px solid var(--line); background: rgb(255 255 255 / 96%); }
.wizard-drawer__header h2 { margin: 0; color: var(--brand-dark); }
.wizard-drawer__header button { display: grid; width: 39px; height: 39px; place-items: center; border: 1px solid var(--line); border-radius: 50%; background: white; color: var(--ink); font-size: 1.5rem; }
.wizard-drawer__content { padding: 18px; }
.wizard-drawer__content :deep(.preset-panel) { margin: 0; padding: 0; border: 0; background: transparent; box-shadow: none; }
.wizard-drawer__content :deep(.preset-list) { grid-template-columns: 1fr; }
.wizard-drawer__content :deep(.options-card) { box-shadow: none; }
.mobile-drawer-triggers { display: none; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@keyframes drawer-in { from { transform: translateX(var(--drawer-offset, -24px)); opacity: .7; } }
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

@media (prefers-reduced-motion: reduce) {
  .wizard-next-pulse:not(:disabled) { animation: none; }
}

@media (max-width: 820px) {
  .wizard-hero { padding: 28px 16px 18px; }
  .wizard-hero > p:last-child { font-size: .98rem; }
  .wizard-shell { width: min(100% - 20px, 650px); }
  .code-loader { width: min(100% - 20px, 650px); grid-template-columns: 1fr; gap: 10px; }
  .code-loader__error { grid-column: 1; }
  .mobile-drawer-triggers { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 14px; }
  .mobile-drawer-triggers button { min-height: 44px; border: 1px solid #9ebdb4; border-radius: 11px; color: var(--brand-dark); background: rgb(255 255 255 / 88%); font-weight: 800; }
  .drawer-tab { display: none; }
  .wizard-steps { grid-template-columns: 1fr 10px 1fr 10px 1fr 10px 1fr; padding: 13px 6px; }
  .wizard-steps button { justify-content: center; padding: 5px 2px; }
  .wizard-steps button > span:last-child small { display: none; }
  .wizard-steps button strong { font-size: .75rem; text-align: center; }
  .wizard-steps button > span:first-child { width: 31px; height: 31px; flex-basis: 31px; }
  .wizard-steps button { flex-direction: column; gap: 4px; }
  .wizard-content { min-height: 430px; padding: 22px 12px 24px; }
  .wizard-step--selection { padding-top: 58px; }
  .wizard-review, .wizard-launch-step { padding-top: 58px; }
  .wizard-step__actions { top: 22px; right: 22px; }
  .wizard-step__intro { padding: 0 8px; }
  .wizard-step__controls { justify-content: flex-end; flex-wrap: wrap; }
  .wizard-drawer { top: auto; width: 100%; max-height: 88vh; border-radius: 22px 22px 0 0; animation-name: drawer-up; }
  .wizard-drawer--presets { right: 0; left: 0; }
  .wizard-review :deep(.challenge-launch) { padding: 17px 12px; }
  @keyframes drawer-up { from { transform: translateY(30px); opacity: .7; } }
}

@media (max-width: 470px) {
  .code-loader__heading small { font-size: .78rem; }
  .code-loader__control { grid-template-columns: 1fr; }
  .code-loader__control button { width: 100%; }
  .wizard-step__controls .primary-button,
  .wizard-step__controls .secondary-button { padding-inline: 11px; }
}
</style>

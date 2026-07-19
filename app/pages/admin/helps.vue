<script setup lang="ts">
import type { CoachCharacter, CoachHelpBlock, CoachHelpBlockType, CoachHelpTemplate } from '~~/shared/types/coach'
import { COACH_HELP_BLOCK_TYPES } from '~~/shared/types/coach'
import type { ConjugationMode, ConjugationTense, ExerciseQuestion, Verb } from '~~/shared/types/conjugation'
import type { CoachHelpContentValues } from '~~/shared/utils/coach-help'
import { coachHelpQuestionVariables } from '~~/shared/utils/coach-help'
import { formatCharacterNames } from '~~/shared/utils/coach-character'
import { matchingVerbs, normalizeVerbSearch } from '~~/shared/utils/verb-search'
import { buildRadicalReference } from '~~/shared/utils/radical-reference'
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

const BLOCK_LABELS: Record<CoachHelpBlockType, string> = {
  normal: 'Normal',
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  danger: 'Danger',
}
const BLOCK_DESCRIPTIONS: Record<CoachHelpBlockType, string> = {
  normal: 'Carte blanche pour le contenu principal.',
  info: 'Encadré bleu pour une information utile.',
  success: 'Encadré vert pour une règle acquise ou un résultat positif.',
  warning: 'Encadré jaune pour attirer l’attention.',
  danger: 'Encadré orange pour une exception importante.',
}
const DEFINITION_BLOCK_CONTENT = '{definitionHelp}'
const ENDINGS_BLOCK_CONTENT = '{endingsHelp}'
const CONTEXTUAL_BASE_BLOCK_CONTENT = '{contextualBaseHelp}'
const REFERENCE_FORM_BLOCK_CONTENT = '{referenceFormHelp}'
const { user, handleUnauthorized } = useAdminAuth()
const route = useRoute()
const helps = ref<CoachHelpTemplate[]>([])
const characters = ref<CoachCharacter[]>([])
const draft = ref<CoachHelpTemplate | null>(null)
const selectedId = ref<number | null>(null)
const selectedInsertionIndex = ref(0)
const autosaveState = ref<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle')
const loading = ref(false)
const publishing = ref(false)
const headerBlockAdded = ref(false)
const error = ref('')
const helpMain = useTemplateRef<HTMLElement>('helpMain')
let loaded = false
let autosaveTimer: ReturnType<typeof setTimeout> | null = null
let autosavePromise: Promise<void> | null = null
let previewFollowFrame: number | null = null
let previewFollowTarget: number | null = null
let previewFollowing = false
let lastSavedSnapshot = ''

const PREVIEW_BASE_VALUES: CoachHelpContentValues = {
  coach: { firstName: 'Sami' }, verb: 'manger', definition: 'prendre un aliment', helpTitle: 'manger à l’imparfait', subject: 'nous', mode: 'indicatif', tense: 'imparfait',
  correctAnswers: 'nous mangions une pomme', auxiliaryAnswer: '', pastParticipleAnswer: '', unagreedPastParticiple: 'mangé',
  COD: 'une pomme', isCODplace_avant: 'non', COI: '', isCOIplace_avant: 'non',
  conjugationBase: 'mang-', conjugationEnding: '-ions',
  referenceMode: 'indicatif', referenceTense: 'présent', referenceSubject: 'nous', referenceForm: 'mangeons', referenceRadical: 'mang-', removedEnding: '-ons',
}
const PREVIEW_VERB = { id: 0, infinitif: 'manger', meaning: 'Mettre de la nourriture dans sa bouche, puis l’avaler.', groupeConjugaison: 1, terminaison: 'er', participePasse: 'mangé' } as Verb
interface PreviewConjugation { tenseId: number, personId: number, conjugaison1: string, pronom: string }
const previewVerbs = ref<Verb[]>([])
const previewModes = ref<ConjugationMode[]>([])
const previewTenses = ref<ConjugationTense[]>([])
const previewSelectedVerb = ref<Verb>(PREVIEW_VERB)
const previewConjugations = ref<PreviewConjugation[]>([])
const previewConjugation = ref('mangions')
const previewPronoun = ref('nous')
const previewTenseId = ref(0)
const previewPersonId = ref(7)
const previewVerbQuery = ref('manger')
const previewSuggestionsOpen = ref(false)
const previewActiveSuggestion = ref(-1)
let previewVerbRequest = 0
const previewVerbSuggestions = computed(() => normalizeVerbSearch(previewVerbQuery.value)
  ? matchingVerbs(previewVerbs.value, previewVerbQuery.value).slice(0, 8)
  : [])
const previewSelectedTense = computed(() => previewTenses.value.find(tense => tense.id === previewTenseId.value))
const previewSelectedMode = computed(() => previewModes.value.find(mode => mode.id === previewSelectedTense.value?.modeId))
const previewTenseOptions = computed(() => previewTenses.value
  .filter(tense => previewConjugations.value.some(form => form.tenseId === tense.id && form.conjugaison1.trim()))
  .map(tense => ({
    value: tense.id,
    label: tense.name,
    group: previewModes.value.find(mode => mode.id === tense.modeId)?.name || 'Autres formes',
    description: tense.isCompound ? 'Temps composé' : 'Temps simple',
  })))
const previewPersonOptions = computed(() => {
  const seen = new Set<number>()
  return previewConjugations.value
    .filter(form => form.tenseId === previewTenseId.value && form.conjugaison1.trim() && !seen.has(form.personId) && seen.add(form.personId))
    .map(form => ({ value: form.personId, label: form.pronom || 'Forme impersonnelle', description: form.conjugaison1 }))
})
const previewRadicalReference = computed<ExerciseQuestion['radicalReference']>(() => {
  return buildRadicalReference({
    infinitive: previewSelectedVerb.value.infinitif,
    mode: previewSelectedMode.value?.name || '',
    tense: previewSelectedTense.value?.name || '',
    personId: previewPersonId.value,
    conjugation: previewConjugation.value,
    isCompound: previewSelectedTense.value?.isCompound,
  }, previewConjugations.value.map((form) => {
    const tense = previewTenses.value.find(item => item.id === form.tenseId)
    return {
      mode: previewModes.value.find(item => item.id === tense?.modeId)?.name || '',
      tense: tense?.name || '',
      personId: form.personId,
      pronoun: form.pronom,
      form: form.conjugaison1,
    }
  }))
})
const previewQuestion = computed<ExerciseQuestion>(() => ({
  titre: '',
  consigne: '',
  reponses: [previewConjugation.value],
  reponsesPourCorrige: [`${previewPronoun.value} ${previewConjugation.value}`],
  infinitif: previewSelectedVerb.value.infinitif,
  pronom: previewPronoun.value,
  saisiePrefixe: previewPronoun.value,
  temps: previewSelectedTense.value?.name || 'imparfait',
  mode: previewSelectedMode.value?.name || 'indicatif',
  isCompound: previewSelectedTense.value?.isCompound || false,
  conjugaison1: previewConjugation.value,
  nousForm: previewConjugations.value.find(form => form.tenseId === previewTenseId.value && form.personId === 7)?.conjugaison1 || null,
  ...(previewRadicalReference.value ? { radicalReference: previewRadicalReference.value } : {}),
}))
const previewValues = computed<CoachHelpContentValues>(() => ({
  ...PREVIEW_BASE_VALUES,
  coach: PREVIEW_BASE_VALUES.coach,
  definition: previewSelectedVerb.value.meaning || '',
  helpTitle: `${previewSelectedVerb.value.infinitif} · ${previewSelectedTense.value?.name || 'imparfait'} (${(previewSelectedMode.value?.name || 'indicatif').toLocaleLowerCase('fr')})`,
  ...coachHelpQuestionVariables(previewQuestion.value, previewSelectedVerb.value),
}))

useHead({ title: 'Aides — Administration' })
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const requestedCharacterId = computed(() => Number(route.query.character))
const currentCharacter = computed(() => characters.value.find(character => character.id === requestedCharacterId.value) || null)
const autosaveLabel = computed(() => {
  if (autosaveState.value === 'saving') return 'Enregistrement…'
  if (autosaveState.value === 'dirty') return draft.value?.name.trim() ? 'Modification en attente…' : 'Donne un nom à cette aide…'
  if (autosaveState.value === 'error') return 'Échec de l’enregistrement'
  return 'Toutes les modifications sont enregistrées'
})

function cancelScheduledAutosave() {
  if (autosaveTimer) clearTimeout(autosaveTimer)
  autosaveTimer = null
}
function setDraft(help: CoachHelpTemplate) {
  cancelScheduledAutosave()
  draft.value = clone(help)
  draft.value.headerTitle = '{helpTitle}'
  headerBlockAdded.value = Boolean(draft.value.headerDescription.trim())
  selectedId.value = help.id || null
  lastSavedSnapshot = help.id ? JSON.stringify(draft.value) : ''
  autosaveState.value = help.id ? 'idle' : 'dirty'
  error.value = ''
  selectedInsertionIndex.value = help.blocks.length
}
function syncPreviewForm(preferNous = false) {
  const forms = previewConjugations.value.filter(item => item.tenseId === previewTenseId.value && item.conjugaison1.trim())
  const form = (!preferNous && forms.find(item => item.personId === previewPersonId.value))
    || forms.find(item => normalizeVerbSearch(item.pronom) === 'nous')
    || forms[0]
  if (!form) return
  previewPersonId.value = form.personId
  previewPronoun.value = form.pronom || ''
  previewConjugation.value = form.conjugaison1
}
function selectPreviewTense(value: string | number) {
  previewTenseId.value = Number(value)
  syncPreviewForm(true)
}
function selectPreviewPerson(value: string | number) {
  previewPersonId.value = Number(value)
  syncPreviewForm()
}
async function choosePreviewVerb(verb: Verb) {
  const request = ++previewVerbRequest
  previewSelectedVerb.value = verb
  previewVerbQuery.value = verb.infinitif
  previewSuggestionsOpen.value = false
  previewActiveSuggestion.value = -1
  const indicative = previewModes.value.find(mode => normalizeVerbSearch(mode.name) === 'indicatif')
  const imparfait = previewTenses.value.find(tense => tense.modeId === indicative?.id && normalizeVerbSearch(tense.name) === 'imparfait')
  if (!imparfait) return
  try {
    const response = await $fetch<{
      verb: Verb
      conjugations: PreviewConjugation[]
    }>(`/api/admin/verbes/${verb.id}`)
    if (request !== previewVerbRequest) return
    previewSelectedVerb.value = { ...verb, ...response.verb }
    previewConjugations.value = response.conjugations
    const selectedTenseStillExists = response.conjugations.some(item => item.tenseId === previewTenseId.value && item.conjugaison1.trim())
    if (!selectedTenseStillExists) previewTenseId.value = imparfait.id
    if (!response.conjugations.some(item => item.tenseId === previewTenseId.value && item.conjugaison1.trim())) {
      previewTenseId.value = response.conjugations.find(item => item.conjugaison1.trim())?.tenseId || 0
    }
    syncPreviewForm(true)
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, `Impossible de charger l’aperçu de « ${verb.infinitif} ».`)
  }
}
function updatePreviewSuggestions() {
  previewActiveSuggestion.value = previewVerbSuggestions.value.length ? 0 : -1
  previewSuggestionsOpen.value = previewVerbSuggestions.value.length > 0
}
function onPreviewVerbKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    previewSuggestionsOpen.value = false
    previewActiveSuggestion.value = -1
    return
  }
  if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return
  if (!previewSuggestionsOpen.value) updatePreviewSuggestions()
  if (!previewVerbSuggestions.value.length) return
  if (event.key === 'Enter') {
    event.preventDefault()
    const verb = previewVerbSuggestions.value[Math.max(0, previewActiveSuggestion.value)]
    if (verb) void choosePreviewVerb(verb)
    return
  }
  event.preventDefault()
  const direction = event.key === 'ArrowDown' ? 1 : -1
  previewActiveSuggestion.value = (previewActiveSuggestion.value + direction + previewVerbSuggestions.value.length) % previewVerbSuggestions.value.length
}
function closePreviewSuggestions() {
  window.setTimeout(() => { previewSuggestionsOpen.value = false }, 120)
}
async function load() {
  loading.value = true
  try {
    if (!Number.isInteger(requestedCharacterId.value) || requestedCharacterId.value < 1) {
      await navigateTo('/admin/characters')
      return
    }
    const ensured = await $fetch<{ helpId: number }>(`/api/admin/coach-characters/${requestedCharacterId.value}/help`, { method: 'POST' })
    const [helpResponse, characterResponse, catalogueResponse] = await Promise.all([
      $fetch<{ helps: CoachHelpTemplate[] }>('/api/admin/coach-helps'),
      $fetch<{ characters: CoachCharacter[] }>('/api/admin/coach-characters'),
      $fetch<{ verbes: Verb[], modes: ConjugationMode[], temps: ConjugationTense[] }>('/api/catalogue'),
    ])
    helps.value = helpResponse.helps
    characters.value = characterResponse.characters
    previewVerbs.value = catalogueResponse.verbes.filter(verb => verb.id > 0)
    previewModes.value = catalogueResponse.modes
    previewTenses.value = catalogueResponse.temps
    const initialPreviewVerb = previewVerbs.value.find(verb => normalizeVerbSearch(verb.infinitif) === 'manger') || previewVerbs.value[0]
    if (initialPreviewVerb && previewSelectedVerb.value.id === 0) await choosePreviewVerb(initialPreviewVerb)
    const character = characters.value.find(item => item.id === requestedCharacterId.value)
    const characterHelp = helps.value.find(help => help.id === ensured.helpId)
    if (!character || !characterHelp) throw new Error('Association caractère–aide introuvable')
    setDraft(characterHelp)
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de charger les aides.')
  } finally {
    loading.value = false
  }
}
function scheduleAutosave() {
  cancelScheduledAutosave()
  autosaveTimer = setTimeout(() => { void autosaveHelp() }, 650)
}
async function autosaveHelp() {
  cancelScheduledAutosave()
  if (autosavePromise) {
    await autosavePromise
    if (draft.value && JSON.stringify(draft.value) !== lastSavedSnapshot) await autosaveHelp()
    return
  }
  const current = draft.value
  if (!current) return
  const snapshot = JSON.stringify(current)
  if (current.id && snapshot === lastSavedSnapshot) return
  if (!current.name.trim()) {
    autosaveState.value = 'dirty'
    return
  }
  const payload = clone(current)
  payload.status = 'draft'
  payload.blocks.forEach((block, index) => { block.sortOrder = index + 1 })
  autosaveState.value = 'saving'
  error.value = ''
  if (!current.id) {
    autosaveState.value = 'error'
    error.value = 'Cette aide doit être ouverte depuis son caractère.'
    return
  }
  autosavePromise = $fetch(`/api/admin/coach-helps/${current.id}`, { method: 'PUT', body: payload }).then(() => undefined)
  try {
    await autosavePromise
    lastSavedSnapshot = JSON.stringify(payload)
    const listed = helps.value.find(help => help.id === payload.id)
    if (listed) Object.assign(listed, clone(payload))
    else helps.value.push(clone(payload))
    if (draft.value?.id === payload.id && JSON.stringify(draft.value) === lastSavedSnapshot) autosaveState.value = 'saved'
    else scheduleAutosave()
  } catch (caught) {
    autosaveState.value = 'error'
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible d’enregistrer cette aide.')
  } finally {
    autosavePromise = null
  }
}
async function publishAll() {
  await autosaveHelp()
  if (autosaveState.value === 'dirty' || autosaveState.value === 'error') {
    error.value = 'Enregistre une aide valide avant de publier.'
    return
  }
  publishing.value = true
  error.value = ''
  try {
    await $fetch('/api/admin/coach-helps/publish', { method: 'POST' })
    await load()
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de publier les aides.')
  } finally {
    publishing.value = false
  }
}
function insertBlock(type: CoachHelpBlockType) {
  if (!draft.value) return
  const block: CoachHelpBlock = {
    id: 0,
    type,
    title: '',
    content: '',
    explanationApproach: 'cif-falc',
    isActive: true,
    sortOrder: selectedInsertionIndex.value + 1,
    children: [],
  }
  draft.value.blocks.splice(selectedInsertionIndex.value, 0, block)
  selectedInsertionIndex.value += 1
}
function addHeaderBlock() {
  if (!draft.value || headerBlockAdded.value) return
  draft.value.headerTitle = '{helpTitle}'
  headerBlockAdded.value = true
}
function removeHeaderBlock() {
  if (!draft.value) return
  draft.value.headerTitle = '{helpTitle}'
  draft.value.headerDescription = ''
  headerBlockAdded.value = false
}
function stopPreviewFollowing() {
  previewFollowing = false
  previewFollowTarget = null
  if (previewFollowFrame !== null) window.cancelAnimationFrame(previewFollowFrame)
  previewFollowFrame = null
}
function animatePreviewFollowing() {
  if (previewFollowFrame !== null) return
  previewFollowFrame = window.requestAnimationFrame(() => {
    previewFollowFrame = null
    if (!previewFollowing || previewFollowTarget === null) return
    const distance = previewFollowTarget - window.scrollY
    if (Math.abs(distance) < 1) {
      window.scrollTo({ top: previewFollowTarget, behavior: 'auto' })
      return
    }
    const maximumStep = Math.max(24, window.innerHeight * 0.065)
    const easedStep = Math.sign(distance) * Math.min(Math.abs(distance) * 0.18, maximumStep)
    window.scrollTo({ top: window.scrollY + easedStep, behavior: 'auto' })
    animatePreviewFollowing()
  })
}
function followPreviewScroll(position: { blockIndex: number, progress: number }) {
  if (!window.matchMedia('(min-width: 1251px)').matches) return
  previewFollowing = true
  if (!helpMain.value) return
  const editor = helpMain.value.querySelector<HTMLElement>(`[data-admin-help-block-index="${position.blockIndex}"]`)
  if (!editor) return
  const rect = editor.getBoundingClientRect()
  const availableHeight = Math.max(180, window.innerHeight - 150)
  const internalTravel = Math.max(0, rect.height - availableHeight)
  previewFollowTarget = Math.max(0, window.scrollY + rect.top - 90 + internalTravel * position.progress)
  animatePreviewFollowing()
}
function insertEndingsBlock() {
  if (!draft.value) return
  const block: CoachHelpBlock = {
    id: 0,
    type: 'normal',
    title: 'Terminaisons',
    content: ENDINGS_BLOCK_CONTENT,
    explanationApproach: 'cif-falc',
    isActive: true,
    sortOrder: selectedInsertionIndex.value + 1,
    children: [],
  }
  draft.value.blocks.splice(selectedInsertionIndex.value, 0, block)
  selectedInsertionIndex.value += 1
}
function insertDefinitionBlock() {
  if (!draft.value) return
  const block: CoachHelpBlock = {
    id: 0,
    type: 'normal',
    title: 'Définition',
    content: DEFINITION_BLOCK_CONTENT,
    explanationApproach: 'cif-falc',
    isActive: true,
    sortOrder: selectedInsertionIndex.value + 1,
    children: [],
  }
  draft.value.blocks.splice(selectedInsertionIndex.value, 0, block)
  selectedInsertionIndex.value += 1
}
function insertContextualBaseBlock() {
  if (!draft.value) return
  const block: CoachHelpBlock = {
    id: 0,
    type: 'normal',
    title: 'Trouve le radical de {verb}',
    content: CONTEXTUAL_BASE_BLOCK_CONTENT,
    explanationApproach: 'cif-falc',
    isActive: true,
    sortOrder: selectedInsertionIndex.value + 1,
    children: [],
  }
  draft.value.blocks.splice(selectedInsertionIndex.value, 0, block)
  selectedInsertionIndex.value += 1
}
function insertReferenceFormBlock() {
  if (!draft.value) return
  const block: CoachHelpBlock = {
    id: 0,
    type: 'normal',
    title: 'Forme repère',
    content: REFERENCE_FORM_BLOCK_CONTENT,
    explanationApproach: 'cif-falc',
    isActive: true,
    sortOrder: selectedInsertionIndex.value + 1,
    children: [],
  }
  draft.value.blocks.splice(selectedInsertionIndex.value, 0, block)
  selectedInsertionIndex.value += 1
}
watch(draft, (current) => {
  if (loading.value || !current) return
  if (current.id && JSON.stringify(current) === lastSavedSnapshot) return
  if (current.status === 'published') current.status = 'draft'
  autosaveState.value = 'dirty'
  scheduleAutosave()
}, { deep: true })
watch(user, (current) => {
  if (current && !loaded) { loaded = true; void load() }
  if (!current) loaded = false
}, { immediate: true })
onBeforeRouteLeave(async () => { await autosaveHelp() })
onBeforeUnmount(() => {
  cancelScheduledAutosave()
  stopPreviewFollowing()
})
</script>

<template>
  <AdminAuthBoundary><AdminShell><div class="help-admin">
    <header class="admin-section-heading"><div><p class="admin-eyebrow">Aide du caractère</p><h1>{{ currentCharacter ? `${currentCharacter.emoticon} ${formatCharacterNames(currentCharacter)}` : 'Aide' }}</h1></div><div class="help-heading-actions"><NuxtLink v-if="currentCharacter" class="admin-button admin-button--small" :to="{ path: '/admin/characters', query: { character: currentCharacter.id } }">Retour au caractère</NuxtLink><button class="admin-button help-publish-button" type="button" :disabled="publishing || loading" @click="publishAll">{{ publishing ? 'Publication…' : 'Publier' }}</button></div></header>

    <p v-if="loading" class="admin-muted">Chargement de l’aide…</p>
    <p v-if="error" class="admin-notice admin-notice--error">{{ error }}</p>

    <form v-if="draft" class="help-workspace" @submit.prevent>
      <aside class="admin-card block-library">
        <div><p class="admin-eyebrow">Blocs de l’aide</p><h2>Éléments</h2><p class="admin-muted">Ajoutez un en-tête complémentaire ou choisissez une position pour un bloc du body.</p></div>
        <button class="library-block library-block--special" type="button" :disabled="headerBlockAdded" @click="addHeaderBlock">
          <span class="library-block__sample is-header"><i /><i /><i /></span>
          <strong>Header</strong><p>{{ headerBlockAdded ? 'Déjà ajouté dans la colonne centrale.' : 'Texte complémentaire placé après le titre automatique.' }}</p>
        </button>
        <button v-for="type in COACH_HELP_BLOCK_TYPES" :key="type" class="library-block" type="button" :aria-label="`Insérer un bloc ${BLOCK_LABELS[type]} à la position ${selectedInsertionIndex + 1}`" @click="insertBlock(type)">
          <span class="library-block__sample" :class="`is-${type}`"><i /> <i /><i /></span>
          <strong>{{ BLOCK_LABELS[type] }}</strong><p>{{ BLOCK_DESCRIPTIONS[type] }}</p>
        </button>
        <button class="library-block" type="button" :aria-label="`Insérer un bloc Définition à la position ${selectedInsertionIndex + 1}`" @click="insertDefinitionBlock">
          <span class="library-block__sample is-definition"><i /><i /><i /></span>
          <strong>Définition</strong><p>Affiche automatiquement le verbe de la question et sa définition FALC.</p>
        </button>
        <button class="library-block" type="button" :aria-label="`Insérer un bloc Radical à la position ${selectedInsertionIndex + 1}`" @click="insertContextualBaseBlock">
          <span class="library-block__sample is-contextual-base"><i /><i /><i /></span>
          <strong>Radical</strong><p>Radical fiable, alternances et irrégularités adaptés à la forme demandée.</p>
        </button>
        <button class="library-block" type="button" :aria-label="`Insérer un bloc Forme repère à la position ${selectedInsertionIndex + 1}`" @click="insertReferenceFormBlock">
          <span class="library-block__sample is-nous-form"><i /><i /><i /></span>
          <strong>Forme repère</strong><p>Choisit automatiquement la personne et la forme les plus utiles à mémoriser pour le mode et le temps.</p>
        </button>
        <button class="library-block" type="button" :aria-label="`Insérer un bloc Terminaisons à la position ${selectedInsertionIndex + 1}`" @click="insertEndingsBlock">
          <span class="library-block__sample is-endings"><i /><i /><i /></span>
          <strong>Terminaisons</strong><p>Contenu dynamique adapté au verbe, au temps et au mode de la question.</p>
        </button>
      </aside>

      <main ref="helpMain" class="help-main" @wheel.capture="stopPreviewFollowing" @pointerdown.capture="stopPreviewFollowing" @touchstart.capture="stopPreviewFollowing" @focusin.capture="stopPreviewFollowing">
        <section class="admin-card help-panel character-assignment">
          <div v-if="currentCharacter" class="help-character-owner"><span class="help-character-owner__icon" aria-hidden="true">{{ currentCharacter.emoticon }}</span><span><small>Caractère propriétaire</small><strong>{{ formatCharacterNames(currentCharacter) }}</strong></span></div>
          <label class="admin-field"><span>Nom de l’aide *</span><input v-model="draft.name" maxlength="120" required></label>
          <label class="admin-field"><span>Description</span><textarea v-model="draft.description" rows="2" maxlength="500" /></label>
        </section>

        <section v-if="headerBlockAdded" class="admin-card help-panel help-header-editor">
          <div class="help-panel__title"><div><p class="admin-eyebrow">Bloc spécial</p><h2>Header</h2></div><button class="admin-button admin-button--danger admin-button--small" type="button" @click="removeHeaderBlock">Supprimer</button></div>
          <p class="admin-muted block-editor__intro"><code>{helpTitle}</code> est toujours affiché automatiquement. Le texte ci-dessous vient à sa suite.</p>
          <div class="help-header-fields"><AdminHtmlSourceEditor v-model="draft.headerDescription" label="Texte complémentaire — HTML autorisé" :rows="4" :maxlength="2000" /></div>
        </section>

        <section class="admin-card help-panel block-editor">
          <p class="admin-eyebrow">Body</p>
          <details class="help-variables"><summary>Variables et HTML utilisables</summary><p><strong>{helpTitle}</strong> · {coach} · {verb} · <strong>{definition}</strong> · {subject} · {mode} · {tense} · <strong>{contextualBaseHelp}</strong> · <strong>{referenceFormHelp}</strong> · <strong>{endingsHelp}</strong> · <strong>{conjugationBase}</strong> · <strong>{conjugationEnding}</strong> · {referenceMode} · {referenceTense} · {referenceSubject} · {referenceForm} · {referenceRadical} · {removedEnding} · {correctAnswers} · {auxiliaryAnswer} · {pastParticipleAnswer} · {unagreedPastParticiple} · {COD} · {isCODplace_avant} · {COI} · {isCOIplace_avant}</p><dl><div><dt>{helpTitle}</dt><dd>Le titre automatique de l’aide, par exemple « manger à l’imparfait ».</dd></div><div><dt>{definition}</dt><dd>La définition du verbe de la question.</dd></div><div><dt>{contextualBaseHelp}</dt><dd>L’explication automatique du radical, adaptée à l’approche pédagogique du bloc.</dd></div><div><dt>{referenceFormHelp}</dt><dd>La forme repère à mémoriser. La personne est choisie automatiquement selon le mode, le temps et le verbe.</dd></div><div><dt>{endingsHelp}</dt><dd>Le texte grammatical, le radical fiable et les terminaisons correspondant au verbe, au temps et au mode.</dd></div><div><dt>{conjugationBase} / {conjugationEnding}</dt><dd>Le radical et la terminaison de la forme demandée lorsqu’ils peuvent être déterminés sans ambiguïté.</dd></div><div><dt>{referenceMode} / {referenceTense} / {referenceSubject}</dt><dd>Le contexte grammatical de la forme repère utilisée pour construire le radical.</dd></div><div><dt>{referenceForm} / {referenceRadical} / {removedEnding}</dt><dd>La forme repère validée, son radical et la terminaison que la stratégie retire.</dd></div><div><dt>{correctAnswers}</dt><dd>Toutes les réponses complètes acceptées.</dd></div><div><dt>{auxiliaryAnswer}</dt><dd>La forme attendue de l’auxiliaire.</dd></div><div><dt>{pastParticipleAnswer}</dt><dd>Le participe passé avec l’accord attendu.</dd></div><div><dt>{unagreedPastParticiple}</dt><dd>Le participe passé masculin singulier, sans accord.</dd></div><div><dt>{COD} / {COI}</dt><dd>Le complément correspondant, s’il existe.</dd></div><div><dt>{isCODplace_avant} / {isCOIplace_avant}</dt><dd>« oui » lorsque le complément concerné est placé avant, sinon « non ».</dd></div></dl><p>Balises autorisées : p, br, strong, em, mark, small, ul, ol, li, blockquote, code, sub, sup… Les scripts et attributs HTML sont supprimés.</p></details>

          <div class="help-blocks">
            <template v-for="(block, index) in draft.blocks" :key="`${block.id}-${index}`">
              <button class="insertion-point" :class="{ selected: selectedInsertionIndex === index }" type="button" @click="selectedInsertionIndex = index"><span>{{ selectedInsertionIndex === index ? 'Insérer ici' : '+' }}</span></button>
              <AdminCoachHelpBlockEditor :data-admin-help-block-index="index" :block="block" :siblings="draft.blocks" :index="index" />
            </template>
            <button class="insertion-point" :class="{ selected: selectedInsertionIndex === draft.blocks.length }" type="button" @click="selectedInsertionIndex = draft.blocks.length"><span>{{ selectedInsertionIndex === draft.blocks.length ? 'Insérer ici' : '+' }}</span></button>
          </div>
        </section>
        <div class="help-save-bar"><p class="help-autosave" :class="`is-${autosaveState}`" aria-live="polite"><span />{{ autosaveLabel }}</p><button v-if="autosaveState === 'error'" class="admin-button admin-button--small" type="button" @click="autosaveHelp">Réessayer</button></div>
      </main>

      <aside class="preview-column">
        <div class="preview-column__heading">
          <p class="admin-eyebrow">Aperçu</p>
          <h2>Aperçu utilisateur</h2>
          <label class="preview-verb-picker">
            <span>Verbe de démonstration</span>
            <div class="preview-verb-picker__combobox">
              <input
                v-model="previewVerbQuery"
                type="search"
                role="combobox"
                autocomplete="off"
                spellcheck="false"
                placeholder="Commencez à écrire…"
                aria-autocomplete="list"
                aria-controls="preview-verb-suggestions"
                :aria-expanded="previewSuggestionsOpen"
                :aria-activedescendant="previewSuggestionsOpen && previewActiveSuggestion >= 0 ? `preview-verb-${previewVerbSuggestions[previewActiveSuggestion]?.id}` : undefined"
                @input="updatePreviewSuggestions"
                @focus="updatePreviewSuggestions"
                @blur="closePreviewSuggestions"
                @keydown="onPreviewVerbKeydown"
              >
              <ul v-if="previewSuggestionsOpen" id="preview-verb-suggestions" role="listbox">
                <li v-for="(verb, index) in previewVerbSuggestions" :id="`preview-verb-${verb.id}`" :key="verb.id" role="option" :aria-selected="index === previewActiveSuggestion">
                  <button type="button" :class="{ 'is-active': index === previewActiveSuggestion }" @mousedown.prevent @mouseenter="previewActiveSuggestion = index" @click="choosePreviewVerb(verb)"><strong>{{ verb.infinitif }}</strong><small>{{ verb.meaning || 'Définition non renseignée' }}</small></button>
                </li>
              </ul>
            </div>
          </label>
          <div class="preview-grammar-controls">
            <AdminCustomSelect :model-value="previewTenseId" :options="previewTenseOptions" label="Temps" placeholder="Choisir un temps" @update:model-value="selectPreviewTense" />
            <AdminCustomSelect :model-value="previewPersonId" :options="previewPersonOptions" label="Personne" placeholder="Choisir une personne" @update:model-value="selectPreviewPerson" />
          </div>
          <small v-if="draft.status === 'draft'">Modifications en attente de publication</small><small v-else class="is-published">Cette version est publiée</small>
        </div>
        <CoachHelpPanel :blocks="draft.blocks" :values="previewValues" header-title="{helpTitle}" :header-description="draft.headerDescription" :question-number="3" coach-color="#35688f" embedded @preview-scroll="followPreviewScroll" />
      </aside>
    </form>
    <section v-else class="admin-card help-empty"><strong>Sélectionnez une aide</strong><span>ou créez-en une nouvelle pour commencer.</span></section>
  </div></AdminShell></AdminAuthBoundary>
</template>

<style scoped>
.help-admin,.help-editor{display:grid;gap:18px}.help-workspace{display:grid;grid-template-columns:minmax(230px,290px) minmax(0,1fr);gap:18px;align-items:start}.help-list{display:grid;padding:10px;gap:4px;max-height:calc(100vh - 190px);overflow:auto;box-shadow:none}.help-list button{display:grid;width:100%;grid-template-columns:42px minmax(0,1fr);padding:9px;align-items:center;gap:10px;text-align:left;border:1px solid transparent;border-radius:10px;background:white;cursor:pointer}.help-list button.selected{border-color:#72b3c4;background:var(--admin-cyan)}.help-list__icon{display:grid;width:42px;height:42px;place-items:center;color:white;border-radius:12px;background:var(--admin-blue);font-size:1.15rem;font-weight:900}.help-list button>span:last-child{display:grid;min-width:0}.help-list small{color:var(--admin-muted)}.help-list__empty{padding:12px}.help-panel{padding:20px;box-shadow:none}.character-assignment{display:grid;gap:13px}.help-panel__title{display:flex;justify-content:space-between;align-items:center;gap:15px}.help-panel__title h2{margin:0;color:var(--admin-navy)}.help-fields{display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:13px;margin-top:17px}.help-fields__wide{grid-column:1/-1}.help-characters{display:grid;margin-top:16px;padding:12px;gap:7px;border:1px solid var(--admin-border);border-radius:11px;background:#f5f9fa}.help-characters>div{display:flex;gap:7px;flex-wrap:wrap}.help-characters a{padding:5px 9px;color:var(--admin-blue);border-radius:999px;background:white;text-decoration:none;font-size:.8rem;font-weight:800}.help-characters small{color:var(--admin-muted)}.block-editor__intro{max-width:760px}.help-variables{padding:10px 13px;border:1px solid var(--admin-border);border-radius:9px;background:#f7fafb;font-size:.82rem}.help-variables summary{color:var(--admin-blue);font-weight:800;cursor:pointer}.help-variables p{margin:8px 0 0}.help-blocks{display:grid;margin-top:16px;gap:12px}.help-block{overflow:hidden;border:1px solid var(--admin-border);border-radius:12px;background:white;box-shadow:0 4px 14px rgb(37 75 78 / 5%)}.help-block.is-inactive{opacity:.65;background:#f1f4f5}.help-block__toolbar{display:flex;padding:9px 11px;align-items:center;gap:8px;border-bottom:1px solid var(--admin-border);background:#f6f9fa}.help-block__toolbar>strong{color:var(--admin-navy)}.help-block__toolbar label{display:flex;margin-left:auto;align-items:center;gap:5px;font-size:.75rem;font-weight:800}.help-block__toolbar button{display:grid;width:28px;height:28px;place-items:center;border:1px solid var(--admin-border);border-radius:7px;background:white;cursor:pointer}.help-block__toolbar button:disabled{opacity:.35;cursor:not-allowed}.help-block__toolbar .help-block__delete{color:#9c342f;background:#f7e4e2}.help-block__handle{color:#7c8e94;cursor:grab;font-size:1.2rem;letter-spacing:-.2em}.help-block__dynamic{padding:3px 7px;color:#24634f;border-radius:999px;background:#dff1e9;font-size:.67rem;font-weight:850}.help-block__fields{display:grid;padding:13px;gap:11px}.block-appender{display:flex;margin-top:18px;align-items:center;gap:10px}.block-appender__line{height:1px;flex:1;background:var(--admin-border)}.block-appender>div{display:flex;gap:7px}.block-appender select{padding:8px;border:1px solid var(--admin-border);border-radius:8px;background:white}.help-save-bar{position:sticky;bottom:10px;display:flex;justify-content:flex-end;align-items:center;gap:12px;padding:12px;background:rgb(255 255 255 / 90%);border-radius:12px;box-shadow:0 8px 30px rgb(18 56 70 / 15%)}.help-autosave{display:flex;align-items:center;gap:8px;margin:0;color:var(--admin-muted);font-size:.84rem;font-weight:800}.help-autosave>span{width:9px;height:9px;border-radius:50%;background:#4d967c}.help-autosave.is-dirty>span,.help-autosave.is-saving>span{background:#d29a2e}.help-autosave.is-saving>span{animation:help-pulse .9s ease-in-out infinite}.help-autosave.is-error{color:#9c342f}.help-autosave.is-error>span{background:#b94a42}.help-empty{display:grid;min-height:220px;place-content:center;justify-items:center;color:var(--admin-muted)}@keyframes help-pulse{50%{opacity:.3}}@media(max-width:900px){.help-workspace{grid-template-columns:1fr}.help-list{max-height:260px}}@media(max-width:650px){.help-fields{grid-template-columns:1fr}.help-fields__wide{grid-column:auto}.help-block__toolbar{flex-wrap:wrap}.help-block__toolbar label{margin-left:0}.block-appender>div{align-items:stretch;flex-direction:column}}
.help-character-owner{display:flex;align-items:center;gap:11px;padding:10px 12px;border:1px solid var(--admin-border);border-radius:12px;background:#f3f8f8}.help-character-owner__icon{display:grid;width:42px;height:42px;place-items:center;border-radius:11px;background:#e5f1f3;font-size:1.45rem}.help-character-owner>span:last-child{display:grid;gap:1px}.help-character-owner small{color:var(--admin-muted);font-size:.7rem}.help-character-owner strong{color:var(--admin-navy)}:global(:root[data-theme='dark'] .help-character-owner){border-color:rgb(128 181 190 / 30%);background:rgb(32 57 62 / 42%)}:global(:root[data-theme='dark'] .help-character-owner__icon){background:rgb(67 105 112 / 28%)}:global(:root[data-theme='dark'] .help-character-owner strong){color:#c6e4e7}
.help-variables p{overflow-wrap:anywhere}.help-variables dl{display:grid;margin:12px 0 0;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.help-variables dl>div{padding:8px 10px;border-radius:8px;background:white}.help-variables dt{color:var(--admin-blue);font-family:monospace;font-weight:800}.help-variables dd{margin:3px 0 0;color:var(--admin-muted)}
@media(max-width:650px){.help-variables dl{grid-template-columns:1fr}}
.help-tabs{display:flex;margin-top:-8px;padding-bottom:4px;gap:8px;overflow-x:auto}.help-tabs button{display:flex;padding:9px 12px;align-items:center;gap:9px;white-space:nowrap;border:1px solid var(--admin-border);border-radius:10px;color:var(--admin-navy);background:white;cursor:pointer;font-weight:800}.help-tabs button.selected{color:white;border-color:var(--admin-blue);background:var(--admin-blue);box-shadow:0 0 0 3px rgb(117 186 202 / 25%)}.help-tabs small{padding:3px 7px;color:#7e5a18;border-radius:999px;background:#f7ebcf;font-size:.65rem}.help-tabs small.published{color:#24634f;background:#dff1e9}.help-tabs button.selected small{color:inherit;background:rgb(255 255 255 / 18%)}
.help-workspace{display:grid;grid-template-columns:minmax(210px,250px) minmax(500px,1fr) minmax(360px,420px);gap:18px;align-items:start}.help-main{display:grid;min-width:0;gap:18px}.block-library{position:sticky;top:14px;display:grid;padding:16px;gap:11px;box-shadow:none}.block-library h2,.preview-column h2{margin:0;color:var(--admin-navy)}.block-library>div>p:last-child{margin-bottom:0;font-size:.8rem}.library-block{display:grid;padding:11px;gap:7px;border:1px solid var(--admin-border);border-radius:11px;background:#f8fbfc}.library-block>strong{color:var(--admin-navy);font-size:.84rem}.library-block>p{margin:0;color:var(--admin-muted);font-size:.72rem;line-height:1.35}.library-block>button{justify-self:stretch}.library-block__sample{display:flex;height:42px;padding:7px;align-items:center;gap:5px;border:1px solid #d8e6e4;border-radius:8px;background:white}.library-block__sample i{display:block;height:5px;border-radius:999px;background:#b8d1d4}.library-block__sample i:first-child{width:23px;height:23px;flex:0 0 auto;border-radius:7px;background:#267a87}.library-block__sample i:nth-child(2){width:44%}.library-block__sample i:nth-child(3){flex:1}.library-block__sample.is-warnings{background:#fffbef}.library-block__sample.is-warnings i:first-child{background:#e1ad3d}.library-block__sample.is-intro,.library-block__sample.is-custom{background:#eff7f7}
.preview-verb-picker{display:grid;margin:8px 0 4px;gap:5px;color:var(--admin-muted);font-size:.72rem;font-weight:800}.preview-verb-picker__combobox{position:relative}.preview-verb-picker input{width:100%;padding:9px 11px;border:1px solid var(--admin-border);border-radius:9px;color:var(--admin-navy);background:white;font:inherit}.preview-verb-picker ul{position:absolute;z-index:12;top:calc(100% + 4px);right:0;left:0;max-height:260px;margin:0;padding:5px;overflow:auto;border:1px solid var(--admin-border);border-radius:10px;background:white;box-shadow:0 12px 28px rgb(18 56 70 / 18%);list-style:none}.preview-verb-picker li button{display:grid;width:100%;padding:8px 9px;gap:2px;border:0;border-radius:7px;color:var(--admin-navy);background:transparent;text-align:left;cursor:pointer}.preview-verb-picker li button:hover,.preview-verb-picker li button.is-active{background:#e6f3f5}.preview-verb-picker li small{color:var(--admin-muted);font-size:.66rem;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.preview-grammar-controls{display:grid;margin:5px 0 7px;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}
.insertion-point{position:relative;display:grid;width:100%;height:22px;padding:0;place-items:center;border:0;background:transparent;cursor:pointer}.insertion-point::before{content:'';position:absolute;right:0;left:0;height:1px;background:#c9d8db}.insertion-point>span{position:relative;display:grid;min-width:25px;height:22px;padding:0 7px;place-items:center;color:#6f858c;border:1px solid #c9d8db;border-radius:999px;background:white;font-size:.7rem;font-weight:850}.insertion-point:hover::before,.insertion-point.selected::before{height:2px;background:var(--admin-blue)}.insertion-point:hover>span,.insertion-point.selected>span{color:white;border-color:var(--admin-blue);background:var(--admin-blue)}.help-blocks{gap:0}.help-block{margin:3px 0}.preview-column{position:sticky;top:14px;display:grid;min-width:0;gap:10px}.preview-column__heading{display:grid;padding-inline:4px;gap:2px}.preview-column__heading small{color:#8a641a;font-weight:750}.preview-column__heading small.is-published{color:#28705a}.help-save-bar{z-index:2}
@media(max-width:1250px){.help-workspace{grid-template-columns:minmax(200px,240px) minmax(480px,1fr)}.preview-column{position:static;grid-column:1/-1;width:min(440px,100%);justify-self:center}.block-library{top:10px}}
@media(max-width:850px){.help-workspace{grid-template-columns:1fr}.block-library{position:static;grid-template-columns:repeat(2,minmax(0,1fr))}.block-library>div{grid-column:1/-1}.preview-column{grid-column:auto}.help-tabs{margin-top:0}}
@media(max-width:560px){.block-library{grid-template-columns:1fr}.help-tabs button{align-items:flex-start;flex-direction:column;gap:3px}.help-panel{padding:14px}}
.help-heading-actions{display:flex;align-items:center;gap:9px}.help-publish-button{color:white;border-color:#26735d;background:#26735d}.help-publish-button:disabled{opacity:.55}.library-block__sample.is-warning{border-left:5px solid #d9a20f;background:#fff6d9}.library-block__sample.is-warning i:first-child{background:#d9a20f}.library-block__sample.is-danger{border:2px solid #c96f37;background:#fff0e5}.library-block__sample.is-danger i:first-child{background:#c96f37}.library-block__sample.is-header{border-color:transparent;background:#eff7f7}.library-block__sample.is-normal i:first-child{display:none}
.help-header-fields{display:grid;margin-top:16px;gap:12px}
.library-block{width:100%;color:inherit;font:inherit;text-align:left;cursor:pointer;transition:border-color .15s ease,box-shadow .15s ease,transform .15s ease}.library-block:hover{border-color:#79b5c2;box-shadow:0 5px 14px rgb(18 56 70 / 10%);transform:translateY(-1px)}.library-block:focus-visible{outline:3px solid rgb(38 127 141 / 28%);outline-offset:2px}
.library-block--special{border-style:dashed}.library-block:disabled{opacity:.58;cursor:default}.library-block:disabled:hover{border-color:var(--admin-border);box-shadow:none;transform:none}.library-block__sample.is-header{background:linear-gradient(135deg,#397495,#238791)}.library-block__sample.is-header i,.library-block__sample.is-header i:first-child,.library-block__sample.is-header i:nth-child(2),.library-block__sample.is-header i:nth-child(3){width:auto;height:5px;flex:1;border-radius:999px;background:rgb(255 255 255 / 72%)}.library-block__sample.is-header i:first-child{flex:0 0 34%;height:8px}
.library-block__sample.is-contextual-base{display:grid;grid-template-columns:1fr auto 1fr;padding:8px 10px;align-items:center;background:#f0f5fb}.library-block__sample.is-contextual-base i,.library-block__sample.is-contextual-base i:first-child,.library-block__sample.is-contextual-base i:nth-child(2),.library-block__sample.is-contextual-base i:nth-child(3){width:auto;height:7px;margin:0;border-radius:999px;background:#6e9ab3}.library-block__sample.is-contextual-base i:nth-child(2){width:8px;height:8px;background:#cf9131}.library-block__sample.is-contextual-base i:nth-child(3){background:#9ab6c5}:global(:root[data-theme='dark'] .library-block__sample.is-contextual-base){background:#1d303b}:global(:root[data-theme='dark'] .library-block__sample.is-contextual-base i){background:#79aec8}:global(:root[data-theme='dark'] .library-block__sample.is-contextual-base i:nth-child(2)){background:#d4a14c}:global(:root[data-theme='dark'] .library-block__sample.is-contextual-base i:nth-child(3)){background:#648797}
.library-block__sample.is-endings{display:grid;padding:8px 10px;align-content:center;gap:5px;background:#eef7f7}.library-block__sample.is-endings i,.library-block__sample.is-endings i:first-child,.library-block__sample.is-endings i:nth-child(2),.library-block__sample.is-endings i:nth-child(3){position:relative;width:auto;height:5px;margin-left:15px;border-radius:999px;background:#8eb7bd}.library-block__sample.is-endings i::before{content:'✦';position:absolute;left:-15px;top:50%;color:#267f8d;font-size:.48rem;transform:translateY(-50%)}:global(:root[data-theme='dark'] .library-block__sample.is-endings){background:#1c3338}:global(:root[data-theme='dark'] .library-block__sample.is-endings i){background:#688e97}:global(:root[data-theme='dark'] .library-block__sample.is-endings i::before){color:#84cad5}
:global(:root[data-theme='dark'] .help-tabs button){color:#d4e4e8;border-color:#465d66;background:#1b2c31}:global(:root[data-theme='dark'] .help-tabs button:hover){border-color:#6594a2;background:#21353b}:global(:root[data-theme='dark'] .help-tabs button.selected){color:#f3fafb;border-color:#58a8bd;background:#347f95;box-shadow:0 0 0 3px rgb(88 168 189 / 18%)}:global(:root[data-theme='dark'] .help-tabs small){color:#e3c47f;background:#3b3323}:global(:root[data-theme='dark'] .help-tabs small.published){color:#a8dfbd;background:#203a2c}:global(:root[data-theme='dark'] .help-tabs button.selected small){color:#f1f7f8;background:rgb(255 255 255 / 14%)}
:global(:root[data-theme='dark'] .library-block){color:#d4e3e7;border-color:#455c64;background:#1c2d32}:global(:root[data-theme='dark'] .library-block:hover){border-color:#6495a3;background:#21353b;box-shadow:0 7px 18px rgb(0 0 0 / 20%)}:global(:root[data-theme='dark'] .library-block>strong){color:#d6e7eb}:global(:root[data-theme='dark'] .library-block>p){color:#aebfc5}:global(:root[data-theme='dark'] .library-block__sample){border-color:#496168;background:#15262b}:global(:root[data-theme='dark'] .library-block__sample i){background:#78979f}:global(:root[data-theme='dark'] .library-block__sample.is-normal i:first-child){display:none}:global(:root[data-theme='dark'] .library-block__sample.is-warning){border-color:#806c35;border-left-color:#b88b24;background:#342f20}:global(:root[data-theme='dark'] .library-block__sample.is-warning i:first-child){background:#c8972d}:global(:root[data-theme='dark'] .library-block__sample.is-danger){border-color:#9a5d3b;background:#38271f}:global(:root[data-theme='dark'] .library-block__sample.is-danger i:first-child){background:#c46d3e}
:global(:root[data-theme='dark'] .help-variables){color:#cadade;border-color:#435b63;background:#1b2d32}:global(:root[data-theme='dark'] .help-variables summary){color:#73bfd2}:global(:root[data-theme='dark'] .help-variables dl>div){background:#22353b}:global(:root[data-theme='dark'] .help-variables dt){color:#83c9d9}:global(:root[data-theme='dark'] .help-variables dd){color:#afc0c6}
:global(:root[data-theme='dark'] .insertion-point::before){background:#435b63}:global(:root[data-theme='dark'] .insertion-point>span){color:#acc0c6;border-color:#4b646d;background:#192a2f}:global(:root[data-theme='dark'] .insertion-point:hover>span),:global(:root[data-theme='dark'] .insertion-point.selected>span){color:#f5fbfc;border-color:#58a8bd;background:#347f95}
:global(:root[data-theme='dark'] .help-save-bar){border:1px solid #3f555d;background:rgb(24 40 45 / 94%);box-shadow:0 10px 32px rgb(0 0 0 / 30%);backdrop-filter:blur(10px)}:global(:root[data-theme='dark'] .help-autosave){color:#b4c5ca}:global(:root[data-theme='dark'] .help-autosave.is-error){color:#f0aaa4}:global(:root[data-theme='dark'] .preview-column__heading small){color:#e1c17a}:global(:root[data-theme='dark'] .preview-column__heading small.is-published){color:#9bd9b4}
:global(:root[data-theme='dark'] .preview-verb-picker input),:global(:root[data-theme='dark'] .preview-verb-picker ul){color:#d8e7ea;border-color:#49616a;background:#192b30}:global(:root[data-theme='dark'] .preview-verb-picker li button){color:#d8e7ea}:global(:root[data-theme='dark'] .preview-verb-picker li button:hover),:global(:root[data-theme='dark'] .preview-verb-picker li button.is-active){background:#294149}:global(:root[data-theme='dark'] .preview-verb-picker li small){color:#aec0c5}
.library-block__sample.is-info{border-left:5px solid #2d8fb7;background:#eef8fc}.library-block__sample.is-info i:first-child{background:#2d8fb7}.library-block__sample.is-success{border-left:5px solid #3b9877;background:#eef8f3}.library-block__sample.is-success i:first-child{background:#3b9877}.library-block__sample.is-definition{border-color:#cfe0dc;background:white}.library-block__sample.is-definition i:first-child{width:26%;height:7px;border-radius:999px;background:#267f8d}
:global(:root[data-theme='dark'] .library-block__sample.is-info){border-color:#315f70;border-left-color:#58a9c8;background:#1b333c}:global(:root[data-theme='dark'] .library-block__sample.is-info i:first-child){background:#58a9c8}:global(:root[data-theme='dark'] .library-block__sample.is-success){border-color:#376354;border-left-color:#5db28f;background:#1b352e}:global(:root[data-theme='dark'] .library-block__sample.is-success i:first-child){background:#5db28f}:global(:root[data-theme='dark'] .library-block__sample.is-definition){border-color:#3e595d;background:#1b3035}:global(:root[data-theme='dark'] .library-block__sample.is-definition i:first-child){background:#84cad5}
</style>

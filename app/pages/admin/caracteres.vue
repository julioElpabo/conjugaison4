<script setup lang="ts">
import type { CoachCaractere, CoachEvent, CoachHelpApproachDefinition, CoachMedia, CoachProfile } from '~~/shared/types/coach'
import { COACH_EVENTS, REQUIRED_COACH_REPLY_EVENTS } from '~~/shared/types/coach'
import { COACH_CARACTERE_ICON_GROUPS } from '~~/shared/data/coach-caractere-icons'
import { formatCaractereName } from '~~/shared/utils/coach-caractere'
import { COACH_PLACEHOLDERS, unknownCoachPlaceholders } from '~~/shared/utils/coach-dialogue'
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

const EVENT_LABELS: Record<CoachEvent, string> = {
  introduction: 'Présentation', question: 'Question', correct: 'Bonne réponse', 'correct-alternative': 'Bonne réponse avec variante',
  incorrect: 'Mauvaise réponse', 'cod-before': 'COD avant', 'cod-after': 'COD après', coi: 'COI',
  encouragement: 'Encouragement', 'help-announcement': 'Annonce d’aide', streak: 'Série réussie', finish: 'Fin', restart: 'Recommencer',
}
const EVENT_DESCRIPTIONS: Record<CoachEvent, string> = {
  introduction: 'Premières phrases affichées à l’ouverture du chat.',
  question: 'Transitions éventuelles avant une nouvelle question.',
  correct: 'Réactions après une réponse entièrement correcte.',
  'correct-alternative': 'Réactions lorsqu’une autre formulation correcte est aussi acceptée.',
  incorrect: 'Réactions après une réponse fausse, avant l’explication.',
  'cod-before': 'Phrases liées aux compléments d’objet placés avant le verbe.',
  'cod-after': 'Phrases liées aux compléments d’objet placés après le verbe.',
  coi: 'Phrases liées aux compléments d’objet indirects.',
  encouragement: 'Relances positives pour aider l’élève à continuer.',
  'help-announcement': 'Phrase affichée avant de proposer l’aide après une attente ou plusieurs erreurs.',
  streak: 'Réactions après plusieurs bonnes réponses consécutives.',
  finish: 'Phrases affichées à la fin de l’exercice.',
  restart: 'Phrases affichées lorsque l’élève recommence.',
}
const REQUIRED_REPLY_EVENTS = new Set<CoachEvent>(REQUIRED_COACH_REPLY_EVENTS)
const REACTION_EVENTS: CoachEvent[] = ['correct', 'incorrect', 'streak', 'finish']
const MEDIA_FREQUENCY_OPTIONS = [
  { label: 'Aucun', value: 0 },
  { label: 'Rarement', value: 0.2 },
  { label: 'Moitié', value: 0.5 },
  { label: 'Souvent', value: 0.8 },
  { label: 'Toujours', value: 1 },
]
const placeholdersLabel = COACH_PLACEHOLDERS.map(item => `{${item}}`).join(' · ')
const { user, handleUnauthorized } = useAdminAuth()
const route = useRoute()
const caracteres = ref<CoachCaractere[]>([])
const coaches = ref<CoachProfile[]>([])
const media = ref<CoachMedia[]>([])
const helpApproaches = ref<CoachHelpApproachDefinition[]>([])
const draft = ref<CoachCaractere | null>(null)
const selectedId = ref<number | null>(null)
const tab = ref<'caracteres' | 'media'>('caracteres')
const loading = ref(false)
const saving = ref(false)
const autosaveState = ref<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle')
const uploading = ref(false)
const openingHelp = ref(false)
const duplicatingCaractere = ref(false)
const deletingCaractere = ref(false)
const error = ref('')
const success = ref('')
const selectedMediaId = ref<number | null>(null)
const iconPickerOpen = ref(false)
const approachManagerOpen = ref(false)
const approachDrafts = ref<CoachHelpApproachDefinition[]>([])
const newApproachName = ref('')
const approachSaving = ref<number | 'new' | null>(null)
const approachError = ref('')
const iconPicker = useTemplateRef<HTMLElement>('iconPicker')
const mediaDraft = reactive({ id: 0, name: '', filePath: '', mediaType: 'animation', category: 'success', altText: '', rightsStatus: 'pending', safetyStatus: 'pending', isActive: true, fileSize: null as number | null })
let loaded = false
let autosaveTimer: ReturnType<typeof setTimeout> | null = null
let autosavePromise: Promise<void> | null = null
let lastSavedSnapshot = ''
const caractereCoaches = computed(() => draft.value?.id
  ? coaches.value.filter(coach => coach.caractereId === draft.value?.id)
  : [])
const sortedCaracteres = computed(() => [...caracteres.value].sort((left, right) =>
  left.sortOrder - right.sortOrder
  || formatCaractereName(left).localeCompare(formatCaractereName(right), 'fr')
  || left.id - right.id))
const caractereIconGroups = computed(() => {
  const configuredIcons = new Set(COACH_CARACTERE_ICON_GROUPS.flatMap(group => group.icons.map(icon => icon.value)))
  const customIcons = [...new Set(caracteres.value.map(caractere => caractere.emoticon.trim()).filter(icon => icon && !configuredIcons.has(icon)))]
  return customIcons.length
    ? [{ label: 'Déjà utilisées', icons: customIcons.map(value => ({ value, label: 'Icône existante' })) }, ...COACH_CARACTERE_ICON_GROUPS]
    : COACH_CARACTERE_ICON_GROUPS
})
const responseMediaGroups = computed(() => [
  {
    key: 'correct' as const,
    title: 'Bonne réponse',
    description: 'GIF animés et émojis qui peuvent féliciter l’utilisateur.',
    items: media.value.filter(item => (item.mediaType === 'animation' || item.mediaType === 'emoji') && item.category === 'success'),
  },
  {
    key: 'incorrect' as const,
    title: 'Mauvaise réponse',
    description: 'GIF animés et émojis qui peuvent accompagner une correction.',
    items: media.value.filter(item => (item.mediaType === 'animation' || item.mediaType === 'emoji') && item.category === 'encouragement'),
  },
])
const otherReactionMedia = computed(() => {
  const responseIds = new Set(responseMediaGroups.value.flatMap(group => group.items.map(item => item.id)))
  return media.value.filter(item => !responseIds.has(item.id))
})

useHead({ title: 'Caractères — Administration' })
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const autosaveLabel = computed(() => {
  if (autosaveState.value === 'saving') return 'Enregistrement…'
  if (autosaveState.value === 'dirty') return draft.value?.id ? 'Modification en attente…' : 'Complète les champs obligatoires…'
  if (autosaveState.value === 'error') return 'Échec de l’enregistrement'
  return 'Toutes les modifications sont enregistrées'
})
function cancelScheduledAutosave() {
  if (autosaveTimer) clearTimeout(autosaveTimer)
  autosaveTimer = null
}
async function openIconPicker() {
  iconPickerOpen.value = true
  await nextTick()
  const selected = iconPicker.value?.querySelector<HTMLElement>('[aria-pressed="true"]')
  ;(selected || iconPicker.value?.querySelector<HTMLElement>('button'))?.focus()
}
function closeIconPicker() {
  iconPickerOpen.value = false
}
function openApproachManager() {
  approachDrafts.value = clone(helpApproaches.value)
  approachError.value = ''
  newApproachName.value = ''
  approachManagerOpen.value = true
}
function closeApproachManager() {
  if (!approachSaving.value) approachManagerOpen.value = false
}
async function reloadHelpApproaches() {
  const response = await $fetch<{ approaches: CoachHelpApproachDefinition[] }>('/api/admin/coach-help-approaches')
  helpApproaches.value = response.approaches
  approachDrafts.value = clone(response.approaches)
  for (const caractere of caracteres.value) {
    const approach = response.approaches.find(item => item.id === caractere.helpApproachId)
    if (approach) Object.assign(caractere, { helpApproachName: approach.name, helpApproach: approach.engineKey })
  }
  if (draft.value) {
    const approach = response.approaches.find(item => item.id === draft.value?.helpApproachId)
    if (approach) Object.assign(draft.value, { helpApproachName: approach.name, helpApproach: approach.engineKey })
  }
}
async function selectHelpApproach(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (value === 'manage') {
    openApproachManager()
    await nextTick()
    ;(event.target as HTMLSelectElement).value = String(draft.value?.helpApproachId || '')
    return
  }
  if (!draft.value) return
  const approach = helpApproaches.value.find(item => item.id === Number(value))
  if (!approach) return
  draft.value.helpApproachId = approach.id
  draft.value.helpApproachName = approach.name
  draft.value.helpApproach = approach.engineKey
}
async function createHelpApproach() {
  const name = newApproachName.value.trim()
  if (!name || approachSaving.value) return
  approachSaving.value = 'new'
  approachError.value = ''
  try {
    await $fetch('/api/admin/coach-help-approaches', { method: 'POST', body: {
      name, engineKey: 'cif-falc', sortOrder: Math.max(0, ...helpApproaches.value.map(item => item.sortOrder)) + 1,
    } })
    newApproachName.value = ''
    await reloadHelpApproaches()
  } catch (caught) {
    approachError.value = getAdminErrorMessage(caught, 'Impossible d’ajouter cette approche.')
  } finally { approachSaving.value = null }
}
async function saveHelpApproach(approach: CoachHelpApproachDefinition) {
  if (!approach.name.trim() || approachSaving.value) return
  approachSaving.value = approach.id
  approachError.value = ''
  try {
    await $fetch(`/api/admin/coach-help-approaches/${approach.id}`, { method: 'PUT', body: approach })
    await reloadHelpApproaches()
  } catch (caught) {
    approachError.value = getAdminErrorMessage(caught, 'Impossible de modifier cette approche.')
  } finally { approachSaving.value = null }
}
async function deleteHelpApproach(approach: CoachHelpApproachDefinition) {
  if (approachSaving.value || !window.confirm(`Supprimer l’approche « ${approach.name} » ?`)) return
  approachSaving.value = approach.id
  approachError.value = ''
  try {
    await $fetch(`/api/admin/coach-help-approaches/${approach.id}`, { method: 'DELETE' })
    await reloadHelpApproaches()
  } catch (caught) {
    approachError.value = getAdminErrorMessage(caught, 'Impossible de supprimer cette approche.')
  } finally { approachSaving.value = null }
}
async function selectCaractereIcon(icon: string) {
  if (!draft.value) return
  draft.value.emoticon = icon
  closeIconPicker()
  await nextTick()
  await autosaveCaractere()
}
function setCaractereDraft(caractere: CoachCaractere) {
  cancelScheduledAutosave()
  selectedId.value = caractere.id || null
  draft.value = clone(caractere)
  lastSavedSnapshot = caractere.id ? JSON.stringify(draft.value) : ''
  autosaveState.value = caractere.id ? 'idle' : 'dirty'
  error.value = ''
  success.value = ''
}
async function selectCaractere(caractere: CoachCaractere) {
  await autosaveCaractere()
  setCaractereDraft(caractere)
}
async function newCaractere() {
  await autosaveCaractere()
  selectedId.value = null
  const assignments = media.value
    .filter(item => item.isActive && (item.mediaType === 'emoji' || item.mediaType === 'animation'))
    .map(item => ({ mediaId: item.id, eventType: mediaDefaultEvent(item), weight: 1, isActive: true }))
  const approach = helpApproaches.value[0]
  setCaractereDraft({ id: 0, slug: '', masculineName: '', emoticon: '🙂', pedagogicalStyle: '', helpApproachId: approach?.id || 0, helpApproachName: approach?.name || '', helpApproach: approach?.engineKey || 'cif-falc', status: 'draft', sortOrder: caracteres.value.length + 1, replies: [], media: clone(media.value), assignments, rules: [] })
}
function duplicatedSlug(sourceSlug: string) {
  const existingSlugs = new Set(caracteres.value.map(caractere => caractere.slug))
  const root = `${sourceSlug.slice(0, 74)}-copie`
  let candidate = root
  let index = 2
  while (existingSlugs.has(candidate)) {
    const suffix = `-${index}`
    candidate = `${root.slice(0, 80 - suffix.length)}${suffix}`
    index += 1
  }
  return candidate
}
function duplicatedName(name: string) {
  return `${name.slice(0, 72)} (copie)`
}
async function duplicateCaractere() {
  if (!draft.value?.id || duplicatingCaractere.value) return
  duplicatingCaractere.value = true
  error.value = ''
  success.value = ''
  try {
    await autosaveCaractere()
    const source = draft.value
    if (!source?.id) return
    const copy = clone(source)
    copy.id = 0
    copy.slug = duplicatedSlug(source.slug)
    copy.masculineName = duplicatedName(source.masculineName)
    copy.status = 'draft'
    copy.sortOrder = Math.max(0, ...caracteres.value.map(caractere => caractere.sortOrder)) + 1
    copy.replies = copy.replies.map(reply => ({ ...reply, id: 0 }))
    setCaractereDraft(copy)
    await autosaveCaractere()
    if (draft.value?.id) success.value = 'Caractère et configuration d’aide dupliqués en brouillon.'
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de dupliquer ce caractère.')
  } finally {
    duplicatingCaractere.value = false
  }
}
async function load() {
  loading.value = true
  try {
    const [caractereResponse, coachResponse, mediaResponse, approachResponse] = await Promise.all([
      $fetch<{ caracteres: CoachCaractere[] }>('/api/admin/coach-caracteres'),
      $fetch<{ coaches: CoachProfile[] }>('/api/admin/coaches'),
      $fetch<{ media: CoachMedia[] }>('/api/admin/coach-media'),
      $fetch<{ approaches: CoachHelpApproachDefinition[] }>('/api/admin/coach-help-approaches'),
    ])
    caracteres.value = caractereResponse.caracteres; coaches.value = coachResponse.coaches; media.value = mediaResponse.media; helpApproaches.value = approachResponse.approaches
    if (draft.value?.id) {
      const refreshed = caracteres.value.find(item => item.id === draft.value?.id)
      if (refreshed) setCaractereDraft(refreshed)
    } else if (!draft.value) {
      const requestedId = Number(route.query.caractere)
      const requested = Number.isInteger(requestedId) ? caracteres.value.find(item => item.id === requestedId) : undefined
      if (requested || caracteres.value[0]) setCaractereDraft(requested || caracteres.value[0]!)
    }
  } catch (caught) { if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de charger les caractères.') }
  finally { loading.value = false }
}
function caractereCanBeSaved(caractere: CoachCaractere) {
  if (!caractere.slug.trim() || !caractere.masculineName.trim() || !caractere.emoticon.trim()
    || !caractere.pedagogicalStyle.trim() || !Number.isInteger(caractere.sortOrder)) return false
  if (caractere.replies.some(reply => !reply.content.trim() || unknownCoachPlaceholders(reply.content).length)) return false
  if (caractere.status !== 'published') return true
  return [...REQUIRED_REPLY_EVENTS].every(eventType => caractere.replies.some(reply => reply.eventType === eventType && reply.isActive && reply.content.trim()))
}
function refreshCaractereInList(saved: CoachCaractere) {
  const item = caracteres.value.find(caractere => caractere.id === saved.id)
  if (item) Object.assign(item, clone(saved))
  else caracteres.value.push(clone(saved))
}
function scheduleAutosave() {
  cancelScheduledAutosave()
  autosaveTimer = setTimeout(() => { void autosaveCaractere() }, 650)
}
async function autosaveCaractere() {
  cancelScheduledAutosave()
  if (autosavePromise) {
    await autosavePromise
    if (draft.value && JSON.stringify(draft.value) !== lastSavedSnapshot) scheduleAutosave()
    return
  }
  const current = draft.value
  if (!current) return
  const snapshot = JSON.stringify(current)
  if (current.id && snapshot === lastSavedSnapshot) return
  if (!caractereCanBeSaved(current)) {
    autosaveState.value = 'dirty'
    return
  }
  const payload = clone(current)
  const caractereId = current.id
  autosaveState.value = 'saving'
  error.value = ''
  autosavePromise = caractereId
    ? $fetch(`/api/admin/coach-caracteres/${caractereId}`, { method: 'PUT', body: payload }).then(() => undefined)
    : $fetch<{ id: number }>('/api/admin/coach-caracteres', {
        method: 'POST',
        body: payload,
      }).then((result) => {
        payload.id = result.id
        if (draft.value === current) {
          draft.value.id = result.id
          selectedId.value = result.id
        }
      })
  try {
    await autosavePromise
    const savedSnapshot = JSON.stringify(payload)
    lastSavedSnapshot = savedSnapshot
    refreshCaractereInList(payload)
    if (draft.value?.id === payload.id && JSON.stringify(draft.value) === savedSnapshot) autosaveState.value = 'saved'
    else if (draft.value?.id === payload.id) scheduleAutosave()
  } catch (caught) {
    autosaveState.value = 'error'
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible d’enregistrer automatiquement ce caractère.')
  } finally {
    autosavePromise = null
  }
}
async function openCaractereHelp() {
  await autosaveCaractere()
  const caractere = draft.value
  if (!caractere?.id) {
    error.value = 'Complète d’abord les champs obligatoires du caractère.'
    return
  }
  openingHelp.value = true
  error.value = ''
  try {
    await navigateTo({ path: '/admin/helps', query: { caractere: caractere.id } })
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible d’ouvrir l’aide de ce caractère.')
  } finally {
    openingHelp.value = false
  }
}
async function disableCaractere() {
  if (!draft.value?.id || !window.confirm(`Désactiver le caractère « ${formatCaractereName(draft.value)} » ?`)) return
  cancelScheduledAutosave()
  try {
    if (autosavePromise) await autosavePromise
    await $fetch(`/api/admin/coach-caracteres/${draft.value.id}`, { method: 'DELETE' })
    await load()
    success.value = 'Caractère désactivé.'
  }
  catch (caught) { error.value = getAdminErrorMessage(caught, 'Impossible de désactiver ce caractère.') }
}
async function deleteCaractere() {
  const caractere = draft.value
  if (!caractere?.id) return
  const coachWarning = caractereCoaches.value.length
    ? `\n\n${caractereCoaches.value.length} coach${caractereCoaches.value.length > 1 ? 'es' : ''} utilisant ce caractère ${caractereCoaches.value.length > 1 ? 'seront détachés' : 'sera détaché'}.`
    : ''
  if (!window.confirm(`Supprimer définitivement le caractère « ${formatCaractereName(caractere)} » ?\n\nSes textes, règles et associations seront supprimés.${coachWarning}\n\nCette action est irréversible.`)) return

  cancelScheduledAutosave()
  deletingCaractere.value = true
  error.value = ''
  success.value = ''
  try {
    if (autosavePromise) await autosavePromise
    await $fetch(`/api/admin/coach-caracteres/${caractere.id}/permanent`, { method: 'DELETE' })
    draft.value = null
    selectedId.value = null
    lastSavedSnapshot = ''
    await load()
    success.value = 'Caractère supprimé définitivement.'
  } catch (caught) {
    error.value = getAdminErrorMessage(caught, 'Impossible de supprimer définitivement ce caractère.')
  } finally {
    deletingCaractere.value = false
  }
}
function repliesFor(eventType: CoachEvent) { return draft.value?.replies.filter(reply => reply.eventType === eventType) || [] }
function activeReplyCount(eventType: CoachEvent) { return repliesFor(eventType).filter(reply => reply.isActive).length }
function addReply(eventType: CoachEvent) { draft.value?.replies.push({ id: 0, eventType, content: '', weight: 1, isActive: true }) }
function removeReply(reply: CoachCaractere['replies'][number]) {
  if (!draft.value) return
  const index = draft.value.replies.indexOf(reply)
  if (index >= 0) draft.value.replies.splice(index, 1)
}
function mediaDefaultEvent(item: CoachMedia): CoachEvent {
  if (item.category === 'success') return 'correct'
  if (item.category === 'encouragement') return 'incorrect'
  if (item.category === 'finish') return 'finish'
  if (item.category === 'welcome') return 'introduction'
  return 'question'
}
function assignmentFor(id: number, eventType?: CoachEvent) {
  return draft.value?.assignments.find(item => item.mediaId === id && (!eventType || item.eventType === eventType))
}
function assignedMediaCount(items: CoachMedia[], eventType: CoachEvent) {
  return items.filter(item => assignmentFor(item.id, eventType)?.isActive).length
}
function toggleMedia(item: CoachMedia) {
  if (!draft.value) return
  const index = draft.value.assignments.findIndex(assignment => assignment.mediaId === item.id)
  if (index >= 0) draft.value.assignments.splice(index, 1)
  else draft.value.assignments.push({ mediaId: item.id, eventType: mediaDefaultEvent(item), weight: 1, isActive: true })
}
function toggleResponseMedia(item: CoachMedia, eventType: 'correct' | 'incorrect') {
  if (!draft.value) return
  const existing = assignmentFor(item.id, eventType)
  if (existing) {
    draft.value.assignments = draft.value.assignments.filter(assignment => !(assignment.mediaId === item.id && assignment.eventType === eventType))
    return
  }
  draft.value.assignments = draft.value.assignments.filter(assignment => assignment.mediaId !== item.id)
  draft.value.assignments.push({ mediaId: item.id, eventType, weight: 1, isActive: true })
  ensureRule(eventType)
}
function setResponseMediaSelection(eventType: 'correct' | 'incorrect', selected: boolean) {
  if (!draft.value) return
  const group = responseMediaGroups.value.find(item => item.key === eventType)
  if (!group) return
  const mediaIds = new Set(group.items.map(item => item.id))
  draft.value.assignments = draft.value.assignments.filter(assignment => !mediaIds.has(assignment.mediaId))
  if (selected) {
    draft.value.assignments.push(...group.items.map(item => ({ mediaId: item.id, eventType, weight: 1, isActive: true })))
    ensureRule(eventType)
  }
}
function inputValue(event: Event) { return (event.target as HTMLInputElement | HTMLSelectElement).value }
function updateAssignment(id: number, field: 'eventType' | 'weight', value: string) {
  const assignment = assignmentFor(id); if (!assignment) return
  if (field === 'eventType') assignment.eventType = value as CoachEvent
  else assignment.weight = Number(value)
}
function ruleFor(eventType: CoachEvent) { return draft.value?.rules.find(item => item.eventType === eventType) }
function ensureRule(eventType: CoachEvent) {
  if (draft.value && !ruleFor(eventType)) {
    draft.value.rules.push({ eventType, mediaProbability: 0.2, animationProbability: 0.2, emojiProbability: 0.2, cooldownQuestions: 2 })
  }
}
function updateRule(eventType: CoachEvent, field: 'animationProbability' | 'emojiProbability' | 'cooldownQuestions', value: string) {
  const rule = ruleFor(eventType)
  if (!rule) return
  rule[field] = Number(value)
  rule.mediaProbability = Math.max(rule.animationProbability, rule.emojiProbability)
}
async function deleteMedia(item: CoachMedia) {
  if (!window.confirm(`Supprimer définitivement « ${item.name} » ? Cette action supprimera ce média pour tous les caractères.`)) return
  cancelScheduledAutosave()
  error.value = ''
  success.value = ''
  try {
    if (autosavePromise) await autosavePromise
    await autosaveCaractere()
    await $fetch(`/api/admin/coach-media/${item.id}`, { method: 'DELETE' })
    media.value = media.value.filter(mediaItem => mediaItem.id !== item.id)
    if (draft.value) {
      draft.value.media = draft.value.media.filter(mediaItem => mediaItem.id !== item.id)
      draft.value.assignments = draft.value.assignments.filter(assignment => assignment.mediaId !== item.id)
      lastSavedSnapshot = JSON.stringify(draft.value)
    }
    caracteres.value.forEach((caractere) => {
      caractere.media = caractere.media.filter(mediaItem => mediaItem.id !== item.id)
      caractere.assignments = caractere.assignments.filter(assignment => assignment.mediaId !== item.id)
    })
    if (selectedMediaId.value === item.id) selectMedia()
    success.value = 'Média supprimé définitivement.'
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de supprimer ce média.')
  }
}

function selectMedia(item?: CoachMedia) {
  selectedMediaId.value = item?.id || null
  Object.assign(mediaDraft, item ? clone(item) : { id: 0, name: '', filePath: '', mediaType: 'animation', category: 'success', altText: '', rightsStatus: 'pending', safetyStatus: 'pending', isActive: true, fileSize: null })
}
async function uploadMedia(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return
  uploading.value = true; error.value = ''
  try {
    const data = new FormData(); data.append('file', file)
    const result = await $fetch<{ path: string, size: number, mediaType: string }>('/api/admin/coach-media/upload', { method: 'POST', body: data })
    mediaDraft.filePath = result.path; mediaDraft.fileSize = result.size; mediaDraft.mediaType = result.mediaType
    if (!mediaDraft.name) mediaDraft.name = file.name.replace(/\.[^.]+$/u, '')
  } catch (caught) { error.value = getAdminErrorMessage(caught, 'Impossible d’envoyer ce fichier.') }
  finally { uploading.value = false }
}
async function saveMedia() {
  saving.value = true; error.value = ''; success.value = ''
  try {
    if (mediaDraft.id) await $fetch(`/api/admin/coach-media/${mediaDraft.id}`, { method: 'PUT', body: mediaDraft })
    else await $fetch('/api/admin/coach-media', { method: 'POST', body: mediaDraft })
    await load(); selectMedia(); success.value = 'Média enregistré.'
  } catch (caught) { error.value = getAdminErrorMessage(caught, 'Impossible d’enregistrer ce média.') }
  finally { saving.value = false }
}
watch(draft, (current) => {
  if (loading.value || saving.value || !current) return
  const snapshot = JSON.stringify(current)
  if (current.id && snapshot === lastSavedSnapshot) return
  autosaveState.value = 'dirty'
  scheduleAutosave()
}, { deep: true })
watch(user, (current) => { if (current && !loaded) { loaded = true; void load() } if (!current) loaded = false }, { immediate: true })
onBeforeRouteLeave(async () => { await autosaveCaractere() })
onBeforeUnmount(() => {
  cancelScheduledAutosave()
  if (import.meta.client) document.body.style.removeProperty('overflow')
})
watch([iconPickerOpen, approachManagerOpen], ([iconOpen, approachOpen]) => {
  if (!import.meta.client) return
  document.body.style.setProperty('overflow', iconOpen || approachOpen ? 'hidden' : '')
})
</script>

<template>
  <AdminAuthBoundary><AdminShell><div class="caractere-admin">
    <header class="admin-section-heading"><div><p class="admin-eyebrow">Contenu mutualisé</p><h1>Caractères</h1><p class="admin-muted">Une modification s’applique immédiatement à tous les coaches qui partagent ce caractère.</p></div><button class="admin-button admin-button--primary" @click="tab === 'caracteres' ? newCaractere() : selectMedia()">{{ tab === 'caracteres' ? 'Nouveau caractère' : 'Nouveau média' }}</button></header>
    <div class="caractere-tabs"><button :class="{ active: tab === 'caracteres' }" @click="tab = 'caracteres'">Caractères</button><button :class="{ active: tab === 'media' }" @click="tab = 'media'">Médiathèque <span>{{ media.length }}</span></button></div>
    <p v-if="error" class="admin-notice admin-notice--error">{{ error }}</p><p v-if="success" class="admin-notice admin-notice--success">{{ success }}</p>

    <div v-if="tab === 'caracteres'" class="caractere-workspace">
      <aside class="caractere-list admin-card"><button v-for="caractere in sortedCaracteres" :key="caractere.id" :class="{ selected: caractere.id === selectedId, 'is-disabled': caractere.status === 'disabled' }" @click="selectCaractere(caractere)"><span class="caractere-list__mark">{{ caractere.emoticon }}</span><span><strong>{{ formatCaractereName(caractere) }}</strong><small><span v-if="caractere.status === 'disabled'">Désactivé · </span>{{ caractere.replies.length }} répliques · {{ caractere.assignments.length }} médias</small></span></button></aside>
      <form v-if="draft" class="caractere-editor" @submit.prevent>
        <section class="admin-card caractere-panel">
          <div class="panel-title caractere-profile-title">
            <div><p class="admin-eyebrow">Profil partagé</p><h2>{{ draft.masculineName ? formatCaractereName(draft) : 'Nouveau caractère' }}</h2></div>
            <div class="admin-field emoticon-field"><span>Icône *</span><button type="button" class="emoticon-trigger" aria-haspopup="dialog" @click="openIconPicker"><span aria-hidden="true">{{ draft.emoticon }}</span><small>Modifier</small></button></div>
            <div class="caractere-profile-actions"><button type="button" class="admin-button admin-button--primary caractere-help-button" :disabled="openingHelp || duplicatingCaractere || deletingCaractere" @click="openCaractereHelp">{{ openingHelp ? 'Ouverture de l’aide…' : 'Voir l’aide automatique' }}</button><button v-if="draft.id" type="button" class="admin-button admin-button--small" :disabled="openingHelp || duplicatingCaractere || deletingCaractere" @click="duplicateCaractere">{{ duplicatingCaractere ? 'Duplication…' : 'Dupliquer' }}</button><button v-if="draft.id" type="button" class="admin-button admin-button--danger admin-button--small" :disabled="duplicatingCaractere || deletingCaractere" @click="disableCaractere">Désactiver</button><button v-if="draft.id" type="button" class="admin-button admin-button--danger admin-button--small caractere-delete-button" :disabled="duplicatingCaractere || deletingCaractere" @click="deleteCaractere">{{ deletingCaractere ? 'Suppression…' : 'Supprimer' }}</button></div>
          </div>
          <div v-if="draft.id" class="caractere-coaches">
            <div><strong>Coaches utilisant ce caractère</strong><small>{{ caractereCoaches.length }} coach{{ caractereCoaches.length > 1 ? 'es' : '' }}</small></div>
            <div v-if="caractereCoaches.length" class="caractere-coaches__portraits">
              <NuxtLink v-for="coach in caractereCoaches" :key="coach.id" :to="{ path: '/admin/coaches', query: { coach: coach.id } }" :title="`Modifier ${coach.firstName} ${coach.lastName}`" :aria-label="`Ouvrir la fiche de ${coach.firstName} ${coach.lastName}`">
                <img :src="coach.avatarPath" alt="">
                <span>{{ coach.firstName }}</span>
              </NuxtLink>
            </div>
            <p v-else>Aucun coach n’utilise encore ce caractère.</p>
          </div>
          <div class="caractere-fields"><label class="admin-field"><span>Nom *</span><input v-model="draft.masculineName" required></label><label class="admin-field"><span>Identifiant *</span><input v-model="draft.slug" required></label><label class="admin-field"><span>Ordre</span><input v-model.number="draft.sortOrder" type="number"></label><label class="admin-field wide"><span>Description courte *</span><textarea v-model="draft.pedagogicalStyle" rows="3" required /></label><label class="admin-field"><span>Approche de l’aide</span><select :value="draft.helpApproachId" @change="selectHelpApproach"><option v-for="approach in helpApproaches" :key="approach.id" :value="approach.id">{{ approach.name }}</option><option disabled>──────────</option><option value="manage">Modifier les approches…</option></select></label><label class="admin-field"><span>Statut</span><select v-model="draft.status"><option value="draft">Brouillon</option><option value="published">Publié</option><option value="disabled">Désactivé</option></select></label></div>
        </section>
        <section class="admin-card caractere-panel dialogue-panel">
          <div class="panel-title"><div><p class="admin-eyebrow">Dialogue partagé</p><h2>Textes du caractère</h2></div><strong>{{ draft.replies.length }} phrase(s)</strong></div>
          <p class="admin-muted dialogue-intro">Les phrases sont classées selon le moment où elles peuvent apparaître dans la conversation. Ouvrez une catégorie pour gérer son contenu. <span class="required-note">* Catégorie obligatoire</span></p>
          <details class="variables-help"><summary>Variables utilisables dans les phrases</summary><p>{{ placeholdersLabel }}</p></details>
          <div class="reply-groups">
            <details v-for="eventType in COACH_EVENTS" :key="eventType" class="reply-group" :open="eventType === 'introduction'">
              <summary class="reply-group__summary">
                <span class="reply-group__heading"><strong>{{ EVENT_LABELS[eventType] }}<span v-if="REQUIRED_REPLY_EVENTS.has(eventType)" class="required-mark" aria-label="obligatoire"> *</span></strong><small>{{ EVENT_DESCRIPTIONS[eventType] }}</small></span>
                <span class="reply-group__count" :class="{ 'is-empty': activeReplyCount(eventType) === 0 }">{{ activeReplyCount(eventType) }} active(s)</span>
              </summary>
              <div class="reply-group__body">
                <div v-if="!repliesFor(eventType).length" class="reply-group__empty">
                  <span>Aucune phrase dans cette catégorie.</span>
                  <small v-if="REQUIRED_REPLY_EVENTS.has(eventType)">Au moins une phrase active est nécessaire pour publier ce caractère.</small>
                </div>
                <div v-else class="reply-list">
                  <article v-for="reply in repliesFor(eventType)" :key="reply.id || draft.replies.indexOf(reply)" class="reply-card" :class="{ 'is-inactive': !reply.isActive }">
                    <label class="reply-card__content"><span>Phrase</span><textarea v-model="reply.content" rows="2" required /></label>
                    <div class="reply-card__settings">
                      <label class="reply-active"><input v-model="reply.isActive" type="checkbox"><span>Active</span></label>
                      <label class="reply-weight"><span>Fréquence</span><input v-model.number="reply.weight" type="number" min="1" max="20"><small>1 = rare, 20 = fréquente</small></label>
                      <button type="button" class="reply-delete" aria-label="Supprimer cette phrase" @click="removeReply(reply)">Supprimer</button>
                    </div>
                  </article>
                </div>
                <button type="button" class="admin-button admin-button--small reply-add" @click="addReply(eventType)">+ Ajouter une phrase</button>
              </div>
            </details>
          </div>
        </section>
        <section class="admin-card caractere-panel reaction-media-panel">
          <div class="panel-title"><div><p class="admin-eyebrow">Réactions partagées</p><h2>GIF animés et émojis</h2></div><strong>{{ draft.assignments.length }} attribué(s)</strong></div>
          <h3>Fréquence des réactions</h3><div class="rule-list"><div v-for="eventType in REACTION_EVENTS" :key="eventType"><button type="button" @click="ensureRule(eventType)">{{ EVENT_LABELS[eventType] }}</button><template v-if="ruleFor(eventType)"><label>GIF animés <select :value="ruleFor(eventType)?.animationProbability" @change="updateRule(eventType, 'animationProbability', inputValue($event))"><option v-for="option in MEDIA_FREQUENCY_OPTIONS" :key="`animation-${eventType}-${option.value}`" :value="option.value">{{ option.label }}</option></select></label><label>Émojis <select :value="ruleFor(eventType)?.emojiProbability" @change="updateRule(eventType, 'emojiProbability', inputValue($event))"><option v-for="option in MEDIA_FREQUENCY_OPTIONS" :key="`emoji-${eventType}-${option.value}`" :value="option.value">{{ option.label }}</option></select></label><label>Pause <input :value="ruleFor(eventType)?.cooldownQuestions" type="number" min="0" @input="updateRule(eventType, 'cooldownQuestions', inputValue($event))"></label></template></div></div>
          <div class="response-media-groups">
            <section v-for="group in responseMediaGroups" :key="group.key" class="response-media-group" :class="`response-media-group--${group.key}`">
              <header>
                <div><p class="admin-eyebrow">{{ group.title }}</p><h3>{{ group.title }}</h3><small>{{ group.description }}</small></div>
                <div class="media-selection-actions">
                  <strong>{{ assignedMediaCount(group.items, group.key) }}/{{ group.items.length }}</strong>
                  <button type="button" class="admin-button admin-button--small" @click="setResponseMediaSelection(group.key, true)">Tout sélectionner</button>
                  <button type="button" class="admin-button admin-button--small" @click="setResponseMediaSelection(group.key, false)">Tout désélectionner</button>
                </div>
              </header>
              <p v-if="!group.items.length" class="admin-muted">Aucun média dans cette catégorie.</p>
              <div v-else class="media-grid">
                <article v-for="item in group.items" :key="item.id" :class="{ assigned: assignmentFor(item.id, group.key) }">
                  <button type="button" class="media-delete-button" :aria-label="`Supprimer définitivement ${item.name}`" title="Supprimer définitivement" @click.stop="deleteMedia(item)">×</button>
                  <button type="button" @click="toggleResponseMedia(item, group.key)"><img :src="item.filePath" :alt="item.altText"><span>{{ assignmentFor(item.id, group.key) ? '✓' : '+' }}</span></button>
                  <strong>{{ item.name }}</strong>
                  <label v-if="assignmentFor(item.id, group.key)">Poids <input :value="assignmentFor(item.id, group.key)?.weight" type="number" min="1" max="20" @input="updateAssignment(item.id, 'weight', inputValue($event))"></label>
                </article>
              </div>
              <p v-if="group.key === 'incorrect' && assignedMediaCount(group.items, group.key) === 0" class="response-media-group__text-only">Aucun média sélectionné : les mauvaises réponses utiliseront uniquement du texte.</p>
            </section>
          </div>
          <details v-if="otherReactionMedia.length" class="other-reaction-media">
            <summary>Autres moments de la conversation · {{ otherReactionMedia.length }} média(s)</summary>
            <div class="media-grid">
              <article v-for="item in otherReactionMedia" :key="item.id" :class="{ assigned: assignmentFor(item.id) }"><button type="button" class="media-delete-button" :aria-label="`Supprimer définitivement ${item.name}`" title="Supprimer définitivement" @click.stop="deleteMedia(item)">×</button><button type="button" @click="toggleMedia(item)"><img :src="item.filePath" :alt="item.altText"><span>{{ assignmentFor(item.id) ? '✓' : '+' }}</span></button><strong>{{ item.name }}</strong><template v-if="assignmentFor(item.id)"><select :value="assignmentFor(item.id)?.eventType" @change="updateAssignment(item.id, 'eventType', inputValue($event))"><option v-for="eventType in COACH_EVENTS" :key="eventType" :value="eventType">{{ EVENT_LABELS[eventType] }}</option></select><label>Poids <input :value="assignmentFor(item.id)?.weight" type="number" min="1" max="20" @input="updateAssignment(item.id, 'weight', inputValue($event))"></label></template></article>
            </div>
          </details>
        </section>
        <div class="save-bar">
          <p class="autosave-status" :class="`is-${autosaveState}`" aria-live="polite"><span aria-hidden="true" />{{ autosaveLabel }}</p>
          <button v-if="autosaveState === 'error'" type="button" class="admin-button admin-button--small" @click="autosaveCaractere">Réessayer</button>
        </div>
      </form>
    </div>

    <div v-else class="media-workspace"><aside class="media-library admin-card"><button v-for="item in media" :key="item.id" :class="{ selected: item.id === selectedMediaId }" @click="selectMedia(item)"><img :src="item.filePath" :alt="item.altText"><span><strong>{{ item.name }}</strong><small>{{ item.mediaType }} · {{ item.safetyStatus }}</small></span></button></aside><form class="admin-card media-editor" @submit.prevent="saveMedia"><div class="panel-title"><h2>{{ mediaDraft.id ? 'Modifier le média' : 'Ajouter un média' }}</h2><img v-if="mediaDraft.filePath && mediaDraft.mediaType !== 'video'" :src="mediaDraft.filePath" alt="Aperçu"></div><label class="admin-field"><span>Importer</span><input type="file" accept="image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm" :disabled="uploading" @change="uploadMedia"></label><label class="admin-field"><span>Nom *</span><input v-model="mediaDraft.name" required></label><label class="admin-field"><span>Chemin *</span><input v-model="mediaDraft.filePath" required></label><div class="caractere-fields"><label class="admin-field"><span>Type</span><select v-model="mediaDraft.mediaType"><option>emoji</option><option>animation</option><option>video</option><option>image</option></select></label><label class="admin-field"><span>Catégorie</span><select v-model="mediaDraft.category"><option value="success">Réussite</option><option value="encouragement">Encouragement</option><option value="finish">Fin</option><option value="welcome">Accueil</option><option value="neutral">Neutre</option></select></label><label class="admin-field"><span>Droits</span><select v-model="mediaDraft.rightsStatus"><option value="pending">À vérifier</option><option value="verified">Vérifiés</option><option value="rejected">Refusés</option></select></label><label class="admin-field"><span>Sécurité mineurs</span><select v-model="mediaDraft.safetyStatus"><option value="pending">À vérifier</option><option value="approved">Approuvée</option><option value="rejected">Refusée</option></select></label></div><label class="admin-field"><span>Texte alternatif *</span><input v-model="mediaDraft.altText" required></label><button class="admin-button admin-button--primary" :disabled="saving || uploading">Enregistrer le média</button></form></div>

    <Teleport to="body">
      <div v-if="approachManagerOpen" class="icon-picker-backdrop" @click.self="closeApproachManager" @keydown.esc.prevent="closeApproachManager">
        <section class="icon-picker approach-manager" role="dialog" aria-modal="true" aria-labelledby="approach-manager-title">
          <header><div><p class="admin-eyebrow">Aides automatiques</p><h2 id="approach-manager-title">Gérer les approches</h2></div><button type="button" class="icon-picker__close" aria-label="Fermer" :disabled="Boolean(approachSaving)" @click="closeApproachManager">×</button></header>
          <p class="approach-manager__intro">Le nom est libre. Le comportement moteur indique la stratégie utilisée par le générateur automatique.</p>
          <p v-if="approachError" class="admin-notice admin-notice--error">{{ approachError }}</p>
          <div class="approach-manager__list">
            <article v-for="approach in approachDrafts" :key="approach.id">
              <label class="admin-field"><span>Nom</span><input v-model="approach.name" maxlength="80"></label>
              <label class="admin-field"><span>Comportement moteur</span><select v-model="approach.engineKey"><option value="cif-falc">CIF · FALC</option><option value="concise">Très condensé</option><option value="grammatical-technical">Grammatico-technique</option><option value="guided-discovery">Découverte guidée</option></select></label>
              <span class="approach-manager__usage">{{ approach.characterCount }} caractère{{ approach.characterCount > 1 ? 's' : '' }}</span>
              <button type="button" class="admin-button admin-button--small" :disabled="Boolean(approachSaving) || !approach.name.trim()" @click="saveHelpApproach(approach)">{{ approachSaving === approach.id ? 'Enregistrement…' : 'Enregistrer' }}</button>
              <button type="button" class="admin-button admin-button--danger admin-button--small" :disabled="Boolean(approachSaving) || approach.characterCount > 0" :title="approach.characterCount ? 'Cette approche est encore utilisée' : 'Supprimer cette approche'" @click="deleteHelpApproach(approach)">Supprimer</button>
            </article>
          </div>
          <form class="approach-manager__new" @submit.prevent="createHelpApproach"><label class="admin-field"><span>Nouvelle approche</span><input v-model="newApproachName" maxlength="80" placeholder="Nom de l’approche"></label><button class="admin-button admin-button--primary" :disabled="Boolean(approachSaving) || !newApproachName.trim()">{{ approachSaving === 'new' ? 'Ajout…' : 'Ajouter' }}</button></form>
        </section>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="iconPickerOpen" class="icon-picker-backdrop" @click.self="closeIconPicker" @keydown.esc.prevent="closeIconPicker">
        <section ref="iconPicker" class="icon-picker" role="dialog" aria-modal="true" aria-labelledby="icon-picker-title">
          <header><div><p class="admin-eyebrow">Caractère</p><h2 id="icon-picker-title">Choisir une icône</h2></div><button type="button" class="icon-picker__close" aria-label="Fermer" @click="closeIconPicker">×</button></header>
          <div class="icon-picker__groups">
            <section v-for="group in caractereIconGroups" :key="group.label">
              <h3>{{ group.label }}</h3>
              <div class="icon-picker__grid">
                <button v-for="icon in group.icons" :key="icon.value" type="button" :title="icon.label" :aria-label="icon.label" :aria-pressed="draft?.emoticon === icon.value" @click="selectCaractereIcon(icon.value)"><span aria-hidden="true">{{ icon.value }}</span><small>{{ icon.label }}</small></button>
              </div>
            </section>
          </div>
          <p class="icon-picker__hint">Le choix est enregistré immédiatement.</p>
        </section>
      </div>
    </Teleport>
  </div></AdminShell></AdminAuthBoundary>
</template>

<style scoped>
.caractere-admin,.caractere-editor{display:grid;gap:18px}.caractere-tabs{display:flex;gap:8px;border-bottom:1px solid var(--admin-border)}.caractere-tabs button{padding:10px 15px;border:0;border-radius:9px 9px 0 0;background:#edf3f5;font-weight:800;cursor:pointer}.caractere-tabs button.active{color:white;background:var(--admin-blue)}.caractere-tabs span{padding:1px 6px;border-radius:10px;background:rgb(255 255 255 / 25%)}.caractere-workspace,.media-workspace{display:grid;grid-template-columns:minmax(230px,280px) minmax(0,1fr);gap:18px;align-items:start}.caractere-list,.media-library{padding:10px;max-height:calc(100vh - 190px);overflow:auto;box-shadow:none}.caractere-list button,.media-library button{display:grid;width:100%;grid-template-columns:46px 1fr;gap:10px;align-items:center;padding:9px;text-align:left;border:1px solid transparent;border-radius:10px;background:white;cursor:pointer}.caractere-list button.selected,.media-library button.selected{border-color:#72b3c4;background:var(--admin-cyan)}.caractere-list__mark{display:grid;width:46px;height:46px;place-items:center;color:white;background:var(--admin-blue);border-radius:13px;font-size:1.25rem;font-weight:900}.caractere-list button>span:last-child,.media-library button>span{display:grid;min-width:0}.caractere-list small,.media-library small{color:var(--admin-muted)}.caractere-panel,.media-editor{padding:20px;box-shadow:none}.panel-title{display:flex;justify-content:space-between;align-items:center;gap:15px}.panel-title h2,.caractere-panel h2{margin:0;color:var(--admin-navy)}.panel-title>img{width:90px;height:70px;object-fit:contain;border-radius:10px}.caractere-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin-top:17px}.caractere-fields .wide{grid-column:1/-1}.variables{font-size:.82rem;overflow-wrap:anywhere}.reply-list{display:grid;gap:9px}.reply-row{display:grid;grid-template-columns:170px minmax(260px,1fr) 85px 34px;gap:8px;align-items:center}.reply-row textarea,.reply-row select,.reply-row input,.media-grid select,.media-grid input{width:100%;padding:8px;border:1px solid var(--admin-border);border-radius:7px}.reply-row label,.media-grid label{font-size:.72rem}.reply-row>button{border:0;border-radius:7px;background:#f7e4e2;color:#9c342f;font-size:1.2rem;cursor:pointer}.media-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(135px,1fr));gap:10px;margin-top:16px}.media-grid article{display:grid;padding:8px;gap:6px;border:1px solid var(--admin-border);border-radius:10px}.media-grid article.assigned{border-color:#62a7ba;background:#eff9fb}.media-grid article>button{position:relative;height:90px;padding:0;overflow:hidden;border:0;border-radius:7px;background:#e8eff1;cursor:pointer}.media-grid article img{width:100%;height:100%;object-fit:contain}.media-grid article button span{position:absolute;right:5px;top:5px;display:grid;width:24px;height:24px;place-items:center;color:white;background:#176b87;border-radius:50%}.media-grid article>strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.82rem}.rule-list{display:grid;gap:7px}.rule-list>div{display:grid;grid-template-columns:170px repeat(3,minmax(115px,1fr));gap:10px;align-items:center}.rule-list button{padding:8px;text-align:left;border:0;border-radius:7px;background:#edf3f5;font-weight:800}.rule-list label{display:flex;gap:7px;align-items:center;font-size:.8rem}.rule-list input{width:75px}.rule-list select{min-width:0;flex:1;padding:7px;border:1px solid var(--admin-border);border-radius:7px;background:white}.save-bar{position:sticky;bottom:10px;display:flex;justify-content:flex-end;align-items:center;gap:12px;padding:12px;background:rgb(255 255 255 / 90%);border-radius:12px;box-shadow:0 8px 30px rgb(18 56 70 / 15%)}.autosave-status{display:flex;align-items:center;gap:8px;margin:0;color:var(--admin-muted);font-size:.84rem;font-weight:800}.autosave-status>span{width:9px;height:9px;border-radius:50%;background:#4d967c}.autosave-status.is-dirty>span,.autosave-status.is-saving>span{background:#d29a2e}.autosave-status.is-saving>span{animation:autosave-pulse .9s ease-in-out infinite}.autosave-status.is-error{color:#9c342f}.autosave-status.is-error>span{background:#b94a42}@keyframes autosave-pulse{50%{opacity:.3}}.media-library button{grid-template-columns:72px 1fr}.media-library img{width:72px;height:56px;object-fit:contain;border-radius:7px}.media-editor{display:grid;gap:14px}.media-editor .caractere-fields{margin:0}.media-editor>.admin-button{justify-self:end}@media(max-width:900px){.caractere-workspace,.media-workspace{grid-template-columns:1fr}.caractere-list,.media-library{max-height:260px}}@media(max-width:650px){.caractere-fields,.reply-row,.rule-list>div{grid-template-columns:1fr}.caractere-fields .wide{grid-column:auto}.media-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.dialogue-intro{max-width:760px;margin:10px 0 14px}.variables-help{margin-bottom:16px;padding:10px 13px;border:1px solid var(--admin-border);border-radius:9px;background:#f7fafb;font-size:.82rem}.variables-help summary{color:var(--admin-blue);font-weight:800;cursor:pointer}.variables-help p{margin:8px 0 0;overflow-wrap:anywhere}.reply-groups{display:grid;gap:10px}.reply-group{overflow:hidden;border:1px solid var(--admin-border);border-radius:12px;background:white}.reply-group[open]{border-color:#9bc7d2;box-shadow:0 5px 16px rgb(18 56 70 / 7%)}.reply-group__summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;cursor:pointer;list-style:none}.reply-group__summary::-webkit-details-marker{display:none}.reply-group__summary::before{content:'›';flex:0 0 auto;color:var(--admin-blue);font-size:1.5rem;font-weight:900;line-height:1;transition:transform .15s ease}.reply-group[open]>.reply-group__summary::before{transform:rotate(90deg)}.reply-group__heading{display:grid;flex:1;gap:2px}.reply-group__heading strong{color:var(--admin-navy)}.reply-group__heading small{color:var(--admin-muted);font-weight:400}.reply-group__count{padding:4px 9px;border-radius:999px;background:#dff1e9;color:#24634f;font-size:.75rem;font-weight:800;white-space:nowrap}.reply-group__count.is-empty{background:#f3e6e4;color:#8b4039}.reply-group__body{display:grid;gap:12px;padding:15px 16px 16px;border-top:1px solid var(--admin-border);background:#f8fbfc}.reply-group__empty{display:grid;gap:3px;padding:12px;color:var(--admin-muted);border:1px dashed var(--admin-border);border-radius:9px;background:white}.reply-group__empty small{color:#9c4d42}.reply-card{display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:14px;padding:13px;border:1px solid var(--admin-border);border-radius:10px;background:white}.reply-card.is-inactive{opacity:.68;background:#f3f5f5}.reply-card label{font-size:.76rem;font-weight:800}.reply-card textarea,.reply-card input{width:100%;padding:8px;border:1px solid var(--admin-border);border-radius:7px;background:white}.reply-card__content{display:grid;gap:5px}.reply-card__settings{display:grid;grid-template-columns:1fr auto;gap:9px 12px;align-items:start}.reply-active{display:flex;align-items:center;gap:7px}.reply-active input{width:auto}.reply-weight{display:grid;grid-column:1/-1;grid-template-columns:1fr 65px;gap:4px 8px;align-items:center}.reply-weight small{grid-column:1/-1;color:var(--admin-muted);font-weight:400}.reply-delete{grid-column:1/-1;justify-self:start;padding:5px 8px;border:0;border-radius:6px;background:#f7e4e2;color:#9c342f;font-weight:800;cursor:pointer}.reply-add{justify-self:start}
.caractere-coaches{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-top:18px;padding:14px 16px;border:1px solid var(--admin-border);border-radius:14px;background:#f3f7f8}.caractere-coaches>div:first-child{display:grid;gap:2px;flex:0 0 auto}.caractere-coaches>div:first-child strong{color:var(--admin-navy);font-size:.86rem}.caractere-coaches>div:first-child small,.caractere-coaches>p{margin:0;color:var(--admin-muted);font-size:.76rem}.caractere-coaches__portraits{display:flex;flex:1;justify-content:flex-end;gap:10px;overflow-x:auto;padding:2px}.caractere-coaches__portraits a{display:grid;justify-items:center;gap:4px;padding:4px;border:1px solid transparent;border-radius:12px;text-decoration:none;transition:background .15s ease,border-color .15s ease,transform .15s ease}.caractere-coaches__portraits a:hover{border-color:#72b3c4;background:white;transform:translateY(-2px)}.caractere-coaches__portraits a:focus-visible{outline:3px solid #72b3c4;outline-offset:2px}.caractere-coaches img{width:54px;height:54px;object-fit:cover;border:3px solid white;border-radius:50%;box-shadow:0 3px 10px rgb(18 56 70 / 16%)}.caractere-coaches__portraits a>span{max-width:70px;overflow:hidden;color:var(--admin-muted);font-size:.66rem;font-weight:750;text-overflow:ellipsis;white-space:nowrap}
:global(:root[data-theme='dark'] .caractere-coaches){border-color:rgb(128 181 190 / 30%);background:rgb(32 57 62 / 42%);box-shadow:inset 0 1px 0 rgb(255 255 255 / 3%);backdrop-filter:blur(7px)}:global(:root[data-theme='dark'] .caractere-coaches>div:first-child strong){color:#c6e4e7}:global(:root[data-theme='dark'] .caractere-coaches>div:first-child small),:global(:root[data-theme='dark'] .caractere-coaches>p),:global(:root[data-theme='dark'] .caractere-coaches__portraits a>span){color:#9eb8bc}:global(:root[data-theme='dark'] .caractere-coaches__portraits a:hover){border-color:rgb(132 202 213 / 48%);background:rgb(67 105 112 / 28%)}:global(:root[data-theme='dark'] .caractere-coaches img){border-color:rgb(220 240 242 / 78%);box-shadow:0 4px 14px rgb(0 0 0 / 28%)}
:global(:root[data-theme='dark'] .variables-help),:global(:root[data-theme='dark'] .reply-group),:global(:root[data-theme='dark'] .reply-card),:global(:root[data-theme='dark'] .reply-group__empty),:global(:root[data-theme='dark'] .media-grid article){border-color:rgb(128 181 190 / 28%);background:rgb(31 55 60 / 38%);box-shadow:inset 0 1px 0 rgb(255 255 255 / 2%);backdrop-filter:blur(7px)}
:global(:root[data-theme='dark'] .reply-group[open]){border-color:rgb(132 202 213 / 48%);background:rgb(34 62 68 / 44%);box-shadow:0 7px 20px rgb(0 0 0 / 13%)}
:global(:root[data-theme='dark'] .reply-group__body){border-color:rgb(128 181 190 / 22%);background:rgb(11 31 35 / 18%)}
:global(:root[data-theme='dark'] .reply-group__heading strong),:global(:root[data-theme='dark'] .reply-card label),:global(:root[data-theme='dark'] .variables-help summary){color:#c6e4e7}
:global(:root[data-theme='dark'] .reply-group__heading small),:global(:root[data-theme='dark'] .reply-group__empty),:global(:root[data-theme='dark'] .reply-weight small),:global(:root[data-theme='dark'] .dialogue-intro){color:#9eb8bc}
:global(:root[data-theme='dark'] .reply-group__count){color:#a9ddc8;background:rgb(45 108 83 / 38%)}:global(:root[data-theme='dark'] .reply-group__count.is-empty){color:#e7aaa3;background:rgb(121 57 51 / 35%)}
:global(:root[data-theme='dark'] .reply-card.is-inactive){background:rgb(26 45 49 / 28%)}
:global(:root[data-theme='dark'] .caractere-list button),:global(:root[data-theme='dark'] .media-library button){color:#dce8e9;background:transparent}:global(:root[data-theme='dark'] .caractere-list button:hover),:global(:root[data-theme='dark'] .media-library button:hover){background:rgb(62 103 111 / 22%)}:global(:root[data-theme='dark'] .caractere-list button.selected),:global(:root[data-theme='dark'] .media-library button.selected){border-color:rgb(132 202 213 / 48%);background:rgb(50 102 112 / 36%)}
:global(:root[data-theme='dark'] .media-grid article.assigned){border-color:rgb(132 202 213 / 50%);background:rgb(42 91 100 / 34%)}:global(:root[data-theme='dark'] .media-grid article>button){background:rgb(18 41 46 / 48%)}:global(:root[data-theme='dark'] .rule-list button){color:#c6e4e7;background:rgb(47 79 85 / 34%)}:global(:root[data-theme='dark'] .rule-list select){color:#dce8e9;border-color:rgb(128 181 190 / 34%);background:rgb(18 41 46 / 58%)}
:global(:root[data-theme='dark'] .save-bar){background:rgb(25 46 51 / 76%);box-shadow:0 8px 30px rgb(0 0 0 / 25%);backdrop-filter:blur(10px)}
.caractere-list__mark{color:initial;background:#e8f2f5;font-size:1.65rem;font-weight:400;line-height:1}.caractere-profile-title{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)}.caractere-profile-title>.emoticon-field{justify-self:center;align-self:center;gap:3px;text-align:center}.caractere-profile-actions{display:flex;justify-self:end;align-items:center;gap:8px}.caractere-help-button{min-height:48px;padding:12px 19px;color:white;border-color:var(--admin-blue);border-radius:13px;background:var(--admin-blue);font-size:.92rem;font-weight:900;box-shadow:none;white-space:nowrap}.caractere-help-button:hover{border-color:var(--admin-blue);background:color-mix(in srgb,var(--admin-blue) 88%,black);transform:translateY(-1px);box-shadow:none}.caractere-help-button:focus-visible{outline:4px solid color-mix(in srgb,var(--admin-blue) 32%,transparent);outline-offset:3px}:global(:root[data-theme='dark'] .caractere-help-button.admin-button--primary){color:#102d35;border-color:#72c4d7;background:#58abc1;box-shadow:none}:global(:root[data-theme='dark'] .caractere-help-button.admin-button--primary:hover:not(:disabled)){color:#0d2931;border-color:#83cede;background:#68b8cc;box-shadow:none}.emoticon-trigger{display:grid;min-width:84px;padding:7px 12px;place-items:center;gap:2px;border:1px solid var(--admin-border);border-radius:13px;color:var(--admin-navy);background:#f4f9fa;cursor:pointer}.emoticon-trigger>span{font-size:1.9rem;line-height:1.2}.emoticon-trigger>small{color:var(--admin-blue);font-size:.66rem;font-weight:800}.emoticon-trigger:hover{border-color:#72b3c4;background:#e8f5f7}.emoticon-trigger:focus-visible{outline:3px solid rgb(64 159 181 / 28%);outline-offset:2px}
.caractere-delete-button{border-width:2px;background:#9c342f;color:white}.caractere-delete-button:hover:not(:disabled){background:#7f2723}
.caractere-list button.is-disabled{opacity:.52;background:#f2f4f4}.caractere-list button.is-disabled .caractere-list__mark{filter:grayscale(1);opacity:.72}.caractere-list button.is-disabled strong{text-decoration:line-through;text-decoration-thickness:2px;text-decoration-color:#9aa8ad}.caractere-list button.is-disabled small{color:#8a9aa0}
:global(:root[data-theme='dark'] .caractere-list button.is-disabled){background:rgb(20 36 40 / 34%);opacity:.5}:global(:root[data-theme='dark'] .caractere-list button.is-disabled strong){text-decoration-color:#70858b}:global(:root[data-theme='dark'] .caractere-list button.is-disabled small){color:#8fa4a9}
.media-grid article{position:relative}.media-grid article>.media-delete-button{position:absolute;z-index:2;right:7px;bottom:7px;display:grid;width:28px;height:28px;min-height:0;padding:0;place-items:center;color:#9c342f;border:1px solid #e5b2ac;border-radius:50%;background:rgb(255 247 246 / 94%);font-size:1.15rem;font-weight:950;line-height:1;box-shadow:0 2px 9px rgb(18 56 70 / 16%)}.media-grid article>.media-delete-button:hover{color:white;border-color:#9c342f;background:#b94a42}.media-grid article>.media-delete-button:focus-visible{outline:3px solid rgb(185 74 66 / 30%);outline-offset:2px}
:global(:root[data-theme='dark'] .media-grid article>.media-delete-button){color:#f4b8b2;border-color:rgb(225 135 126 / 45%);background:rgb(90 45 43 / 88%);box-shadow:0 2px 10px rgb(0 0 0 / 28%)}:global(:root[data-theme='dark'] .media-grid article>.media-delete-button:hover){color:#fff;border-color:#f4b8b2;background:#9c342f}
.icon-picker-backdrop{position:fixed;z-index:1000;inset:0;display:grid;padding:24px;place-items:center;background:rgb(9 28 34 / 68%);backdrop-filter:blur(5px)}.icon-picker{display:grid;width:min(780px,100%);max-height:min(780px,calc(100vh - 48px));padding:22px;border:1px solid var(--admin-border);border-radius:22px;color:var(--admin-text);background:var(--admin-surface,#fff);box-shadow:0 28px 80px rgb(3 20 25 / 35%);overflow:hidden}.icon-picker>header{display:flex;align-items:start;justify-content:space-between;gap:20px;padding-bottom:14px;border-bottom:1px solid var(--admin-border)}.icon-picker h2{margin:0;color:var(--admin-navy)}.icon-picker__close{display:grid;width:38px;height:38px;padding:0;place-items:center;border:1px solid var(--admin-border);border-radius:11px;color:var(--admin-navy);background:transparent;font-size:1.65rem;line-height:1;cursor:pointer}.icon-picker__groups{display:grid;padding:16px 4px 8px;gap:18px;overflow:auto}.icon-picker__groups>section{display:grid;gap:8px}.icon-picker__groups h3{margin:0;color:var(--admin-muted);font-size:.78rem;letter-spacing:.07em;text-transform:uppercase}.icon-picker__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px}.icon-picker__grid button{display:grid;min-height:84px;padding:8px 5px;place-items:center;align-content:center;gap:5px;border:1px solid var(--admin-border);border-radius:13px;color:var(--admin-navy);background:var(--admin-surface,#fff);cursor:pointer}.icon-picker__grid button:hover{border-color:#72b3c4;background:#edf8fa;transform:translateY(-1px)}.icon-picker__grid button[aria-pressed='true']{border-color:var(--admin-blue);background:var(--admin-cyan);box-shadow:inset 0 0 0 2px var(--admin-blue)}.icon-picker__grid button:focus-visible{outline:3px solid rgb(64 159 181 / 28%);outline-offset:1px}.icon-picker__grid span{font-size:1.8rem;line-height:1}.icon-picker__grid small{font-size:.66rem;font-weight:750}.icon-picker__hint{margin:12px 0 0;color:var(--admin-muted);font-size:.75rem;text-align:center}
.approach-manager{grid-template-rows:auto auto auto minmax(0,1fr) auto;width:min(900px,100%)}.approach-manager__intro{margin:14px 0 4px;color:var(--admin-muted);font-size:.85rem}.approach-manager__list{display:grid;padding:12px 2px;gap:9px;overflow:auto}.approach-manager__list article{display:grid;grid-template-columns:minmax(180px,1fr) minmax(210px,1fr) auto auto auto;align-items:end;padding:12px;border:1px solid var(--admin-border);border-radius:12px;gap:10px}.approach-manager__usage{align-self:center;color:var(--admin-muted);font-size:.75rem;white-space:nowrap}.approach-manager__new{display:grid;grid-template-columns:minmax(220px,1fr) auto;align-items:end;padding-top:14px;border-top:1px solid var(--admin-border);gap:10px}.approach-manager__new .admin-button{min-height:42px}
:global(:root[data-theme='dark'] .icon-picker){--admin-surface:#172b30;color:#dce8e9;border-color:#405a60;background:#172b30}:global(:root[data-theme='dark'] .icon-picker h2),:global(:root[data-theme='dark'] .icon-picker__close),:global(:root[data-theme='dark'] .icon-picker__grid button){color:#dce8e9}:global(:root[data-theme='dark'] .icon-picker__grid button){border-color:#405a60;background:#1d3439}:global(:root[data-theme='dark'] .icon-picker__grid button:hover){border-color:#73b9c7;background:#26464d}:global(:root[data-theme='dark'] .icon-picker__grid button[aria-pressed='true']){border-color:#84cad5;background:#2b5058;box-shadow:inset 0 0 0 2px #84cad5}
.required-note{white-space:nowrap;font-weight:750}.required-mark{color:#9c342f}
.media-selection-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.media-selection-actions>strong{margin-right:4px}
.reaction-media-panel{display:grid;gap:18px}.response-media-groups{display:grid;gap:16px}.response-media-group{display:grid;padding:16px;border:1px solid var(--admin-border);border-left:6px solid #4d967c;border-radius:16px;gap:4px;background:#f5faf8}.response-media-group--incorrect{border-left-color:#bd6737;background:#fcf6f2}.response-media-group>header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}.response-media-group>header>div:first-child{display:grid;gap:2px}.response-media-group h3{margin:0;color:var(--admin-navy)}.response-media-group small{color:var(--admin-muted)}.response-media-group__text-only{margin:10px 0 0;padding:10px 12px;border:1px solid #dfc4b6;border-radius:10px;color:#754226;background:#fffaf7;font-size:.82rem;font-weight:750}.other-reaction-media{padding:13px 15px;border:1px solid var(--admin-border);border-radius:13px;background:#f7fafb}.other-reaction-media>summary{color:var(--admin-blue);font-weight:850;cursor:pointer}:global(:root[data-theme='dark'] .response-media-group){border-color:rgb(128 181 190 / 28%);border-left-color:#6db399;background:rgb(37 73 64 / 30%)}:global(:root[data-theme='dark'] .response-media-group--incorrect){border-left-color:#d8895c;background:rgb(87 52 37 / 30%)}:global(:root[data-theme='dark'] .response-media-group h3){color:#c6e4e7}:global(:root[data-theme='dark'] .response-media-group small){color:#9eb8bc}:global(:root[data-theme='dark'] .response-media-group__text-only){color:#e9c5b1;border-color:rgb(207 133 89 / 38%);background:rgb(91 48 30 / 32%)}:global(:root[data-theme='dark'] .other-reaction-media){border-color:rgb(128 181 190 / 28%);background:rgb(31 55 60 / 30%)}
@media(max-width:650px){.reply-card{grid-template-columns:1fr}.reply-group__summary{align-items:flex-start;flex-wrap:wrap}.reply-group__count{margin-left:28px}.caractere-coaches{align-items:flex-start;flex-direction:column}.caractere-coaches__portraits{width:100%;justify-content:flex-start}.caractere-profile-title{grid-template-columns:1fr auto}.caractere-profile-title>.emoticon-field{grid-row:1;grid-column:2}.caractere-profile-actions{grid-column:1/-1;justify-self:stretch}.caractere-profile-actions .admin-button{flex:1}.response-media-group>header{flex-direction:column}.response-media-group .media-selection-actions{justify-content:flex-start}.icon-picker-backdrop{padding:10px}.icon-picker{max-height:calc(100vh - 20px);padding:15px;border-radius:17px}.icon-picker__grid{grid-template-columns:repeat(3,minmax(0,1fr))}.icon-picker__grid button{min-height:76px}.approach-manager__list article{grid-template-columns:1fr}.approach-manager__new{grid-template-columns:1fr}}
</style>

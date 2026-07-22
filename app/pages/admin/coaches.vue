<script setup lang="ts">
import type { CoachCaractere, CoachEvent, CoachMedia, CoachProfile } from '~~/shared/types/coach'
import { COACH_EVENTS } from '~~/shared/types/coach'
import { formatCaractereName } from '~~/shared/utils/coach-caractere'
import { COACH_PLACEHOLDERS, createCoachReaction } from '~~/shared/utils/coach-dialogue'
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

const EVENT_LABELS: Record<CoachEvent, string> = {
  introduction: 'Présentation', question: 'Question', correct: 'Bonne réponse', 'correct-alternative': 'Bonne réponse avec variante',
  incorrect: 'Mauvaise réponse', 'cod-before': 'COD avant', 'cod-after': 'COD après', coi: 'COI',
  encouragement: 'Encouragement', 'help-announcement': 'Annonce d’aide', streak: 'Série réussie', finish: 'Fin', restart: 'Recommencer',
}
const REACTION_EVENTS: CoachEvent[] = ['correct', 'incorrect', 'streak', 'finish']
const placeholdersLabel = COACH_PLACEHOLDERS.map(item => `{${item}}`).join(' · ')
const { user, handleUnauthorized } = useAdminAuth()
const route = useRoute()
const coaches = ref<CoachProfile[]>([])
const caracteres = ref<CoachCaractere[]>([])
const media = ref<CoachMedia[]>([])
const selectedId = ref<number | null>(null)
const draft = ref<CoachProfile | null>(null)
const tab = ref<'coaches' | 'media'>('coaches')
const loading = ref(false)
const saving = ref(false)
const autosaveState = ref<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle')
const deleting = ref(false)
const error = ref('')
const success = ref('')
const previewEvent = ref<CoachEvent>('correct')
const selectedMediaId = ref<number | null>(null)
const mediaDraft = reactive({ id: 0, name: '', filePath: '', mediaType: 'animation', category: 'success', altText: '', rightsStatus: 'pending', safetyStatus: 'pending', isActive: true, fileSize: null as number | null })
const uploading = ref(false)
let loaded = false
let autosaveTimer: ReturnType<typeof setTimeout> | null = null
let autosavePromise: Promise<void> | null = null
let lastSavedSnapshot = ''

useHead({ title: 'Coaches — Administration' })

const preview = computed(() => draft.value ? createCoachReaction(draft.value, previewEvent.value, {
  verb: 'manger', complement: 'les pommes', participle: 'mangées', gender: 'féminin', number: 'pluriel',
  mode: 'indicatif', tense: 'passé composé', expectedAnswer: 'vous avez mangées', score: 85, correctCount: 17, questionCount: 20, questionNumber: 3,
}, { random: () => 0, allowMotion: true, mediaAllowed: true }) : null)
const autosaveLabel = computed(() => {
  if (autosaveState.value === 'saving') return 'Enregistrement…'
  if (autosaveState.value === 'dirty') return 'Modification en attente…'
  if (autosaveState.value === 'error') return 'Échec de l’enregistrement'
  return 'Toutes les modifications sont enregistrées'
})
const coachGroups = computed(() => {
  const caractereOrder = new Map(caracteres.value.map((caractere, index) => [caractere.id, index]))
  const groups = new Map<number, { caractereId: number, name: string, emoticon: string, coaches: CoachProfile[] }>()
  for (const coach of coaches.value) {
    const group = groups.get(coach.caractereId)
    if (group) group.coaches.push(coach)
    else {
      const caractere = caracteres.value.find(item => item.id === coach.caractereId)
      groups.set(coach.caractereId, {
        caractereId: coach.caractereId,
        name: caractere ? formatCaractereName(caractere) : coach.caractereName || 'Caractère non renseigné',
        emoticon: caractere?.emoticon || '🙂',
        coaches: [coach],
      })
    }
  }
  return [...groups.values()]
    .sort((left, right) => (caractereOrder.get(left.caractereId) ?? 999) - (caractereOrder.get(right.caractereId) ?? 999)
      || left.name.localeCompare(right.name, 'fr'))
})
const availableCaracteresForDraft = computed(() => caracteres.value
  .filter(caractere => caractere.status !== 'disabled' || caractere.id === draft.value?.caractereId)
  .sort((left, right) => left.sortOrder - right.sortOrder
    || formatCaractereName(left).localeCompare(formatCaractereName(right), 'fr')
    || left.id - right.id))

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T }
function cancelScheduledAutosave() {
  if (autosaveTimer) clearTimeout(autosaveTimer)
  autosaveTimer = null
}
function setCoachDraft(coach: CoachProfile) {
  cancelScheduledAutosave()
  selectedId.value = coach.id || null
  draft.value = clone(coach)
  lastSavedSnapshot = coach.id ? JSON.stringify(draft.value) : ''
  autosaveState.value = 'idle'
  error.value = ''
  success.value = ''
}
async function selectCoach(coach: CoachProfile) {
  await autosaveCoach()
  setCoachDraft(coach)
}
function blankCoach(): CoachProfile {
  const caractere = availableCaracteresForDraft.value.find(item => item.status !== 'disabled') || null
  const caractereName = caractere?.masculineName || ''
  return { id: 0, slug: '', firstName: '', lastName: '', gender: 'female', avatarPath: '', description: '', likes: '', caractereId: caractere?.id || 0, caractereName, personality: caractereName, pedagogicalStyle: caractere?.pedagogicalStyle || '', helpApproach: caractere?.helpApproach || 'complete-avec-reponses', themeColor: '#295f72', status: 'draft', sortOrder: coaches.value.length + 1, replies: [], media: clone(media.value), assignments: [], rules: [] }
}
async function newCoach() {
  await autosaveCoach()
  setCoachDraft(blankCoach())
}

async function load() {
  loading.value = true; error.value = ''
  try {
    const [coachResponse, caractereResponse, mediaResponse] = await Promise.all([
      $fetch<{ coaches: CoachProfile[] }>('/api/admin/coaches'),
      $fetch<{ caracteres: CoachCaractere[] }>('/api/admin/coach-caracteres'),
      $fetch<{ media: CoachMedia[] }>('/api/admin/coach-media'),
    ])
    coaches.value = coachResponse.coaches; caracteres.value = caractereResponse.caracteres; media.value = mediaResponse.media
    const requestedCoachId = Number(route.query.coach)
    const requestedCoach = Number.isInteger(requestedCoachId)
      ? coaches.value.find(item => item.id === requestedCoachId)
      : undefined
    if (requestedCoach) {
      setCoachDraft(requestedCoach)
    } else if (draft.value?.id) {
      const refreshed = coaches.value.find(item => item.id === draft.value?.id)
      if (refreshed) setCoachDraft(refreshed)
    } else if (!draft.value && coaches.value[0]) setCoachDraft(coaches.value[0])
  } catch (caught) { if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de charger les coaches.') }
  finally { loading.value = false }
}

async function saveCoach() {
  if (!draft.value || saving.value) return
  if (draft.value.id) {
    await autosaveCoach()
    return
  }
  saving.value = true; error.value = ''; success.value = ''
  try {
    if (draft.value.id) await $fetch(`/api/admin/coaches/${draft.value.id}`, { method: 'PUT', body: draft.value })
    else {
      const response = await $fetch<{ id: number }>('/api/admin/coaches', { method: 'POST', body: draft.value })
      draft.value.id = response.id; selectedId.value = response.id
    }
    await load(); success.value = 'Coach enregistré.'
  } catch (caught) { if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible d’enregistrer ce coach.') }
  finally { saving.value = false }
}

function coachCanBeSaved(coach: CoachProfile) {
  return Boolean(
    coach.slug.trim()
    && coach.firstName.trim()
    && coach.lastName.trim()
    && /^#[0-9a-f]{6}$/iu.test(coach.themeColor)
    && ['female', 'male'].includes(coach.gender)
    && Number.isInteger(coach.caractereId) && coach.caractereId > 0
    && ['draft', 'published', 'disabled'].includes(coach.status)
    && Number.isInteger(coach.sortOrder)
    && (coach.status !== 'published' || coach.avatarPath.trim()),
  )
}

function refreshCoachInList(saved: CoachProfile) {
  const item = coaches.value.find(coach => coach.id === saved.id)
  if (!item) return
  const caractere = caracteres.value.find(candidate => candidate.id === saved.caractereId)
  const caractereName = caractere?.masculineName || item.caractereName
  Object.assign(item, clone(saved), {
    caractereName,
    personality: caractereName,
    pedagogicalStyle: caractere?.pedagogicalStyle || item.pedagogicalStyle,
  })
}

function scheduleAutosave() {
  cancelScheduledAutosave()
  autosaveTimer = setTimeout(() => { void autosaveCoach() }, 650)
}

async function autosaveCoach() {
  cancelScheduledAutosave()
  if (autosavePromise) {
    await autosavePromise
    if (draft.value?.id && JSON.stringify(draft.value) !== lastSavedSnapshot) scheduleAutosave()
    return
  }
  const current = draft.value
  if (!current?.id) return
  const snapshot = JSON.stringify(current)
  if (snapshot === lastSavedSnapshot) return
  if (!coachCanBeSaved(current)) {
    autosaveState.value = 'dirty'
    return
  }

  const payload = clone(current)
  const coachId = current.id
  autosaveState.value = 'saving'
  error.value = ''
  autosavePromise = $fetch(`/api/admin/coaches/${coachId}`, { method: 'PUT', body: payload }).then(() => undefined)
  try {
    await autosavePromise
    lastSavedSnapshot = snapshot
    refreshCoachInList(payload)
    if (draft.value?.id === coachId && JSON.stringify(draft.value) === snapshot) autosaveState.value = 'saved'
    else if (draft.value?.id === coachId) scheduleAutosave()
  } catch (caught) {
    autosaveState.value = 'error'
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible d’enregistrer automatiquement ce coach.')
  } finally {
    autosavePromise = null
  }
}

async function deleteCoach() {
  if (!draft.value?.id || deleting.value) return
  const name = `${draft.value.firstName} ${draft.value.lastName}`.trim()
  if (!window.confirm(`Supprimer définitivement le coach ${name} ?\n\nCette action est irréversible.`)) return
  deleting.value = true; error.value = ''; success.value = ''
  try {
    await $fetch(`/api/admin/coaches/${draft.value.id}`, { method: 'DELETE' })
    selectedId.value = null
    draft.value = null
    await load(); success.value = `Le coach ${name} a été supprimé.`
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de supprimer ce coach.')
  } finally { deleting.value = false }
}

async function uploadAvatar(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !draft.value) return
  uploading.value = true; error.value = ''
  try {
    const data = new FormData(); data.append('file', file)
    const result = await $fetch<{ path: string }>('/api/admin/coach-media/upload', { method: 'POST', body: data })
    draft.value.avatarPath = result.path
  } catch (caught) { error.value = getAdminErrorMessage(caught, 'Impossible d’envoyer cet avatar.') }
  finally { uploading.value = false }
}

function addReply() { draft.value?.replies.push({ id: 0, eventType: 'correct', content: '', weight: 1, isActive: true }) }
function ensureRule(eventType: CoachEvent) {
  if (!draft.value) return
  if (!draft.value.rules.some(item => item.eventType === eventType)) {
    draft.value.rules.push({ eventType, mediaProbability: 0.2, animationProbability: 0.2, emojiProbability: 0.2, cooldownQuestions: 2 })
  }
}
function toggleMedia(item: CoachMedia) {
  if (!draft.value) return
  const index = draft.value.assignments.findIndex(assignment => assignment.mediaId === item.id)
  if (index >= 0) draft.value.assignments.splice(index, 1)
  else draft.value.assignments.push({ mediaId: item.id, eventType: item.category === 'success' ? 'correct' : 'incorrect', weight: 1, isActive: true })
}
function assignmentFor(id: number) { return draft.value?.assignments.find(item => item.mediaId === id) }
function ruleFor(eventType: CoachEvent) { return draft.value?.rules.find(item => item.eventType === eventType) }
function inputValue(event: Event) { return (event.target as HTMLInputElement | HTMLSelectElement).value }
function updateAssignment(id: number, field: 'eventType' | 'weight', value: string) {
  const assignment = assignmentFor(id)
  if (!assignment) return
  if (field === 'eventType') assignment.eventType = value as CoachEvent
  else assignment.weight = Number(value)
}
function updateRule(eventType: CoachEvent, field: 'mediaProbability' | 'cooldownQuestions', value: string) {
  const rule = ruleFor(eventType)
  if (rule) rule[field] = Number(value)
}

function selectMedia(item?: CoachMedia) {
  selectedMediaId.value = item?.id || null
  Object.assign(mediaDraft, item ? clone(item) : { id: 0, name: '', filePath: '', mediaType: 'animation', category: 'success', altText: '', rightsStatus: 'pending', safetyStatus: 'pending', isActive: true, fileSize: null })
}
async function uploadMedia(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
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
  const caractere = caracteres.value.find(item => item.id === current.caractereId)
  if (caractere) {
    const caractereName = caractere.masculineName
    if (current.caractereName !== caractereName || current.personality !== caractereName || current.pedagogicalStyle !== caractere.pedagogicalStyle) {
      current.caractereName = caractereName
      current.personality = caractereName
      current.pedagogicalStyle = caractere.pedagogicalStyle
      return
    }
  }
  if (!current.id) return
  const snapshot = JSON.stringify(current)
  if (snapshot === lastSavedSnapshot) return
  autosaveState.value = 'dirty'
  scheduleAutosave()
}, { deep: true })
watch(user, (current) => { if (current && !loaded) { loaded = true; void load() } if (!current) loaded = false }, { immediate: true })
onBeforeUnmount(cancelScheduledAutosave)
</script>

<template>
  <AdminAuthBoundary><AdminShell><div class="coach-admin">
    <header class="admin-section-heading"><div><p class="admin-eyebrow">Personnages virtuels</p><h1>Coaches</h1><p class="admin-muted">Gérez leur identité et attribuez-leur un caractère partagé.</p></div><button class="admin-button admin-button--primary" @click="newCoach">Nouveau coach</button></header>
    <p v-if="error" class="admin-notice admin-notice--error">{{ error }}</p><p v-if="success" class="admin-notice admin-notice--success">{{ success }}</p>

    <div class="coach-admin__workspace">
      <aside class="coach-admin__list admin-card">
        <section v-for="group in coachGroups" :key="group.caractereId" class="coach-list-group">
          <header><strong><span aria-hidden="true">{{ group.emoticon }}</span> {{ group.name }}</strong><span>{{ group.coaches.length }}</span></header>
          <button v-for="coach in group.coaches" :key="coach.id" :class="{ selected: coach.id === selectedId }" @click="selectCoach(coach)">
            <img :src="coach.avatarPath" alt="">
            <span><strong>{{ coach.firstName }} {{ coach.lastName }}</strong><small>{{ coach.status === 'published' ? 'Publié' : coach.status === 'draft' ? 'Brouillon' : 'Désactivé' }}</small></span>
          </button>
        </section>
      </aside>
      <form v-if="draft" class="coach-editor" @submit.prevent="saveCoach">
        <section class="admin-card coach-panel coach-identity-panel">
          <div class="coach-panel__title">
            <div><p class="admin-eyebrow">Identité</p><h2>{{ draft.id ? `${draft.firstName} ${draft.lastName}` : 'Nouveau coach' }}</h2></div>
            <button v-if="draft.id" type="button" class="admin-button admin-button--danger admin-button--small" :disabled="deleting" @click="deleteCoach">
              {{ deleting ? 'Suppression…' : 'Supprimer' }}
            </button>
          </div>

          <div class="coach-identity-layout">
            <div class="coach-identity-fields">
              <div class="coach-fields coach-fields--identity">
                <label class="admin-field"><span>Prénom *</span><input v-model="draft.firstName" required></label>
                <label class="admin-field"><span>Nom fictif *</span><input v-model="draft.lastName" required></label>
                <label class="admin-field"><span>Genre du personnage *</span><select v-model="draft.gender"><option value="female">Femme</option><option value="male">Homme</option></select></label>
                <label class="admin-field"><span>Identifiant *</span><input v-model="draft.slug" required></label>
                <label class="admin-field"><span>Caractère partagé *</span><select v-model.number="draft.caractereId" required><option v-for="caractere in availableCaracteresForDraft" :key="caractere.id" :value="caractere.id" :disabled="caractere.status === 'disabled'">{{ caractere.emoticon }} {{ formatCaractereName(caractere) }}{{ caractere.status === 'disabled' ? ' — désactivé' : '' }}</option></select></label>
                <label class="admin-field admin-field--color"><span>Couleur</span><input v-model="draft.themeColor" type="color"></label>
                <label class="admin-field"><span>Statut</span><select v-model="draft.status"><option value="draft">Brouillon</option><option value="published">Publié</option><option value="disabled">Désactivé</option></select></label>
                <label class="admin-field"><span>Ordre d’affichage</span><input v-model.number="draft.sortOrder" type="number"></label>
              </div>
              <div class="coach-description-fields">
                <label class="admin-field"><span>Citation</span><input v-model="draft.description"></label>
                <label class="admin-field"><span>J’aime</span><input v-model="draft.likes" placeholder="Ex. les phrases courtes, les exemples concrets…"></label>
              </div>
            </div>

            <aside class="coach-avatar-card">
              <div class="coach-avatar-card__portrait">
                <img v-if="draft.avatarPath" :src="draft.avatarPath" :alt="`Portrait de ${draft.firstName || 'ce coach'}`">
                <span v-else aria-hidden="true">?</span>
              </div>
              <label class="admin-field"><span>Chemin de l’avatar *</span><input v-model="draft.avatarPath" required></label>
              <label class="admin-field coach-avatar-card__upload"><span>Remplacer le portrait</span><input type="file" accept="image/png,image/jpeg,image/webp" :disabled="uploading" @change="uploadAvatar"><small>JPEG, PNG ou WebP</small></label>
            </aside>
          </div>
        </section>

        <div class="coach-editor__save">
          <template v-if="draft.id">
            <p class="autosave-status" :class="`is-${autosaveState}`" aria-live="polite"><span aria-hidden="true" />{{ autosaveLabel }}</p>
            <button v-if="autosaveState === 'error'" type="button" class="admin-button admin-button--small" @click="autosaveCoach">Réessayer</button>
          </template>
          <button v-else class="admin-button admin-button--primary" :disabled="saving">{{ saving ? 'Création…' : 'Créer le coach' }}</button>
        </div>
      </form>
    </div>
  </div></AdminShell></AdminAuthBoundary>
</template>

<style scoped>
.coach-admin { display: grid; gap: 22px; }.coach-admin__tabs { display:flex; gap:8px; border-bottom:1px solid var(--admin-border) }.coach-admin__tabs button { padding:10px 14px; border:0; border-radius:9px 9px 0 0; background:#edf3f5; font-weight:800; cursor:pointer }.coach-admin__tabs button.active { color:white; background:var(--admin-blue) }.coach-admin__tabs span { padding:1px 6px; border-radius:10px; background:rgb(255 255 255 / 25%) }
.coach-admin__workspace{display:grid;grid-template-columns:minmax(330px,390px) minmax(0,1fr);gap:18px;align-items:start}.media-workspace{display:grid;grid-template-columns:minmax(230px,280px) minmax(0,1fr);gap:18px;align-items:start}.coach-admin__list,.media-library { padding:10px; box-shadow:none; max-height:calc(100vh - 190px); overflow:auto }.coach-list-group{display:grid;gap:5px;padding:5px 0 12px}.coach-list-group+.coach-list-group{border-top:1px solid var(--admin-border);padding-top:13px}.coach-list-group>header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:2px 8px 5px;color:var(--admin-navy)}.coach-list-group>header strong{font-size:.78rem;letter-spacing:.04em;text-transform:uppercase}.coach-list-group>header span{display:grid;min-width:23px;height:23px;padding:0 6px;place-items:center;border-radius:999px;background:#e5f1f4;color:var(--admin-blue);font-size:.7rem;font-weight:900}.coach-admin__list button,.media-library button { display:grid; width:100%; padding:9px; grid-template-columns:46px 1fr; gap:10px; align-items:center; text-align:left; border:1px solid transparent; background:white; border-radius:10px; cursor:pointer }.coach-admin__list button.selected,.media-library button.selected { border-color:#72b3c4; background:var(--admin-cyan) }.coach-admin__list img,.media-library img { width:46px; height:46px; object-fit:cover; border-radius:50% }.coach-admin__list button>span,.media-library button>span { display:grid; min-width:0 }.coach-admin__list small,.media-library small { color:var(--admin-muted) }
.coach-editor { display:grid; gap:16px }.coach-panel,.media-editor { padding:20px; box-shadow:none }.coach-panel__title { display:flex; align-items:center; justify-content:space-between; gap:15px }.coach-panel h2,.media-editor h2 { margin:0;color:var(--admin-navy) }.coach-panel__title > img { width:70px;height:70px;object-fit:cover;border-radius:14px }.coach-fields { display:grid; margin-top:17px; grid-template-columns:repeat(2,minmax(0,1fr)); gap:13px }.coach-fields__wide { grid-column:1/-1 }
.coach-identity-layout { display:grid;grid-template-columns:minmax(0,1fr) minmax(230px,290px);gap:24px;margin-top:20px;align-items:start }.coach-fields--identity { margin-top:0 }.coach-description-fields { display:grid;gap:13px;margin-top:18px;padding-top:18px;border-top:1px solid var(--admin-border) }.coach-avatar-card { display:grid;gap:13px;padding:14px;background:#f3f7f8;border:1px solid var(--admin-border);border-radius:16px }.coach-avatar-card__portrait { display:grid;place-items:center;width:100%;aspect-ratio:4/5;overflow:hidden;background:#dce9ec;border-radius:12px;color:var(--admin-blue);font-size:4rem;font-weight:900 }.coach-avatar-card__portrait img { width:100%;height:100%;object-fit:cover }.coach-avatar-card__upload small { color:var(--admin-muted) }.admin-field--color input[type="color"] { min-height:43px;padding:4px }
.coach-help { font-size:.82rem;overflow-wrap:anywhere }.reply-list { display:grid;gap:9px }.reply-row { display:grid;grid-template-columns:170px minmax(260px,1fr) 85px 34px;gap:8px;align-items:center }.reply-row textarea,.reply-row select,.reply-row input,.media-assign-grid select,.media-assign-grid input { width:100%;padding:8px;border:1px solid var(--admin-border);border-radius:7px }.reply-row label,.media-assign-grid label { font-size:.72rem }.reply-row > button { border:0;background:#f7e4e2;color:#9c342f;border-radius:7px;font-size:1.2rem;cursor:pointer }
.media-assign-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(135px,1fr));gap:10px }.media-assign-grid article { display:grid;padding:8px;gap:6px;border:1px solid var(--admin-border);border-radius:10px }.media-assign-grid article.assigned { border-color:#62a7ba;background:#eff9fb }.media-assign-grid article > button { position:relative;height:90px;padding:0;overflow:hidden;border:0;border-radius:7px;background:#e8eff1;cursor:pointer }.media-assign-grid article img { width:100%;height:100%;object-fit:contain }.media-assign-grid article button span { position:absolute;right:5px;top:5px;display:grid;width:24px;height:24px;place-items:center;color:white;background:#176b87;border-radius:50% }.media-assign-grid strong { overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.82rem }.reaction-rules { display:grid;gap:7px }.reaction-rules > div { display:grid;grid-template-columns:170px 1fr 1fr;gap:10px;align-items:center }.reaction-rules button { padding:8px;text-align:left;border:0;border-radius:7px;background:#edf3f5;font-weight:800;cursor:pointer }.reaction-rules label { display:flex;gap:7px;align-items:center;font-size:.8rem }.reaction-rules input { width:75px }.coach-preview { display:flex;margin-top:15px;padding:16px;gap:11px;background:#eef7fa;border-radius:13px }.coach-preview > img { width:46px;height:46px;object-fit:cover;border:3px solid var(--preview-color);border-radius:50% }.coach-preview p { margin:3px 0;white-space:pre-line }.coach-preview div > img { max-width:220px;max-height:150px;object-fit:contain;border-radius:8px }.coach-editor__save { position:sticky;bottom:10px;display:flex;justify-content:flex-end;align-items:center;gap:12px;padding:12px;background:rgb(255 255 255 / 90%);border-radius:12px;box-shadow:0 8px 30px rgb(18 56 70 / 15%) }.autosave-status{display:flex;align-items:center;gap:8px;margin:0;color:var(--admin-muted);font-size:.84rem;font-weight:800}.autosave-status>span{width:9px;height:9px;border-radius:50%;background:#4d967c}.autosave-status.is-dirty>span,.autosave-status.is-saving>span{background:#d29a2e}.autosave-status.is-saving>span{animation:autosave-pulse .9s ease-in-out infinite}.autosave-status.is-error{color:#9c342f}.autosave-status.is-error>span{background:#b94a42}@keyframes autosave-pulse{50%{opacity:.3}}
.media-library button { grid-template-columns:72px 1fr }.media-library img { width:72px;height:56px;border-radius:7px }.media-editor { display:grid;gap:14px }.media-editor .coach-fields { margin:0 }.admin-check { display:flex;align-items:center;gap:8px }.admin-check input { width:auto }.media-editor > .admin-button { justify-self:end }
@media(max-width:1100px){.coach-identity-layout{grid-template-columns:minmax(0,1fr) 220px}}@media(max-width:900px){.coach-admin__workspace,.media-workspace{grid-template-columns:1fr}.coach-admin__list,.media-library{max-height:260px}.coach-identity-layout{grid-template-columns:minmax(0,1fr) minmax(220px,280px)}}@media(max-width:650px){.coach-fields,.coach-identity-layout{grid-template-columns:1fr}.coach-avatar-card{grid-row:1}.coach-avatar-card__portrait{max-height:360px}.coach-fields__wide{grid-column:auto}.reply-row{grid-template-columns:1fr}.reaction-rules>div{grid-template-columns:1fr}.media-assign-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>

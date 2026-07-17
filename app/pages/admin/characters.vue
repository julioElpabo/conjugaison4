<script setup lang="ts">
import type { CoachCharacter, CoachEvent, CoachMedia, CoachProfile } from '~~/shared/types/coach'
import { COACH_EVENTS, REQUIRED_COACH_REPLY_EVENTS } from '~~/shared/types/coach'
import { formatCharacterNames } from '~~/shared/utils/coach-character'
import { COACH_PLACEHOLDERS, unknownCoachPlaceholders } from '~~/shared/utils/coach-dialogue'
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

const EVENT_LABELS: Record<CoachEvent, string> = {
  introduction: 'Présentation', question: 'Question', correct: 'Bonne réponse', 'correct-alternative': 'Bonne réponse avec variante',
  incorrect: 'Mauvaise réponse', 'cod-before': 'COD avant', 'cod-after': 'COD après', coi: 'COI',
  encouragement: 'Encouragement', streak: 'Série réussie', finish: 'Fin', restart: 'Recommencer',
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
  streak: 'Réactions après plusieurs bonnes réponses consécutives.',
  finish: 'Phrases affichées à la fin de l’exercice.',
  restart: 'Phrases affichées lorsque l’élève recommence.',
}
const REQUIRED_REPLY_EVENTS = new Set<CoachEvent>(REQUIRED_COACH_REPLY_EVENTS)
const REACTION_EVENTS: CoachEvent[] = ['correct', 'incorrect', 'streak', 'finish']
const placeholdersLabel = COACH_PLACEHOLDERS.map(item => `{${item}}`).join(' · ')
const { user, handleUnauthorized } = useAdminAuth()
const characters = ref<CoachCharacter[]>([])
const coaches = ref<CoachProfile[]>([])
const media = ref<CoachMedia[]>([])
const draft = ref<CoachCharacter | null>(null)
const selectedId = ref<number | null>(null)
const tab = ref<'characters' | 'media'>('characters')
const loading = ref(false)
const saving = ref(false)
const autosaveState = ref<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle')
const uploading = ref(false)
const error = ref('')
const success = ref('')
const selectedMediaId = ref<number | null>(null)
const mediaDraft = reactive({ id: 0, name: '', filePath: '', mediaType: 'animation', category: 'success', altText: '', rightsStatus: 'pending', safetyStatus: 'pending', isActive: true, fileSize: null as number | null })
let loaded = false
let autosaveTimer: ReturnType<typeof setTimeout> | null = null
let autosavePromise: Promise<void> | null = null
let lastSavedSnapshot = ''
const characterCoaches = computed(() => draft.value?.id
  ? coaches.value.filter(coach => coach.characterId === draft.value?.id)
  : [])

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
function setCharacterDraft(character: CoachCharacter) {
  cancelScheduledAutosave()
  selectedId.value = character.id || null
  draft.value = clone(character)
  lastSavedSnapshot = character.id ? JSON.stringify(draft.value) : ''
  autosaveState.value = character.id ? 'idle' : 'dirty'
  error.value = ''
  success.value = ''
}
async function selectCharacter(character: CoachCharacter) {
  await autosaveCharacter()
  setCharacterDraft(character)
}
async function newCharacter() {
  await autosaveCharacter()
  selectedId.value = null
  const assignments = media.value
    .filter(item => item.isActive && (item.mediaType === 'emoji' || item.mediaType === 'animation'))
    .map(item => ({ mediaId: item.id, eventType: mediaDefaultEvent(item), weight: 1, isActive: true }))
  setCharacterDraft({ id: 0, slug: '', masculineName: '', feminineName: '', emoticon: '🙂', description: '', pedagogicalStyle: '', status: 'draft', sortOrder: characters.value.length + 1, replies: [], media: clone(media.value), assignments, rules: [] })
}
async function load() {
  loading.value = true
  try {
    const [characterResponse, coachResponse, mediaResponse] = await Promise.all([
      $fetch<{ characters: CoachCharacter[] }>('/api/admin/coach-characters'),
      $fetch<{ coaches: CoachProfile[] }>('/api/admin/coaches'),
      $fetch<{ media: CoachMedia[] }>('/api/admin/coach-media'),
    ])
    characters.value = characterResponse.characters; coaches.value = coachResponse.coaches; media.value = mediaResponse.media
    if (draft.value?.id) {
      const refreshed = characters.value.find(item => item.id === draft.value?.id)
      if (refreshed) setCharacterDraft(refreshed)
    } else if (!draft.value && characters.value[0]) setCharacterDraft(characters.value[0])
  } catch (caught) { if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de charger les caractères.') }
  finally { loading.value = false }
}
function characterCanBeSaved(character: CoachCharacter) {
  if (!character.slug.trim() || !character.masculineName.trim() || !character.feminineName.trim() || !character.emoticon.trim()
    || !character.pedagogicalStyle.trim() || !Number.isInteger(character.sortOrder)) return false
  if (character.replies.some(reply => !reply.content.trim() || unknownCoachPlaceholders(reply.content).length)) return false
  if (character.status !== 'published') return true
  return [...REQUIRED_REPLY_EVENTS].every(eventType => character.replies.some(reply => reply.eventType === eventType && reply.isActive && reply.content.trim()))
}
function refreshCharacterInList(saved: CoachCharacter) {
  const item = characters.value.find(character => character.id === saved.id)
  if (item) Object.assign(item, clone(saved))
  else characters.value.push(clone(saved))
}
function scheduleAutosave() {
  cancelScheduledAutosave()
  autosaveTimer = setTimeout(() => { void autosaveCharacter() }, 650)
}
async function autosaveCharacter() {
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
  if (!characterCanBeSaved(current)) {
    autosaveState.value = 'dirty'
    return
  }
  const payload = clone(current)
  const characterId = current.id
  autosaveState.value = 'saving'
  error.value = ''
  autosavePromise = characterId
    ? $fetch(`/api/admin/coach-characters/${characterId}`, { method: 'PUT', body: payload }).then(() => undefined)
    : $fetch<{ id: number }>('/api/admin/coach-characters', { method: 'POST', body: payload }).then((result) => {
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
    refreshCharacterInList(payload)
    if (draft.value?.id === payload.id && JSON.stringify(draft.value) === savedSnapshot) autosaveState.value = 'saved'
    else if (draft.value?.id === payload.id) scheduleAutosave()
  } catch (caught) {
    autosaveState.value = 'error'
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible d’enregistrer automatiquement ce caractère.')
  } finally {
    autosavePromise = null
  }
}
async function disableCharacter() {
  if (!draft.value?.id || !window.confirm(`Désactiver le caractère « ${formatCharacterNames(draft.value)} » ?`)) return
  cancelScheduledAutosave()
  try {
    if (autosavePromise) await autosavePromise
    await $fetch(`/api/admin/coach-characters/${draft.value.id}`, { method: 'DELETE' })
    await load()
    success.value = 'Caractère désactivé.'
  }
  catch (caught) { error.value = getAdminErrorMessage(caught, 'Impossible de désactiver ce caractère.') }
}
function repliesFor(eventType: CoachEvent) { return draft.value?.replies.filter(reply => reply.eventType === eventType) || [] }
function activeReplyCount(eventType: CoachEvent) { return repliesFor(eventType).filter(reply => reply.isActive).length }
function addReply(eventType: CoachEvent) { draft.value?.replies.push({ id: 0, eventType, content: '', weight: 1, isActive: true }) }
function removeReply(reply: CoachCharacter['replies'][number]) {
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
function assignmentFor(id: number) { return draft.value?.assignments.find(item => item.mediaId === id) }
function toggleMedia(item: CoachMedia) {
  if (!draft.value) return
  const index = draft.value.assignments.findIndex(assignment => assignment.mediaId === item.id)
  if (index >= 0) draft.value.assignments.splice(index, 1)
  else draft.value.assignments.push({ mediaId: item.id, eventType: mediaDefaultEvent(item), weight: 1, isActive: true })
}
function selectAllMedia() {
  if (!draft.value) return
  const assignedIds = new Set(draft.value.assignments.map(item => item.mediaId))
  for (const item of media.value) {
    if (!assignedIds.has(item.id)) {
      draft.value.assignments.push({ mediaId: item.id, eventType: mediaDefaultEvent(item), weight: 1, isActive: true })
    }
  }
}
function deselectAllMedia() {
  if (draft.value) draft.value.assignments = []
}
function inputValue(event: Event) { return (event.target as HTMLInputElement | HTMLSelectElement).value }
function updateAssignment(id: number, field: 'eventType' | 'weight', value: string) {
  const assignment = assignmentFor(id); if (!assignment) return
  if (field === 'eventType') assignment.eventType = value as CoachEvent
  else assignment.weight = Number(value)
}
function ruleFor(eventType: CoachEvent) { return draft.value?.rules.find(item => item.eventType === eventType) }
function ensureRule(eventType: CoachEvent) { if (draft.value && !ruleFor(eventType)) draft.value.rules.push({ eventType, mediaProbability: 0.2, cooldownQuestions: 2 }) }
function updateRule(eventType: CoachEvent, field: 'mediaProbability' | 'cooldownQuestions', value: string) { const rule = ruleFor(eventType); if (rule) rule[field] = Number(value) }

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
onBeforeRouteLeave(async () => { await autosaveCharacter() })
onBeforeUnmount(cancelScheduledAutosave)
</script>

<template>
  <AdminAuthBoundary><AdminShell><div class="character-admin">
    <header class="admin-section-heading"><div><p class="admin-eyebrow">Contenu mutualisé</p><h1>Caractères</h1><p class="admin-muted">Une modification s’applique immédiatement à tous les coaches qui partagent ce caractère.</p></div><button class="admin-button admin-button--primary" @click="tab === 'characters' ? newCharacter() : selectMedia()">{{ tab === 'characters' ? 'Nouveau caractère' : 'Nouveau média' }}</button></header>
    <div class="character-tabs"><button :class="{ active: tab === 'characters' }" @click="tab = 'characters'">Caractères</button><button :class="{ active: tab === 'media' }" @click="tab = 'media'">Médiathèque <span>{{ media.length }}</span></button></div>
    <p v-if="error" class="admin-notice admin-notice--error">{{ error }}</p><p v-if="success" class="admin-notice admin-notice--success">{{ success }}</p>

    <div v-if="tab === 'characters'" class="character-workspace">
      <aside class="character-list admin-card"><button v-for="character in characters" :key="character.id" :class="{ selected: character.id === selectedId }" @click="selectCharacter(character)"><span class="character-list__mark">{{ character.emoticon }}</span><span><strong>{{ formatCharacterNames(character) }}</strong><small>{{ character.replies.length }} répliques · {{ character.assignments.length }} médias</small></span></button></aside>
      <form v-if="draft" class="character-editor" @submit.prevent>
        <section class="admin-card character-panel">
          <div class="panel-title character-profile-title">
            <div><p class="admin-eyebrow">Profil partagé</p><h2>{{ draft.masculineName || draft.feminineName ? formatCharacterNames(draft) : 'Nouveau caractère' }}</h2></div>
            <label class="admin-field emoticon-field"><span>Émoticône *</span><input v-model="draft.emoticon" maxlength="32" autocomplete="off" required></label>
            <button v-if="draft.id" type="button" class="admin-button admin-button--danger admin-button--small" @click="disableCharacter">Désactiver</button>
          </div>
          <div v-if="draft.id" class="character-coaches">
            <div><strong>Coaches utilisant ce caractère</strong><small>{{ characterCoaches.length }} coach{{ characterCoaches.length > 1 ? 'es' : '' }}</small></div>
            <div v-if="characterCoaches.length" class="character-coaches__portraits">
              <NuxtLink v-for="coach in characterCoaches" :key="coach.id" :to="{ path: '/admin/coaches', query: { coach: coach.id } }" :title="`Modifier ${coach.firstName} ${coach.lastName}`" :aria-label="`Ouvrir la fiche de ${coach.firstName} ${coach.lastName}`">
                <img :src="coach.avatarPath" alt="">
                <span>{{ coach.firstName }}</span>
              </NuxtLink>
            </div>
            <p v-else>Aucun coach n’utilise encore ce caractère.</p>
          </div>
          <div class="character-fields"><label class="admin-field"><span>Nom masculin *</span><input v-model="draft.masculineName" required></label><label class="admin-field"><span>Nom féminin *</span><input v-model="draft.feminineName" required></label><label class="admin-field"><span>Identifiant *</span><input v-model="draft.slug" required></label><label class="admin-field"><span>Ordre</span><input v-model.number="draft.sortOrder" type="number"></label><label class="admin-field wide"><span>Présentation</span><input v-model="draft.description"></label><label class="admin-field wide"><span>Manière d’aider *</span><textarea v-model="draft.pedagogicalStyle" rows="3" required /></label><label class="admin-field"><span>Statut</span><select v-model="draft.status"><option value="draft">Brouillon</option><option value="published">Publié</option><option value="disabled">Désactivé</option></select></label></div>
        </section>
        <section class="admin-card character-panel dialogue-panel">
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
        <section class="admin-card character-panel"><div class="panel-title"><div><p class="admin-eyebrow">Réactions partagées</p><h2>GIF et émojis</h2></div><div class="media-selection-actions"><strong>{{ draft.assignments.length }} attribué(s)</strong><button type="button" class="admin-button admin-button--small" @click="selectAllMedia">Tout sélectionner</button><button type="button" class="admin-button admin-button--small" @click="deselectAllMedia">Tout désélectionner</button></div></div><div class="media-grid"><article v-for="item in media" :key="item.id" :class="{ assigned: assignmentFor(item.id) }"><button type="button" @click="toggleMedia(item)"><img :src="item.filePath" :alt="item.altText"><span>{{ assignmentFor(item.id) ? '✓' : '+' }}</span></button><strong>{{ item.name }}</strong><template v-if="assignmentFor(item.id)"><select :value="assignmentFor(item.id)?.eventType" @change="updateAssignment(item.id, 'eventType', inputValue($event))"><option v-for="eventType in COACH_EVENTS" :key="eventType" :value="eventType">{{ EVENT_LABELS[eventType] }}</option></select><label>Poids <input :value="assignmentFor(item.id)?.weight" type="number" min="1" max="20" @input="updateAssignment(item.id, 'weight', inputValue($event))"></label></template></article></div><h3>Fréquence des réactions</h3><div class="rule-list"><div v-for="eventType in REACTION_EVENTS" :key="eventType"><button type="button" @click="ensureRule(eventType)">{{ EVENT_LABELS[eventType] }}</button><template v-if="ruleFor(eventType)"><label>Probabilité <input :value="ruleFor(eventType)?.mediaProbability" type="number" min="0" max="1" step="0.05" @input="updateRule(eventType, 'mediaProbability', inputValue($event))"></label><label>Pause <input :value="ruleFor(eventType)?.cooldownQuestions" type="number" min="0" @input="updateRule(eventType, 'cooldownQuestions', inputValue($event))"></label></template></div></div></section>
        <div class="save-bar">
          <p class="autosave-status" :class="`is-${autosaveState}`" aria-live="polite"><span aria-hidden="true" />{{ autosaveLabel }}</p>
          <button v-if="autosaveState === 'error'" type="button" class="admin-button admin-button--small" @click="autosaveCharacter">Réessayer</button>
        </div>
      </form>
    </div>

    <div v-else class="media-workspace"><aside class="media-library admin-card"><button v-for="item in media" :key="item.id" :class="{ selected: item.id === selectedMediaId }" @click="selectMedia(item)"><img :src="item.filePath" :alt="item.altText"><span><strong>{{ item.name }}</strong><small>{{ item.mediaType }} · {{ item.safetyStatus }}</small></span></button></aside><form class="admin-card media-editor" @submit.prevent="saveMedia"><div class="panel-title"><h2>{{ mediaDraft.id ? 'Modifier le média' : 'Ajouter un média' }}</h2><img v-if="mediaDraft.filePath && mediaDraft.mediaType !== 'video'" :src="mediaDraft.filePath" alt="Aperçu"></div><label class="admin-field"><span>Importer</span><input type="file" accept="image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm" :disabled="uploading" @change="uploadMedia"></label><label class="admin-field"><span>Nom *</span><input v-model="mediaDraft.name" required></label><label class="admin-field"><span>Chemin *</span><input v-model="mediaDraft.filePath" required></label><div class="character-fields"><label class="admin-field"><span>Type</span><select v-model="mediaDraft.mediaType"><option>emoji</option><option>animation</option><option>video</option><option>image</option></select></label><label class="admin-field"><span>Catégorie</span><select v-model="mediaDraft.category"><option value="success">Réussite</option><option value="encouragement">Encouragement</option><option value="finish">Fin</option><option value="welcome">Accueil</option><option value="neutral">Neutre</option></select></label><label class="admin-field"><span>Droits</span><select v-model="mediaDraft.rightsStatus"><option value="pending">À vérifier</option><option value="verified">Vérifiés</option><option value="rejected">Refusés</option></select></label><label class="admin-field"><span>Sécurité mineurs</span><select v-model="mediaDraft.safetyStatus"><option value="pending">À vérifier</option><option value="approved">Approuvée</option><option value="rejected">Refusée</option></select></label></div><label class="admin-field"><span>Texte alternatif *</span><input v-model="mediaDraft.altText" required></label><button class="admin-button admin-button--primary" :disabled="saving || uploading">Enregistrer le média</button></form></div>
  </div></AdminShell></AdminAuthBoundary>
</template>

<style scoped>
.character-admin,.character-editor{display:grid;gap:18px}.character-tabs{display:flex;gap:8px;border-bottom:1px solid var(--admin-border)}.character-tabs button{padding:10px 15px;border:0;border-radius:9px 9px 0 0;background:#edf3f5;font-weight:800;cursor:pointer}.character-tabs button.active{color:white;background:var(--admin-blue)}.character-tabs span{padding:1px 6px;border-radius:10px;background:rgb(255 255 255 / 25%)}.character-workspace,.media-workspace{display:grid;grid-template-columns:minmax(230px,280px) minmax(0,1fr);gap:18px;align-items:start}.character-list,.media-library{padding:10px;max-height:calc(100vh - 190px);overflow:auto;box-shadow:none}.character-list button,.media-library button{display:grid;width:100%;grid-template-columns:46px 1fr;gap:10px;align-items:center;padding:9px;text-align:left;border:1px solid transparent;border-radius:10px;background:white;cursor:pointer}.character-list button.selected,.media-library button.selected{border-color:#72b3c4;background:var(--admin-cyan)}.character-list__mark{display:grid;width:46px;height:46px;place-items:center;color:white;background:var(--admin-blue);border-radius:13px;font-size:1.25rem;font-weight:900}.character-list button>span:last-child,.media-library button>span{display:grid;min-width:0}.character-list small,.media-library small{color:var(--admin-muted)}.character-panel,.media-editor{padding:20px;box-shadow:none}.panel-title{display:flex;justify-content:space-between;align-items:center;gap:15px}.panel-title h2,.character-panel h2{margin:0;color:var(--admin-navy)}.panel-title>img{width:90px;height:70px;object-fit:contain;border-radius:10px}.character-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin-top:17px}.character-fields .wide{grid-column:1/-1}.variables{font-size:.82rem;overflow-wrap:anywhere}.reply-list{display:grid;gap:9px}.reply-row{display:grid;grid-template-columns:170px minmax(260px,1fr) 85px 34px;gap:8px;align-items:center}.reply-row textarea,.reply-row select,.reply-row input,.media-grid select,.media-grid input{width:100%;padding:8px;border:1px solid var(--admin-border);border-radius:7px}.reply-row label,.media-grid label{font-size:.72rem}.reply-row>button{border:0;border-radius:7px;background:#f7e4e2;color:#9c342f;font-size:1.2rem;cursor:pointer}.media-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(135px,1fr));gap:10px;margin-top:16px}.media-grid article{display:grid;padding:8px;gap:6px;border:1px solid var(--admin-border);border-radius:10px}.media-grid article.assigned{border-color:#62a7ba;background:#eff9fb}.media-grid article>button{position:relative;height:90px;padding:0;overflow:hidden;border:0;border-radius:7px;background:#e8eff1;cursor:pointer}.media-grid article img{width:100%;height:100%;object-fit:contain}.media-grid article button span{position:absolute;right:5px;top:5px;display:grid;width:24px;height:24px;place-items:center;color:white;background:#176b87;border-radius:50%}.media-grid article>strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.82rem}.rule-list{display:grid;gap:7px}.rule-list>div{display:grid;grid-template-columns:170px 1fr 1fr;gap:10px;align-items:center}.rule-list button{padding:8px;text-align:left;border:0;border-radius:7px;background:#edf3f5;font-weight:800}.rule-list label{display:flex;gap:7px;align-items:center;font-size:.8rem}.rule-list input{width:75px}.save-bar{position:sticky;bottom:10px;display:flex;justify-content:flex-end;align-items:center;gap:12px;padding:12px;background:rgb(255 255 255 / 90%);border-radius:12px;box-shadow:0 8px 30px rgb(18 56 70 / 15%)}.autosave-status{display:flex;align-items:center;gap:8px;margin:0;color:var(--admin-muted);font-size:.84rem;font-weight:800}.autosave-status>span{width:9px;height:9px;border-radius:50%;background:#4d967c}.autosave-status.is-dirty>span,.autosave-status.is-saving>span{background:#d29a2e}.autosave-status.is-saving>span{animation:autosave-pulse .9s ease-in-out infinite}.autosave-status.is-error{color:#9c342f}.autosave-status.is-error>span{background:#b94a42}@keyframes autosave-pulse{50%{opacity:.3}}.media-library button{grid-template-columns:72px 1fr}.media-library img{width:72px;height:56px;object-fit:contain;border-radius:7px}.media-editor{display:grid;gap:14px}.media-editor .character-fields{margin:0}.media-editor>.admin-button{justify-self:end}@media(max-width:900px){.character-workspace,.media-workspace{grid-template-columns:1fr}.character-list,.media-library{max-height:260px}}@media(max-width:650px){.character-fields,.reply-row,.rule-list>div{grid-template-columns:1fr}.character-fields .wide{grid-column:auto}.media-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.dialogue-intro{max-width:760px;margin:10px 0 14px}.variables-help{margin-bottom:16px;padding:10px 13px;border:1px solid var(--admin-border);border-radius:9px;background:#f7fafb;font-size:.82rem}.variables-help summary{color:var(--admin-blue);font-weight:800;cursor:pointer}.variables-help p{margin:8px 0 0;overflow-wrap:anywhere}.reply-groups{display:grid;gap:10px}.reply-group{overflow:hidden;border:1px solid var(--admin-border);border-radius:12px;background:white}.reply-group[open]{border-color:#9bc7d2;box-shadow:0 5px 16px rgb(18 56 70 / 7%)}.reply-group__summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;cursor:pointer;list-style:none}.reply-group__summary::-webkit-details-marker{display:none}.reply-group__summary::before{content:'›';flex:0 0 auto;color:var(--admin-blue);font-size:1.5rem;font-weight:900;line-height:1;transition:transform .15s ease}.reply-group[open]>.reply-group__summary::before{transform:rotate(90deg)}.reply-group__heading{display:grid;flex:1;gap:2px}.reply-group__heading strong{color:var(--admin-navy)}.reply-group__heading small{color:var(--admin-muted);font-weight:400}.reply-group__count{padding:4px 9px;border-radius:999px;background:#dff1e9;color:#24634f;font-size:.75rem;font-weight:800;white-space:nowrap}.reply-group__count.is-empty{background:#f3e6e4;color:#8b4039}.reply-group__body{display:grid;gap:12px;padding:15px 16px 16px;border-top:1px solid var(--admin-border);background:#f8fbfc}.reply-group__empty{display:grid;gap:3px;padding:12px;color:var(--admin-muted);border:1px dashed var(--admin-border);border-radius:9px;background:white}.reply-group__empty small{color:#9c4d42}.reply-card{display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:14px;padding:13px;border:1px solid var(--admin-border);border-radius:10px;background:white}.reply-card.is-inactive{opacity:.68;background:#f3f5f5}.reply-card label{font-size:.76rem;font-weight:800}.reply-card textarea,.reply-card input{width:100%;padding:8px;border:1px solid var(--admin-border);border-radius:7px;background:white}.reply-card__content{display:grid;gap:5px}.reply-card__settings{display:grid;grid-template-columns:1fr auto;gap:9px 12px;align-items:start}.reply-active{display:flex;align-items:center;gap:7px}.reply-active input{width:auto}.reply-weight{display:grid;grid-column:1/-1;grid-template-columns:1fr 65px;gap:4px 8px;align-items:center}.reply-weight small{grid-column:1/-1;color:var(--admin-muted);font-weight:400}.reply-delete{grid-column:1/-1;justify-self:start;padding:5px 8px;border:0;border-radius:6px;background:#f7e4e2;color:#9c342f;font-weight:800;cursor:pointer}.reply-add{justify-self:start}
.character-coaches{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-top:18px;padding:14px 16px;border:1px solid var(--admin-border);border-radius:14px;background:#f3f7f8}.character-coaches>div:first-child{display:grid;gap:2px;flex:0 0 auto}.character-coaches>div:first-child strong{color:var(--admin-navy);font-size:.86rem}.character-coaches>div:first-child small,.character-coaches>p{margin:0;color:var(--admin-muted);font-size:.76rem}.character-coaches__portraits{display:flex;flex:1;justify-content:flex-end;gap:10px;overflow-x:auto;padding:2px}.character-coaches__portraits a{display:grid;justify-items:center;gap:4px;padding:4px;border:1px solid transparent;border-radius:12px;text-decoration:none;transition:background .15s ease,border-color .15s ease,transform .15s ease}.character-coaches__portraits a:hover{border-color:#72b3c4;background:white;transform:translateY(-2px)}.character-coaches__portraits a:focus-visible{outline:3px solid #72b3c4;outline-offset:2px}.character-coaches img{width:54px;height:54px;object-fit:cover;border:3px solid white;border-radius:50%;box-shadow:0 3px 10px rgb(18 56 70 / 16%)}.character-coaches__portraits a>span{max-width:70px;overflow:hidden;color:var(--admin-muted);font-size:.66rem;font-weight:750;text-overflow:ellipsis;white-space:nowrap}
.character-list__mark{color:initial;background:#e8f2f5;font-size:1.65rem;font-weight:400;line-height:1}.character-profile-title{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)}.character-profile-title>.emoticon-field{justify-self:center;align-self:center;gap:3px;text-align:center}.character-profile-title>.admin-button{justify-self:end}.emoticon-field input{width:82px;font-size:1.7rem;text-align:center}
.required-note{white-space:nowrap;font-weight:750}.required-mark{color:#9c342f}
.media-selection-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}.media-selection-actions>strong{margin-right:4px}
@media(max-width:650px){.reply-card{grid-template-columns:1fr}.reply-group__summary{align-items:flex-start;flex-wrap:wrap}.reply-group__count{margin-left:28px}.character-coaches{align-items:flex-start;flex-direction:column}.character-coaches__portraits{width:100%;justify-content:flex-start}.character-profile-title{grid-template-columns:1fr auto}.character-profile-title>.emoticon-field{grid-row:1;grid-column:2}.character-profile-title>.admin-button{grid-column:1/-1}}
</style>

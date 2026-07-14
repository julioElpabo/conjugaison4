<script setup lang="ts">
import type { CoachCharacter, CoachEvent, CoachMedia } from '~~/shared/types/coach'
import { COACH_EVENTS } from '~~/shared/types/coach'
import { COACH_PLACEHOLDERS } from '~~/shared/utils/coach-dialogue'
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

const EVENT_LABELS: Record<CoachEvent, string> = {
  introduction: 'Présentation', question: 'Question', correct: 'Bonne réponse', 'correct-alternative': 'Bonne réponse avec variante',
  incorrect: 'Mauvaise réponse', 'cod-before': 'COD avant', 'cod-after': 'COD après', coi: 'COI',
  encouragement: 'Encouragement', streak: 'Série réussie', finish: 'Fin', restart: 'Recommencer', 'off-topic': 'Hors sujet',
}
const REACTION_EVENTS: CoachEvent[] = ['correct', 'incorrect', 'streak', 'finish']
const placeholdersLabel = COACH_PLACEHOLDERS.map(item => `{${item}}`).join(' · ')
const { user, handleUnauthorized } = useAdminAuth()
const characters = ref<CoachCharacter[]>([])
const media = ref<CoachMedia[]>([])
const draft = ref<CoachCharacter | null>(null)
const selectedId = ref<number | null>(null)
const tab = ref<'characters' | 'media'>('characters')
const saving = ref(false)
const uploading = ref(false)
const error = ref('')
const success = ref('')
const selectedMediaId = ref<number | null>(null)
const mediaDraft = reactive({ id: 0, name: '', filePath: '', mediaType: 'animation', category: 'success', altText: '', rightsStatus: 'pending', safetyStatus: 'pending', isActive: true, fileSize: null as number | null })
let loaded = false

useHead({ title: 'Caractères — Administration' })
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
function selectCharacter(character: CoachCharacter) { selectedId.value = character.id; draft.value = clone(character); error.value = ''; success.value = '' }
function newCharacter() {
  selectedId.value = null
  const assignments = media.value
    .filter(item => item.isActive && (item.mediaType === 'emoji' || item.mediaType === 'animation'))
    .map(item => ({ mediaId: item.id, eventType: mediaDefaultEvent(item), weight: 1, isActive: true }))
  draft.value = { id: 0, slug: '', name: '', description: '', pedagogicalStyle: '', status: 'draft', sortOrder: characters.value.length + 1, replies: [], media: clone(media.value), assignments, rules: [] }
}
async function load() {
  try {
    const [characterResponse, mediaResponse] = await Promise.all([
      $fetch<{ characters: CoachCharacter[] }>('/api/admin/coach-characters'),
      $fetch<{ media: CoachMedia[] }>('/api/admin/coach-media'),
    ])
    characters.value = characterResponse.characters; media.value = mediaResponse.media
    if (draft.value?.id) {
      const refreshed = characters.value.find(item => item.id === draft.value?.id)
      if (refreshed) selectCharacter(refreshed)
    } else if (!draft.value && characters.value[0]) selectCharacter(characters.value[0])
  } catch (caught) { if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de charger les caractères.') }
}
async function saveCharacter() {
  if (!draft.value || saving.value) return
  saving.value = true; error.value = ''; success.value = ''
  try {
    if (draft.value.id) await $fetch(`/api/admin/coach-characters/${draft.value.id}`, { method: 'PUT', body: draft.value })
    else {
      const result = await $fetch<{ id: number }>('/api/admin/coach-characters', { method: 'POST', body: draft.value })
      draft.value.id = result.id; selectedId.value = result.id
    }
    await load(); success.value = 'Caractère enregistré. Tous ses coaches utilisent immédiatement ce contenu.'
  } catch (caught) { error.value = getAdminErrorMessage(caught, 'Impossible d’enregistrer ce caractère.') }
  finally { saving.value = false }
}
async function disableCharacter() {
  if (!draft.value?.id || !window.confirm(`Désactiver le caractère « ${draft.value.name} » ?`)) return
  try { await $fetch(`/api/admin/coach-characters/${draft.value.id}`, { method: 'DELETE' }); await load(); success.value = 'Caractère désactivé.' }
  catch (caught) { error.value = getAdminErrorMessage(caught, 'Impossible de désactiver ce caractère.') }
}
function addReply() { draft.value?.replies.push({ id: 0, eventType: 'correct', content: '', weight: 1, isActive: true }) }
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
watch(user, (current) => { if (current && !loaded) { loaded = true; void load() } if (!current) loaded = false }, { immediate: true })
</script>

<template>
  <AdminAuthBoundary><AdminShell><div class="character-admin">
    <header class="admin-section-heading"><div><p class="admin-eyebrow">Contenu mutualisé</p><h1>Caractères</h1><p class="admin-muted">Une modification s’applique immédiatement à tous les coaches qui partagent ce caractère.</p></div><button class="admin-button admin-button--primary" @click="tab === 'characters' ? newCharacter() : selectMedia()">{{ tab === 'characters' ? 'Nouveau caractère' : 'Nouveau média' }}</button></header>
    <div class="character-tabs"><button :class="{ active: tab === 'characters' }" @click="tab = 'characters'">Caractères</button><button :class="{ active: tab === 'media' }" @click="tab = 'media'">Médiathèque <span>{{ media.length }}</span></button></div>
    <p v-if="error" class="admin-notice admin-notice--error">{{ error }}</p><p v-if="success" class="admin-notice admin-notice--success">{{ success }}</p>

    <div v-if="tab === 'characters'" class="character-workspace">
      <aside class="character-list admin-card"><button v-for="character in characters" :key="character.id" :class="{ selected: character.id === selectedId }" @click="selectCharacter(character)"><span class="character-list__mark">{{ character.name.slice(0, 1) }}</span><span><strong>{{ character.name }}</strong><small>{{ character.replies.length }} répliques · {{ character.assignments.length }} médias</small></span></button></aside>
      <form v-if="draft" class="character-editor" @submit.prevent="saveCharacter">
        <section class="admin-card character-panel"><div class="panel-title"><div><p class="admin-eyebrow">Profil partagé</p><h2>{{ draft.name || 'Nouveau caractère' }}</h2></div><button v-if="draft.id" type="button" class="admin-button admin-button--danger admin-button--small" @click="disableCharacter">Désactiver</button></div><div class="character-fields"><label class="admin-field"><span>Nom *</span><input v-model="draft.name" required></label><label class="admin-field"><span>Identifiant *</span><input v-model="draft.slug" required></label><label class="admin-field wide"><span>Présentation</span><input v-model="draft.description"></label><label class="admin-field wide"><span>Manière d’aider *</span><textarea v-model="draft.pedagogicalStyle" rows="3" required /></label><label class="admin-field"><span>Statut</span><select v-model="draft.status"><option value="draft">Brouillon</option><option value="published">Publié</option><option value="disabled">Désactivé</option></select></label><label class="admin-field"><span>Ordre</span><input v-model.number="draft.sortOrder" type="number"></label></div></section>
        <section class="admin-card character-panel"><div class="panel-title"><div><p class="admin-eyebrow">Dialogue partagé</p><h2>Banque de répliques</h2></div><button type="button" class="admin-button admin-button--small" @click="addReply">Ajouter</button></div><p class="admin-muted variables">Variables : {{ placeholdersLabel }}</p><div class="reply-list"><div v-for="(reply, index) in draft.replies" :key="`${reply.id}-${index}`" class="reply-row"><select v-model="reply.eventType"><option v-for="eventType in COACH_EVENTS" :key="eventType" :value="eventType">{{ EVENT_LABELS[eventType] }}</option></select><textarea v-model="reply.content" rows="2" required /><label>Poids<input v-model.number="reply.weight" type="number" min="1" max="20"></label><button type="button" aria-label="Supprimer" @click="draft.replies.splice(index, 1)">×</button></div></div></section>
        <section class="admin-card character-panel"><div class="panel-title"><div><p class="admin-eyebrow">Réactions partagées</p><h2>GIF et émojis</h2></div><strong>{{ draft.assignments.length }} attribué(s)</strong></div><div class="media-grid"><article v-for="item in media" :key="item.id" :class="{ assigned: assignmentFor(item.id) }"><button type="button" @click="toggleMedia(item)"><img :src="item.filePath" :alt="item.altText"><span>{{ assignmentFor(item.id) ? '✓' : '+' }}</span></button><strong>{{ item.name }}</strong><template v-if="assignmentFor(item.id)"><select :value="assignmentFor(item.id)?.eventType" @change="updateAssignment(item.id, 'eventType', inputValue($event))"><option v-for="eventType in COACH_EVENTS" :key="eventType" :value="eventType">{{ EVENT_LABELS[eventType] }}</option></select><label>Poids <input :value="assignmentFor(item.id)?.weight" type="number" min="1" max="20" @input="updateAssignment(item.id, 'weight', inputValue($event))"></label></template></article></div><h3>Fréquence des réactions</h3><div class="rule-list"><div v-for="eventType in REACTION_EVENTS" :key="eventType"><button type="button" @click="ensureRule(eventType)">{{ EVENT_LABELS[eventType] }}</button><template v-if="ruleFor(eventType)"><label>Probabilité <input :value="ruleFor(eventType)?.mediaProbability" type="number" min="0" max="1" step="0.05" @input="updateRule(eventType, 'mediaProbability', inputValue($event))"></label><label>Pause <input :value="ruleFor(eventType)?.cooldownQuestions" type="number" min="0" @input="updateRule(eventType, 'cooldownQuestions', inputValue($event))"></label></template></div></div></section>
        <div class="save-bar"><button class="admin-button admin-button--primary" :disabled="saving">{{ saving ? 'Enregistrement…' : 'Enregistrer le caractère' }}</button></div>
      </form>
    </div>

    <div v-else class="media-workspace"><aside class="media-library admin-card"><button v-for="item in media" :key="item.id" :class="{ selected: item.id === selectedMediaId }" @click="selectMedia(item)"><img :src="item.filePath" :alt="item.altText"><span><strong>{{ item.name }}</strong><small>{{ item.mediaType }} · {{ item.safetyStatus }}</small></span></button></aside><form class="admin-card media-editor" @submit.prevent="saveMedia"><div class="panel-title"><h2>{{ mediaDraft.id ? 'Modifier le média' : 'Ajouter un média' }}</h2><img v-if="mediaDraft.filePath && mediaDraft.mediaType !== 'video'" :src="mediaDraft.filePath" alt="Aperçu"></div><label class="admin-field"><span>Importer</span><input type="file" accept="image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm" :disabled="uploading" @change="uploadMedia"></label><label class="admin-field"><span>Nom *</span><input v-model="mediaDraft.name" required></label><label class="admin-field"><span>Chemin *</span><input v-model="mediaDraft.filePath" required></label><div class="character-fields"><label class="admin-field"><span>Type</span><select v-model="mediaDraft.mediaType"><option>emoji</option><option>animation</option><option>video</option><option>image</option></select></label><label class="admin-field"><span>Catégorie</span><select v-model="mediaDraft.category"><option value="success">Réussite</option><option value="encouragement">Encouragement</option><option value="finish">Fin</option><option value="welcome">Accueil</option><option value="neutral">Neutre</option></select></label><label class="admin-field"><span>Droits</span><select v-model="mediaDraft.rightsStatus"><option value="pending">À vérifier</option><option value="verified">Vérifiés</option><option value="rejected">Refusés</option></select></label><label class="admin-field"><span>Sécurité mineurs</span><select v-model="mediaDraft.safetyStatus"><option value="pending">À vérifier</option><option value="approved">Approuvée</option><option value="rejected">Refusée</option></select></label></div><label class="admin-field"><span>Texte alternatif *</span><input v-model="mediaDraft.altText" required></label><button class="admin-button admin-button--primary" :disabled="saving || uploading">Enregistrer le média</button></form></div>
  </div></AdminShell></AdminAuthBoundary>
</template>

<style scoped>
.character-admin,.character-editor{display:grid;gap:18px}.character-tabs{display:flex;gap:8px;border-bottom:1px solid var(--admin-border)}.character-tabs button{padding:10px 15px;border:0;border-radius:9px 9px 0 0;background:#edf3f5;font-weight:800;cursor:pointer}.character-tabs button.active{color:white;background:var(--admin-blue)}.character-tabs span{padding:1px 6px;border-radius:10px;background:rgb(255 255 255 / 25%)}.character-workspace,.media-workspace{display:grid;grid-template-columns:minmax(230px,280px) minmax(0,1fr);gap:18px;align-items:start}.character-list,.media-library{padding:10px;max-height:calc(100vh - 190px);overflow:auto;box-shadow:none}.character-list button,.media-library button{display:grid;width:100%;grid-template-columns:46px 1fr;gap:10px;align-items:center;padding:9px;text-align:left;border:1px solid transparent;border-radius:10px;background:white;cursor:pointer}.character-list button.selected,.media-library button.selected{border-color:#72b3c4;background:var(--admin-cyan)}.character-list__mark{display:grid;width:46px;height:46px;place-items:center;color:white;background:var(--admin-blue);border-radius:13px;font-size:1.25rem;font-weight:900}.character-list button>span:last-child,.media-library button>span{display:grid;min-width:0}.character-list small,.media-library small{color:var(--admin-muted)}.character-panel,.media-editor{padding:20px;box-shadow:none}.panel-title{display:flex;justify-content:space-between;align-items:center;gap:15px}.panel-title h2,.character-panel h2{margin:0;color:var(--admin-navy)}.panel-title>img{width:90px;height:70px;object-fit:contain;border-radius:10px}.character-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin-top:17px}.character-fields .wide{grid-column:1/-1}.variables{font-size:.82rem;overflow-wrap:anywhere}.reply-list{display:grid;gap:9px}.reply-row{display:grid;grid-template-columns:170px minmax(260px,1fr) 85px 34px;gap:8px;align-items:center}.reply-row textarea,.reply-row select,.reply-row input,.media-grid select,.media-grid input{width:100%;padding:8px;border:1px solid var(--admin-border);border-radius:7px}.reply-row label,.media-grid label{font-size:.72rem}.reply-row>button{border:0;border-radius:7px;background:#f7e4e2;color:#9c342f;font-size:1.2rem;cursor:pointer}.media-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(135px,1fr));gap:10px;margin-top:16px}.media-grid article{display:grid;padding:8px;gap:6px;border:1px solid var(--admin-border);border-radius:10px}.media-grid article.assigned{border-color:#62a7ba;background:#eff9fb}.media-grid article>button{position:relative;height:90px;padding:0;overflow:hidden;border:0;border-radius:7px;background:#e8eff1;cursor:pointer}.media-grid article img{width:100%;height:100%;object-fit:contain}.media-grid article button span{position:absolute;right:5px;top:5px;display:grid;width:24px;height:24px;place-items:center;color:white;background:#176b87;border-radius:50%}.media-grid article>strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.82rem}.rule-list{display:grid;gap:7px}.rule-list>div{display:grid;grid-template-columns:170px 1fr 1fr;gap:10px;align-items:center}.rule-list button{padding:8px;text-align:left;border:0;border-radius:7px;background:#edf3f5;font-weight:800}.rule-list label{display:flex;gap:7px;align-items:center;font-size:.8rem}.rule-list input{width:75px}.save-bar{position:sticky;bottom:10px;display:flex;justify-content:flex-end;padding:12px;background:rgb(255 255 255 / 90%);border-radius:12px;box-shadow:0 8px 30px rgb(18 56 70 / 15%)}.media-library button{grid-template-columns:72px 1fr}.media-library img{width:72px;height:56px;object-fit:contain;border-radius:7px}.media-editor{display:grid;gap:14px}.media-editor .character-fields{margin:0}.media-editor>.admin-button{justify-self:end}@media(max-width:900px){.character-workspace,.media-workspace{grid-template-columns:1fr}.character-list,.media-library{max-height:260px}}@media(max-width:650px){.character-fields,.reply-row,.rule-list>div{grid-template-columns:1fr}.character-fields .wide{grid-column:auto}.media-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>

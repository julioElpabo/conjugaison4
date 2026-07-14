<script setup lang="ts">
import type { CoachCharacter, CoachEvent, CoachMedia, CoachProfile } from '~~/shared/types/coach'
import { COACH_EVENTS } from '~~/shared/types/coach'
import { COACH_PLACEHOLDERS, createCoachReaction } from '~~/shared/utils/coach-dialogue'
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

const EVENT_LABELS: Record<CoachEvent, string> = {
  introduction: 'Présentation', question: 'Question', correct: 'Bonne réponse', 'correct-alternative': 'Bonne réponse avec variante',
  incorrect: 'Mauvaise réponse', 'cod-before': 'COD avant', 'cod-after': 'COD après', coi: 'COI',
  encouragement: 'Encouragement', streak: 'Série réussie', finish: 'Fin', restart: 'Recommencer', 'off-topic': 'Hors sujet',
}
const REACTION_EVENTS: CoachEvent[] = ['correct', 'incorrect', 'streak', 'finish']
const placeholdersLabel = COACH_PLACEHOLDERS.map(item => `{${item}}`).join(' · ')
const { user, handleUnauthorized } = useAdminAuth()
const coaches = ref<CoachProfile[]>([])
const characters = ref<CoachCharacter[]>([])
const media = ref<CoachMedia[]>([])
const selectedId = ref<number | null>(null)
const draft = ref<CoachProfile | null>(null)
const tab = ref<'coaches' | 'media'>('coaches')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const previewEvent = ref<CoachEvent>('correct')
const selectedMediaId = ref<number | null>(null)
const mediaDraft = reactive({ id: 0, name: '', filePath: '', mediaType: 'animation', category: 'success', altText: '', rightsStatus: 'pending', safetyStatus: 'pending', isActive: true, fileSize: null as number | null })
const uploading = ref(false)
let loaded = false

useHead({ title: 'Coaches — Administration' })

const preview = computed(() => draft.value ? createCoachReaction(draft.value, previewEvent.value, {
  verb: 'manger', complement: 'les pommes', participle: 'mangées', gender: 'féminin', number: 'pluriel',
  mode: 'indicatif', tense: 'passé composé', expectedAnswer: 'vous avez mangées', score: 85, correctCount: 17, questionCount: 20,
}, { random: () => 0, allowMotion: true, mediaAllowed: true }) : null)

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T }
function selectCoach(coach: CoachProfile) { selectedId.value = coach.id; draft.value = clone(coach); error.value = ''; success.value = '' }
function blankCoach(): CoachProfile {
  const character = characters.value[0]
  return { id: 0, slug: '', firstName: '', lastName: '', gender: 'female', avatarPath: '', description: '', characterId: character?.id || 0, characterName: character?.name || '', personality: character?.name || '', pedagogicalStyle: character?.pedagogicalStyle || '', themeColor: '#295f72', status: 'draft', sortOrder: coaches.value.length + 1, replies: [], media: clone(media.value), assignments: [], rules: [] }
}
function newCoach() { selectedId.value = null; draft.value = blankCoach() }

async function load() {
  loading.value = true; error.value = ''
  try {
    const [coachResponse, characterResponse, mediaResponse] = await Promise.all([
      $fetch<{ coaches: CoachProfile[] }>('/api/admin/coaches'),
      $fetch<{ characters: CoachCharacter[] }>('/api/admin/coach-characters'),
      $fetch<{ media: CoachMedia[] }>('/api/admin/coach-media'),
    ])
    coaches.value = coachResponse.coaches; characters.value = characterResponse.characters; media.value = mediaResponse.media
    if (draft.value?.id) {
      const refreshed = coaches.value.find(item => item.id === draft.value?.id)
      if (refreshed) selectCoach(refreshed)
    } else if (!draft.value && coaches.value[0]) selectCoach(coaches.value[0])
  } catch (caught) { if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de charger les coaches.') }
  finally { loading.value = false }
}

async function saveCoach() {
  if (!draft.value || saving.value) return
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

async function disableCoach() {
  if (!draft.value?.id || !window.confirm(`Désactiver ${draft.value.firstName} ${draft.value.lastName} ?`)) return
  try {
    await $fetch(`/api/admin/coaches/${draft.value.id}`, { method: 'DELETE' })
    await load(); success.value = 'Coach désactivé.'
  } catch (caught) { error.value = getAdminErrorMessage(caught, 'Impossible de désactiver ce coach.') }
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
  if (!draft.value.rules.some(item => item.eventType === eventType)) draft.value.rules.push({ eventType, mediaProbability: 0.2, cooldownQuestions: 2 })
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

watch(user, (current) => { if (current && !loaded) { loaded = true; void load() } if (!current) loaded = false }, { immediate: true })
</script>

<template>
  <AdminAuthBoundary><AdminShell><div class="coach-admin">
    <header class="admin-section-heading"><div><p class="admin-eyebrow">Personnages virtuels</p><h1>Coaches</h1><p class="admin-muted">Gérez leur identité et attribuez-leur un caractère partagé.</p></div><button class="admin-button admin-button--primary" @click="newCoach">Nouveau coach</button></header>
    <p v-if="error" class="admin-notice admin-notice--error">{{ error }}</p><p v-if="success" class="admin-notice admin-notice--success">{{ success }}</p>

    <div class="coach-admin__workspace">
      <aside class="coach-admin__list admin-card"><button v-for="coach in coaches" :key="coach.id" :class="{ selected: coach.id === selectedId }" @click="selectCoach(coach)"><img :src="coach.avatarPath" alt=""><span><strong>{{ coach.firstName }} {{ coach.lastName }}</strong><small>{{ coach.characterName }}</small></span></button></aside>
      <form v-if="draft" class="coach-editor" @submit.prevent="saveCoach">
        <section class="admin-card coach-panel coach-identity-panel">
          <div class="coach-panel__title">
            <div><p class="admin-eyebrow">Identité</p><h2>{{ draft.id ? `${draft.firstName} ${draft.lastName}` : 'Nouveau coach' }}</h2></div>
            <button v-if="draft.id" type="button" class="admin-button admin-button--danger admin-button--small" @click="disableCoach">Désactiver</button>
          </div>

          <div class="coach-identity-layout">
            <div class="coach-identity-fields">
              <div class="coach-fields coach-fields--identity">
                <label class="admin-field"><span>Prénom *</span><input v-model="draft.firstName" required></label>
                <label class="admin-field"><span>Nom fictif *</span><input v-model="draft.lastName" required></label>
                <label class="admin-field"><span>Genre du personnage *</span><select v-model="draft.gender"><option value="female">Femme</option><option value="male">Homme</option></select></label>
                <label class="admin-field"><span>Identifiant *</span><input v-model="draft.slug" required></label>
                <label class="admin-field"><span>Caractère partagé *</span><select v-model.number="draft.characterId" required><option v-for="character in characters" :key="character.id" :value="character.id">{{ character.name }}</option></select></label>
                <label class="admin-field admin-field--color"><span>Couleur</span><input v-model="draft.themeColor" type="color"></label>
                <label class="admin-field"><span>Statut</span><select v-model="draft.status"><option value="draft">Brouillon</option><option value="published">Publié</option><option value="disabled">Désactivé</option></select></label>
                <label class="admin-field"><span>Ordre d’affichage</span><input v-model.number="draft.sortOrder" type="number"></label>
              </div>
              <div class="coach-description-fields">
                <label class="admin-field"><span>Présentation personnelle</span><input v-model="draft.description"></label>
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

        <div class="coach-editor__save"><button class="admin-button admin-button--primary" :disabled="saving">{{ saving ? 'Enregistrement…' : 'Enregistrer le coach' }}</button></div>
      </form>
    </div>
  </div></AdminShell></AdminAuthBoundary>
</template>

<style scoped>
.coach-admin { display: grid; gap: 22px; }.coach-admin__tabs { display:flex; gap:8px; border-bottom:1px solid var(--admin-border) }.coach-admin__tabs button { padding:10px 14px; border:0; border-radius:9px 9px 0 0; background:#edf3f5; font-weight:800; cursor:pointer }.coach-admin__tabs button.active { color:white; background:var(--admin-blue) }.coach-admin__tabs span { padding:1px 6px; border-radius:10px; background:rgb(255 255 255 / 25%) }
.coach-admin__workspace,.media-workspace { display:grid; grid-template-columns:minmax(230px,280px) minmax(0,1fr); gap:18px; align-items:start }.coach-admin__list,.media-library { padding:10px; box-shadow:none; max-height:calc(100vh - 190px); overflow:auto }.coach-admin__list button,.media-library button { display:grid; width:100%; padding:9px; grid-template-columns:46px 1fr; gap:10px; align-items:center; text-align:left; border:1px solid transparent; background:white; border-radius:10px; cursor:pointer }.coach-admin__list button.selected,.media-library button.selected { border-color:#72b3c4; background:var(--admin-cyan) }.coach-admin__list img,.media-library img { width:46px; height:46px; object-fit:cover; border-radius:50% }.coach-admin__list span,.media-library span { display:grid; min-width:0 }.coach-admin__list small,.media-library small { color:var(--admin-muted) }
.coach-editor { display:grid; gap:16px }.coach-panel,.media-editor { padding:20px; box-shadow:none }.coach-panel__title { display:flex; align-items:center; justify-content:space-between; gap:15px }.coach-panel h2,.media-editor h2 { margin:0;color:var(--admin-navy) }.coach-panel__title > img { width:70px;height:70px;object-fit:cover;border-radius:14px }.coach-fields { display:grid; margin-top:17px; grid-template-columns:repeat(2,minmax(0,1fr)); gap:13px }.coach-fields__wide { grid-column:1/-1 }
.coach-identity-layout { display:grid;grid-template-columns:minmax(0,1fr) minmax(230px,290px);gap:24px;margin-top:20px;align-items:start }.coach-fields--identity { margin-top:0 }.coach-description-fields { display:grid;gap:13px;margin-top:18px;padding-top:18px;border-top:1px solid var(--admin-border) }.coach-avatar-card { display:grid;gap:13px;padding:14px;background:#f3f7f8;border:1px solid var(--admin-border);border-radius:16px }.coach-avatar-card__portrait { display:grid;place-items:center;width:100%;aspect-ratio:4/5;overflow:hidden;background:#dce9ec;border-radius:12px;color:var(--admin-blue);font-size:4rem;font-weight:900 }.coach-avatar-card__portrait img { width:100%;height:100%;object-fit:cover }.coach-avatar-card__upload small { color:var(--admin-muted) }.admin-field--color input[type="color"] { min-height:43px;padding:4px }
.coach-help { font-size:.82rem;overflow-wrap:anywhere }.reply-list { display:grid;gap:9px }.reply-row { display:grid;grid-template-columns:170px minmax(260px,1fr) 85px 34px;gap:8px;align-items:center }.reply-row textarea,.reply-row select,.reply-row input,.media-assign-grid select,.media-assign-grid input { width:100%;padding:8px;border:1px solid var(--admin-border);border-radius:7px }.reply-row label,.media-assign-grid label { font-size:.72rem }.reply-row > button { border:0;background:#f7e4e2;color:#9c342f;border-radius:7px;font-size:1.2rem;cursor:pointer }
.media-assign-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(135px,1fr));gap:10px }.media-assign-grid article { display:grid;padding:8px;gap:6px;border:1px solid var(--admin-border);border-radius:10px }.media-assign-grid article.assigned { border-color:#62a7ba;background:#eff9fb }.media-assign-grid article > button { position:relative;height:90px;padding:0;overflow:hidden;border:0;border-radius:7px;background:#e8eff1;cursor:pointer }.media-assign-grid article img { width:100%;height:100%;object-fit:contain }.media-assign-grid article button span { position:absolute;right:5px;top:5px;display:grid;width:24px;height:24px;place-items:center;color:white;background:#176b87;border-radius:50% }.media-assign-grid strong { overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.82rem }.reaction-rules { display:grid;gap:7px }.reaction-rules > div { display:grid;grid-template-columns:170px 1fr 1fr;gap:10px;align-items:center }.reaction-rules button { padding:8px;text-align:left;border:0;border-radius:7px;background:#edf3f5;font-weight:800;cursor:pointer }.reaction-rules label { display:flex;gap:7px;align-items:center;font-size:.8rem }.reaction-rules input { width:75px }.coach-preview { display:flex;margin-top:15px;padding:16px;gap:11px;background:#eef7fa;border-radius:13px }.coach-preview > img { width:46px;height:46px;object-fit:cover;border:3px solid var(--preview-color);border-radius:50% }.coach-preview p { margin:3px 0;white-space:pre-line }.coach-preview div > img { max-width:220px;max-height:150px;object-fit:contain;border-radius:8px }.coach-editor__save { position:sticky;bottom:10px;display:flex;justify-content:flex-end;padding:12px;background:rgb(255 255 255 / 90%);border-radius:12px;box-shadow:0 8px 30px rgb(18 56 70 / 15%) }
.media-library button { grid-template-columns:72px 1fr }.media-library img { width:72px;height:56px;border-radius:7px }.media-editor { display:grid;gap:14px }.media-editor .coach-fields { margin:0 }.admin-check { display:flex;align-items:center;gap:8px }.admin-check input { width:auto }.media-editor > .admin-button { justify-self:end }
@media(max-width:1100px){.coach-identity-layout{grid-template-columns:minmax(0,1fr) 220px}}@media(max-width:900px){.coach-admin__workspace,.media-workspace{grid-template-columns:1fr}.coach-admin__list,.media-library{max-height:260px}.coach-identity-layout{grid-template-columns:minmax(0,1fr) minmax(220px,280px)}}@media(max-width:650px){.coach-fields,.coach-identity-layout{grid-template-columns:1fr}.coach-avatar-card{grid-row:1}.coach-avatar-card__portrait{max-height:360px}.coach-fields__wide{grid-column:auto}.reply-row{grid-template-columns:1fr}.reaction-rules>div{grid-template-columns:1fr}.media-assign-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>

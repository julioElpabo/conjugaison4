<script setup lang="ts">
import type { CoachCharacter, CoachHelpBlock, CoachHelpBlockType, CoachHelpTemplate } from '~~/shared/types/coach'
import { COACH_HELP_BLOCK_TYPES } from '~~/shared/types/coach'
import type { CoachHelpContentValues } from '~~/shared/utils/coach-help'
import { defaultCoachHelpBlocks } from '~~/shared/utils/coach-help'
import { formatCharacterNames } from '~~/shared/utils/coach-character'
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

const BLOCK_LABELS: Record<CoachHelpBlockType, string> = {
  normal: 'Normal',
  warning: 'Warning',
  danger: 'Danger',
}
const BLOCK_DESCRIPTIONS: Record<CoachHelpBlockType, string> = {
  normal: 'Carte blanche pour le contenu principal.',
  warning: 'Encadré jaune pour attirer l’attention.',
  danger: 'Encadré orange pour une exception importante.',
}
const ENDINGS_BLOCK_CONTENT = '{endingsHelp}'
const { user, handleUnauthorized } = useAdminAuth()
const helps = ref<CoachHelpTemplate[]>([])
const characters = ref<CoachCharacter[]>([])
const draft = ref<CoachHelpTemplate | null>(null)
const selectedId = ref<number | null>(null)
const selectedInsertionIndex = ref(0)
const autosaveState = ref<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle')
const loading = ref(false)
const publishing = ref(false)
const associationSaving = ref(false)
const error = ref('')
let loaded = false
let autosaveTimer: ReturnType<typeof setTimeout> | null = null
let autosavePromise: Promise<void> | null = null
let lastSavedSnapshot = ''

const PREVIEW_VALUES: CoachHelpContentValues = {
  coach: { firstName: 'Sami' }, verb: 'manger', definition: 'prendre un aliment', helpTitle: 'manger à l’imparfait', subject: 'nous', mode: 'indicatif', tense: 'imparfait',
  correctAnswers: 'nous mangions une pomme', auxiliaryAnswer: '', pastParticipleAnswer: '', unagreedPastParticiple: 'mangé',
  COD: 'une pomme', isCODplace_avant: 'non', COI: '', isCOIplace_avant: 'non',
  endingsHelp: '<p>Le verbe <strong>manger</strong> est un verbe en <strong>-er</strong> (premier groupe).</p><p>Ses terminaisons à l’imparfait de l’indicatif sont :</p><table><tbody><tr><th>je</th><td>-ais</td></tr><tr><th>tu</th><td>-ais</td></tr><tr><th>il / elle / on</th><td>-ait</td></tr><tr><th>nous</th><td>-ions</td></tr><tr><th>vous</th><td>-iez</td></tr><tr><th>ils / elles</th><td>-aient</td></tr></tbody></table>',
}

useHead({ title: 'Aides — Administration' })
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const assignedCharacters = computed(() => draft.value?.id
  ? characters.value.filter(character => character.helpId === draft.value?.id)
  : [])
const selectedCharacterId = computed(() => assignedCharacters.value[0]?.id ? String(assignedCharacters.value[0].id) : '')
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
  selectedId.value = help.id || null
  lastSavedSnapshot = help.id ? JSON.stringify(draft.value) : ''
  autosaveState.value = help.id ? 'idle' : 'dirty'
  error.value = ''
  selectedInsertionIndex.value = help.blocks.length
}
async function selectHelp(help: CoachHelpTemplate) {
  await autosaveHelp()
  setDraft(help)
}
async function newHelp() {
  await autosaveHelp()
  setDraft({ id: 0, name: '', description: '', headerTitle: '{helpTitle}', headerDescription: '', status: 'draft', blocks: defaultCoachHelpBlocks() })
}
async function load() {
  loading.value = true
  try {
    const [helpResponse, characterResponse] = await Promise.all([
      $fetch<{ helps: CoachHelpTemplate[] }>('/api/admin/coach-helps'),
      $fetch<{ characters: CoachCharacter[] }>('/api/admin/coach-characters'),
    ])
    helps.value = helpResponse.helps
    characters.value = characterResponse.characters
    if (draft.value?.id) {
      const refreshed = helps.value.find(help => help.id === draft.value?.id)
      if (refreshed) setDraft(refreshed)
    } else if (!draft.value && helps.value[0]) setDraft(helps.value[0])
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
  autosavePromise = current.id
    ? $fetch(`/api/admin/coach-helps/${current.id}`, { method: 'PUT', body: payload }).then(() => undefined)
    : $fetch<{ id: number }>('/api/admin/coach-helps', { method: 'POST', body: payload }).then((response) => {
        payload.id = response.id
        if (draft.value === current) {
          draft.value.id = response.id
          selectedId.value = response.id
        }
      })
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
async function associateCharacter(event: Event) {
  const select = event.currentTarget as HTMLSelectElement
  await autosaveHelp()
  if (!draft.value?.id || autosaveState.value === 'dirty' || autosaveState.value === 'error') {
    error.value = 'Donne un nom valide à cette aide avant de choisir son caractère.'
    return
  }
  associationSaving.value = true
  error.value = ''
  try {
    await $fetch(`/api/admin/coach-helps/${draft.value.id}/character`, {
      method: 'PUT',
      body: { characterId: select.value ? Number(select.value) : null },
    })
    await load()
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible d’associer ce caractère à l’aide.')
  } finally {
    associationSaving.value = false
  }
}
async function deleteHelp() {
  if (!draft.value?.id || !window.confirm(`Supprimer l’aide « ${draft.value.name} » du brouillon ? Elle restera visible pour les utilisateurs jusqu’à la prochaine publication.`)) return
  cancelScheduledAutosave()
  try {
    await $fetch(`/api/admin/coach-helps/${draft.value.id}`, { method: 'DELETE' })
    draft.value = null
    selectedId.value = null
    lastSavedSnapshot = ''
    await load()
  } catch (caught) {
    error.value = getAdminErrorMessage(caught, 'Impossible de supprimer cette aide.')
  }
}
function insertBlock(type: CoachHelpBlockType) {
  if (!draft.value) return
  const block: CoachHelpBlock = {
    id: 0,
    type,
    title: '',
    content: '',
    isActive: true,
    sortOrder: selectedInsertionIndex.value + 1,
    children: [],
  }
  draft.value.blocks.splice(selectedInsertionIndex.value, 0, block)
  selectedInsertionIndex.value += 1
}
function insertEndingsBlock() {
  if (!draft.value) return
  const block: CoachHelpBlock = {
    id: 0,
    type: 'normal',
    title: 'Terminaisons',
    content: ENDINGS_BLOCK_CONTENT,
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
onBeforeUnmount(cancelScheduledAutosave)
</script>

<template>
  <AdminAuthBoundary><AdminShell><div class="help-admin">
    <header class="admin-section-heading"><div><p class="admin-eyebrow">Aide contextuelle</p><h1>Aides</h1></div><div class="help-heading-actions"><button class="admin-button admin-button--primary" type="button" @click="newHelp">Nouvelle aide</button><button class="admin-button help-publish-button" type="button" :disabled="publishing || loading" @click="publishAll">{{ publishing ? 'Publication…' : 'Publier' }}</button></div></header>

    <nav class="help-tabs" aria-label="Choisir une aide">
      <button v-for="help in helps" :key="help.id" type="button" :class="{ selected: help.id === selectedId }" @click="selectHelp(help)"><span>{{ help.name }}</span><small :class="{ published: help.status === 'published' }">{{ help.status === 'published' ? 'Publiée' : 'Brouillon' }}</small></button>
      <span v-if="loading" class="admin-muted">Chargement…</span><span v-else-if="!helps.length" class="admin-muted">Aucune aide pour le moment.</span>
    </nav>
    <p v-if="error" class="admin-notice admin-notice--error">{{ error }}</p>

    <form v-if="draft" class="help-workspace" @submit.prevent>
      <aside class="admin-card block-library">
        <div><p class="admin-eyebrow">Blocs du body</p><h2>Éléments</h2><p class="admin-muted">Choisissez d’abord une position au centre, puis insérez un élément.</p></div>
        <button v-for="type in COACH_HELP_BLOCK_TYPES" :key="type" class="library-block" type="button" :aria-label="`Insérer un bloc ${BLOCK_LABELS[type]} à la position ${selectedInsertionIndex + 1}`" @click="insertBlock(type)">
          <span class="library-block__sample" :class="`is-${type}`"><i /> <i /><i /></span>
          <strong>{{ BLOCK_LABELS[type] }}</strong><p>{{ BLOCK_DESCRIPTIONS[type] }}</p>
        </button>
        <button class="library-block" type="button" :aria-label="`Insérer un bloc Terminaisons à la position ${selectedInsertionIndex + 1}`" @click="insertEndingsBlock">
          <span class="library-block__sample is-endings"><i /><i /><i /></span>
          <strong>Terminaisons</strong><p>Contenu dynamique adapté au verbe, au temps et au mode de la question.</p>
        </button>
      </aside>

      <main class="help-main">
        <section class="admin-card help-panel character-assignment">
          <div class="help-panel__title"><div><p class="admin-eyebrow">Caractère</p><h2>Associer cette aide</h2></div></div>
          <label class="admin-field"><span>Caractère</span><select :value="selectedCharacterId" :disabled="!draft.id || associationSaving" @change="associateCharacter"><option value="">Aucun caractère</option><option v-for="character in characters" :key="character.id" :value="character.id">{{ character.emoticon }} {{ formatCharacterNames(character) }}</option></select></label>
          <small v-if="!draft.id" class="admin-muted">Donnez d’abord un nom à l’aide pour pouvoir l’associer.</small><small v-else-if="associationSaving" class="admin-muted">Association en cours…</small><small v-else class="admin-muted">L’association sera visible par l’utilisateur à la prochaine publication.</small>
        </section>

        <section class="admin-card help-panel">
          <div class="help-panel__title"><div><p class="admin-eyebrow">Réglages</p><h2>{{ draft.name || 'Nouvelle aide' }}</h2></div><button v-if="draft.id" class="admin-button admin-button--danger admin-button--small" type="button" @click="deleteHelp">Supprimer</button></div>
          <div class="help-fields"><label class="admin-field"><span>Nom de l’aide *</span><input v-model="draft.name" maxlength="120" required></label><label class="admin-field help-fields__wide"><span>Description</span><textarea v-model="draft.description" rows="2" maxlength="500" /></label></div>
        </section>

        <section class="admin-card help-panel help-header-editor">
          <div class="help-panel__title"><div><p class="admin-eyebrow">1 · Header</p><h2>En-tête de l’aide</h2></div></div>
          <p class="admin-muted block-editor__intro">Ces deux champs correspondent directement à la zone colorée visible en haut de l’aperçu.</p>
          <div class="help-header-fields"><label class="admin-field"><span>Titre</span><input v-model="draft.headerTitle" maxlength="300"></label><AdminHtmlSourceEditor v-model="draft.headerDescription" :rows="4" :maxlength="2000" /></div>
        </section>

        <section class="admin-card help-panel block-editor">
          <div class="help-panel__title"><div><p class="admin-eyebrow">2 · Body</p><h2>Corps de l’aide</h2></div><strong>{{ draft.blocks.length }} bloc{{ draft.blocks.length > 1 ? 's' : '' }}</strong></div>
          <p class="admin-muted block-editor__intro">Cliquez sur une ligne d’insertion pour choisir précisément où le prochain élément apparaîtra.</p>
          <details class="help-variables"><summary>Variables et HTML utilisables</summary><p><strong>{helpTitle}</strong> · {coach} · {verb} · <strong>{definition}</strong> · {subject} · {mode} · {tense} · <strong>{endingsHelp}</strong> · {correctAnswers} · {auxiliaryAnswer} · {pastParticipleAnswer} · {unagreedPastParticiple} · {COD} · {isCODplace_avant} · {COI} · {isCOIplace_avant}</p><dl><div><dt>{helpTitle}</dt><dd>Le titre automatique de l’aide, par exemple « manger à l’imparfait ».</dd></div><div><dt>{definition}</dt><dd>La définition du verbe de la question.</dd></div><div><dt>{endingsHelp}</dt><dd>Le texte grammatical et la liste des terminaisons correspondant au verbe, au temps et au mode de la question.</dd></div><div><dt>{correctAnswers}</dt><dd>Toutes les réponses complètes acceptées.</dd></div><div><dt>{auxiliaryAnswer}</dt><dd>La forme attendue de l’auxiliaire.</dd></div><div><dt>{pastParticipleAnswer}</dt><dd>Le participe passé avec l’accord attendu.</dd></div><div><dt>{unagreedPastParticiple}</dt><dd>Le participe passé masculin singulier, sans accord.</dd></div><div><dt>{COD} / {COI}</dt><dd>Le complément correspondant, s’il existe.</dd></div><div><dt>{isCODplace_avant} / {isCOIplace_avant}</dt><dd>« oui » lorsque le complément concerné est placé avant, sinon « non ».</dd></div></dl><p>Balises autorisées : p, br, strong, em, mark, small, ul, ol, li, blockquote, code, sub, sup… Les scripts et attributs HTML sont supprimés.</p></details>

          <div class="help-blocks">
            <template v-for="(block, index) in draft.blocks" :key="`${block.id}-${index}`">
              <button class="insertion-point" :class="{ selected: selectedInsertionIndex === index }" type="button" @click="selectedInsertionIndex = index"><span>{{ selectedInsertionIndex === index ? 'Insérer ici' : '+' }}</span></button>
              <AdminCoachHelpBlockEditor :block="block" :siblings="draft.blocks" :index="index" />
            </template>
            <button class="insertion-point" :class="{ selected: selectedInsertionIndex === draft.blocks.length }" type="button" @click="selectedInsertionIndex = draft.blocks.length"><span>{{ selectedInsertionIndex === draft.blocks.length ? 'Insérer ici' : '+' }}</span></button>
          </div>
        </section>
        <div class="help-save-bar"><p class="help-autosave" :class="`is-${autosaveState}`" aria-live="polite"><span />{{ autosaveLabel }}</p><button v-if="autosaveState === 'error'" class="admin-button admin-button--small" type="button" @click="autosaveHelp">Réessayer</button></div>
      </main>

      <aside class="preview-column"><div class="preview-column__heading"><p class="admin-eyebrow">Aperçu</p><h2>Aperçu utilisateur</h2><small v-if="draft.status === 'draft'">Modifications en attente de publication</small><small v-else class="is-published">Cette version est publiée</small></div><CoachHelpPanel :blocks="draft.blocks" :values="PREVIEW_VALUES" :header-title="draft.headerTitle" :header-description="draft.headerDescription" :question-number="3" coach-color="#35688f" embedded /></aside>
    </form>
    <section v-else class="admin-card help-empty"><strong>Sélectionnez une aide</strong><span>ou créez-en une nouvelle pour commencer.</span></section>
  </div></AdminShell></AdminAuthBoundary>
</template>

<style scoped>
.help-admin,.help-editor{display:grid;gap:18px}.help-workspace{display:grid;grid-template-columns:minmax(230px,290px) minmax(0,1fr);gap:18px;align-items:start}.help-list{display:grid;padding:10px;gap:4px;max-height:calc(100vh - 190px);overflow:auto;box-shadow:none}.help-list button{display:grid;width:100%;grid-template-columns:42px minmax(0,1fr);padding:9px;align-items:center;gap:10px;text-align:left;border:1px solid transparent;border-radius:10px;background:white;cursor:pointer}.help-list button.selected{border-color:#72b3c4;background:var(--admin-cyan)}.help-list__icon{display:grid;width:42px;height:42px;place-items:center;color:white;border-radius:12px;background:var(--admin-blue);font-size:1.15rem;font-weight:900}.help-list button>span:last-child{display:grid;min-width:0}.help-list small{color:var(--admin-muted)}.help-list__empty{padding:12px}.help-panel{padding:20px;box-shadow:none}.help-panel__title{display:flex;justify-content:space-between;align-items:center;gap:15px}.help-panel__title h2{margin:0;color:var(--admin-navy)}.help-fields{display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:13px;margin-top:17px}.help-fields__wide{grid-column:1/-1}.help-characters{display:grid;margin-top:16px;padding:12px;gap:7px;border:1px solid var(--admin-border);border-radius:11px;background:#f5f9fa}.help-characters>div{display:flex;gap:7px;flex-wrap:wrap}.help-characters a{padding:5px 9px;color:var(--admin-blue);border-radius:999px;background:white;text-decoration:none;font-size:.8rem;font-weight:800}.help-characters small{color:var(--admin-muted)}.block-editor__intro{max-width:760px}.help-variables{padding:10px 13px;border:1px solid var(--admin-border);border-radius:9px;background:#f7fafb;font-size:.82rem}.help-variables summary{color:var(--admin-blue);font-weight:800;cursor:pointer}.help-variables p{margin:8px 0 0}.help-blocks{display:grid;margin-top:16px;gap:12px}.help-block{overflow:hidden;border:1px solid var(--admin-border);border-radius:12px;background:white;box-shadow:0 4px 14px rgb(37 75 78 / 5%)}.help-block.is-inactive{opacity:.65;background:#f1f4f5}.help-block__toolbar{display:flex;padding:9px 11px;align-items:center;gap:8px;border-bottom:1px solid var(--admin-border);background:#f6f9fa}.help-block__toolbar>strong{color:var(--admin-navy)}.help-block__toolbar label{display:flex;margin-left:auto;align-items:center;gap:5px;font-size:.75rem;font-weight:800}.help-block__toolbar button{display:grid;width:28px;height:28px;place-items:center;border:1px solid var(--admin-border);border-radius:7px;background:white;cursor:pointer}.help-block__toolbar button:disabled{opacity:.35;cursor:not-allowed}.help-block__toolbar .help-block__delete{color:#9c342f;background:#f7e4e2}.help-block__handle{color:#7c8e94;cursor:grab;font-size:1.2rem;letter-spacing:-.2em}.help-block__dynamic{padding:3px 7px;color:#24634f;border-radius:999px;background:#dff1e9;font-size:.67rem;font-weight:850}.help-block__fields{display:grid;padding:13px;gap:11px}.block-appender{display:flex;margin-top:18px;align-items:center;gap:10px}.block-appender__line{height:1px;flex:1;background:var(--admin-border)}.block-appender>div{display:flex;gap:7px}.block-appender select{padding:8px;border:1px solid var(--admin-border);border-radius:8px;background:white}.help-save-bar{position:sticky;bottom:10px;display:flex;justify-content:flex-end;align-items:center;gap:12px;padding:12px;background:rgb(255 255 255 / 90%);border-radius:12px;box-shadow:0 8px 30px rgb(18 56 70 / 15%)}.help-autosave{display:flex;align-items:center;gap:8px;margin:0;color:var(--admin-muted);font-size:.84rem;font-weight:800}.help-autosave>span{width:9px;height:9px;border-radius:50%;background:#4d967c}.help-autosave.is-dirty>span,.help-autosave.is-saving>span{background:#d29a2e}.help-autosave.is-saving>span{animation:help-pulse .9s ease-in-out infinite}.help-autosave.is-error{color:#9c342f}.help-autosave.is-error>span{background:#b94a42}.help-empty{display:grid;min-height:220px;place-content:center;justify-items:center;color:var(--admin-muted)}@keyframes help-pulse{50%{opacity:.3}}@media(max-width:900px){.help-workspace{grid-template-columns:1fr}.help-list{max-height:260px}}@media(max-width:650px){.help-fields{grid-template-columns:1fr}.help-fields__wide{grid-column:auto}.help-block__toolbar{flex-wrap:wrap}.help-block__toolbar label{margin-left:0}.block-appender>div{align-items:stretch;flex-direction:column}}
.help-variables p{overflow-wrap:anywhere}.help-variables dl{display:grid;margin:12px 0 0;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.help-variables dl>div{padding:8px 10px;border-radius:8px;background:white}.help-variables dt{color:var(--admin-blue);font-family:monospace;font-weight:800}.help-variables dd{margin:3px 0 0;color:var(--admin-muted)}
@media(max-width:650px){.help-variables dl{grid-template-columns:1fr}}
.help-tabs{display:flex;margin-top:-8px;padding-bottom:4px;gap:8px;overflow-x:auto}.help-tabs button{display:flex;padding:9px 12px;align-items:center;gap:9px;white-space:nowrap;border:1px solid var(--admin-border);border-radius:10px;color:var(--admin-navy);background:white;cursor:pointer;font-weight:800}.help-tabs button.selected{color:white;border-color:var(--admin-blue);background:var(--admin-blue);box-shadow:0 0 0 3px rgb(117 186 202 / 25%)}.help-tabs small{padding:3px 7px;color:#7e5a18;border-radius:999px;background:#f7ebcf;font-size:.65rem}.help-tabs small.published{color:#24634f;background:#dff1e9}.help-tabs button.selected small{color:inherit;background:rgb(255 255 255 / 18%)}
.help-workspace{display:grid;grid-template-columns:minmax(210px,250px) minmax(500px,1fr) minmax(360px,420px);gap:18px;align-items:start}.help-main{display:grid;min-width:0;gap:18px}.block-library{position:sticky;top:14px;display:grid;padding:16px;gap:11px;box-shadow:none}.block-library h2,.preview-column h2{margin:0;color:var(--admin-navy)}.block-library>div>p:last-child{margin-bottom:0;font-size:.8rem}.library-block{display:grid;padding:11px;gap:7px;border:1px solid var(--admin-border);border-radius:11px;background:#f8fbfc}.library-block>strong{color:var(--admin-navy);font-size:.84rem}.library-block>p{margin:0;color:var(--admin-muted);font-size:.72rem;line-height:1.35}.library-block>button{justify-self:stretch}.library-block__sample{display:flex;height:42px;padding:7px;align-items:center;gap:5px;border:1px solid #d8e6e4;border-radius:8px;background:white}.library-block__sample i{display:block;height:5px;border-radius:999px;background:#b8d1d4}.library-block__sample i:first-child{width:23px;height:23px;flex:0 0 auto;border-radius:7px;background:#267a87}.library-block__sample i:nth-child(2){width:44%}.library-block__sample i:nth-child(3){flex:1}.library-block__sample.is-warnings{background:#fffbef}.library-block__sample.is-warnings i:first-child{background:#e1ad3d}.library-block__sample.is-intro,.library-block__sample.is-custom{background:#eff7f7}
.insertion-point{position:relative;display:grid;width:100%;height:22px;padding:0;place-items:center;border:0;background:transparent;cursor:pointer}.insertion-point::before{content:'';position:absolute;right:0;left:0;height:1px;background:#c9d8db}.insertion-point>span{position:relative;display:grid;min-width:25px;height:22px;padding:0 7px;place-items:center;color:#6f858c;border:1px solid #c9d8db;border-radius:999px;background:white;font-size:.7rem;font-weight:850}.insertion-point:hover::before,.insertion-point.selected::before{height:2px;background:var(--admin-blue)}.insertion-point:hover>span,.insertion-point.selected>span{color:white;border-color:var(--admin-blue);background:var(--admin-blue)}.help-blocks{gap:0}.help-block{margin:3px 0}.preview-column{position:sticky;top:14px;display:grid;min-width:0;gap:10px}.preview-column__heading{display:grid;padding-inline:4px;gap:2px}.preview-column__heading small{color:#8a641a;font-weight:750}.preview-column__heading small.is-published{color:#28705a}.help-save-bar{z-index:2}
@media(max-width:1250px){.help-workspace{grid-template-columns:minmax(200px,240px) minmax(480px,1fr)}.preview-column{position:static;grid-column:1/-1;width:min(440px,100%);justify-self:center}.block-library{top:10px}}
@media(max-width:850px){.help-workspace{grid-template-columns:1fr}.block-library{position:static;grid-template-columns:repeat(2,minmax(0,1fr))}.block-library>div{grid-column:1/-1}.preview-column{grid-column:auto}.help-tabs{margin-top:0}}
@media(max-width:560px){.block-library{grid-template-columns:1fr}.help-tabs button{align-items:flex-start;flex-direction:column;gap:3px}.help-panel{padding:14px}}
.help-heading-actions{display:flex;align-items:center;gap:9px}.help-publish-button{color:white;border-color:#26735d;background:#26735d}.help-publish-button:disabled{opacity:.55}.library-block__sample.is-warning{border-left:5px solid #d9a20f;background:#fff6d9}.library-block__sample.is-warning i:first-child{background:#d9a20f}.library-block__sample.is-danger{border:2px solid #c96f37;background:#fff0e5}.library-block__sample.is-danger i:first-child{background:#c96f37}.library-block__sample.is-header{border-color:transparent;background:#eff7f7}.library-block__sample.is-normal i:first-child{display:none}
.help-header-fields{display:grid;margin-top:16px;gap:12px}
.library-block{width:100%;color:inherit;font:inherit;text-align:left;cursor:pointer;transition:border-color .15s ease,box-shadow .15s ease,transform .15s ease}.library-block:hover{border-color:#79b5c2;box-shadow:0 5px 14px rgb(18 56 70 / 10%);transform:translateY(-1px)}.library-block:focus-visible{outline:3px solid rgb(38 127 141 / 28%);outline-offset:2px}
.library-block__sample.is-endings{display:grid;padding:8px 10px;align-content:center;gap:5px;background:#eef7f7}.library-block__sample.is-endings i,.library-block__sample.is-endings i:first-child,.library-block__sample.is-endings i:nth-child(2),.library-block__sample.is-endings i:nth-child(3){position:relative;width:auto;height:5px;margin-left:15px;border-radius:999px;background:#8eb7bd}.library-block__sample.is-endings i::before{content:'✦';position:absolute;left:-15px;top:50%;color:#267f8d;font-size:.48rem;transform:translateY(-50%)}:global(:root[data-theme='dark'] .library-block__sample.is-endings){background:#1c3338}:global(:root[data-theme='dark'] .library-block__sample.is-endings i){background:#688e97}:global(:root[data-theme='dark'] .library-block__sample.is-endings i::before){color:#84cad5}
:global(:root[data-theme='dark'] .help-tabs button){color:#d4e4e8;border-color:#465d66;background:#1b2c31}:global(:root[data-theme='dark'] .help-tabs button:hover){border-color:#6594a2;background:#21353b}:global(:root[data-theme='dark'] .help-tabs button.selected){color:#f3fafb;border-color:#58a8bd;background:#347f95;box-shadow:0 0 0 3px rgb(88 168 189 / 18%)}:global(:root[data-theme='dark'] .help-tabs small){color:#e3c47f;background:#3b3323}:global(:root[data-theme='dark'] .help-tabs small.published){color:#a8dfbd;background:#203a2c}:global(:root[data-theme='dark'] .help-tabs button.selected small){color:#f1f7f8;background:rgb(255 255 255 / 14%)}
:global(:root[data-theme='dark'] .library-block){color:#d4e3e7;border-color:#455c64;background:#1c2d32}:global(:root[data-theme='dark'] .library-block:hover){border-color:#6495a3;background:#21353b;box-shadow:0 7px 18px rgb(0 0 0 / 20%)}:global(:root[data-theme='dark'] .library-block>strong){color:#d6e7eb}:global(:root[data-theme='dark'] .library-block>p){color:#aebfc5}:global(:root[data-theme='dark'] .library-block__sample){border-color:#496168;background:#15262b}:global(:root[data-theme='dark'] .library-block__sample i){background:#78979f}:global(:root[data-theme='dark'] .library-block__sample.is-normal i:first-child){display:none}:global(:root[data-theme='dark'] .library-block__sample.is-warning){border-color:#806c35;border-left-color:#b88b24;background:#342f20}:global(:root[data-theme='dark'] .library-block__sample.is-warning i:first-child){background:#c8972d}:global(:root[data-theme='dark'] .library-block__sample.is-danger){border-color:#9a5d3b;background:#38271f}:global(:root[data-theme='dark'] .library-block__sample.is-danger i:first-child){background:#c46d3e}
:global(:root[data-theme='dark'] .help-variables){color:#cadade;border-color:#435b63;background:#1b2d32}:global(:root[data-theme='dark'] .help-variables summary){color:#73bfd2}:global(:root[data-theme='dark'] .help-variables dl>div){background:#22353b}:global(:root[data-theme='dark'] .help-variables dt){color:#83c9d9}:global(:root[data-theme='dark'] .help-variables dd){color:#afc0c6}
:global(:root[data-theme='dark'] .insertion-point::before){background:#435b63}:global(:root[data-theme='dark'] .insertion-point>span){color:#acc0c6;border-color:#4b646d;background:#192a2f}:global(:root[data-theme='dark'] .insertion-point:hover>span),:global(:root[data-theme='dark'] .insertion-point.selected>span){color:#f5fbfc;border-color:#58a8bd;background:#347f95}
:global(:root[data-theme='dark'] .help-save-bar){border:1px solid #3f555d;background:rgb(24 40 45 / 94%);box-shadow:0 10px 32px rgb(0 0 0 / 30%);backdrop-filter:blur(10px)}:global(:root[data-theme='dark'] .help-autosave){color:#b4c5ca}:global(:root[data-theme='dark'] .help-autosave.is-error){color:#f0aaa4}:global(:root[data-theme='dark'] .preview-column__heading small){color:#e1c17a}:global(:root[data-theme='dark'] .preview-column__heading small.is-published){color:#9bd9b4}
</style>

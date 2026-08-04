<script setup lang="ts">
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

type ReviewStatus = 'candidate' | 'validated' | 'reserve' | 'rejected'

interface LiteraryTarget {
  id: number
  text: string
  chapter: string | null
  locator: string
  wordCount: number
  targetText: string
  targetStart: number
  targetEnd: number
  confidence: 'high' | 'ambiguous'
  ambiguityReason: string | null
  reviewStatus: ReviewStatus
  reviewNote: string | null
  reviewedAt: string | null
  verbId: number
  infinitive: string
  tenseId: number
  tense: string
  mode: string
  personId: number
  pronoun: string
  validatedForSelection: number
  sourceId: number
  author: string
  work: string
  sourceUrl: string
}

interface CorpusResponse {
  targets: LiteraryTarget[]
  counts: Record<ReviewStatus, number>
  limit: number
  offset: number
  total: number
  navigation: {
    sources: SourceOption[]
    verbs: FilterOption[]
    modes: FilterOption[]
    tenses: TenseOption[]
    persons: FilterOption[]
  }
}

interface FilterOption { id: number, label: string, count: number }
interface SourceOption { id: number, label: string, author: string }
interface TenseOption extends FilterOption { modeId: number }

const { user, handleUnauthorized } = useAdminAuth()
const targets = ref<LiteraryTarget[]>([])
const selectedId = ref<number | null>(null)
const counts = ref<Record<ReviewStatus, number>>({ candidate: 0, validated: 0, reserve: 0, rejected: 0 })
const status = ref<ReviewStatus | 'all'>('candidate')
const confidence = ref<'all' | 'high' | 'ambiguous'>('all')
const search = ref('')
const sourceId = ref(0)
const verbId = ref(0)
const modeId = ref(0)
const tenseId = ref(0)
const personId = ref(0)
const verbs = ref<FilterOption[]>([])
const modes = ref<FilterOption[]>([])
const tenses = ref<TenseOption[]>([])
const persons = ref<FilterOption[]>([])
const sources = ref<SourceOption[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const editableTargetText = ref('')
const editableSentenceText = ref('')
const citationRenderVersion = ref(0)
const page = ref(0)
const pageSize = 100
const total = ref(0)
const pendingSelectionId = ref<number | null>(null)
let searchTimer: ReturnType<typeof setTimeout> | undefined
let loadSequence = 0

useHead({ title: 'Phrases — Administration' })

const selected = computed(() => targets.value.find(target => target.id === selectedId.value) || targets.value[0] || null)
const visibleTenses = computed(() => modeId.value
  ? tenses.value.filter(tense => tense.modeId === modeId.value)
  : [])
const sentenceParts = computed(() => {
  const target = selected.value
  if (!target) return { before: '', target: '', after: '' }
  return {
    before: target.text.slice(0, target.targetStart),
    target: target.text.slice(target.targetStart, target.targetEnd),
    after: target.text.slice(target.targetEnd),
  }
})

async function loadTargets(resetPage = false) {
  if (!user.value) return
  if (resetPage) page.value = 0
  loading.value = true
  const sequence = ++loadSequence
  error.value = ''
  try {
    const response = await $fetch<CorpusResponse>('/api/admin/literary-corpus', {
      credentials: 'same-origin',
      query: {
        status: status.value,
        confidence: confidence.value === 'all' ? undefined : confidence.value,
        search: search.value || undefined,
        sourceId: sourceId.value || undefined,
        verbId: verbId.value || undefined,
        modeId: modeId.value || undefined,
        tenseId: tenseId.value || undefined,
        personId: personId.value || undefined,
        limit: pageSize,
        offset: page.value * pageSize,
      },
    })
    if (sequence !== loadSequence) return
    targets.value = response.targets
    counts.value = response.counts
    total.value = response.total
    sources.value = response.navigation.sources
    verbs.value = response.navigation.verbs
    modes.value = response.navigation.modes
    tenses.value = response.navigation.tenses
    persons.value = response.navigation.persons
    if (!targets.value.some(target => target.id === selectedId.value)) selectedId.value = targets.value[0]?.id || null
  }
  catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de charger le corpus.')
  }
  finally {
    if (sequence === loadSequence) loading.value = false
  }
}

function chooseMode(id: number) {
  modeId.value = id
  tenseId.value = 0
  personId.value = 0
  void loadTargets(true)
}

function chooseTense(id: number) {
  tenseId.value = id
  personId.value = 0
  void loadTargets(true)
}

function choosePerson(id: number) {
  personId.value = id
  void loadTargets(true)
}

function resetGrammar() {
  modeId.value = 0
  tenseId.value = 0
  personId.value = 0
  void loadTargets(true)
}

interface ReviewOptions { quick?: boolean, target?: LiteraryTarget, selectAfter?: number | null }

async function review(nextStatus: ReviewStatus, options: ReviewOptions = {}) {
  const target = options.target || selected.value
  if (!target || saving.value) return
  let note: string | null = null
  if (nextStatus === 'rejected' && !options.quick) {
    note = window.prompt('Motif du rejet ?', target.ambiguityReason || 'Phrase inadaptée')?.trim() || null
    if (!note) return
  }
  else if (nextStatus === 'rejected') note = target.reviewNote || 'Rejet rapide'
  const targetIndex = targets.value.findIndex(item => item.id === target.id)
  const adjacentId = targets.value[targetIndex + 1]?.id || targets.value[targetIndex - 1]?.id || null
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const response = await $fetch<{ status: ReviewStatus, message: string }>(`/api/admin/literary-corpus/${target.id}`, {
      method: 'PUT',
      credentials: 'same-origin',
      body: { status: nextStatus, note },
    })
    success.value = response.message || (response.status === 'validated'
      ? 'Citation validée.'
      : response.status === 'reserve' ? 'Citation mise en réserve.'
        : response.status === 'rejected' ? 'Citation rejetée.' : 'Citation remise parmi les candidates.')
    await loadTargets()
    const preferredId = options.selectAfter !== undefined ? options.selectAfter : options.quick ? adjacentId : null
    if (preferredId && targets.value.some(item => item.id === preferredId)) selectedId.value = preferredId
  }
  catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible d’enregistrer la validation.')
  }
  finally {
    saving.value = false
    continuePendingSelection()
  }
}

function quickToggleStatus(target: LiteraryTarget) {
  const nextStatus: ReviewStatus = target.reviewStatus === 'rejected' ? 'validated' : 'rejected'
  void review(nextStatus, { quick: true, target })
}

async function selectTarget(id: number) {
  if (selected.value?.id === id) return
  if (saving.value) {
    pendingSelectionId.value = id
    return
  }
  const previous = selected.value
  if (previous?.reviewStatus === 'candidate') {
    await review('validated', { quick: true, target: previous, selectAfter: id })
  }
  else selectedId.value = id
}

function continuePendingSelection() {
  const id = pendingSelectionId.value
  pendingSelectionId.value = null
  if (id && targets.value.some(target => target.id === id)) void selectTarget(id)
}

async function selectAdjacent(direction: -1 | 1) {
  if (!targets.value.length) return
  const currentIndex = targets.value.findIndex(target => target.id === selected.value?.id)
  const nextIndex = Math.min(targets.value.length - 1, Math.max(0, currentIndex + direction))
  const nextId = targets.value[nextIndex]?.id
  if (!nextId || nextId === selected.value?.id) return
  await selectTarget(nextId)
  await nextTick()
  document.querySelector<HTMLElement>(`[data-phrase-id="${selectedId.value}"]`)?.scrollIntoView({ block: 'nearest' })
}

function isEditingTarget(eventTarget: EventTarget | null) {
  return eventTarget instanceof HTMLElement
    && Boolean(eventTarget.closest('input, textarea, select, [contenteditable="true"]'))
}

function handleKeyboard(event: KeyboardEvent) {
  if (isEditingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    void selectAdjacent(event.key === 'ArrowDown' ? 1 : -1)
  }
  else if (event.key.toLocaleLowerCase('fr') === 'x' && selected.value && !saving.value) {
    event.preventDefault()
    void review('rejected', { quick: true })
  }
}

async function saveTargetText() {
  const target = selected.value
  const targetText = editableTargetText.value.trim()
  if (!target || saving.value || targetText === target.targetText) return
  if (!targetText) {
    editableTargetText.value = target.targetText
    return
  }
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    await $fetch(`/api/admin/literary-corpus/${target.id}`, {
      method: 'PUT',
      credentials: 'same-origin',
      body: { status: target.reviewStatus, note: target.reviewNote, targetText },
    })
    success.value = 'Forme ciblée mise à jour.'
    await loadTargets()
  }
  catch (caught) {
    editableTargetText.value = target.targetText
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de modifier la forme ciblée.')
  }
  finally {
    saving.value = false
    continuePendingSelection()
  }
}

function updateEditableSentence(event: Event) {
  editableSentenceText.value = (event.currentTarget as HTMLElement | null)?.textContent || ''
}

async function saveSentenceText() {
  const target = selected.value
  const sentenceText = editableSentenceText.value.replace(/\s+/gu, ' ').trim()
  if (!target || saving.value || sentenceText === target.text) return
  if (!sentenceText) {
    editableSentenceText.value = target.text
    citationRenderVersion.value++
    return
  }
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    await $fetch(`/api/admin/literary-corpus/${target.id}`, {
      method: 'PUT',
      credentials: 'same-origin',
      body: { status: target.reviewStatus, note: target.reviewNote, sentenceText },
    })
    success.value = 'Phrase mise à jour.'
    await loadTargets()
  }
  catch (caught) {
    editableSentenceText.value = target.text
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de modifier la phrase.')
  }
  finally {
    citationRenderVersion.value++
    saving.value = false
    continuePendingSelection()
  }
}

function finishSentenceEdit(event: Event) {
  ;(event.currentTarget as HTMLElement | null)?.blur()
}

function cancelSentenceEdit(event: Event) {
  editableSentenceText.value = selected.value?.text || ''
  citationRenderVersion.value++
  ;(event.currentTarget as HTMLElement | null)?.blur()
}

function cancelTargetEdit(event: Event) {
  editableTargetText.value = selected.value?.targetText || ''
  ;(event.currentTarget as HTMLInputElement | null)?.blur()
}

watch(user, value => { if (value) void loadTargets() }, { immediate: true })
watch([status, confidence, sourceId], () => { void loadTargets(true) })
watch(verbId, () => {
  modeId.value = 0
  tenseId.value = 0
  personId.value = 0
  void loadTargets(true)
})
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { void loadTargets(true) }, 300)
})
watch(() => selected.value?.id, () => {
  editableTargetText.value = selected.value?.targetText || ''
  editableSentenceText.value = selected.value?.text || ''
  citationRenderVersion.value++
}, { immediate: true })
onMounted(() => window.addEventListener('keydown', handleKeyboard))
onBeforeUnmount(() => {
  clearTimeout(searchTimer)
  window.removeEventListener('keydown', handleKeyboard)
})
</script>

<template>
  <AdminAuthBoundary>
    <AdminShell>
      <div class="corpus-admin">
        <header class="corpus-admin__header">
          <div>
            <p class="admin-eyebrow">Citations contextualisées</p>
            <h1>Phrases</h1>
            <p class="admin-muted">Parcourez les phrases à contrôler : passer à la suivante valide automatiquement la phrase courante.</p>
          </div>
          <button class="admin-button admin-button--small" type="button" :disabled="loading" @click="loadTargets()">
            {{ loading ? 'Chargement…' : 'Actualiser' }}
          </button>
        </header>

        <p v-if="error" class="admin-notice admin-notice--error" role="alert">{{ error }}</p>
        <p v-if="success" class="admin-notice admin-notice--success" role="status">{{ success }}</p>

        <section class="corpus-stats" aria-label="État du corpus">
          <button v-for="item in (['candidate', 'validated', 'reserve', 'rejected'] as ReviewStatus[])" :key="item" type="button" :class="{ active: status === item }" @click="status = item">
            <strong>{{ counts[item] }}</strong>
            <span>{{ item === 'candidate' ? 'Candidates' : item === 'validated' ? 'Validées' : item === 'reserve' ? 'En réserve' : 'Rejetées' }}</span>
          </button>
        </section>

        <section class="admin-card corpus-filters">
          <label class="admin-field"><span>Statut</span><select v-model="status"><option value="all">Tous</option><option value="candidate">Candidates</option><option value="validated">Validées</option><option value="reserve">Réserve</option><option value="rejected">Rejetées</option></select></label>
          <label class="admin-field"><span>Confiance</span><select v-model="confidence"><option value="all">Toutes</option><option value="high">Analyse sûre</option><option value="ambiguous">Ambiguë</option></select></label>
          <label class="admin-field">
            <span>Œuvre</span>
            <select v-model.number="sourceId">
              <option :value="0">Toutes les œuvres</option>
              <option v-for="source in sources" :key="source.id" :value="source.id">{{ source.label }} — {{ source.author }}</option>
            </select>
          </label>
          <label class="admin-field corpus-filters__search"><span>Rechercher</span><input v-model="search" type="search" placeholder="Phrase, œuvre ou verbe"></label>
        </section>

        <section class="admin-card phrase-navigation" aria-labelledby="phrase-navigation-title">
          <header>
            <div>
              <p class="admin-eyebrow">Explorer les disponibilités</p>
              <h2 id="phrase-navigation-title">Verbe, mode, temps et personne</h2>
            </div>
            <button v-if="modeId || tenseId || personId" class="admin-button admin-button--small" type="button" @click="resetGrammar">Effacer la sélection grammaticale</button>
          </header>

          <label class="admin-field phrase-navigation__verb">
            <span>Verbe</span>
            <select v-model.number="verbId">
              <option :value="0">Tous les verbes</option>
              <option v-for="verb in verbs" :key="verb.id" :value="verb.id">{{ verb.label }} — {{ verb.count }}</option>
            </select>
            <small>Les verbes ayant des phrases pour la sélection courante apparaissent en premier.</small>
          </label>

          <div class="phrase-navigation__level">
            <h3><span>1</span> Mode</h3>
            <div class="phrase-pills">
              <button type="button" :class="{ active: modeId === 0 }" @click="chooseMode(0)">Tous <strong>{{ modes.reduce((sum, mode) => sum + mode.count, 0) }}</strong></button>
              <button v-for="mode in modes" :key="mode.id" type="button" :class="{ active: modeId === mode.id }" @click="chooseMode(mode.id)">{{ mode.label }} <strong>{{ mode.count }}</strong></button>
            </div>
          </div>

          <div class="phrase-navigation__level" :class="{ muted: !modeId }">
            <h3><span>2</span> Temps</h3>
            <p v-if="!modeId" class="admin-muted">Choisissez d’abord un mode.</p>
            <div v-else class="phrase-pills">
              <button type="button" :class="{ active: tenseId === 0 }" @click="chooseTense(0)">Tous <strong>{{ visibleTenses.reduce((sum, tense) => sum + tense.count, 0) }}</strong></button>
              <button v-for="tense in visibleTenses" :key="tense.id" type="button" :class="{ active: tenseId === tense.id }" @click="chooseTense(tense.id)">{{ tense.label }} <strong>{{ tense.count }}</strong></button>
            </div>
          </div>

          <div class="phrase-navigation__level" :class="{ muted: !tenseId }">
            <h3><span>3</span> Personne</h3>
            <p v-if="!tenseId" class="admin-muted">Choisissez d’abord un temps.</p>
            <div v-else class="phrase-pills">
              <button type="button" :class="{ active: personId === 0 }" @click="choosePerson(0)">Toutes <strong>{{ persons.reduce((sum, person) => sum + person.count, 0) }}</strong></button>
              <button v-for="person in persons" :key="person.id" type="button" :class="{ active: personId === person.id }" @click="choosePerson(person.id)">{{ person.label }} <strong>{{ person.count }}</strong></button>
            </div>
          </div>
        </section>

        <div class="corpus-workspace">
          <aside class="admin-card corpus-list" aria-label="Phrases à examiner">
            <p v-if="targets.length" class="corpus-list__shortcuts">↑↓ valider et parcourir · X rejeter</p>
            <p v-if="loading && !targets.length" class="corpus-empty">Chargement…</p>
            <p v-else-if="!targets.length" class="corpus-empty">Aucune phrase pour ces filtres.</p>
            <div v-for="target in targets" :key="target.id" :data-phrase-id="target.id" class="corpus-list__row" :class="{ selected: selected?.id === target.id }">
              <button class="corpus-list__select" type="button" @click="selectTarget(target.id)">
                <span><strong>{{ target.infinitive }}</strong><small>{{ target.mode }} · {{ target.tense }} · {{ target.pronoun }}</small></span>
                <span>{{ target.text }}</span>
                <em :class="`is-${target.confidence}`">{{ target.confidence === 'high' ? `${target.wordCount} mots` : 'Ambiguë' }}</em>
              </button>
              <button
                class="corpus-list__quick-review"
                :class="{ 'is-restore': target.reviewStatus === 'rejected' }"
                type="button"
                :disabled="saving"
                :title="target.reviewStatus === 'rejected' ? 'Valider cette phrase' : 'Rejeter cette phrase (X)'"
                :aria-label="target.reviewStatus === 'rejected' ? `Valider : ${target.text}` : `Rejeter : ${target.text}`"
                @click="quickToggleStatus(target)"
              >{{ target.reviewStatus === 'rejected' ? '✓' : '×' }}</button>
            </div>
            <nav v-if="total > pageSize" class="corpus-pagination" aria-label="Pagination du corpus">
              <button type="button" :disabled="loading || page === 0" @click="page--; loadTargets()">Précédentes</button>
              <span>{{ page * pageSize + 1 }}–{{ Math.min((page + 1) * pageSize, total) }} sur {{ total }}</span>
              <button type="button" :disabled="loading || (page + 1) * pageSize >= total" @click="page++; loadTargets()">Suivantes</button>
            </nav>
          </aside>

          <article v-if="selected" class="admin-card corpus-detail">
            <header>
              <div>
                <p class="admin-eyebrow">Citation #{{ selected.id }}</p>
                <h2>{{ selected.infinitive }} · {{ selected.mode }} · {{ selected.tense }}</h2>
              </div>
              <span :class="['corpus-confidence', `is-${selected.confidence}`]">{{ selected.confidence === 'high' ? 'Analyse sûre' : 'Analyse ambiguë' }}</span>
            </header>

            <blockquote
              :key="`${selected.id}-${citationRenderVersion}`"
              class="corpus-editable-quote"
              contenteditable="plaintext-only"
              role="textbox"
              aria-label="Phrase littéraire éditable"
              title="Cliquer pour modifier la phrase"
              spellcheck="true"
              @input="updateEditableSentence"
              @blur="saveSentenceText"
              @keydown.enter.prevent="finishSentenceEdit"
              @keydown.escape.prevent="cancelSentenceEdit"
            ><span>{{ sentenceParts.before }}</span><mark>{{ sentenceParts.target }}</mark><span>{{ sentenceParts.after }}</span></blockquote>
            <p v-if="selected.ambiguityReason" class="admin-notice admin-notice--warning">{{ selected.ambiguityReason }}</p>

            <dl>
              <div>
                <dt><label for="literary-target-text">Forme</label></dt>
                <dd>
                  <input
                    id="literary-target-text"
                    v-model="editableTargetText"
                    class="corpus-inline-edit"
                    type="text"
                    :disabled="saving"
                    title="Cliquer pour modifier la forme ciblée"
                    aria-label="Forme ciblée dans la phrase"
                    @blur="saveTargetText"
                    @keydown.enter.prevent="($event.currentTarget as HTMLInputElement).blur()"
                    @keydown.escape.prevent="cancelTargetEdit"
                  >
                </dd>
              </div>
              <div><dt>Personne</dt><dd>{{ selected.pronoun }}</dd></div>
              <div><dt>Longueur</dt><dd>{{ selected.wordCount }} mots</dd></div>
              <div><dt>Quota</dt><dd>{{ selected.validatedForSelection }}/10 pour ce verbe, ce temps et cette personne</dd></div>
              <div><dt>Source</dt><dd>{{ selected.author }}, <cite>{{ selected.work }}</cite></dd></div>
              <div><dt>Emplacement</dt><dd>{{ [selected.chapter, selected.locator].filter(Boolean).join(' · ') }}</dd></div>
            </dl>
            <a class="corpus-source" :href="selected.sourceUrl" target="_blank" rel="noopener noreferrer">Vérifier dans la source ↗</a>

            <footer>
              <button class="admin-button admin-button--primary" type="button" :disabled="saving" @click="review('validated')">Valider</button>
              <button class="admin-button" type="button" :disabled="saving" @click="review('reserve')">Mettre en réserve</button>
              <button class="admin-button admin-button--danger" type="button" :disabled="saving" @click="review('rejected')">Rejeter</button>
              <button v-if="selected.reviewStatus !== 'candidate'" class="admin-button" type="button" :disabled="saving" @click="review('candidate')">Remettre en attente</button>
            </footer>
          </article>
        </div>
      </div>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.corpus-admin { display: grid; gap: 18px; padding: 18px 4px 8px; }
.corpus-admin__header { display: flex; align-items: end; justify-content: space-between; gap: 20px; }
.corpus-admin h1, .corpus-admin h2 { margin: 4px 0; color: var(--admin-navy); }
.corpus-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.corpus-stats button { display: grid; padding: 14px; text-align: left; color: var(--admin-navy); background: white; border: 1px solid var(--admin-border); border-radius: 12px; cursor: pointer; }
.corpus-stats button.active { border-color: var(--admin-blue); box-shadow: 0 0 0 2px rgb(23 107 135 / 12%); }
.corpus-stats strong { font-size: 1.45rem; }
.corpus-stats span { color: var(--admin-muted); font-size: .82rem; }
.corpus-filters { display: grid; grid-template-columns: 180px 180px minmax(220px, 1fr) minmax(240px, 1fr); gap: 14px; padding: 14px; }
.phrase-navigation { display: grid; gap: 18px; padding: 20px; }
.phrase-navigation > header { display: flex; justify-content: space-between; align-items: end; gap: 16px; }
.phrase-navigation h2 { font-size: 1.15rem; }
.phrase-navigation__verb { max-width: 560px; }
.phrase-navigation__verb small { color: var(--admin-muted); }
.phrase-navigation__level { display: grid; grid-template-columns: 130px minmax(0, 1fr); align-items: start; gap: 14px; padding-top: 14px; border-top: 1px solid var(--admin-border); }
.phrase-navigation__level h3 { display: flex; align-items: center; gap: 8px; margin: 5px 0; color: var(--admin-navy); font-size: .92rem; }
.phrase-navigation__level h3 span { display: grid; width: 24px; height: 24px; place-items: center; color: white; background: var(--admin-blue); border-radius: 50%; font-size: .75rem; }
.phrase-navigation__level.muted h3 span { background: #9bacb5; }
.phrase-pills { display: flex; flex-wrap: wrap; gap: 8px; }
.phrase-pills button { display: inline-flex; align-items: center; gap: 8px; min-height: 36px; padding: 6px 7px 6px 12px; color: var(--admin-navy); background: white; border: 1px solid var(--admin-border); border-radius: 999px; cursor: pointer; }
.phrase-pills button.active { color: white; background: var(--admin-blue); border-color: var(--admin-blue); }
.phrase-pills strong { display: inline-grid; min-width: 24px; height: 24px; padding: 0 6px; place-items: center; color: var(--admin-navy); background: var(--admin-cyan); border-radius: 999px; font-size: .75rem; }
.phrase-pills button.active strong { background: white; }
.corpus-workspace { display: grid; grid-template-columns: minmax(460px, 1.15fr) minmax(430px, 1fr); align-items: start; gap: 18px; }
.corpus-list { max-height: 720px; overflow: auto; padding: 6px; }
.corpus-list__shortcuts { position: sticky; top: -6px; z-index: 2; margin: 0; padding: 7px 10px; color: var(--admin-muted); background: rgb(255 255 255 / 94%); border-bottom: 1px solid var(--admin-border); font-size: .75rem; text-align: right; }
.corpus-list__row { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 34px; align-items: stretch; border-bottom: 1px solid #e2eaf0; }
.corpus-list__row.selected { background: var(--admin-cyan); border-radius: 9px; }
.corpus-list__select { display: grid; width: 100%; grid-template-columns: minmax(120px, .5fr) minmax(210px, 1.5fr) auto; gap: 10px; padding: 11px; align-items: start; text-align: left; color: inherit; background: transparent; border: 0; cursor: pointer; }
.corpus-list__quick-review { align-self: center; display: grid; width: 28px; height: 28px; padding: 0; place-items: center; color: #a63232; background: #fff1f1; border: 1px solid #efc5c5; border-radius: 50%; font-size: 1.2rem; line-height: 1; cursor: pointer; }
.corpus-list__quick-review:hover, .corpus-list__quick-review:focus-visible { color: white; background: #b53939; border-color: #b53939; }
.corpus-list__quick-review.is-restore { color: var(--admin-green); background: #e7f7ee; border-color: #b8e0c8; }
.corpus-list__quick-review.is-restore:hover, .corpus-list__quick-review.is-restore:focus-visible { color: white; background: var(--admin-green); border-color: var(--admin-green); }
.corpus-list__quick-review:disabled { opacity: .45; cursor: wait; }
.corpus-pagination { position: sticky; bottom: 0; display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 10px; background: white; border-top: 1px solid var(--admin-border); font-size: .8rem; }
.corpus-pagination button { padding: 6px 8px; color: var(--admin-blue); background: white; border: 1px solid var(--admin-border); border-radius: 7px; cursor: pointer; }
.corpus-pagination button:disabled { opacity: .45; cursor: default; }
.corpus-list span { display: grid; gap: 3px; }
.corpus-list small { color: var(--admin-muted); }
.corpus-list em { padding: 3px 7px; border-radius: 999px; font-size: .72rem; font-style: normal; white-space: nowrap; }
.is-high { color: var(--admin-green); background: #e7f7ee; }
.is-ambiguous { color: #8a4b08; background: #fff0d9; }
.corpus-empty { padding: 28px; text-align: center; color: var(--admin-muted); }
.corpus-detail { display: grid; gap: 18px; padding: clamp(18px, 3vw, 30px); }
.corpus-detail > header { display: flex; justify-content: space-between; gap: 18px; }
.corpus-confidence { align-self: start; padding: 5px 9px; border-radius: 999px; font-size: .8rem; font-weight: 800; }
.corpus-detail blockquote { margin: 0; padding: 24px; color: var(--admin-navy); background: #f5fafc; border-left: 5px solid var(--admin-blue); border-radius: 8px; font-family: Georgia, serif; font-size: clamp(1.2rem, 2vw, 1.6rem); line-height: 1.65; }
.corpus-editable-quote { cursor: text; outline: 0; }
.corpus-detail mark { padding: 1px 3px; color: inherit; background: #ffe49a; border-radius: 3px; font-weight: 800; }
.corpus-detail dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 18px; margin: 0; }
.corpus-detail dl div { padding-bottom: 9px; border-bottom: 1px solid #e0e8ee; }
.corpus-detail dt { color: var(--admin-muted); font-size: .75rem; font-weight: 800; text-transform: uppercase; }
.corpus-detail dd { margin: 3px 0 0; }
.corpus-inline-edit { display: block; width: 100%; min-width: 0; padding: 0 0 2px; color: inherit; background: transparent; border: 0; border-bottom: 1px solid transparent; border-radius: 0; font: inherit; outline: 0; }
.corpus-inline-edit:hover { border-bottom-color: #b7c8d2; }
.corpus-inline-edit:focus { border-bottom-color: var(--admin-blue); box-shadow: 0 1px 0 var(--admin-blue); }
.corpus-source { color: var(--admin-blue); font-weight: 750; }
.corpus-detail footer { display: flex; flex-wrap: wrap; gap: 9px; }
@media (max-width: 900px) { .corpus-workspace { grid-template-columns: 1fr; } .corpus-list { max-height: 360px; } }
@media (max-width: 650px) { .corpus-stats { grid-template-columns: repeat(2, 1fr); } .corpus-filters, .corpus-detail dl, .phrase-navigation__level { grid-template-columns: 1fr; } .phrase-navigation > header { align-items: start; flex-direction: column; } .corpus-list__select { grid-template-columns: 1fr auto; } .corpus-list__select > span:nth-child(2) { grid-column: 1 / -1; } }
</style>

<script setup lang="ts">
import type { CoachCaractere, CoachHelpBlock, CoachHelpBlockType } from '~~/shared/types/coach'
import type { ConjugationMode, ConjugationTense, ExerciseQuestion, Verb } from '~~/shared/types/conjugation'
import type { CoachHelpContentValues } from '~~/shared/utils/coach-help'
import { automaticCoachHelpApproach, coachHelpQuestionVariables, conditionalCoachHelpBlocks, renderCoachHelpContent, visibleCoachHelpBlocks } from '~~/shared/utils/coach-help'
import { sanitizeCoachHtml } from '~~/shared/utils/safe-html'
import { matchingVerbs, normalizeVerbSearch } from '~~/shared/utils/verb-search'
import { buildRadicalReference } from '~~/shared/utils/radical-reference'
import { randomConjugationPreviews } from '~~/shared/utils/random-conjugation-previews'
import { coachHelpProfile } from '~~/shared/data/coach-help-profiles'
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

interface PreviewConjugation {
  personId: number
  tenseId: number
  conjugaison1: string
  conjugaison2?: string | null
  conjugaison3?: string | null
  pronom: string
}

interface VerbDetail {
  verb: Verb
  conjugations: PreviewConjugation[]
}

interface DiagnosticBlock {
  id: number
  type: CoachHelpBlockType
  title: string
  automaticContentKey: string
  pedagogicalApproach: CoachHelpBlock['explanationApproach']
  renderedHtml: string
  children: DiagnosticBlock[]
}

interface PreviewState {
  id: number
  verb: Verb | null
  verbQuery: string
  suggestionsOpen: boolean
  conjugations: PreviewConjugation[]
  tenseId: number
  personId: number
  loading: boolean
  copyState: 'idle' | 'copied' | 'error'
}

const route = useRoute()
const { user, handleUnauthorized } = useAdminAuth()
const { localePath } = useLanguagePreferences()
const loading = ref(false)
const error = ref('')
const caracteres = ref<CoachCaractere[]>([])
const verbs = ref<Verb[]>([])
const modes = ref<ConjugationMode[]>([])
const tenses = ref<ConjugationTense[]>([])
const previews = ref<PreviewState[]>(Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  verb: null,
  verbQuery: 'manger',
  suggestionsOpen: false,
  conjugations: [],
  tenseId: 0,
  personId: 0,
  loading: false,
  copyState: 'idle',
})))
const detailCache = new Map<number, Promise<VerbDetail>>()
let loaded = false

useHead({ title: 'Aides automatiques — Administration' })

const requestedCaractereId = computed(() => Number(route.query.caractere))
const currentCaractere = computed(() => caracteres.value.find(caractere => caractere.id === requestedCaractereId.value) || null)
const automaticBlocks = computed(() => visibleCoachHelpBlocks(currentCaractere.value?.helpApproach))
const approach = computed(() => automaticCoachHelpApproach(currentCaractere.value?.helpApproach))
const approachLabel = computed(() => coachHelpProfile(approach.value).label)

function normalized(value?: string | null) {
  return normalizeVerbSearch(value || '')
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function tenseFor(state: PreviewState) {
  return tenses.value.find(tense => tense.id === state.tenseId)
}

function modeFor(state: PreviewState) {
  const tense = tenseFor(state)
  return modes.value.find(mode => mode.id === tense?.modeId)
}

function formsFor(state: PreviewState) {
  return state.conjugations.filter(form => form.tenseId === state.tenseId && form.conjugaison1.trim())
}

function currentForm(state: PreviewState) {
  return formsFor(state).find(form => form.personId === state.personId) || formsFor(state)[0]
}

function tenseOptions(state: PreviewState) {
  return tenses.value
    .filter(tense => state.conjugations.some(form => form.tenseId === tense.id && form.conjugaison1.trim()))
    .map((tense) => {
      const modeName = modes.value.find(mode => mode.id === tense.modeId)?.name || 'Autres formes'
      return {
        value: tense.id,
        label: tense.name,
        group: modeName,
        description: modeName,
      }
    })
}

function personOptions(state: PreviewState) {
  const seen = new Set<number>()
  return formsFor(state)
    .filter(form => !seen.has(form.personId) && seen.add(form.personId))
    .map(form => ({ value: form.personId, label: form.pronom || 'Forme non personnelle', description: form.conjugaison1 }))
}

function suggestions(state: PreviewState) {
  if (!normalized(state.verbQuery)) return []
  return matchingVerbs(verbs.value, state.verbQuery).slice(0, 7)
}

function syncPerson(state: PreviewState, preferredPronoun = '') {
  const forms = formsFor(state)
  const selected = forms.find(form => normalized(form.pronom) === normalized(preferredPronoun))
    || forms.find(form => form.personId === state.personId)
    || forms[0]
  if (selected) state.personId = selected.personId
}

function selectTense(state: PreviewState, value: string | number) {
  state.tenseId = Number(value)
  syncPerson(state)
}

function selectPerson(state: PreviewState, value: string | number) {
  state.personId = Number(value)
}

async function verbDetail(verbId: number) {
  if (!detailCache.has(verbId)) {
    detailCache.set(verbId, $fetch<VerbDetail>(`/api/admin/verbes/${verbId}`, { credentials: 'same-origin' }))
  }
  return await detailCache.get(verbId)!
}

async function chooseVerb(state: PreviewState, verb: Verb, options: { modeName?: string, tenseName?: string, compound?: boolean, pronoun?: string } = {}) {
  state.loading = true
  state.suggestionsOpen = false
  state.verbQuery = verb.infinitif
  try {
    const detail = await verbDetail(verb.id)
    state.verb = { ...verb, ...clone(detail.verb) }
    state.conjugations = clone(detail.conjugations)
    const requestedMode = options.modeName
      ? modes.value.find(mode => normalized(mode.name) === normalized(options.modeName))
      : undefined
    let target = options.tenseName
      ? tenses.value.find(tense => normalized(tense.name) === normalized(options.tenseName)
        && (!requestedMode || tense.modeId === requestedMode.id)
        && state.conjugations.some(form => form.tenseId === tense.id && form.conjugaison1.trim()))
      : tenses.value.find(tense => tense.id === state.tenseId && state.conjugations.some(form => form.tenseId === tense.id && form.conjugaison1.trim()))
    if (!target && options.compound !== undefined) {
      target = tenses.value.find(tense => tense.isCompound === options.compound && state.conjugations.some(form => form.tenseId === tense.id && form.conjugaison1.trim()))
    }
    target ||= tenses.value.find(tense => state.conjugations.some(form => form.tenseId === tense.id && form.conjugaison1.trim()))
    state.tenseId = target?.id || 0
    syncPerson(state, options.pronoun)
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, `Impossible de charger « ${verb.infinitif} ».`)
  } finally {
    state.loading = false
  }
}

function closeSuggestions(state: PreviewState) {
  window.setTimeout(() => { state.suggestionsOpen = false }, 120)
}

function previewQuestion(state: PreviewState): ExerciseQuestion {
  const form = currentForm(state)
  const tense = tenseFor(state)
  const mode = modeFor(state)
  const verb = state.verb
  const accepted = [form?.conjugaison1, form?.conjugaison2, form?.conjugaison3].map(value => value?.trim()).filter((value): value is string => Boolean(value))
  const reference = verb && form ? buildRadicalReference({
    infinitive: verb.infinitif,
    mode: mode?.name || '',
    tense: tense?.name || '',
    personId: form.personId,
    conjugation: form.conjugaison1,
    isCompound: tense?.isCompound,
  }, state.conjugations.map(candidate => {
    const candidateTense = tenses.value.find(item => item.id === candidate.tenseId)
    return {
      mode: modes.value.find(item => item.id === candidateTense?.modeId)?.name || '',
      tense: candidateTense?.name || '',
      personId: candidate.personId,
      pronoun: candidate.pronom,
      form: candidate.conjugaison1,
    }
  })) : undefined
  return {
    titre: verb?.infinitif || '',
    consigne: `${form?.pronom || ''} | ${verb?.infinitif || ''} | ${tense?.name || ''}`,
    reponses: accepted,
    reponsesPourCorrige: accepted.map(answer => `${form?.pronom || ''} ${answer}`.trim()),
    verbeId: verb?.id,
    tenseId: tense?.id,
    personId: form?.personId,
    infinitif: verb?.infinitif || '',
    pronom: form?.pronom || '',
    saisiePrefixe: form?.pronom || '',
    temps: tense?.name || '',
    mode: mode?.name || '',
    isCompound: Boolean(tense?.isCompound),
    conjugaison1: form?.conjugaison1 || '',
    conjugaison2: form?.conjugaison2 || null,
    conjugaison3: form?.conjugaison3 || null,
    nousForm: state.conjugations.find(candidate => candidate.tenseId === tense?.id && candidate.personId === 7)?.conjugaison1 || null,
    ...(reference ? { radicalReference: reference } : {}),
  }
}

function previewValues(state: PreviewState): CoachHelpContentValues {
  const question = previewQuestion(state)
  const verb = state.verb
  const tense = tenseFor(state)
  return {
    coach: { firstName: 'Aperçu' },
    definition: verb?.meaning || '',
    helpTitle: `${verb?.infinitif || 'Verbe'} · ${tense?.name || 'temps'}${modeFor(state)?.name ? ` (${modeFor(state)!.name.toLocaleLowerCase('fr')})` : ''}`,
    ...coachHelpQuestionVariables(question, verb || undefined, tense),
  }
}

function diagnosticBlock(block: CoachHelpBlock, values: CoachHelpContentValues): DiagnosticBlock {
  const isDefinition = block.content.trim() === '{definitionHelp}'
  const isContextual = block.content.trim() === '{contextualBaseHelp}'
  return {
    id: block.id,
    type: block.type,
    title: isDefinition ? 'Définition' : isContextual ? '' : block.title,
    automaticContentKey: block.content,
    pedagogicalApproach: block.explanationApproach,
    renderedHtml: sanitizeCoachHtml(renderCoachHelpContent(block.content, values, block.explanationApproach)),
    children: (block.children || []).filter(child => child.isActive).map(child => diagnosticBlock(child, values)),
  }
}

function previewDiagnostic(state: PreviewState) {
  const question = previewQuestion(state)
  const values = previewValues(state)
  const blocks = [
    ...automaticBlocks.value.filter(block => block.isActive),
    ...conditionalCoachHelpBlocks(approach.value, values),
  ]
  return {
    schemaVersion: 1,
    caractere: currentCaractere.value ? {
      id: currentCaractere.value.id,
      name: currentCaractere.value.masculineName,
      icon: currentCaractere.value.emoticon,
    } : null,
    help: {
      pedagogicalApproach: approach.value,
      structure: 'fully-automatic',
    },
    selection: {
      verb: state.verb,
      mode: modeFor(state) || null,
      tense: tenseFor(state) || null,
      person: currentForm(state) || null,
    },
    question,
    calculatedVariables: values,
    renderedHelp: {
      header: {
        kicker: 'Aide',
        title: renderCoachHelpContent('{helpTitle}', values),
        descriptionHtml: '',
      },
      blocks: blocks.map(block => diagnosticBlock(block, values)),
    },
  }
}

async function writeClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('Copie impossible')
}

async function copyPreviewJson(state: PreviewState) {
  try {
    await writeClipboard(JSON.stringify(previewDiagnostic(state), null, 2))
    state.copyState = 'copied'
  } catch {
    state.copyState = 'error'
  }
  window.setTimeout(() => { state.copyState = 'idle' }, 1800)
}

async function openVerification() {
  if (!currentCaractere.value) return
  await navigateTo({ path: localePath('/admin/help-verification'), query: { caractere: requestedCaractereId.value } })
}

async function prepareRandomPreviews() {
  if (!verbs.value.length) throw new Error('Aucun verbe disponible')
  const firstVerbIndex = Math.floor(Math.random() * verbs.value.length)
  let selectedVerb: Verb | undefined
  let randomForms: ReturnType<typeof randomConjugationPreviews> = []
  for (let offset = 0; offset < verbs.value.length; offset += 1) {
    const candidate = verbs.value[(firstVerbIndex + offset) % verbs.value.length]!
    const detail = await verbDetail(candidate.id)
    const candidateForms = randomConjugationPreviews(modes.value, tenses.value, detail.conjugations, previews.value.length)
    if (candidateForms.length < previews.value.length) continue
    selectedVerb = candidate
    randomForms = candidateForms
    break
  }
  if (!selectedVerb) throw new Error('Aucun verbe ne possède au moins quatre modes disponibles.')
  await Promise.all(previews.value.map((state, index) => chooseVerb(state, selectedVerb, randomForms[index]!)))
}

async function reloadPreviews() {
  loading.value = true
  error.value = ''
  try {
    await prepareRandomPreviews()
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de tirer quatre nouvelles formes.')
  } finally {
    loading.value = false
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    if (!Number.isInteger(requestedCaractereId.value) || requestedCaractereId.value < 1) {
      await navigateTo(localePath('/admin/caracteres'))
      return
    }
    const [caractereResponse, catalogue] = await Promise.all([
      $fetch<{ caracteres: CoachCaractere[] }>('/api/admin/coach-caracteres'),
      $fetch<{ verbes: Verb[], modes: ConjugationMode[], temps: ConjugationTense[] }>('/api/catalogue'),
    ])
    caracteres.value = caractereResponse.caracteres
    verbs.value = catalogue.verbes.filter(verb => verb.id > 0)
    modes.value = catalogue.modes
    tenses.value = catalogue.temps
    if (!currentCaractere.value) throw new Error('Caractère introuvable')
    await prepareRandomPreviews()
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de préparer les aperçus automatiques.')
  } finally {
    loading.value = false
  }
}

watch(user, (current) => {
  if (current && !loaded) { loaded = true; void load() }
  if (!current) loaded = false
}, { immediate: true })
</script>

<template>
  <AdminAuthBoundary><AdminShell><main class="automatic-help-admin">
    <header class="admin-section-heading automatic-help-heading">
      <div>
        <p class="admin-eyebrow">Aide entièrement automatique</p>
        <h1>{{ currentCaractere ? `${currentCaractere.emoticon} ${currentCaractere.masculineName}` : 'Aides' }}</h1>
        <p>Le script choisit les blocs et leur contenu selon le verbe, le temps et la personne.</p>
      </div>
      <div class="automatic-help-heading__actions">
        <span class="automatic-help-approach">{{ approachLabel }}</span>
        <NuxtLink v-if="currentCaractere" class="admin-button admin-button--small" :to="{ path: localePath('/admin/caracteres'), query: { caractere: currentCaractere.id } }">Retour au caractère</NuxtLink>
        <button class="admin-button admin-button--small automatic-help-reload" type="button" :disabled="loading || !currentCaractere" @click="reloadPreviews">Recharger</button>
        <button class="admin-button automatic-help-verify" type="button" :disabled="loading || !currentCaractere" @click="openVerification">Vérifier cette aide</button>
      </div>
    </header>

    <p v-if="error" class="admin-notice admin-notice--error">{{ error }}</p>
    <section v-if="loading" class="admin-card automatic-help-loading">Préparation des quatre formes de comparaison…</section>

    <section v-else class="automatic-preview-scroll" aria-label="Comparaison de quatre formes conjuguées">
      <div class="automatic-preview-grid">
        <article v-for="(state, index) in previews" :key="state.id" class="automatic-preview-column">
          <header>
            <span>Forme {{ index + 1 }}</span>
            <div>
              <strong>{{ tenseFor(state)?.isCompound ? 'Temps composé' : 'Temps simple' }}</strong>
              <button type="button" :class="{ 'is-copied': state.copyState === 'copied', 'is-error': state.copyState === 'error' }" :disabled="state.loading || !state.verb" @click="copyPreviewJson(state)">
                {{ state.copyState === 'copied' ? '✓ JSON copié' : state.copyState === 'error' ? 'Copie impossible' : 'Copier le JSON' }}
              </button>
            </div>
          </header>

          <div class="automatic-preview-controls">
            <label class="automatic-verb-picker">
              <span>Verbe</span>
              <div>
                <input v-model="state.verbQuery" type="search" autocomplete="off" :aria-expanded="state.suggestionsOpen" @focus="state.suggestionsOpen = true" @input="state.suggestionsOpen = true" @blur="closeSuggestions(state)">
                <ul v-if="state.suggestionsOpen && suggestions(state).length">
                  <li v-for="verb in suggestions(state)" :key="verb.id"><button type="button" @mousedown.prevent="chooseVerb(state, verb)"><strong>{{ verb.infinitif }}</strong><small>{{ verb.meaning || 'Définition à compléter' }}</small></button></li>
                </ul>
              </div>
            </label>
            <AdminCustomSelect :model-value="state.tenseId" :options="tenseOptions(state)" label="Temps" placeholder="Choisir un temps" @update:model-value="selectTense(state, $event)" />
            <AdminCustomSelect :model-value="state.personId" :options="personOptions(state)" label="Personne" placeholder="Choisir une personne" @update:model-value="selectPerson(state, $event)" />
          </div>

          <div v-if="state.loading" class="automatic-preview-wait">Chargement de la conjugaison…</div>
          <CoachHelpPanel v-else-if="state.verb && currentForm(state)" :blocks="automaticBlocks" :values="previewValues(state)" header-title="{helpTitle}" header-description="" :question-number="index + 1" coach-color="#35688f" embedded />
        </article>
      </div>
    </section>
  </main></AdminShell></AdminAuthBoundary>
</template>

<style scoped>
.automatic-help-admin{display:grid;min-width:0;gap:18px}.automatic-help-heading p{max-width:760px;margin:5px 0 0;color:var(--admin-muted)}.automatic-help-heading__actions{display:flex;align-items:center;justify-content:flex-end;gap:9px;flex-wrap:wrap}.automatic-help-approach{padding:7px 10px;border-radius:9px;color:#176783;background:#e5f3f6;font-size:.76rem;font-weight:850}.automatic-help-reload{color:var(--admin-blue);border-color:var(--admin-border);background:var(--admin-surface,#fff)}.automatic-help-reload:disabled{cursor:not-allowed;opacity:.55}.automatic-help-verify{color:#176783;border-color:#7db8c8;background:#e8f5f8}.automatic-help-loading{padding:24px;color:var(--admin-muted)}.automatic-preview-scroll{width:100%;padding-bottom:12px;overflow-x:auto}.automatic-preview-grid{display:grid;width:100%;min-width:1380px;grid-template-columns:repeat(4,minmax(330px,1fr));align-items:start;gap:14px}.automatic-preview-column{display:grid;min-width:0;padding:12px;border:1px solid var(--admin-border);border-radius:17px;gap:12px;background:color-mix(in srgb,var(--admin-surface,#fff) 94%,#dceff1)}.automatic-preview-column>header{display:flex;align-items:center;justify-content:space-between;gap:8px}.automatic-preview-column>header>div{display:flex;align-items:center;justify-content:flex-end;gap:6px}.automatic-preview-column>header span{color:var(--admin-blue);font-size:.72rem;font-weight:900;letter-spacing:.06em;text-transform:uppercase}.automatic-preview-column>header strong{padding:4px 7px;border-radius:999px;color:var(--admin-muted);background:#edf3f4;font-size:.66rem}.automatic-preview-column>header button{padding:6px 8px;border:1px solid #87b8c3;border-radius:8px;color:#176783;background:#e7f4f6;cursor:pointer;font-size:.66rem;font-weight:850}.automatic-preview-column>header button:hover:not(:disabled),.automatic-preview-column>header button:focus-visible{background:#d7edf1}.automatic-preview-column>header button:disabled{cursor:not-allowed;opacity:.5}.automatic-preview-column>header button.is-copied{color:#176246;border-color:#81bea5;background:#e1f4eb}.automatic-preview-column>header button.is-error{color:#9c302a;border-color:#dfa19c;background:#fbe9e7}.automatic-preview-controls{display:grid;grid-template-columns:1fr 1fr;gap:8px}.automatic-verb-picker{position:relative;display:grid;grid-column:1/-1;gap:5px;color:var(--admin-muted);font-size:.72rem;font-weight:800}.automatic-verb-picker>div{position:relative}.automatic-verb-picker input{width:100%;padding:10px 11px;border:1px solid var(--admin-border);border-radius:9px;color:var(--admin-navy);background:white;font:inherit}.automatic-verb-picker ul{position:absolute;z-index:20;top:calc(100% + 4px);right:0;left:0;max-height:260px;margin:0;padding:5px;overflow:auto;border:1px solid var(--admin-border);border-radius:10px;background:white;box-shadow:0 12px 28px rgb(18 56 70 / 18%);list-style:none}.automatic-verb-picker li button{display:grid;width:100%;padding:8px 9px;border:0;border-radius:7px;gap:2px;color:var(--admin-navy);background:transparent;text-align:left;cursor:pointer}.automatic-verb-picker li button:hover{background:#e6f3f5}.automatic-verb-picker li small{color:var(--admin-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.automatic-preview-wait{display:grid;min-height:720px;place-items:center;color:var(--admin-muted)}
:global(:root[data-theme='dark'] .automatic-help-approach){color:#aee0eb;background:#203d45}:global(:root[data-theme='dark'] .automatic-help-verify){color:#bce8f0;border-color:#4d8290;background:#203b43}:global(:root[data-theme='dark'] .automatic-preview-column){border-color:#40575f;background:#17292e}:global(:root[data-theme='dark'] .automatic-preview-column>header strong){color:#bdd0d4;background:#22373c}:global(:root[data-theme='dark'] .automatic-preview-column>header button){color:#b9e2e9;border-color:#497884;background:#213b42}:global(:root[data-theme='dark'] .automatic-preview-column>header button:hover:not(:disabled)),:global(:root[data-theme='dark'] .automatic-preview-column>header button:focus-visible){background:#2a4a52}:global(:root[data-theme='dark'] .automatic-preview-column>header button.is-copied){color:#b9ead5;border-color:#467c67;background:#204438}:global(:root[data-theme='dark'] .automatic-preview-column>header button.is-error){color:#ffc2bc;border-color:#875552;background:#4b2d2c}:global(:root[data-theme='dark'] .automatic-verb-picker input),:global(:root[data-theme='dark'] .automatic-verb-picker ul){color:#d8e7ea;border-color:#49616a;background:#192b30}:global(:root[data-theme='dark'] .automatic-verb-picker li button){color:#d8e7ea}:global(:root[data-theme='dark'] .automatic-verb-picker li button:hover){background:#294149}:global(:root[data-theme='dark'] .automatic-verb-picker li small){color:#aec0c5}
@media(max-width:760px){.automatic-help-heading{align-items:stretch;flex-direction:column}.automatic-help-heading__actions{justify-content:flex-start}.automatic-preview-grid{min-width:1320px}.automatic-preview-controls{grid-template-columns:1fr}}
</style>

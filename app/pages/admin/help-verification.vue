<script setup lang="ts">
import type { CoachCaractere, CoachHelpTemplate } from '~~/shared/types/coach'
import type { ConjugationTense, ExerciseQuestion, Verb } from '~~/shared/types/conjugation'
import type { CoachHelpContentValues } from '~~/shared/utils/coach-help'
import { coachHelpQuestionVariables, visibleCoachHelpBlocks } from '~~/shared/utils/coach-help'
import type { CoachHelpAuditResult } from '~~/shared/utils/coach-help-audit'
import { auditRenderedCoachHelp } from '~~/shared/utils/coach-help-audit'
import { buildRadicalReference } from '~~/shared/utils/radical-reference'
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

interface AuditForm {
  personId: number
  tenseId: number
  modeId: number
  conjugaison1: string
  conjugaison2: string
  conjugaison3: string
  pronoun: string
  tense: string
  mode: string
  isCompound: boolean
}
interface AuditVerb { verb: Verb, conjugations: AuditForm[] }
interface AuditBatch { totalCases: number, totalVerbs: number, verbs: AuditVerb[], nextAfter: number, done: boolean }
interface AuditCase {
  key: string
  verb: Verb
  form: AuditForm
  question: ExerciseQuestion
  tense: ConjugationTense
}
interface StoredResult extends CoachHelpAuditResult {
  key: string
  verb: string
  mode: string
  tense: string
  person: string
  expected: string
  durationMs: number
}
interface SavedAuditSummary {
  fingerprint: string
  status: 'running' | 'interrupted' | 'completed' | 'error'
  processed: number
  totalCases: number
  totalVerbs: number
  passed: number
  warning: number
  failed: number
  elapsedMs: number
  cursorVerbId: number
  cursorFormKeys: string[]
  recentProblems: StoredResult[]
  updatedAt: string
}

const route = useRoute()
const { handleUnauthorized } = useAdminAuth()
const { localePath } = useLanguagePreferences()
const caractereId = computed(() => Number(route.query.caractere))
const caractere = ref<CoachCaractere | null>(null)
const help = computed<CoachHelpTemplate | null>(() => caractere.value ? {
  id: caractere.value.id,
  name: `Aide automatique — ${caractere.value.masculineName}`,
  description: '',
  headerTitle: '{helpTitle}',
  headerDescription: '',
  status: 'draft',
  blocks: visibleCoachHelpBlocks(caractere.value.helpApproach),
} : null)
const caractereName = computed(() => caractere.value ? `${caractere.value.emoticon} ${caractere.value.masculineName}` : '')
const loading = ref(true)
const running = ref(false)
const stopping = ref(false)
const completed = ref(false)
const error = ref('')
const totalCases = ref(0)
const totalVerbs = ref(0)
const processed = ref(0)
const nextAfter = ref(0)
const allLoaded = ref(false)
const queue = ref<AuditCase[]>([])
const currentCase = ref<AuditCase | null>(null)
const results = ref<StoredResult[]>([])
const restoredResults = ref<StoredResult[]>([])
const restoredCounts = ref({ passed: 0, warning: 0, failed: 0 })
const sessionCounts = ref({ passed: 0, warning: 0, failed: 0 })
const recentResults = ref<StoredResult[]>([])
const cursorVerbId = ref(0)
const cursorFormKeys = ref<string[]>([])
const startedAt = ref(0)
const elapsedMs = ref(0)
const resultFilter = ref<'all' | 'problems' | 'failed'>('problems')
const previousRun = ref<SavedAuditSummary | null>(null)
const previewHost = useTemplateRef<HTMLElement>('previewHost')
let stopRequested = false
let activeRequest: AbortController | null = null
let clock: ReturnType<typeof setInterval> | null = null

useHead({ title: 'Vérifier une aide — Administration' })

const progress = computed(() => totalCases.value ? Math.min(100, processed.value / totalCases.value * 100) : 0)
const counts = computed(() => ({
  passed: restoredCounts.value.passed + sessionCounts.value.passed,
  warning: restoredCounts.value.warning + sessionCounts.value.warning,
  failed: restoredCounts.value.failed + sessionCounts.value.failed,
}))
const visibleResults = computed(() => recentResults.value
  .filter(result => resultFilter.value === 'all'
    || (resultFilter.value === 'problems' && result.status !== 'passed')
    || (resultFilter.value === 'failed' && result.status === 'failed'))
  .slice().reverse().slice(0, 250))
const storageKey = computed(() => `coach-help-audit:caractere:${caractereId.value}`)
const auditState = computed(() => {
  if (stopping.value) return { kind: 'running', title: 'Interruption en cours…', detail: 'Le cas en cours se termine avant l’arrêt.' }
  if (running.value) return { kind: 'running', title: 'Vérification en cours', detail: currentCase.value ? `Test de ${currentCase.value.verb.infinitif} · ${currentCase.value.form.tense} · ${currentCase.value.form.pronoun}` : 'Préparation du premier cas…' }
  if (completed.value) return { kind: 'completed', title: 'Vérification terminée', detail: `${processed.value.toLocaleString('fr-CH')} formes ont été contrôlées.` }
  if (error.value && processed.value) return { kind: 'error', title: 'Vérification arrêtée par une erreur', detail: error.value }
  if (processed.value) return { kind: 'interrupted', title: 'Vérification interrompue', detail: `${(totalCases.value - processed.value).toLocaleString('fr-CH')} formes restent à contrôler. Tu peux reprendre.` }
  return { kind: 'ready', title: 'Prête à démarrer', detail: 'Aucune forme n’est en cours de vérification.' }
})
const remainingLabel = computed(() => {
  if (completed.value) return 'Vérification terminée'
  if (!running.value) return processed.value ? 'Vérification interrompue' : 'Prête à démarrer'
  if (!processed.value || !elapsedMs.value) return 'Estimation après les premiers cas…'
  if (processed.value >= totalCases.value) return 'Finalisation…'
  const remainingMs = elapsedMs.value / processed.value * (totalCases.value - processed.value)
  const minutes = Math.floor(remainingMs / 60_000)
  const seconds = Math.max(0, Math.round(remainingMs % 60_000 / 1000))
  return minutes ? `Environ ${minutes} min ${seconds} s restantes` : `Environ ${seconds} s restantes`
})

function saveAuditSummary(status: SavedAuditSummary['status']) {
  if (!import.meta.client || !totalCases.value) return
  const summary: SavedAuditSummary = {
    fingerprint: auditFingerprint(),
    status,
    processed: processed.value,
    totalCases: totalCases.value,
    totalVerbs: totalVerbs.value,
    passed: counts.value.passed,
    warning: counts.value.warning,
    failed: counts.value.failed,
    elapsedMs: elapsedMs.value,
    cursorVerbId: cursorVerbId.value,
    cursorFormKeys: cursorFormKeys.value,
    recentProblems: recentResults.value.filter(result => result.status !== 'passed').slice(-250),
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(storageKey.value, JSON.stringify(summary))
  previousRun.value = summary
}

function loadAuditSummary(): SavedAuditSummary | null {
  if (!import.meta.client) return null
  try {
    const stored = localStorage.getItem(storageKey.value)
    if (!stored) return null
    const summary = JSON.parse(stored) as SavedAuditSummary
    if (summary && Number.isFinite(summary.totalCases) && summary.updatedAt) {
      previousRun.value = summary
      return summary
    }
  } catch {
    localStorage.removeItem(storageKey.value)
  }
  return null
}

function previousRunLabel(summary: SavedAuditSummary) {
  const date = new Intl.DateTimeFormat('fr-CH', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(summary.updatedAt))
  const state = summary.status === 'completed' ? 'terminée' : summary.status === 'error' ? 'arrêtée par une erreur' : 'interrompue'
  return `Dernière vérification ${state} le ${date}`
}
const currentValues = computed<CoachHelpContentValues>(() => {
  const item = currentCase.value
  if (!item) return { coach: { firstName: 'Audit' } }
  return {
    coach: { firstName: 'Audit' },
    definition: item.verb.meaning || '',
    helpTitle: `${item.verb.infinitif} · ${item.form.tense} (${item.form.mode.toLocaleLowerCase('fr')})`,
    ...coachHelpQuestionVariables(item.question, item.verb, item.tense),
  }
})
const automaticBlocks = computed(() => visibleCoachHelpBlocks(help.value))

function auditFingerprint() {
  const source = JSON.stringify({ version: 3, blocks: automaticBlocks.value })
  let hash = 2166136261
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

function makeCase(entry: AuditVerb, form: AuditForm): AuditCase {
  const accepted = [form.conjugaison1, form.conjugaison2, form.conjugaison3].map(value => value.trim()).filter(Boolean)
  const reference = buildRadicalReference({
    infinitive: entry.verb.infinitif,
    mode: form.mode,
    tense: form.tense,
    personId: form.personId,
    conjugation: form.conjugaison1,
    isCompound: form.isCompound,
  }, entry.conjugations.map(candidate => ({
    mode: candidate.mode, tense: candidate.tense, personId: candidate.personId,
    pronoun: candidate.pronoun, form: candidate.conjugaison1,
  })))
  const question: ExerciseQuestion = {
    titre: entry.verb.infinitif,
    consigne: `${form.pronoun} | ${entry.verb.infinitif} | ${form.tense} (${form.mode})`,
    reponses: accepted,
    reponsesPourCorrige: accepted.map(answer => `${form.pronoun} ${answer}`.trim()),
    verbeId: entry.verb.id,
    tenseId: form.tenseId,
    personId: form.personId,
    infinitif: entry.verb.infinitif,
    pronom: form.pronoun,
    saisiePrefixe: form.pronoun,
    temps: form.tense,
    mode: form.mode,
    isCompound: form.isCompound,
    conjugaison1: form.conjugaison1,
    conjugaison2: form.conjugaison2 || null,
    conjugaison3: form.conjugaison3 || null,
    nousForm: entry.conjugations.find(candidate => candidate.tenseId === form.tenseId && candidate.personId === 7)?.conjugaison1 || null,
    ...(reference ? { radicalReference: reference } : {}),
  }
  return {
    key: `${entry.verb.id}:${form.tenseId}:${form.personId}`,
    verb: entry.verb,
    form,
    question,
    tense: {
      id: form.tenseId, modeId: form.modeId, name: form.tense, isCompound: form.isCompound, selected: true,
      mode: { id: form.modeId, name: form.mode, order: 0 },
    },
  }
}

async function fetchBatch() {
  activeRequest = new AbortController()
  try {
    const batch = await $fetch<AuditBatch>(`/api/admin/coach-caracteres/${caractereId.value}/audit-cases`, {
      query: { after: nextAfter.value, limit: 8 },
      signal: activeRequest.signal,
      credentials: 'same-origin',
    })
    totalCases.value = batch.totalCases
    totalVerbs.value = batch.totalVerbs
    nextAfter.value = batch.nextAfter
    allLoaded.value = batch.done
    const alreadyProcessed = new Set(cursorFormKeys.value)
    queue.value.push(...batch.verbs.flatMap(entry => entry.conjugations
      .map(form => makeCase(entry, form))
      .filter(item => entry.verb.id !== cursorVerbId.value || !alreadyProcessed.has(item.key))))
  } finally {
    activeRequest = null
  }
}

function nextPaint() {
  return new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}

async function runAudit() {
  if (running.value || !help.value) return
  if (completed.value) resetAudit()
  running.value = true
  stopping.value = false
  stopRequested = false
  error.value = ''
  startedAt.value = Date.now() - elapsedMs.value
  saveAuditSummary('running')
  clock = setInterval(() => { elapsedMs.value = Date.now() - startedAt.value }, 500)
  try {
    while (!stopRequested) {
      if (!queue.value.length) {
        if (allLoaded.value) break
        await fetchBatch()
        if (!queue.value.length && allLoaded.value) break
      }
      const item = queue.value.shift()
      if (!item) continue
      currentCase.value = item
      const caseStartedAt = performance.now()
      await nextTick()
      await nextPaint()
      if (stopRequested) {
        queue.value.unshift(item)
        break
      }
      const verdict = auditRenderedCoachHelp({
        renderedHtml: previewHost.value?.innerHTML || '',
        blocks: automaticBlocks.value,
        question: item.question,
        verb: item.verb,
        tense: item.tense,
      })
      const storedResult: StoredResult = {
        ...verdict,
        key: item.key,
        verb: item.verb.infinitif,
        mode: item.form.mode,
        tense: item.form.tense,
        person: item.form.pronoun,
        expected: item.form.conjugaison1,
        durationMs: Math.round(performance.now() - caseStartedAt),
      }
      results.value.push(storedResult)
      recentResults.value = [...recentResults.value, storedResult].slice(-250)
      sessionCounts.value[storedResult.status] += 1
      if (cursorVerbId.value !== item.verb.id) {
        cursorVerbId.value = item.verb.id
        cursorFormKeys.value = []
      }
      cursorFormKeys.value.push(item.key)
      processed.value += 1
      elapsedMs.value = Date.now() - startedAt.value
      if (processed.value % 10 === 0) saveAuditSummary('running')
      if (processed.value % 12 === 0) await new Promise(resolve => window.setTimeout(resolve, 0))
    }
    completed.value = !stopRequested && allLoaded.value && queue.value.length === 0
  } catch (caught) {
    if (!stopRequested && !handleUnauthorized(caught)) {
      error.value = getAdminErrorMessage(caught, 'La vérification a été interrompue par une erreur.')
      saveAuditSummary('error')
    }
  } finally {
    running.value = false
    stopping.value = false
    if (clock) clearInterval(clock)
    clock = null
    if (startedAt.value) elapsedMs.value = Date.now() - startedAt.value
    if (completed.value) saveAuditSummary('completed')
    else if (stopRequested) saveAuditSummary('interrupted')
  }
}

function stopAudit() {
  if (!running.value) return
  stopping.value = true
  stopRequested = true
  activeRequest?.abort()
}

function resetAudit() {
  stopAudit()
  processed.value = 0
  nextAfter.value = 0
  allLoaded.value = false
  queue.value = []
  currentCase.value = null
  results.value = []
  restoredResults.value = []
  restoredCounts.value = { passed: 0, warning: 0, failed: 0 }
  sessionCounts.value = { passed: 0, warning: 0, failed: 0 }
  recentResults.value = []
  cursorVerbId.value = 0
  cursorFormKeys.value = []
  completed.value = false
  elapsedMs.value = 0
  startedAt.value = 0
  if (import.meta.client) localStorage.removeItem(storageKey.value)
  previousRun.value = null
}

function exportReport() {
  if (!results.value.length) return
  const payload = JSON.stringify({
    help: help.value?.name,
    generatedAt: new Date().toISOString(),
    processed: processed.value,
    totalCases: totalCases.value,
    counts: counts.value,
    results: [...restoredResults.value, ...results.value],
  }, null, 2)
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `audit-aide-caractere-${caractereId.value}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    if (!Number.isInteger(caractereId.value) || caractereId.value < 1) throw new Error('Caractère invalide')
    const caractereResponse = await $fetch<{ caracteres: CoachCaractere[] }>('/api/admin/coach-caracteres', { credentials: 'same-origin' })
    caractere.value = caractereResponse.caracteres.find(item => item.id === caractereId.value) || null
    if (!caractere.value) throw new Error('Caractère introuvable')
    const saved = loadAuditSummary()
    const canResume = saved
      && saved.fingerprint === auditFingerprint()
      && saved.status !== 'completed'
      && saved.processed > 0
      && saved.processed < saved.totalCases
      && saved.cursorVerbId > 0
    if (canResume) {
      processed.value = saved.processed
      elapsedMs.value = saved.elapsedMs || 0
      restoredCounts.value = { passed: saved.passed, warning: saved.warning, failed: saved.failed }
      restoredResults.value = Array.isArray(saved.recentProblems) ? saved.recentProblems : []
      recentResults.value = restoredResults.value
      cursorVerbId.value = saved.cursorVerbId
      cursorFormKeys.value = Array.isArray(saved.cursorFormKeys) ? saved.cursorFormKeys : []
      nextAfter.value = Math.max(0, saved.cursorVerbId - 1)
    }
    await fetchBatch()
    if (canResume && saved.totalCases !== totalCases.value) {
      resetAudit()
      await fetchBatch()
    }
  } catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de préparer la vérification.')
  } finally {
    loading.value = false
  }
}

onMounted(load)
function persistBeforeLeaving() {
  if (processed.value && !completed.value) saveAuditSummary('interrupted')
}
onMounted(() => window.addEventListener('beforeunload', persistBeforeLeaving))
onBeforeUnmount(() => {
  stopRequested = true
  activeRequest?.abort()
  if (clock) clearInterval(clock)
  persistBeforeLeaving()
  window.removeEventListener('beforeunload', persistBeforeLeaving)
})
</script>

<template>
  <AdminAuthBoundary><AdminShell>
    <main class="help-audit">
      <header class="admin-section-heading audit-heading">
        <div><p class="admin-eyebrow">Vérification exhaustive</p><h1>{{ help?.name || 'Aide' }}</h1><p v-if="caractereName">{{ caractereName }}</p></div>
        <div class="audit-heading__actions">
          <NuxtLink class="admin-button admin-button--small" :to="{ path: localePath('/admin/helps'), query: { caractere: caractereId } }">Retour à l’aide</NuxtLink>
          <button class="admin-button admin-button--small" type="button" :disabled="!results.length" @click="exportReport">Exporter le rapport</button>
        </div>
      </header>

      <p v-if="error" class="admin-error">{{ error }}</p>
      <section v-if="loading" class="admin-card audit-loading">Préparation des verbes et des conjugaisons…</section>
      <template v-else-if="help">
        <section class="admin-card audit-control">
          <div class="audit-control__top">
            <div><p class="admin-eyebrow">Progression</p><strong>{{ processed.toLocaleString('fr-CH') }} / {{ totalCases.toLocaleString('fr-CH') }} formes</strong><small>{{ totalVerbs.toLocaleString('fr-CH') }} verbes dans la base · {{ remainingLabel }}</small></div>
            <div class="audit-control__buttons">
              <button v-if="!running" class="admin-button audit-start" type="button" @click="runAudit">{{ completed ? 'Relancer la vérification' : processed ? 'Reprendre' : 'Lancer la vérification' }}</button>
              <button v-else class="admin-button admin-button--danger" type="button" :disabled="stopping" @click="stopAudit">{{ stopping ? 'Interruption…' : 'Interrompre' }}</button>
              <button class="admin-button admin-button--small" type="button" :disabled="running || !processed" @click="resetAudit">Recommencer</button>
            </div>
          </div>
          <div class="audit-state" :class="`is-${auditState.kind}`" role="status" aria-live="polite">
            <span class="audit-state__icon" aria-hidden="true">{{ auditState.kind === 'completed' ? '✓' : auditState.kind === 'error' ? '!' : auditState.kind === 'interrupted' ? 'Ⅱ' : auditState.kind === 'running' ? '●' : '○' }}</span>
            <div><strong>{{ auditState.title }}</strong><span>{{ auditState.detail }}</span></div>
          </div>
          <div v-if="!processed && previousRun" class="audit-previous">
            <div><strong>{{ previousRunLabel(previousRun) }}</strong><span>{{ previousRun.processed.toLocaleString('fr-CH') }} / {{ previousRun.totalCases.toLocaleString('fr-CH') }} formes · {{ previousRun.passed }} conformes · {{ previousRun.warning }} à examiner · {{ previousRun.failed }} erreurs</span></div>
            <small>Ce résumé est conservé après le rechargement de la page. Lance une nouvelle vérification pour obtenir le détail.</small>
          </div>
          <div class="audit-progress" role="progressbar" :aria-valuenow="Math.round(progress)" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${progress}%` }" /></div>
          <div class="audit-stats">
            <span class="is-passed"><strong>{{ counts.passed }}</strong> conformes</span>
            <span class="is-warning"><strong>{{ counts.warning }}</strong> à examiner</span>
            <span class="is-failed"><strong>{{ counts.failed }}</strong> erreurs</span>
            <span><strong>{{ progress.toFixed(1) }} %</strong> terminé</span>
          </div>
        </section>

        <div class="audit-workspace">
          <section class="admin-card audit-results">
            <div class="audit-section-title"><div><p class="admin-eyebrow">Résultats</p><h2>Contrôles automatiques</h2></div><select v-model="resultFilter" aria-label="Filtrer les résultats"><option value="problems">À examiner</option><option value="failed">Erreurs seulement</option><option value="all">Tous les cas</option></select></div>
            <p class="audit-note">Ce contrôle rapide vérifie le rendu et les incohérences certaines. La campagne sémantique complète mémorisée séparément contrôle aussi les modèles pédagogiques, les irrégularités, les cas suspects et un échantillon régulier avant d’accorder le tag « Approuvé » à un verbe.</p>
            <div v-if="!visibleResults.length" class="audit-empty">{{ processed ? 'Aucun résultat dans ce filtre.' : 'Lance la vérification pour voir les résultats en direct.' }}</div>
            <ol v-else class="audit-result-list">
              <li v-for="result in visibleResults" :key="result.key" :class="`is-${result.status}`">
                <div><strong>{{ result.verb }} · {{ result.tense }}</strong><span>{{ result.mode }} · {{ result.person }} → {{ result.expected }}</span></div>
                <span class="audit-status">{{ result.status === 'passed' ? 'Conforme' : result.status === 'warning' ? 'À examiner' : 'Erreur' }}</span>
                <ul v-if="result.issues.length"><li v-for="item in result.issues" :key="item.code"><strong>{{ item.title }}</strong><span>{{ item.detail }}</span></li></ul>
              </li>
            </ol>
          </section>

          <aside class="audit-live">
            <div class="audit-live__heading"><div><p class="admin-eyebrow">Test en direct</p><h2>{{ currentCase ? `${currentCase.verb.infinitif} · ${currentCase.form.tense}` : 'En attente' }}</h2></div><span v-if="currentCase">{{ currentCase.form.pronoun }} → {{ currentCase.form.conjugaison1 }}</span></div>
            <div ref="previewHost" class="audit-preview">
              <CoachHelpPanel v-if="currentCase" :blocks="automaticBlocks" :values="currentValues" header-title="{helpTitle}" header-description="" :question-number="3" coach-color="#35688f" embedded />
              <div v-else class="audit-preview__empty">Le composant d’aide apparaîtra ici pendant la vérification.</div>
            </div>
          </aside>
        </div>
      </template>
    </main>
  </AdminShell></AdminAuthBoundary>
</template>

<style scoped>
.help-audit{display:grid;gap:18px}.audit-heading p{margin:4px 0 0;color:var(--admin-muted)}.audit-heading__actions,.audit-control__buttons{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.audit-loading{padding:24px;color:var(--admin-muted)}.audit-control{display:grid;padding:20px;gap:16px}.audit-control__top{display:flex;justify-content:space-between;align-items:center;gap:18px}.audit-control__top>div:first-child{display:grid;gap:3px}.audit-control__top strong{color:var(--admin-navy);font-size:1.15rem}.audit-control__top small{color:var(--admin-muted)}.audit-start{color:white;border-color:#26735d;background:#26735d}.audit-state{display:flex;align-items:center;padding:11px 13px;gap:11px;border:1px solid #bfd2d7;border-radius:11px;color:#355761;background:#f0f6f7}.audit-state__icon{display:grid;width:28px;height:28px;flex:0 0 28px;place-items:center;border-radius:50%;color:white;background:#6e8e97;font-weight:900}.audit-state>div,.audit-previous>div{display:grid;gap:2px}.audit-state strong,.audit-previous strong{color:var(--admin-navy);font-size:.84rem}.audit-state span:not(.audit-state__icon),.audit-previous span,.audit-previous small{color:var(--admin-muted);font-size:.74rem}.audit-state.is-running .audit-state__icon{background:#277f96}.audit-state.is-completed{border-color:#a9d4c0;background:#e8f5ee}.audit-state.is-completed .audit-state__icon{background:#32936d}.audit-state.is-interrupted{border-color:#e1ca91;background:#fbf3df}.audit-state.is-interrupted .audit-state__icon{background:#ad7e1d}.audit-state.is-error{border-color:#e2aaa6;background:#fae9e7}.audit-state.is-error .audit-state__icon{background:#b84b45}.audit-previous{display:grid;padding:12px 13px;gap:5px;border-left:4px solid #52899a;border-radius:8px;background:#edf4f6}.audit-progress{height:14px;overflow:hidden;border:1px solid var(--admin-border);border-radius:999px;background:#e8eff1}.audit-progress>span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#257789,#45a27c);transition:width .2s ease-out}.audit-stats{display:flex;gap:9px;flex-wrap:wrap}.audit-stats>span{padding:7px 10px;border-radius:9px;color:var(--admin-muted);background:#edf3f4;font-size:.78rem}.audit-stats .is-passed{color:#286d55;background:#e2f2ea}.audit-stats .is-warning{color:#805e18;background:#f9edcf}.audit-stats .is-failed{color:#923c36;background:#f8dfdc}.audit-workspace{display:grid;grid-template-columns:minmax(520px,1fr) minmax(360px,440px);gap:18px;align-items:start}.audit-results{display:grid;padding:20px;gap:14px}.audit-section-title,.audit-live__heading{display:flex;justify-content:space-between;align-items:center;gap:12px}.audit-section-title h2,.audit-live__heading h2{margin:0;color:var(--admin-navy)}.audit-section-title select{padding:8px 10px;border:1px solid var(--admin-border);border-radius:9px;color:var(--admin-navy);background:white}.audit-note{margin:0;padding:10px 12px;border-radius:9px;color:var(--admin-muted);background:#f0f5f6;font-size:.78rem;line-height:1.45}.audit-empty{padding:30px;color:var(--admin-muted);text-align:center}.audit-result-list{display:grid;max-height:720px;margin:0;padding:0;gap:8px;overflow:auto;list-style:none}.audit-result-list>li{display:grid;padding:11px;border:1px solid var(--admin-border);border-left:5px solid #8da4aa;border-radius:10px;grid-template-columns:minmax(0,1fr) auto;gap:7px;background:#f8fbfb}.audit-result-list>li.is-warning{border-left-color:#c7952e}.audit-result-list>li.is-failed{border-left-color:#bc5048}.audit-result-list>li.is-passed{border-left-color:#4b9879}.audit-result-list>li>div{display:grid;gap:2px}.audit-result-list>li>div span{color:var(--admin-muted);font-size:.75rem}.audit-status{align-self:start;padding:3px 7px;border-radius:999px;color:var(--admin-muted);background:#e7edef;font-size:.66rem;font-weight:850}.audit-result-list ul{display:grid;grid-column:1/-1;margin:3px 0 0;padding:0;gap:5px;list-style:none}.audit-result-list ul li{display:grid;padding:8px 9px;border-radius:8px;gap:2px;color:var(--admin-muted);background:white;font-size:.73rem}.audit-result-list ul strong{color:var(--admin-navy)}.audit-live{position:sticky;top:14px;display:grid;gap:10px}.audit-live__heading{padding:2px 4px}.audit-live__heading>span{color:var(--admin-muted);font-size:.74rem}.audit-preview{min-height:400px}.audit-preview__empty{display:grid;min-height:400px;padding:24px;place-items:center;border:1px dashed var(--admin-border);border-radius:16px;color:var(--admin-muted);text-align:center}
:global(:root[data-theme='dark'] .audit-control),:global(:root[data-theme='dark'] .audit-results){border-color:#40575f;background:#17292e}:global(:root[data-theme='dark'] .audit-control__top strong),:global(:root[data-theme='dark'] .audit-section-title h2),:global(:root[data-theme='dark'] .audit-live__heading h2),:global(:root[data-theme='dark'] .audit-state strong),:global(:root[data-theme='dark'] .audit-previous strong){color:#d5e7ea}:global(:root[data-theme='dark'] .audit-state){color:#c4d5d9;border-color:#425d65;background:#20353b}:global(:root[data-theme='dark'] .audit-state.is-completed){border-color:#396956;background:#1e3b31}:global(:root[data-theme='dark'] .audit-state.is-interrupted){border-color:#685a34;background:#393321}:global(:root[data-theme='dark'] .audit-state.is-error){border-color:#70423f;background:#402725}:global(:root[data-theme='dark'] .audit-previous){border-left-color:#5da4b8;background:#20353b}:global(:root[data-theme='dark'] .audit-progress){border-color:#455e66;background:#20343a}:global(:root[data-theme='dark'] .audit-stats>span){color:#bbccd0;background:#22363b}:global(:root[data-theme='dark'] .audit-stats .is-passed){color:#a6ddc3;background:#203c31}:global(:root[data-theme='dark'] .audit-stats .is-warning){color:#e6c980;background:#3b3322}:global(:root[data-theme='dark'] .audit-stats .is-failed){color:#efaaa5;background:#402726}:global(:root[data-theme='dark'] .audit-section-title select){color:#d6e6e9;border-color:#496169;background:#1b2e33}:global(:root[data-theme='dark'] .audit-note){color:#b3c4c9;background:#20343a}:global(:root[data-theme='dark'] .audit-result-list>li){color:#d8e7e9;border-color:#435b63;background:#1d3035}:global(:root[data-theme='dark'] .audit-result-list ul li){color:#b5c6ca;background:#243a40}:global(:root[data-theme='dark'] .audit-result-list ul strong){color:#dbe9eb}:global(:root[data-theme='dark'] .audit-preview__empty){color:#afc1c5;border-color:#465f67}
@media(max-width:1050px){.audit-workspace{grid-template-columns:1fr}.audit-live{position:static;width:min(460px,100%);justify-self:center}}@media(max-width:680px){.audit-control__top,.audit-heading,.audit-section-title{align-items:stretch;flex-direction:column}.audit-workspace{grid-template-columns:minmax(0,1fr)}.audit-result-list>li{grid-template-columns:1fr}.audit-status{justify-self:start}}
</style>

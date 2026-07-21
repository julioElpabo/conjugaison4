<script setup lang="ts">
import type { CoachHelpBlock } from '~~/shared/types/coach'
import type { CoachHelpContentValues } from '~~/shared/utils/coach-help'
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

type FeedbackType = 'useful' | 'unclear' | 'error' | 'remark'
type ValidationStatus = 'unvalidated' | 'validated'
type ModerationStatus = 'active' | 'removed'

interface AdminHelpFeedback {
  id: number
  feedbackType: FeedbackType
  comment: string | null
  sessionId: string | null
  exerciseRunId: string | null
  questionNumber: number | null
  helpId: number | null
  helpName: string | null
  coachId: number | null
  coachName: string | null
  verbId: number | null
  verb: string | null
  tenseId: number | null
  tense: string | null
  mode: string | null
  person: string | null
  expectedAnswer: string | null
  context: Record<string, unknown> | null
  question: Record<string, unknown> | null
  exerciseContext: Record<string, unknown> | null
  attempts: Array<Record<string, unknown>>
  messages: Array<Record<string, unknown>>
  displayedHelp: {
    header?: { title?: string, descriptionHtml?: string }
    values?: CoachHelpContentValues
    blocks?: Array<Record<string, unknown>>
  } | null
  displayedHelpHtml: string | null
  uiContext: Record<string, unknown> | null
  userAgent: string | null
  validationStatus: ValidationStatus
  validatedAt: string | null
  moderationStatus: ModerationStatus
  moderationNote: string | null
  moderatedAt: string | null
  deletedAt: string | null
  createdAt: string
}

const { user, handleUnauthorized } = useAdminAuth()
const feedbacks = ref<AdminHelpFeedback[]>([])
const selectedId = ref<number | null>(null)
const loading = ref(false)
const saving = ref(false)
const copying = ref(false)
const deletingTreated = ref(false)
const error = ref('')
const success = ref('')
let loaded = false

useHead({ title: 'Feedbacks — Administration' })

const selectedFeedback = computed(() => feedbacks.value.find(item => item.id === selectedId.value) || feedbacks.value[0] || null)
const unvalidatedCount = computed(() => feedbacks.value.filter(item => item.validationStatus === 'unvalidated' && item.moderationStatus === 'active').length)
const validatedCount = computed(() => feedbacks.value.filter(item => item.validationStatus === 'validated' && item.moderationStatus === 'active').length)
const disposableCount = computed(() => feedbacks.value.filter(item => item.validationStatus === 'validated' || item.moderationStatus === 'removed').length)
const removedCount = computed(() => feedbacks.value.filter(item => item.moderationStatus === 'removed').length)
const selectedQuestion = computed(() => selectedFeedback.value?.question || selectedFeedback.value?.context?.currentQuestion as Record<string, unknown> | null || null)
const selectedMessages = computed(() => selectedFeedback.value?.messages || [])
const selectedAttempts = computed(() => selectedFeedback.value?.attempts || [])
const selectedAnswer = computed(() => {
  const selected = selectedFeedback.value
  if (!selected) return ''
  const question = selectedQuestion.value
  const questionId = question?.id
  const matchingAttempt = [...selectedAttempts.value].reverse().find((attempt) => {
    const attemptQuestion = attempt.question as Record<string, unknown> | undefined
    return questionId !== undefined && attemptQuestion?.id === questionId
  }) || selectedAttempts.value.at(-1)
  return String(matchingAttempt?.answer || selected.context?.currentAnswerDraft || '')
})
const selectedHelpBlocks = computed<CoachHelpBlock[]>(() => {
  const blocks = selectedFeedback.value?.displayedHelp?.blocks || []
  return blocks.map((block, index) => snapshotToHelpBlock(block, index)).filter(Boolean) as CoachHelpBlock[]
})
const selectedHelpValues = computed<CoachHelpContentValues>(() => selectedFeedback.value?.displayedHelp?.values || {})
const selectedHelpTitle = computed(() => selectedFeedback.value?.displayedHelp?.header?.title || selectedFeedback.value?.helpName || 'Aide')
const selectedHelpDescription = computed(() => selectedFeedback.value?.displayedHelp?.header?.descriptionHtml || '')

const feedbackLabels: Record<FeedbackType, string> = {
  useful: 'Utile',
  unclear: 'Pas clair',
  error: 'Erreur',
  remark: 'Remarque',
}

function snapshotToHelpBlock(snapshot: Record<string, unknown>, index: number): CoachHelpBlock | null {
  const type = typeof snapshot.type === 'string' && ['normal', 'info', 'success', 'warning', 'danger'].includes(snapshot.type)
    ? snapshot.type as CoachHelpBlock['type']
    : 'normal'
  const children = Array.isArray(snapshot.children)
    ? snapshot.children.map((child, childIndex) => snapshotToHelpBlock(child as Record<string, unknown>, childIndex)).filter(Boolean) as CoachHelpBlock[]
    : []
  return {
    id: Number(snapshot.id) || -100_000 - index,
    type,
    title: typeof snapshot.sourceTitle === 'string' ? snapshot.sourceTitle : typeof snapshot.title === 'string' ? snapshot.title : '',
    content: typeof snapshot.sourceContent === 'string'
      ? snapshot.sourceContent
      : typeof snapshot.renderedHtml === 'string'
        ? snapshot.renderedHtml
        : '',
    explanationApproach: typeof snapshot.explanationApproach === 'string'
      && ['cif-falc', 'concise', 'grammatical-technical', 'guided-discovery'].includes(snapshot.explanationApproach)
      ? snapshot.explanationApproach as CoachHelpBlock['explanationApproach']
      : 'cif-falc',
    isActive: true,
    sortOrder: index + 1,
    children,
  }
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-CH', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function stringify(value: unknown) {
  return JSON.stringify(value, null, 2)
}

function questionLine(feedback: AdminHelpFeedback) {
  return [feedback.person, feedback.verb, feedback.tense, feedback.mode].filter(Boolean).join(' · ') || `Feedback #${feedback.id}`
}

async function loadFeedbacks(keepSelection = true) {
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch<{ feedbacks: AdminHelpFeedback[] }>('/api/admin/coach-help-feedbacks', { credentials: 'same-origin' })
    feedbacks.value = response.feedbacks
    if (keepSelection && selectedId.value && feedbacks.value.some(item => item.id === selectedId.value)) return
    selectedId.value = feedbacks.value[0]?.id || null
  }
  catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de charger les feedbacks.')
  }
  finally {
    loading.value = false
  }
}

async function updateFeedback(action: 'validate' | 'unvalidate' | 'remove' | 'restore') {
  const selected = selectedFeedback.value
  if (!selected || saving.value) return
  let note: string | null = null
  if (action === 'remove') {
    note = window.prompt('Raison du retrait ?', 'Sans valeur exploitable')?.trim() || ''
    if (!note) return
  }
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    await $fetch(`/api/admin/coach-help-feedbacks/${selected.id}`, {
      method: 'PUT',
      credentials: 'same-origin',
      body: { action, note },
    })
    await loadFeedbacks(true)
    success.value = action === 'validate'
      ? 'Feedback validé.'
      : action === 'unvalidate'
        ? 'Feedback remis en non-validé.'
        : action === 'remove'
          ? 'Feedback retiré.'
          : 'Feedback restauré.'
  }
  catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de traiter ce feedback.')
  }
  finally {
    saving.value = false
  }
}

async function copyValidatedFeedbacks() {
  if (copying.value) return
  copying.value = true
  error.value = ''
  success.value = ''
  try {
    const response = await $fetch<{ count: number, prompt: string }>('/api/admin/coach-help-feedbacks/export', {
      credentials: 'same-origin',
    })
    if (!response.prompt) {
      success.value = 'Aucun feedback validé à copier.'
      return
    }
    await navigator.clipboard.writeText(response.prompt)
    success.value = `${response.count} feedback${response.count > 1 ? 's' : ''} validé${response.count > 1 ? 's' : ''} copié${response.count > 1 ? 's' : ''}.`
  }
  catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de copier les feedbacks validés.')
  }
  finally {
    copying.value = false
  }
}

async function deleteTreatedFeedbacks() {
  const count = disposableCount.value
  if (!count || deletingTreated.value) return
  const label = `${count} feedback${count > 1 ? 's' : ''} validé${count > 1 ? 's' : ''} ou retiré${count > 1 ? 's' : ''}`
  if (!window.confirm(`Supprimer définitivement ${label} ?\n\nLes feedbacks validés et les feedbacks retirés seront effacés. Cette action est irréversible.`)) return
  deletingTreated.value = true
  error.value = ''
  success.value = ''
  try {
    const response = await $fetch<{ count: number }>('/api/admin/coach-help-feedbacks/treated', {
      method: 'DELETE',
      credentials: 'same-origin',
      body: { origin: 'user', includeRemoved: true },
    })
    selectedId.value = null
    await loadFeedbacks(false)
    success.value = `${response.count} feedback${response.count > 1 ? 's' : ''} validé${response.count > 1 ? 's' : ''} ou retiré${response.count > 1 ? 's' : ''} supprimé${response.count > 1 ? 's' : ''}.`
  }
  catch (caught) {
    if (!handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de supprimer les feedbacks validés.')
  }
  finally {
    deletingTreated.value = false
  }
}

watch(user, (current) => {
  if (current && !loaded) { loaded = true; void loadFeedbacks(false) }
  if (!current) loaded = false
}, { immediate: true })
</script>

<template>
  <AdminAuthBoundary>
    <AdminShell>
      <main class="feedback-admin">
        <header class="admin-section-heading feedback-admin__heading">
          <div>
            <p class="admin-eyebrow">Retours utilisateurs</p>
            <h1>Feedbacks</h1>
            <p class="admin-muted">Tous les retours sur les aides automatiques, du plus ancien au plus récent.</p>
          </div>
          <div class="feedback-admin__top-actions">
            <button class="admin-button admin-button--danger" type="button" :disabled="deletingTreated || !disposableCount" @click="deleteTreatedFeedbacks">
              {{ deletingTreated ? 'Suppression…' : `Supprimer les feedbacks validés ou retirés (${disposableCount})` }}
            </button>
            <button class="admin-button admin-button--primary" type="button" :disabled="copying" @click="copyValidatedFeedbacks">
              {{ copying ? 'Copie…' : 'Copier tous les feedbacks validés' }}
            </button>
            <button class="admin-button admin-button--small" type="button" :disabled="loading" @click="loadFeedbacks(true)">
              {{ loading ? 'Chargement…' : 'Actualiser' }}
            </button>
          </div>
        </header>

        <p v-if="error" class="admin-notice admin-notice--error">{{ error }}</p>
        <p v-if="success" class="admin-notice admin-notice--success">{{ success }}</p>

        <section class="feedback-admin__summary">
          <span><strong>{{ feedbacks.length }}</strong> feedbacks</span>
          <span><strong>{{ validatedCount }}</strong> validés actifs</span>
          <span><strong>{{ unvalidatedCount }}</strong> non-validés actifs</span>
          <span><strong>{{ removedCount }}</strong> retirés</span>
        </section>

        <div class="feedback-admin__workspace">
          <aside class="admin-card feedback-list" aria-label="Liste des feedbacks">
            <p v-if="loading && !feedbacks.length" class="feedback-empty">Chargement…</p>
            <p v-else-if="!feedbacks.length" class="feedback-empty">Aucun feedback enregistré.</p>
            <button
              v-for="feedback in feedbacks"
              :key="feedback.id"
              type="button"
              :class="[
                'feedback-list__item',
                { 'is-selected': feedback.id === selectedFeedback?.id, 'is-removed': feedback.moderationStatus === 'removed' },
              ]"
              @click="selectedId = feedback.id"
            >
              <span>
                <strong>{{ feedbackLabels[feedback.feedbackType] }}</strong>
                <small>{{ formatDate(feedback.createdAt) }}</small>
              </span>
              <span>
                <b>{{ questionLine(feedback) }}</b>
                <small>{{ feedback.comment || 'Sans commentaire' }}</small>
              </span>
              <em :class="[`is-${feedback.validationStatus}`, `is-${feedback.moderationStatus}`]">
                {{ feedback.moderationStatus === 'removed' ? 'Retiré' : feedback.validationStatus === 'validated' ? 'Validé' : 'Non-validé' }}
              </em>
            </button>
          </aside>

          <section v-if="selectedFeedback" class="feedback-detail">
            <article class="admin-card feedback-panel">
              <header class="feedback-panel__header">
                <div>
                  <p class="admin-eyebrow">Feedback #{{ selectedFeedback.id }}</p>
                  <h2>{{ feedbackLabels[selectedFeedback.feedbackType] }} · {{ questionLine(selectedFeedback) }}</h2>
                  <p class="admin-muted">{{ formatDate(selectedFeedback.createdAt) }} · {{ selectedFeedback.coachName || 'coach inconnu' }} · {{ selectedFeedback.helpName || 'aide inconnue' }}</p>
                </div>
                <div class="feedback-panel__actions">
                  <button
                    v-if="selectedFeedback.validationStatus === 'unvalidated'"
                    class="admin-button admin-button--primary admin-button--small"
                    type="button"
                    :disabled="saving || selectedFeedback.moderationStatus === 'removed'"
                    @click="updateFeedback('validate')"
                  >
                    Valider
                  </button>
                  <button
                    v-else
                    class="admin-button admin-button--small"
                    type="button"
                    :disabled="saving || selectedFeedback.moderationStatus === 'removed'"
                    @click="updateFeedback('unvalidate')"
                  >
                    Remettre non-validé
                  </button>
                  <button
                    v-if="selectedFeedback.moderationStatus === 'active'"
                    class="admin-button admin-button--danger admin-button--small"
                    type="button"
                    :disabled="saving"
                    @click="updateFeedback('remove')"
                  >
                    Supprimer
                  </button>
                  <button
                    v-else
                    class="admin-button admin-button--small"
                    type="button"
                    :disabled="saving"
                    @click="updateFeedback('restore')"
                  >
                    Restaurer
                  </button>
                </div>
              </header>

              <dl class="feedback-facts">
                <div><dt>Statut</dt><dd>{{ selectedFeedback.validationStatus === 'validated' ? 'Validé' : 'Non-validé' }}</dd></div>
                <div><dt>Modération</dt><dd>{{ selectedFeedback.moderationStatus === 'removed' ? 'Retiré' : 'Actif' }}</dd></div>
                <div><dt>Question</dt><dd>{{ selectedFeedback.questionNumber ?? '—' }}</dd></div>
                <div><dt>Session</dt><dd>{{ selectedFeedback.sessionId || '—' }}</dd></div>
              </dl>

              <section class="feedback-section">
                <h3>Commentaire du feedback</h3>
                <p class="feedback-comment">{{ selectedFeedback.comment || 'Aucun commentaire.' }}</p>
              </section>

              <section class="feedback-section">
                <h3>Question demandée</h3>
                <dl class="feedback-question">
                  <div><dt>Personne</dt><dd>{{ selectedFeedback.person || '—' }}</dd></div>
                  <div><dt>Verbe</dt><dd>{{ selectedFeedback.verb || '—' }}</dd></div>
                  <div><dt>Temps</dt><dd>{{ selectedFeedback.tense || '—' }}</dd></div>
                  <div><dt>Mode</dt><dd>{{ selectedFeedback.mode || '—' }}</dd></div>
                  <div><dt>Réponse attendue</dt><dd>{{ selectedFeedback.expectedAnswer || '—' }}</dd></div>
                  <div><dt>Réponse fournie</dt><dd>{{ selectedAnswer || 'Aucune réponse donnée avant le feedback.' }}</dd></div>
                </dl>
                <details>
                  <summary>Objet question complet</summary>
                  <pre>{{ stringify(selectedQuestion) }}</pre>
                </details>
              </section>

              <section class="feedback-section">
                <h3>Messages du chat au moment du feedback</h3>
                <ol v-if="selectedMessages.length" class="feedback-messages">
                  <li v-for="message in selectedMessages" :key="String(message.id)">
                    <strong>{{ message.author === 'coach' ? 'Coach' : 'Utilisateur' }}</strong>
                    <span>{{ message.text || '[média]' }}</span>
                  </li>
                </ol>
                <p v-else class="admin-muted">Aucun message capturé.</p>
              </section>
            </article>

            <article class="admin-card feedback-help-preview">
              <header>
                <div>
                  <p class="admin-eyebrow">Aide fournie</p>
                  <h2>Composant affiché à l’utilisateur</h2>
                </div>
              </header>
              <CoachHelpPanel
                v-if="selectedHelpBlocks.length"
                embedded
                :show-close="false"
                :show-feedback="false"
                :include-automatic-orthography="false"
                :blocks="selectedHelpBlocks"
                :values="selectedHelpValues"
                :header-title="selectedHelpTitle"
                :header-description="selectedHelpDescription"
                :question-number="selectedFeedback.questionNumber || 1"
                coach-color="#176b87"
              />
              <p v-else class="feedback-empty">Aucun composant d’aide capturé pour ce feedback.</p>
            </article>

            <article class="admin-card feedback-raw">
              <details>
                <summary>Données complètes enregistrées</summary>
                <pre>{{ stringify(selectedFeedback) }}</pre>
              </details>
            </article>
          </section>
        </div>
      </main>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.feedback-admin{display:grid;gap:18px}.feedback-admin__heading{align-items:center}.feedback-admin__top-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}.feedback-admin__summary{display:flex;flex-wrap:wrap;gap:9px}.feedback-admin__summary span{padding:8px 11px;border:1px solid var(--admin-border);border-radius:999px;color:var(--admin-muted);background:var(--admin-surface,#fff);font-size:.82rem}.feedback-admin__summary strong{color:var(--admin-navy)}.feedback-admin__workspace{display:grid;grid-template-columns:minmax(310px,390px) minmax(0,1fr);gap:18px;align-items:start}.feedback-list{display:grid;max-height:calc(100vh - 215px);padding:10px;gap:7px;overflow:auto;box-shadow:none}.feedback-list__item{display:grid;width:100%;grid-template-columns:88px minmax(0,1fr) auto;gap:9px;align-items:center;padding:10px;border:1px solid transparent;border-radius:11px;color:var(--admin-navy);background:white;text-align:left;cursor:pointer}.feedback-list__item:hover,.feedback-list__item.is-selected{border-color:#72b3c4;background:var(--admin-cyan)}.feedback-list__item.is-removed{opacity:.58}.feedback-list__item span{display:grid;min-width:0;gap:2px}.feedback-list__item small{overflow:hidden;color:var(--admin-muted);font-size:.72rem;text-overflow:ellipsis;white-space:nowrap}.feedback-list__item b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.feedback-list__item em{padding:4px 7px;border-radius:999px;color:#76530c;background:#fff3cf;font-size:.66rem;font-style:normal;font-weight:900;white-space:nowrap}.feedback-list__item em.is-validated{color:#176246;background:#daf1e5}.feedback-list__item em.is-removed{color:#8b352e;background:#f7dfdd}.feedback-detail{display:grid;gap:16px}.feedback-panel,.feedback-help-preview,.feedback-raw{padding:18px;box-shadow:none}.feedback-panel__header,.feedback-help-preview>header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.feedback-panel__header h2,.feedback-help-preview h2{margin:0;color:var(--admin-navy)}.feedback-panel__actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}.feedback-facts,.feedback-question{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:16px 0 0}.feedback-facts div,.feedback-question div{padding:10px;border:1px solid var(--admin-border);border-radius:10px;background:#f7fafb}.feedback-facts dt,.feedback-question dt{color:var(--admin-muted);font-size:.68rem;font-weight:900;letter-spacing:.04em;text-transform:uppercase}.feedback-facts dd,.feedback-question dd{margin:3px 0 0;color:var(--admin-navy);font-weight:850;overflow-wrap:anywhere}.feedback-section{display:grid;margin-top:18px;gap:10px}.feedback-section h3{margin:0;color:var(--admin-navy)}.feedback-comment{margin:0;padding:13px;border-left:4px solid #7db8c8;border-radius:10px;color:var(--admin-navy);background:#eef7f9}.feedback-section details,.feedback-raw details{border:1px solid var(--admin-border);border-radius:10px;background:#f8fbfc}.feedback-section summary,.feedback-raw summary{padding:10px 12px;color:var(--admin-blue);font-weight:850;cursor:pointer}.feedback-section pre,.feedback-raw pre{max-height:420px;margin:0;padding:12px;overflow:auto;color:#dce8e9;border-radius:0 0 10px 10px;background:#102328;font-size:.72rem;line-height:1.45;white-space:pre-wrap}.feedback-messages{display:grid;margin:0;padding:0;gap:8px;list-style:none}.feedback-messages li{display:grid;padding:10px;border:1px solid var(--admin-border);border-radius:10px;gap:3px;background:#f7fafb}.feedback-messages strong{color:var(--admin-blue);font-size:.74rem}.feedback-messages span{color:var(--admin-navy);white-space:pre-wrap}.feedback-empty{margin:0;padding:18px;color:var(--admin-muted);text-align:center}.feedback-help-preview :deep(.coach-help-panel--embedded){height:760px;max-width:520px;margin-inline:auto}
:global(:root[data-theme='dark'] .feedback-list),:global(:root[data-theme='dark'] .feedback-panel),:global(:root[data-theme='dark'] .feedback-help-preview),:global(:root[data-theme='dark'] .feedback-raw){border-color:#40575f;background:#17292e}:global(:root[data-theme='dark'] .feedback-admin__summary span),:global(:root[data-theme='dark'] .feedback-list__item),:global(:root[data-theme='dark'] .feedback-facts div),:global(:root[data-theme='dark'] .feedback-question div),:global(:root[data-theme='dark'] .feedback-section details),:global(:root[data-theme='dark'] .feedback-raw details),:global(:root[data-theme='dark'] .feedback-messages li){border-color:#40575f;background:#20343a}:global(:root[data-theme='dark'] .feedback-list__item:hover),:global(:root[data-theme='dark'] .feedback-list__item.is-selected){border-color:#558b99;background:#243f46}:global(:root[data-theme='dark'] .feedback-list__item),:global(:root[data-theme='dark'] .feedback-list__item b),:global(:root[data-theme='dark'] .feedback-panel__header h2),:global(:root[data-theme='dark'] .feedback-help-preview h2),:global(:root[data-theme='dark'] .feedback-section h3),:global(:root[data-theme='dark'] .feedback-facts dd),:global(:root[data-theme='dark'] .feedback-question dd),:global(:root[data-theme='dark'] .feedback-messages span),:global(:root[data-theme='dark'] .feedback-admin__summary strong){color:#d8e7ea}:global(:root[data-theme='dark'] .feedback-list__item small),:global(:root[data-theme='dark'] .feedback-facts dt),:global(:root[data-theme='dark'] .feedback-question dt){color:#a9bdc2}:global(:root[data-theme='dark'] .feedback-comment){color:#d8e7ea;background:#20343a}
@media(max-width:1050px){.feedback-admin__workspace{grid-template-columns:1fr}.feedback-list{max-height:320px}}@media(max-width:650px){.feedback-admin__heading,.feedback-panel__header{align-items:stretch;flex-direction:column}.feedback-admin__top-actions,.feedback-panel__actions{justify-content:flex-start}.feedback-list__item,.feedback-facts,.feedback-question{grid-template-columns:1fr}}
</style>

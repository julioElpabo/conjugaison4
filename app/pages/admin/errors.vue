<script setup lang="ts">
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

interface AutomaticHelpError {
  id: number
  errorCode: string | null
  severity: 'warning' | 'error' | null
  comment: string | null
  occurrenceCount: number
  firstSeenAt: string | null
  lastSeenAt: string | null
  sessionId: string | null
  exerciseRunId: string | null
  questionNumber: number | null
  helpName: string | null
  coachName: string | null
  verb: string | null
  tense: string | null
  mode: string | null
  person: string | null
  expectedAnswer: string | null
  context: Record<string, unknown> | null
  question: Record<string, unknown> | null
  displayedHelpHtml: string | null
  validationStatus: 'unvalidated' | 'validated'
  moderationStatus: 'active' | 'removed'
  createdAt: string
}

const { user, handleUnauthorized } = useAdminAuth()
const errors = ref<AutomaticHelpError[]>([])
const selectedId = ref<number | null>(null)
const loading = ref(false)
const saving = ref(false)
const copying = ref(false)
const deletingTreated = ref(false)
const errorMessage = ref('')
const success = ref('')
let loaded = false

useHead({ title: 'Erreurs — Administration' })

const selectedError = computed(() => errors.value.find(item => item.id === selectedId.value) || errors.value[0] || null)
const untreatedErrors = computed(() => errors.value.filter(item => item.validationStatus === 'unvalidated' && item.moderationStatus === 'active'))
const treatedErrors = computed(() => errors.value.filter(item => item.validationStatus === 'validated'))

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-CH', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

function contextLabel(item: AutomaticHelpError) {
  return [item.person, item.verb, item.tense, item.mode].filter(Boolean).join(' · ') || `Erreur #${item.id}`
}

function stringify(value: unknown) {
  return JSON.stringify(value, null, 2)
}

async function loadErrors(keepSelection = true) {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await $fetch<{ feedbacks: AutomaticHelpError[] }>('/api/admin/coach-help-feedbacks', {
      credentials: 'same-origin',
      query: { origin: 'automatic', limit: 500 },
    })
    errors.value = response.feedbacks
    if (keepSelection && selectedId.value && errors.value.some(item => item.id === selectedId.value)) return
    selectedId.value = errors.value[0]?.id || null
  }
  catch (caught) {
    if (!handleUnauthorized(caught)) errorMessage.value = getAdminErrorMessage(caught, 'Impossible de charger les erreurs automatiques.')
  }
  finally {
    loading.value = false
  }
}

async function updateError(action: 'validate' | 'unvalidate' | 'remove' | 'restore') {
  const selected = selectedError.value
  if (!selected || saving.value) return
  let note: string | null = null
  if (action === 'remove') {
    note = window.prompt('Raison du retrait ?', 'Erreur sans valeur exploitable')?.trim() || ''
    if (!note) return
  }
  saving.value = true
  errorMessage.value = ''
  success.value = ''
  try {
    await $fetch(`/api/admin/coach-help-feedbacks/${selected.id}`, {
      method: 'PUT',
      credentials: 'same-origin',
      body: { action, note },
    })
    await loadErrors(true)
    success.value = action === 'validate'
      ? 'Erreur marquée comme traitée.'
      : action === 'unvalidate'
        ? 'Erreur remise dans les éléments non traités.'
        : action === 'remove'
          ? 'Erreur retirée.'
          : 'Erreur restaurée.'
  }
  catch (caught) {
    if (!handleUnauthorized(caught)) errorMessage.value = getAdminErrorMessage(caught, 'Impossible de traiter cette erreur.')
  }
  finally {
    saving.value = false
  }
}

async function copyUntreatedErrors() {
  if (copying.value) return
  copying.value = true
  errorMessage.value = ''
  success.value = ''
  try {
    const response = await $fetch<{ count: number, prompt: string }>('/api/admin/coach-help-errors/export', {
      credentials: 'same-origin',
    })
    if (!response.prompt) {
      success.value = 'Aucune erreur non traitée à copier.'
      return
    }
    await navigator.clipboard.writeText(response.prompt)
    success.value = `${response.count} erreur${response.count > 1 ? 's' : ''} non traitée${response.count > 1 ? 's' : ''} copiée${response.count > 1 ? 's' : ''}.`
  }
  catch (caught) {
    if (!handleUnauthorized(caught)) errorMessage.value = getAdminErrorMessage(caught, 'Impossible de copier les erreurs.')
  }
  finally {
    copying.value = false
  }
}

async function deleteTreatedErrors() {
  const count = treatedErrors.value.length
  if (!count || deletingTreated.value) return
  const label = `${count} erreur${count > 1 ? 's' : ''} traitée${count > 1 ? 's' : ''}`
  if (!window.confirm(`Supprimer définitivement ${label} ?\n\nCette action est irréversible.`)) return
  deletingTreated.value = true
  errorMessage.value = ''
  success.value = ''
  try {
    const response = await $fetch<{ count: number }>('/api/admin/coach-help-feedbacks/treated', {
      method: 'DELETE',
      credentials: 'same-origin',
      body: { origin: 'automatic' },
    })
    selectedId.value = null
    await loadErrors(false)
    success.value = `${response.count} erreur${response.count > 1 ? 's' : ''} traitée${response.count > 1 ? 's' : ''} supprimée${response.count > 1 ? 's' : ''}.`
  }
  catch (caught) {
    if (!handleUnauthorized(caught)) errorMessage.value = getAdminErrorMessage(caught, 'Impossible de supprimer les erreurs traitées.')
  }
  finally {
    deletingTreated.value = false
  }
}

watch(user, (current) => {
  if (current && !loaded) { loaded = true; void loadErrors(false) }
  if (!current) loaded = false
}, { immediate: true })
</script>

<template>
  <AdminAuthBoundary>
    <AdminShell>
      <main class="error-admin">
        <header class="admin-section-heading error-admin__heading">
          <div>
            <p class="admin-eyebrow">Contrôle automatique des aides</p>
            <h1>Erreurs</h1>
            <p class="admin-muted">Incohérences relevées en comparant l’aide affichée avec la réponse officielle.</p>
          </div>
          <div class="error-admin__top-actions">
            <button class="admin-button admin-button--danger" type="button" :disabled="deletingTreated || !treatedErrors.length" @click="deleteTreatedErrors">
              {{ deletingTreated ? 'Suppression…' : `Supprimer les erreurs traitées (${treatedErrors.length})` }}
            </button>
            <button class="admin-button admin-button--primary" type="button" :disabled="copying" @click="copyUntreatedErrors">
              {{ copying ? 'Copie…' : 'Copier toutes les erreurs non traitées' }}
            </button>
            <button class="admin-button admin-button--small" type="button" :disabled="loading" @click="loadErrors(true)">
              {{ loading ? 'Chargement…' : 'Actualiser' }}
            </button>
          </div>
        </header>

        <p v-if="errorMessage" class="admin-notice admin-notice--error">{{ errorMessage }}</p>
        <p v-if="success" class="admin-notice admin-notice--success">{{ success }}</p>

        <section class="error-admin__summary">
          <span><strong>{{ errors.length }}</strong> erreurs recensées</span>
          <span><strong>{{ untreatedErrors.length }}</strong> non traitées</span>
          <span><strong>{{ treatedErrors.length }}</strong> traitées</span>
        </section>

        <div class="error-admin__workspace">
          <aside class="admin-card error-list" aria-label="Liste des erreurs automatiques">
            <p v-if="loading && !errors.length" class="error-empty">Chargement…</p>
            <p v-else-if="!errors.length" class="error-empty">Aucune erreur automatique enregistrée.</p>
            <button
              v-for="item in errors"
              :key="item.id"
              type="button"
              :class="['error-list__item', { 'is-selected': item.id === selectedError?.id, 'is-removed': item.moderationStatus === 'removed' }]"
              @click="selectedId = item.id"
            >
              <span>
                <strong>{{ item.errorCode || 'Erreur automatique' }}</strong>
                <small>{{ formatDate(item.lastSeenAt || item.createdAt) }}</small>
              </span>
              <span>
                <b>{{ contextLabel(item) }}</b>
                <small>{{ item.comment || 'Sans diagnostic' }}</small>
              </span>
              <span class="error-list__status">
                <em>{{ item.occurrenceCount }}×</em>
                <em :class="item.validationStatus === 'validated' ? 'is-treated' : 'is-untreated'">
                  {{ item.validationStatus === 'validated' ? 'Traitée' : 'Non traitée' }}
                </em>
              </span>
            </button>
          </aside>

          <section v-if="selectedError" class="error-detail">
            <article class="admin-card error-panel">
              <header>
                <div>
                  <p class="admin-eyebrow">Erreur #{{ selectedError.id }}</p>
                  <h2>{{ selectedError.errorCode || 'Erreur automatique' }}</h2>
                  <p class="admin-muted">{{ contextLabel(selectedError) }}</p>
                </div>
                <div class="error-panel__actions">
                  <button
                    v-if="selectedError.validationStatus === 'unvalidated'"
                    class="admin-button admin-button--primary admin-button--small"
                    type="button"
                    :disabled="saving || selectedError.moderationStatus === 'removed'"
                    @click="updateError('validate')"
                  >Marquer comme traitée</button>
                  <button
                    v-else
                    class="admin-button admin-button--small"
                    type="button"
                    :disabled="saving || selectedError.moderationStatus === 'removed'"
                    @click="updateError('unvalidate')"
                  >Remettre non traitée</button>
                  <button
                    v-if="selectedError.moderationStatus === 'active'"
                    class="admin-button admin-button--danger admin-button--small"
                    type="button"
                    :disabled="saving"
                    @click="updateError('remove')"
                  >Supprimer</button>
                  <button v-else class="admin-button admin-button--small" type="button" :disabled="saving" @click="updateError('restore')">Restaurer</button>
                </div>
              </header>

              <p class="error-panel__diagnostic">{{ selectedError.comment }}</p>
              <dl class="error-facts">
                <div><dt>Occurrences</dt><dd>{{ selectedError.occurrenceCount }}</dd></div>
                <div><dt>Réponse officielle</dt><dd>{{ selectedError.expectedAnswer || '—' }}</dd></div>
                <div><dt>Première détection</dt><dd>{{ formatDate(selectedError.firstSeenAt || selectedError.createdAt) }}</dd></div>
                <div><dt>Dernière détection</dt><dd>{{ formatDate(selectedError.lastSeenAt || selectedError.createdAt) }}</dd></div>
                <div><dt>Coach</dt><dd>{{ selectedError.coachName || '—' }}</dd></div>
                <div><dt>Aide</dt><dd>{{ selectedError.helpName || '—' }}</dd></div>
              </dl>

              <details>
                <summary>Question complète</summary>
                <pre>{{ stringify(selectedError.question) }}</pre>
              </details>
              <details>
                <summary>Contexte complet</summary>
                <pre>{{ stringify(selectedError.context) }}</pre>
              </details>
              <details>
                <summary>HTML de l’aide rejetée</summary>
                <pre>{{ selectedError.displayedHelpHtml || 'Aucun HTML enregistré.' }}</pre>
              </details>
            </article>
          </section>
        </div>
      </main>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.error-admin{display:grid;gap:18px}.error-admin__heading{align-items:center}.error-admin__top-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}.error-admin__summary{display:flex;flex-wrap:wrap;gap:9px}.error-admin__summary span{padding:8px 11px;border:1px solid var(--admin-border);border-radius:999px;color:var(--admin-muted);background:var(--admin-surface,#fff);font-size:.82rem}.error-admin__summary strong{color:var(--admin-navy)}.error-admin__workspace{display:grid;grid-template-columns:minmax(340px,430px) minmax(0,1fr);gap:18px;align-items:start}.error-list{display:grid;max-height:calc(100vh - 215px);padding:10px;gap:7px;overflow:auto;box-shadow:none}.error-list__item{display:grid;width:100%;grid-template-columns:125px minmax(0,1fr) auto;gap:9px;align-items:center;padding:10px;border:1px solid transparent;border-radius:11px;color:var(--admin-navy);background:white;text-align:left;cursor:pointer}.error-list__item:hover,.error-list__item.is-selected{border-color:#d79b7a;background:#fff3ed}.error-list__item.is-removed{opacity:.55}.error-list__item>span{display:grid;min-width:0;gap:2px}.error-list__item small,.error-list__item b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.error-list__item small{color:var(--admin-muted);font-size:.7rem}.error-list__status{justify-items:end}.error-list__status em{padding:3px 7px;border-radius:999px;font-size:.64rem;font-style:normal;font-weight:900;white-space:nowrap}.error-list__status em:first-child{color:#7a4a31;background:#f7e4da}.error-list__status .is-untreated{color:#8b352e;background:#f7dfdd}.error-list__status .is-treated{color:#176246;background:#daf1e5}.error-detail{display:grid}.error-panel{display:grid;padding:18px;gap:14px;box-shadow:none}.error-panel>header{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.error-panel h2{margin:0;color:var(--admin-navy)}.error-panel__actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}.error-panel__diagnostic{margin:0;padding:13px;border-left:4px solid #c7664f;border-radius:10px;color:var(--admin-navy);background:#fff0ec}.error-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:0}.error-facts div{padding:10px;border:1px solid var(--admin-border);border-radius:10px;background:#f7fafb}.error-facts dt{color:var(--admin-muted);font-size:.68rem;font-weight:900;text-transform:uppercase}.error-facts dd{margin:3px 0 0;color:var(--admin-navy);font-weight:850;overflow-wrap:anywhere}.error-panel details{border:1px solid var(--admin-border);border-radius:10px;background:#f8fbfc}.error-panel summary{padding:10px 12px;color:var(--admin-blue);font-weight:850;cursor:pointer}.error-panel pre{max-height:420px;margin:0;padding:12px;overflow:auto;color:#dce8e9;border-radius:0 0 10px 10px;background:#102328;font-size:.72rem;line-height:1.45;white-space:pre-wrap}.error-empty{margin:0;padding:18px;color:var(--admin-muted);text-align:center}:global(:root[data-theme='dark'] .error-list),:global(:root[data-theme='dark'] .error-panel){border-color:#40575f;background:#17292e}:global(:root[data-theme='dark'] .error-admin__summary span),:global(:root[data-theme='dark'] .error-list__item),:global(:root[data-theme='dark'] .error-facts div),:global(:root[data-theme='dark'] .error-panel details){border-color:#40575f;background:#20343a}:global(:root[data-theme='dark'] .error-list__item:hover),:global(:root[data-theme='dark'] .error-list__item.is-selected){border-color:#9b684f;background:#3b2d28}:global(:root[data-theme='dark'] .error-list__item),:global(:root[data-theme='dark'] .error-list__item b),:global(:root[data-theme='dark'] .error-panel h2),:global(:root[data-theme='dark'] .error-facts dd),:global(:root[data-theme='dark'] .error-admin__summary strong){color:#d8e7ea}:global(:root[data-theme='dark'] .error-panel__diagnostic){color:#efd8d2;background:#422c28}:global(:root[data-theme='dark'] .error-facts dt),:global(:root[data-theme='dark'] .error-list__item small){color:#a9bdc2}@media(max-width:1050px){.error-admin__workspace{grid-template-columns:1fr}.error-list{max-height:320px}}@media(max-width:680px){.error-admin__heading,.error-panel>header{align-items:stretch;flex-direction:column}.error-admin__top-actions,.error-panel__actions{justify-content:flex-start}.error-list__item,.error-facts{grid-template-columns:1fr}.error-list__status{justify-items:start}}
</style>

<script setup lang="ts">
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

interface SharedSummaryStats {
  totalCount: number
  expiredCount: number
}

const { user, handleUnauthorized } = useAdminAuth()
const stats = ref<SharedSummaryStats>({ totalCount: 0, expiredCount: 0 })
const loading = ref(false)
const deleting = ref(false)
const error = ref('')
const success = ref('')
let loaded = false

useHead({ title: 'Bilans partagés — Administration' })

async function loadStats() {
  loading.value = true
  error.value = ''
  try {
    stats.value = await $fetch<SharedSummaryStats>('/api/admin/exercise-summaries', {
      credentials: 'same-origin',
    })
  } catch (caught) {
    if (!handleUnauthorized(caught)) {
      error.value = getAdminErrorMessage(caught, 'Impossible de charger les bilans partagés.')
    }
  } finally {
    loading.value = false
  }
}

async function deleteExpired() {
  if (deleting.value || !window.confirm('Supprimer tous les bilans partagés âgés de plus d’un mois ?\n\nCette action est irréversible.')) return
  deleting.value = true
  error.value = ''
  success.value = ''
  try {
    const response = await $fetch<{ ok: boolean, count: number }>('/api/admin/exercise-summaries', {
      method: 'DELETE',
      credentials: 'same-origin',
    })
    const count = response.count
    success.value = `${count} bilan${count > 1 ? 's' : ''} partagé${count > 1 ? 's' : ''} supprimé${count > 1 ? 's' : ''}.`
    await loadStats()
  } catch (caught) {
    if (!handleUnauthorized(caught)) {
      error.value = getAdminErrorMessage(caught, 'Impossible de supprimer les anciens bilans.')
    }
  } finally {
    deleting.value = false
  }
}

watch(user, (current) => {
  if (current && !loaded) {
    loaded = true
    void loadStats()
  }
  if (!current) loaded = false
}, { immediate: true })
</script>

<template>
  <AdminAuthBoundary>
    <AdminShell>
      <div class="shared-summaries-admin">
        <header class="admin-section-heading">
          <div>
            <p class="admin-eyebrow">Stockage temporaire</p>
            <h1>Bilans partagés</h1>
            <p class="admin-muted">Les liens cessent de fonctionner un mois après la création du bilan.</p>
          </div>
          <button class="admin-button" type="button" :disabled="loading || deleting" @click="loadStats">
            Actualiser
          </button>
        </header>

        <p v-if="error" class="admin-notice admin-notice--error" role="alert">{{ error }}</p>
        <p v-if="success" class="admin-notice admin-notice--success" role="status">{{ success }}</p>

        <div v-if="loading" class="shared-summaries-admin__loading">
          <span class="admin-spinner" aria-hidden="true" /> Chargement…
        </div>

        <section v-else class="admin-card shared-summaries-admin__panel">
          <div class="shared-summaries-admin__metrics">
            <div>
              <span>Bilans enregistrés</span>
              <strong>{{ stats.totalCount }}</strong>
            </div>
            <div>
              <span>Bilans de plus d’un mois</span>
              <strong>{{ stats.expiredCount }}</strong>
            </div>
          </div>

          <div class="shared-summaries-admin__cleanup">
            <div>
              <h2>Nettoyer les anciens bilans</h2>
              <p>Supprime définitivement tous les bilans partagés créés il y a plus d’un mois.</p>
            </div>
            <button
              class="admin-button admin-button--danger"
              type="button"
              :disabled="deleting || stats.expiredCount === 0"
              @click="deleteExpired"
            >
              {{ deleting ? 'Suppression…' : 'Supprimer les bilans de plus d’un mois' }}
            </button>
          </div>
        </section>
      </div>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.shared-summaries-admin{display:grid;max-width:980px;margin-inline:auto;gap:22px}
.shared-summaries-admin .admin-section-heading{align-items:center}
.shared-summaries-admin .admin-section-heading p{margin:6px 0 0}
.shared-summaries-admin__loading{display:flex;min-height:220px;align-items:center;justify-content:center;gap:10px;color:var(--admin-muted)}
.shared-summaries-admin__panel{display:grid;padding:clamp(18px,3vw,28px);gap:28px}
.shared-summaries-admin__metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.shared-summaries-admin__metrics>div{display:grid;padding:20px;gap:7px;border:1px solid var(--admin-border);border-radius:14px;background:var(--admin-surface,#fff)}
.shared-summaries-admin__metrics span{color:var(--admin-muted);font-weight:750}
.shared-summaries-admin__metrics strong{color:var(--admin-navy);font-size:2rem}
.shared-summaries-admin__cleanup{display:flex;padding-top:24px;align-items:center;justify-content:space-between;gap:24px;border-top:1px solid var(--admin-border)}
.shared-summaries-admin__cleanup h2{margin:0 0 6px;color:var(--admin-navy)}
.shared-summaries-admin__cleanup p{margin:0;color:var(--admin-muted)}
@media(max-width:700px){.shared-summaries-admin__metrics{grid-template-columns:1fr}.shared-summaries-admin__cleanup{align-items:stretch;flex-direction:column}.shared-summaries-admin__cleanup button{width:100%}}
</style>

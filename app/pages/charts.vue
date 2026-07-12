<script setup lang="ts">
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

interface StatsDay {
  date: string
  homepage: number
  creationpdf: number
  sauvedefi: number
  chargedefi: number
  exercer: number
  exercersimple: number
  resultat: number
  resultatsimple: number
}

const { user, handleUnauthorized } = useAdminAuth()
const days = ref<StatsDay[]>([])
const loading = ref(false)
const error = ref('')
let loadedForUserId: number | null = null

useHead({ title: 'Statistiques' })

async function loadStats() {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch<{ days: StatsDay[] }>('/api/admin/stats', {
      credentials: 'same-origin'
    })
    days.value = response.days.map(day => ({
      date: String(day.date),
      homepage: Number(day.homepage) || 0,
      creationpdf: Number(day.creationpdf) || 0,
      sauvedefi: Number(day.sauvedefi) || 0,
      chargedefi: Number(day.chargedefi) || 0,
      exercer: Number(day.exercer) || 0,
      exercersimple: Number(day.exercersimple) || 0,
      resultat: Number(day.resultat) || 0,
      resultatsimple: Number(day.resultatsimple) || 0
    }))
  } catch (caught) {
    if (!handleUnauthorized(caught)) {
      error.value = getAdminErrorMessage(caught, 'Impossible de charger les statistiques.')
    }
  } finally {
    loading.value = false
  }
}

watch(user, (currentUser) => {
  if (!currentUser) {
    loadedForUserId = null
    return
  }

  if (loadedForUserId !== currentUser.id) {
    loadedForUserId = currentUser.id
    void loadStats()
  }
}, { immediate: true })
</script>

<template>
  <AdminAuthBoundary>
    <AdminShell>
      <div class="charts-page">
        <header class="admin-section-heading charts-page__heading">
          <div>
            <p class="admin-eyebrow">Mesure d’activité</p>
            <h1>Statistiques</h1>
            <p class="admin-muted">Vue quotidienne des 30 derniers jours enregistrés.</p>
          </div>
          <button class="admin-button" type="button" :disabled="loading" @click="loadStats">
            {{ loading ? 'Actualisation…' : 'Actualiser' }}
          </button>
        </header>

        <div v-if="loading && !days.length" class="charts-page__loading" role="status">
          <span class="admin-spinner" aria-hidden="true" />
          <p>Chargement des statistiques…</p>
        </div>

        <div v-else-if="error && !days.length" class="charts-page__loading">
          <p class="admin-notice admin-notice--error" role="alert">{{ error }}</p>
          <button class="admin-button" type="button" @click="loadStats">Réessayer</button>
        </div>

        <template v-else>
          <p v-if="error" class="admin-notice admin-notice--error" role="alert">{{ error }}</p>
          <AdminStatsDashboard :days="days" />
        </template>
      </div>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.charts-page {
  display: grid;
  gap: 25px;
}

.charts-page__heading .admin-muted {
  margin: 7px 0 0;
}

.charts-page__loading {
  display: flex;
  min-height: 260px;
  padding: 28px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 14px;
  color: var(--admin-muted);
  background: #f7fafb;
  border-radius: 12px;
}

.charts-page__loading p {
  margin: 0;
}

@media (max-width: 560px) {
  .charts-page__heading {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>

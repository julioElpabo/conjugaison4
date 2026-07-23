<script setup lang="ts">
import type { AnalyticsResponse, AnalyticsWindow } from '../../../shared/types/analytics'
import AdminStatsProgression from '~/components/admin/AdminStatsProgression.vue'
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

const { ui } = useLanguagePreferences()
const { user, handleUnauthorized } = useAdminAuth()
const stats = ref<AnalyticsResponse | null>(null)
const loading = ref(false)
const error = ref('')
const activeTab = ref<'realtime' | 'range'>('realtime')
const rangeView = ref<'summary' | 'progression'>('summary')
const realtimeWindow = ref<Exclude<AnalyticsWindow, 'range'>>('30m')
const selectedWindow = ref<AnalyticsWindow>('30m')
const visibleStats = computed(() => stats.value?.window === selectedWindow.value ? stats.value : null)
const today = new Date().toISOString().slice(0, 10)
const startDate = ref(offsetDate(-6))
const endDate = ref(today)
const rangePresets = [
  { days: 7, label: '7 jours' },
  { days: 30, label: '30 jours' },
  { days: 183, label: '6 mois' },
  { days: 365, label: '1 an' },
] as const
const activePresetDays = computed(() => (
  endDate.value === today
    ? rangePresets.find(preset => startDate.value === offsetDate(-(preset.days - 1)))?.days
    : undefined
))
let loadedForUserId: number | null = null
let refreshTimer: ReturnType<typeof setInterval> | undefined
let statsRequest = 0

useHead(() => ({ title: ui('Statistiques') }))

function offsetDate(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function choosePreset(days: number) {
  startDate.value = offsetDate(-(days - 1))
  endDate.value = today
  showWindow('range')
}

function chooseTab(tab: 'realtime' | 'range') {
  activeTab.value = tab
  showWindow(tab === 'realtime' ? realtimeWindow.value : 'range')
}

function chooseRealtimeWindow(window: Exclude<AnalyticsWindow, 'range'>) {
  realtimeWindow.value = window
  showWindow(window)
}

function showWindow(window: AnalyticsWindow) {
  if (selectedWindow.value === window) void loadStats()
  else selectedWindow.value = window
}

function showCustomRange() {
  activeTab.value = 'range'
  showWindow('range')
}

async function loadStats() {
  if (!user.value) return
  const request = ++statsRequest
  loading.value = true
  error.value = ''
  try {
    const response = await $fetch<AnalyticsResponse>('/api/admin/analytics', {
      credentials: 'same-origin',
      query: { window: selectedWindow.value, start: startDate.value, end: endDate.value },
      timeout: 20_000,
    })
    if (request === statsRequest) stats.value = response
  }
  catch (caught) {
    if (request === statsRequest && !handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, ui('Impossible de charger les statistiques.'))
  }
  finally {
    if (request === statsRequest) loading.value = false
  }
}

function configureRefresh() {
  if (refreshTimer) clearInterval(refreshTimer)
  refreshTimer = undefined
  if (activeTab.value === 'realtime' && (!import.meta.client || !document.hidden)) {
    refreshTimer = setInterval(() => void loadStats(), 30_000)
  }
}

function handleVisibilityChange() {
  configureRefresh()
  if (!document.hidden && activeTab.value === 'realtime') void loadStats()
}

watch(selectedWindow, () => { configureRefresh(); void loadStats() })
watch(user, (currentUser) => {
  if (!currentUser) { loadedForUserId = null; return }
  if (loadedForUserId !== currentUser.id) { loadedForUserId = currentUser.id; void loadStats() }
}, { immediate: true })
onMounted(() => {
  configureRefresh()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})
onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <AdminAuthBoundary>
    <AdminShell>
      <div class="charts-page">
        <header class="admin-section-heading charts-page__heading">
          <h1>Statistiques</h1>
          <div class="stats-tabs" role="tablist" aria-label="Type de statistiques">
            <button id="stats-tab-realtime" type="button" role="tab" :aria-selected="activeTab === 'realtime'" aria-controls="stats-panel-realtime" :class="{ active: activeTab === 'realtime' }" @click="chooseTab('realtime')">
              <span class="stats-tabs__pulse" aria-hidden="true" />
              <strong>Aperçu en temps réel</strong>
              <small>Maintenant et dernières minutes</small>
            </button>
            <button id="stats-tab-range" type="button" role="tab" :aria-selected="activeTab === 'range'" aria-controls="stats-panel-range" :class="{ active: activeTab === 'range' }" @click="chooseTab('range')">
              <strong>Durée particulière</strong>
              <small>Semaine, mois, année ou dates libres</small>
            </button>
          </div>
          <button class="admin-button" type="button" :disabled="loading" @click="loadStats">{{ loading ? 'Actualisation…' : 'Actualiser' }}</button>
        </header>

        <section v-if="activeTab === 'realtime'" id="stats-panel-realtime" class="period-picker period-picker--live admin-card" role="tabpanel" aria-labelledby="stats-tab-realtime">
          <div class="period-picker__live">
            <button v-for="option in [{ value: 'now', label: 'Maintenant' }, { value: '5m', label: '5 dernières minutes' }, { value: '30m', label: '30 dernières minutes' }]" :key="option.value" type="button" :class="{ active: selectedWindow === option.value }" @click="chooseRealtimeWindow(option.value as Exclude<AnalyticsWindow, 'range'>)">{{ option.label }}</button>
          </div>
          <p class="live-status"><i /> Actualisation automatique toutes les 30 secondes</p>
        </section>

        <section v-else id="stats-panel-range" class="period-picker admin-card" role="tabpanel" aria-labelledby="stats-tab-range">
          <div class="period-picker__presets">
            <span>Choisir rapidement :</span>
            <button
              v-for="preset in rangePresets"
              :key="preset.days"
              type="button"
              :class="{ active: activePresetDays === preset.days }"
              :aria-pressed="activePresetDays === preset.days"
              @click="choosePreset(preset.days)"
            >
              {{ preset.label }}
            </button>
          </div>
          <form class="period-picker__custom" @submit.prevent="showCustomRange">
            <label><span>Du</span><input v-model="startDate" type="date" :max="endDate"></label>
            <label><span>Au</span><input v-model="endDate" type="date" :min="startDate" :max="today"></label>
            <button class="admin-button" type="submit">Afficher cette période</button>
          </form>
          <div class="range-view" role="group" aria-label="Présentation des statistiques">
            <span>Présentation :</span>
            <button type="button" :class="{ active: rangeView === 'summary' }" :aria-pressed="rangeView === 'summary'" @click="rangeView = 'summary'">
              <strong>Synthèse</strong><small>Totaux de toute la durée</small>
            </button>
            <button type="button" :class="{ active: rangeView === 'progression' }" :aria-pressed="rangeView === 'progression'" @click="rangeView = 'progression'">
              <strong>Progression</strong><small>Évolution dans le temps</small>
            </button>
          </div>
        </section>

        <div v-if="loading && !visibleStats" class="charts-page__loading" role="status"><span class="admin-spinner" aria-hidden="true" /><p>Chargement des statistiques…</p></div>
        <div v-else-if="error && !visibleStats" class="charts-page__loading"><p class="admin-notice admin-notice--error" role="alert">{{ error }}</p><button class="admin-button" type="button" @click="loadStats">Réessayer</button></div>
        <template v-else-if="visibleStats">
          <p v-if="error" class="admin-notice admin-notice--error" role="alert">{{ error }}</p>
          <AdminStatsProgression v-if="activeTab === 'range' && rangeView === 'progression'" :stats="visibleStats" />
          <AdminStatsDashboard v-else :stats="visibleStats" />
          <p class="updated-at">Dernière actualisation : {{ new Date(visibleStats.local.generatedAt).toLocaleTimeString('fr-CH') }}</p>
        </template>
      </div>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.charts-page{display:grid;gap:22px}.charts-page__heading{display:grid;grid-template-columns:auto minmax(460px,720px) auto;align-items:center;gap:24px}.charts-page__heading h1{margin:0}.stats-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));justify-self:center;width:100%;gap:8px}.stats-tabs>button{display:grid;position:relative;min-height:62px;padding:9px 16px;align-content:center;gap:1px;border:2px solid #cfdee2;border-radius:13px;color:var(--admin-navy);background:#fff;text-align:left;cursor:pointer;transition:border-color .15s,background .15s,transform .15s}.stats-tabs>button:hover{border-color:#76adba;transform:translateY(-1px)}.stats-tabs>button.active{color:#fff;border-color:#08758b;background:linear-gradient(135deg,#08758b,#125c70);box-shadow:0 7px 18px rgb(8 117 139 / 18%)}.stats-tabs strong{font-size:.9rem}.stats-tabs small{color:var(--admin-muted);font-size:.67rem}.stats-tabs>button.active small{color:#d7eff4}.stats-tabs__pulse{position:absolute;top:9px;right:10px;width:7px;height:7px;border-radius:50%;background:#43d58c;box-shadow:0 0 0 3px rgb(67 213 140 / 18%)}.period-picker{padding:18px;display:grid;gap:14px;box-shadow:none}.period-picker--live{grid-template-columns:1fr auto;align-items:center}.period-picker__live,.period-picker__presets{display:flex;align-items:center;flex-wrap:wrap;gap:8px}.period-picker button:not(.admin-button){padding:9px 13px;border:1px solid #bdd2d7;border-radius:10px;background:#fff;color:var(--admin-navy);font:inherit;font-weight:750;cursor:pointer}.period-picker button.active{background:#08758b;color:#fff;border-color:#08758b}.period-picker__presets span{color:var(--admin-muted);font-weight:750;margin-right:3px}.period-picker__custom{display:flex;align-items:end;flex-wrap:wrap;gap:10px}.period-picker__custom label{display:grid;gap:4px;color:var(--admin-muted);font-size:.78rem;font-weight:800}.period-picker__custom input{padding:9px 11px;border:1px solid #bdd2d7;border-radius:9px;color:var(--admin-navy);font:inherit}.live-status{margin:0;color:#47717a;font-size:.78rem;white-space:nowrap}.live-status i{display:inline-block;width:8px;height:8px;margin-right:5px;border-radius:50%;background:#2ba96c;box-shadow:0 0 0 4px #dff5e9}.charts-page__loading{display:flex;min-height:260px;padding:28px;align-items:center;justify-content:center;flex-direction:column;gap:14px;color:var(--admin-muted);background:#f7fafb;border-radius:12px}.charts-page__loading p,.updated-at{margin:0}.updated-at{text-align:right;color:var(--admin-muted);font-size:.75rem}
.range-view{display:flex;align-items:stretch;flex-wrap:wrap;gap:9px;padding-top:14px;border-top:1px solid #dce8eb}.range-view>span{align-self:center;margin-right:3px;color:var(--admin-muted);font-size:.78rem;font-weight:850}.range-view button:not(.admin-button){display:grid;min-width:190px;padding:11px 14px;gap:2px;text-align:left}.range-view button strong{font-size:.88rem}.range-view button small{color:var(--admin-muted);font-size:.7rem;font-weight:600}.range-view button.active small{color:#d7eff4}
:global(:root[data-theme='dark']) .stats-tabs>button,:global(:root[data-theme='dark']) .period-picker button:not(.admin-button),:global(:root[data-theme='dark']) .period-picker__custom input{color:var(--admin-navy);border-color:#49616a;background:#192b30}:global(:root[data-theme='dark']) .stats-tabs>button.active,:global(:root[data-theme='dark']) .period-picker button.active{color:#fff;border-color:#4ba4b9;background:linear-gradient(135deg,#176b7f,#174b5b)}:global(:root[data-theme='dark']) .stats-tabs>button.active small{color:#d7eff4}:global(:root[data-theme='dark']) .live-status{color:#a9c8cf}
@media(max-width:1100px){.charts-page__heading{grid-template-columns:auto 1fr}.charts-page__heading>.admin-button{grid-column:1/-1;justify-self:end}.stats-tabs{min-width:0}}@media(max-width:760px){.period-picker--live{grid-template-columns:1fr}.live-status{white-space:normal}.charts-page__heading{grid-template-columns:1fr}.charts-page__heading>.admin-button{grid-column:auto}.stats-tabs{justify-self:stretch}}@media(max-width:650px){.charts-page__heading{align-items:stretch}.stats-tabs{grid-template-columns:1fr}.stats-tabs>button{min-height:56px}.period-picker__custom{align-items:stretch;flex-direction:column}.period-picker__custom .admin-button,.range-view button:not(.admin-button){width:100%}}
</style>

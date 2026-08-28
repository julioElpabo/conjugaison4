<script setup lang="ts">
import type { AnalyticsActorFilter, AnalyticsProductResponse, AnalyticsResponse, AnalyticsUsersResponse, AnalyticsUsageResponse } from '../../../shared/types/analytics'
import { getAdminErrorMessage } from '~/composables/useAdminAuth'

type StatsTab = 'now' | 'overview' | 'challenges' | 'exercises' | 'print' | 'accessibility' | 'accounts' | 'usage'
type ProductTab = Extract<StatsTab, 'challenges' | 'exercises' | 'print' | 'accessibility'>
const { user, handleUnauthorized } = useAdminAuth()
const activeTab = ref<StatsTab>('overview')
const stats = ref<AnalyticsResponse | null>(null)
const usage = ref<AnalyticsUsageResponse | null>(null)
const users = ref<AnalyticsUsersResponse | null>(null)
const product = ref<AnalyticsProductResponse | null>(null)
const loading = ref(false)
const error = ref('')
const actor = ref<AnalyticsActorFilter>('all')
const timelineMetric = ref('page_view')
const today = new Date().toISOString().slice(0, 10)
const startDate = ref(offsetDate(-29))
const endDate = ref(today)
let requestId = 0
let refreshTimer: ReturnType<typeof setInterval> | undefined
let loadedForUserId: number | null = null

const tabs: Array<{ id: StatsTab, label: string, short: string }> = [
  { id: 'now', label: 'Maintenant', short: '30 dernières minutes' },
  { id: 'overview', label: 'Vue d’ensemble', short: 'Audience et parcours' },
  { id: 'challenges', label: 'Défis et options', short: 'Création et habitudes' },
  { id: 'exercises', label: 'Exercices et chat', short: 'Pratique et coachs' },
  { id: 'print', label: 'Impression', short: 'PDF, Word et options' },
  { id: 'accessibility', label: 'Accessibilité', short: 'Langues, FALC et visite' },
  { id: 'accounts', label: 'Comptes', short: 'Connexions et fonctions' },
  { id: 'usage', label: 'Usages', short: 'Section conservée' },
]
const rangePresets = [{ days: 1, label: 'Aujourd’hui' }, { days: 7, label: '7 jours' }, { days: 30, label: '30 jours' }, { days: 90, label: '90 jours' }, { days: 365, label: '1 an' }]
const activePreset = computed(() => endDate.value === today ? rangePresets.find(item => startDate.value === offsetDate(-(item.days - 1)))?.days : undefined)
const isProductTab = (tab: StatsTab): tab is ProductTab => ['challenges', 'exercises', 'print', 'accessibility'].includes(tab)
const periodReady = computed(() => stats.value?.window === 'range' && stats.value.startDate === startDate.value && stats.value.endDate === endDate.value)
const productReady = computed(() => product.value?.startDate === startDate.value && product.value.endDate === endDate.value && product.value.actor === actor.value)
const connectedAccountCount = computed(() => stats.value?.local.connectedAccounts || 0)
useHead({ title: 'Statistiques' })

function offsetDate(days: number) { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10) }
function choosePreset(days: number) { startDate.value = offsetDate(-(days - 1)); endDate.value = today; void loadActiveTab() }
function chooseTab(tab: StatsTab) { activeTab.value = tab; void loadActiveTab(); configureRefresh() }

async function loadRangeOverview() {
  const [statsResponse, usageResponse, usersResponse] = await Promise.all([
    $fetch<AnalyticsResponse>('/api/admin/analytics', { credentials: 'same-origin', query: { window: 'range', start: startDate.value, end: endDate.value }, timeout: 20_000 }),
    $fetch<AnalyticsUsageResponse>('/api/admin/analytics-usage', { credentials: 'same-origin', query: { start: startDate.value, end: endDate.value, actor: 'all' }, timeout: 20_000 }),
    $fetch<AnalyticsUsersResponse>('/api/admin/analytics-users', { credentials: 'same-origin', query: { start: startDate.value, end: endDate.value }, timeout: 20_000 }),
  ])
  return { statsResponse, usageResponse, usersResponse }
}

async function loadActiveTab() {
  if (!user.value) return
  const request = ++requestId
  loading.value = true
  error.value = ''
  try {
    if (activeTab.value === 'now') {
      const response = await $fetch<AnalyticsResponse>('/api/admin/analytics', { credentials: 'same-origin', query: { window: '30m' }, timeout: 20_000 })
      if (request === requestId) stats.value = response
    } else if (activeTab.value === 'overview') {
      const response = await loadRangeOverview()
      if (request === requestId) { stats.value = response.statsResponse; usage.value = response.usageResponse; users.value = response.usersResponse }
    } else if (isProductTab(activeTab.value)) {
      const response = await $fetch<AnalyticsProductResponse>('/api/admin/analytics-product', { credentials: 'same-origin', query: { start: startDate.value, end: endDate.value, actor: actor.value }, timeout: 20_000 })
      if (request === requestId) product.value = response
    } else if (activeTab.value === 'accounts') {
      const response = await $fetch<AnalyticsUsersResponse>('/api/admin/analytics-users', { credentials: 'same-origin', query: { start: startDate.value, end: endDate.value }, timeout: 20_000 })
      if (request === requestId) users.value = response
    } else {
      const response = await $fetch<AnalyticsUsageResponse>('/api/admin/analytics-usage', { credentials: 'same-origin', query: { start: startDate.value, end: endDate.value, actor: actor.value }, timeout: 20_000 })
      if (request === requestId) usage.value = response
    }
  } catch (caught) {
    if (request === requestId && !handleUnauthorized(caught)) error.value = getAdminErrorMessage(caught, 'Impossible de charger ces statistiques.')
  } finally { if (request === requestId) loading.value = false }
}

function configureRefresh() {
  if (refreshTimer) clearInterval(refreshTimer)
  refreshTimer = undefined
  if (activeTab.value === 'now' && (!import.meta.client || !document.hidden)) refreshTimer = setInterval(() => void loadActiveTab(), 60_000)
}
function handleVisibility() { configureRefresh(); if (!document.hidden && activeTab.value === 'now') void loadActiveTab() }
watch(actor, () => { if (isProductTab(activeTab.value) || activeTab.value === 'usage') void loadActiveTab() })
watch(user, (current) => { if (!current) { loadedForUserId = null; return }; if (loadedForUserId !== current.id) { loadedForUserId = current.id; void loadActiveTab() } }, { immediate: true })
onMounted(() => { configureRefresh(); document.addEventListener('visibilitychange', handleVisibility) })
onBeforeUnmount(() => { if (refreshTimer) clearInterval(refreshTimer); document.removeEventListener('visibilitychange', handleVisibility) })
</script>

<template>
  <AdminAuthBoundary><AdminShell><div class="analytics-page">
    <header class="analytics-heading"><h1>Statistiques</h1><button class="admin-button" type="button" :disabled="loading" @click="loadActiveTab">{{ loading ? 'Actualisation…' : 'Actualiser' }}</button></header>
    <nav class="analytics-tabs" role="tablist" aria-label="Sections statistiques">
      <button v-for="tab in tabs" :id="`analytics-tab-${tab.id}`" :key="tab.id" type="button" role="tab" :aria-selected="activeTab === tab.id" :aria-controls="`analytics-panel-${tab.id}`" :class="{ active: activeTab === tab.id }" @click="chooseTab(tab.id)">
        <span class="analytics-tab-title"><strong>{{ tab.label }}</strong><b v-if="tab.id === 'now'" :aria-label="`${connectedAccountCount} personne(s) connectée(s) avec leur compte`">{{ connectedAccountCount }} compte{{ connectedAccountCount === 1 ? '' : 's' }}</b></span>
        <small>{{ tab.short }}</small>
      </button>
    </nav>
    <section v-if="activeTab !== 'now'" class="analytics-filters admin-card" aria-label="Filtres statistiques">
      <div class="analytics-presets"><button v-for="preset in rangePresets" :key="preset.days" type="button" :class="{ active: activePreset === preset.days }" @click="choosePreset(preset.days)">{{ preset.label }}</button></div>
      <label><span>Du</span><input v-model="startDate" type="date" :max="endDate" @change="loadActiveTab"></label><label><span>Au</span><input v-model="endDate" type="date" :min="startDate" :max="today" @change="loadActiveTab"></label>
      <label v-if="isProductTab(activeTab) || activeTab === 'usage'"><span>Population</span><select v-model="actor"><option value="all">Tous</option><option value="anonymous">Anonymes</option><option value="learner">Connectés</option></select></label>
    </section>
    <p v-if="error" class="admin-notice admin-notice--error" role="alert">{{ error }} <button class="admin-button admin-button--small" type="button" @click="loadActiveTab">Réessayer</button></p>
    <div v-if="loading && !error" class="analytics-loading" role="status"><span class="admin-spinner"/><p>Chargement des données…</p></div>
    <main v-show="!loading || Boolean(error)" :id="`analytics-panel-${activeTab}`" role="tabpanel" :aria-labelledby="`analytics-tab-${activeTab}`">
      <template v-if="activeTab === 'now'">
        <div v-if="stats?.window === '30m'" class="analytics-live-status"><i/><strong>30 dernières minutes</strong><span>Actualisation toutes les 60 secondes · {{ new Date(stats.local.generatedAt).toLocaleTimeString('fr-CH') }}</span></div>
        <template v-if="stats?.window === '30m'">
          <section class="analytics-connected-accounts admin-card" aria-label="Personnes connectées avec leur compte">
            <span class="analytics-connected-accounts__icon" aria-hidden="true">●</span>
            <div><small>Comptes en ligne</small><strong>{{ connectedAccountCount.toLocaleString('fr-CH') }}</strong><p>personne{{ connectedAccountCount === 1 ? '' : 's' }} connectée{{ connectedAccountCount === 1 ? '' : 's' }} avec {{ connectedAccountCount === 1 ? 'son' : 'leur' }} compte durant les 30 dernières minutes</p></div>
          </section>
          <AdminStatsDashboard :stats="stats" theme="audience" geo-map-comparison />
          <AdminMetricTimeline v-model:metric="timelineMetric" class="analytics-timeline" :stats="stats" />
        </template>
      </template>
      <template v-else-if="activeTab === 'overview' && periodReady && stats && usage && users"><AdminStatsDashboard class="analytics-overview-audience" :stats="stats" theme="audience" geo-map-comparison audience-display="maps" /><AdminGeoAnimationExport class="analytics-overview-audience" /><AdminIntelligentDashboard :stats="stats" :usage="usage" :users="users" /><AdminStatsDashboard class="analytics-overview-audience" :stats="stats" theme="audience" audience-display="details" /><AdminMetricTimeline v-model:metric="timelineMetric" class="analytics-timeline" :stats="stats" /></template>
      <AdminProductAnalyticsDashboard v-else-if="isProductTab(activeTab) && productReady && product" :product="product" :view="activeTab" />
      <AdminUserUsageDashboard v-else-if="activeTab === 'accounts' && users" :users="users" />
      <AdminUsageDashboard v-else-if="activeTab === 'usage' && usage" v-model:actor="actor" :usage="usage" />
      <div v-else class="analytics-empty"><p>Actualisez cet onglet pour afficher ses données.</p><button class="admin-button" type="button" @click="loadActiveTab">Actualiser</button></div>
    </main>
  </div></AdminShell></AdminAuthBoundary>
</template>

<style scoped>
.analytics-overview-audience,.analytics-timeline{margin-top:18px}
.analytics-page{display:grid;gap:18px}.analytics-heading{display:flex;align-items:end;justify-content:space-between;gap:20px}.analytics-heading h1{margin:2px 0 5px;color:var(--admin-navy);font-size:clamp(1.8rem,4vw,2.6rem)}.analytics-heading p{margin:0;color:var(--admin-muted)}.analytics-tabs{display:flex;overflow-x:auto;gap:4px;padding:4px;border:1px solid #c9dce0;border-radius:13px;background:#edf4f5;scrollbar-width:thin}.analytics-tabs button{display:grid;min-width:105px;min-height:54px;padding:7px 8px;flex:1 0 105px;align-content:center;gap:1px;color:#47616a;border:1px solid transparent;border-radius:9px;background:transparent;font:inherit;text-align:left;cursor:pointer}.analytics-tabs button strong{font-size:.72rem;white-space:nowrap}.analytics-tabs button small{overflow:hidden;font-size:.57rem;text-overflow:ellipsis;white-space:nowrap}.analytics-tabs button:hover{background:#fff}.analytics-tabs button.active{color:#fff;border-color:#08758b;background:#08758b;box-shadow:0 5px 12px rgb(8 117 139 / 18%)}.analytics-tabs button.active small{color:#d7f0f2}.analytics-filters{display:flex;padding:10px 12px;align-items:end;flex-wrap:wrap;gap:9px;box-shadow:none}.analytics-presets{display:flex;padding:3px;gap:3px;border-radius:9px;background:#edf4f5}.analytics-presets button{padding:8px 10px;color:#47616a;border:0;border-radius:7px;background:transparent;font:inherit;font-size:.7rem;font-weight:800;cursor:pointer}.analytics-presets button.active{color:#fff;background:#08758b}.analytics-filters label{display:grid;gap:3px}.analytics-filters label span{color:#647a82;font-size:.61rem;font-weight:850;text-transform:uppercase}.analytics-filters input,.analytics-filters select{min-height:35px;padding:6px 9px;color:#173f4a;border:1px solid #bdd2d7;border-radius:8px;background:#fff;font:inherit;font-size:.72rem}.analytics-loading,.analytics-empty{display:grid;min-height:260px;place-items:center;align-content:center;gap:12px;color:var(--admin-muted)}.analytics-live-status{display:flex;margin-bottom:14px;padding:10px 13px;align-items:center;gap:9px;color:#35616a;border:1px solid #bce0d0;border-radius:11px;background:#eaf8f1;font-size:.72rem}.analytics-live-status i{width:9px;height:9px;border-radius:50%;background:#22a06b;box-shadow:0 0 0 5px rgb(34 160 107 / 14%)}.analytics-live-status span{margin-left:auto}:global(:root[data-theme='dark']) .analytics-tabs,:global(:root[data-theme='dark']) .analytics-filters{border-color:#3d565e;background:#172a30}:global(:root[data-theme='dark']) .analytics-tabs button{color:#bad0d5}:global(:root[data-theme='dark']) .analytics-tabs button:hover{background:#20383f}:global(:root[data-theme='dark']) .analytics-tabs button.active{color:#fff;background:#08758b}@media(max-width:650px){.analytics-heading{align-items:flex-start;flex-direction:column}.analytics-filters{align-items:stretch;flex-direction:column}.analytics-presets{display:grid;grid-template-columns:repeat(2,1fr)}.analytics-live-status{align-items:flex-start;flex-wrap:wrap}.analytics-live-status span{width:100%;margin-left:18px}}
.analytics-tab-title{display:flex;min-width:0;align-items:center;justify-content:space-between;gap:5px}.analytics-tab-title b{display:grid;min-width:25px;height:19px;padding:0 5px;place-items:center;border-radius:999px;color:#07566a;background:#d9ecef;font-size:.53rem;font-weight:900;white-space:nowrap}.analytics-tabs button.active .analytics-tab-title b{color:#07566a;background:#fff}.analytics-connected-accounts{display:flex;margin-bottom:14px;padding:16px 18px;align-items:center;gap:14px;border:1px solid #a9d8c2;background:linear-gradient(115deg,#effaf5,#f8fcfb);box-shadow:none}.analytics-connected-accounts__icon{display:grid;width:42px;height:42px;flex:0 0 42px;place-items:center;border-radius:13px;color:#fff;background:#22a06b;font-size:.72rem;box-shadow:0 0 0 6px rgb(34 160 107 / 11%)}.analytics-connected-accounts>div{display:grid;grid-template-columns:auto 1fr;align-items:baseline;column-gap:12px}.analytics-connected-accounts small{color:#477067;font-size:.65rem;font-weight:900;letter-spacing:.06em;text-transform:uppercase}.analytics-connected-accounts strong{grid-row:1/3;color:#146746;font-size:2rem;line-height:1}.analytics-connected-accounts p{margin:2px 0 0;color:#617d76;font-size:.72rem}
:global(:root[data-theme='dark']) .analytics-connected-accounts{border-color:#356956;background:linear-gradient(115deg,#17372c,#172f2b)}:global(:root[data-theme='dark']) .analytics-connected-accounts small,:global(:root[data-theme='dark']) .analytics-connected-accounts p{color:#a9c9be}:global(:root[data-theme='dark']) .analytics-connected-accounts strong{color:#74d6aa}:global(:root[data-theme='dark']) .analytics-tab-title b{color:#b9dce1;background:#29474e}:global(:root[data-theme='dark']) .analytics-tabs button.active .analytics-tab-title b{color:#07566a;background:#fff}
:global(:root[data-theme='dark'] .analytics-tabs) {
  border-color: #3d565e;
  background: #172a30;
}

:global(:root[data-theme='dark'] .analytics-tabs button) { color: #bad0d5; }
:global(:root[data-theme='dark'] .analytics-tabs button:hover) { background: #20383f; }
:global(:root[data-theme='dark'] .analytics-tabs button.active) { color: #fff; border-color: #1595aa; background: #08758b; }

:global(:root[data-theme='dark'] .analytics-presets) {
  border: 1px solid #3d565e;
  background: #20343a;
}

:global(:root[data-theme='dark'] .analytics-presets button) { color: #bad0d5; }
:global(:root[data-theme='dark'] .analytics-presets button:hover) { background: #29434a; }
:global(:root[data-theme='dark'] .analytics-presets button.active) { color: #fff; background: #08758b; }
</style>

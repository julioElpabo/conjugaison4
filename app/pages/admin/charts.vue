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
type StatsTheme = 'summary' | 'audience' | 'pedagogy' | 'usage'
const activeTheme = ref<StatsTheme>('summary')
const realtimeWindow = ref<Exclude<AnalyticsWindow, 'range'>>('30m')
const selectedWindow = ref<AnalyticsWindow>('30m')
const realtimeMenuOpen = ref(false)
const realtimeMenu = ref<HTMLElement | null>(null)
const visibleStats = computed(() => stats.value?.window === selectedWindow.value ? stats.value : null)
const realtimeOptions: Array<{ value: Exclude<AnalyticsWindow, 'range' | '5m'>, label: string }> = [
  { value: 'now', label: 'Maintenant' },
  { value: '3m', label: '3 dernières minutes' },
  { value: '30m', label: '30 dernières minutes' },
]
const selectedRealtimeLabel = computed(() => (
  realtimeOptions.find(option => option.value === realtimeWindow.value)?.label || '30 dernières minutes'
))
const statsThemes: Array<{ id: StatsTheme, label: string, number: string }> = [
  { id: 'summary', label: 'Synthèse générale', number: '01' },
  { id: 'audience', label: 'Audience et géographie', number: '02' },
  { id: 'pedagogy', label: 'Analyse pédagogique', number: '03' },
  { id: 'usage', label: 'Usage des fonctionnalités', number: '04' },
]
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
  realtimeMenuOpen.value = false
  showWindow(tab === 'realtime' ? realtimeWindow.value : 'range')
}

function chooseRealtimeWindow(window: Exclude<AnalyticsWindow, 'range'>) {
  realtimeWindow.value = window
  activeTab.value = 'realtime'
  realtimeMenuOpen.value = false
  showWindow(window)
}

function toggleRealtimeMenu() {
  if (activeTab.value !== 'realtime') {
    activeTab.value = 'realtime'
    showWindow(realtimeWindow.value)
  }
  realtimeMenuOpen.value = !realtimeMenuOpen.value
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

function handleDocumentPointerDown(event: PointerEvent) {
  if (realtimeMenuOpen.value && !realtimeMenu.value?.contains(event.target as Node)) realtimeMenuOpen.value = false
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') realtimeMenuOpen.value = false
}

watch(selectedWindow, () => { configureRefresh(); void loadStats() })
watch(user, (currentUser) => {
  if (!currentUser) { loadedForUserId = null; return }
  if (loadedForUserId !== currentUser.id) { loadedForUserId = currentUser.id; void loadStats() }
}, { immediate: true })
onMounted(() => {
  configureRefresh()
  document.addEventListener('visibilitychange', handleVisibilityChange)
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleDocumentKeydown)
})
onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<template>
  <AdminAuthBoundary>
    <AdminShell>
      <div class="charts-page">
        <header class="admin-section-heading charts-page__heading">
          <h1>Statistiques</h1>
          <div class="stats-tabs" role="tablist" aria-label="Type de statistiques">
            <div ref="realtimeMenu" class="stats-tabs__dropdown">
              <button
                id="stats-tab-realtime"
                type="button"
                role="tab"
                :aria-selected="activeTab === 'realtime'"
                aria-controls="stats-panel-realtime"
                aria-haspopup="menu"
                :aria-expanded="realtimeMenuOpen"
                :class="{ active: activeTab === 'realtime' }"
                @click="toggleRealtimeMenu"
              >
                <span class="stats-tabs__pulse" aria-hidden="true" />
                <span><strong>Aperçu en temps réel</strong><small>{{ selectedRealtimeLabel }}</small></span>
                <span class="stats-tabs__chevron" aria-hidden="true">⌄</span>
              </button>
              <div v-if="realtimeMenuOpen" class="realtime-menu" role="menu" aria-label="Période du temps réel">
                <button
                  v-for="option in realtimeOptions"
                  :key="option.value"
                  type="button"
                  role="menuitemradio"
                  :aria-checked="realtimeWindow === option.value"
                  :class="{ active: realtimeWindow === option.value }"
                  @click="chooseRealtimeWindow(option.value)"
                >
                  <span>{{ option.label }}</span><i aria-hidden="true">{{ realtimeWindow === option.value ? '✓' : '' }}</i>
                </button>
              </div>
            </div>
            <button id="stats-tab-range" type="button" role="tab" :aria-selected="activeTab === 'range'" aria-controls="stats-panel-range" :class="{ active: activeTab === 'range' }" @click="chooseTab('range')">
              <strong>Durée particulière</strong>
              <small>Semaine, mois, année ou dates libres</small>
            </button>
          </div>
          <button class="admin-button" type="button" :disabled="loading" @click="loadStats">{{ loading ? 'Actualisation…' : 'Actualiser' }}</button>
        </header>

        <div
          :id="activeTab === 'realtime' ? 'stats-panel-realtime' : 'stats-panel-range'"
          class="stats-workspace"
          :class="`stats-workspace--${activeTab}`"
          role="tabpanel"
          :aria-labelledby="activeTab === 'realtime' ? 'stats-tab-realtime' : 'stats-tab-range'"
        >
          <aside v-if="activeTab === 'realtime'" class="stats-sidebar stats-sidebar--realtime">
            <div class="stats-sidebar__status">
              <p class="admin-eyebrow">Temps réel</p>
              <strong>{{ selectedRealtimeLabel }}</strong>
              <p class="live-status"><i /> Actualisation toutes les 30 secondes</p>
            </div>
            <nav class="stats-theme-menu" role="tablist" aria-label="Thèmes du temps réel" aria-orientation="vertical">
              <button
                v-for="theme in statsThemes"
                :id="`realtime-theme-tab-${theme.id}`"
                :key="theme.id"
                type="button"
                role="tab"
                :aria-selected="activeTheme === theme.id"
                :class="{ active: activeTheme === theme.id }"
                @click="activeTheme = theme.id"
              >
                <span>{{ theme.number }}</span><strong>{{ theme.label }}</strong>
              </button>
            </nav>
          </aside>

          <main class="stats-content">
            <div v-if="loading && !visibleStats" class="charts-page__loading" role="status"><span class="admin-spinner" aria-hidden="true" /><p>Chargement des statistiques…</p></div>
            <div v-else-if="error && !visibleStats" class="charts-page__loading"><p class="admin-notice admin-notice--error" role="alert">{{ error }}</p><button class="admin-button" type="button" @click="loadStats">Réessayer</button></div>
            <template v-else-if="visibleStats">
              <p v-if="error" class="admin-notice admin-notice--error" role="alert">{{ error }}</p>
              <AdminStatsProgression v-if="activeTab === 'range' && rangeView === 'progression'" v-model:theme="activeTheme" :stats="visibleStats" />
              <AdminStatsDashboard v-else v-model:theme="activeTheme" :stats="visibleStats" />
              <p class="updated-at">Dernière actualisation : {{ new Date(visibleStats.local.generatedAt).toLocaleTimeString('fr-CH') }}</p>
            </template>
          </main>

          <aside v-if="activeTab === 'range'" class="stats-sidebar stats-sidebar--range">
            <section class="period-picker">
              <div>
                <p class="admin-eyebrow">Plage de temps</p>
                <h2>Durée analysée</h2>
              </div>
              <div class="period-picker__presets">
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
                <button class="admin-button" type="submit">Afficher</button>
              </form>
              <div class="range-view" role="group" aria-label="Présentation des statistiques">
                <button type="button" :class="{ active: rangeView === 'summary' }" :aria-pressed="rangeView === 'summary'" @click="rangeView = 'summary'">
                  <strong>Synthèse</strong><small>Totaux de la durée</small>
                </button>
                <button type="button" :class="{ active: rangeView === 'progression' }" :aria-pressed="rangeView === 'progression'" @click="rangeView = 'progression'">
                  <strong>Progression</strong><small>Évolution temporelle</small>
                </button>
              </div>
            </section>
            <nav class="stats-theme-menu" role="tablist" aria-label="Thèmes de la période" aria-orientation="vertical">
              <button
                v-for="theme in statsThemes"
                :id="`range-theme-tab-${theme.id}`"
                :key="theme.id"
                type="button"
                role="tab"
                :aria-selected="activeTheme === theme.id"
                :class="{ active: activeTheme === theme.id }"
                @click="activeTheme = theme.id"
              >
                <span>{{ theme.number }}</span><strong>{{ theme.label }}</strong>
              </button>
            </nav>
          </aside>
        </div>
      </div>
    </AdminShell>
  </AdminAuthBoundary>
</template>

<style scoped>
.charts-page{display:grid;gap:20px}.charts-page__heading{display:grid;grid-template-columns:auto minmax(460px,720px) auto;align-items:center;gap:24px}.charts-page__heading h1{margin:0}.stats-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));justify-self:center;width:100%;gap:8px}.stats-tabs__dropdown{position:relative;min-width:0}.stats-tabs>button,.stats-tabs__dropdown>button{display:grid;position:relative;width:100%;min-height:62px;padding:9px 16px;align-content:center;gap:1px;border:2px solid #cfdee2;border-radius:13px;color:var(--admin-navy);background:#fff;text-align:left;cursor:pointer;transition:border-color .15s,background .15s,transform .15s}.stats-tabs__dropdown>button{grid-template-columns:1fr auto;align-items:center}.stats-tabs>button:hover,.stats-tabs__dropdown>button:hover{border-color:#76adba;transform:translateY(-1px)}.stats-tabs>button.active,.stats-tabs__dropdown>button.active{color:#fff;border-color:#08758b;background:linear-gradient(135deg,#08758b,#125c70);box-shadow:0 7px 18px rgb(8 117 139 / 18%)}.stats-tabs strong{display:block;font-size:.9rem}.stats-tabs small{display:block;color:var(--admin-muted);font-size:.67rem}.stats-tabs button.active small{color:#d7eff4}.stats-tabs__pulse{position:absolute;top:9px;right:10px;width:7px;height:7px;border-radius:50%;background:#43d58c;box-shadow:0 0 0 3px rgb(67 213 140 / 18%)}.stats-tabs__chevron{padding-right:5px;font-size:1.2rem;line-height:1}.realtime-menu{position:absolute;z-index:20;top:calc(100% + 7px);left:0;right:0;display:grid;padding:6px;gap:3px;border:1px solid #bfd3d8;border-radius:13px;background:#fff;box-shadow:0 15px 35px rgb(19 55 65 / 20%)}.realtime-menu button{display:flex;padding:10px 11px;align-items:center;justify-content:space-between;gap:12px;border:0;border-radius:9px;color:var(--admin-navy);background:transparent;font:inherit;font-size:.78rem;font-weight:800;cursor:pointer}.realtime-menu button:hover{background:#edf6f7}.realtime-menu button.active{color:#08758b;background:#e4f3f5}.realtime-menu i{font-style:normal}
.stats-workspace{display:grid;min-width:0;align-items:start;gap:20px}.stats-workspace--realtime{grid-template-columns:minmax(190px,230px) minmax(0,1fr)}.stats-workspace--range{grid-template-columns:minmax(235px,280px) minmax(0,1fr)}.stats-workspace--range .stats-content{grid-column:2;grid-row:1}.stats-sidebar--range{grid-column:1;grid-row:1}.stats-content{min-width:0;display:grid;gap:16px}.stats-sidebar{position:sticky;top:148px;display:grid;padding:13px;gap:14px;border:1px solid #cbdde2;border-radius:16px;background:#f4f9fa}.stats-sidebar__status{display:grid;padding:7px 8px 12px;gap:4px;border-bottom:1px solid #d8e6e9}.stats-sidebar__status p,.stats-sidebar__status strong{margin:0}.stats-sidebar__status>strong{color:var(--admin-navy);font-size:.9rem}.stats-theme-menu{display:grid;gap:5px}.stats-theme-menu button{display:grid;grid-template-columns:31px minmax(0,1fr);min-height:48px;padding:7px 9px;align-items:center;gap:9px;border:0;border-radius:10px;color:#49636c;background:transparent;text-align:left;font:inherit;cursor:pointer}.stats-theme-menu button:hover{color:var(--admin-navy);background:#fff}.stats-theme-menu button.active{color:#fff;background:#08758b;box-shadow:0 5px 13px rgb(8 117 139 / 18%)}.stats-theme-menu button>span{display:grid;width:29px;height:29px;place-items:center;border-radius:8px;color:#08758b;background:#dceff2;font-size:.67rem;font-weight:900}.stats-theme-menu button.active>span{color:#08758b;background:#fff}.stats-theme-menu strong{font-size:.75rem;line-height:1.2}
.period-picker{display:grid;gap:13px}.period-picker h2{margin:2px 0 0;color:var(--admin-navy);font-size:1rem}.period-picker__presets{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.period-picker button:not(.admin-button),.range-view button{padding:8px 9px;border:1px solid #bdd2d7;border-radius:9px;background:#fff;color:var(--admin-navy);font:inherit;font-size:.75rem;font-weight:750;cursor:pointer}.period-picker button.active,.range-view button.active{color:#fff;border-color:#08758b;background:#08758b}.period-picker__custom{display:grid;gap:8px}.period-picker__custom label{display:grid;gap:4px;color:var(--admin-muted);font-size:.72rem;font-weight:800}.period-picker__custom input{min-width:0;width:100%;padding:8px 9px;border:1px solid #bdd2d7;border-radius:8px;color:var(--admin-navy);background:#fff;font:inherit}.period-picker__custom .admin-button{justify-content:center}.range-view{display:grid;grid-template-columns:1fr 1fr;padding-top:12px;gap:6px;border-top:1px solid #d8e6e9}.range-view button{display:grid;padding:9px;gap:2px;text-align:left}.range-view button strong{font-size:.78rem}.range-view button small{color:var(--admin-muted);font-size:.62rem;font-weight:600}.range-view button.active small{color:#d7eff4}.live-status{margin:5px 0 0!important;color:#47717a;font-size:.67rem;line-height:1.35}.live-status i{display:inline-block;width:7px;height:7px;margin-right:4px;border-radius:50%;background:#2ba96c;box-shadow:0 0 0 3px #dff5e9}.charts-page__loading{display:flex;min-height:260px;padding:28px;align-items:center;justify-content:center;flex-direction:column;gap:14px;color:var(--admin-muted);background:#f7fafb;border-radius:12px}.charts-page__loading p,.updated-at{margin:0}.updated-at{text-align:right;color:var(--admin-muted);font-size:.75rem}
:global(:root[data-theme='dark']) .stats-tabs>button,:global(:root[data-theme='dark']) .stats-tabs__dropdown>button,:global(:root[data-theme='dark']) .period-picker button:not(.admin-button),:global(:root[data-theme='dark']) .range-view button,:global(:root[data-theme='dark']) .period-picker__custom input{color:var(--admin-navy);border-color:#49616a;background:#192b30}:global(:root[data-theme='dark']) .stats-tabs button.active,:global(:root[data-theme='dark']) .period-picker button.active,:global(:root[data-theme='dark']) .range-view button.active{color:#fff;border-color:#4ba4b9;background:linear-gradient(135deg,#176b7f,#174b5b)}:global(:root[data-theme='dark']) .stats-sidebar{border-color:#3c555d;background:#182c31}:global(:root[data-theme='dark']) .stats-sidebar__status{border-color:#3c555d}:global(:root[data-theme='dark']) .stats-theme-menu button:hover{background:#263e45}:global(:root[data-theme='dark']) .realtime-menu{border-color:#49616a;background:#192b30}:global(:root[data-theme='dark']) .realtime-menu button:hover{background:#263e45}:global(:root[data-theme='dark']) .realtime-menu button.active{color:#a6dce7;background:#24434b}:global(:root[data-theme='dark']) .live-status{color:#a9c8cf}
@media(max-width:1100px){.charts-page__heading{grid-template-columns:auto 1fr}.charts-page__heading>.admin-button{grid-column:1/-1;justify-self:end}.stats-tabs{min-width:0}.stats-workspace--realtime{grid-template-columns:190px minmax(0,1fr)}.stats-workspace--range{grid-template-columns:240px minmax(0,1fr)}}
@media(max-width:820px){.charts-page__heading{grid-template-columns:1fr}.charts-page__heading>.admin-button{grid-column:auto}.stats-tabs{justify-self:stretch}.stats-workspace--realtime,.stats-workspace--range{grid-template-columns:1fr}.stats-workspace--range .stats-content{grid-column:1;grid-row:2}.stats-sidebar{position:static}.stats-sidebar--range{grid-column:1;grid-row:1}.stats-theme-menu{grid-template-columns:repeat(2,minmax(0,1fr))}.period-picker__custom{grid-template-columns:1fr 1fr}.period-picker__custom .admin-button{grid-column:1/-1}}
@media(max-width:650px){.charts-page__heading{align-items:stretch}.stats-tabs{grid-template-columns:1fr}.stats-tabs>button,.stats-tabs__dropdown>button{min-height:56px}.stats-theme-menu,.period-picker__custom{grid-template-columns:1fr}.period-picker__custom .admin-button{grid-column:auto}}
</style>

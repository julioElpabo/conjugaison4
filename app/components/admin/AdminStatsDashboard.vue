<script setup lang="ts">
import type { AnalyticsOverview, AnalyticsResponse } from '../../../shared/types/analytics'
import AdminFeatureUsageChart from './AdminFeatureUsageChart.vue'
import AdminTrendChart from './AdminTrendChart.vue'

const props = defineProps<{ stats: AnalyticsResponse }>()
type DashboardTheme = 'summary' | 'audience' | 'pedagogy' | 'usage'
const activeTheme = defineModel<DashboardTheme>('theme', { default: 'summary' })
const audience = computed<AnalyticsOverview>(() => {
  const ga4 = props.stats.ga4
  const hasCachedGa4Data = Boolean(ga4?.countries.length || ga4?.activity.length || ga4?.activeUsers)
  return ga4?.configured && (!ga4.notice || hasCachedGa4Data) ? ga4 : props.stats.local
})
const pedagogy = computed(() => props.stats.local)
const isRealtime = computed(() => props.stats.window !== 'range')
const rangeDays = computed(() => Math.max(1, Math.round(
  (Date.parse(`${props.stats.endDate}T12:00:00Z`) - Date.parse(`${props.stats.startDate}T12:00:00Z`)) / 86400000,
) + 1))
const activityResolution = computed(() => isRealtime.value ? 'minutes' : rangeDays.value <= 45 ? 'days' : rangeDays.value <= 210 ? 'weeks' : 'months')

function normalizedDate(value: string) {
  return /^\d{8}$/u.test(value) ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}` : value.slice(0, 10)
}

function activityBucket(value: string) {
  const normalized = normalizedDate(value)
  if (activityResolution.value === 'days' || activityResolution.value === 'minutes') return normalized
  if (activityResolution.value === 'months') return `${normalized.slice(0, 7)}-01`
  const date = new Date(`${normalized}T12:00:00Z`)
  if (Number.isNaN(date.getTime())) return normalized
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() - day + 1)
  return date.toISOString().slice(0, 10)
}

const displayActivity = computed(() => {
  if (isRealtime.value) return audience.value.activity
  const values = new Map<string, number>()
  for (const point of audience.value.activity) {
    const date = activityBucket(point.date)
    values.set(date, (values.get(date) || 0) + point.value)
  }
  return [...values].sort(([left], [right]) => left.localeCompare(right)).map(([date, value]) => ({ date, value }))
})
const maximum = computed(() => Math.max(1, ...displayActivity.value.map(item => item.value)))
const activityTimeUnit = computed(() => activityResolution.value === 'days'
  ? 'Jours'
  : activityResolution.value === 'weeks'
    ? 'Semaines'
    : activityResolution.value === 'months' ? 'Mois' : 'Minutes')
const activityValueUnit = computed(() => audience.value.source === 'ga4' ? 'Sessions' : 'Événements locaux')

const cards = computed(() => isRealtime.value
  ? [
      { label: 'Visiteurs actifs', value: audience.value.activeUsers, hint: audience.value.source === 'ga4' ? 'Google Analytics' : 'Mesure locale' },
      { label: 'Exercices lancés', value: pedagogy.value.exerciseStarted, hint: `${pedagogy.value.exerciseCompleted} terminés` },
      { label: 'Réponses envoyées', value: pedagogy.value.submittedAnswers, hint: `${pedagogy.value.correctAnswers} correctes` },
      { label: 'Taux de réussite', value: `${pedagogy.value.successRate} %`, hint: 'réponses correctes' },
    ]
  : [
      { label: 'Visiteurs', value: audience.value.activeUsers, hint: audience.value.source === 'ga4' ? 'Google Analytics' : 'Mesure locale' },
      { label: 'Sessions', value: audience.value.sessions, hint: 'sur la période choisie' },
      { label: 'Exercices terminés', value: pedagogy.value.exerciseCompleted, hint: `${pedagogy.value.exerciseStarted} lancés` },
      { label: 'Taux de complétion', value: `${pedagogy.value.completionRate} %`, hint: 'terminés / lancés' },
    ])

const learningMetrics = computed(() => [
  { label: 'Exercices lancés', value: pedagogy.value.exerciseStarted },
  { label: 'Exercices terminés', value: pedagogy.value.exerciseCompleted },
  { label: 'Réponses envoyées', value: pedagogy.value.submittedAnswers },
  { label: 'Réponses correctes', value: pedagogy.value.correctAnswers },
  { label: 'Complétion', value: `${pedagogy.value.completionRate} %` },
  { label: 'Réussite', value: `${pedagogy.value.successRate} %` },
])

const usageMetrics = computed(() => [
  { label: 'Aides ouvertes', value: pedagogy.value.helpOpened },
  { label: 'Défis chargés', value: pedagogy.value.challengeLoads },
  { label: 'Défis créés', value: pedagogy.value.challengeSaves },
  { label: 'PDF', value: pedagogy.value.pdfDownloads },
  { label: 'Word', value: pedagogy.value.wordDownloads },
  { label: 'Événements', value: pedagogy.value.events },
])

const geographicFacts = computed(() => {
  const countries = audience.value.countries.filter(item => item.value > 0)
  const cities = audience.value.cities.filter(item => item.value > 0 && item.label !== '(not set)')
  return [
    { label: 'Pays actifs', value: countries.length },
    { label: 'Villes détectées', value: cities.length },
    { label: 'Premier pays', value: countries[0]?.label || '—', detail: countries[0] ? `${number(countries[0].value)} visiteurs` : '' },
    { label: 'Première ville', value: cities[0]?.label || '—', detail: cities[0] ? `${number(cities[0].value)} visiteurs` : '' },
  ]
})

const eventLabels: Record<string, string> = {
  challenge_preset_selected: 'Défis prédéfinis',
  challenge_load: 'Défis chargés', challenge_save: 'Défis créés', exercise_started: 'Exercices lancés',
  exercise_completed: 'Exercices terminés', answer_submitted: 'Réponses envoyées', answer_correct: 'Bonnes réponses',
  answer_retry: 'Nouvelles tentatives', help_opened: 'Aides ouvertes', coach_selected: 'Coachs choisis',
  print_opened: 'Aperçus impression', pdf_downloaded: 'PDF téléchargés', word_downloaded: 'Word téléchargés',
  legacy_print_opened: 'Aperçus impression (historique)',
  client_error: 'Erreurs côté navigateur',
}
const pedagogicalEventNames = new Set([
  'exercise_started', 'exercise_completed', 'answer_submitted', 'answer_correct',
  'answer_retry', 'help_opened', 'coach_selected',
])
const actionRows = computed(() => pedagogy.value.eventBreakdown
  .filter(item => item.label !== 'page_view' && item.label !== 'homepage'))
const pedagogicalActionRows = computed(() => actionRows.value
  .filter(item => pedagogicalEventNames.has(item.label))
  .slice(0, 8))
const featureActionRows = computed(() => actionRows.value
  .filter(item => !pedagogicalEventNames.has(item.label))
  .slice(0, 8))

function number(value: number) {
  return value.toLocaleString('fr-CH')
}

function dateLabel(value: string) {
  const normalized = normalizedDate(value)
  if (/^\d{4}-\d{2}-\d{2}$/u.test(normalized)) {
    const date = new Date(`${normalized}T12:00:00`)
    if (activityResolution.value === 'days') {
      return new Intl.DateTimeFormat('fr-CH', { weekday: 'short', day: 'numeric', month: 'short' }).format(date)
    }
    if (activityResolution.value === 'weeks') {
      return `sem. ${new Intl.DateTimeFormat('fr-CH', { day: 'numeric', month: 'short' }).format(date)}`
    }
    if (activityResolution.value === 'months') {
      return new Intl.DateTimeFormat('fr-CH', { month: 'short', year: 'numeric' }).format(date)
    }
    return new Intl.DateTimeFormat('fr-CH', { hour: '2-digit', minute: '2-digit' }).format(date)
  }
  const match = value.match(/(\d{2}):(\d{2})/u)
  return match ? `${match[1]}:${match[2]}` : value
}

function showActivityLabel(index: number) {
  const count = displayActivity.value.length
  if (count <= 10) return true
  const maximumLabels = count <= 20 ? 7 : 6
  const step = Math.max(1, Math.ceil((count - 1) / (maximumLabels - 1)))
  return index === 0 || index === count - 1 || index % step === 0
}
</script>

<template>
  <div class="stats-dashboard">
    <p v-if="pedagogy.notice" class="admin-notice">{{ pedagogy.notice }}</p>
    <p v-if="stats.ga4?.notice" class="admin-notice admin-notice--warning">{{ stats.ga4.notice }}</p>

    <section
      v-show="activeTheme === 'summary'"
      id="summary-theme-panel-summary"
      class="dashboard-theme"
      role="tabpanel"
    >
      <div class="kpi-grid" aria-label="Indicateurs principaux">
        <article v-for="card in cards" :key="card.label" class="kpi admin-card">
          <span>{{ card.label }}</span>
          <strong>{{ typeof card.value === 'number' ? number(card.value) : card.value }}</strong>
          <small>{{ card.hint }}</small>
        </article>
      </div>
    </section>

    <section
      v-show="activeTheme === 'audience'"
      id="summary-theme-panel-audience"
      class="dashboard-theme"
      role="tabpanel"
    >
      <AdminGeoActivityMap
        :countries="stats.ga4?.countries || []"
        :regions="stats.ga4?.regions || []"
        :cities="stats.ga4?.cities || []"
        :realtime="isRealtime"
        :notice="stats.ga4?.notice"
      />

      <section class="admin-card dashboard-context">
        <div class="section-heading">
          <div><p class="admin-eyebrow">En un coup d’œil</p><h2>Répartition géographique</h2></div>
          <span class="source-badge">{{ audience.source === 'ga4' ? 'GA4' : 'Locale' }}</span>
        </div>
        <div class="fact-grid">
          <article v-for="fact in geographicFacts" :key="fact.label">
            <span>{{ fact.label }}</span>
            <strong>{{ fact.value }}</strong>
            <small v-if="fact.detail">{{ fact.detail }}</small>
          </article>
        </div>
      </section>

      <div class="audience-donuts">
        <AdminFeatureUsageChart
          v-if="audience.devices.length"
          :items="audience.devices"
          title="Répartition des appareils"
          eyebrow="Environnement"
          center-label="appareils"
          insight="Montre la part du mobile, de la tablette et de l’ordinateur afin d’adapter en priorité l’interface aux équipements réellement utilisés."
        />
        <AdminFeatureUsageChart
          v-if="!isRealtime && (audience.newUsers || audience.returningUsers)"
          :items="[
            { label: 'Nouveaux visiteurs', value: audience.newUsers },
            { label: 'Visiteurs connus', value: audience.returningUsers },
          ]"
          title="Nouveaux et visiteurs connus"
          eyebrow="Fidélisation"
          center-label="visiteurs"
          insight="Indique si l’audience de la période vient surtout de nouvelles découvertes ou d’utilisateurs qui reviennent."
        />
      </div>

      <div class="dashboard-row dashboard-row--activity">
        <section v-if="isRealtime" class="activity admin-card">
          <div class="section-heading">
            <div><p class="admin-eyebrow">Fréquentation</p><h2>{{ isRealtime ? 'Activité minute par minute' : 'Évolution sur la période' }}</h2></div>
          </div>
          <div v-if="displayActivity.length" class="activity__plot">
            <div v-for="(point, index) in displayActivity" :key="point.date" class="activity__column" :title="`${dateLabel(point.date)} : ${point.value}`">
              <b>{{ point.value }}</b>
              <i :style="{ height: `${Math.max(3, point.value / maximum * 100)}%` }" />
              <time :class="{ hidden: !showActivityLabel(index) }">{{ dateLabel(point.date) }}</time>
            </div>
          </div>
          <div v-if="displayActivity.length" class="activity__axes"><span>Axe Y · {{ activityValueUnit }}</span><span>Axe X · {{ activityTimeUnit }}</span></div>
          <p v-else class="empty">Aucune activité enregistrée sur cette période.</p>
        </section>
        <AdminTrendChart
          v-else
          eyebrow="Fréquentation"
          title="Évolution sur la période"
          :insight="audience.source === 'ga4'
            ? 'La courbe fait ressortir les jours, semaines ou mois de forte fréquentation sans donner une importance excessive à chaque valeur isolée.'
            : 'GA4 étant indisponible, cette courbe montre temporairement les événements enregistrés directement par le site.'"
          :x-unit="activityTimeUnit"
          :y-unit="activityValueUnit"
          :series="[{ label: activityValueUnit, color: '#168eaa', points: displayActivity }]"
        />

        <section class="admin-card panel audience-panel">
          <div class="section-heading"><div><p class="admin-eyebrow">Audience</p><h2>Langues des navigateurs</h2></div></div>
          <template v-if="!isRealtime">
            <ol class="ranking ranking--compact">
              <li v-for="item in audience.languages.slice(0, 5)" :key="item.label"><span>{{ item.label }}</span><strong>{{ number(item.value) }}</strong></li>
            </ol>
          </template>
          <p v-if="isRealtime || !audience.languages.length" class="empty">Les langues sont disponibles pour une durée particulière.</p>
        </section>
      </div>
    </section>

    <section
      v-show="activeTheme === 'pedagogy'"
      id="summary-theme-panel-pedagogy"
      class="dashboard-theme"
      role="tabpanel"
    >
      <div class="dashboard-row dashboard-row--two">
        <section class="admin-card panel metric-panel">
          <div class="section-heading"><div><p class="admin-eyebrow">Apprentissage</p><h2>Progression pédagogique</h2></div></div>
          <dl class="metric-list">
            <div v-for="metric in learningMetrics" :key="metric.label">
              <dt>{{ metric.label }}</dt>
              <dd>{{ typeof metric.value === 'number' ? number(metric.value) : metric.value }}</dd>
            </div>
          </dl>
        </section>
        <section class="admin-card panel">
          <div class="section-heading"><div><p class="admin-eyebrow">Comportements</p><h2>Actions d’apprentissage</h2></div></div>
          <ol v-if="pedagogicalActionRows.length" class="ranking">
            <li v-for="item in pedagogicalActionRows" :key="item.label"><span>{{ eventLabels[item.label] || item.label }}</span><strong>{{ number(item.value) }}</strong></li>
          </ol>
          <p v-else class="empty">Les actions pédagogiques apparaîtront à partir de maintenant.</p>
        </section>
      </div>
    </section>

    <section
      v-show="activeTheme === 'usage'"
      id="summary-theme-panel-usage"
      class="dashboard-theme"
      role="tabpanel"
    >
      <AdminFeatureUsageChart
        :items="pedagogy.featureUsage || []"
        insight="Compare la part des exercices classiques, des conversations avec un coach et des ouvertures de l’impression sur toute la sélection."
      />
      <div class="dashboard-row dashboard-row--two">
        <section class="admin-card panel metric-panel">
          <div class="section-heading"><div><p class="admin-eyebrow">Outils</p><h2>Utilisation des fonctions</h2></div></div>
          <dl class="metric-list metric-list--compact">
            <div v-for="metric in usageMetrics" :key="metric.label">
              <dt>{{ metric.label }}</dt>
              <dd>{{ number(metric.value) }}</dd>
            </div>
          </dl>
        </section>
        <section class="admin-card panel actions-panel">
          <div class="section-heading"><div><p class="admin-eyebrow">Autres actions</p><h2>{{ isRealtime ? 'En cours' : 'Sur la période' }}</h2></div></div>
          <ol v-if="featureActionRows.length" class="ranking">
            <li v-for="item in featureActionRows" :key="item.label"><span>{{ eventLabels[item.label] || item.label }}</span><strong>{{ number(item.value) }}</strong></li>
          </ol>
          <p v-else class="empty">Les autres actions apparaîtront à partir de maintenant.</p>
        </section>
      </div>
    </section>
  </div>
</template>

<style scoped>
.stats-dashboard{display:grid;gap:18px}.kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:13px}.kpi{position:relative;display:grid;min-height:118px;padding:17px 19px;align-content:center;gap:3px;overflow:hidden;box-shadow:none}.kpi::after{position:absolute;content:'';right:-24px;bottom:-34px;width:92px;height:92px;border-radius:50%;background:rgb(39 158 181 / 8%)}.kpi span,.kpi small{position:relative;z-index:1;color:var(--admin-muted)}.kpi span{font-size:.72rem;font-weight:850;text-transform:uppercase;letter-spacing:.055em}.kpi strong{position:relative;z-index:1;color:var(--admin-navy);font-size:clamp(1.65rem,3vw,2.35rem);line-height:1.12}.dashboard-context,.activity,.panel{min-width:0;padding:clamp(17px,2vw,23px);box-shadow:none}.section-heading{display:flex;align-items:start;justify-content:space-between;gap:15px}.section-heading h2{margin:3px 0 16px;color:var(--admin-navy);font-size:1.12rem}.source-badge{padding:5px 9px;border-radius:999px;background:#e8f5f7;color:#176b7e;font-size:.72rem;font-weight:900}.fact-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.fact-grid article{display:grid;min-height:76px;padding:11px 13px;align-content:center;gap:2px;border:1px solid #dce9ec;border-radius:11px;background:#f6fafb}.fact-grid span{color:var(--admin-muted);font-size:.68rem;font-weight:800;text-transform:uppercase}.fact-grid strong{overflow:hidden;color:var(--admin-navy);font-size:1.05rem;text-overflow:ellipsis;white-space:nowrap}.fact-grid small{color:var(--admin-muted);font-size:.7rem}.dashboard-row{display:grid;gap:18px}.dashboard-row--activity{grid-template-columns:minmax(0,2fr) minmax(280px,1fr)}.dashboard-row--details{grid-template-columns:repeat(3,minmax(0,1fr));align-items:start}.activity__plot{height:238px;display:flex;gap:clamp(3px,1vw,12px);align-items:end;overflow-x:auto;padding:28px 4px 8px;margin-top:8px;border-bottom:1px solid #d8e3e7}.activity__column{height:100%;min-width:28px;flex:1;display:grid;grid-template-rows:20px 1fr 39px;align-items:end;text-align:center;color:var(--admin-muted);font-size:.65rem}.activity__column b{font-size:.68rem}.activity__column i{display:block;width:min(100%,30px);min-height:3px;margin:auto;background:linear-gradient(#32a9bf,#08758b);border-radius:6px 6px 0 0}.activity__column time{align-self:center;white-space:nowrap;transform:rotate(-35deg);transform-origin:center;font-size:.61rem}.activity__column time.hidden{visibility:hidden}.activity__axes{display:flex;justify-content:space-between;gap:12px;padding-top:7px;color:var(--admin-muted);font-size:.64rem;font-weight:800}.metric-list{display:grid;margin:0;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.metric-list>div{display:grid;min-height:70px;padding:10px 12px;align-content:center;gap:3px;border-radius:10px;background:#f2f8f9}.metric-list dt{color:var(--admin-muted);font-size:.7rem;font-weight:750}.metric-list dd{margin:0;color:var(--admin-navy);font-size:1.2rem;font-weight:900}.metric-list--compact>div{min-height:60px}.ranking{display:grid;margin:0;padding:0;list-style:none}.ranking li{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid #e7eef0}.ranking li:last-child{border:0}.ranking span{overflow-wrap:anywhere;color:#344d58}.ranking strong{color:var(--admin-navy)}.ranking--compact li{padding:5px 0;font-size:.82rem}.audience-panel h3{margin:14px 0 5px;color:var(--admin-muted);font-size:.7rem;letter-spacing:.06em;text-transform:uppercase}.empty{color:var(--admin-muted);margin:14px 0 0}.audience-split{display:grid;grid-template-columns:1fr 1fr;gap:8px}.audience-split div{display:grid;padding:11px;border-radius:10px;background:#f2f8f9}.audience-split strong{font-size:1.3rem;color:var(--admin-navy)}.audience-split span{color:var(--admin-muted);font-size:.72rem}
.dashboard-theme{display:grid;gap:15px}.dashboard-row--two{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}
.audience-donuts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:15px}
:global(:root[data-theme='dark']) .fact-grid article,:global(:root[data-theme='dark']) .metric-list>div,:global(:root[data-theme='dark']) .audience-split div{border-color:#3f5961;background:#20373d}
@media(max-width:1050px){.kpi-grid,.fact-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:780px){.dashboard-row--activity,.dashboard-row--two{grid-template-columns:1fr}}@media(max-width:650px){.kpi-grid,.fact-grid{grid-template-columns:1fr}.activity__plot{height:190px}.metric-list{grid-template-columns:1fr 1fr}}
</style>

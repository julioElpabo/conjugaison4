<script setup lang="ts">
import type {
  AnalyticsResponse,
  AnalyticsSeriesPoint,
  AnalyticsUsageResponse,
  AnalyticsUsersResponse,
} from '~~/shared/types/analytics'

const props = defineProps<{
  stats: AnalyticsResponse
  usage: AnalyticsUsageResponse
  users: AnalyticsUsersResponse
}>()

type InsightTone = 'positive' | 'attention' | 'neutral'
interface DashboardInsight {
  title: string
  detail: string
  tone: InsightTone
}

const local = computed(() => props.stats.local)
const eventCounts = computed(() => new Map(local.value.eventBreakdown.map(item => [item.label, item.value])))
const count = (name: string) => eventCounts.value.get(name) || 0
const number = (value: number) => new Intl.NumberFormat('fr-CH').format(value)
const percentage = (value: number) => `${new Intl.NumberFormat('fr-CH', { maximumFractionDigits: 1 }).format(value)} %`
const periodLabel = computed(() => {
  const format = (value: string) => new Intl.DateTimeFormat('fr-CH', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`))
  return `${format(props.stats.startDate)} – ${format(props.stats.endDate)}`
})
const periodDays = computed(() => Math.max(1, Math.round(
  (Date.parse(`${props.stats.endDate}T12:00:00Z`) - Date.parse(`${props.stats.startDate}T12:00:00Z`)) / 86400000,
) + 1))
const exerciseXUnit = computed(() => periodDays.value <= 2 ? 'Heures' : 'Jours')

function totalSeries(name: string) {
  return (local.value.series[name] || []).reduce((sum, point) => sum + point.value, 0)
}

function seriesTrend(name: string) {
  const points = local.value.series[name] || []
  const start = Date.parse(`${props.stats.startDate}T12:00:00Z`)
  const end = Date.parse(`${props.stats.endDate}T12:00:00Z`)
  const middle = start + (end - start) / 2
  let before = 0
  let after = 0
  for (const point of points) {
    const timestamp = Date.parse(`${point.date.slice(0, 10)}T12:00:00Z`)
    if (timestamp <= middle) before += point.value
    else after += point.value
  }
  if (!before) return { before, after, change: after ? null : 0 }
  return { before, after, change: Math.round((after - before) / before * 1000) / 10 }
}

const exerciseTrend = computed(() => seriesTrend('exercise_started'))
const activeAccountRate = computed(() => (
  props.users.totalAccounts ? props.users.activeAccounts / props.users.totalAccounts * 100 : 0
))
const reviewRate = computed(() => (
  props.users.activeAccounts ? props.users.errorReviewUsers / props.users.activeAccounts * 100 : 0
))
const testedLanguages = computed(() => count('language_tested'))
const usedLanguages = computed(() => count('language_used'))
const languageUseRate = computed(() => (
  testedLanguages.value ? usedLanguages.value / testedLanguages.value * 100 : 0
))
const meaningfulVolume = computed(() => (
  local.value.exerciseStarted + local.value.submittedAnswers + props.usage.summary.activeFeatureSessions
))
const insufficientData = computed(() => meaningfulVolume.value < 10 || local.value.sessions < 5)

const topFeatures = computed(() => [...props.usage.features]
  .map(row => ({ ...row, activity: row.starts || row.selections || row.completions }))
  .filter(row => row.activity > 0)
  .sort((left, right) => right.activity - left.activity)
  .slice(0, 4))
const topPreset = computed(() => [...props.usage.presets]
  .filter(row => row.starts > 0)
  .sort((left, right) => right.starts - left.starts)[0])
const mainLanguage = computed(() => props.users.languages[0])
const mainAnonymousLanguage = computed(() => props.users.anonymousExerciseLanguages[0])

function trendDetail(label: string, trend: { before: number, after: number, change: number | null }) {
  if (trend.change === null) return `${label} apparaît dans la seconde moitié de la période, sans base antérieure suffisante.`
  if (!trend.before && !trend.after) return `Aucune donnée « ${label.toLocaleLowerCase('fr-CH')} » sur la période.`
  const direction = trend.change >= 0 ? 'progressent' : 'reculent'
  return `${label} ${direction} de ${percentage(Math.abs(trend.change))} entre les deux moitiés de la période.`
}

const insights = computed<DashboardInsight[]>(() => {
  const values: DashboardInsight[] = []
  if (insufficientData.value) {
    values.push({
      title: 'Volume encore faible',
      detail: 'Les tendances sont affichées, mais il faut davantage d’activité avant d’en tirer une conclusion solide.',
      tone: 'neutral',
    })
  }
  else {
    values.push({
      title: exerciseTrend.value.change !== null && exerciseTrend.value.change >= 0
        ? 'Les lancements progressent'
        : 'Les lancements sont à surveiller',
      detail: trendDetail('Les exercices lancés', exerciseTrend.value),
      tone: exerciseTrend.value.change !== null && exerciseTrend.value.change >= 0 ? 'positive' : 'attention',
    })
  }
  if (local.value.exerciseStarted) {
    values.push({
      title: local.value.completionRate >= 60 ? 'Bonne continuité des exercices' : 'Des exercices restent inachevés',
      detail: `${percentage(local.value.completionRate)} des exercices commencés sont terminés sur cette période.`,
      tone: local.value.completionRate >= 60 ? 'positive' : 'attention',
    })
  }
  if (props.users.totalAccounts) {
    values.push({
      title: `${percentage(activeAccountRate.value)} des comptes sont actifs`,
      detail: `${number(props.users.activeAccounts)} compte${props.users.activeAccounts > 1 ? 's' : ''} actif${props.users.activeAccounts > 1 ? 's' : ''} durant les ${props.users.activityDays} derniers jours, sur ${number(props.users.totalAccounts)} comptes.`,
      tone: activeAccountRate.value >= 25 ? 'positive' : 'neutral',
    })
  }
  if (props.users.errorReviewUsers) {
    values.push({
      title: 'Les erreurs sont retravaillées',
      detail: `${number(props.users.errorReviewUsers)} utilisateur${props.users.errorReviewUsers > 1 ? 's ont' : ' a'} relancé un entraînement composé de ses propres erreurs.`,
      tone: 'positive',
    })
  }
  else {
    values.push({
      title: 'Aucune reprise d’erreurs détectée',
      detail: 'La fonction de révision des erreurs personnelles n’a pas encore été utilisée sur la période.',
      tone: 'attention',
    })
  }
  if (testedLanguages.value) {
    values.push({
      title: `${percentage(languageUseRate.value)} des essais de langue mènent à un usage`,
      detail: `${number(testedLanguages.value)} changements testés et ${number(usedLanguages.value)} langues réellement utilisées ensuite.`,
      tone: languageUseRate.value >= 50 ? 'positive' : 'neutral',
    })
  }
  const clientErrors = count('client_error')
  if (clientErrors) {
    values.push({
      title: 'Erreurs techniques détectées',
      detail: `${number(clientErrors)} erreur${clientErrors > 1 ? 's côté navigateur ont' : ' côté navigateur a'} été enregistrée${clientErrors > 1 ? 's' : ''}.`,
      tone: 'attention',
    })
  }
  return values.slice(0, 5)
})

const funnel = computed(() => {
  const stages = [
    { label: 'Pages visitées', value: totalSeries('page_view') },
    { label: 'Fonctions choisies', value: count('feature_selected') + count('challenge_preset_selected') },
    { label: 'Exercices lancés', value: local.value.exerciseStarted },
    { label: 'Réponses envoyées', value: local.value.submittedAnswers },
    { label: 'Exercices terminés', value: local.value.exerciseCompleted },
  ]
  const maximum = Math.max(1, ...stages.map(stage => stage.value))
  return stages.map(stage => ({ ...stage, width: Math.max(stage.value ? 8 : 0, stage.value / maximum * 100) }))
})

const exerciseSeries = computed(() => [
  { label: 'Lancements', color: '#08758b', points: local.value.series.exercise_started || [] },
  { label: 'Fins', color: '#2b9767', points: local.value.series.exercise_completed || [] },
])
const registrationSeries = computed(() => [
  { label: 'Nouveaux comptes', color: '#7351a6', points: props.users.registrations as AnalyticsSeriesPoint[] },
])
</script>

<template>
  <div class="intelligent-dashboard">
    <header class="dashboard-hero">
      <div>
        <p class="admin-eyebrow">Tableau de bord intelligent</p>
        <h2>Ce qu’il faut retenir</h2>
        <p>{{ periodLabel }} · données enregistrées directement par le site</p>
      </div>
      <span :class="{ 'is-limited': insufficientData }">
        {{ insufficientData ? 'Premières tendances' : 'Données exploitables' }}
      </span>
    </header>

    <section class="dashboard-kpis" aria-label="Indicateurs essentiels">
      <article><span>Apprenants actifs</span><strong>{{ number(users.activeAccounts) }}</strong><small>sur {{ users.activityDays }} jours</small></article>
      <article><span>Exercices lancés</span><strong>{{ number(stats.local.exerciseStarted) }}</strong><small>{{ trendDetail('L’activité', exerciseTrend) }}</small></article>
      <article><span>Exercices terminés</span><strong>{{ percentage(stats.local.completionRate) }}</strong><small>des exercices commencés</small></article>
      <article><span>Réussite</span><strong>{{ percentage(stats.local.successRate) }}</strong><small>{{ number(stats.local.correctAnswers) }} réponses correctes</small></article>
      <article><span>Reprise des erreurs</span><strong>{{ number(users.errorReviewUsers) }}</strong><small>{{ percentage(reviewRate) }} des comptes actifs</small></article>
    </section>

    <section class="dashboard-insights" aria-labelledby="dashboard-insights-title">
      <header><div><p class="admin-eyebrow">Analyse automatique</p><h3 id="dashboard-insights-title">Signaux à suivre</h3></div><small>Les constats changent avec la période</small></header>
      <div>
        <article v-for="insight in insights" :key="insight.title" :class="`is-${insight.tone}`">
          <i aria-hidden="true">{{ insight.tone === 'positive' ? '↗' : insight.tone === 'attention' ? '!' : 'i' }}</i>
          <span><strong>{{ insight.title }}</strong><small>{{ insight.detail }}</small></span>
        </article>
      </div>
    </section>

    <div class="dashboard-main-grid">
      <section class="dashboard-funnel admin-card">
        <header><p class="admin-eyebrow">Parcours</p><h3>Du passage à l’apprentissage</h3><small>Volumes des principales étapes, sans les confondre avec des utilisateurs uniques.</small></header>
        <ol>
          <li v-for="stage in funnel" :key="stage.label">
            <span><b>{{ stage.label }}</b><strong>{{ number(stage.value) }}</strong></span>
            <i><b :style="{ width: `${stage.width}%` }" /></i>
          </li>
        </ol>
      </section>

      <AdminFeatureUsageChart
        :items="users.anonymousExerciseLanguages"
        :max-items="5"
        eyebrow="Exercices sans compte"
        title="Langues des utilisateurs non connectés"
        :insight="mainAnonymousLanguage ? `${mainAnonymousLanguage.label} est utilisée par ${percentage(mainAnonymousLanguage.value / Math.max(1, users.anonymousExerciseSessions) * 100)} des sessions anonymes ayant lancé un exercice.` : 'Aucun exercice anonyme enregistré sur cette période.'"
        center-label="sessions"
      />

      <AdminFeatureUsageChart
        :items="users.languages"
        :max-items="5"
        eyebrow="Comptes"
        title="Langues préférées"
        :insight="mainLanguage ? `${mainLanguage.label} est la langue enregistrée pour ${percentage(mainLanguage.value / Math.max(1, users.totalAccounts) * 100)} des comptes.` : 'Aucune préférence enregistrée.'"
        center-label="comptes"
      />
    </div>

    <div class="dashboard-chart-grid">
      <AdminTrendChart
        title="Activité des exercices"
        eyebrow="Progression"
        :series="exerciseSeries"
        insight="Compare les lancements et les fins d’exercices au fil de la période."
        :x-unit="exerciseXUnit"
        y-unit="Exercices"
      />
      <AdminTrendChart
        title="Créations de comptes"
        eyebrow="Fidélisation"
        :series="registrationSeries"
        insight="Montre quand de nouveaux utilisateurs ont créé leur espace personnel."
        :x-unit="users.registrationUnit"
        y-unit="Nouveaux comptes"
      />
    </div>

    <section class="dashboard-features admin-card">
      <header>
        <div><p class="admin-eyebrow">Fonctionnalités</p><h3>Ce qui attire réellement</h3></div>
        <span v-if="topPreset">Défi en tête : <strong>{{ topPreset.label }}</strong> ({{ number(topPreset.starts) }})</span>
      </header>
      <div v-if="topFeatures.length">
        <article v-for="feature in topFeatures" :key="feature.key">
          <span><strong>{{ feature.label }}</strong><small>{{ number(feature.uniqueSessions) }} sessions distinctes</small></span>
          <b>{{ number(feature.activity) }}</b>
        </article>
      </div>
      <p v-else>Pas encore assez d’utilisation pour classer les fonctionnalités sur cette période.</p>
    </section>

  </div>
</template>

<style scoped>
.intelligent-dashboard{display:grid;gap:14px}.dashboard-hero{display:flex;padding:22px 24px;align-items:center;justify-content:space-between;gap:20px;border-radius:18px;color:#fff;background:linear-gradient(128deg,#083f52,#08758b 62%,#248fa2);box-shadow:0 14px 30px rgb(8 63 82 / 18%)}.dashboard-hero h2{margin:3px 0 5px;font-size:clamp(1.45rem,3vw,2.15rem);letter-spacing:-.035em}.dashboard-hero p{margin:0;color:#d5eef2}.dashboard-hero .admin-eyebrow{color:#8be0df}.dashboard-hero>span{padding:7px 11px;border:1px solid rgb(255 255 255 / 30%);border-radius:999px;background:rgb(255 255 255 / 15%);font-size:.7rem;font-weight:850}.dashboard-hero>span.is-limited{color:#173f4a;background:#ffe6a8}.dashboard-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px}.dashboard-kpis article{display:grid;min-height:112px;padding:14px;border:1px solid #c9dce0;border-radius:14px;align-content:start;gap:4px;background:#fff}.dashboard-kpis span{color:#577078;font-size:.68rem;font-weight:850}.dashboard-kpis strong{color:#073f51;font-size:1.7rem;line-height:1.05}.dashboard-kpis small{color:#71868c;font-size:.61rem;line-height:1.35}.dashboard-insights{display:grid;padding:17px;border:1px solid #c9dce0;border-radius:16px;gap:13px;background:#f7fafb}.dashboard-insights>header,.dashboard-features>header{display:flex;align-items:end;justify-content:space-between;gap:14px}.dashboard-insights h3,.dashboard-features h3,.dashboard-funnel h3{margin:2px 0 0;color:#073f51}.dashboard-insights header small{color:#71868c;font-size:.65rem}.dashboard-insights>div{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:8px}.dashboard-insights article{display:grid;padding:11px;grid-template-columns:30px minmax(0,1fr);gap:9px;border:1px solid #d5e2e4;border-radius:11px;background:#fff}.dashboard-insights article>i{display:grid;width:29px;height:29px;place-items:center;border-radius:9px;font-style:normal;font-weight:900}.dashboard-insights article>span{display:grid;gap:3px}.dashboard-insights article strong{color:#234b57;font-size:.74rem}.dashboard-insights article small{color:#6e8288;font-size:.63rem;line-height:1.4}.dashboard-insights .is-positive>i{color:#187149;background:#dcf4e7}.dashboard-insights .is-attention>i{color:#9a4b27;background:#fbe8d9}.dashboard-insights .is-neutral>i{color:#28678f;background:#e1f0fa}.dashboard-main-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dashboard-main-grid>:deep(.admin-card),.dashboard-chart-grid>:deep(.admin-card){border:1px solid #c9dce0;border-radius:16px;background:#fff}.dashboard-funnel{display:grid;padding:18px;grid-column:1/-1;gap:15px;box-shadow:none}.dashboard-funnel header small{display:block;margin-top:5px;color:#71868c;font-size:.66rem}.dashboard-funnel ol{display:grid;margin:0;padding:0;gap:10px;list-style:none}.dashboard-funnel li{display:grid;gap:4px}.dashboard-funnel li>span{display:flex;align-items:center;justify-content:space-between;color:#456069;font-size:.7rem}.dashboard-funnel li>span strong{color:#073f51;font-size:.83rem}.dashboard-funnel li>i{display:block;height:9px;overflow:hidden;border-radius:99px;background:#e4edef}.dashboard-funnel li>i>b{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#08758b,#2ba582)}.dashboard-chart-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dashboard-features{display:grid;padding:18px;gap:14px;box-shadow:none}.dashboard-features header>span{color:#667d84;font-size:.65rem}.dashboard-features>div{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.dashboard-features article{display:flex;padding:10px;align-items:center;justify-content:space-between;gap:8px;border-radius:10px;background:#edf5f6}.dashboard-features article>span{display:grid;min-width:0;gap:2px}.dashboard-features article strong,.dashboard-features article small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dashboard-features article strong{color:#234b57;font-size:.68rem}.dashboard-features article small{color:#71868c;font-size:.58rem}.dashboard-features article>b{color:#08758b;font-size:1rem}.dashboard-features>p{margin:0;color:#71868c;font-size:.68rem}:global(:root[data-theme='dark']) .dashboard-kpis article,:global(:root[data-theme='dark']) .dashboard-insights,:global(:root[data-theme='dark']) .dashboard-insights article,:global(:root[data-theme='dark']) .dashboard-main-grid>:deep(.admin-card),:global(:root[data-theme='dark']) .dashboard-chart-grid>:deep(.admin-card),:global(:root[data-theme='dark']) .dashboard-features{border-color:#3d565e;background:#172a30}:global(:root[data-theme='dark']) .dashboard-kpis strong,:global(:root[data-theme='dark']) .dashboard-insights h3,:global(:root[data-theme='dark']) .dashboard-features h3,:global(:root[data-theme='dark']) .dashboard-funnel h3{color:#dff5f7}:global(:root[data-theme='dark']) .dashboard-kpis span,:global(:root[data-theme='dark']) .dashboard-kpis small,:global(:root[data-theme='dark']) .dashboard-insights article small{color:#a9c1c7}:global(:root[data-theme='dark']) .dashboard-insights article strong{color:#d1e8eb}:global(:root[data-theme='dark']) .dashboard-features article{background:#20383f}@media(max-width:1100px){.dashboard-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}.dashboard-features>div{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:820px){.dashboard-main-grid,.dashboard-chart-grid{grid-template-columns:1fr}.dashboard-funnel{grid-column:auto}}@media(max-width:650px){.dashboard-hero{align-items:flex-start;flex-direction:column}.dashboard-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.dashboard-insights>header,.dashboard-features>header{align-items:flex-start;flex-direction:column}.dashboard-features>div{grid-template-columns:1fr}}
</style>

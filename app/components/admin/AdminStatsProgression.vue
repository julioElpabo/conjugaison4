<script setup lang="ts">
import type { AnalyticsOverview, AnalyticsResponse, AnalyticsSeriesPoint } from '../../../shared/types/analytics'
import AdminFeatureUsageChart from './AdminFeatureUsageChart.vue'
import AdminTrendChart from './AdminTrendChart.vue'

const props = defineProps<{ stats: AnalyticsResponse }>()
type ProgressionTheme = 'summary' | 'audience' | 'pedagogy' | 'usage'
const activeTheme = ref<ProgressionTheme>('summary')
const progressionThemes: Array<{ id: ProgressionTheme, label: string, short: string }> = [
  { id: 'summary', label: 'Synthèse générale', short: 'Synthèse' },
  { id: 'audience', label: 'Audience et géographie', short: 'Audience' },
  { id: 'pedagogy', label: 'Analyse pédagogique', short: 'Pédagogie' },
  { id: 'usage', label: 'Usage des fonctionnalités', short: 'Fonctionnalités' },
]
const audience = computed<AnalyticsOverview>(() => {
  const ga4 = props.stats.ga4
  const hasCachedGa4Data = Boolean(ga4?.countries.length || ga4?.activity.length || ga4?.activeUsers)
  return ga4?.configured && (!ga4.notice || hasCachedGa4Data) ? ga4 : props.stats.local
})
const local = computed(() => props.stats.local)
const periodDays = computed(() => Math.max(1, Math.round(
  (Date.parse(`${props.stats.endDate}T12:00:00Z`) - Date.parse(`${props.stats.startDate}T12:00:00Z`)) / 86400000,
) + 1))

function normalizeDate(value: string) {
  return /^\d{8}$/u.test(value) ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}` : value.slice(0, 10)
}

function bucketDate(value: string) {
  const normalized = normalizeDate(value)
  if (periodDays.value <= 45) return normalized
  if (periodDays.value > 210) return `${normalized.slice(0, 7)}-01`
  const date = new Date(`${normalized}T12:00:00Z`)
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() - day + 1)
  return date.toISOString().slice(0, 10)
}

function aggregateSeries(points: AnalyticsSeriesPoint[]) {
  const values = new Map<string, number>()
  for (const point of points) {
    const date = bucketDate(point.date)
    values.set(date, (values.get(date) || 0) + point.value)
  }
  const buckets = new Set<string>()
  const cursor = new Date(`${props.stats.startDate}T12:00:00Z`)
  const end = new Date(`${props.stats.endDate}T12:00:00Z`)
  while (cursor <= end) {
    buckets.add(bucketDate(cursor.toISOString().slice(0, 10)))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return [...buckets].sort().map(date => ({ date, value: values.get(date) || 0 }))
}

const localSeries = (name: string) => aggregateSeries(local.value.series?.[name] || [])
const audienceSeries = (name: string) => aggregateSeries(audience.value.series?.[name] || [])

function ratioSeries(numeratorName: string, denominatorName: string): AnalyticsSeriesPoint[] {
  const numerator = localSeries(numeratorName)
  const denominator = localSeries(denominatorName)
  const dates = [...new Set([...numerator, ...denominator].map(point => point.date))].sort()
  return dates.map((date) => {
    const numeratorValue = numerator.find(point => point.date === date)?.value || 0
    const denominatorValue = denominator.find(point => point.date === date)?.value || 0
    return { date, value: denominatorValue ? Math.round(numeratorValue / denominatorValue * 1000) / 10 : 0 }
  })
}

const completionSeries = computed(() => ratioSeries('exercise_completed', 'exercise_started'))
const successSeries = computed(() => ratioSeries('answer_correct', 'answer_submitted'))
const countryMaximum = computed(() => Math.max(1, ...(audience.value.countries.slice(0, 8).map(item => item.value))))
const timeUnit = computed(() => periodDays.value <= 45 ? 'Jours' : periodDays.value <= 210 ? 'Semaines' : 'Mois')
const periodLabel = computed(() => {
  const formatter = new Intl.DateTimeFormat('fr-CH', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${formatter.format(new Date(`${props.stats.startDate}T12:00:00`))} – ${formatter.format(new Date(`${props.stats.endDate}T12:00:00`))}`
})
</script>

<template>
  <div class="progression-dashboard">
    <header class="progression-intro">
      <div><p class="admin-eyebrow">Progression</p><h2>Évolution du {{ periodLabel }}</h2></div>
      <p>Survole les points ou les barres pour obtenir la valeur d’une date précise.</p>
    </header>

    <nav class="theme-tabs" role="tablist" aria-label="Thème des progressions">
      <button
        v-for="theme in progressionThemes"
        :id="`progression-theme-tab-${theme.id}`"
        :key="theme.id"
        type="button"
        role="tab"
        :aria-selected="activeTheme === theme.id"
        :aria-controls="`progression-theme-panel-${theme.id}`"
        :class="{ active: activeTheme === theme.id }"
        @click="activeTheme = theme.id"
      >
        <span class="theme-tabs__long">{{ theme.label }}</span>
        <span class="theme-tabs__short">{{ theme.short }}</span>
      </button>
    </nav>

    <section
      v-show="activeTheme === 'summary'"
      id="progression-theme-panel-summary"
      class="progression-theme progression-theme--summary"
      role="tabpanel"
      aria-labelledby="progression-theme-tab-summary"
    >
      <header class="progression-theme__heading"><span>01</span><div><h2>Synthèse générale</h2><p>Le rythme général de fréquentation et d’utilisation.</p></div></header>
      <div class="progression-grid">
        <AdminTrendChart
          eyebrow="Audience"
          title="Visiteurs et sessions"
          insight="Compare la taille de l’audience à sa fréquence de retour : davantage de sessions que de visiteurs indique des usages répétés."
          :x-unit="timeUnit"
          y-unit="Utilisateurs / sessions"
          :series="[
            { label: 'Visiteurs', color: '#168eaa', points: audienceSeries('activeUsers') },
            { label: 'Sessions', color: '#6251a5', points: audience.series?.sessions?.length ? audienceSeries('sessions') : aggregateSeries(audience.activity) },
          ]"
        />
        <AdminTrendChart
          eyebrow="Activité"
          title="Exercices et réponses"
          insight="Montre quand l’activité pédagogique est la plus forte et si les réponses suivent réellement les lancements d’exercices."
          :x-unit="timeUnit"
          y-unit="Actions"
          kind="bar"
          :series="[
            { label: 'Exercices lancés', color: '#2b9767', points: localSeries('exercise_started') },
            { label: 'Réponses envoyées', color: '#d28a2d', points: localSeries('answer_submitted') },
          ]"
        />
      </div>
    </section>

    <section
      v-show="activeTheme === 'audience'"
      id="progression-theme-panel-audience"
      class="progression-theme progression-theme--audience"
      role="tabpanel"
      aria-labelledby="progression-theme-tab-audience"
    >
      <header class="progression-theme__heading"><span>02</span><div><h2>Audience et géographie</h2><p>Évolution de l’audience et poids des principaux pays.</p></div></header>
      <div class="progression-grid">
        <AdminTrendChart
          title="Acquisition des visiteurs"
          insight="Permet de voir si la fréquentation progresse grâce à de nouveaux visiteurs ou repose surtout sur une audience déjà installée."
          :x-unit="timeUnit"
          y-unit="Utilisateurs"
          :series="[
            { label: 'Nouveaux visiteurs', color: '#168eaa', points: audienceSeries('newUsers') },
            { label: 'Visiteurs actifs', color: '#6251a5', points: audienceSeries('activeUsers') },
          ]"
        />
        <section class="country-ranking admin-card">
          <div><p class="admin-eyebrow">Géographie</p><h3>Pays sur l’ensemble de la période</h3></div>
          <p class="country-ranking__insight">Repère les pays à privilégier pour les traductions, les contenus et les actions de communication.</p>
          <ol v-if="audience.countries.length">
            <li v-for="country in audience.countries.slice(0, 8)" :key="country.code || country.label">
              <span><b>{{ country.label }}</b><small>{{ country.value.toLocaleString('fr-CH') }}</small></span>
              <i><em :style="{ width: `${country.value / countryMaximum * 100}%` }" /></i>
            </li>
          </ol>
          <p v-else class="empty">Aucune donnée géographique sur cette période.</p>
        </section>
      </div>
    </section>

    <section
      v-show="activeTheme === 'pedagogy'"
      id="progression-theme-panel-pedagogy"
      class="progression-theme progression-theme--pedagogy"
      role="tabpanel"
      aria-labelledby="progression-theme-tab-pedagogy"
    >
      <header class="progression-theme__heading"><span>03</span><div><h2>Analyse pédagogique</h2><p>Volumes d’apprentissage et évolution des taux de réussite.</p></div></header>
      <div class="progression-grid">
        <AdminTrendChart
          title="Exercices lancés et terminés"
          insight="L’écart entre les deux séries révèle les périodes où les utilisateurs abandonnent davantage leurs exercices."
          :x-unit="timeUnit"
          y-unit="Exercices"
          kind="bar"
          :series="[
            { label: 'Lancements', color: '#168eaa', points: localSeries('exercise_started') },
            { label: 'Terminaisons', color: '#2b9767', points: localSeries('exercise_completed') },
          ]"
        />
        <AdminTrendChart
          title="Réponses envoyées et correctes"
          insight="Mesure le volume de travail et fait apparaître les périodes où les questions semblent globalement plus difficiles."
          :x-unit="timeUnit"
          y-unit="Réponses"
          kind="bar"
          :series="[
            { label: 'Envoyées', color: '#d28a2d', points: localSeries('answer_submitted') },
            { label: 'Correctes', color: '#2b9767', points: localSeries('answer_correct') },
          ]"
        />
        <AdminTrendChart
          title="Taux de complétion et de réussite"
          insight="Neutralise l’effet du nombre de visiteurs pour montrer si l’expérience pédagogique s’améliore réellement dans le temps."
          :x-unit="timeUnit"
          y-unit="Pourcentage"
          percent
          :series="[
            { label: 'Complétion', color: '#168eaa', points: completionSeries },
            { label: 'Réussite', color: '#2b9767', points: successSeries },
          ]"
        />
      </div>
    </section>

    <section
      v-show="activeTheme === 'usage'"
      id="progression-theme-panel-usage"
      class="progression-theme progression-theme--usage"
      role="tabpanel"
      aria-labelledby="progression-theme-tab-usage"
    >
      <header class="progression-theme__heading"><span>04</span><div><h2>Usage des fonctionnalités</h2><p>Évolution des aides, défis et documents produits.</p></div></header>
      <AdminFeatureUsageChart
        :items="local.featureUsage || []"
        insight="Donne la préférence globale des utilisateurs sur la période ; les graphiques suivants indiquent ensuite quand ces usages ont eu lieu."
      />
      <div class="progression-grid">
        <AdminTrendChart
          title="Aides et nouvelles tentatives"
          insight="Une hausse conjointe signale une difficulté productive ; beaucoup d’aides sans nouvelle tentative peut indiquer une aide peu efficace."
          :x-unit="timeUnit"
          y-unit="Actions"
          kind="bar"
          :series="[
            { label: 'Aides ouvertes', color: '#6251a5', points: localSeries('help_opened') },
            { label: 'Nouvelles tentatives', color: '#168eaa', points: localSeries('answer_retry') },
          ]"
        />
        <AdminTrendChart
          title="Défis"
          insight="Indique si les utilisateurs consomment surtout des défis existants ou prennent aussi le temps d’en créer et personnaliser."
          :x-unit="timeUnit"
          y-unit="Défis"
          kind="bar"
          :series="[
            { label: 'Chargés', color: '#168eaa', points: localSeries('challenge_load') },
            { label: 'Créés', color: '#d28a2d', points: localSeries('challenge_save') },
            { label: 'Prédéfinis', color: '#6251a5', points: localSeries('challenge_preset_selected') },
          ]"
        />
        <AdminTrendChart
          title="Impressions et téléchargements"
          insight="Mesure l’usage hors écran du site et aide à décider si les fonctions PDF, Word et impression méritent davantage d’attention."
          :x-unit="timeUnit"
          y-unit="Documents"
          kind="bar"
          :series="[
            { label: 'Aperçus', color: '#168eaa', points: localSeries('print_opened') },
            { label: 'PDF', color: '#d28a2d', points: localSeries('pdf_downloaded') },
            { label: 'Word', color: '#6251a5', points: localSeries('word_downloaded') },
          ]"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.progression-dashboard{display:grid;gap:18px}.progression-intro{display:flex;align-items:end;justify-content:space-between;gap:20px;padding:5px 2px}.progression-intro h2,.progression-intro p{margin:0}.progression-intro h2{color:var(--admin-navy);font-size:1.35rem}.progression-intro>p{max-width:520px;color:var(--admin-muted);font-size:.8rem;text-align:right}.progression-theme{display:grid;padding:18px;gap:15px;border:1px solid #cbdde2;border-radius:18px;background:rgb(240 248 250 / 58%)}.progression-theme__heading{display:flex;align-items:center;gap:12px}.progression-theme__heading>span{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;border-radius:11px;color:#fff;background:#08758b;font-size:.72rem;font-weight:900}.progression-theme__heading h2,.progression-theme__heading p{margin:0}.progression-theme__heading h2{color:var(--admin-navy);font-size:1.25rem}.progression-theme__heading p{margin-top:2px;color:var(--admin-muted);font-size:.78rem}.progression-theme--pedagogy{border-color:#c9ddd3;background:rgb(241 249 244 / 72%)}.progression-theme--pedagogy .progression-theme__heading>span{background:#34895f}.progression-theme--usage{border-color:#e4d5bf;background:rgb(252 248 240 / 72%)}.progression-theme--usage .progression-theme__heading>span{background:#b87323}.progression-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:13px}.country-ranking{display:grid;padding:16px;align-content:start;gap:10px;box-shadow:none}.country-ranking h3{margin:3px 0 0;color:var(--admin-navy);font-size:.96rem}.country-ranking__insight{min-height:2.7em;margin:0;color:#4e6972;font-size:.72rem;line-height:1.35}.country-ranking ol{display:grid;margin:0;padding:0;gap:8px;list-style:none}.country-ranking li{display:grid;gap:4px}.country-ranking li>span{display:flex;justify-content:space-between;gap:12px;color:var(--admin-navy);font-size:.74rem}.country-ranking small{color:var(--admin-muted)}.country-ranking li>i{height:8px;overflow:hidden;border-radius:99px;background:#e3eef1}.country-ranking em{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#23a2bb,#08758b)}.theme-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));padding:5px;gap:5px;border:1px solid #cbdde2;border-radius:15px;background:#edf5f6}.theme-tabs button{min-height:47px;padding:9px 12px;border:0;border-radius:11px;color:#49636c;background:transparent;font:inherit;font-size:.78rem;font-weight:850;cursor:pointer;transition:background .15s,color .15s,box-shadow .15s}.theme-tabs button:hover{color:var(--admin-navy);background:rgb(255 255 255 / 65%)}.theme-tabs button.active{color:#fff;background:#08758b;box-shadow:0 5px 14px rgb(8 117 139 / 20%)}.theme-tabs__short{display:none}.empty{color:var(--admin-muted)}:global(:root[data-theme='dark']) .progression-theme{border-color:#3c555d;background:rgb(24 43 48 / 72%)}:global(:root[data-theme='dark']) .country-ranking li>i{background:#314950}:global(:root[data-theme='dark']) .country-ranking__insight{color:#b7ccd1}:global(:root[data-theme='dark']) .theme-tabs{border-color:#3c555d;background:#182c31}:global(:root[data-theme='dark']) .theme-tabs button:hover{background:#263e45}@media(max-width:1050px){.theme-tabs__long{display:none}.theme-tabs__short{display:inline}}@media(max-width:760px){.progression-intro{display:grid}.progression-intro>p{text-align:left}.theme-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:650px){.progression-theme{padding:12px}}
</style>

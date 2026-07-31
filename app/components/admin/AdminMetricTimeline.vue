<script setup lang="ts">
import type { AnalyticsResponse, AnalyticsSeriesPoint } from '../../../shared/types/analytics'
import AdminTrendChart from './AdminTrendChart.vue'

interface MetricOption {
  value: string
  label: string
  group: string
  color: string
}

const props = defineProps<{ stats: AnalyticsResponse }>()
const selectedMetric = defineModel<string>('metric', { default: 'page_view' })

const metricOptions: MetricOption[] = [
  { value: 'page_view', label: 'Visites de pages', group: 'Audience', color: '#08758b' },
  { value: 'sessions', label: 'Sessions détectées', group: 'Audience', color: '#6251a5' },
  { value: 'homepage', label: 'Visites de l’accueil', group: 'Audience', color: '#168eaa' },
  { value: 'exercise_started', label: 'Tous les exercices lancés', group: 'Exercices', color: '#2b9767' },
  { value: 'exercise_started.classic', label: 'Exercices classiques lancés', group: 'Exercices', color: '#168eaa' },
  { value: 'exercise_started.chat', label: 'Chats avec coach lancés', group: 'Exercices', color: '#7351a6' },
  { value: 'exercise_completed', label: 'Exercices terminés', group: 'Exercices', color: '#2b9767' },
  { value: 'exercise_abandoned', label: 'Exercices abandonnés', group: 'Exercices', color: '#d05e56' },
  { value: 'answer_submitted', label: 'Réponses envoyées', group: 'Apprentissage', color: '#d28a2d' },
  { value: 'answer_correct', label: 'Réponses correctes', group: 'Apprentissage', color: '#2b9767' },
  { value: 'answer_retry', label: 'Nouvelles tentatives', group: 'Apprentissage', color: '#168eaa' },
  { value: 'help_opened', label: 'Aides ouvertes', group: 'Apprentissage', color: '#6251a5' },
  { value: 'challenge_preset_selected', label: 'Défis tout faits choisis', group: 'Défis et outils', color: '#7351a6' },
  { value: 'challenge_load', label: 'Défis chargés', group: 'Défis et outils', color: '#168eaa' },
  { value: 'challenge_save', label: 'Défis enregistrés', group: 'Défis et outils', color: '#d28a2d' },
  { value: 'coach_selected', label: 'Coachs choisis', group: 'Défis et outils', color: '#6251a5' },
  { value: 'print_opened', label: 'Aperçus avant impression', group: 'Documents', color: '#168eaa' },
  { value: 'pdf_downloaded', label: 'PDF téléchargés', group: 'Documents', color: '#d28a2d' },
  { value: 'word_downloaded', label: 'Documents Word téléchargés', group: 'Documents', color: '#6251a5' },
  { value: 'feature_exposed', label: 'Fonctionnalités affichées', group: 'Fonctionnalités', color: '#5595a3' },
  { value: 'feature_selected', label: 'Fonctionnalités choisies', group: 'Fonctionnalités', color: '#08758b' },
  { value: 'feature_completed', label: 'Fonctionnalités menées à terme', group: 'Fonctionnalités', color: '#2b9767' },
  { value: 'feature_failed', label: 'Échecs de fonctionnalités', group: 'Fonctionnalités', color: '#d05e56' },
  { value: 'language_tested', label: 'Changements de langue testés', group: 'Langues', color: '#d28a2d' },
  { value: 'language_used', label: 'Langues réellement utilisées', group: 'Langues', color: '#2b9767' },
  { value: 'language_tested.fr', label: 'Français testé', group: 'Langues', color: '#5595a3' },
  { value: 'language_used.fr', label: 'Français réellement utilisé', group: 'Langues', color: '#08758b' },
  { value: 'language_tested.de', label: 'Allemand testé', group: 'Langues', color: '#d28a2d' },
  { value: 'language_used.de', label: 'Allemand réellement utilisé', group: 'Langues', color: '#2b9767' },
  { value: 'language_tested.en', label: 'Anglais testé', group: 'Langues', color: '#d28a2d' },
  { value: 'language_used.en', label: 'Anglais réellement utilisé', group: 'Langues', color: '#2b9767' },
  { value: 'language_tested.it', label: 'Italien testé', group: 'Langues', color: '#d28a2d' },
  { value: 'language_used.it', label: 'Italien réellement utilisé', group: 'Langues', color: '#2b9767' },
  { value: 'language_tested.es', label: 'Espagnol testé', group: 'Langues', color: '#d28a2d' },
  { value: 'language_used.es', label: 'Espagnol réellement utilisé', group: 'Langues', color: '#2b9767' },
  { value: 'account_registered', label: 'Comptes créés', group: 'Comptes', color: '#2b9767' },
  { value: 'account_login', label: 'Connexions aux comptes', group: 'Comptes', color: '#168eaa' },
  { value: 'client_error', label: 'Erreurs côté navigateur', group: 'Technique', color: '#d05e56' },
]

const optionGroups = computed(() => {
  const groups = new Map<string, MetricOption[]>()
  for (const option of metricOptions) {
    const entries = groups.get(option.group) || []
    entries.push(option)
    groups.set(option.group, entries)
  }
  return [...groups].map(([label, options]) => ({ label, options }))
})
const selectedOption = computed(() => metricOptions.find(option => option.value === selectedMetric.value) || metricOptions[0]!)
const isRealtime = computed(() => props.stats.window !== 'range')
const liveMinutes = computed(() => props.stats.window === 'now' ? 1 : props.stats.window === '3m' ? 3 : props.stats.window === '5m' ? 5 : 30)
const periodDays = computed(() => Math.max(1, Math.round(
  (Date.parse(`${props.stats.endDate}T12:00:00Z`) - Date.parse(`${props.stats.startDate}T12:00:00Z`)) / 86400000,
) + 1))
const resolution = computed(() => {
  if (isRealtime.value) return 'minutes'
  if (periodDays.value <= 2) return 'hours'
  if (periodDays.value <= 45) return 'days'
  if (periodDays.value <= 210) return 'weeks'
  return 'months'
})
const xUnit = computed(() => ({
  minutes: 'Minutes',
  hours: 'Heures',
  days: 'Jours',
  weeks: 'Semaines',
  months: 'Mois',
})[resolution.value])

function parsedDate(value: string) {
  return new Date(value.replace(' ', 'T'))
}

function minuteKey(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return `${local.toISOString().slice(0, 16).replace('T', ' ')}:00`
}

function hourKey(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return `${local.toISOString().slice(0, 13).replace('T', ' ')}:00:00`
}

function dayKey(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function bucketKey(value: string) {
  const date = parsedDate(value)
  if (Number.isNaN(date.getTime())) return value
  if (resolution.value === 'minutes') return minuteKey(date)
  if (resolution.value === 'hours') return hourKey(date)
  if (resolution.value === 'days') return dayKey(date)
  if (resolution.value === 'months') return `${dayKey(date).slice(0, 7)}-01`
  const monday = new Date(date)
  const weekday = monday.getDay() || 7
  monday.setDate(monday.getDate() - weekday + 1)
  return dayKey(monday)
}

function expectedBuckets() {
  const buckets = new Set<string>()
  if (isRealtime.value) {
    const cursor = new Date()
    cursor.setSeconds(0, 0)
    cursor.setMinutes(cursor.getMinutes() - liveMinutes.value + 1)
    for (let index = 0; index < liveMinutes.value; index += 1) {
      buckets.add(bucketKey(minuteKey(cursor)))
      cursor.setMinutes(cursor.getMinutes() + 1)
    }
    return buckets
  }

  const cursor = new Date(`${props.stats.startDate}T00:00:00`)
  const requestedEnd = new Date(`${props.stats.endDate}T23:59:59`)
  const end = props.stats.endDate === dayKey(new Date())
    ? new Date(Math.min(requestedEnd.getTime(), Date.now()))
    : requestedEnd
  const incrementHours = resolution.value === 'hours'
  while (cursor <= end) {
    buckets.add(bucketKey(incrementHours ? hourKey(cursor) : dayKey(cursor)))
    if (incrementHours) cursor.setHours(cursor.getHours() + 1)
    else cursor.setDate(cursor.getDate() + 1)
  }
  return buckets
}

const points = computed<AnalyticsSeriesPoint[]>(() => {
  const values = new Map<string, number>()
  for (const point of props.stats.local.series?.[selectedMetric.value] || []) {
    const date = bucketKey(point.date)
    values.set(date, (values.get(date) || 0) + point.value)
  }
  const buckets = expectedBuckets()
  for (const date of values.keys()) buckets.add(date)
  return [...buckets].sort().map(date => ({ date, value: values.get(date) || 0 }))
})
</script>

<template>
  <section class="metric-timeline">
    <header class="metric-timeline__heading admin-card">
      <div>
        <p class="admin-eyebrow">Graphique configurable</p>
        <h2>Évolution d’un indicateur</h2>
        <p>Choisissez la valeur à afficher sur l’axe vertical · données enregistrées directement par le site.</p>
      </div>
      <label>
        <span>Axe vertical</span>
        <select v-model="selectedMetric">
          <optgroup v-for="group in optionGroups" :key="group.label" :label="group.label">
            <option v-for="option in group.options" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </optgroup>
        </select>
      </label>
    </header>
    <AdminTrendChart
      :title="selectedOption.label"
      :insight="isRealtime
        ? `Valeurs enregistrées pendant les ${liveMinutes} dernières minutes, actualisées avec le tableau de bord.`
        : 'Valeurs regroupées automatiquement par heure, jour, semaine ou mois selon la durée choisie.'"
      :x-unit="xUnit"
      :y-unit="selectedOption.label"
      :series="[{ label: selectedOption.label, color: selectedOption.color, points }]"
    />
  </section>
</template>

<style scoped>
.metric-timeline{display:grid;gap:10px}.metric-timeline__heading{display:flex;padding:16px 18px;align-items:end;justify-content:space-between;gap:22px;box-shadow:none}.metric-timeline__heading h2,.metric-timeline__heading p{margin:0}.metric-timeline__heading h2{margin-top:3px;color:var(--admin-navy);font-size:1.08rem}.metric-timeline__heading>div>p:last-child{margin-top:5px;color:var(--admin-muted);font-size:.74rem}.metric-timeline label{display:grid;min-width:min(100%,330px);gap:5px;color:var(--admin-muted);font-size:.7rem;font-weight:850}.metric-timeline select{width:100%;padding:10px 36px 10px 11px;border:1px solid #b8cfd5;border-radius:10px;color:var(--admin-navy);background:var(--admin-surface,#fff);font:inherit;font-size:.78rem;font-weight:750}.metric-timeline :deep(.trend-chart){padding-top:18px}.metric-timeline :deep(.trend-chart__insight){min-height:0}@media(max-width:720px){.metric-timeline__heading{display:grid;align-items:start}.metric-timeline label{min-width:0;width:100%}}
</style>

<script setup lang="ts">
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

type MetricKey = Exclude<keyof StatsDay, 'date'>

const props = defineProps<{
  days: StatsDay[]
}>()

const metrics: Array<{ key: MetricKey, label: string, short: string }> = [
  { key: 'homepage', label: 'Accueil', short: 'Accueil' },
  { key: 'creationpdf', label: 'Créations de PDF', short: 'PDF' },
  { key: 'sauvedefi', label: 'Défis enregistrés', short: 'Sauvegardés' },
  { key: 'chargedefi', label: 'Défis chargés', short: 'Chargés' },
  { key: 'exercer', label: 'Exercices classiques', short: 'Classiques' },
  { key: 'exercersimple', label: 'Exercices simples', short: 'Simples' },
  { key: 'resultat', label: 'Résultats classiques', short: 'Résultats' },
  { key: 'resultatsimple', label: 'Résultats simples', short: 'Rés. simples' }
]

const selectedMetric = ref<MetricKey>('homepage')
const selectedDefinition = computed(() => metrics.find(metric => metric.key === selectedMetric.value) ?? metrics[0]!)
const selectedMaximum = computed(() => Math.max(0, ...props.days.map(day => Number(day[selectedMetric.value]) || 0)))
const selectedTotal = computed(() => props.days.reduce(
  (sum, day) => sum + (Number(day[selectedMetric.value]) || 0),
  0
))

const grandTotal = computed(() => props.days.reduce((sum, day) => (
  sum + metrics.reduce((daySum, metric) => daySum + (Number(day[metric.key]) || 0), 0)
), 0))

function metricTotal(key: MetricKey): number {
  return props.days.reduce((sum, day) => sum + (Number(day[key]) || 0), 0)
}

function barHeight(value: number): string {
  const maximum = selectedMaximum.value
  if (maximum <= 0 || value <= 0) {
    return '2px'
  }
  return `${Math.max(5, (value / maximum) * 100)}%`
}

function formatDate(value: string, compact = false): string {
  const isoDate = String(value).slice(0, 10)
  const date = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('fr-CH', compact
    ? { day: '2-digit', month: '2-digit' }
    : { weekday: 'short', day: '2-digit', month: 'short' }
  ).format(date)
}
</script>

<template>
  <div class="stats-dashboard">
    <section class="stats-dashboard__totals" aria-label="Totaux sur la période">
      <article class="stats-total admin-card">
        <span>Total des événements</span>
        <strong>{{ grandTotal.toLocaleString('fr-CH') }}</strong>
        <small>{{ days.length }} jour{{ days.length > 1 ? 's' : '' }} avec activité</small>
      </article>
      <article class="stats-total stats-total--selected admin-card">
        <span>{{ selectedDefinition.label }}</span>
        <strong>{{ selectedTotal.toLocaleString('fr-CH') }}</strong>
        <small>Maximum quotidien : {{ selectedMaximum.toLocaleString('fr-CH') }}</small>
      </article>
    </section>

    <section class="stats-chart admin-card" aria-labelledby="stats-chart-title">
      <div class="stats-chart__heading">
        <div>
          <p class="admin-eyebrow">30 derniers jours</p>
          <h2 id="stats-chart-title">{{ selectedDefinition.label }}</h2>
        </div>

        <label class="admin-field stats-chart__select">
          <span>Indicateur</span>
          <select v-model="selectedMetric">
            <option v-for="metric in metrics" :key="metric.key" :value="metric.key">
              {{ metric.label }}
            </option>
          </select>
        </label>
      </div>

      <div v-if="days.length" class="stats-chart__plot" role="img" :aria-label="`Activité quotidienne : ${selectedDefinition.label}`">
        <div v-for="day in days" :key="day.date" class="stats-bar-column">
          <span class="stats-bar-column__value">{{ Number(day[selectedMetric]) || 0 }}</span>
          <span
            class="stats-bar-column__bar"
            :style="{ height: barHeight(Number(day[selectedMetric]) || 0) }"
            aria-hidden="true"
          />
          <time :datetime="String(day.date).slice(0, 10)">{{ formatDate(day.date, true) }}</time>
        </div>
      </div>
      <p v-else class="stats-chart__empty admin-muted">Aucune activité pendant cette période.</p>
    </section>

    <section class="stats-table admin-card" aria-labelledby="stats-table-title">
      <div class="stats-table__heading">
        <div>
          <p class="admin-eyebrow">Détail</p>
          <h2 id="stats-table-title">Activité quotidienne</h2>
        </div>
        <p class="admin-muted">Faites défiler le tableau horizontalement sur petit écran.</p>
      </div>

      <div class="stats-table__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th v-for="metric in metrics" :key="metric.key" scope="col">{{ metric.short }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="day in [...days].reverse()" :key="day.date">
              <th scope="row"><time :datetime="String(day.date).slice(0, 10)">{{ formatDate(day.date) }}</time></th>
              <td v-for="metric in metrics" :key="metric.key">
                {{ (Number(day[metric.key]) || 0).toLocaleString('fr-CH') }}
              </td>
            </tr>
          </tbody>
          <tfoot v-if="days.length">
            <tr>
              <th scope="row">Total</th>
              <td v-for="metric in metrics" :key="metric.key">
                {{ metricTotal(metric.key).toLocaleString('fr-CH') }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.stats-dashboard {
  display: grid;
  gap: 20px;
}

.stats-dashboard__totals {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.stats-total {
  display: grid;
  padding: 18px 20px;
  gap: 3px;
  box-shadow: none;
}

.stats-total span,
.stats-total small {
  color: var(--admin-muted);
}

.stats-total span {
  font-size: .8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.stats-total strong {
  color: var(--admin-navy);
  font-size: clamp(1.8rem, 5vw, 2.6rem);
  line-height: 1.1;
}

.stats-total--selected {
  background: #f0fbfd;
  border-color: #a9dae5;
}

.stats-chart,
.stats-table {
  min-width: 0;
  padding: clamp(16px, 3vw, 24px);
  box-shadow: none;
}

.stats-chart__heading,
.stats-table__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
}

.stats-chart h2,
.stats-table h2 {
  margin: 3px 0 0;
  color: var(--admin-navy);
}

.stats-chart__select {
  width: min(100%, 260px);
}

.stats-chart__plot {
  display: flex;
  height: 285px;
  margin-top: 25px;
  padding: 18px 5px 0;
  align-items: end;
  gap: clamp(3px, .65vw, 9px);
  overflow-x: auto;
  border-bottom: 1px solid var(--admin-border);
  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 59px,
    #e9eff2 60px
  );
}

.stats-bar-column {
  display: grid;
  min-width: 23px;
  height: 100%;
  flex: 1 0 23px;
  grid-template-rows: 20px 1fr 34px;
  justify-items: center;
  align-items: end;
  gap: 4px;
}

.stats-bar-column__value {
  color: var(--admin-muted);
  font-size: .62rem;
}

.stats-bar-column__bar {
  width: min(100%, 28px);
  min-height: 2px;
  background: linear-gradient(180deg, #46a8bd, var(--admin-blue));
  border-radius: 5px 5px 0 0;
}

.stats-bar-column time {
  padding-top: 3px;
  color: var(--admin-muted);
  font-size: .58rem;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

.stats-chart__empty {
  margin: 24px 0 0;
  padding: 30px;
  text-align: center;
  background: #f7fafb;
  border-radius: 10px;
}

.stats-table__heading .admin-muted {
  margin: 0;
  font-size: .78rem;
}

.stats-table__scroll {
  margin-top: 18px;
  overflow-x: auto;
}

.stats-table table {
  width: 100%;
  min-width: 870px;
  border-collapse: collapse;
}

.stats-table th,
.stats-table td {
  padding: 9px 10px;
  text-align: right;
  border-bottom: 1px solid #e1e8ec;
  font-variant-numeric: tabular-nums;
}

.stats-table th:first-child,
.stats-table td:first-child {
  position: sticky;
  left: 0;
  min-width: 135px;
  text-align: left;
  background: white;
}

.stats-table thead th {
  color: var(--admin-muted);
  background: #f6f9fa;
  font-size: .72rem;
}

.stats-table thead th:first-child {
  background: #f6f9fa;
  z-index: 1;
}

.stats-table tbody th {
  color: var(--admin-navy);
  font-size: .82rem;
}

.stats-table tfoot {
  color: var(--admin-navy);
  background: #eef8fa;
  font-weight: 850;
}

.stats-table tfoot th:first-child {
  background: #eef8fa;
}

@media (max-width: 640px) {
  .stats-dashboard__totals {
    grid-template-columns: 1fr;
  }

  .stats-chart__heading,
  .stats-table__heading {
    align-items: stretch;
    flex-direction: column;
  }

  .stats-chart__select {
    width: 100%;
  }
}
</style>

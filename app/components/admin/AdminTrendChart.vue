<script setup lang="ts">
import type { AnalyticsSeriesPoint } from '../../../shared/types/analytics'

interface TrendSeries {
  label: string
  color: string
  points: AnalyticsSeriesPoint[]
}

const props = withDefaults(defineProps<{
  title: string
  eyebrow?: string
  series: TrendSeries[]
  kind?: 'line' | 'bar'
  percent?: boolean
  insight: string
  xUnit?: string
  yUnit?: string
}>(), { eyebrow: '', kind: 'line', percent: false, xUnit: 'Date', yUnit: 'Nombre' })

const normalizedDate = (value: string) => /^\d{8}$/u.test(value)
  ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
  : value.slice(0, 10)
const dates = computed(() => [...new Set(props.series.flatMap(item => item.points.map(point => normalizedDate(point.date))))].sort())
const values = computed(() => props.series.flatMap(item => item.points.map(point => point.value)))
const maximum = computed(() => props.percent ? 100 : Math.max(1, ...values.value))
const hasValues = computed(() => values.value.some(value => value > 0))
const plotLeft = 54
const plotRight = 480
const plotTop = 18
const plotBottom = 220
const plotWidth = plotRight - plotLeft
const plotHeight = plotBottom - plotTop

function valueAt(item: TrendSeries, date: string) {
  return item.points.find(point => normalizedDate(point.date) === date)?.value || 0
}

function x(index: number) {
  return plotLeft + (dates.value.length <= 1 ? plotWidth / 2 : index / (dates.value.length - 1) * plotWidth)
}

function y(value: number) {
  return plotBottom - Math.min(maximum.value, Math.max(0, value)) / maximum.value * plotHeight
}

function linePoints(item: TrendSeries) {
  return dates.value.map((date, index) => `${x(index)},${y(valueAt(item, date))}`).join(' ')
}

function barWidth() {
  return Math.max(1.5, Math.min(18, plotWidth / Math.max(1, dates.value.length) / Math.max(1, props.series.length) * .72))
}

function barX(dateIndex: number, seriesIndex: number) {
  const groupWidth = barWidth() * props.series.length
  return x(dateIndex) - groupWidth / 2 + seriesIndex * barWidth()
}

function formatValue(value: number) {
  return props.percent ? `${Math.round(value * 10) / 10} %` : value.toLocaleString('fr-CH')
}

function formatDate(value: string) {
  const date = new Date(`${normalizedDate(value)}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  if (props.xUnit === 'Jours') {
    return new Intl.DateTimeFormat('fr-CH', { weekday: 'short', day: 'numeric', month: 'short' }).format(date)
  }
  if (props.xUnit === 'Semaines') {
    return `sem. ${new Intl.DateTimeFormat('fr-CH', { day: 'numeric', month: 'short' }).format(date)}`
  }
  if (props.xUnit === 'Mois') {
    return new Intl.DateTimeFormat('fr-CH', { month: 'short', year: 'numeric' }).format(date)
  }
  return new Intl.DateTimeFormat('fr-CH', { day: 'numeric', month: 'short' }).format(date)
}

const axisLabels = computed(() => {
  if (!dates.value.length) return []
  const maximumLabels = dates.value.length <= 7 ? dates.value.length : dates.value.length <= 20 ? 6 : 5
  const step = Math.max(1, Math.ceil((dates.value.length - 1) / Math.max(1, maximumLabels - 1)))
  const indices = new Set<number>()
  for (let index = 0; index < dates.value.length; index += step) indices.add(index)
  indices.add(dates.value.length - 1)
  return [...indices].map(index => ({ index, date: dates.value[index]! }))
})
</script>

<template>
  <section class="trend-chart admin-card">
    <header>
      <div><p v-if="eyebrow" class="admin-eyebrow">{{ eyebrow }}</p><h3>{{ title }}</h3></div>
      <ul class="trend-chart__legend">
        <li v-for="item in series" :key="item.label"><i :style="{ background: item.color }" />{{ item.label }}</li>
      </ul>
    </header>
    <p class="trend-chart__insight">{{ insight }}</p>
    <div v-if="dates.length && hasValues" class="trend-chart__canvas">
      <svg viewBox="0 0 500 282" preserveAspectRatio="none" role="img" :aria-label="`${title}. Axe horizontal : ${xUnit}. Axe vertical : ${yUnit}.`">
        <g class="trend-chart__grid">
          <line v-for="step in [0, 1, 2, 3, 4]" :key="step" :x1="plotLeft" :x2="plotRight" :y1="plotTop + step * plotHeight / 4" :y2="plotTop + step * plotHeight / 4" />
          <text v-for="step in [0, 1, 2, 3, 4]" :key="`label-${step}`" x="46" :y="plotTop + step * plotHeight / 4 + 4" text-anchor="end">{{ formatValue(maximum * (4 - step) / 4) }}</text>
        </g>
        <template v-if="kind === 'line'">
          <g v-for="item in series" :key="item.label">
            <polyline class="trend-chart__line" :points="linePoints(item)" :stroke="item.color" />
            <circle
              v-for="(date, dateIndex) in dates"
              :key="`${item.label}-${date}`"
              class="trend-chart__point"
              :cx="x(dateIndex)"
              :cy="y(valueAt(item, date))"
              r="4"
              :fill="item.color"
            >
              <title>{{ item.label }} · {{ formatDate(date) }} : {{ formatValue(valueAt(item, date)) }}</title>
            </circle>
          </g>
        </template>
        <template v-else>
          <g v-for="(item, seriesIndex) in series" :key="item.label">
            <rect
              v-for="(date, dateIndex) in dates"
              :key="`${item.label}-${date}`"
              class="trend-chart__bar"
              :x="barX(dateIndex, seriesIndex)"
              :y="y(valueAt(item, date))"
              :width="barWidth()"
              :height="Math.max(1, plotBottom - y(valueAt(item, date)))"
              :fill="item.color"
              rx="2"
            >
              <title>{{ item.label }} · {{ formatDate(date) }} : {{ formatValue(valueAt(item, date)) }}</title>
            </rect>
          </g>
        </template>
        <g class="trend-chart__axis">
          <text v-for="label in axisLabels" :key="label.date" :x="x(label.index)" y="252" :text-anchor="label.index === 0 ? 'start' : label.index === dates.length - 1 ? 'end' : 'middle'">{{ formatDate(label.date) }}</text>
          <text class="trend-chart__unit trend-chart__unit--y" x="14" y="119" text-anchor="middle" transform="rotate(-90 14 119)">{{ yUnit }}</text>
          <text class="trend-chart__unit" :x="plotRight" y="278" text-anchor="end">{{ xUnit }}</text>
        </g>
      </svg>
    </div>
    <p v-else class="trend-chart__empty">Pas encore assez de données pour tracer cette évolution.</p>
  </section>
</template>

<style scoped>
.trend-chart{display:grid;min-width:0;padding:16px;gap:9px;box-shadow:none}.trend-chart header{display:grid;align-items:start;gap:8px}.trend-chart h3{margin:3px 0 0;color:var(--admin-navy);font-size:.96rem}.trend-chart__legend{display:flex;margin:0;padding:0;flex-wrap:wrap;justify-content:flex-start;gap:6px 11px;list-style:none;color:var(--admin-muted);font-size:.66rem;font-weight:750}.trend-chart__legend li{display:flex;align-items:center;gap:5px}.trend-chart__legend i{width:8px;height:8px;border-radius:3px}.trend-chart__insight{min-height:2.7em;margin:0;color:#4e6972;font-size:.72rem;line-height:1.35}.trend-chart__canvas{height:205px;min-width:0}.trend-chart svg{display:block;width:100%;height:100%;overflow:visible}.trend-chart__grid line{stroke:#dce8eb;stroke-width:1;vector-effect:non-scaling-stroke}.trend-chart__grid text,.trend-chart__axis text{fill:var(--admin-muted);font-size:10px}.trend-chart__axis .trend-chart__unit{fill:var(--admin-navy);font-size:11px;font-weight:800}.trend-chart__line{fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.trend-chart__point{stroke:#fff;stroke-width:2;vector-effect:non-scaling-stroke;cursor:help}.trend-chart__bar{opacity:.88;cursor:help}.trend-chart__bar:hover{opacity:1}.trend-chart__empty{display:grid;min-height:150px;margin:0;place-items:center;color:var(--admin-muted);text-align:center}:global(:root[data-theme='dark']) .trend-chart__grid line{stroke:#3d555d}:global(:root[data-theme='dark']) .trend-chart__point{stroke:#20353b}:global(:root[data-theme='dark']) .trend-chart__insight{color:#b7ccd1}@media(max-width:650px){.trend-chart__canvas{height:210px}}
</style>

<script setup lang="ts">
import type {
  ChallengeProgressPoint,
  ChallengeProgressSummary,
  ProgressTrend,
} from '~~/shared/utils/challenge-progress'

const props = defineProps<{
  fingerprint: string
  challengeLabel: string
  adminLearnerId?: number
}>()
const emit = defineEmits<{ close: [] }>()
const summary = ref<ChallengeProgressSummary>()
const pending = ref(true)
const error = ref('')
const dialog = useTemplateRef<HTMLElement>('progress-dialog')
const closeButton = useTemplateRef<HTMLButtonElement>('close-button')
const chartWidth = 720
const chartHeight = 190
const chartLeft = 48
const chartRight = 18
const chartTop = 18
const chartBottom = 30

useDialogFocus(dialog, () => emit('close'), closeButton)

onMounted(async () => {
  try {
    summary.value = await $fetch<ChallengeProgressSummary>('/api/learner/challenge-progress', {
      query: {
        fingerprint: props.fingerprint,
        ...(props.adminLearnerId ? { adminLearnerId: props.adminLearnerId } : {}),
      },
      credentials: 'same-origin',
    })
  }
  catch {
    error.value = 'Impossible de charger la progression de ce défi pour le moment.'
  }
  finally {
    pending.value = false
  }
})

const points = computed(() => summary.value?.points || [])
const firstDate = computed(() => points.value[0]?.occurredAt || '')
const lastDate = computed(() => points.value.at(-1)?.occurredAt || '')

function chartCoordinates(
  value: (point: ChallengeProgressPoint) => number,
  maximum: number,
) {
  const timestamps = points.value.map(point => new Date(point.occurredAt).getTime())
  const first = timestamps[0] || 0
  const last = timestamps.at(-1) || first
  const horizontalRange = chartWidth - chartLeft - chartRight
  const verticalRange = chartHeight - chartTop - chartBottom
  return points.value.map((point, index) => ({
    point,
    x: first === last
      ? chartLeft + horizontalRange / 2
      : chartLeft + ((timestamps[index]! - first) / (last - first)) * horizontalRange,
    y: chartTop + (1 - Math.min(maximum, Math.max(0, value(point))) / maximum) * verticalRange,
  }))
}

const successCoordinates = computed(() => chartCoordinates(point => point.successPercent, 100))
const successPolyline = computed(() => successCoordinates.value.map(point => `${point.x},${point.y}`).join(' '))

function formattedDate(value: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat('fr-CH', {
    timeZone: 'Europe/Zurich',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function trendLabel(trend: ProgressTrend) {
  if (trend.direction === 'up') return 'À la hausse'
  if (trend.direction === 'down') return 'À la baisse'
  if (trend.direction === 'stable') return 'Stable'
  return 'Pas encore de tendance'
}

function trendDelta(trend: ProgressTrend) {
  if (trend.direction === 'insufficient') return 'Il faut au moins deux séances avec des réponses.'
  const sign = trend.delta > 0 ? '+' : ''
  return `${sign}${trend.delta} point${Math.abs(trend.delta) > 1 ? 's' : ''}`
}

function trendTone(trend: ProgressTrend) {
  if (trend.direction === 'stable' || trend.direction === 'insufficient') return 'neutral'
  return trend.direction === 'up' ? 'positive' : 'negative'
}
</script>

<template>
  <Teleport to="body">
    <div class="challenge-progress-overlay" @click.self="emit('close')">
      <section
        ref="progress-dialog"
        class="challenge-progress-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="challenge-progress-title"
        tabindex="-1"
      >
        <header class="challenge-progress-dialog__header">
          <div>
            <p>Progrès du défi</p>
            <h2 id="challenge-progress-title">Progrès · {{ challengeLabel }}</h2>
          </div>
          <button ref="close-button" type="button" aria-label="Fermer l’analyse" @click="emit('close')">×</button>
        </header>

        <div v-if="pending" class="challenge-progress-state">Calcul de la progression…</div>
        <div v-else-if="error" class="challenge-progress-state challenge-progress-state--error" role="alert">{{ error }}</div>
        <div v-else-if="summary && points.length" class="challenge-progress-content">
          <div class="challenge-progress-trends">
            <article :class="`is-${trendTone(summary.successTrend)}`">
              <span>Pourcentage de réussite</span>
              <strong>{{ trendLabel(summary.successTrend) }}</strong>
              <small>{{ trendDelta(summary.successTrend) }}</small>
            </article>
          </div>

          <div class="challenge-progress-chart">
            <header>
              <div>
                <span>Réussite</span>
                <strong>{{ points.at(-1)?.successPercent }}%</strong>
              </div>
              <small>de {{ formattedDate(firstDate) }} à {{ formattedDate(lastDate) }}</small>
            </header>
            <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" role="img" aria-label="Évolution du pourcentage de réussite">
              <line v-for="level in [0, 50, 100]" :key="level" :x1="chartLeft" :x2="chartWidth - chartRight" :y1="chartTop + (1 - level / 100) * (chartHeight - chartTop - chartBottom)" :y2="chartTop + (1 - level / 100) * (chartHeight - chartTop - chartBottom)" />
              <text v-for="level in [0, 50, 100]" :key="`label-${level}`" x="4" :y="chartTop + (1 - level / 100) * (chartHeight - chartTop - chartBottom) + 4">{{ level }}%</text>
              <polyline v-if="successCoordinates.length > 1" :points="successPolyline" />
              <circle v-for="coordinate in successCoordinates" :key="coordinate.point.id" :cx="coordinate.x" :cy="coordinate.y" r="6">
                <title>{{ formattedDate(coordinate.point.occurredAt) }} : {{ coordinate.point.successPercent }}% de réussite</title>
              </circle>
              <text :x="chartLeft" :y="chartHeight - 5">{{ formattedDate(firstDate) }}</text>
              <text v-if="lastDate !== firstDate" :x="chartWidth - chartRight" :y="chartHeight - 5" text-anchor="end">{{ formattedDate(lastDate) }}</text>
            </svg>
          </div>

        </div>
        <div v-else class="challenge-progress-state">
          <strong>Pas encore de séance à analyser.</strong>
          <span>Relance « Tout le défi » et réponds à au moins une question : sa progression apparaîtra ici.</span>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.challenge-progress-overlay{position:fixed;z-index:2600;inset:0;display:grid;padding:24px;place-items:center;background:rgb(10 24 29 / 68%);backdrop-filter:blur(5px)}.challenge-progress-dialog{display:grid;width:min(940px,100%);max-height:calc(100dvh - 48px);overflow:auto;border:1px solid var(--line);border-radius:24px;color:var(--ink);background:var(--surface);box-shadow:0 32px 90px rgb(0 0 0 / 38%)}.challenge-progress-dialog__header{position:sticky;z-index:3;top:0;display:flex;padding:22px 26px;align-items:start;justify-content:space-between;gap:20px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--surface) 94%,transparent);backdrop-filter:blur(12px)}.challenge-progress-dialog__header p{margin:0 0 4px;color:#7052a0;font-size:.72rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.challenge-progress-dialog__header h2{margin:0;color:var(--brand-dark);font-size:clamp(1.4rem,3vw,2.1rem);letter-spacing:.025em}.challenge-progress-dialog__header button{display:grid;width:42px;height:42px;flex:0 0 auto;place-items:center;border:1px solid var(--line);border-radius:50%;color:var(--ink);background:var(--surface-soft);font:700 1.6rem/1 system-ui;cursor:pointer}.challenge-progress-content{display:grid;padding:24px 26px 30px;gap:18px}.challenge-progress-count{margin:0;color:var(--muted)}.challenge-progress-count strong{color:var(--ink);letter-spacing:.035em}.challenge-progress-trends{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.challenge-progress-trends article{display:grid;padding:16px 18px;border:1px solid var(--line);border-radius:15px;gap:4px;background:var(--surface-soft)}.challenge-progress-trends span,.challenge-progress-trends small{color:var(--muted);font-size:.76rem}.challenge-progress-trends strong{font-size:1.15rem;letter-spacing:.035em}.challenge-progress-trends article.is-positive strong{color:var(--success)}.challenge-progress-trends article.is-negative strong{color:var(--danger)}.challenge-progress-chart{display:grid;padding:18px;border:1px solid var(--line);border-radius:18px;gap:10px;background:var(--surface-soft)}.challenge-progress-chart header{display:flex;align-items:end;justify-content:space-between;gap:16px}.challenge-progress-chart header>div{display:flex;align-items:baseline;gap:10px}.challenge-progress-chart header span{color:var(--muted);font-weight:800}.challenge-progress-chart header strong{color:#7052a0;font-size:1.6rem;letter-spacing:.035em}.challenge-progress-chart header small{color:var(--muted)}.challenge-progress-chart svg{width:100%;height:auto;overflow:visible}.challenge-progress-chart line{stroke:color-mix(in srgb,var(--line) 76%,transparent);stroke-width:1}.challenge-progress-chart text{fill:var(--muted);font:11px system-ui}.challenge-progress-chart polyline{fill:none;stroke:#7052a0;stroke-linecap:round;stroke-linejoin:round;stroke-width:5}.challenge-progress-chart circle{fill:var(--surface);stroke:#7052a0;stroke-width:4}.challenge-progress-chart--errors header strong{color:#c96f37}.challenge-progress-chart--errors polyline{stroke:#c96f37}.challenge-progress-chart--errors circle{stroke:#c96f37}.challenge-progress-state{display:grid;min-height:300px;padding:40px;place-content:center;gap:7px;color:var(--muted);text-align:center}.challenge-progress-state strong{color:var(--ink);font-size:1.05rem;letter-spacing:.035em}.challenge-progress-state--error{color:var(--danger)}:global(:root[data-theme='dark']) .challenge-progress-dialog__header p,:global(:root[data-theme='dark']) .challenge-progress-chart header strong{color:#cdb9f6}:global(:root[data-theme='dark']) .challenge-progress-chart polyline{stroke:#cdb9f6}:global(:root[data-theme='dark']) .challenge-progress-chart circle{stroke:#cdb9f6}:global(:root[data-theme='dark']) .challenge-progress-chart--errors header strong{color:#ffb18d}:global(:root[data-theme='dark']) .challenge-progress-chart--errors polyline,:global(:root[data-theme='dark']) .challenge-progress-chart--errors circle{stroke:#ffb18d}@media(max-width:650px){.challenge-progress-overlay{padding:0}.challenge-progress-dialog{width:100%;height:100dvh;max-height:none;border:0;border-radius:0}.challenge-progress-dialog__header{padding:18px}.challenge-progress-content{padding:18px}.challenge-progress-trends{grid-template-columns:1fr}.challenge-progress-chart{padding:12px}.challenge-progress-chart header{align-items:start;flex-direction:column;gap:4px}}

.challenge-progress-trends {
  grid-template-columns: 1fr;
}
</style>

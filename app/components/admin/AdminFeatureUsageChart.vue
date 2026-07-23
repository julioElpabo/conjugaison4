<script setup lang="ts">
import type { AnalyticsBreakdownItem } from '../../../shared/types/analytics'

const props = withDefaults(defineProps<{
  items: AnalyticsBreakdownItem[]
  insight?: string
  title?: string
  eyebrow?: string
  centerLabel?: string
}>(), {
  insight: '',
  title: 'Modes d’utilisation',
  eyebrow: 'Répartition',
  centerLabel: 'utilisations',
})

const colors = ['#168eaa', '#6251a5', '#d28a2d']
const visibleItems = computed(() => props.items.slice(0, 3).map((item, index) => ({ ...item, color: colors[index]! })))
const total = computed(() => visibleItems.value.reduce((sum, item) => sum + item.value, 0))
const gradient = computed(() => {
  if (!total.value) return '#dce8eb'
  let cursor = 0
  const stops = visibleItems.value.map((item) => {
    const start = cursor
    cursor += item.value / total.value * 100
    return `${item.color} ${start}% ${cursor}%`
  })
  return `conic-gradient(${stops.join(',')})`
})

function percentage(value: number) {
  return total.value ? Math.round(value / total.value * 1000) / 10 : 0
}
</script>

<template>
  <section class="feature-chart admin-card">
    <div>
      <p class="admin-eyebrow">{{ eyebrow }}</p>
      <h2>{{ title }}</h2>
      <p v-if="insight" class="feature-chart__insight">{{ insight }}</p>
    </div>
    <div v-if="total" class="feature-chart__content">
      <div
        class="feature-chart__pie"
        :style="{ background: gradient }"
        role="img"
        :aria-label="visibleItems.map(item => `${item.label} : ${item.value}, soit ${percentage(item.value)} %`).join('. ')"
      >
        <span><strong>{{ total.toLocaleString('fr-CH') }}</strong><small>{{ centerLabel }}</small></span>
      </div>
      <ul>
        <li v-for="item in visibleItems" :key="item.label">
          <i :style="{ background: item.color }" />
          <span><b>{{ item.label }}</b><small>{{ percentage(item.value) }} %</small></span>
          <strong>{{ item.value.toLocaleString('fr-CH') }}</strong>
        </li>
      </ul>
    </div>
    <p v-else class="feature-chart__empty">Aucune utilisation de ces trois modes sur cette période.</p>
  </section>
</template>

<style scoped>
.feature-chart{display:grid;padding:18px;gap:15px;box-shadow:none}.feature-chart h2{margin:3px 0 0;color:var(--admin-navy);font-size:1.08rem}.feature-chart__insight{max-width:760px;margin:7px 0 0;color:var(--admin-muted);font-size:.76rem;line-height:1.4}.feature-chart__content{display:grid;grid-template-columns:minmax(170px,230px) minmax(260px,1fr);align-items:center;gap:clamp(22px,4vw,55px)}.feature-chart__pie{display:grid;width:min(100%,220px);aspect-ratio:1;margin:auto;place-items:center;border-radius:50%;box-shadow:inset 0 0 0 1px rgb(255 255 255 / 60%)}.feature-chart__pie::before{grid-area:1/1;width:58%;aspect-ratio:1;border-radius:50%;background:#fff;box-shadow:0 0 0 1px #dce8eb;content:''}.feature-chart__pie span{z-index:1;grid-area:1/1;display:grid;text-align:center}.feature-chart__pie strong{color:var(--admin-navy);font-size:1.55rem}.feature-chart__pie small{color:var(--admin-muted);font-size:.68rem}.feature-chart ul{display:grid;margin:0;padding:0;gap:4px;list-style:none}.feature-chart li{display:grid;grid-template-columns:12px 1fr auto;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #e3ecee}.feature-chart li:last-child{border:0}.feature-chart li>i{width:11px;height:11px;border-radius:3px}.feature-chart li>span{display:grid}.feature-chart li b{color:var(--admin-navy);font-size:.8rem}.feature-chart li small{color:var(--admin-muted);font-size:.68rem}.feature-chart li>strong{color:var(--admin-navy);font-size:1rem}.feature-chart__empty{display:grid;min-height:150px;margin:0;place-items:center;color:var(--admin-muted)}:global(:root[data-theme='dark']) .feature-chart__pie::before{border-color:#40575e;background:#1d3238}@media(max-width:620px){.feature-chart__content{grid-template-columns:1fr}.feature-chart__pie{width:190px}}
</style>

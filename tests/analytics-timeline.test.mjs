import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

describe('graphique temporel configurable des statistiques', () => {
  it('produit les séries de tous les événements pour le temps réel et les périodes', async () => {
    const endpoint = await read('../server/api/admin/analytics.get.ts')
    assert.match(endpoint, /DATE_FORMAT\(created_at, '\$\{seriesFormat\}'\) AS date, event_name/u)
    assert.doesNotMatch(endpoint, /window === 'range'\s*\?\s*database\.execute<EventSeriesRow/u)
    assert.match(endpoint, /series\.sessions = sessionSeries/u)
  })

  it('sépare les lancements classiques et les chats avec coach', async () => {
    const endpoint = await read('../server/api/admin/analytics.get.ts')
    const component = await read('../app/components/admin/AdminMetricTimeline.vue')
    assert.match(endpoint, /exercise_started\.\$\{String\(row\.presentation\)\}/u)
    assert.match(component, /exercise_started\.classic/u)
    assert.match(component, /exercise_started\.chat/u)
  })

  it('permet de choisir la mesure et conserve les heures et minutes sur l’axe horizontal', async () => {
    const page = await read('../app/pages/admin/charts.vue')
    const component = await read('../app/components/admin/AdminMetricTimeline.vue')
    const chart = await read('../app/components/admin/AdminTrendChart.vue')
    assert.match(page, /v-model:metric="timelineMetric"/u)
    assert.match(component, /<select v-model="selectedMetric">/u)
    assert.match(component, /value: 'page_view'/u)
    assert.match(component, /value: 'feature_selected'/u)
    assert.match(chart, /props\.xUnit === 'Minutes'/u)
    assert.match(chart, /props\.xUnit === 'Heures'/u)
    assert.doesNotMatch(chart, /value\.slice\(0,\s*10\)/u)
  })

  it('distingue une langue simplement testée d’une langue réellement utilisée', async () => {
    const types = await read('../shared/types/analytics.ts')
    const tracker = await read('../app/composables/useSiteAnalytics.ts')
    const layout = await read('../app/layouts/default.vue')
    const endpoint = await read('../server/api/admin/analytics.get.ts')
    const component = await read('../app/components/admin/AdminMetricTimeline.vue')
    assert.match(types, /'language_tested'/u)
    assert.match(types, /'language_used'/u)
    assert.match(layout, /track\('language_tested'/u)
    assert.match(tracker, /sendEvent\('language_used'/u)
    assert.match(tracker, /sessionStorage\.setItem\(usedLanguagesStorageKey/u)
    assert.match(tracker, /registerFirstLanguageUsage\(locale\)/u)
    assert.match(endpoint, /event_name IN \('language_tested','language_used'\)/u)
    assert.match(component, /value: 'language_tested\.de'/u)
    assert.match(component, /value: 'language_used\.de'/u)
  })
})

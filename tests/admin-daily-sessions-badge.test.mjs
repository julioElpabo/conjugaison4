import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

test('protège et calcule les visiteurs distincts du jour avec GA4', async () => {
  const endpoint = await read('../server/api/admin/daily-visitors.get.ts')
  const service = await read('../server/services/daily-visitors.ts')
  const ga4 = await read('../server/utils/google-analytics.ts')

  assert.match(endpoint, /requireAdministrator\(event\)/u)
  assert.match(service, /googleAnalyticsTodayUsers\(\)/u)
  assert.match(service, /source: 'ga4'/u)
  assert.match(service, /first_seen >= CURRENT_DATE/u)
  assert.match(service, /first_seen < CURRENT_DATE \+ INTERVAL 1 DAY/u)
  assert.match(ga4, /metrics: \[\{ name: 'totalUsers' \}\]/u)
  assert.match(ga4, /currentZurichDate\(\)/u)
})

test('affiche le badge dans la barre de navigation uniquement pour un administrateur connecté', async () => {
  const layout = await read('../app/layouts/default.vue')
  const badge = await read('../app/components/admin/AdminDailySessionsBadge.vue')

  assert.match(layout, /<AdminDailySessionsBadge\s*\/>/u)
  assert.match(badge, /v-if="isAuthenticated"/u)
  assert.match(badge, /\/api\/admin\/daily-visitors/u)
  assert.match(badge, /visiteurs aujourd’hui/u)
  assert.match(badge, /visiteurs estimés/u)
  assert.match(badge, /60_000/u)
})

test('conserve le compteur de sessions distinct pour les alertes administrateur', async () => {
  const notifications = await read('../server/services/admin-push-notifications.ts')
  assert.match(notifications, /dailySessionSnapshot\(database\)/u)
})

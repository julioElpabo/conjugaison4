import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  accountAlertThresholds,
  dailySessionAlertThresholds,
} from '../server/services/admin-push-notifications.ts'

const read = path => readFile(new URL(path, import.meta.url), 'utf8')

test('les comptes déclenchent une alerte toutes les dizaines à partir de 40', () => {
  assert.deepEqual(accountAlertThresholds(39), [])
  assert.deepEqual(accountAlertThresholds(40), [40])
  assert.deepEqual(accountAlertThresholds(67), [40, 50, 60])
})

test('le compteur des comptes créés ne diminue pas lors d’une suppression', async () => {
  const [migration, service] = await Promise.all([
    read('../server/plugins/admin-push-migrations.ts'),
    read('../server/services/admin-push-notifications.ts'),
  ])
  assert.match(migration, /admin_push_metrics/u)
  assert.match(service, /ON DUPLICATE KEY UPDATE metric_value=metric_value\+1/u)
  assert.match(service, /learner-registration:\$\{accountId\}/u)
  assert.match(service, /Tatitotu · Nouvelle inscription/u)
  assert.doesNotMatch(service, /body:.*username/u)
})

test('les sessions déclenchent 1000, 1500, puis chaque centaine', () => {
  assert.deepEqual(dailySessionAlertThresholds(999), [])
  assert.deepEqual(dailySessionAlertThresholds(1499), [1000])
  assert.deepEqual(dailySessionAlertThresholds(1724), [1000, 1500, 1600, 1700])
})

test('les abonnements push restent réservés aux administrateurs', async () => {
  const endpoints = await Promise.all([
    read('../server/api/admin/push-subscriptions/index.get.ts'),
    read('../server/api/admin/push-subscriptions/index.post.ts'),
    read('../server/api/admin/push-subscriptions/index.delete.ts'),
    read('../server/api/admin/push-subscriptions/test.post.ts'),
    read('../server/api/admin/push-subscriptions/preferences.put.ts'),
  ])
  for (const endpoint of endpoints) assert.match(endpoint, /requireAdministrator\(event\)/u)
})

test('les notifications utilisent la graphie Tatitotu', async () => {
  const [service, worker] = await Promise.all([
    read('../server/services/admin-push-notifications.ts'),
    read('../public/admin-push-sw.js'),
  ])
  assert.match(service, /title: 'Tatitotu/u)
  assert.doesNotMatch(`${service}\n${worker}`, /TatiToTu/u)
})

test('les alertes pays et FALC utilisent seulement une activité réelle', async () => {
  const [service, eventEndpoint, analytics] = await Promise.all([
    read('../server/services/admin-push-notifications.ts'),
    read('../server/api/analytics/event.post.ts'),
    read('../server/utils/google-analytics.ts'),
  ])
  assert.match(analytics, /runRealtimeReport/u)
  assert.match(analytics, /countryId.*country/u)
  assert.match(service, /code === 'CH'/u)
  assert.match(service, /country\.value <= 5/u)
  assert.match(eventEndpoint, /FALC_USAGE_EVENTS/u)
  assert.match(eventEndpoint, /metadata\?\.falc === 'true'/u)
  assert.doesNotMatch(eventEndpoint, /FALC_USAGE_EVENTS[\s\S]*'feature_selected'/u)
})

test('chaque abonnement possède cinq préférences indépendantes', async () => {
  const [migration, accountPage] = await Promise.all([
    read('../server/plugins/admin-push-migrations.ts'),
    read('../app/pages/mon-compte.vue'),
  ])
  for (const key of ['learner_registration', 'learner_accounts', 'daily_sessions', 'foreign_country', 'falc_usage']) {
    assert.match(migration, new RegExp(`${key} TINYINT\\(1\\)`, 'u'))
    assert.match(accountPage, new RegExp(key, 'u'))
  }
})

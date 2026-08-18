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

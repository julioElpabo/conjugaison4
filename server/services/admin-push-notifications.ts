import { createHash } from 'node:crypto'
import webPush from 'web-push'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'

interface VapidRow extends RowDataPacket { public_key: string, private_key: string }
interface SubscriptionRow extends RowDataPacket {
  id: number
  endpoint: string
  p256dh: string
  auth_secret: string
}
interface CountRow extends RowDataPacket { value: number, date?: string }
interface AlertRow extends RowDataPacket { alert_key: string, payload_json: string | Record<string, unknown> }

export interface BrowserPushSubscription {
  endpoint: string
  keys: { p256dh: string, auth: string }
}

type AlertCandidate = {
  key: string
  type: 'learner_accounts' | 'daily_sessions'
  threshold: number
  observed: number
  payload: {
    title: string
    body: string
    tag: string
    url: string
  }
}

let evaluationPromise: Promise<void> | null = null
let lastSessionEvaluationAt = 0

export function accountAlertThresholds(value: number) {
  const thresholds: number[] = []
  for (let threshold = 40; threshold <= value; threshold += 10) thresholds.push(threshold)
  return thresholds
}

export function dailySessionAlertThresholds(value: number) {
  const thresholds: number[] = []
  if (value >= 1000) thresholds.push(1000)
  for (let threshold = 1500; threshold <= value; threshold += 100) thresholds.push(threshold)
  return thresholds
}

async function currentCandidates(): Promise<AlertCandidate[]> {
  const database = useDatabase()
  await database.query(`
    INSERT IGNORE INTO admin_push_metrics (metric_name, metric_value)
    SELECT 'learner_accounts_created', COUNT(*) FROM learner_accounts
  `)
  const [[[accounts]], [[sessions]]] = await Promise.all([
    database.query<CountRow[]>(
      "SELECT metric_value AS value FROM admin_push_metrics WHERE metric_name='learner_accounts_created'",
    ),
    database.query<CountRow[]>(`SELECT COUNT(*) AS value, DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d') AS date
      FROM analytics_sessions WHERE first_seen >= CURRENT_DATE AND first_seen < CURRENT_DATE + INTERVAL 1 DAY`),
  ])
  const accountCount = Number(accounts?.value) || 0
  const sessionCount = Number(sessions?.value) || 0
  const date = String(sessions?.date || new Date().toISOString().slice(0, 10))
  return [
    ...accountAlertThresholds(accountCount).map(threshold => ({
      key: `learner-accounts:${threshold}`,
      type: 'learner_accounts' as const,
      threshold,
      observed: accountCount,
      payload: {
        title: 'Tatitotu · Nouveau palier',
        body: `${threshold.toLocaleString('fr-CH')} comptes ont été créés.`,
        tag: `tatitotu-accounts-${threshold}`,
        url: '/admin/users',
      },
    })),
    ...dailySessionAlertThresholds(sessionCount).map(threshold => ({
      key: `daily-sessions:${date}:${threshold}`,
      type: 'daily_sessions' as const,
      threshold,
      observed: sessionCount,
      payload: {
        title: 'Tatitotu · Forte activité',
        body: `${threshold.toLocaleString('fr-CH')} sessions depuis le début de la journée.`,
        tag: `tatitotu-sessions-${date}-${threshold}`,
        url: '/admin/charts',
      },
    })),
  ]
}

async function insertCandidates(status: 'pending' | 'skipped') {
  const database = useDatabase()
  for (const candidate of await currentCandidates()) {
    await database.execute(
      `INSERT IGNORE INTO admin_push_alerts
        (alert_key, alert_type, threshold_value, observed_value, payload_json, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [candidate.key, candidate.type, candidate.threshold, candidate.observed, JSON.stringify(candidate.payload), status],
    )
  }
}

async function sendAlert(alert: AlertRow) {
  const database = useDatabase()
  const [subscriptions] = await database.query<SubscriptionRow[]>(`
    SELECT subscriptions.id, subscriptions.endpoint, subscriptions.p256dh, subscriptions.auth_secret
    FROM admin_push_subscriptions subscriptions
    INNER JOIN users administrator
      ON administrator.id=subscriptions.administrator_id AND administrator.privilege_id=1
    WHERE subscriptions.enabled=1
  `)
  if (!subscriptions.length) {
    await database.execute(
      "UPDATE admin_push_alerts SET status='skipped', last_error='Aucun appareil administrateur abonné' WHERE alert_key=?",
      [alert.alert_key],
    )
    return
  }

  const [vapidRows] = await database.query<VapidRow[]>('SELECT public_key, private_key FROM admin_push_vapid WHERE id=1')
  const vapid = vapidRows[0]
  if (!vapid) throw new Error('Clés Web Push indisponibles')
  const contactEmail = String(useRuntimeConfig().contactEmail || 'admin@tatitotu.ch').trim()
  webPush.setVapidDetails(`mailto:${contactEmail}`, vapid.public_key, vapid.private_key)
  const payload = typeof alert.payload_json === 'string' ? alert.payload_json : JSON.stringify(alert.payload_json)
  let delivered = 0
  let transientErrors = 0

  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await webPush.sendNotification({
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth_secret },
      }, payload, { TTL: 24 * 60 * 60, urgency: 'normal' })
      delivered += 1
      await database.execute(
        'UPDATE admin_push_subscriptions SET last_success_at=CURRENT_TIMESTAMP, last_error=NULL WHERE id=?',
        [subscription.id],
      )
    }
    catch (error) {
      const statusCode = Number((error as { statusCode?: unknown })?.statusCode) || 0
      const message = error instanceof Error ? error.message.slice(0, 255) : 'Échec de livraison Web Push'
      if (statusCode === 404 || statusCode === 410) {
        await database.execute('DELETE FROM admin_push_subscriptions WHERE id=?', [subscription.id])
      }
      else {
        transientErrors += 1
        await database.execute(
          'UPDATE admin_push_subscriptions SET last_error=? WHERE id=?',
          [message, subscription.id],
        )
      }
    }
  }))

  if (delivered > 0) {
    await database.execute(
      "UPDATE admin_push_alerts SET status='sent', sent_at=CURRENT_TIMESTAMP, last_error=NULL WHERE alert_key=?",
      [alert.alert_key],
    )
  }
  else if (transientErrors > 0) {
    await database.execute(
      `UPDATE admin_push_alerts SET status='failed', next_attempt_at=CURRENT_TIMESTAMP + INTERVAL 5 MINUTE,
        last_error='Livraison temporairement impossible' WHERE alert_key=?`,
      [alert.alert_key],
    )
  }
  else {
    await database.execute(
      "UPDATE admin_push_alerts SET status='skipped', last_error='Tous les abonnements ont expiré' WHERE alert_key=?",
      [alert.alert_key],
    )
  }
}

async function deliverPendingAlerts() {
  const database = useDatabase()
  const [alerts] = await database.query<AlertRow[]>(`
    SELECT alert_key, payload_json FROM admin_push_alerts
    WHERE status='pending'
      OR (status='failed' AND (next_attempt_at IS NULL OR next_attempt_at<=CURRENT_TIMESTAMP))
      OR (status='sending' AND next_attempt_at<CURRENT_TIMESTAMP - INTERVAL 5 MINUTE)
    ORDER BY created_at ASC LIMIT 10
  `)
  for (const alert of alerts) {
    const [claim] = await database.execute<ResultSetHeader>(`
      UPDATE admin_push_alerts
      SET status='sending', attempts=attempts+1, next_attempt_at=CURRENT_TIMESTAMP
      WHERE alert_key=? AND (
        status='pending'
        OR (status='failed' AND (next_attempt_at IS NULL OR next_attempt_at<=CURRENT_TIMESTAMP))
        OR (status='sending' AND next_attempt_at<CURRENT_TIMESTAMP - INTERVAL 5 MINUTE)
      )
    `, [alert.alert_key])
    if (claim.affectedRows) await sendAlert(alert)
  }
}

async function evaluate() {
  await insertCandidates('pending')
  await deliverPendingAlerts()
}

export function evaluateAdminPushAlerts(options: { force?: boolean } = {}) {
  if (!options.force && Date.now() - lastSessionEvaluationAt < 30_000) return Promise.resolve()
  if (evaluationPromise) return evaluationPromise
  lastSessionEvaluationAt = Date.now()
  evaluationPromise = evaluate()
    .catch(error => console.error('[push] Évaluation des alertes impossible.', error))
    .finally(() => { evaluationPromise = null })
  return evaluationPromise
}

export async function recordLearnerAccountCreated() {
  try {
    await useDatabase().query(`
      INSERT INTO admin_push_metrics (metric_name, metric_value)
      SELECT 'learner_accounts_created', COUNT(*) FROM learner_accounts
      ON DUPLICATE KEY UPDATE metric_value=metric_value+1
    `)
    await evaluateAdminPushAlerts({ force: true })
  }
  catch (error) {
    console.error('[push] Le nouveau compte n’a pas pu être ajouté au compteur de notifications.', error)
  }
}

export async function initializeAdminPushBaseline() {
  const [[subscriptions]] = await useDatabase().query<CountRow[]>(
    'SELECT COUNT(*) AS value FROM admin_push_subscriptions WHERE enabled=1',
  )
  if (!Number(subscriptions?.value)) await insertCandidates('skipped')
}

export async function getAdminPushPublicKey() {
  const [rows] = await useDatabase().query<VapidRow[]>('SELECT public_key, private_key FROM admin_push_vapid WHERE id=1')
  return rows[0]?.public_key || ''
}

export async function saveAdminPushSubscription(administratorId: number, subscription: BrowserPushSubscription) {
  const database = useDatabase()
  const endpointHash = createHash('sha256').update(subscription.endpoint).digest('hex')
  await database.execute(`
    INSERT INTO admin_push_subscriptions
      (administrator_id, endpoint_hash, endpoint, p256dh, auth_secret, enabled)
    VALUES (?, ?, ?, ?, ?, 1)
    ON DUPLICATE KEY UPDATE administrator_id=VALUES(administrator_id), endpoint=VALUES(endpoint),
      p256dh=VALUES(p256dh), auth_secret=VALUES(auth_secret), enabled=1, last_error=NULL
  `, [administratorId, endpointHash, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth])
}

export async function deleteAdminPushSubscription(administratorId: number, endpoint: string) {
  const endpointHash = createHash('sha256').update(endpoint).digest('hex')
  await useDatabase().execute(
    'DELETE FROM admin_push_subscriptions WHERE administrator_id=? AND endpoint_hash=?',
    [administratorId, endpointHash],
  )
}

export async function sendAdminPushTest(administratorId: number, endpoint: string) {
  const database = useDatabase()
  const endpointHash = createHash('sha256').update(endpoint).digest('hex')
  const [subscriptions] = await database.query<SubscriptionRow[]>(`
    SELECT id, endpoint, p256dh, auth_secret FROM admin_push_subscriptions
    WHERE administrator_id=? AND endpoint_hash=? AND enabled=1
  `, [administratorId, endpointHash])
  const subscription = subscriptions[0]
  if (!subscription) throw createError({ statusCode: 404, statusMessage: 'Abonnement introuvable' })
  const [vapidRows] = await database.query<VapidRow[]>('SELECT public_key, private_key FROM admin_push_vapid WHERE id=1')
  const vapid = vapidRows[0]
  if (!vapid) throw createError({ statusCode: 503, statusMessage: 'Web Push indisponible' })
  const contactEmail = String(useRuntimeConfig().contactEmail || 'admin@tatitotu.ch').trim()
  webPush.setVapidDetails(`mailto:${contactEmail}`, vapid.public_key, vapid.private_key)
  await webPush.sendNotification({
    endpoint: subscription.endpoint,
    keys: { p256dh: subscription.p256dh, auth: subscription.auth_secret },
  }, JSON.stringify({
    title: 'Tatitotu · Notifications activées',
    body: 'Les alertes administrateur arriveront bien sur cet appareil.',
    tag: 'tatitotu-push-test',
    url: '/mon-compte',
  }), { TTL: 60 })
}

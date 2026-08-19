import { createHash } from 'node:crypto'
import webPush from 'web-push'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { googleAnalyticsRealtimeCountries } from '../utils/google-analytics'
import { dailySessionSnapshot } from './daily-sessions'

interface VapidRow extends RowDataPacket { public_key: string, private_key: string }
interface SubscriptionRow extends RowDataPacket {
  id: number
  endpoint: string
  p256dh: string
  auth_secret: string
  learner_registration: number
  learner_accounts: number
  daily_sessions: number
  foreign_country: number
  falc_usage: number
}
interface CountRow extends RowDataPacket { value: number }
interface AlertRow extends RowDataPacket {
  alert_key: string
  alert_type: AdminPushPreferenceKey
  payload_json: string | Record<string, unknown>
}

export const ADMIN_PUSH_PREFERENCE_KEYS = [
  'learner_registration',
  'learner_accounts',
  'daily_sessions',
  'foreign_country',
  'falc_usage',
] as const
export type AdminPushPreferenceKey = typeof ADMIN_PUSH_PREFERENCE_KEYS[number]
export type AdminPushPreferences = Record<AdminPushPreferenceKey, boolean>

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
  const [accountResult, sessions] = await Promise.all([
    database.query<CountRow[]>(
      "SELECT metric_value AS value FROM admin_push_metrics WHERE metric_name='learner_accounts_created'",
    ),
    dailySessionSnapshot(database),
  ])
  const [accounts] = accountResult[0]
  const accountCount = Number(accounts?.value) || 0
  const sessionCount = sessions.count
  const date = sessions.date || new Date().toISOString().slice(0, 10)
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
        body: `${sessionCount.toLocaleString('fr-CH')} sessions le ${date} · palier de ${threshold.toLocaleString('fr-CH')} atteint.`,
        tag: `tatitotu-sessions-${date}-${threshold}`,
        url: '/admin/charts',
      },
    })),
  ]
}

async function hasEnabledPreference(preference: AdminPushPreferenceKey) {
  const [[row]] = await useDatabase().query<CountRow[]>(`
    SELECT COUNT(*) AS value
    FROM admin_push_subscriptions subscriptions
    LEFT JOIN admin_push_subscription_preferences preferences ON preferences.subscription_id=subscriptions.id
    INNER JOIN users administrator
      ON administrator.id=subscriptions.administrator_id AND administrator.privilege_id=1
    WHERE subscriptions.enabled=1 AND COALESCE(preferences.${preference}, 1)=1
  `)
  return Number(row?.value) > 0
}

async function insertForeignCountryCandidates() {
  if (!await hasEnabledPreference('foreign_country')) return
  try {
    const countries = await googleAnalyticsRealtimeCountries()
    if (!countries) return
    const date = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date())
    const database = useDatabase()
    for (const country of countries) {
      const code = String(country.code || '').toUpperCase()
      if (code === 'CH' || !/^[A-Z]{2}$/u.test(code) || country.value <= 5) continue
      const label = String(country.label || code).slice(0, 100)
      await database.execute(`
        INSERT IGNORE INTO admin_push_alerts
          (alert_key, alert_type, threshold_value, observed_value, payload_json, status)
        VALUES (?, 'foreign_country', 6, ?, ?, 'pending')
      `, [
        `foreign-country:${date}:${code}`,
        country.value,
        JSON.stringify({
          title: 'Tatitotu · Audience internationale',
          body: `Pays : ${label} · ${country.value.toLocaleString('fr-CH')} personnes actives en même temps.`,
          tag: `tatitotu-foreign-country-${date}-${code}`,
          url: '/admin/charts',
        }),
      ])
    }
  }
  catch (error) {
    console.error('[push] Lecture des pays actifs impossible.', error)
  }
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
    SELECT subscriptions.id, subscriptions.endpoint, subscriptions.p256dh, subscriptions.auth_secret,
      COALESCE(preferences.learner_registration, 1) AS learner_registration,
      COALESCE(preferences.learner_accounts, 1) AS learner_accounts,
      COALESCE(preferences.daily_sessions, 1) AS daily_sessions,
      COALESCE(preferences.foreign_country, 1) AS foreign_country,
      COALESCE(preferences.falc_usage, 1) AS falc_usage
    FROM admin_push_subscriptions subscriptions
    LEFT JOIN admin_push_subscription_preferences preferences ON preferences.subscription_id=subscriptions.id
    INNER JOIN users administrator
      ON administrator.id=subscriptions.administrator_id AND administrator.privilege_id=1
    WHERE subscriptions.enabled=1
  `)
  const enabledSubscriptions = subscriptions.filter(subscription => Boolean(subscription[alert.alert_type]))
  if (!enabledSubscriptions.length) {
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

  await Promise.all(enabledSubscriptions.map(async (subscription) => {
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
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())

  // Une notification quotidienne n'a plus de sens le lendemain. Sans cette
  // expiration, une panne Web Push peut faire apparaître un ancien palier comme
  // s'il décrivait l'activité du jour.
  await database.execute(`
    UPDATE admin_push_alerts
    SET status='skipped', last_error='Alerte quotidienne expirée'
    WHERE alert_type='daily_sessions'
      AND status IN ('pending', 'failed', 'sending')
      AND alert_key NOT LIKE ?
  `, [`daily-sessions:${today}:%`])

  const [alerts] = await database.query<AlertRow[]>(`
    SELECT alert_key, alert_type, payload_json FROM admin_push_alerts
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
  await insertForeignCountryCandidates()
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

export async function recordLearnerAccountCreated(accountId: number) {
  try {
    const database = useDatabase()
    await database.query(`
      INSERT INTO admin_push_metrics (metric_name, metric_value)
      SELECT 'learner_accounts_created', COUNT(*) FROM learner_accounts
      ON DUPLICATE KEY UPDATE metric_value=metric_value+1
    `)
    const [[metric]] = await database.query<CountRow[]>(
      "SELECT metric_value AS value FROM admin_push_metrics WHERE metric_name='learner_accounts_created'",
    )
    const total = Number(metric?.value) || 0
    await database.execute(`
      INSERT IGNORE INTO admin_push_alerts
        (alert_key, alert_type, threshold_value, observed_value, payload_json, status)
      VALUES (?, 'learner_registration', ?, ?, ?, 'pending')
    `, [
      `learner-registration:${accountId}`,
      total,
      total,
      JSON.stringify({
        title: 'Tatitotu · Nouvelle inscription',
        body: `Un nouveau compte vient d’être créé. Total : ${total.toLocaleString('fr-CH')}.`,
        tag: `tatitotu-registration-${accountId}`,
        url: '/admin/users',
      }),
    ])
    await evaluateAdminPushAlerts({ force: true })
  }
  catch (error) {
    console.error('[push] Le nouveau compte n’a pas pu être ajouté au compteur de notifications.', error)
  }
}

export async function recordFalcModeUsed(sessionId: string) {
  try {
    if (!await hasEnabledPreference('falc_usage')) return
    const database = useDatabase()
    await database.execute(`
      INSERT IGNORE INTO admin_push_alerts
        (alert_key, alert_type, threshold_value, observed_value, payload_json, status)
      VALUES (?, 'falc_usage', 1, 1, ?, 'pending')
    `, [
      `falc-usage:${sessionId}`,
      JSON.stringify({
        title: 'Tatitotu · Mode FALC utilisé',
        body: 'Une personne utilise réellement le mode FALC.',
        tag: `tatitotu-falc-usage-${sessionId}`,
        url: '/admin/charts',
      }),
    ])
    await deliverPendingAlerts()
  }
  catch (error) {
    console.error('[push] Notification d’utilisation du mode FALC impossible.', error)
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
  const [rows] = await database.query<Array<RowDataPacket & { id: number }>>(
    'SELECT id FROM admin_push_subscriptions WHERE endpoint_hash=? AND administrator_id=?',
    [endpointHash, administratorId],
  )
  const subscriptionId = Number(rows[0]?.id)
  if (!subscriptionId) throw new Error('Abonnement Web Push introuvable après enregistrement')
  await database.execute(
    'INSERT IGNORE INTO admin_push_subscription_preferences (subscription_id) VALUES (?)',
    [subscriptionId],
  )
  return getAdminPushPreferences(subscriptionId)
}

async function getAdminPushPreferences(subscriptionId: number): Promise<AdminPushPreferences> {
  const [rows] = await useDatabase().query<Array<RowDataPacket & Record<AdminPushPreferenceKey, number>>>(`
    SELECT learner_registration, learner_accounts, daily_sessions, foreign_country, falc_usage
    FROM admin_push_subscription_preferences WHERE subscription_id=?
  `, [subscriptionId])
  const row = rows[0]
  return Object.fromEntries(ADMIN_PUSH_PREFERENCE_KEYS.map(key => [key, row ? Boolean(row[key]) : true])) as AdminPushPreferences
}

export async function updateAdminPushPreferences(
  administratorId: number,
  endpoint: string,
  preferences: AdminPushPreferences,
) {
  const database = useDatabase()
  const endpointHash = createHash('sha256').update(endpoint).digest('hex')
  const [rows] = await database.query<Array<RowDataPacket & { id: number }>>(`
    SELECT id FROM admin_push_subscriptions
    WHERE administrator_id=? AND endpoint_hash=? AND enabled=1
  `, [administratorId, endpointHash])
  const subscriptionId = Number(rows[0]?.id)
  if (!subscriptionId) throw createError({ statusCode: 404, statusMessage: 'Abonnement introuvable' })
  await database.execute(`
    INSERT INTO admin_push_subscription_preferences
      (subscription_id, learner_registration, learner_accounts, daily_sessions, foreign_country, falc_usage)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE learner_registration=VALUES(learner_registration),
      learner_accounts=VALUES(learner_accounts), daily_sessions=VALUES(daily_sessions),
      foreign_country=VALUES(foreign_country), falc_usage=VALUES(falc_usage)
  `, [subscriptionId, ...ADMIN_PUSH_PREFERENCE_KEYS.map(key => preferences[key] ? 1 : 0)])
  return getAdminPushPreferences(subscriptionId)
}

export async function deleteAdminPushSubscription(administratorId: number, endpoint: string) {
  const endpointHash = createHash('sha256').update(endpoint).digest('hex')
  const database = useDatabase()
  const [rows] = await database.query<Array<RowDataPacket & { id: number }>>(
    'SELECT id FROM admin_push_subscriptions WHERE administrator_id=? AND endpoint_hash=?',
    [administratorId, endpointHash],
  )
  const subscriptionId = Number(rows[0]?.id)
  if (subscriptionId) {
    await database.execute('DELETE FROM admin_push_subscription_preferences WHERE subscription_id=?', [subscriptionId])
    await database.execute('DELETE FROM admin_push_subscriptions WHERE id=?', [subscriptionId])
  }
}

export async function sendAdminPushTest(administratorId: number, endpoint: string, testId: string) {
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
  try {
    const receipt = await webPush.sendNotification({
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth_secret },
    }, JSON.stringify({
      title: 'Tatitotu · Notifications activées',
      body: 'Les alertes administrateur arriveront bien sur cet appareil.',
      tag: 'tatitotu-push-test',
      url: '/mon-compte',
      testId,
    }), { TTL: 5 * 60, urgency: 'high' })
    await database.execute(
      'UPDATE admin_push_subscriptions SET last_success_at=CURRENT_TIMESTAMP, last_error=NULL WHERE id=?',
      [subscription.id],
    )
    return { statusCode: receipt.statusCode }
  }
  catch (error) {
    const statusCode = Number((error as { statusCode?: unknown })?.statusCode) || 502
    const providerMessage = error instanceof Error ? error.message.slice(0, 255) : 'Échec de livraison Web Push'
    await database.execute(
      'UPDATE admin_push_subscriptions SET last_error=? WHERE id=?',
      [providerMessage, subscription.id],
    )
    if (statusCode === 404 || statusCode === 410) {
      await database.execute('UPDATE admin_push_subscriptions SET enabled=0 WHERE id=?', [subscription.id])
    }
    throw createError({
      statusCode: statusCode >= 400 && statusCode < 600 ? statusCode : 502,
      statusMessage: `Service Push : ${providerMessage}`,
    })
  }
}

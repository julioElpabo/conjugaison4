import type { RowDataPacket } from 'mysql2/promise'
import type {
  AnalyticsBreakdownItem,
  AnalyticsSeriesPoint,
  AnalyticsUsersResponse,
} from '../../../shared/types/analytics'

interface CountRow extends RowDataPacket { value: number }
interface LanguageRow extends RowDataPacket { locale: string, value: number }
interface SeriesRow extends RowDataPacket { date: string, value: number }
interface FeatureRow extends RowDataPacket { feature: string, value: number }

const localeLabels: Record<string, string> = {
  fr: 'Français',
  de: 'Allemand',
  en: 'Anglais',
  it: 'Italien',
  es: 'Espagnol',
}
const connectedFeatureLabels: Record<string, string> = {
  'learner.history': 'Historique', 'learner.summary': 'Bilan de séance', 'learner.finish': 'Reprendre une séance',
  'learner.relaunch.same': 'Relancer dans le même ordre', 'learner.relaunch.random': 'Relancer au hasard',
  'learner.errors.session': 'Reprendre les erreurs de la séance', 'learner.errors.challenge': 'Reprendre les erreurs du défi',
  'learner.errors.targeted': 'Défi ciblé par erreur', 'learner.progress': 'Comprendre ses erreurs',
  'learner.training': 'Progression par défi', 'learner.training.analysis': 'Analyse de progression',
  'learner.preferences': 'Préférences', 'learner.account': 'Réglages du compte',
}

function isoDate(value: unknown, fallback: Date) {
  const text = String(value || '')
  return /^\d{4}-\d{2}-\d{2}$/u.test(text) && !Number.isNaN(Date.parse(`${text}T12:00:00Z`))
    ? text
    : fallback.toISOString().slice(0, 10)
}

function cumulativeAccountSeries(
  rows: SeriesRow[],
  startDate: string,
  endDate: string,
  unit: AnalyticsUsersResponse['registrationUnit'],
  initialTotal: number,
) {
  const values = new Map(rows.map(row => [String(row.date), Number(row.value) || 0]))
  const cursor = new Date(`${startDate}T12:00:00Z`)
  const end = new Date(`${endDate}T12:00:00Z`)
  if (unit === 'Semaines') {
    const weekday = cursor.getUTCDay() || 7
    cursor.setUTCDate(cursor.getUTCDate() - weekday + 1)
  }
  if (unit === 'Mois') cursor.setUTCDate(1)
  const points: AnalyticsSeriesPoint[] = []
  let total = initialTotal
  while (cursor <= end) {
    const date = cursor.toISOString().slice(0, 10)
    total += values.get(date) || 0
    points.push({ date, value: total })
    if (unit === 'Jours') cursor.setUTCDate(cursor.getUTCDate() + 1)
    else if (unit === 'Semaines') cursor.setUTCDate(cursor.getUTCDate() + 7)
    else cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return points
}

export default defineEventHandler(async (event): Promise<AnalyticsUsersResponse> => {
  requireAdministrator(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const query = getQuery(event)
  const today = new Date()
  const defaultStart = new Date(today)
  defaultStart.setDate(defaultStart.getDate() - 29)
  const startDate = isoDate(query.start, defaultStart)
  const endDate = isoDate(query.end, today)
  if (startDate > endDate) {
    throw createError({ statusCode: 400, statusMessage: 'La date de début doit précéder la date de fin.' })
  }

  const rangeDays = Math.max(1, Math.ceil(
    (Date.parse(`${endDate}T12:00:00Z`) - Date.parse(`${startDate}T12:00:00Z`)) / 86400000,
  ) + 1)
  const registrationFormat = rangeDays <= 45
    ? '%Y-%m-%d'
    : rangeDays <= 210
      ? '%Y-%m-%d'
      : '%Y-%m-01'
  const registrationDate = rangeDays <= 45
    ? `DATE_FORMAT(a.created_at, '${registrationFormat}')`
    : rangeDays <= 210
      ? 'DATE_FORMAT(DATE_SUB(DATE(a.created_at), INTERVAL WEEKDAY(a.created_at) DAY), \'%Y-%m-%d\')'
      : `DATE_FORMAT(a.created_at, '${registrationFormat}')`
  const registrationUnit = rangeDays <= 45 ? 'Jours' : rangeDays <= 210 ? 'Semaines' : 'Mois'
  const database = useDatabase()

  const [[[total]], [[initialTotal]], [[active]], [languageRows], [anonymousLanguageRows], [registrationRows], [[errorReviews]], [[loginSummary]], [[failedLogins]], [connectedFeatureRows]] = await Promise.all([
    database.execute<CountRow[]>(`
      SELECT COUNT(*) AS value
      FROM learner_accounts
      WHERE deleted_at IS NULL
    `),
    database.execute<CountRow[]>(`
      SELECT COUNT(*) AS value
      FROM learner_accounts
      WHERE deleted_at IS NULL AND created_at<?
    `, [startDate]),
    database.execute<CountRow[]>(`
      SELECT COUNT(DISTINCT activity.account_id) AS value
      FROM (
        SELECT account_id FROM learner_login_events
        WHERE event_type='login' AND occurred_at>=? AND occurred_at<DATE_ADD(?, INTERVAL 1 DAY)
        UNION
        SELECT account_id FROM learner_sessions
        WHERE last_seen_at>=? AND last_seen_at<DATE_ADD(?, INTERVAL 1 DAY)
        UNION
        SELECT account_id FROM learner_challenge_runs
        WHERE last_answered_at>=? AND last_answered_at<DATE_ADD(?, INTERVAL 1 DAY)
      ) activity
      INNER JOIN learner_accounts accounts ON accounts.id=activity.account_id
      WHERE accounts.deleted_at IS NULL
    `, [startDate, endDate, startDate, endDate, startDate, endDate]),
    database.execute<LanguageRow[]>(`
      SELECT COALESCE(NULLIF(preferences.interface_locale, ''), 'fr') AS locale,
             COUNT(*) AS value
      FROM learner_accounts accounts
      LEFT JOIN learner_preferences preferences ON preferences.account_id=accounts.id
      WHERE accounts.deleted_at IS NULL
      GROUP BY locale
      ORDER BY value DESC
    `),
    database.execute<LanguageRow[]>(`
      SELECT sessions.interface_locale AS locale,
             COUNT(DISTINCT events.session_id) AS value
      FROM analytics_events events
      INNER JOIN analytics_sessions sessions ON sessions.session_id=events.session_id
      WHERE events.event_name='exercise_started'
        AND events.actor_type='anonymous'
        AND events.created_at>=? AND events.created_at<DATE_ADD(?, INTERVAL 1 DAY)
        AND sessions.interface_locale IN ('fr','de','en','it','es')
      GROUP BY sessions.interface_locale
      ORDER BY value DESC
    `, [startDate, endDate]),
    database.execute<SeriesRow[]>(`
      SELECT ${registrationDate} AS date, COUNT(*) AS value
      FROM learner_accounts a
      WHERE a.deleted_at IS NULL
        AND a.created_at>=? AND a.created_at<DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY date
      ORDER BY date
    `, [startDate, endDate]),
    database.execute<CountRow[]>(`
      SELECT COUNT(DISTINCT runs.account_id) AS value
      FROM learner_challenge_runs runs
      INNER JOIN learner_accounts accounts ON accounts.id=runs.account_id
      WHERE accounts.deleted_at IS NULL
        AND runs.is_review=1
        AND runs.last_answered_at>=?
        AND runs.last_answered_at<DATE_ADD(?, INTERVAL 1 DAY)
    `, [startDate, endDate]),
    database.execute<(CountRow & { accounts: number })[]>(`
      SELECT COUNT(*) AS value, COUNT(DISTINCT account_id) AS accounts
      FROM learner_login_events
      WHERE event_type='login' AND occurred_at>=? AND occurred_at<DATE_ADD(?, INTERVAL 1 DAY)
    `, [startDate, endDate]),
    database.execute<CountRow[]>(`
      SELECT COUNT(*) AS value FROM analytics_events
      WHERE event_name='feature_failed'
        AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.feature'))='auth.login'
        AND created_at>=? AND created_at<DATE_ADD(?, INTERVAL 1 DAY)
    `, [startDate, endDate]),
    database.execute<FeatureRow[]>(`
      SELECT JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.feature')) AS feature,
             COUNT(DISTINCT session_id) AS value
      FROM analytics_events
      WHERE actor_type='learner' AND event_name IN ('feature_selected','feature_completed')
        AND created_at>=? AND created_at<DATE_ADD(?, INTERVAL 1 DAY)
        AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.feature')) LIKE 'learner.%'
      GROUP BY feature ORDER BY value DESC
    `, [startDate, endDate]),
  ])

  const languages: AnalyticsBreakdownItem[] = languageRows.map(row => ({
    code: String(row.locale || 'fr'),
    label: localeLabels[String(row.locale)] || String(row.locale || 'Non précisée'),
    value: Number(row.value) || 0,
  }))
  const anonymousExerciseLanguages: AnalyticsBreakdownItem[] = anonymousLanguageRows.map(row => ({
    code: String(row.locale || 'fr'),
    label: localeLabels[String(row.locale)] || String(row.locale || 'Non précisée'),
    value: Number(row.value) || 0,
  }))
  const anonymousExerciseSessions = anonymousExerciseLanguages.reduce((sum, row) => sum + row.value, 0)
  const connectedFeatures = connectedFeatureRows.map(row => ({
    code: String(row.feature),
    label: connectedFeatureLabels[String(row.feature)] || String(row.feature),
    value: Number(row.value) || 0,
  }))
  const accountTotals = cumulativeAccountSeries(
    registrationRows,
    startDate,
    endDate,
    registrationUnit,
    Number(initialTotal?.value) || 0,
  )

  return {
    startDate,
    endDate,
    totalAccounts: Number(total?.value) || 0,
    activeAccounts: Number(active?.value) || 0,
    loggedInAccounts: Number(loginSummary?.accounts) || 0,
    successfulLogins: Number(loginSummary?.value) || 0,
    failedLogins: Number(failedLogins?.value) || 0,
    errorReviewUsers: Number(errorReviews?.value) || 0,
    languages,
    connectedFeatures,
    anonymousExerciseSessions,
    anonymousExerciseLanguages,
    accountTotals,
    registrationUnit,
    generatedAt: new Date().toISOString(),
    notice: 'L’activité regroupe les connexions, les sessions de compte et les réponses enregistrées. La reprise des erreurs compte chaque utilisateur une seule fois sur la période.',
  }
})

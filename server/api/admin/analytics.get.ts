import type { RowDataPacket } from 'mysql2/promise'
import type { AnalyticsBreakdownItem, AnalyticsOverview, AnalyticsSeriesPoint, AnalyticsWindow } from '../../../shared/types/analytics'
import { ANALYTICS_EVENTS } from '../../../shared/types/analytics'
import { googleAnalyticsOverview } from '../../utils/google-analytics'

interface ValueRow extends RowDataPacket { label: string, value: number }
interface SummaryRow extends RowDataPacket { sessions: number }
interface EventRow extends RowDataPacket { event_name: string, value: number }
interface EventSeriesRow extends RowDataPacket { date: string, event_name: string, value: number }
interface SessionSeriesRow extends RowDataPacket { date: string, value: number }
interface FeatureUsageRow extends RowDataPacket { classic: number, chat: number, print: number }
interface LegacyRow extends RowDataPacket {
  date?: string
  creationpdf: number, sauvedefi: number, chargedefi: number,
  exercer: number, exercersimple: number, resultat: number, resultatsimple: number
}

const windows: AnalyticsWindow[] = ['now', '3m', '5m', '30m', 'range']

function isoDate(value: unknown, fallback: Date) {
  const text = String(value || '')
  return /^\d{4}-\d{2}-\d{2}$/u.test(text) && !Number.isNaN(Date.parse(`${text}T12:00:00Z`))
    ? text
    : fallback.toISOString().slice(0, 10)
}

function breakdown(rows: ValueRow[]): AnalyticsBreakdownItem[] {
  return rows.map(row => ({ label: String(row.label || '—'), value: Number(row.value) || 0 }))
}

function emptyOverview(notice?: string): AnalyticsOverview {
  return {
    source: 'local', configured: true, activeUsers: 0, sessions: 0, newUsers: 0, returningUsers: 0,
    events: 0, exerciseStarted: 0, exerciseCompleted: 0, completionRate: 0,
    correctAnswers: 0, submittedAnswers: 0, successRate: 0, helpOpened: 0, pdfDownloads: 0,
    wordDownloads: 0, challengeLoads: 0, challengeSaves: 0, devices: [], languages: [],
    countries: [], regions: [], cities: [], featureUsage: [], eventBreakdown: [], activity: [], series: {},
    generatedAt: new Date().toISOString(), notice,
  }
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const query = getQuery(event)
  const requestedWindow = String(query.window || '30m') as AnalyticsWindow
  const window = windows.includes(requestedWindow) ? requestedWindow : '30m'
  const today = new Date()
  const defaultStart = new Date(today)
  defaultStart.setDate(defaultStart.getDate() - 6)
  const startDate = isoDate(query.start, defaultStart)
  const endDate = isoDate(query.end, today)
  if (startDate > endDate) throw createError({ statusCode: 400, statusMessage: 'La date de début doit précéder la date de fin.' })

  const liveMinutes = window === 'now' ? 1 : window === '3m' ? 3 : window === '5m' ? 5 : 30
  const eventWhere = window === 'range'
    ? 'created_at >= ? AND created_at < DATE_ADD(?, INTERVAL 1 DAY)'
    : 'created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)'
  const sessionWhere = window === 'range'
    ? 'first_seen >= ? AND first_seen < DATE_ADD(?, INTERVAL 1 DAY)'
    : 'last_seen >= DATE_SUB(NOW(), INTERVAL ? MINUTE)'
  const eventParams = window === 'range' ? [startDate, endDate] : [liveMinutes]
  const sessionParams = window === 'range' ? [startDate, endDate] : [liveMinutes]
  const rangeDays = Math.max(1, Math.ceil((Date.parse(`${endDate}T12:00:00Z`) - Date.parse(`${startDate}T12:00:00Z`)) / 86400000) + 1)
  const activityFormat = window !== 'range' ? '%Y-%m-%d %H:%i:00' : rangeDays <= 2 ? '%Y-%m-%d %H:00:00' : '%Y-%m-%d'
  const database = useDatabase()
  let local = emptyOverview()

  try {
    const [[summary], [eventRows], [devices], [languages], [activity], [eventSeries], [sessionSeries], [featureUsageRows]] = await Promise.all([
      database.execute<SummaryRow[]>(`SELECT COUNT(*) AS sessions FROM analytics_sessions WHERE ${sessionWhere}`, sessionParams),
      database.execute<EventRow[]>(`SELECT event_name, COUNT(*) AS value FROM analytics_events WHERE ${eventWhere} GROUP BY event_name ORDER BY value DESC`, eventParams),
      database.execute<ValueRow[]>(`SELECT device_category AS label, COUNT(*) AS value FROM analytics_sessions WHERE ${sessionWhere} GROUP BY device_category ORDER BY value DESC`, sessionParams),
      database.execute<ValueRow[]>(`SELECT interface_locale AS label, COUNT(*) AS value FROM analytics_sessions WHERE ${sessionWhere} GROUP BY interface_locale ORDER BY value DESC`, sessionParams),
      database.execute<ValueRow[]>(`SELECT DATE_FORMAT(created_at, '${activityFormat}') AS label, COUNT(*) AS value FROM analytics_events WHERE ${eventWhere} GROUP BY label ORDER BY label`, eventParams),
      window === 'range'
        ? database.execute<EventSeriesRow[]>(`SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS date, event_name, COUNT(*) AS value
          FROM analytics_events WHERE ${eventWhere} GROUP BY date,event_name ORDER BY date`, eventParams)
        : Promise.resolve([[] as EventSeriesRow[], []] as unknown as Awaited<ReturnType<typeof database.execute<EventSeriesRow[]>>>),
      window === 'range'
        ? database.execute<SessionSeriesRow[]>(`SELECT DATE_FORMAT(first_seen, '%Y-%m-%d') AS date, COUNT(*) AS value
          FROM analytics_sessions WHERE ${sessionWhere} GROUP BY date ORDER BY date`, sessionParams)
        : Promise.resolve([[] as SessionSeriesRow[], []] as unknown as Awaited<ReturnType<typeof database.execute<SessionSeriesRow[]>>>),
      database.execute<FeatureUsageRow[]>(`SELECT
        SUM(CASE WHEN event_name='exercise_started' AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.presentation'))='classic' THEN 1 ELSE 0 END) AS classic,
        SUM(CASE WHEN event_name='exercise_started' AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.presentation'))='chat' THEN 1 ELSE 0 END) AS chat,
        SUM(CASE WHEN event_name='print_opened' THEN 1 ELSE 0 END) AS print
        FROM analytics_events WHERE ${eventWhere}`, eventParams),
    ])
    const eventMap = Object.fromEntries(eventRows.map(row => [row.event_name, Number(row.value) || 0])) as Record<string, number>
    const count = (name: typeof ANALYTICS_EVENTS[number]) => eventMap[name] || 0
    const sessions = Number(summary?.[0]?.sessions) || 0
    const started = count('exercise_started')
    const completed = count('exercise_completed')
    const submitted = count('answer_submitted')
    const correct = count('answer_correct')
    const series = eventSeries.reduce<Record<string, AnalyticsSeriesPoint[]>>((result, row) => {
      const name = String(row.event_name)
      ;(result[name] ||= []).push({ date: String(row.date), value: Number(row.value) || 0 })
      return result
    }, {})
    series.sessions = sessionSeries.map(row => ({ date: String(row.date), value: Number(row.value) || 0 }))
    const featureUsage = featureUsageRows[0]
    local = {
      ...emptyOverview(), source: 'local', configured: true, activeUsers: sessions, sessions,
      newUsers: window === 'range' ? sessions : 0, returningUsers: 0,
      events: eventRows.reduce((sum, row) => sum + (Number(row.value) || 0), 0),
      exerciseStarted: started, exerciseCompleted: completed,
      completionRate: started ? Math.round(completed / started * 1000) / 10 : 0,
      correctAnswers: correct, submittedAnswers: submitted,
      successRate: submitted ? Math.round(correct / submitted * 1000) / 10 : 0,
      helpOpened: count('help_opened'), pdfDownloads: count('pdf_downloaded'), wordDownloads: count('word_downloaded'),
      challengeLoads: count('challenge_load'), challengeSaves: count('challenge_save'),
      devices: breakdown(devices), languages: breakdown(languages), countries: [], regions: [], cities: [],
      featureUsage: [
        { label: 'Exercice classique', value: Number(featureUsage?.classic) || 0 },
        { label: 'Chat avec coach', value: Number(featureUsage?.chat) || 0 },
        { label: 'Impression', value: Number(featureUsage?.print) || 0 },
      ],
      eventBreakdown: eventRows.map(row => ({ label: row.event_name, value: Number(row.value) || 0 })),
      activity: activity.map(row => ({ date: String(row.label), value: Number(row.value) || 0 })) as AnalyticsSeriesPoint[],
      series,
      generatedAt: new Date().toISOString(),
    }

    if (window === 'range') {
      const [legacyRows] = await database.execute<LegacyRow[]>(`SELECT DATE_FORMAT(created, '%Y-%m-%d') AS date,
        COALESCE(SUM(creationpdf),0) creationpdf, COALESCE(SUM(sauvedefi),0) sauvedefi,
        COALESCE(SUM(chargedefi),0) chargedefi, COALESCE(SUM(exercer),0) exercer,
        COALESCE(SUM(exercersimple),0) exercersimple, COALESCE(SUM(resultat),0) resultat,
        COALESCE(SUM(resultatsimple),0) resultatsimple
        FROM logs WHERE created >= ? AND created < DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY date ORDER BY date`, [startDate, endDate])
      const addSeriesValue = (name: string, date: string, value: number) => {
        if (!value) return
        const points = (local.series[name] ||= [])
        const existing = points.find(point => point.date === date)
        if (existing) existing.value += value
        else points.push({ date, value })
        points.sort((left, right) => left.date.localeCompare(right.date))
      }
      let legacyPrints = 0
      for (const legacy of legacyRows) {
        const date = String(legacy.date || '')
        const saves = Number(legacy.sauvedefi) || 0
        const loads = Number(legacy.chargedefi) || 0
        const started = (Number(legacy.exercer) || 0) + (Number(legacy.exercersimple) || 0)
        const completed = (Number(legacy.resultat) || 0) + (Number(legacy.resultatsimple) || 0)
        const prints = Number(legacy.creationpdf) || 0
        local.challengeSaves += saves
        local.challengeLoads += loads
        local.exerciseStarted += started
        local.exerciseCompleted += completed
        legacyPrints += prints
        const classicUsage = local.featureUsage.find(item => item.label === 'Exercice classique')
        const printUsage = local.featureUsage.find(item => item.label === 'Impression')
        if (classicUsage) classicUsage.value += started
        if (printUsage) printUsage.value += prints
        addSeriesValue('challenge_save', date, saves)
        addSeriesValue('challenge_load', date, loads)
        addSeriesValue('exercise_started', date, started)
        addSeriesValue('exercise_completed', date, completed)
        addSeriesValue('print_opened', date, prints)
      }
      local.completionRate = local.exerciseStarted ? Math.round(local.exerciseCompleted / local.exerciseStarted * 1000) / 10 : 0
      if (legacyPrints) local.eventBreakdown.push({ label: 'legacy_print_opened', value: legacyPrints })
      if (legacyRows.length) {
        local.notice = 'Les totaux historiques incluent les anciens compteurs. Les détails fins commencent à partir de la mise en service de ce tableau de bord.'
      }
    }
  }
  catch (error) {
    console.error('[analytics] Lecture des statistiques locales impossible.', error)
    local = emptyOverview('Les nouvelles tables statistiques ne sont pas encore disponibles.')
  }

  let ga4: AnalyticsOverview | null = null
  try {
    ga4 = await googleAnalyticsOverview({ window, startDate, endDate })
  }
  catch (error) {
    console.error('[analytics] Lecture GA4 impossible.', error)
    const rawDetail = error instanceof Error ? error.message.replace(/\s+/gu, ' ') : ''
    const detail = rawDetail.includes('(429)')
      ? 'Le quota horaire GA4 est temporairement atteint. Les statistiques locales restent disponibles et GA4 reprendra automatiquement dans moins d’une heure.'
      : rawDetail.slice(0, 180)
    ga4 = {
      ...emptyOverview(`Connexion GA4 indisponible.${detail ? ` ${detail}` : ' Vérifiez les variables serveur et l’accès de la propriété.'}`),
      source: 'ga4',
      configured: true,
    }
  }
  return { window, startDate, endDate, local, ga4 }
})

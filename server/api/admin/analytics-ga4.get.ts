import type { AnalyticsGa4Response, AnalyticsWindow } from '../../../shared/types/analytics'
import { googleAnalyticsOverview } from '../../utils/google-analytics'

const windows: AnalyticsWindow[] = ['now', '3m', '5m', '30m', 'range']

function isoDate(value: unknown, fallback: Date) {
  const text = String(value || '')
  return /^\d{4}-\d{2}-\d{2}$/u.test(text) && !Number.isNaN(Date.parse(`${text}T12:00:00Z`))
    ? text
    : fallback.toISOString().slice(0, 10)
}

export default defineEventHandler(async (event): Promise<AnalyticsGa4Response> => {
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

  const ga4 = await googleAnalyticsOverview({ window, startDate, endDate })
  return { window, startDate, endDate, ga4 }
})

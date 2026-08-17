import type { AnalyticsGeoTimelineResponse } from '../../../shared/types/analytics'
import { googleAnalyticsGeoTimeline } from '../../utils/google-analytics'

function validDate(value: unknown) {
  const date = String(value || '')
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00Z`))) return null
  return date
}

export default defineEventHandler(async (event): Promise<AnalyticsGeoTimelineResponse> => {
  requireAdministrator(event)
  const date = validDate(getQuery(event).date)
  if (!date) throw createError({ statusCode: 400, statusMessage: 'Choisissez une date valide.' })
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  if (date > today) throw createError({ statusCode: 400, statusMessage: 'La date choisie ne peut pas être dans le futur.' })

  const result = await googleAnalyticsGeoTimeline(date)
  return result || {
    date,
    configured: false,
    points: [],
    sessions: 0,
    generatedAt: new Date().toISOString(),
    notice: 'Google Analytics n’est pas configuré sur ce serveur.',
  }
})

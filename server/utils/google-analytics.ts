import { createSign } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import type { AnalyticsBreakdownItem, AnalyticsOverview, AnalyticsSeriesPoint, AnalyticsWindow } from '../../shared/types/analytics'

interface GaResponse {
  rows?: Array<{ dimensionValues?: Array<{ value?: string }>, metricValues?: Array<{ value?: string }> }>
}

let tokenCache: { value: string, expiresAt: number } | undefined
const reportCache = new Map<string, { value: AnalyticsOverview, expiresAt: number }>()
const quotaBackoff = new Map<string, number>()
const GOOGLE_AUTH_TIMEOUT_MS = 10_000
const GOOGLE_REPORT_TIMEOUT_MS = 12_000

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url')
}

async function accessToken(email: string, privateKey: string) {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.value
  const now = Math.floor(Date.now() / 1000)
  const encodedHeader = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const encodedClaim = base64url(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }))
  const unsigned = `${encodedHeader}.${encodedClaim}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsigned)
  const assertion = `${unsigned}.${base64url(signer.sign(privateKey.replace(/\\n/gu, '\n')))}`
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    signal: AbortSignal.timeout(GOOGLE_AUTH_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Authentification GA4 impossible (${response.status})`)
  const data = await response.json() as { access_token: string, expires_in?: number }
  tokenCache = { value: data.access_token, expiresAt: Date.now() + (data.expires_in || 3600) * 1000 }
  return tokenCache.value
}

function rows(response: GaResponse, dimensionCount = 1): AnalyticsBreakdownItem[] {
  return (response.rows || []).map(row => ({
    label: row.dimensionValues?.slice(0, dimensionCount).map(item => item.value || '—').join(' · ') || '—',
    value: Number(row.metricValues?.[0]?.value) || 0,
  }))
}

export async function googleAnalyticsOverview(options: {
  window: AnalyticsWindow
  startDate: string
  endDate: string
}): Promise<AnalyticsOverview | null> {
  const config = useRuntimeConfig()
  const propertyId = String(config.ga4PropertyId || '').trim()
  let email = String(config.ga4ClientEmail || '').trim()
  let privateKey = String(config.ga4PrivateKey || '').trim()
  const credentialsFile = String(config.ga4CredentialsFile || '').trim()
  if ((!email || !privateKey) && credentialsFile) {
    try {
      const credentials = JSON.parse(await readFile(credentialsFile, 'utf8')) as { client_email?: unknown, private_key?: unknown }
      email = typeof credentials.client_email === 'string' ? credentials.client_email.trim() : ''
      privateKey = typeof credentials.private_key === 'string' ? credentials.private_key.trim() : ''
    }
    catch (error) {
      console.error('[analytics] Impossible de lire le fichier du compte de service GA4.', error)
    }
  }
  if (!propertyId || !email || !privateKey) return null
  const cacheKey = `geo-v7:${propertyId}:${options.window}:${options.startDate}:${options.endDate}`
  const cached = reportCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.value
  const realtime = options.window !== 'range'
  const quotaKey = `${propertyId}:${realtime ? 'realtime' : 'core'}`
  if ((quotaBackoff.get(quotaKey) || 0) > Date.now()) {
    throw new Error('Lecture GA4 impossible (429) : quota horaire temporairement atteint.')
  }
  const token = await accessToken(email, privateKey)
  const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:${realtime ? 'runRealtimeReport' : 'runReport'}`
  const range = realtime
    ? { minuteRanges: [{ name: options.window, startMinutesAgo: options.window === 'now' ? 0 : options.window === '5m' ? 4 : 29, endMinutesAgo: 0 }] }
    : { dateRanges: [{ startDate: options.startDate, endDate: options.endDate }] }
  const request = async (dimensions: string[], metrics: string[], limit = 10) => {
    const body = JSON.stringify({ ...range, dimensions: dimensions.map(name => ({ name })), metrics: metrics.map(name => ({ name })), limit, orderBys: [{ metric: { metricName: metrics[0] }, desc: true }] })
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
          body,
          signal: AbortSignal.timeout(GOOGLE_REPORT_TIMEOUT_MS),
        })
        if (response.ok) return response.json() as Promise<GaResponse>
        const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null
        if (response.status === 429) quotaBackoff.set(quotaKey, Date.now() + 15 * 60_000)
        const error = new Error(`Lecture GA4 impossible (${response.status})${payload?.error?.message ? ` : ${payload.error.message}` : ''}`) as Error & { retryable?: boolean }
        error.retryable = response.status >= 500
        throw error
      }
      catch (error) {
        if (attempt === 0 && (error as Error & { retryable?: boolean }).retryable !== false) continue
        throw error
      }
    }
    throw new Error('Lecture GA4 impossible après deux tentatives.')
  }
  const optionalRequest = async (label: string, dimensions: string[], metrics: string[], limit = 10) => {
    try {
      return await request(dimensions, metrics, limit)
    }
    catch (error) {
      console.warn(`[analytics] Sous-rapport GA4 « ${label} » indisponible.`, error)
      return { rows: [] } satisfies GaResponse
    }
  }
  const summaryMetrics = realtime
    ? ['activeUsers', 'eventCount']
    : ['activeUsers', 'totalUsers', 'sessions', 'newUsers', 'eventCount']
  let summary: GaResponse
  try {
    summary = await request([], summaryMetrics, 1)
  }
  catch (error) {
    if (cached) {
      return {
        ...cached.value,
        notice: 'GA4 a atteint temporairement son quota. Les dernières données disponibles sont conservées.',
      }
    }
    throw error
  }
  const [devices, languages, countries, regions, cities, cityRegions, events, activity, audienceTrend] = await Promise.all([
    optionalRequest('appareils', ['deviceCategory'], ['activeUsers']),
    realtime ? Promise.resolve({ rows: [] } satisfies GaResponse) : optionalRequest('langues', ['language'], ['activeUsers']),
    optionalRequest('pays', ['countryId', 'country'], ['activeUsers'], 250),
    realtime ? Promise.resolve({ rows: [] } satisfies GaResponse) : optionalRequest('régions', ['region', 'country'], ['activeUsers'], 5_000),
    realtime
      ? optionalRequest('villes', ['cityId', 'city', 'countryId', 'country'], ['activeUsers'], 1_000)
      : optionalRequest('villes', ['cityId', 'city', 'region', 'countryId', 'country'], ['activeUsers'], 10_000),
    realtime
      ? optionalRequest('régions des villes', ['cityId', 'region', 'countryId', 'country'], ['activeUsers'], 1_000)
      : Promise.resolve({ rows: [] } satisfies GaResponse),
    Promise.resolve({ rows: [] } satisfies GaResponse),
    optionalRequest('activité', [realtime ? 'minutesAgo' : 'date'], [realtime ? 'activeUsers' : 'sessions'], realtime ? 30 : 400),
    realtime
      ? Promise.resolve({ rows: [] } satisfies GaResponse)
      : optionalRequest('progression de l’audience', ['date'], ['activeUsers', 'sessions', 'newUsers'], 400),
  ])
  const summaryValues = summary.rows?.[0]?.metricValues || []
  const metric = (index: number) => Number(summaryValues[index]?.value) || 0
  const activityRows: AnalyticsSeriesPoint[] = (activity.rows || []).map(row => ({
    date: row.dimensionValues?.[0]?.value || '', value: Number(row.metricValues?.[0]?.value) || 0,
  })).reverse()
  const eventRows = rows(events)
  const realtimeRegionsByCity = new Map((cityRegions.rows || []).map(row => [
    row.dimensionValues?.[0]?.value || '',
    row.dimensionValues?.[1]?.value,
  ]))
  const eventValue = (name: string) => eventRows.find(item => item.label === name)?.value || 0
  const submittedAnswers = eventValue('answer_submitted')
  const correctAnswers = eventValue('answer_correct')
  const exerciseStarted = eventValue('exercise_started')
  const exerciseCompleted = eventValue('exercise_completed')
  const countryRows = (countries.rows || []).map(row => ({
    code: row.dimensionValues?.[0]?.value || '',
    label: row.dimensionValues?.[1]?.value || '—',
    value: Number(row.metricValues?.[0]?.value) || 0,
  }))
  const audienceSeries = {
    activeUsers: [] as AnalyticsSeriesPoint[],
    sessions: [] as AnalyticsSeriesPoint[],
    newUsers: [] as AnalyticsSeriesPoint[],
  }
  for (const row of [...(audienceTrend.rows || [])].reverse()) {
    const date = row.dimensionValues?.[0]?.value || ''
    audienceSeries.activeUsers.push({ date, value: Number(row.metricValues?.[0]?.value) || 0 })
    audienceSeries.sessions.push({ date, value: Number(row.metricValues?.[1]?.value) || 0 })
    audienceSeries.newUsers.push({ date, value: Number(row.metricValues?.[2]?.value) || 0 })
  }
  const result: AnalyticsOverview = {
    source: 'ga4', configured: true,
    activeUsers: metric(0), sessions: realtime ? metric(0) : metric(2),
    newUsers: realtime ? 0 : metric(3), returningUsers: realtime ? 0 : Math.max(0, metric(1) - metric(3)),
    events: realtime ? metric(1) : metric(4),
    exerciseStarted, exerciseCompleted,
    completionRate: exerciseStarted ? Math.round(exerciseCompleted / exerciseStarted * 1000) / 10 : 0,
    correctAnswers, submittedAnswers,
    successRate: submittedAnswers ? Math.round(correctAnswers / submittedAnswers * 1000) / 10 : 0,
    helpOpened: eventValue('help_opened'), pdfDownloads: eventValue('pdf_downloaded'),
    wordDownloads: eventValue('word_downloaded'), challengeLoads: eventValue('challenge_load'),
    challengeSaves: eventValue('challenge_save'),
    devices: rows(devices), languages: rows(languages), countries: countryRows,
    regions: rows(regions, 2).map(item => {
      const [label, country] = item.label.split(' · ')
      return { label: label || '—', country, value: item.value }
    }),
    cities: (cities.rows || []).map(row => ({
      cityId: row.dimensionValues?.[0]?.value,
      label: row.dimensionValues?.[1]?.value || '—',
      region: realtime
        ? realtimeRegionsByCity.get(row.dimensionValues?.[0]?.value || '')
        : row.dimensionValues?.[2]?.value,
      countryCode: row.dimensionValues?.[realtime ? 2 : 3]?.value,
      country: row.dimensionValues?.[realtime ? 3 : 4]?.value,
      value: Number(row.metricValues?.[0]?.value) || 0,
    })),
    featureUsage: [], eventBreakdown: eventRows, activity: activityRows, series: audienceSeries,
    generatedAt: new Date().toISOString(),
  }
  reportCache.set(cacheKey, { value: result, expiresAt: Date.now() + (realtime ? 5 * 60_000 : 30 * 60_000) })
  return result
}

import type { Pool, RowDataPacket } from 'mysql2/promise'
import { googleAnalyticsTodaySessions } from '../utils/google-analytics'

interface DailySessionRow extends RowDataPacket {
  value: number
  date: string
}

type DailySessionDatabase = Pick<Pool, 'query'>

export interface DailySessionSnapshot {
  count: number
  date: string
  source: 'ga4' | 'local'
  notice?: string
}

export async function localDailySessionSnapshot(database: DailySessionDatabase): Promise<DailySessionSnapshot> {
  const [[row]] = await database.query<DailySessionRow[]>(`
    SELECT COUNT(*) AS value, DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d') AS date
    FROM analytics_sessions
    WHERE first_seen >= CURRENT_DATE AND first_seen < CURRENT_DATE + INTERVAL 1 DAY
  `)

  return {
    count: Number(row?.value) || 0,
    date: String(row?.date || ''),
    source: 'local',
  }
}

export async function dailySessionSnapshot(database: DailySessionDatabase): Promise<DailySessionSnapshot> {
  try {
    const ga4 = await googleAnalyticsTodaySessions()
    if (ga4) return { ...ga4, source: 'ga4' }
  }
  catch (error) {
    console.warn('[analytics] Compteur GA4 du jour indisponible, utilisation du compteur local.', error)
  }

  return {
    ...await localDailySessionSnapshot(database),
    notice: 'GA4 est momentanément indisponible : compteur local affiché.',
  }
}

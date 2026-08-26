import type { Pool, RowDataPacket } from 'mysql2/promise'
import { googleAnalyticsTodayUsers } from '../utils/google-analytics'

interface DailyVisitorRow extends RowDataPacket {
  value: number
  date: string
}

type DailyVisitorDatabase = Pick<Pool, 'query'>

export interface DailyVisitorSnapshot {
  count: number
  date: string
  source: 'ga4' | 'local'
  notice?: string
}

async function localDailyVisitorEstimate(database: DailyVisitorDatabase): Promise<DailyVisitorSnapshot> {
  const [[row]] = await database.query<DailyVisitorRow[]>(`
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

export async function dailyVisitorSnapshot(database: DailyVisitorDatabase): Promise<DailyVisitorSnapshot> {
  try {
    const ga4 = await googleAnalyticsTodayUsers()
    if (ga4) return { ...ga4, source: 'ga4' }
  }
  catch (error) {
    console.warn('[analytics] Compteur GA4 des visiteurs du jour indisponible, utilisation de l’estimation locale.', error)
  }

  return {
    ...await localDailyVisitorEstimate(database),
    notice: 'GA4 est momentanément indisponible : estimation locale affichée.',
  }
}

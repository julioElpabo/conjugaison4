import type { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise'
import { COACH_HELP_ENGINE_KEYS, type CoachHelpApproachDefinition, type CoachHelpEngineKey } from '../../shared/types/coach'

type Executor = Pool | PoolConnection

interface ApproachRow extends RowDataPacket {
  id: number
  name: string
  engineKey: CoachHelpEngineKey
  sortOrder: number
  characterCount: number
}

export async function listCoachHelpApproaches(database: Executor): Promise<CoachHelpApproachDefinition[]> {
  const [rows] = await database.execute<ApproachRow[]>(`SELECT a.id,a.name,a.engine_key AS engineKey,
    a.sort_order AS sortOrder,COUNT(c.id) AS characterCount
    FROM coach_help_approaches a
    LEFT JOIN coach_characters c ON c.help_approach_id=a.id
    GROUP BY a.id,a.name,a.engine_key,a.sort_order
    ORDER BY a.sort_order,a.name,a.id`)
  return rows.map(row => ({ ...row, characterCount: Number(row.characterCount) }))
}

function text(value: unknown, maximum: number) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

export function parseCoachHelpApproachPayload(value: unknown) {
  const body = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const name = text(body.name, 80)
  const engineKey = text(body.engineKey, 40) as CoachHelpEngineKey
  const sortOrder = Number(body.sortOrder)
  if (!name || !COACH_HELP_ENGINE_KEYS.includes(engineKey) || !Number.isInteger(sortOrder)) {
    throw createError({ statusCode: 400, statusMessage: 'Approche d’aide invalide' })
  }
  return { name, engineKey, sortOrder }
}

export function coachHelpApproachSlug(name: string) {
  return name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr')
    .replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '').slice(0, 80) || 'approche'
}

import type { RowDataPacket } from 'mysql2/promise'
import { useDatabase } from '../utils/database'

interface VerbeRow extends RowDataPacket {
  id: number
  infinitif: string
  participe_present: string
  participe_passe: string
  auxiliaire: string
}

interface ModeRow extends RowDataPacket {
  id: number
  name: string
  sort_order: number
}

interface TempsRow extends RowDataPacket {
  id: number
  mode_id: number
  name: string
  is_compound: number
  selected: number
}

export async function getCatalogue() {
  const database = useDatabase()
  const [verbesResult, modesResult, tempsResult] = await Promise.all([
    database.execute<VerbeRow[]>(`
      SELECT id, infinitif,
             \`participe_présent\` AS participe_present,
             \`participe_passé\` AS participe_passe,
             auxiliaire
      FROM verbes
      ORDER BY infinitif, id
    `),
    database.execute<ModeRow[]>(`
      SELECT id, name, \`order\` AS sort_order
      FROM modes
      ORDER BY \`order\`, id
    `),
    database.execute<TempsRow[]>(`
      SELECT id, mode_id, name,
             isTempsCompose AS is_compound,
             selected
      FROM temps
      ORDER BY mode_id, id
    `)
  ])

  return {
    verbes: verbesResult[0].map(row => ({
      id: Number(row.id),
      infinitif: row.infinitif,
      participePresent: row.participe_present,
      participePasse: row.participe_passe,
      auxiliaire: row.auxiliaire
    })),
    modes: modesResult[0].map(row => ({
      id: Number(row.id),
      name: row.name,
      order: Number(row.sort_order)
    })),
    temps: tempsResult[0].map(row => ({
      id: Number(row.id),
      modeId: Number(row.mode_id),
      name: row.name,
      isCompound: Boolean(row.is_compound),
      selected: Boolean(row.selected)
    }))
  }
}

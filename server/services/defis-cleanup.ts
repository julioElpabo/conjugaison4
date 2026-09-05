import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise'

export async function initializeDefisUsage(database: Pool) {
  const [columns] = await database.query<RowDataPacket[]>('SHOW COLUMNS FROM defis')
  if (columns.some(column => column.Field === 'last_used_at')) return false
  // L’historique antérieur est inconnu : démarrer l’observation aujourd’hui.
  await database.query(`
    ALTER TABLE defis
    ADD COLUMN last_used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD INDEX idx_defis_last_used (last_used_at)
  `)
  return true
}

// Même critère pour l’aperçu et la suppression. La date de l’aperçu fige
// la sélection ; toute utilisation survenue entre-temps protège le défi.
export const INACTIVE_DEFIS_WHERE = `isANePasEffacer = 0
  AND last_used_at < ?
  AND last_used_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 YEAR)`

export function parseCleanupRequest(value: unknown): { cutoff: string } {
  if (!value || typeof value !== 'object') throw new Error('Confirmation invalide')
  const body = value as Record<string, unknown>
  if (body.confirm !== true || typeof body.cutoff !== 'string'
    || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(body.cutoff)
    || !Number.isFinite(Date.parse(body.cutoff.replace(' ', 'T') + 'Z'))) {
    throw new Error('Confirmation invalide')
  }
  return { cutoff: body.cutoff }
}

export async function previewDefisCleanup(database: Pool) {
  const [dates] = await database.query<RowDataPacket[]>(`
    SELECT DATE_FORMAT(DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 YEAR), '%Y-%m-%d %H:%i:%s') AS cutoff
  `)
  const cutoff = String(dates[0]!.cutoff)
  const [rows] = await database.execute<RowDataPacket[]>(`
    SELECT COUNT(*) AS count FROM defis WHERE ${INACTIVE_DEFIS_WHERE}
  `, [cutoff])
  return { cutoff, count: Number(rows[0]!.count) }
}

export async function deleteInactiveDefis(database: Pool, cutoff: string) {
  const [result] = await database.execute<ResultSetHeader>(`
    DELETE FROM defis WHERE ${INACTIVE_DEFIS_WHERE}
  `, [cutoff])
  return { deletedCount: result.affectedRows }
}

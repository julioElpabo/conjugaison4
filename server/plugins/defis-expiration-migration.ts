import type { RowDataPacket } from 'mysql2/promise'
import { useDatabase } from '../utils/database'

interface ColumnRow extends RowDataPacket {
  Field: string
}

export default defineNitroPlugin(async () => {
  const database = useDatabase()

  try {
    const [tables] = await database.query<RowDataPacket[]>("SHOW TABLES LIKE 'defis'")
    if (!tables.length) return

    const [columns] = await database.query<ColumnRow[]>('SHOW COLUMNS FROM defis')
    if (columns.some(column => column.Field === 'expires_at')) return

    await database.query(`
      ALTER TABLE defis
      ADD COLUMN expires_at DATETIME NULL AFTER modified,
      ADD INDEX idx_defis_expiration (expires_at)
    `)
    console.info('[database] Colonne historique expires_at ajoutée aux défis, sans expiration automatique.')
  } catch (error) {
    console.error('[database] Échec de la migration automatique de l’expiration des défis.', error)
  }
})

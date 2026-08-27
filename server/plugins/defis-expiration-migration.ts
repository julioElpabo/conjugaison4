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
    await database.query(`
      UPDATE defis
      SET expires_at = CASE
        WHEN isANePasEffacer = 1 THEN NULL
        ELSE DATE_ADD(created, INTERVAL 6 MONTH)
      END
    `)
    console.info('[database] Expiration à six mois ajoutée aux défis enregistrés.')
  } catch (error) {
    console.error('[database] Échec de la migration automatique de l’expiration des défis.', error)
  }
})

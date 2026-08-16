import type { RowDataPacket } from 'mysql2/promise'
import { useDatabase } from '../utils/database'

interface ColumnRow extends RowDataPacket {
  Field: string
}

export default defineNitroPlugin(async () => {
  const database = useDatabase()

  try {
    const [tables] = await database.query<RowDataPacket[]>("SHOW TABLES LIKE 'challenge_presets'")
    if (!tables.length) return

    const [columns] = await database.query<ColumnRow[]>('SHOW COLUMNS FROM challenge_presets')
    if (columns.some(column => column.Field === 'learning_support_mode')) return

    await database.query(`ALTER TABLE challenge_presets
      ADD COLUMN learning_support_mode ENUM('normal','cif-fle') NOT NULL DEFAULT 'normal'
      AFTER inclusive_pronouns`)
    await database.query(`UPDATE challenge_presets preset
      INNER JOIN challenge_preset_categories category ON category.id=preset.category_id
      SET preset.learning_support_mode='cif-fle'
      WHERE category.slug='cif'`)
    console.info('[database] Option CIF/FLE ajoutée aux défis pré-enregistrés.')
  }
  catch (error) {
    console.error('[database] Échec de la migration automatique de l’option CIF/FLE.', error)
  }
})

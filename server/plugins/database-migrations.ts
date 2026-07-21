import type { RowDataPacket } from 'mysql2/promise'
import { useDatabase } from '../utils/database'

interface ColumnRow extends RowDataPacket {
  Field: string
}

export default defineNitroPlugin(async () => {
  const database = useDatabase()

  try {
    const [tables] = await database.query<RowDataPacket[]>(
      "SHOW TABLES LIKE 'coach_character_reaction_rules'"
    )

    if (tables.length === 0) {
      console.warn('[database] Migration des fréquences ignorée : table coach_character_reaction_rules absente.')
      return
    }

    const [columns] = await database.query<ColumnRow[]>(
      'SHOW COLUMNS FROM coach_character_reaction_rules'
    )
    const columnNames = new Set(columns.map(column => column.Field))
    let added = 0

    if (!columnNames.has('animation_probability')) {
      await database.query(
        'ALTER TABLE coach_character_reaction_rules ADD COLUMN animation_probability DECIMAL(4,3) NOT NULL DEFAULT 0 AFTER media_probability'
      )
      await database.query(
        'UPDATE coach_character_reaction_rules SET animation_probability=media_probability'
      )
      columnNames.add('animation_probability')
      added += 1
    }

    if (!columnNames.has('emoji_probability')) {
      await database.query(
        'ALTER TABLE coach_character_reaction_rules ADD COLUMN emoji_probability DECIMAL(4,3) NOT NULL DEFAULT 0 AFTER animation_probability'
      )
      await database.query(
        'UPDATE coach_character_reaction_rules SET emoji_probability=media_probability'
      )
      added += 1
    }

    console.info(
      added
        ? `[database] Migration des fréquences terminée : ${added} colonne(s) ajoutée(s).`
        : '[database] Migration des fréquences déjà appliquée.'
    )
  }
  catch (error) {
    console.error('[database] Échec de la migration automatique des fréquences.', error)
  }
})

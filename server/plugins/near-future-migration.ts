import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { useDatabase } from '../utils/database'

interface IdRow extends RowDataPacket {
  id: number
}

interface TenseRow extends RowDataPacket {
  id: number
  mode_id: number
  code: string
  name: string
  isTempsCompose: number
}

interface CountRow extends RowDataPacket {
  count: number
}

interface PresetRow extends RowDataPacket {
  id: number
  preset_key: string
}

interface OrderRow extends RowDataPacket {
  next_order: number
}

export default defineNitroPlugin(async () => {
  const database = useDatabase()
  const connection = await database.getConnection()

  try {
    await connection.beginTransaction()

    const [[mode]] = await connection.query<IdRow[]>(
      "SELECT id FROM modes WHERE name='indicatif' ORDER BY id LIMIT 1 FOR UPDATE"
    )
    if (!mode?.id) throw new Error('Mode indicatif introuvable.')

    const [existing] = await connection.query<TenseRow[]>(`
      SELECT id, mode_id, code, name, isTempsCompose
      FROM temps
      WHERE code='near-future' OR name='futur proche'
      ORDER BY id
      FOR UPDATE
    `)
    if (existing.length > 1) {
      throw new Error('Plusieurs temps correspondent déjà au futur proche.')
    }

    let tenseId = Number(existing[0]?.id || 0)
    if (tenseId) {
      const tense = existing[0]!
      if (Number(tense.mode_id) !== Number(mode.id)
          || tense.code !== 'near-future'
          || tense.name !== 'futur proche'
          || Number(tense.isTempsCompose) !== 0) {
        throw new Error('Le futur proche existe avec une configuration incompatible.')
      }
    }
    else {
      const [result] = await connection.query<ResultSetHeader>(`
        INSERT INTO temps (mode_id, code, name, isTempsCompose, selected)
        VALUES (?, 'near-future', 'futur proche', 0, 1)
      `, [mode.id])
      tenseId = Number(result.insertId)
    }

    const [[storedForms]] = await connection.query<CountRow[]>(
      'SELECT COUNT(*) AS count FROM verbesconjugues WHERE temp_id=?',
      [tenseId]
    )
    if (Number(storedForms?.count) !== 0) {
      throw new Error('Le futur proche doit être généré et ne doit pas avoir de formes stockées.')
    }

    const [[presetTables]] = await connection.query<CountRow[]>(`
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema=DATABASE()
        AND table_name IN (
          'challenge_presets',
          'challenge_preset_categories',
          'challenge_preset_tenses'
        )
    `)

    let cifPresetCount = 0
    let cifInsertCount = 0
    if (Number(presetTables?.count) === 3) {
      const [presets] = await connection.query<PresetRow[]>(`
        SELECT preset.id, preset.preset_key
        FROM challenge_presets preset
        INNER JOIN challenge_preset_categories category ON category.id=preset.category_id
        WHERE category.slug='cif'
        ORDER BY preset.sort_order,preset.id
      `)
      cifPresetCount = presets.length

      for (const preset of presets) {
        const [[position]] = await connection.query<OrderRow[]>(`
          SELECT COALESCE(MAX(sort_order),0)+1 AS next_order
          FROM challenge_preset_tenses
          WHERE preset_id=?
        `, [preset.id])
        const [result] = await connection.query<ResultSetHeader>(`
          INSERT IGNORE INTO challenge_preset_tenses (preset_id,tense_id,sort_order)
          VALUES (?,?,?)
        `, [preset.id, tenseId, Number(position?.next_order || 1)])
        cifInsertCount += Number(result.affectedRows)
      }

      const [missing] = await connection.query<PresetRow[]>(`
        SELECT preset.id, preset.preset_key
        FROM challenge_presets preset
        INNER JOIN challenge_preset_categories category ON category.id=preset.category_id
        LEFT JOIN challenge_preset_tenses selection
          ON selection.preset_id=preset.id AND selection.tense_id=?
        WHERE category.slug='cif' AND selection.preset_id IS NULL
      `, [tenseId])
      if (missing.length) {
        throw new Error(`Futur proche absent de : ${missing.map(row => row.preset_key).join(', ')}.`)
      }
    }

    await connection.commit()
    console.info(
      `[database] Futur proche disponible (temps ${tenseId})`
      + (cifPresetCount
        ? ` et sélectionné dans ${cifPresetCount} défis CIF (${cifInsertCount} ajout${cifInsertCount > 1 ? 's' : ''}).`
        : '; aucun défi CIF stocké à mettre à jour.')
    )
  }
  catch (error) {
    await connection.rollback()
    console.error('[database] Échec de la migration automatique du futur proche.', error)
  }
  finally {
    connection.release()
  }
})

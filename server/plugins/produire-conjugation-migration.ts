import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { useDatabase } from '../utils/database'

interface VerbRow extends RowDataPacket {
  id: number
  infinitif: 'conduire' | 'produire'
}

interface CountRow extends RowDataPacket {
  count: number
}

export default defineNitroPlugin(async () => {
  const database = useDatabase()

  try {
    const [verbs] = await database.query<VerbRow[]>(
      "SELECT id, infinitif FROM verbes WHERE infinitif IN ('conduire', 'produire')"
    )
    const conduire = verbs.find(verb => verb.infinitif === 'conduire')
    const produire = verbs.find(verb => verb.infinitif === 'produire')

    if (!conduire || !produire) {
      console.warn('[database] Réparation de « produire » ignorée : verbe modèle introuvable.')
      return
    }

    const [[sourceCount]] = await database.query<CountRow[]>(
      'SELECT COUNT(*) AS count FROM verbesconjugues WHERE verbe_id = ?',
      [conduire.id]
    )
    if (!sourceCount?.count) {
      console.warn('[database] Réparation de « produire » ignorée : « conduire » ne possède aucune conjugaison.')
      return
    }

    const [result] = await database.query<ResultSetHeader>(`
      INSERT INTO verbesconjugues
        (verbe_id, verbe_infinitif, personne_id, temp_id, conjugaison1, conjugaison2, conjugaison3)
      SELECT ?, 'produire', source.personne_id, source.temp_id,
        REPLACE(source.conjugaison1, 'condu', 'produ'),
        REPLACE(source.conjugaison2, 'condu', 'produ'),
        REPLACE(source.conjugaison3, 'condu', 'produ')
      FROM verbesconjugues source
      LEFT JOIN verbesconjugues target
        ON target.verbe_id = ?
        AND target.personne_id = source.personne_id
        AND target.temp_id = source.temp_id
      WHERE source.verbe_id = ?
        AND target.id IS NULL
    `, [produire.id, produire.id, conduire.id])

    const [[targetCount]] = await database.query<CountRow[]>(
      'SELECT COUNT(*) AS count FROM verbesconjugues WHERE verbe_id = ?',
      [produire.id]
    )
    if (targetCount?.count !== sourceCount.count) {
      throw new Error(
        `« produire » possède ${targetCount?.count ?? 0} conjugaison(s), ${sourceCount.count} attendue(s).`
      )
    }

    console.info(
      result.affectedRows
        ? `[database] Réparation de « produire » terminée : ${result.affectedRows} forme(s) ajoutée(s).`
        : '[database] Conjugaisons de « produire » déjà disponibles.'
    )
  }
  catch (error) {
    console.error('[database] Échec de la réparation automatique de « produire ».', error)
  }
})

import { importFleVerbBatch } from '../services/fle-verb-import'
import { useDatabase } from '../utils/database'

/** Lot audité et versionné : aucun téléchargement ni script Plesk requis. */
export default defineNitroPlugin(async () => {
  const connection = await useDatabase().getConnection()
  try {
    const result = await importFleVerbBatch(connection, { apply: true })
    console.info(`[database] Lot FLE du 17 novembre 2026 : ${result.mode}, 41 verbes de base contrôlés.`)
  } catch (error) {
    console.error('[database] Import du lot FLE interrompu ; consulter le journal fle_verb_import_journal avant toute intervention manuelle.', error)
  } finally {
    connection.release()
  }
})

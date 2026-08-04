import { applyValidatedLiteraryEnrichment } from '../../scripts/enrich-validated-literary-corpus.mjs'
import { applyValidatedLiteraryEnrichmentV2 } from '../../scripts/enrich-validated-literary-corpus-v2.mjs'
import { useDatabase } from '../utils/database'

export default defineNitroPlugin(async () => {
  const connection = await useDatabase().getConnection()
  try {
    const result = await applyValidatedLiteraryEnrichment(connection)
    if ('insertedInfinitives' in result) {
      console.info(
        `[database] Corpus littéraire enrichi : ${result.insertedInfinitives} infinitif(s)`
        + ` et ${result.insertedRareForms} forme(s) rare(s) ajouté(s).`,
      )
    }
    const resultV2 = await applyValidatedLiteraryEnrichmentV2(connection)
    if ('inserted' in resultV2) {
      console.info(
        `[database] Corpus littéraire enrichi v2 : ${resultV2.inserted.pastInfinitives} infinitif(s) passé(s),`
        + ` ${resultV2.inserted.gerunds} gérondif(s) et ${resultV2.inserted.finiteForms} forme(s) rare(s).`,
      )
    }
  } catch (error) {
    console.error('[database] Échec de l’enrichissement automatique du corpus littéraire.', error)
  } finally {
    connection.release()
  }
})

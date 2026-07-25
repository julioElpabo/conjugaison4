import { runVerbPilotImport } from '../../scripts/check-verb-pilot-import.mjs'

/**
 * Plesk ne transmet pas toujours les variables DB_* à « Run script », alors
 * qu’elles sont disponibles dans la configuration d’exécution de Nitro.
 * Le lot est donc appliqué au démarrage du serveur, de façon idempotente.
 */
export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()

  try {
    const result = await runVerbPilotImport({
      apply: true,
      writeReports: false,
      databaseConfig: {
        host: String(config.dbHost || ''),
        port: Number(config.dbPort || 3306),
        database: String(config.dbName || ''),
        user: String(config.dbUser || ''),
        password: String(config.dbPassword || ''),
      },
    })
    console.info(
      `[database] Lot verbs-frequency-pilot-2026-01 disponible : `
      + `${result.preparedForms} conjugaisons contrôlées`
      + (result.repaired
        ? ', liens sémantiques réparés.'
        : result.alreadyApplied
          ? ', aucune nouvelle écriture.'
          : ', 100 verbes ajoutés avec sauvegardes MyISAM.'),
    )
  }
  catch (error) {
    console.error(
      '[database] Échec de la migration automatique du lot verbs-frequency-pilot-2026-01.',
      error,
    )
  }
})

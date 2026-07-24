import { useDatabase } from '../utils/database'

export default defineNitroPlugin(async () => {
  try {
    const database = useDatabase()
    await database.query(`
      CREATE TABLE IF NOT EXISTS public_api_rate_limits (
        key_hash CHAR(64) NOT NULL PRIMARY KEY,
        bucket VARCHAR(40) NOT NULL,
        request_count INT UNSIGNED NOT NULL DEFAULT 0,
        window_started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_public_api_rate_limits_updated (updated_at),
        KEY idx_public_api_rate_limits_bucket (bucket)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.query(
      'DELETE FROM public_api_rate_limits WHERE updated_at < CURRENT_TIMESTAMP - INTERVAL 2 DAY'
    )
    console.info('[security] Limitation des API publiques disponible.')
  } catch (error) {
    console.error('[security] Échec de la préparation de la limitation des API publiques.', error)
  }
})

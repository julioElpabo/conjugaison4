import { useDatabase } from '../utils/database'

export default defineNitroPlugin(async () => {
  try {
    const database = useDatabase()
    await database.query(`
      CREATE TABLE IF NOT EXISTS admin_login_rate_limits (
        key_hash CHAR(64) NOT NULL PRIMARY KEY,
        failure_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
        window_started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        blocked_until DATETIME NULL,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_admin_login_rate_limits_updated (updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.query(
      'DELETE FROM admin_login_rate_limits WHERE updated_at < CURRENT_TIMESTAMP - INTERVAL 30 DAY'
    )
    console.info('[security] Limitation des connexions administrateur disponible.')
  } catch (error) {
    console.error('[security] Échec de la préparation de la limitation des connexions.', error)
  }
})

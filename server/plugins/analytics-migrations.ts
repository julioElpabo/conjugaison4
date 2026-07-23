import { useDatabase } from '../utils/database'

export default defineNitroPlugin(async () => {
  try {
    const database = useDatabase()
    await database.query(`CREATE TABLE IF NOT EXISTS analytics_sessions (
      session_id CHAR(36) NOT NULL PRIMARY KEY,
      first_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      current_path VARCHAR(255) NOT NULL DEFAULT '/',
      interface_locale VARCHAR(8) NOT NULL DEFAULT 'fr',
      device_category VARCHAR(16) NOT NULL DEFAULT 'desktop',
      page_views INT UNSIGNED NOT NULL DEFAULT 0,
      KEY idx_analytics_sessions_first_seen (first_seen),
      KEY idx_analytics_sessions_last_seen (last_seen),
      KEY idx_analytics_sessions_path (current_path)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
    await database.query(`CREATE TABLE IF NOT EXISTS analytics_events (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      session_id CHAR(36) NOT NULL,
      event_name VARCHAR(64) NOT NULL,
      path VARCHAR(255) NOT NULL DEFAULT '/',
      metadata JSON NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_analytics_events_created (created_at),
      KEY idx_analytics_events_name_created (event_name, created_at),
      KEY idx_analytics_events_session (session_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
    console.info('[database] Tables de statistiques détaillées disponibles.')
  }
  catch (error) {
    console.error('[database] Échec de la migration des statistiques détaillées.', error)
  }
})

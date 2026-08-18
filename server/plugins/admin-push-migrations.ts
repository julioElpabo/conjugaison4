import webPush from 'web-push'
import type { RowDataPacket } from 'mysql2/promise'
import { useDatabase } from '../utils/database'

interface CountRow extends RowDataPacket { value: number }

export default defineNitroPlugin(async () => {
  try {
    const database = useDatabase()
    await database.query(`
      CREATE TABLE IF NOT EXISTS admin_push_vapid (
        id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
        public_key VARCHAR(255) NOT NULL,
        private_key VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.query(`
      CREATE TABLE IF NOT EXISTS admin_push_subscriptions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        administrator_id INT NOT NULL,
        endpoint_hash CHAR(64) NOT NULL,
        endpoint TEXT NOT NULL,
        p256dh VARCHAR(255) NOT NULL,
        auth_secret VARCHAR(255) NOT NULL,
        enabled TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_success_at DATETIME NULL,
        last_error VARCHAR(255) NULL,
        UNIQUE KEY uq_admin_push_endpoint (endpoint_hash),
        KEY idx_admin_push_administrator (administrator_id, enabled)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.query(`
      CREATE TABLE IF NOT EXISTS admin_push_alerts (
        alert_key VARCHAR(160) NOT NULL PRIMARY KEY,
        alert_type VARCHAR(40) NOT NULL,
        threshold_value INT UNSIGNED NOT NULL,
        observed_value INT UNSIGNED NOT NULL,
        payload_json JSON NOT NULL,
        status ENUM('pending','sending','sent','skipped','failed') NOT NULL DEFAULT 'pending',
        attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
        next_attempt_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        sent_at DATETIME NULL,
        last_error VARCHAR(255) NULL,
        KEY idx_admin_push_alert_delivery (status, next_attempt_at, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.query(`
      CREATE TABLE IF NOT EXISTS admin_push_metrics (
        metric_name VARCHAR(80) NOT NULL PRIMARY KEY,
        metric_value BIGINT UNSIGNED NOT NULL DEFAULT 0,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    const [learnerTables] = await database.query<RowDataPacket[]>("SHOW TABLES LIKE 'learner_accounts'")
    if (learnerTables.length) {
      await database.query(`
        INSERT IGNORE INTO admin_push_metrics (metric_name, metric_value)
        SELECT 'learner_accounts_created', COUNT(*) FROM learner_accounts
      `)
    }

    const [[existing]] = await database.query<CountRow[]>('SELECT COUNT(*) AS value FROM admin_push_vapid WHERE id=1')
    if (!Number(existing?.value)) {
      const keys = webPush.generateVAPIDKeys()
      await database.execute(
        'INSERT IGNORE INTO admin_push_vapid (id, public_key, private_key) VALUES (1, ?, ?)',
        [keys.publicKey, keys.privateKey],
      )
    }
    console.info('[push] Notifications administrateur disponibles.')
  }
  catch (error) {
    console.error('[push] Échec de la migration des notifications administrateur.', error)
  }
})

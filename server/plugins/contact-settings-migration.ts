import { DEFAULT_CONTACT_SETTINGS } from '../services/contact-settings'
import { useDatabase } from '../utils/database'

export default defineNitroPlugin(async () => {
  try {
    const database = useDatabase()
    await database.query(`
      CREATE TABLE IF NOT EXISTS contact_settings (
        id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
        is_enabled TINYINT(1) NOT NULL DEFAULT 1,
        contact_email VARCHAR(254) NOT NULL,
        subject_min_length SMALLINT UNSIGNED NOT NULL DEFAULT 5,
        subject_max_length SMALLINT UNSIGNED NOT NULL DEFAULT 120,
        message_min_length SMALLINT UNSIGNED NOT NULL DEFAULT 20,
        message_max_length SMALLINT UNSIGNED NOT NULL DEFAULT 3000,
        max_links TINYINT UNSIGNED NOT NULL DEFAULT 2,
        short_rate_limit SMALLINT UNSIGNED NOT NULL DEFAULT 3,
        short_rate_window_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 120,
        daily_rate_limit SMALLINT UNSIGNED NOT NULL DEFAULT 8,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await database.execute(`
      INSERT IGNORE INTO contact_settings (
        id, is_enabled, contact_email,
        subject_min_length, subject_max_length,
        message_min_length, message_max_length, max_links,
        short_rate_limit, short_rate_window_minutes, daily_rate_limit
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      DEFAULT_CONTACT_SETTINGS.enabled ? 1 : 0,
      useRuntimeConfig().contactEmail || DEFAULT_CONTACT_SETTINGS.contactEmail,
      DEFAULT_CONTACT_SETTINGS.subjectMinLength,
      DEFAULT_CONTACT_SETTINGS.subjectMaxLength,
      DEFAULT_CONTACT_SETTINGS.messageMinLength,
      DEFAULT_CONTACT_SETTINGS.messageMaxLength,
      DEFAULT_CONTACT_SETTINGS.maxLinks,
      DEFAULT_CONTACT_SETTINGS.shortRateLimit,
      DEFAULT_CONTACT_SETTINGS.shortRateWindowMinutes,
      DEFAULT_CONTACT_SETTINGS.dailyRateLimit,
    ])
    console.info('[contact] Réglages du formulaire disponibles.')
  }
  catch (error) {
    console.error('[contact] Échec de la préparation des réglages du formulaire.', error)
  }
})

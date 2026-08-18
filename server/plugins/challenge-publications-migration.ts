import type { Pool } from 'mysql2/promise'
import { useDatabase } from '../utils/database'

type MigrationDatabase = Pick<Pool, 'query'>

export async function migrateChallengePublications(database: MigrationDatabase) {
  await database.query(`
    CREATE TABLE IF NOT EXISTS challenge_preset_publications (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      preset_id INT UNSIGNED NOT NULL,
      locale CHAR(2) NOT NULL,
      slug VARCHAR(120) NULL,
      title VARCHAR(180) NOT NULL DEFAULT '',
      meta_title VARCHAR(180) NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      meta_description VARCHAR(320) NOT NULL DEFAULT '',
      is_published TINYINT(1) NOT NULL DEFAULT 0,
      is_indexable TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_challenge_publication_preset_locale (preset_id, locale),
      UNIQUE KEY uq_challenge_publication_locale_slug (locale, slug),
      KEY idx_challenge_publication_visibility (is_published, is_indexable, locale),
      CONSTRAINT fk_challenge_publication_preset
        FOREIGN KEY (preset_id) REFERENCES challenge_presets(id) ON DELETE CASCADE,
      CONSTRAINT chk_challenge_publication_locale
        CHECK (locale IN ('fr','de','en','it','es')),
      CONSTRAINT chk_challenge_publication_indexable
        CHECK (is_indexable=0 OR is_published=1)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
  await database.query(`
    CREATE TABLE IF NOT EXISTS challenge_preset_publication_redirects (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      publication_id INT UNSIGNED NOT NULL,
      locale CHAR(2) NOT NULL,
      old_slug VARCHAR(120) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_challenge_publication_redirect_locale_slug (locale, old_slug),
      KEY idx_challenge_publication_redirect_publication (publication_id),
      CONSTRAINT fk_challenge_publication_redirect_publication
        FOREIGN KEY (publication_id) REFERENCES challenge_preset_publications(id) ON DELETE CASCADE,
      CONSTRAINT chk_challenge_publication_redirect_locale
        CHECK (locale IN ('fr','de','en','it','es'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
  await database.query(`
    CREATE TABLE IF NOT EXISTS challenge_preset_publication_deployments (
      batch_id VARCHAR(120) NOT NULL PRIMARY KEY,
      checksum CHAR(64) NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
  // Une publication est désormais toujours indexable. La colonne historique
  // est conservée pour ne pas imposer de migration destructive sur Plesk.
  await database.query(`
    UPDATE challenge_preset_publications
    SET is_indexable=is_published
    WHERE is_indexable<>is_published
  `)
}

export default defineNitroPlugin(async () => {
  try {
    const database = useDatabase()
    await migrateChallengePublications(database)
    console.info('[database] Tables des publications SEO de défis prêtes.')
  }
  catch (error) {
    console.error('[database] Échec de la migration des publications SEO de défis.', error)
  }
})

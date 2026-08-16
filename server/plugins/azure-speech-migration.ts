import { useDatabase } from '../utils/database'
import { prepareSpeechFileCache } from '../services/azure-speech'

export default defineNitroPlugin(async () => {
  try {
    const database = useDatabase()
    await database.query(`
      CREATE TABLE IF NOT EXISTS azure_speech_cache (
        cache_key CHAR(64) NOT NULL PRIMARY KEY,
        voice_id VARCHAR(80) NOT NULL,
        purpose VARCHAR(20) NOT NULL,
        character_count INT UNSIGNED NOT NULL,
        mime_type VARCHAR(80) NOT NULL,
        audio_data MEDIUMBLOB NULL,
        byte_size INT UNSIGNED NOT NULL,
        hit_count INT UNSIGNED NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_azure_speech_cache_accessed (last_accessed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    const [audioColumn] = await database.query<any[]>(`
      SELECT IS_NULLABLE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='azure_speech_cache' AND COLUMN_NAME='audio_data'
      LIMIT 1
    `)
    if (audioColumn[0]?.IS_NULLABLE !== 'YES') {
      await database.query('ALTER TABLE azure_speech_cache MODIFY audio_data MEDIUMBLOB NULL')
    }
    await database.query(`
      CREATE TABLE IF NOT EXISTS azure_speech_usage (
        cycle_key CHAR(7) NOT NULL PRIMARY KEY,
        character_count INT UNSIGNED NOT NULL DEFAULT 0,
        generation_count INT UNSIGNED NOT NULL DEFAULT 0,
        cache_hit_count INT UNSIGNED NOT NULL DEFAULT 0,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    await prepareSpeechFileCache()
    console.info('[speech] Cache Azure Speech disponible.')
  } catch (error) {
    console.error('[speech] Échec de la préparation du cache Azure Speech.', error)
  }
})

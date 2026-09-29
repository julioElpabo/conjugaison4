import { ensureCoachConfigurationMigrations } from './migrate-allophone-coach-character.mjs'

export const SUCCESS_MEDIA_FREQUENCY_MIGRATION_KEY = '2026-09-29-more-success-gifs-v1'

export async function migrateSuccessMediaFrequency(connection) {
  await ensureCoachConfigurationMigrations(connection)
  const [[alreadyApplied]] = await connection.execute(
    'SELECT 1 AS applied FROM coach_configuration_migrations WHERE migration_key=? LIMIT 1 FOR UPDATE',
    [SUCCESS_MEDIA_FREQUENCY_MIGRATION_KEY],
  )
  if (alreadyApplied) return { applied: false, updatedRuleCount: 0 }

  const [result] = await connection.execute(`UPDATE coach_character_reaction_rules
    SET animation_probability=1,cooldown_questions=1
    WHERE event_type IN ('correct','correct-alternative')`)
  await connection.execute(
    'INSERT INTO coach_configuration_migrations (migration_key) VALUES (?)',
    [SUCCESS_MEDIA_FREQUENCY_MIGRATION_KEY],
  )
  return { applied: true, updatedRuleCount: Number(result.affectedRows || 0) }
}

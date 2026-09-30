import type { RowDataPacket } from 'mysql2/promise'
import { useDatabase } from '../utils/database'

interface ExistsRow extends RowDataPacket { value: number }

const indexes = [
  { table: 'learner_sessions', name: 'idx_learner_sessions_seen_account', columns: 'last_seen_at, account_id' },
  { table: 'learner_challenge_runs', name: 'idx_learner_runs_answered_account_review', columns: 'last_answered_at, account_id, is_review' },
  { table: 'learner_login_events', name: 'idx_learner_logins_date_type_account', columns: 'occurred_at, event_type, account_id' },
  { table: 'learner_accounts', name: 'idx_learner_accounts_deleted_created', columns: 'deleted_at, created_at' },
  { table: 'logs', name: 'idx_logs_created', columns: 'created' },
] as const

export default defineNitroPlugin(async () => {
  try {
    const database = useDatabase()
    let created = 0
    for (const index of indexes) {
      const [[tableExists]] = await database.query<ExistsRow[]>(`
        SELECT 1 AS value FROM information_schema.TABLES
        WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?
      `, [index.table])
      if (!tableExists) continue

      const [[indexExists]] = await database.query<ExistsRow[]>(`
        SELECT 1 AS value FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND INDEX_NAME=?
      `, [index.table, index.name])
      if (indexExists) continue

      await database.query(`ALTER TABLE \`${index.table}\` ADD INDEX \`${index.name}\` (${index.columns})`)
      created += 1
    }
    console.info(`[database] Index des statistiques disponibles (${created} créé${created === 1 ? '' : 's'}).`)
  } catch (error) {
    console.error('[database] Échec de la création des index statistiques.', error)
  }
})

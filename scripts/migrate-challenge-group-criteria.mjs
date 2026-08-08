import mysql from 'mysql2/promise'
import { isDirectScriptExecution } from './utils/direct-execution.mjs'

export const challengeGroupCriteria = new Map([
  ['groupe1', [{ field: 'groupeConjugaison', operator: 'equals', value: 1 }]],
  ['groupe2', [{ field: 'groupeConjugaison', operator: 'equals', value: 2 }]],
  ['groupe3', [{ field: 'groupeConjugaison', operator: 'equals', value: 3 }]],
  ['groupe3ir', [
    { field: 'groupeConjugaison', operator: 'equals', value: 3 },
    { field: 'terminaison', operator: 'equals', value: 'ir' },
  ]],
  ['groupe3oir', [
    { field: 'groupeConjugaison', operator: 'equals', value: 3 },
    { field: 'terminaison', operator: 'equals', value: 'oir' },
  ]],
  ['groupe3autres', [
    { field: 'groupeConjugaison', operator: 'equals', value: 3 },
    { field: 'terminaison', operator: 'not-in', value: ['ir', 'oir'] },
  ]],
])

export async function migrateChallengeGroupCriteria(connection) {
  const keys = [...challengeGroupCriteria.keys()]
  const placeholders = keys.map(() => '?').join(',')
  const [rows] = await connection.execute(
    `SELECT id,preset_key AS presetKey,verb_selection_mode AS selectionMode
     FROM challenge_presets
     WHERE preset_key IN (${placeholders})
     ORDER BY id
     FOR UPDATE`,
    keys,
  )
  const found = new Set(rows.map(row => row.presetKey))
  const missing = keys.filter(key => !found.has(key))
  if (missing.length) {
    throw new Error(`Défis de groupes introuvables : ${missing.join(', ')}.`)
  }

  let converted = 0
  for (const row of rows) {
    const criteria = challengeGroupCriteria.get(row.presetKey)
    const [result] = await connection.execute(
      `UPDATE challenge_presets
       SET verb_selection_mode='criteria',criteria_json=?
       WHERE id=?`,
      [JSON.stringify(criteria), row.id],
    )
    if (row.selectionMode !== 'criteria' || Number(result.changedRows) > 0) converted += 1
  }

  const ids = rows.map(row => Number(row.id))
  const [deleted] = await connection.execute(
    `DELETE FROM challenge_preset_verbs
     WHERE preset_id IN (${ids.map(() => '?').join(',')})`,
    ids,
  )
  return {
    presetCount: rows.length,
    converted,
    removedSelections: Number(deleted.affectedRows),
  }
}

async function run() {
  const config = {
    host: process.env.DB_HOST || process.env.NUXT_DB_HOST,
    port: Number(process.env.DB_PORT || process.env.NUXT_DB_PORT || 3306),
    database: process.env.DB_NAME || process.env.NUXT_DB_NAME,
    user: process.env.DB_USER || process.env.NUXT_DB_USER,
    password: process.env.DB_PASSWORD || process.env.NUXT_DB_PASSWORD,
  }
  if (!config.host || !config.database || !config.user) {
    throw new Error(
      'Configuration MySQL absente. Dans Plesk, redémarrez l’application : '
      + 'la migration sera appliquée automatiquement avec la configuration Nitro.',
    )
  }
  const connection = await mysql.createConnection({ ...config, charset: 'utf8mb4' })
  try {
    await connection.beginTransaction()
    const result = await migrateChallengeGroupCriteria(connection)
    await connection.commit()
    console.log(
      `${result.presetCount} défis de groupes utilisent maintenant des critères dynamiques`
      + ` (${result.removedSelections} anciennes sélections supprimées).`,
    )
  }
  catch (error) {
    await connection.rollback()
    throw error
  }
  finally {
    await connection.end()
  }
}

if (isDirectScriptExecution(import.meta.url, 'migrate-challenge-group-criteria.mjs')) {
  run().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}

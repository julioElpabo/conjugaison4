import { readFile } from 'node:fs/promises'
import mysql from 'mysql2/promise'

const report = JSON.parse(await readFile(new URL('../reports/coach-help-semantic-audit.json', import.meta.url), 'utf8'))
const corrections = (report.cases || [])
  .filter(item => item.status === 'failed'
    && Array.isArray(item.issues)
    && item.issues.includes('stored-conjugation-error')
    && item.suggestedCorrection)

if (!corrections.length) {
  console.log(JSON.stringify({ ok: true, corrections: 0, updates: [] }, null, 2))
  process.exit(0)
}

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

const updates = []
await database.beginTransaction()
try {
  for (const correction of corrections) {
    const [result] = await database.execute(
      `UPDATE verbesconjugues
       SET conjugaison1 = ?, conjugaison2 = '', conjugaison3 = ''
       WHERE verbe_id = ? AND temp_id = ? AND personne_id = ?`,
      [correction.suggestedCorrection, correction.verbId, correction.key.split(':')[1], correction.personId],
    )
    updates.push({
      key: correction.key,
      verb: correction.verb,
      mode: correction.mode,
      tense: correction.tense,
      person: correction.person,
      previous: correction.expected,
      next: correction.suggestedCorrection,
      affected: result.affectedRows,
    })
  }
  await database.commit()
  console.log(JSON.stringify({ ok: true, corrections: corrections.length, updates }, null, 2))
} catch (error) {
  await database.rollback()
  console.error(error)
  process.exitCode = 1
} finally {
  await database.end()
}

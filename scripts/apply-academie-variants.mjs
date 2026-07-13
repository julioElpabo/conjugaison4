import { readFile } from 'node:fs/promises'
import mysql from 'mysql2/promise'

const REPORT_PATH = new URL('../reports/academie-variants.json', import.meta.url)
const apply = process.argv.includes('--apply')
const report = JSON.parse(await readFile(REPORT_PATH, 'utf8'))
const updates = Array.isArray(report.updates) ? report.updates : []
const primaryCorrections = Array.isArray(report.primaryCorrections) ? report.primaryCorrections : []
const changes = [
  ...updates.map(item => ({ ...item, kind: 'variant' })),
  ...primaryCorrections.map(item => ({ ...item, kind: 'primary-correction' }))
]

if (!report.source?.startsWith('https://www.dictionnaire-academie.fr/')) {
  throw new Error('Le rapport ne référence pas la source officielle attendue.')
}
if (changes.length === 0) {
  throw new Error('Le rapport ne contient aucune modification à appliquer.')
}

const rowIds = new Set()
for (const change of changes) {
  if (rowIds.has(change.rowId)) throw new Error(`La ligne ${change.rowId} apparaît plusieurs fois dans le rapport.`)
  rowIds.add(change.rowId)
  if (!change.source?.startsWith('https://www.dictionnaire-academie.fr/conjuguer/')) {
    throw new Error(`Source invalide pour la ligne ${change.rowId}.`)
  }
  if (!Array.isArray(change.alternatives) || change.alternatives.length < 1 || change.alternatives.length > 2) {
    throw new Error(`Nombre de variantes invalide pour la ligne ${change.rowId}.`)
  }
}

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
})

try {
  let alreadyApplied = 0
  let pending = 0
  for (const change of changes) {
    const [rows] = await database.execute(`
      SELECT id, verbe_id AS verbId, conjugaison1, conjugaison2, conjugaison3
      FROM verbesconjugues
      WHERE id = ?
    `, [change.rowId])
    if (rows.length !== 1) throw new Error(`Ligne ${change.rowId} absente de la base.`)

    const row = rows[0]
    const initialPrimary = change.kind === 'primary-correction'
      ? change.previousPrimary
      : change.primary
    if (Number(row.verbId) !== Number(change.verbId)) {
      throw new Error(`Verbe inattendu pour la ligne ${change.rowId}.`)
    }
    const current = [row.conjugaison1 || '', row.conjugaison2 || '', row.conjugaison3 || ''].map(String)
    const expected = [change.primary, change.alternatives[0] || '', change.alternatives[1] || ''].map(String)
    if (current.every((value, index) => value === expected[index])) {
      alreadyApplied += 1
      continue
    }
    if (current[0] !== String(initialPrimary || '') || current[1] || current[2]) {
      throw new Error(`État inattendu pour la ligne ${change.rowId} : ${JSON.stringify(current)}.`)
    }

    pending += 1
    if (apply) {
      const [result] = await database.execute(`
        UPDATE verbesconjugues
        SET conjugaison1 = ?, conjugaison2 = ?, conjugaison3 = ?
        WHERE id = ?
      `, [...expected, change.rowId])
      if (result.affectedRows !== 1) throw new Error(`La mise à jour de la ligne ${change.rowId} a échoué.`)
    }
  }

  console.log(JSON.stringify({
    mode: apply ? 'appliqué' : 'simulation',
    rows: changes.length,
    alreadyApplied,
    pending,
    variantsAdded: updates.length,
    primaryCorrections: primaryCorrections.length,
    academyPages: new Set(changes.map(change => change.source)).size
  }, null, 2))
} catch (error) {
  throw error
} finally {
  await database.end()
}

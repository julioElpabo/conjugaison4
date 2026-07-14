import { readFile } from 'node:fs/promises'
import mysql from 'mysql2/promise'

const legacyPath = new URL('../../conjugaison3/backup-sql/conjugaison3.sql', import.meta.url)
const sql = await readFile(legacyPath, 'utf8')
const startMarker = 'INSERT INTO `verbes` (`id`, `infinitif`, `participe_présent`, `participe_passé`, `auxiliaire`, `created`, `is_transitif`, `is_transitif_essentiel`) VALUES'
const start = sql.indexOf(startMarker)
const end = sql.indexOf(';', start)
if (start < 0 || end < 0) throw new Error('Classification historique introuvable')

const rows = sql.slice(start + startMarker.length, end)
  .split('\n')
  .map(line => line.trim().replace(/,$/u, ''))
  .filter(line => line.startsWith('('))
  .map((line) => {
    const match = line.match(/^\(\d+, '((?:[^'\\]|\\.)*)', .*?, (NULL|[01]), (NULL|[01])\)$/u)
    if (!match) return null
    return {
      infinitive: match[1].replace(/\\'/gu, "'"),
      transitive: match[2] === '1',
      essential: match[3] === '1',
    }
  })
  .filter(Boolean)

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

try {
  const [active] = await database.execute('SELECT infinitif FROM verbes WHERE est_archive=0 ORDER BY infinitif')
  const activeSet = new Set(active.map(row => row.infinitif))
  const mapped = rows.filter(row => activeSet.has(row.infinitive))
  console.log(JSON.stringify({
    legacyRows: rows.length,
    activeMapped: mapped.length,
    transitive: mapped.filter(row => row.transitive).length,
    intransitive: mapped.filter(row => !row.transitive).length,
    essential: mapped.filter(row => row.essential).length,
    transitiveEssential: mapped.filter(row => row.transitive && row.essential).length,
    transitiveInfinitives: mapped.filter(row => row.transitive).map(row => row.infinitive).sort((a, b) => a.localeCompare(b, 'fr')),
    intransitiveInfinitives: mapped.filter(row => !row.transitive).map(row => row.infinitive).sort((a, b) => a.localeCompare(b, 'fr')),
    unmappedActive: [...activeSet].filter(infinitive => !rows.some(row => row.infinitive === infinitive)),
  }, null, 2))
} finally {
  await database.end()
}

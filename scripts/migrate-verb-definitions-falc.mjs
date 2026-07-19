import mysql from 'mysql2/promise'
import { falcVerbDefinitions } from './falc-verb-definitions.mjs'

const apply = process.argv.includes('--apply')
const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

try {
  const [rows] = await database.execute(`
    SELECT v.id, v.infinitif, vs.id AS sense_id,
           COALESCE(vs.intitule, '') AS intitule, COALESCE(vs.definition, '') AS definition
    FROM verbes v
    LEFT JOIN verbe_sens vs ON vs.verbe_id=v.id AND vs.est_principal=1
    WHERE v.est_archive=0
    ORDER BY v.infinitif, v.id
  `)
  const infinitives = new Set(rows.map(row => row.infinitif))
  const missing = rows.filter(row => !falcVerbDefinitions[row.infinitif])
  const withoutSense = rows.filter(row => !Number(row.sense_id))
  const extra = Object.keys(falcVerbDefinitions).filter(infinitive => !infinitives.has(infinitive))
  const invalid = Object.entries(falcVerbDefinitions).filter(([, definition]) => (
    !definition.trim()
    || definition.length > 180
    || !/[.!?]$/u.test(definition)
  ))

  if (missing.length || withoutSense.length || extra.length || invalid.length) {
    if (missing.length) console.error(`Définitions manquantes : ${missing.map(row => row.infinitif).join(', ')}`)
    if (withoutSense.length) console.error(`Sens principal manquant : ${withoutSense.map(row => row.infinitif).join(', ')}`)
    if (extra.length) console.error(`Définitions sans verbe actif : ${extra.join(', ')}`)
    if (invalid.length) console.error(`Définitions invalides : ${invalid.map(([infinitive]) => infinitive).join(', ')}`)
    process.exitCode = 1
  } else {
    const changed = rows.filter(row => (
      row.definition.trim() !== falcVerbDefinitions[row.infinitif]
      || row.intitule.trim() !== falcVerbDefinitions[row.infinitif]
    ))
    console.log(`${rows.length} verbes actifs couverts.`)
    console.log(`${changed.length} définition(s) ou intitulé(s) à mettre à jour.`)
    console.log(apply ? 'Application des définitions FALC…' : 'Audit uniquement. Ajoutez --apply pour modifier la base.')

    if (apply && changed.length) {
      await database.beginTransaction()
      try {
        for (const row of changed) {
          await database.execute(
            'UPDATE verbe_sens SET intitule=?, definition=? WHERE id=? AND est_principal=1',
            [falcVerbDefinitions[row.infinitif], falcVerbDefinitions[row.infinitif], row.sense_id],
          )
        }
        await database.commit()
        console.log(`${changed.length} définition(s) et intitulé(s) synchronisé(s).`)
      } catch (error) {
        await database.rollback()
        throw error
      }
    }
  }
} finally {
  await database.end()
}

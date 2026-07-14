import mysql from 'mysql2/promise'
import { inferAnteposedComplement } from '../server/services/complement-placement.ts'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

const [placementColumns] = await database.execute(`
  SELECT 1 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='complements_verbaux' AND COLUMN_NAME='texte_antepose'
  LIMIT 1
`)
if (placementColumns.length === 0) {
  await database.query('ALTER TABLE complements_verbaux ADD COLUMN texte_antepose VARCHAR(180) NULL AFTER texte')
}

await database.execute(`
  UPDATE complements_verbaux c
  INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
  SET c.texte_antepose=NULL, c.genre=NULL, c.nombre=NULL
  WHERE cv.fonction_objet<>'cod'
`)

const [rows] = await database.execute(`
  SELECT c.id, c.texte FROM complements_verbaux c
  INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
  WHERE c.actif=1 AND cv.fonction_objet='cod'
`)
let eligible = 0
for (const row of rows) {
  const inferred = inferAnteposedComplement(String(row.texte))
  if (!inferred) {
    await database.execute(`
      UPDATE complements_verbaux
      SET texte_antepose=NULL, genre=NULL, nombre=NULL
      WHERE id=?
    `, [row.id])
    continue
  }
  await database.execute(`
    UPDATE complements_verbaux
    SET texte_antepose=?, genre=?, nombre=?
    WHERE id=?
  `, [inferred.text, inferred.gender, inferred.number, row.id])
  eligible += 1
}

console.log(`Compléments actifs analysés : ${rows.length}`)
console.log(`Compléments antéposables sans ambiguïté : ${eligible}`)
await database.end()

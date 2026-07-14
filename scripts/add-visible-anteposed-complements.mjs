import mysql from 'mysql2/promise'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

const complements = [
  {
    infinitive: 'abandonner',
    after: 'une mission',
    before: 'la mission',
    gender: 'feminin',
    number: 'singulier',
  },
]

try {
  await database.beginTransaction()
  for (const complement of complements) {
    const [constructions] = await database.execute(`
      SELECT cv.id
      FROM constructions_verbales cv
      INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
      INNER JOIN verbes v ON v.id=vs.verbe_id
      WHERE v.infinitif=? AND cv.fonction_objet='cod' AND cv.actif=1
      ORDER BY (cv.code='cod-postpose') DESC, vs.est_principal DESC, cv.id
      LIMIT 1
    `, [complement.infinitive])
    if (!constructions[0]) throw new Error(`Construction COD absente pour « ${complement.infinitive} »`)

    await database.execute(`
      INSERT INTO complements_verbaux
        (construction_id, texte, texte_antepose, genre, nombre, poids, source, statut_validation, actif)
      VALUES (?, ?, ?, ?, ?, 2, 'Correction pédagogique COD antéposé', 'valide', 1)
      ON DUPLICATE KEY UPDATE texte_antepose=VALUES(texte_antepose), genre=VALUES(genre),
        nombre=VALUES(nombre), poids=VALUES(poids), source=VALUES(source),
        statut_validation='valide', actif=1
    `, [constructions[0].id, complement.after, complement.before, complement.gender, complement.number])
  }
  await database.commit()
  console.log(`${complements.length} complément antéposable ajouté ou réactivé.`)
} catch (error) {
  await database.rollback()
  throw error
} finally {
  await database.end()
}

import mysql from 'mysql2/promise'

const SOURCE = 'Catalogue pédagogique mineurs 2026'
const complements = [
  'à une mère',
  'à la mère',
  'à cette mère',
  'à ma mère',
  'à ta mère',
  'à sa mère',
  'à notre mère',
  'à votre mère',
  'à leur mère',
  'à une autre mère',
]

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

try {
  await database.beginTransaction()
  const [verbs] = await database.execute(
    "SELECT id FROM verbes WHERE infinitif='écrire' AND est_archive=0 LIMIT 1",
  )
  if (!verbs[0]) throw new Error('Verbe actif absent : écrire')

  const verbId = Number(verbs[0].id)
  const [senses] = await database.execute(`
    SELECT id FROM verbe_sens
    WHERE verbe_id=? AND transitivite='transitif_indirect' AND preposition='à'
    ORDER BY est_principal DESC, sort_order, id LIMIT 1
  `, [verbId])

  let senseId = Number(senses[0]?.id)
  if (!senseId) {
    const [result] = await database.execute(`
      INSERT INTO verbe_sens
        (verbe_id, numero_sens, intitule, definition, construction, transitivite,
         preposition, auxiliaire, registre, est_pronominal, est_principal, source, sort_order)
      SELECT ?, COALESCE(MAX(numero_sens), 0) + 1, 'Écrire à quelqu’un',
        'Adresser un écrit à une personne', 'N0 V à N1', 'transitif_indirect',
        'à', 'avoir', 'courant', 0, 0, 'manuel', COALESCE(MAX(sort_order), 0) + 1
      FROM verbe_sens WHERE verbe_id=?
    `, [verbId, verbId])
    senseId = Number(result.insertId)
  }

  await database.execute(`
    INSERT INTO constructions_verbales
      (sens_id, code, fonction_objet, preposition, patron, complement_obligatoire,
       source, statut_validation, actif)
    VALUES (?, 'coi-à-postpose', 'coi', 'à', 'N0 V à N1', 0, ?, 'valide', 1)
    ON DUPLICATE KEY UPDATE fonction_objet='coi', preposition='à', patron='N0 V à N1',
      source=VALUES(source), statut_validation='valide', actif=1
  `, [senseId, SOURCE])

  const [constructions] = await database.execute(
    "SELECT id FROM constructions_verbales WHERE sens_id=? AND code='coi-à-postpose' LIMIT 1",
    [senseId],
  )
  const constructionId = Number(constructions[0]?.id)
  if (!constructionId) throw new Error('Construction COI non créée pour écrire')

  for (const text of complements) {
    await database.execute(`
      INSERT INTO complements_verbaux
        (construction_id, texte, classe_semantique, niveau_cecrl, poids,
         source, statut_validation, actif)
      VALUES (?, ?, 'destinataire', 'A2', 1, ?, 'valide', 1)
      ON DUPLICATE KEY UPDATE classe_semantique='destinataire', niveau_cecrl='A2',
        poids=1, source=VALUES(source), statut_validation='valide', actif=1
    `, [constructionId, text, SOURCE])
  }

  await database.commit()
  console.log(`${complements.length} COI ajoutés ou réactivés pour « écrire ».`)
} catch (error) {
  await database.rollback()
  throw error
} finally {
  await database.end()
}

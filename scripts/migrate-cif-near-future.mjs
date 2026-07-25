import mysql from 'mysql2/promise'

const apply = process.argv.includes('--apply')
const database = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

try {
  await database.beginTransaction()
  const [[tense]] = await database.execute(
    `SELECT id FROM temps
     WHERE code='near-future' OR name='futur proche'
     ORDER BY code='near-future' DESC
     LIMIT 1`,
  )
  if (!tense) throw new Error('Le temps « futur proche » est introuvable.')

  const [presets] = await database.execute(
    `SELECT p.id, p.preset_key
     FROM challenge_presets p
     INNER JOIN challenge_preset_categories category ON category.id=p.category_id
     WHERE category.slug='cif'
     ORDER BY p.sort_order,p.id`,
  )
  if (!presets.length) throw new Error('Aucun défi préfabriqué CIF n’a été trouvé.')

  let inserted = 0
  for (const preset of presets) {
    const [[position]] = await database.execute(
      `SELECT COALESCE(MAX(sort_order),0)+1 AS next_order
       FROM challenge_preset_tenses
       WHERE preset_id=?`,
      [preset.id],
    )
    const [result] = await database.execute(
      `INSERT IGNORE INTO challenge_preset_tenses (preset_id,tense_id,sort_order)
       VALUES (?,?,?)`,
      [preset.id, tense.id, Number(position.next_order)],
    )
    inserted += Number(result.affectedRows)
  }

  const [verified] = await database.execute(
    `SELECT p.preset_key
     FROM challenge_presets p
     INNER JOIN challenge_preset_categories category ON category.id=p.category_id
     LEFT JOIN challenge_preset_tenses selection
       ON selection.preset_id=p.id AND selection.tense_id=?
     WHERE category.slug='cif' AND selection.preset_id IS NULL`,
    [tense.id],
  )
  if (verified.length) {
    throw new Error(`Futur proche absent de : ${verified.map(row => row.preset_key).join(', ')}.`)
  }

  if (apply) await database.commit()
  else await database.rollback()
  console.log(`${apply ? 'Migration appliquée' : 'Simulation réussie'} : futur proche sélectionné dans ${presets.length} défis CIF (${inserted} ajout${inserted > 1 ? 's' : ''}).`)
} catch (error) {
  await database.rollback()
  throw error
} finally {
  await database.end()
}

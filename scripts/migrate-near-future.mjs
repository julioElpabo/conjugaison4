import mysql from 'mysql2/promise'

const apply = process.argv.includes('--apply')
const databaseConfig = {
  host: process.env.DB_HOST || process.env.NUXT_DB_HOST,
  port: Number(process.env.DB_PORT || process.env.NUXT_DB_PORT || 3306),
  database: process.env.DB_NAME || process.env.NUXT_DB_NAME,
  user: process.env.DB_USER || process.env.NUXT_DB_USER,
  password: process.env.DB_PASSWORD || process.env.NUXT_DB_PASSWORD,
}

if (!databaseConfig.host || !databaseConfig.database || !databaseConfig.user) {
  throw new Error(
    'Configuration MySQL absente (DB_* ou NUXT_DB_*). '
    + 'Dans Plesk, si « Run script » ne transmet pas ces variables, déployez le code puis redémarrez l’application : '
    + 'le plugin serveur near-future-migration appliquera cette migration automatiquement.'
  )
}

const connection = await mysql.createConnection(databaseConfig)

try {
  await connection.beginTransaction()
  const [modes] = await connection.execute(
    "SELECT id FROM modes WHERE name='indicatif' ORDER BY id LIMIT 1 FOR UPDATE",
  )
  const modeId = Number(modes[0]?.id)
  if (!modeId) throw new Error('Mode indicatif introuvable.')

  const [existing] = await connection.execute(`
    SELECT id, mode_id, code, name, isTempsCompose
    FROM temps
    WHERE code='near-future' OR name='futur proche'
    ORDER BY id
    FOR UPDATE
  `)
  if (existing.length > 1) {
    throw new Error('Plusieurs temps correspondent déjà au futur proche.')
  }

  let tenseId = Number(existing[0]?.id || 0)
  if (tenseId) {
    const tense = existing[0]
    if (Number(tense.mode_id) !== modeId
        || tense.code !== 'near-future'
        || tense.name !== 'futur proche'
        || Number(tense.isTempsCompose) !== 0) {
      throw new Error('Le futur proche existe avec une configuration incompatible.')
    }
  } else {
    const [result] = await connection.execute(`
      INSERT INTO temps (mode_id, code, name, isTempsCompose, selected)
      VALUES (?, 'near-future', 'futur proche', 0, 1)
    `, [modeId])
    tenseId = Number(result.insertId)
  }

  const [storedForms] = await connection.execute(
    'SELECT COUNT(*) AS count FROM verbesconjugues WHERE temp_id=?',
    [tenseId],
  )
  if (Number(storedForms[0]?.count) !== 0) {
    throw new Error('Le futur proche doit être généré et ne doit pas avoir de formes stockées.')
  }

  if (apply) await connection.commit()
  else await connection.rollback()
  console.log(`${apply ? 'Migration appliquée' : 'Simulation réussie'} : futur proche (temps ${tenseId}), formes générées à la volée.`)
} catch (error) {
  await connection.rollback()
  throw error
} finally {
  await connection.end()
}

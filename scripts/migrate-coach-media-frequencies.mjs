import mysql from 'mysql2/promise'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

try {
  const [tables] = await database.query("SHOW TABLES LIKE 'coach_character_reaction_rules'")
  if (tables.length === 0) {
    throw new Error('La table coach_character_reaction_rules est absente. Lancez d’abord la migration des coaches.')
  }

  const [columns] = await database.query('SHOW COLUMNS FROM coach_character_reaction_rules')
  const columnNames = new Set(columns.map(column => column.Field))
  let added = 0

  if (!columnNames.has('animation_probability')) {
    await database.query('ALTER TABLE coach_character_reaction_rules ADD COLUMN animation_probability DECIMAL(4,3) NOT NULL DEFAULT 0 AFTER media_probability')
    await database.query('UPDATE coach_character_reaction_rules SET animation_probability=media_probability')
    added += 1
  }

  if (!columnNames.has('emoji_probability')) {
    const afterColumn = columnNames.has('animation_probability') || added ? 'animation_probability' : 'media_probability'
    await database.query(`ALTER TABLE coach_character_reaction_rules ADD COLUMN emoji_probability DECIMAL(4,3) NOT NULL DEFAULT 0 AFTER ${afterColumn}`)
    await database.query('UPDATE coach_character_reaction_rules SET emoji_probability=media_probability')
    added += 1
  }

  console.log(added ? `Migration terminée : ${added} colonne(s) ajoutée(s).` : 'Migration déjà appliquée : aucune colonne ajoutée.')
}
finally {
  await database.end()
}

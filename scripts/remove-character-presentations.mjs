import mysql from 'mysql2/promise'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

async function dropColumnIfPresent(table, column) {
  const [columns] = await database.execute(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?`,
    [table, column],
  )
  if (columns.length) await database.query(`ALTER TABLE \`${table}\` DROP COLUMN \`${column}\``)
}

try {
  await dropColumnIfPresent('coach_character_translations', 'description')
  await dropColumnIfPresent('coach_characters', 'description')

  const [remaining] = await database.execute(
    `SELECT TABLE_NAME,COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('coach_characters','coach_character_translations')
       AND COLUMN_NAME='description'`,
  )
  if (remaining.length) throw new Error('La suppression des présentations est incomplète.')
  console.log('Colonnes de présentation des caractères supprimées.')
} finally {
  await database.end()
}

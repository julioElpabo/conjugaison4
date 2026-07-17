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
  const [sharedResult] = await database.execute("DELETE FROM coach_character_reply_templates WHERE event_type='off-topic'")
  const [legacyResult] = await database.execute("DELETE FROM coach_reply_templates WHERE event_type='off-topic'")
  console.log(`${sharedResult.affectedRows + legacyResult.affectedRows} phrase(s) « Hors sujet » supprimée(s).`)
} finally {
  await database.end()
}

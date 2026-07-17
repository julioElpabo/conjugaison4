import mysql from 'mysql2/promise'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

const emoticons = new Map([
  ['warm', '🤗'],
  ['methodical', '🧭'],
  ['dynamic', '⚡'],
  ['calm', '🌿'],
])

try {
  const [columns] = await database.query("SHOW COLUMNS FROM coach_characters LIKE 'emoticon'")
  if (columns.length === 0) {
    await database.query("ALTER TABLE coach_characters ADD COLUMN emoticon VARCHAR(32) NOT NULL DEFAULT '🙂' AFTER feminine_name")
  }

  for (const [slug, emoticon] of emoticons) {
    await database.execute('UPDATE coach_characters SET emoticon=? WHERE slug=?', [emoticon, slug])
  }
  await database.query("UPDATE coach_characters SET emoticon='🙂' WHERE emoticon=''")

  const [characters] = await database.query('SELECT slug,emoticon FROM coach_characters ORDER BY sort_order,id')
  console.table(characters)
} finally {
  await database.end()
}

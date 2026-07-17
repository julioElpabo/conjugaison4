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
  const [masculineColumns] = await database.query("SHOW COLUMNS FROM coach_characters LIKE 'masculine_name'")
  if (masculineColumns.length === 0) {
    await database.query("ALTER TABLE coach_characters ADD COLUMN masculine_name VARCHAR(80) NOT NULL DEFAULT '' AFTER name")
  }

  const [feminineColumns] = await database.query("SHOW COLUMNS FROM coach_characters LIKE 'feminine_name'")
  if (feminineColumns.length === 0) {
    await database.query("ALTER TABLE coach_characters ADD COLUMN feminine_name VARCHAR(80) NOT NULL DEFAULT '' AFTER masculine_name")
  }

  await database.query("UPDATE coach_characters SET masculine_name=name WHERE masculine_name=''")
  await database.query("UPDATE coach_characters SET feminine_name=name WHERE feminine_name=''")
  await database.execute("UPDATE coach_characters SET masculine_name='Chaleureux', feminine_name='Chaleureuse', name='Chaleureux' WHERE slug='warm'")

  const [characters] = await database.query('SELECT slug,masculine_name AS masculineName,feminine_name AS feminineName FROM coach_characters ORDER BY sort_order,id')
  console.table(characters)
} finally {
  await database.end()
}

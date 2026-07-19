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
  await database.query("ALTER TABLE coach_help_blocks MODIFY block_type ENUM('normal','info','success','warning','danger') NOT NULL")
  console.log('Types de blocs info et success disponibles.')
} finally {
  await database.end()
}

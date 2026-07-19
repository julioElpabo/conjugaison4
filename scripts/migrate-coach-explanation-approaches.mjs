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
  const [columns] = await database.query("SHOW COLUMNS FROM coach_help_blocks LIKE 'explanation_approach'")
  if (!columns.length) {
    await database.query("ALTER TABLE coach_help_blocks ADD COLUMN explanation_approach ENUM('cif-falc','concise','grammatical-technical','guided-discovery') NOT NULL DEFAULT 'cif-falc' AFTER content")
    console.log('Approche pédagogique ajoutée aux blocs d’aide avec CIF/FALC comme valeur initiale.')
  } else {
    await database.query("ALTER TABLE coach_help_blocks MODIFY explanation_approach ENUM('cif-falc','concise','grammatical-technical','guided-discovery') NOT NULL DEFAULT 'cif-falc'")
    console.log('Approche pédagogique des blocs déjà présente et vérifiée.')
  }

  const [counts] = await database.query('SELECT explanation_approach AS approach, COUNT(*) AS count FROM coach_help_blocks GROUP BY explanation_approach ORDER BY explanation_approach')
  for (const row of counts) console.log(`${row.approach}: ${row.count}`)
} finally {
  await database.end()
}

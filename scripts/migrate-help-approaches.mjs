import mysql from 'mysql2/promise'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

async function hasColumn(column) {
  const [rows] = await database.execute(`SELECT COLUMN_NAME FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='coach_characters' AND COLUMN_NAME=?`, [column])
  return rows.length > 0
}

async function hasApproachColumn(column) {
  const [rows] = await database.execute(`SELECT COLUMN_NAME FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='coach_help_approaches' AND COLUMN_NAME=?`, [column])
  return rows.length > 0
}

async function hasIndex(index) {
  const [rows] = await database.execute(`SELECT INDEX_NAME FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='coach_characters' AND INDEX_NAME=?`, [index])
  return rows.length > 0
}

try {
  await database.query(`CREATE TABLE IF NOT EXISTS coach_help_approaches (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(80) NOT NULL,
    name VARCHAR(80) NOT NULL,
    engine_key ENUM('complete-avec-reponses','complete','tres-condensee','allophone') NOT NULL DEFAULT 'complete-avec-reponses',
    sort_order SMALLINT NOT NULL DEFAULT 0,
    status ENUM('draft','published','disabled') NOT NULL DEFAULT 'published',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_coach_help_approach_slug (slug)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  if (!await hasApproachColumn('status')) {
    await database.query("ALTER TABLE coach_help_approaches ADD COLUMN status ENUM('draft','published','disabled') NOT NULL DEFAULT 'published' AFTER sort_order")
  }

  await database.query(`ALTER TABLE coach_help_approaches MODIFY engine_key
    ENUM('cif-falc','concise','grammatical-technical','guided-discovery','complete-avec-reponses','complete','tres-condensee','allophone')
    NOT NULL DEFAULT 'complete-avec-reponses'`)
  await database.query(`UPDATE coach_help_approaches SET engine_key=CASE engine_key
    WHEN 'cif-falc' THEN 'complete-avec-reponses'
    WHEN 'concise' THEN 'tres-condensee'
    WHEN 'grammatical-technical' THEN 'complete'
    WHEN 'guided-discovery' THEN 'allophone'
    ELSE engine_key END`)
  await database.query("UPDATE coach_help_approaches SET slug='complete-avec-reponses',name='Complète avec réponses' WHERE slug='cif-falc'")
  await database.query("UPDATE coach_help_approaches SET slug='tres-condensee',name='Très condensée' WHERE slug='concise'")
  await database.query("UPDATE coach_help_approaches SET slug='complete',name='Complète sans réponses' WHERE slug='grammatical-technical'")
  const seeds = [
    ['complete-avec-reponses', 'Complète avec réponses', 'complete-avec-reponses', 1],
    ['complete', 'Complète sans réponses', 'complete', 2],
    ['tres-condensee', 'Très condensée', 'tres-condensee', 3],
    ['allophone', 'Allophone', 'allophone', 4],
  ]
  for (const seed of seeds) {
    await database.execute(`INSERT INTO coach_help_approaches (slug,name,engine_key,sort_order)
      VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE slug=VALUES(slug)`, seed)
  }
  await database.query(`UPDATE coach_characters c
    JOIN coach_help_approaches legacy ON legacy.id=c.help_approach_id AND legacy.slug='guided-discovery'
    JOIN coach_help_approaches target ON target.slug='allophone'
    SET c.help_approach_id=target.id`)
  await database.query("DELETE FROM coach_help_approaches WHERE slug='guided-discovery'")

  if (!await hasColumn('help_approach_id')) {
    await database.query('ALTER TABLE coach_characters ADD COLUMN help_approach_id INT UNSIGNED NULL AFTER pedagogical_style')
  }
  if (await hasColumn('help_approach')) {
    await database.query(`UPDATE coach_characters c JOIN coach_help_approaches a ON a.slug=CASE c.help_approach
        WHEN 'cif-falc' THEN 'complete-avec-reponses' WHEN 'concise' THEN 'tres-condensee'
        WHEN 'grammatical-technical' THEN 'complete' WHEN 'guided-discovery' THEN 'allophone' ELSE c.help_approach END
      SET c.help_approach_id=a.id WHERE c.help_approach_id IS NULL`)
  }
  await database.query(`UPDATE coach_characters c JOIN coach_help_approaches a ON a.slug='complete-avec-reponses'
    SET c.help_approach_id=a.id WHERE c.help_approach_id IS NULL`)

  const [foreignKeys] = await database.execute(`SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='coach_characters'
      AND COLUMN_NAME='help_approach_id' AND REFERENCED_TABLE_NAME IS NOT NULL`)
  if (!foreignKeys.length) {
    if (!await hasIndex('idx_coach_character_help_approach')) {
      await database.query('ALTER TABLE coach_characters ADD KEY idx_coach_character_help_approach (help_approach_id)')
    }
    await database.query(`ALTER TABLE coach_characters ADD CONSTRAINT fk_coach_character_help_approach
      FOREIGN KEY (help_approach_id) REFERENCES coach_help_approaches(id) ON DELETE RESTRICT`)
  }
  await database.query('ALTER TABLE coach_characters MODIFY help_approach_id INT UNSIGNED NOT NULL')
  if (await hasColumn('help_approach')) await database.query('ALTER TABLE coach_characters DROP COLUMN help_approach')
  await database.query(`ALTER TABLE coach_help_approaches MODIFY engine_key
    ENUM('complete-avec-reponses','complete','tres-condensee','allophone') NOT NULL DEFAULT 'complete-avec-reponses'`)

  const [[audit]] = await database.query(`SELECT COUNT(*) AS total,
    SUM(a.id IS NULL) AS invalid FROM coach_characters c
    LEFT JOIN coach_help_approaches a ON a.id=c.help_approach_id`)
  if (Number(audit.invalid)) throw new Error('La migration des approches d’aide est incomplète.')
  console.log(`${audit.total} caractères reliés à des approches d’aide administrables.`)
} finally {
  await database.end()
}

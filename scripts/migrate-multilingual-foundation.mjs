import mysql from 'mysql2/promise'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

async function addColumn(table, column, definition) {
  const [rows] = await database.query(`SHOW COLUMNS FROM \`${table}\` LIKE ${database.escape(column)}`)
  if (!rows.length) await database.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`)
}

try {
  await addColumn('modes', 'code', 'VARCHAR(32) NULL AFTER id')
  await addColumn('temps', 'code', 'VARCHAR(40) NULL AFTER mode_id')
  await addColumn('users', 'interface_locale', "VARCHAR(5) NOT NULL DEFAULT 'fr'")
  await addColumn('users', 'explanation_locale', "VARCHAR(5) NOT NULL DEFAULT 'fr'")

  await database.query(`UPDATE modes SET code=CASE LOWER(name)
    WHEN 'indicatif' THEN 'indicative' WHEN 'subjonctif' THEN 'subjunctive'
    WHEN 'conditionnel' THEN 'conditional' WHEN 'impératif' THEN 'imperative'
    WHEN 'participe' THEN 'participle' WHEN 'gérondif' THEN 'gerund'
    WHEN 'infinitif' THEN 'infinitive' ELSE code END`)
  await database.query(`UPDATE temps SET code=CASE LOWER(name)
    WHEN 'présent' THEN 'present' WHEN 'imparfait' THEN 'imperfect' WHEN 'futur' THEN 'future'
    WHEN 'passé simple' THEN 'simple-past' WHEN 'passé composé' THEN 'compound-past'
    WHEN 'futur antérieur' THEN 'future-perfect' WHEN 'plus-que-parfait' THEN 'pluperfect'
    WHEN 'passé antérieur' THEN 'past-anterior' WHEN 'passé' THEN 'past'
    WHEN 'passé 1' THEN 'past-first-form' WHEN 'passé 2' THEN 'past-second-form' ELSE code END`)

  const [missingModes] = await database.query("SELECT name FROM modes WHERE code IS NULL OR code='' ")
  const [missingTenses] = await database.query("SELECT name FROM temps WHERE code IS NULL OR code='' ")
  if (missingModes.length || missingTenses.length) {
    throw new Error(`Codes grammaticaux manquants : ${[...missingModes, ...missingTenses].map(row => row.name).join(', ')}`)
  }
  await database.query('ALTER TABLE modes MODIFY code VARCHAR(32) NOT NULL')
  await database.query('ALTER TABLE temps MODIFY code VARCHAR(40) NOT NULL')

  await database.query(`CREATE TABLE IF NOT EXISTS verbe_sens_translations (
    sens_id INT NOT NULL, locale VARCHAR(5) NOT NULL,
    intitule VARCHAR(255) NOT NULL, definition TEXT NULL,
    PRIMARY KEY (sens_id,locale), KEY idx_vst_locale (locale,sens_id),
    CONSTRAINT fk_vst_sens FOREIGN KEY (sens_id) REFERENCES verbe_sens(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  await database.query(`CREATE TABLE IF NOT EXISTS categories_semantiques_translations (
    categorie_id INT NOT NULL, locale VARCHAR(5) NOT NULL, label VARCHAR(120) NOT NULL,
    PRIMARY KEY (categorie_id,locale),
    CONSTRAINT fk_cst_category FOREIGN KEY (categorie_id) REFERENCES categories_semantiques(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  await database.query(`CREATE TABLE IF NOT EXISTS familles_conjugaison_translations (
    famille_id INT NOT NULL, locale VARCHAR(5) NOT NULL, label VARCHAR(120) NOT NULL, description VARCHAR(500) NULL,
    PRIMARY KEY (famille_id,locale),
    CONSTRAINT fk_fct_family FOREIGN KEY (famille_id) REFERENCES familles_conjugaison(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  await database.query(`CREATE TABLE IF NOT EXISTS coach_character_translations (
    character_id INT UNSIGNED NOT NULL, locale VARCHAR(5) NOT NULL,
    masculine_name VARCHAR(120) NOT NULL,
    pedagogical_style TEXT NOT NULL,
    PRIMARY KEY (character_id,locale),
    CONSTRAINT fk_cct_character FOREIGN KEY (character_id) REFERENCES coach_characters(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  await database.query(`CREATE TABLE IF NOT EXISTS coach_reply_translations (
    reply_id INT UNSIGNED NOT NULL, locale VARCHAR(5) NOT NULL, content TEXT NOT NULL,
    PRIMARY KEY (reply_id,locale),
    CONSTRAINT fk_crt_reply FOREIGN KEY (reply_id) REFERENCES coach_character_reply_templates(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  await database.query(`CREATE TABLE IF NOT EXISTS coach_help_template_translations (
    help_id INT UNSIGNED NOT NULL, locale VARCHAR(5) NOT NULL,
    name VARCHAR(120) NOT NULL, description VARCHAR(500) NOT NULL DEFAULT '', header_description TEXT NOT NULL,
    PRIMARY KEY (help_id,locale),
    CONSTRAINT fk_chtt_help FOREIGN KEY (help_id) REFERENCES coach_help_templates(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  await database.query(`CREATE TABLE IF NOT EXISTS coach_help_block_translations (
    block_id INT UNSIGNED NOT NULL, locale VARCHAR(5) NOT NULL, title VARCHAR(160) NOT NULL DEFAULT '', content TEXT NOT NULL,
    PRIMARY KEY (block_id,locale),
    CONSTRAINT fk_chbt_block FOREIGN KEY (block_id) REFERENCES coach_help_blocks(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  await database.query(`CREATE TABLE IF NOT EXISTS coach_media_translations (
    media_id INT UNSIGNED NOT NULL, locale VARCHAR(5) NOT NULL, name VARCHAR(160) NOT NULL, alt_text VARCHAR(255) NOT NULL,
    PRIMARY KEY (media_id,locale),
    CONSTRAINT fk_cmt_media FOREIGN KEY (media_id) REFERENCES coach_media(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  await database.query(`CREATE TABLE IF NOT EXISTS coach_help_publications_i18n (
    locale VARCHAR(5) NOT NULL, payload LONGTEXT NOT NULL,
    published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (locale)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  await database.query(`INSERT INTO verbe_sens_translations (sens_id,locale,intitule,definition)
    SELECT id,'fr',intitule,definition FROM verbe_sens
    ON DUPLICATE KEY UPDATE intitule=VALUES(intitule),definition=VALUES(definition)`)
  await database.query(`INSERT INTO categories_semantiques_translations (categorie_id,locale,label)
    SELECT id,'fr',label FROM categories_semantiques ON DUPLICATE KEY UPDATE label=VALUES(label)`)
  await database.query(`INSERT INTO familles_conjugaison_translations (famille_id,locale,label,description)
    SELECT id,'fr',label,description FROM familles_conjugaison
    ON DUPLICATE KEY UPDATE label=VALUES(label),description=VALUES(description)`)
  await database.query(`INSERT INTO coach_character_translations
    (character_id,locale,masculine_name,pedagogical_style)
    SELECT id,'fr',masculine_name,pedagogical_style FROM coach_characters
    ON DUPLICATE KEY UPDATE masculine_name=VALUES(masculine_name),
      pedagogical_style=VALUES(pedagogical_style)`)
  await database.query(`INSERT INTO coach_reply_translations (reply_id,locale,content)
    SELECT id,'fr',content FROM coach_character_reply_templates ON DUPLICATE KEY UPDATE content=VALUES(content)`)
  await database.query(`INSERT INTO coach_help_template_translations (help_id,locale,name,description,header_description)
    SELECT id,'fr',name,description,header_description FROM coach_help_templates
    ON DUPLICATE KEY UPDATE name=VALUES(name),description=VALUES(description),header_description=VALUES(header_description)`)
  await database.query(`INSERT INTO coach_help_block_translations (block_id,locale,title,content)
    SELECT id,'fr',title,content FROM coach_help_blocks ON DUPLICATE KEY UPDATE title=VALUES(title),content=VALUES(content)`)
  await database.query(`INSERT INTO coach_media_translations (media_id,locale,name,alt_text)
    SELECT id,'fr',name,alt_text FROM coach_media ON DUPLICATE KEY UPDATE name=VALUES(name),alt_text=VALUES(alt_text)`)
  await database.query(`INSERT INTO coach_help_publications_i18n (locale,payload,published_at)
    SELECT 'fr',payload,published_at FROM coach_help_publications WHERE id=1
    ON DUPLICATE KEY UPDATE payload=VALUES(payload),published_at=VALUES(published_at)`)

  const [[summary]] = await database.query(`SELECT
    (SELECT COUNT(*) FROM modes WHERE code<>'') AS modes,
    (SELECT COUNT(*) FROM temps WHERE code<>'') AS tenses,
    (SELECT COUNT(*) FROM verbe_sens_translations WHERE locale='fr') AS meanings,
    (SELECT COUNT(*) FROM coach_reply_translations WHERE locale='fr') AS replies,
    (SELECT COUNT(*) FROM coach_help_block_translations WHERE locale='fr') AS helpBlocks`)
  console.table([summary])
} finally {
  await database.end()
}

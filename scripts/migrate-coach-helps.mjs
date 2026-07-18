import mysql from 'mysql2/promise'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

const templates = [
  {
    character: 'warm',
    name: 'Aide chaleureuse',
    description: 'Une aide rassurante qui accompagne l’élève sans lui donner la réponse.',
    intro: 'On va reprendre cette question tranquillement. Regarde chaque indice dans l’ordre : le verbe {verb}, puis le mode {mode} et le temps {tense}.',
  },
  {
    character: 'methodical',
    name: 'Aide méthodique',
    description: 'Une démarche structurée, précise et découpée en étapes.',
    intro: 'Procédons dans l’ordre : identifie le sujet {subject}, analyse le verbe {verb}, puis applique la règle du {tense} ({mode}).',
  },
  {
    character: 'dynamic',
    name: 'Aide dynamique',
    description: 'Des indications courtes et énergiques pour passer rapidement à l’action.',
    intro: 'À toi de jouer ! Repère le radical de {verb}, garde bien {mode} – {tense} en tête et construis la forme étape par étape.',
  },
  {
    character: 'calm',
    name: 'Aide calme',
    description: 'Une aide posée qui invite à observer avant de répondre.',
    intro: 'Prends le temps d’observer la question. Le sujet est {subject} et tu cherches la forme de {verb} au {tense} du {mode}.',
  },
]

const standardBlocks = [
  ['normal', 'Comprendre le verbe', '<p><strong>{verb}</strong> : {definition}</p>'],
  ['normal', 'Construire la forme', '<p>Repère le sujet, le mode et le temps demandés, puis construis la forme.</p>'],
  ['warning', 'À surveiller', '<p>Vérifie la personne et la terminaison avant de répondre.</p>'],
  ['normal', 'Ta méthode', '<ol><li>Repère le sujet.</li><li>Trouve le radical.</li><li>Ajoute la terminaison.</li></ol>'],
]

try {
  await database.query(`CREATE TABLE IF NOT EXISTS coach_help_templates (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500) NOT NULL DEFAULT '',
    header_title VARCHAR(300) NOT NULL DEFAULT '{helpTitle}',
    header_description TEXT NOT NULL,
    status ENUM('draft','published') NOT NULL DEFAULT 'draft',
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_coach_help_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  const [deletedColumns] = await database.query("SHOW COLUMNS FROM coach_help_templates LIKE 'deleted_at'")
  if (!deletedColumns.length) await database.query('ALTER TABLE coach_help_templates ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER status')
  const [headerTitleColumns] = await database.query("SHOW COLUMNS FROM coach_help_templates LIKE 'header_title'")
  if (!headerTitleColumns.length) await database.query("ALTER TABLE coach_help_templates ADD COLUMN header_title VARCHAR(300) NOT NULL DEFAULT '{helpTitle}' AFTER description")
  const [headerDescriptionColumns] = await database.query("SHOW COLUMNS FROM coach_help_templates LIKE 'header_description'")
  if (!headerDescriptionColumns.length) await database.query("ALTER TABLE coach_help_templates ADD COLUMN header_description TEXT NOT NULL AFTER header_title")

  await database.query(`CREATE TABLE IF NOT EXISTS coach_help_blocks (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    help_id INT UNSIGNED NOT NULL,
    block_type ENUM('normal','warning','danger') NOT NULL,
    title VARCHAR(160) NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    children_json LONGTEXT NULL,
    PRIMARY KEY (id),
    KEY idx_coach_help_block_order (help_id,sort_order,id),
    CONSTRAINT fk_coach_help_blocks_template FOREIGN KEY (help_id) REFERENCES coach_help_templates(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  const [legacyBlockRows] = await database.query(`SELECT COUNT(*) AS count FROM coach_help_blocks
    WHERE block_type IN ('intro','verb-summary','formation','warnings','method','custom','header')`)
  const migratesLegacyBlocks = Number(legacyBlockRows[0]?.count || 0) > 0
  if (migratesLegacyBlocks) {
    await database.query(`UPDATE coach_help_blocks SET content=CASE block_type
      WHEN 'verb-summary' THEN '<p><strong>{verb}</strong> : {definition}</p>'
      WHEN 'formation' THEN '<p>Construis la forme de <strong>{verb}</strong> au {tense} du {mode}, pour {subject}.</p>'
      WHEN 'warnings' THEN '<p>Vérifie la personne et la terminaison avant de répondre.</p>'
      WHEN 'method' THEN '<ol><li>Repère le sujet.</li><li>Trouve le radical.</li><li>Ajoute la terminaison.</li></ol>'
      ELSE content END
      WHERE content=''`)
  }
  await database.query(`ALTER TABLE coach_help_blocks MODIFY block_type
    ENUM('intro','verb-summary','formation','warnings','method','custom','normal','warning','danger','header') NOT NULL`)
  await database.query(`UPDATE coach_help_blocks SET block_type=CASE
    WHEN block_type='warnings' THEN 'warning'
    WHEN block_type IN ('intro','verb-summary','formation','method','custom','header') THEN 'normal'
    ELSE block_type END`)
  await database.query("ALTER TABLE coach_help_blocks MODIFY block_type ENUM('normal','warning','danger') NOT NULL")
  const [childrenColumns] = await database.query("SHOW COLUMNS FROM coach_help_blocks LIKE 'children_json'")
  if (!childrenColumns.length) await database.query('ALTER TABLE coach_help_blocks ADD COLUMN children_json LONGTEXT NULL AFTER sort_order')
  await database.query(`CREATE TABLE IF NOT EXISTS coach_help_publications (
    id TINYINT UNSIGNED NOT NULL,
    payload LONGTEXT NOT NULL,
    published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  const [columns] = await database.query("SHOW COLUMNS FROM coach_characters LIKE 'help_id'")
  if (!columns.length) {
    await database.query('ALTER TABLE coach_characters ADD COLUMN help_id INT UNSIGNED NULL AFTER pedagogical_style')
    await database.query('ALTER TABLE coach_characters ADD KEY idx_coach_character_help (help_id)')
    await database.query('ALTER TABLE coach_characters ADD CONSTRAINT fk_coach_character_help FOREIGN KEY (help_id) REFERENCES coach_help_templates(id) ON DELETE SET NULL')
  }
  const [publishedHelpColumns] = await database.query("SHOW COLUMNS FROM coach_characters LIKE 'published_help_id'")
  if (!publishedHelpColumns.length) {
    await database.query('ALTER TABLE coach_characters ADD COLUMN published_help_id INT UNSIGNED NULL AFTER help_id')
    await database.query('UPDATE coach_characters SET published_help_id=help_id')
    await database.query('ALTER TABLE coach_characters ADD KEY idx_coach_character_published_help (published_help_id)')
  }

  for (const template of templates) {
    const [existing] = await database.execute('SELECT id FROM coach_help_templates WHERE name=? LIMIT 1', [template.name])
    let helpId = existing[0]?.id
    if (!helpId) {
      const [result] = await database.execute(
        `INSERT INTO coach_help_templates
          (name,description,header_title,header_description,status) VALUES (?,?,'{helpTitle}','','published')`,
        [template.name, template.description],
      )
      helpId = result.insertId
      const blocks = [['normal', 'Le conseil de ton coach', template.intro], ...standardBlocks]
      for (const [index, block] of blocks.entries()) {
        await database.execute(`INSERT INTO coach_help_blocks
          (help_id,block_type,title,content,is_active,sort_order) VALUES (?,?,?,?,1,?)`,
        [helpId, block[0], block[1], block[2], index + 1])
      }
    }
    await database.execute('UPDATE coach_characters SET help_id=? WHERE slug=? AND help_id IS NULL', [helpId, template.character])
  }

  await database.query(`UPDATE coach_help_blocks b
    JOIN (SELECT help_id FROM coach_help_blocks GROUP BY help_id
      HAVING SUM(content='' AND title IN ('Comprendre le verbe','Construire la forme','À surveiller','Ta méthode')) >= 4) legacy
      ON legacy.help_id=b.help_id
    SET b.content=CASE b.title
      WHEN 'Comprendre le verbe' THEN '<p><strong>{verb}</strong> : {definition}</p>'
      WHEN 'Construire la forme' THEN '<p>Construis la forme de <strong>{verb}</strong> au {tense} du {mode}, pour {subject}.</p>'
      WHEN 'À surveiller' THEN '<p>Vérifie la personne et la terminaison avant de répondre.</p>'
      WHEN 'Ta méthode' THEN '<ol><li>Repère le sujet.</li><li>Trouve le radical.</li><li>Ajoute la terminaison.</li></ol>'
      ELSE b.content END
    WHERE b.content=''`)
  const [publication] = await database.query('SELECT id FROM coach_help_publications WHERE id=1')
  if (!publication.length) {
    const [publishedHelps] = await database.query(`SELECT id,name,description,header_title AS headerTitle,
      header_description AS headerDescription,status FROM coach_help_templates WHERE status='published' AND deleted_at IS NULL ORDER BY name,id`)
    const [publishedBlocks] = await database.query(`SELECT id,help_id AS helpId,block_type AS type,title,content,
      is_active AS isActive,sort_order AS sortOrder,children_json AS childrenJson FROM coach_help_blocks ORDER BY help_id,sort_order,id`)
    const payload = publishedHelps.map(help => ({
      ...help,
      blocks: publishedBlocks.filter(block => block.helpId === help.id).map(block => ({
        id: block.id,
        type: block.type,
        title: block.title,
        content: block.content,
        isActive: Boolean(block.isActive),
        sortOrder: block.sortOrder,
        children: block.childrenJson ? JSON.parse(block.childrenJson) : [],
      })),
    }))
    await database.execute(`INSERT INTO coach_help_publications (id,payload) VALUES (1,?)
      ON DUPLICATE KEY UPDATE payload=VALUES(payload),published_at=CURRENT_TIMESTAMP`, [JSON.stringify(payload)])
  }

  const [helps] = await database.query(`SELECT h.id,h.name,h.status,COUNT(DISTINCT b.id) AS blocks,
    COUNT(DISTINCT c.id) AS characters FROM coach_help_templates h
    LEFT JOIN coach_help_blocks b ON b.help_id=h.id
    LEFT JOIN coach_characters c ON c.help_id=h.id
    GROUP BY h.id,h.name,h.status ORDER BY h.name`)
  console.table(helps)
} finally {
  await database.end()
}

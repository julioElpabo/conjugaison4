import mysql from 'mysql2/promise'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

async function createHelp(character) {
  const [result] = await database.execute(
    `INSERT INTO coach_help_templates
      (name,description,header_title,header_description,status) VALUES (?,?,?,'','draft')`,
    [`Aide — ${character.masculineName}`.slice(0, 120), (character.description || '').slice(0, 500), '{helpTitle}'],
  )
  return result.insertId
}

async function cloneHelp(helpId, character) {
  const [result] = await database.execute(
    `INSERT INTO coach_help_templates (name,description,header_title,header_description,status)
     SELECT CONCAT(LEFT(name,100),' — ',LEFT(?,15)),description,header_title,header_description,'draft'
     FROM coach_help_templates WHERE id=? AND deleted_at IS NULL`,
    [character.masculineName, helpId],
  )
  if (!result.insertId) return createHelp(character)
  await database.execute(
    `INSERT INTO coach_help_blocks
      (help_id,block_type,title,content,explanation_approach,is_active,sort_order,children_json)
     SELECT ?,block_type,title,content,explanation_approach,is_active,sort_order,children_json
     FROM coach_help_blocks WHERE help_id=? ORDER BY sort_order,id`,
    [result.insertId, helpId],
  )
  return result.insertId
}

try {
  await database.beginTransaction()
  const [characters] = await database.query(`SELECT c.id,c.masculine_name AS masculineName,c.description,c.help_id AS helpId,
    h.id AS existingHelpId FROM coach_characters c
    LEFT JOIN coach_help_templates h ON h.id=c.help_id AND h.deleted_at IS NULL
    ORDER BY c.sort_order,c.id FOR UPDATE`)
  const claimed = new Set()
  for (const character of characters) {
    let helpId = Number(character.existingHelpId) || null
    if (!helpId) helpId = await createHelp(character)
    else if (claimed.has(helpId)) helpId = await cloneHelp(helpId, character)
    claimed.add(helpId)
    if (Number(character.helpId) !== helpId) {
      await database.execute('UPDATE coach_characters SET help_id=? WHERE id=?', [helpId, character.id])
    }
  }

  await database.query(`UPDATE coach_help_templates h
    LEFT JOIN coach_characters c ON c.help_id=h.id
    SET h.deleted_at=COALESCE(h.deleted_at,CURRENT_TIMESTAMP),h.status='draft'
    WHERE c.id IS NULL AND h.deleted_at IS NULL`)

  const [indexes] = await database.query("SHOW INDEX FROM coach_characters WHERE Key_name='uq_coach_character_help'")
  if (!indexes.length) await database.query('ALTER TABLE coach_characters ADD UNIQUE KEY uq_coach_character_help (help_id)')
  await database.commit()

  const [[audit]] = await database.query(`SELECT COUNT(*) AS characters,
    COUNT(DISTINCT help_id) AS distinctHelps,
    SUM(help_id IS NULL) AS withoutHelp FROM coach_characters`)
  const [[orphanAudit]] = await database.query(`SELECT COUNT(*) AS orphanHelps FROM coach_help_templates h
    LEFT JOIN coach_characters c ON c.help_id=h.id WHERE h.deleted_at IS NULL AND c.id IS NULL`)
  console.log(`Relation caractère–aide : ${audit.characters} caractères, ${audit.distinctHelps} aides distinctes, ${audit.withoutHelp} sans aide.`)
  console.log(`Aides historiques sans caractère : ${orphanAudit.orphanHelps}.`)
} catch (error) {
  await database.rollback()
  throw error
} finally {
  await database.end()
}

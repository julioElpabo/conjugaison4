import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import mysql from 'mysql2/promise'

const databaseConfigured = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)
const config = {
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), database: process.env.DB_NAME,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD,
}

describe('catalogue administrable des coaches', { skip: !databaseConfigured }, () => {
  it('possède douze coaches publiés, six femmes et six hommes', async () => {
    const db = await mysql.createConnection(config)
    try {
      const [rows] = await db.execute(`SELECT c.id, c.first_name, c.gender, c.avatar_path,
        cc.id AS character_id, cc.name AS personality, COUNT(DISTINCT r.id) AS replies
        FROM coaches c JOIN coach_characters cc ON cc.id=c.character_id
        LEFT JOIN coach_character_reply_templates r ON r.character_id=cc.id AND r.is_active=1
        WHERE c.status='published' AND cc.status='published' GROUP BY c.id,cc.id ORDER BY c.sort_order`)
      assert.equal(rows.length, 12)
      assert.equal(rows.filter(row => row.gender === 'female').length, 6)
      assert.equal(rows.filter(row => row.gender === 'male').length, 6)
      for (const personality of ['Chaleureux', 'Méthodique', 'Dynamique', 'Calme']) {
        const matching = rows.filter(row => row.personality === personality)
        assert.equal(matching.length, 3)
        assert.equal(new Set(matching.map(row => row.character_id)).size, 1)
      }
      for (const row of rows) {
        assert.ok(row.first_name)
        assert.match(row.avatar_path, /^\/coach-media\/avatars\//u)
        assert.ok(Number(row.replies) >= 13)
      }
    } finally { await db.end() }
  })

  it('partage les répliques, médias et fréquences au niveau du caractère', async () => {
    const db = await mysql.createConnection(config)
    try {
      const [[counts]] = await db.execute(`SELECT
        (SELECT COUNT(*) FROM coach_characters WHERE status='published') AS characters,
        (SELECT COUNT(*) FROM coach_character_reply_templates) AS replies,
        (SELECT COUNT(*) FROM coach_character_media_assignments) AS assignments,
        (SELECT COUNT(*) FROM coach_character_reaction_rules) AS rules,
        (SELECT COUNT(*) FROM coaches WHERE character_id IS NULL) AS coaches_without_character`)
      assert.equal(Number(counts.characters), 4)
      assert.ok(Number(counts.replies) >= 52)
      assert.ok(Number(counts.assignments) >= 12)
      assert.ok(Number(counts.rules) >= 16)
      assert.equal(Number(counts.coaches_without_character), 0)
    } finally { await db.end() }
  })

  it('offre au moins cinq relances et corrections variées par caractère', async () => {
    const db = await mysql.createConnection(config)
    try {
      const [rows] = await db.execute(`SELECT character_id,event_type,COUNT(*) AS total
        FROM coach_character_reply_templates WHERE is_active=1 AND event_type IN ('question','correct','incorrect')
        GROUP BY character_id,event_type`)
      const [[legacy]] = await db.execute(`SELECT COUNT(*) AS total FROM coach_character_reply_templates
        WHERE is_active=1 AND content='Applique maintenant la méthode.'`)
      assert.equal(rows.length, 12)
      for (const row of rows) assert.ok(Number(row.total) >= 5, `${row.character_id}/${row.event_type}`)
      assert.equal(Number(legacy.total), 0)
    } finally { await db.end() }
  })

  it('active par défaut tous les GIF et émojis pour chaque caractère', async () => {
    const db = await mysql.createConnection(config)
    try {
      const [[catalogue]] = await db.execute(`SELECT COUNT(*) AS total FROM coach_media
        WHERE is_active=1 AND media_type IN ('animation','emoji')`)
      const [rows] = await db.execute(`SELECT cc.id,COUNT(DISTINCT m.id) AS total
        FROM coach_characters cc
        LEFT JOIN coach_character_media_assignments a ON a.character_id=cc.id AND a.is_active=1
        LEFT JOIN coach_media m ON m.id=a.media_id AND m.is_active=1 AND m.media_type IN ('animation','emoji')
        WHERE cc.status='published' GROUP BY cc.id`)
      assert.equal(rows.length, 4)
      for (const row of rows) assert.equal(Number(row.total), Number(catalogue.total), `caractère ${row.id}`)
    } finally { await db.end() }
  })

  it('importe les animations en attente de validation et les émojis approuvés', async () => {
    const db = await mysql.createConnection(config)
    try {
      const [[counts]] = await db.execute(`SELECT
        SUM(media_type='animation') AS animations,
        SUM(media_type='animation' AND rights_status='verified' AND safety_status='approved') AS approved_animations,
        SUM(media_type='emoji' AND rights_status='verified' AND safety_status='approved') AS approved_emojis
        FROM coach_media`)
      assert.equal(Number(counts.animations), 199)
      assert.equal(Number(counts.approved_animations), 8)
      assert.equal(Number(counts.approved_emojis), 28)
    } finally { await db.end() }
  })

  it('n’attribue que des médias existants grâce aux clés étrangères', async () => {
    const db = await mysql.createConnection(config)
    try {
      const [[row]] = await db.execute(`SELECT COUNT(*) AS orphans FROM coach_media_assignments a
        LEFT JOIN coaches c ON c.id=a.coach_id LEFT JOIN coach_media m ON m.id=a.media_id
        WHERE c.id IS NULL OR m.id IS NULL`)
      assert.equal(Number(row.orphans), 0)
    } finally { await db.end() }
  })
})

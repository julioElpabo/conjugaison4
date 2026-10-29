import assert from 'node:assert/strict'
import { test } from 'node:test'
import mysql from 'mysql2/promise'
import { repairMissingDeAccents } from '../server/services/mail-request-repairs.ts'

const configured = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER)
test('accents réparés sur tout le catalogue canonique, variantes et identifiants préservés', { skip: !configured }, async (t) => {
  const database = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD })
  try {
    const [aliases] = await database.query('SELECT infinitif,forme_canonique FROM verbes WHERE BINARY infinitif<>BINARY forme_canonique AND est_archive=0')
    assert.deepEqual(aliases, [])
    const [verbs] = await database.query("SELECT id,infinitif FROM verbes WHERE infinitif IN ('célébrer','caractériser','contrôler') ORDER BY id")
    assert.equal(verbs.length, 3)
    const [rows] = await database.query(`
      SELECT v.infinitif,vc.conjugaison1,vc.conjugaison2,vc.conjugaison3,vc.verbe_infinitif,
             m.name AS mode,t.name AS tense,p.pronom
      FROM verbesconjugues vc JOIN verbes v ON v.id=vc.verbe_id
      JOIN temps t ON t.id=vc.temp_id JOIN modes m ON m.id=t.mode_id JOIN personnes p ON p.id=vc.personne_id
      WHERE v.infinitif IN ('célébrer','caractériser','contrôler') AND vc.conjugaison1<>''
    `)
    assert.ok(rows.length > 200)
    for (const row of rows) {
      assert.equal(row.verbe_infinitif, row.infinitif)
      for (const key of ['conjugaison1', 'conjugaison2', 'conjugaison3']) assert.doesNotMatch(row[key] || '', /celebr|caracteris|control/iu)
    }
    const form = (mode, tense, pronoun) => rows.find(row => row.infinitif === 'célébrer' && row.mode === mode && row.tense === tense && row.pronom === pronoun)
    assert.equal(form('indicatif', 'présent', 'je').conjugaison1, 'célèbre')
    assert.equal(form('indicatif', 'présent', 'nous').conjugaison1, 'célébrons')
    assert.equal(form('indicatif', 'imparfait', 'je').conjugaison1, 'célébrais')
    assert.equal(form('indicatif', 'passé composé', 'je').conjugaison1, 'ai célébré')
    const future = form('indicatif', 'futur', 'je')
    assert.ok([future.conjugaison1, future.conjugaison2, future.conjugaison3].includes('célébrerai'))
    assert.ok([future.conjugaison1, future.conjugaison2, future.conjugaison3].includes('célèbrerai'))
    await database.beginTransaction()
    const secondRead = await repairMissingDeAccents(database, false)
    await database.rollback()
    assert.deepEqual(Object.values(secondRead), [0, 0, 0, 0, 0])
    const [after] = await database.query("SELECT id,infinitif FROM verbes WHERE infinitif IN ('célébrer','caractériser','contrôler') ORDER BY id")
    assert.deepEqual(after, verbs)
    t.diagnostic(`${rows.length} conjugaisons vérifiées, variantes du futur et identifiants préservés ; seconde lecture sans réparation restante.`)
  } finally { await database.end() }
})

import assert from 'node:assert/strict'
import { test } from 'node:test'
import mysql from 'mysql2/promise'
import { ensureSavedChallengeMetadata, initializeSavedChallengeMetadata, parseSavedChallengeMetadata, updateSavedChallengeMetadata } from '../server/services/saved-challenge-metadata.ts'

test('attend une migration unique pour les requêtes concurrentes et retente après un échec', async () => {
  let fail = true
  const calls = []
  const database = { async query(sql) {
    calls.push(sql)
    if (fail) throw new Error('Table pas encore disponible')
    return [[]]
  } }
  await assert.rejects(ensureSavedChallengeMetadata(database), /pas encore disponible/)
  fail = false
  await Promise.all([ensureSavedChallengeMetadata(database), ensureSavedChallengeMetadata(database)])
  assert.equal(calls.filter(sql => sql.startsWith('ALTER')).length, 1)
  const count = calls.length
  await ensureSavedChallengeMetadata(database)
  assert.equal(calls.length, count)
})

test('une modification attend les colonnes même sans migration au démarrage', async () => {
  let ready = false
  const database = {
    async query(sql) { if (sql.startsWith('ALTER')) ready = true; return [[]] },
    async execute() { assert.equal(ready, true); return [{ affectedRows: 1 }] },
  }
  assert.equal(await updateSavedChallengeMetadata(database, 1, 'AB-CD-EF-23', { title: 'Titre', description: '' }), true)
})

test('valide le titre et la description sans permettre de modifier un compte ou les exercices', () => {
  assert.deepEqual(parseSavedChallengeMetadata({ title: ' Révisions ', description: ' ' }), { title: 'Révisions', description: '' })
  assert.deepEqual(parseSavedChallengeMetadata({ title: 'A'.repeat(80), description: 'B'.repeat(1000) }), { title: 'A'.repeat(80), description: 'B'.repeat(1000) })
  for (const body of [null, [], {}, { title: '', description: '' }, { title: 'A'.repeat(81), description: '' },
    { title: 'Titre', description: 'B'.repeat(1001) }, { title: 'Titre', description: 1 },
    { title: 'Titre', description: '', accountId: 2 }, { title: 'Titre', description: '', verbIds: [1] }]) {
    assert.throws(() => parseSavedChallengeMetadata(body))
  }
})

const socketPath = process.env.DEFIS_CLEANUP_TEST_SOCKET
test('MySQL : conserve les cartes existantes et isole les modifications par compte', { skip: !socketPath }, async () => {
  assert.match(socketPath, /^\/(?:private\/)?tmp\/defis-cleanup-mysql\.[\w]+\/mysql\.sock$/)
  const database = mysql.createPool({ socketPath, user: 'root', connectionLimit: 1, dateStrings: true, charset: 'utf8mb4' })
  const schema = `codex_saved_metadata_${process.pid}`
  let created = false
  try {
    await database.query(`CREATE DATABASE ${schema} CHARACTER SET utf8mb4`)
    created = true
    await database.query(`USE ${schema}`)
    await database.query('CREATE TABLE defis (id INT PRIMARY KEY, name VARCHAR(11), defi TEXT)')
    await database.query(`CREATE TABLE learner_saved_challenges (account_id INT, defi_id INT, saved_at DATETIME,
      PRIMARY KEY (account_id, defi_id))`)
    await database.execute('INSERT INTO defis VALUES (1, ?, ?)', ['AB-CD-EF-23', '{"title":"Original","description":"Consigne"}'])
    await database.query("INSERT INTO learner_saved_challenges VALUES (1,1,'2026-08-01'), (2,1,'2026-08-02')")
    assert.equal(await initializeSavedChallengeMetadata(database), true)
    assert.equal(await initializeSavedChallengeMetadata(database), false)
    const metadata = { title: 'Mes révisions', description: '' }
    assert.equal(await updateSavedChallengeMetadata(database, 3, 'AB-CD-EF-23', metadata), false)
    assert.equal(await updateSavedChallengeMetadata(database, 1, 'ZZ-ZZ-ZZ-23', metadata), false)
    assert.equal(await updateSavedChallengeMetadata(database, 1, 'AB-CD-EF-23', metadata), true)
    assert.equal(await updateSavedChallengeMetadata(database, 1, 'AB-CD-EF-23', metadata), true, 'réenregistrer les mêmes valeurs réussit')
    const [rows] = await database.query('SELECT * FROM learner_saved_challenges ORDER BY account_id')
    assert.equal(rows[0].custom_title, 'Mes révisions')
    assert.equal(rows[0].custom_description, '', 'permet de retirer la description')
    assert.equal(rows[0].saved_at, '2026-08-01 00:00:00', 'la carte garde sa place chronologique')
    assert.equal(rows[1].custom_title, null)
    assert.equal(rows[1].custom_description, null)
    assert.equal(await initializeSavedChallengeMetadata(database), false)
    const [[original]] = await database.query('SELECT defi FROM defis WHERE id=1')
    assert.equal(JSON.parse(original.defi).title, 'Original')
  } finally {
    if (created) await database.query(`DROP DATABASE ${schema}`)
    await database.end()
  }
})

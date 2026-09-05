import assert from 'node:assert/strict'
import { test } from 'node:test'
import mysql from 'mysql2/promise'
import { initializeDefisUsage, previewDefisCleanup, deleteInactiveDefis, parseCleanupRequest } from '../server/services/defis-cleanup.ts'

test('le nettoyage exige une confirmation explicite et une date structurée', () => {
  const cutoff = '2021-09-05 12:00:00'
  assert.deepEqual(parseCleanupRequest({ confirm: true, cutoff }), { cutoff })
  for (const value of [null, {}, { cutoff }, { confirm: 'true', cutoff },
    { confirm: true, cutoff: '2021-99-99 00:00:00' },
    { confirm: true, cutoff: "2021-01-01'; DELETE FROM defis; --" }]) {
    assert.throws(() => parseCleanupRequest(value), /Confirmation invalide/)
  }
})

// Serveur MySQL de test isolé uniquement ; ne charge pas la configuration du site.
const socketPath = process.env.DEFIS_CLEANUP_TEST_SOCKET
test('MySQL : migration, seuil de cinq ans et protection des défis réutilisés ou permanents', {
  skip: !socketPath,
}, async () => {
  assert.match(socketPath, /^\/(?:private\/)?tmp\/defis-cleanup-mysql\.[\w]+\/mysql\.sock$/)
  const database = mysql.createPool({ socketPath, user: 'root', connectionLimit: 1, dateStrings: true })
  const schema = `codex_defis_cleanup_${process.pid}`
  let created = false
  try {
    await database.query(`CREATE DATABASE ${schema}`)
    created = true
    await database.query(`USE ${schema}`)
    await database.query("SET timestamp = UNIX_TIMESTAMP('2026-09-05 12:00:00')")
    await database.query(`CREATE TABLE defis (
      id INT PRIMARY KEY, isANePasEffacer TINYINT NOT NULL DEFAULT 0,
      created DATETIME NOT NULL, expires_at DATETIME NULL
    ) ENGINE=InnoDB`)
    await database.query("INSERT INTO defis (id, created, expires_at) VALUES (1, '2020-09-27', '2021-03-27')")
    assert.equal(await initializeDefisUsage(database), true)
    assert.equal((await previewDefisCleanup(database)).count, 0, 'un ancien défi sans historique est protégé')
    const [initial] = await database.query('SELECT last_used_at FROM defis WHERE id=1')
    assert.ok(initial[0].last_used_at)

    await database.query("UPDATE defis SET last_used_at = DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 6 YEAR) WHERE id=1")
    assert.equal(await initializeDefisUsage(database), false)
    assert.equal((await previewDefisCleanup(database)).count, 1, 'un redémarrage ne réinitialise pas le suivi')

    const { cutoff } = await previewDefisCleanup(database)
    await database.execute(`INSERT INTO defis (id, created, isANePasEffacer, last_used_at) VALUES
      (2, '2020-01-01', 1, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 6 YEAR)),
      (3, '2020-01-01', 0, CURRENT_TIMESTAMP),
      (4, '2020-01-01', 0, ?),
      (5, '2020-01-01', 0, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 6 YEAR)),
      (6, '2020-01-01', 0, DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 6 YEAR))`, [cutoff])
    await database.query('CREATE TABLE saved (defi_id INT PRIMARY KEY, FOREIGN KEY (defi_id) REFERENCES defis(id) ON DELETE CASCADE) ENGINE=InnoDB')
    await database.query('INSERT INTO saved VALUES (1), (3)')
    assert.equal((await previewDefisCleanup(database)).count, 3)
    await database.query('UPDATE defis SET last_used_at=CURRENT_TIMESTAMP WHERE id=5')
    await database.query('UPDATE defis SET isANePasEffacer=1 WHERE id=6')

    assert.deepEqual(await deleteInactiveDefis(database, cutoff), { deletedCount: 1 })
    const [remaining] = await database.query('SELECT id FROM defis ORDER BY id')
    assert.deepEqual(remaining.map(row => row.id), [2, 3, 4, 5, 6])
    const [saved] = await database.query('SELECT defi_id FROM saved')
    assert.deepEqual(saved.map(row => row.defi_id), [3])
    assert.deepEqual(await deleteInactiveDefis(database, cutoff), { deletedCount: 0 }, 'répéter la confirmation est sans effet')

    await database.query('UPDATE defis SET last_used_at=CURRENT_TIMESTAMP WHERE id=4')
    assert.deepEqual(await deleteInactiveDefis(database, '2099-01-01 00:00:00'), { deletedCount: 0 }, 'une date falsifiée ne permet pas de supprimer les défis récents')
  } finally {
    if (created) await database.query(`DROP DATABASE ${schema}`)
    await database.end()
  }
})

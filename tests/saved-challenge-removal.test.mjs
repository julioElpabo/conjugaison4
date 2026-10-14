import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Readable } from 'node:stream'
import { ref } from 'vue'
import mysql from 'mysql2/promise'
import { parseSavedChallengeRemoval, removeSavedChallenges } from '../server/services/saved-challenge-removal.ts'
import { useSavedChallengeRemoval } from '../app/composables/useSavedChallengeRemoval.ts'
import { savedChallengeRemovalCopy } from '../shared/i18n/saved-challenge-removal.ts'
import { SUPPORTED_LOCALES } from '../shared/i18n/locales.ts'

const first = { code: 'AB-CD-EF-23', title: 'Présent' }
const second = { code: 'GH-KL-MN-45', title: 'Imparfait' }
const third = { code: 'PQ-RS-TU-67', title: 'Futur' }

test('normalise et déduplique les codes ; refuse une sélection vide ou une cible de compte fournie', () => {
  assert.deepEqual(parseSavedChallengeRemoval({ codes: [' ab-cd-ef-23 ', first.code, second.code] }), [first.code, second.code])
  for (const body of [null, [], {}, { codes: [] }, { codes: first.code }, { codes: [1] },
    { codes: [first.code, 'invalide'] }, { codes: [first.code], accountId: 2 },
    { codes: ["AB-CD-EF-23'); DELETE FROM defis; --"] }]) {
    assert.throws(() => parseSavedChallengeRemoval(body))
  }
})

test('le retrait individuel attend la confirmation et ne retire que la carte demandée', async (t) => {
  const calls = []
  t.mock.method(globalThis, '$fetch', async (url, options) => { calls.push({ url, ...options }) })
  const cards = ref([{ ...first }, { ...second }])
  const removal = useSavedChallengeRemoval(cards, false)
  removal.requestRemoval([first])
  assert.equal(calls.length, 0)
  assert.equal(cards.value.length, 2)
  removal.cancel()
  assert.equal(await removal.confirm(), false)
  removal.requestRemoval([first])
  assert.equal(await removal.confirm(), true)
  assert.deepEqual(calls, [{ url: '/api/learner/saved-challenges', method: 'DELETE', credentials: 'same-origin', body: { codes: [first.code] } }])
  assert.deepEqual(cards.value.map(item => item.code), [second.code])
  assert.equal(removal.removedCount.value, 1)
  assert.deepEqual(removal.targets.value, [])
})

test('sélection multiple, tout sélectionner et désélectionner ; conserve les cartes non sélectionnées', async (t) => {
  const calls = []
  t.mock.method(globalThis, '$fetch', async (_url, options) => { calls.push(options.body.codes) })
  const cards = ref([{ ...first }, { ...second }, { ...third }])
  const removal = useSavedChallengeRemoval(cards, false)
  removal.toggleSelecting()
  removal.toggleAll()
  assert.equal(removal.allSelected.value, true)
  removal.toggleAll()
  assert.equal(removal.selected.value.length, 0)
  removal.toggle(first.code)
  removal.toggle(third.code)
  removal.requestRemoval(removal.selected.value)
  assert.equal(await removal.confirm(), true)
  assert.deepEqual(calls, [[first.code, third.code]])
  assert.deepEqual(cards.value.map(item => item.code), [second.code])
  assert.equal(removal.selected.value.length, 0)
  assert.equal(removal.removedCount.value, 2)
  removal.toggleAll()
  removal.requestRemoval(removal.selected.value)
  await removal.confirm()
  assert.equal(cards.value.length, 0)
  assert.equal(removal.selecting.value, false)
})

test('un échec conserve les cartes et la sélection ; la confirmation peut être retentée', async (t) => {
  let fail = true
  t.mock.method(globalThis, '$fetch', async () => { if (fail) throw new Error('Réseau indisponible') })
  const cards = ref([{ ...first }, { ...second }])
  const removal = useSavedChallengeRemoval(cards, false)
  removal.toggleSelecting()
  removal.toggleAll()
  removal.requestRemoval(removal.selected.value)
  assert.equal(await removal.confirm(), false)
  assert.equal(removal.failed.value, true)
  assert.equal(removal.pending.value, false)
  assert.equal(cards.value.length, 2)
  assert.equal(removal.selected.value.length, 2)
  assert.equal(removal.targets.value.length, 2)
  fail = false
  assert.equal(await removal.confirm(), true)
  assert.equal(cards.value.length, 0)
  assert.equal(removal.failed.value, false)
})

test('bloque les doubles envois, la fermeture et les changements de sélection pendant le retrait', async (t) => {
  let resolve
  let calls = 0
  t.mock.method(globalThis, '$fetch', () => { calls++; return new Promise(done => { resolve = done }) })
  const cards = ref([{ ...first }])
  const removal = useSavedChallengeRemoval(cards, false)
  removal.toggleSelecting()
  removal.toggleAll()
  removal.requestRemoval(removal.selected.value)
  const result = removal.confirm()
  assert.equal(removal.pending.value, true)
  assert.equal(await removal.confirm(), false)
  removal.cancel()
  removal.toggleSelecting()
  removal.toggleAll()
  removal.toggle(first.code)
  removal.requestRemoval([])
  assert.equal(calls, 1)
  assert.equal(cards.value.length, 1)
  assert.equal(removal.targets.value.length, 1)
  assert.equal(removal.selected.value.length, 1)
  resolve()
  assert.equal(await result, true)
})

test('le mode lecture seule bloque aussi une confirmation déjà ouverte', async (t) => {
  t.mock.method(globalThis, '$fetch', async () => assert.fail('Aucune écriture en lecture seule'))
  const cards = ref([{ ...first }])
  const readOnly = ref(true)
  const removal = useSavedChallengeRemoval(cards, readOnly)
  removal.toggleSelecting()
  removal.toggleAll()
  removal.requestRemoval([first])
  assert.equal(removal.selecting.value, false)
  assert.equal(removal.targets.value.length, 0)
  assert.equal(await removal.confirm(), false)
  readOnly.value = false
  removal.requestRemoval([first])
  readOnly.value = true
  assert.equal(await removal.confirm(), false)
  assert.equal(cards.value.length, 1)
})

test('les messages de retrait sont disponibles dans chaque langue, au singulier et au pluriel', () => {
  for (const locale of SUPPORTED_LOCALES) {
    const copy = savedChallengeRemovalCopy(locale)
    assert.ok(copy.removeOne && copy.scope && copy.error)
    assert.match(copy.confirmTitle(3), /3/)
    assert.match(copy.removed(3), /3/)
    assert.notEqual(copy.confirmTitle(1), copy.confirmTitle(3))
  }
})

// Les tests du composable remplacent uniquement le transport HTTP.
globalThis.$fetch ??= async () => { throw new Error('Transport non simulé') }

test('API : exige une session et utilise son compte même si la requête désigne un autre utilisateur', async (t) => {
  const writes = []
  let authenticated = false
  const globals = {
    defineEventHandler: handler => handler,
    setResponseHeader: () => {},
    createError: details => Object.assign(new Error(details.statusMessage), details),
    getCookie: () => authenticated ? 'x'.repeat(43) : undefined,
    getHeader: (_event, name) => name === 'content-type' ? 'application/json' : undefined,
    useDatabase: () => ({ async execute(sql, params) {
      if (sql.includes('FROM learner_sessions s')) return [[{ sessionId: 1, accountId: 7, username: 'Test', status: 'active', sessionVersion: 1 }]]
      if (sql.includes('UPDATE learner_sessions')) return [{ affectedRows: 1 }]
      writes.push({ sql, params })
      return [{ affectedRows: 1 }]
    } }),
  }
  for (const [name, value] of Object.entries(globals)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, name, previous)
      else delete globalThis[name]
    })
  }
  const { default: handler } = await import('../server/api/learner/saved-challenges.delete.ts')
  const event = body => ({ path: '/api/learner/saved-challenges?adminLearnerId=99', node: { req: Readable.from([Buffer.from(JSON.stringify(body))]) } })
  await assert.rejects(handler(event({ codes: [first.code] })), { statusCode: 401 })
  assert.equal(writes.length, 0)
  authenticated = true
  await assert.rejects(handler(event({ codes: [first.code], accountId: 99 })), { statusCode: 400 })
  await assert.rejects(handler(event({ codes: [first.code, 'invalide'] })), { statusCode: 400 })
  assert.equal(writes.length, 0)
  assert.deepEqual(await handler(event({ codes: [first.code] })), { codes: [first.code], removedCount: 1 })
  assert.equal(writes.length, 1)
  assert.deepEqual(writes[0].params, [7, first.code])
})

const socketPath = process.env.DEFIS_CLEANUP_TEST_SOCKET
test('MySQL : retire seulement les associations du compte, conserve les défis, les autres comptes et les résultats', { skip: !socketPath }, async () => {
  assert.match(socketPath, /^\/(?:private\/)?tmp\/defis-cleanup-mysql\.[\w]+\/mysql\.sock$/)
  const database = mysql.createPool({ socketPath, user: 'root', connectionLimit: 1 })
  const schema = `codex_saved_removal_${process.pid}`
  let created = false
  try {
    await database.query(`CREATE DATABASE ${schema} CHARACTER SET utf8mb4`)
    created = true
    await database.query(`USE ${schema}`)
    await database.query('CREATE TABLE defis (id INT PRIMARY KEY, name VARCHAR(11), defi TEXT) ENGINE=InnoDB')
    await database.query(`CREATE TABLE learner_saved_challenges (account_id INT, defi_id INT,
      PRIMARY KEY (account_id, defi_id), FOREIGN KEY (defi_id) REFERENCES defis(id) ON DELETE CASCADE) ENGINE=InnoDB`)
    await database.query(`CREATE TABLE learner_challenge_runs (id INT PRIMARY KEY, account_id INT, defi_id INT, score INT,
      FOREIGN KEY (defi_id) REFERENCES defis(id) ON DELETE CASCADE) ENGINE=InnoDB`)
    for (const [index, item] of [first, second, third].entries()) {
      await database.execute('INSERT INTO defis VALUES (?, ?, ?)', [index + 1, item.code, '{"title":"Partagé"}'])
    }
    await database.query('INSERT INTO learner_saved_challenges VALUES (1,1), (1,2), (1,3), (2,1), (2,2)')
    await database.query('INSERT INTO learner_challenge_runs VALUES (1,1,1,100), (2,2,1,80)')
    assert.equal(await removeSavedChallenges(database, 3, [first.code]), 0)
    assert.equal(await removeSavedChallenges(database, 1, [first.code, second.code]), 2)
    assert.equal(await removeSavedChallenges(database, 1, [first.code, second.code]), 0, 'nouvelle tentative idempotente')
    const [saved] = await database.query('SELECT * FROM learner_saved_challenges ORDER BY account_id, defi_id')
    assert.deepEqual(saved.map(row => [row.account_id, row.defi_id]), [[1,3], [2,1], [2,2]])
    const [defis] = await database.query('SELECT name, defi FROM defis ORDER BY id')
    assert.deepEqual(defis.map(row => row.name), [first.code, second.code, third.code])
    assert.ok(defis.every(row => row.defi === '{"title":"Partagé"}'))
    const [runs] = await database.query('SELECT score FROM learner_challenge_runs ORDER BY id')
    assert.deepEqual(runs.map(row => row.score), [100,80])
  } finally {
    if (created) await database.query(`DROP DATABASE ${schema}`)
    await database.end()
  }
})

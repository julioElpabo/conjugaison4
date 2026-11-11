import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { tsImport } from 'tsx/esm/api'
import { computed, ref } from 'vue'
import mysql from 'mysql2/promise'
import {
  ensureSavedChallengeFolders, initializeSavedChallengeFolders,
  parseChallengeFolderName, parseChallengeFolderId, parseSavedChallengeMove,
  listSavedChallengeFolders, saveChallengeFolder, deleteChallengeFolder, moveSavedChallenges, parseChallengeFolderPatch, updateChallengeFolder, parseChallengeFolderCreation,
} from '../server/services/saved-challenge-folders.ts'
import { filterSavedChallenges } from '../shared/utils/saved-challenge-folders.ts'
import { savedChallengeFoldersCopy } from '../shared/i18n/saved-challenge-folders.ts'
import { SUPPORTED_LOCALES } from '../shared/i18n/locales.ts'
import { SAVED_CHALLENGE_FOLDER_COLORS, savedChallengeFolderColor, savedChallengeFolderColorStyle } from '../shared/utils/saved-challenge-folder-colors.ts'
import { useSavedChallengeRemoval } from '../app/composables/useSavedChallengeRemoval.ts'
const { useSavedChallengeFolders } = await tsImport('../app/composables/useSavedChallengeFolders.ts', {
  parentURL: import.meta.url,
  tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
})

const first = { code: 'AB-CD-EF-23', title: 'Présent', folderId: null, savedAt: '2026-08-01' }
const second = { code: 'GH-KL-MN-45', title: 'Imparfait', folderId: 2, savedAt: '2026-08-02' }
const third = { code: 'PQ-RS-TU-67', title: 'Futur', folderId: 2, savedAt: '2026-08-03' }

test('valide les noms et les déplacements, sans accepter de compte ou de champ supplémentaire', () => {
  assert.equal(parseChallengeFolderName({ name: ' Classe 1A ' }), 'Classe 1A')
  assert.equal(parseChallengeFolderName({ name: 'A'.repeat(80) }).length, 80)
  for (const value of [null, [], {}, { name: '' }, { name: ' ' }, { name: 'A'.repeat(81) },
    { name: 'Classe\n1A' }, { name: 'Classe', accountId: 2 }, { name: 12 }]) {
    assert.throws(() => parseChallengeFolderName(value))
  }
  for (const value of [null, undefined, '1', 0, -1, 1.2, Number.MAX_SAFE_INTEGER + 1, Infinity, NaN]) {
    assert.throws(() => parseChallengeFolderId(value))
  }
  assert.deepEqual(parseSavedChallengeMove({ codes: [first.code.toLowerCase(), first.code], folderId: 2 }), { codes: [first.code], folderId: 2 })
  assert.deepEqual(parseSavedChallengeMove({ codes: [first.code], folderId: null }), { codes: [first.code], folderId: null })
  for (const value of [null, [], {}, { codes: [], folderId: 2 }, { codes: [first.code] },
    { codes: ['invalide'], folderId: 2 }, { codes: [first.code], folderId: '2' },
    { codes: [first.code], folderId: 2, accountId: 99 }]) {
    assert.throws(() => parseSavedChallengeMove(value))
  }
})

test('filtre et sélectionne uniquement les défis du dossier affiché', () => {
  const cards = ref([{ ...first }, { ...second }, { ...third }])
  const filter = ref(2)
  const visible = computed(() => filterSavedChallenges(cards.value, filter.value))
  const removal = useSavedChallengeRemoval(cards, false, visible)
  assert.equal(filterSavedChallenges(cards.value, 'all').length, 3)
  assert.deepEqual(filterSavedChallenges(cards.value, 'unfiled').map(item => item.code), [first.code])
  removal.toggleSelecting()
  removal.toggleAll()
  assert.deepEqual(removal.selectedCodes.value, [second.code, third.code])
  assert.equal(removal.allSelected.value, true)
  removal.toggle(first.code)
  assert.deepEqual(removal.selectedCodes.value, [second.code, third.code], 'une carte masquée ne peut pas être sélectionnée')
  filter.value = 'unfiled'
  assert.equal(removal.selected.value.length, 0, 'la sélection ne doit jamais inclure les cartes masquées')
  assert.equal(removal.allSelected.value, false)
})

test('limite les couleurs à la palette prédéfinie et valide les modifications partielles', () => {
  assert.equal(SAVED_CHALLENGE_FOLDER_COLORS.length, 12)
  assert.equal(new Set(SAVED_CHALLENGE_FOLDER_COLORS.map(color => color.id)).size, 12)
  for (const color of SAVED_CHALLENGE_FOLDER_COLORS) {
    assert.deepEqual(parseChallengeFolderPatch({ color: color.id }), { color: color.id })
    assert.equal(savedChallengeFolderColor(color.id), color.id)
    assert.equal(savedChallengeFolderColorStyle(color.id)['--folder-color-dark'], color.dark)
  }
  assert.deepEqual(parseChallengeFolderPatch({ name: ' Classe A ', color: 'blue' }), { name: 'Classe A', color: 'blue' })
  assert.deepEqual(parseChallengeFolderPatch({ name: 'Classe A' }), { name: 'Classe A' })
  assert.equal(savedChallengeFolderColor(undefined), 'violet')
  for (const body of [null, [], {}, { color: 'arbitrary' }, { color: '#ff0000' }, { color: null },
    { color: 'red; background: url(x)' }, { color: 'red', accountId: 2 }, { name: '', color: 'blue' }]) {
    assert.throws(() => parseChallengeFolderPatch(body))
  }
})

test('la création valide le nom et la couleur dans la même requête, avec le violet par défaut', () => {
  assert.deepEqual(parseChallengeFolderCreation({ name: ' Classe A ' }), { name: 'Classe A', color: 'violet' })
  for (const color of SAVED_CHALLENGE_FOLDER_COLORS) {
    assert.deepEqual(parseChallengeFolderCreation({ name: 'Classe A', color: color.id }), { name: 'Classe A', color: color.id })
  }
  for (const body of [null, [], {}, { color: 'blue' }, { name: '' }, { name: 'Classe A', color: '#ff0000' },
    { name: 'Classe A', color: null }, { name: 'Classe A', color: 'blue', accountId: 2 }]) {
    assert.throws(() => parseChallengeFolderCreation(body))
  }
})

test('la migration partage son attente et peut être retentée après une table manquante', async () => {
  let fail = true
  let queries = 0
  const database = { async query(sql) {
    queries++
    if (fail) throw new Error('Table indisponible')
    if (sql === 'SHOW COLUMNS FROM learner_challenge_folders') return [[{ Field: 'color' }]]
    if (sql.startsWith('SHOW COLUMNS')) return [[{ Field: 'folder_id' }]]
    if (sql.startsWith('SHOW INDEX')) return [[{ Key_name: 'idx_learner_saved_challenges_folder' }]]
    return [[{ CONSTRAINT_NAME: 'fk_learner_saved_challenges_folder' }]]
  } }
  await assert.rejects(ensureSavedChallengeFolders(database), /indisponible/)
  fail = false
  await Promise.all([ensureSavedChallengeFolders(database), ensureSavedChallengeFolders(database)])
  assert.equal(queries, 6)
  await ensureSavedChallengeFolders(database)
  assert.equal(queries, 6)
})

globalThis.$fetch ??= async () => { throw new Error('Transport non simulé') }
globalThis.useLanguagePreferences ??= () => ({ interfaceLocale: ref('fr') })

test('un échec conserve le classement ; la nouvelle tentative attend la réponse et bloque les doubles envois', async (t) => {
  let resolve
  let fail = true
  let calls = 0
  t.mock.method(globalThis, '$fetch', async (_url, options) => {
    calls++
    if (fail) throw Object.assign(new Error('Réseau'), { statusCode: 500 })
    return new Promise(done => { resolve = () => done({ ...options.body }) })
  })
  const cards = ref([{ ...first }, { ...second }])
  const folders = useSavedChallengeFolders(cards, false)
  folders.open({ kind: 'move', challenges: [cards.value[0]] })
  assert.equal(await folders.confirm({ name: '', folderId: 2 }), false)
  assert.equal(cards.value[0].folderId, null)
  assert.ok(folders.action.value)
  assert.ok(folders.error.value)
  fail = false
  const pending = folders.confirm({ name: '', folderId: 2 })
  assert.equal(await folders.confirm({ name: '', folderId: 2 }), false)
  folders.close()
  assert.ok(folders.action.value)
  assert.equal(cards.value[0].folderId, null, 'aucune mise à jour avant la réponse')
  resolve()
  assert.equal(await pending, true)
  assert.equal(cards.value[0].folderId, 2)
  assert.equal(cards.value[1].folderId, 2)
  assert.equal(folders.action.value, null)
  assert.equal(calls, 2)
})

test('supprimer un dossier garde ses défis et la lecture seule interdit toute écriture', async (t) => {
  const cards = ref([{ ...first }, { ...second }, { ...third }])
  const readOnly = ref(false)
  const folders = useSavedChallengeFolders(cards, readOnly)
  folders.folders.value = [{ id: 2, name: 'Classe' }]
  let calls = 0
  t.mock.method(globalThis, '$fetch', async () => { calls++ })
  folders.open({ kind: 'delete', folder: folders.folders.value[0] })
  readOnly.value = true
  assert.equal(await folders.confirm({ name: '', folderId: null }), false)
  assert.equal(calls, 0)
  readOnly.value = false
  assert.equal(await folders.confirm({ name: '', folderId: null }), true)
  assert.equal(cards.value.length, 3)
  assert.ok(cards.value.every(challenge => challenge.folderId === null))
  assert.equal(folders.filter.value, 'unfiled')
  assert.equal(folders.folders.value.length, 0)
  readOnly.value = true
  folders.open({ kind: 'create' })
  assert.equal(folders.action.value, null)
})

test('crée un dossier depuis le déplacement sans fermer la fenêtre ni déplacer les défis', async (t) => {
  const calls = []
  t.mock.method(globalThis, '$fetch', async (url, options) => {
    calls.push({ url, ...options })
    return { folder: { id: 3, name: options.body.name, color: options.body.color } }
  })
  const cards = ref([{ ...first }, { ...second }])
  const folders = useSavedChallengeFolders(cards, false)
  folders.filter.value = 'unfiled'
  folders.folders.value = [{ id: 2, name: 'Classe A' }]
  folders.open({ kind: 'move', challenges: [cards.value[0]] })
  const folder = await folders.createMoveFolder(' Révisions ', 'blue')
  assert.deepEqual(folder, { id: 3, name: 'Révisions', color: 'blue' })
  assert.deepEqual(folders.folders.value.map(item => item.id), [2, 3])
  assert.equal(folders.action.value.kind, 'move')
  assert.equal(folders.filter.value, 'unfiled', 'la liste affichée et sa sélection restent en place')
  assert.equal(cards.value[0].folderId, null, 'créer le dossier ne déplace pas encore les défis')
  assert.equal(calls.length, 1)
  assert.deepEqual(calls[0], { url: '/api/learner/challenge-folders', method: 'POST', credentials: 'same-origin', body: { name: 'Révisions', color: 'blue' } })
  folders.close()
  assert.equal(folders.folders.value.length, 2, 'le dossier explicitement créé reste disponible après annulation du déplacement')
})

test('la création dans le déplacement conserve la fenêtre en cas de doublon et bloque les doubles envois et la lecture seule', async (t) => {
  const cards = ref([{ ...first }])
  const readOnly = ref(false)
  const folders = useSavedChallengeFolders(cards, readOnly)
  let resolve
  let fail = true
  let calls = 0
  t.mock.method(globalThis, '$fetch', async () => {
    calls++
    if (fail) throw Object.assign(new Error('Doublon'), { statusCode: 409 })
    return new Promise(done => { resolve = () => done({ folder: { id: 2, name: 'Classe A' } }) })
  })
  assert.equal(await folders.createMoveFolder('Classe A'), null, 'création uniquement dans une fenêtre de déplacement ouverte')
  assert.equal(calls, 0)
  folders.open({ kind: 'move', challenges: cards.value })
  assert.equal(await folders.createMoveFolder('Classe A'), null)
  assert.equal(folders.error.value, savedChallengeFoldersCopy('fr').duplicate)
  assert.equal(folders.action.value.kind, 'move')
  assert.equal(folders.folders.value.length, 0)
  fail = false
  const creating = folders.createMoveFolder('Classe A')
  assert.equal(folders.pending.value, true)
  assert.equal(await folders.createMoveFolder('Classe B'), null)
  assert.equal(await folders.confirm({ name: '', folderId: null }), false)
  folders.close()
  assert.ok(folders.action.value)
  resolve()
  assert.equal((await creating).id, 2)
  assert.equal(calls, 2)
  readOnly.value = true
  assert.equal(await folders.createMoveFolder('Classe C'), null)
  assert.equal(calls, 2)
})

test('les textes des dossiers existent dans toutes les langues de l’interface', () => {
  for (const locale of SUPPORTED_LOCALES) {
    const copy = savedChallengeFoldersCopy(locale)
    assert.ok(copy.create && copy.deleteHint && copy.duplicate && copy.unfiled)
    assert.match(copy.moved(3), /3/)
    assert.match(copy.moveSelected(3), /3/)
    assert.match(copy.deleteTitle('Classe A'), /Classe A/)
    assert.ok(copy.color && copy.colorTitle && copy.colorSaved)
    for (const color of SAVED_CHALLENGE_FOLDER_COLORS) assert.ok(copy.colors[color.id])
  }
})

test('la couleur attend la réponse serveur, reste retentable et conserve le nom, le classement et le filtre', async (t) => {
  const cards = ref([{ ...first }, { ...second }])
  const folders = useSavedChallengeFolders(cards, false)
  const originalFolder = { id: 2, name: 'Classe A', color: 'violet' }
  folders.folders.value = [originalFolder]
  folders.filter.value = 2
  folders.open({ kind: 'color', folder: originalFolder })
  let resolve
  let fail = true
  const calls = []
  t.mock.method(globalThis, '$fetch', async (url, options) => {
    calls.push({ url, ...options })
    if (fail) throw new Error('Réseau')
    return new Promise(done => { resolve = () => done({ folder: { ...originalFolder, color: options.body.color } }) })
  })
  assert.equal(await folders.confirm({ name: '', folderId: null, color: 'red' }), false)
  assert.equal(folders.folders.value[0].color, 'violet')
  assert.ok(folders.action.value)
  fail = false
  const saving = folders.confirm({ name: '', folderId: null, color: 'red' })
  assert.equal(folders.folders.value[0].color, 'violet')
  assert.equal(await folders.confirm({ name: '', folderId: null, color: 'blue' }), false)
  resolve()
  assert.equal(await saving, true)
  assert.deepEqual(folders.folders.value, [{ id: 2, name: 'Classe A', color: 'red' }])
  assert.deepEqual(calls[1].body, { color: 'red' })
  assert.equal(folders.filter.value, 2)
  assert.equal(cards.value[0].folderId, null)
  assert.equal(cards.value[1].folderId, 2)
  assert.equal(folders.action.value, null)
})

test('la création standard envoie la couleur choisie avec le nom en une seule écriture', async (t) => {
  const calls = []
  t.mock.method(globalThis, '$fetch', async (url, options) => {
    calls.push({ url, ...options })
    return { folder: { id: 5, ...options.body } }
  })
  const folders = useSavedChallengeFolders(ref([{ ...first }]), false)
  folders.open({ kind: 'create' })
  assert.equal(await folders.confirm({ name: ' Classe B ', folderId: null, color: 'green' }), true)
  assert.deepEqual(calls, [{ url: '/api/learner/challenge-folders', method: 'POST', credentials: 'same-origin', body: { name: 'Classe B', color: 'green' } }])
  assert.deepEqual(folders.folders.value, [{ id: 5, name: 'Classe B', color: 'green' }])
  assert.equal(folders.filter.value, 5)
  assert.equal(folders.action.value, null)
})

const socketPath = process.env.DEFIS_CLEANUP_TEST_SOCKET
test('MySQL : migration répétable, classement personnel, déplacement atomique et suppression sans perte', { skip: !socketPath }, async () => {
  assert.match(socketPath, /^\/(?:private\/)?tmp\/defis-cleanup-mysql\.[\w]+\/mysql\.sock$/)
  const schema = `codex_saved_folders_${process.pid}`
  const database = mysql.createPool({ socketPath, user: 'root', connectionLimit: 1, dateStrings: true })
  let created = false
  try {
    await database.query(`CREATE DATABASE ${schema} CHARACTER SET utf8mb4`)
    created = true
    await database.query(`USE ${schema}`)
    await database.query('CREATE TABLE learner_accounts (id BIGINT UNSIGNED PRIMARY KEY) ENGINE=InnoDB')
    await database.query('CREATE TABLE defis (id INT PRIMARY KEY, name VARCHAR(11), defi TEXT) ENGINE=InnoDB')
    await database.query(`CREATE TABLE learner_saved_challenges (
      account_id BIGINT UNSIGNED NOT NULL, defi_id INT NOT NULL, saved_at DATETIME,
      PRIMARY KEY (account_id, defi_id), FOREIGN KEY (account_id) REFERENCES learner_accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (defi_id) REFERENCES defis(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`)
    await database.query('CREATE TABLE learner_challenge_runs (id INT PRIMARY KEY, score INT) ENGINE=InnoDB')
    await database.query('INSERT INTO learner_accounts VALUES (1), (2)')
    for (const [index, item] of [first, second, third].entries()) {
      await database.execute('INSERT INTO defis VALUES (?, ?, ?)', [index + 1, item.code, '{"title":"Partagé"}'])
    }
    await database.query("INSERT INTO learner_saved_challenges VALUES (1,1,'2026-08-01'), (1,2,'2026-08-02'), (2,1,'2026-08-03'), (2,3,'2026-08-04')")
    await database.query('INSERT INTO learner_challenge_runs VALUES (1,100), (2,80)')
    await database.query(`CREATE TABLE learner_challenge_folders (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, account_id BIGINT UNSIGNED NOT NULL, name VARCHAR(80) NOT NULL,
      UNIQUE KEY uq_learner_challenge_folder_name (account_id, name),
      FOREIGN KEY (account_id) REFERENCES learner_accounts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
    await database.query("INSERT INTO learner_challenge_folders (account_id, name) VALUES (1, 'Ancien dossier')")
    await Promise.all([initializeSavedChallengeFolders(database), initializeSavedChallengeFolders(database)])
    await initializeSavedChallengeFolders(database)
    const [[legacy]] = await database.query('SELECT id, name, color FROM learner_challenge_folders')
    assert.equal(legacy.name, 'Ancien dossier')
    assert.equal(legacy.color, 'violet', 'migration des dossiers existants sans perte de nom')
    await deleteChallengeFolder(database, 1, Number(legacy.id))
    const [original] = await database.query('SELECT * FROM learner_saved_challenges ORDER BY account_id, defi_id')
    assert.ok(original.every(row => row.folder_id === null), 'les défis existants restent sans dossier')
    const folder = await saveChallengeFolder(database, 1, 'Classe A')
    const other = await saveChallengeFolder(database, 2, 'Classe A', undefined, 'blue')
    assert.equal(folder.color, 'violet')
    assert.equal(other.color, 'blue', 'la couleur choisie est enregistrée dès la création')
    await assert.rejects(saveChallengeFolder(database, 1, 'classe a'), { statusCode: 409 })
    assert.deepEqual(await listSavedChallengeFolders(database, 1), [folder])
    assert.deepEqual(await listSavedChallengeFolders(database, 2), [other])
    await assert.rejects(updateChallengeFolder(database, 2, folder.id, { color: 'red' }), { statusCode: 404 })
    const colored = await updateChallengeFolder(database, 1, folder.id, { color: 'red' })
    assert.deepEqual(colored, { ...folder, color: 'red' })
    await initializeSavedChallengeFolders(database)
    assert.deepEqual(await listSavedChallengeFolders(database, 1), [colored], 'la migration répétée conserve la couleur choisie')
    assert.deepEqual(await listSavedChallengeFolders(database, 2), [other], 'un autre compte conserve sa propre couleur')
    await assert.rejects(saveChallengeFolder(database, 2, 'Intrusion', folder.id), { statusCode: 404 })
    await assert.rejects(deleteChallengeFolder(database, 2, folder.id), { statusCode: 404 })
    await assert.rejects(moveSavedChallenges(database, 1, [first.code], other.id), { statusCode: 404 })
    await moveSavedChallenges(database, 1, [first.code, second.code], folder.id)
    await moveSavedChallenges(database, 1, [first.code, second.code], folder.id)
    await moveSavedChallenges(database, 2, [first.code], other.id)
    await assert.rejects(moveSavedChallenges(database, 1, [first.code, third.code], null), { statusCode: 404 })
    const [saved] = await database.query('SELECT * FROM learner_saved_challenges ORDER BY account_id, defi_id')
    assert.deepEqual(saved.map(row => [row.account_id, row.defi_id, row.folder_id]), [[1,1,folder.id], [1,2,folder.id], [2,1,other.id], [2,3,null]])
    assert.deepEqual(saved.map(row => row.saved_at), original.map(row => row.saved_at))
    await saveChallengeFolder(database, 1, 'Révisions', folder.id)
    await saveChallengeFolder(database, 1, 'Révisions', folder.id)
    assert.deepEqual(await listSavedChallengeFolders(database, 1), [{ ...folder, name: 'Révisions', color: 'red' }], 'renommer conserve la couleur')
    await moveSavedChallenges(database, 1, [second.code], null)
    await deleteChallengeFolder(database, 1, folder.id)
    const [after] = await database.query('SELECT * FROM learner_saved_challenges ORDER BY account_id, defi_id')
    assert.equal(after.length, original.length)
    assert.deepEqual(after.map(row => row.folder_id), [null, null, other.id, null])
    const [defis] = await database.query('SELECT name, defi FROM defis ORDER BY id')
    assert.deepEqual(defis.map(row => row.name), [first.code, second.code, third.code])
    assert.ok(defis.every(row => row.defi === '{"title":"Partagé"}'))
    const [runs] = await database.query('SELECT score FROM learner_challenge_runs ORDER BY id')
    assert.deepEqual(runs.map(row => row.score), [100,80])
    await initializeSavedChallengeFolders(database)
    await database.query('DELETE FROM learner_accounts WHERE id=2')
    assert.deepEqual(await listSavedChallengeFolders(database, 2), [])
    const [remaining] = await database.query('SELECT account_id FROM learner_saved_challenges')
    assert.deepEqual(remaining.map(row => row.account_id), [1,1])
  } finally {
    if (created) await database.query(`DROP DATABASE ${schema}`)
    await database.end()
  }
})

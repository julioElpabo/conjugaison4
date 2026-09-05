import assert from 'node:assert/strict'
import test from 'node:test'

globalThis.defineNitroPlugin = plugin => plugin
const { extendPublicationLocales } = await import('../server/plugins/challenge-publications-migration.ts')
delete globalThis.defineNitroPlugin

for (const version of ['8.0.40', '10.11.8-MariaDB']) {
  test(`étend les CHECK existants sans supprimer les publications (${version})`, async () => {
    const changed = new Set()
    const alterations = []
    const database = { async query(sql) {
      if (sql.startsWith('SELECT VERSION')) return [[{ version }]]
      const table = sql.match(/`([^`]+)`/u)?.[1]
      const constraint = table.endsWith('redirects') ? 'chk_challenge_publication_redirect_locale' : 'chk_challenge_publication_locale'
      if (sql.startsWith('SHOW')) return [[{ 'Create Table': `CREATE TABLE ${table} (\n CONSTRAINT \`${constraint}\` CHECK (locale IN ('fr','de','en','it','es'${changed.has(table) ? ",'nl','nl-NL'" : ''}))\n)` }]]
      alterations.push(sql)
      changed.add(table)
      return [[]]
    } }
    await extendPublicationLocales(database)
    assert.equal(alterations.length, 2)
    for (const sql of alterations) {
      assert.match(sql, version.includes('MariaDB') ? /DROP CONSTRAINT/u : /DROP CHECK/u)
      assert.match(sql, /ADD CONSTRAINT.*CHECK \(locale IN \('fr','de','en','it','es','nl','nl-NL'\)\)/u)
    }
    await extendPublicationLocales(database)
    assert.equal(alterations.length, 2, 'le deuxième passage ne modifie plus les contraintes')
  })
}

test('reste compatible avec MySQL 5.7 sans CHECK stocké', async () => {
  let reads = 0
  await extendPublicationLocales({ async query(sql) {
    assert.match(sql, /^SHOW CREATE TABLE/u)
    reads++
    return [[{ 'Create Table': 'CREATE TABLE publications (locale char(2))' }]]
  } })
  assert.equal(reads, 2)
})

test('élargit les anciennes colonnes pour sauvegarder nl-NL et ne le fait qu’une fois', async () => {
  const expanded = new Set()
  const database = { async query(sql) {
    const table = sql.match(/`([^`]+)`/u)?.[1]
    if (sql.startsWith('SHOW')) return [[{ 'Create Table': `CREATE TABLE test (\n \`locale\` ${expanded.has(table) ? 'varchar(5)' : 'char(2)'} NOT NULL\n)` }]]
    assert.match(sql, /MODIFY COLUMN locale VARCHAR\(5\) NOT NULL/u)
    assert.ok(!expanded.has(table), 'pas de deuxième ALTER pour la même colonne')
    expanded.add(table)
    return [[]]
  } }
  await extendPublicationLocales(database)
  await extendPublicationLocales(database)
  assert.equal(expanded.size, 2)
})

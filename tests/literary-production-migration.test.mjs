import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const [snapshotText, migration, exporter] = await Promise.all([
  readFile(new URL('../shared/data/literary-corpus-production.json', import.meta.url), 'utf8'),
  readFile(new URL('../server/plugins/literary-corpus-migration.ts', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/export-literary-production-snapshot.mjs', import.meta.url), 'utf8'),
])
const snapshot = JSON.parse(snapshotText)

test('l’instantané de production contient uniquement le corpus validé attendu', () => {
  assert.equal(snapshot.schemaVersion, 1)
  assert.match(snapshot.checksum, /^[a-f0-9]{64}$/u)
  assert.deepEqual(snapshot.counts, { sources: 6, sentences: 1183, targets: 1337 })
  assert.equal(snapshot.sources.length, snapshot.counts.sources)

  const sentenceKeys = new Set()
  let sentenceCount = 0
  let targetCount = 0
  for (const source of snapshot.sources) {
    assert.ok(source.source.key)
    for (const sentence of source.sentences) {
      sentenceCount += 1
      assert.equal(sentenceKeys.has(sentence.key), false)
      sentenceKeys.add(sentence.key)
      assert.equal(sentence.characterCount, sentence.text.length)
      assert.ok(sentence.targets.length > 0)
      for (const target of sentence.targets) {
        targetCount += 1
        assert.equal(sentence.text.slice(target.start, target.end), target.form)
      }
    }
  }
  assert.equal(sentenceCount, snapshot.counts.sentences)
  assert.equal(targetCount, snapshot.counts.targets)
})

test('la migration remplace le corpus dans une transaction et ne se rejoue pas', () => {
  assert.match(migration, /production-literary-corpus-v1-/u)
  assert.match(migration, /await connection\.beginTransaction\(\)/u)
  assert.match(migration, /DELETE FROM literary_targets/u)
  assert.match(migration, /DELETE FROM literary_sentences/u)
  assert.match(migration, /DELETE FROM literary_sources/u)
  assert.match(migration, /review_status<>'validated'/u)
  assert.match(migration, /validated-literary-enrichment-v1/u)
  assert.match(migration, /validated-literary-enrichment-v2/u)
  assert.match(migration, /await connection\.commit\(\)/u)
  assert.match(migration, /await connection\.rollback\(\)/u)
})

test('l’export refuse les statuts non validés et les phrases orphelines', () => {
  assert.match(exporter, /unexpectedStatuses/u)
  assert.match(exporter, /phrase\(s\) littéraire\(s\) orpheline\(s\)/u)
  assert.match(exporter, /review_status='validated'/u)
})

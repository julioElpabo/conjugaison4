import assert from 'node:assert/strict'
import test from 'node:test'

import { migrateUsefulAllophoneChallenge } from '../scripts/migrate-useful-allophone-challenge.mjs'

test('installe le défi pour allophones avec ses cinq temps dans le bon ordre', async () => {
  const calls = []
  const connection = {
    async execute(sql, parameters = []) {
      calls.push({ sql, parameters })
      if (sql.startsWith('SELECT id FROM challenge_preset_categories')) return [[{ id: 2 }], []]
      if (sql.startsWith('SELECT id FROM challenge_presets')) return [[{ id: 31 }], []]
      return [{ affectedRows: 1 }, []]
    },
  }

  const result = await migrateUsefulAllophoneChallenge(connection)
  assert.deepEqual(result, { presetId: 31, verbCount: 100, tenseCount: 5 })

  const presetInsert = calls.find(call => call.sql.includes('INSERT INTO challenge_presets'))
  assert.ok(presetInsert)
  assert.equal(presetInsert.parameters[0], '100-verbes-utiles-allophones')
  assert.equal(presetInsert.parameters[2], '100 verbes utiles')
  assert.equal(presetInsert.parameters[4], 20)
  assert.match(presetInsert.sql, /sort_order=32767/u)

  const tenseInserts = calls.filter(call => call.sql.includes('INSERT INTO challenge_preset_tenses'))
  assert.deepEqual(tenseInserts.map(call => call.parameters), [
    [31, 1, 0],
    [31, 2, 1],
    [31, 3, 2],
    [31, 24, 3],
    [31, 5, 4],
  ])
  assert.ok(calls.some(call => call.sql.includes('DELETE FROM challenge_preset_verbs')))
})

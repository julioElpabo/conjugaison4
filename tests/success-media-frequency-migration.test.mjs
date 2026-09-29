import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  migrateSuccessMediaFrequency,
  SUCCESS_MEDIA_FREQUENCY_MIGRATION_KEY,
} from '../scripts/migrate-success-media-frequency.mjs'

function connectionAlreadyApplied(applied) {
  const calls = []
  return {
    calls,
    async query(sql) {
      calls.push({ sql, params: [] })
      return [[], []]
    },
    async execute(sql, params = []) {
      calls.push({ sql, params })
      if (/SELECT 1 AS applied/u.test(sql)) return [applied ? [{ applied: 1 }] : [], []]
      if (/UPDATE coach_character_reaction_rules/u.test(sql)) return [{ affectedRows: 7 }, []]
      return [{ affectedRows: 1 }, []]
    },
  }
}

test('augmente les GIFs de réussite sans dépendre des identifiants locaux', async () => {
  const connection = connectionAlreadyApplied(false)
  const result = await migrateSuccessMediaFrequency(connection)
  const update = connection.calls.find(call => /UPDATE coach_character_reaction_rules/u.test(call.sql))

  assert.deepEqual(result, { applied: true, updatedRuleCount: 7 })
  assert.match(update.sql, /animation_probability=1,cooldown_questions=1/u)
  assert.match(update.sql, /event_type IN \('correct','correct-alternative'\)/u)
  assert.equal(update.params.length, 0)
  assert.ok(connection.calls.some(call => call.params.includes(SUCCESS_MEDIA_FREQUENCY_MIGRATION_KEY)))
})

test('ne réapplique pas la synchronisation déjà enregistrée', async () => {
  const connection = connectionAlreadyApplied(true)
  assert.deepEqual(await migrateSuccessMediaFrequency(connection), { applied: false, updatedRuleCount: 0 })
  assert.equal(connection.calls.some(call => /UPDATE coach_character_reaction_rules/u.test(call.sql)), false)
})

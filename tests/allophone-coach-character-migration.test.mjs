import assert from 'node:assert/strict'
import test from 'node:test'

import {
  ALLOPHONE_CHARACTER_MIGRATION_KEY,
  allophoneReactionRuleSeeds,
  allophoneReplySeeds,
  ensureCoachConfigurationMigrations,
  migrateAllophoneCoachCharacter,
} from '../scripts/migrate-allophone-coach-character.mjs'

test('prépare le suivi des migrations avant la transaction applicative', async () => {
  const calls = []
  await ensureCoachConfigurationMigrations({
    async query(sql) {
      calls.push(sql)
      return [{ affectedRows: 0 }, []]
    },
  })
  assert.equal(calls.length, 1)
  assert.match(calls[0], /CREATE TABLE IF NOT EXISTS coach_configuration_migrations/u)
})

test('synchronise le caractère allophone et l’attribue aux deux coachs CIF/FLE', async () => {
  const calls = []
  const connection = {
    async query(sql, parameters = []) {
      calls.push({ sql, parameters })
      return [{ affectedRows: 0 }, []]
    },
    async execute(sql, parameters = []) {
      calls.push({ sql, parameters })
      if (sql.startsWith('SELECT 1 AS applied')) return [[], []]
      if (sql.includes("FROM coach_help_approaches WHERE slug='allophone'")) return [[{ id: 4 }], []]
      if (sql.includes("FROM coach_characters WHERE slug='allophone'")) return [[{ id: 63 }], []]
      if (sql.startsWith('UPDATE coaches')) return [{ affectedRows: 2 }, []]
      return [{ affectedRows: 1 }, []]
    },
  }

  const result = await migrateAllophoneCoachCharacter(connection)
  assert.deepEqual(result, {
    applied: true,
    replyCount: 15,
    ruleCount: 5,
    coachCount: 2,
  })

  const characterInsert = calls.find(call => call.sql.includes('INSERT INTO coach_characters'))
  assert.ok(characterInsert)
  assert.ok(calls.some(call => call.sql.includes('INSERT INTO coach_help_approaches')))
  assert.deepEqual(characterInsert.parameters, [
    'Explique et donne les réponses avec des mots simples. Lecture audio.',
    4,
  ])
  assert.equal(calls.filter(call => call.sql.includes('INSERT INTO coach_character_reply_templates')).length, allophoneReplySeeds.length)
  assert.equal(calls.filter(call => call.sql.includes('INSERT INTO coach_character_reaction_rules')).length, allophoneReactionRuleSeeds.length)
  assert.ok(calls.some(call => call.sql.includes("WHERE slug IN ('claire-dubois','hugo-martin')")))
  assert.ok(calls.some(call => call.parameters.includes(ALLOPHONE_CHARACTER_MIGRATION_KEY)))
})

test('ne réapplique pas une migration déjà enregistrée', async () => {
  const calls = []
  const connection = {
    async query(sql, parameters = []) {
      calls.push({ sql, parameters })
      return [{ affectedRows: 0 }, []]
    },
    async execute(sql, parameters = []) {
      calls.push({ sql, parameters })
      if (sql.startsWith('SELECT 1 AS applied')) return [[{ applied: 1 }], []]
      throw new Error('Aucune autre requête ne doit être exécutée.')
    },
  }

  const result = await migrateAllophoneCoachCharacter(connection)
  assert.deepEqual(result, { applied: false, replyCount: 0, ruleCount: 0 })
})

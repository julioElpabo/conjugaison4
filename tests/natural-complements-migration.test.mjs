import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

describe('migration des compléments naturels', () => {
  it('remplace de façon idempotente les possessifs artificiels du verbe avoir', async () => {
    const [migration, plugin] = await Promise.all([
      readFile(new URL('../scripts/migrations/2026-08-26-natural-avoir-complements.sql', import.meta.url), 'utf8'),
      readFile(new URL('../server/plugins/natural-complements-migration.ts', import.meta.url), 'utf8'),
    ])
    for (const source of [migration, plugin]) {
      assert.match(source, /verb\.infinitif = 'avoir'/u)
      assert.match(source, /'mon idée'.*'notre idée'/su)
      assert.match(source, /WHEN 'mon idée' THEN 'une bonne raison'/u)
      assert.match(source, /WHEN 'leur idée' THEN 'une priorité'/u)
      assert.match(source, /complement\.actif = 1/u)
    }
  })
})

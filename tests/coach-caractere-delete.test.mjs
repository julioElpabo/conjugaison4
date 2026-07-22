import assert from 'node:assert/strict'
import test from 'node:test'
import { deleteCaracterePermanently } from '../server/services/coach-caracteres.ts'

test('la suppression définitive détache les coaches puis supprime le caractère', async () => {
  const calls = []
  const connection = {
    async execute(sql, params) {
      calls.push([sql.replace(/\s+/g, ' ').trim(), params])
      if (sql.startsWith('SELECT id')) return [[{ id: 7 }], []]
      if (sql.startsWith('DELETE FROM coach_characters')) return [{ affectedRows: 1 }, []]
      return [{ affectedRows: 1 }, []]
    },
  }

  assert.equal(await deleteCaracterePermanently(connection, 7), true)
  assert.deepEqual(calls.map(([, params]) => params), [[7], [7], [7]])
  assert.match(calls[1][0], /^UPDATE coaches SET character_id=NULL/)
  assert.match(calls[2][0], /^DELETE FROM coach_characters/)
})

test('la suppression définitive ne modifie rien si le caractère est introuvable', async () => {
  let callCount = 0
  const connection = {
    async execute() {
      callCount += 1
      return [[], []]
    },
  }

  assert.equal(await deleteCaracterePermanently(connection, 404), false)
  assert.equal(callCount, 1)
})

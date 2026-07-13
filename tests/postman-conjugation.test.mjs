import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

import { formatConjugationQuestion } from '../server/services/question-formatter.ts'

const collectionUrl = new URL('../postman/Tests conjugaisons - corrigé.postman_collection.json', import.meta.url)
const collection = JSON.parse(await readFile(collectionUrl, 'utf8'))
const expectationPattern = /pm\.expect\(data\.(titre|consigne|reponsesPourCorrige|reponses)\)\.to\.(equal|include)\(("(?:\\.|[^"\\])*")\)/gu

function expectationsFor(item) {
  const script = item.event
    ?.filter(event => event.listen === 'test')
    .flatMap(event => event.script?.exec || [])
    .join('\n') || ''
  return [...script.matchAll(expectationPattern)].map(match => ({
    property: match[1],
    matcher: match[2],
    expected: JSON.parse(match[3]),
  }))
}
function sourceRow(item, index) {
  const input = JSON.parse(item.request.body.raw)
  return {
    input,
    row: {
      id: index + 1,
      verbe_id: 1,
      personne_id: 1,
      temp_id: 1,
      conjugaison1: input.conjugaison1,
      conjugaison2: input.conjugaison2,
      conjugaison3: input.conjugaison3,
      infinitif: input.infinitif,
      auxiliaire: input.auxiliaire,
      participe_passe: input['participe_passé'],
      temps_name: input.tempsname,
      is_compound: Number(input.isTempsCompose),
      mode_name: input.modename,
    },
  }
}

describe('collection Postman — formatage des conjugaisons', () => {
  it('importe les 30 scénarios et leurs 182 assertions', () => {
    assert.equal(collection.item.length, 30)
    assert.equal(collection.item.flatMap(expectationsFor).length, 182)
  })

  collection.item.forEach((item, index) => {
    it(`${index + 1}. ${item.name}`, () => {
      const { input, row } = sourceRow(item, index)
      const result = formatConjugationQuestion(row, input.pronom)
      const expectations = expectationsFor(item)

      assert.ok(expectations.length > 0, `${item.name} ne contient aucune assertion comprise`)
      for (const expectation of expectations) {
        const actual = result[expectation.property]
        const message = `${item.name} — ${expectation.property} doit contenir « ${expectation.expected} »`
        if (expectation.matcher === 'equal') {
          assert.equal(actual, expectation.expected, message)
        } else {
          assert.ok(Array.isArray(actual), `${item.name} — ${expectation.property} doit être un tableau`)
          assert.ok(actual.includes(expectation.expected), message)
        }
      }
    })
  })
})

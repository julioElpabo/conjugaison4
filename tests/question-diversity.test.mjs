import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { choosePronoun, diverseConjugationQuestions } from '../server/services/questionnaire.ts'

function question(id, verbId) {
  return {
    id, verbeId: verbId, titre: `verbe-${verbId}`, consigne: '', reponses: [], reponsesPourCorrige: [],
  }
}

describe('diversité des verbes dans un questionnaire', () => {
  it('utilise chaque verbe disponible avant une répétition', () => {
    const selected = diverseConjugationQuestions([
      question('a1', 1), question('a2', 1), question('a3', 1),
      question('b1', 2), question('b2', 2),
      question('c1', 3), question('c2', 3),
    ], 5, () => .999)

    assert.equal(new Set(selected.slice(0, 3).map(item => item.verbeId)).size, 3)
    assert.equal(selected.length, 5)
  })

  it('ne duplique jamais une question quand le stock est épuisé', () => {
    const selected = diverseConjugationQuestions([
      question('a1', 1), question('b1', 2),
    ], 10, () => 0)
    assert.deepEqual(new Set(selected.map(item => item.id)), new Set(['a1', 'b1']))
  })
})

describe('pronom on', () => {
  it('peut remplacer il mais jamais une personne plurielle', () => {
    assert.equal(choosePronoun('il', false, true, () => .999), 'on')
    assert.notEqual(choosePronoun('ils', true, true, () => .999), 'on')
    assert.equal(choosePronoun('tu', true, true, () => .999), 'tu')
  })
})

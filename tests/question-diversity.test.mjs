import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { choosePronoun, diverseConjugationQuestions } from '../server/services/questionnaire.ts'

function question(id, verbId, tenseId) {
  return {
    id, verbeId: verbId, tenseId, titre: `verbe-${verbId}`, consigne: '', reponses: [], reponsesPourCorrige: [],
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

  it('alterne les voix active et passive pour un même verbe', () => {
    const questions = [
      { ...question('a1', 1), voice: 'active' },
      { ...question('p1', 1), voice: 'passive' },
      { ...question('a2', 1), voice: 'active' },
      { ...question('p2', 1), voice: 'passive' },
    ]
    const selected = diverseConjugationQuestions(questions, 4, () => 0)
    assert.deepEqual(selected.map(item => item.voice), ['active', 'passive', 'active', 'passive'])
  })

  it('ne répète pas le futur proche avant les autres temps malgré un stock surdimensionné', () => {
    const questions = [
      ...Array.from({ length: 60 }, (_, index) => question(`fp-${index}`, index % 20, 24)),
      ...Array.from({ length: 6 }, (_, index) => question(`pr-${index}`, index, 1)),
      ...Array.from({ length: 6 }, (_, index) => question(`im-${index}`, index, 2)),
      ...Array.from({ length: 6 }, (_, index) => question(`pc-${index}`, index, 5)),
    ]
    const selected = diverseConjugationQuestions(questions, 4, () => .5)

    assert.equal(new Set(selected.map(item => item.tenseId)).size, 4)
    assert.equal(selected.filter(item => item.tenseId === 24).length, 1)
  })

  it('distingue deux temps de même nom appartenant à des modes différents', () => {
    const selected = diverseConjugationQuestions([
      { ...question('indicatif', 1), mode: 'indicatif', temps: 'présent' },
      { ...question('subjonctif', 2), mode: 'subjonctif', temps: 'présent' },
    ], 2, () => 0)
    assert.deepEqual(new Set(selected.map(item => item.mode)), new Set(['indicatif', 'subjonctif']))
  })

  it('couvre tous les verbes et tous les temps disponibles quand le nombre de questions le permet', () => {
    const questions = []
    for (const verbId of [1, 2, 3, 4, 5]) {
      for (const tenseId of [1, 2, 3, 4]) {
        questions.push(question(`${verbId}-${tenseId}`, verbId, tenseId))
      }
    }
    const selected = diverseConjugationQuestions(questions, 5, () => .73)

    assert.equal(new Set(selected.map(item => item.verbeId)).size, 5)
    assert.equal(new Set(selected.map(item => item.tenseId)).size, 4)
  })
})

describe('pronom on', () => {
  it('peut remplacer il mais jamais une personne plurielle', () => {
    assert.equal(choosePronoun('il', false, true, () => .999), 'on')
    assert.notEqual(choosePronoun('ils', true, true, () => .999), 'on')
    assert.equal(choosePronoun('tu', true, true, () => .999), 'tu')
  })
})

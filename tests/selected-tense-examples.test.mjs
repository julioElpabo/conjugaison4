import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { examplesFromQuestions } from '../server/services/selected-tense-examples.ts'

describe('exemples liés aux verbes sélectionnés', () => {
  it('préfère une phrase qui contient un complément et ne garde que la correction', () => {
    const examples = examplesFromQuestions([1], [
      { tenseId: 1, reponsesPourCorrige: ['Il finit'], reponses: [], titre: '', consigne: '' },
      { tenseId: 1, complement: 'une pomme', reponsesPourCorrige: ['Nous mangeons une pomme'], reponses: [], titre: '', consigne: '' },
    ])

    assert.deepEqual(examples, {
      1: { emphasis: 'Nous mangeons', rest: 'une pomme.' },
    })
  })

  it('conserve la ponctuation de l’impératif', () => {
    const examples = examplesFromQuestions([9], [
      { tenseId: 9, complement: 'ton repas', reponsesPourCorrige: ['Finis ton repas !'], reponses: [], titre: '', consigne: '' },
    ])

    assert.deepEqual(examples[9], { emphasis: 'Finis', rest: 'ton repas !' })
  })

  it('ajoute le COD du verbe aux formes non personnelles', () => {
    const examples = examplesFromQuestions([20], [
      { tenseId: 20, verbeId: 4, reponsesPourCorrige: ['Faisant'], reponses: [], titre: '', consigne: '' },
    ], { 4: 'un exercice' })

    assert.deepEqual(examples[20], { emphasis: 'Faisant', rest: 'un exercice.' })
  })
})

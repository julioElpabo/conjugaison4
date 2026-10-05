import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { hasMissingCedilla, repairQuestionCedillas, repairUnnecessaryCedillas } from '../server/services/cedilla-repairs.ts'

describe('cédilles inutiles dans les formes françaises', () => {
  it('repère les cédilles manquantes dans les familles -cer et -cevoir', () => {
    for (const [value, infinitive] of [['avancais', 'avancer'], ['nous commencons', 'commencer'], ['ai recu', 'recevoir'], ['concu', 'concevoir'], ['avancâmes', "s'avancer"]]) {
      assert.equal(hasMissingCedilla(value, infinitive), true, value)
    }
    for (const [value, infinitive] of [['avancé', 'avancer'], ['avançons', 'avancer'], ['reçu', 'recevoir'], ['concevrons', 'concevoir'], ['vous avancez des pions', 'avancer'], ['ai vécu', 'vivre']]) {
      assert.equal(hasMissingCedilla(value, infinitive), false, value)
    }
  })

  it('corrige les formes simples, composées et accordées', () => {
    assert.equal(repairUnnecessaryCedillas('ayons avançé des pions'), 'ayons avancé des pions')
    assert.equal(repairUnnecessaryCedillas('vous avançez'), 'vous avancez')
    assert.equal(repairUnnecessaryCedillas('elles se sont avançées'), 'elles se sont avancées')
    assert.equal(repairUnnecessaryCedillas('nous lan çions ÇÉ ÇI çy'), 'nous lan cions CÉ CI cy')
    assert.equal(repairUnnecessaryCedillas('avanc\u0327e\u0301'), 'avance\u0301')
  })

  it('conserve les cédilles nécessaires et les formes déjà correctes', () => {
    for (const value of ['avançons', 'avançais', 'commençâmes', 'reçu', 'conçue', 'aperçus', 'ça', 'François', 'avancé', 'vous avancez']) {
      assert.equal(repairUnnecessaryCedillas(value), value)
    }
    const fixed = repairUnnecessaryCedillas('ayons avançé')
    assert.equal(repairUnnecessaryCedillas(fixed), fixed)
  })
})

describe('questions déjà sauvegardées', () => {
  it('corrige aussi les confusions de conjugaison sans toucher la réponse de l’élève ni les résultats', () => {
    const question = {
      consigne: 'avancer', conjugaison1: 'ayons avançé', reponses: ['ayons avançé des pions'],
      reponsesPourCorrige: ['ayons avançé des pions'],
      conjugationConfusions: [{ forms: ['eussions avançé'], mode: 'subjonctif' }],
      learner_answer: 'ayons avançé', is_correct: true, score: 8,
      literaryCitation: { author: 'Nom étranger Çelik' },
    }
    const fixed = JSON.parse(repairQuestionCedillas(JSON.stringify(question)))
    assert.equal(fixed.conjugaison1, 'ayons avancé')
    assert.deepEqual(fixed.reponses, ['ayons avancé des pions'])
    assert.deepEqual(fixed.conjugationConfusions, [{ forms: ['eussions avancé'], mode: 'subjonctif' }])
    assert.equal(fixed.learner_answer, question.learner_answer)
    assert.equal(fixed.is_correct, question.is_correct)
    assert.equal(fixed.score, question.score)
    assert.deepEqual(fixed.literaryCitation, question.literaryCitation)
  })

  it('gère les caractères JSON échappés et ne réécrit pas les questions correctes', () => {
    assert.deepEqual(JSON.parse(repairQuestionCedillas('{"conjugaison1":"avançé"}'.replace('ç', '\\u00e7'))), { conjugaison1: 'avancé' })
    const valid = '{ "conjugaison1": "avançons", "reponses": ["avançons"] }'
    assert.equal(repairQuestionCedillas(valid), valid)
  })
})

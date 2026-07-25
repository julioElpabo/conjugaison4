import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildNearFutureForm,
  buildNearFutureParadigm,
  isNearFutureTense,
  nearFutureSyntheticId,
} from '../shared/utils/near-future.ts'
import { grammarTenseCode } from '../shared/utils/grammar-codes.ts'
import { futureSimpleFormsFor } from '../server/services/questionnaire.ts'

const aller = [
  { personId: 4, pronoun: 'je', forms: ['vais'] },
  { personId: 5, pronoun: 'tu', forms: ['vas'] },
  { personId: 6, pronoun: 'il', forms: ['va'] },
  { personId: 7, pronoun: 'nous', forms: ['allons'] },
  { personId: 8, pronoun: 'vous', forms: ['allez'] },
  { personId: 9, pronoun: 'ils', forms: ['vont'] },
]

describe('génération du futur proche', () => {
  it('combine aller au présent et l’infinitif sans conjuguer le verbe lexical', () => {
    assert.equal(buildNearFutureForm('vais', 'manger', 4), 'vais manger')
    assert.equal(buildNearFutureForm('allons', 'aller', 7), 'allons aller')
  })

  it('place le pronom réfléchi devant l’infinitif', () => {
    assert.equal(buildNearFutureForm('vais', 'se réveiller', 4), 'vais me réveiller')
    assert.equal(buildNearFutureForm('vas', 'se souvenir', 5), 'vas te souvenir')
    assert.equal(buildNearFutureForm('allons', 'se coucher', 7), 'allons nous coucher')
  })

  it('gère l’élision et le h aspiré', () => {
    assert.equal(buildNearFutureForm('vais', "s'habiller", 4, 'muet'), "vais m'habiller")
    assert.equal(buildNearFutureForm('vas', 'se haïr', 5, 'aspire'), 'vas te haïr')
  })

  it('respecte les personnes autorisées des verbes défectifs', () => {
    const paradigm = buildNearFutureParadigm(24, 10, 'falloir', aller, { allowedPersonIds: [6] })
    assert.deepEqual(paradigm.map(form => [form.pronoun, form.forms[0]]), [['il', 'va falloir']])
  })

  it('distingue les identifiants des verbes stockés et des emplois virtuels', () => {
    assert.notEqual(nearFutureSyntheticId(24, 400, 4), nearFutureSyntheticId(24, -400, 4))
  })

  it('évite de doubler le pronom des verbes pronominaux déjà stockés', () => {
    const references = new Map([[400, [{
      verbe_id: 400, personne_id: 5, pronom: 'tu',
      conjugaison1: 'te réveilleras', conjugaison2: '', conjugaison3: '',
      mode_name: 'indicatif', temps_name: 'futur',
    }]]])
    const stored = futureSimpleFormsFor({
      verbe_id: 400, base_verbe_id: 400, personne_id: 5,
      infinitif: 'se réveiller', tense_code: 'near-future', temps_name: 'futur proche',
    }, references)
    const virtual = futureSimpleFormsFor({
      verbe_id: -8, base_verbe_id: 400, personne_id: 5,
      infinitif: 'se réveiller', tense_code: 'near-future', temps_name: 'futur proche',
    }, new Map([[400, [{
      ...references.get(400)[0],
      conjugaison1: 'réveilleras',
    }]]]))

    assert.deepEqual(stored, ['te réveilleras'])
    assert.deepEqual(virtual, ['te réveilleras'])
  })

  it('reconnaît le code et le libellé grammatical', () => {
    assert.equal(isNearFutureTense({ code: 'near-future' }), true)
    assert.equal(isNearFutureTense({ name: 'futur proche' }), true)
    assert.equal(grammarTenseCode('futur proche'), 'near-future')
  })
})

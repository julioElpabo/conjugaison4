import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formatConjugationQuestion } from '../server/services/question-formatter.ts'
import {
  resolveVariableAuxiliary,
  useEtreForIntransitiveCompound,
} from '../server/services/compound-auxiliary.ts'

const auxiliaries = [
  { personne_id: 4, mode_name: 'indicatif', temps_name: 'imparfait', conjugaison1: 'étais' },
  { personne_id: 6, mode_name: 'conditionnel', temps_name: 'présent', conjugaison1: 'serait' },
  { personne_id: 9, mode_name: 'indicatif', temps_name: 'présent', conjugaison1: 'sont' },
]

function source(overrides = {}) {
  return {
    id: 1,
    verbe_id: 66,
    personne_id: 4,
    temp_id: 7,
    conjugaison1: 'avais sorti',
    conjugaison2: '',
    conjugaison3: '',
    infinitif: 'sortir',
    auxiliaire: 'avoir',
    participe_passe: 'sorti',
    pronom: 'je',
    temps_name: 'plus-que-parfait',
    is_compound: 1,
    mode_name: 'indicatif',
    ...overrides,
  }
}

describe('auxiliaire variable de sortir', () => {
  it('emploie être sans COD', () => {
    const row = useEtreForIntransitiveCompound(source(), auxiliaries)
    assert.equal(row.auxiliaire, 'être')
    assert.equal(row.conjugaison1, 'étais sorti')
    assert.deepEqual(formatConjugationQuestion(row, 'je').reponsesPourCorrige, ["j'étais sorti"])
  })

  it('accorde les personnes du pluriel avec être', () => {
    const row = useEtreForIntransitiveCompound(source({
      personne_id: 9,
      temp_id: 5,
      conjugaison1: 'ont sorti',
      pronom: 'ils',
      temps_name: 'passé composé',
    }), auxiliaries)
    assert.equal(row.conjugaison1, 'sont sortis')
    assert.deepEqual(formatConjugationQuestion(row, 'elles').reponsesPourCorrige, ['elles sont sorties'])
  })

  it('construit le conditionnel passé avec être', () => {
    const row = useEtreForIntransitiveCompound(source({
      personne_id: 6,
      temp_id: 15,
      conjugaison1: 'aurait sorti',
      pronom: 'il',
      temps_name: 'passé 1',
      mode_name: 'conditionnel',
    }), auxiliaries)
    assert.equal(row.conjugaison1, 'serait sorti')
  })

  it('conserve avoir lorsqu’un COD est proposé', () => {
    const sourceRow = source({ complement_function: 'cod' })
    const row = resolveVariableAuxiliary(sourceRow, auxiliaries)
    assert.equal(row.auxiliaire, 'avoir')
    assert.equal(row.conjugaison1, 'avais sorti')
  })
})

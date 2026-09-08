import assert from 'node:assert/strict'
import test from 'node:test'
import { identificationQuestion } from '../server/services/questionnaire.ts'
import { formatConjugationQuestion } from '../server/services/question-formatter.ts'
import { subjunctiveIdentificationExample } from '../shared/utils/identification-ambiguity.ts'
import { identificationFormParts } from '../shared/utils/identification-form.ts'

const row = {
  id: 1, verbe_id: 12, personne_id: 6, temp_id: 1,
  conjugaison1: 'cède', conjugaison2: '', conjugaison3: '',
  infinitif: 'céder', auxiliaire: 'avoir', participe_present: 'cédant',
  participe_passe: 'cédé', auxiliaire_infinitif: null, auxiliaire_participe_present: null,
  pronom: 'il', temps_name: 'présent', is_compound: 0, mode_name: 'indicatif',
}
const confusions = [{ tense: 'présent', mode: 'subjonctif', forms: ['cède'], isCompound: false }]

test('reconnaît le subjonctif présent possible pour « il cède » et fournit un exemple contextualisé', () => {
  const question = identificationQuestion(row, undefined, false, confusions)
  assert.equal(question.consigne, 'il cède')
  assert.equal(subjunctiveIdentificationExample(question, 'présent subjonctif'), "il faut qu'il cède")
  assert.equal(subjunctiveIdentificationExample(question, 'subjonctif présent'), "il faut qu'il cède")
})

test('ne prétend pas que les formes différentes ou les autres temps sont identiques', () => {
  const question = identificationQuestion(row, undefined, false, confusions)
  assert.equal(subjunctiveIdentificationExample(question, 'imparfait subjonctif'), null)
  assert.equal(subjunctiveIdentificationExample(question, 'présent indicatif'), null)
  const different = identificationQuestion({ ...row, conjugaison1: 'prend', infinitif: 'prendre' },
    undefined, false, [{ ...confusions[0], forms: ['prenne'] }])
  assert.equal(subjunctiveIdentificationExample(different, 'présent subjonctif'), null)
  assert.equal(subjunctiveIdentificationExample({ ...question, literaryCitation: { before: '', target: 'cède', after: '' } }, 'présent subjonctif'), null)
})

test('affiche que ou qu’ dans les questions au subjonctif, sans inclure le préfixe dans le surlignage', () => {
  for (const [pronom, prefix] of [['il', "qu'il"], ['elle', "qu'elle"], ['je', 'que je'], ['tu', 'que tu'], ['nous', 'que nous'], ['vous', 'que vous']]) {
    const form = pronom === 'nous' ? 'cédions' : pronom === 'vous' ? 'cédiez' : pronom === 'tu' ? 'cèdes' : 'cède'
    const source = { ...row, pronom, conjugaison1: form, mode_name: 'subjonctif' }
    const question = identificationQuestion(source)
    assert.equal(question.consigne, `${prefix} ${form}`)
    assert.deepEqual(identificationFormParts(question), { before: `${prefix} `, target: form, after: '' })
    assert.match(formatConjugationQuestion(source, pronom).consigne, new RegExp(`^${prefix} \\|`))
  }
})

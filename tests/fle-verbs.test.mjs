import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fleVerbBatch, validateFleVerbBatch } from '../server/services/fle-verb-import.ts'
import { formatConjugationQuestion } from '../server/services/question-formatter.ts'
import { resolveVariableAuxiliary } from '../server/services/compound-auxiliary.ts'
import { validateConjugationAnswer } from '../shared/utils/answer.ts'
import { hasVariableAuxiliary, prefersEtreWithoutComplement } from '../shared/utils/variable-auxiliary.ts'

const entry = name => fleVerbBatch.entries.find(item => item.infinitive === name)
const forms = (name, tenseId, personId) => entry(name).rows.find(row => row.tenseId === tenseId && row.personId === personId).forms

test('le lot audité conserve les 41 demandes uniques, dont neuf emplois pronominaux', () => {
  assert.equal(validateFleVerbBatch().finiteSlots, 3936)
  assert.equal(fleVerbBatch.entries.filter(item => item.pronominal).length, 9)
  assert.equal(fleVerbBatch.requested.filter(name => name === 'conseiller').length, 2)
  assert.ok(fleVerbBatch.entries.every(item => item.rows.length === 96))
  assert.deepEqual(entry('convenir').preposition, 'à')
  assert.equal(entry('planter').transitivity, 'transitif_direct')
  assert.equal(entry('patienter').transitivity, 'intransitif')
})

test('une seule forme modifiée invalide le sceau avant toute connexion ou insertion', () => {
  const changed = structuredClone(fleVerbBatch)
  changed.entries[0].rows[0].forms[0] = 'forme fausse'
  assert.throws(() => validateFleVerbBatch(changed), /modifié après audit/u)
})

test('les variantes traditionnelles et rectifiées sont conservées', () => {
  assert.deepEqual(new Set(forms('épeler', 1, 4)), new Set(['épelle', 'épèle']))
  assert.deepEqual(new Set(forms('épeler', 3, 4)), new Set(['épellerai', 'épèlerai']))
  assert.deepEqual(new Set(forms('posséder', 3, 4)), new Set(['posséderai', 'possèderai']))
  assert.deepEqual(new Set(forms('régler', 3, 4)), new Set(['réglerai', 'règlerai']))
})

test('les alternances et les verbes irréguliers ne sont pas remplacés par un modèle régulier', () => {
  assert.deepEqual(forms('décrire', 1, 7), ['décrivons'])
  assert.deepEqual(forms('revenir', 1, 9), ['reviennent'])
  assert.deepEqual(forms('rédiger', 1, 7), ['rédigeons'])
  assert.deepEqual(forms('remplacer', 2, 4), ['remplaçais'])
  assert.deepEqual(forms('remercier', 2, 8), ['remerciiez'])
  assert.deepEqual(forms('promener', 1, 4), ['promène'])
})

function convenir(overrides = {}) {
  return { id:1, verbe_id:1, personne_id:4, temp_id:5, infinitif:'convenir', auxiliaire:'avoir', participe_passe:'convenu', temps_name:'passé composé', mode_name:'indicatif', is_compound:1, conjugaison1:'ai convenu', conjugaison2:'suis convenu', conjugaison3:'', ...overrides }
}

test('convenir distingue les deux auxiliaires et leurs accords en l’absence de contexte', () => {
  assert.equal(hasVariableAuxiliary('convenir'), true)
  assert.equal(prefersEtreWithoutComplement('convenir'), false)
  const question = formatConjugationQuestion(convenir(), 'je')
  for (const answer of ["j'ai convenu", 'je suis convenu', 'je suis convenue']) assert.equal(validateConjugationAnswer(answer, question).isCorrect, true, answer)
  assert.equal(validateConjugationAnswer("j'ai convenue", question).isCorrect, false)
})

test('convenir à conserve avoir, tandis que convenir de peut être construit avec être', () => {
  const auxiliaries = [{personne_id:4, mode_name:'indicatif', temps_name:'présent', conjugaison1:'suis'}]
  const withA = resolveVariableAuxiliary(convenir({complement_phrase:'à cette situation',complement_preposition:'à',complement_function:'coi'}), auxiliaries)
  assert.equal(withA.auxiliaire, 'avoir')
  assert.equal(withA.conjugaison2, '')
  const withDe = resolveVariableAuxiliary(convenir({complement_phrase:'de cette date',complement_preposition:'de',complement_function:'coi'}), auxiliaries)
  assert.equal(withDe.auxiliaire, 'être')
  assert.equal(withDe.conjugaison1, 'suis convenu')
})

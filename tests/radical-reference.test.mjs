import assert from 'node:assert/strict'
import test from 'node:test'
import { buildRadicalReference } from '../shared/utils/radical-reference.ts'

const form = (mode, tense, personId, pronoun, value) => ({ mode, tense, personId, pronoun, form: value })

test('l’imparfait utilise nous au présent et valide le radical', () => {
  const forms = [form('indicatif', 'présent', 7, 'nous', 'mangeons')]
  const reference = buildRadicalReference({
    infinitive: 'manger', mode: 'indicatif', tense: 'imparfait', personId: 4, conjugation: 'mangeais',
  }, forms)

  assert.deepEqual(reference, {
    kind: 'present-nous',
    label: 'nous au présent',
    form: 'mangeons',
    removableEnding: 'ons',
    radical: 'mange',
    targetEnding: 'ais',
    referenceMode: 'indicatif',
    referenceTense: 'présent',
    referenceSubject: 'nous',
    strategy: 'remove-ending',
    validated: true,
  })
})

test('l’imparfait adapte le radical orthographique devant i', () => {
  const reference = buildRadicalReference({
    infinitive: 'manger', mode: 'indicatif', tense: 'imparfait', personId: 7, conjugation: 'mangions',
  }, [form('indicatif', 'présent', 7, 'nous', 'mangeons')])

  assert.equal(reference?.radical, 'mang')
  assert.match(reference?.orthographicAdjustment || '', /Devant i/)
})

test('le futur partage un radical validé avec le conditionnel', () => {
  const forms = [form('indicatif', 'futur', 4, 'je', 'viendrai')]
  const future = buildRadicalReference({
    infinitive: 'venir', mode: 'indicatif', tense: 'futur', personId: 5, conjugation: 'viendras',
  }, forms)
  const conditional = buildRadicalReference({
    infinitive: 'venir', mode: 'conditionnel', tense: 'présent', personId: 7, conjugation: 'viendrions',
  }, forms)

  assert.equal(future?.kind, 'future-stem')
  assert.equal(future?.radical, 'viendr')
  assert.equal(conditional?.radical, 'viendr')
})

test('le subjonctif refuse une forme repère qui ne produit pas la forme stockée', () => {
  const valid = buildRadicalReference({
    infinitive: 'venir', mode: 'subjonctif', tense: 'présent', personId: 4, conjugation: 'vienne',
  }, [form('indicatif', 'présent', 9, 'ils', 'viennent')])
  const invalid = buildRadicalReference({
    infinitive: 'accuser', mode: 'subjonctif', tense: 'présent', personId: 4, conjugation: 'accusai',
  }, [form('indicatif', 'présent', 9, 'ils', 'accusent')])

  assert.equal(valid?.radical, 'vienn')
  assert.equal(invalid, undefined)
})

test('l’impératif part du présent et gère la disparition du s', () => {
  const reference = buildRadicalReference({
    infinitive: 'manger', mode: 'impératif', tense: 'présent', personId: 5, conjugation: 'mange',
  }, [form('indicatif', 'présent', 5, 'tu', 'manges')])

  assert.equal(reference?.form, 'manges')
  assert.equal(reference?.removableEnding, 's')
  assert.equal(reference?.radical, 'mange')
})

test('le subjonctif imparfait utilise le passé simple comme forme repère', () => {
  const reference = buildRadicalReference({
    infinitive: 'venir', mode: 'subjonctif', tense: 'imparfait', personId: 4, conjugation: 'vinsse',
  }, [form('indicatif', 'passé simple', 6, 'il', 'vint')])

  assert.equal(reference?.kind, 'past-simple-il')
  assert.equal(reference?.radical, 'vin')
  assert.equal(reference?.removableEnding, 't')
})

test('le passé simple choisit automatiquement sa série', () => {
  const reference = buildRadicalReference({
    infinitive: 'vouloir', mode: 'indicatif', tense: 'passé simple', personId: 7, conjugation: 'voulûmes',
  }, [form('indicatif', 'passé simple', 6, 'il', 'voulut')])

  assert.equal(reference?.radical, 'voul')
  assert.equal(reference?.removableEnding, 'ut')
  assert.equal(reference?.targetEnding, 'ûmes')
})

test('le passé simple adapte les verbes en ger devant è', () => {
  const reference = buildRadicalReference({
    infinitive: 'manger', mode: 'indicatif', tense: 'passé simple', personId: 9, conjugation: 'mangèrent',
  }, [form('indicatif', 'passé simple', 6, 'il', 'mangea')])

  assert.equal(reference?.radical, 'mang')
  assert.match(reference?.orthographicAdjustment || '', /Devant è/)
})

test('une forme supplétive du subjonctif est explicitement à mémoriser', () => {
  const reference = buildRadicalReference({
    infinitive: 'être', mode: 'subjonctif', tense: 'présent', personId: 4, conjugation: 'sois',
  }, [form('indicatif', 'présent', 9, 'ils', 'sont')])

  assert.equal(reference?.kind, 'memorized-form')
  assert.equal(reference?.form, 'sois')
})

test('le participe présent repart de nous au présent', () => {
  const reference = buildRadicalReference({
    infinitive: 'manger', mode: 'participe', tense: 'présent', personId: null, conjugation: 'mangeant',
  }, [form('indicatif', 'présent', 7, 'nous', 'mangeons')])

  assert.equal(reference?.radical, 'mange')
  assert.equal(reference?.targetEnding, 'ant')
})

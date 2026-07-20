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

test('le présent régulier choisit nous comme forme repère', () => {
  const reference = buildRadicalReference({
    infinitive: 'manger', mode: 'indicatif', tense: 'présent', personId: 4, conjugation: 'mange',
  }, [form('indicatif', 'présent', 7, 'nous', 'mangeons')])

  assert.equal(reference?.referenceSubject, 'nous')
  assert.equal(reference?.form, 'mangeons')
  assert.equal(reference?.radical, 'mange')
})

test('le futur choisit je plutôt que nous ou l’infinitif', () => {
  const reference = buildRadicalReference({
    infinitive: 'manger', mode: 'indicatif', tense: 'futur', personId: 7, conjugation: 'mangerons',
  }, [form('indicatif', 'futur', 4, 'je', 'mangerai')])

  assert.equal(reference?.referenceSubject, 'je')
  assert.equal(reference?.form, 'mangerai')
  assert.equal(reference?.radical, 'manger')
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

test('le subjonctif présent conserve ses deux repères et ses six formes réelles', () => {
  const forms = [
    form('indicatif', 'présent', 7, 'nous', 'venons'),
    form('indicatif', 'présent', 9, 'ils', 'viennent'),
    ...[
      ['je', 'vienne'], ['tu', 'viennes'], ['il', 'vienne'], ['nous', 'venions'], ['vous', 'veniez'], ['ils', 'viennent'],
    ].map(([pronoun, value], index) => form('subjonctif', 'présent', index + 4, pronoun, value)),
  ]
  const reference = buildRadicalReference({
    infinitive: 'venir', mode: 'subjonctif', tense: 'présent', personId: 4, conjugation: 'vienne',
  }, forms)

  assert.deepEqual(reference?.subjunctivePresentReferences, [
    { subject: 'ils', form: 'viennent' },
    { subject: 'nous', form: 'venons' },
  ])
  assert.equal(reference?.subjunctivePresentForms?.length, 6)
  assert.deepEqual(reference?.subjunctivePresentForms?.[3], { subject: 'nous', form: 'venions', personId: 7 })
})

test('l’impératif part du présent et gère la disparition du s', () => {
  const reference = buildRadicalReference({
    infinitive: 'manger', mode: 'impératif', tense: 'présent', personId: 5, conjugation: 'mange',
  }, [
    form('indicatif', 'présent', 5, 'tu', 'manges'),
    form('indicatif', 'présent', 7, 'nous', 'mangeons'),
    form('indicatif', 'présent', 8, 'vous', 'mangez'),
  ])

  assert.equal(reference?.form, 'manges')
  assert.equal(reference?.removableEnding, 's')
  assert.equal(reference?.radical, 'mange')
  assert.deepEqual(reference?.imperativePresentReferences, [
    { subject: 'tu', form: 'manges' },
    { subject: 'nous', form: 'mangeons' },
    { subject: 'vous', form: 'mangez' },
  ])
})

test('le subjonctif imparfait utilise le passé simple comme forme repère', () => {
  const reference = buildRadicalReference({
    infinitive: 'venir', mode: 'subjonctif', tense: 'imparfait', personId: 4, conjugation: 'vinsse',
  }, [form('indicatif', 'passé simple', 6, 'il', 'vint')])

  assert.equal(reference?.kind, 'past-simple-il')
  assert.equal(reference?.radical, 'vin')
  assert.equal(reference?.removableEnding, 't')
})

test('le subjonctif imparfait à il utilise une terminaison accentuée explicite', () => {
  const regular = buildRadicalReference({
    infinitive: 'chatouiller', mode: 'subjonctif', tense: 'imparfait', personId: 6, conjugation: 'chatouillât',
  }, [form('indicatif', 'passé simple', 6, 'il', 'chatouilla')])
  const irregular = buildRadicalReference({
    infinitive: 'moudre', mode: 'subjonctif', tense: 'imparfait', personId: 6, conjugation: 'moulût',
  }, [form('indicatif', 'passé simple', 6, 'il', 'moulut')])

  assert.equal(regular?.radical, 'chatouill')
  assert.equal(regular?.removableEnding, 'a')
  assert.equal(regular?.targetEnding, 'ât')
  assert.equal(irregular?.radical, 'moul')
  assert.equal(irregular?.removableEnding, 'ut')
  assert.equal(irregular?.targetEnding, 'ût')
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

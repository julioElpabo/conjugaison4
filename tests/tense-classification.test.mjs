import assert from 'node:assert/strict'
import test from 'node:test'
import {
  classifyTenses,
  classifiedTenseToggleIds,
  isClassifiedTenseSelected,
  MERGED_TENSE_INFORMATION,
} from '../shared/utils/tense-classification.ts'

const modes = ['Indicatif', 'Subjonctif', 'Conditionnel', 'Impératif', 'Participe', 'Infinitif', 'Gérondif']
  .map((name, index) => ({ id: index + 1, name, order: index }))
const tense = (id, modeId, name, isCompound = false) => ({ id, modeId, name, isCompound, selected: false })
const tenses = [
  tense(1, 1, 'présent'), tense(2, 1, 'plus-que-parfait', true), tense(3, 1, 'futur proche'),
  tense(4, 2, 'présent'), tense(5, 2, 'plus-que-parfait', true),
  tense(6, 3, 'présent'), tense(7, 3, 'passé 1', true), tense(8, 3, 'passé 2', true),
  tense(9, 4, 'présent'), tense(10, 5, 'présent'), tense(11, 6, 'présent'), tense(12, 7, 'présent'),
]

test('la classification moderne déplace les deux conditionnels et conserve les autres rubriques', () => {
  const original = structuredClone(tenses)
  const entries = classifyTenses(modes, tenses, 'modern')
  assert.deepEqual(entries.filter(entry => [6, 7].includes(entry.id)).map(({ id, modeId, name, isCompound }) => ({ id, modeId, name, isCompound })), [
    { id: 6, modeId: 1, name: 'conditionnel présent', isCompound: false },
    { id: 7, modeId: 1, name: 'conditionnel passé', isCompound: true },
  ])
  assert.equal(entries.some(entry => entry.modeId === 3), false)
  assert.equal(entries.length, tenses.length - 1)
  for (const original of tenses.filter(entry => ![5, 6, 7, 8].includes(entry.id))) {
    assert.deepEqual(entries.find(entry => entry.id === original.id), { ...original, selectionIds: [original.id] })
  }
  assert.deepEqual(tenses, original, 'le catalogue d’origine reste intact')
})

test('la fusion utilise le plus-que-parfait du subjonctif et explique son ancien nom', () => {
  const entries = classifyTenses(modes, tenses, 'modern')
  const merged = entries.find(entry => entry.id === 5)
  assert.equal(merged.name, 'plus-que-parfait')
  assert.equal(merged.modeId, 2)
  assert.deepEqual(merged.selectionIds, [5, 8])
  assert.equal(merged.information, MERGED_TENSE_INFORMATION)
  assert.equal(entries.some(entry => entry.id === 8), false)
})

for (const selected of [[], [5], [8], [5, 8]]) {
  test(`aller-retour sans perte des sélections traditionnelles ${JSON.stringify(selected)}`, () => {
    const selectedIds = new Set([1, 6, 7, ...selected])
    const modern = classifyTenses(modes, tenses, 'modern')
    assert.equal(isClassifiedTenseSelected(modern.find(entry => entry.id === 5), selectedIds), selected.length > 0)
    const restored = classifyTenses(modes, tenses, 'traditional')
    assert.deepEqual(restored.filter(entry => isClassifiedTenseSelected(entry, selectedIds)).map(entry => entry.id), [1, ...selected.filter(id => id === 5), 6, 7, ...selected.filter(id => id === 8)])
    assert.deepEqual(restored.map(({ selectionIds, ...entry }) => entry), tenses)
  })
}

test('décocher la fusion enlève ses sources ; la recocher sélectionne seulement le subjonctif', () => {
  const merged = classifyTenses(modes, tenses, 'modern').find(entry => entry.id === 5)
  for (const selected of [[5], [8], [5, 8]]) {
    const selection = new Set([1, ...selected])
    for (const id of classifiedTenseToggleIds(merged, selection)) selection.delete(id)
    assert.deepEqual([...selection], [1])
    assert.equal(isClassifiedTenseSelected(merged, selection), false)
    assert.deepEqual(classifiedTenseToggleIds(merged, selection), [5])
  }
})

test('Tout cocher moderne ne contient qu’une seule source pour le temps fusionné', () => {
  const selected = classifyTenses(modes, tenses, 'modern').map(entry => entry.id)
  assert.equal(selected.includes(5), true)
  assert.equal(selected.includes(8), false)
  assert.equal(new Set(selected).size, tenses.length - 1)
})

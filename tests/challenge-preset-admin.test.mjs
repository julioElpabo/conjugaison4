import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  listStoredChallengePresets,
  parseChallengePresetCategoryPayload,
  parseChallengePresetPayload,
  reorderChallengePresets,
} from '../server/services/challenge-presets.ts'

describe('administration des défis pré-enregistrés', () => {
  it('conserve toutes les options, les temps et les formes pronominales explicites', () => {
    const parsed = parseChallengePresetPayload({
      id: 'accords-avances',
      label: 'Accords avancés',
      description: 'Un défi complet.',
      categoryId: 4,
      questionCount: 25,
      exerciseKind: 'tense-identification',
      pastSimplePronouns: 'third-person-only',
      inclusivePronouns: true,
      complementOptions: ['cod-after', 'cod-before', 'coi-after', 'coi-before'],
      verbIds: [12, -7, 12],
      tenseIds: [1, 5, 5],
      sortOrder: 8,
      isActive: false,
    })

    assert.deepEqual(parsed.verbIds, [12, -7])
    assert.deepEqual(parsed.tenseIds, [1, 5])
    assert.deepEqual(parsed.complementOptions, ['cod-after', 'cod-before', 'coi-after', 'coi-before'])
    assert.equal(parsed.exerciseKind, 'tense-identification')
    assert.equal(parsed.pastSimplePronouns, 'third-person-only')
    assert.equal(parsed.inclusivePronouns, true)
    assert.equal(parsed.isActive, false)
  })

  it('normalise l’identifiant d’une nouvelle catégorie', () => {
    assert.deepEqual(parseChallengePresetCategoryPayload({
      slug: '  Difficultés spéciales  ',
      name: 'Difficultés spéciales',
      description: '',
      sortOrder: 6,
      isActive: true,
    }), {
      slug: 'difficultes-speciales',
      name: 'Difficultés spéciales',
      description: '',
      sortOrder: 6,
      isActive: true,
    })
  })

  it('restitue une sélection explicite et les métadonnées dynamiques de catégorie', async () => {
    const executor = {
      execute(sql) {
        if (sql.includes('FROM challenge_presets p')) return Promise.resolve([[
          {
            databaseId: 9, presetKey: 'sur-mesure', categoryId: 3,
            categorySlug: 'personnalises', categoryName: 'Personnalisés', categoryOrder: 2,
            name: 'Sur mesure', description: 'Configuration administrée', questionCount: 14,
            exerciseKind: 'conjugation', pastSimplePronouns: 'all', inclusivePronouns: 1,
            complementOptions: JSON.stringify(['cod-before', 'coi-after']),
            verbSelectionMode: 'explicit', criteriaJson: '[]', sortOrder: 4, isActive: 1,
          },
        ], []])
        if (sql.includes('FROM challenge_preset_verbs')) return Promise.resolve([[
          { presetId: 9, selectionId: 42 }, { presetId: 9, selectionId: -3 },
        ], []])
        if (sql.includes('FROM challenge_preset_tenses')) return Promise.resolve([[
          { presetId: 9, selectionId: 1 }, { presetId: 9, selectionId: 6 },
        ], []])
        throw new Error(`Requête inattendue: ${sql}`)
      },
    }

    const [preset] = await listStoredChallengePresets(executor, [], true)
    assert.equal(preset.group, 'personnalises')
    assert.equal(preset.groupLabel, 'Personnalisés')
    assert.equal(preset.groupOrder, 2)
    assert.deepEqual(preset.verbIds, [42, -3])
    assert.deepEqual(preset.tenseIds, [1, 6])
    assert.deepEqual(preset.complementOptions, ['cod-before', 'coi-after'])
    assert.equal(preset.includeComplements, true)
    assert.equal(preset.complementPlacement, 'mixed')
  })

  it('reconstruit un ordre continu propre à la catégorie', async () => {
    const updates = []
    const connection = {
      execute(sql, parameters) {
        if (sql.includes('SELECT id')) return Promise.resolve([[{ id: 11 }, { id: 12 }, { id: 14 }], []])
        if (sql.startsWith('UPDATE challenge_presets')) {
          updates.push(parameters)
          return Promise.resolve([{ affectedRows: 1 }, []])
        }
        throw new Error(`Requête inattendue: ${sql}`)
      },
    }

    const orders = await reorderChallengePresets(connection, 4, 13, 2)
    assert.deepEqual(orders, [
      { id: 11, sortOrder: 1 },
      { id: 13, sortOrder: 2 },
      { id: 12, sortOrder: 3 },
      { id: 14, sortOrder: 4 },
    ])
    assert.deepEqual(updates, [[1, 11], [2, 13], [3, 12], [4, 14]])
  })
})

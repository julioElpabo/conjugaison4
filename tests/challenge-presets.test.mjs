import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  CHALLENGE_PRESETS,
  challengeConfigFromLegacyTuple,
  challengeConfigToLegacyTuple,
  challengePresets,
  getChallengePreset,
  inspectPresetCompatibility,
  isChallengePresetId,
} from '../shared/data/challenge-presets.ts'

describe('challengePresets', () => {
  it('expose les 23 défis historiques avec des identifiants uniques', () => {
    assert.equal(challengePresets.length, 23)
    assert.equal(new Set(challengePresets.map(preset => preset.id)).size, 23)
    assert.equal(isChallengePresetId('7H'), true)
    assert.equal(isChallengePresetId('inconnu'), false)
  })

  it('normalise chaque preset en configuration valide', () => {
    for (const preset of challengePresets) {
      assert.ok(preset.verbIds.length > 0, `${preset.id}: aucun verbe`)
      assert.ok(preset.tenseIds.length > 0, `${preset.id}: aucun temps`)
      assert.ok(Number.isInteger(preset.questionCount) && preset.questionCount > 0)
      assert.equal(new Set(preset.verbIds).size, preset.verbIds.length, `${preset.id}: verbes en double`)
      assert.equal(new Set(preset.tenseIds).size, preset.tenseIds.length, `${preset.id}: temps en double`)
      assert.ok(preset.verbIds.every(id => Number.isInteger(id) && id > 0))
      assert.ok(preset.tenseIds.every(id => Number.isInteger(id) && id > 0))
      assert.equal(preset.exerciseKind, 'conjugation')
      assert.equal(preset.pastSimplePronouns, 'all')
      assert.equal(preset.inclusivePronouns, false)
    }
  })

  it('est adapté aux IDs connus de la base cible', () => {
    assert.equal(CHALLENGE_PRESETS.cer.verbIds.includes(262), false)
    assert.equal(CHALLENGE_PRESETS['ger-cer'].verbIds.includes(262), false)
    assert.equal(CHALLENGE_PRESETS.groupe3.verbIds.filter(id => id === 31).length, 1)

    const combined = new Set([
      ...CHALLENGE_PRESETS.ger.verbIds,
      ...CHALLENGE_PRESETS.cer.verbIds,
    ])
    assert.deepEqual(new Set(CHALLENGE_PRESETS['ger-cer'].verbIds), combined)
  })

  it('retourne une copie qui ne modifie pas le catalogue', () => {
    const copy = getChallengePreset('5P')
    assert.ok(copy)
    copy.verbIds.push(9999)
    copy.tenseIds.length = 0

    assert.equal(CHALLENGE_PRESETS['5P'].verbIds.includes(9999), false)
    assert.deepEqual(CHALLENGE_PRESETS['5P'].tenseIds, [1, 2])
    assert.equal(getChallengePreset('inconnu'), null)
  })
})

describe('conversion du format historique', () => {
  it('convertit le tuple historique sans conserver de doublons invalides', () => {
    const config = challengeConfigFromLegacyTuple([[1, 2, 2, -1], [1, 1, 3], 12])

    assert.deepEqual(config, {
      verbIds: [1, 2],
      tenseIds: [1, 3],
      questionCount: 12,
      exerciseKind: 'conjugation',
      pastSimplePronouns: 'all',
      inclusivePronouns: false,
    })
    assert.deepEqual(challengeConfigToLegacyTuple(config), [[1, 2], [1, 3], 12])
  })

  it('remplace un nombre de questions invalide par 20', () => {
    assert.equal(challengeConfigFromLegacyTuple([[1], [1], 0]).questionCount, 20)
  })
})

describe('inspectPresetCompatibility', () => {
  it('rapporte séparément les IDs de verbes et de temps manquants', () => {
    const result = inspectPresetCompatibility(
      {
        verbIds: [1, 2, 999],
        tenseIds: [1, 77],
        questionCount: 10,
        exerciseKind: 'conjugation',
        pastSimplePronouns: 'all',
        inclusivePronouns: false,
      },
      [1, 2],
      [1],
    )

    assert.deepEqual(result, {
      isCompatible: false,
      missingVerbIds: [999],
      missingTenseIds: [77],
    })
  })
})


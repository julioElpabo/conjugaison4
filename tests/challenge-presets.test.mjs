import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  challengeConfigFromLegacyTuple,
  challengeConfigToLegacyTuple,
  challengePresetDefinitions,
  getChallengePreset,
  inspectPresetCompatibility,
  isChallengePresetId,
  resolveChallengePresets,
} from '../shared/data/challenge-presets.ts'

function verb(id, infinitif, metadata = {}) {
  return {
    id, infinitif, participePresent: '', participePasse: '', auxiliaire: 'avoir',
    groupeConjugaison: 1, familleConjugaison: 'er-regulier', terminaison: 'er', typePronominal: 'aucun',
    estImpersonnel: false, estDefectif: false, personnesDisponibles: [4, 5, 6, 7, 8, 9], typeHInitial: null,
    niveauDifficulte: 1, niveauCecrl: null, rangFrequence: null, registrePrincipal: 'courant',
    formeCanonique: infinitif, statutValidation: 'genere', particularites: [], niveauxScolaires: [],
    parcoursCif: [], categoriesSemantiques: [], ...metadata,
  }
}

const verbs = [
  verb(41, 'aimer', { niveauxScolaires: ['5P'], categoriesSemantiques: ['emotion'] }),
  verb(7, 'manger', { particularites: ['ger'] }),
  verb(99, 'venir', { groupeConjugaison: 3, familleConjugaison: 'venir-tenir', terminaison: 'ir', categoriesSemantiques: ['mouvement'] }),
  verb(5, 'se laver', { typePronominal: 'occasionnel', particularites: ['pronominal'], categoriesSemantiques: ['corps'] }),
  verb(12, 'absoudre', { groupeConjugaison: 3, terminaison: 're', niveauDifficulte: 3, registrePrincipal: 'rare' }),
]

describe('défis résolus par critères', () => {
  it('expose les 28 défis avec des identifiants uniques et sans liste de verbes figée', () => {
    assert.equal(challengePresetDefinitions.length, 28)
    assert.equal(new Set(challengePresetDefinitions.map(preset => preset.id)).size, 28)
    assert.ok(challengePresetDefinitions.every(preset => !Object.hasOwn(preset, 'verbIds')))
    assert.equal(isChallengePresetId('7H'), true)
    assert.equal(isChallengePresetId('inconnu'), false)
  })

  it('résout les groupes, les difficultés et le sens à partir des métadonnées', () => {
    const resolved = Object.fromEntries(resolveChallengePresets(verbs).map(preset => [preset.id, preset]))
    assert.deepEqual(resolved['5P'].verbIds, [41])
    assert.deepEqual(resolved.ger.verbIds, [7])
    assert.deepEqual(resolved.groupe3ir.verbIds, [99])
    assert.deepEqual(resolved.pronominaux.verbIds, [5])
    assert.deepEqual(resolved.rares.verbIds, [12])
    assert.deepEqual(resolved.difficiles.verbIds, [12])
    assert.deepEqual(resolved['sens-mouvement'].verbIds, [99])
    assert.deepEqual(resolved['sens-corps'].verbIds, [5])
  })

  it('produit des configurations valides', () => {
    for (const preset of resolveChallengePresets(verbs)) {
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

  it('retourne une copie qui ne modifie pas le catalogue', () => {
    const copy = getChallengePreset('5P', verbs)
    assert.ok(copy)
    copy.verbIds.push(9999)
    copy.tenseIds.length = 0

    const fresh = getChallengePreset('5P', verbs)
    assert.equal(fresh.verbIds.includes(9999), false)
    assert.deepEqual(fresh.tenseIds, [1, 2])
    assert.equal(getChallengePreset('inconnu', verbs), null)
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

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
  usefulAllophoneChallengeId,
  usefulAllophoneVerbInfinitives,
} from '../shared/data/challenge-presets.ts'
import {
  frenchSchoolLevels,
  frenchSchoolMissingVerbClones,
  frenchSchoolTenseIds,
  frenchSchoolVerbInfinitives,
  transformFrenchSchoolVerbForm,
} from '../shared/data/french-school-programme.ts'
import {
  challengePresetTrackingDescription,
  challengePresetTrackingTitle,
} from '../shared/utils/challenge-preset-tracking.ts'

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
  verb(41, 'aimer', {
    niveauxScolaires: ['5P'], categoriesSemantiques: ['emotion'],
    complementExample: { functionObject: 'cod', after: 'cette chanson', before: 'la chanson' },
  }),
  verb(7, 'manger', {
    particularites: ['ger'],
    complementExample: { functionObject: 'cod', after: 'une pomme', before: 'la pomme' },
  }),
  verb(99, 'venir', { groupeConjugaison: 3, familleConjugaison: 'venir-tenir', terminaison: 'ir', categoriesSemantiques: ['mouvement'] }),
  verb(5, 'se laver', { typePronominal: 'occasionnel', particularites: ['pronominal'], categoriesSemantiques: ['corps'] }),
  verb(12, 'absoudre', { groupeConjugaison: 3, terminaison: 're', niveauDifficulte: 3, registrePrincipal: 'rare' }),
]

describe('défis résolus par critères', () => {
  it('conserve un titre et une description explicites pour le suivi élève', () => {
    const preset = resolveChallengePresets(verbs).find(candidate => candidate.id === '5P')

    assert.equal(challengePresetTrackingTitle(preset), 'Niveaux scolaires suisses | 5P')
    assert.equal(challengePresetTrackingDescription(), 'Tous les verbes')
    assert.equal(challengePresetTrackingDescription(5), '5 au hasard')
  })

  it('expose les 38 défis avec des identifiants uniques et sans liste d’identifiants de verbes figée', () => {
    assert.equal(challengePresetDefinitions.length, 38)
    assert.equal(new Set(challengePresetDefinitions.map(preset => preset.id)).size, 38)
    assert.ok(challengePresetDefinitions.every(preset => !Object.hasOwn(preset, 'verbIds')))
    assert.equal(isChallengePresetId('7H'), true)
    assert.equal(isChallengePresetId('france-cp'), true)
    assert.equal(isChallengePresetId(usefulAllophoneChallengeId), true)
    assert.equal(isChallengePresetId('cod-avant-passe-compose'), false)
    assert.equal(isChallengePresetId('inconnu'), false)
  })

  it('reproduit cumulativement les neuf niveaux scolaires français', () => {
    assert.deepEqual(frenchSchoolLevels, ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e'])
    assert.deepEqual(
      frenchSchoolLevels.map(level => frenchSchoolVerbInfinitives[level].length),
      [2, 16, 40, 47, 47, 47, 60, 60, 60],
    )
    assert.deepEqual(frenchSchoolTenseIds.CP, [1])
    assert.deepEqual(frenchSchoolTenseIds.CE1, [1, 2, 3, 5])
    assert.deepEqual(frenchSchoolTenseIds.CM2, [1, 2, 3, 5, 4, 7])
    assert.deepEqual(frenchSchoolTenseIds['6e'], [1, 2, 3, 5, 4, 7, 14, 9])
    assert.deepEqual(frenchSchoolTenseIds['5e'], [1, 2, 3, 5, 4, 7, 14, 9, 6, 8])
    assert.deepEqual(frenchSchoolTenseIds['4e'], [1, 2, 3, 5, 4, 7, 14, 9, 6, 8, 15, 10])
    assert.deepEqual(frenchSchoolTenseIds['3e'], [1, 2, 3, 5, 4, 7, 14, 9, 6, 8, 15, 10, 11])

    const frenchDefinitions = challengePresetDefinitions.filter(preset => preset.group === 'school-france')
    assert.deepEqual(frenchDefinitions.map(preset => preset.label), frenchSchoolLevels)
    assert.ok(frenchDefinitions.every(preset => preset.questionCount === 10))
  })

  it('résout chaque défi français avec les verbes exacts de son niveau', () => {
    const catalogue = frenchSchoolVerbInfinitives['3e'].map((infinitif, index) => verb(index + 1, infinitif))
    const frenchPresets = resolveChallengePresets(catalogue).filter(preset => preset.group === 'school-france')

    for (const preset of frenchPresets) {
      const level = preset.label
      assert.deepEqual(
        preset.verbIds,
        frenchSchoolVerbInfinitives[level].map(infinitif => catalogue.find(item => item.infinitif === infinitif).id),
      )
      assert.deepEqual(preset.tenseIds, frenchSchoolTenseIds[level])
    }
    assert.equal(challengePresetTrackingTitle(frenchPresets[0]), 'Niveaux scolaires français | CP')
  })

  it('dérive correctement les sept verbes absents de modèles de même famille', () => {
    assert.equal(frenchSchoolMissingVerbClones.length, 7)
    const clones = Object.fromEntries(frenchSchoolMissingVerbClones.map(clone => [clone.infinitive, clone]))
    assert.equal(transformFrenchSchoolVerbForm('j’ai aimé', clones.rouler), 'j’ai roulé')
    assert.equal(transformFrenchSchoolVerbForm('que nous pelions', clones.geler), 'que nous gelions')
    assert.equal(transformFrenchSchoolVerbForm('il pèle', clones.geler), 'il gèle')
    assert.equal(transformFrenchSchoolVerbForm('nous plaçons', clones.tracer), 'nous traçons')
    assert.equal(transformFrenchSchoolVerbForm('ils emploieront', clones.aboyer), 'ils aboieront')
    assert.equal(transformFrenchSchoolVerbForm('vous employez', clones.nettoyer), 'vous nettoyez')
    assert.equal(transformFrenchSchoolVerbForm('ils finissent', clones.salir), 'ils salissent')
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

  it('classe les parcours CIF séparément et les autres difficultés ensemble', () => {
    const definitions = Object.fromEntries(challengePresetDefinitions.map(preset => [preset.id, preset]))
    assert.equal(definitions.CIF1.group, 'cif')
    assert.equal(definitions.CIF4.group, 'cif')
    assert.equal(definitions.rares.group, 'spelling')
    assert.equal(definitions.difficiles.group, 'spelling')
    assert.equal(definitions.pronominaux.group, 'spelling')
    assert.equal(challengePresetDefinitions.some(preset => preset.group === 'training'), false)
  })

  it('propose exactement 100 verbes utiles aux cinq temps demandés pour les allophones', () => {
    const definition = challengePresetDefinitions.find(preset => preset.id === usefulAllophoneChallengeId)
    assert.ok(definition)
    assert.equal(definition.group, 'cif')
    assert.equal(definition.questionCount, 20)
    assert.deepEqual(definition.tenseIds, [1, 2, 3, 24, 5])
    assert.equal(usefulAllophoneVerbInfinitives.length, 100)
    assert.equal(new Set(usefulAllophoneVerbInfinitives).size, 100)

    const catalogue = usefulAllophoneVerbInfinitives.map((infinitif, index) => verb(index + 1, infinitif))
    const preset = getChallengePreset(usefulAllophoneChallengeId, catalogue)
    assert.ok(preset)
    assert.equal(preset.verbIds.length, 100)
  })

  it('sélectionne le futur proche par défaut dans tous les défis CIF', () => {
    const cifPresets = challengePresetDefinitions.filter(preset => preset.group === 'cif')
    assert.deepEqual(cifPresets.map(preset => preset.id), ['CIF1', 'CIF2', 'CIF3', 'CIF4', usefulAllophoneChallengeId])
    assert.ok(cifPresets.every(preset => preset.tenseIds.includes(24)))
  })

  it('produit des configurations valides', () => {
    for (const preset of resolveChallengePresets(verbs)) {
      const definition = challengePresetDefinitions.find(candidate => candidate.id === preset.id)
      assert.ok(definition)
      assert.ok(preset.tenseIds.length > 0, `${preset.id}: aucun temps`)
      assert.equal(
        preset.questionCount,
        preset.id === usefulAllophoneChallengeId ? 20 : 10,
        `${preset.id}: nombre de questions`,
      )
      assert.equal(new Set(preset.verbIds).size, preset.verbIds.length, `${preset.id}: verbes en double`)
      assert.equal(new Set(preset.tenseIds).size, preset.tenseIds.length, `${preset.id}: temps en double`)
      assert.ok(preset.verbIds.every(id => Number.isInteger(id) && id > 0))
      assert.ok(preset.tenseIds.every(id => Number.isInteger(id) && id > 0))
      assert.equal(preset.exerciseKind, 'conjugation')
      assert.equal(preset.pastSimplePronouns, 'all')
      assert.equal(preset.inclusivePronouns, false)
      assert.equal(preset.includeComplements, definition.includeComplements ?? false)
      assert.equal(preset.complementPlacement, definition.complementPlacement ?? 'after')
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
      identificationSource: 'selected-verbs',
      pastSimplePronouns: 'all',
      inclusivePronouns: false,
      includeOnPronoun: false,
      voiceMode: 'active',
      includeComplements: false,
      complementPlacement: 'after',
      complementOptions: [],
    })
    assert.deepEqual(challengeConfigToLegacyTuple(config), [[1, 2], [1, 3], 12])
  })

  it('remplace un nombre de questions invalide par 10', () => {
    assert.equal(challengeConfigFromLegacyTuple([[1], [1], 0]).questionCount, 10)
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
        includeComplements: false,
        complementPlacement: 'after',
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

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { analyzeConjugationTraps } from '../shared/utils/conjugation-traps.ts'

const modes = [
  { id: 1, name: 'indicatif', order: 1 },
  { id: 2, name: 'conditionnel', order: 2 },
  { id: 3, name: 'impératif', order: 3 },
]
const tenses = [
  { id: 1, modeId: 1, name: 'présent', isCompound: false, selected: false },
  { id: 2, modeId: 1, name: 'imparfait', isCompound: false, selected: false },
  { id: 3, modeId: 1, name: 'futur', isCompound: false, selected: false },
  { id: 4, modeId: 2, name: 'présent', isCompound: false, selected: false },
  { id: 5, modeId: 3, name: 'présent', isCompound: false, selected: false },
  { id: 6, modeId: 1, name: 'passé composé', isCompound: true, selected: false },
]

function verb(overrides = {}) {
  return {
    infinitif: 'manger', participePasse: 'mangé', groupeConjugaison: 1,
    estImpersonnel: false, estDefectif: false, ...overrides,
  }
}

function row(tenseId, personId, ...forms) {
  return { id: tenseId * 10 + personId, tenseId, personId, pronoun: 'je', forms }
}

function markedTexts(analysis, trapId) {
  return analysis.markers
    .filter(marker => marker.trapId === trapId)
    .map(marker => marker.form.slice(marker.start, marker.start + marker.length))
}

describe('détection des pièges dans les conjugaisons stockées', () => {
  it('repère le e protecteur, la cédille et les deux i', () => {
    const analysis = analyzeConjugationTraps(verb(), [
      row(2, 4, 'mangeais'), row(1, 7, 'mangeons'),
      row(2, 7, 'commencions'),
    ], tenses, modes)
    assert.deepEqual(markedTexts(analysis, 'softG'), ['e', 'e'])

    const cedilla = analyzeConjugationTraps(verb({ infinitif: 'commencer' }), [
      row(2, 4, 'commençais'),
    ], tenses, modes)
    assert.deepEqual(markedTexts(cedilla, 'cedilla'), ['ç'])

    const doubleI = analyzeConjugationTraps(verb({ infinitif: 'crier' }), [
      row(2, 7, 'criions'),
    ], tenses, modes)
    assert.deepEqual(markedTexts(doubleI, 'doubleI'), ['ii'])
  })

  it('repère les changements y/i, e/è et les consonnes doublées', () => {
    const y = analyzeConjugationTraps(verb({ infinitif: 'payer' }), [row(1, 4, 'paie')], tenses, modes)
    assert.deepEqual(markedTexts(y, 'yToI'), ['i'])

    const accent = analyzeConjugationTraps(verb({ infinitif: 'acheter' }), [row(1, 4, 'achète')], tenses, modes)
    assert.deepEqual(markedTexts(accent, 'graveAccent'), ['è'])

    const doubled = analyzeConjugationTraps(verb({ infinitif: 'jeter' }), [row(1, 4, 'jette')], tenses, modes)
    assert.deepEqual(markedTexts(doubled, 'doubleConsonant'), ['tt'])
  })

  it('compare le radical du futur et les terminaisons futur/conditionnel', () => {
    const analysis = analyzeConjugationTraps(verb({ infinitif: 'venir', groupeConjugaison: 3, participePasse: 'venu' }), [
      row(3, 4, 'viendrai'), row(4, 4, 'viendrais'),
    ], tenses, modes)
    assert.deepEqual(markedTexts(analysis, 'futureStem'), ['viendr', 'viendr'])
    assert.deepEqual(markedTexts(analysis, 'futureConditional'), ['ai', 'ais'])

    const contextualized = analyzeConjugationTraps(verb(), [
      row(3, 4, 'mangerai'), row(4, 4, 'mangerais'),
    ], tenses, modes, 'une pomme')
    assert.deepEqual(
      contextualized.traps.find(trap => trap.id === 'futureConditional')?.examples,
      ['Demain, je mangerai une pomme.', 'Si c’était possible, je mangerais une pomme.'],
    )
  })

  it('ignore le participe passé et signale les variantes et les verbes incomplets', () => {
    const analysis = analyzeConjugationTraps(verb({
      infinitif: 'prendre', participePasse: 'pris', groupeConjugaison: 3, estDefectif: true,
    }), [row(6, 4, 'ai pris', 'ai prit')], tenses, modes)
    assert.equal(analysis.traps.some(trap => trap.id === 'irregularParticiple'), false)
    assert.equal(analysis.traps.some(trap => trap.id === 'variants'), true)
    assert.equal(analysis.traps.some(trap => trap.id === 'defective'), true)
  })

  it('transforme l’exemple repéré en phrase avec le COD fourni par la base', () => {
    const analysis = analyzeConjugationTraps(verb(), [row(2, 7, 'mangions')], tenses, modes, 'une pomme')
    assert.deepEqual(analysis.traps.find(trap => trap.id === 'silentEnt')?.examples, undefined)

    const plural = analyzeConjugationTraps(verb(), [
      { ...row(1, 9, 'mangent'), pronoun: 'ils' },
    ], tenses, modes, 'une pomme')
    assert.deepEqual(
      plural.traps.find(trap => trap.id === 'silentEnt')?.examples,
      ['Ils mangent une pomme.'],
    )
  })
})

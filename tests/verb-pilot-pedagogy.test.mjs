import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { verbPilot202601 } from '../shared/data/verb-pilot-2026-01.mjs'
import { verbPilot202601Part02 } from '../shared/data/verb-pilot-2026-01-part-02.mjs'
import { verbPilot202601Part03 } from '../shared/data/verb-pilot-2026-01-part-03.mjs'
import { verbPilot202601Part04 } from '../shared/data/verb-pilot-2026-01-part-04.mjs'
import { verbPilot202601Part05 } from '../shared/data/verb-pilot-2026-01-part-05.mjs'
import {
  validatePedagogicalPilot,
  validatedComplementGrammar,
} from '../scripts/validate-verb-pilot-pedagogy.mjs'

const expected = [
  'désoler', 'importer', 'prier', 'mentir', 'supposer',
  'revoir', 'maintenir', 'pleurer', 'prévoir', 'dégager',
  'signifier', 'ravir', 'appartenir', 'parier', 'deviner',
  'rater', 'respirer', 'fonctionner', 'remplir', 'durer',
]

describe('premier sous-lot pédagogique de verbes', () => {
  it('valide les vingt verbes dans leur ordre de priorité', () => {
    const result = validatePedagogicalPilot(verbPilot202601, expected)
    assert.deepEqual(result.errors, [])
    assert.equal(result.entryCount, 20)
  })

  it('contient vingt définitions courtes et cent cinquante compléments', () => {
    const result = validatePedagogicalPilot(verbPilot202601, expected)
    assert.equal(result.definitionCount, 20)
    assert.equal(result.complementCount, 150)
  })

  it('valide séparément quatre emplois pronominaux naturels', () => {
    const uses = verbPilot202601.filter(entry => entry.pronominalUse)
    assert.deepEqual(uses.map(entry => entry.pronominalUse.infinitive), [
      'se désoler', 'se revoir', 'se maintenir', 'se dégager',
    ])
    assert.deepEqual(
      uses.find(entry => entry.infinitive === 'revoir').pronominalUse.allowedPersons,
      [7, 8, 9],
    )
  })

  it('attribue un genre, un nombre et une antéposition à chaque COD', () => {
    const cod = verbPilot202601
      .filter(entry => entry.sense.complementType === 'cod')
      .flatMap(entry => entry.sense.complements)
    assert.ok(cod.length > 0)
    assert.ok(cod.every(complement => validatedComplementGrammar(complement)))
  })
})

const expectedPart02 = [
  'rechercher', 'refaire', 'dépendre', 'soutenir', 'guérir',
  'autoriser', 'correspondre', 'voter', 'réunir', 'déménager',
  'insister', 'décevoir', 'viser', 'réagir', 'enquêter',
  'contenir', 'fêter', 'fournir', 'veiller', 'visiter',
]

describe('deuxième sous-lot pédagogique de verbes', () => {
  it('valide les vingt verbes dans leur ordre de priorité', () => {
    const result = validatePedagogicalPilot(verbPilot202601Part02, expectedPart02)
    assert.deepEqual(result.errors, [])
    assert.equal(result.entryCount, 20)
  })

  it('contient vingt définitions courtes et cent cinquante compléments', () => {
    const result = validatePedagogicalPilot(verbPilot202601Part02, expectedPart02)
    assert.equal(result.definitionCount, 20)
    assert.equal(result.complementCount, 150)
  })

  it('valide séparément quatre emplois pronominaux naturels', () => {
    const uses = verbPilot202601Part02.filter(entry => entry.pronominalUse)
    assert.deepEqual(uses.map(entry => entry.pronominalUse.infinitive), [
      'se soutenir', 's’autoriser', 'se réunir', 'se contenir',
    ])
    assert.deepEqual(
      uses.find(entry => entry.infinitive === 'réunir').pronominalUse.allowedPersons,
      [7, 8, 9],
    )
  })

  it('attribue un genre, un nombre et une antéposition à chaque COD', () => {
    const cod = verbPilot202601Part02
      .filter(entry => entry.sense.complementType === 'cod')
      .flatMap(entry => entry.sense.complements)
    assert.equal(cod.length, 120)
    assert.ok(cod.every(complement => validatedComplementGrammar(complement)))
  })
})

const expectedPart03 = [
  'échanger', 'renoncer', 'obéir', 'ordonner', 'douer',
  'mentionner', 'repérer', 'hésiter', 'hurler', 'établir',
  'vomir', 'parer', 'déclencher', 'avérer', 'foncer',
  'embarquer', 'chérir', 'exiger', 'boiter', 'transporter',
]

describe('troisième sous-lot pédagogique de verbes', () => {
  it('valide les vingt verbes dans leur ordre de priorité', () => {
    const result = validatePedagogicalPilot(verbPilot202601Part03, expectedPart03)
    assert.deepEqual(result.errors, [])
    assert.equal(result.entryCount, 20)
  })

  it('contient vingt définitions courtes et cent trente compléments', () => {
    const result = validatePedagogicalPilot(verbPilot202601Part03, expectedPart03)
    assert.equal(result.definitionCount, 20)
    assert.equal(result.complementCount, 130)
  })

  it('valide séparément quatre emplois pronominaux naturels', () => {
    const uses = verbPilot202601Part03.filter(entry => entry.pronominalUse)
    assert.deepEqual(uses.map(entry => entry.pronominalUse.infinitive), [
      's’échanger', 'se repérer', 's’établir', 's’avérer',
    ])
    assert.deepEqual(
      uses.find(entry => entry.infinitive === 'avérer').pronominalUse.allowedPersons,
      [6, 9],
    )
  })

  it('attribue un genre, un nombre et une antéposition à chaque COD', () => {
    const cod = verbPilot202601Part03
      .filter(entry => entry.sense.complementType === 'cod')
      .flatMap(entry => entry.sense.complements)
    assert.equal(cod.length, 110)
    assert.ok(cod.every(complement => validatedComplementGrammar(complement)))
  })
})

const expectedPart04 = [
  'navrer', 'entourer', 'lutter', 'ralentir', 'dater',
  'intervenir', 'déterminer', 'puer', 'garantir', 'emménager',
  'rassurer', 'concevoir', 'adopter', 'sécuriser', 'parvenir',
  'grimper', 'évacuer', 'reparler', 'redevenir', 'analyser',
]

describe('quatrième sous-lot pédagogique de verbes', () => {
  it('valide les vingt verbes dans leur ordre de priorité', () => {
    const result = validatePedagogicalPilot(verbPilot202601Part04, expectedPart04)
    assert.deepEqual(result.errors, [])
    assert.equal(result.entryCount, 20)
  })

  it('contient vingt définitions courtes et cent quarante compléments', () => {
    const result = validatePedagogicalPilot(verbPilot202601Part04, expectedPart04)
    assert.equal(result.definitionCount, 20)
    assert.equal(result.complementCount, 140)
  })

  it('valide séparément quatre emplois pronominaux naturels', () => {
    const uses = verbPilot202601Part04.filter(entry => entry.pronominalUse)
    assert.deepEqual(uses.map(entry => entry.pronominalUse.infinitive), [
      'se ralentir', 'se déterminer', 'se rassurer', 's’évacuer',
    ])
    assert.deepEqual(
      uses.find(entry => entry.infinitive === 'évacuer').pronominalUse.allowedPersons,
      [6, 9],
    )
  })

  it('attribue un genre, un nombre et une antéposition à chaque COD', () => {
    const cod = verbPilot202601Part04
      .filter(entry => entry.sense.complementType === 'cod')
      .flatMap(entry => entry.sense.complements)
    assert.equal(cod.length, 120)
    assert.ok(cod.every(complement => validatedComplementGrammar(complement)))
  })
})

const expectedPart05 = [
  'larguer', 'bourrer', 'pourrir', 'embaucher', 'effondrer',
  'investir', 'tarder', 'franchir', 'fréquenter', 'sacrer',
  'provenir', 'sécher', 'doubler', 'draguer', 'activer',
  'contrer', 'unir', 'reproduire', 'griller', 'accélérer',
]

describe('cinquième sous-lot pédagogique de verbes', () => {
  it('valide les vingt verbes dans leur ordre de priorité', () => {
    const result = validatePedagogicalPilot(verbPilot202601Part05, expectedPart05)
    assert.deepEqual(result.errors, [])
    assert.equal(result.entryCount, 20)
  })

  it('contient vingt définitions courtes et cent soixante compléments', () => {
    const result = validatePedagogicalPilot(verbPilot202601Part05, expectedPart05)
    assert.equal(result.definitionCount, 20)
    assert.equal(result.complementCount, 160)
  })

  it('valide séparément quatre emplois pronominaux naturels', () => {
    const uses = verbPilot202601Part05.filter(entry => entry.pronominalUse)
    assert.deepEqual(uses.map(entry => entry.pronominalUse.infinitive), [
      's’effondrer', 'se sécher', 's’unir', 's’accélérer',
    ])
    assert.deepEqual(
      uses.find(entry => entry.infinitive === 'unir').pronominalUse.allowedPersons,
      [7, 8, 9],
    )
  })

  it('attribue un genre, un nombre et une antéposition à chaque COD', () => {
    const cod = verbPilot202601Part05
      .filter(entry => entry.sense.complementType === 'cod')
      .flatMap(entry => entry.sense.complements)
    assert.equal(cod.length, 150)
    assert.ok(cod.every(complement => validatedComplementGrammar(complement)))
  })
})

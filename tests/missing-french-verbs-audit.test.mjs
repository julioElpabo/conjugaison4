import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  lexiqueDataLines,
  missingVerbCandidates,
  parseLexiqueVerbLemmas,
  probableConjugationFamily,
} from '../scripts/audit-missing-french-verbs.mjs'

const lexiqueSample = [
  '1_Mot\t2_Phono\t3_Phono_IPA\t4_Lemme\t5_Cgram\t6_CgramOrtho\t7_Genre\t8_Nombre\t9_InfoVER\t10_FreqMot\t11_FreqOrtho\t12_FreqLemme\t13_CDOrtho\t14_IsLem',
  'accueillir\t\t\taccueillir\tVER\tVER\t\t\tinf\t1\t1\t245.5\t1\t1',
  'accueille\t\t\taccueillir\tVER\tVER\t\t\tind:pre:1\t1\t1\t245.5\t1\t0',
  'maison\t\t\tmaison\tNOM\tNOM\tf\ts\t\t1\t1\t500\t1\t1',
  'réabonner\t\t\tréabonner\tVER\tVER\t\t\tinf\t1\t1\t12.25\t1\t1',
].join('\n')

describe('audit des verbes français manquants', () => {
  it('lit le TSV Lexique et ne conserve que les infinitifs verbaux', () => {
    assert.deepEqual(parseLexiqueVerbLemmas(lexiqueSample), [
      { lemma: 'accueillir', frequency: 245.5 },
      { lemma: 'réabonner', frequency: 12.25 },
    ])
  })

  it('lit aussi la représentation HTML du miroir Stagit', () => {
    const html = `<html><pre id="blob"><a href="#l1">1</a> ${lexiqueSample.replaceAll('\n', '\n<a href="#">2</a> ')}</pre></html>`
    const lines = lexiqueDataLines(html)
    assert.equal(lines[0].startsWith('1_Mot\t'), true)
    assert.equal(parseLexiqueVerbLemmas(html).length, 2)
  })

  it('distingue les absences, archives et conflits d’accent', () => {
    const candidates = missingVerbCandidates(parseLexiqueVerbLemmas(lexiqueSample), [
      { id: 1, infinitif: 'accueillir', forme_canonique: 'accueillir', est_archive: 1 },
      { id: 2, infinitif: 'reabonner', forme_canonique: 'réabonner', est_archive: 0 },
    ])
    assert.equal(candidates[0].status, 'archivé')
    assert.equal(candidates[1].status, 'présent — graphie à vérifier')

    const conflict = missingVerbCandidates([{ lemma: 'déborder', frequency: 10 }], [
      { id: 3, infinitif: 'deborder', forme_canonique: 'deborder', est_archive: 0 },
    ])
    assert.equal(conflict[0].status, 'présent — graphie à vérifier')
  })

  it('reconnaît un lemme déjà présent sous sa forme pronominale', () => {
    const [souvenir] = missingVerbCandidates([{ lemma: 'souvenir', frequency: 100 }], [
      { id: 4, infinitif: 'se souvenir', forme_canonique: 'se souvenir', est_archive: 0 },
    ])
    assert.equal(souvenir.status, 'présent')
  })

  it('écarte explicitement les verbes vulgaires du lot pédagogique', () => {
    const [candidate] = missingVerbCandidates([{ lemma: 'chier', frequency: 50 }], [])
    assert.equal(candidate.status, 'absent')
    assert.equal(candidate.exclusionReason, 'registre vulgaire')
  })

  it('classe les familles déjà prises en charge sans prétendre valider la forme', () => {
    assert.equal(probableConjugationFamily('manger'), 'ger')
    assert.equal(probableConjugationFamily('commencer'), 'cer')
    assert.equal(probableConjugationFamily('accueillir'), 'ouvrir-cueillir')
    assert.equal(probableConjugationFamily('absoudre'), 'dre-tre')
  })
})

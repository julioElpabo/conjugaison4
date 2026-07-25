import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseMorphalouRow } from '../scripts/validate-verb-candidates-morphalou.mjs'

describe('lecture de Morphalou', () => {
  it('lit une première forme verbale', () => {
    const row = parseMorphalouRow(
      'aimer;1;Verbe;;;-;;eme;morphalou2;aime;2;singular;indicative;-;present;firstPerson;em;morphalou2',
    )
    assert.equal(row.lemma, 'aimer')
    assert.equal(row.form, 'aime')
    assert.equal(row.mode, 'indicative')
    assert.equal(row.tense, 'present')
  })

  it('conserve le lemme sur une ligne de flexion', () => {
    const row = parseMorphalouRow(
      ';;;;;;;;;aimons;3;plural;indicative;-;present;firstPerson;emɔ̃;morphalou2',
      { lemma: 'aimer', category: 'Verbe' },
    )
    assert.equal(row.lemma, 'aimer')
    assert.equal(row.form, 'aimons')
  })

  it('ignore les homographes non verbaux', () => {
    const row = parseMorphalouRow(
      'marche;1;Nom commun;;;feminine;;maʁʃ;morphalou2;marche;2;singular;-;feminine;-;-;maʁʃ;morphalou2',
    )
    assert.equal(row, null)
  })
})

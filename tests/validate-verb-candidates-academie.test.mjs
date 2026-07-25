import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  academyCandidateKind,
  conjugationMetadata,
  selectAcademySearchHit,
} from '../scripts/validate-verb-candidates-academie.mjs'

describe('validation Académie des verbes candidats', () => {
  it('préfère le verbe de base à un homographe nominal', () => {
    const hit = selectAcademySearchHit('souvenir', [
      { label: 'souvenir', nature: 'n. m.', url: '/nom' },
      { label: 'souvenir (se)', nature: 'v. pron.', url: '/verbe' },
    ])
    assert.equal(hit.url, '/verbe')
  })

  it('reconnaît les entrées uniquement pronominales', () => {
    assert.equal(academyCandidateKind('v. pron.'), 'pronominal essentiel')
    assert.equal(academyCandidateKind('v. tr. direct et v. pron.'), 'verbe de base')
  })

  it('exige une correspondance exacte du lemme', () => {
    assert.equal(selectAcademySearchHit('venir', [
      { label: 'revenir', nature: 'v. intr.', url: '/revenir' },
    ]), null)
  })
})

describe('métadonnées de conjugaison de l’Académie', () => {
  it('lit l’auxiliaire annoncé', () => {
    const metadata = conjugationMetadata(
      '<p>Ce verbe se conjugue avec l&rsquo;auxiliaire <b>&ecirc;tre</b> aux temps compos&eacute;s.</p>',
    )
    assert.equal(metadata.auxiliary, 'être')
  })
})

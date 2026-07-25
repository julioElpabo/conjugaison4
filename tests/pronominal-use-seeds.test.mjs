import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { pronominalUseSeeds } from '../shared/data/pronominal-use-seeds.ts'

describe('catalogue sourcé des emplois pronominaux', () => {
  it('contient chaque infinitif une seule fois et référence une source académique', () => {
    const infinitives = pronominalUseSeeds.map(seed => seed.infinitif)
    assert.equal(new Set(infinitives).size, infinitives.length)
    assert.ok(pronominalUseSeeds.length >= 140)
    assert.ok(pronominalUseSeeds.every(seed => (
      seed.sourceUrl.startsWith('https://www.dictionnaire-academie.fr/article/')
    )))
  })

  it('rend « se lancer » disponible pour toutes les personnes', () => {
    const lancer = pronominalUseSeeds.find(seed => seed.infinitif === 'lancer')
    assert.deepEqual(lancer, {
      infinitif: 'lancer',
      typeEmploi: 'reflechi',
      fonctionPronom: 'variable',
      regleAccord: 'selon_construction',
      personnesAutorisees: [4, 5, 6, 7, 8, 9],
      sourceUrl: 'https://www.dictionnaire-academie.fr/article/A9L0235',
    })
  })

  it('écarte les constructions complexes qui exigent aussi « en »', () => {
    assert.equal(pronominalUseSeeds.some(seed => seed.infinitif === 'aller'), false)
    assert.equal(pronominalUseSeeds.some(seed => seed.infinitif === 'venir'), false)
  })

  it('limite les emplois passifs et réciproques aux personnes pertinentes', () => {
    const boire = pronominalUseSeeds.find(seed => seed.infinitif === 'boire')
    const plaire = pronominalUseSeeds.find(seed => seed.infinitif === 'plaire')
    assert.deepEqual(boire.personnesAutorisees, [6, 9])
    assert.deepEqual(plaire.personnesAutorisees, [7, 8, 9])
    assert.equal(plaire.regleAccord, 'invariable')
  })
})

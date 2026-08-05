import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { repairMalformedPluralParticiple } from '../server/services/mail-request-repairs.ts'

describe('réparation des participes terminés par s ou x', () => {
  it('retire seulement le s pluriel redoublé', () => {
    assert.equal(repairMalformedPluralParticiple('soyons assiss', 'assis'), 'soyons assis')
    assert.equal(repairMalformedPluralParticiple('ils se sont miss en route', 'mis'), 'ils se sont mis en route')
    assert.equal(repairMalformedPluralParticiple('ils sont diss !', 'dis'), 'ils sont dis !')
  })

  it('ne touche ni une forme correcte ni un participe qui accepte un s', () => {
    assert.equal(repairMalformedPluralParticiple('soyons assis', 'assis'), 'soyons assis')
    assert.equal(repairMalformedPluralParticiple('nous sommes protégés', 'protégé'), 'nous sommes protégés')
    assert.equal(repairMalformedPluralParticiple('que je m’assisse', 'assis'), 'que je m’assisse')
  })
})

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  MISSING_DE_ACCENT_REPAIRS,
  repairMalformedPluralParticiple,
  repairMissingDeAccentForm,
} from '../server/services/mail-request-repairs.ts'

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

describe('accents initiaux des verbes en dé-', () => {
  it('limite la correction aux huit verbes signalés', () => {
    assert.deepEqual(
      MISSING_DE_ACCENT_REPAIRS.map(({ before, after }) => [before, after]),
      [
        ['deborder', 'déborder'],
        ['debuter', 'débuter'],
        ['decoller', 'décoller'],
        ['dedier', 'dédier'],
        ['defiler', 'défiler'],
        ['designer', 'désigner'],
        ['detourner', 'détourner'],
        ['developper', 'développer'],
      ],
    )
  })

  it('corrige les formes simples, composées et au futur proche', () => {
    assert.equal(repairMissingDeAccentForm('debordons', 'deborder', 'déborder'), 'débordons')
    assert.equal(repairMissingDeAccentForm('avons debordé', 'deborder', 'déborder'), 'avons débordé')
    assert.equal(repairMissingDeAccentForm('vais developper', 'developper', 'développer'), 'vais développer')
    assert.equal(repairMissingDeAccentForm('designe', 'designer', 'désigner'), 'désigne')
  })

  it('ne touche pas les véritables verbes commençant par de-', () => {
    for (const infinitive of ['demander', 'demeurer', 'descendre', 'dessiner', 'devenir', 'deviner', 'devoir']) {
      assert.ok(!MISSING_DE_ACCENT_REPAIRS.some(repair => repair.before === infinitive))
    }
  })
})

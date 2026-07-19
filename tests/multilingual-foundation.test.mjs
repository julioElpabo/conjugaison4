import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  localeFallbacks,
  normalizeLocale,
} from '../shared/i18n/locales.ts'
import { translateAppMessage } from '../shared/i18n/messages.ts'
import { grammarModeCode, grammarTenseCode } from '../shared/utils/grammar-codes.ts'

describe('fondation multilingue', () => {
  it('normalise les locales prises en charge', () => {
    assert.equal(normalizeLocale('de-CH'), 'de')
    assert.equal(normalizeLocale('EN_us'), 'en')
    assert.equal(normalizeLocale('nl'), 'fr')
  })

  it('retombe toujours sur le français tant qu’une traduction manque', () => {
    assert.deepEqual(localeFallbacks('it'), ['it', 'fr'])
    assert.equal(translateAppMessage('de', 'common.close'), 'Fermer')
  })

  it('dissocie les identifiants grammaticaux des libellés français', () => {
    assert.equal(grammarModeCode('subjonctif'), 'subjunctive')
    assert.equal(grammarTenseCode('plus-que-parfait'), 'pluperfect')
    assert.equal(grammarTenseCode('passé 2e forme'), 'past-second-form')
  })
})

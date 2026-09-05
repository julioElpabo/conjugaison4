import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeLocale, localeLanguageTag, localizePath, localeFallbacks, localeFromPath } from '../shared/i18n/locales.ts'
import { translateUiMessage, uiMessages } from '../shared/i18n/ui-messages.ts'
import { translateCoachUiText } from '../shared/i18n/coach-ui.ts'
import { learnerSpaceCopy } from '../shared/i18n/learner-space.ts'
import { buildNearFutureCoachHelpHtml } from '../shared/utils/coach-help.ts'

test('conserve les préférences belges et distingue la variante des Pays-Bas', () => {
  assert.equal(normalizeLocale('nl'), 'nl')
  assert.equal(normalizeLocale('nl-BE'), 'nl')
  assert.equal(normalizeLocale('NL_nl'), 'nl-NL')
  assert.equal(localeLanguageTag('nl'), 'nl-BE')
  assert.equal(localeLanguageTag('nl-NL'), 'nl-NL')
  assert.equal(localeFromPath('/nl-NL/my-page'), 'nl-NL')
  assert.equal(localizePath('/nl-NL/defi/AB-CD-EF-23', 'nl'), '/nl/defi/AB-CD-EF-23')
  assert.deepEqual(localeFallbacks('nl-NL'), ['nl-NL', 'nl', 'fr'])
})

test('adapte les formulations sans changer les autres langues', () => {
  assert.equal(translateUiMessage('nl', 'Activer sur cet appareil'), 'Inschakelen op dit toestel')
  assert.equal(translateUiMessage('nl-NL', 'Activer sur cet appareil'), 'Inschakelen op dit apparaat')
  assert.equal(translateUiMessage('fr', 'Activer sur cet appareil'), 'Activer sur cet appareil')
  assert.equal(translateCoachUiText('nl', 'Tu vaux plus que tes notes'), 'Je bent meer waard dan je punten')
  assert.equal(translateCoachUiText('nl-NL', 'Tu vaux plus que tes notes'), 'Je bent meer waard dan je cijfers')
  assert.equal(translateUiMessage('nl-NL', 'Pour les enseignants'), 'Voor leraren')
  assert.equal(learnerSpaceCopy('nl-NL').successEvolution, 'Slaagpercentage door de tijd heen')
  assert.equal(learnerSpaceCopy('nl').successEvolution, 'Slaagpercentage door de tijd heen')
  const html = buildNearFutureCoachHelpHtml({ infinitif: 'se laver' }, 'nl-NL')
  assert.match(html, /wederkerend/u)
  assert.match(html, /je vais me laver/u)
})

test('les deux variantes couvrent le catalogue et conservent les paramètres', () => {
  for (const [key, entry] of Object.entries(uiMessages)) {
    assert.ok(entry['nl-NL']?.trim(), key)
    assert.deepEqual([...entry['nl-NL'].matchAll(/\{\w+\}/gu)].map(m => m[0]), [...entry.nl.matchAll(/\{\w+\}/gu)].map(m => m[0]), key)
  }
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { SUPPORTED_LOCALES } from '../shared/i18n/locales.ts'
import { translateUiMessage, uiMessages } from '../shared/i18n/ui-messages.ts'
import { translateCoachUiText } from '../shared/i18n/coach-ui.ts'

test('tous les textes d’interface possèdent les quatre traductions attendues', () => {
  assert.deepEqual(SUPPORTED_LOCALES, ['fr', 'de', 'en', 'it', 'es'])
  for (const [french, translations] of Object.entries(uiMessages)) {
    assert.ok(french.trim(), 'une clé française ne doit pas être vide')
    for (const locale of SUPPORTED_LOCALES.filter(locale => locale !== 'fr')) {
      assert.ok(translations[locale]?.trim(), `traduction ${locale} manquante pour « ${french} »`)
    }
  }
})

test('le français sert de repli et les paramètres sont remplacés', () => {
  assert.equal(translateUiMessage('fr', 'Fermer'), 'Fermer')
  assert.equal(
    translateUiMessage('en', 'Défi {code} · Conjugaison', { code: 'AB-CD' }),
    'Challenge AB-CD · Conjugation',
  )
})

test('les textes administrés des coaches sont localisés sans modifier le français', () => {
  assert.equal(translateCoachUiText('de', 'Très condensée'), 'Sehr kompakt')
  assert.equal(translateCoachUiText('en', 'Salut ! On commence !'), 'Hi! Let’s get started!')
  assert.equal(translateCoachUiText('it', 'La musique et voir mes amis'), 'La musica e vedere i miei amici')
  assert.equal(translateCoachUiText('es', 'Jouer au basket'), 'Jugar al baloncesto')
  assert.equal(translateCoachUiText('fr', 'Salut ! On commence !'), 'Salut ! On commence !')
})

import assert from 'node:assert/strict'
import test from 'node:test'
import {
  localeFromPath,
  localizePath,
  stripLocaleFromPath,
  SUPPORTED_LOCALES,
} from '../shared/i18n/locales.ts'
import { translateUiMessage, uiMessages } from '../shared/i18n/ui-messages.ts'
import { translateCoachUiText } from '../shared/i18n/coach-ui.ts'
import { learnerErrorInsteadOf, localizedLearnerErrorMessage, localizedLearnerErrorText } from '../shared/i18n/learner-errors.ts'
import { learnerAuthCopy } from '../shared/i18n/learner-auth.ts'
import { learnerSpaceCopy, learnerSpaceText } from '../shared/i18n/learner-space.ts'

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

test('le rappel du pronom dans le chat est traduit dans toutes les langues', () => {
  assert.equal(translateUiMessage('fr', "N'oublie pas le pronom !"), "N'oublie pas le pronom !")
  assert.equal(translateUiMessage('de', "N'oublie pas le pronom !"), 'Vergiss das Pronomen nicht!')
  assert.equal(translateUiMessage('en', "N'oublie pas le pronom !"), "Don't forget the pronoun!")
  assert.equal(translateUiMessage('it', "N'oublie pas le pronom !"), 'Non dimenticare il pronome!')
  assert.equal(translateUiMessage('es', "N'oublie pas le pronom !"), '¡No olvides el pronombre!')
})

test('les sous-options du type d’exercice sont traduites', () => {
  assert.equal(translateUiMessage('de', 'Avec mes verbes'), 'Mit meinen Verben')
  assert.equal(translateUiMessage('en', 'Avec n’importe quel verbe'), 'With any verb')
  assert.equal(
    translateUiMessage('it', 'Formes conjuguées simples, sans citation.'),
    'Forme coniugate semplici, senza citazioni.',
  )
  assert.equal(
    translateUiMessage('es', 'Construits avec des phrases littéraires.'),
    'Construidos con frases literarias.',
  )
})

test('les textes administrés des coaches sont localisés sans modifier le français', () => {
  assert.equal(translateCoachUiText('de', 'Très condensée'), 'Sehr kompakt')
  assert.equal(translateCoachUiText('en', 'Salut ! On commence !'), 'Hi! Let’s get started!')
  assert.equal(translateCoachUiText('it', 'La musique et voir mes amis'), 'La musica e vedere i miei amici')
  assert.equal(translateCoachUiText('es', 'Jouer au basket'), 'Jugar al baloncesto')
  assert.equal(translateCoachUiText('fr', 'Salut ! On commence !'), 'Salut ! On commence !')
})

test('les URL conservent la page lorsqu’on change de langue', () => {
  assert.equal(localizePath('/', 'fr'), '/fr/')
  assert.equal(localizePath('/admin/charts', 'de'), '/de/admin/charts')
  assert.equal(localizePath('/fr/defi/AB-CD', 'it'), '/it/defi/AB-CD')
  assert.equal(localeFromPath('/es/apprendre'), 'es')
  assert.equal(localeFromPath('/admin'), null)
  assert.equal(stripLocaleFromPath('/en/consulter'), '/consulter')
})

test('les types de fautes et leurs comparaisons suivent la langue de l’interface', () => {
  const closeForm = {
    code: 'input.close_form',
    label: 'Forme proche de la réponse',
    message: 'Ta réponse était proche de la bonne forme, mais elle contenait encore une différence orthographique.',
  }
  assert.equal(
    localizedLearnerErrorMessage(closeForm, 'de'),
    'Deine Antwort war fast richtig, enthielt aber noch einen Rechtschreibunterschied.',
  )
  assert.doesNotMatch(localizedLearnerErrorMessage(closeForm, 'it'), /Ta réponse|différence orthographique/u)
  assert.equal(learnerErrorInsteadOf('es'), 'en lugar de')
  assert.match(
    localizedLearnerErrorText({ ...closeForm, learnerValue: '-a', expectedValue: '-as' }, 'en'),
    /-a instead of -as/u,
  )
})

test('la création de compte et la connexion disposent d’un texte dans chaque langue', () => {
  for (const locale of SUPPORTED_LOCALES) {
    const copy = learnerAuthCopy(locale)
    assert.ok(copy.signIn)
    assert.ok(copy.create)
    assert.ok(copy.password)
    assert.ok(copy.recoveryCode)
  }
  assert.equal(learnerAuthCopy('de').signIn, 'Anmelden')
  assert.equal(learnerAuthCopy('es').create, 'Crear mi cuenta')
})

test('tous les onglets de mon espace disposent d’un catalogue complet dans chaque langue', () => {
  const frenchKeys = Object.keys(learnerSpaceCopy('fr'))
  for (const locale of SUPPORTED_LOCALES) {
    const copy = learnerSpaceCopy(locale)
    assert.deepEqual(Object.keys(copy), frenchKeys)
    for (const key of frenchKeys) assert.ok(copy[key].trim(), `${locale}.${key} ne doit pas être vide`)
  }
  assert.equal(learnerSpaceCopy('de').history, 'Fortschritte machen')
  assert.equal(learnerSpaceCopy('en').deleteAccount, 'Delete my account')
  assert.equal(learnerSpaceCopy('it').commonErrors, 'Capire i miei errori')
  assert.equal(learnerSpaceCopy('es').preferences, 'Preferencias')
  assert.match(
    learnerSpaceText(learnerSpaceCopy('en'), 'privacy', { username: 'Camille' }),
    /Camille/u,
  )
})

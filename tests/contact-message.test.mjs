import assert from 'node:assert/strict'
import test from 'node:test'
import { validateContactMessage } from '../server/services/contact-message.ts'
import { DEFAULT_CONTACT_SETTINGS, validateContactSettings } from '../server/services/contact-settings.ts'

test('le formulaire de contact normalise un message valide', () => {
  assert.deepEqual(validateContactMessage({
    email: ' Visiteur@Example.ch ',
    subject: '  Une erreur dans un exercice  ',
    message: 'Une forme de conjugaison semble incorrecte à cet endroit.',
  }, DEFAULT_CONTACT_SETTINGS), {
    email: 'visiteur@example.ch',
    subject: 'Une erreur dans un exercice',
    message: 'Une forme de conjugaison semble incorrecte à cet endroit.',
  })
})

test('le formulaire de contact refuse les messages trop courts ou automatisés', () => {
  assert.throws(
    () => validateContactMessage({
      email: 'visiteur@example.ch',
      subject: 'Question',
      message: 'Trop court',
    }, DEFAULT_CONTACT_SETTINGS),
    /critères du formulaire/u,
  )
  assert.throws(
    () => validateContactMessage({
      email: 'visiteur@example.ch',
      subject: 'Proposition commerciale',
      message: 'Consultez https://one.example, https://two.example et https://three.example.',
    }, DEFAULT_CONTACT_SETTINGS),
    /critères du formulaire/u,
  )
})

test('le formulaire de contact refuse les adresses et objets invalides', () => {
  assert.throws(
    () => validateContactMessage({
      email: 'adresse-invalide',
      subject: 'OK',
      message: 'Voici un message suffisamment long pour être normalement accepté.',
    }, DEFAULT_CONTACT_SETTINGS),
    /critères du formulaire/u,
  )
})

test('les réglages administrables du contact sont validés ensemble', () => {
  assert.deepEqual(validateContactSettings({
    ...DEFAULT_CONTACT_SETTINGS,
    contactEmail: ' CONTACT@Example.ch ',
    messageMinLength: 30,
    shortRateWindowMinutes: 120,
  }), {
    ...DEFAULT_CONTACT_SETTINGS,
    contactEmail: 'contact@example.ch',
    messageMinLength: 30,
    shortRateWindowMinutes: 120,
  })

  assert.throws(
    () => validateContactSettings({
      ...DEFAULT_CONTACT_SETTINGS,
      shortRateLimit: 10,
      dailyRateLimit: 5,
    }),
    /limite courte dépasse/u,
  )
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { servicePublicYouthSafety } from '../scripts/service-public-youth-safety.mjs'

test('accepte une information pratique destinée au grand public', () => {
  assert.equal(servicePublicYouthSafety(
    'Vacances scolaires',
    'Vous pouvez consulter le calendrier en ligne.',
  ).suitable, true)
})

test('écarte les sujets contemporains sensibles même si la phrase isolée paraît neutre', () => {
  assert.equal(servicePublicYouthSafety(
    'Comment combattre les violences intrafamiliales ?',
    'Un nouveau service est disponible.',
  ).suitable, false)
  assert.equal(servicePublicYouthSafety(
    'Une nouvelle version du carnet de maternité',
    'Il contient plusieurs informations pratiques.',
  ).suitable, false)
})

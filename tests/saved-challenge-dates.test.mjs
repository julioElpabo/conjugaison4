import assert from 'node:assert/strict'
import { test } from 'node:test'
import { groupSavedChallenges } from '../shared/utils/saved-challenge-dates.ts'

const challenge = (code, savedAt) => ({ code, savedAt })

test('trie les défis du plus récent au plus ancien et affiche uniquement les groupes utiles', () => {
  const input = [
    challenge('old', '2023-02-12T12:00:00Z'),
    challenge('month', '2026-11-01T12:00:00Z'),
    challenge('yesterday', '2026-11-19T12:00:00Z'),
    challenge('year', '2026-09-12T12:00:00Z'),
    challenge('week', '2026-11-13T12:00:00Z'),
    challenge('today-early', '2026-11-20T08:00:00Z'),
    challenge('today-late', '2026-11-20T12:00:00Z'),
  ]
  const groups = groupSavedChallenges(input, new Date('2026-11-20T15:00:00Z'), 'fr')
  assert.deepEqual(groups.map(group => group.title), ['Aujourd’hui', 'Hier', 'La semaine dernière', 'Novembre 26', 'Année scolaire 2026-2027', '2022-2023'])
  assert.deepEqual(groups[0].entries.map(entry => entry.challenge.code), ['today-late', 'today-early'])
  assert.equal(input[0].code, 'old', 'ne modifie pas les données sources')
  assert.deepEqual(groupSavedChallenges([], new Date(), 'fr'), [])
})

test('respecte les seuils de sept et trente jours sans doublons', () => {
  const groups = groupSavedChallenges([
    challenge('seven', '2026-11-13T12:00:00Z'),
    challenge('eight', '2026-11-12T12:00:00Z'),
    challenge('thirty', '2026-10-21T12:00:00Z'),
    challenge('thirty-one', '2026-10-20T12:00:00Z'),
  ], new Date('2026-11-20T15:00:00Z'), 'fr')
  assert.deepEqual(groups.map(group => [group.key, group.entries.map(entry => entry.challenge.code)]), [
    ['week', ['seven']], ['month-2026-11', ['eight']], ['month-2026-10', ['thirty']], ['school', ['thirty-one']],
  ])
})

test('change d’année scolaire le premier août et classe correctement juillet et août', () => {
  const augustGroups = groupSavedChallenges([
    challenge('month', '2026-08-15T12:00:00Z'),
    challenge('school', '2026-08-01T12:00:00Z'),
  ], new Date('2026-09-05T12:00:00Z'), 'fr')
  assert.deepEqual(augustGroups.map(group => group.title), ['Août 26', 'Année scolaire 2026-2027'])
  const input = [challenge('july', '2025-07-31T12:00:00Z'), challenge('august', '2025-08-01T12:00:00Z')]
  assert.deepEqual(groupSavedChallenges(input, new Date('2026-07-31T12:00:00Z'), 'fr').map(group => group.title), ['Année scolaire 2025-2026', '2024-2025'])
  assert.deepEqual(groupSavedChallenges(input, new Date('2026-08-01T12:00:00Z'), 'fr').map(group => group.title), ['2025-2026', '2024-2025'])
})

test('affiche le vrai jour de la semaine et une date courte sans ponctuation en français', () => {
  const groups = groupSavedChallenges([challenge('a', '2022-12-14T12:00:00Z'), challenge('b', '2022-12-15T12:00:00Z')], new Date('2026-09-05T12:00:00Z'), 'fr')
  assert.deepEqual(groups[0].entries.map(entry => entry.dateLabel), ['je 15 dec 2022', 'me 14 dec 2022'])
  assert.equal(groups[0].entries[0].dateTime, '2022-12-15')
})

test('utilise les jours à Zurich même près de minuit et au changement d’heure', () => {
  const groups = groupSavedChallenges([
    challenge('today', '2026-03-29T22:30:00Z'),
    challenge('yesterday', '2026-03-28T23:30:00Z'),
  ], new Date('2026-03-30T00:00:00Z'), 'fr')
  assert.deepEqual(groups.map(group => group.title), ['Aujourd’hui', 'Hier'])
  assert.equal(groups[0].entries[0].dateLabel, 'lu 30 mar 2026')
})

test('traduit les rubriques et conserve les dates inconnues en fin de liste', () => {
  const now = new Date('2026-09-05T12:00:00Z')
  const groups = groupSavedChallenges([challenge('unknown', 'invalid'), challenge('today', now.toISOString())], now, 'en')
  assert.deepEqual(groups.map(group => group.title), ['Today', 'Unknown date'])
  assert.equal(groups[1].entries[0].dateTime, undefined)
})

test('affiche les dates et les périodes en néerlandais belge', () => {
  const groups = groupSavedChallenges([
    challenge('today', '2026-11-20T12:00:00Z'),
    challenge('yesterday', '2026-11-19T12:00:00Z'),
    challenge('week', '2026-11-15T12:00:00Z'),
    challenge('month', '2026-11-01T12:00:00Z'),
    challenge('school', '2026-09-01T12:00:00Z'),
  ], new Date('2026-11-20T15:00:00Z'), 'nl')
  assert.deepEqual(groups.map(group => group.title), ['Vandaag', 'Gisteren', 'Vorige week', 'November 26', 'Schooljaar 2026-2027'])
  assert.equal(groups[0].entries[0].dateLabel, new Intl.DateTimeFormat('nl-BE', {
    timeZone: 'Europe/Zurich', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date('2026-11-20T12:00:00Z')))
})

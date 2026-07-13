import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { matchingVerbs, normalizeVerbSearch } from '../shared/utils/verb-search.ts'

const verbs = [
  { id: 1, infinitif: 'être' },
  { id: 2, infinitif: 'permettre' },
  { id: 3, infinitif: 'établir' },
  { id: 4, infinitif: 'mettre' },
]

describe('autocomplétion des verbes administrés', () => {
  it('ignore les accents et les espaces de saisie', () => {
    assert.equal(normalizeVerbSearch('  ÊTRE '), 'etre')
    assert.deepEqual(matchingVerbs(verbs, 'etre').map(verb => verb.infinitif), ['être'])
  })

  it('classe les verbes qui commencent par la saisie avant les correspondances internes', () => {
    assert.deepEqual(matchingVerbs(verbs, 'et').map(verb => verb.infinitif), ['établir', 'être', 'mettre', 'permettre'])
  })

  it('conserve le catalogue complet quand la recherche est vide', () => {
    assert.equal(matchingVerbs(verbs, '').length, verbs.length)
  })
})

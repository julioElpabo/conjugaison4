import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { literaryYouthSafety } from '../scripts/literary-youth-safety.mjs'

describe('filtre jeunesse du corpus littéraire', () => {
  it('conserve un contexte scolaire ou quotidien neutre', () => {
    assert.equal(literaryYouthSafety('Il fallait bien qu’il entendît les enfants réciter leur leçon.').suitable, true)
  })

  it('écarte violence, mort, alcool et contenus adultes', () => {
    for (const sentence of [
      'Il avait tué un homme en duel.',
      'Elle craignait qu’il ne meure.',
      'Il faut que je prenne du punch.',
      'Il parlait de sa maîtresse.',
    ]) assert.equal(literaryYouthSafety(sentence).suitable, false, sentence)
  })
})


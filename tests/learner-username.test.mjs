import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

globalThis.createError = ({ statusCode, statusMessage }) => Object.assign(new Error(statusMessage), { statusCode })

const {
  LEARNER_ANIMALS,
  availableLearnerUsername,
  isGeneratedLearnerUsername,
  normalizeLearnerUsername,
} = await import('../server/services/learner-username.ts')

describe('pseudonymes des comptes individuels', () => {
  it('normalise la casse et les espaces', () => {
    assert.equal(normalizeLearnerUsername('  ReNaRd-1762  '), 'renard-1762')
  })

  it('accepte uniquement un animal contrôlé et quatre à six chiffres', () => {
    assert.equal(isGeneratedLearnerUsername('renard-1762'), true)
    assert.equal(isGeneratedLearnerUsername('martin-pecheur-19384'), true)
    assert.equal(isGeneratedLearnerUsername('admin-1762'), false)
    assert.equal(isGeneratedLearnerUsername('renard-12'), false)
    assert.equal(isGeneratedLearnerUsername('renard-1234567'), false)
    assert.equal(isGeneratedLearnerUsername('alice@example.ch'), false)
  })

  it('ne contient que des mots ASCII uniques', () => {
    assert.equal(new Set(LEARNER_ANIMALS).size, LEARNER_ANIMALS.length)
    for (const animal of LEARNER_ANIMALS) {
      assert.match(animal, /^[a-z]+(?:-[a-z]+)*$/u)
    }
  })

  it('produit un pseudonyme disponible validé par la base', async () => {
    const database = {
      async execute(_sql, candidates) {
        assert.ok(candidates.length > 0)
        return [[], []]
      },
    }
    const username = await availableLearnerUsername(database)
    assert.equal(isGeneratedLearnerUsername(username), true)
  })

  it('ne repropose pas un pseudonyme explicitement exclu', async () => {
    const excluded = Array.from({ length: 100 }, (_, index) => `renard-${String(1000 + index)}`)
    const database = { async execute() { return [[], []] } }
    const username = await availableLearnerUsername(database, excluded)
    assert.equal(excluded.includes(username), false)
  })
})

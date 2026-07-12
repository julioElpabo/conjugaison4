import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  isAnswerCorrect,
  normalizeAnswer,
  validateAnswer,
} from '../shared/utils/answer.ts'

describe('normalizeAnswer', () => {
  it('ignore la casse, tous les espaces et les apostrophes typographiques', () => {
    assert.equal(normalizeAnswer('  Qu’\tELLES\n aient mangé  '), "qu'ellesaientmangé")
    assert.equal(normalizeAnswer('s\u2019apercevoir'), normalizeAnswer("s'apercevoir"))
    assert.equal(normalizeAnswer('s\u02BCapercevoir'), normalizeAnswer("s'apercevoir"))
  })

  it('normalise les représentations Unicode sans supprimer les accents', () => {
    assert.equal(normalizeAnswer('oublie\u0301'), normalizeAnswer('oublié'))
    assert.notEqual(normalizeAnswer('oublié'), normalizeAnswer('oubliè'))
  })

  it('peut conserver les espaces et la casse sur demande', () => {
    assert.equal(
      normalizeAnswer('  Vous  aimez  ', { ignoreWhitespace: false, ignoreCase: false }),
      'Vous  aimez',
    )
  })
})

describe('isAnswerCorrect', () => {
  const acceptedCases = [
    { accepted: ['abcd'], answer: 'abcd', label: 'égalité simple' },
    { accepted: ['abcd', 'efgh', 'ijkl'], answer: 'ijkl', label: 'variante admise' },
    { accepted: ['Aimez'], answer: 'aimez', label: 'majuscule' },
    { accepted: ['aimez', 'vous aimez'], answer: 'vous aimez', label: 'pronom facultatif' },
    { accepted: ['vous aimez'], answer: ' vous  aimez ', label: 'espaces surnuméraires' },
    { accepted: ["qu'elles aient mangé"], answer: 'qu’elles aient mangé', label: 'apostrophe typographique' },
    { accepted: ['suis tombé', 'suis tombée'], answer: 'suis tombée', label: 'accord féminin avec je' },
    { accepted: ['es tombé', 'es tombée'], answer: 'es tombée', label: 'accord féminin avec tu' },
    { accepted: ['êtes tombé', 'êtes tombée', 'êtes tombés', 'êtes tombées'], answer: 'êtes tombé', label: 'vous masculin singulier' },
    { accepted: ['êtes tombé', 'êtes tombée', 'êtes tombés', 'êtes tombées'], answer: 'êtes tombée', label: 'vous féminin singulier' },
    { accepted: ['êtes tombé', 'êtes tombée', 'êtes tombés', 'êtes tombées'], answer: 'êtes tombés', label: 'vous masculin pluriel' },
    { accepted: ['êtes tombé', 'êtes tombée', 'êtes tombés', 'êtes tombées'], answer: 'êtes tombées', label: 'vous féminin pluriel' },
  ]

  for (const { accepted, answer, label } of acceptedCases) {
    it(`accepte : ${label}`, () => {
      assert.equal(isAnswerCorrect(answer, accepted), true)
    })
  }

  const rejectedCases = [
    { accepted: ['abcd'], answer: 'efgh', label: 'réponse différente' },
    { accepted: ['oublié'], answer: 'oubliè', label: 'accent incorrect' },
    { accepted: ['serai'], answer: 'serais', label: 'terminaison incorrecte' },
    { accepted: ['ont vu'], answer: 'ont vus', label: 'accord incorrect' },
    { accepted: ['regarde'], answer: 'tu regarde', label: "pronom interdit à l'impératif" },
    { accepted: ['regarde'], answer: 'regardes', label: "s incorrect à l'impératif" },
  ]

  for (const { accepted, answer, label } of rejectedCases) {
    it(`refuse : ${label}`, () => {
      assert.equal(isAnswerCorrect(answer, accepted), false)
    })
  }

  it('refuse une saisie vide ou un corrigé inexploitable', () => {
    assert.equal(isAnswerCorrect('   ', ['']), false)
    assert.equal(isAnswerCorrect('aime', []), false)
    assert.equal(isAnswerCorrect('aime', null), false)
    assert.equal(isAnswerCorrect(null, ['aime']), false)
  })
})

describe('validateAnswer', () => {
  it('retourne la variante exacte qui a correspondu', () => {
    const result = validateAnswer(' VOUS ÊTES TOMBÉES ', [
      'êtes tombé',
      'vous êtes tombées',
    ])

    assert.equal(result.isCorrect, true)
    assert.equal(result.reason, 'correct')
    assert.equal(result.matchedAnswer, 'vous êtes tombées')
    assert.equal(result.normalizedAnswer, 'vousêtestombées')
  })

  it('distingue réponse vide, corrigé vide et absence de correspondance', () => {
    assert.equal(validateAnswer(' ', ['aime']).reason, 'empty-answer')
    assert.equal(validateAnswer('aime', []).reason, 'no-expected-answer')
    assert.equal(validateAnswer('aimes', ['aime']).reason, 'no-match')
  })
})


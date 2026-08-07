import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  conjugationAnswerPlaceholder,
  findConjugationConfusions,
  findImpossibleSingularEnding,
  getAlternativeCorrections,
  impossibleSingularEndingReminderMessage,
  isAnswerCorrect,
  isFutureSimpleInsteadOfNearFuture,
  normalizeAnswer,
  validateAnswer,
  validateConjugationAnswer,
} from '../shared/utils/answer.ts'

describe('conjugationAnswerPlaceholder', () => {
  it('affiche un groupe de pointillés pour chaque mot à saisir', () => {
    assert.equal(
      conjugationAnswerPlaceholder({ pronom: 'nous', conjugaison1: 'nous sommes aperçus' }),
      '...... ............ ............ ........................',
    )
    assert.equal(
      conjugationAnswerPlaceholder({ pronom: 'il', conjugaison1: 'vient' }),
      '...... ........................',
    )
  })

  it('compte aussi les mots du préfixe d’une proposition relative', () => {
    assert.equal(
      conjugationAnswerPlaceholder({ saisiePrefixe: 'que vous', conjugaison1: 'avez mangées' }),
      '............ ...... ............ ........................',
    )
  })
})

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

describe('getAlternativeCorrections', () => {
  it('signale la seconde conjugaison après une réponse complète', () => {
    const corrections = ["j'assieds", "j'assois"]
    assert.deepEqual(getAlternativeCorrections("j'assieds", corrections), ["j'assois"])
    assert.deepEqual(getAlternativeCorrections('assois', corrections), [])
  })

  it("tolère l'absence de ponctuation à l'impératif", () => {
    assert.deepEqual(getAlternativeCorrections('assieds', ['assieds !', 'assois !']), ['assois !'])
  })

  it("ne présente jamais la ponctuation comme une autre possibilité", () => {
    assert.deepEqual(getAlternativeCorrections('mange', ['mange !', 'mange!', 'mange']), [])
    assert.deepEqual(getAlternativeCorrections('mange!', ['mange !', 'mange']), [])
  })

  it("ne suggère rien lorsqu'il n'existe pas d'autre forme", () => {
    assert.deepEqual(getAlternativeCorrections('aime', ['tu aimes']), [])
  })
})

describe('isAnswerCorrect', () => {
  const acceptedCases = [
    { accepted: ['abcd'], answer: 'abcd', label: 'égalité simple' },
    { accepted: ['abcd', 'efgh', 'ijkl'], answer: 'ijkl', label: 'variante admise' },
    { accepted: ['Aimez'], answer: 'aimez', label: 'majuscule' },
    { accepted: ['vous aimez'], answer: 'vous aimez', label: 'réponse avec pronom' },
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

  it('ne corrige pas silencieusement les accents, apostrophes, traits d’union ou mots manquants', () => {
    assert.equal(isAnswerCorrect('j ai mangé', ["j'ai mangé"]), false)
    assert.equal(isAnswerCorrect('il a mange', ['il a mangé']), false)
    assert.equal(isAnswerCorrect('assieds toi', ['assieds-toi']), false)
    assert.equal(isAnswerCorrect('elles parties', ['elles sont parties']), false)
    assert.equal(isAnswerCorrect('tu finiras', ['tu finirais']), false)
  })
})

describe('pronom sujet obligatoire', () => {
  const question = { reponses: ['vient', 'il vient'], pronom: 'il', mode: 'indicatif' }

  it('refuse la forme verbale seule même si une ancienne question la proposait', () => {
    const result = validateConjugationAnswer('vient', question)
    assert.equal(result.isCorrect, false)
    assert.equal(result.reason, 'missing-subject-pronoun')
  })

  it('reconnaît une forme correcte privée de son pronom', () => {
    assert.equal(validateConjugationAnswer('pourrez', {
      reponses: ['vous pourrez'], pronom: 'vous', mode: 'indicatif',
    }).reason, 'missing-subject-pronoun')
    assert.equal(validateConjugationAnswer('nous sommes aperçus', {
      reponses: ['nous nous sommes aperçus'], pronom: 'nous', mode: 'indicatif',
    }).reason, 'missing-subject-pronoun')
    assert.equal(validateConjugationAnswer('puissiez', {
      reponses: ['que vous puissiez'], pronom: 'vous', mode: 'subjonctif',
    }).reason, 'missing-subject-pronoun')
  })

  it('conserve une vraie erreur lorsque la forme verbale est fausse', () => {
    assert.equal(validateConjugationAnswer('pourrais', {
      reponses: ['vous pourrez'], pronom: 'vous', mode: 'indicatif',
    }).reason, 'no-match')
  })

  it('accepte la réponse complète avec le pronom demandé', () => {
    assert.equal(validateConjugationAnswer('Il vient', question).isCorrect, true)
  })

  it('conserve la construction sans sujet de l’impératif', () => {
    assert.equal(validateConjugationAnswer('viens', {
      reponses: ['viens'], pronom: 'tu', mode: 'impératif',
    }).isCorrect, true)
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

describe('confusion entre futur simple et futur proche', () => {
  it('reconnaît une forme correcte au futur simple sans l’accepter comme futur proche', () => {
    const question = {
      futureSimpleAnswers: ['mangeras', 'tu mangeras'],
    }
    assert.equal(isFutureSimpleInsteadOfNearFuture('tu mangeras', question), true)
    assert.equal(isFutureSimpleInsteadOfNearFuture('tu vas manger', question), false)
    assert.equal(isFutureSimpleInsteadOfNearFuture('tu mangera', question), false)
  })
})

describe('confusion avec un autre temps ou mode', () => {
  it('ne retient que les conjugaisons auxquelles la réponse correspond exactement', () => {
    const question = {
      conjugationConfusions: [
        { mode: 'indicatif', tense: 'présent', answers: ['tu finis'] },
        { mode: 'subjonctif', tense: 'présent', answers: ['que tu finisses'] },
      ],
    }
    assert.deepEqual(
      findConjugationConfusions('tu finis', question).map(item => [item.mode, item.tense]),
      [['indicatif', 'présent']],
    )
    assert.deepEqual(findConjugationConfusions('tu finissais', question), [])
  })
})

describe('terminaisons impossibles au singulier', () => {
  it('repère -t et -d avec je ou tu à un temps simple', () => {
    assert.deepEqual(
      findImpossibleSingularEnding('je finit', { personId: 4, pronom: 'je', isCompound: false }),
      { personGroup: 'first-or-second-singular', target: 'verb', ending: 't' },
    )
    assert.deepEqual(
      findImpossibleSingularEnding('prend', { personId: 5, pronom: 'tu', isCompound: false }),
      { personGroup: 'first-or-second-singular', target: 'verb', ending: 'd' },
    )
  })

  it('repère -s et -x avec il, elle ou iel à un temps simple', () => {
    assert.deepEqual(
      findImpossibleSingularEnding('que les exercices qu’iel finis', {
        personId: 6,
        pronom: 'iel',
        isCompound: false,
      }),
      { personGroup: 'third-singular', target: 'verb', ending: 's' },
    )
    assert.deepEqual(
      findImpossibleSingularEnding('elle peux', { personId: 6, pronom: 'elle', isCompound: false }),
      { personGroup: 'third-singular', target: 'verb', ending: 'x' },
    )
  })

  it("analyse l'auxiliaire, et non le participe passé, à un temps composé", () => {
    const reminder = findImpossibleSingularEnding("il s'es trompé", {
      personId: 6,
      pronom: 'il',
      isCompound: true,
    })
    assert.deepEqual(reminder, {
      personGroup: 'third-singular',
      target: 'auxiliary',
      ending: 's',
    })
    assert.match(impossibleSingularEndingReminderMessage(reminder), /l’auxiliaire/u)
    assert.equal(findImpossibleSingularEnding('il est partis', {
      personId: 6,
      pronom: 'il',
      isCompound: true,
    }), null)
  })

  it('ne déclenche rien pour une terminaison possible ou une personne plurielle', () => {
    assert.equal(findImpossibleSingularEnding('tu finis', {
      personId: 5,
      pronom: 'tu',
      isCompound: false,
    }), null)
    assert.equal(findImpossibleSingularEnding('ils finisses', {
      personId: 9,
      pronom: 'ils',
      isCompound: false,
    }), null)
  })
})

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formatNonFiniteQuestion } from '../server/services/non-finite-formatter.ts'
import { formatAnswer, formatConjugationQuestion } from '../server/services/question-formatter.ts'
import { getAlternativeCorrections, isAnswerCorrect } from '../shared/utils/answer.ts'

function row(overrides = {}) {
  return {
    id: 1,
    verbe_id: 45,
    personne_id: 4,
    temp_id: 1,
    conjugaison1: 'assieds',
    conjugaison2: 'assois',
    conjugaison3: '',
    infinitif: 'asseoir',
    auxiliaire: 'avoir',
    participe_passe: 'assis',
    temps_name: 'présent',
    is_compound: 0,
    mode_name: 'indicatif',
    ...overrides,
  }
}

describe('formes multiples reconnues par le correcteur', () => {
  it('accepte assieds et assois et propose l’autre solution', () => {
    const question = formatConjugationQuestion(row(), 'je')
    assert.ok(question.reponses.includes("j'assieds"))
    assert.ok(question.reponses.includes("j'assois"))
    assert.equal(isAnswerCorrect("j'assieds", question.reponses), true)
    assert.equal(isAnswerCorrect("j'assois", question.reponses), true)
    assert.deepEqual(getAlternativeCorrections("j'assieds", question.reponsesPourCorrige), ["j'assois"])
  })

  for (const testCase of [
    { forms: ['paie', 'paye'], answer: 'paye', label: 'paie ou paye' },
    { forms: ['essaie', 'essaye'], answer: 'essaye', label: 'essaie ou essaye' },
    { forms: ['peux', 'puis'], answer: 'puis', label: 'peux ou puis' },
  ]) {
    it(`accepte les variantes ${testCase.label}`, () => {
      assert.equal(isAnswerCorrect(testCase.answer, testCase.forms), true)
      assert.deepEqual(getAlternativeCorrections(testCase.answer, testCase.forms), [testCase.forms[0]])
    })
  }

  it('sépare les variantes historiques du participe présent', () => {
    const question = formatNonFiniteQuestion({
      id: -3,
      infinitif: "s'asseoir",
      participe_present: "s'asseyant-s'assoyant",
      participe_passe: 'assis',
      auxiliaire_participe_present: "s'étant",
    }, { id: 20, name: 'présent', mode_name: 'participe' })
    assert.deepEqual(question?.reponsesPourCorrige, ["S'asseyant", "S'assoyant"])
  })
})

describe('apostrophes et élisions françaises', () => {
  it("élide je devant une voyelle : j’aime", () => {
    assert.equal(formatAnswer('je', 'aime', 'indicatif'), "j'aime")
  })

  it("élide je devant un h muet : j’habite", () => {
    assert.equal(formatAnswer('je', 'habite', 'indicatif'), "j'habite")
  })

  it("conserve je devant un h aspiré : je hais", () => {
    assert.equal(formatAnswer('je', 'hais', 'indicatif'), 'je hais')
  })

  it("forme correctement qu’il, qu’elle et qu’elles", () => {
    assert.equal(formatAnswer('il', 'aille', 'subjonctif'), "qu'il aille")
    assert.equal(formatAnswer('elle', 'aille', 'subjonctif'), "qu'elle aille")
    assert.equal(formatAnswer('elles', 'aillent', 'subjonctif'), "qu'elles aillent")
  })
})

describe('compléments d’objet dans les questions', () => {
  it('affiche une phrase naturelle et accepte la forme seule ou la phrase complète', () => {
    const question = formatConjugationQuestion(row({
      infinitif: 'manger',
      conjugaison1: 'mangeait',
      conjugaison2: '',
      temps_name: 'imparfait',
      complement_phrase: 'des pommes',
    }), 'il')

    assert.equal(question.consigne, 'il … des pommes | manger | imparfait (indicatif)')
    assert.ok(question.reponses.includes('mangeait'))
    assert.ok(question.reponses.includes('il mangeait'))
    assert.ok(question.reponses.includes('mangeait des pommes'))
    assert.ok(question.reponses.includes('il mangeait des pommes'))
    assert.deepEqual(question.reponsesPourCorrige, ['il mangeait des pommes'])
    assert.equal(question.complement, 'des pommes')
    assert.equal(question.saisiePrefixe, 'il')
  })

  it('place le complément avant la ponctuation de l’impératif', () => {
    const question = formatConjugationQuestion(row({
      infinitif: 'manger',
      conjugaison1: 'mange',
      conjugaison2: '',
      mode_name: 'impératif',
      complement_phrase: 'une pomme',
    }), 'tu')
    assert.ok(question.reponses.includes('mange une pomme!'))
    assert.deepEqual(question.reponsesPourCorrige, ['mange une pomme!'])
    assert.equal(question.consigne, '… une pomme | manger | présent (impératif)')
    assert.equal(question.saisiePrefixe, '')
  })

  it('prépare un préfixe naturel devant le champ pour les formes élidées', () => {
    const indicative = formatConjugationQuestion(row({
      infinitif: 'aimer',
      conjugaison1: 'aime',
      complement_phrase: 'ce morceau',
    }), 'je')
    const subjunctive = formatConjugationQuestion(row({
      infinitif: 'aimer',
      conjugaison1: 'aime',
      mode_name: 'subjonctif',
      complement_phrase: 'ce morceau',
    }), 'elle')

    assert.equal(indicative.saisiePrefixe, "j'")
    assert.equal(subjunctive.saisiePrefixe, "qu'elle")
  })

  it('antépose le COD et accorde le participe passé employé avec avoir', () => {
    const question = formatConjugationQuestion(row({
      infinitif: 'manger',
      conjugaison1: 'avez mangé',
      conjugaison2: '',
      temps_name: 'passé composé',
      is_compound: 1,
      auxiliaire: 'avoir',
      participe_passe: 'mangé',
      complement_phrase: 'des pommes',
      complement_position: 'before',
      complement_anteposed: 'les pommes',
      complement_gender: 'feminin',
      complement_number: 'pluriel',
    }), 'vous')

    assert.equal(question.consigne, 'les pommes que vous … | manger | passé composé (indicatif)')
    assert.equal(question.complement, 'les pommes')
    assert.equal(question.complementPosition, 'before')
    assert.equal(question.saisiePrefixe, 'que vous')
    assert.ok(question.reponses.includes('avez mangées'))
    assert.equal(question.reponses.includes('avez mangé'), false)
    assert.deepEqual(question.reponsesPourCorrige, ['les pommes que vous avez mangées'])
  })
})

describe('accords du participe passé', () => {
  const source = row({
    infinitif: 'aller',
    conjugaison1: 'sont allés',
    conjugaison2: '',
    auxiliaire: 'être',
    participe_passe: 'allé',
    temps_name: 'passé composé',
    is_compound: 1,
  })

  for (const testCase of [
    { pronoun: 'ils', expected: 'ils sont allés' },
    { pronoun: 'elles', expected: 'elles sont allées' },
    { pronoun: 'iels', expected: 'iels sont allé(e)s' },
  ]) {
    it(`accorde avec ${testCase.pronoun}`, () => {
      const question = formatConjugationQuestion(source, testCase.pronoun)
      assert.ok(question.reponsesPourCorrige.includes(testCase.expected))
    })
  }

  it("n’accorde pas le participe avec le sujet après avoir", () => {
    const question = formatConjugationQuestion(row({
      infinitif: 'ouvrir', conjugaison1: 'ont ouvert', conjugaison2: '', participe_passe: 'ouvert',
      temps_name: 'passé composé', is_compound: 1,
    }), 'elles')
    assert.deepEqual(question.reponsesPourCorrige, ['elles ont ouvert'])
  })
})

describe('impératif et ponctuation', () => {
  it('retire le pronom sujet et ajoute la ponctuation', () => {
    assert.equal(formatAnswer('tu', 'mange', 'impératif'), 'mange!')
  })

  it('accepte assieds-toi et assois-toi', () => {
    const question = formatConjugationQuestion(row({
      infinitif: "s'asseoir",
      conjugaison1: 'assieds-toi',
      conjugaison2: 'assois-toi',
      mode_name: 'impératif',
      temp_id: 9,
    }), 'tu')
    assert.equal(isAnswerCorrect('assieds-toi', question.reponses), true)
    assert.equal(isAnswerCorrect('assois-toi !', question.reponses), true)
  })

  it('accepte le s euphonique et les traits d’union de vas-y et manges-en', () => {
    assert.equal(isAnswerCorrect('vas-y', ['vas-y']), true)
    assert.equal(isAnswerCorrect('manges-en', ['manges-en']), true)
    assert.equal(isAnswerCorrect('va-y', ['vas-y']), false)
    assert.equal(isAnswerCorrect('mange-en', ['manges-en']), false)
  })
})

describe('participe, infinitif et gérondif', () => {
  const verb = {
    id: 87,
    infinitif: 'aimer',
    participe_present: 'aimant',
    participe_passe: 'aimé',
    auxiliaire_participe_present: 'ayant',
  }

  for (const testCase of [
    { id: 20, mode: 'participe', tense: 'présent', expected: 'Aimant' },
    { id: 21, mode: 'participe', tense: 'passé', expected: 'Aimé' },
    { id: 22, mode: 'gérondif', tense: 'présent', expected: 'En aimant' },
    { id: 23, mode: 'gérondif', tense: 'passé', expected: 'En ayant aimé' },
  ]) {
    it(`produit le ${testCase.mode} ${testCase.tense}`, () => {
      const question = formatNonFiniteQuestion(verb, { id: testCase.id, name: testCase.tense, mode_name: testCase.mode })
      assert.deepEqual(question?.reponsesPourCorrige, [testCase.expected])
    })
  }
})

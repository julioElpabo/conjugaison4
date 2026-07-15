import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formatConjugationQuestion } from '../server/services/question-formatter.ts'
import { allowsAnteposedComplement, hasVisibleAnteposedAgreement } from '../server/services/questionnaire.ts'
import { isAnswerCorrect } from '../shared/utils/answer.ts'

describe('sélection des COD antéposés', () => {
  it('réserve le COD antéposé aux temps composés hors impératif', () => {
    assert.equal(allowsAnteposedComplement({ is_compound: 1, mode_name: 'indicatif' }), true)
    assert.equal(allowsAnteposedComplement({ is_compound: 0, mode_name: 'indicatif' }), false)
    assert.equal(allowsAnteposedComplement({ is_compound: 1, mode_name: 'impératif' }), false)
  })

  it('écarte le masculin singulier, les COI et les compléments non antéposables', () => {
    const base = { fonction_objet: 'cod', texte_antepose: 'la chanson', genre: 'féminin', nombre: 'singulier' }
    assert.equal(hasVisibleAnteposedAgreement(base), true)
    assert.equal(hasVisibleAnteposedAgreement({ ...base, texte_antepose: 'les trains', genre: 'masculin', nombre: 'pluriel' }), true)
    assert.equal(hasVisibleAnteposedAgreement({ ...base, texte_antepose: 'le train', genre: 'masculin' }), false)
    assert.equal(hasVisibleAnteposedAgreement({ ...base, fonction_objet: 'coi' }), false)
    assert.equal(hasVisibleAnteposedAgreement({ ...base, texte_antepose: null }), false)
  })
})

function source(overrides = {}) {
  return {
    id: 1,
    verbe_id: 94,
    personne_id: 8,
    temp_id: 5,
    conjugaison1: 'avez mangé',
    conjugaison2: '',
    conjugaison3: '',
    infinitif: 'manger',
    auxiliaire: 'avoir',
    participe_passe: 'mangé',
    temps_name: 'passé composé',
    is_compound: 1,
    mode_name: 'indicatif',
    ...overrides,
  }
}

const codCases = [
  {
    label: 'masculin singulier',
    after: 'un gâteau',
    before: 'le gâteau',
    gender: 'masculin',
    number: 'singulier',
    form: 'avez mangé',
  },
  {
    label: 'féminin singulier',
    after: 'une pomme',
    before: 'la pomme',
    gender: 'feminin',
    number: 'singulier',
    form: 'avez mangée',
  },
  {
    label: 'masculin pluriel',
    after: 'des gâteaux',
    before: 'les gâteaux',
    gender: 'masculin',
    number: 'pluriel',
    form: 'avez mangés',
  },
  {
    label: 'féminin pluriel',
    after: 'des pommes',
    before: 'les pommes',
    gender: 'feminin',
    number: 'pluriel',
    form: 'avez mangées',
  },
]

describe('COD placé après le verbe', () => {
  for (const testCase of codCases) {
    it(`ne provoque aucun accord au ${testCase.label}`, () => {
      const question = formatConjugationQuestion(source({
        complement_phrase: testCase.after,
        complement_position: 'after',
        complement_gender: testCase.gender,
        complement_number: testCase.number,
        complement_function: 'cod',
      }), 'vous')

      assert.ok(question.reponses.includes('avez mangé'))
      assert.ok(question.reponses.includes(`vous avez mangé ${testCase.after}`))
      assert.deepEqual(question.reponsesPourCorrige, [`vous avez mangé ${testCase.after}`])
      assert.equal(isAnswerCorrect('avez mangé', question.reponses), true)
      if (testCase.form !== 'avez mangé') {
        assert.equal(isAnswerCorrect(testCase.form, question.reponses), false)
      }
      assert.equal(question.agreementReminder?.kind, 'cod-after')
      assert.equal(question.agreementReminder?.complement, testCase.after)
      assert.equal(question.agreementReminder?.participle, 'mangé')
    })
  }
})

describe('COD placé avant le verbe', () => {
  for (const testCase of codCases) {
    it(`applique l’accord attendu au ${testCase.label}`, () => {
      const question = formatConjugationQuestion(source({
        complement_phrase: testCase.after,
        complement_position: 'before',
        complement_anteposed: testCase.before,
        complement_gender: testCase.gender,
        complement_number: testCase.number,
        complement_function: 'cod',
      }), 'vous')

      assert.equal(question.saisiePrefixe, 'que vous')
      assert.ok(question.reponses.includes(testCase.form))
      assert.ok(question.reponses.includes(`${testCase.before} que vous ${testCase.form}`))
      assert.deepEqual(question.reponsesPourCorrige, [`${testCase.before} que vous ${testCase.form}`])
      assert.equal(isAnswerCorrect(testCase.form, question.reponses), true)
      if (testCase.form !== 'avez mangé') {
        assert.equal(isAnswerCorrect('avez mangé', question.reponses), false)
      }
      assert.equal(question.agreementReminder?.kind, 'cod-before')
      assert.equal(question.agreementReminder?.infinitive, 'manger')
      assert.equal(question.agreementReminder?.complement, testCase.before)
      assert.equal(question.agreementReminder?.participle, testCase.form.replace(/^avez /u, ''))
      assert.equal(question.agreementReminder?.gender, testCase.gender)
      assert.equal(question.agreementReminder?.number, testCase.number)
    })
  }
})

describe('COD avec les temps simples et l’impératif', () => {
  it('n’ajoute aucun accord du participe à un temps simple', () => {
    const question = formatConjugationQuestion(source({
      conjugaison1: 'mangiez',
      temps_name: 'imparfait',
      mode_name: 'subjonctif',
      is_compound: 0,
      complement_phrase: 'des pommes',
      complement_position: 'before',
      complement_anteposed: 'les pommes',
      complement_gender: 'feminin',
      complement_number: 'pluriel',
      complement_function: 'cod',
    }), 'vous')

    assert.equal(question.saisiePrefixe, 'que vous')
    assert.ok(question.reponses.includes('mangiez'))
    assert.deepEqual(question.reponsesPourCorrige, ['les pommes que vous mangiez'])
    assert.equal(question.agreementReminder, undefined)
  })

  it('n’affiche pas tu comme sujet à l’impératif présent', () => {
    const question = formatConjugationQuestion(source({
      conjugaison1: 'mange',
      temps_name: 'présent',
      mode_name: 'impératif',
      is_compound: 0,
      complement_phrase: 'une pomme',
      complement_position: 'after',
    }), 'tu')

    assert.equal(question.saisiePrefixe, '')
    assert.equal(question.consigne, '… une pomme | manger | présent (impératif)')
    assert.deepEqual(question.reponsesPourCorrige, ['mange une pomme !'])
    assert.equal(isAnswerCorrect('mange', question.reponses), true)
  })

  it('n’affiche pas nous comme sujet à l’impératif passé', () => {
    const question = formatConjugationQuestion(source({
      conjugaison1: 'ayons mangé',
      personne_id: 9,
      temps_name: 'passé',
      mode_name: 'impératif',
      complement_phrase: 'du riz',
      complement_position: 'after',
    }), 'nous')

    assert.equal(question.saisiePrefixe, '')
    assert.equal(question.consigne, '… du riz | manger | passé (impératif)')
    assert.ok(question.reponses.includes('ayons mangé'))
    assert.ok(question.reponses.includes('ayons mangé du riz !'))
    assert.equal(isAnswerCorrect('ayons mangé du riz!', question.reponses), true)
    assert.equal(isAnswerCorrect('ayons mangé du riz', question.reponses), true)
    assert.deepEqual(question.reponsesPourCorrige, ['ayons mangé du riz !'])
    assert.equal(isAnswerCorrect('nous ayons mangé', question.reponses), false)
  })
})

describe('COI placé après le verbe', () => {
  it('ne déclenche jamais l’accord du participe passé', () => {
    const question = formatConjugationQuestion(source({
      infinitif: 'parler',
      conjugaison1: 'avez parlé',
      participe_passe: 'parlé',
      complement_phrase: 'à ses amies',
      complement_position: 'after',
      complement_gender: null,
      complement_number: null,
      complement_function: 'coi',
      complement_preposition: 'à',
    }), 'vous')

    assert.ok(question.reponses.includes('avez parlé'))
    assert.equal(question.reponses.includes('avez parlées'), false)
    assert.deepEqual(question.reponsesPourCorrige, ['vous avez parlé à ses amies'])
    assert.equal(question.agreementReminder?.kind, 'coi')
    assert.equal(question.agreementReminder?.complement, 'à ses amies')
    assert.equal(question.agreementReminder?.preposition, 'à')
    assert.equal(question.agreementReminder?.participle, 'parlé')
  })
})

describe('COI placé avant le verbe', () => {
  it('construit une relative indirecte sans accorder le participe', () => {
    const question = formatConjugationQuestion(source({
      infinitif: 'participer',
      conjugaison1: 'participe',
      temps_name: 'présent',
      is_compound: 0,
      participe_passe: 'participé',
      complement_phrase: 'à une réunion',
      complement_position: 'before',
      complement_anteposed: 'la réunion',
      complement_relative_pronoun: 'à laquelle',
      complement_function: 'coi',
      complement_preposition: 'à',
    }), 'il')

    assert.deepEqual(question.reponsesPourCorrige, ['la réunion à laquelle il participe'])
    assert.ok(question.reponses.includes('la réunion à laquelle il participe'))
    assert.equal(question.consigne, 'la réunion à laquelle il … | participer | présent (indicatif)')
    assert.equal(question.complementFunction, 'coi')
    assert.equal(question.relativePronoun, 'à laquelle')
    assert.equal(question.saisiePrefixe, 'il')
  })
})

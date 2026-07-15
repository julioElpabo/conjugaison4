import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { classicComplementChoiceConfig } from '../shared/utils/classic-complement-choice.ts'

import {
  parseDefiDefinition,
  parseQuestionnaireRequest,
  PublicInputError,
  serializeDefi
} from '../server/services/public-api-validation.ts'

describe('validation des défis partagés', () => {
  it('lit encore le tuple historique et ses options', () => {
    const challenge = parseDefiDefinition([
      [1, 2, 3],
      [1, 4],
      20,
      ['ililsonly'],
      'afficherIel'
    ])

    assert.equal(challenge.version, 1)
    assert.equal(challenge.exerciseKind, 'conjugation')
    assert.equal(challenge.pastSimplePronouns, 'third-person-only')
    assert.equal(challenge.inclusivePronouns, true)
    assert.equal(challenge.includeComplements, false)
    assert.equal(challenge.complementPlacement, 'after')
    assert.deepEqual(challenge.complementOptions, [])
    assert.equal(challenge.printOptions.title, 'Défi de conjugaison')
  })

  it('conserve toutes les options du format moderne', () => {
    const input = {
      version: 1,
      verbIds: [1, 2],
      tenseIds: [1, 2],
      questionCount: 10,
      exerciseKind: 'tense-identification',
      pastSimplePronouns: 'all',
      inclusivePronouns: true,
      includeComplements: true,
      complementPlacement: 'mixed',
      complementOptions: ['cod-after', 'coi-before'],
      printOptions: {
        title: 'Ma fiche',
        showGrade: false,
        showVerbs: true,
        showTenses: true,
        showFirstName: false,
        showLastName: false,
        showDate: true,
        showRandomNumber: true
      }
    }

    const parsed = parseDefiDefinition(input)
    assert.deepEqual(JSON.parse(serializeDefi(parsed)), parsed)
  })

  it('rejette les champs inattendus', () => {
    assert.throws(
      () => parseDefiDefinition({ verbIds: [1], tenseIds: [1], questionCount: 5, admin: true }),
      PublicInputError
    )
  })
})

describe('validation des questionnaires', () => {
  it('normalise les alias historiques', () => {
    const request = parseQuestionnaireRequest({
      verbIds: [1],
      tenseIds: [4],
      questionCount: 5,
      exerciseKind: 'normal',
      pastSimplePronouns: 'ililsonly',
      inclusivePronouns: false
    })

    assert.equal(request.exerciseKind, 'conjugation')
    assert.equal(request.pastSimplePronouns, 'third-person-only')
    assert.equal(request.includeComplements, false)
    assert.equal(request.complementPlacement, 'after')
    assert.deepEqual(request.complementOptions, [])
  })

  it('valide les options de présence et de position des compléments', () => {
    const request = parseQuestionnaireRequest({
      verbIds: [1], tenseIds: [5], questionCount: 5,
      exerciseKind: 'conjugation', pastSimplePronouns: 'all', inclusivePronouns: false,
      includeComplements: true, complementPlacement: 'before'
    })
    assert.equal(request.includeComplements, true)
    assert.equal(request.complementPlacement, 'before')
    assert.deepEqual(request.complementOptions, ['cod-before'])
    const independent = parseQuestionnaireRequest({
      ...request,
      complementOptions: ['cod-after', 'coi-after', 'coi-before'],
    })
    assert.deepEqual(independent.complementOptions, ['cod-after', 'coi-after', 'coi-before'])
    assert.throws(
      () => parseQuestionnaireRequest({ ...request, complementPlacement: 'partout' }),
      PublicInputError
    )
    assert.throws(
      () => parseQuestionnaireRequest({ ...request, complementOptions: ['ailleurs'] }),
      PublicInputError
    )
  })

  it('accepte un emploi pronominal représenté par un identifiant virtuel négatif', () => {
    const request = parseQuestionnaireRequest({
      verbIds: [-66],
      tenseIds: [1],
      questionCount: 5,
      exerciseKind: 'conjugation',
      pastSimplePronouns: 'all',
      inclusivePronouns: false
    })

    assert.deepEqual(request.verbIds, [-66])
  })

  it('continue de refuser zéro et les identifiants de temps négatifs', () => {
    const base = {
      verbIds: [1], tenseIds: [1], questionCount: 5,
      exerciseKind: 'conjugation', pastSimplePronouns: 'all', inclusivePronouns: false
    }
    assert.throws(() => parseQuestionnaireRequest({ ...base, verbIds: [0] }), PublicInputError)
    assert.throws(() => parseQuestionnaireRequest({ ...base, tenseIds: [-1] }), PublicInputError)
  })
})

describe('menu de lancement de l’exercice classique', () => {
  it('traduit les quatre choix en options de questionnaire', () => {
    assert.deepEqual(classicComplementChoiceConfig('none'), {
      includeComplements: false,
      complementPlacement: 'after',
    })
    assert.deepEqual(classicComplementChoiceConfig('after'), {
      includeComplements: true,
      complementPlacement: 'after',
    })
    assert.deepEqual(classicComplementChoiceConfig('before'), {
      includeComplements: true,
      complementPlacement: 'before',
    })
    assert.deepEqual(classicComplementChoiceConfig('mixed'), {
      includeComplements: true,
      complementPlacement: 'mixed',
    })
  })
})

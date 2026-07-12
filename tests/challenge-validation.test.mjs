import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

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
  })
})

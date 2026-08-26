import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  diagnoseLearnerError,
  learnerErrorDetailText,
  learnerErrorDetails,
  learnerErrorDisplayCoverage,
} from '../shared/utils/learner-error-diagnostics.ts'
import { diagnoseCoachAnswer } from '../shared/utils/coach-feedback.ts'

describe('diagnostic visible du futur antérieur à la place du conditionnel passé', () => {
  it('analyse « je serai entrée » une seule fois et sans inventer l’auxiliaire avoir', () => {
    const question = {
      titre: 'entrer',
      consigne: 'je | entrer | conditionnel passé',
      reponses: ['serais entré', 'serais entrée'],
      reponsesPourCorrige: ['je serais entré', 'je serais entrée'],
      personId: 4,
      pronom: 'je',
      infinitif: 'entrer',
      temps: 'passé',
      mode: 'conditionnel',
      isCompound: true,
      conjugationConfusions: [{
        tense: 'futur antérieur',
        mode: 'indicatif',
        answers: ['serai entré', 'serai entrée'],
      }],
    }

    const tags = diagnoseLearnerError('serai entrée', question)
    const details = learnerErrorDetails('serai entrée', question)
    const visibleText = details.map(detail => learnerErrorDetailText(detail)).join(' ')
    const coverage = learnerErrorDisplayCoverage(details)

    assert.deepEqual(tags.map(tag => tag.code), ['task.wrong_mode', 'task.wrong_tense'])
    assert.equal(details.length, 2)
    assert.match(visibleText, /mode « indicatif »/u)
    assert.match(visibleText, /temps « futur antérieur »/u)
    assert.doesNotMatch(visibleText, /avoir|accord|participe passé/iu)
    assert.deepEqual(coverage, {
      agreement: false,
      auxiliary: false,
      futureSimpleForNearFuture: false,
      conjugationConfusion: true,
      impossibleEnding: false,
    })
  })
})

describe('cohérence des diagnostics entre temps simples et composés', () => {
  it('ne traite pas « étais » comme un auxiliaire dans « il étais »', () => {
    const question = {
      titre: 'être',
      consigne: 'il | être | imparfait',
      reponses: ['il était'],
      reponsesPourCorrige: ['il était'],
      personId: 6,
      pronom: 'il',
      infinitif: 'être',
      temps: 'imparfait',
      mode: 'indicatif',
      isCompound: false,
    }

    const details = learnerErrorDetails('il étais', question)
    const visibleText = details.map(detail => learnerErrorDetailText(detail)).join(' ')

    assert.deepEqual(details.map(detail => detail.code), ['person.impossible_ending'])
    assert.match(visibleText, /ne peut pas se terminer par « -s »/u)
    assert.doesNotMatch(visibleText, /auxiliaire/iu)
  })

  it('ne signale jamais un auxiliaire dans un temps simple de être ou avoir', () => {
    const cases = [
      { learner: 'tu était', expected: 'tu étais', personId: 5, pronoun: 'tu', verb: 'être' },
      { learner: 'il étais', expected: 'il était', personId: 6, pronoun: 'il', verb: 'être' },
      { learner: 'tu avait', expected: 'tu avais', personId: 5, pronoun: 'tu', verb: 'avoir' },
      { learner: 'il avais', expected: 'il avait', personId: 6, pronoun: 'il', verb: 'avoir' },
    ]

    for (const item of cases) {
      const question = {
        titre: item.verb,
        consigne: `${item.pronoun} | ${item.verb} | imparfait`,
        reponses: [item.expected],
        reponsesPourCorrige: [item.expected],
        personId: item.personId,
        pronom: item.pronoun,
        infinitif: item.verb,
        temps: 'imparfait',
        mode: 'indicatif',
        isCompound: false,
      }
      assert.notEqual(diagnoseCoachAnswer(item.learner, question, false).errorKind, 'auxiliary')
      assert.doesNotMatch(
        learnerErrorDetails(item.learner, question).map(detail => learnerErrorDetailText(detail)).join(' '),
        /auxiliaire/iu,
      )
    }
  })

  it('distingue une mauvaise forme du même auxiliaire d’un vrai changement être/avoir', () => {
    const baseQuestion = {
      titre: 'finir',
      consigne: 'il | finir | plus-que-parfait',
      reponses: ['il avait fini'],
      reponsesPourCorrige: ['il avait fini'],
      personId: 6,
      pronom: 'il',
      infinitif: 'finir',
      temps: 'plus-que-parfait',
      mode: 'indicatif',
      isCompound: true,
    }

    assert.notEqual(diagnoseCoachAnswer('il avaient fini', baseQuestion, false).errorKind, 'auxiliary')
    assert.equal(diagnoseCoachAnswer('il était fini', baseQuestion, false).errorKind, 'auxiliary')
  })
})

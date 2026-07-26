import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applicableLearnerErrorTypes,
  diagnoseLearnerError,
  learnerErrorDetailText,
  learnerErrorDetails,
  learnerErrorLabels,
} from '../shared/utils/learner-error-diagnostics.ts'
import { buildLearnerErrorInsights } from '../shared/utils/learner-error-insights.ts'
import { buildLearnerErrorProgress } from '../shared/utils/learner-error-progress.ts'
import { diagnoseCoachAgreement } from '../shared/utils/coach-feedback.ts'

function question(overrides = {}) {
  return {
    titre: 'finir',
    consigne: 'je | finir | indicatif présent',
    reponses: ['finis'],
    reponsesPourCorrige: ['je finis'],
    personId: 4,
    pronom: 'je',
    infinitif: 'finir',
    temps: 'présent',
    mode: 'indicatif',
    ...overrides,
  }
}

describe('classement pédagogique des erreurs', () => {
  it('reconnaît une forme correcte employée à un autre temps', () => {
    const target = question({
      conjugationConfusions: [{
        tense: 'imparfait',
        mode: 'indicatif',
        answers: ['finissais'],
      }],
    })
    const tags = diagnoseLearnerError('finissais', target)

    assert.deepEqual(tags.map(tag => tag.code), ['task.wrong_tense'])
    assert.equal(tags[0].confidence, 'high')
    assert.equal(
      learnerErrorDetailText(learnerErrorDetails('finissais', target)[0]),
      'Tu as utilisé le temps « imparfait », alors que le temps « présent » était demandé.',
    )
  })

  it('conserve à la fois la confusion de temps et l’erreur d’accord', () => {
    const target = question({
      reponses: ['avais lue'],
      reponsesPourCorrige: ['la consigne que tu avais lue'],
      temps: 'plus-que-parfait',
      isCompound: true,
      conjugationConfusions: [{
        tense: 'passé composé',
        mode: 'indicatif',
        answers: ['as lu'],
      }],
      agreementReminder: {
        kind: 'cod-before',
        infinitive: 'lire',
        complement: 'la consigne',
        participle: 'lue',
        gender: 'feminin',
        number: 'singulier',
      },
    })
    const tags = diagnoseLearnerError('as lu', target)

    assert.deepEqual(tags.map(tag => tag.code), [
      'task.wrong_tense',
      'agreement.cod_before',
    ])
    assert.deepEqual(tags.map(tag => tag.primary), [true, false])
    assert.equal(diagnoseCoachAgreement('as lu', target)?.agreementSource, 'cod-before')
  })

  it('conserve à la fois l’auxiliaire incorrect et l’erreur d’accord', () => {
    const target = question({
      reponses: ['ont lus'],
      reponsesPourCorrige: ['les articles qu’ils ont lus'],
      personId: 8,
      pronom: 'ils',
      infinitif: 'lire',
      temps: 'passé composé',
      isCompound: true,
      agreementReminder: {
        kind: 'cod-before',
        infinitive: 'lire',
        complement: 'les articles',
        participle: 'lus',
        gender: 'masculin',
        number: 'pluriel',
      },
    })
    const tags = diagnoseLearnerError('avait lu', target)

    assert.deepEqual(tags.map(tag => tag.code), [
      'compound.auxiliary',
      'agreement.cod_before',
    ])
    assert.deepEqual(tags.map(tag => tag.primary), [true, false])
    assert.equal(tags[0].evidence.learnerAuxiliary, 'avait')
    assert.equal(tags[0].evidence.expectedAuxiliary, 'ont')
    assert.equal(
      learnerErrorDetailText(learnerErrorDetails('avait lu', target)[0]),
      'Tu as utilisé l’auxiliaire « avait », alors qu’il fallait « ont ».',
    )
    assert.deepEqual(learnerErrorLabels('avait lu', target), [
      'Auxiliaire incorrect',
      'Accord avec un COD placé avant',
    ])
  })

  it('distingue la forme d’une autre personne de la terminaison générique', () => {
    const target = question({
      reponses: ['finissent'],
      reponsesPourCorrige: ['ils finissent'],
      personId: 8,
      pronom: 'ils',
      radicalReference: {
        kind: 'present-nous',
        label: 'nous finissons',
        form: 'finissons',
        removableEnding: 'ons',
        radical: 'finiss',
        paradigmForms: [
          { subject: 'je', form: 'finis', personId: 4 },
          { subject: 'il', form: 'finit', personId: 6 },
        ],
      },
    })
    const tags = diagnoseLearnerError('finit', target)
    const details = learnerErrorDetails('finit', target)

    assert.deepEqual(tags.map(tag => tag.code), ['person.other_form'])
    assert.equal(tags[0].evidence.detectedPerson, 'il')
    assert.equal(tags[0].evidence.expectedPerson, 'ils')
    assert.deepEqual(details, [{
      code: 'person.other_form',
      label: 'Forme d’une autre personne',
      message: 'Tu as confondu les personnes.',
      learnerValue: 'il',
      expectedValue: 'ils',
    }])
    assert.equal(learnerErrorDetailText(details[0]), 'Tu as confondu les personnes. il à la place de ils')
  })

  it('explique humainement la confusion entre -ont et -ons', () => {
    const target = question({
      reponses: ['répondrons'],
      reponsesPourCorrige: ['nous répondrons'],
      personId: 7,
      pronom: 'nous',
      infinitif: 'répondre',
      temps: 'futur',
    })
    const tags = diagnoseLearnerError('répondront', target)
    const details = learnerErrorDetails('répondront', target)

    assert.deepEqual(tags.map(tag => tag.code), ['person.other_form'])
    assert.deepEqual(details, [{
      code: 'person.other_form',
      label: 'Forme d’une autre personne',
      message: 'Tu as confondu la terminaison de « ils/elles » avec celle de « nous ».',
      learnerValue: '-ont (ils/elles)',
      expectedValue: '-ons (nous)',
    }])
  })

  it('distingue une faute de recopie du COD d’une faute de conjugaison', () => {
    const target = question({
      titre: 'raconter',
      infinitif: 'raconter',
      reponses: [
        'a raconté',
        'il a raconté',
        'a raconté les événements',
        'il a raconté les événements',
      ],
      reponsesPourCorrige: ['il a raconté les événements'],
      pronom: 'il',
      complement: 'les événements',
      complementPosition: 'after',
      complementFunction: 'cod',
      isCompound: true,
    })
    const tags = diagnoseLearnerError('il a raconté les événement', target)
    const detail = learnerErrorDetails('il a raconté les événement', target)[0]

    assert.equal(tags[0].code, 'orthography.copied_complement')
    assert.equal(tags[0].evidence.complementFunction, 'COD')
    assert.equal(
      learnerErrorDetailText(detail),
      'Tu as fait une faute d’orthographe en recopiant le COD : « les événement » au lieu de « les événements ».',
    )
    assert.ok(applicableLearnerErrorTypes(target).includes('orthography.copied_complement'))
  })

  it('explique le cas affiché dans le chat avec une anecdote mal recopiée', () => {
    const target = question({
      titre: 'raconter',
      infinitif: 'raconter',
      reponses: [
        'racontâtes',
        'vous racontâtes',
        'racontâtes une anecdote',
        'vous racontâtes une anecdote',
      ],
      reponsesPourCorrige: ['vous racontâtes une anecdote'],
      pronom: 'vous',
      complement: 'une anecdote',
      complementPosition: 'after',
      complementFunction: 'cod',
    })

    assert.equal(
      learnerErrorDetailText(learnerErrorDetails('racontâtes une adedote', target)[0]),
      'Tu as fait une faute d’orthographe en recopiant le COD : « une adedote » au lieu de « une anecdote ».',
    )
    assert.ok(
      learnerErrorDetails('avez raconté une anedote', target)
        .some(detail => learnerErrorDetailText(detail)
          === 'Tu as fait une faute d’orthographe en recopiant le COD : « une anedote » au lieu de « une anecdote ».'),
    )
    assert.deepEqual(
      learnerErrorDetails('racontâtes une anectote', target).map(detail => detail.code),
      ['orthography.copied_complement'],
    )
  })

  it('explique aussi une faute de recopie du COI', () => {
    const target = question({
      titre: 'parler',
      infinitif: 'parler',
      reponses: [
        'parle',
        'il parle',
        'parle à ses voisines',
        'il parle à ses voisines',
      ],
      reponsesPourCorrige: ['il parle à ses voisines'],
      pronom: 'il',
      complement: 'à ses voisines',
      complementPosition: 'after',
      complementFunction: 'coi',
    })

    const tags = diagnoseLearnerError('il parle à ses voisine', target)
    assert.equal(tags[0].code, 'orthography.copied_complement')
    assert.equal(tags[0].evidence.complementFunction, 'COI')
  })

  it('repère une terminaison impossible et les compétences sollicitées', () => {
    const target = question({
      isCompound: true,
      agreementReminder: {
        kind: 'cod-before',
        infinitive: 'finir',
        complement: 'les tâches',
        participle: 'fini',
        gender: 'feminin',
        number: 'pluriel',
      },
    })
    assert.equal(diagnoseLearnerError('finit', target)[0].code, 'person.impossible_ending')
    assert.ok(applicableLearnerErrorTypes(target).includes('agreement.cod_before'))
    assert.ok(applicableLearnerErrorTypes(target).includes('compound.auxiliary'))
  })

  it('ne confond pas un accord indu avec avoir et un accord avec le sujet', () => {
    const tags = diagnoseLearnerError('ai finie', question({
      reponses: ['ai fini'],
      reponsesPourCorrige: ['j’ai fini'],
      isCompound: true,
    }))

    assert.equal(tags[0].code, 'agreement.avoir_unwarranted')
    assert.ok(applicableLearnerErrorTypes(question({
      reponses: ['ai fini'],
      isCompound: true,
    })).includes('agreement.avoir_unwarranted'))
  })
})

describe('synthèse longitudinale des types d’erreurs', () => {
  it('masque les erreurs non encore classées', () => {
    const summary = buildLearnerErrorInsights([{
      code: 'unknown',
      opportunities: 10,
      errors: 4,
      primaryErrors: 4,
      recentOpportunities: 5,
      recentErrors: 2,
      previousOpportunities: 5,
      previousErrors: 2,
    }])

    assert.deepEqual(summary.insights, [])
    assert.equal(summary.totalErrors, 0)
    assert.equal(summary.dominant, null)
  })

  it('rapporte les erreurs aux occasions et détecte une amélioration', () => {
    const summary = buildLearnerErrorInsights([{
      code: 'morphology.ending',
      opportunities: 20,
      errors: 8,
      recentOpportunities: 10,
      recentErrors: 2,
      previousOpportunities: 10,
      previousErrors: 6,
    }])

    assert.equal(summary.insights[0].errorRate, 40)
    assert.equal(summary.insights[0].trend, 'improving')
    assert.equal(summary.insights[0].trendDelta, -40)
  })

  it('refuse une tendance lorsque les occasions sont insuffisantes', () => {
    const summary = buildLearnerErrorInsights([{
      code: 'orthography.accent',
      opportunities: 2,
      errors: 1,
      recentOpportunities: 2,
      recentErrors: 1,
      previousOpportunities: 0,
      previousErrors: 0,
    }])

    assert.equal(summary.insights[0].trend, 'insufficient')
    assert.equal(summary.dominant, null)
  })
})

describe('progression par occasions réellement testées', () => {
  it('ne crée pas de carte pour les erreurs non encore classées', () => {
    const summary = buildLearnerErrorProgress([{
      code: 'unknown',
      statDate: '2026-07-26',
      opportunities: 10,
      errors: 4,
    }], '2026-07-26')

    assert.deepEqual(summary.cards, [])
  })

  it('compare plusieurs défis réalisés le même jour', () => {
    const summary = buildLearnerErrorProgress([
      {
        code: 'task.wrong_tense',
        statDate: '2026-07-26',
        sequence: 101,
        opportunities: 10,
        errors: 7,
      },
      {
        code: 'task.wrong_tense',
        statDate: '2026-07-26',
        sequence: 102,
        opportunities: 10,
        errors: 5,
      },
      {
        code: 'task.wrong_tense',
        statDate: '2026-07-26',
        sequence: 103,
        opportunities: 10,
        errors: 3,
      },
      {
        code: 'task.wrong_tense',
        statDate: '2026-07-26',
        sequence: 104,
        opportunities: 10,
        errors: 1,
      },
    ], '2026-07-26')
    const card = summary.cards[0]

    assert.equal(card.currentRate, 10)
    assert.equal(card.previousRate, 30)
    assert.equal(card.trend, 'improving')
    assert.equal(card.trendDelta, -20)
    assert.deepEqual(card.points.map(point => point.errorRate), [70, 50, 30, 10])
  })

  it('compare des taux malgré un nombre différent d’occurrences dans les défis', () => {
    const summary = buildLearnerErrorProgress([
      {
        code: 'morphology.ending',
        statDate: '2026-01-10',
        opportunities: 10,
        errors: 5,
      },
      {
        code: 'morphology.ending',
        statDate: '2026-02-10',
        opportunities: 30,
        errors: 3,
      },
    ], '2026-02-10')
    const card = summary.cards[0]

    assert.equal(card.currentRate, 10)
    assert.equal(card.previousRate, 50)
    assert.equal(card.trend, 'improving')
    assert.equal(card.trendDelta, -40)
    assert.deepEqual(card.points.map(point => point.errorRate), [50, 10])
  })

  it('signale une compétence ancienne sans inventer de réussite pendant le silence', () => {
    const summary = buildLearnerErrorProgress([
      {
        code: 'agreement.cod_before',
        statDate: '2026-01-01',
        opportunities: 10,
        errors: 4,
      },
    ], '2026-03-20')
    const card = summary.cards[0]

    assert.equal(card.lastTestedAt, '2026-01-01')
    assert.equal(card.daysSinceLastTest, 78)
    assert.equal(card.isStale, true)
    assert.equal(card.currentRate, 40)
    assert.equal(card.points.at(-1).date, '2026-01-01')
  })

  it('attend assez d’occasions avant de tracer une courbe', () => {
    const summary = buildLearnerErrorProgress([
      {
        code: 'orthography.accent',
        statDate: '2026-02-01',
        opportunities: 3,
        errors: 1,
      },
    ], '2026-02-01')

    assert.equal(summary.cards[0].trend, 'insufficient')
    assert.deepEqual(summary.cards[0].points, [])
  })
})

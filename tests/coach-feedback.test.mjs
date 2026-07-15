import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  createCoachFeedback,
  createCoachFeedbackState,
  diagnoseCoachAnswer,
} from '../shared/utils/coach-feedback.ts'

function question(overrides = {}) {
  return {
    titre: 'finir', consigne: 'ils | finir | imparfait (indicatif)',
    reponses: ['ils finissaient'], reponsesPourCorrige: ['ils finissaient'],
    infinitif: 'finir', pronom: 'ils', temps: 'imparfait', mode: 'indicatif',
    ...overrides,
  }
}

describe('diagnostic pédagogique des réponses', () => {
  it('identifie un accent sans prétendre que la conjugaison est fausse', () => {
    const diagnostic = diagnoseCoachAnswer('vous etes', question({
      reponses: ['vous êtes'], reponsesPourCorrige: ['vous êtes'], pronom: 'vous',
    }), false)
    assert.equal(diagnostic.errorKind, 'accent')
    assert.equal(diagnostic.confidence, 'high')
  })

  it('identifie un mauvais auxiliaire', () => {
    const diagnostic = diagnoseCoachAnswer("j'ai allé", question({
      reponses: ['je suis allé'], reponsesPourCorrige: ['je suis allé'], pronom: 'je',
    }), false)
    assert.equal(diagnostic.errorKind, 'auxiliary')
    assert.equal(diagnostic.learnerAuxiliary, 'ai')
    assert.equal(diagnostic.expectedAuxiliary, 'suis')
  })

  it('identifie un accord de participe', () => {
    const diagnostic = diagnoseCoachAnswer('elles sont parti', question({
      reponses: ['elles sont parties'], reponsesPourCorrige: ['elles sont parties'], pronom: 'elles',
    }), false)
    assert.equal(diagnostic.errorKind, 'agreement')
    assert.equal(diagnostic.agreementSource, 'subject')
  })

  it('identifie une terminaison quand un seul mot diffère', () => {
    const diagnostic = diagnoseCoachAnswer('ils finissait', question(), false)
    assert.equal(diagnostic.errorKind, 'ending')
    assert.equal(diagnostic.expectedEnding, 'ent')
    assert.equal(diagnostic.learnerEnding, 't')
  })

  it('ne confond pas une terminaison simple avec un accord', () => {
    const diagnostic = diagnoseCoachAnswer('tu mange', question({
      reponses: ['tu manges'], reponsesPourCorrige: ['tu manges'], pronom: 'tu', temps: 'présent',
    }), false)
    assert.equal(diagnostic.errorKind, 'ending')
  })

  it('reste prudent lorsque la réponse est trop éloignée', () => {
    const diagnostic = diagnoseCoachAnswer('bonjour', question(), false)
    assert.equal(diagnostic.errorKind, 'unknown')
    assert.equal(diagnostic.confidence, 'low')
  })
})

describe('formulation cohérente et variée', () => {
  it('parle de la terminaison uniquement pour une faute de terminaison', () => {
    const q = question()
    const feedback = createCoachFeedback(diagnoseCoachAnswer('ils finissait', q, false), q, createCoachFeedbackState(), { random: () => 0 })
    assert.match(feedback.text, /terminaison/u)
    assert.match(feedback.text, /ils finissaient/u)
  })

  it('donne seulement la correction lorsque la cause est incertaine', () => {
    const q = question()
    const feedback = createCoachFeedback(diagnoseCoachAnswer('bonjour', q, false), q, createCoachFeedbackState(), { random: () => 0 })
    assert.equal(feedback.text, 'Ici, la forme attendue est « ils finissaient ».')
    assert.doesNotMatch(feedback.text, /auxiliaire|accord|terminaison/u)
  })

  it('ne répète pas immédiatement la même formulation', () => {
    const q = question()
    const state = createCoachFeedbackState()
    const diagnostic = diagnoseCoachAnswer('ils finissait', q, false)
    const first = createCoachFeedback(diagnostic, q, state, { random: () => 0 })
    const second = createCoachFeedback(diagnostic, q, state, { random: () => 0 })
    assert.notEqual(first.templateId, second.templateId)
    assert.match(second.text, /^Même point à surveiller :/u)
  })

  it('varie aussi les validations correctes', () => {
    const q = question()
    const state = createCoachFeedbackState()
    const diagnostic = diagnoseCoachAnswer('ils finissaient', q, true)
    const ids = Array.from({ length: 4 }, () => createCoachFeedback(diagnostic, q, state, { random: () => 0 }).templateId)
    assert.equal(new Set(ids).size, 4)
  })
})

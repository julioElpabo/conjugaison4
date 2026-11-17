import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { diagnoseCoachAnswer } from '../shared/utils/coach-feedback.ts'
import { learnerErrorDetails } from '../shared/utils/learner-error-diagnostics.ts'
import { buildRadicalReference } from '../shared/utils/radical-reference.ts'

function target(overrides = {}) {
  const reference = buildRadicalReference({
    infinitive: 'raccrocher', mode: 'indicatif', tense: 'présent', personId: 6,
    conjugation: 'raccroche',
  }, [{ mode: 'indicatif', tense: 'présent', personId: 9, pronoun: 'ils', form: 'raccrochent' }])
  return {
    titre: 'raccrocher', infinitif: 'raccrocher', consigne: 'il | raccrocher | présent',
    mode: 'indicatif', temps: 'présent', personId: 6, pronom: 'il',
    reponses: ['il raccroche'], reponsesPourCorrige: ['il raccroche'],
    radicalReference: reference, ...overrides,
  }
}

describe('ne confond pas une faute dans le radical avec une terminaison fausse', () => {
  it('corrige le cas signalé racroche → raccroche', () => {
    const question = target()
    assert.ok(question.radicalReference?.validated)
    assert.equal(diagnoseCoachAnswer('il racroche', question, false).errorKind, 'close-form')
    const details = learnerErrorDetails('il racroche', question)
    assert.deepEqual(details.map(detail => detail.code), ['input.close_form'])
    assert.equal(details[0].message, 'Il manque un c : raccroche.')
    assert.doesNotMatch(details[0].message, /terminaison/u)
  })

  it('reste exact avec un ancien questionnaire sans forme repère', () => {
    for (const overrides of [{ radicalReference: undefined }, { radicalReference: undefined, infinitif: undefined, mode: undefined, temps: undefined }]) {
      assert.equal(diagnoseCoachAnswer('il racroche', target(overrides), false).errorKind, 'close-form')
    }
  })

  it('couvre les lettres ajoutées, omises, remplacées ou inversées avant une fin correcte', () => {
    for (const answer of ['il racroche', 'il raccorche', 'il raccrotche', 'il raccrochhe', 'il raccrauche']) {
      assert.equal(diagnoseCoachAnswer(answer, target(), false).errorKind, 'close-form', answer)
      assert.ok(learnerErrorDetails(answer, target()).every(detail => detail.code !== 'morphology.ending'), answer)
    }
  })

  it('couvre toutes les personnes et plusieurs temps sans forme repère', () => {
    for (const [pronoun, personId, tense, expected, learner] of [
      ['je', 4, 'présent', 'raccroche', 'racroche'],
      ['tu', 5, 'présent', 'raccroches', 'racroches'],
      ['nous', 7, 'présent', 'raccrochons', 'racrochons'],
      ['vous', 8, 'présent', 'raccrochez', 'racrochez'],
      ['ils', 9, 'présent', 'raccrochent', 'racrochent'],
      ['je', 4, 'imparfait', 'raccrochais', 'racrochais'],
      ['je', 4, 'futur', 'raccrocherai', 'racrocherai'],
    ]) {
      const question = target({ pronom: pronoun, personId, temps: tense, radicalReference: undefined, reponses: [`${pronoun} ${expected}`], reponsesPourCorrige: [`${pronoun} ${expected}`] })
      assert.equal(diagnoseCoachAnswer(`${pronoun} ${learner}`, question, false).errorKind, 'close-form', `${pronoun} ${learner}`)
    }
  })

  it('ne ramène pas une double faute de radical et de fin à la seule terminaison', () => {
    const question = target({ personId: 4, pronom: 'je', reponses: ['je raccroche'], reponsesPourCorrige: ['je raccroche'] })
    assert.equal(diagnoseCoachAnswer('je racroches', question, false).errorKind, 'close-form')
  })

  it('conserve le diagnostic d’une vraie erreur de terminaison', () => {
    for (const answer of ['il raccroch', 'il raccrochez']) {
      const diagnostic = diagnoseCoachAnswer(answer, target(), false)
      assert.equal(diagnostic.errorKind, 'ending', answer)
      assert.equal(diagnostic.expectedEnding, 'e')
    }
  })

  it('conserve les diagnostics d’accent et la reconnaissance des bonnes réponses', () => {
    const question = target({ infinitif: 'préparer', radicalReference: undefined, reponses: ['il prépare'], reponsesPourCorrige: ['il prépare'] })
    assert.equal(diagnoseCoachAnswer('il prepare', question, false).errorKind, 'accent')
    assert.deepEqual(learnerErrorDetails('il raccroche', target()), [])
  })
})

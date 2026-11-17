import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { validateAnswer, validateConjugationAnswer, normalizeAnswer } from '../shared/utils/answer.ts'
import { learnerErrorDetails, concealLearnerErrorDetail } from '../shared/utils/learner-error-diagnostics.ts'
import { subjectPronounIssue } from '../shared/utils/subject-pronoun-feedback.ts'
import { findConjugationElisionIssue } from '../shared/utils/conjugation-orthography.ts'
import { evaluateExerciseAnswer } from '../shared/utils/exercise-attempt.ts'
import { learnerQuestionSnapshot } from '../server/utils/learner-progress.ts'
import { compactLearnerQuestion } from '../shared/utils/learner-question-snapshot.ts'
import { localizedLearnerErrorMessage } from '../shared/i18n/learner-errors.ts'
import { SUPPORTED_LOCALES } from '../shared/i18n/locales.ts'
import { auditRenderedLearnerFeedback } from '../shared/utils/learner-feedback-audit.ts'

function target(expected, overrides = {}) {
  return {
    titre: 'croire', infinitif: 'croire', consigne: 'je | croire | passé composé',
    mode: 'indicatif', temps: 'passé composé', isCompound: true, personId: 4, pronom: 'je',
    reponses: [expected], reponsesPourCorrige: [expected], ...overrides,
  }
}

describe('signalement Moser : refus et commentaire correct sans fausse confusion de personne', () => {
  for (const [answer, expected, pronom, kind, learnerValue, expectedValue] of [
    ['je ai cru', 'j’ai cru', 'je', 'elision', 'je ai', "j'ai"],
    ['il acouru', 'il a couru', 'il', 'word-spacing', 'acouru', 'a couru'],
    ['on aparlé', 'on a parlé', 'on', 'word-spacing', 'aparlé', 'a parlé'],
    ['j ai cru', "j'ai cru", 'je', 'elision', 'j ai', "j'ai"],
    ["j'aicru", "j'ai cru", 'je', 'word-spacing', "j'aicru", "j'ai cru"],
    ['je me appelle', "je m'appelle", 'je', 'elision', 'me appelle', "m'appelle"],
    ['il se est garé', "il s'est garé", 'il', 'elision', 'se est', "s'est"],
    ['je me suismaquillé', 'je me suis maquillé', 'je', 'word-spacing', 'suismaquillé', 'suis maquillé'],
    ['il a par lé', 'il a parlé', 'il', 'word-spacing', 'par lé', 'parlé'],
    ['il a cou ru', 'il a couru', 'il', 'word-spacing', 'cou ru', 'couru'],
  ]) {
    it(answer, () => {
      const question = target(expected, { pronom })
      assert.equal(validateConjugationAnswer(answer, question).isCorrect, false)
      assert.equal(evaluateExerciseAnswer(answer, question, false, true).result.isCorrect, false)
      const details = learnerErrorDetails(answer, question)
      assert.deepEqual(details.map(d => d.code), ['orthography.punctuation'])
      assert.equal(details[0].orthographyIssueKind, kind)
      assert.equal(details[0].learnerValue, learnerValue)
      assert.equal(details[0].expectedValue, expectedValue)
      assert.ok(!details.some(d => /person\.|agreement\.|morphology\./u.test(d.code)))
      assert.doesNotMatch(details[0].message, /confondu|personne|terminaison/u)
      for (const snapshot of [compactLearnerQuestion(question), learnerQuestionSnapshot(compactLearnerQuestion(question)), JSON.parse(JSON.stringify(learnerQuestionSnapshot(question)))]) {
        assert.equal(validateConjugationAnswer(answer, snapshot).isCorrect, false)
        assert.deepEqual(learnerErrorDetails(answer, snapshot), details)
      }
      for (const locale of SUPPORTED_LOCALES) {
        for (const revealsAnswers of [true, false]) {
          const visible = revealsAnswers ? details : details.map(concealLearnerErrorDetail)
          assert.equal(visible[0].orthographyIssueKind, kind)
          if (!revealsAnswers) assert.equal(visible[0].expectedValue, undefined)
          const renderedText = visible.map(d => localizedLearnerErrorMessage(d, locale)).join(' ')
          assert.equal(auditRenderedLearnerFeedback({ answer, question, details: visible, locale, revealsAnswers, renderedText }).status, 'passed')
        }
      }
    })
  }
})

describe('conserve les bonnes réponses, sans élargir les autres règles de validation', () => {
  for (const [answer, expected, pronom] of [
    ["j'ai cru", 'j’ai cru', 'je'], ['J’AI CRU', "j'ai cru", 'je'], ['jʼai cru', 'j’ai cru', 'je'],
    ['  il  a\t couru\n', 'il a couru', 'il'], ['on\u00a0a\u202fparlé', 'on a parlé', 'on'],
    ['je me suis maquille\u0301', 'je me suis maquillé', 'je'],
    ['je hais', 'je hais', 'je'], ['je hache', 'je hache', 'je'],
    ['je me suis maquillée', 'je me suis maquillée', 'je'],
  ]) {
    it(answer, () => {
      const question = target(expected, { pronom })
      assert.equal(validateConjugationAnswer(answer, question).isCorrect, true)
      assert.deepEqual(learnerErrorDetails(answer, question), [])
    })
  }
  it('respecte les variantes admises, même si une autre aurait une différence d’élision', () => {
    const q = target("j'ai cru", { reponses: ["j'ai cru", 'je ai cru'] })
    assert.equal(findConjugationElisionIssue('je ai cru', q), null)
  })
  it('conserve le normaliseur historique pour les exercices de reconnaissance et les autres comparaisons', () => {
    assert.equal(normalizeAnswer('il acouru'), normalizeAnswer('il a couru'))
    assert.equal(validateAnswer('il acouru', ['il a couru']).isCorrect, true)
    assert.equal(validateAnswer('passécomposé', ['passé composé']).isCorrect, true)
  })
  it('ne corrige pas silencieusement un accent, un trait d’union ou un mauvais auxiliaire', () => {
    for (const [answer, expected, overrides] of [
      ['il a parle', 'il a parlé', { pronom: 'il' }],
      ['va t en', 'va-t’en', { pronom: 'tu', mode: 'impératif' }],
      ['elle a partie', 'elle est partie', { pronom: 'elle' }],
    ]) assert.equal(validateConjugationAnswer(answer, target(expected, overrides)).isCorrect, false)
  })
  it('ne transforme pas je/j en deux personnes lorsque plusieurs fautes sont présentes', () => {
    assert.equal(subjectPronounIssue('je ai crus', target('j’ai cru')), null)
    assert.ok(!learnerErrorDetails('je ai crus', target('j’ai cru')).some(d => d.code === 'person.other_form'))
  })
  it('conserve le pronom obligatoire et les bonnes réponses non personnelles', () => {
    assert.equal(validateConjugationAnswer('ai cru', target("j'ai cru", { reponses: ['ai cru', "j'ai cru"] })).reason, 'missing-subject-pronoun')
    assert.equal(validateConjugationAnswer('en  parlant', target('en parlant', { mode: 'gérondif', pronom: undefined })).isCorrect, true)
    assert.equal(validateConjugationAnswer('enparlant', target('en parlant', { mode: 'gérondif', pronom: undefined })).isCorrect, false)
  })
})

describe('élision avec subjonctif et complément', () => {
  for (const [answer, expected] of [
    ['que je aie cru', 'que j’aie cru'],
    ['les histoires que je ai crues', 'les histoires que j’ai crues'],
    ['je ai cru les histoires', 'j’ai cru les histoires'],
    ['que il ait cru', 'qu’il ait cru'],
  ]) it(answer, () => {
    const q = target(expected, { mode: 'subjonctif', pronom: expected.startsWith('qu’il') ? 'il' : 'je' })
    assert.equal(validateConjugationAnswer(answer, q).isCorrect, false)
    assert.equal(learnerErrorDetails(answer, q)[0].orthographyIssueKind, 'elision')
    assert.equal(validateConjugationAnswer(expected, q).isCorrect, true)
  })
})

it('l’audit refuse désormais je contre je, et je contre j, même avec un texte traduit', () => {
  for (const expected of ['je', 'j']) {
    const detail = { code: 'person.other_form', label: '', message: 'Tu as confondu la personne.', learnerValue: 'je', expectedValue: expected }
    const audit = auditRenderedLearnerFeedback({ question: target('j’ai cru'), answer: 'je ai cru', details: [detail], renderedText: detail.message, locale: 'fr', revealsAnswers: true })
    assert.ok(audit.issues.some(issue => issue.code === 'feedback-identical-persons'))
  }
})

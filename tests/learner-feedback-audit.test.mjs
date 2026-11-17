import assert from 'node:assert/strict'
import { it } from 'node:test'
import { learnerFeedbackCases } from './fixtures/learner-feedback-cases.mjs'
import { auditRenderedLearnerFeedback } from '../shared/utils/learner-feedback-audit.ts'
import { learnerErrorDetails, concealLearnerErrorDetail } from '../shared/utils/learner-error-diagnostics.ts'
import { localizedLearnerErrorMessage } from '../shared/i18n/learner-errors.ts'
import { SUPPORTED_LOCALES } from '../shared/i18n/locales.ts'
import { COACH_HELP_PROFILES } from '../shared/data/coach-help-profiles.ts'

for (const example of learnerFeedbackCases) {
  it(`corpus audité : ${example.name}`, () => {
    const detected = learnerErrorDetails(example.answer, example.question)
    assert.deepEqual(detected.map(d => d.code), example.codes)
    if (example.orthographyIssueKind) assert.equal(detected[0].orthographyIssueKind, example.orthographyIssueKind)
    for (const locale of SUPPORTED_LOCALES) {
      for (const profile of Object.values(COACH_HELP_PROFILES)) {
        const details = profile.revealsAnswers ? detected : detected.map(concealLearnerErrorDetail)
        const renderedText = details.map(d => localizedLearnerErrorMessage(d, locale)).join(' ')
        const audit = auditRenderedLearnerFeedback({ ...example, details, locale, renderedText, revealsAnswers: profile.revealsAnswers })
        assert.equal(audit.status, 'passed', JSON.stringify({ locale, profile: profile.id, audit }))
      }
    }
  })
}

it('l’audit rejette les fausses indications de lettre, d’accord, de terminaison et les pertes de sous-type', () => {
  const spelling = learnerFeedbackCases[0]
  const details = learnerErrorDetails(spelling.answer, spelling.question)
  const missing = { ...details[0], missingLetter: 'z' }
  assert.ok(auditRenderedLearnerFeedback({ ...spelling, details: [missing], locale: 'fr', renderedText: localizedLearnerErrorMessage(missing, 'fr'), revealsAnswers: true }).issues.some(i => i.code === 'feedback-unproven-missing-letter'))
  const ending = { code: 'morphology.ending', label: '', message: 'La terminaison est fausse.', learnerValue: '-e', expectedValue: '-e' }
  assert.ok(auditRenderedLearnerFeedback({ ...spelling, details: [ending], locale: 'fr', renderedText: ending.message, revealsAnswers: true }).issues.some(i => i.code === 'feedback-unproven-ending'))
  const compound = learnerFeedbackCases[4]
  const agreement = { code: 'agreement.avoir_unwarranted', label: '', message: 'Accord indu.' }
  assert.ok(auditRenderedLearnerFeedback({ ...compound, details: [agreement], locale: 'fr', renderedText: agreement.message, revealsAnswers: true }).issues.some(i => i.code === 'feedback-unproven-agreement'))
  const pronoun = learnerFeedbackCases[1]
  assert.ok(auditRenderedLearnerFeedback({ ...pronoun, details: learnerErrorDetails(pronoun.answer, pronoun.question), locale: 'en', renderedText: 'You confused the grammatical person.', revealsAnswers: true }).issues.some(i => i.code === 'feedback-subject-subtype-lost'))
})

it('l’audit rejette une correction divulguée dans un profil sans réponse', () => {
  const example = learnerFeedbackCases[0]
  const details = learnerErrorDetails(example.answer, example.question)
  const renderedText = details.map(d => localizedLearnerErrorMessage(d, 'fr')).join(' ')
  assert.ok(auditRenderedLearnerFeedback({ ...example, details, locale: 'fr', renderedText, revealsAnswers: false }).issues.some(i => i.code === 'feedback-profile-answer-leak'))
})

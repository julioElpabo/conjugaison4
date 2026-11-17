import type { ExerciseQuestion, LearnerErrorDetail } from '../types/conjugation'
import type { AppLocale } from '../i18n/locales'
import type { CoachHelpAuditIssue, CoachHelpAuditResult } from './coach-help-audit'
import { localizedLearnerErrorMessage } from '../i18n/learner-errors'
import { normalizeAnswer, findConjugationSpacingIssue } from './answer'
import { findConjugationElisionIssue } from './conjugation-orthography'
import { agreePastParticiple } from './past-participle-agreement'

const tokens = (value: string): string[] => normalizeAnswer(value, { ignoreWhitespace: false }).match(/\p{L}+/gu) || []
const plain = (value: string) => value.replace(/\s+/gu, ' ').trim()

/** Audit en lecture seule du commentaire effectivement rendu, y compris des traductions et profils. */
export function auditRenderedLearnerFeedback(input: {
  question: ExerciseQuestion
  answer: string
  details: readonly LearnerErrorDetail[]
  renderedText: string
  locale: AppLocale
  revealsAnswers: boolean
}): CoachHelpAuditResult {
  const { question, answer, details, renderedText, locale } = input
  const issues: CoachHelpAuditIssue[] = []
  const fail = (code: string, detail: string) => issues.push({ code, severity: 'error', title: 'Commentaire incohérent', detail })
  const learnerWords = tokens(answer)
  const candidates = question.reponses.map(candidate => tokens(candidate))
  if (/\b(?:undefined|null|NaN)\b/u.test(renderedText)) fail('feedback-invalid-value', 'Une valeur technique est affichée.')
  for (const detail of details) {
    if (detail.code === 'person.other_form' && detail.learnerValue && detail.expectedValue) {
      const subject = (value: string) => normalizeAnswer(value).replace(/^j$/u, 'je')
      if (subject(detail.learnerValue) === subject(detail.expectedValue)) {
        fail('feedback-identical-persons', 'Le commentaire oppose la même personne à elle-même.')
      }
    }
    if (detail.orthographyIssueKind) {
      const proof = detail.orthographyIssueKind === 'elision'
        ? findConjugationElisionIssue(answer, question)
        : findConjugationSpacingIssue(answer, question)
      if (!proof || (detail.expectedValue && detail.expectedValue !== proof.expectedValue)
        || (detail.learnerValue && detail.learnerValue !== proof.learnerValue)) {
        fail('feedback-unproven-orthography', 'L’élision ou la séparation signalée ne correspond pas à la saisie.')
      }
    }
    const message = localizedLearnerErrorMessage(detail, locale)
    if (!plain(renderedText).includes(plain(message)) && detail.code !== 'person.other_form') {
      fail('feedback-message-missing', `Le commentaire ${detail.code} manque dans le rendu ${locale}.`)
    }
    if (detail.subjectIssueKind && !plain(renderedText).includes(plain(message))) {
      fail('feedback-subject-subtype-lost', 'Le rendu a remplacé une erreur de pronom par une confusion de personne.')
    }
    if (detail.missingLetter) {
      const expected = detail.expectedValue || ''
      const learner = detail.learnerValue || ''
      const reconstructed = Array.from(expected).some((letter, index) => letter === detail.missingLetter
        && expected.slice(0, index) + expected.slice(index + 1) === learner)
      if (!reconstructed || !learnerWords.includes(learner) || !candidates.some(words => words.includes(expected))) {
        fail('feedback-unproven-missing-letter', 'La lettre signalée ne reconstitue pas la forme attendue.')
      }
    }
    if (detail.code === 'morphology.ending' && detail.learnerValue && detail.expectedValue) {
      const expectedEnding = detail.expectedValue.replace(/^-/, '')
      const learnerEnding = detail.learnerValue.replace(/^-/, '')
      const proven = candidates.some(words => words.some((expected, index) => {
        const learner = learnerWords[index] || ''
        return expected.endsWith(expectedEnding) && learner.endsWith(learnerEnding)
          && expected.slice(0, -expectedEnding.length) === learner.slice(0, -learnerEnding.length)
      }))
      if (!proven) fail('feedback-unproven-ending', 'La différence ne porte pas uniquement sur les terminaisons indiquées.')
    }
    if (detail.code.startsWith('agreement.') && question.pastParticiple) {
      const family = new Set(['masculin', 'feminin'].flatMap(gender => ['singulier', 'pluriel']
        .map(number => agreePastParticiple(question.pastParticiple!, gender, number))))
      if (!learnerWords.some(word => family.has(word))) {
        fail('feedback-unproven-agreement', 'La forme saisie n’est pas une flexion du participe passé de ce verbe.')
      }
    }
    if (!input.revealsAnswers && !detail.subjectIssueKind && (detail.expectedValue || detail.missingLetter)) {
      fail('feedback-profile-answer-leak', 'Ce profil ne doit pas dévoiler la forme attendue.')
    }
  }
  return { status: issues.length ? 'failed' : 'passed', issues }
}

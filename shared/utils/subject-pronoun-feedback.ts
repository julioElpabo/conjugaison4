import { normalizeAnswer } from './answer'
import type { AppLocale } from '../i18n/locales'

const subjects = new Set(['je', 'j', 'tu', 'il', 'elle', 'iel', 'on', 'nous', 'vous', 'ils', 'elles', 'iels'])

export interface SubjectPronounIssue {
  kind: 'typo' | 'mismatch'
  learner: string
  expected: string
}

function splitSubject(value: string) {
  const normalized = normalizeAnswer(value, { ignoreWhitespace: false }).replace(/^(?:que\s+|qu')/u, '')
  const match = normalized.match(/^([\p{L}]+)(?:\s+|')(.+)$/u)
  return match ? { subject: match[1]!, rest: match[2]! } : null
}

function oneEditApart(left: string, right: string) {
  if (Math.abs(left.length - right.length) > 1) return false
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    if (left[index] === right[index]) continue
    return left.slice(index + Number(left.length >= right.length)) === right.slice(index + Number(right.length >= left.length))
  }
  return false
}

/** Une aide sur le sujet seulement si toute la partie verbale est déjà correcte. */
export function subjectPronounIssue(answer: string, question: { reponses: readonly string[], pronom?: string, mode?: string }): SubjectPronounIssue | null {
  if (question.mode?.toLocaleLowerCase('fr') === 'impératif' || !subjects.has(question.pronom || '')) return null
  const learner = splitSubject(answer)
  if (!learner) return null
  for (const candidate of question.reponses) {
    const expected = splitSubject(candidate)
    if (!expected || !subjects.has(expected.subject) || expected.subject === learner.subject
        || normalizeAnswer(learner.rest) !== normalizeAnswer(expected.rest)) continue
    if (subjects.has(learner.subject)) return { kind: 'mismatch', learner: learner.subject, expected: question.pronom! }
    if (oneEditApart(learner.subject, expected.subject)) return { kind: 'typo', learner: learner.subject, expected: question.pronom! }
  }
  return null
}

export function subjectPronounFeedback(issue: SubjectPronounIssue, locale: AppLocale = 'fr') {
  const values: Record<string, string> = {
    fr: issue.kind === 'typo'
      ? `La conjugaison du verbe est correcte. Vérifie le pronom : écris « ${issue.expected} » plutôt que « ${issue.learner} ».`
      : `La forme verbale correspond à « ${issue.expected} », mais tu as écrit le pronom « ${issue.learner} ».`,
    en: `The verb form is correct for “${issue.expected}”. Check the subject pronoun: you wrote “${issue.learner}”.`,
    de: `Die Verbform passt zu „${issue.expected}“. Prüfe das Subjektpronomen: Du hast „${issue.learner}“ geschrieben.`,
    it: `La forma verbale è corretta per « ${issue.expected} ». Controlla il pronome soggetto: hai scritto « ${issue.learner} ».`,
    es: `La forma verbal es correcta para « ${issue.expected} ». Revisa el pronombre sujeto: has escrito « ${issue.learner} ».`,
    nl: `De werkwoordsvorm past bij “${issue.expected}”. Controleer het onderwerp: je schreef “${issue.learner}”.`,
  }
  return values[locale === 'nl-NL' ? 'nl' : locale] || values.fr!
}

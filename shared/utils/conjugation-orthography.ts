import { normalizeConjugationSpacing } from './answer'

/** Ne propose une élision que si elle figure dans une réponse admise et que le reste est exact. */
export function findConjugationElisionIssue(answer: string, question: { reponses: readonly string[] }) {
  const learner = normalizeConjugationSpacing(answer)
  if (question.reponses.some(candidate => normalizeConjugationSpacing(candidate) === learner)) return null
  const expansions: Record<string, string[]> = {
    j: ['je', 'j'], m: ['me', 'm'], t: ['te', 't'], s: ['se', 's'],
    l: ['le', 'la', 'l'], n: ['ne', 'n'], c: ['ce', 'c'], d: ['de', 'd'], qu: ['que', 'qu'],
  }
  for (const candidate of question.reponses) {
    const expected = normalizeConjugationSpacing(candidate)
    for (const match of expected.matchAll(/\b(qu|[jmtslncd])'(\p{L}+)/gu)) {
      const short = match[1]!
      const word = match[2]!
      for (const expanded of expansions[short] || []) {
        const replacement = `${expanded} ${word}`
        if (expected.slice(0, match.index) + replacement + expected.slice(match.index + match[0].length) === learner) {
          return { learnerValue: replacement, expectedValue: match[0] }
        }
      }
    }
  }
  return null
}

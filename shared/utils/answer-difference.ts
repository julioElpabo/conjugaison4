export type AnswerDifferencePartKind = 'same' | 'changed' | 'extra'

export interface AnswerDifferencePart {
  text: string
  kind: AnswerDifferencePartKind
}

export interface AnswerComparison {
  learnerAnswer: string
  expectedAnswer: string
  learnerParts: AnswerDifferencePart[]
  expectedParts: AnswerDifferencePart[]
  mode: 'focused' | 'full'
  similarity: number
}

interface DifferenceOperation {
  kind: 'same' | 'replace' | 'insert' | 'delete'
  learner?: string
  expected?: string
}

const APOSTROPHES = /[\u0060\u00b4\u02b9\u02bb\u02bc\u02bd\u02be\u02bf\u055a\u2018\u2019\u201b\u2032\u2035\uff07]/gu
const FOCUSED_DIFFERENCE_THRESHOLD = 0.45

function comparisonKey(value: string) {
  if (/\s/u.test(value)) return ' '
  return value
    .normalize('NFC')
    .replace(APOSTROPHES, "'")
    .toLocaleLowerCase('fr-CH')
}

function appendPart(parts: AnswerDifferencePart[], text: string | undefined, kind: AnswerDifferencePartKind) {
  if (!text) return
  const previous = parts.at(-1)
  if (previous?.kind === kind) previous.text += text
  else parts.push({ text, kind })
}

function alignAnswers(learnerAnswer: string, expectedAnswer: string) {
  const learner = Array.from(learnerAnswer.normalize('NFC'))
  const expected = Array.from(expectedAnswer.normalize('NFC'))
  const rows = learner.length + 1
  const columns = expected.length + 1
  const distances = Array.from({ length: rows }, () => Array<number>(columns).fill(0))

  for (let row = 0; row < rows; row += 1) distances[row]![0] = row
  for (let column = 0; column < columns; column += 1) distances[0]![column] = column

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const same = comparisonKey(learner[row - 1]!) === comparisonKey(expected[column - 1]!)
      distances[row]![column] = Math.min(
        distances[row - 1]![column]! + 1,
        distances[row]![column - 1]! + 1,
        distances[row - 1]![column - 1]! + (same ? 0 : 1),
      )
    }
  }

  const operations: DifferenceOperation[] = []
  let row = learner.length
  let column = expected.length
  while (row > 0 || column > 0) {
    const learnerCharacter = learner[row - 1]
    const expectedCharacter = expected[column - 1]
    const same = row > 0 && column > 0
      && comparisonKey(learnerCharacter!) === comparisonKey(expectedCharacter!)

    if (same && distances[row]![column] === distances[row - 1]![column - 1]) {
      operations.push({ kind: 'same', learner: learnerCharacter, expected: expectedCharacter })
      row -= 1
      column -= 1
    } else if (row > 0 && column > 0 && distances[row]![column] === distances[row - 1]![column - 1]! + 1) {
      operations.push({ kind: 'replace', learner: learnerCharacter, expected: expectedCharacter })
      row -= 1
      column -= 1
    } else if (column > 0 && distances[row]![column] === distances[row]![column - 1]! + 1) {
      operations.push({ kind: 'insert', expected: expectedCharacter })
      column -= 1
    } else {
      operations.push({ kind: 'delete', learner: learnerCharacter })
      row -= 1
    }
  }

  operations.reverse()
  const maximumLength = Math.max(learner.length, expected.length, 1)
  return {
    operations,
    similarity: 1 - distances[learner.length]![expected.length]! / maximumLength,
  }
}

function comparisonFor(learnerAnswer: string, expectedAnswer: string): AnswerComparison {
  const { operations, similarity } = alignAnswers(learnerAnswer, expectedAnswer)
  const mode = similarity >= FOCUSED_DIFFERENCE_THRESHOLD ? 'focused' : 'full'
  const learnerParts: AnswerDifferencePart[] = []
  const expectedParts: AnswerDifferencePart[] = []

  if (mode === 'full') {
    learnerParts.push({ text: learnerAnswer, kind: 'same' })
    expectedParts.push({ text: expectedAnswer, kind: 'same' })
  } else {
    for (const operation of operations) {
      if (operation.kind === 'same') {
        appendPart(learnerParts, operation.learner, 'same')
        appendPart(expectedParts, operation.expected, 'same')
      } else if (operation.kind === 'replace') {
        appendPart(learnerParts, operation.learner, 'changed')
        appendPart(expectedParts, operation.expected, 'changed')
      } else if (operation.kind === 'delete') {
        appendPart(learnerParts, operation.learner, 'extra')
      } else {
        appendPart(expectedParts, operation.expected, 'changed')
      }
    }
  }

  return { learnerAnswer, expectedAnswer, learnerParts, expectedParts, mode, similarity }
}

function searchKey(value: string) {
  return value
    .normalize('NFC')
    .replace(APOSTROPHES, "'")
    .toLocaleLowerCase('fr-CH')
}

function expandCorrection(
  comparison: AnswerComparison,
  displayExpectedAnswers: readonly string[],
): AnswerComparison {
  if (displayExpectedAnswers.length === 0) return comparison

  const comparedKey = searchKey(comparison.expectedAnswer)
  for (const displayAnswer of displayExpectedAnswers) {
    const normalizedDisplay = displayAnswer.trim().normalize('NFC')
    const matchIndex = searchKey(normalizedDisplay).indexOf(comparedKey)
    if (matchIndex < 0) continue

    const expandedParts: AnswerDifferencePart[] = []
    appendPart(expandedParts, normalizedDisplay.slice(0, matchIndex), 'same')
    for (const part of comparison.expectedParts) appendPart(expandedParts, part.text, part.kind)
    appendPart(
      expandedParts,
      normalizedDisplay.slice(matchIndex + comparison.expectedAnswer.normalize('NFC').length),
      'same',
    )
    return {
      ...comparison,
      expectedAnswer: normalizedDisplay,
      expectedParts: expandedParts,
    }
  }

  // Si les deux représentations ne peuvent pas être reliées sûrement, la
  // phrase officielle reste prioritaire, sans surlignage potentiellement faux.
  const fallback = displayExpectedAnswers[0]!.trim()
  return {
    ...comparison,
    expectedAnswer: fallback,
    expectedParts: [{ text: fallback, kind: 'same' }],
    mode: 'full',
  }
}

/**
 * Choisit la correction officielle la plus proche puis prépare un affichage
 * lisible. Les réponses sans rapport restent entières pour éviter un diff
 * caractère par caractère qui n'apporterait rien à l'apprenant.
 */
export function buildAnswerComparison(
  learnerAnswer: unknown,
  expectedAnswers: readonly unknown[],
  displayExpectedAnswers: readonly unknown[] = [],
): AnswerComparison | null {
  const learner = typeof learnerAnswer === 'string' ? learnerAnswer.trim() : ''
  const expected = Array.isArray(expectedAnswers)
    ? expectedAnswers.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : []
  const displayExpected = Array.isArray(displayExpectedAnswers)
    ? displayExpectedAnswers.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : []
  if (!learner || expected.length === 0) return null

  const comparison = expected
    .map(value => comparisonFor(learner, value.trim()))
    .sort((left, right) => right.similarity - left.similarity)[0]!
  return expandCorrection(comparison, displayExpected)
}

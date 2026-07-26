export type ProgressDirection = 'up' | 'down' | 'stable' | 'insufficient'

export interface ChallengeProgressRun {
  id: number
  occurredAt: string | Date
  correctCount: number
  incorrectCount: number
  groupKey?: string
}

export interface ChallengeProgressPoint {
  id: number
  occurredAt: string
  correctCount: number
  incorrectCount: number
  totalCount: number
  successPercent: number
  runIds: number[]
}

export interface ProgressTrend {
  direction: ProgressDirection
  delta: number
}

export interface ChallengeProgressSummary {
  points: ChallengeProgressPoint[]
  successTrend: ProgressTrend
  errorTrend: ProgressTrend
}

export interface ChallengeCompletionRun {
  correctCount: number
  incorrectCount: number
  answeredQuestionCount: number
  expectedQuestionCount: number
}

export interface ChallengeAchievement {
  questionCount: number
  completedWithoutError: boolean
}

function rounded(value: number, precision = 1) {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

function average(values: readonly number[]) {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0
}

function trend(values: readonly number[], stableThreshold: number): ProgressTrend {
  if (values.length < 2) return { direction: 'insufficient', delta: 0 }
  const split = values.length >= 4 ? Math.floor(values.length / 2) : 1
  const earlier = average(values.slice(0, split))
  const recent = average(values.slice(values.length >= 4 ? split : -1))
  const delta = rounded(recent - earlier)
  if (Math.abs(delta) < stableThreshold) return { direction: 'stable', delta }
  return { direction: delta > 0 ? 'up' : 'down', delta }
}

export function challengeAchievement(
  runs: readonly ChallengeCompletionRun[],
): ChallengeAchievement {
  const questionCount = Math.max(0, ...runs.map(run => Number(run.expectedQuestionCount) || 0))
  return {
    questionCount,
    completedWithoutError: runs.some((run) => {
      const expected = Math.max(0, Number(run.expectedQuestionCount) || 0)
      return expected > 0
        && Number(run.incorrectCount) === 0
        && Number(run.correctCount) >= expected
        && Number(run.answeredQuestionCount) >= expected
    }),
  }
}

export function buildChallengeProgress(
  runs: readonly ChallengeProgressRun[],
): ChallengeProgressSummary {
  const candidates = runs
    .map((run) => {
      const occurredAt = new Date(run.occurredAt)
      const correctCount = Math.max(0, Number(run.correctCount) || 0)
      const incorrectCount = Math.max(0, Number(run.incorrectCount) || 0)
      const totalCount = correctCount + incorrectCount
      if (!Number.isInteger(run.id) || Number.isNaN(occurredAt.getTime()) || !totalCount) return null
      return {
        id: run.id,
        occurredAt: occurredAt.toISOString(),
        correctCount,
        incorrectCount,
        groupKey: run.groupKey?.trim() || '',
        runIds: [run.id],
      }
    })
    .filter((point): point is NonNullable<typeof point> => Boolean(point))
    .sort((left, right) => new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime())

  const grouped = new Map<string, typeof candidates[number]>()
  const ungrouped: typeof candidates = []
  for (const candidate of candidates) {
    if (!candidate.groupKey) {
      ungrouped.push(candidate)
      continue
    }
    const previous = grouped.get(candidate.groupKey)
    if (!previous) {
      grouped.set(candidate.groupKey, candidate)
      continue
    }
    grouped.set(candidate.groupKey, {
      ...candidate,
      correctCount: previous.correctCount + candidate.correctCount,
      incorrectCount: previous.incorrectCount + candidate.incorrectCount,
      runIds: [...previous.runIds, ...candidate.runIds],
    })
  }
  const points: ChallengeProgressPoint[] = [...ungrouped, ...grouped.values()]
    .map(({ groupKey: _groupKey, ...point }) => {
      const totalCount = point.correctCount + point.incorrectCount
      return {
        ...point,
        totalCount,
        successPercent: Math.round(point.correctCount / totalCount * 100),
      }
    })
    .sort((left, right) => new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime())

  return {
    points,
    successTrend: trend(points.map(point => point.successPercent), 2),
    errorTrend: trend(points.map(point => point.incorrectCount), .5),
  }
}

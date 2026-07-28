import {
  LEARNER_ERROR_TAXONOMY,
  type LearnerErrorConfidence,
  type LearnerErrorTypeCode,
} from './learner-error-diagnostics'

export type LearnerErrorTrend = 'improving' | 'worsening' | 'stable' | 'insufficient'

export interface LearnerErrorStatSource {
  code: LearnerErrorTypeCode
  opportunities: number
  errors: number
  primaryErrors?: number
  recentOpportunities: number
  recentErrors: number
  previousOpportunities: number
  previousErrors: number
}

export interface LearnerErrorExample {
  learnerAnswer: string
  expectedAnswers: string[]
  infinitive: string
  mode: string
  tense: string
  person: string
  answeredAt: string
  confidence: LearnerErrorConfidence
}

export interface LearnerErrorInsight {
  code: LearnerErrorTypeCode
  domain: string
  label: string
  advice: string
  opportunities: number
  errors: number
  errorRate: number
  recentErrorRate: number | null
  previousErrorRate: number | null
  trend: LearnerErrorTrend
  trendDelta: number | null
  examples: LearnerErrorExample[]
}

export interface LearnerErrorInsightsSummary {
  insights: LearnerErrorInsight[]
  totalErrors: number
  dominant: {
    code: LearnerErrorTypeCode
    label: string
    percent: number
    errors: number
  } | null
}

function count(value: unknown) {
  return Math.max(0, Number(value) || 0)
}

function rate(errors: number, opportunities: number) {
  return opportunities ? Math.round(errors / opportunities * 100) : 0
}

export function buildLearnerErrorInsights(
  sources: readonly LearnerErrorStatSource[],
  examples: ReadonlyMap<LearnerErrorTypeCode, LearnerErrorExample[]> = new Map(),
): LearnerErrorInsightsSummary {
  const taxonomy = new Map(LEARNER_ERROR_TAXONOMY.map(item => [item.code, item]))
  const insights = sources.flatMap((source) => {
    if (source.code === 'unknown' || source.code === 'orthography.copied_complement') return []
    const definition = taxonomy.get(source.code)
    const opportunities = count(source.opportunities)
    const errors = count(source.errors)
    if (!definition || !opportunities || !errors) return []
    const recentOpportunities = count(source.recentOpportunities)
    const recentErrors = count(source.recentErrors)
    const previousOpportunities = count(source.previousOpportunities)
    const previousErrors = count(source.previousErrors)
    const recentErrorRate = recentOpportunities ? rate(recentErrors, recentOpportunities) : null
    const previousErrorRate = previousOpportunities ? rate(previousErrors, previousOpportunities) : null
    const hasTrendEvidence = recentOpportunities >= 3 && previousOpportunities >= 3
    const trendDelta = hasTrendEvidence
      ? Number(recentErrorRate) - Number(previousErrorRate)
      : null
    const trend: LearnerErrorTrend = trendDelta === null
      ? 'insufficient'
      : Math.abs(trendDelta) < 5
        ? 'stable'
        : trendDelta < 0 ? 'improving' : 'worsening'
    return [{
      ...definition,
      opportunities,
      errors,
      errorRate: rate(errors, opportunities),
      recentErrorRate,
      previousErrorRate,
      trend,
      trendDelta,
      examples: (examples.get(source.code) || []).slice(0, 3),
    }]
  }).sort((left, right) => right.errors - left.errors || right.errorRate - left.errorRate)

  const primaryCounts = new Map<LearnerErrorTypeCode, number>(
    sources.flatMap(source => source.code === 'unknown' || source.code === 'orthography.copied_complement'
      ? []
      : [[source.code, count(source.primaryErrors ?? source.errors)] as const]),
  )
  const totalErrors = [...primaryCounts.values()].reduce((total, value) => total + value, 0)
  const first = [...insights].sort((left, right) =>
    (primaryCounts.get(right.code) || 0) - (primaryCounts.get(left.code) || 0),
  )[0]
  const firstPrimaryErrors = first ? primaryCounts.get(first.code) || 0 : 0
  const dominant = first && totalErrors >= 5 && firstPrimaryErrors >= 3
    ? {
        code: first.code,
        label: first.label,
        percent: Math.round(firstPrimaryErrors / totalErrors * 100),
        errors: firstPrimaryErrors,
      }
    : null
  return { insights, totalErrors, dominant }
}

import {
  LEARNER_ERROR_TAXONOMY,
  type LearnerErrorTypeCode,
} from './learner-error-diagnostics'

export type LearnerErrorProgressTrend = 'improving' | 'worsening' | 'stable' | 'insufficient'

export interface LearnerErrorProgressDailySource {
  code: LearnerErrorTypeCode
  statDate: string
  opportunities: number
  errors: number
  sequence?: number
}

export interface LearnerErrorProgressPoint {
  date: string
  windowStartDate: string
  opportunities: number
  errors: number
  errorRate: number
  sequence?: number
}

export interface LearnerErrorProgressExample {
  id: number
  question: string
  learnerAnswer: string
  expectedAnswers: string[]
  reason: string
}

export interface LearnerErrorProgressCard {
  code: LearnerErrorTypeCode
  domain: string
  label: string
  advice: string
  totalOpportunities: number
  totalErrors: number
  currentRate: number
  previousRate: number | null
  trend: LearnerErrorProgressTrend
  trendDelta: number | null
  lastTestedAt: string
  daysSinceLastTest: number
  isStale: boolean
  points: LearnerErrorProgressPoint[]
  examples: LearnerErrorProgressExample[]
}

export interface LearnerErrorProgressSummary {
  cards: LearnerErrorProgressCard[]
  opportunityWindow: number
  minimumEvidence: number
  staleAfterDays: number
}

interface OpportunityWindow {
  nextIndex: number
  startDate: string
  endDate: string
  opportunities: number
  errors: number
}

const OPPORTUNITY_WINDOW = 10
const MINIMUM_EVIDENCE = 5
const STALE_AFTER_DAYS = 45
const MAX_POINTS = 24

function count(value: unknown) {
  return Math.max(0, Number(value) || 0)
}

function errorRate(errors: number, opportunities: number) {
  return opportunities ? Math.round(errors / opportunities * 100) : 0
}

function normalizedDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/u.test(value) ? value : ''
}

function daysBetween(left: string, right: string) {
  const leftTime = Date.parse(`${left}T00:00:00Z`)
  const rightTime = Date.parse(`${right}T00:00:00Z`)
  if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime)) return 0
  return Math.max(0, Math.floor((rightTime - leftTime) / 86_400_000))
}

function collectOpportunityWindow(
  rows: readonly LearnerErrorProgressDailySource[],
  endIndex: number,
): OpportunityWindow {
  let opportunities = 0
  let errors = 0
  let index = endIndex
  let startDate = rows[endIndex]?.statDate || ''
  const endDate = rows[endIndex]?.statDate || ''
  while (index >= 0 && opportunities < OPPORTUNITY_WINDOW) {
    const row = rows[index]!
    opportunities += count(row.opportunities)
    errors += Math.min(count(row.errors), count(row.opportunities))
    startDate = row.statDate
    index -= 1
  }
  return { nextIndex: index, startDate, endDate, opportunities, errors }
}

function progressPoints(rows: readonly LearnerErrorProgressDailySource[]) {
  return rows.flatMap((row, index) => {
    const window = collectOpportunityWindow(rows, index)
    if (window.opportunities < MINIMUM_EVIDENCE) return []
    return [{
      date: row.statDate,
      windowStartDate: window.startDate,
      opportunities: window.opportunities,
      errors: window.errors,
      errorRate: errorRate(window.errors, window.opportunities),
      ...(row.sequence === undefined ? {} : { sequence: row.sequence }),
    }]
  }).slice(-MAX_POINTS)
}

export function buildLearnerErrorProgress(
  sources: readonly LearnerErrorProgressDailySource[],
  today = new Date().toISOString().slice(0, 10),
  examples: ReadonlyMap<LearnerErrorTypeCode, LearnerErrorProgressExample[]> = new Map(),
): LearnerErrorProgressSummary {
  const taxonomy = new Map(LEARNER_ERROR_TAXONOMY.map(item => [item.code, item]))
  const grouped = new Map<LearnerErrorTypeCode, LearnerErrorProgressDailySource[]>()
  for (const source of sources) {
    if (source.code === 'unknown') continue
    if (!taxonomy.has(source.code)) continue
    const statDate = normalizedDate(source.statDate)
    const opportunities = count(source.opportunities)
    if (!statDate || !opportunities) continue
    const rows = grouped.get(source.code) || []
    rows.push({
      code: source.code,
      statDate,
      opportunities,
      errors: Math.min(count(source.errors), opportunities),
      ...(source.sequence === undefined ? {} : { sequence: count(source.sequence) }),
    })
    grouped.set(source.code, rows)
  }

  const cards = [...grouped.entries()].flatMap(([code, unsortedRows]) => {
    const definition = taxonomy.get(code)
    const rows = [...unsortedRows].sort((left, right) =>
      left.statDate.localeCompare(right.statDate)
      || count(left.sequence) - count(right.sequence),
    )
    const totalOpportunities = rows.reduce((total, row) => total + row.opportunities, 0)
    const totalErrors = rows.reduce((total, row) => total + row.errors, 0)
    if (!definition || !totalErrors) return []

    const recent = collectOpportunityWindow(rows, rows.length - 1)
    const previous = recent.nextIndex >= 0
      ? collectOpportunityWindow(rows, recent.nextIndex)
      : null
    const hasCurrentEvidence = recent.opportunities >= MINIMUM_EVIDENCE
    const hasComparisonEvidence = hasCurrentEvidence
      && Boolean(previous && previous.opportunities >= MINIMUM_EVIDENCE)
    const currentRate = errorRate(recent.errors, recent.opportunities)
    const previousRate = hasComparisonEvidence && previous
      ? errorRate(previous.errors, previous.opportunities)
      : null
    const trendDelta = previousRate === null ? null : currentRate - previousRate
    const trend: LearnerErrorProgressTrend = trendDelta === null
      ? 'insufficient'
      : Math.abs(trendDelta) < 5
        ? 'stable'
        : trendDelta < 0 ? 'improving' : 'worsening'
    const lastTestedAt = rows.at(-1)!.statDate
    const daysSinceLastTest = daysBetween(lastTestedAt, normalizedDate(today) || lastTestedAt)

    return [{
      ...definition,
      totalOpportunities,
      totalErrors,
      currentRate,
      previousRate,
      trend,
      trendDelta,
      lastTestedAt,
      daysSinceLastTest,
      isStale: daysSinceLastTest > STALE_AFTER_DAYS,
      points: progressPoints(rows),
      examples: (examples.get(code) || []).slice(0, 5),
    }]
  }).sort((left, right) =>
    Number(left.isStale) - Number(right.isStale)
    || right.currentRate - left.currentRate
    || right.totalErrors - left.totalErrors,
  )

  return {
    cards,
    opportunityWindow: OPPORTUNITY_WINDOW,
    minimumEvidence: MINIMUM_EVIDENCE,
    staleAfterDays: STALE_AFTER_DAYS,
  }
}

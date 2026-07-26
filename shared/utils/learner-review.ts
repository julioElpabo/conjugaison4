export type LearnerReviewDimension = 'tense' | 'mode' | 'verb'

export interface LearnerReviewAttempt {
  formKey: string
  infinitive: string
  mode: string
  tense: string
  person: string
  learnerAnswer: string
  expectedAnswers: readonly string[]
  answeredAt: string | Date
}

export interface LearnerReviewForm {
  formKey: string
  infinitive: string
  mode: string
  tense: string
  person: string
  errorCount: number
  learnerAnswers: string[]
  expectedAnswers: string[]
  lastErrorAt: string
}

export interface LearnerReviewInsight {
  dimension: LearnerReviewDimension
  label: string
  errorCount: number
  totalErrors: number
  percent: number
}

export interface LearnerReviewSummary {
  forms: LearnerReviewForm[]
  totalErrors: number
  insight: LearnerReviewInsight | null
}

function text(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function uniquePush(values: string[], candidates: readonly string[], maximum: number) {
  for (const candidate of candidates) {
    const value = text(candidate, '')
    if (value && !values.includes(value)) values.push(value)
    if (values.length >= maximum) break
  }
}

function dominantInsight(
  forms: readonly LearnerReviewForm[],
  totalErrors: number,
  dimension: LearnerReviewDimension,
): LearnerReviewInsight | null {
  const counts = new Map<string, { label: string, count: number }>()
  for (const form of forms) {
    const label = dimension === 'tense'
      ? form.tense
      : dimension === 'mode' ? form.mode : form.infinitive
    const key = label.toLocaleLowerCase('fr-CH')
    const current = counts.get(key)
    if (current) current.count += form.errorCount
    else counts.set(key, { label, count: form.errorCount })
  }
  const dominant = [...counts.values()].sort((left, right) => right.count - left.count)[0]
  if (!dominant || totalErrors < 5 || dominant.count < 3) return null
  const percent = Math.round(dominant.count / totalErrors * 100)
  if (percent < 60) return null
  return {
    dimension,
    label: dominant.label,
    errorCount: dominant.count,
    totalErrors,
    percent,
  }
}

export function buildLearnerReview(
  attempts: readonly LearnerReviewAttempt[],
): LearnerReviewSummary {
  const formsByKey = new Map<string, LearnerReviewForm>()
  for (const attempt of attempts) {
    const formKey = text(attempt.formKey, '')
    if (!formKey) continue
    const answeredAt = new Date(attempt.answeredAt)
    if (Number.isNaN(answeredAt.getTime())) continue
    const existing = formsByKey.get(formKey)
    if (existing) {
      existing.errorCount += 1
      uniquePush(existing.learnerAnswers, [attempt.learnerAnswer], 4)
      uniquePush(existing.expectedAnswers, attempt.expectedAnswers, 8)
      if (answeredAt.getTime() > new Date(existing.lastErrorAt).getTime()) {
        existing.lastErrorAt = answeredAt.toISOString()
      }
      continue
    }
    const learnerAnswers: string[] = []
    const expectedAnswers: string[] = []
    uniquePush(learnerAnswers, [attempt.learnerAnswer], 4)
    uniquePush(expectedAnswers, attempt.expectedAnswers, 8)
    formsByKey.set(formKey, {
      formKey,
      infinitive: text(attempt.infinitive, 'Verbe'),
      mode: text(attempt.mode, 'Mode non renseigné'),
      tense: text(attempt.tense, 'Temps non renseigné'),
      person: text(attempt.person, ''),
      errorCount: 1,
      learnerAnswers,
      expectedAnswers,
      lastErrorAt: answeredAt.toISOString(),
    })
  }

  const forms = [...formsByKey.values()]
    .sort((left, right) => new Date(right.lastErrorAt).getTime() - new Date(left.lastErrorAt).getTime())
  const totalErrors = forms.reduce((total, form) => total + form.errorCount, 0)
  const insight = (['tense', 'mode', 'verb'] as const)
    .map(dimension => dominantInsight(forms, totalErrors, dimension))
    .find((candidate): candidate is LearnerReviewInsight => Boolean(candidate)) || null

  return { forms, totalErrors, insight }
}

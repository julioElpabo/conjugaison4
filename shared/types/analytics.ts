export const ANALYTICS_EVENTS = [
  'page_view',
  'homepage',
  'challenge_preset_selected',
  'challenge_load',
  'challenge_save',
  'exercise_started',
  'exercise_completed',
  'answer_submitted',
  'answer_correct',
  'answer_retry',
  'help_opened',
  'coach_selected',
  'print_opened',
  'pdf_downloaded',
  'word_downloaded',
  'client_error',
] as const

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[number]
export type AnalyticsWindow = 'now' | '5m' | '30m' | 'range'

export interface AnalyticsBreakdownItem {
  label: string
  value: number
  code?: string
}

export interface AnalyticsResponse {
  window: AnalyticsWindow
  startDate: string
  endDate: string
  local: AnalyticsOverview
  ga4: AnalyticsOverview | null
}

export interface AnalyticsSeriesPoint {
  date: string
  value: number
}

export interface AnalyticsOverview {
  source: 'local' | 'ga4'
  configured: boolean
  activeUsers: number
  sessions: number
  newUsers: number
  returningUsers: number
  events: number
  exerciseStarted: number
  exerciseCompleted: number
  completionRate: number
  correctAnswers: number
  submittedAnswers: number
  successRate: number
  helpOpened: number
  pdfDownloads: number
  wordDownloads: number
  challengeLoads: number
  challengeSaves: number
  devices: AnalyticsBreakdownItem[]
  languages: AnalyticsBreakdownItem[]
  countries: AnalyticsBreakdownItem[]
  regions: Array<AnalyticsBreakdownItem & { country?: string }>
  cities: Array<AnalyticsBreakdownItem & { cityId?: string, country?: string, countryCode?: string, region?: string }>
  featureUsage: AnalyticsBreakdownItem[]
  eventBreakdown: AnalyticsBreakdownItem[]
  activity: AnalyticsSeriesPoint[]
  series: Record<string, AnalyticsSeriesPoint[]>
  generatedAt: string
  notice?: string
}

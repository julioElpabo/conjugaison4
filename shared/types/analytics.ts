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
  'help_scrolled',
  'coach_selected',
  'print_opened',
  'pdf_downloaded',
  'word_downloaded',
  'feature_exposed',
  'feature_selected',
  'feature_completed',
  'feature_failed',
  'exercise_abandoned',
  'account_registered',
  'account_login',
  'language_tested',
  'language_used',
  'tour_started',
  'tour_step',
  'tour_completed',
  'tour_abandoned',
  'chat_conjugation_opened',
  'browser_printed',
  'client_error',
] as const

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[number]
export type AnalyticsWindow = 'now' | '3m' | '5m' | '30m' | 'range'
export type AnalyticsActorType = 'anonymous' | 'learner'
export type AnalyticsActorFilter = 'all' | AnalyticsActorType
export type AnalyticsUserActivityWindow = 'week' | 'month' | 'year'

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

export interface AnalyticsGeoTimelinePoint {
  minute: string
  cityId?: string
  city: string
  region?: string
  countryCode: string
  country: string
  sessions: number
}

export interface AnalyticsGeoTimelineResponse {
  date: string
  configured: boolean
  points: AnalyticsGeoTimelinePoint[]
  sessions: number
  firstMinute?: string
  lastMinute?: string
  timeZone?: string
  generatedAt: string
  notice?: string
}

export type AnalyticsUsageDiagnostic =
  | 'keep'
  | 'improve'
  | 'promote'
  | 'niche'
  | 'remove-candidate'
  | 'insufficient'

export interface AnalyticsUsageRow {
  key: string
  label: string
  category: 'preset' | 'feature'
  exposures: number
  selections: number
  starts: number
  completions: number
  failures: number
  uniqueSessions: number
  repeatSessions: number
  adoptionRate: number | null
  completionRate: number | null
  repeatRate: number | null
  lastUsedAt: string | null
  diagnostic: AnalyticsUsageDiagnostic
  diagnosticReason: string
}

export interface AnalyticsUsageResponse {
  startDate: string
  endDate: string
  actor: AnalyticsActorFilter
  summary: {
    exposedSessions: number
    activeFeatureSessions: number
    trackedFeatures: number
    removeCandidates: number
    insufficient: number
  }
  presets: AnalyticsUsageRow[]
  features: AnalyticsUsageRow[]
  generatedAt: string
  notice?: string
}

export interface AnalyticsUsersResponse {
  startDate: string
  endDate: string
  activityWindow: AnalyticsUserActivityWindow
  activityDays: number
  totalAccounts: number
  activeAccounts: number
  loggedInAccounts: number
  successfulLogins: number
  failedLogins: number
  errorReviewUsers: number
  languages: AnalyticsBreakdownItem[]
  connectedFeatures: AnalyticsBreakdownItem[]
  anonymousExerciseSessions: number
  anonymousExerciseLanguages: AnalyticsBreakdownItem[]
  registrations: AnalyticsSeriesPoint[]
  registrationUnit: 'Jours' | 'Semaines' | 'Mois'
  generatedAt: string
  notice?: string
}

export interface AnalyticsProductItem {
  key: string
  label: string
  events: number
  uniqueSessions: number
}

export interface AnalyticsFunnelStage {
  key: string
  label: string
  value: number
}

export interface AnalyticsProductResponse {
  startDate: string
  endDate: string
  actor: AnalyticsActorFilter
  dimensions: Record<string, AnalyticsProductItem[]>
  funnels: Record<string, AnalyticsFunnelStage[]>
  generatedAt: string
  notice?: string
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
  helpScrolled: number
  pdfDownloads: number
  wordDownloads: number
  challengeLoads: number
  challengeSaves: number
  devices: AnalyticsBreakdownItem[]
  languages: AnalyticsBreakdownItem[]
  countries: AnalyticsBreakdownItem[]
  regions: Array<AnalyticsBreakdownItem & { country?: string }>
  cities: Array<AnalyticsBreakdownItem & { cityId?: string, country?: string, countryCode?: string, region?: string }>
  acquisition: AnalyticsBreakdownItem[]
  landingPages: AnalyticsBreakdownItem[]
  browsers: AnalyticsBreakdownItem[]
  operatingSystems: AnalyticsBreakdownItem[]
  featureUsage: AnalyticsBreakdownItem[]
  eventBreakdown: AnalyticsBreakdownItem[]
  activity: AnalyticsSeriesPoint[]
  series: Record<string, AnalyticsSeriesPoint[]>
  generatedAt: string
  notice?: string
}

export const COACH_EVENTS = [
  'introduction',
  'question',
  'correct',
  'correct-alternative',
  'incorrect',
  'cod-before',
  'cod-after',
  'coi',
  'encouragement',
  'help-announcement',
  'streak',
  'finish',
  'restart',
] as const

export type CoachEvent = typeof COACH_EVENTS[number]

export const REQUIRED_COACH_REPLY_EVENTS = [
  'introduction',
  'correct',
  'correct-alternative',
  'incorrect',
  'help-announcement',
  'finish',
  'restart',
] as const satisfies readonly CoachEvent[]
export type CoachStatus = 'draft' | 'published' | 'disabled'
export type CoachGender = 'female' | 'male'
export type CoachMediaType = 'emoji' | 'animation' | 'video' | 'image'

export const COACH_EXPLANATION_APPROACHES = [
  'cif-falc',
  'concise',
  'grammatical-technical',
  'guided-discovery',
] as const

export type CoachExplanationApproach = typeof COACH_EXPLANATION_APPROACHES[number]

export const COACH_HELP_ENGINE_KEYS = [
  'complete-avec-reponses',
  'complete',
  'tres-condensee',
  'allophone',
] as const

export type CoachHelpEngineKey = typeof COACH_HELP_ENGINE_KEYS[number]

export interface CoachHelpApproachDefinition {
  id: number
  name: string
  engineKey: CoachHelpEngineKey
  status: CoachStatus
  sortOrder: number
  characterCount: number
}

export const COACH_HELP_BLOCK_TYPES = [
  'normal',
  'info',
  'success',
  'warning',
  'danger',
] as const

export type CoachHelpBlockType = typeof COACH_HELP_BLOCK_TYPES[number]
export type CoachHelpStatus = 'draft' | 'published'

export interface CoachHelpBlock {
  id: number
  type: CoachHelpBlockType
  title: string
  content: string
  explanationApproach: CoachExplanationApproach
  /** Profil moteur des blocs automatiques. Absent sur les anciens blocs administrés. */
  profileId?: CoachHelpEngineKey
  isActive: boolean
  sortOrder: number
  children: CoachHelpBlock[]
}

export interface CoachHelpTemplate {
  id: number
  name: string
  description: string
  headerTitle: string
  headerDescription: string
  status: CoachHelpStatus
  blocks: CoachHelpBlock[]
}

export interface CoachReplyTemplate {
  id: number
  eventType: CoachEvent
  content: string
  weight: number
  isActive: boolean
}

export interface CoachMedia {
  id: number
  name: string
  filePath: string
  mediaType: CoachMediaType
  category: 'success' | 'encouragement' | 'finish' | 'welcome' | 'neutral'
  altText: string
  rightsStatus: 'pending' | 'verified' | 'rejected'
  safetyStatus: 'pending' | 'approved' | 'rejected'
  isActive: boolean
  fileSize: number | null
}

export interface CoachMediaAssignment {
  mediaId: number
  eventType: CoachEvent
  weight: number
  isActive: boolean
}

export interface CoachReactionRule {
  eventType: CoachEvent
  mediaProbability: number
  animationProbability: number
  emojiProbability: number
  cooldownQuestions: number
}

export interface CoachCaractere {
  id: number
  slug: string
  masculineName: string
  emoticon: string
  pedagogicalStyle: string
  helpApproachId: number
  helpApproachName: string
  helpApproach: CoachHelpEngineKey
  status: CoachStatus
  sortOrder: number
  replies: CoachReplyTemplate[]
  media: CoachMedia[]
  assignments: CoachMediaAssignment[]
  rules: CoachReactionRule[]
}

export interface CoachProfile {
  id: number
  slug: string
  firstName: string
  lastName: string
  gender: CoachGender
  avatarPath: string
  description: string
  likes: string
  caractereId: number
  caractereSortOrder?: number
  caractereName: string
  personality: string
  pedagogicalStyle: string
  helpApproachId?: number
  helpApproachName?: string
  helpApproach: CoachHelpEngineKey
  helpApproachSortOrder?: number
  themeColor: string
  status: CoachStatus
  sortOrder: number
  replies: CoachReplyTemplate[]
  media: CoachMedia[]
  assignments: CoachMediaAssignment[]
  rules: CoachReactionRule[]
}

export interface CoachMessageContext {
  instruction?: string
  verb?: string
  complement?: string
  participle?: string
  gender?: string
  number?: string
  mode?: string
  tense?: string
  expectedAnswer?: string
  score?: string | number
  correctCount?: string | number
  questionCount?: string | number
  questionNumber?: string | number
}

export interface CoachReaction {
  text: string
  media?: CoachMedia
  replyId?: number
}

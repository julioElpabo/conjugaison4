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
  'finish',
  'restart',
] as const satisfies readonly CoachEvent[]
export type CoachStatus = 'draft' | 'published' | 'disabled'
export type CoachGender = 'female' | 'male'
export type CoachMediaType = 'emoji' | 'animation' | 'video' | 'image'

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
  cooldownQuestions: number
}

export interface CoachCharacter {
  id: number
  slug: string
  masculineName: string
  feminineName: string
  emoticon: string
  description: string
  pedagogicalStyle: string
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
  characterId: number
  characterName: string
  personality: string
  pedagogicalStyle: string
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

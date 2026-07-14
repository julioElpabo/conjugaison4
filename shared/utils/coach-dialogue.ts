import type {
  CoachEvent,
  CoachMedia,
  CoachMessageContext,
  CoachProfile,
  CoachReaction,
} from '../types/coach'

const PLACEHOLDER = /\{([a-zA-Z]+)\}/gu

export const COACH_PLACEHOLDERS = [
  'instruction', 'verb', 'complement', 'participle', 'gender', 'number', 'mode', 'tense',
  'expectedAnswer', 'score', 'correctCount', 'questionCount',
] as const

export function renderCoachTemplate(template: string, context: CoachMessageContext): string {
  return template.replace(PLACEHOLDER, (match, key: keyof CoachMessageContext) => {
    const value = context[key]
    return value === undefined || value === null || value === '' ? match : String(value)
  })
}

export function unknownCoachPlaceholders(template: string): string[] {
  const allowed = new Set<string>(COACH_PLACEHOLDERS)
  return [...template.matchAll(PLACEHOLDER)]
    .map(match => match[1] || '')
    .filter((key, index, values) => !allowed.has(key) && values.indexOf(key) === index)
}

function weightedChoice<T extends { weight: number }>(items: T[], random: () => number): T | undefined {
  const total = items.reduce((sum, item) => sum + Math.max(1, item.weight), 0)
  if (!total) return undefined
  let cursor = random() * total
  for (const item of items) {
    cursor -= Math.max(1, item.weight)
    if (cursor < 0) return item
  }
  return items.at(-1)
}

export function createCoachReaction(
  coach: CoachProfile,
  eventType: CoachEvent,
  context: CoachMessageContext = {},
  options: { random?: () => number, allowMotion?: boolean, mediaAllowed?: boolean, animatedOnly?: boolean, excludeMediaIds?: readonly number[], allowedReplyIds?: readonly number[] } = {}
): CoachReaction {
  const random = options.random ?? Math.random
  const allowedReplyIds = options.allowedReplyIds ? new Set(options.allowedReplyIds) : null
  const replies = coach.replies.filter(reply => reply.isActive && reply.eventType === eventType && (!allowedReplyIds || allowedReplyIds.has(reply.id)))
  const fallback = coach.replies.filter(reply => reply.isActive && reply.eventType === 'encouragement')
  const reply = weightedChoice(replies.length ? replies : fallback, random)
  const result: CoachReaction = {
    text: renderCoachTemplate(reply?.content || 'On continue ensemble.', context),
    ...(reply ? { replyId: reply.id } : {}),
  }

  const rule = coach.rules.find(item => item.eventType === eventType)
  if (!options.mediaAllowed || !rule || random() > rule.mediaProbability) return result

  const mediaEvent = eventType === 'correct-alternative' || eventType === 'streak' ? 'correct' : eventType
  const exactAssignments = coach.assignments.filter(item => item.isActive && item.eventType === eventType)
  const assignments = exactAssignments.length
    ? exactAssignments
    : coach.assignments.filter(item => item.isActive && item.eventType === mediaEvent)
  const candidates = assignments.flatMap((assignment) => {
    const media = coach.media.find(item => item.id === assignment.mediaId)
    if (!media || !media.isActive || media.safetyStatus !== 'approved' || media.rightsStatus !== 'verified') return []
    if (options.animatedOnly && media.mediaType !== 'animation' && media.mediaType !== 'video') return []
    if (options.allowMotion === false && (media.mediaType === 'animation' || media.mediaType === 'video')) return []
    return [{ media, weight: assignment.weight }]
  })
  const excluded = new Set(options.excludeMediaIds || [])
  const freshCandidates = candidates.filter(item => !excluded.has(item.media.id))
  const selected = weightedChoice(freshCandidates.length ? freshCandidates : candidates, random)
  if (selected) result.media = selected.media
  return result
}

export interface CoachDialogueState {
  usageByEvent: Map<CoachEvent, Map<number, number>>
  lastReplyByEvent: Map<CoachEvent, number>
  lastMediaId?: number
}

export function createCoachDialogueState(): CoachDialogueState {
  return { usageByEvent: new Map(), lastReplyByEvent: new Map() }
}

export function createVariedCoachReaction(
  coach: CoachProfile,
  eventType: CoachEvent,
  context: CoachMessageContext = {},
  state: CoachDialogueState,
  options: { random?: () => number, allowMotion?: boolean, mediaAllowed?: boolean, animatedOnly?: boolean } = {},
): CoachReaction {
  const eventReplies = coach.replies.filter(reply => reply.isActive && reply.eventType === eventType)
  const usage = state.usageByEvent.get(eventType) || new Map<number, number>()
  state.usageByEvent.set(eventType, usage)
  const minimumUsage = eventReplies.length ? Math.min(...eventReplies.map(reply => usage.get(reply.id) || 0)) : 0
  let preferred = eventReplies.filter(reply => (usage.get(reply.id) || 0) === minimumUsage)
  const lastReplyId = state.lastReplyByEvent.get(eventType)
  if (preferred.length > 1 && lastReplyId) preferred = preferred.filter(reply => reply.id !== lastReplyId)

  const reaction = createCoachReaction(coach, eventType, context, {
    ...options,
    allowedReplyIds: preferred.map(reply => reply.id),
    excludeMediaIds: state.lastMediaId ? [state.lastMediaId] : [],
  })
  if (reaction.replyId) {
    usage.set(reaction.replyId, (usage.get(reaction.replyId) || 0) + 1)
    state.lastReplyByEvent.set(eventType, reaction.replyId)
  }
  if (reaction.media) state.lastMediaId = reaction.media.id
  return reaction
}

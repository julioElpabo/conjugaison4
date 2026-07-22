import type { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise'
import { COACH_EVENTS, REQUIRED_COACH_REPLY_EVENTS, type CoachCaractere, type CoachEvent, type CoachMedia, type CoachProfile } from '../../shared/types/coach'
import { unknownCoachPlaceholders } from '../../shared/utils/coach-dialogue'
import { normalizeLocale, type AppLocale } from '../../shared/i18n/locales'

type Executor = Pool | PoolConnection
interface CoachRow extends RowDataPacket {
  id: number, slug: string, firstName: string, lastName: string, avatarPath: string,
  gender: CoachProfile['gender'],
  description: string, likes: string, caractereId: number, caractereSortOrder: number, caractereName: string, personality: string, pedagogicalStyle: string, themeColor: string,
  status: CoachProfile['status'], sortOrder: number, helpApproachId: number, helpApproachName: string,
  helpApproach: CoachProfile['helpApproach'], helpApproachSortOrder: number
}
interface CaractereRow extends RowDataPacket {
  id: number, slug: string, masculineName: string, emoticon: string,
  pedagogicalStyle: string, helpApproachId: number, helpApproachName: string,
  helpApproach: CoachCaractere['helpApproach'], status: CoachCaractere['status'], sortOrder: number
}
interface ReplyRow extends RowDataPacket { id: number, caractereId: number, eventType: CoachEvent, content: string, weight: number, isActive: number }
interface MediaRow extends RowDataPacket {
  id: number, name: string, filePath: string, mediaType: CoachMedia['mediaType'], category: CoachMedia['category'],
  altText: string, rightsStatus: CoachMedia['rightsStatus'], safetyStatus: CoachMedia['safetyStatus'], isActive: number, fileSize: number | null
}
interface AssignmentRow extends RowDataPacket { caractereId: number, mediaId: number, eventType: CoachEvent, weight: number, isActive: number }
interface RuleRow extends RowDataPacket {
  caractereId: number
  eventType: CoachEvent
  mediaProbability: string | number
  animationProbability: string | number | null
  emojiProbability: string | number | null
  cooldownQuestions: number
}

const EVENT_SET = new Set<string>(COACH_EVENTS)

export async function listCoachMedia(database: Executor, locale: AppLocale = 'fr'): Promise<CoachMedia[]> {
  const requestedLocale = normalizeLocale(locale, 'fr')
  const [rows] = await database.execute<MediaRow[]>(`SELECT cm.id,
    CASE WHEN ?='fr' THEN cm.name ELSE COALESCE(requested.name, french.name, cm.name) END AS name,
    cm.file_path AS filePath, cm.media_type AS mediaType, cm.category,
    CASE WHEN ?='fr' THEN cm.alt_text ELSE COALESCE(requested.alt_text, french.alt_text, cm.alt_text) END AS altText,
    cm.rights_status AS rightsStatus, cm.safety_status AS safetyStatus,
    cm.is_active AS isActive, cm.file_size AS fileSize
    FROM coach_media cm
    LEFT JOIN coach_media_translations requested ON requested.media_id=cm.id AND requested.locale=?
    LEFT JOIN coach_media_translations french ON french.media_id=cm.id AND french.locale='fr'
    ORDER BY cm.category, name, cm.id`, [requestedLocale, requestedLocale, requestedLocale])
  return rows.map(row => ({ ...row, isActive: Boolean(row.isActive) }))
}

export async function listCoaches(
  database: Executor,
  publishedOnly = false,
  locale: AppLocale = 'fr',
): Promise<CoachProfile[]> {
  const requestedLocale = normalizeLocale(locale, 'fr')
  const [coaches] = await database.execute<CoachRow[]>(`SELECT c.id, c.slug, c.first_name AS firstName, c.last_name AS lastName,
    c.gender, c.avatar_path AS avatarPath, c.description, COALESCE(c.likes, '') AS likes, c.character_id AS caractereId,
    cc.sort_order AS caractereSortOrder,
    CASE WHEN ?='fr' THEN cc.masculine_name
      ELSE COALESCE(requested.masculine_name, french.masculine_name, cc.masculine_name) END AS caractereName,
    CASE WHEN ?='fr' THEN cc.masculine_name
      ELSE COALESCE(requested.masculine_name, french.masculine_name, cc.masculine_name) END AS personality,
    CASE WHEN ?='fr' THEN cc.pedagogical_style
      ELSE COALESCE(requested.pedagogical_style, french.pedagogical_style, cc.pedagogical_style) END AS pedagogicalStyle,
    approach.id AS helpApproachId, approach.name AS helpApproachName, approach.engine_key AS helpApproach,
    approach.sort_order AS helpApproachSortOrder, c.theme_color AS themeColor,
    c.status, c.sort_order AS sortOrder FROM coaches c JOIN coach_characters cc ON cc.id=c.character_id
    JOIN coach_help_approaches approach ON approach.id=cc.help_approach_id
    LEFT JOIN coach_character_translations requested ON requested.character_id=cc.id AND requested.locale=?
    LEFT JOIN coach_character_translations french ON french.character_id=cc.id AND french.locale='fr'
    ${publishedOnly ? "WHERE c.status = 'published' AND cc.status = 'published' AND approach.status = 'published'" : ''}
    ORDER BY approach.sort_order, approach.id, cc.sort_order, cc.id, c.sort_order, first_name, c.id`, [
      requestedLocale, requestedLocale, requestedLocale, requestedLocale,
    ])
  if (!coaches.length) return []
  const ids = [...new Set(coaches.map(item => item.caractereId))]
  const placeholders = ids.map(() => '?').join(',')
  const [[replies], [assignments], [rules], media] = await Promise.all([
    database.execute<ReplyRow[]>(`SELECT reply.id, reply.character_id AS caractereId, reply.event_type AS eventType,
      CASE WHEN ?='fr' THEN reply.content
        ELSE COALESCE(requested.content, french.content, reply.content) END AS content,
      reply.weight, reply.is_active AS isActive
      FROM coach_character_reply_templates reply
      LEFT JOIN coach_reply_translations requested ON requested.reply_id=reply.id AND requested.locale=?
      LEFT JOIN coach_reply_translations french ON french.reply_id=reply.id AND french.locale='fr'
      WHERE reply.character_id IN (${placeholders}) ORDER BY reply.sort_order, reply.id`, [requestedLocale, requestedLocale, ...ids]),
    database.execute<AssignmentRow[]>(`SELECT character_id AS caractereId, media_id AS mediaId, event_type AS eventType,
      weight, is_active AS isActive FROM coach_character_media_assignments WHERE character_id IN (${placeholders})`, ids),
    database.execute<RuleRow[]>(`SELECT character_id AS caractereId, event_type AS eventType,
      media_probability AS mediaProbability, animation_probability AS animationProbability,
      emoji_probability AS emojiProbability, cooldown_questions AS cooldownQuestions
      FROM coach_character_reaction_rules WHERE character_id IN (${placeholders})`, ids),
    listCoachMedia(database, requestedLocale),
  ])
  return coaches.map(coach => ({
    ...coach,
    replies: replies.filter(item => item.caractereId === coach.caractereId).map(item => ({
      id: item.id, eventType: item.eventType, content: item.content, weight: item.weight, isActive: Boolean(item.isActive),
    })),
    media: publishedOnly
      ? media.filter(item => assignments.some(assignment => assignment.caractereId === coach.caractereId && assignment.mediaId === item.id))
      : media,
    assignments: assignments.filter(item => item.caractereId === coach.caractereId).map(item => ({
      mediaId: item.mediaId, eventType: item.eventType, weight: item.weight, isActive: Boolean(item.isActive),
    })),
    rules: rules.filter(item => item.caractereId === coach.caractereId).map(item => ({
      eventType: item.eventType,
      mediaProbability: Number(item.mediaProbability),
      animationProbability: item.animationProbability === null ? Number(item.mediaProbability) : Number(item.animationProbability),
      emojiProbability: item.emojiProbability === null ? Number(item.mediaProbability) : Number(item.emojiProbability),
      cooldownQuestions: item.cooldownQuestions,
    })),
  }))
}

export async function listCoachCaracteres(database: Executor): Promise<CoachCaractere[]> {
  const [caracteres] = await database.execute<CaractereRow[]>(`SELECT cc.id,cc.slug,cc.masculine_name AS masculineName,
    cc.emoticon,cc.pedagogical_style AS pedagogicalStyle,approach.id AS helpApproachId,
    approach.name AS helpApproachName,approach.engine_key AS helpApproach,cc.status,cc.sort_order AS sortOrder
    FROM coach_characters cc JOIN coach_help_approaches approach ON approach.id=cc.help_approach_id
    ORDER BY cc.sort_order,masculine_name,cc.id`)
  if (!caracteres.length) return []
  const ids = caracteres.map(item => item.id)
  const placeholders = ids.map(() => '?').join(',')
  const [[replies], [assignments], [rules], media] = await Promise.all([
    database.execute<ReplyRow[]>(`SELECT id, character_id AS caractereId, event_type AS eventType, content, weight,
      is_active AS isActive FROM coach_character_reply_templates WHERE character_id IN (${placeholders}) ORDER BY sort_order, id`, ids),
    database.execute<AssignmentRow[]>(`SELECT character_id AS caractereId, media_id AS mediaId, event_type AS eventType,
      weight, is_active AS isActive FROM coach_character_media_assignments WHERE character_id IN (${placeholders})`, ids),
    database.execute<RuleRow[]>(`SELECT character_id AS caractereId, event_type AS eventType,
      media_probability AS mediaProbability, animation_probability AS animationProbability,
      emoji_probability AS emojiProbability, cooldown_questions AS cooldownQuestions
      FROM coach_character_reaction_rules WHERE character_id IN (${placeholders})`, ids),
    listCoachMedia(database),
  ])
  return caracteres.map(caractere => ({
    ...caractere,
    replies: replies.filter(item => item.caractereId === caractere.id).map(item => ({ id: item.id, eventType: item.eventType, content: item.content, weight: item.weight, isActive: Boolean(item.isActive) })),
    media,
    assignments: assignments.filter(item => item.caractereId === caractere.id).map(item => ({ mediaId: item.mediaId, eventType: item.eventType, weight: item.weight, isActive: Boolean(item.isActive) })),
    rules: rules.filter(item => item.caractereId === caractere.id).map(item => ({
      eventType: item.eventType,
      mediaProbability: Number(item.mediaProbability),
      animationProbability: item.animationProbability === null ? Number(item.mediaProbability) : Number(item.animationProbability),
      emojiProbability: item.emojiProbability === null ? Number(item.mediaProbability) : Number(item.emojiProbability),
      cooldownQuestions: item.cooldownQuestions,
    })),
  }))
}

function string(value: unknown, maximum: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

export function parseCoachPayload(value: unknown) {
  const body = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const slug = string(body.slug, 80).toLocaleLowerCase('fr').replace(/[^a-z0-9-]+/gu, '-').replace(/^-|-$/gu, '')
  const profile = {
    slug,
    firstName: string(body.firstName, 80), lastName: string(body.lastName, 80),
    gender: string(body.gender, 8),
    caractereId: Number(body.caractereId ?? body.characterId),
    avatarPath: string(body.avatarPath, 255), description: string(body.description, 255), likes: string(body.likes, 255),
    themeColor: string(body.themeColor, 7), status: string(body.status, 12),
    sortOrder: Number(body.sortOrder),
  }
  if (!profile.slug || !profile.firstName || !profile.lastName || !/^#[0-9a-f]{6}$/iu.test(profile.themeColor)
    || !['female', 'male'].includes(profile.gender)
    || !Number.isInteger(profile.caractereId) || profile.caractereId < 1
    || !['draft', 'published', 'disabled'].includes(profile.status) || !Number.isInteger(profile.sortOrder)) {
    throw createError({ statusCode: 400, statusMessage: 'Profil du coach invalide' })
  }
  if (profile.status === 'published' && !profile.avatarPath) throw createError({ statusCode: 400, statusMessage: 'Coach incomplet : avatar manquant' })
  return { profile }
}

function parseCaractereChildren(body: Record<string, unknown>) {
  const replies = Array.isArray(body.replies) ? body.replies.map((raw) => {
    const reply = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
    const eventType = string(reply.eventType, 40)
    const content = string(reply.content, 2000)
    const unknown = unknownCoachPlaceholders(content)
    if (!EVENT_SET.has(eventType) || !content || unknown.length) {
      throw createError({ statusCode: 400, statusMessage: unknown.length ? `Variable inconnue : {${unknown[0]}}` : 'Réplique invalide' })
    }
    return { eventType, content, weight: Math.max(1, Math.min(20, Number(reply.weight) || 1)), isActive: reply.isActive !== false }
  }) : []
  const assignments = Array.isArray(body.assignments) ? body.assignments.map((raw) => {
    const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
    const eventType = string(item.eventType, 40)
    const mediaId = Number(item.mediaId)
    if (!EVENT_SET.has(eventType) || !Number.isInteger(mediaId) || mediaId < 1) throw createError({ statusCode: 400, statusMessage: 'Attribution de média invalide' })
    return { eventType, mediaId, weight: Math.max(1, Math.min(20, Number(item.weight) || 1)), isActive: item.isActive !== false }
  }) : []
  const rules = Array.isArray(body.rules) ? body.rules.map((raw) => {
    const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
    const eventType = string(item.eventType, 40)
    if (!EVENT_SET.has(eventType)) throw createError({ statusCode: 400, statusMessage: 'Règle de réaction invalide' })
    const mediaProbability = Math.max(0, Math.min(1, Number(item.mediaProbability) || 0))
    return {
      eventType,
      mediaProbability,
      animationProbability: Math.max(0, Math.min(1, Number(item.animationProbability ?? mediaProbability) || 0)),
      emojiProbability: Math.max(0, Math.min(1, Number(item.emojiProbability ?? mediaProbability) || 0)),
      cooldownQuestions: Math.max(0, Math.min(50, Number(item.cooldownQuestions) || 0)),
    }
  }) : []
  return { replies, assignments, rules }
}

export function parseCaracterePayload(value: unknown) {
  const body = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const profile = {
    slug: string(body.slug, 80).toLocaleLowerCase('fr').replace(/[^a-z0-9-]+/gu, '-').replace(/^-|-$/gu, ''),
    masculineName: string(body.masculineName, 80),
    emoticon: string(body.emoticon, 32),
    pedagogicalStyle: string(body.pedagogicalStyle, 2000), status: string(body.status, 12), sortOrder: Number(body.sortOrder),
    helpApproachId: Number(body.helpApproachId),
  }
  const children = parseCaractereChildren(body)
  if (!profile.slug || !profile.masculineName || !profile.emoticon || !profile.pedagogicalStyle
    || !['draft', 'published', 'disabled'].includes(profile.status) || !Number.isInteger(profile.sortOrder)
    || !Number.isInteger(profile.helpApproachId) || profile.helpApproachId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Caractère invalide' })
  }
  if (profile.status === 'published') {
    const missing = REQUIRED_COACH_REPLY_EVENTS.filter(event => !children.replies.some(reply => reply.eventType === event && reply.isActive))
    if (missing.length) throw createError({ statusCode: 400, statusMessage: `Caractère incomplet : ${missing.join(', ')}` })
  }
  return { profile, ...children }
}

export function parseMediaPayload(value: unknown) {
  const body = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const result = {
    name: string(body.name, 120), filePath: string(body.filePath, 255), mediaType: string(body.mediaType, 12),
    category: string(body.category, 20), altText: string(body.altText, 255), rightsStatus: string(body.rightsStatus, 12),
    safetyStatus: string(body.safetyStatus, 12), isActive: body.isActive !== false, fileSize: Number(body.fileSize) || null,
  }
  if (!result.name || !result.filePath.startsWith('/') || !result.altText
    || !['emoji', 'animation', 'video', 'image'].includes(result.mediaType)
    || !['success', 'encouragement', 'finish', 'welcome', 'neutral'].includes(result.category)
    || !['pending', 'verified', 'rejected'].includes(result.rightsStatus)
    || !['pending', 'approved', 'rejected'].includes(result.safetyStatus)) {
    throw createError({ statusCode: 400, statusMessage: 'Média invalide' })
  }
  return result
}

import { c as createError, z as normalizeLocale } from '../nitro/nitro.mjs';
import { R as REQUIRED_COACH_REPLY_EVENTS, C as COACH_EVENTS } from './coach.mjs';
import { u as unknownCoachPlaceholders } from './coach-dialogue.mjs';

const EVENT_SET = new Set(COACH_EVENTS);
async function listCoachMedia(database, locale = "fr") {
  const requestedLocale = normalizeLocale(locale, "fr");
  const [rows] = await database.execute(`SELECT cm.id,
    CASE WHEN ?='fr' THEN cm.name ELSE COALESCE(requested.name, french.name, cm.name) END AS name,
    cm.file_path AS filePath, cm.media_type AS mediaType, cm.category,
    CASE WHEN ?='fr' THEN cm.alt_text ELSE COALESCE(requested.alt_text, french.alt_text, cm.alt_text) END AS altText,
    cm.rights_status AS rightsStatus, cm.safety_status AS safetyStatus,
    cm.is_active AS isActive, cm.file_size AS fileSize
    FROM coach_media cm
    LEFT JOIN coach_media_translations requested ON requested.media_id=cm.id AND requested.locale=?
    LEFT JOIN coach_media_translations french ON french.media_id=cm.id AND french.locale='fr'
    ORDER BY cm.category, name, cm.id`, [requestedLocale, requestedLocale, requestedLocale]);
  return rows.map((row) => ({ ...row, isActive: Boolean(row.isActive) }));
}
async function listCoaches(database, publishedOnly = false, locale = "fr") {
  const requestedLocale = normalizeLocale(locale, "fr");
  const [coaches] = await database.execute(`SELECT c.id, c.slug, c.first_name AS firstName, c.last_name AS lastName,
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
    ${publishedOnly ? "WHERE c.status = 'published' AND cc.status = 'published' AND approach.status = 'published'" : ""}
    ORDER BY approach.sort_order, approach.id, cc.sort_order, cc.id, c.sort_order, first_name, c.id`, [
    requestedLocale,
    requestedLocale,
    requestedLocale,
    requestedLocale
  ]);
  if (!coaches.length) return [];
  const ids = [...new Set(coaches.map((item) => item.caractereId))];
  const placeholders = ids.map(() => "?").join(",");
  const [[replies], [assignments], [rules], media] = await Promise.all([
    database.execute(`SELECT reply.id, reply.character_id AS caractereId, reply.event_type AS eventType,
      CASE WHEN ?='fr' THEN reply.content
        ELSE COALESCE(requested.content, french.content, reply.content) END AS content,
      reply.weight, reply.is_active AS isActive
      FROM coach_character_reply_templates reply
      LEFT JOIN coach_reply_translations requested ON requested.reply_id=reply.id AND requested.locale=?
      LEFT JOIN coach_reply_translations french ON french.reply_id=reply.id AND french.locale='fr'
      WHERE reply.character_id IN (${placeholders}) ORDER BY reply.sort_order, reply.id`, [requestedLocale, requestedLocale, ...ids]),
    database.execute(`SELECT character_id AS caractereId, media_id AS mediaId, event_type AS eventType,
      weight, is_active AS isActive FROM coach_character_media_assignments WHERE character_id IN (${placeholders})`, ids),
    database.execute(`SELECT character_id AS caractereId, event_type AS eventType,
      media_probability AS mediaProbability, animation_probability AS animationProbability,
      emoji_probability AS emojiProbability, cooldown_questions AS cooldownQuestions
      FROM coach_character_reaction_rules WHERE character_id IN (${placeholders})`, ids),
    listCoachMedia(database, requestedLocale)
  ]);
  return coaches.map((coach) => ({
    ...coach,
    replies: replies.filter((item) => item.caractereId === coach.caractereId).map((item) => ({
      id: item.id,
      eventType: item.eventType,
      content: item.content,
      weight: item.weight,
      isActive: Boolean(item.isActive)
    })),
    media: publishedOnly ? media.filter((item) => assignments.some((assignment) => assignment.caractereId === coach.caractereId && assignment.mediaId === item.id)) : media,
    assignments: assignments.filter((item) => item.caractereId === coach.caractereId).map((item) => ({
      mediaId: item.mediaId,
      eventType: item.eventType,
      weight: item.weight,
      isActive: Boolean(item.isActive)
    })),
    rules: rules.filter((item) => item.caractereId === coach.caractereId).map((item) => ({
      eventType: item.eventType,
      mediaProbability: Number(item.mediaProbability),
      animationProbability: item.animationProbability === null ? Number(item.mediaProbability) : Number(item.animationProbability),
      emojiProbability: item.emojiProbability === null ? Number(item.mediaProbability) : Number(item.emojiProbability),
      cooldownQuestions: item.cooldownQuestions
    }))
  }));
}
async function listCoachCaracteres(database) {
  const [caracteres] = await database.execute(`SELECT cc.id,cc.slug,cc.masculine_name AS masculineName,
    cc.emoticon,cc.pedagogical_style AS pedagogicalStyle,approach.id AS helpApproachId,
    approach.name AS helpApproachName,approach.engine_key AS helpApproach,cc.status,cc.sort_order AS sortOrder
    FROM coach_characters cc JOIN coach_help_approaches approach ON approach.id=cc.help_approach_id
    ORDER BY cc.sort_order,masculine_name,cc.id`);
  if (!caracteres.length) return [];
  const ids = caracteres.map((item) => item.id);
  const placeholders = ids.map(() => "?").join(",");
  const [[replies], [assignments], [rules], media] = await Promise.all([
    database.execute(`SELECT id, character_id AS caractereId, event_type AS eventType, content, weight,
      is_active AS isActive FROM coach_character_reply_templates WHERE character_id IN (${placeholders}) ORDER BY sort_order, id`, ids),
    database.execute(`SELECT character_id AS caractereId, media_id AS mediaId, event_type AS eventType,
      weight, is_active AS isActive FROM coach_character_media_assignments WHERE character_id IN (${placeholders})`, ids),
    database.execute(`SELECT character_id AS caractereId, event_type AS eventType,
      media_probability AS mediaProbability, animation_probability AS animationProbability,
      emoji_probability AS emojiProbability, cooldown_questions AS cooldownQuestions
      FROM coach_character_reaction_rules WHERE character_id IN (${placeholders})`, ids),
    listCoachMedia(database)
  ]);
  return caracteres.map((caractere) => ({
    ...caractere,
    replies: replies.filter((item) => item.caractereId === caractere.id).map((item) => ({ id: item.id, eventType: item.eventType, content: item.content, weight: item.weight, isActive: Boolean(item.isActive) })),
    media,
    assignments: assignments.filter((item) => item.caractereId === caractere.id).map((item) => ({ mediaId: item.mediaId, eventType: item.eventType, weight: item.weight, isActive: Boolean(item.isActive) })),
    rules: rules.filter((item) => item.caractereId === caractere.id).map((item) => ({
      eventType: item.eventType,
      mediaProbability: Number(item.mediaProbability),
      animationProbability: item.animationProbability === null ? Number(item.mediaProbability) : Number(item.animationProbability),
      emojiProbability: item.emojiProbability === null ? Number(item.mediaProbability) : Number(item.emojiProbability),
      cooldownQuestions: item.cooldownQuestions
    }))
  }));
}
function string(value, maximum) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}
function parseCoachPayload(value) {
  var _a;
  const body = value && typeof value === "object" ? value : {};
  const slug = string(body.slug, 80).toLocaleLowerCase("fr").replace(/[^a-z0-9-]+/gu, "-").replace(/^-|-$/gu, "");
  const profile = {
    slug,
    firstName: string(body.firstName, 80),
    lastName: string(body.lastName, 80),
    gender: string(body.gender, 8),
    caractereId: Number((_a = body.caractereId) != null ? _a : body.characterId),
    avatarPath: string(body.avatarPath, 255),
    description: string(body.description, 255),
    likes: string(body.likes, 255),
    themeColor: string(body.themeColor, 7),
    status: string(body.status, 12),
    sortOrder: Number(body.sortOrder)
  };
  if (!profile.slug || !profile.firstName || !profile.lastName || !/^#[0-9a-f]{6}$/iu.test(profile.themeColor) || !["female", "male"].includes(profile.gender) || !Number.isInteger(profile.caractereId) || profile.caractereId < 1 || !["draft", "published", "disabled"].includes(profile.status) || !Number.isInteger(profile.sortOrder)) {
    throw createError({ statusCode: 400, statusMessage: "Profil du coach invalide" });
  }
  if (profile.status === "published" && !profile.avatarPath) throw createError({ statusCode: 400, statusMessage: "Coach incomplet : avatar manquant" });
  return { profile };
}
function parseCaractereChildren(body) {
  const replies = Array.isArray(body.replies) ? body.replies.map((raw) => {
    const reply = raw && typeof raw === "object" ? raw : {};
    const eventType = string(reply.eventType, 40);
    const content = string(reply.content, 2e3);
    const unknown = unknownCoachPlaceholders(content);
    if (!EVENT_SET.has(eventType) || !content || unknown.length) {
      throw createError({ statusCode: 400, statusMessage: unknown.length ? `Variable inconnue : {${unknown[0]}}` : "R\xE9plique invalide" });
    }
    return { eventType, content, weight: Math.max(1, Math.min(20, Number(reply.weight) || 1)), isActive: reply.isActive !== false };
  }) : [];
  const assignments = Array.isArray(body.assignments) ? body.assignments.map((raw) => {
    const item = raw && typeof raw === "object" ? raw : {};
    const eventType = string(item.eventType, 40);
    const mediaId = Number(item.mediaId);
    if (!EVENT_SET.has(eventType) || !Number.isInteger(mediaId) || mediaId < 1) throw createError({ statusCode: 400, statusMessage: "Attribution de m\xE9dia invalide" });
    return { eventType, mediaId, weight: Math.max(1, Math.min(20, Number(item.weight) || 1)), isActive: item.isActive !== false };
  }) : [];
  const rules = Array.isArray(body.rules) ? body.rules.map((raw) => {
    var _a, _b;
    const item = raw && typeof raw === "object" ? raw : {};
    const eventType = string(item.eventType, 40);
    if (!EVENT_SET.has(eventType)) throw createError({ statusCode: 400, statusMessage: "R\xE8gle de r\xE9action invalide" });
    const mediaProbability = Math.max(0, Math.min(1, Number(item.mediaProbability) || 0));
    return {
      eventType,
      mediaProbability,
      animationProbability: Math.max(0, Math.min(1, Number((_a = item.animationProbability) != null ? _a : mediaProbability) || 0)),
      emojiProbability: Math.max(0, Math.min(1, Number((_b = item.emojiProbability) != null ? _b : mediaProbability) || 0)),
      cooldownQuestions: Math.max(0, Math.min(50, Number(item.cooldownQuestions) || 0))
    };
  }) : [];
  return { replies, assignments, rules };
}
function parseCaracterePayload(value) {
  const body = value && typeof value === "object" ? value : {};
  const profile = {
    slug: string(body.slug, 80).toLocaleLowerCase("fr").replace(/[^a-z0-9-]+/gu, "-").replace(/^-|-$/gu, ""),
    masculineName: string(body.masculineName, 80),
    emoticon: string(body.emoticon, 32),
    pedagogicalStyle: string(body.pedagogicalStyle, 2e3),
    status: string(body.status, 12),
    sortOrder: Number(body.sortOrder),
    helpApproachId: Number(body.helpApproachId)
  };
  const children = parseCaractereChildren(body);
  if (!profile.slug || !profile.masculineName || !profile.emoticon || !profile.pedagogicalStyle || !["draft", "published", "disabled"].includes(profile.status) || !Number.isInteger(profile.sortOrder) || !Number.isInteger(profile.helpApproachId) || profile.helpApproachId < 1) {
    throw createError({ statusCode: 400, statusMessage: "Caract\xE8re invalide" });
  }
  if (profile.status === "published") {
    const missing = REQUIRED_COACH_REPLY_EVENTS.filter((event) => !children.replies.some((reply) => reply.eventType === event && reply.isActive));
    if (missing.length) throw createError({ statusCode: 400, statusMessage: `Caract\xE8re incomplet : ${missing.join(", ")}` });
  }
  return { profile, ...children };
}
function parseMediaPayload(value) {
  const body = value && typeof value === "object" ? value : {};
  const result = {
    name: string(body.name, 120),
    filePath: string(body.filePath, 255),
    mediaType: string(body.mediaType, 12),
    category: string(body.category, 20),
    altText: string(body.altText, 255),
    rightsStatus: string(body.rightsStatus, 12),
    safetyStatus: string(body.safetyStatus, 12),
    isActive: body.isActive !== false,
    fileSize: Number(body.fileSize) || null
  };
  if (!result.name || !result.filePath.startsWith("/") || !result.altText || !["emoji", "animation", "video", "image"].includes(result.mediaType) || !["success", "encouragement", "finish", "welcome", "neutral"].includes(result.category) || !["pending", "verified", "rejected"].includes(result.rightsStatus) || !["pending", "approved", "rejected"].includes(result.safetyStatus)) {
    throw createError({ statusCode: 400, statusMessage: "M\xE9dia invalide" });
  }
  return result;
}

export { listCoachMedia as a, parseCoachPayload as b, listCoaches as c, parseCaracterePayload as d, listCoachCaracteres as l, parseMediaPayload as p };
//# sourceMappingURL=coaches.mjs.map

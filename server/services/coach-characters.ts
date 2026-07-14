import type { PoolConnection } from 'mysql2/promise'
import type { parseCharacterPayload } from './coaches'

type Payload = ReturnType<typeof parseCharacterPayload>

export async function replaceCharacterChildren(connection: PoolConnection, id: number, replies: Payload['replies'], assignments: Payload['assignments'], rules: Payload['rules']) {
  await connection.execute('DELETE FROM coach_character_reply_templates WHERE character_id=?', [id])
  for (const [index, reply] of replies.entries()) await connection.execute(`INSERT INTO coach_character_reply_templates
    (character_id,event_type,content,weight,is_active,sort_order) VALUES (?,?,?,?,?,?)`, [id, reply.eventType, reply.content, reply.weight, reply.isActive ? 1 : 0, index])
  await connection.execute('DELETE FROM coach_character_media_assignments WHERE character_id=?', [id])
  for (const item of assignments) await connection.execute(`INSERT INTO coach_character_media_assignments
    (character_id,media_id,event_type,weight,is_active) VALUES (?,?,?,?,?)`, [id, item.mediaId, item.eventType, item.weight, item.isActive ? 1 : 0])
  await connection.execute('DELETE FROM coach_character_reaction_rules WHERE character_id=?', [id])
  for (const item of rules) await connection.execute(`INSERT INTO coach_character_reaction_rules
    (character_id,event_type,media_probability,cooldown_questions) VALUES (?,?,?,?)`, [id, item.eventType, item.mediaProbability, item.cooldownQuestions])
}

import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import type { parseCaracterePayload } from './coaches'

type Payload = ReturnType<typeof parseCaracterePayload>

export async function replaceCaractereChildren(connection: PoolConnection, id: number, replies: Payload['replies'], assignments: Payload['assignments'], rules: Payload['rules']) {
  await connection.execute('DELETE FROM coach_character_reply_templates WHERE character_id=?', [id])
  for (const [index, reply] of replies.entries()) await connection.execute(`INSERT INTO coach_character_reply_templates
    (character_id,event_type,content,weight,is_active,sort_order) VALUES (?,?,?,?,?,?)`, [id, reply.eventType, reply.content, reply.weight, reply.isActive ? 1 : 0, index])
  await connection.execute('DELETE FROM coach_character_media_assignments WHERE character_id=?', [id])
  for (const item of assignments) await connection.execute(`INSERT INTO coach_character_media_assignments
    (character_id,media_id,event_type,weight,is_active) VALUES (?,?,?,?,?)`, [id, item.mediaId, item.eventType, item.weight, item.isActive ? 1 : 0])
  await connection.execute('DELETE FROM coach_character_reaction_rules WHERE character_id=?', [id])
  for (const item of rules) await connection.execute(`INSERT INTO coach_character_reaction_rules
    (character_id,event_type,media_probability,animation_probability,emoji_probability,cooldown_questions) VALUES (?,?,?,?,?,?)`, [
      id,
      item.eventType,
      item.mediaProbability,
      item.animationProbability,
      item.emojiProbability,
      item.cooldownQuestions,
    ])
}

export async function deleteCaracterePermanently(connection: PoolConnection, id: number) {
  const [locked] = await connection.execute<RowDataPacket[]>('SELECT id FROM coach_characters WHERE id=? FOR UPDATE', [id])
  if (!locked.length) return false

  await connection.execute('UPDATE coaches SET character_id=NULL WHERE character_id=?', [id])
  const [result] = await connection.execute<ResultSetHeader>('DELETE FROM coach_characters WHERE id=?', [id])
  if (result.affectedRows !== 1) return false

  return true
}

import type { ResultSetHeader } from 'mysql2/promise'
import { parseMediaPayload } from '../../../services/coaches'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const item = parseMediaPayload(await readBody(event))
  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.execute<ResultSetHeader>(`INSERT INTO coach_media
      (name,file_path,media_type,category,alt_text,rights_status,safety_status,is_active,file_size)
      VALUES (?,?,?,?,?,?,?,?,?)`, [item.name, item.filePath, item.mediaType, item.category, item.altText,
      item.rightsStatus, item.safetyStatus, item.isActive ? 1 : 0, item.fileSize])
    if (item.isActive && (item.mediaType === 'emoji' || item.mediaType === 'animation')) {
      const eventType = item.category === 'success' ? 'correct' : item.category === 'encouragement' ? 'incorrect'
        : item.category === 'finish' ? 'finish' : item.category === 'welcome' ? 'introduction' : 'question'
      await connection.execute(`INSERT INTO coach_character_media_assignments (character_id,media_id,event_type,weight,is_active)
        SELECT id,?,?,1,1 FROM coach_characters WHERE status<>'disabled'`, [result.insertId, eventType])
    }
    await connection.commit()
    return { ok: true, id: result.insertId }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})

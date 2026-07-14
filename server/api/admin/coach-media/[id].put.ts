import { parseMediaPayload } from '../../../services/coaches'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Média invalide' })
  const item = parseMediaPayload(await readBody(event))
  await useDatabase().execute(`UPDATE coach_media SET name=?,file_path=?,media_type=?,category=?,alt_text=?,rights_status=?,
    safety_status=?,is_active=?,file_size=? WHERE id=?`, [item.name, item.filePath, item.mediaType, item.category,
    item.altText, item.rightsStatus, item.safetyStatus, item.isActive ? 1 : 0, item.fileSize, id])
  return { ok: true }
})

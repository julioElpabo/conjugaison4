import { unlink } from 'node:fs/promises'
import { resolve, sep } from 'node:path'
import type { RowDataPacket } from 'mysql2/promise'

interface MediaFileRow extends RowDataPacket {
  filePath: string
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Média invalide' })
  const database = useDatabase()
  const [rows] = await database.execute<MediaFileRow[]>('SELECT file_path AS filePath FROM coach_media WHERE id=?', [id])
  if (!rows.length) throw createError({ statusCode: 404, statusMessage: 'Média introuvable' })

  await database.execute('DELETE FROM coach_media WHERE id=?', [id])

  const filePath = rows[0]!.filePath
  let fileDeleted = false
  if (filePath.startsWith('/coach-media/')) {
    const mediaRoot = resolve(process.cwd(), 'public', 'coach-media')
    const target = resolve(process.cwd(), 'public', filePath.replace(/^\/+/u, ''))
    if (target === mediaRoot || target.startsWith(`${mediaRoot}${sep}`)) {
      try {
        await unlink(target)
        fileDeleted = true
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      }
    }
  }

  return { ok: true, fileDeleted }
})

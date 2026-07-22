import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { coachHelpApproachSlug, parseCoachHelpApproachPayload } from '../../../services/coach-help-approaches'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const profile = parseCoachHelpApproachPayload(await readBody(event))
  const database = useDatabase()
  const root = coachHelpApproachSlug(profile.name)
  let slug = root
  for (let index = 2; ; index += 1) {
    const [existing] = await database.execute<RowDataPacket[]>('SELECT id FROM coach_help_approaches WHERE slug=? LIMIT 1', [slug])
    if (!existing.length) break
    const suffix = `-${index}`
    slug = `${root.slice(0, 80 - suffix.length)}${suffix}`
  }
  const [result] = await database.execute<ResultSetHeader>(
    'INSERT INTO coach_help_approaches (slug,name,engine_key,status,sort_order) VALUES (?,?,?,?,?)',
    [slug, profile.name, profile.engineKey, profile.status, profile.sortOrder],
  )
  return { ok: true, id: result.insertId }
})

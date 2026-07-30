import {
  getContactSettings,
  saveContactSettings,
  validateContactSettings,
} from '../../services/contact-settings'
import { readLimitedJsonBody } from '../../utils/limited-json-body'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const body = await readLimitedJsonBody<Record<string, unknown>>(event, 8 * 1024)
  const settings = validateContactSettings(body)
  const database = useDatabase()
  await saveContactSettings(database, settings)
  return { ok: true, settings: await getContactSettings(database) }
})

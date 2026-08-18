import { sendAdminPushTest } from '../../../services/admin-push-notifications'
import { readLimitedJsonBody } from '../../../utils/limited-json-body'

export default defineEventHandler(async (event) => {
  const administrator = requireAdministrator(event)
  const body = await readLimitedJsonBody<{ endpoint?: unknown }>(event, 8 * 1024)
  const endpoint = typeof body?.endpoint === 'string' ? body.endpoint.trim() : ''
  if (!endpoint) throw createError({ statusCode: 400, statusMessage: 'Abonnement manquant' })
  await sendAdminPushTest(administrator.id, endpoint)
  return { ok: true }
})

import { sendAdminPushTest } from '../../../services/admin-push-notifications'
import { readLimitedJsonBody } from '../../../utils/limited-json-body'

export default defineEventHandler(async (event) => {
  const administrator = requireAdministrator(event)
  const body = await readLimitedJsonBody<{ endpoint?: unknown, testId?: unknown }>(event, 8 * 1024)
  const endpoint = typeof body?.endpoint === 'string' ? body.endpoint.trim() : ''
  const testId = typeof body?.testId === 'string' ? body.testId.trim() : ''
  if (!endpoint) throw createError({ statusCode: 400, statusMessage: 'Abonnement manquant' })
  if (!/^[a-zA-Z0-9-]{8,80}$/u.test(testId)) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de test invalide' })
  }
  const receipt = await sendAdminPushTest(administrator.id, endpoint, testId)
  return { ok: true, accepted: true, pushServiceStatus: receipt.statusCode }
})

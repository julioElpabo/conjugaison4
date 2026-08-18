import { initializeAdminPushBaseline, saveAdminPushSubscription } from '../../../services/admin-push-notifications'
import { readLimitedJsonBody } from '../../../utils/limited-json-body'

interface SubscriptionBody {
  endpoint?: unknown
  keys?: { p256dh?: unknown, auth?: unknown }
}

export default defineEventHandler(async (event) => {
  const administrator = requireAdministrator(event)
  const body = await readLimitedJsonBody<SubscriptionBody>(event, 16 * 1024)
  const endpoint = typeof body?.endpoint === 'string' ? body.endpoint.trim() : ''
  const p256dh = typeof body?.keys?.p256dh === 'string' ? body.keys.p256dh.trim() : ''
  const auth = typeof body?.keys?.auth === 'string' ? body.keys.auth.trim() : ''
  if (!endpoint.startsWith('https://') || endpoint.length > 4096 || !p256dh || !auth) {
    throw createError({ statusCode: 400, statusMessage: 'Abonnement Web Push invalide' })
  }
  await initializeAdminPushBaseline()
  await saveAdminPushSubscription(administrator.id, { endpoint, keys: { p256dh, auth } })
  return { ok: true }
})

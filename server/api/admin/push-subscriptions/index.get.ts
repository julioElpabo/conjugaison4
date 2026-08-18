import { getAdminPushPublicKey } from '../../../services/admin-push-notifications'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  return { publicKey: await getAdminPushPublicKey() }
})

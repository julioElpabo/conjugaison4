import { randomUUID } from 'node:crypto'
import { sendAdminPushTest } from '../../../services/admin-push-notifications'
import { readLimitedJsonBody } from '../../../utils/limited-json-body'

export default defineEventHandler(async (event) => {
  const administrator = requireAdministrator(event)
  const body = await readLimitedJsonBody<{ endpoint?: unknown, testId?: unknown }>(event, 8 * 1024)
  const endpoint = typeof body?.endpoint === 'string' ? body.endpoint.trim() : ''
  const suppliedTestId = typeof body?.testId === 'string' ? body.testId.trim() : ''
  if (!endpoint) throw createError({ statusCode: 400, statusMessage: 'Abonnement manquant' })
  if (suppliedTestId && !/^[a-zA-Z0-9-]{8,80}$/u.test(suppliedTestId)) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de test invalide' })
  }
  // Compatibilité avec un onglet qui exécute encore le bundle précédant le
  // déploiement de l'accusé de réception navigateur.
  const testId = suppliedTestId || randomUUID()
  const receipt = await sendAdminPushTest(administrator.id, endpoint, testId)
  return { ok: true, accepted: true, pushServiceStatus: receipt.statusCode, testId }
})

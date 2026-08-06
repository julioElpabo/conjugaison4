import { getAdminTestJob } from '../../../../services/admin-test-jobs'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const job = await getAdminTestJob(getRouterParam(event, 'id') || '')
  if (!job) throw createError({ statusCode: 404, statusMessage: 'Exécution de tests introuvable' })
  return job
})

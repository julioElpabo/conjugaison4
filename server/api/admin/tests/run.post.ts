import { startAdminTestJob } from '../../../services/admin-test-jobs'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const body = await readBody<{ files?: unknown }>(event)
  const files = Array.isArray(body?.files)
    ? body.files.filter((file): file is string => typeof file === 'string')
    : []
  const job = await startAdminTestJob(files)
  setResponseStatus(event, 202)
  return { jobId: job.id }
})

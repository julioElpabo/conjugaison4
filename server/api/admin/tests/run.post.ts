import { startAdminTestJob } from '../../../services/admin-test-jobs'
import { runAdminTests } from '../../../services/admin-tests'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const body = await readBody<{ files?: unknown }>(event)
  const files = Array.isArray(body?.files)
    ? body.files.filter((file): file is string => typeof file === 'string')
    : []
  const requestOrigin = getRequestURL(event).origin
  const configuredOrigin = String(useRuntimeConfig(event).public.siteUrl || '').replace(/\/$/u, '')
  const baseUrl = import.meta.dev ? requestOrigin : configuredOrigin
  const job = await startAdminTestJob(files, {
    run: selectedFiles => runAdminTests(selectedFiles, { baseUrl }),
  })
  setResponseStatus(event, 202)
  return { jobId: job.id }
})

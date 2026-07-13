import { runAdminTests } from '../../../services/admin-tests'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const body = await readBody<{ files?: unknown }>(event)
  const files = Array.isArray(body?.files)
    ? body.files.filter((file): file is string => typeof file === 'string')
    : []
  return runAdminTests(files)
})

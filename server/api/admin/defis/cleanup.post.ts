import { deleteInactiveDefis, parseCleanupRequest } from '../../../services/defis-cleanup'
import { readLimitedJsonBody } from '../../../utils/limited-json-body'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const body = await readLimitedJsonBody<unknown>(event, 1024)
  let request
  try {
    request = parseCleanupRequest(body)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Confirmation de suppression invalide' })
  }
  return deleteInactiveDefis(useDatabase(), request.cutoff)
})

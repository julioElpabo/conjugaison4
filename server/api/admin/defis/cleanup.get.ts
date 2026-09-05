import { previewDefisCleanup } from '../../../services/defis-cleanup'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return previewDefisCleanup(useDatabase())
})

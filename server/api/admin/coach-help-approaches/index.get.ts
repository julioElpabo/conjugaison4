import { listCoachHelpApproaches } from '../../../services/coach-help-approaches'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  return { approaches: await listCoachHelpApproaches(useDatabase()) }
})

import { listCoachHelps } from '../../../services/coach-helps'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  return { helps: await listCoachHelps(useDatabase()) }
})

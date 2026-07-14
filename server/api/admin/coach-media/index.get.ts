import { listCoachMedia } from '../../../services/coaches'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  return { media: await listCoachMedia(useDatabase()) }
})

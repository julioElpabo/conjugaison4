import { listCoaches } from '../../../services/coaches'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  return { coaches: await listCoaches(useDatabase()) }
})

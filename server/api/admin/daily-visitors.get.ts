import { dailyVisitorSnapshot } from '../../services/daily-visitors'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  return dailyVisitorSnapshot(useDatabase())
})

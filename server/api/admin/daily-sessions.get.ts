import { dailySessionSnapshot } from '../../services/daily-sessions'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  return dailySessionSnapshot(useDatabase())
})

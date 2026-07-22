import { listCoachCaracteres } from '../../../services/coaches'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  return { caracteres: await listCoachCaracteres(useDatabase()) }
})

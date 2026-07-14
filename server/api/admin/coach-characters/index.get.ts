import { listCoachCharacters } from '../../../services/coaches'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  return { characters: await listCoachCharacters(useDatabase()) }
})

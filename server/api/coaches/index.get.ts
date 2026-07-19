import { listCoaches } from '../../services/coaches'
import { explanationLocaleForEvent } from '../../utils/locale'

export default defineEventHandler(async (event) => {
  const coaches = await listCoaches(useDatabase(), true, explanationLocaleForEvent(event))
  return { coaches }
})

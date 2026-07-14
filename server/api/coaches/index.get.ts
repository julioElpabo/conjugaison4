import { listCoaches } from '../../services/coaches'

export default defineEventHandler(async () => {
  const coaches = await listCoaches(useDatabase(), true)
  return { coaches }
})

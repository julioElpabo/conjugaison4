import { getCatalogue } from '../../services/catalogue'
import { explanationLocaleForEvent } from '../../utils/locale'

export default defineEventHandler(async (event) => {
  try {
    return await getCatalogue(explanationLocaleForEvent(event))
  } catch (error) {
    console.error('Impossible de charger le catalogue de conjugaison', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de charger le catalogue'
    })
  }
})

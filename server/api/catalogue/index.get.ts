import { getCachedCatalogue } from '../../services/catalogue'
import { explanationLocaleForEvent } from '../../utils/locale'

export default defineEventHandler(async (event) => {
  try {
    const locale = explanationLocaleForEvent(event)
    const { catalogue, status } = await getCachedCatalogue(locale)
    setResponseHeaders(event, {
      'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
      'Vary': 'Cookie, Accept-Language',
      'X-Catalogue-Cache': status,
      'X-Content-Language': locale,
    })
    return catalogue
  } catch (error) {
    console.error('Impossible de charger le catalogue de conjugaison', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de charger le catalogue'
    })
  }
})

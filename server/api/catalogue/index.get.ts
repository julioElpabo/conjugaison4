import { getCatalogue } from '../../services/catalogue'

export default defineEventHandler(async () => {
  try {
    return await getCatalogue()
  } catch (error) {
    console.error('Impossible de charger le catalogue de conjugaison', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de charger le catalogue'
    })
  }
})

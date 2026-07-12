import { DefiNotFoundError, getDefi, normalizeDefiCode } from '../../services/defis'
import { PublicInputError } from '../../services/public-api-validation'

export default defineEventHandler(async (event) => {
  let code: string
  try {
    code = normalizeDefiCode(getRouterParam(event, 'code'))
  } catch (error) {
    if (error instanceof PublicInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
    throw error
  }

  try {
    return { code, ...await getDefi(code) }
  } catch (error) {
    if (error instanceof DefiNotFoundError) {
      throw createError({ statusCode: 404, statusMessage: 'Défi introuvable' })
    }
    console.error('Impossible de charger le défi', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de charger le défi'
    })
  }
})

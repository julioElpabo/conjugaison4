import { saveDefi } from '../../services/defis'
import { parseDefiDefinition, PublicInputError } from '../../services/public-api-validation'

export default defineEventHandler(async (event) => {
  let definition
  try {
    definition = parseDefiDefinition(await readBody<unknown>(event))
  } catch (error) {
    if (error instanceof PublicInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
    throw createError({ statusCode: 400, statusMessage: 'Corps JSON invalide' })
  }

  try {
    return { code: await saveDefi(definition) }
  } catch (error) {
    if (error instanceof PublicInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
    console.error('Impossible de sauvegarder le défi', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de sauvegarder le défi'
    })
  }
})

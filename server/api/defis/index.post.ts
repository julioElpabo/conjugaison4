import { saveDefi } from '../../services/defis'
import { parseDefiDefinition, PublicInputError } from '../../services/public-api-validation'
import { assertPublicApiRateLimit, PUBLIC_RATE_LIMITS } from '../../services/public-api-rate-limit'
import { readLimitedJsonBody } from '../../utils/limited-json-body'

export default defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.challengeCreate)
  let definition
  try {
    definition = parseDefiDefinition(await readLimitedJsonBody<unknown>(event, 32 * 1024))
  } catch (error) {
    if (error instanceof PublicInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
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

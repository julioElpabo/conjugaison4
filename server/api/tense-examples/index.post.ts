import { buildSelectedTenseExamples } from '../../services/selected-tense-examples'
import { assertPublicApiRateLimit, PUBLIC_RATE_LIMITS } from '../../services/public-api-rate-limit'
import { readLimitedJsonBody } from '../../utils/limited-json-body'

function parseIds(value: unknown, maximum: number) {
  if (!Array.isArray(value) || value.length === 0 || value.length > maximum) return null
  const ids = value.map(Number)
  if (ids.some(id => !Number.isSafeInteger(id) || id === 0) || new Set(ids).size !== ids.length) return null
  return ids
}

export default defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.tenseExamples)
  const body = await readLimitedJsonBody<{ verbIds?: unknown, tenseIds?: unknown }>(event, 32 * 1024)
  const verbIds = parseIds(body?.verbIds, 100)
  const tenseIds = parseIds(body?.tenseIds, 50)
  if (!verbIds || !tenseIds || tenseIds.some(id => id < 0)) {
    throw createError({ statusCode: 400, statusMessage: 'Sélection de verbes ou de temps invalide' })
  }

  try {
    return { examples: await buildSelectedTenseExamples(verbIds, tenseIds) }
  } catch (error) {
    console.error('Impossible de générer les exemples de temps', error)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de générer les exemples' })
  }
})

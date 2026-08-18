import { parsePublicationLocale, resolveChallengePublication } from '../../services/challenge-publications'
import { assertPublicApiRateLimit, PUBLIC_RATE_LIMITS } from '../../services/public-api-rate-limit'

export default defineEventHandler(async (event) => {
  await assertPublicApiRateLimit(event, PUBLIC_RATE_LIMITS.challengeRead)
  let locale
  try {
    locale = parsePublicationLocale(getQuery(event).locale)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: 'Langue invalide' })
  }
  const slug = String(getRouterParam(event, 'slug') || '').trim().toLocaleLowerCase('fr')
  if (!slug || slug.length > 120) throw createError({ statusCode: 400, statusMessage: 'Slug invalide' })
  const resolution = await resolveChallengePublication(useDatabase(), locale, slug)
  if (!resolution) throw createError({ statusCode: 404, statusMessage: 'Défi public introuvable' })
  return resolution
})


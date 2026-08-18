import { listPublicChallengePublications, parsePublicationLocale } from '../../services/challenge-publications'
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
  return { publications: await listPublicChallengePublications(useDatabase(), locale) }
})


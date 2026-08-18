import {
  ChallengePublicationConflictError,
  ChallengePublicationInputError,
  ChallengePublicationNotFoundError,
  parseChallengePublicationPayload,
  parsePublicationLocale,
  saveChallengePublication,
} from '../../../../../services/challenge-publications'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const presetId = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(presetId) || presetId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Défi invalide' })
  }
  let locale
  let payload
  try {
    locale = parsePublicationLocale(getRouterParam(event, 'locale'))
    payload = parseChallengePublicationPayload(await readBody(event))
  }
  catch (error) {
    if (error instanceof ChallengePublicationInputError) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
    throw error
  }

  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const publication = await saveChallengePublication(connection, presetId, locale, payload)
    await connection.commit()
    return { ok: true, publication }
  }
  catch (error) {
    await connection.rollback()
    if (error instanceof ChallengePublicationConflictError) {
      throw createError({ statusCode: 409, statusMessage: error.message })
    }
    if (error instanceof ChallengePublicationNotFoundError) {
      throw createError({ statusCode: 404, statusMessage: error.message })
    }
    throw error
  }
  finally {
    connection.release()
  }
})


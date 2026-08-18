import { listAdminChallengePublications } from '../../../../../services/challenge-publications'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const presetId = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(presetId) || presetId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Défi invalide' })
  }
  return { publications: await listAdminChallengePublications(useDatabase(), presetId) }
})


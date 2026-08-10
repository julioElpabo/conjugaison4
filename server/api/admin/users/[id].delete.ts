import type { ResultSetHeader } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const rawId = getRouterParam(event, 'id') || ''
  const id = /^\d+$/u.test(rawId) ? Number(rawId) : 0
  if (!Number.isSafeInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Utilisateur invalide' })
  }

  const [result] = await useDatabase().execute<ResultSetHeader>(
    'DELETE FROM learner_accounts WHERE id=? AND deleted_at IS NULL',
    [id],
  )
  if (result.affectedRows !== 1) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
  }
  return { ok: true }
})

import type { ResultSetHeader } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const verbId = Number.parseInt(getRouterParam(event, 'id') ?? '', 10)
  const complementId = Number.parseInt(getRouterParam(event, 'complementId') ?? '', 10)

  if (!Number.isInteger(verbId) || verbId < 1 || !Number.isInteger(complementId) || complementId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Verbe ou complément invalide' })
  }

  const [result] = await useDatabase().execute<ResultSetHeader>(`
    UPDATE complements_verbaux c
    INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
    INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
    SET c.actif=0
    WHERE c.id=? AND vs.verbe_id=? AND c.actif=1
  `, [complementId, verbId])
  if (result.affectedRows !== 1) {
    throw createError({ statusCode: 404, statusMessage: 'Complément introuvable' })
  }

  return { ok: true }
})

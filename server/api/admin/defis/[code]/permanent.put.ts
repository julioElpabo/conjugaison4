import type { ResultSetHeader } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const code = (getRouterParam(event, 'code') ?? '').trim().toUpperCase()

  if (!/^[A-Z2-9]{2}(?:-[A-Z2-9]{2}){3}$/.test(code)) {
    throw createError({ statusCode: 400, statusMessage: 'Code de défi invalide' })
  }

  const [result] = await useDatabase().execute<ResultSetHeader>(`
    UPDATE defis SET isANePasEffacer = 1, modified = CURRENT_TIMESTAMP WHERE name = ?
  `, [code])

  if (result.affectedRows === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Défi introuvable' })
  }

  return { ok: true }
})

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Média invalide' })
  await useDatabase().execute('UPDATE coach_media SET is_active=0 WHERE id=?', [id])
  return { ok: true }
})

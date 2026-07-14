export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Coach invalide' })
  await useDatabase().execute("UPDATE coaches SET status='disabled' WHERE id=?", [id])
  return { ok: true }
})

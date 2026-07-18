export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Aide invalide' })
  const [result] = await useDatabase().execute(
    "UPDATE coach_help_templates SET deleted_at=CURRENT_TIMESTAMP,status='draft' WHERE id=? AND deleted_at IS NULL",
    [id],
  )
  if (!(result as { affectedRows: number }).affectedRows) throw createError({ statusCode: 404, statusMessage: 'Aide introuvable' })
  return { ok: true }
})

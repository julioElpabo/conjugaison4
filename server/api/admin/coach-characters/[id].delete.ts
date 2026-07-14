export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Caractère invalide' })
  const [[usage]] = await useDatabase().execute<any[]>('SELECT COUNT(*) AS total FROM coaches WHERE character_id=? AND status<>\'disabled\'', [id])
  if (Number(usage.total) > 0) throw createError({ statusCode: 409, statusMessage: 'Ce caractère est encore utilisé par des coaches' })
  await useDatabase().execute("UPDATE coach_characters SET status='disabled' WHERE id=?", [id])
  return { ok: true }
})

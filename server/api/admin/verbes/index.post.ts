import type { ResultSetHeader } from 'mysql2/promise'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const body = await readBody<Record<string, unknown>>(event)
  const infinitif = typeof body?.infinitif === 'string' ? body.infinitif.trim().slice(0, 255) : ''
  const participePresent = typeof body?.participePresent === 'string' ? body.participePresent.trim().slice(0, 255) : ''
  const participePasse = typeof body?.participePasse === 'string' ? body.participePasse.trim().slice(0, 255) : ''
  const auxiliaire = typeof body?.auxiliaire === 'string' ? body.auxiliaire.trim().slice(0, 255) : ''

  if (!infinitif || !auxiliaire) {
    throw createError({ statusCode: 400, statusMessage: 'Infinitif et auxiliaire requis' })
  }

  try {
    const [result] = await useDatabase().execute<ResultSetHeader>(`
      INSERT INTO verbes (infinitif, \`participe_présent\`, \`participe_passé\`, auxiliaire)
      VALUES (?, ?, ?, ?)
    `, [infinitif, participePresent, participePasse, auxiliaire])

    return { ok: true, id: result.insertId }
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      throw createError({ statusCode: 409, statusMessage: 'Ce verbe existe déjà' })
    }
    throw error
  }
})

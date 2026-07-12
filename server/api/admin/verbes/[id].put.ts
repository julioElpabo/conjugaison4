import type { PoolConnection } from 'mysql2/promise'

interface ConjugationInput {
  personId?: unknown
  tenseId?: unknown
  conjugaison1?: unknown
  conjugaison2?: unknown
  conjugaison3?: unknown
}

interface VerbInput {
  infinitif?: unknown
  participePresent?: unknown
  participePasse?: unknown
  auxiliaire?: unknown
  conjugations?: unknown
}

function text(value: unknown, maximum = 255): string {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

function validConjugations(value: unknown): Array<{
  personId: number
  tenseId: number
  conjugaison1: string
  conjugaison2: string
  conjugaison3: string
}> {
  if (!Array.isArray(value) || value.length > 500) {
    throw createError({ statusCode: 400, statusMessage: 'Conjugaisons invalides' })
  }

  const unique = new Set<string>()
  return (value as ConjugationInput[]).map((item) => {
    const personId = Number(item.personId)
    const tenseId = Number(item.tenseId)
    const key = `${personId}:${tenseId}`

    if (!Number.isInteger(personId) || !Number.isInteger(tenseId) || unique.has(key)) {
      throw createError({ statusCode: 400, statusMessage: 'Conjugaisons invalides' })
    }

    unique.add(key)
    return {
      personId,
      tenseId,
      conjugaison1: text(item.conjugaison1),
      conjugaison2: text(item.conjugaison2),
      conjugaison3: text(item.conjugaison3)
    }
  }).filter(item => item.conjugaison1 || item.conjugaison2 || item.conjugaison3)
}

async function replaceConjugations(
  connection: PoolConnection,
  verbId: number,
  infinitif: string,
  conjugations: ReturnType<typeof validConjugations>
): Promise<void> {
  await connection.execute('DELETE FROM verbesconjugues WHERE verbe_id = ?', [verbId])

  for (const item of conjugations) {
    await connection.execute(`
      INSERT INTO verbesconjugues
        (verbe_id, verbe_infinitif, personne_id, temp_id, conjugaison1, conjugaison2, conjugaison3)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      verbId,
      infinitif,
      item.personId,
      item.tenseId,
      item.conjugaison1,
      item.conjugaison2,
      item.conjugaison3
    ])
  }
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number.parseInt(getRouterParam(event, 'id') ?? '', 10)
  const body = await readBody<VerbInput>(event)
  const infinitif = text(body?.infinitif)
  const participePresent = text(body?.participePresent)
  const participePasse = text(body?.participePasse)
  const auxiliaire = text(body?.auxiliaire)
  const conjugations = validConjugations(body?.conjugations)

  if (!Number.isInteger(id) || id < 1 || !infinitif || !auxiliaire) {
    throw createError({ statusCode: 400, statusMessage: 'Données du verbe invalides' })
  }

  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.execute(`
      UPDATE verbes
      SET infinitif = ?, \`participe_présent\` = ?, \`participe_passé\` = ?, auxiliaire = ?
      WHERE id = ?
    `, [infinitif, participePresent, participePasse, auxiliaire, id])

    if ('affectedRows' in result && result.affectedRows === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Verbe introuvable' })
    }

    await replaceConjugations(connection, id, infinitif, conjugations)
    await connection.commit()
    return { ok: true, id }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})

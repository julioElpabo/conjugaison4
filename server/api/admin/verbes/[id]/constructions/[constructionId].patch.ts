import type { RowDataPacket } from 'mysql2/promise'
import {
  normalizeComplementPreposition,
  withComplementPreposition,
  withoutComplementPreposition,
} from '../../../../../../shared/utils/complement-preposition'

interface ConstructionRow extends RowDataPacket {
  id: number
  sens_id: number
  fonction_objet: string
  preposition: string | null
}

interface ComplementRow extends RowDataPacket { id: number, texte: string }

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const verbId = Number.parseInt(getRouterParam(event, 'id') ?? '', 10)
  const constructionId = Number.parseInt(getRouterParam(event, 'constructionId') ?? '', 10)
  const body = await readBody<{ preposition?: unknown }>(event)
  const preposition = normalizeComplementPreposition(body?.preposition)

  if (!Number.isInteger(verbId) || verbId < 1 || !Number.isInteger(constructionId) || constructionId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Construction invalide' })
  }
  if (!preposition) {
    throw createError({ statusCode: 400, statusMessage: 'La préposition doit être « à » ou « de »' })
  }

  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.execute<ConstructionRow[]>(`
      SELECT cv.id, cv.sens_id, cv.fonction_objet, cv.preposition
      FROM constructions_verbales cv
      INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
      WHERE cv.id=? AND vs.verbe_id=? AND cv.actif=1
      LIMIT 1
    `, [constructionId, verbId])
    const construction = rows[0]
    if (!construction || construction.fonction_objet !== 'coi') {
      throw createError({ statusCode: 404, statusMessage: 'Construction COI introuvable' })
    }

    const previous = normalizeComplementPreposition(construction.preposition)
    if (previous === preposition) {
      await connection.rollback()
      return { ok: true, preposition, patron: `N0 V ${preposition} N1`, complements: [] }
    }

    const [complements] = await connection.execute<ComplementRow[]>(`
      SELECT id, texte FROM complements_verbaux WHERE construction_id=? ORDER BY id
    `, [constructionId])
    const rewritten = complements.map(complement => ({
      id: Number(complement.id),
      texte: withComplementPreposition(
        previous ? withoutComplementPreposition(complement.texte, previous) : complement.texte,
        preposition,
      ),
    }))
    if (new Set(rewritten.map(item => item.texte.toLocaleLowerCase('fr'))).size !== rewritten.length) {
      throw createError({ statusCode: 409, statusMessage: 'Ce changement créerait des compléments en double' })
    }

    for (const complement of rewritten) {
      await connection.execute('UPDATE complements_verbaux SET texte=? WHERE id=?', [complement.texte, complement.id])
    }
    const patron = `N0 V ${preposition} N1`
    await connection.execute(
      'UPDATE constructions_verbales SET preposition=?, patron=?, statut_validation=\'valide\' WHERE id=?',
      [preposition, patron, constructionId],
    )
    await connection.execute(
      'UPDATE verbe_sens SET preposition=?, construction=? WHERE id=?',
      [preposition, patron, construction.sens_id],
    )
    await connection.commit()
    return { ok: true, preposition, patron, complements: rewritten }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})

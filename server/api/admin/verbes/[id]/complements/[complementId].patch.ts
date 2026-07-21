import type { RowDataPacket } from 'mysql2/promise'
import {
  resolveAnteposedComplement,
  type ComplementGender,
  type ComplementNumber,
} from '../../../../../services/complement-placement'

interface ComplementRow extends RowDataPacket {
  id: number
  texte: string
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const verbId = Number.parseInt(getRouterParam(event, 'id') ?? '', 10)
  const complementId = Number.parseInt(getRouterParam(event, 'complementId') ?? '', 10)
  const body = await readBody<{ genre?: unknown, nombre?: unknown }>(event)
  const genre = typeof body?.genre === 'string' && ['masculin', 'feminin'].includes(body.genre)
    ? body.genre as ComplementGender
    : null
  const nombre = typeof body?.nombre === 'string' && ['singulier', 'pluriel'].includes(body.nombre)
    ? body.nombre as ComplementNumber
    : null

  if (!Number.isInteger(verbId) || verbId < 1 || !Number.isInteger(complementId) || complementId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Verbe ou complément invalide' })
  }
  if (!genre || !nombre) {
    throw createError({ statusCode: 400, statusMessage: 'Le genre et le nombre sont obligatoires' })
  }

  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.execute<ComplementRow[]>(`
      SELECT c.id, c.texte
      FROM complements_verbaux c
      INNER JOIN constructions_verbales cv ON cv.id=c.construction_id
      INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
      WHERE c.id=? AND vs.verbe_id=? AND cv.fonction_objet='cod' AND c.actif=1
      LIMIT 1
      FOR UPDATE
    `, [complementId, verbId])
    const complement = rows[0]
    if (!complement) {
      throw createError({ statusCode: 404, statusMessage: 'Complément COD introuvable' })
    }

    const placement = resolveAnteposedComplement(complement.texte, genre, nombre)
    if (!placement) {
      throw createError({ statusCode: 422, statusMessage: 'Impossible de préparer ce complément avec ces informations' })
    }
    await connection.execute(`
      UPDATE complements_verbaux
      SET texte_antepose=?, genre=?, nombre=?, statut_validation='valide'
      WHERE id=?
    `, [placement.text, placement.gender, placement.number, complementId])
    await connection.commit()

    return {
      ok: true,
      complement: {
        id: Number(complement.id),
        texte: complement.texte,
        genre: placement.gender,
        nombre: placement.number,
      },
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})

import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { inferAnteposedComplement } from '../../../../../services/complement-placement'

interface ConstructionRow extends RowDataPacket {
  id: number
  code: string
  fonction_objet: string
  preposition: string | null
  patron: string
}
interface SenseRow extends RowDataPacket { id: number }
interface VerbRow extends RowDataPacket { id: number }
interface ComplementRow extends RowDataPacket { id: number, actif: number }
interface CountRow extends RowDataPacket { total: number }

function normalizeComplement(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const verbId = Number.parseInt(getRouterParam(event, 'id') ?? '', 10)
  const body = await readBody<{ constructionId?: unknown, texte?: unknown }>(event)
  const requestedConstructionId = Number(body?.constructionId)
  const texte = normalizeComplement(body?.texte)
  const anteposed = inferAnteposedComplement(texte)

  if (!Number.isInteger(verbId) || verbId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Verbe invalide' })
  }
  if (body?.constructionId !== undefined && (!Number.isInteger(requestedConstructionId) || requestedConstructionId < 1)) {
    throw createError({ statusCode: 400, statusMessage: 'Construction invalide' })
  }
  if (texte.length < 2 || texte.length > 180) {
    throw createError({ statusCode: 400, statusMessage: 'Le complément doit contenir entre 2 et 180 caractères' })
  }
  if (/[.!?,;:]$/.test(texte)) {
    throw createError({ statusCode: 400, statusMessage: 'Le complément ne doit pas se terminer par un signe de ponctuation' })
  }

  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const [[verb]] = await connection.execute<VerbRow[]>('SELECT id FROM verbes WHERE id=? AND est_archive=0 LIMIT 1', [verbId])
    if (!verb) throw createError({ statusCode: 404, statusMessage: 'Verbe introuvable' })

    let construction: ConstructionRow | undefined
    if (Number.isInteger(requestedConstructionId) && requestedConstructionId > 0) {
      const [rows] = await connection.execute<ConstructionRow[]>(`
        SELECT cv.id, cv.code, cv.fonction_objet, cv.preposition, cv.patron
        FROM constructions_verbales cv
        INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
        WHERE cv.id=? AND vs.verbe_id=? AND cv.actif=1
        LIMIT 1
      `, [requestedConstructionId, verbId])
      construction = rows[0]
      if (!construction) throw createError({ statusCode: 404, statusMessage: 'Construction verbale introuvable' })
    } else {
      const [directSenses] = await connection.execute<SenseRow[]>(`
        SELECT id FROM verbe_sens
        WHERE verbe_id=? AND transitivite='transitif_direct'
        ORDER BY est_principal DESC, sort_order, id
        LIMIT 1
      `, [verbId])
      let senseId = Number(directSenses[0]?.id)
      if (!senseId) {
        const [senseResult] = await connection.execute<ResultSetHeader>(`
          INSERT INTO verbe_sens
            (verbe_id, numero_sens, intitule, definition, construction, transitivite,
             auxiliaire, registre, est_pronominal, est_principal, source, sort_order)
          SELECT ?, COALESCE(MAX(numero_sens), 0) + 1, 'Emploi transitif direct',
            'Emploi transitif direct ajouté depuis l’administration', 'N0 V N1',
            'transitif_direct', 'avoir', 'courant', 0, 0, 'manuel',
            COALESCE(MAX(sort_order), 0) + 1
          FROM verbe_sens WHERE verbe_id=?
        `, [verbId, verbId])
        senseId = Number(senseResult.insertId)
      }
      await connection.execute(`
        INSERT INTO constructions_verbales
          (sens_id, code, fonction_objet, preposition, patron, complement_obligatoire,
           source, statut_validation, actif)
        VALUES (?, 'cod-postpose', 'cod', NULL, 'N0 V N1', 0,
          'Saisie administrateur', 'valide', 1)
        ON DUPLICATE KEY UPDATE actif=1, statut_validation='valide'
      `, [senseId])
      const [rows] = await connection.execute<ConstructionRow[]>(`
        SELECT id, code, fonction_objet, preposition, patron
        FROM constructions_verbales
        WHERE sens_id=? AND code='cod-postpose'
        LIMIT 1
      `, [senseId])
      construction = rows[0]
      if (!construction) throw createError({ statusCode: 500, statusMessage: 'Impossible de créer la construction verbale' })
    }

    const constructionId = Number(construction.id)
    const placement = construction.fonction_objet === 'cod' ? anteposed : null
    const [[existing]] = await connection.execute<ComplementRow[]>(`
      SELECT id, actif FROM complements_verbaux
      WHERE construction_id=? AND texte=?
      LIMIT 1
    `, [constructionId, texte])
    if (existing && Boolean(existing.actif)) {
      throw createError({ statusCode: 409, statusMessage: 'Ce complément existe déjà' })
    }

    const [[count]] = await connection.execute<CountRow[]>(`
      SELECT COUNT(*) AS total FROM complements_verbaux
      WHERE construction_id=? AND actif=1
    `, [constructionId])
    if (Number(count?.total || 0) >= 30) {
      throw createError({ statusCode: 400, statusMessage: 'Cette construction possède déjà le maximum de 30 compléments' })
    }

    let complementId: number
    if (existing) {
      await connection.execute(`
        UPDATE complements_verbaux
        SET actif=1, statut_validation='valide', source='Saisie administrateur',
          texte_antepose=?, genre=?, nombre=?
        WHERE id=?
      `, [placement?.text ?? null, placement?.gender ?? null, placement?.number ?? null, existing.id])
      complementId = Number(existing.id)
    } else {
      const [result] = await connection.execute<ResultSetHeader>(`
        INSERT INTO complements_verbaux
          (construction_id, texte, texte_antepose, genre, nombre, poids, source, statut_validation, actif)
        VALUES (?, ?, ?, ?, ?, 1, 'Saisie administrateur', 'valide', 1)
      `, [constructionId, texte, placement?.text ?? null, placement?.gender ?? null, placement?.number ?? null])
      complementId = Number(result.insertId)
    }

    await connection.commit()
    return {
      ok: true,
      construction: {
        id: constructionId,
        code: construction.code,
        fonctionObjet: construction.fonction_objet,
        preposition: construction.preposition,
        patron: construction.patron
      },
      complement: { id: complementId, texte }
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})

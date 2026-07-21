import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import {
  inferAnteposedComplement,
  resolveAnteposedComplement,
  type ComplementGender,
  type ComplementNumber,
} from '../../../../../services/complement-placement'
import {
  normalizeComplementPreposition,
  withComplementPreposition,
} from '../../../../../../shared/utils/complement-preposition'

interface ConstructionRow extends RowDataPacket {
  id: number
  code: string
  fonction_objet: string
  preposition: string | null
  patron: string
}
interface SenseRow extends RowDataPacket { id: number }
interface VerbRow extends RowDataPacket { id: number, auxiliaire: string | null }
interface ComplementRow extends RowDataPacket { id: number, actif: number }
interface CountRow extends RowDataPacket { total: number }

function normalizeComplement(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const verbId = Number.parseInt(getRouterParam(event, 'id') ?? '', 10)
  const body = await readBody<{
    constructionId?: unknown
    texte?: unknown
    gender?: unknown
    number?: unknown
    nature?: unknown
    fonctionObjet?: unknown
    preposition?: unknown
  }>(event)
  const requestedConstructionId = Number(body?.constructionId)
  const rawText = normalizeComplement(body?.texte)
  const requestedNature = typeof body?.nature === 'string' ? body.nature : 'nominal'
  const nature = ['nominal', 'infinitif', 'expression'].includes(requestedNature)
    ? requestedNature
    : null
  const requestedGender = typeof body?.gender === 'string' ? body.gender : ''
  const requestedNumber = typeof body?.number === 'string' ? body.number : ''
  const requestedFunction = typeof body?.fonctionObjet === 'string'
    ? body.fonctionObjet.trim().toLocaleLowerCase('fr-CH')
    : 'cod'
  const requestedPreposition = normalizeComplementPreposition(body?.preposition)
  const gender = ['masculin', 'feminin'].includes(requestedGender)
    ? requestedGender as ComplementGender
    : null
  const number = ['singulier', 'pluriel'].includes(requestedNumber)
    ? requestedNumber as ComplementNumber
    : null
  if ((requestedGender && !gender) || (requestedNumber && !number) || Boolean(gender) !== Boolean(number)) {
    throw createError({ statusCode: 400, statusMessage: 'Le genre et le nombre doivent être renseignés ensemble' })
  }
  if (!nature) {
    throw createError({ statusCode: 400, statusMessage: 'Nature de complément invalide' })
  }
  if (!['cod', 'coi'].includes(requestedFunction)) {
    throw createError({ statusCode: 400, statusMessage: 'Fonction du complément invalide' })
  }
  if (requestedFunction === 'coi' && !requestedPreposition) {
    throw createError({ statusCode: 400, statusMessage: 'Choisis la préposition à ou de pour ce COI' })
  }

  if (!Number.isInteger(verbId) || verbId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Verbe invalide' })
  }
  if (body?.constructionId !== undefined && (!Number.isInteger(requestedConstructionId) || requestedConstructionId < 1)) {
    throw createError({ statusCode: 400, statusMessage: 'Construction invalide' })
  }
  if (rawText.length < 2 || rawText.length > 180) {
    throw createError({ statusCode: 400, statusMessage: 'Le complément doit contenir entre 2 et 180 caractères' })
  }
  if (/[.!?,;:]$/.test(rawText)) {
    throw createError({ statusCode: 400, statusMessage: 'Le complément ne doit pas se terminer par un signe de ponctuation' })
  }

  const connection = await useDatabase().getConnection()
  try {
    await connection.beginTransaction()
    const [[verb]] = await connection.execute<VerbRow[]>(
      'SELECT id, auxiliaire FROM verbes WHERE id=? AND est_archive=0 LIMIT 1',
      [verbId],
    )
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
      const targetPreposition = requestedFunction === 'coi' ? requestedPreposition : null
      const [existingConstructions] = await connection.execute<ConstructionRow[]>(`
        SELECT cv.id, cv.code, cv.fonction_objet, cv.preposition, cv.patron
        FROM constructions_verbales cv
        INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
        WHERE vs.verbe_id=? AND cv.fonction_objet=? AND cv.preposition <=> ? AND cv.actif=1
        ORDER BY vs.est_principal DESC, vs.sort_order, cv.id
        LIMIT 1
      `, [verbId, requestedFunction, targetPreposition])
      construction = existingConstructions[0]

      const transitivite = requestedFunction === 'coi' ? 'transitif_indirect' : 'transitif_direct'
      const patron = requestedFunction === 'coi' ? `N0 V ${targetPreposition} N1` : 'N0 V N1'
      const intitule = requestedFunction === 'coi'
        ? `Emploi indirect avec « ${targetPreposition} »`
        : 'Emploi transitif direct'
      const code = requestedFunction === 'coi'
        ? `coi-${targetPreposition === 'à' ? 'a' : 'de'}-postpose`
        : 'cod-postpose'

      if (!construction) {
        const [senses] = await connection.execute<SenseRow[]>(`
          SELECT id FROM verbe_sens
          WHERE verbe_id=? AND transitivite=? AND preposition <=> ?
          ORDER BY est_principal DESC, sort_order, id
          LIMIT 1
        `, [verbId, transitivite, targetPreposition])
        let senseId = Number(senses[0]?.id)
        if (!senseId) {
          const [senseResult] = await connection.execute<ResultSetHeader>(`
            INSERT INTO verbe_sens
              (verbe_id, numero_sens, intitule, definition, construction, transitivite,
               preposition, auxiliaire, registre, est_pronominal, est_principal, source, sort_order)
            SELECT ?, COALESCE(MAX(numero_sens), 0) + 1, ?, ?, ?, ?, ?, ?, 'courant', 0, 0, 'manuel',
              COALESCE(MAX(sort_order), 0) + 1
            FROM verbe_sens WHERE verbe_id=?
          `, [
            verbId,
            intitule,
            `${intitule} ajouté depuis l’administration`,
            patron,
            transitivite,
            targetPreposition,
            verb.auxiliaire || 'avoir',
            verbId,
          ])
          senseId = Number(senseResult.insertId)
        }
        await connection.execute(`
          INSERT INTO constructions_verbales
            (sens_id, code, fonction_objet, preposition, patron, complement_obligatoire,
             source, statut_validation, actif)
          VALUES (?, ?, ?, ?, ?, 0, 'Saisie administrateur', 'valide', 1)
          ON DUPLICATE KEY UPDATE fonction_objet=VALUES(fonction_objet),
            preposition=VALUES(preposition), patron=VALUES(patron), actif=1,
            statut_validation='valide'
        `, [senseId, code, requestedFunction, targetPreposition, patron])
        const [rows] = await connection.execute<ConstructionRow[]>(`
          SELECT id, code, fonction_objet, preposition, patron
          FROM constructions_verbales
          WHERE sens_id=? AND code=?
          LIMIT 1
        `, [senseId, code])
        construction = rows[0]
        if (!construction) throw createError({ statusCode: 500, statusMessage: 'Impossible de créer la construction verbale' })
      }
    }

    const constructionId = Number(construction.id)
    const constructionPreposition = normalizeComplementPreposition(construction.preposition)
    const texte = construction.fonction_objet === 'coi' && constructionPreposition
      ? withComplementPreposition(rawText, constructionPreposition)
      : rawText
    if (texte.length > 180) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Le complément avec sa préposition ne doit pas dépasser 180 caractères',
      })
    }
    const inferred = inferAnteposedComplement(texte)
    if (construction.fonction_objet === 'coi' && !constructionPreposition) {
      throw createError({ statusCode: 422, statusMessage: 'Choisis d’abord la préposition de cette construction COI' })
    }
    if (construction.fonction_objet === 'coi' && nature === 'nominal' && (!gender || !number)) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Précise le genre et le nombre de ce complément nominal',
        data: { code: 'COMPLEMENT_GRAMMAR_REQUIRED' },
      })
    }
    if (construction.fonction_objet === 'cod' && !inferred && (!gender || !number)) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Précise le genre et le nombre de ce COD',
        data: { code: 'COMPLEMENT_GRAMMAR_REQUIRED' },
      })
    }
    const placement = construction.fonction_objet === 'cod'
      ? resolveAnteposedComplement(texte, gender, number)
      : nature === 'nominal'
        ? { text: null, gender, number }
        : null
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
      complement: {
        id: complementId,
        texte,
        genre: placement?.gender ?? null,
        nombre: placement?.number ?? null,
      }
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})

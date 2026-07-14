import type { RowDataPacket } from 'mysql2/promise'

interface VerbRow extends RowDataPacket {
  id: number
  infinitif: string
  participe_present: string
  participe_passe: string
  auxiliaire: string
  groupe_conjugaison: number | null
  famille_conjugaison: string | null
  terminaison_infinitif: string | null
  type_pronominal: string
  est_impersonnel: number
  est_defectif: number
  niveau_difficulte: number | null
  niveau_cecrl: string | null
  registre_principal: string | null
  forme_canonique: string | null
  statut_validation: string
  particularites: string | string[] | null
  niveaux_scolaires: string | string[] | null
  parcours_cif: string | string[] | null
}

interface CategoryRow extends RowDataPacket { slug: string, label: string, sort_order: number }
interface ComplementRow extends RowDataPacket {
  construction_id: number
  complement_id: number | null
  code: string
  fonction_objet: string
  preposition: string | null
  patron: string
  texte: string | null
}

interface ConjugationRow extends RowDataPacket {
  id: number
  personId: number
  tenseId: number
  conjugaison1: string
  conjugaison2: string
  conjugaison3: string
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number.parseInt(getRouterParam(event, 'id') ?? '', 10)

  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de verbe invalide' })
  }

  const database = useDatabase()
  const [[verb], [conjugations], [categories], [complements]] = await Promise.all([
    database.execute<VerbRow[]>(`
      SELECT v.id, v.infinitif,
        v.\`participe_présent\` AS participe_present,
        v.\`participe_passé\` AS participe_passe,
        v.auxiliaire, v.groupe_conjugaison, f.slug AS famille_conjugaison, v.terminaison_infinitif,
        v.type_pronominal, v.est_impersonnel, v.est_defectif, v.niveau_difficulte, v.niveau_cecrl,
        v.registre_principal, v.forme_canonique, v.statut_validation, v.particularites,
        v.niveaux_scolaires, v.parcours_cif
      FROM verbes v
      LEFT JOIN familles_conjugaison f ON f.id = v.famille_conjugaison_id
      WHERE v.id = ?
      LIMIT 1
    `, [id]),
    database.execute<ConjugationRow[]>(`
      SELECT id, personne_id AS personId, temp_id AS tenseId,
        conjugaison1, conjugaison2, conjugaison3
      FROM verbesconjugues
      WHERE verbe_id = ?
      ORDER BY temp_id, personne_id
    `, [id]),
    database.execute<CategoryRow[]>(`
      SELECT DISTINCT cs.slug, cs.label, cs.sort_order FROM verbe_sens vs
      INNER JOIN verbe_sens_categories vsc ON vsc.sens_id=vs.id
      INNER JOIN categories_semantiques cs ON cs.id=vsc.categorie_id
      WHERE vs.verbe_id=? ORDER BY cs.sort_order, cs.label
    `, [id]),
    database.execute<ComplementRow[]>(`
      SELECT cv.id AS construction_id, c.id AS complement_id, cv.code, cv.fonction_objet, cv.preposition,
             cv.patron, c.texte
      FROM verbe_sens vs
      INNER JOIN constructions_verbales cv ON cv.sens_id=vs.id AND cv.actif=1
      LEFT JOIN complements_verbaux c ON c.construction_id=cv.id AND c.actif=1
      WHERE vs.verbe_id=?
      ORDER BY cv.id, c.id
    `, [id])
  ])

  if (!verb[0]) {
    throw createError({ statusCode: 404, statusMessage: 'Verbe introuvable' })
  }

  const array = (value: string | string[] | null) => {
    if (Array.isArray(value)) return value
    try { return value ? JSON.parse(value) : [] } catch { return [] }
  }
  const constructions = [...new Map(complements.map(row => [Number(row.construction_id), {
    id: Number(row.construction_id),
    code: row.code,
    fonctionObjet: row.fonction_objet,
    preposition: row.preposition,
    patron: row.patron,
    complements: complements
      .filter(item => Number(item.construction_id) === Number(row.construction_id))
      .filter(item => item.complement_id !== null && item.texte !== null)
      .map(item => ({ id: Number(item.complement_id), texte: String(item.texte) })),
  }])).values()]

  return {
    verb: {
      id: verb[0].id,
      infinitif: verb[0].infinitif,
      participePresent: verb[0].participe_present,
      participePasse: verb[0].participe_passe,
      auxiliaire: verb[0].auxiliaire,
      groupeConjugaison: verb[0].groupe_conjugaison,
      familleConjugaison: verb[0].famille_conjugaison,
      terminaison: verb[0].terminaison_infinitif,
      typePronominal: verb[0].type_pronominal,
      estImpersonnel: Boolean(verb[0].est_impersonnel),
      estDefectif: Boolean(verb[0].est_defectif),
      niveauDifficulte: verb[0].niveau_difficulte,
      niveauCecrl: verb[0].niveau_cecrl,
      registrePrincipal: verb[0].registre_principal,
      formeCanonique: verb[0].forme_canonique || verb[0].infinitif,
      statutValidation: verb[0].statut_validation,
      particularites: array(verb[0].particularites),
      niveauxScolaires: array(verb[0].niveaux_scolaires),
      parcoursCif: array(verb[0].parcours_cif),
      categoriesSemantiques: categories,
    },
    conjugations,
    constructions,
  }
})

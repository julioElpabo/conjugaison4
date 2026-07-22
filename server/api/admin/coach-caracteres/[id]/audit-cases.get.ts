import type { RowDataPacket } from 'mysql2/promise'

interface CountRow extends RowDataPacket { totalCases: number, totalVerbs: number }
interface VerbRow extends RowDataPacket {
  id: number
  infinitif: string
  participePresent: string | null
  participePasse: string | null
  auxiliaire: string | null
  groupeConjugaison: 1 | 2 | 3 | null
  familleConjugaison: string | null
  terminaison: string | null
  typePronominal: string
  estImpersonnel: number
  estDefectif: number
  personnesDisponibles: string | number[] | null
  typeHInitial: string | null
  niveauDifficulte: number | null
  niveauCecrl: string | null
  rangFrequence: number | null
  registrePrincipal: string | null
  formeCanonique: string | null
  statutValidation: string
  particularites: string | string[] | null
  niveauxScolaires: string | string[] | null
  parcoursCif: string | string[] | null
  meaning: string | null
}
interface FormRow extends RowDataPacket {
  verbId: number
  personId: number
  tenseId: number
  modeId: number
  conjugaison1: string
  conjugaison2: string | null
  conjugaison3: string | null
  pronoun: string
  tense: string
  mode: string
  isCompound: number
}

function parsedArray<T>(value: string | T[] | null): T[] {
  if (Array.isArray(value)) return value
  try { return value ? JSON.parse(value) as T[] : [] } catch { return [] }
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const caractereId = Number.parseInt(getRouterParam(event, 'id') || '', 10)
  const query = getQuery(event)
  const after = Math.max(0, Number.parseInt(String(query.after || '0'), 10) || 0)
  const limit = Math.min(20, Math.max(1, Number.parseInt(String(query.limit || '8'), 10) || 8))
  if (!Number.isInteger(caractereId) || caractereId < 1) throw createError({ statusCode: 400, statusMessage: 'Caractère invalide' })

  const database = useDatabase()
  const [caractereRows] = await database.execute<RowDataPacket[]>(
    "SELECT id FROM coach_characters WHERE id=? AND status<>'disabled' LIMIT 1",
    [caractereId],
  )
  if (!caractereRows.length) throw createError({ statusCode: 404, statusMessage: 'Caractère introuvable' })

  const [totalsResult, verbsResult] = await Promise.all([
    database.execute<CountRow[]>(`SELECT COUNT(*) AS totalCases,COUNT(DISTINCT vc.verbe_id) AS totalVerbs
      FROM verbesconjugues vc INNER JOIN verbes v ON v.id=vc.verbe_id
      WHERE v.est_archive=0 AND TRIM(COALESCE(vc.conjugaison1,''))<>''`),
    database.execute<VerbRow[]>(`SELECT v.id,v.infinitif,v.\`participe_présent\` AS participePresent,
      v.\`participe_passé\` AS participePasse,v.auxiliaire,v.groupe_conjugaison AS groupeConjugaison,
      f.slug AS familleConjugaison,v.terminaison_infinitif AS terminaison,v.type_pronominal AS typePronominal,
      v.est_impersonnel AS estImpersonnel,v.est_defectif AS estDefectif,
      v.personnes_disponibles AS personnesDisponibles,v.type_h_initial AS typeHInitial,
      v.niveau_difficulte AS niveauDifficulte,v.niveau_cecrl AS niveauCecrl,v.rang_frequence AS rangFrequence,
      v.registre_principal AS registrePrincipal,v.forme_canonique AS formeCanonique,
      v.statut_validation AS statutValidation,v.particularites,v.niveaux_scolaires AS niveauxScolaires,
      v.parcours_cif AS parcoursCif,
      (SELECT COALESCE(NULLIF(TRIM(vs.definition),''),NULLIF(TRIM(vs.intitule),''))
       FROM verbe_sens vs WHERE vs.verbe_id=v.id ORDER BY vs.est_principal DESC,vs.numero_sens,vs.sort_order,vs.id LIMIT 1) AS meaning
      FROM verbes v LEFT JOIN familles_conjugaison f ON f.id=v.famille_conjugaison_id
      WHERE v.est_archive=0 AND v.id>? AND EXISTS(SELECT 1 FROM verbesconjugues vc WHERE vc.verbe_id=v.id AND TRIM(COALESCE(vc.conjugaison1,''))<>'')
      ORDER BY v.id LIMIT ${limit}`, [after]),
  ])
  const totals = totalsResult[0][0]
  const verbRows = verbsResult[0]

  const verbIds = verbRows.map(row => Number(row.id))
  const forms = verbIds.length
    ? (await database.execute<FormRow[]>(`SELECT vc.verbe_id AS verbId,vc.personne_id AS personId,vc.temp_id AS tenseId,
        t.mode_id AS modeId,vc.conjugaison1,vc.conjugaison2,vc.conjugaison3,p.pronom AS pronoun,
        t.name AS tense,m.name AS mode,t.isTempsCompose AS isCompound
       FROM verbesconjugues vc INNER JOIN personnes p ON p.id=vc.personne_id
       INNER JOIN temps t ON t.id=vc.temp_id INNER JOIN modes m ON m.id=t.mode_id
       WHERE vc.verbe_id IN (${verbIds.map(() => '?').join(',')}) AND TRIM(COALESCE(vc.conjugaison1,''))<>''
       ORDER BY vc.verbe_id,vc.temp_id,vc.personne_id`, verbIds))[0]
    : []

  const verbs = verbRows.map(row => ({
    verb: {
      id: Number(row.id), infinitif: row.infinitif, meaning: row.meaning || '', participePresent: row.participePresent,
      participePasse: row.participePasse, auxiliaire: row.auxiliaire, groupeConjugaison: row.groupeConjugaison,
      familleConjugaison: row.familleConjugaison, terminaison: row.terminaison, typePronominal: row.typePronominal,
      estImpersonnel: Boolean(row.estImpersonnel), estDefectif: Boolean(row.estDefectif),
      personnesDisponibles: parsedArray<number>(row.personnesDisponibles), typeHInitial: row.typeHInitial,
      niveauDifficulte: row.niveauDifficulte, niveauCecrl: row.niveauCecrl, rangFrequence: row.rangFrequence,
      registrePrincipal: row.registrePrincipal, formeCanonique: row.formeCanonique || row.infinitif,
      statutValidation: row.statutValidation, particularites: parsedArray<string>(row.particularites),
      niveauxScolaires: parsedArray<string>(row.niveauxScolaires), parcoursCif: parsedArray<string>(row.parcoursCif),
      categoriesSemantiques: [],
    },
    conjugations: forms.filter(form => Number(form.verbId) === Number(row.id)).map(form => ({
      personId: Number(form.personId), tenseId: Number(form.tenseId), modeId: Number(form.modeId),
      conjugaison1: form.conjugaison1, conjugaison2: form.conjugaison2 || '', conjugaison3: form.conjugaison3 || '',
      pronoun: form.pronoun || '', tense: form.tense, mode: form.mode, isCompound: Boolean(form.isCompound),
    })),
  }))
  const nextAfter = verbIds.at(-1) || after
  return {
    totalCases: Number(totals?.totalCases || 0), totalVerbs: Number(totals?.totalVerbs || 0),
    verbs, nextAfter, done: verbRows.length < limit,
  }
})

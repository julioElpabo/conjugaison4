import type { RowDataPacket } from 'mysql2/promise'

interface VerbRow extends RowDataPacket {
  id: number
  infinitif: string
  participe_present: string
  participe_passe: string
  auxiliaire: string
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
  const [[verb], [conjugations]] = await Promise.all([
    database.execute<VerbRow[]>(`
      SELECT id, infinitif,
        \`participe_présent\` AS participe_present,
        \`participe_passé\` AS participe_passe,
        auxiliaire
      FROM verbes
      WHERE id = ?
      LIMIT 1
    `, [id]),
    database.execute<ConjugationRow[]>(`
      SELECT id, personne_id AS personId, temp_id AS tenseId,
        conjugaison1, conjugaison2, conjugaison3
      FROM verbesconjugues
      WHERE verbe_id = ?
      ORDER BY temp_id, personne_id
    `, [id])
  ])

  if (!verb[0]) {
    throw createError({ statusCode: 404, statusMessage: 'Verbe introuvable' })
  }

  return {
    verb: {
      id: verb[0].id,
      infinitif: verb[0].infinitif,
      participePresent: verb[0].participe_present,
      participePasse: verb[0].participe_passe,
      auxiliaire: verb[0].auxiliaire
    },
    conjugations
  }
})

import type { RowDataPacket } from 'mysql2/promise'
import type { VerbConsultation } from '../../../shared/types/verb-consultation'
import { decodePronominalSelectionId } from '../../../shared/utils/pronominal-selection'
import { generatePronominalRow, type PronominalSourceRow } from '../../services/pronominal-formatter'

interface VerbRow extends RowDataPacket {
  id: number
  infinitif: string
  participe_present: string
  participe_passe: string
  auxiliaire: string
  groupe_conjugaison: 1 | 2 | 3 | null
  est_impersonnel: number
  est_defectif: number
  type_pronominal: 'aucun' | 'occasionnel' | 'essentiel'
}

interface StoredConjugationRow extends RowDataPacket {
  id: number
  verbe_id: number
  personne_id: number
  temp_id: number
  conjugaison1: string
  conjugaison2: string
  conjugaison3: string
  infinitif: string
  auxiliaire: string
  participe_passe: string
  pronom: string
  temps_name: string
  is_compound: number
  mode_name: string
}

interface PublicPronominalRow extends PronominalSourceRow {
  pronom: string
}

interface AuxiliaryRow extends RowDataPacket {
  personne_id: number
  mode_name: string
  temps_name: string
  conjugaison1: string
}

function parseAllowedPeople(value: string | number[] | null) {
  if (Array.isArray(value)) return value.map(Number)
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(Number) : null
  } catch {
    return null
  }
}

function pronominalParticiple(value: string, hType: string | null) {
  return value.split('-').map(form => form.trim()).filter(Boolean).map((form) => {
    const first = form.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLocaleLowerCase('fr')
    const elided = 'aeiouy'.includes(first) || (first === 'h' && hType !== 'aspire')
    return `${elided ? "s'" : 'se '}${form}`
  }).join('-')
}

function publicConjugations(rows: Array<StoredConjugationRow | PublicPronominalRow>) {
  return rows.map(row => ({
    id: Number(row.id),
    personId: Number(row.personne_id),
    tenseId: Number(row.temp_id),
    pronoun: row.pronom,
    forms: [...new Set([row.conjugaison1, row.conjugaison2, row.conjugaison3]
      .map(form => form?.trim())
      .filter((form): form is string => Boolean(form)))],
  })).filter(row => row.forms.length > 0)
}

export default defineEventHandler(async (event): Promise<VerbConsultation> => {
  const rawId = getRouterParam(event, 'id') ?? ''
  const id = Number(rawId)
  if (!Number.isSafeInteger(id) || id === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiant de verbe invalide' })
  }

  const database = useDatabase()
  if (id > 0) {
    const [[verbs], [conjugations]] = await Promise.all([
      database.execute<VerbRow[]>(`
        SELECT id, infinitif, \`participe_présent\` AS participe_present,
          \`participe_passé\` AS participe_passe, auxiliaire, groupe_conjugaison,
          est_impersonnel, est_defectif, type_pronominal
        FROM verbes
        WHERE id = ? AND est_archive = 0
        LIMIT 1
      `, [id]),
      database.execute<StoredConjugationRow[]>(`
        SELECT vc.id, vc.verbe_id, vc.personne_id, vc.temp_id,
          vc.conjugaison1, vc.conjugaison2, vc.conjugaison3,
          v.infinitif, v.auxiliaire, v.\`participe_passé\` AS participe_passe,
          p.pronom, t.name AS temps_name, t.isTempsCompose AS is_compound, m.name AS mode_name
        FROM verbesconjugues vc
        INNER JOIN verbes v ON v.id = vc.verbe_id
        INNER JOIN personnes p ON p.id = vc.personne_id
        INNER JOIN temps t ON t.id = vc.temp_id
        INNER JOIN modes m ON m.id = t.mode_id
        WHERE vc.verbe_id = ? AND vc.conjugaison1 <> ''
        ORDER BY t.id, p.id
      `, [id]),
    ])
    const verb = verbs[0]
    if (!verb) throw createError({ statusCode: 404, statusMessage: 'Verbe introuvable' })

    return {
      verb: {
        id: Number(verb.id),
        infinitif: verb.infinitif,
        participePresent: verb.participe_present,
        participePasse: verb.participe_passe,
        auxiliaire: verb.auxiliaire,
        groupeConjugaison: verb.groupe_conjugaison ? Number(verb.groupe_conjugaison) as 1 | 2 | 3 : null,
        estImpersonnel: Boolean(verb.est_impersonnel),
        estDefectif: Boolean(verb.est_defectif),
        typePronominal: verb.type_pronominal || 'aucun',
      },
      conjugations: publicConjugations(conjugations),
    }
  }

  const useId = decodePronominalSelectionId(id)
  const [[uses], [sourceRows], [auxiliaryRows]] = await Promise.all([
    database.execute<(VerbRow & RowDataPacket & {
      use_id: number
      infinitif_pronominal: string
      type_emploi: string
      regle_accord: string
      type_h_initial: string | null
    })[]>(`
      SELECT ep.id AS use_id, ep.infinitif_pronominal, ep.type_emploi, ep.regle_accord,
        v.id, v.infinitif, v.\`participe_présent\` AS participe_present,
        v.\`participe_passé\` AS participe_passe, v.auxiliaire, v.groupe_conjugaison,
        v.est_impersonnel, v.est_defectif, v.type_pronominal, v.type_h_initial
      FROM emplois_pronominaux ep
      INNER JOIN verbes v ON v.id = ep.verbe_id AND v.est_archive = 0
      WHERE ep.id = ? AND ep.actif = 1
      LIMIT 1
    `, [useId]),
    database.execute<PublicPronominalRow[]>(`
      SELECT vc.id, -ep.id AS verbe_id, vc.personne_id, vc.temp_id,
        vc.conjugaison1 AS base_conjugaison1, vc.conjugaison2 AS base_conjugaison2,
        vc.conjugaison3 AS base_conjugaison3, vc.conjugaison1, vc.conjugaison2, vc.conjugaison3,
        ep.id AS pronominal_use_id, ep.infinitif_pronominal, ep.regle_accord,
        ep.personnes_autorisees, base.type_h_initial, base.infinitif, base.auxiliaire,
        base.\`participe_passé\` AS participe_passe, p.pronom,
        t.name AS temps_name, t.isTempsCompose AS is_compound, m.name AS mode_name
      FROM emplois_pronominaux ep
      INNER JOIN verbes base ON base.id = ep.verbe_id AND base.est_archive = 0
      INNER JOIN verbesconjugues vc ON vc.verbe_id = base.id
      INNER JOIN personnes p ON p.id = vc.personne_id
      INNER JOIN temps t ON t.id = vc.temp_id
      INNER JOIN modes m ON m.id = t.mode_id
      WHERE ep.id = ? AND ep.actif = 1 AND vc.conjugaison1 <> ''
      ORDER BY t.id, p.id
    `, [useId]),
    database.execute<AuxiliaryRow[]>(`
      SELECT vc.personne_id, m.name AS mode_name, t.name AS temps_name, vc.conjugaison1
      FROM verbesconjugues vc
      INNER JOIN verbes v ON v.id = vc.verbe_id
      INNER JOIN temps t ON t.id = vc.temp_id
      INNER JOIN modes m ON m.id = t.mode_id
      WHERE v.infinitif = 'être' AND t.isTempsCompose = 0 AND vc.conjugaison1 <> ''
    `),
  ])
  const use = uses[0]
  if (!use) throw createError({ statusCode: 404, statusMessage: 'Verbe introuvable' })

  const generated = sourceRows
    .filter((row) => {
      const allowed = parseAllowedPeople(row.personnes_autorisees ?? null)
      return allowed === null || allowed.includes(Number(row.personne_id))
    })
    .map(row => ({ ...generatePronominalRow(row, auxiliaryRows), pronom: row.pronom } as PublicPronominalRow))

  return {
    verb: {
      id,
      infinitif: use.infinitif_pronominal,
      participePresent: pronominalParticiple(use.participe_present, use.type_h_initial),
      participePasse: use.participe_passe,
      auxiliaire: 'être',
      groupeConjugaison: use.groupe_conjugaison ? Number(use.groupe_conjugaison) as 1 | 2 | 3 : null,
      estImpersonnel: Boolean(use.est_impersonnel),
      estDefectif: Boolean(use.est_defectif),
      typePronominal: use.type_emploi === 'essentiel' ? 'essentiel' : 'occasionnel',
    },
    conjugations: publicConjugations(generated),
  }
})

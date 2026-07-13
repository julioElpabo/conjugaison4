import type { RowDataPacket } from 'mysql2/promise'
import { resolveChallengePresets } from '../../shared/data/challenge-presets'
import type { Verb } from '../../shared/types/conjugation'
import { useDatabase } from '../utils/database'

interface VerbeRow extends RowDataPacket {
  id: number
  infinitif: string
  participe_present: string
  participe_passe: string
  auxiliaire: string
  groupe_conjugaison: 1 | 2 | 3 | null
  famille_conjugaison: string | null
  terminaison_infinitif: string | null
  type_pronominal: Verb['typePronominal']
  est_impersonnel: number
  est_defectif: number
  personnes_disponibles: string | number[] | null
  type_h_initial: Verb['typeHInitial']
  niveau_difficulte: number | null
  niveau_cecrl: string | null
  rang_frequence: number | null
  registre_principal: string | null
  forme_canonique: string | null
  statut_validation: Verb['statutValidation']
  particularites: string | string[] | null
  niveaux_scolaires: string | string[] | null
  parcours_cif: string | string[] | null
}

interface SemanticRow extends RowDataPacket { verbe_id: number, slug: string, sort_order: number }

interface ModeRow extends RowDataPacket {
  id: number
  name: string
  sort_order: number
}

interface TempsRow extends RowDataPacket {
  id: number
  mode_id: number
  name: string
  is_compound: number
  selected: number
}

export async function getCatalogue() {
  const database = useDatabase()
  const [verbesResult, modesResult, tempsResult, semanticResult] = await Promise.all([
    database.execute<VerbeRow[]>(`
      SELECT v.id, v.infinitif,
             \`participe_présent\` AS participe_present,
             \`participe_passé\` AS participe_passe,
             v.auxiliaire, v.groupe_conjugaison, f.slug AS famille_conjugaison,
             v.terminaison_infinitif, v.type_pronominal, v.est_impersonnel, v.est_defectif,
             v.personnes_disponibles, v.type_h_initial, v.niveau_difficulte, v.niveau_cecrl,
             v.rang_frequence, v.registre_principal, v.forme_canonique, v.statut_validation,
             v.particularites, v.niveaux_scolaires, v.parcours_cif
      FROM verbes v
      LEFT JOIN familles_conjugaison f ON f.id = v.famille_conjugaison_id
      ORDER BY COALESCE(v.forme_canonique, v.infinitif), v.id
    `),
    database.execute<ModeRow[]>(`
      SELECT id, name, \`order\` AS sort_order
      FROM modes
      ORDER BY \`order\`, id
    `),
    database.execute<TempsRow[]>(`
      SELECT id, mode_id, name,
             isTempsCompose AS is_compound,
             selected
      FROM temps
      ORDER BY mode_id, id
    `),
    database.execute<SemanticRow[]>(`
      SELECT DISTINCT vs.verbe_id, cs.slug, cs.sort_order
      FROM verbe_sens vs
      INNER JOIN verbe_sens_categories vsc ON vsc.sens_id = vs.id
      INNER JOIN categories_semantiques cs ON cs.id = vsc.categorie_id
      ORDER BY vs.verbe_id, cs.sort_order, cs.slug
    `),
  ])

  const parseArray = <T>(value: string | T[] | null): T[] => {
    if (Array.isArray(value)) return value
    if (!value) return []
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  const semanticsByVerb = new Map<number, string[]>()
  for (const row of semanticResult[0]) {
    const categories = semanticsByVerb.get(Number(row.verbe_id)) ?? []
    categories.push(row.slug)
    semanticsByVerb.set(Number(row.verbe_id), categories)
  }

  const verbs: Verb[] = verbesResult[0].map(row => ({
      id: Number(row.id),
      infinitif: row.infinitif,
      participePresent: row.participe_present,
      participePasse: row.participe_passe,
      auxiliaire: row.auxiliaire,
      groupeConjugaison: row.groupe_conjugaison ? Number(row.groupe_conjugaison) as 1 | 2 | 3 : null,
      familleConjugaison: row.famille_conjugaison,
      terminaison: row.terminaison_infinitif,
      typePronominal: row.type_pronominal || 'aucun',
      estImpersonnel: Boolean(row.est_impersonnel),
      estDefectif: Boolean(row.est_defectif),
      personnesDisponibles: parseArray<number>(row.personnes_disponibles),
      typeHInitial: row.type_h_initial,
      niveauDifficulte: row.niveau_difficulte === null ? null : Number(row.niveau_difficulte),
      niveauCecrl: row.niveau_cecrl,
      rangFrequence: row.rang_frequence === null ? null : Number(row.rang_frequence),
      registrePrincipal: row.registre_principal,
      formeCanonique: row.forme_canonique || row.infinitif,
      statutValidation: row.statut_validation || 'genere',
      particularites: parseArray<string>(row.particularites),
      niveauxScolaires: parseArray<string>(row.niveaux_scolaires),
      parcoursCif: parseArray<string>(row.parcours_cif),
      categoriesSemantiques: semanticsByVerb.get(Number(row.id)) ?? [],
    }))

  return {
    verbes: verbs,
    modes: modesResult[0].map(row => ({
      id: Number(row.id),
      name: row.name,
      order: Number(row.sort_order)
    })),
    temps: tempsResult[0].map(row => ({
      id: Number(row.id),
      modeId: Number(row.mode_id),
      name: row.name,
      isCompound: Boolean(row.is_compound),
      selected: Boolean(row.selected)
    })),
    presets: resolveChallengePresets(verbs),
  }
}

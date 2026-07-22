import type { RowDataPacket } from 'mysql2/promise'
import { resolveChallengePresets } from '../../shared/data/challenge-presets'
import type { Verb } from '../../shared/types/conjugation'
import { encodePronominalSelectionId } from '../../shared/utils/pronominal-selection'
import { useDatabase } from '../utils/database'
import { buildTenseExamples, type MangerFormForExample } from './tense-examples'
import { indirectRelative } from './indirect-relative'
import { grammarModeCode, grammarTenseCode, type GrammarModeCode, type GrammarTenseCode } from '../../shared/utils/grammar-codes'
import { normalizeLocale, type AppLocale } from '../../shared/i18n/locales'
import { listStoredChallengePresets } from './challenge-presets'

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
  pronominalisable: number
}

interface SemanticRow extends RowDataPacket { verbe_id: number, slug: string, sort_order: number }
interface MeaningRow extends RowDataPacket {
  verbe_id: number
  intitule: string
  definition: string | null
  est_principal: number
  numero_sens: number
}
interface ComplementExampleRow extends RowDataPacket {
  verbe_id: number
  fonction_objet: 'cod' | 'coi'
  preposition: string | null
  texte: string
  texte_antepose: string | null
  genre: string | null
  nombre: string | null
}
interface PronominalUseRow extends RowDataPacket {
  id: number
  verbe_id: number
  infinitif_pronominal: string
  type_emploi: string
  fonction_pronom: string
  regle_accord: string
  preposition: string | null
  statut_validation: string
}

interface ModeRow extends RowDataPacket {
  id: number
  code: GrammarModeCode | null
  name: string
  sort_order: number
}

interface TempsRow extends RowDataPacket {
  id: number
  mode_id: number
  code: GrammarTenseCode | null
  name: string
  is_compound: number
  selected: number
}

interface MangerExampleRow extends RowDataPacket, MangerFormForExample {}

export async function getCatalogue(locale: AppLocale = 'fr') {
  const database = useDatabase()
  const requestedLocale = normalizeLocale(locale, 'fr')
  const [verbesResult, modesResult, tempsResult, semanticResult, meaningResult, pronominalResult, complementResult, mangerExamplesResult] = await Promise.all([
    database.execute<VerbeRow[]>(`
      SELECT v.id, v.infinitif,
             \`participe_présent\` AS participe_present,
             \`participe_passé\` AS participe_passe,
             v.auxiliaire, v.groupe_conjugaison, f.slug AS famille_conjugaison,
             v.terminaison_infinitif, v.type_pronominal, v.est_impersonnel, v.est_defectif,
             v.personnes_disponibles, v.type_h_initial, v.niveau_difficulte, v.niveau_cecrl,
             v.rang_frequence, v.registre_principal, v.forme_canonique, v.statut_validation,
             v.particularites, v.niveaux_scolaires, v.parcours_cif,
             v.pronominalisable
      FROM verbes v
      LEFT JOIN familles_conjugaison f ON f.id = v.famille_conjugaison_id
      WHERE v.est_archive = 0
      ORDER BY COALESCE(v.forme_canonique, v.infinitif), v.id
    `),
    database.execute<ModeRow[]>(`
      SELECT id, code, name, \`order\` AS sort_order
      FROM modes
      ORDER BY \`order\`, id
    `),
    database.execute<TempsRow[]>(`
      SELECT id, mode_id, code, name,
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
    database.execute<MeaningRow[]>(`
      SELECT vs.verbe_id,
             CASE WHEN ?='fr' THEN vs.intitule
               ELSE COALESCE(requested.intitule, french.intitule, vs.intitule) END AS intitule,
             CASE WHEN ?='fr' THEN vs.definition
               ELSE COALESCE(requested.definition, french.definition, vs.definition) END AS definition,
             vs.est_principal, vs.numero_sens
      FROM verbe_sens vs
      LEFT JOIN verbe_sens_translations requested
        ON requested.sens_id=vs.id AND requested.locale=?
      LEFT JOIN verbe_sens_translations french
        ON french.sens_id=vs.id AND french.locale='fr'
      ORDER BY vs.verbe_id, vs.est_principal DESC, vs.numero_sens, vs.sort_order, vs.id
    `, [requestedLocale, requestedLocale, requestedLocale]),
    database.execute<PronominalUseRow[]>(`
      SELECT id, verbe_id, infinitif_pronominal, type_emploi, fonction_pronom,
             regle_accord, preposition, statut_validation
      FROM emplois_pronominaux
      WHERE actif=1 AND verbe_id IS NOT NULL
      ORDER BY infinitif_pronominal, id
    `),
    database.execute<ComplementExampleRow[]>(`
      SELECT vs.verbe_id, cv.fonction_objet, cv.preposition, c.texte, c.texte_antepose,
             c.genre, c.nombre
      FROM verbe_sens vs
      INNER JOIN constructions_verbales cv ON cv.sens_id=vs.id
      INNER JOIN complements_verbaux c ON c.construction_id=cv.id
      INNER JOIN verbes v ON v.id=vs.verbe_id
      WHERE v.est_archive=0 AND cv.actif=1 AND cv.statut_validation='valide'
        AND c.actif=1 AND c.statut_validation='valide'
        AND cv.fonction_objet IN ('cod', 'coi')
      ORDER BY vs.verbe_id,
        (cv.fonction_objet='cod' AND c.texte_antepose IS NOT NULL) DESC,
        cv.id, c.id
    `),
    database.execute<MangerExampleRow[]>(`
      SELECT vc.temp_id, p.pronom, vc.conjugaison1, m.name AS mode_name
      FROM verbesconjugues vc
      INNER JOIN verbes v ON v.id=vc.verbe_id
      INNER JOIN personnes p ON p.id=vc.personne_id
      INNER JOIN temps t ON t.id=vc.temp_id
      INNER JOIN modes m ON m.id=t.mode_id
      WHERE v.infinitif='manger' AND vc.conjugaison1 <> ''
      ORDER BY vc.temp_id, p.id
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
  const meaningByVerb = new Map<number, string>()
  for (const row of meaningResult[0]) {
    const verbId = Number(row.verbe_id)
    if (meaningByVerb.has(verbId)) continue
    const definition = row.definition?.trim()
    const genericTitle = /^sens principal de\s+[«"']?/iu.test(row.intitule.trim())
    const meaning = definition || (genericTitle ? '' : row.intitule.trim())
    if (meaning) meaningByVerb.set(verbId, meaning)
  }
  const complementByVerb = new Map<number, Verb['complementExample']>()
  const complementFunctionsByVerb = new Map<number, Set<'cod' | 'coi'>>()
  const anteposableComplementFunctionsByVerb = new Map<number, Set<'cod' | 'coi'>>()
  for (const row of complementResult[0]) {
    const verbId = Number(row.verbe_id)
    const functions = complementFunctionsByVerb.get(verbId) ?? new Set<'cod' | 'coi'>()
    functions.add(row.fonction_objet)
    complementFunctionsByVerb.set(verbId, functions)
    const anteposable = anteposableComplementFunctionsByVerb.get(verbId) ?? new Set<'cod' | 'coi'>()
    if ((row.fonction_objet === 'cod' && row.texte_antepose)
      || (row.fonction_objet === 'coi'
        && indirectRelative(row.texte, row.preposition, row.genre, row.nombre))) {
      anteposable.add(row.fonction_objet)
    }
    anteposableComplementFunctionsByVerb.set(verbId, anteposable)
    if (!complementByVerb.has(verbId)) {
      complementByVerb.set(verbId, {
        functionObject: row.fonction_objet,
        after: row.texte,
        before: row.texte_antepose,
      })
    }
  }

  const verbs: Verb[] = verbesResult[0].map(row => ({
      id: Number(row.id),
      infinitif: row.infinitif,
      meaning: meaningByVerb.get(Number(row.id)) ?? null,
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
      pronominalisable: Boolean(row.pronominalisable),
      isPronominalForm: /^(s['’]|se\s)/iu.test(row.infinitif),
      baseVerbId: null,
      pronominalUseId: null,
      pronominalType: null,
      pronounFunction: null,
      agreementRule: null,
      requiredPreposition: null,
      complementExample: complementByVerb.get(Number(row.id)) ?? null,
      complementFunctions: [...(complementFunctionsByVerb.get(Number(row.id)) ?? [])],
      anteposableComplementFunctions: [...(anteposableComplementFunctionsByVerb.get(Number(row.id)) ?? [])],
    }))

  const byId = new Map(verbs.map(verb => [verb.id, verb]))
  const virtualPronominals: Verb[] = pronominalResult[0].flatMap((use) => {
    const base = byId.get(Number(use.verbe_id))
    if (!base) return []
    const pronominalParticiple = (base.participePresent || '')
      .split('-')
      .map(form => form.trim())
      .filter(Boolean)
      .map((form) => {
        const first = form.normalize('NFD').replace(/\p{Diacritic}/gu, '').charAt(0).toLowerCase()
        const elide = 'aeiouy'.includes(first) || (first === 'h' && base.typeHInitial !== 'aspire')
        return `${elide ? "s'" : 'se '}${form}`
      })
      .join('-')
    return [{
      ...base,
      id: encodePronominalSelectionId(Number(use.id)),
      infinitif: use.infinitif_pronominal,
      participePresent: pronominalParticiple,
      auxiliaire: 'être',
      typePronominal: use.type_emploi === 'essentiel' ? 'essentiel' : 'occasionnel',
      particularites: [...new Set([...base.particularites, 'pronominal'])],
      pronominalisable: true,
      isPronominalForm: true,
      baseVerbId: base.id,
      pronominalUseId: Number(use.id),
      pronominalType: use.type_emploi,
      pronounFunction: use.fonction_pronom,
      agreementRule: use.regle_accord,
      requiredPreposition: use.preposition,
      complementExample: null,
    }]
  })
  const catalogueVerbs = [...verbs, ...virtualPronominals]
    .sort((left, right) => left.infinitif.localeCompare(right.infinitif, 'fr') || left.id - right.id)
  const modeNameById = new Map(modesResult[0].map(mode => [Number(mode.id), mode.name]))
  const tenseExamples = buildTenseExamples(
    tempsResult[0].map(tense => ({
      id: Number(tense.id),
      mode: modeNameById.get(Number(tense.mode_id)) ?? '',
      name: tense.name,
    })),
    mangerExamplesResult[0],
  )

  let presets
  try {
    presets = await listStoredChallengePresets(database, catalogueVerbs, true)
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : null
    if (code !== 'ER_NO_SUCH_TABLE') throw error
    presets = resolveChallengePresets(catalogueVerbs)
  }

  return {
    verbes: catalogueVerbs,
    modes: modesResult[0].map(row => ({
      id: Number(row.id),
      code: row.code || grammarModeCode(row.name) || 'indicative',
      name: row.name,
      order: Number(row.sort_order)
    })),
    temps: tempsResult[0].map(row => ({
      id: Number(row.id),
      modeId: Number(row.mode_id),
      code: row.code || grammarTenseCode(row.name) || 'present',
      name: row.name,
      isCompound: Boolean(row.is_compound),
      selected: Boolean(row.selected),
      example: tenseExamples.get(Number(row.id))
    })),
    presets,
  }
}

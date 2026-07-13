import type { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise'
import {
  canonicalInfinitives,
  cifVerbSeeds,
  difficultVerbSeeds,
  rareVerbSeeds,
  schoolVerbSeeds,
  semanticVerbSeeds,
} from '../../shared/data/verb-classification-seeds'

type DatabaseConnection = Pool | PoolConnection
interface VerbRow extends RowDataPacket { infinitif: string, participe_present: string }
interface CountRow extends RowDataPacket { count: number }
interface IdRow extends RowDataPacket { id: number }

const normalize = (value: string) => value.trim().toLocaleLowerCase('fr').normalize('NFC')
const searchable = (value: string) => normalize(value).normalize('NFD').replace(/\p{Diacritic}/gu, '')
const bare = (value: string) => normalize(value).replace(/^se\s+/u, '').replace(/^s['’]/u, '')

function ending(value: string) {
  if (value.endsWith('oir')) return 'oir'
  if (value.endsWith('er')) return 'er'
  if (value.endsWith('ir')) return 'ir'
  if (value.endsWith('re')) return 're'
  return 'autre'
}

function family(value: string, group: number) {
  if (group === 1) {
    if (value.endsWith('ger')) return 'ger'
    if (value.endsWith('cer')) return 'cer'
    if (value.endsWith('yer')) return 'yer'
    if (/(eler|eter)$/u.test(value)) return 'eler-eter'
    if (/[éèe][^aeiouy]{0,2}er$/u.test(value)) return 'er-alternance'
    return 'er-regulier'
  }
  if (group === 2) return 'ir-issant'
  if (/(venir|tenir)$/u.test(value)) return 'venir-tenir'
  if (value.endsWith('prendre')) return 'prendre'
  if (/(mettre|battre)$/u.test(value)) return 'mettre-battre'
  if (/(voir|cevoir)$/u.test(value)) return 'voir-recevoir'
  if (/(ouvrir|offrir|souffrir|cueillir)$/u.test(value)) return 'ouvrir-cueillir'
  if (/(dre|tre)$/u.test(value)) return 'dre-tre'
  if (value.endsWith('oir')) return 'troisieme-oir'
  if (value.endsWith('ir')) return 'troisieme-ir'
  return 'irregulier'
}

export async function refreshVerbMetadata(database: DatabaseConnection, verbId: number) {
  const [[verb], [personRows], [alternativeRows], [allInfinitives]] = await Promise.all([
    database.execute<VerbRow[]>('SELECT infinitif, `participe_présent` AS participe_present FROM verbes WHERE id = ?', [verbId]),
    database.execute<IdRow[]>(`SELECT DISTINCT vc.personne_id AS id FROM verbesconjugues vc INNER JOIN temps t ON t.id=vc.temp_id INNER JOIN modes m ON m.id=t.mode_id WHERE vc.verbe_id=? AND m.name='indicatif' AND t.name='présent' AND vc.conjugaison1<>''`, [verbId]),
    database.execute<CountRow[]>("SELECT COUNT(*) AS count FROM verbesconjugues WHERE verbe_id=? AND (conjugaison2<>'' OR conjugaison3<>'')", [verbId]),
    database.execute<VerbRow[]>('SELECT infinitif, `participe_présent` AS participe_present FROM verbes'),
  ])
  if (!verb[0]) return

  const infinitive = normalize(verb[0].infinitif)
  const base = bare(infinitive)
  const isPronominal = base !== infinitive
  const group = base.endsWith('er') && base !== 'aller' ? 1
    : base.endsWith('ir') && searchable(verb[0].participe_present).replace(/^se\s+|^s['’]/u, '').endsWith('issant') ? 2 : 3
  const familySlug = family(base, group)
  const [familyRows] = await database.execute<IdRow[]>('SELECT id FROM familles_conjugaison WHERE slug=?', [familySlug])
  const infinitiveSet = new Set(allInfinitives.map(row => normalize(row.infinitif)))
  const levels = Object.entries(schoolVerbSeeds).filter(([, names]) => names.includes(infinitive)).map(([level]) => level)
  const cif = Object.entries(cifVerbSeeds).filter(([, names]) => names.includes(infinitive)).map(([level]) => level)
  const features: string[] = []
  if (base.endsWith('ger')) features.push('ger')
  if (base.endsWith('cer')) features.push('cer')
  if (isPronominal) features.push('pronominal')
  if (Number(alternativeRows[0]?.count)) features.push('formes-alternatives')
  if (personRows.length > 0 && personRows.length < 6) features.push('defectif')
  if (['descendre', 'entrer', 'monter', 'passer', 'rentrer', 'retourner', 'sortir'].includes(base)) features.push('auxiliaire-variable')
  const hard = difficultVerbSeeds.includes(infinitive as never)
  const typePronominal = !isPronominal ? 'aucun' : infinitiveSet.has(base) ? 'occasionnel' : 'essentiel'
  const canonical = canonicalInfinitives[infinitive] ?? infinitive
  const cefr = levels.some(level => ['5P', '6P'].includes(level)) ? 'A1'
    : levels.some(level => ['7H', '8H'].includes(level)) ? 'A2'
      : levels.includes('9H') ? 'B1' : levels.length ? 'B2' : null

  await database.execute(`UPDATE verbes SET groupe_conjugaison=?, famille_conjugaison_id=?, terminaison_infinitif=?, type_pronominal=?,
    est_impersonnel=?, est_defectif=?, personnes_disponibles=?, type_h_initial=?, niveau_difficulte=?, niveau_cecrl=?,
    registre_principal=?, forme_canonique=?, statut_validation=?, particularites=?, niveaux_scolaires=?, parcours_cif=? WHERE id=?`, [
    group, familyRows[0]?.id ?? null, ending(base), typePronominal, ['falloir', 'pleuvoir'].includes(base) ? 1 : 0,
    personRows.length > 0 && personRows.length < 6 ? 1 : 0, JSON.stringify(personRows.map(row => Number(row.id)).sort((a, b) => a - b)),
    base.startsWith('h') ? (base === 'haïr' ? 'aspire' : 'muet') : null,
    hard ? 3 : (group === 3 || features.length ? 2 : 1), cefr,
    rareVerbSeeds.includes(infinitive as never) ? 'rare' : 'courant', canonical, canonical === infinitive ? 'genere' : 'a_verifier',
    JSON.stringify(features), JSON.stringify(levels), JSON.stringify(cif), verbId,
  ])

  const semanticSlugs = Object.entries(semanticVerbSeeds)
    .filter(([, names]) => names.includes(infinitive) || names.includes(base))
    .map(([slug]) => slug)
  if (!semanticSlugs.length) semanticSlugs.push('action-processus')
  const [senseRows] = await database.execute<IdRow[]>('SELECT id FROM verbe_sens WHERE verbe_id=? ORDER BY numero_sens LIMIT 1', [verbId])
  let senseId = Number(senseRows[0]?.id)
  if (!senseId) {
    const [result] = await database.execute(`INSERT INTO verbe_sens (verbe_id, numero_sens, intitule, est_pronominal, est_principal, sort_order) VALUES (?,1,?,?,1,1)`, [verbId, `Sens principal de « ${canonical} »`, isPronominal ? 1 : 0])
    if ('insertId' in result) senseId = Number(result.insertId)
  }
  for (const slug of semanticSlugs) {
    await database.execute(`INSERT IGNORE INTO verbe_sens_categories (sens_id, categorie_id) SELECT ?, id FROM categories_semantiques WHERE slug=?`, [senseId, slug])
  }
}

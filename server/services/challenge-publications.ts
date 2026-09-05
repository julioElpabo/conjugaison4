
import { withDutchVariants } from '../../shared/i18n/dutch-variants'
import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { SUPPORTED_LOCALES, type AppLocale } from '../../shared/i18n/locales'
import type {
  AdminChallengePublication,
  ChallengePublicationAlternate,
  ChallengePublicationInput,
  ChallengePublicationPage,
  ChallengePublicationResolution,
  ChallengePublicationSummary,
} from '../../shared/types/challenge-publication'
import { getCatalogue } from './catalogue'

type Executor = Pool | PoolConnection

interface PublicationRow extends RowDataPacket {
  id: number
  presetId: number
  presetKey: string
  locale: string
  slug: string | null
  title: string
  metaTitle: string
  description: string
  metaDescription: string
  isPublished: number
  isIndexable: number
  categorySlug: string
  categoryName: string
  createdAt: Date | string
  updatedAt: Date | string
}

interface TranslationRow extends RowDataPacket {
  presetId: number
  locale: string
  slug: string
  isPublished: number
  isIndexable: number
}

interface RedirectRow extends RowDataPacket {
  publicationId: number
  locale: string
  slug: string
}

interface PresetRow extends RowDataPacket { id: number }

export class ChallengePublicationInputError extends Error {}
export class ChallengePublicationConflictError extends Error {}
export class ChallengePublicationNotFoundError extends Error {}

const PAYLOAD_KEYS = new Set([
  'slug', 'title', 'metaTitle', 'description', 'metaDescription', 'isPublished', 'isIndexable',
])

const PUBLIC_CATEGORY_NAMES: Record<string, Record<AppLocale, string>> = {
  school: withDutchVariants({
    fr: 'Niveaux scolaires suisses', de: 'Schweizer Schulstufen', en: 'Swiss school levels',
    it: 'Livelli scolastici svizzeri', es: 'Niveles escolares suizos', nl: "Zwitserse schoolniveaus",
  }),
  'school-france': withDutchVariants({
    fr: 'Niveaux scolaires français', de: 'Französische Schulstufen', en: 'French school levels',
    it: 'Livelli scolastici francesi', es: 'Niveles escolares franceses', nl: "Franse schoolniveaus",
  }),
  cif: withDutchVariants({
    fr: 'Conjugaison FLE (français langue étrangère)', de: 'FLE-Konjugation (Französisch als Fremdsprache)',
    en: 'FLE conjugation (French as a foreign language)', it: 'Coniugazione FLE (francese lingua straniera)',
    es: 'Conjugación FLE (francés como lengua extranjera)', nl: "Vervoeging voor anderstaligen (FLE)",
  }),
  'verb-group': withDutchVariants({
    fr: 'Groupes de verbes', de: 'Verbgruppen', en: 'Verb groups',
    it: 'Gruppi verbali', es: 'Grupos verbales', nl: "Werkwoordgroepen",
  }),
  spelling: withDutchVariants({
    fr: 'Difficultés particulières', de: 'Besondere Schwierigkeiten', en: 'Special difficulties',
    it: 'Difficoltà particolari', es: 'Dificultades particulares', nl: "Bijzondere moeilijkheden",
  }),
  semantic: withDutchVariants({
    fr: 'Sens des verbes', de: 'Bedeutung der Verben', en: 'Verb meanings',
    it: 'Significato dei verbi', es: 'Significado de los verbos', nl: "Betekenissen van werkwoorden",
  }),
}

export function publicChallengeCategoryName(categorySlug: string, locale: AppLocale, fallback: string) {
  return PUBLIC_CATEGORY_NAMES[categorySlug]?.[locale] ?? fallback
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ChallengePublicationInputError('Publication invalide.')
  }
  const body = value as Record<string, unknown>
  const unexpected = Object.keys(body).filter(key => !PAYLOAD_KEYS.has(key))
  if (unexpected.length) throw new ChallengePublicationInputError(`Champs inconnus : ${unexpected.join(', ')}.`)
  return body
}

function inputText(value: unknown, label: string, maximum: number) {
  if (typeof value !== 'string') throw new ChallengePublicationInputError(`${label} doit être du texte.`)
  const normalized = value.trim()
  if (normalized.length > maximum) {
    throw new ChallengePublicationInputError(`${label} ne peut pas dépasser ${maximum} caractères.`)
  }
  return normalized
}

function inputBoolean(value: unknown, label: string) {
  if (typeof value !== 'boolean') throw new ChallengePublicationInputError(`${label} doit être un booléen.`)
  return value
}

export function parsePublicationLocale(value: unknown): AppLocale {
  if (typeof value !== 'string' || !SUPPORTED_LOCALES.includes(value as AppLocale)) {
    throw new ChallengePublicationInputError('Langue de publication invalide.')
  }
  return value as AppLocale
}

export function normalizeChallengePublicationSlug(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim().toLocaleLowerCase('fr')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
    .slice(0, 120)
    .replace(/-+$/gu, '')
}

export function parseChallengePublicationPayload(value: unknown): ChallengePublicationInput {
  const body = record(value)
  const rawSlug = inputText(body.slug ?? '', 'Le slug', 160)
  const slug = normalizeChallengePublicationSlug(rawSlug) || null
  const title = inputText(body.title, 'Le titre', 180)
  const metaTitle = inputText(body.metaTitle, 'Le titre SEO', 180)
  const description = inputText(body.description, 'La description', 2_000)
  const metaDescription = inputText(body.metaDescription, 'La meta description', 320)
  const isPublished = inputBoolean(body.isPublished, 'Publié')
  // La colonne is_indexable reste en base pour assurer la compatibilité avec
  // les données existantes, mais publier une page implique désormais son indexation.
  const isIndexable = isPublished
  if (isPublished && (!slug || !title || !metaTitle || !description || !metaDescription)) {
    throw new ChallengePublicationInputError('Un slug, un titre, un titre SEO, une description et une meta description sont obligatoires pour publier.')
  }
  return { slug, title, metaTitle, description, metaDescription, isPublished, isIndexable }
}

export function groupChallengePublicationAlternates(rows: readonly {
  locale: string
  slug: string | null
  isPublished: boolean | number
}[]): ChallengePublicationAlternate[] {
  return rows.flatMap((row) => {
    if (!row.slug || !row.isPublished) return []
    const locale = parsePublicationLocale(row.locale)
    return [{ locale, path: `/${locale}/defis/${row.slug}` }]
  })
}

function isoDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

function adminPublication(row: PublicationRow): AdminChallengePublication {
  return {
    id: Number(row.id), presetId: Number(row.presetId), locale: parsePublicationLocale(row.locale),
    slug: row.slug || '', title: row.title, metaTitle: row.metaTitle,
    description: row.description, metaDescription: row.metaDescription,
    isPublished: Boolean(row.isPublished), isIndexable: Boolean(row.isPublished),
    createdAt: isoDate(row.createdAt), updatedAt: isoDate(row.updatedAt),
  }
}

const PUBLICATION_SELECT = `SELECT publication.id,publication.preset_id AS presetId,
  preset.preset_key AS presetKey,publication.locale,publication.slug,publication.title,
  publication.meta_title AS metaTitle,publication.description,
  publication.meta_description AS metaDescription,publication.is_published AS isPublished,
  publication.is_indexable AS isIndexable,category.slug AS categorySlug,
  category.name AS categoryName,publication.created_at AS createdAt,
  publication.updated_at AS updatedAt
  FROM challenge_preset_publications publication
  INNER JOIN challenge_presets preset ON preset.id=publication.preset_id
  INNER JOIN challenge_preset_categories category ON category.id=preset.category_id`

export async function listAdminChallengePublications(executor: Executor, presetId: number) {
  const [rows] = await executor.execute<PublicationRow[]>(`${PUBLICATION_SELECT}
    WHERE publication.preset_id=? ORDER BY FIELD(publication.locale,'fr','de','en','it','es','nl','nl-NL')`, [presetId])
  return rows.map(adminPublication)
}

async function assertPresetExists(executor: Executor, presetId: number) {
  const [rows] = await executor.execute<PresetRow[]>('SELECT id FROM challenge_presets WHERE id=? LIMIT 1', [presetId])
  if (!rows.length) throw new ChallengePublicationNotFoundError('Défi officiel introuvable.')
}

export async function saveChallengePublication(
  connection: PoolConnection,
  presetId: number,
  locale: AppLocale,
  input: ChallengePublicationInput,
) {
  await assertPresetExists(connection, presetId)
  const [currentRows] = await connection.execute<PublicationRow[]>(`${PUBLICATION_SELECT}
    WHERE publication.preset_id=? AND publication.locale=? FOR UPDATE`, [presetId, locale])
  const current = currentRows[0]

  if (input.slug) {
    const [redirects] = await connection.execute<RedirectRow[]>(`
      SELECT redirect.publication_id AS publicationId,redirect.locale,
             publication.slug
      FROM challenge_preset_publication_redirects redirect
      INNER JOIN challenge_preset_publications publication ON publication.id=redirect.publication_id
      WHERE redirect.locale=? AND redirect.old_slug=? FOR UPDATE
    `, [locale, input.slug])
    const redirect = redirects[0]
    if (redirect && Number(redirect.publicationId) !== Number(current?.id || 0)) {
      throw new ChallengePublicationConflictError('Ce slug est déjà utilisé comme ancienne adresse.')
    }
    if (redirect) {
      await connection.execute('DELETE FROM challenge_preset_publication_redirects WHERE publication_id=? AND locale=? AND old_slug=?', [current!.id, locale, input.slug])
    }
  }

  try {
    await connection.execute<ResultSetHeader>(`
      INSERT INTO challenge_preset_publications
        (preset_id,locale,slug,title,meta_title,description,meta_description,is_published,is_indexable)
      VALUES (?,?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE slug=VALUES(slug),title=VALUES(title),meta_title=VALUES(meta_title),
        description=VALUES(description),meta_description=VALUES(meta_description),
        is_published=VALUES(is_published),is_indexable=VALUES(is_indexable)
    `, [presetId, locale, input.slug, input.title, input.metaTitle, input.description,
      input.metaDescription, input.isPublished ? 1 : 0, input.isPublished ? 1 : 0])
  }
  catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      throw new ChallengePublicationConflictError('Ce slug est déjà utilisé dans cette langue.')
    }
    throw error
  }

  const [savedRows] = await connection.execute<PublicationRow[]>(`${PUBLICATION_SELECT}
    WHERE publication.preset_id=? AND publication.locale=? LIMIT 1`, [presetId, locale])
  const saved = savedRows[0]!
  if (current?.slug && current.isPublished && input.slug && current.slug !== input.slug) {
    await connection.execute(`INSERT INTO challenge_preset_publication_redirects
      (publication_id,locale,old_slug) VALUES (?,?,?)
      ON DUPLICATE KEY UPDATE publication_id=VALUES(publication_id)`, [saved.id, locale, current.slug])
  }
  return adminPublication(saved)
}

async function translationsForPreset(executor: Executor, presetId: number) {
  const [rows] = await executor.execute<TranslationRow[]>(`SELECT preset_id AS presetId,locale,slug,
    is_published AS isPublished,is_indexable AS isIndexable
    FROM challenge_preset_publications WHERE preset_id=? ORDER BY FIELD(locale,'fr','de','en','it','es','nl','nl-NL')`, [presetId])
  return groupChallengePublicationAlternates(rows)
}

export async function resolveChallengePublication(
  executor: Executor,
  locale: AppLocale,
  slug: string,
): Promise<ChallengePublicationResolution | null> {
  const [rows] = await executor.execute<PublicationRow[]>(`${PUBLICATION_SELECT}
    WHERE publication.locale=? AND publication.slug=? AND publication.is_published=1
      AND preset.is_active=1 AND category.is_active=1 LIMIT 1`, [locale, slug])
  const row = rows[0]
  if (row) {
    const catalogue = await getCatalogue(locale)
    const preset = catalogue.presets.find(candidate => candidate.id === row.presetKey)
    if (!preset) return null
    const translations = await translationsForPreset(executor, Number(row.presetId))
    const publication: ChallengePublicationPage = {
      id: Number(row.id), presetId: Number(row.presetId), presetKey: row.presetKey,
      locale, slug: row.slug!, title: row.title, metaTitle: row.metaTitle,
      description: row.description, metaDescription: row.metaDescription,
      isIndexable: Boolean(row.isPublished), updatedAt: isoDate(row.updatedAt),
      categorySlug: row.categorySlug,
      categoryName: publicChallengeCategoryName(row.categorySlug, locale, row.categoryName),
      translations,
      preset,
    }
    return { kind: 'publication', publication }
  }

  const [redirects] = await executor.execute<RedirectRow[]>(`
    SELECT redirect.publication_id AS publicationId,publication.locale,publication.slug
    FROM challenge_preset_publication_redirects redirect
    INNER JOIN challenge_preset_publications publication ON publication.id=redirect.publication_id
    INNER JOIN challenge_presets preset ON preset.id=publication.preset_id
    INNER JOIN challenge_preset_categories category ON category.id=preset.category_id
    WHERE redirect.locale=? AND redirect.old_slug=? AND publication.is_published=1
      AND publication.slug IS NOT NULL AND preset.is_active=1 AND category.is_active=1 LIMIT 1
  `, [locale, slug])
  const redirect = redirects[0]
  return redirect ? { kind: 'redirect', locale: parsePublicationLocale(redirect.locale), slug: redirect.slug } : null
}

export async function listPublicChallengePublications(executor: Executor, locale: AppLocale) {
  const [rows] = await executor.execute<PublicationRow[]>(`${PUBLICATION_SELECT}
    WHERE publication.locale=? AND publication.is_published=1
      AND publication.slug IS NOT NULL AND preset.is_active=1 AND category.is_active=1
    ORDER BY category.sort_order,preset.sort_order,publication.title`, [locale])
  return rows.map((row): ChallengePublicationSummary => ({
    id: Number(row.id), presetId: Number(row.presetId), presetKey: row.presetKey,
    locale, slug: row.slug!, title: row.title, description: row.description,
    categorySlug: row.categorySlug,
    categoryName: publicChallengeCategoryName(row.categorySlug, locale, row.categoryName),
  }))
}

export async function listPublishedChallengePublications(executor: Executor) {
  const [rows] = await executor.execute<PublicationRow[]>(`${PUBLICATION_SELECT}
    WHERE publication.is_published=1
      AND publication.slug IS NOT NULL AND preset.is_active=1 AND category.is_active=1
    ORDER BY publication.preset_id,FIELD(publication.locale,'fr','de','en','it','es','nl','nl-NL')`)
  return rows.map(row => ({
    presetId: Number(row.presetId), locale: parsePublicationLocale(row.locale), slug: row.slug!,
    updatedAt: isoDate(row.updatedAt),
  }))
}

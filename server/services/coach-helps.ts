import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import {
  COACH_EXPLANATION_APPROACHES,
  COACH_HELP_BLOCK_TYPES,
  type CoachExplanationApproach,
  type CoachHelpBlock,
  type CoachHelpBlockType,
  type CoachHelpTemplate,
} from '../../shared/types/coach'
import { normalizeLocale, type AppLocale } from '../../shared/i18n/locales'

type Executor = Pool | PoolConnection
type CoachHelpBlockInput = Omit<CoachHelpBlock, 'id' | 'children'> & { children: CoachHelpBlockInput[] }

interface HelpRow extends RowDataPacket {
  id: number
  name: string
  description: string
  headerTitle: string
  headerDescription: string
  status: CoachHelpTemplate['status']
}

interface BlockRow extends RowDataPacket {
  id: number
  helpId: number
  type: CoachHelpBlockType
  title: string
  content: string
  explanationApproach: CoachExplanationApproach
  isActive: number
  sortOrder: number
  childrenJson: string | null
}

const BLOCK_TYPE_SET = new Set<string>(COACH_HELP_BLOCK_TYPES)
const CONTEXTUAL_BASE_TOKEN = '{contextualBaseHelp}'
const NOUS_FORM_TOKEN = '{nousFormHelp}'
const REFERENCE_FORM_TOKEN = '{referenceFormHelp}'
const DEFINITION_TOKEN = '{definitionHelp}'

function automaticBlockTitle(content: string, title: string) {
  if (content.trim() === DEFINITION_TOKEN) return 'Définition'
  if (content.trim() === CONTEXTUAL_BASE_TOKEN) return 'Trouve le radical de {verb}'
  if (content.trim() === NOUS_FORM_TOKEN || content.trim() === REFERENCE_FORM_TOKEN) return 'Forme repère'
  return title
}

function text(value: unknown, maximum: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

export async function listCoachHelps(
  database: Executor,
  publishedOnly = false,
  locale: AppLocale = 'fr',
): Promise<CoachHelpTemplate[]> {
  if (publishedOnly) {
    const requestedLocale = normalizeLocale(locale, 'fr')
    const [publications] = await database.execute<(RowDataPacket & { payload: string })[]>(
      `SELECT payload FROM coach_help_publications_i18n
       WHERE locale IN (?,'fr')
       ORDER BY locale=? DESC, locale='fr' DESC LIMIT 1`,
      [requestedLocale, requestedLocale],
    )
    if (!publications[0]) {
      const [legacy] = await database.execute<(RowDataPacket & { payload: string })[]>(
        'SELECT payload FROM coach_help_publications WHERE id=1 LIMIT 1',
      )
      publications.push(...legacy)
    }
    if (!publications[0]) return []
    try {
      const parsed = JSON.parse(publications[0].payload) as CoachHelpTemplate[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  const [helps] = await database.execute<HelpRow[]>(`SELECT id,name,description,header_title AS headerTitle,
    header_description AS headerDescription,status FROM coach_help_templates
    WHERE deleted_at IS NULL ORDER BY name,id`)
  if (!helps.length) return []
  const ids = helps.map(help => help.id)
  const placeholders = ids.map(() => '?').join(',')
  const [blocks] = await database.execute<BlockRow[]>(`SELECT id,help_id AS helpId,block_type AS type,title,content,
    explanation_approach AS explanationApproach,is_active AS isActive,sort_order AS sortOrder,children_json AS childrenJson FROM coach_help_blocks
    WHERE help_id IN (${placeholders}) ORDER BY help_id,sort_order,id`, ids)
  return helps.map(help => ({
    ...help,
    blocks: blocks.filter(block => block.helpId === help.id).map(block => ({
      id: block.id,
      type: block.type,
      title: automaticBlockTitle(block.content, block.title),
      content: block.content,
      explanationApproach: block.explanationApproach,
      isActive: Boolean(block.isActive),
      sortOrder: block.sortOrder,
      children: parseStoredChildren(block.childrenJson),
    })),
  }))
}

export function parseCoachHelpPayload(value: unknown) {
  const body = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const profile = {
    name: text(body.name, 120),
    description: text(body.description, 500),
    headerTitle: '{helpTitle}',
    headerDescription: text(body.headerDescription, 2000),
    status: 'draft' as const,
  }
  let blockCount = 0
  const parseBlocks = (value: unknown, depth = 0): CoachHelpBlockInput[] => Array.isArray(value) ? value.map((raw, index) => {
    if (depth > 6 || ++blockCount > 200) throw createError({ statusCode: 400, statusMessage: 'Structure de l’aide trop complexe' })
    const item = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
    const type = text(item.type, 30)
    const content = text(item.content, 20000)
    const explanationApproach = text(item.explanationApproach, 40) || 'cif-falc'
    if (!BLOCK_TYPE_SET.has(type)) throw createError({ statusCode: 400, statusMessage: 'Type de bloc d’aide invalide' })
    if (!COACH_EXPLANATION_APPROACHES.includes(explanationApproach as CoachExplanationApproach)) throw createError({ statusCode: 400, statusMessage: 'Approche pédagogique invalide' })
    return {
      type: type as CoachHelpBlockType,
      title: automaticBlockTitle(content, text(item.title, 160)),
      content,
      explanationApproach: explanationApproach as CoachExplanationApproach,
      isActive: item.isActive !== false,
      sortOrder: index + 1,
      children: parseBlocks(item.children, depth + 1),
    }
  }) : []
  const blocks = parseBlocks(body.blocks)
  if (!profile.name) {
    throw createError({ statusCode: 400, statusMessage: 'Aide invalide' })
  }
  return { profile, blocks }
}

export async function replaceCoachHelpBlocks(connection: PoolConnection, helpId: number, blocks: CoachHelpBlockInput[]) {
  await connection.execute('DELETE FROM coach_help_blocks WHERE help_id=?', [helpId])
  for (const block of blocks) {
    await connection.execute<ResultSetHeader>(`INSERT INTO coach_help_blocks
      (help_id,block_type,title,content,explanation_approach,is_active,sort_order,children_json) VALUES (?,?,?,?,?,?,?,?)`,
      [helpId, block.type, block.title, block.content, block.explanationApproach, block.isActive ? 1 : 0, block.sortOrder, JSON.stringify(block.children)])
  }
}

function parseStoredChildren(value: string | null): CoachHelpBlock[] {
  if (!value) return []
  try {
    const children = JSON.parse(value) as Array<Partial<CoachHelpBlock>>
    if (!Array.isArray(children)) return []
    const normalize = (items: Array<Partial<CoachHelpBlock>>): CoachHelpBlock[] => items.map((item, index) => {
      const content = typeof item.content === 'string' ? item.content : ''
      return {
        id: Number(item.id) || 0,
        type: BLOCK_TYPE_SET.has(item.type || '') ? item.type as CoachHelpBlockType : 'normal',
        title: automaticBlockTitle(content, typeof item.title === 'string' ? item.title : ''),
        content,
        explanationApproach: COACH_EXPLANATION_APPROACHES.includes(item.explanationApproach as CoachExplanationApproach)
          ? item.explanationApproach as CoachExplanationApproach
          : 'cif-falc',
        isActive: item.isActive !== false,
        sortOrder: Number(item.sortOrder) || index + 1,
        children: Array.isArray(item.children) ? normalize(item.children) : [],
      }
    })
    return normalize(children)
  } catch {
    return []
  }
}

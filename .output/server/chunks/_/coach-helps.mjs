import { c as createError, n as normalizeLocale } from '../nitro/nitro.mjs';
import { b as COACH_EXPLANATION_APPROACHES, c as COACH_HELP_BLOCK_TYPES } from './coach.mjs';

const BLOCK_TYPE_SET = new Set(COACH_HELP_BLOCK_TYPES);
const CONTEXTUAL_BASE_TOKEN = "{contextualBaseHelp}";
const NOUS_FORM_TOKEN = "{nousFormHelp}";
const REFERENCE_FORM_TOKEN = "{referenceFormHelp}";
const DEFINITION_TOKEN = "{definitionHelp}";
function automaticBlockTitle(content, title) {
  if (content.trim() === DEFINITION_TOKEN) return "D\xE9finition";
  if (content.trim() === CONTEXTUAL_BASE_TOKEN) return "Trouve le radical de {verb}";
  if (content.trim() === NOUS_FORM_TOKEN || content.trim() === REFERENCE_FORM_TOKEN) return "Forme rep\xE8re";
  return title;
}
function text(value, maximum) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}
async function listCoachHelps(database, publishedOnly = false, locale = "fr") {
  if (publishedOnly) {
    const requestedLocale = normalizeLocale(locale, "fr");
    const [publications] = await database.execute(
      `SELECT payload FROM coach_help_publications_i18n
       WHERE locale IN (?,'fr')
       ORDER BY locale=? DESC, locale='fr' DESC LIMIT 1`,
      [requestedLocale, requestedLocale]
    );
    if (!publications[0]) {
      const [legacy] = await database.execute(
        "SELECT payload FROM coach_help_publications WHERE id=1 LIMIT 1"
      );
      publications.push(...legacy);
    }
    if (!publications[0]) return [];
    try {
      const parsed = JSON.parse(publications[0].payload);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  const [helps] = await database.execute(`SELECT id,name,description,header_title AS headerTitle,
    header_description AS headerDescription,status FROM coach_help_templates
    WHERE deleted_at IS NULL ORDER BY name,id`);
  if (!helps.length) return [];
  const ids = helps.map((help) => help.id);
  const placeholders = ids.map(() => "?").join(",");
  const [blocks] = await database.execute(`SELECT id,help_id AS helpId,block_type AS type,title,content,
    explanation_approach AS explanationApproach,is_active AS isActive,sort_order AS sortOrder,children_json AS childrenJson FROM coach_help_blocks
    WHERE help_id IN (${placeholders}) ORDER BY help_id,sort_order,id`, ids);
  return helps.map((help) => ({
    ...help,
    blocks: blocks.filter((block) => block.helpId === help.id).map((block) => ({
      id: block.id,
      type: block.type,
      title: automaticBlockTitle(block.content, block.title),
      content: block.content,
      explanationApproach: block.explanationApproach,
      isActive: Boolean(block.isActive),
      sortOrder: block.sortOrder,
      children: parseStoredChildren(block.childrenJson)
    }))
  }));
}
function parseCoachHelpPayload(value) {
  const body = value && typeof value === "object" ? value : {};
  const profile = {
    name: text(body.name, 120),
    description: text(body.description, 500),
    headerTitle: "{helpTitle}",
    headerDescription: text(body.headerDescription, 2e3),
    status: "draft"
  };
  let blockCount = 0;
  const parseBlocks = (value2, depth = 0) => Array.isArray(value2) ? value2.map((raw, index) => {
    if (depth > 6 || ++blockCount > 200) throw createError({ statusCode: 400, statusMessage: "Structure de l\u2019aide trop complexe" });
    const item = raw && typeof raw === "object" ? raw : {};
    const type = text(item.type, 30);
    const content = text(item.content, 2e4);
    const explanationApproach = text(item.explanationApproach, 40) || "cif-falc";
    if (!BLOCK_TYPE_SET.has(type)) throw createError({ statusCode: 400, statusMessage: "Type de bloc d\u2019aide invalide" });
    if (!COACH_EXPLANATION_APPROACHES.includes(explanationApproach)) throw createError({ statusCode: 400, statusMessage: "Approche p\xE9dagogique invalide" });
    return {
      type,
      title: automaticBlockTitle(content, text(item.title, 160)),
      content,
      explanationApproach,
      isActive: item.isActive !== false,
      sortOrder: index + 1,
      children: parseBlocks(item.children, depth + 1)
    };
  }) : [];
  const blocks = parseBlocks(body.blocks);
  if (!profile.name) {
    throw createError({ statusCode: 400, statusMessage: "Aide invalide" });
  }
  return { profile, blocks };
}
async function replaceCoachHelpBlocks(connection, helpId, blocks) {
  await connection.execute("DELETE FROM coach_help_blocks WHERE help_id=?", [helpId]);
  for (const block of blocks) {
    await connection.execute(
      `INSERT INTO coach_help_blocks
      (help_id,block_type,title,content,explanation_approach,is_active,sort_order,children_json) VALUES (?,?,?,?,?,?,?,?)`,
      [helpId, block.type, block.title, block.content, block.explanationApproach, block.isActive ? 1 : 0, block.sortOrder, JSON.stringify(block.children)]
    );
  }
}
function parseStoredChildren(value) {
  if (!value) return [];
  try {
    const children = JSON.parse(value);
    if (!Array.isArray(children)) return [];
    const normalize = (items) => items.map((item, index) => {
      const content = typeof item.content === "string" ? item.content : "";
      return {
        id: Number(item.id) || 0,
        type: BLOCK_TYPE_SET.has(item.type || "") ? item.type : "normal",
        title: automaticBlockTitle(content, typeof item.title === "string" ? item.title : ""),
        content,
        explanationApproach: COACH_EXPLANATION_APPROACHES.includes(item.explanationApproach) ? item.explanationApproach : "cif-falc",
        isActive: item.isActive !== false,
        sortOrder: Number(item.sortOrder) || index + 1,
        children: Array.isArray(item.children) ? normalize(item.children) : []
      };
    });
    return normalize(children);
  } catch {
    return [];
  }
}

export { listCoachHelps as l, parseCoachHelpPayload as p, replaceCoachHelpBlocks as r };
//# sourceMappingURL=coach-helps.mjs.map

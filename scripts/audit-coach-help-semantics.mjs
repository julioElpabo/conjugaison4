import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import mysql from 'mysql2/promise'
import { automaticOrthographyHelpBlocks, coachHelpQuestionVariables, renderCoachHelpContent } from '../shared/utils/coach-help.ts'
import { auditRenderedCoachHelp } from '../shared/utils/coach-help-audit.ts'
import { COACH_HELP_AUTOMATIC_AUDIT_VERSION } from '../shared/utils/coach-help-review.ts'
import { buildRadicalReference } from '../shared/utils/radical-reference.ts'
import { sanitizeCoachHtml } from '../shared/utils/safe-html.ts'

const REPORT_JSON = new URL('../reports/coach-help-semantic-audit.json', import.meta.url)
const REPORT_MARKDOWN = new URL('../reports/coach-help-semantic-audit.md', import.meta.url)
const AI_REVIEW_QUEUE = new URL('../reports/coach-help-ai-review-queue.json', import.meta.url)
const REVIEWED_CORRECTIONS = JSON.parse(await readFile(new URL('./data/coach-help-ai-reviewed-corrections.json', import.meta.url), 'utf8'))
const PERSON_INDEX = new Map([[4, 0], [5, 1], [6, 2], [7, 3], [8, 4], [9, 5]])
const persistReviews = process.argv.includes('--persist')
const helpIdArgument = process.argv.find(value => value.startsWith('--help-id='))
const helpId = Number.parseInt(helpIdArgument?.split('=')[1] || '1', 10)

function normalized(value = '') {
  return String(value).normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/’/gu, "'").replace(/\s+/gu, ' ').trim().toLocaleLowerCase('fr')
}

function parsedArray(value) {
  if (Array.isArray(value)) return value
  try { return value ? JSON.parse(value) : [] } catch { return [] }
}

function hash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function storedChildren(value) {
  const normalize = (items) => Array.isArray(items) ? items.map((item, index) => ({
    id: Number(item?.id) || 0,
    type: item?.type || 'normal',
    title: String(item?.title || ''),
    content: String(item?.content || ''),
    explanationApproach: item?.explanationApproach || 'cif-falc',
    isActive: item?.isActive !== false,
    sortOrder: Number(item?.sortOrder) || index + 1,
    children: normalize(item?.children),
  })) : []
  try { return normalize(value ? JSON.parse(value) : []) } catch { return [] }
}

function conjugatedCore(value = '') {
  return String(value)
    .trim()
    .replace(/[.!?…]+$/gu, '')
    .replace(/^(?:je|j['’]|tu|il|elle|on|nous|vous|ils|elles)\s+/iu, '')
    .replace(/^(?:me|te|se|nous|vous)\s+/iu, '')
    .replace(/^[mts]['’]/iu, '')
    .trim()
}

function decodeHtmlEntities(value = '') {
  return String(value)
    .replace(/&nbsp;/giu, ' ')
    .replace(/&#(?:0*39);|&#x0*27;|&apos;/giu, "'")
    .replace(/&quot;/giu, '"')
    .replace(/&amp;/giu, '&')
    .replace(/&lt;/giu, '<')
    .replace(/&gt;/giu, '>')
}

function renderedContainsForm(html, target) {
  const decoded = decodeHtmlEntities(html)
  const visible = decoded.replace(/<[^>]+>/gu, ' ').replace(/\s+/gu, ' ').trim()
  const joinedBadges = decoded.replace(/<[^>]+>/gu, '').replace(/\s+/gu, ' ').trim()
  return normalized(visible).includes(normalized(target)) || normalized(joinedBadges).includes(normalized(target))
}

function semanticIssue(code, severity, title, detail) {
  return { code, severity, title, detail, source: 'semantic-rules' }
}

function inferredAuxiliary(verb, form) {
  if (normalized(verb.auxiliaire) === 'etre') return 'être'
  const first = normalized(form).split(/\s+/u)[0]
  const etreForms = new Set(['suis', 'es', 'est', 'sommes', 'etes', 'sont', 'etais', 'etait', 'etions', 'etiez', 'etaient', 'serai', 'seras', 'sera', 'serons', 'serez', 'seront', 'fus', 'fut', 'fumes', 'futes', 'furent', 'sois', 'soit', 'soyons', 'soyez', 'soient', 'fusse', 'fusses', 'fut', 'fussions', 'fussiez', 'fussent'])
  return etreForms.has(first) ? 'être' : 'avoir'
}

function semanticAudit({ html, question, verb }) {
  const issues = []
  const text = decodeHtmlEntities(html).replace(/<[^>]+>/gu, ' ').replace(/\s+/gu, ' ').trim()
  const mode = normalized(question.mode)
  const tense = normalized(question.temps)
  const reference = question.radicalReference?.validated === false ? undefined : question.radicalReference
  const target = conjugatedCore(question.conjugaison1)
  const omissionCount = (normalized(text).match(/n'ecris pas le pronom sujet/gu) || []).length

  if (omissionCount > 1) {
    issues.push(semanticIssue('duplicate-pronoun-omission', 'error', 'Consigne répétée', 'La consigne de ne pas écrire le pronom sujet apparaît plusieurs fois.'))
  }
  if (mode === 'imperatif' && tense === 'present') {
    if (![5, 7, 8].includes(Number(question.personId))) {
      issues.push(semanticIssue('imperative-invalid-person', 'error', 'Personne impossible à l’impératif', 'L’impératif présent ne peut être enregistré qu’avec tu, nous ou vous.'))
    }
    if (omissionCount !== 1) issues.push(semanticIssue('imperative-pronoun-rule', 'error', 'Pronom à l’impératif', 'L’aide doit dire une seule fois de ne pas écrire le pronom sujet.'))
    if (normalized(question.pronom) === 'tu' && reference?.kind !== 'memorized-form' && !/(garder ou enlever le\s+s|enleve le\s+s|garde le\s+s|pas de\s+s final)/u.test(normalized(text))) {
      issues.push(semanticIssue('imperative-tu-s', 'error', 'Règle du s absente', 'Avec tu, l’aide doit renvoyer à la vérification du s.'))
    }
  }
  if (mode === 'conditionnel' && tense === 'present') {
    if (!normalized(text).includes('radical du futur') || !normalized(text).includes("terminaisons de l'imparfait")) {
      issues.push(semanticIssue('conditional-formula', 'error', 'Formule du conditionnel incomplète', 'Le conditionnel présent doit associer le radical du futur aux terminaisons de l’imparfait.'))
    }
    if (!normalized(text).includes('trouve le radical du futur')) {
      issues.push(semanticIssue('conditional-stem-step', 'error', 'Recherche du radical absente', 'Le radical du futur doit être expliqué dans son propre bloc.'))
    }
  }
  if (mode === 'subjonctif' && tense === 'present') {
    const regularReference = reference?.kind === 'present-ils' || reference?.kind === 'present-nous'
    if (regularReference && (!normalized(text).includes('ils au present') || !normalized(text).includes('nous au present'))) {
      issues.push(semanticIssue('subjunctive-two-references', 'error', 'Deux repères absents', 'La règle régulière doit distinguer les repères avec ils et avec nous.'))
    }
    if (!regularReference && !normalized(text).includes('irregulier')) {
      issues.push(semanticIssue('subjunctive-irregularity', 'warning', 'Irrégularité non annoncée', 'Une forme non reconstruite depuis ils ou nous doit être présentée comme particulière.'))
    }
  }
  if (question.isCompound) {
    const auxiliary = inferredAuxiliary(verb, question.conjugaison1)
    if (!normalized(text).includes(`verbe auxiliaire pour ${normalized(verb.infinitif)}`)) {
      issues.push(semanticIssue('compound-auxiliary-question', 'error', 'Auxiliaire non expliqué', 'Le temps composé doit identifier le verbe auxiliaire.'))
    }
    if (!new RegExp(`<mark><strong>${auxiliary}`, 'iu').test(html)) {
      issues.push(semanticIssue('compound-active-auxiliary', 'error', 'Mauvais auxiliaire mis en évidence', `L’auxiliaire « ${auxiliary} » devrait être actif.`))
    }
    if (!normalized(text).includes('participe passe') || !normalized(text).includes('accord du participe passe')) {
      issues.push(semanticIssue('compound-participle', 'error', 'Participe passé incomplet', 'Le participe passé et son accord doivent être expliqués.'))
    }
  }
  if (reference) {
    const sameContext = normalized(reference.referenceMode) === mode
      && normalized(reference.referenceTense) === tense
      && normalized(reference.referenceSubject) === normalized(question.pronom || question.saisiePrefixe)
      && normalized(reference.form) === normalized(target)
    const escapedEnding = reference.removableEnding?.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
    const explicitReferenceMemorization = /\bforme demandee (?:est justement la|est une) forme repere\b/u.test(normalized(text))
      && /apprends(?:-la| la)? par c(?:oe|œ)ur/u.test(normalized(text))
    const circularOperation = /\b(?:pars|prends) de la forme repere\b/u.test(normalized(text))
      || /\b(?:enleve|retire)\b/u.test(normalized(text))
    if (sameContext && escapedEnding && new RegExp(`<(?:kbd|samp)>-${escapedEnding}</(?:kbd|samp)>`, 'iu').test(html) && circularOperation && !explicitReferenceMemorization) {
      issues.push(semanticIssue('semantic-circularity', 'error', 'Boucle pédagogique', 'La réponse est utilisée comme point de départ pour prétendre reconstruire cette même réponse.'))
    }
  }
  if (target && !renderedContainsForm(html, target)) {
    issues.push(semanticIssue('semantic-target-missing', 'error', 'Réponse absente', `La forme attendue « ${target} » doit apparaître dans l’aide.`))
  }
  if (/<(?:var|samp|kbd|mark|strong)>\s*(?:-|)\s*<\//u.test(html)) {
    issues.push(semanticIssue('empty-pedagogical-badge', 'error', 'Badge vide', 'Un badge pédagogique est affiché sans contenu exploitable.'))
  }
  return issues
}

function pedagogicalSignature({ question, verb }) {
  const reference = question.radicalReference
  const mode = normalized(question.mode)
  const tense = normalized(question.temps)
  const person = PERSON_INDEX.get(Number(question.personId)) ?? 'np'
  const bare = normalized(verb.infinitif).replace(/^(?:se\s+|s')/u, '')
  const regularFuture = reference?.radical && normalized(reference.radical) === normalized(bare.endsWith('re') ? bare.slice(0, -1) : bare)
  const spelling = bare.endsWith('ger') ? 'ger' : bare.endsWith('cer') ? 'cer' : bare.endsWith('guer') ? 'guer' : 'none'
  const strategy = mode === 'conditionnel' && tense === 'present'
    ? regularFuture ? (bare.endsWith('re') ? 'regular-re' : 'regular-infinitive') : 'future-reference'
    : mode === 'subjonctif' && tense === 'present'
      ? ['present-ils', 'present-nous'].includes(reference?.kind) ? `two-stems-${reference.kind}` : 'memorized-paradigm'
      : mode === 'imperatif' && tense === 'present'
        ? `${question.pronom}-${reference?.kind || 'none'}`
        : question.isCompound
          ? `compound-${inferredAuxiliary(verb, question.conjugaison1)}`
          : `${reference?.kind || 'no-reference'}-${reference?.strategy || 'none'}`
  return [mode, tense, question.isCompound ? 'compound' : 'simple', `p${person}`, strategy, spelling, verb.familleConjugaison || 'no-family'].join('|')
}

function renderBlocks(blocks, values) {
  const render = block => {
    if (!block.isActive) return ''
    const title = block.content.trim() === '{contextualBaseHelp}' ? '' : block.title
    const content = sanitizeCoachHtml(renderCoachHelpContent(block.content, values, block.explanationApproach || 'cif-falc'))
    return `<section>${title ? `<h3>${title}</h3>` : ''}${content}${(block.children || []).map(render).join('')}</section>`
  }
  return blocks.map(render).join('')
}

function makeQuestion(verb, forms, form) {
  const accepted = [form.conjugaison1, form.conjugaison2, form.conjugaison3].map(value => String(value || '').trim()).filter(Boolean)
  const reference = buildRadicalReference({
    infinitive: verb.infinitif, mode: form.mode, tense: form.tense, personId: form.personId,
    conjugation: form.conjugaison1, isCompound: form.isCompound,
  }, forms.map(candidate => ({
    mode: candidate.mode, tense: candidate.tense, personId: candidate.personId,
    pronoun: candidate.pronoun, form: candidate.conjugaison1,
  })))
  return {
    titre: verb.infinitif,
    consigne: `${form.pronoun} | ${verb.infinitif} | ${form.tense} (${form.mode})`,
    reponses: accepted,
    reponsesPourCorrige: accepted.map(answer => `${form.pronoun} ${answer}`.trim()),
    verbeId: verb.id,
    tenseId: form.tenseId,
    personId: form.personId,
    infinitif: verb.infinitif,
    pronom: form.pronoun,
    saisiePrefixe: form.pronoun,
    temps: form.tense,
    mode: form.mode,
    isCompound: form.isCompound,
    conjugaison1: form.conjugaison1,
    conjugaison2: form.conjugaison2 || null,
    conjugaison3: form.conjugaison3 || null,
    nousForm: forms.find(candidate => candidate.tenseId === form.tenseId && candidate.personId === 7)?.conjugaison1 || null,
    ...(reference ? { radicalReference: reference } : {}),
  }
}

function markdownReport(report) {
  const problemSignatures = report.signatures.filter(signature => signature.status !== 'passed')
  const lines = [
    '# Audit sémantique des aides de conjugaison', '',
    `Généré le ${report.generatedAt}.`, '',
    `- ${report.summary.totalCases} formes contrôlées`,
    `- ${report.summary.totalVerbs} verbes`,
    `- ${report.summary.totalSignatures} signatures pédagogiques`,
    `- ${report.summary.passed} conformes`,
    `- ${report.summary.warning} à examiner`,
    `- ${report.summary.failed} erronées`, '',
    `- ${report.summary.databaseErrors} anomalies structurelles dans la base`, '',
    `- ${report.summary.approvedVerbs} verbes approuvés`,
    `- ${report.summary.rejectedVerbs} verbes à corriger`, '',
    '## Signatures problématiques', '',
  ]
  if (!problemSignatures.length) lines.push('Aucune signature problématique détectée.', '')
  for (const signature of problemSignatures) {
    lines.push(`### ${signature.id}`, '', `Cas : ${signature.count}. Exemple : **${signature.sample.verb} · ${signature.sample.mode} ${signature.sample.tense} · ${signature.sample.person} → ${signature.sample.expected}**.`, '')
    for (const item of signature.issues) lines.push(`- **${item.title}** (${item.code}) — ${item.detail}`)
    lines.push('')
  }
  lines.push('## Anomalies structurelles de la base', '')
  if (!report.databaseIssues.length) lines.push('Aucune anomalie structurelle détectée.', '')
  for (const item of report.databaseIssues) lines.push(`- **${item.code}** — ${item.detail}`)
  lines.push('')
  lines.push('## Couverture par mode et temps', '')
  for (const item of report.coverage) lines.push(`- **${item.mode} · ${item.tense}** : ${item.count} formes, ${item.failed} erreurs, ${item.warning} à examiner`)
  lines.push('')
  return lines.join('\n')
}

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

try {
  if (!Number.isInteger(helpId) || helpId < 1) throw new Error('Identifiant d’aide invalide.')
  const [helpRows] = await database.execute(`SELECT id,name,updated_at AS updatedAt
    FROM coach_help_templates WHERE id=? AND deleted_at IS NULL LIMIT 1`, [helpId])
  const help = helpRows[0]
  if (!help) throw new Error(`Aide #${helpId} introuvable.`)
  const [helpBlockRows] = await database.execute(`SELECT id,block_type AS type,title,content,
    explanation_approach AS explanationApproach,is_active AS isActive,sort_order AS sortOrder,children_json AS childrenJson
    FROM coach_help_blocks WHERE help_id=? ORDER BY sort_order,id`, [helpId])
  const baseBlocks = helpBlockRows.map(row => ({
    id: Number(row.id), type: row.type, title: row.title || '', content: row.content || '',
    explanationApproach: row.explanationApproach || 'cif-falc', isActive: Boolean(row.isActive),
    sortOrder: Number(row.sortOrder), children: storedChildren(row.childrenJson),
  }))
  if (!baseBlocks.length) throw new Error(`L’aide « ${help.name} » ne contient aucun bloc.`)
  const helpFingerprint = hash(baseBlocks)

  const [verbRows] = await database.execute(`SELECT v.id,v.infinitif,v.\`participe_présent\` AS participePresent,
    v.\`participe_passé\` AS participePasse,v.auxiliaire,v.groupe_conjugaison AS groupeConjugaison,
    f.slug AS familleConjugaison,v.terminaison_infinitif AS terminaison,v.type_pronominal AS typePronominal,
    v.est_impersonnel AS estImpersonnel,v.est_defectif AS estDefectif,v.personnes_disponibles AS personnesDisponibles,
    v.type_h_initial AS typeHInitial,v.niveau_difficulte AS niveauDifficulte,v.niveau_cecrl AS niveauCecrl,
    v.rang_frequence AS rangFrequence,v.registre_principal AS registrePrincipal,v.forme_canonique AS formeCanonique,
    v.statut_validation AS statutValidation,v.particularites,v.niveaux_scolaires AS niveauxScolaires,v.parcours_cif AS parcoursCif,
    (SELECT COALESCE(NULLIF(TRIM(vs.definition),''),NULLIF(TRIM(vs.intitule),'')) FROM verbe_sens vs
     WHERE vs.verbe_id=v.id ORDER BY vs.est_principal DESC,vs.numero_sens,vs.sort_order,vs.id LIMIT 1) AS meaning
    FROM verbes v LEFT JOIN familles_conjugaison f ON f.id=v.famille_conjugaison_id
    WHERE v.est_archive=0 AND EXISTS(SELECT 1 FROM verbesconjugues vc WHERE vc.verbe_id=v.id AND TRIM(COALESCE(vc.conjugaison1,''))<>'')
    ORDER BY v.id`)
  const [formRows] = await database.execute(`SELECT vc.verbe_id AS verbId,vc.personne_id AS personId,vc.temp_id AS tenseId,
    t.mode_id AS modeId,vc.conjugaison1,vc.conjugaison2,vc.conjugaison3,p.pronom AS pronoun,t.name AS tense,m.name AS mode,
    t.isTempsCompose AS isCompound FROM verbesconjugues vc INNER JOIN personnes p ON p.id=vc.personne_id
    INNER JOIN temps t ON t.id=vc.temp_id INNER JOIN modes m ON m.id=t.mode_id INNER JOIN verbes v ON v.id=vc.verbe_id
    WHERE v.est_archive=0 AND TRIM(COALESCE(vc.conjugaison1,''))<>'' ORDER BY vc.verbe_id,vc.temp_id,vc.personne_id`)

  const verbs = verbRows.map(row => ({
    id: Number(row.id), infinitif: row.infinitif, meaning: row.meaning || '', participePresent: row.participePresent,
    participePasse: row.participePasse, auxiliaire: row.auxiliaire, groupeConjugaison: row.groupeConjugaison,
    familleConjugaison: row.familleConjugaison, terminaison: row.terminaison, typePronominal: row.typePronominal,
    estImpersonnel: Boolean(row.estImpersonnel), estDefectif: Boolean(row.estDefectif), personnesDisponibles: parsedArray(row.personnesDisponibles),
    typeHInitial: row.typeHInitial, niveauDifficulte: row.niveauDifficulte, niveauCecrl: row.niveauCecrl,
    rangFrequence: row.rangFrequence, registrePrincipal: row.registrePrincipal, formeCanonique: row.formeCanonique || row.infinitif,
    statutValidation: row.statutValidation, particularites: parsedArray(row.particularites), niveauxScolaires: parsedArray(row.niveauxScolaires),
    parcoursCif: parsedArray(row.parcoursCif), categoriesSemantiques: [],
  }))
  const formsByVerb = new Map()
  const databaseIssues = []
  const seenForms = new Map()
  for (const row of formRows) {
    const rowKey = `${Number(row.verbId)}:${Number(row.tenseId)}:${Number(row.personId)}`
    const previous = seenForms.get(rowKey)
    if (previous) {
      const sameValues = ['conjugaison1', 'conjugaison2', 'conjugaison3'].every(field => normalized(previous[field]) === normalized(row[field]))
      databaseIssues.push({
        code: 'duplicate-conjugation-row', severity: 'error', key: rowKey, verbId: Number(row.verbId),
        detail: `Deux lignes${sameValues ? ' identiques' : ' différentes'} existent pour le verbe #${row.verbId}, le temps #${row.tenseId} et la personne #${row.personId}.`,
      })
      continue
    }
    seenForms.set(rowKey, row)
    const forms = formsByVerb.get(Number(row.verbId)) || []
    forms.push({
      personId: Number(row.personId), tenseId: Number(row.tenseId), modeId: Number(row.modeId), conjugaison1: row.conjugaison1,
      conjugaison2: row.conjugaison2 || '', conjugaison3: row.conjugaison3 || '', pronoun: row.pronoun || '', tense: row.tense,
      mode: row.mode, isCompound: Boolean(row.isCompound),
    })
    formsByVerb.set(Number(row.verbId), forms)
  }

  const cases = []
  const signatures = new Map()
  const coverage = new Map()
  const directReviewPayloads = new Map()
  const regularReviewCandidates = new Map()
  let processed = 0
  for (const verb of verbs) {
    const forms = formsByVerb.get(verb.id) || []
    for (const form of forms) {
      const question = makeQuestion(verb, forms, form)
      const tense = { id: form.tenseId, modeId: form.modeId, name: form.tense, isCompound: form.isCompound, selected: true, mode: { id: form.modeId, name: form.mode, order: 0 } }
      const values = {
        coach: { firstName: 'Audit' }, definition: verb.meaning || '',
        helpTitle: `${verb.infinitif} · ${form.tense} (${normalized(form.mode)})`,
        ...coachHelpQuestionVariables(question, verb, tense),
      }
      const blocks = [...baseBlocks, ...automaticOrthographyHelpBlocks(values)]
      const html = renderBlocks(blocks, values)
      const deterministic = auditRenderedCoachHelp({ renderedHtml: html, blocks, question, verb, tense })
      const issues = [
        ...deterministic.issues.filter(item => item.code !== 'missing-reference').map(item => ({ ...item, source: 'deterministic' })),
        ...semanticAudit({ html, question, verb }),
      ]
      const caseKey = `${verb.id}:${form.tenseId}:${form.personId}`
      const reviewedCorrection = REVIEWED_CORRECTIONS[caseKey]
      if (reviewedCorrection && normalized(form.conjugaison1) !== normalized(reviewedCorrection)) {
        issues.push(semanticIssue('stored-conjugation-error', 'error', 'Forme erronée dans la base', `La forme enregistrée « ${form.conjugaison1} » devrait être « ${reviewedCorrection} ».`))
      }
      const status = issues.some(item => item.severity === 'error') ? 'failed' : issues.length ? 'warning' : 'passed'
      const signatureId = pedagogicalSignature({ question, verb })
      const item = {
        key: caseKey, verbId: verb.id, verb: verb.infinitif, mode: form.mode, tense: form.tense,
        person: form.pronoun, personId: form.personId, expected: form.conjugaison1, referenceKind: question.radicalReference?.kind || null,
        signature: signatureId, status, issues: issues.map(issue => issue.code),
        ...(reviewedCorrection && normalized(form.conjugaison1) !== normalized(reviewedCorrection) ? { suggestedCorrection: reviewedCorrection } : {}),
      }
      cases.push(item)
      const reviewPayload = {
        key: caseKey,
        verbId: verb.id,
        verb: verb.infinitif,
        mode: form.mode,
        tense: form.tense,
        person: form.pronoun,
        expected: form.conjugaison1,
        signature: signatureId,
        html,
      }
      const isIrregular = !item.referenceKind || String(item.referenceKind).startsWith('memorized')
      const isSuspicious = issues.length > 0 || Boolean(reviewedCorrection)
      if (isIrregular || isSuspicious) {
        directReviewPayloads.set(caseKey, {
          ...reviewPayload,
          ...(!isSuspicious ? { html: undefined } : {}),
          layers: [...(isIrregular ? ['irregular'] : []), ...(isSuspicious ? ['suspicious'] : [])],
        })
      } else {
        const candidates = regularReviewCandidates.get(verb.id) || []
        candidates.push({ rank: hash(`${verb.id}:${caseKey}`), payload: reviewPayload })
        candidates.sort((left, right) => left.rank.localeCompare(right.rank))
        if (candidates.length > 8) candidates.length = 8
        regularReviewCandidates.set(verb.id, candidates)
      }
      const signature = signatures.get(signatureId) || {
        id: signatureId, count: 0, passed: 0, warning: 0, failed: 0, issueMap: new Map(),
        sample: { verb: verb.infinitif, mode: form.mode, tense: form.tense, person: form.pronoun, expected: form.conjugaison1, html },
      }
      signature.count += 1
      signature[status] += 1
      if (issues.length && !signature.problemSample) {
        signature.problemSample = { verb: verb.infinitif, mode: form.mode, tense: form.tense, person: form.pronoun, expected: form.conjugaison1, html }
      }
      for (const current of issues) {
        if (!signature.issueMap.has(current.code)) signature.issueMap.set(current.code, current)
      }
      signatures.set(signatureId, signature)
      const coverageKey = `${form.mode}|${form.tense}`
      const covered = coverage.get(coverageKey) || { mode: form.mode, tense: form.tense, count: 0, passed: 0, warning: 0, failed: 0 }
      covered.count += 1
      covered[status] += 1
      coverage.set(coverageKey, covered)
      processed += 1
      if (processed % 5000 === 0) console.log(`${processed.toLocaleString('fr-CH')} formes analysées…`)
    }
  }

  const signatureList = [...signatures.values()].map(signature => ({
    id: signature.id, count: signature.count, passed: signature.passed, warning: signature.warning, failed: signature.failed,
    status: signature.failed ? 'failed' : signature.warning ? 'warning' : 'passed', issues: [...signature.issueMap.values()], sample: signature.problemSample || signature.sample,
  })).sort((left, right) => right.failed - left.failed || right.warning - left.warning || right.count - left.count || left.id.localeCompare(right.id, 'fr'))
  const summary = {
    totalCases: cases.length, totalVerbs: verbs.length, totalSignatures: signatureList.length,
    passed: cases.filter(item => item.status === 'passed').length,
    warning: cases.filter(item => item.status === 'warning').length,
    failed: cases.filter(item => item.status === 'failed').length,
    databaseErrors: databaseIssues.length,
  }
  const verbReviews = verbs.map((verb) => {
    const verbCases = cases.filter(item => item.verbId === verb.id)
    const structuralIssues = databaseIssues.filter(item => item.verbId === verb.id)
    const failedCases = verbCases.filter(item => item.status !== 'passed')
    const irregularCases = verbCases.filter(item => !item.referenceKind || String(item.referenceKind).startsWith('memorized'))
    const suspiciousCases = verbCases.filter(item => item.issues.length > 0 || REVIEWED_CORRECTIONS[item.key])
    const signatures = new Set(verbCases.map(item => item.signature))
    const forms = formsByVerb.get(verb.id) || []
    const regularSample = verbCases
      .filter(item => item.referenceKind && !String(item.referenceKind).startsWith('memorized'))
      .sort((left, right) => hash(`${verb.id}:${left.key}`).localeCompare(hash(`${verb.id}:${right.key}`)))
      .slice(0, 8)
    const layers = {
      models: { complete: true, checked: signatures.size },
      irregular: { complete: true, checked: irregularCases.length },
      suspicious: { complete: true, checked: suspiciousCases.length + structuralIssues.length },
      sample: { complete: true, checked: regularSample.length, keys: regularSample.map(item => item.key) },
    }
    const issues = [
      ...failedCases.map(item => ({ key: item.key, codes: item.issues, expected: item.expected, suggestedCorrection: item.suggestedCorrection })),
      ...structuralIssues.map(item => ({ key: item.key, codes: [item.code], detail: item.detail })),
    ]
    return {
      verbId: verb.id,
      verb: verb.infinitif,
      status: issues.length ? 'rejected' : 'approved',
      checkedCases: verbCases.length,
      totalCases: forms.length,
      checkedSignatures: signatures.size,
      issueCount: issues.length,
      layers,
      issues,
      verbFingerprint: hash({ verb, forms }),
    }
  })
  summary.approvedVerbs = verbReviews.filter(item => item.status === 'approved').length
  summary.rejectedVerbs = verbReviews.filter(item => item.status === 'rejected').length
  const report = {
    schemaVersion: 3, auditVersion: COACH_HELP_AUTOMATIC_AUDIT_VERSION, generatedAt: new Date().toISOString(), approach: 'cif-falc',
    help: { id: Number(help.id), name: help.name, updatedAt: help.updatedAt, fingerprint: helpFingerprint },
    summary, databaseIssues, coverage: [...coverage.values()], signatures: signatureList, verbReviews, cases,
  }
  const suspiciousUnits = [...directReviewPayloads.values()]
    .filter(payload => payload.layers.includes('suspicious'))
    .map(payload => ({ id: `suspicious:${payload.key}`, kind: 'suspicious', layers: payload.layers, caseKeys: [payload.key], cases: [payload] }))
  const irregularGroups = new Map()
  for (const payload of directReviewPayloads.values()) {
    if (!payload.layers.includes('irregular') || payload.layers.includes('suspicious')) continue
    const group = irregularGroups.get(payload.signature) || []
    group.push(payload)
    irregularGroups.set(payload.signature, group)
  }
  const irregularUnits = []
  for (const [signature, payloads] of irregularGroups) {
    for (let offset = 0; offset < payloads.length; offset += 40) {
      const cases = payloads.slice(offset, offset + 40)
      irregularUnits.push({
        id: `irregular:${signature}:${Math.floor(offset / 40) + 1}`,
        kind: 'irregular', layers: ['irregular'], signature,
        caseKeys: cases.map(item => item.key), cases,
      })
    }
  }
  const sampleUnits = [...regularReviewCandidates.entries()].map(([verbId, candidates]) => {
    const cases = candidates.map(item => item.payload)
    return { id: `sample:${verbId}`, kind: 'sample', layers: ['sample'], verbId, caseKeys: cases.map(item => item.key), cases }
  })
  const aiQueue = {
    schemaVersion: 1,
    generatedAt: report.generatedAt,
    help: report.help,
    automaticAuditVersion: report.auditVersion,
    units: [
      ...signatureList.map(signature => ({
        id: `model:${signature.id}`,
        kind: 'model',
        signature: signature.id,
        layers: ['models'],
        ...signature.sample,
      })),
      ...irregularUnits,
      ...suspiciousUnits,
      ...sampleUnits,
    ],
  }
  if (persistReviews) {
    await database.beginTransaction()
    try {
      for (const review of verbReviews) {
        await database.execute(`INSERT INTO coach_help_automatic_reviews
          (help_id,verb_id,status,audit_version,help_updated_at,help_fingerprint,verb_fingerprint,
           checked_cases,total_cases,checked_signatures,issue_count,review_layers,issues_json,reviewed_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)
          ON DUPLICATE KEY UPDATE status=VALUES(status),audit_version=VALUES(audit_version),
            help_updated_at=VALUES(help_updated_at),help_fingerprint=VALUES(help_fingerprint),
            verb_fingerprint=VALUES(verb_fingerprint),checked_cases=VALUES(checked_cases),
            total_cases=VALUES(total_cases),checked_signatures=VALUES(checked_signatures),
            issue_count=VALUES(issue_count),review_layers=VALUES(review_layers),
            issues_json=VALUES(issues_json),reviewed_at=CURRENT_TIMESTAMP`, [
          helpId, review.verbId, review.status, COACH_HELP_AUTOMATIC_AUDIT_VERSION, help.updatedAt, helpFingerprint,
          review.verbFingerprint, review.checkedCases, review.totalCases, review.checkedSignatures,
          review.issueCount, JSON.stringify(review.layers), JSON.stringify(review.issues),
        ])
      }
      await database.commit()
    } catch (error) {
      await database.rollback()
      throw error
    }
  }
  await writeFile(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  await writeFile(REPORT_MARKDOWN, `${markdownReport(report)}\n`, 'utf8')
  await writeFile(AI_REVIEW_QUEUE, `${JSON.stringify(aiQueue, null, 2)}\n`, 'utf8')
  console.log(`${summary.totalCases.toLocaleString('fr-CH')} formes, ${summary.totalVerbs} verbes, ${summary.totalSignatures} signatures.`)
  console.log(`${summary.passed} conformes, ${summary.warning} à examiner, ${summary.failed} erreurs.`)
  console.log(`${summary.databaseErrors} anomalies structurelles dans la base.`)
  console.log(`${summary.approvedVerbs} verbes conformes aux règles automatiques, ${summary.rejectedVerbs} à corriger.`)
  if (persistReviews) console.log(`Résultats mémorisés pour l’aide « ${help.name} » (#${helpId}).`)
  console.log(`Rapports : ${REPORT_JSON.pathname} et ${REPORT_MARKDOWN.pathname}`)
  console.log(`File de revue IA : ${AI_REVIEW_QUEUE.pathname} (${aiQueue.units.length.toLocaleString('fr-CH')} unités)`)
  if (summary.failed || summary.databaseErrors) process.exitCode = 1
} finally {
  await database.end()
}

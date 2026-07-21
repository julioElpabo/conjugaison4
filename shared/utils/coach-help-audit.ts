import type { CoachHelpBlock } from '../types/coach'
import type { ConjugationTense, ExerciseQuestion, Verb } from '../types/conjugation'
import { decomposeConjugationForm } from './conjugation-help'

export type CoachHelpAuditSeverity = 'error' | 'warning'

export interface CoachHelpAuditIssue {
  code: string
  severity: CoachHelpAuditSeverity
  title: string
  detail: string
}

export interface CoachHelpAuditResult {
  status: 'passed' | 'warning' | 'failed'
  issues: CoachHelpAuditIssue[]
}

function reportedAuditErrors(value: unknown): CoachHelpAuditIssue[] {
  if (!value || typeof value !== 'object') return []
  const issues = (value as { issues?: unknown }).issues
  if (!Array.isArray(issues)) return []
  return issues.flatMap((candidate) => {
    if (!candidate || typeof candidate !== 'object') return []
    const item = candidate as Record<string, unknown>
    if (item.severity !== 'error' || typeof item.code !== 'string') return []
    return [{
      code: item.code.slice(0, 120),
      severity: 'error' as const,
      title: typeof item.title === 'string' ? item.title.slice(0, 200) : 'Erreur détectée dans le navigateur',
      detail: typeof item.detail === 'string' ? item.detail.slice(0, 500) : 'Le navigateur a remplacé l’aide par son affichage sécurisé.',
    }]
  })
}

/** Garantit qu’un affichage sécurisé côté navigateur laisse une trace, même si les audits client et serveur divergent. */
export function automaticHelpErrorsForRecording(
  serverAudit: CoachHelpAuditResult,
  clientAudit?: unknown,
): CoachHelpAuditIssue[] {
  const serverErrors = serverAudit.issues.filter(item => item.severity === 'error')
  if (serverErrors.length) return serverErrors

  const clientErrors = reportedAuditErrors(clientAudit)
  if (!clientErrors.length) return []
  const codes = [...new Set(clientErrors.map(item => item.code))].join(', ')
  return [issue(
    'client-server-audit-mismatch',
    'error',
    'Audits client et serveur différents',
    `Le navigateur a affiché l’aide sécurisée pour « ${codes} », mais le serveur n’a pas reproduit cette erreur.`,
  )]
}

function normalized(value?: string | null) {
  return (value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[’]/gu, "'").replace(/\s+/gu, ' ').trim().toLocaleLowerCase('fr')
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/giu, ' ')
    .replace(/&#(?:0*39);|&#x0*27;|&apos;/giu, "'")
    .replace(/&quot;/giu, '"')
    .replace(/&amp;/giu, '&')
    .replace(/&lt;/giu, '<')
    .replace(/&gt;/giu, '>')
}

function renderedContainsForm(renderedHtml: string, target: string) {
  const decoded = decodeHtmlEntities(renderedHtml)
  const visible = decoded.replace(/<[^>]+>/gu, ' ').replace(/\s+/gu, ' ').trim()
  const joinedBadges = decoded.replace(/<[^>]+>/gu, '').replace(/\s+/gu, ' ').trim()
  return normalized(visible).includes(normalized(target)) || normalized(joinedBadges).includes(normalized(target))
}

function conjugatedCore(value?: string | null) {
  return (value || '')
    .trim()
    .replace(/[.!?…]+$/gu, '')
    .replace(/^(?:je|j['’]|tu|il|elle|on|nous|vous|ils|elles)\s+/iu, '')
    .replace(/^(?:me|te|se|nous|vous)\s+/iu, '')
    .replace(/^[mts]['’]/iu, '')
    .trim()
}

function expectedCompoundCore(question: ExerciseQuestion, verb: Verb) {
  const source = question.conjugaison1?.trim() || ''
  const baseParticiple = verb.participePasse?.trim() || ''
  const expectedParticiple = question.agreementReminder?.participle?.trim() || ''
  if (!source || !baseParticiple || !expectedParticiple) return ''
  const escaped = baseParticiple.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
  return source.replace(new RegExp(`${escaped}(?:e|s|es)?(?=$|[\\s.,!?;:’'])`, 'iu'), expectedParticiple)
}

function deniesAnteposedCodAgreement(value: string) {
  const statement = String.raw`[^.!?]{0,160}`
  const denial = String.raw`(?:ne s['’]accorde pas|pas d['’]accord)`
  const anteposedCod = String.raw`cod[^.!?]{0,90}place avant`
  return new RegExp(`${anteposedCod}${statement}${denial}`, 'u').test(value)
    || new RegExp(`${denial}${statement}${anteposedCod}`, 'u').test(value)
}

function blockContents(blocks: readonly CoachHelpBlock[]): string {
  return blocks.map(block => `${block.isActive ? block.content : ''}\n${blockContents(block.children || [])}`).join('\n')
}

function issue(code: string, severity: CoachHelpAuditSeverity, title: string, detail: string): CoachHelpAuditIssue {
  return { code, severity, title, detail }
}

export function auditRenderedCoachHelp(input: {
  renderedHtml: string
  blocks: readonly CoachHelpBlock[]
  question: ExerciseQuestion
  verb: Verb
  tense?: ConjugationTense
}): CoachHelpAuditResult {
  const { renderedHtml, blocks, question, verb, tense } = input
  const issues: CoachHelpAuditIssue[] = []
  const configuredContent = blockContents(blocks)
  const visibleText = decodeHtmlEntities(renderedHtml).replace(/<[^>]+>/gu, ' ').replace(/\s+/gu, ' ').trim()
  const normalizedVisibleText = normalized(visibleText)
  const usesContextualBase = configuredContent.includes('{contextualBaseHelp}')
  const usesEndings = configuredContent.includes('{endingsHelp}') || usesContextualBase
  const usesDefinition = configuredContent.includes('{definitionHelp}') || configuredContent.includes('{definition}')

  if (!blocks.some(block => block.isActive)) {
    issues.push(issue('no-active-block', 'error', 'Aucun bloc actif', 'Cette aide ne présente aucun contenu à l’utilisateur.'))
  }
  if (!visibleText) {
    issues.push(issue('empty-render', 'error', 'Rendu vide', 'Le composant ne produit aucun texte visible pour cette forme.'))
  }
  if (/\{[A-Za-z][A-Za-z0-9_]*\}/u.test(renderedHtml)) {
    issues.push(issue('unresolved-variable', 'error', 'Variable non remplacée', 'Le rendu contient encore une variable entre accolades.'))
  }
  if (/\b(?:undefined|null|NaN)\b/u.test(visibleText)) {
    issues.push(issue('invalid-value', 'error', 'Valeur technique visible', 'Le rendu expose une valeur technique telle que « undefined », « null » ou « NaN ».'))
  }
  if (usesDefinition && !verb.meaning?.trim()) {
    issues.push(issue('missing-definition', 'warning', 'Définition absente', `Le verbe « ${verb.infinitif} » n’a pas de définition utilisable dans ce bloc.`))
  }

  const reference = question.radicalReference?.validated === false ? undefined : question.radicalReference
  const decomposition = decomposeConjugationForm(question, verb, tense)
  if (usesContextualBase && !question.isCompound && !reference) {
    issues.push(issue('missing-reference', 'warning', 'Forme repère absente', 'Aucune forme repère validée n’a été trouvée pour expliquer cette conjugaison.'))
  }
  if (reference) {
    if (reference.removableEnding && !normalized(reference.form).endsWith(normalized(reference.removableEnding))) {
      issues.push(issue('invalid-reference-ending', 'error', 'Retrait impossible', `La forme repère « ${reference.form} » ne se termine pas par « ${reference.removableEnding} ».`))
    }
    const sameContext = normalized(reference.referenceMode) === normalized(question.mode)
      && normalized(reference.referenceTense) === normalized(question.temps)
      && normalized(reference.referenceSubject) === normalized(question.pronom || question.saisiePrefixe)
    const requestedFormIsReference = sameContext && normalized(reference.form) === normalized(conjugatedCore(question.conjugaison1))
    const removalBadge = reference.removableEnding
      ? new RegExp(`<(?:kbd|samp)>-${reference.removableEnding.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}</(?:kbd|samp)>`, 'iu')
      : undefined
    const explicitReferenceMemorization = /\bforme demandee (?:est justement la|est une) forme repere\b/u.test(normalized(visibleText))
      && /apprends(?:-la| la)? par c(?:oe|œ)ur/u.test(normalized(visibleText))
    const circularOperation = /\b(?:pars|prends) de la forme repere\b/u.test(normalized(visibleText))
      || /\b(?:enleve|retire)\b/u.test(normalized(visibleText))
    if (requestedFormIsReference && removalBadge?.test(renderedHtml) && circularOperation && !explicitReferenceMemorization) {
      issues.push(issue('circular-reference', 'warning', 'Forme repère identique à la réponse', 'L’explication doit présenter cette forme comme un repère à mémoriser et ne pas prétendre la reconstruire à partir d’elle-même.'))
    }
    if (!reference.referenceTense || !reference.referenceMode) {
      issues.push(issue('reference-context-missing', 'warning', 'Contexte de la forme repère incomplet', 'Le temps ou le mode de la forme repère n’est pas explicitement renseigné.'))
    }
  }

  if (decomposition) {
    const reconstructed = `${decomposition.base}${decomposition.ending}`
    if (normalized(reconstructed) !== normalized(conjugatedCore(question.conjugaison1))) {
      issues.push(issue('invalid-assembly', 'error', 'Assemblage incorrect', `L’assemblage « ${reconstructed} » ne correspond pas à « ${question.conjugaison1} ».`))
    }
    const requestedFormIsReference = reference
      && normalized(reference.referenceMode) === normalized(question.mode)
      && normalized(reference.referenceTense) === normalized(question.temps)
      && normalized(reference.referenceSubject) === normalized(question.pronom || question.saisiePrefixe)
      && normalized(reference.form) === normalized(conjugatedCore(question.conjugaison1))
    if (usesEndings && reference?.kind !== 'memorized-stem' && !requestedFormIsReference && !renderedHtml.includes(`<samp>-${decomposition.ending}</samp>`)) {
      issues.push(issue('target-ending-not-highlighted', 'warning', 'Terminaison demandée non mise en évidence', `La terminaison « -${decomposition.ending} » n’est pas identifiable dans le rendu.`))
    }
  }

  const target = conjugatedCore(question.conjugaison1)
  if (target && usesContextualBase && !renderedContainsForm(renderedHtml, target)) {
    issues.push(issue('target-form-missing', 'warning', 'Forme attendue absente', `La forme « ${target} » n’apparaît pas dans l’explication automatique.`))
  }

  if (question.agreementReminder) {
    const officialForm = expectedCompoundCore(question, verb)
    if (officialForm && !renderedContainsForm(renderedHtml, officialForm)) {
      issues.push(issue(
        'official-compound-answer-missing',
        'error',
        'Réponse officielle absente de l’aide',
        `L’aide n’affiche pas la forme officielle « ${officialForm} » alors que l’accord attendu porte sur « ${question.agreementReminder.participle} ».`,
      ))
    }
    if (question.agreementReminder.kind === 'cod-before') {
      if (deniesAnteposedCodAgreement(normalizedVisibleText)) {
        issues.push(issue(
          'cod-before-agreement-contradiction',
          'error',
          'Règle d’accord contradictoire',
          'Le COD est placé avant le verbe, mais l’aide affirme qu’il ne commande pas l’accord.',
        ))
      }
    }
  }

  const status = issues.some(item => item.severity === 'error')
    ? 'failed'
    : issues.length
      ? 'warning'
      : 'passed'
  return { status, issues }
}

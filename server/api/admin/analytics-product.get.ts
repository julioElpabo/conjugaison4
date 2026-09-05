
import type { RowDataPacket } from 'mysql2/promise'
import type {
  AnalyticsActorFilter,
  AnalyticsFunnelStage,
  AnalyticsProductItem,
  AnalyticsProductResponse,
} from '../../../shared/types/analytics'

interface ProductEventRow extends RowDataPacket {
  eventName: string
  sessionId: string
  actorType: string
  feature: string | null
  presentation: string | null
  exerciseKind: string | null
  source: string | null
  coach: string | null
  locale: string | null
  theme: string | null
  falc: string | null
  voiceMode: string | null
  complements: string | null
  complementPlacement: string | null
  helpSource: string | null
  format: string | null
  tourFormat: string | null
  inclusiveDisplay: string | null
  showGrade: string | null
  showVerbs: string | null
  showTenses: string | null
  showFirstName: string | null
  showLastName: string | null
  showDate: string | null
  showRandomNumber: string | null
  value: number
}

interface ItemAccumulator {
  key: string
  label: string
  events: number
  sessions: Set<string>
}
interface CoachLookupRow extends RowDataPacket { id: number, label: string, type: string }

const actorFilters: AnalyticsActorFilter[] = ['all', 'anonymous', 'learner']
const labels: Record<string, string> = {
  classic: 'Exercice classique', chat: 'Chat avec coach', print: 'Impression',
  conjugation: 'Conjuguer', 'mode-identification': 'Trouver le mode',
  'tense-identification': 'Trouver le mode et le temps', active: 'Actif', passive: 'Passif', mixed: 'Mixte',
  none: 'Sans complément', cod: 'COD', coi: 'COI', 'cod-coi': 'COD + COI',
  after: 'Après', before: 'Avant', manual: 'Aide volontaire', reminder: 'Aide proposée',
  pdf: 'PDF', word: 'Word', light: 'Clair', dark: 'Sombre', true: 'Activé', false: 'Désactivé',
  quick: 'Visite rapide', complete: 'Visite complète', preset: 'Défi tout fait', code: 'Défi chargé', custom: 'Défi personnalisé',
  fr: 'Français', de: 'Allemand', en: 'Anglais', it: 'Italien', es: 'Espagnol', nl: "Néerlandais (Belgique)", 'nl-NL': "Néerlandais (Pays-Bas)",
}

const featureLabels: Record<string, string> = {
  'learner.history': 'Historique', 'learner.summary': 'Bilan de séance', 'learner.finish': 'Reprendre une séance',
  'learner.relaunch.same': 'Relancer dans le même ordre', 'learner.relaunch.random': 'Relancer au hasard',
  'learner.errors.session': 'Reprendre les erreurs de la séance', 'learner.errors.challenge': 'Reprendre les erreurs du défi',
  'learner.errors.targeted': 'Défi ciblé par erreur', 'learner.progress': 'Comprendre ses erreurs',
  'learner.training': 'Progression par défi', 'learner.training.analysis': 'Analyse de progression',
  'learner.preferences': 'Préférences', 'learner.account': 'Réglages du compte',
}

function isoDate(value: unknown, fallback: Date) {
  const text = String(value || '')
  return /^\d{4}-\d{2}-\d{2}$/u.test(text) && !Number.isNaN(Date.parse(`${text}T12:00:00Z`))
    ? text
    : fallback.toISOString().slice(0, 10)
}

export default defineEventHandler(async (event): Promise<AnalyticsProductResponse> => {
  requireAdministrator(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const query = getQuery(event)
  const actor = actorFilters.includes(String(query.actor) as AnalyticsActorFilter)
    ? String(query.actor) as AnalyticsActorFilter
    : 'all'
  const today = new Date()
  const defaultStart = new Date(today)
  defaultStart.setDate(defaultStart.getDate() - 29)
  const startDate = isoDate(query.start, defaultStart)
  const endDate = isoDate(query.end, today)
  if (startDate > endDate) throw createError({ statusCode: 400, statusMessage: 'La date de début doit précéder la date de fin.' })

  const actorClause = actor === 'all' ? '' : ' AND COALESCE(actor_type, \'anonymous\')=?'
  const parameters = actor === 'all' ? [startDate, endDate] : [startDate, endDate, actor]
  const database = useDatabase()
  const [[rows], [coachRows]] = await Promise.all([
    database.execute<ProductEventRow[]>(`
    SELECT event_name AS eventName, session_id AS sessionId,
      COALESCE(actor_type, 'anonymous') AS actorType,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.feature')) AS feature,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.presentation')) AS presentation,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.exerciseKind')) AS exerciseKind,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.source')) AS source,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.coach')) AS coach,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.locale')) AS locale,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.theme')) AS theme,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.falc')) AS falc,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.voiceMode')) AS voiceMode,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.complements')) AS complements,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.complementPlacement')) AS complementPlacement,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.helpSource')) AS helpSource,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.format')) AS format,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.tourFormat')) AS tourFormat,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.inclusiveDisplay')) AS inclusiveDisplay,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.showGrade')) AS showGrade,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.showVerbs')) AS showVerbs,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.showTenses')) AS showTenses,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.showFirstName')) AS showFirstName,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.showLastName')) AS showLastName,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.showDate')) AS showDate,
      JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.showRandomNumber')) AS showRandomNumber,
      COUNT(*) AS value
    FROM analytics_events
    WHERE created_at>=? AND created_at<DATE_ADD(?, INTERVAL 1 DAY)${actorClause}
    GROUP BY eventName,sessionId,actorType,feature,presentation,exerciseKind,source,coach,locale,theme,falc,
      voiceMode,complements,complementPlacement,helpSource,format,tourFormat,inclusiveDisplay,showGrade,
      showVerbs,showTenses,showFirstName,showLastName,showDate,showRandomNumber
    `, parameters),
    database.execute<CoachLookupRow[]>(`
      SELECT coaches.id, CONCAT(coaches.first_name, ' ', coaches.last_name) AS label,
             approaches.name AS type
      FROM coaches
      JOIN coach_characters characters ON characters.id=coaches.character_id
      JOIN coach_help_approaches approaches ON approaches.id=characters.help_approach_id
    `),
  ])
  const coaches = new Map(coachRows.map(row => [String(row.id), row]))

  const dimensions = new Map<string, Map<string, ItemAccumulator>>()
  const funnelSets = new Map<string, Map<string, Set<string>>>()
  const add = (dimension: string, keyValue: unknown, row: ProductEventRow, label?: string) => {
    const key = String(keyValue || '').trim()
    if (!key || key === 'null') return
    const items = dimensions.get(dimension) || new Map<string, ItemAccumulator>()
    const item = items.get(key) || { key, label: label || labels[key] || key, events: 0, sessions: new Set<string>() }
    item.events += Number(row.value) || 0
    item.sessions.add(row.sessionId)
    items.set(key, item)
    dimensions.set(dimension, items)
  }
  const stage = (funnel: string, key: string, sessionId: string) => {
    const stages = funnelSets.get(funnel) || new Map<string, Set<string>>()
    const sessions = stages.get(key) || new Set<string>()
    sessions.add(sessionId)
    stages.set(key, sessions)
    funnelSets.set(funnel, stages)
  }

  for (const row of rows) {
    if (row.eventName === 'exercise_started') {
      add('presentations', row.presentation, row)
      add('exerciseKinds', row.exerciseKind, row)
      add('challengeSources', row.source, row)
      add('voices', row.voiceMode, row)
      add('complements', row.complements, row)
      add('complementPlacements', row.complementPlacement, row)
      add('falc', row.falc, row)
      if (row.presentation === 'chat') {
        const coach = coaches.get(String(row.coach || ''))
        add('coaches', row.coach, row, coach?.label || `Coach ${row.coach}`)
        add('coachTypes', coach?.type, row)
      }
      stage('exercise', 'started', row.sessionId)
      if (row.source === 'custom') stage('customChallenge', 'launched', row.sessionId)
    }
    if (row.eventName === 'exercise_completed') stage('exercise', 'completed', row.sessionId)
    if (row.eventName === 'exercise_abandoned') stage('exercise', 'abandoned', row.sessionId)
    if (row.eventName === 'feature_selected' && row.feature === 'builder.custom') stage('customChallenge', 'selected', row.sessionId)
    if (row.eventName === 'challenge_save') add('services', 'challenge-save', row, 'Défis créés et partagés')
    if (row.eventName === 'challenge_load') add('services', 'challenge-load', row, 'Défis chargés')
    if (row.eventName === 'exercise_started') add('services', row.presentation === 'chat' ? 'exercise-chat' : 'exercise-classic', row, labels[row.presentation || ''] || 'Exercice')
    if (row.eventName === 'language_used') {
      add('languages', row.locale, row)
      add('services', `language-${row.locale}`, row, `Traduction · ${labels[row.locale || ''] || row.locale}`)
    }
    if (row.eventName === 'help_opened') add('helpSources', row.helpSource || 'manual', row)
    if (row.eventName === 'chat_conjugation_opened') add('chatTools', 'conjugation', row, 'Conjugaison consultée')
    if (row.eventName === 'help_scrolled') add('chatTools', 'help', row, 'Aide parcourue')
    if (row.eventName === 'print_opened') {
      stage('print', 'preview', row.sessionId)
      add('services', 'print', row, 'Impression')
    }
    if (row.eventName === 'pdf_downloaded' || row.eventName === 'word_downloaded') {
      const format = row.eventName === 'pdf_downloaded' ? 'pdf' : 'word'
      add('printFormats', format, row)
      add('printSources', row.source || 'exercise', row)
      stage('print', format, row.sessionId)
      for (const [key, value] of Object.entries({
        inclusiveDisplay: row.inclusiveDisplay, showGrade: row.showGrade, showVerbs: row.showVerbs,
        showTenses: row.showTenses, showFirstName: row.showFirstName, showLastName: row.showLastName,
        showDate: row.showDate, showRandomNumber: row.showRandomNumber,
      })) if (value === 'true') add('printOptions', key, row, key)
    }
    if (row.eventName === 'tour_started') {
      add('tourFormats', row.tourFormat, row)
      stage('tour', 'started', row.sessionId)
    }
    if (row.eventName === 'tour_completed') stage('tour', 'completed', row.sessionId)
    if (row.eventName === 'tour_abandoned') stage('tour', 'abandoned', row.sessionId)
    if (row.eventName === 'feature_selected' && row.feature === 'theme.change') add('themes', row.theme, row)
    if (row.eventName === 'feature_selected' && row.feature === 'accessibility.falc') add('falcSelections', row.falc, row)
    if (row.eventName === 'exercise_started' || row.eventName === 'feature_selected') add('observedThemes', row.theme, row)
    if (row.actorType === 'learner' && row.feature && featureLabels[row.feature]
      && ['feature_selected', 'feature_completed'].includes(row.eventName)) {
      add('learnerFeatures', row.feature, row, featureLabels[row.feature])
    }
  }

  const dimensionResult = Object.fromEntries([...dimensions].map(([name, items]) => [name, [...items.values()]
    .map((item): AnalyticsProductItem => ({ key: item.key, label: item.label, events: item.events, uniqueSessions: item.sessions.size }))
    .sort((left, right) => right.uniqueSessions - left.uniqueSessions || right.events - left.events)]))
  const funnelLabels: Record<string, string> = {
    selected: 'Création choisie', launched: 'Premier usage lancé', started: 'Commencés', completed: 'Terminés',
    abandoned: 'Abandonnés', preview: 'Aperçu ouvert', pdf: 'PDF', word: 'Word',
  }
  const funnelOrders: Record<string, string[]> = {
    customChallenge: ['selected', 'launched'], exercise: ['started', 'completed', 'abandoned'],
    print: ['preview', 'pdf', 'word'], tour: ['started', 'completed', 'abandoned'],
  }
  const funnelResult = Object.fromEntries(Object.entries(funnelOrders).map(([name, order]) => {
    const sets = funnelSets.get(name)
    return [name, order.map((key): AnalyticsFunnelStage => ({ key, label: funnelLabels[key] || key, value: sets?.get(key)?.size || 0 }))]
  }))

  return {
    startDate, endDate, actor, dimensions: dimensionResult, funnels: funnelResult,
    generatedAt: new Date().toISOString(),
    notice: 'Les dimensions détaillées commencent à partir de cette version; les périodes antérieures peuvent être partielles.',
  }
})

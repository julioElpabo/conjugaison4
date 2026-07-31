import type { RowDataPacket } from 'mysql2/promise'
import type {
  AnalyticsActorFilter,
  AnalyticsUsageResponse,
  AnalyticsUsageRow,
} from '../../../shared/types/analytics'
import { challengePresetDefinitions } from '../../../shared/data/challenge-presets'
import { analyticsUsageDiagnostic } from '../../../shared/utils/analytics-usage'

interface UsageEventRow extends RowDataPacket {
  eventName: string
  actorType: string
  sessionId: string
  feature: string | null
  item: string | null
  preset: string | null
  presentation: string | null
  source: string | null
  value: number
  lastUsedAt: Date | string | null
}

interface UsageAccumulator {
  row: Omit<AnalyticsUsageRow, 'diagnostic' | 'diagnosticReason'>
  selectedBySession: Map<string, number>
  sessions: Set<string>
}

const actorFilters: AnalyticsActorFilter[] = ['all', 'anonymous', 'learner']

const featureLabels: Record<string, string> = {
  'builder.custom': 'Construire un défi personnalisé',
  'preset.library': 'Parcourir les défis tout faits',
  'challenge.load': 'Charger un défi avec un code',
  'challenge.share': 'Enregistrer et partager un défi',
  'exercise.classic': 'Exercice classique',
  'exercise.chat': 'Exercice avec un coach',
  'print.preview': 'Préparer une fiche imprimable',
  'download.pdf': 'Télécharger un PDF',
  'download.word': 'Télécharger un document Word',
  'consult.verb': 'Consulter un verbe',
  'learn.content': 'Consulter les contenus Apprendre',
  'learner.history': 'Consulter ses dernières séances',
  'learner.summary': 'Consulter le bilan d’une séance',
  'learner.finish': 'Terminer une séance inachevée',
  'learner.relaunch.same': 'Relancer le même défi dans le même ordre',
  'learner.relaunch.random': 'Relancer le même défi au hasard',
  'learner.errors.session': 'Reprendre les erreurs de la séance',
  'learner.errors.challenge': 'Reprendre les erreurs de tout le défi',
  'learner.errors.targeted': 'Lancer un défi ciblé par type d’erreur',
  'learner.progress': 'Comprendre ses erreurs',
  'learner.progress.examples': 'Afficher davantage d’exemples d’erreurs',
  'learner.training': 'Consulter la progression par défi',
  'learner.training.analysis': 'Analyser la progression d’un défi',
  'learner.training.session': 'Consulter une séance dans le graphique',
  'learner.preferences': 'Consulter ses préférences',
  'learner.account': 'Consulter les réglages du compte',
  'learner.password': 'Modifier son mot de passe',
  'learner.results.delete': 'Supprimer ses résultats',
  'learner.account.delete': 'Supprimer son compte',
  'language.change': 'Changer la langue',
  'theme.change': 'Changer l’apparence',
  'auth.register': 'Créer un compte',
  'auth.login': 'Se connecter',
}

function isoDate(value: unknown, fallback: Date) {
  const text = String(value || '')
  return /^\d{4}-\d{2}-\d{2}$/u.test(text) && !Number.isNaN(Date.parse(`${text}T12:00:00Z`))
    ? text
    : fallback.toISOString().slice(0, 10)
}

function percentage(numerator: number, denominator: number) {
  return denominator ? Math.round(numerator / denominator * 1000) / 10 : null
}

function blankRow(key: string, label: string, category: AnalyticsUsageRow['category']): UsageAccumulator {
  return {
    row: {
      key,
      label,
      category,
      exposures: 0,
      selections: 0,
      starts: 0,
      completions: 0,
      failures: 0,
      uniqueSessions: 0,
      repeatSessions: 0,
      adoptionRate: null,
      completionRate: null,
      repeatRate: null,
      lastUsedAt: null,
    },
    selectedBySession: new Map(),
    sessions: new Set(),
  }
}

export default defineEventHandler(async (event): Promise<AnalyticsUsageResponse> => {
  requireAdministrator(event)
  const query = getQuery(event)
  const actor = actorFilters.includes(String(query.actor) as AnalyticsActorFilter)
    ? String(query.actor) as AnalyticsActorFilter
    : 'all'
  const today = new Date()
  const defaultStart = new Date(today)
  defaultStart.setDate(defaultStart.getDate() - 29)
  const startDate = isoDate(query.start, defaultStart)
  const endDate = isoDate(query.end, today)
  if (startDate > endDate) {
    throw createError({ statusCode: 400, statusMessage: 'La date de début doit précéder la date de fin.' })
  }

  const actorExpression = "COALESCE(JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.actor')), 'anonymous')"
  const actorClause = actor === 'all' ? '' : ` AND ${actorExpression}=?`
  const parameters: Array<string> = [startDate, endDate]
  if (actor !== 'all') parameters.push(actor)
  const database = useDatabase()
  const [events] = await database.execute<UsageEventRow[]>(`
    SELECT event_name AS eventName, ${actorExpression} AS actorType, session_id AS sessionId,
           JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.feature')) AS feature,
           JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.item')) AS item,
           JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.preset')) AS preset,
           JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.presentation')) AS presentation,
           JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.source')) AS source,
           COUNT(*) AS value, MAX(created_at) AS lastUsedAt
    FROM analytics_events
    WHERE created_at>=? AND created_at<DATE_ADD(?, INTERVAL 1 DAY)${actorClause}
      AND event_name IN (
        'feature_exposed','feature_selected','feature_completed','feature_failed',
        'challenge_preset_selected','challenge_load','challenge_save',
        'exercise_started','exercise_completed','exercise_abandoned',
        'help_opened','coach_selected','print_opened','pdf_downloaded','word_downloaded',
        'account_registered','account_login'
      )
    GROUP BY event_name,actorType,session_id,feature,item,preset,presentation,source
  `, parameters)

  const accumulators = new Map<string, UsageAccumulator>()
  const ensure = (key: string, label: string, category: AnalyticsUsageRow['category']) => {
    const mapKey = `${category}:${key}`
    const current = accumulators.get(mapKey) ?? blankRow(key, label, category)
    accumulators.set(mapKey, current)
    return current
  }
  for (const preset of challengePresetDefinitions) ensure(preset.id, preset.label, 'preset')
  for (const [key, label] of Object.entries(featureLabels)) ensure(key, label, 'feature')

  const apply = (
    accumulator: UsageAccumulator,
    row: UsageEventRow,
    field: 'exposures' | 'selections' | 'starts' | 'completions' | 'failures',
  ) => {
    const value = Number(row.value) || 0
    accumulator.row[field] += value
    accumulator.sessions.add(row.sessionId)
    if (field === 'selections') {
      accumulator.selectedBySession.set(
        row.sessionId,
        (accumulator.selectedBySession.get(row.sessionId) || 0) + value,
      )
    }
    const lastUsedAt = row.lastUsedAt ? new Date(row.lastUsedAt).toISOString() : null
    if (lastUsedAt && (!accumulator.row.lastUsedAt || lastUsedAt > accumulator.row.lastUsedAt)) {
      accumulator.row.lastUsedAt = lastUsedAt
    }
  }

  for (const row of events) {
    const genericFeature = String(row.feature || '')
    const genericItem = String(row.item || '')
    if (row.eventName.startsWith('feature_') && genericFeature) {
      const category = genericFeature === 'preset' ? 'preset' : 'feature'
      const key = category === 'preset' ? genericItem : genericFeature
      if (!key) continue
      const label = category === 'preset'
        ? challengePresetDefinitions.find(preset => preset.id === key)?.label || key
        : featureLabels[key] || key
      const accumulator = ensure(key, label, category)
      const fields = {
        feature_exposed: 'exposures',
        feature_selected: 'selections',
        feature_completed: 'completions',
        feature_failed: 'failures',
      } as const
      const field = fields[row.eventName as keyof typeof fields]
      if (field) apply(accumulator, row, field)
      continue
    }

    const presetId = String(row.preset || '')
    if (row.eventName === 'challenge_preset_selected' && presetId) {
      apply(ensure(presetId, challengePresetDefinitions.find(item => item.id === presetId)?.label || presetId, 'preset'), row, 'selections')
      apply(ensure('preset.library', featureLabels['preset.library']!, 'feature'), row, 'selections')
    }
    if ((row.eventName === 'exercise_started' || row.eventName === 'exercise_completed') && presetId) {
      apply(
        ensure(presetId, challengePresetDefinitions.find(item => item.id === presetId)?.label || presetId, 'preset'),
        row,
        row.eventName === 'exercise_started' ? 'starts' : 'completions',
      )
      apply(
        ensure('preset.library', featureLabels['preset.library']!, 'feature'),
        row,
        row.eventName === 'exercise_started' ? 'starts' : 'completions',
      )
    }
    if (
      (row.eventName === 'exercise_started' || row.eventName === 'exercise_completed')
      && row.source === 'custom'
    ) {
      apply(
        ensure('builder.custom', featureLabels['builder.custom']!, 'feature'),
        row,
        row.eventName === 'exercise_started' ? 'starts' : 'completions',
      )
    }

    if (
      (row.eventName === 'exercise_started'
        || row.eventName === 'exercise_completed'
        || row.eventName === 'exercise_abandoned')
      && genericFeature
      && genericFeature !== 'exercise.classic'
      && genericFeature !== 'exercise.chat'
    ) {
      const targetedAccumulator = ensure(
        genericFeature,
        featureLabels[genericFeature] || genericFeature,
        'feature',
      )
      apply(
        targetedAccumulator,
        row,
        row.eventName === 'exercise_started'
          ? 'starts'
          : row.eventName === 'exercise_completed'
            ? 'completions'
            : 'failures',
      )
    }

    const featureKey = (() => {
      if (row.eventName === 'exercise_started' || row.eventName === 'exercise_completed' || row.eventName === 'exercise_abandoned') {
        return row.presentation === 'chat' ? 'exercise.chat' : 'exercise.classic'
      }
      if (row.eventName === 'challenge_load') return 'challenge.load'
      if (row.eventName === 'challenge_save') return 'challenge.share'
      if (row.eventName === 'print_opened') return 'print.preview'
      if (row.eventName === 'pdf_downloaded') return 'download.pdf'
      if (row.eventName === 'word_downloaded') return 'download.word'
      if (row.eventName === 'help_opened') return 'exercise.chat'
      if (row.eventName === 'coach_selected') return 'exercise.chat'
      if (row.eventName === 'account_registered') return 'auth.register'
      if (row.eventName === 'account_login') return 'auth.login'
      return ''
    })()
    if (!featureKey) continue
    const accumulator = ensure(featureKey, featureLabels[featureKey] || featureKey, 'feature')
    if (row.eventName === 'exercise_started') apply(accumulator, row, 'starts')
    else if (row.eventName === 'exercise_completed') apply(accumulator, row, 'completions')
    else if (row.eventName === 'exercise_abandoned') apply(accumulator, row, 'failures')
    else if (row.eventName === 'challenge_load' || row.eventName === 'challenge_save' || row.eventName === 'print_opened'
      || row.eventName === 'pdf_downloaded' || row.eventName === 'word_downloaded'
      || row.eventName === 'account_registered' || row.eventName === 'account_login') {
      apply(accumulator, row, 'completions')
    }
  }

  const finalized = [...accumulators.values()].map((accumulator): AnalyticsUsageRow => {
    accumulator.row.uniqueSessions = accumulator.sessions.size
    accumulator.row.repeatSessions = [...accumulator.selectedBySession.values()].filter(count => count > 1).length
    accumulator.row.adoptionRate = percentage(accumulator.row.selections, accumulator.row.exposures)
    accumulator.row.completionRate = percentage(
      accumulator.row.completions,
      accumulator.row.starts || accumulator.row.selections,
    )
    accumulator.row.repeatRate = percentage(accumulator.row.repeatSessions, accumulator.selectedBySession.size)
    return { ...accumulator.row, ...analyticsUsageDiagnostic(accumulator.row) }
  })
  const order = (left: AnalyticsUsageRow, right: AnalyticsUsageRow) => (
    right.exposures - left.exposures
    || right.selections - left.selections
    || left.label.localeCompare(right.label, 'fr')
  )
  const presets = finalized.filter(row => row.category === 'preset').sort(order)
  const features = finalized.filter(row => row.category === 'feature').sort(order)
  const exposedSessions = new Set(events.filter(row => row.eventName === 'feature_exposed').map(row => row.sessionId)).size
  const activeFeatureSessions = new Set(events.filter(row => (
    row.eventName === 'feature_selected'
    || row.eventName === 'exercise_started'
    || row.eventName === 'challenge_preset_selected'
  )).map(row => row.sessionId)).size

  return {
    startDate,
    endDate,
    actor,
    summary: {
      exposedSessions,
      activeFeatureSessions,
      trackedFeatures: finalized.length,
      removeCandidates: finalized.filter(row => row.diagnostic === 'remove-candidate').length,
      insufficient: finalized.filter(row => row.diagnostic === 'insufficient').length,
    },
    presets,
    features,
    generatedAt: new Date().toISOString(),
    notice: 'La distinction anonyme/connecté et les expositions détaillées commencent à partir de cette version. Les sélections historiques restent visibles, mais ne suffisent pas seules à recommander une suppression.',
  }
})

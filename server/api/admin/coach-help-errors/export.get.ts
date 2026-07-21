import type { RowDataPacket } from 'mysql2/promise'

interface ErrorExportRow extends RowDataPacket {
  id: number
  errorCode: string | null
  severity: string | null
  comment: string | null
  occurrenceCount: number
  firstSeenAt: Date | string | null
  lastSeenAt: Date | string | null
  verb: string | null
  tense: string | null
  mode: string | null
  person: string | null
  expectedAnswer: string | null
  questionJson: string | null
  contextJson: string | null
  displayedHelpHtml: string | null
}

function prettyJson(value: string | null) {
  if (!value) return 'null'
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  }
  catch {
    return value
  }
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const [rows] = await useDatabase().execute<ErrorExportRow[]>(`
    SELECT id, error_code AS errorCode, severity, comment,
      occurrence_count AS occurrenceCount, first_seen_at AS firstSeenAt, last_seen_at AS lastSeenAt,
      verb, tense, mode, person, expected_answer AS expectedAnswer,
      question_json AS questionJson, context_json AS contextJson,
      displayed_help_html AS displayedHelpHtml
    FROM coach_help_feedback
    WHERE origin='automatic' AND validation_status='unvalidated' AND moderation_status='active'
    ORDER BY created_at ASC, id ASC
  `)

  const introduction = [
    'Analyse et corrige les erreurs automatiques suivantes dans les aides de conjugaison.',
    'Travaille sur la cause générale lorsque plusieurs formes partagent la même logique.',
    'Après correction, ajoute ou adapte les tests déterministes correspondants.',
  ].join('\n')
  const entries = rows.map(row => [
    `## Erreur automatique #${row.id} — ${row.errorCode || 'code inconnu'}`,
    `Sévérité : ${row.severity || 'error'} · occurrences : ${Number(row.occurrenceCount || 1)}`,
    `Contexte : ${[row.person, row.verb, row.tense, row.mode].filter(Boolean).join(' | ') || 'non renseigné'}`,
    `Réponse officielle : ${row.expectedAnswer || 'non renseignée'}`,
    `Diagnostic : ${row.comment || 'non renseigné'}`,
    `Première détection : ${row.firstSeenAt || '—'} · dernière détection : ${row.lastSeenAt || '—'}`,
    'Question :',
    '```json',
    prettyJson(row.questionJson),
    '```',
    'Contexte enregistré :',
    '```json',
    prettyJson(row.contextJson),
    '```',
    'Aide affichée :',
    '```html',
    row.displayedHelpHtml || '',
    '```',
  ].join('\n'))

  return {
    count: rows.length,
    prompt: rows.length ? `${introduction}\n\n${entries.join('\n\n')}` : '',
  }
})

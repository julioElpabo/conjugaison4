import type { RowDataPacket } from 'mysql2/promise'

interface FeedbackExportRow extends RowDataPacket {
  id: number
  feedbackType: 'useful' | 'unclear' | 'error' | 'remark'
  comment: string | null
  sessionId: string | null
  exerciseRunId: string | null
  questionNumber: number | null
  helpName: string | null
  coachName: string | null
  verb: string | null
  tense: string | null
  mode: string | null
  person: string | null
  expectedAnswer: string | null
  contextJson: string | null
  questionJson: string | null
  exerciseContextJson: string | null
  attemptsJson: string | null
  messagesJson: string | null
  displayedHelpJson: string | null
  displayedHelpHtml: string | null
  uiContextJson: string | null
  createdAt: Date | string
  validatedAt: Date | string | null
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

const feedbackLabels: Record<FeedbackExportRow['feedbackType'], string> = {
  useful: 'Utile',
  unclear: 'Pas clair',
  error: 'Erreur',
  remark: 'Remarque',
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const [rows] = await useDatabase().execute<FeedbackExportRow[]>(`
    SELECT id, feedback_type AS feedbackType, comment,
      session_id AS sessionId, exercise_run_id AS exerciseRunId, question_number AS questionNumber,
      help_name AS helpName, coach_name AS coachName,
      verb, tense, mode, person, expected_answer AS expectedAnswer,
      context_json AS contextJson, question_json AS questionJson,
      exercise_context_json AS exerciseContextJson, attempts_json AS attemptsJson,
      messages_json AS messagesJson, displayed_help_json AS displayedHelpJson,
      displayed_help_html AS displayedHelpHtml, ui_context_json AS uiContextJson,
      created_at AS createdAt, validated_at AS validatedAt
    FROM coach_help_feedback
    WHERE origin='user' AND validation_status='validated' AND moderation_status='active'
    ORDER BY created_at ASC, id ASC
  `)

  const introduction = [
    'Analyse les feedbacks utilisateurs validés ci-dessous et apporte les améliorations utiles au projet.',
    'Ne traite pas chaque exemple comme un cas isolé : cherche la cause générale et corrige toutes les situations équivalentes.',
    'Un retour « Utile » confirme un comportement à préserver. Pour les autres retours, confronte la remarque à la question, à la réponse officielle et à l’aide réellement affichée.',
    'Ajoute ou adapte les tests qui protègent les comportements corrigés.',
  ].join('\n')
  const entries = rows.map(row => [
    `## Feedback validé #${row.id} — ${feedbackLabels[row.feedbackType]}`,
    `Contexte : ${[row.person, row.verb, row.tense, row.mode].filter(Boolean).join(' | ') || 'non renseigné'}`,
    `Coach : ${row.coachName || 'non renseigné'} · aide : ${row.helpName || 'non renseignée'} · question : ${row.questionNumber ?? '—'}`,
    `Réponse officielle : ${row.expectedAnswer || 'non renseignée'}`,
    `Commentaire utilisateur : ${row.comment || 'aucun commentaire'}`,
    `Session : ${row.sessionId || '—'} · exercice : ${row.exerciseRunId || '—'}`,
    `Reçu : ${row.createdAt} · validé : ${row.validatedAt || '—'}`,
    'Question complète :',
    '```json',
    prettyJson(row.questionJson),
    '```',
    'Contexte de l’exercice :',
    '```json',
    prettyJson(row.exerciseContextJson),
    '```',
    'Tentatives et réponse utilisateur :',
    '```json',
    prettyJson(row.attemptsJson),
    '```',
    'Messages du chat :',
    '```json',
    prettyJson(row.messagesJson),
    '```',
    'Contexte complet enregistré :',
    '```json',
    prettyJson(row.contextJson),
    '```',
    'Structure de l’aide affichée :',
    '```json',
    prettyJson(row.displayedHelpJson),
    '```',
    'HTML de l’aide affichée :',
    '```html',
    row.displayedHelpHtml || '',
    '```',
    'Contexte visuel :',
    '```json',
    prettyJson(row.uiContextJson),
    '```',
  ].join('\n'))

  return {
    count: rows.length,
    prompt: rows.length ? `${introduction}\n\n${entries.join('\n\n')}` : '',
  }
})

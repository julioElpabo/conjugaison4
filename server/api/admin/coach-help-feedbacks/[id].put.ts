type FeedbackAction = 'validate' | 'unvalidate' | 'remove' | 'restore'

interface FeedbackActionBody {
  action?: unknown
  note?: unknown
}

function actionFromBody(value: unknown): FeedbackAction | null {
  return typeof value === 'string' && ['validate', 'unvalidate', 'remove', 'restore'].includes(value)
    ? value as FeedbackAction
    : null
}

function noteFromBody(value: unknown) {
  return typeof value === 'string' ? value.trim().slice(0, 500) || null : null
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const id = Number.parseInt(String(getRouterParam(event, 'id') || '0'), 10)
  if (!Number.isInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Feedback invalide' })
  }

  const body = await readBody<FeedbackActionBody>(event)
  const action = actionFromBody(body?.action)
  const note = noteFromBody(body?.note)
  if (!action) {
    throw createError({ statusCode: 400, statusMessage: 'Action inconnue' })
  }

  const database = useDatabase()
  if (action === 'validate') {
    await database.execute(
      `UPDATE coach_help_feedback
       SET validation_status='validated', validated_at=CURRENT_TIMESTAMP
       WHERE id=?`,
      [id],
    )
  }
  else if (action === 'unvalidate') {
    await database.execute(
      `UPDATE coach_help_feedback
       SET validation_status='unvalidated', validated_at=NULL
       WHERE id=?`,
      [id],
    )
  }
  else if (action === 'remove') {
    await database.execute(
      `UPDATE coach_help_feedback
       SET moderation_status='removed', moderation_note=?, moderated_at=CURRENT_TIMESTAMP, deleted_at=CURRENT_TIMESTAMP
       WHERE id=?`,
      [note || 'Retiré depuis l’administration', id],
    )
  }
  else {
    await database.execute(
      `UPDATE coach_help_feedback
       SET moderation_status='active', moderation_note=?, moderated_at=CURRENT_TIMESTAMP, deleted_at=NULL
       WHERE id=?`,
      [note || 'Restauré depuis l’administration', id],
    )
  }

  return { ok: true }
})

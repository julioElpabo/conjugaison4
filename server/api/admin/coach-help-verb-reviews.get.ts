import type { RowDataPacket } from 'mysql2/promise'
import { COACH_HELP_REVIEW_VERSION, type CoachHelpVerbReviewStatus } from '../../../shared/utils/coach-help-review'

interface HelpRow extends RowDataPacket { id: number, name: string }
interface ReviewRow extends RowDataPacket {
  verbId: number
  status: CoachHelpVerbReviewStatus
  reviewedAt: Date
  issueCount: number
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const requestedHelpId = Number.parseInt(String(getQuery(event).help || '0'), 10)
  const database = useDatabase()
  const [helps] = Number.isInteger(requestedHelpId) && requestedHelpId > 0
    ? await database.execute<HelpRow[]>('SELECT id,name FROM coach_help_templates WHERE id=? AND deleted_at IS NULL LIMIT 1', [requestedHelpId])
    : await database.execute<HelpRow[]>("SELECT id,name FROM coach_help_templates WHERE name='Pour allophones' AND deleted_at IS NULL ORDER BY id LIMIT 1")
  const help = helps[0]
  if (!help) return { helpId: null, helpName: '', reviews: [] }

  const [reviews] = await database.execute<ReviewRow[]>(`SELECT r.verb_id AS verbId,r.status,r.reviewed_at AS reviewedAt,r.issue_count AS issueCount
    FROM coach_help_verb_reviews r
    INNER JOIN coach_help_templates h ON h.id=r.help_id
    WHERE r.help_id=? AND r.audit_version=? AND r.help_updated_at=h.updated_at
    ORDER BY r.verb_id`, [help.id, COACH_HELP_REVIEW_VERSION])
  return {
    helpId: Number(help.id),
    helpName: help.name,
    reviews: reviews.map(review => ({
      verbId: Number(review.verbId), status: review.status,
      issueCount: Number(review.issueCount), reviewedAt: review.reviewedAt,
    })),
  }
})

import { requireLearnerDataSubject } from '../../utils/learner-data-subject'
import { readLearnerPreferences } from '../../services/learner-preferences'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await requireLearnerDataSubject(event)
  return readLearnerPreferences(useDatabase(), learner.id)
})

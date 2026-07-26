import { availableLearnerUsername } from '../../services/learner-username'
import { assertLearnerRateLimit, learnerClientIp } from '../../services/learner-rate-limit'
import { createUsernameProof, requireLearnerRegistrationFlow } from '../../utils/learner-registration'
import { readLimitedJsonBody } from '../../utils/limited-json-body'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const flow = requireLearnerRegistrationFlow(event)
  const body = await readLimitedJsonBody<{ excluded?: unknown }>(event, 8 * 1024)
  const excluded = Array.isArray(body.excluded)
    ? body.excluded.filter((item): item is string => typeof item === 'string').slice(-100)
    : []
  await Promise.all([
    assertLearnerRateLimit(event, {
      bucket: 'username-flow',
      identity: flow.id,
      maximum: 30,
      windowSeconds: 60,
    }),
    assertLearnerRateLimit(event, {
      bucket: 'username-ip',
      identity: learnerClientIp(event),
      maximum: 120,
      windowSeconds: 60,
    }),
  ])
  const username = await availableLearnerUsername(useDatabase(), excluded)
  return {
    username,
    proof: createUsernameProof(flow, username),
  }
})

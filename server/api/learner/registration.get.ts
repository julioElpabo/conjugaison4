import { availableLearnerUsername } from '../../services/learner-username'
import { assertLearnerRateLimit, learnerClientIp } from '../../services/learner-rate-limit'
import { createLearnerRegistrationFlow, createUsernameProof } from '../../utils/learner-registration'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  await assertLearnerRateLimit(event, {
    bucket: 'registration-start-ip',
    identity: learnerClientIp(event),
    maximum: 60,
    windowSeconds: 60,
  })
  const flow = createLearnerRegistrationFlow(event)
  const username = await availableLearnerUsername(useDatabase())
  return {
    username,
    proof: createUsernameProof(flow, username),
  }
})

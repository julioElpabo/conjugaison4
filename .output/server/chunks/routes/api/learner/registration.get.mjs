import { d as defineEventHandler, q as setResponseHeader, u as useDatabase } from '../../../nitro/nitro.mjs';
import { a as availableLearnerUsername } from '../../../_/learner-username.mjs';
import { a as assertLearnerRateLimit, l as learnerClientIp } from '../../../_/learner-rate-limit.mjs';
import { c as createLearnerRegistrationFlow, a as createUsernameProof } from '../../../_/learner-registration.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';

const registration_get = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  await assertLearnerRateLimit(event, {
    bucket: "registration-start-ip",
    identity: learnerClientIp(event),
    maximum: 60,
    windowSeconds: 60
  });
  const flow = createLearnerRegistrationFlow(event);
  const username = await availableLearnerUsername(useDatabase());
  return {
    username,
    proof: createUsernameProof(flow, username)
  };
});

export { registration_get as default };
//# sourceMappingURL=registration.get.mjs.map

import { d as defineEventHandler, q as setResponseHeader, u as useDatabase } from '../../../nitro/nitro.mjs';
import { a as availableLearnerUsername } from '../../../_/learner-username.mjs';
import { a as assertLearnerRateLimit, l as learnerClientIp } from '../../../_/learner-rate-limit.mjs';
import { r as requireLearnerRegistrationFlow, a as createUsernameProof } from '../../../_/learner-registration.mjs';
import { r as readLimitedJsonBody } from '../../../_/limited-json-body.mjs';
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

const usernameSuggestion_post = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const flow = requireLearnerRegistrationFlow(event);
  const body = await readLimitedJsonBody(event, 8 * 1024);
  const excluded = Array.isArray(body.excluded) ? body.excluded.filter((item) => typeof item === "string").slice(-100) : [];
  await Promise.all([
    assertLearnerRateLimit(event, {
      bucket: "username-flow",
      identity: flow.id,
      maximum: 30,
      windowSeconds: 60
    }),
    assertLearnerRateLimit(event, {
      bucket: "username-ip",
      identity: learnerClientIp(event),
      maximum: 120,
      windowSeconds: 60
    })
  ]);
  const username = await availableLearnerUsername(useDatabase(), excluded);
  return {
    username,
    proof: createUsernameProof(flow, username)
  };
});

export { usernameSuggestion_post as default };
//# sourceMappingURL=username-suggestion.post.mjs.map

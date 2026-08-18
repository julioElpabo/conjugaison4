import { d as defineEventHandler, g as getRouterParam, c as createError, n as listAdminChallengePublications, u as useDatabase } from '../../../../../nitro/nitro.mjs';
import { r as requireAdministrator } from '../../../../../_/session.mjs';
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

const index_get = defineEventHandler(async (event) => {
  requireAdministrator(event);
  const presetId = Number(getRouterParam(event, "id"));
  if (!Number.isInteger(presetId) || presetId < 1) {
    throw createError({ statusCode: 400, statusMessage: "D\xE9fi invalide" });
  }
  return { publications: await listAdminChallengePublications(useDatabase(), presetId) };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map

import { d as defineEventHandler, s as setResponseHeader, u as useDatabase } from '../../../nitro/nitro.mjs';
import { p as parseDefiDefinition } from '../../../_/public-api-validation.mjs';
import { r as requireLearnerDataSubject } from '../../../_/learner-data-subject.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'web-push';
import 'mysql2/promise';
import 'node:fs/promises';
import 'node:url';
import '../../../_/challenge-defaults.mjs';
import '../../../_/session.mjs';
import '../../../_/learner-session.mjs';

const savedChallenges_get = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await requireLearnerDataSubject(event);
  const [rows] = await useDatabase().execute(`
    SELECT d.name AS code, d.defi AS definitionJson, saved.saved_at AS savedAt
    FROM learner_saved_challenges saved
    INNER JOIN defis d ON d.id=saved.defi_id
    WHERE saved.account_id=?
    ORDER BY saved.saved_at DESC, d.id DESC
  `, [learner.id]);
  return {
    challenges: rows.flatMap((row) => {
      try {
        const definition = parseDefiDefinition(JSON.parse(row.definitionJson));
        return [{
          code: row.code,
          title: definition.title || `D\xE9fi ${row.code}`,
          description: definition.description || "",
          questionCount: definition.questionCount,
          verbCount: definition.verbIds.length,
          tenseCount: definition.tenseIds.length,
          savedAt: row.savedAt
        }];
      } catch {
        return [];
      }
    })
  };
});

export { savedChallenges_get as default };
//# sourceMappingURL=saved-challenges.get.mjs.map

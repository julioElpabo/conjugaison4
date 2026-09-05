import { d as defineEventHandler, s as setResponseHeader, u as useDatabase, ab as ensureSavedChallengeMetadata, Z as parseDefiDefinition } from '../../../nitro/nitro.mjs';
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
import '../../../_/session.mjs';
import '../../../_/learner-session.mjs';

const savedChallenges_get = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await requireLearnerDataSubject(event);
  const database = useDatabase();
  await ensureSavedChallengeMetadata(database);
  const [rows] = await database.execute(`
    SELECT d.name AS code, d.defi AS definitionJson, saved.saved_at AS savedAt,
      saved.custom_title AS customTitle, saved.custom_description AS customDescription
    FROM learner_saved_challenges saved
    INNER JOIN defis d ON d.id=saved.defi_id
    WHERE saved.account_id=?
    ORDER BY saved.saved_at DESC, d.id DESC
  `, [learner.id]);
  return {
    challenges: rows.flatMap((row) => {
      var _a, _b;
      try {
        const definition = parseDefiDefinition(JSON.parse(row.definitionJson));
        return [{
          code: row.code,
          title: (_a = row.customTitle) != null ? _a : definition.title || `D\xE9fi ${row.code}`,
          description: (_b = row.customDescription) != null ? _b : definition.description || "",
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

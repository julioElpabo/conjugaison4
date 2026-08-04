import { d as defineEventHandler, s as setResponseHeader, u as useDatabase } from '../../../nitro/nitro.mjs';
import { r as requireLearnerDataSubject } from '../../../_/learner-data-subject.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mysql2/promise';
import 'node:url';
import 'node:fs/promises';
import '../../../_/session.mjs';
import '../../../_/learner-session.mjs';

const preferences_get = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await requireLearnerDataSubject(event);
  const [[preferences]] = await useDatabase().execute(`
    SELECT interface_locale AS interfaceLocale, color_theme AS colorTheme
    FROM learner_preferences
    WHERE account_id=?
    LIMIT 1
  `, [learner.id]);
  return {
    interfaceLocale: (preferences == null ? void 0 : preferences.interfaceLocale) || "fr",
    colorTheme: (preferences == null ? void 0 : preferences.colorTheme) === "dark" ? "dark" : "light"
  };
});

export { preferences_get as default };
//# sourceMappingURL=preferences.get.mjs.map

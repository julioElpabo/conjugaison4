import { d as defineEventHandler, q as setResponseHeader, c as createError, u as useDatabase } from '../../../nitro/nitro.mjs';
import { g as getLearnerSession } from '../../../_/learner-session.mjs';
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

const LOCALES = /* @__PURE__ */ new Set(["fr", "de", "en", "it", "es"]);
const THEMES = /* @__PURE__ */ new Set(["light", "dark"]);
const preferences_put = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "no-store");
  const learner = await getLearnerSession(event);
  if (!learner) throw createError({ statusCode: 401, statusMessage: "Authentification requise" });
  const body = await readLimitedJsonBody(event, 4 * 1024);
  const interfaceLocale = String(body.interfaceLocale || "");
  const colorTheme = String(body.colorTheme || "");
  if (!LOCALES.has(interfaceLocale) || !THEMES.has(colorTheme)) {
    throw createError({ statusCode: 400, statusMessage: "Pr\xE9f\xE9rences invalides" });
  }
  await useDatabase().execute(`
    INSERT INTO learner_preferences (account_id, interface_locale, color_theme)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      interface_locale=VALUES(interface_locale),
      color_theme=VALUES(color_theme)
  `, [learner.id, interfaceLocale, colorTheme]);
  return { interfaceLocale, colorTheme };
});

export { preferences_put as default };
//# sourceMappingURL=preferences.put.mjs.map

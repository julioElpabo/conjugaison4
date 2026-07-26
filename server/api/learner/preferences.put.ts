import { getLearnerSession } from '../../utils/learner-session'
import { readLimitedJsonBody } from '../../utils/limited-json-body'

const LOCALES = new Set(['fr', 'de', 'en', 'it', 'es'])
const THEMES = new Set(['light', 'dark'])

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const learner = await getLearnerSession(event)
  if (!learner) throw createError({ statusCode: 401, statusMessage: 'Authentification requise' })
  const body = await readLimitedJsonBody<{ interfaceLocale?: unknown, colorTheme?: unknown }>(event, 4 * 1024)
  const interfaceLocale = String(body.interfaceLocale || '')
  const colorTheme = String(body.colorTheme || '')
  if (!LOCALES.has(interfaceLocale) || !THEMES.has(colorTheme)) {
    throw createError({ statusCode: 400, statusMessage: 'Préférences invalides' })
  }
  await useDatabase().execute(`
    INSERT INTO learner_preferences (account_id, interface_locale, color_theme)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      interface_locale=VALUES(interface_locale),
      color_theme=VALUES(color_theme)
  `, [learner.id, interfaceLocale, colorTheme])
  return { interfaceLocale, colorTheme }
})

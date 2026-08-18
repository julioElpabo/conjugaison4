import {
  ADMIN_PUSH_PREFERENCE_KEYS,
  type AdminPushPreferences,
  updateAdminPushPreferences,
} from '../../../services/admin-push-notifications'
import { readLimitedJsonBody } from '../../../utils/limited-json-body'

interface PreferencesBody {
  endpoint?: unknown
  preferences?: Record<string, unknown>
}

export default defineEventHandler(async (event) => {
  const administrator = requireAdministrator(event)
  const body = await readLimitedJsonBody<PreferencesBody>(event, 8 * 1024)
  const endpoint = typeof body?.endpoint === 'string' ? body.endpoint.trim() : ''
  if (!endpoint || !body?.preferences || typeof body.preferences !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Préférences de notifications invalides' })
  }
  const preferences = Object.fromEntries(ADMIN_PUSH_PREFERENCE_KEYS.map(key => [key, body.preferences?.[key]]))
  if (Object.values(preferences).some(value => typeof value !== 'boolean')) {
    throw createError({ statusCode: 400, statusMessage: 'Chaque préférence doit être activée ou désactivée' })
  }
  return {
    ok: true,
    preferences: await updateAdminPushPreferences(
      administrator.id,
      endpoint,
      preferences as AdminPushPreferences,
    ),
  }
})

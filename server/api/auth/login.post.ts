import bcrypt from 'bcryptjs'
import type { RowDataPacket } from 'mysql2/promise'
import { normalizeLocale } from '../../../shared/i18n/locales'
import {
  assertAdminLoginAllowed,
  clearAdminLoginFailures,
  recordAdminLoginFailure,
} from '../../services/admin-login-rate-limit'

const DUMMY_PASSWORD_HASH = '$2b$12$ty1Uz4EKY7VWSotpC21BLenXpmauqgEttD16EEzo2wp8oeuu2aawq'

interface UserRow extends RowDataPacket {
  id: number
  prenom: string
  nom: string
  email: string
  username: string
  password: string
  privilege_id: number
  interface_locale: string
  explanation_locale: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: unknown, password?: unknown }>(event)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!email || !password || email.length > 254 || password.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Identifiants invalides' })
  }

  await assertAdminLoginAllowed(event, email)

  const [rows] = await useDatabase().execute<UserRow[]>(`
    SELECT id, prenom, nom, email, username, password, privilege_id,
           interface_locale, explanation_locale
    FROM users
    WHERE LOWER(email) = ?
    LIMIT 1
  `, [email])

  const row = rows[0]
  const compatibleHash = row?.password.replace(/^\$2y\$/, '$2b$') ?? DUMMY_PASSWORD_HASH
  const passwordIsValid = await bcrypt.compare(password, compatibleHash)

  if (!row || !passwordIsValid || row.privilege_id !== 1) {
    await recordAdminLoginFailure(event, email)
    throw createError({ statusCode: 401, statusMessage: 'Email ou mot de passe incorrect' })
  }

  await clearAdminLoginFailures(event, email)
  const user = {
    id: row.id,
    prenom: row.prenom,
    nom: row.nom,
    email: row.email,
    username: row.username,
    privilegeId: row.privilege_id,
    interfaceLocale: normalizeLocale(row.interface_locale),
    explanationLocale: normalizeLocale(row.explanation_locale),
  }

  createAdminSession(event, user)
  return { user }
})

import type { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise'

type DatabaseExecutor = Pool | PoolConnection

interface IdentityRow extends RowDataPacket { id: number }
interface PrivilegeRow extends RowDataPacket { id: number }

export interface AdminUserInput {
  prenom: string
  nom: string
  email: string
  username: string
  password: string
  privilegeId: number
}

function text(value: unknown, maximum = 255) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

export function parseAdminUserInput(value: unknown, passwordRequired: boolean): AdminUserInput {
  const body = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const input = {
    prenom: text(body.prenom),
    nom: text(body.nom),
    email: text(body.email, 254).toLocaleLowerCase('fr-CH'),
    username: text(body.username),
    password: typeof body.password === 'string' ? body.password : '',
    privilegeId: Number(body.privilegeId),
  }

  if (
    !input.prenom
    || !input.nom
    || !input.username
    || !/^\S+@\S+\.\S+$/u.test(input.email)
    || !Number.isInteger(input.privilegeId)
    || (passwordRequired && input.password.length < 10)
    || input.password.length > 200
    || (!passwordRequired && input.password.length > 0 && input.password.length < 10)
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Données utilisateur invalides' })
  }
  return input
}

export async function assertPrivilegeExists(database: DatabaseExecutor, privilegeId: number) {
  const [rows] = await database.execute<PrivilegeRow[]>('SELECT id FROM privileges WHERE id = ? LIMIT 1', [privilegeId])
  if (!rows[0]) throw createError({ statusCode: 400, statusMessage: 'Privilège inconnu' })
}

export async function assertUserIdentityAvailable(
  database: DatabaseExecutor,
  email: string,
  username: string,
  excludedId = 0
) {
  const [rows] = await database.execute<IdentityRow[]>(`
    SELECT id FROM users
    WHERE (LOWER(email) = ? OR LOWER(username) = ?)
      AND id <> ?
    LIMIT 1
  `, [email.toLocaleLowerCase('fr-CH'), username.toLocaleLowerCase('fr-CH'), excludedId])
  if (rows[0]) {
    throw createError({ statusCode: 409, statusMessage: 'Cette adresse e-mail ou ce nom d’utilisateur est déjà utilisé' })
  }
}

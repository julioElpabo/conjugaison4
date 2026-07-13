import bcrypt from 'bcryptjs'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { assertPrivilegeExists, assertUserIdentityAvailable, parseAdminUserInput } from '../../../services/admin-users'

interface ExistingRow extends RowDataPacket { id: number }

export default defineEventHandler(async (event) => {
  const administrator = requireAdministrator(event)
  const id = Number.parseInt(getRouterParam(event, 'id') || '', 10)
  if (!Number.isInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Utilisateur invalide' })

  const input = parseAdminUserInput(await readBody<unknown>(event), false)
  if (administrator.id === id && input.privilegeId !== 1) {
    throw createError({ statusCode: 400, statusMessage: 'Vous ne pouvez pas retirer vos propres droits administrateur' })
  }

  const database = useDatabase()
  const [[existing]] = await database.execute<ExistingRow[]>('SELECT id FROM users WHERE id = ? LIMIT 1', [id])
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
  await Promise.all([
    assertPrivilegeExists(database, input.privilegeId),
    assertUserIdentityAvailable(database, input.email, input.username, id),
  ])

  const values: Array<string | number> = [input.prenom, input.nom, input.email, input.username, input.privilegeId]
  let passwordClause = ''
  if (input.password) {
    passwordClause = ', password = ?'
    values.push(await bcrypt.hash(input.password, 12))
  }
  values.push(id)
  const [result] = await database.execute<ResultSetHeader>(`
    UPDATE users SET prenom = ?, nom = ?, email = ?, username = ?, privilege_id = ?,
      modified = CURRENT_TIMESTAMP ${passwordClause}
    WHERE id = ?
  `, values)
  if (result.affectedRows !== 1) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
  if (administrator.id === id) {
    createAdminSession(event, {
      id,
      prenom: input.prenom,
      nom: input.nom,
      email: input.email,
      username: input.username,
      privilegeId: input.privilegeId,
    })
  }
  return { ok: true, id }
})

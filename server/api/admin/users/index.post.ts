import bcrypt from 'bcryptjs'
import type { ResultSetHeader } from 'mysql2/promise'
import { assertPrivilegeExists, assertUserIdentityAvailable, parseAdminUserInput } from '../../../services/admin-users'

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const input = parseAdminUserInput(await readBody<unknown>(event), true)
  const database = useDatabase()
  await Promise.all([
    assertPrivilegeExists(database, input.privilegeId),
    assertUserIdentityAvailable(database, input.email, input.username),
  ])
  const password = await bcrypt.hash(input.password, 12)
  const [result] = await database.execute<ResultSetHeader>(`
    INSERT INTO users (prenom, nom, email, username, password, privilege_id, created, modified)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `, [input.prenom, input.nom, input.email, input.username, password, input.privilegeId])
  return { ok: true, id: result.insertId }
})

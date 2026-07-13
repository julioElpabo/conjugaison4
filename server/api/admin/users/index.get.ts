import type { RowDataPacket } from 'mysql2/promise'

interface UserRow extends RowDataPacket {
  id: number
  prenom: string
  nom: string
  email: string
  username: string
  privilegeId: number
  privilegeName: string
  created: Date | string
  modified: Date | string | null
}

interface PrivilegeRow extends RowDataPacket { id: number, name: string }

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const database = useDatabase()
  const [[users], [privileges]] = await Promise.all([
    database.execute<UserRow[]>(`
      SELECT u.id, u.prenom, u.nom, u.email, u.username,
        u.privilege_id AS privilegeId, p.name AS privilegeName,
        u.created, u.modified
      FROM users u
      INNER JOIN privileges p ON p.id = u.privilege_id
      ORDER BY u.nom, u.prenom, u.id
    `),
    database.execute<PrivilegeRow[]>('SELECT id, name FROM privileges ORDER BY `order`, id'),
  ])
  return { users, privileges }
})

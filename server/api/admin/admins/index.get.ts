import type { RowDataPacket } from 'mysql2/promise'

interface UserRow extends RowDataPacket {
  id: number
  prenom: string
  nom: string
  email: string
  username: string
  created: Date | string
  modified: Date | string | null
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const database = useDatabase()
  const [users] = await database.execute<UserRow[]>(`
      SELECT u.id, u.prenom, u.nom, u.email, u.username,
        u.created, u.modified
      FROM users u
      WHERE u.privilege_id = 1
      ORDER BY u.nom, u.prenom, u.id
    `)
  return { users }
})

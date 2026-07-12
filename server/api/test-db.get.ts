import type { RowDataPacket } from 'mysql2/promise'

interface DatabaseStatus extends RowDataPacket {
  database_name: string
  server_time: Date
}

export default defineEventHandler(async () => {
  try {
    const [rows] = await useDatabase().execute<DatabaseStatus[]>(`
      SELECT DATABASE() AS database_name, NOW() AS server_time
    `)

    return rows[0]
  } catch (error) {
    console.error('Connexion MySQL impossible :', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Connexion MySQL impossible'
    })
  }
})

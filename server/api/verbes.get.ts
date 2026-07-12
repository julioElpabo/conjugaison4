import type { RowDataPacket } from 'mysql2/promise'

interface VerbeRow extends RowDataPacket {
  infinitif: string
}

export default defineEventHandler(async () => {
  try {
    const [verbes] = await useDatabase().execute<VerbeRow[]>(`
      SELECT infinitif
      FROM verbes
      ORDER BY infinitif
      LIMIT 500
    `)

    return verbes.map(({ infinitif }) => ({ infinitif }))
  } catch (error) {
    console.error('Impossible de récupérer les verbes :', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Impossible de récupérer les verbes'
    })
  }
})

import type { RowDataPacket } from 'mysql2/promise'

interface StatsRow extends RowDataPacket {
  date: string
  homepage: number
  creationpdf: number
  sauvedefi: number
  chargedefi: number
  exercer: number
  exercersimple: number
  resultat: number
  resultatsimple: number
}

export default defineEventHandler(async (event) => {
  requireAdministrator(event)
  const [rows] = await useDatabase().execute<StatsRow[]>(`
    SELECT DATE(created) AS date,
      SUM(homepage) AS homepage,
      SUM(creationpdf) AS creationpdf,
      SUM(sauvedefi) AS sauvedefi,
      SUM(chargedefi) AS chargedefi,
      SUM(exercer) AS exercer,
      SUM(exercersimple) AS exercersimple,
      SUM(resultat) AS resultat,
      SUM(resultatsimple) AS resultatsimple
    FROM logs
    WHERE created >= CURRENT_DATE - INTERVAL 30 DAY
    GROUP BY DATE(created)
    ORDER BY DATE(created)
  `)

  return { days: rows }
})

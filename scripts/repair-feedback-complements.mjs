import mysql from 'mysql2/promise'
import { repairFeedbackComplements } from '../server/services/feedback-complement-repairs.ts'

const apply = process.argv.includes('--apply')
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || process.env.NUXT_DB_HOST,
  port: Number(process.env.DB_PORT || process.env.NUXT_DB_PORT || 3306),
  database: process.env.DB_NAME || process.env.NUXT_DB_NAME,
  user: process.env.DB_USER || process.env.NUXT_DB_USER,
  password: process.env.DB_PASSWORD || process.env.NUXT_DB_PASSWORD,
})

try {
  await connection.beginTransaction()
  const repairs = await repairFeedbackComplements(connection, apply)
  if (apply) await connection.commit()
  else await connection.rollback()
  console.log(JSON.stringify({ mode: apply ? 'appliqué' : 'simulation', repairs }, null, 2))
} catch (error) {
  await connection.rollback()
  throw error
} finally {
  await connection.end()
}

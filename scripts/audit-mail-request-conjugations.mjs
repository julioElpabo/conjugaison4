import mysql from 'mysql2/promise'
import { auditFiniteParadigms, repairMailRequestConjugations } from '../server/services/mail-request-repairs.ts'

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
  const repairs = await repairMailRequestConjugations(connection)
  const issues = await auditFiniteParadigms(connection)
  if (apply) await connection.commit()
  else await connection.rollback()
  console.log(JSON.stringify({ mode: apply ? 'appliqué' : 'simulation', repairs, issues }, null, 2))
  if (issues.length) process.exitCode = 1
} catch (error) {
  await connection.rollback()
  throw error
} finally {
  await connection.end()
}

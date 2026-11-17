import mysql from 'mysql2/promise'
import { importFleVerbBatch } from '../server/services/fle-verb-import.ts'

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || process.env.NUXT_DB_HOST,
  port: Number(process.env.DB_PORT || process.env.NUXT_DB_PORT || 3306),
  database: process.env.DB_NAME || process.env.NUXT_DB_NAME,
  user: process.env.DB_USER || process.env.NUXT_DB_USER,
  password: process.env.DB_PASSWORD || process.env.NUXT_DB_PASSWORD,
})
try {
  const report = await importFleVerbBatch(connection, { apply: process.argv.includes('--apply') })
  const { tenses, ...summary } = report
  console.log(JSON.stringify(summary, null, 2))
} finally {
  await connection.end()
}

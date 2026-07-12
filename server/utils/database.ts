import mysql, { type Pool } from 'mysql2/promise'

let pool: Pool | undefined

export function useDatabase(): Pool {
  if (pool) {
    return pool
  }

  const config = useRuntimeConfig()
  const missing = [
    ['DB_HOST', config.dbHost],
    ['DB_NAME', config.dbName],
    ['DB_USER', config.dbUser]
  ].filter(([, value]) => !value)

  if (missing.length > 0) {
    throw new Error(`Configuration MySQL manquante : ${missing.map(([name]) => name).join(', ')}`)
  }

  pool = mysql.createPool({
    host: config.dbHost,
    port: config.dbPort,
    database: config.dbName,
    user: config.dbUser,
    password: config.dbPassword,
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4'
  })

  return pool
}

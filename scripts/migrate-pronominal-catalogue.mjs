import mysql from 'mysql2/promise'
import { migratePronominalUses } from '../server/services/pronominal-use-migration.ts'

const apply = process.argv.includes('--apply')
const databaseConfig = {
  host: process.env.DB_HOST || process.env.NUXT_DB_HOST,
  port: Number(process.env.DB_PORT || process.env.NUXT_DB_PORT || 3306),
  database: process.env.DB_NAME || process.env.NUXT_DB_NAME,
  user: process.env.DB_USER || process.env.NUXT_DB_USER,
  password: process.env.DB_PASSWORD || process.env.NUXT_DB_PASSWORD,
}

if (!databaseConfig.host || !databaseConfig.database || !databaseConfig.user) {
  throw new Error(
    'Configuration MySQL absente (DB_* ou NUXT_DB_*). '
    + 'Dans Plesk, déployez le code puis redémarrez l’application : '
    + 'le plugin serveur appliquera automatiquement cette migration.'
  )
}

const connection = await mysql.createConnection(databaseConfig)

try {
  await connection.beginTransaction()
  const result = await migratePronominalUses(connection)
  if (apply) await connection.commit()
  else await connection.rollback()
  console.log(
    `${apply ? 'Migration appliquée' : 'Simulation réussie'} : `
    + `${result.inserted} emploi(s) ajouté(s), ${result.reactivated} réactivé(s), `
    + `${result.activeUseCount} emploi(s) pronominal(aux) actif(s).`
  )
}
catch (error) {
  await connection.rollback()
  throw error
}
finally {
  await connection.end()
}

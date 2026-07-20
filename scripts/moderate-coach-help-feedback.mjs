import mysql from 'mysql2/promise'

const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, '').split('=')
  return [key, rest.join('=') || '1']
}))

const ids = String(args.get('ids') || '')
  .split(',')
  .map(value => Number(value.trim()))
  .filter(value => Number.isInteger(value) && value > 0)
const remove = args.has('remove')
const restore = args.has('restore')
const reason = String(args.get('reason') || '').trim().slice(0, 500)

if (!ids.length || remove === restore) {
  console.error('Usage : npm run data:moderate-coach-help-feedback -- --remove --ids=1,2 --reason="contenu inutile"')
  console.error('        npm run data:moderate-coach-help-feedback -- --restore --ids=1,2 --reason="restauré"')
  process.exit(1)
}

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

try {
  const placeholders = ids.map(() => '?').join(',')
  const [result] = remove
    ? await database.execute(
        `UPDATE coach_help_feedback
         SET moderation_status='removed', moderation_note=?, moderated_at=CURRENT_TIMESTAMP, deleted_at=CURRENT_TIMESTAMP
         WHERE id IN (${placeholders})`,
        [reason || 'Retiré par modération', ...ids],
      )
    : await database.execute(
        `UPDATE coach_help_feedback
         SET moderation_status='active', moderation_note=?, moderated_at=CURRENT_TIMESTAMP, deleted_at=NULL
         WHERE id IN (${placeholders})`,
        [reason || 'Restauré par modération', ...ids],
      )

  console.log(`${result.affectedRows || 0} retour(s) ${remove ? 'retiré(s)' : 'restauré(s)'}.`)
}
finally {
  await database.end()
}

import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import mysql from 'mysql2/promise'

const database = await mysql.createConnection({
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), database: process.env.DB_NAME,
  user: process.env.DB_USER, password: process.env.DB_PASSWORD, charset: 'utf8mb4',
})
const publicRoot = join(process.cwd(), 'public', 'coach-media')
const groups = [
  { directory: 'animations/happy', prefix: 'Heureux', type: 'animation', category: 'success', alt: 'Animation joyeuse après une réussite' },
  { directory: 'animations/bravo', prefix: 'Bravo', type: 'animation', category: 'success', alt: 'Animation de félicitations' },
  { directory: 'animations/surprise', prefix: 'Surprise', type: 'animation', category: 'encouragement', alt: 'Animation de surprise après une erreur' },
  { directory: 'animations/fail', prefix: 'À vérifier', type: 'animation', category: 'encouragement', alt: 'Animation après une erreur' },
  { directory: 'emojis/heureux', prefix: 'Émoji heureux', type: 'emoji', category: 'success', alt: 'Émoji joyeux de félicitations' },
  { directory: 'emojis/triste', prefix: 'Émoji encouragement', type: 'emoji', category: 'encouragement', alt: 'Émoji après une réponse incorrecte' },
  { directory: 'emojis/muet', prefix: 'Émoji réflexion', type: 'emoji', category: 'neutral', alt: 'Émoji de réflexion' },
  { directory: 'emojis/danger', prefix: 'Émoji attention', type: 'emoji', category: 'neutral', alt: 'Émoji signalant un point d’attention' },
]
const approvedSuccessAnimations = [
  '/coach-media/animations/bravo/bravo1.webp',
  '/coach-media/animations/happy/happy4.webp',
  '/coach-media/animations/happy/happy5.webp',
  '/coach-media/animations/happy/happy8.webp',
]
const approvedErrorAnimations = [
  '/coach-media/animations/surprise/surprise4.webp',
  '/coach-media/animations/surprise/surprise6.webp',
  '/coach-media/animations/surprise/surprise8.webp',
  '/coach-media/animations/surprise/surprise9.webp',
]

try {
  for (const group of groups) {
    const files = (await readdir(join(publicRoot, group.directory))).filter(file => !file.startsWith('.')).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))
    for (const [index, file] of files.entries()) {
      const details = await stat(join(publicRoot, group.directory, file))
      const path = `/coach-media/${group.directory}/${file}`
      const isEmoji = group.type === 'emoji'
      await database.execute(`INSERT INTO coach_media
        (name,file_path,media_type,category,alt_text,rights_status,safety_status,is_active,file_size)
        VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name), file_size=VALUES(file_size)`,
      [`${group.prefix} ${index + 1}`, path, group.type, group.category, group.alt,
        isEmoji ? 'verified' : 'pending', isEmoji ? 'approved' : 'pending', 1, details.size])
    }
  }

  const approvedAnimationPaths = [...approvedSuccessAnimations, ...approvedErrorAnimations]
  await database.query(`UPDATE coach_media SET rights_status='verified', safety_status='approved'
    WHERE file_path IN (${approvedAnimationPaths.map(() => '?').join(',')})`, approvedAnimationPaths)

  const [characters] = await database.execute("SELECT id FROM coach_characters WHERE status='published' ORDER BY sort_order")
  const [defaultMedia] = await database.execute(`SELECT id,category FROM coach_media
    WHERE media_type IN ('emoji','animation') AND is_active=1 ORDER BY id`)
  await database.execute(`DELETE a FROM coach_character_media_assignments a
    JOIN coach_media m ON m.id=a.media_id WHERE m.media_type IN ('emoji','animation')`)
  for (const character of characters) {
    for (const media of defaultMedia) {
      const eventType = media.category === 'success' ? 'correct' : media.category === 'encouragement' ? 'incorrect'
        : media.category === 'finish' ? 'finish' : media.category === 'welcome' ? 'introduction' : 'question'
      await database.execute(`INSERT INTO coach_character_media_assignments (character_id,media_id,event_type,weight,is_active)
        VALUES (?,?,?,1,1)`, [character.id, media.id, eventType])
    }
    for (const [eventType, probability] of [['correct', 1], ['correct-alternative', 1], ['incorrect', 1], ['streak', 0.8], ['finish', 1]]) {
      await database.execute(`INSERT INTO coach_character_reaction_rules (character_id,event_type,media_probability,animation_probability,emoji_probability,cooldown_questions)
        VALUES (?,?,?,?,?,2) ON DUPLICATE KEY UPDATE event_type=event_type`,
      [character.id, eventType, probability, probability, probability])
    }
  }
  const [[integrity]] = await database.query(`SELECT
    (SELECT COUNT(*) FROM coach_media WHERE media_type='animation' AND rights_status='verified' AND safety_status='approved') AS animations,
    (SELECT COUNT(DISTINCT character_id) FROM coach_character_media_assignments WHERE event_type='correct') AS success_characters,
    (SELECT COUNT(DISTINCT character_id) FROM coach_character_media_assignments WHERE event_type='incorrect') AS error_characters`)
  if (Number(integrity.animations) < 8 || Number(integrity.success_characters) !== 4 || Number(integrity.error_characters) !== 4) {
    throw new Error(`Attribution des médias incomplète : ${JSON.stringify(integrity)}`)
  }
  console.log(`${groups.length} groupes importés : ${integrity.animations} animations validées, réussites et erreurs couvertes pour 4 caractères.`)
} finally {
  await database.end()
}

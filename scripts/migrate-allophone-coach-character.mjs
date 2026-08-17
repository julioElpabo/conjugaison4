export const ALLOPHONE_CHARACTER_MIGRATION_KEY = '2026-08-16-allophone-coach-character-v1'

export const allophoneReplySeeds = [
  ['cod-after', '« {complement} » arrive après « {verb} » : pas d’accord, « {participle} » !', 0],
  ['cod-before', 'Le COD « {complement} » est devant « {verb} » : accord obligatoire avec  {complement} . Le participe est :  « {participle} » !', 1],
  ['coi', 'Attention au piège : « {complement} » est un COI, donc aucun accord !', 2],
  ['correct', "C'est juste !", 3],
  ['correct-alternative', "C'est juste ! Il y a aussi une autre possibilité.", 4],
  ['encouragement', 'Courage !', 5],
  ['finish', 'Terminé ! {score} % avec {correctCount} bonnes réponses.', 6],
  ['incorrect', "C'est faux. La bonne réponse est  <b>« {expectedAnswer} »</b>.", 7],
  ['introduction', 'Bonjour ! Commençons tout de suite !', 8],
  ['restart', 'Nouveau départ, c’est parti !', 9],
  ['streak', 'Super série !', 10],
  ['question', 'Nouvelle question !', 11],
  ['streak', 'Tu es en plein forme !', 12],
  ['help-announcement', "C'est difficile, courage !", 13],
  ['encouragement', 'Ne te décourage pas !', 14],
]

export const allophoneReactionRuleSeeds = [
  ['correct', 1, 1, 1, 2],
  ['correct-alternative', 1, 1, 1, 2],
  ['finish', 0, 0, 0, 2],
  ['incorrect', 1, 1, 1, 2],
  ['streak', 0.8, 0.8, 0.8, 2],
]

export async function ensureCoachConfigurationMigrations(connection) {
  await connection.query(`CREATE TABLE IF NOT EXISTS coach_configuration_migrations (
    migration_key VARCHAR(120) NOT NULL PRIMARY KEY,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
}

export async function migrateAllophoneCoachCharacter(connection) {
  const [[alreadyApplied]] = await connection.execute(
    'SELECT 1 AS applied FROM coach_configuration_migrations WHERE migration_key=? LIMIT 1 FOR UPDATE',
    [ALLOPHONE_CHARACTER_MIGRATION_KEY],
  )
  if (alreadyApplied) return { applied: false, replyCount: 0, ruleCount: 0 }

  await connection.execute(`INSERT INTO coach_help_approaches
    (slug,name,engine_key,sort_order,status)
    VALUES ('allophone','Allophone','allophone',4,'published')
    ON DUPLICATE KEY UPDATE name=VALUES(name),engine_key=VALUES(engine_key),
      sort_order=VALUES(sort_order),status=VALUES(status)`)

  const [[approach]] = await connection.execute(
    "SELECT id FROM coach_help_approaches WHERE slug='allophone' LIMIT 1 FOR UPDATE",
  )
  if (!approach) throw new Error('Approche d’aide allophone introuvable.')

  await connection.execute(`INSERT INTO coach_characters
    (slug,name,masculine_name,emoticon,pedagogical_style,help_approach_id,status,sort_order)
    VALUES ('allophone','Aide pour les personnes allophones','Aide pour les personnes allophones','🤝',?,?, 'published',5)
    ON DUPLICATE KEY UPDATE
      name=VALUES(name),masculine_name=VALUES(masculine_name),emoticon=VALUES(emoticon),
      pedagogical_style=VALUES(pedagogical_style),help_approach_id=VALUES(help_approach_id),
      status=VALUES(status),sort_order=VALUES(sort_order)`, [
    'Explique et donne les réponses avec des mots simples. Lecture audio.',
    approach.id,
  ])

  const [[character]] = await connection.execute(
    "SELECT id FROM coach_characters WHERE slug='allophone' LIMIT 1 FOR UPDATE",
  )
  if (!character) throw new Error('Caractère allophone introuvable après synchronisation.')

  await connection.execute('DELETE FROM coach_character_reply_templates WHERE character_id=?', [character.id])
  for (const [eventType, content, sortOrder] of allophoneReplySeeds) {
    await connection.execute(`INSERT INTO coach_character_reply_templates
      (character_id,event_type,content,weight,is_active,sort_order) VALUES (?,?,?,1,1,?)`,
    [character.id, eventType, content, sortOrder])
  }

  await connection.execute('DELETE FROM coach_character_media_assignments WHERE character_id=?', [character.id])
  await connection.execute(`INSERT INTO coach_character_media_assignments
    (character_id,media_id,event_type,weight,is_active)
    SELECT ?,media.id,CASE media.category
      WHEN 'success' THEN 'correct'
      WHEN 'encouragement' THEN 'incorrect'
      WHEN 'neutral' THEN 'question'
    END,1,1
    FROM coach_media media
    WHERE media.category IN ('success','encouragement','neutral')`, [character.id])

  await connection.execute('DELETE FROM coach_character_reaction_rules WHERE character_id=?', [character.id])
  for (const [eventType, mediaProbability, animationProbability, emojiProbability, cooldownQuestions] of allophoneReactionRuleSeeds) {
    await connection.execute(`INSERT INTO coach_character_reaction_rules
      (character_id,event_type,media_probability,animation_probability,emoji_probability,cooldown_questions)
      VALUES (?,?,?,?,?,?)`, [
      character.id, eventType, mediaProbability, animationProbability, emojiProbability, cooldownQuestions,
    ])
  }

  await connection.execute(`INSERT INTO coach_character_translations
    (character_id,locale,masculine_name,pedagogical_style)
    VALUES (?,'fr','Pour les personnes qui apprennent le français','Aide pour les personnes allophones 2')
    ON DUPLICATE KEY UPDATE masculine_name=VALUES(masculine_name),pedagogical_style=VALUES(pedagogical_style)`,
  [character.id])

  const [assignmentResult] = await connection.execute(`UPDATE coaches
    SET character_id=? WHERE slug IN ('claire-dubois','hugo-martin')`, [character.id])

  await connection.execute(
    'INSERT INTO coach_configuration_migrations (migration_key) VALUES (?)',
    [ALLOPHONE_CHARACTER_MIGRATION_KEY],
  )

  return {
    applied: true,
    replyCount: allophoneReplySeeds.length,
    ruleCount: allophoneReactionRuleSeeds.length,
    coachCount: Number(assignmentResult.affectedRows || 0),
  }
}

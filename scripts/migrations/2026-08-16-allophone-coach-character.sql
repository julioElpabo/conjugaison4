-- Synchronise le caractère « Aide pour les personnes allophones » avec la
-- configuration locale validée, puis l’attribue à Claire et Hugo.
-- Le script repose uniquement sur des slugs stables : aucun ID local n’est exporté.

START TRANSACTION;

INSERT INTO coach_help_approaches (slug,name,engine_key,sort_order,status)
VALUES ('allophone','Allophone','allophone',4,'published')
ON DUPLICATE KEY UPDATE
  name=VALUES(name),engine_key=VALUES(engine_key),sort_order=VALUES(sort_order),status=VALUES(status);

INSERT INTO coach_characters
  (slug,name,masculine_name,emoticon,pedagogical_style,help_approach_id,status,sort_order)
SELECT
  'allophone',
  'Aide pour les personnes allophones',
  'Aide pour les personnes allophones',
  '🤝',
  'Explique et donne les réponses avec des mots simples. Lecture audio.',
  approach.id,
  'published',
  5
FROM coach_help_approaches approach
WHERE approach.slug='allophone'
ON DUPLICATE KEY UPDATE
  name=VALUES(name),
  masculine_name=VALUES(masculine_name),
  emoticon=VALUES(emoticon),
  pedagogical_style=VALUES(pedagogical_style),
  help_approach_id=VALUES(help_approach_id),
  status=VALUES(status),
  sort_order=VALUES(sort_order);

SET @allophone_character_id := (
  SELECT id FROM coach_characters WHERE slug='allophone' LIMIT 1
);

DELETE FROM coach_character_reply_templates
WHERE character_id=@allophone_character_id;

INSERT INTO coach_character_reply_templates
  (character_id,event_type,content,weight,is_active,sort_order)
VALUES
  (@allophone_character_id,'cod-after','« {complement} » arrive après « {verb} » : pas d’accord, « {participle} » !',1,1,0),
  (@allophone_character_id,'cod-before','Le COD « {complement} » est devant « {verb} » : accord obligatoire avec  {complement} . Le participe est :  « {participle} » !',1,1,1),
  (@allophone_character_id,'coi','Attention au piège : « {complement} » est un COI, donc aucun accord !',1,1,2),
  (@allophone_character_id,'correct','C''est juste !',1,1,3),
  (@allophone_character_id,'correct-alternative','C''est juste ! Il y a aussi une autre possibilité.',1,1,4),
  (@allophone_character_id,'encouragement','Courage !',1,1,5),
  (@allophone_character_id,'finish','Terminé ! {score} % avec {correctCount} bonnes réponses.',1,1,6),
  (@allophone_character_id,'incorrect','C''est faux. La bonne réponse est  <b>« {expectedAnswer} »</b>.',1,1,7),
  (@allophone_character_id,'introduction','Bonjour ! Commençons tout de suite !',1,1,8),
  (@allophone_character_id,'restart','Nouveau départ, c’est parti !',1,1,9),
  (@allophone_character_id,'streak','Super série !',1,1,10),
  (@allophone_character_id,'question','Nouvelle question !',1,1,11),
  (@allophone_character_id,'streak','Tu es en plein forme !',1,1,12),
  (@allophone_character_id,'help-announcement','C''est difficile, courage !',1,1,13),
  (@allophone_character_id,'encouragement','Ne te décourage pas !',1,1,14);

DELETE FROM coach_character_media_assignments
WHERE character_id=@allophone_character_id;

INSERT INTO coach_character_media_assignments
  (character_id,media_id,event_type,weight,is_active)
SELECT
  @allophone_character_id,
  media.id,
  CASE media.category
    WHEN 'success' THEN 'correct'
    WHEN 'encouragement' THEN 'incorrect'
    WHEN 'neutral' THEN 'question'
  END,
  1,
  1
FROM coach_media media
WHERE media.category IN ('success','encouragement','neutral');

DELETE FROM coach_character_reaction_rules
WHERE character_id=@allophone_character_id;

INSERT INTO coach_character_reaction_rules
  (character_id,event_type,media_probability,animation_probability,emoji_probability,cooldown_questions)
VALUES
  (@allophone_character_id,'correct',1,1,1,2),
  (@allophone_character_id,'correct-alternative',1,1,1,2),
  (@allophone_character_id,'finish',0,0,0,2),
  (@allophone_character_id,'incorrect',1,1,1,2),
  (@allophone_character_id,'streak',0.8,0.8,0.8,2);

INSERT INTO coach_character_translations
  (character_id,locale,masculine_name,pedagogical_style)
VALUES
  (@allophone_character_id,'fr','Pour les personnes qui apprennent le français','Aide pour les personnes allophones 2')
ON DUPLICATE KEY UPDATE
  masculine_name=VALUES(masculine_name),
  pedagogical_style=VALUES(pedagogical_style);

UPDATE coaches
SET character_id=@allophone_character_id
WHERE slug IN ('claire-dubois','hugo-martin');

COMMIT;

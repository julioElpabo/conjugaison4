import mysql from 'mysql2/promise'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

const coachSeeds = [
  ['camille-morel', 'Camille', 'Morel', 'female', '/coach-media/avatars/camille.jpg', 'Encourageante et rassurante', 'chaleureuse', 'Encourage avant d’expliquer la règle.', '#2f7d73', 1],
  ['nora-benali', 'Nora', 'Benali', 'female', '/coach-media/avatars/nora.jpg', 'Bienveillante et attentive', 'chaleureuse', 'Rassure, valorise l’effort et explique avec douceur.', '#4b8f82', 2],
  ['lucas-meyer', 'Lucas', 'Meyer', 'male', '/coach-media/avatars/lucas.jpg', 'Positif et encourageant', 'chaleureuse', 'Aide à reprendre confiance avant de revenir sur la règle.', '#3d756b', 3],
  ['sami-diallo', 'Sami', 'Diallo', 'male', '/coach-media/avatars/sami.jpg', 'Méthodique et précis', 'méthodique', 'Décompose chaque difficulté en étapes.', '#315f87', 4],
  ['claire-dubois', 'Claire', 'Dubois', 'female', '/coach-media/avatars/claire.jpg', 'Structurée et pédagogue', 'méthodique', 'Fait repérer les indices avant de construire la réponse.', '#536f9a', 5],
  ['thomas-nguyen', 'Thomas', 'Nguyen', 'male', '/coach-media/avatars/thomas.jpg', 'Logique et rigoureux', 'méthodique', 'Transforme chaque difficulté en une courte méthode.', '#395979', 6],
  ['zoe-laurent', 'Zoé', 'Laurent', 'female', '/coach-media/avatars/zoe.jpg', 'Dynamique et enthousiaste', 'dynamique', 'Donne du rythme et célèbre les progrès.', '#a34f72', 7],
  ['amel-costa', 'Amel', 'Costa', 'female', '/coach-media/avatars/amel.jpg', 'Enjouée et spontanée', 'dynamique', 'Relance rapidement et souligne chaque petite victoire.', '#b55b78', 8],
  ['hugo-martin', 'Hugo', 'Martin', 'male', '/coach-media/avatars/hugo.jpg', 'Énergique et motivant', 'dynamique', 'Maintient un rythme soutenu avec des défis courts.', '#8e496d', 9],
  ['gabriel-rossi', 'Gabriel', 'Rossi', 'male', '/coach-media/avatars/gabriel.jpg', 'Calme et patient', 'calme', 'Utilise des messages courts et sans pression.', '#6d6654', 10],
  ['lea-favre', 'Léa', 'Favre', 'female', '/coach-media/avatars/lea.jpg', 'Posée et patiente', 'calme', 'Laisse le temps de réfléchir et formule des corrections sobres.', '#77715e', 11],
  ['karim-haddad', 'Karim', 'Haddad', 'male', '/coach-media/avatars/karim.jpg', 'Serein et concis', 'calme', 'Va à l’essentiel et aide sans mettre de pression.', '#5e6759', 12],
]

const replyProfileBySlug = {
  'camille-morel': 'camille-morel', 'nora-benali': 'camille-morel', 'lucas-meyer': 'camille-morel',
  'sami-diallo': 'sami-diallo', 'claire-dubois': 'sami-diallo', 'thomas-nguyen': 'sami-diallo',
  'zoe-laurent': 'zoe-laurent', 'amel-costa': 'zoe-laurent', 'hugo-martin': 'zoe-laurent',
  'gabriel-rossi': 'gabriel-rossi', 'lea-favre': 'gabriel-rossi', 'karim-haddad': 'gabriel-rossi',
}

const characterSeeds = [
  ['warm', 'Chaleureux', '🤗', 'Encourage avant d’expliquer la règle.', 1, 'camille-morel', 'complete-avec-reponses'],
  ['methodical', 'Méthodique', '🧭', 'Décompose chaque difficulté en étapes.', 2, 'sami-diallo', 'complete'],
  ['dynamic', 'Dynamique', '⚡', 'Relance rapidement et célèbre chaque progrès.', 3, 'zoe-laurent', 'complete'],
  ['calm', 'Calme', '🌿', 'Utilise des messages courts et sans pression.', 4, 'gabriel-rossi', 'tres-condensee'],
]

const characterSlugByCoach = {
  'camille-morel': 'warm', 'nora-benali': 'warm', 'lucas-meyer': 'warm',
  'sami-diallo': 'methodical', 'claire-dubois': 'methodical', 'thomas-nguyen': 'methodical',
  'zoe-laurent': 'dynamic', 'amel-costa': 'dynamic', 'hugo-martin': 'dynamic',
  'gabriel-rossi': 'calm', 'lea-favre': 'calm', 'karim-haddad': 'calm',
}

const legacyQuestionTemplateUpdates = [
  ['warm', 'À toi : {instruction}', 'À toi.'],
  ['methodical', 'Procède dans l’ordre : {instruction}', 'Procède dans l’ordre.'],
  ['dynamic', 'C’est parti : {instruction} !', 'C’est parti !'],
  ['calm', 'Prends ton temps : {instruction}', 'Prends ton temps.'],
]

const introductionTemplateUpdates = [
  ['warm', 'Bonjour ! On va travailler ensemble tranquillement.', 'Bonjour ! Je vais te proposer des formes à conjuguer. Après chaque réponse, je t’indiquerai clairement ce qui est juste ou à corriger.'],
  ['methodical', 'Bonjour. Nous allons avancer étape par étape.', 'Bonjour. Pour chaque question, lis la personne, le mode et le temps indiqués, puis écris la forme conjuguée.'],
  ['dynamic', 'Salut ! Prêt à relever le défi ?', 'Salut ! Je te propose une série de formes à conjuguer : réponds, je corrige, puis on passe à la suivante.'],
  ['calm', 'Bonjour. Prends ton temps.', 'Bonjour. Réponds à ton rythme ; après chaque essai, je t’indiquerai la forme correcte et le point à retenir.'],
]

const replySeeds = {
  'camille-morel': {
    introduction: ['Bonjour ! Je vais te proposer des formes à conjuguer. Après chaque réponse, je t’indiquerai clairement ce qui est juste ou à corriger.'],
    question: ['À toi.', 'On continue ensemble.', 'Essaie celle-ci.', 'Voici la suivante.', 'À toi de jouer.', 'Regarde bien ce qui est demandé.', 'Tu peux essayer cette nouvelle forme.', 'On passe à la suivante.', 'Prends un instant puis réponds.', 'Je te laisse conjuguer celle-ci.'],
    correct: ['Bravo, c’est juste !', 'Très bien, tu as trouvé !', 'Exactement, bravo !', 'Oui, c’est la bonne forme.', 'C’est réussi, continue ainsi !', 'Belle réponse, tu progresses !', 'Tu as bien observé, c’est exact.', 'Parfait, cette forme convient.', 'Bien vu, la réponse est correcte.', 'Excellent travail, poursuivons !'],
    'correct-alternative': ['Exact ! Une autre forme était également possible.'],
    incorrect: ['Ce n’est pas encore ça. La réponse attendue était « {expectedAnswer} ».', 'Presque ! Il fallait écrire « {expectedAnswer} ».', 'On reprend doucement : « {expectedAnswer} ».', 'Cette fois, la bonne forme était « {expectedAnswer} ».', 'Pas encore, mais tu avances : « {expectedAnswer} ».', 'Regardons ensemble : on attendait « {expectedAnswer} ».', 'Tu étais proche. La forme juste est « {expectedAnswer} ».', 'Continue, la correction est « {expectedAnswer} ».', 'Ce petit piège demandait « {expectedAnswer} ».', 'Essaie de retenir cette forme : « {expectedAnswer} ».'],
    'cod-before': ['Le COD « {complement} » est placé avant « {verb} » : le participe s’accorde et devient « {participle} ».'],
    'cod-after': ['Le COD « {complement} » est placé après « {verb} » : le participe reste « {participle} ».'],
    coi: ['« {complement} » est un COI : il ne commande pas l’accord du participe passé.'],
    'help-announcement': ['Je vois que c’est un peu difficile.'],
    encouragement: ['On continue ensemble.'], streak: ['Quelle belle série !'], finish: ['Défi terminé : {correctCount}/{questionCount}, soit {score} %.'],
    restart: ['On recommence. Prêt ?'],
  },
  'sami-diallo': {
    introduction: ['Bonjour. Pour chaque question, lis la personne, le mode et le temps indiqués, puis écris la forme conjuguée.'], question: ['Procède dans l’ordre.', 'Observe bien les indices.', 'Passons à l’étape suivante.', 'Analyse cette nouvelle forme.', 'Repère la personne, le mode et le temps.', 'Identifie d’abord la personne demandée.', 'Vérifie le mode avant de répondre.', 'Décompose cette nouvelle consigne.', 'Observe le temps et construis la forme.', 'À présent, applique les indices donnés.'],
    correct: ['Correct. La forme est bien construite.', 'Exact. Chaque élément est à sa place.', 'Bonne réponse. Le raisonnement est juste.', 'C’est correct. La méthode fonctionne.', 'Forme validée. Poursuivons.', 'Analyse juste. La terminaison convient.', 'Validation obtenue. Passons à la suite.', 'La construction est rigoureusement correcte.', 'Tous les éléments concordent.', 'Réponse exacte. Le temps est maîtrisé.'], 'correct-alternative': ['Correct. Cette variante est admise.'],
    incorrect: ['Procédons dans l’ordre : la réponse attendue était « {expectedAnswer} ».', 'Vérifie chaque élément : il fallait « {expectedAnswer} ».', 'La construction attendue était « {expectedAnswer} ».', 'Reprenons la méthode : la forme correcte est « {expectedAnswer} ».', 'Observe la terminaison : on attendait « {expectedAnswer} ».', 'Repars de la personne : la réponse est « {expectedAnswer} ».', 'Vérifie le mode et le temps : on attendait « {expectedAnswer} ».', 'Vérifie le radical et la terminaison : « {expectedAnswer} ».', 'La dernière étape conduit à « {expectedAnswer} ».', 'Compare avec la forme attendue : « {expectedAnswer} ».'],
    'cod-before': ['Étape 1 : « {complement} » est le COD. Étape 2 : il précède « {verb} ». On écrit donc « {participle} ».'],
    'cod-after': ['Le COD « {complement} » suit « {verb} ». Avec avoir, aucun accord : « {participle} ».'],
    coi: ['« {complement} » répond à une question avec préposition : c’est un COI, sans accord.'],
    'help-announcement': ['Cette question semble demander un peu plus de méthode.'],
    encouragement: ['Reprenons méthodiquement.'], streak: ['Plusieurs réponses exactes : la méthode fonctionne.'], finish: ['Bilan : {correctCount}/{questionCount}, soit {score} %.'],
    restart: ['Nous repartons depuis la première question.'],
  },
  'zoe-laurent': {
    introduction: ['Salut ! Je te propose une série de formes à conjuguer : réponds, je corrige, puis on passe à la suivante.'], question: ['C’est parti !', 'On enchaîne !', 'Nouvelle question !', 'À toi de jouer !', 'Garde le rythme !', 'Prochaine étape, montre-moi ça !', 'Hop, une nouvelle forme !', 'On continue sur cette lancée !', 'Relève ce nouveau défi !', 'Montre-moi ce que tu sais faire !'],
    correct: ['Bien joué !', 'Excellent, on garde le rythme !', 'Oui, c’est ça !', 'Super réponse !', 'Parfait, continue !', 'Bravo, tu assures !', 'Génial, encore une bonne réponse !', 'Impeccable, défi relevé !', 'Exact, quelle énergie !', 'Top, on passe à la suite !'], 'correct-alternative': ['Ça marche ! Il existait aussi une autre forme correcte.'],
    incorrect: ['Pas cette fois : il fallait écrire « {expectedAnswer} ». On repart !', 'Oups ! La bonne réponse était « {expectedAnswer} ».', 'Petit piège : il fallait « {expectedAnswer} ».', 'Raté de peu ! On attendait « {expectedAnswer} ».', 'On garde le rythme : la forme correcte est « {expectedAnswer} ».', 'Pas loin ! La solution était « {expectedAnswer} ».', 'On rebondit : il fallait « {expectedAnswer} ».', 'Défi piégeux ! On attendait « {expectedAnswer} ».', 'Encore un effort : retiens « {expectedAnswer} ».', 'Cette fois, la forme gagnante est « {expectedAnswer} ».'],
    'cod-before': ['Le COD « {complement} » passe devant « {verb} » : accord obligatoire, « {participle} » !'],
    'cod-after': ['« {complement} » arrive après « {verb} » : pas d’accord, « {participle} » !'],
    coi: ['Attention au piège : « {complement} » est un COI, donc aucun accord !'],
    'help-announcement': ['Je vois que ce défi te résiste un peu !'],
    encouragement: ['On ne lâche rien !'], streak: ['Super série !'], finish: ['Terminé ! {score} % avec {correctCount} bonnes réponses.'],
    restart: ['Nouveau départ, c’est parti !'],
  },
  'gabriel-rossi': {
    introduction: ['Bonjour. Réponds à ton rythme ; après chaque essai, je t’indiquerai la forme correcte et le point à retenir.'], question: ['Prends ton temps.', 'Réfléchis tranquillement.', 'Voici la question suivante.', 'Observe bien la forme demandée.', 'Quand tu es prêt.', 'Tu peux répondre sans te presser.', 'Regarde calmement cette nouvelle consigne.', 'Passons doucement à la forme suivante.', 'Laisse-toi un instant pour réfléchir.', 'Voici une autre forme à conjuguer.'],
    correct: ['C’est juste. Bravo.', 'Oui, c’est correct.', 'Bonne réponse.', 'La forme est exacte.', 'Très bien. Continuons.', 'C’est bien observé.', 'Réponse juste. Prenons la suite.', 'Oui. Cette forme convient.', 'Exact, tout simplement.', 'Très bonne réponse.'], 'correct-alternative': ['C’est juste. Une autre forme est aussi admise.'],
    incorrect: ['Regarde la correction : « {expectedAnswer} ».', 'La forme attendue était « {expectedAnswer} ».', 'Prends le temps d’observer : « {expectedAnswer} ».', 'Ici, il fallait écrire « {expectedAnswer} ».', 'Ce n’est pas grave. La bonne réponse est « {expectedAnswer} ».', 'Reprenons calmement : « {expectedAnswer} ».', 'Tu peux comparer avec cette forme : « {expectedAnswer} ».', 'La réponse juste est simplement « {expectedAnswer} ».', 'Observe cette correction : « {expectedAnswer} ».', 'Pour cette question, on attendait « {expectedAnswer} ».'],
    'cod-before': ['« {complement} » est avant « {verb} ». On accorde : « {participle} ».'],
    'cod-after': ['« {complement} » est après « {verb} ». On n’accorde pas : « {participle} ».'],
    coi: ['« {complement} » est un COI. Il n’entraîne pas d’accord.'],
    'help-announcement': ['Cette question semble un peu difficile.'],
    encouragement: ['Prends le temps de réfléchir.'], streak: ['Très bonne série.'], finish: ['Tu as obtenu {correctCount}/{questionCount}, soit {score} %.'],
    restart: ['Recommençons calmement.'],
  },
}

try {
  await database.query(`CREATE TABLE IF NOT EXISTS coaches (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    gender ENUM('female','male') NOT NULL,
    avatar_path VARCHAR(255) NOT NULL DEFAULT '',
    description VARCHAR(255) NOT NULL DEFAULT '',
    likes VARCHAR(255) NOT NULL DEFAULT '',
    personality VARCHAR(100) NOT NULL DEFAULT '',
    pedagogical_style TEXT NOT NULL,
    theme_color CHAR(7) NOT NULL DEFAULT '#295f72',
    status ENUM('draft','published','disabled') NOT NULL DEFAULT 'draft',
    sort_order SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  const [genderColumns] = await database.query("SHOW COLUMNS FROM coaches LIKE 'gender'")
  if (genderColumns.length === 0) {
    await database.query("ALTER TABLE coaches ADD COLUMN gender ENUM('female','male') NOT NULL DEFAULT 'female' AFTER last_name")
  }
  const [likesColumns] = await database.query("SHOW COLUMNS FROM coaches LIKE 'likes'")
  if (likesColumns.length === 0) {
    await database.query("ALTER TABLE coaches ADD COLUMN likes VARCHAR(255) NOT NULL DEFAULT '' AFTER description")
  }

  await database.query(`CREATE TABLE IF NOT EXISTS coach_reply_templates (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coach_id INT UNSIGNED NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    content TEXT NOT NULL,
    weight SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_coach_reply_coach FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
    INDEX idx_coach_reply_event (coach_id, event_type, is_active)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  await database.query(`CREATE TABLE IF NOT EXISTS coach_media (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    file_path VARCHAR(255) NOT NULL UNIQUE,
    media_type ENUM('emoji','animation','video','image') NOT NULL,
    category ENUM('success','encouragement','finish','welcome','neutral') NOT NULL DEFAULT 'neutral',
    alt_text VARCHAR(255) NOT NULL,
    rights_status ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending',
    safety_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    file_size INT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  await database.query(`CREATE TABLE IF NOT EXISTS coach_media_assignments (
    coach_id INT UNSIGNED NOT NULL,
    media_id INT UNSIGNED NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    weight SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (coach_id, media_id, event_type),
    CONSTRAINT fk_assignment_coach FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_media FOREIGN KEY (media_id) REFERENCES coach_media(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  await database.query(`CREATE TABLE IF NOT EXISTS coach_reaction_rules (
    coach_id INT UNSIGNED NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    media_probability DECIMAL(4,3) NOT NULL DEFAULT 0,
    cooldown_questions SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (coach_id, event_type),
    CONSTRAINT fk_rule_coach FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  await database.query(`CREATE TABLE IF NOT EXISTS coach_help_approaches (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    engine_key ENUM('complete-avec-reponses','complete','tres-condensee','allophone') NOT NULL DEFAULT 'complete-avec-reponses',
    sort_order SMALLINT NOT NULL DEFAULT 0,
    status ENUM('draft','published','disabled') NOT NULL DEFAULT 'published',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
  for (const seed of [['complete-avec-reponses','Complète avec réponses','complete-avec-reponses',1],['complete','Complète sans réponses','complete',2],['tres-condensee','Très condensée','tres-condensee',3],['allophone','Allophone','allophone',4]]) {
    await database.execute(`INSERT INTO coach_help_approaches (slug,name,engine_key,sort_order) VALUES (?,?,?,?)
      ON DUPLICATE KEY UPDATE slug=VALUES(slug)`, seed)
  }

  await database.query(`CREATE TABLE IF NOT EXISTS coach_characters (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    masculine_name VARCHAR(80) NOT NULL,
    emoticon VARCHAR(32) NOT NULL DEFAULT '🙂',
    pedagogical_style TEXT NOT NULL,
    help_approach_id INT UNSIGNED NOT NULL,
    status ENUM('draft','published','disabled') NOT NULL DEFAULT 'draft',
    sort_order SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_coach_character_help_approach FOREIGN KEY (help_approach_id) REFERENCES coach_help_approaches(id) ON DELETE RESTRICT
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  const [masculineNameColumns] = await database.query("SHOW COLUMNS FROM coach_characters LIKE 'masculine_name'")
  if (masculineNameColumns.length === 0) {
    await database.query("ALTER TABLE coach_characters ADD COLUMN masculine_name VARCHAR(80) NOT NULL DEFAULT '' AFTER name")
  }
  const [helpApproachColumns] = await database.query("SHOW COLUMNS FROM coach_characters LIKE 'help_approach_id'")
  if (!helpApproachColumns.length) await database.query('ALTER TABLE coach_characters ADD COLUMN help_approach_id INT UNSIGNED NULL AFTER pedagogical_style')
  const [legacyHelpApproachColumns] = await database.query("SHOW COLUMNS FROM coach_characters LIKE 'help_approach'")
  if (legacyHelpApproachColumns.length) {
    await database.query(`UPDATE coach_characters c JOIN coach_help_approaches a ON a.slug=c.help_approach
      SET c.help_approach_id=a.id WHERE c.help_approach_id IS NULL`)
  }
  await database.query(`UPDATE coach_characters c JOIN coach_help_approaches a ON a.slug='complete-avec-reponses'
    SET c.help_approach_id=a.id WHERE c.help_approach_id IS NULL`)
  const [emoticonColumns] = await database.query("SHOW COLUMNS FROM coach_characters LIKE 'emoticon'")
  if (emoticonColumns.length === 0) {
    await database.query("ALTER TABLE coach_characters ADD COLUMN emoticon VARCHAR(32) NOT NULL DEFAULT '🙂' AFTER masculine_name")
  }
  await database.query(`UPDATE coach_characters SET masculine_name=name WHERE masculine_name=''`)

  await database.query(`CREATE TABLE IF NOT EXISTS coach_character_reply_templates (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    character_id INT UNSIGNED NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    content TEXT NOT NULL,
    weight SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_character_reply_character FOREIGN KEY (character_id) REFERENCES coach_characters(id) ON DELETE CASCADE,
    INDEX idx_character_reply_event (character_id,event_type,is_active)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  await database.query(`CREATE TABLE IF NOT EXISTS coach_character_media_assignments (
    character_id INT UNSIGNED NOT NULL,
    media_id INT UNSIGNED NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    weight SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (character_id,media_id,event_type),
    CONSTRAINT fk_character_assignment_character FOREIGN KEY (character_id) REFERENCES coach_characters(id) ON DELETE CASCADE,
    CONSTRAINT fk_character_assignment_media FOREIGN KEY (media_id) REFERENCES coach_media(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  await database.query(`CREATE TABLE IF NOT EXISTS coach_character_reaction_rules (
    character_id INT UNSIGNED NOT NULL,
    event_type VARCHAR(40) NOT NULL,
    media_probability DECIMAL(4,3) NOT NULL DEFAULT 0,
    animation_probability DECIMAL(4,3) NOT NULL DEFAULT 0,
    emoji_probability DECIMAL(4,3) NOT NULL DEFAULT 0,
    cooldown_questions SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (character_id,event_type),
    CONSTRAINT fk_character_rule_character FOREIGN KEY (character_id) REFERENCES coach_characters(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

  const [ruleColumns] = await database.query('SHOW COLUMNS FROM coach_character_reaction_rules')
  const ruleColumnNames = new Set(ruleColumns.map(column => column.Field))
  if (!ruleColumnNames.has('animation_probability')) {
    await database.query('ALTER TABLE coach_character_reaction_rules ADD COLUMN animation_probability DECIMAL(4,3) NOT NULL DEFAULT 0 AFTER media_probability')
    await database.query('UPDATE coach_character_reaction_rules SET animation_probability=media_probability')
  }
  if (!ruleColumnNames.has('emoji_probability')) {
    await database.query('ALTER TABLE coach_character_reaction_rules ADD COLUMN emoji_probability DECIMAL(4,3) NOT NULL DEFAULT 0 AFTER animation_probability')
    await database.query('UPDATE coach_character_reaction_rules SET emoji_probability=media_probability')
  }

  const [characterColumns] = await database.query("SHOW COLUMNS FROM coaches LIKE 'character_id'")
  if (characterColumns.length === 0) await database.query('ALTER TABLE coaches ADD COLUMN character_id INT UNSIGNED NULL AFTER description')

  for (const [slug, masculineName, emoticon, pedagogicalStyle, sortOrder, , approachSlug] of characterSeeds) {
    await database.execute(`INSERT INTO coach_characters
      (slug,name,masculine_name,emoticon,pedagogical_style,help_approach_id,status,sort_order)
      SELECT ?,?,?,?,?,id,'published',? FROM coach_help_approaches WHERE slug=?
      ON DUPLICATE KEY UPDATE help_approach_id=COALESCE(help_approach_id,VALUES(help_approach_id))`,
    [slug, masculineName, masculineName, emoticon, pedagogicalStyle, sortOrder, approachSlug])
  }

  for (const seed of coachSeeds) {
    await database.execute(`INSERT INTO coaches
      (slug, first_name, last_name, gender, avatar_path, description, personality, pedagogical_style, theme_color, sort_order, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
      ON DUPLICATE KEY UPDATE slug=slug`, seed)
  }

  for (const [coachSlug, characterSlug] of Object.entries(characterSlugByCoach)) {
    await database.execute(`UPDATE coaches c JOIN coach_characters cc ON cc.slug=? SET c.character_id=cc.id WHERE c.slug=? AND c.character_id IS NULL`, [characterSlug, coachSlug])
  }

  for (const [slug, replyProfile] of Object.entries(replyProfileBySlug)) {
    const events = replySeeds[replyProfile]
    const [[coach]] = await database.execute('SELECT id FROM coaches WHERE slug = ?', [slug])
    const [[count]] = await database.execute('SELECT COUNT(*) AS total FROM coach_reply_templates WHERE coach_id = ?', [coach.id])
    if (Number(count.total) === 0) {
      for (const [eventType, replies] of Object.entries(events)) {
        for (const [index, content] of replies.entries()) {
          await database.execute(`INSERT INTO coach_reply_templates
            (coach_id, event_type, content, weight, is_active, sort_order) VALUES (?, ?, ?, 1, 1, ?)`,
          [coach.id, eventType, content, index])
        }
      }
    }
    for (const eventType of ['correct', 'incorrect', 'streak', 'finish']) {
      const probability = eventType === 'correct' ? 0.25 : eventType === 'incorrect' ? 0.12 : 0.5
      await database.execute(`INSERT INTO coach_reaction_rules (coach_id, event_type, media_probability, cooldown_questions)
        VALUES (?, ?, ?, 2) ON DUPLICATE KEY UPDATE coach_id=coach_id`, [coach.id, eventType, probability])
    }
  }


  for (const [characterSlug, , , , , representativeSlug] of characterSeeds) {
    const [[character]] = await database.execute('SELECT id FROM coach_characters WHERE slug=?', [characterSlug])
    const [[representative]] = await database.execute('SELECT id FROM coaches WHERE slug=?', [representativeSlug])
    const [[replyCount]] = await database.execute('SELECT COUNT(*) AS total FROM coach_character_reply_templates WHERE character_id=?', [character.id])
    if (Number(replyCount.total) === 0) {
      await database.execute(`INSERT INTO coach_character_reply_templates (character_id,event_type,content,weight,is_active,sort_order)
        SELECT ?,event_type,content,weight,is_active,sort_order FROM coach_reply_templates WHERE coach_id=?`, [character.id, representative.id])
    }
    const [[assignmentCount]] = await database.execute('SELECT COUNT(*) AS total FROM coach_character_media_assignments WHERE character_id=?', [character.id])
    if (Number(assignmentCount.total) === 0) {
      await database.execute(`INSERT INTO coach_character_media_assignments (character_id,media_id,event_type,weight,is_active)
        SELECT ?,media_id,event_type,weight,is_active FROM coach_media_assignments WHERE coach_id=?`, [character.id, representative.id])
    }
    const [[ruleCount]] = await database.execute('SELECT COUNT(*) AS total FROM coach_character_reaction_rules WHERE character_id=?', [character.id])
    if (Number(ruleCount.total) === 0) {
      await database.execute(`INSERT INTO coach_character_reaction_rules (character_id,event_type,media_probability,animation_probability,emoji_probability,cooldown_questions)
        SELECT ?,event_type,media_probability,media_probability,media_probability,cooldown_questions FROM coach_reaction_rules WHERE coach_id=?`, [character.id, representative.id])
    }

    const recurringEvents = replySeeds[representativeSlug]
    for (const eventType of ['question', 'correct', 'incorrect', 'help-announcement']) {
      for (const [index, content] of recurringEvents[eventType].entries()) {
        await database.execute(`INSERT INTO coach_character_reply_templates (character_id,event_type,content,weight,is_active,sort_order)
          SELECT ?,?,?,1,1,? WHERE NOT EXISTS (SELECT 1 FROM coach_character_reply_templates
          WHERE character_id=? AND event_type=? AND content=?)`,
        [character.id, eventType, content, index, character.id, eventType, content])
      }
    }
  }

  // Les caractères créés depuis l’administration ne figurent pas dans les
  // amorces ci-dessus. Ils reçoivent aussi une annonce, sans écraser leur texte.
  await database.execute(`INSERT INTO coach_character_reply_templates
    (character_id,event_type,content,weight,is_active,sort_order)
    SELECT c.id,'help-announcement','Je vois que c’est un peu difficile.',1,1,999
    FROM coach_characters c
    WHERE NOT EXISTS (SELECT 1 FROM coach_character_reply_templates announcement
      WHERE announcement.character_id=c.id AND announcement.event_type='help-announcement')`)

  for (const [characterSlug, previousContent, nextContent] of legacyQuestionTemplateUpdates) {
    await database.execute(`UPDATE coach_character_reply_templates r JOIN coach_characters c ON c.id=r.character_id
      SET r.content=? WHERE c.slug=? AND r.event_type='question' AND r.content=?`, [nextContent, characterSlug, previousContent])
  }
  for (const [characterSlug, previousContent, nextContent] of introductionTemplateUpdates) {
    await database.execute(`UPDATE coach_character_reply_templates r JOIN coach_characters c ON c.id=r.character_id
      SET r.content=? WHERE c.slug=? AND r.event_type='introduction' AND r.content=?`, [nextContent, characterSlug, previousContent])
  }
  await database.execute(`UPDATE coach_character_reply_templates r JOIN coach_characters c ON c.id=r.character_id
    SET r.content='Repère la personne, le mode et le temps.'
    WHERE c.slug='methodical' AND r.event_type='question' AND r.content='Applique maintenant la méthode.'`)
  await database.execute(`UPDATE coach_character_reply_templates r JOIN coach_characters c ON c.id=r.character_id
    SET r.content='Vérifie le mode et le temps : on attendait « {expectedAnswer} ».'
    WHERE c.slug='methodical' AND r.event_type='incorrect'
      AND r.content='Le mode était correct, mais on attendait « {expectedAnswer} ».'`)
  await database.execute(`DELETE duplicate FROM coach_character_reply_templates duplicate
    JOIN coach_character_reply_templates original
      ON original.character_id=duplicate.character_id AND original.event_type=duplicate.event_type
      AND original.content=duplicate.content AND original.id<duplicate.id`)
  await database.execute("DELETE FROM coach_character_reply_templates WHERE event_type='off-topic'")
  await database.execute("DELETE FROM coach_reply_templates WHERE event_type='off-topic'")
  const [[integrity]] = await database.query(`SELECT
    (SELECT COUNT(*) FROM coach_characters) AS characters,
    (SELECT COUNT(*) FROM coaches) AS coaches,
    (SELECT COUNT(*) FROM coaches WHERE character_id IS NULL) AS missing_character,
    (SELECT COUNT(*) FROM coach_characters c WHERE c.status='published' AND NOT EXISTS
      (SELECT 1 FROM coach_character_reply_templates r WHERE r.character_id=c.id
        AND r.event_type='help-announcement' AND r.is_active=1)) AS missing_help_announcement,
    (SELECT MIN(total) FROM (SELECT COUNT(*) AS total FROM coach_character_reply_templates GROUP BY character_id) reply_counts) AS minimum_replies`)
  if (Number(integrity.characters) < characterSeeds.length || Number(integrity.coaches) < 1
    || Number(integrity.missing_character) !== 0 || Number(integrity.missing_help_announcement) !== 0
    || Number(integrity.minimum_replies) < 12) {
    throw new Error(`Migration incomplète : ${JSON.stringify(integrity)}`)
  }
  console.log(`Migration terminée : ${integrity.characters} caractères partagés pour ${integrity.coaches} coaches.`)
} finally {
  await database.end()
}

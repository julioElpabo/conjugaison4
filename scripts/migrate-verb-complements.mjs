import mysql from 'mysql2/promise'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

await database.query(`
  CREATE TABLE IF NOT EXISTS constructions_verbales (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    sens_id INT NOT NULL,
    code VARCHAR(40) NOT NULL,
    fonction_objet VARCHAR(24) NOT NULL,
    preposition VARCHAR(32) NULL,
    patron VARCHAR(160) NOT NULL,
    complement_obligatoire TINYINT(1) NOT NULL DEFAULT 0,
    source VARCHAR(120) NULL,
    source_url VARCHAR(500) NULL,
    statut_validation VARCHAR(24) NOT NULL DEFAULT 'a_verifier',
    actif TINYINT(1) NOT NULL DEFAULT 1,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_construction_sens_code (sens_id, code),
    KEY idx_construction_active (actif, fonction_objet),
    CONSTRAINT fk_construction_sens FOREIGN KEY (sens_id) REFERENCES verbe_sens(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`)

await database.query(`
  CREATE TABLE IF NOT EXISTS complements_verbaux (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    construction_id INT NOT NULL,
    texte VARCHAR(180) NOT NULL,
    texte_antepose VARCHAR(180) NULL,
    lemme_tete VARCHAR(80) NULL,
    genre VARCHAR(12) NULL,
    nombre VARCHAR(12) NULL,
    classe_semantique VARCHAR(40) NULL,
    niveau_cecrl VARCHAR(2) NULL,
    poids TINYINT UNSIGNED NOT NULL DEFAULT 1,
    source VARCHAR(120) NULL,
    source_url VARCHAR(500) NULL,
    statut_validation VARCHAR(24) NOT NULL DEFAULT 'a_verifier',
    actif TINYINT(1) NOT NULL DEFAULT 1,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_complement_construction_texte (construction_id, texte),
    KEY idx_complement_active (construction_id, actif, statut_validation),
    CONSTRAINT fk_complement_construction FOREIGN KEY (construction_id) REFERENCES constructions_verbales(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`)

const [placementColumns] = await database.execute(`
  SELECT 1 FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='complements_verbaux' AND COLUMN_NAME='texte_antepose'
  LIMIT 1
`)
if (placementColumns.length === 0) {
  await database.query('ALTER TABLE complements_verbaux ADD COLUMN texte_antepose VARCHAR(180) NULL AFTER texte')
}

const pilot = {
  manger: {
    label: 'Absorber un aliment', className: 'aliment', complements: [
      'une pomme', 'une poire', 'un abricot', 'une banane', 'du pain',
      'du riz', 'de la soupe', 'des légumes', 'un sandwich', 'un gâteau',
    ],
  },
  boire: {
    label: 'Absorber une boisson', className: 'boisson', complements: [
      "de l’eau", 'du lait', 'un jus de pomme', 'du thé', 'du chocolat chaud',
      'une limonade', "un verre d’eau", 'une tasse de thé', 'du sirop', 'une boisson fraîche',
    ],
  },
  acheter: {
    label: 'Acquérir quelque chose contre paiement', className: 'bien', complements: [
      'un livre', 'du pain', 'une pomme', 'un billet', 'un cahier',
      'des chaussures', 'un cadeau', 'un vélo', 'des légumes', 'une boisson',
    ],
  },
  apporter: {
    label: 'Transporter quelque chose vers un lieu', className: 'objet-transportable', complements: [
      'un livre', 'son cahier', "une bouteille d’eau", 'un cadeau', 'des documents',
      'une chaise', 'le courrier', 'son repas', 'une couverture', 'les clés',
    ],
  },
  chercher: {
    label: 'Faire des efforts pour trouver quelque chose', className: 'objet-recherche', complements: [
      'ses clés', 'un livre', 'son téléphone', 'une solution', 'un emploi',
      'une adresse', 'son manteau', 'un document', 'la réponse', 'un appartement',
    ],
  },
  choisir: {
    label: 'Sélectionner parmi plusieurs possibilités', className: 'choix', complements: [
      'un livre', 'une couleur', 'un dessert', 'une activité', 'une réponse',
      'un vêtement', 'un prénom', 'une destination', 'une équipe', 'un cadeau',
    ],
  },
  comprendre: {
    label: 'Saisir le sens de quelque chose', className: 'contenu-intellectuel', complements: [
      'la question', 'le problème', 'la consigne', 'cette phrase', 'la leçon',
      'son erreur', 'la réponse', 'le fonctionnement', 'cette décision', "l’explication",
    ],
  },
  couper: {
    label: 'Diviser quelque chose avec un instrument', className: 'objet-decoupable', complements: [
      'le pain', 'une pomme', 'le papier', 'une corde', 'les légumes',
      'le gâteau', 'une branche', 'le tissu', 'ses cheveux', 'le fromage',
    ],
  },
  dessiner: {
    label: 'Représenter quelque chose par un dessin', className: 'representation', complements: [
      'un arbre', 'une maison', 'un animal', 'un personnage', 'une carte',
      'un paysage', 'une fleur', 'un cercle', 'son portrait', 'un plan',
    ],
  },
  écrire: {
    label: 'Produire un contenu écrit', className: 'contenu-ecrit', complements: [
      'une lettre', 'un message', 'une histoire', 'son prénom', 'une réponse',
      'un poème', 'une liste', 'un article', 'une carte postale', 'quelques lignes',
    ],
  },
  écouter: {
    label: 'Prêter attention à un son ou à une personne', className: 'contenu-auditif', complements: [
      'une chanson', 'de la musique', 'le professeur', 'une histoire', 'les informations',
      'un podcast', 'la radio', 'les consignes', 'son ami', 'un bruit',
    ],
  },
  ranger: {
    label: 'Mettre quelque chose à sa place', className: 'objet-a-ranger', complements: [
      'sa chambre', 'ses affaires', 'ses livres', 'son bureau', 'les jouets',
      'la vaisselle', 'les vêtements', 'les outils', 'les documents', 'le matériel',
    ],
  },
  laver: {
    label: 'Nettoyer avec un liquide', className: 'objet-lavable', complements: [
      'ses mains', 'la voiture', 'son visage', 'ses vêtements', 'le sol',
      'une pomme', 'la table', 'le chien', 'les vitres', 'son vélo',
    ],
  },
  lire: {
    label: 'Prendre connaissance d’un contenu écrit', className: 'contenu-lisible', complements: [
      'un livre', 'le journal', 'une histoire', 'la consigne', 'un message',
      'une lettre', 'un poème', 'une bande dessinée', 'la carte', 'un article',
    ],
  },
  ouvrir: {
    label: 'Mettre quelque chose en position ouverte', className: 'objet-ouvrable', complements: [
      'la porte', 'la fenêtre', 'son livre', 'la boîte', 'le cadeau',
      'le robinet', 'son sac', 'le courrier', 'le magasin', 'les rideaux',
    ],
  },
  porter: {
    label: 'Soutenir ou avoir quelque chose sur soi', className: 'objet-portable', complements: [
      'un sac', 'une valise', 'un manteau', 'des lunettes', 'un carton',
      'un enfant', 'une chemise', 'une montre', 'un casque', 'un panier',
    ],
  },
  montrer: {
    label: 'Faire voir quelque chose', className: 'contenu-montre', complements: [
      'une photo', 'son dessin', 'le chemin', 'la réponse', 'son travail',
      'un document', 'un objet', 'une vidéo', 'la carte', 'le résultat',
    ],
  },
  prendre: {
    label: 'Saisir, utiliser ou choisir quelque chose', className: 'objet-prise', complements: [
      'le train', 'une décision', 'une photo', 'un repas', 'une douche',
      'un livre', 'le temps nécessaire', 'une place', 'un rendez-vous', 'un médicament',
    ],
  },
  regarder: {
    label: 'Diriger son regard vers quelque chose', className: 'contenu-visuel', complements: [
      'un film', 'la télévision', 'le paysage', 'une photo', 'le tableau',
      'le ciel', 'un match', 'une vidéo', 'la carte', 'les oiseaux',
    ],
  },
  trouver: {
    label: 'Découvrir ou obtenir ce que l’on cherche', className: 'objet-trouve', complements: [
      'ses clés', 'une solution', 'la réponse', 'un emploi', 'un livre',
      'un trésor', 'une place', 'une idée', 'le chemin', 'une erreur',
    ],
  },
}

const source = 'Lot pédagogique initial validé'
await database.beginTransaction()
try {
  for (const [infinitive, entry] of Object.entries(pilot)) {
    const [verbs] = await database.execute(
      'SELECT id FROM verbes WHERE infinitif=? AND est_archive=0 LIMIT 1',
      [infinitive],
    )
    if (!verbs[0]) throw new Error(`Verbe pilote absent : ${infinitive}`)

    const verbId = Number(verbs[0].id)
    const [senses] = await database.execute(`
      SELECT id, source, transitivite FROM verbe_sens
      WHERE verbe_id=?
      ORDER BY (transitivite='indeterminee') DESC, est_principal DESC, sort_order, id
      LIMIT 1
    `, [verbId])
    let senseId = Number(senses[0]?.id)
    if (!senseId) {
      const [result] = await database.execute(`
        INSERT INTO verbe_sens
          (verbe_id, numero_sens, intitule, definition, construction, transitivite,
           auxiliaire, registre, est_pronominal, est_principal, source, sort_order)
        VALUES (?, 1, ?, ?, 'N0 V N1', 'transitif_direct', 'avoir', 'courant', 0, 1, 'manuel', 1)
      `, [verbId, entry.label, entry.label])
      senseId = Number(result.insertId)
    } else if (senses[0].transitivite === 'indeterminee' || senses[0].source === 'migration') {
      await database.execute(`
        UPDATE verbe_sens SET intitule=?, definition=?, construction='N0 V N1',
          transitivite='transitif_direct', preposition=NULL, source='manuel'
        WHERE id=?
      `, [entry.label, entry.label, senseId])
    }

    await database.execute(`
      INSERT INTO constructions_verbales
        (sens_id, code, fonction_objet, preposition, patron, complement_obligatoire,
         source, statut_validation, actif)
      VALUES (?, 'cod-postpose', 'cod', NULL, 'N0 V N1', 0, ?, 'valide', 1)
      ON DUPLICATE KEY UPDATE fonction_objet='cod', preposition=NULL, patron='N0 V N1',
        source=VALUES(source), statut_validation='valide', actif=1
    `, [senseId, source])
    const [constructions] = await database.execute(
      "SELECT id FROM constructions_verbales WHERE sens_id=? AND code='cod-postpose' LIMIT 1",
      [senseId],
    )
    const constructionId = Number(constructions[0].id)
    await database.execute(
      'UPDATE complements_verbaux SET actif=0 WHERE construction_id=? AND source=?',
      [constructionId, source],
    )
    for (const text of entry.complements) {
      await database.execute(`
        INSERT INTO complements_verbaux
          (construction_id, texte, classe_semantique, niveau_cecrl, poids,
           source, statut_validation, actif)
        VALUES (?, ?, ?, 'A2', 1, ?, 'valide', 1)
        ON DUPLICATE KEY UPDATE classe_semantique=VALUES(classe_semantique),
          niveau_cecrl='A2', poids=1, source=VALUES(source), statut_validation='valide', actif=1
      `, [constructionId, text, entry.className, source])
    }
  }
  await database.commit()
} catch (error) {
  await database.rollback()
  throw error
}

const [summary] = await database.execute(`
  SELECT COUNT(DISTINCT cv.id) AS constructions, COUNT(c.id) AS complements,
         MIN(per_verb.total) AS minimum_par_construction,
         MAX(per_verb.total) AS maximum_par_construction
  FROM constructions_verbales cv
  INNER JOIN complements_verbaux c ON c.construction_id=cv.id AND c.actif=1
  INNER JOIN (
    SELECT construction_id, COUNT(*) AS total FROM complements_verbaux
    WHERE actif=1 GROUP BY construction_id
  ) per_verb ON per_verb.construction_id=cv.id
  WHERE cv.source=? AND cv.actif=1
`, [source])
console.log(JSON.stringify({ ok: true, ...summary[0] }, null, 2))
await database.end()

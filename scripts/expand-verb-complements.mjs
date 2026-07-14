import mysql from 'mysql2/promise'
import { inferAnteposedComplement } from '../server/services/complement-placement.ts'

const database = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4',
})

const catalog = {
  aimer: {
    type: 'cod', label: 'Éprouver de l’affection ou de l’intérêt pour quelque chose', className: 'objet-affectif', complements: [
      'sa famille', 'ce film', 'cette chanson', 'les animaux', 'son métier',
      'la musique', 'les voyages', 'ce quartier', 'les livres', 'son équipe',
    ],
  },
  attendre: {
    type: 'cod', label: 'Rester dans l’attente de quelqu’un ou de quelque chose', className: 'objet-attendu', complements: [
      'le bus', 'son ami', 'une réponse', 'le train', 'les résultats',
      'la fin du cours', 'un colis', 'les vacances', 'son tour', 'une occasion',
    ],
  },
  entendre: {
    type: 'cod', label: 'Percevoir un son', className: 'contenu-auditif', complements: [
      'un bruit', 'la musique', 'une voix', 'la sonnerie', 'les oiseaux',
      'une chanson', 'son prénom', 'la radio', 'un avertissement', 'des applaudissements',
    ],
  },
  voir: {
    type: 'cod', label: 'Percevoir par la vue', className: 'contenu-visuel', complements: [
      'un film', 'ses amis', 'la montagne', 'une erreur', 'le résultat',
      'un médecin', 'la différence', 'un animal', 'les étoiles', 'ce monument',
    ],
  },
  recevoir: {
    type: 'cod', label: 'Entrer en possession de quelque chose qui est envoyé', className: 'objet-recu', complements: [
      'une lettre', 'un cadeau', 'un message', 'son salaire', 'des nouvelles',
      'une invitation', 'un colis', 'la confirmation', 'un appel', 'une réponse',
    ],
  },
  vendre: {
    type: 'cod', label: 'Céder quelque chose contre paiement', className: 'bien', complements: [
      'sa voiture', 'un livre', 'des légumes', 'la maison', 'un billet',
      'du pain', 'ses meubles', 'un vélo', 'des vêtements', 'un ordinateur',
    ],
  },
  perdre: {
    type: 'cod', label: 'Cesser de posséder ou ne plus retrouver quelque chose', className: 'objet-perdu', complements: [
      'ses clés', 'un document', 'son téléphone', 'la partie', 'du temps',
      'son chemin', 'une occasion', 'la mémoire', 'ses lunettes', 'le contrôle',
    ],
  },
  garder: {
    type: 'cod', label: 'Conserver ou surveiller quelqu’un ou quelque chose', className: 'objet-garde', complements: [
      'les enfants', 'un secret', 'son manteau', 'la monnaie', 'les documents',
      'son calme', 'une copie', 'le chien', 'sa place', 'ce souvenir',
    ],
  },
  utiliser: {
    type: 'cod', label: 'Faire usage de quelque chose', className: 'outil', complements: [
      'un ordinateur', 'ce logiciel', 'une clé', 'le dictionnaire', 'son téléphone',
      'les transports publics', 'une méthode simple', 'un outil', 'la calculatrice', 'ce formulaire',
    ],
  },
  rencontrer: {
    type: 'cod', label: 'Se trouver en présence de quelqu’un', className: 'personne-rencontree', complements: [
      'son voisin', 'une collègue', 'le directeur', 'des amis', 'un médecin',
      'la nouvelle équipe', 'un client', 'ses professeurs', 'une artiste', 'le propriétaire',
    ],
  },
  raconter: {
    type: 'cod', label: 'Faire le récit de quelque chose', className: 'recit', complements: [
      'une histoire', 'son voyage', 'une anecdote', 'la vérité', 'son rêve',
      'les événements', 'un souvenir', 'sa journée', 'une aventure', 'la suite du récit',
    ],
  },
  expliquer: {
    type: 'cod', label: 'Faire comprendre quelque chose', className: 'contenu-explicatif', complements: [
      'la règle', 'le problème', 'son choix', 'la situation', 'cette méthode',
      'la différence', 'le fonctionnement', 'sa décision', 'un exercice', 'les consignes',
    ],
  },
  fabriquer: {
    type: 'cod', label: 'Produire ou construire un objet', className: 'objet-fabrique', complements: [
      'une table', 'un jouet', 'des meubles', 'une maquette', 'du papier',
      'une boîte', 'un outil', 'des pièces', 'un cerf-volant', 'une étagère',
    ],
  },
  protéger: {
    type: 'cod', label: 'Mettre quelqu’un ou quelque chose à l’abri', className: 'objet-protege', complements: [
      'les enfants', 'la nature', 'ses données', 'un animal', 'la peau',
      'les plantes', 'le bâtiment', 'ses yeux', 'la population', 'ce document',
    ],
  },
  résoudre: {
    type: 'cod', label: 'Trouver la solution à une difficulté', className: 'probleme', complements: [
      'le problème', 'une énigme', 'cette équation', 'le conflit', 'une difficulté',
      'la panne', 'ce mystère', 'la question', 'un exercice', 'la crise',
    ],
  },
  monter: {
    type: 'cod', label: 'Porter vers le haut ou assembler quelque chose', className: 'objet-deplace-assemble', complements: [
      'les valises', 'un meuble', 'les cartons', 'l’escalier', 'une étagère',
      'le matériel', 'la tente', 'les courses', 'un dossier', 'la garde',
    ],
  },
  passer: {
    type: 'cod', label: 'Effectuer, franchir ou transmettre quelque chose', className: 'objet-passe', complements: [
      'un examen', 'la frontière', 'une commande', 'la soirée', 'un appel',
      'le relais', 'une annonce', 'un entretien', 'la vitesse supérieure', 'un coup de téléphone',
    ],
  },
  sortir: {
    type: 'cod', label: 'Faire aller quelque chose du dedans au dehors', className: 'objet-sorti', complements: [
      'les poubelles', 'son téléphone', 'le chien', 'la voiture', 'les dossiers',
      'une carte', 'le gâteau', 'la clé', 'les chaises', 'son portefeuille',
    ],
  },
  voler: {
    type: 'cod', label: 'Prendre ce qui appartient à autrui', className: 'objet-vole', complements: [
      'un portefeuille', 'des bijoux', 'un vélo', 'la voiture', 'un téléphone',
      'des documents', 'le tableau', 'une somme d’argent', 'les clés', 'un ordinateur',
    ],
  },
  parler: {
    type: 'coi', preposition: 'à', label: 'S’adresser à quelqu’un', className: 'interlocuteur', complements: [
      'à son voisin', 'à sa sœur', 'au professeur', 'à ses amis', 'aux élèves',
      'à un collègue', 'à une cliente', 'à la directrice', 'à l’enfant', 'à notre guide',
    ],
  },
  répondre: {
    type: 'coi', preposition: 'à', label: 'Donner une réponse à quelqu’un ou à quelque chose', className: 'destinataire-reponse', complements: [
      'à la question', 'au message', 'à son ami', 'aux élèves', 'à la lettre',
      'à cette demande', 'au professeur', 'à l’invitation', 'aux critiques', 'à votre courriel',
    ],
  },
  penser: {
    type: 'coi', preposition: 'à', label: 'Avoir quelqu’un ou quelque chose présent à l’esprit', className: 'objet-pensee', complements: [
      'à sa famille', 'à son avenir', 'au problème', 'aux vacances', 'à cette possibilité',
      'à son rendez-vous', 'à la réponse', 'à ses amis', 'à l’examen', 'au lendemain',
    ],
  },
  songer: {
    type: 'coi', preposition: 'à', label: 'Penser attentivement à quelqu’un ou à quelque chose', className: 'objet-pensee', complements: [
      'à son projet', 'à sa famille', 'au voyage', 'à cette solution', 'aux conséquences',
      'à changer de métier', 'à son enfance', 'à la proposition', 'à ses prochaines vacances', 'à l’avenir',
    ],
  },
  sourire: {
    type: 'coi', preposition: 'à', label: 'Adresser un sourire à quelqu’un', className: 'destinataire-sourire', complements: [
      'à son enfant', 'à la voisine', 'au photographe', 'à ses amis', 'aux invités',
      'à une passante', 'à son collègue', 'à la caméra', 'au public', 'à la cliente',
    ],
  },
  plaire: {
    type: 'coi', preposition: 'à', label: 'Être agréable à quelqu’un', className: 'beneficiaire-impression', complements: [
      'à ses amis', 'au public', 'à la directrice', 'aux enfants', 'à son entourage',
      'à cette cliente', 'à ses collègues', 'au jury', 'à la famille', 'aux visiteurs',
    ],
  },
  assister: {
    type: 'coi', preposition: 'à', label: 'Être présent à un événement', className: 'evenement', complements: [
      'à une réunion', 'au concert', 'à la cérémonie', 'à un cours', 'aux débats',
      'à la conférence', 'au match', 'à une démonstration', 'à la présentation', 'aux répétitions',
    ],
  },
  réfléchir: {
    type: 'coi', preposition: 'à', label: 'Examiner attentivement une question', className: 'objet-reflexion', complements: [
      'à la question', 'au problème', 'à son avenir', 'aux conséquences', 'à une solution',
      'à cette proposition', 'au fonctionnement', 'à son choix', 'à la stratégie', 'aux prochaines étapes',
    ],
  },
  douter: {
    type: 'coi', preposition: 'de', label: 'Ne pas être certain de quelqu’un ou de quelque chose', className: 'objet-doute', complements: [
      'de cette histoire', 'de la réponse', 'du résultat', 'de ses capacités', 'de cette méthode',
      'de son témoignage', 'de la réussite', 'des chiffres annoncés', 'de cette information', 'du bien-fondé de la décision',
    ],
  },
  discuter: {
    type: 'coi', preposition: 'de', label: 'Échanger des idées au sujet de quelque chose', className: 'sujet-discussion', complements: [
      'du projet', 'de la situation', 'des résultats', 'de son avenir', 'de cette proposition',
      'du problème', 'des prochaines étapes', 'de la méthode', 'de leurs vacances', 'de cette question',
    ],
  },
  jouer: {
    type: 'coi', preposition: 'à', label: 'Pratiquer un jeu ou un sport', className: 'jeu-sport', complements: [
      'au football', 'aux cartes', 'à un jeu de société', 'au tennis', 'à cache-cache',
      'aux échecs', 'à la pétanque', 'au basket', 'à un jeu vidéo', 'aux devinettes',
    ],
  },
  croire: {
    type: 'coi', preposition: 'à', label: 'Tenir quelque chose pour réel ou possible', className: 'objet-croyance', complements: [
      'à cette histoire', 'au progrès', 'à ses chances', 'aux miracles', 'à la réussite du projet',
      'à cette théorie', 'au hasard', 'à la parole donnée', 'à un avenir meilleur', 'aux vertus du dialogue',
    ],
  },
}

const source = 'Catalogue pédagogique étendu'

async function ensureSense(verbId, entry) {
  const transitivite = entry.type === 'cod' ? 'transitif_direct' : 'transitif_indirect'
  const preposition = entry.preposition ?? null
  const [matching] = await database.execute(`
    SELECT id FROM verbe_sens
    WHERE verbe_id=? AND transitivite=? AND preposition <=> ?
    ORDER BY est_principal DESC, sort_order, id LIMIT 1
  `, [verbId, transitivite, preposition])
  if (matching[0]) return Number(matching[0].id)

  const [undetermined] = await database.execute(`
    SELECT id FROM verbe_sens
    WHERE verbe_id=? AND transitivite='indeterminee'
    ORDER BY est_principal DESC, sort_order, id LIMIT 1
  `, [verbId])
  if (undetermined[0]) {
    await database.execute(`
      UPDATE verbe_sens SET intitule=?, definition=?, construction=?, transitivite=?,
        preposition=?, auxiliaire='avoir', source='manuel'
      WHERE id=?
    `, [entry.label, entry.label, entry.type === 'cod' ? 'N0 V N1' : `N0 V ${preposition} N1`, transitivite, preposition, undetermined[0].id])
    return Number(undetermined[0].id)
  }

  const [result] = await database.execute(`
    INSERT INTO verbe_sens
      (verbe_id, numero_sens, intitule, definition, construction, transitivite,
       preposition, auxiliaire, registre, est_pronominal, est_principal, source, sort_order)
    SELECT ?, COALESCE(MAX(numero_sens), 0) + 1, ?, ?, ?, ?, ?, 'avoir', 'courant', 0, 0,
      'manuel', COALESCE(MAX(sort_order), 0) + 1
    FROM verbe_sens WHERE verbe_id=?
  `, [verbId, entry.label, entry.label, entry.type === 'cod' ? 'N0 V N1' : `N0 V ${preposition} N1`, transitivite, preposition, verbId])
  return Number(result.insertId)
}

await database.beginTransaction()
try {
  for (const [infinitive, entry] of Object.entries(catalog)) {
    const [verbs] = await database.execute(
      'SELECT id FROM verbes WHERE infinitif=? AND est_archive=0 LIMIT 1',
      [infinitive],
    )
    if (!verbs[0]) throw new Error(`Verbe absent : ${infinitive}`)

    const senseId = await ensureSense(Number(verbs[0].id), entry)
    const code = entry.type === 'cod' ? 'cod-postpose' : `coi-${entry.preposition}-postpose`
    const patron = entry.type === 'cod' ? 'N0 V N1' : `N0 V ${entry.preposition} N1`
    await database.execute(`
      INSERT INTO constructions_verbales
        (sens_id, code, fonction_objet, preposition, patron, complement_obligatoire,
         source, statut_validation, actif)
      VALUES (?, ?, ?, ?, ?, 0, ?, 'valide', 1)
      ON DUPLICATE KEY UPDATE fonction_objet=VALUES(fonction_objet), preposition=VALUES(preposition),
        patron=VALUES(patron), source=VALUES(source), statut_validation='valide', actif=1
    `, [senseId, code, entry.type, entry.preposition ?? null, patron, source])
    const [constructions] = await database.execute(
      'SELECT id FROM constructions_verbales WHERE sens_id=? AND code=? LIMIT 1',
      [senseId, code],
    )
    const constructionId = Number(constructions[0].id)
    await database.execute(
      'UPDATE complements_verbaux SET actif=0 WHERE construction_id=? AND source=?',
      [constructionId, source],
    )

    for (const text of entry.complements) {
      const placement = entry.type === 'cod' ? inferAnteposedComplement(text) : null
      await database.execute(`
        INSERT INTO complements_verbaux
          (construction_id, texte, texte_antepose, genre, nombre, classe_semantique,
           niveau_cecrl, poids, source, statut_validation, actif)
        VALUES (?, ?, ?, ?, ?, ?, 'A2', 1, ?, 'valide', 1)
        ON DUPLICATE KEY UPDATE texte_antepose=VALUES(texte_antepose), genre=VALUES(genre),
          nombre=VALUES(nombre), classe_semantique=VALUES(classe_semantique), niveau_cecrl='A2',
          poids=1, source=VALUES(source), statut_validation='valide', actif=1
      `, [constructionId, text, placement?.text ?? null, placement?.gender ?? null,
        placement?.number ?? null, entry.className, source])
    }
  }
  await database.commit()
} catch (error) {
  await database.rollback()
  throw error
}

const [summary] = await database.execute(`
  SELECT cv.fonction_objet, COUNT(DISTINCT vs.verbe_id) AS verbes,
         COUNT(DISTINCT cv.id) AS constructions, COUNT(c.id) AS complements
  FROM constructions_verbales cv
  INNER JOIN verbe_sens vs ON vs.id=cv.sens_id
  INNER JOIN complements_verbaux c ON c.construction_id=cv.id AND c.actif=1
  WHERE cv.source=? AND cv.actif=1
  GROUP BY cv.fonction_objet ORDER BY cv.fonction_objet
`, [source])
console.log(JSON.stringify({ ok: true, source, summary }, null, 2))
await database.end()

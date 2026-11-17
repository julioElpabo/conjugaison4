/**
 * Demande FLE du 17 novembre 2026 : 42 lignes, 41 sélections distinctes.
 * Les définitions sont rédigées pour le site. Les CECRL sont des estimations
 * éditoriales, et non des classements attribués par les sources linguistiques.
 */
export const FLE_VERB_BATCH_ID = 'fle-verbs-2026-11-17'
export const requestedFleVerbs = [
  'épeler', 'planter', 'décrire', 'posséder', 'coûter', 'détester', 'fermer',
  'se maquiller', 'se peigner', 'se retrouver', 'revenir', 'conseiller',
  'préparer', 'rédiger', 'réserver', 'regretter', 'se connecter', 'se garer',
  'régler', 'récapituler', 'conseiller', 'se promener', 'patienter',
  'raccrocher', 'quitter', 'démissionner', 'fonder', 'retourner', 'remercier',
  'convenir', 'remplacer', 'préoccuper', "s'énerver", 'se disputer', 'annuler',
  'reporter', 'réparer', 'visser', 'toucher', 'supporter', 'tousser', "s'entendre",
]

// Infinitif, définition du sens principal, domaine sémantique, niveau estimé.
export const fleVerbEditorialEntries = [
  ['épeler', 'Dire les lettres d’un mot une par une, dans leur ordre.', 'communication', 'A2'],
  ['planter', 'Mettre une plante ou une graine dans la terre pour la faire pousser.', 'nature', 'A2'],
  ['décrire', 'Dire ou écrire comment est une personne, une chose ou un lieu.', 'communication', 'A2'],
  ['posséder', 'Avoir une chose qui nous appartient.', 'etat-existence', 'A2'],
  ['coûter', 'Avoir un prix ou demander une certaine somme d’argent.', 'echange', 'A1'],
  ['détester', 'Ne pas aimer du tout une personne, une chose ou une activité.', 'emotion', 'A1'],
  ['fermer', 'Mettre une porte, une fenêtre ou un objet dans une position qui empêche le passage.', 'manipulation', 'A1'],
  ['maquiller', 'Mettre des produits de maquillage sur le visage de quelqu’un.', 'corps', 'A2'],
  ['peigner', 'Passer un peigne dans les cheveux de quelqu’un.', 'corps', 'A2'],
  ['retrouver', 'Trouver de nouveau une personne ou une chose que l’on cherchait.', 'action-processus', 'A2'],
  ['revenir', 'Venir de nouveau dans un lieu où l’on était auparavant.', 'mouvement', 'A1'],
  ['conseiller', 'Dire à quelqu’un ce qui pourrait l’aider ou ce qu’il pourrait faire.', 'communication', 'A2'],
  ['préparer', 'Faire ce qui est nécessaire pour qu’une chose soit prête.', 'action-processus', 'A1'],
  ['rédiger', 'Écrire un texte en choisissant et en organisant ses mots.', 'communication', 'B1'],
  ['réserver', 'Demander à garder une place, une chambre ou un objet pour plus tard.', 'echange', 'A2'],
  ['regretter', 'Être triste à cause d’une chose passée ou de l’absence de quelqu’un.', 'emotion', 'A2'],
  ['connecter', 'Relier un appareil à un autre appareil ou à un réseau.', 'action-processus', 'A2'],
  ['garer', 'Placer un véhicule à un endroit où il peut rester arrêté.', 'position', 'A2'],
  ['régler', 'Modifier un appareil pour qu’il fonctionne comme on le souhaite.', 'manipulation', 'A2'],
  ['récapituler', 'Rappeler les points les plus importants de ce qui a été dit ou fait.', 'communication', 'B1'],
  ['promener', 'Faire marcher quelqu’un ou un animal pour prendre l’air.', 'mouvement', 'A2'],
  ['patienter', 'Attendre sans s’impatienter.', 'action-processus', 'A2'],
  ['raccrocher', 'Terminer une conversation téléphonique en coupant la communication.', 'communication', 'A2'],
  ['quitter', 'Partir d’un lieu ou cesser d’être avec une personne.', 'mouvement', 'A1'],
  ['démissionner', 'Décider de quitter son emploi ou sa fonction.', 'creation-travail', 'B1'],
  ['fonder', 'Créer une entreprise, une association ou une autre organisation.', 'creation-travail', 'B1'],
  ['retourner', 'Aller de nouveau dans un lieu où l’on était auparavant.', 'mouvement', 'A2'],
  ['remercier', 'Dire merci à quelqu’un pour ce qu’il a fait.', 'communication', 'A1'],
  ['convenir', 'Être adapté à une personne ou à une situation.', 'relations', 'B1'],
  ['remplacer', 'Mettre une personne ou une chose à la place d’une autre.', 'action-processus', 'A2'],
  ['préoccuper', 'Causer du souci à quelqu’un ou occuper beaucoup ses pensées.', 'emotion', 'B1'],
  ['énerver', 'Mettre quelqu’un en colère ou lui faire perdre son calme.', 'emotion', 'A2'],
  ['disputer', 'Participer à une compétition pour essayer de gagner.', 'action-processus', 'B1'],
  ['annuler', 'Décider qu’une chose prévue n’aura pas lieu ou n’est plus valable.', 'action-processus', 'A2'],
  ['reporter', 'Déplacer un évènement prévu à une autre date.', 'action-processus', 'A2'],
  ['réparer', 'Remettre en état une chose abîmée ou qui ne fonctionne plus.', 'manipulation', 'A2'],
  ['visser', 'Faire tourner une vis ou une pièce pour la fixer.', 'manipulation', 'B1'],
  ['toucher', 'Mettre une partie du corps en contact avec une personne ou une chose.', 'perception', 'A1'],
  ['supporter', 'Réussir à accepter une chose difficile ou désagréable.', 'emotion', 'A2'],
  ['tousser', 'Rejeter brusquement de l’air par la bouche quand la gorge ou les poumons sont irrités.', 'corps', 'A2'],
  ['entendre', 'Percevoir un son avec les oreilles.', 'perception', 'A1'],
].map(([infinitive, definition, semanticDomain, cefr]) => ({
  infinitive, definition, semanticDomain, cefr,
  transitivity: infinitive === 'convenir' ? 'transitif_indirect'
    : ['coûter', 'revenir', 'patienter', 'raccrocher', 'démissionner', 'retourner', 'tousser'].includes(infinitive)
      ? 'intransitif' : 'transitif_direct',
  preposition: infinitive === 'convenir' ? 'à' : null,
}))

export const requestedFlePronominals = [
  ['se maquiller', 'maquiller', 'Mettre des produits de maquillage sur son propre visage.'],
  ['se peigner', 'peigner', 'Passer un peigne dans ses propres cheveux.'],
  ['se retrouver', 'retrouver', 'Être de nouveau avec une personne ou dans un même lieu.'],
  ['se connecter', 'connecter', 'Accéder à un réseau ou à un service en ligne.'],
  ['se garer', 'garer', 'S’arrêter avec son véhicule à un endroit où il peut rester.'],
  ['se promener', 'promener', 'Marcher pour le plaisir ou pour prendre l’air.'],
  ["s'énerver", 'énerver', 'Perdre son calme ou se mettre en colère.'],
  ['se disputer', 'disputer', 'Exprimer vivement un désaccord avec quelqu’un.'],
  ["s'entendre", 'entendre', 'Avoir de bonnes relations ou se mettre d’accord avec quelqu’un.'],
].map(([infinitive, baseInfinitive, definition]) => ({
  infinitive, baseInfinitive, definition,
  // Ces emplois sont possibles au singulier avec un partenaire introduit par avec.
  allowedPersons: [4, 5, 6, 7, 8, 9], agreement: 'avec_sujet',
}))

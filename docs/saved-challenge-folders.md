# Dossiers personnels dans « Mes défis »

Chaque compte peut créer et renommer ses dossiers. Un défi enregistré appartient
à un seul dossier, ou reste dans « Non classés ». Les dossiers ne sont pas imbriqués.

- « Tous les défis » affiche l'ensemble des défis du compte.
- « Non classés » affiche ceux qui n'ont pas encore été classés.
- Les dossiers sont accompagnés d'une icône ; « Tous les défis » et « Non classés » restent sans icône.
  Sur chaque carte de défi, un badge
  avec cette même icône affiche « Dossier : … » ou simplement « Non classé ».
  Cliquer sur le badge « Non classé » ouvre le même choix de classement que « Classer ».
- Le bouton « Classer » d'une carte ouvre une fenêtre affichant tous les dossiers
  directement sélectionnables, ainsi que « Non classés ». Un dossier peut aussi
  être créé dans cette fenêtre ; il est alors sélectionné automatiquement. Le
  classement est effectué uniquement après validation avec « Classer ».
- « Sélectionner », puis « Tout sélectionner », concerne uniquement les défis du
  dossier affiché. Changer de dossier vide la sélection.
- La suppression d'un dossier, après confirmation, remet ses défis dans
  « Non classés » et conserve leurs codes, liens, contenus et résultats.

Le bouton « Couleur », à droite de « Renommer », ouvre une palette de 12 couleurs
prédéfinies. Cette même palette est disponible à la création d'un dossier, y
compris depuis « Classer » : le nom et la couleur sont enregistrés ensemble.
La sélection est enregistrée uniquement après validation et se retrouve
sur l'icône du dossier, dans le choix de classement et sur les badges des défis.

À l'intérieur de chaque vue, le classement chronologique existant est conservé.
Les défis créés ou ajoutés au compte arrivent dans « Non classés ». Les noms de
dossiers sont personnels, limités à 80 caractères et uniques dans chaque compte
selon la collation MySQL (sans distinction de casse). Les commandes et messages
sont disponibles dans toutes les langues de l'interface.

## Stockage et droits

`learner_challenge_folders` contient les dossiers, leur compte propriétaire et un
identifiant de couleur validé parmi les 12 valeurs de la palette. Les dossiers
existants reçoivent le violet par défaut via une migration idempotente au démarrage.
`learner_saved_challenges.folder_id` contient le classement personnel. Le défi
partagé dans `defis` n'est pas modifié. La clé étrangère utilise `ON DELETE SET NULL`
pour préserver les cartes lorsqu'un dossier est supprimé.

L'API de lecture des défis renvoie aussi les dossiers. Les écritures utilisent
exclusivement la session du compte connecté : créer, renommer et supprimer un
dossier, ou déplacer des défis. Le déplacement multiple vérifie tous les codes
et la propriété du dossier dans une transaction ; aucune carte n'est déplacée
si une des cibles est invalide. La consultation administrative conserve son
affichage en lecture seule.

## Migration et validation

Le plugin `learner-accounts-migration.ts` prépare les dossiers au démarrage,
après la création des tables des comptes et des défis enregistrés.
La migration est idempotente et les requêtes attendent sa disponibilité ; après
un échec transitoire, elle est retentée. Les défis existants restent sans dossier.
Les fichiers versionnés suffisent pour le déploiement normal de l'application
dans Plesk : aucune action de déploiement supplémentaire ni « Run script ».

Tests ciblés :

```sh
node --env-file-if-exists=.env --import tsx --test tests/saved-challenge-folders.test.mjs tests/saved-challenge-removal.test.mjs tests/saved-challenge-metadata.test.mjs tests/saved-challenge-dates.test.mjs
```

La variable `DEFIS_CLEANUP_TEST_SOCKET` active les tests MySQL sur une instance
temporaire isolée (chemin `/tmp/defis-cleanup-mysql.*/mysql.sock`). Ces tests créent
et suppriment leur propre schéma, jamais les données du site. Ils vérifient
notamment la répétition de la migration, l'isolation entre comptes, l'annulation
complète d'un déplacement invalide et la conservation des défis et résultats.

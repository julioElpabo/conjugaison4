# Publications SEO des défis officiels

## Périmètre

Cette fonctionnalité publie une page éditoriale par langue autour d’un défi officiel de `challenge_presets`. Elle ne transforme pas les défis personnels de `defis` et ne modifie pas leurs URL `/[locale]/defi/CODE`, qui restent privées pour les moteurs.

Les routes publiques sont :

- `/[locale]/defis` : bibliothèque des publications publiées dans la langue ;
- `/[locale]/defis/[slug]` : page SSR d’une publication ;
- `/api/challenge-publications?locale=fr` : liste publique ;
- `/api/challenge-publications/[slug]?locale=fr` : résolution publique ou redirection.

## Données et migration

Le plugin `server/plugins/challenge-publications-migration.ts` crée au démarrage normal :

- `challenge_preset_publications`, avec une version au plus par `(preset_id, locale)` et un slug unique par langue ;
- `challenge_preset_publication_redirects`, qui conserve les anciens slugs publiés.

La migration est idempotente, ne contient aucun secret et dépend uniquement de la connexion MySQL normale du site. Aucun script Plesk ni aucune action après déploiement n’est requis.

## Transfert sûr entre la base locale et la production

La base entière ne doit jamais être copiée vers la production : elle pourrait écraser des défis, des comptes ou des données plus récents. Les publications SEO disposent donc d’un paquet ciblé et versionné : `shared/data/challenge-publication-deployment.json`.

Après avoir saisi et relu les textes dans l’administration locale, la commande suivante exporte uniquement `challenge_preset_publications` :

```sh
npm run data:export-challenge-publications
```

Chaque entrée référence le défi par sa clé stable `challenge_presets.preset_key`, jamais par l’identifiant numérique local. Par sécurité, l’export normal :

- remet toutes les entrées en brouillon ;
- marque chaque entrée `overwriteExisting: false` ;
- ne contient ni secret, ni défi personnel, ni autre donnée de la base.

Le fichier exporté peut être relu puis versionné. Au démarrage normal de l’application, le plugin crée sa table de suivi et applique chaque `batchId` une seule fois, dans une transaction. Une publication qui existe déjà pour la même clé de preset et la même langue est conservée par défaut. Si un preset manque ou si le paquet est incohérent, toute l’opération est annulée et peut être retentée après la fin des migrations.

Les options `--overwrite-existing` et `--preserve-publication-status` existent pour une livraison future expressément validée. La première autorise le remplacement ciblé des mêmes publications à distance ; la seconde conserve l’état publié. Elles ne doivent pas être utilisées pour une préparation ordinaire. Un même `batchId` ne peut pas être réutilisé avec un contenu différent : le checksum enregistré bloque cette situation.

Le déploiement ultérieur reste celui du projet : commit et push des fichiers versionnés, déploiement Git puis redémarrage normal dans Plesk. Il n’y a aucune synchronisation globale de base et aucune commande à lancer après le déploiement.

## États et visibilité

- Un brouillon (`is_published=0`) n’est pas résolu par l’API publique et retourne donc 404.
- Une publication (`is_published=1`) retourne 200 avec `index, follow`, figure dans la bibliothèque et dans le sitemap.
- Publier implique automatiquement l’indexation ; il n’existe plus d’état public intermédiaire.
- Seules les traductions publiées sont annoncées en `hreflang`.
- La colonne historique `is_indexable` est conservée pour compatibilité MySQL et automatiquement alignée sur `is_published` au démarrage.
- `x-default` cible la version française lorsqu’elle existe, sinon la page canonique courante.

Le canonical est `/[locale]/defis/[slug]`, sans paramètres. Le changement manuel du slug d’une publication déjà publiée enregistre l’ancienne adresse ; celle-ci renvoie ensuite une 301 vers le slug courant.

## Administration

Les endpoints suivants exigent `requireAdministrator` :

- `GET /api/admin/challenge-presets/[id]/publications` ;
- `PUT /api/admin/challenge-presets/[id]/publications/[locale]`.

La page d’administration des défis propose cinq onglets linguistiques, l’état de chaque version, les champs éditoriaux, l’aperçu de l’URL, un unique contrôle de publication et l’enregistrement automatique. Les doublons de slug produisent une réponse 409. L’enregistrement et la création éventuelle d’une redirection sont transactionnels.

## Livraison éditoriale actuelle

Le paquet `challenge-publications-all-presets-20260818-001` contient les 38 défis préfabriqués dans les cinq langues, soit 190 publications complètes. Elles possèdent toutes un slug unique, un H1, un titre SEO, une description visible et une meta description. Elles sont explicitement marquées publiées et indexables, conformément à l’autorisation donnée le 18 août 2026.

Cette livraison utilise `overwriteExisting: true` uniquement pour ces 190 couples `(preset_key, locale)`. Elle ne copie aucune autre table et ne touche ni aux défis personnels, ni aux comptes, ni aux statistiques de la base distante. Le plugin de démarrage tente la synchronisation après les migrations et la garantit avant le traitement de la première requête ; aucun script ou identifiant MySQL n’est requis dans Plesk.

Le catalogue peut être régénéré de manière déterministe avec :

```sh
npm run data:generate-challenge-publications
```

## Sitemap et maillage

Le sitemap conserve ses pages statiques et ajoute les publications publiées. Si la base est indisponible, la partie statique reste générée. Chaque publication reçoit un lien depuis la bibliothèque de sa langue.

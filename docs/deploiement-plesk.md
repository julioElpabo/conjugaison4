# Déploiement automatique GitHub → Plesk

Le déploiement utilise l’extension Git de Plesk. Les fichiers nécessaires sont
envoyés par `git push`, puis Plesk récupère le commit. Ce serveur n’accepte
aucune action ni aucun script après déploiement.

## 1. Préparer le domaine dans Plesk

Les extensions **Git** et **Node.js Toolkit** doivent être disponibles.

Dans **Sites Web & Domaines → Node.js** :

- choisir Node.js 22.12+ ou 24.11+ ;
- choisir le mode `Production` ;
- définir la racine de l’application sur le dossier où le dépôt sera déployé ;
- définir la racine du document sur `.output/public` ;
- définir le fichier de démarrage sur `app.mjs` ;
- ne pas encore activer l’application avant le premier build réussi.

La configuration d’exécution de l’application contient notamment les valeurs
suivantes :

```text
NUXT_DB_HOST=127.0.0.1
NUXT_DB_PORT=3306
NUXT_DB_NAME=nom_de_la_base
NUXT_DB_USER=utilisateur_mysql
NUXT_DB_PASSWORD=mot_de_passe_mysql
NUXT_SESSION_SECRET=une_valeur_aleatoire_d_au_moins_32_caracteres
NODE_ENV=production
```

Ces valeurs ne doivent jamais être ajoutées au dépôt Git. Elles ne sont pas
accessibles depuis « Run script » ni depuis une action de déploiement Plesk.

## 2. Relier le dépôt GitHub

Dans **Sites Web & Domaines → Git → Ajouter un dépôt** :

1. choisir un dépôt Git distant ;
2. saisir `git@github.com:julioElpabo/conjugaison4.git` ;
3. sélectionner la branche `main` ;
4. choisir le dossier défini comme racine de l’application Node.js ;
5. laisser les « Actions de déploiement supplémentaires » vides.

Si le dépôt GitHub est privé, copier la clé publique affichée par Plesk dans
**GitHub → Settings → Deploy keys → Add deploy key**. L’accès en écriture n’est
pas nécessaire.

## 3. Déployer sans action supplémentaire

Ne configurer aucune commande après déploiement. En particulier, ne pas
utiliser :

```bash
bash scripts/deploy-plesk.sh ../tmp/restart.txt
```

Cette commande n’est pas acceptée par ce serveur. Effectuer la récupération et
le déploiement avec les fonctions normales de l’extension Git de Plesk, puis
redémarrer l’application depuis l’interface Node.js si nécessaire.

## 4. Ajouter le webhook GitHub

Dans les paramètres du dépôt Git de Plesk, copier l’URL de webhook générée.
Dans **GitHub → Settings → Webhooks → Add webhook** :

- coller cette URL dans **Payload URL** ;
- choisir `application/json` ;
- sélectionner uniquement l’évènement **Push** ;
- activer le webhook.

Dès lors, chaque push sur `main` suit ce flux :

```text
push GitHub → récupération/déploiement Plesk → redémarrage normal de l’application
```

Les journaux du déploiement sont visibles dans la section Git de Plesk. Les
journaux de l’application sont visibles dans **Sites Web & Domaines → Logs**.

## 5. Appliquer une migration de données

Ne lancer aucune migration depuis **Run script** : les variables de connexion
MySQL de Plesk n’y sont pas accessibles. Toute évolution de la base doit fournir
une variante dans les fichiers envoyés par `git push`, de préférence une
migration idempotente exécutée au démarrage de l’application, où la connexion
MySQL du site est disponible.

Le futur proche suit ce mécanisme : après déploiement, un redémarrage de
l’application exécute automatiquement le plugin
`server/plugins/near-future-migration.ts`. Il crée le temps s’il manque et
l’ajoute aux défis CIF stockés. Il ne faut donc jamais exécuter
`data:migrate-near-future:apply` depuis **Run script**.

Le lot pilote de 100 verbes et la conversion dynamique des défis de groupes
suivent la même règle grâce aux fichiers
`server/plugins/verb-pilot-migration.ts` et
`server/plugins/challenge-group-criteria-migration.ts`, tous deux livrés par
`git push`.

Chaque migration automatique doit être transactionnelle et réexécutable : une
erreur annule la migration et un redémarrage ultérieur contrôle les données déjà
présentes. Après le déploiement, cliquer sur **Restart App**, puis vérifier les
journaux de l’application.

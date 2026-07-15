# Déploiement automatique GitHub → Plesk

Le déploiement utilise l’extension Git de Plesk. Un push sur `main` déclenche un
webhook GitHub, puis Plesk récupère le commit, construit Nuxt et redémarre
l’application Node.js.

## 1. Préparer le domaine dans Plesk

Les extensions **Git** et **Node.js Toolkit** doivent être disponibles.

Dans **Sites Web & Domaines → Node.js** :

- choisir Node.js 22.12+ ou 24.11+ ;
- choisir le mode `Production` ;
- définir la racine de l’application sur le dossier où le dépôt sera déployé ;
- définir la racine du document sur `.output/public` ;
- définir le fichier de démarrage sur `app.mjs` ;
- ne pas encore activer l’application avant le premier build réussi.

Ajouter les variables d’environnement suivantes dans la configuration Node.js
de Plesk :

```text
NUXT_DB_HOST=127.0.0.1
NUXT_DB_PORT=3306
NUXT_DB_NAME=nom_de_la_base
NUXT_DB_USER=utilisateur_mysql
NUXT_DB_PASSWORD=mot_de_passe_mysql
NUXT_SESSION_SECRET=une_valeur_aleatoire_d_au_moins_32_caracteres
NODE_ENV=production
```

Ces valeurs ne doivent jamais être ajoutées au dépôt Git.

## 2. Relier le dépôt GitHub

Dans **Sites Web & Domaines → Git → Ajouter un dépôt** :

1. choisir un dépôt Git distant ;
2. saisir `git@github.com:julioElpabo/conjugaison4.git` ;
3. sélectionner la branche `main` ;
4. choisir le dossier défini comme racine de l’application Node.js ;
5. activer le mode de déploiement automatique.

Si le dépôt GitHub est privé, copier la clé publique affichée par Plesk dans
**GitHub → Settings → Deploy keys → Add deploy key**. L’accès en écriture n’est
pas nécessaire.

## 3. Configurer l’action après déploiement

Dans les paramètres du dépôt Git de Plesk, activer **Actions de déploiement
supplémentaires** et ajouter :

```bash
bash scripts/deploy-plesk.sh ../tmp/restart.txt
```

Le chemin `../tmp/restart.txt` convient quand la racine de l’application est le
dossier `httpdocs` du domaine. Si l’application est dans un sous-dossier,
adapter ce chemin pour viser le dossier `tmp` du domaine Plesk.

Effectuer une première récupération et un premier déploiement manuellement.
Quand le build est terminé, activer Node.js et vérifier l’URL de l’application.

## 4. Ajouter le webhook GitHub

Dans les paramètres du dépôt Git de Plesk, copier l’URL de webhook générée.
Dans **GitHub → Settings → Webhooks → Add webhook** :

- coller cette URL dans **Payload URL** ;
- choisir `application/json` ;
- sélectionner uniquement l’évènement **Push** ;
- activer le webhook.

Dès lors, chaque push sur `main` suit ce flux :

```text
push GitHub → webhook Plesk → récupération de main → npm ci → build Nuxt → redémarrage
```

Les journaux du déploiement sont visibles dans la section Git de Plesk. Les
journaux de l’application sont visibles dans **Sites Web & Domaines → Logs**.

# Passage en production — juillet 2026

## Objectif

La nouvelle application fonctionne actuellement sous :

```text
https://conjugaison4.tatitotu.ch
```

L’ancienne application reste accessible sous :

```text
https://conjugaison.tatitotu.ch
https://tatitotu.ch
```

L’objectif est de remplacer l’ancienne application sans changer l’adresse
publique connue des utilisateurs :

```text
https://conjugaison.tatitotu.ch
```

Les anciens favoris doivent donc continuer à fonctionner. À terme :

```text
tatitotu.ch
        ↓ redirection permanente
conjugaison.tatitotu.ch
        ↓
nouvelle application utilisant la base conjugaison4

conjugaison4.tatitotu.ch
        ↓ redirection permanente
conjugaison.tatitotu.ch
```

Le nom du dossier utilisé sur le serveur n’apparaît jamais dans l’adresse vue
par les utilisateurs.

## Principe de sécurité

La nouvelle version ne doit pas être déployée directement par-dessus le dossier
de l’ancien site.

Les dossiers doivent rester séparés :

```text
/conjugaison.tatitotu.ch   ancien site actuellement public
/conjugaison4.tatitotu.ch  nouvelle version actuellement testée
/conjugaison-production    futur déploiement public
```

Le dossier `/conjugaison-production` peut rester le dossier définitif de
l’application. Il ne sera pas nécessaire de le renommer après la bascule.

## 1. Créer le second dépôt Git dans Plesk

Depuis la fiche de `conjugaison.tatitotu.ch`, ouvrir Git puis créer un dépôt.

Choisir :

```text
Code location                  Local repository
Repository name                conjugaison.git
Deployment mode                Manual
Server path                    /conjugaison-production
Additional deployment actions  désactivées
```

Ne surtout pas utiliser le chemin suivant :

```text
/conjugaison.tatitotu.ch
```

Un déploiement dans ce dossier risquerait d’écraser immédiatement les fichiers
de l’ancien site.

Le mode `Manual` permet de pousser les commits vers le dépôt Git interne de
Plesk sans déployer automatiquement les fichiers.

Plesk créera normalement `/conjugaison-production` lors du premier
déploiement. S’il exige un dossier existant, créer auparavant un dossier vide
portant ce nom dans le gestionnaire de fichiers.

Ne configurer aucune action de déploiement supplémentaire. En particulier, ne
pas utiliser :

```text
bash scripts/deploy-plesk.sh ../tmp/restart.txt
```

## 2. Ajouter le nouveau dépôt Plesk sur l’ordinateur

Après la création, Plesk affiche l’URL du nouveau dépôt local. Copier exactement
cette URL, puis ajouter un second remote dans le dépôt de travail :

```bash
git remote add plesk-production URL_FOURNIE_PAR_PLESK
```

Vérifier les remotes :

```bash
git remote -v
```

Le remote existant conserve son rôle :

```text
plesk             → conjugaison4.tatitotu.ch
plesk-production  → futur conjugaison.tatitotu.ch
origin            → GitHub
```

Un push vers le nouveau dépôt s’effectuera avec :

```bash
git push plesk-production main
```

Ce push :

- envoie les commits nécessaires pour reproduire la branche `main` ;
- n’envoie pas les modifications qui ne sont pas commitées ;
- n’envoie pas les fichiers exclus par `.gitignore` ;
- n’envoie pas les autres branches, sauf demande explicite ;
- ne modifie pas le dépôt Plesk de `conjugaison4` ;
- ne modifie pas encore les fichiers publics lorsque le mode de déploiement est
  `Manual`.

Le push existant reste indépendant :

```bash
git push plesk main
```

Il continue d’alimenter uniquement l’installation
`conjugaison4.tatitotu.ch`.

## 3. Déployer manuellement dans le nouveau dossier

Après :

```bash
git push plesk-production main
```

le déroulement est le suivant :

```text
le dépôt Git interne de Plesk reçoit les commits
        ↓
aucun fichier public n’est modifié
        ↓
clic manuel sur « Deploy »
        ↓
Plesk place les fichiers dans /conjugaison-production
```

Plesk utilise exactement le `Server path` configuré. Il ne déplacera pas les
fichiers automatiquement dans `/conjugaison.tatitotu.ch`, et c’est volontaire.

## 4. Point à régler avant la bascule : le dossier `.output`

L’application démarre avec :

```text
app.mjs
```

Ce fichier charge :

```text
.output/server/index.mjs
```

Or `.output` est actuellement exclu par `.gitignore`. Un simple push de la
branche `main` déploie donc les sources, mais pas nécessairement l’application
Nuxt construite et exécutable.

Avant toute bascule, le futur paquet de déploiement doit contenir au minimum :

```text
/conjugaison-production/app.mjs
/conjugaison-production/.output/server/index.mjs
/conjugaison-production/.output/public
```

Le build destiné à Plesk doit être produit sur Linux et envoyé dans une branche
de déploiement versionnée. Plesk doit ensuite récupérer uniquement les fichiers
versionnés de cette branche.

Ne pas lancer de construction ou de script dans les « Actions de déploiement
supplémentaires » de Plesk. Ne pas effectuer la bascule tant que la présence et
le fonctionnement du paquet `.output` n’ont pas été vérifiés.

## 5. Gestion des bases de données

### Bases à conserver

Deux bases distinctes doivent être conservées pendant la transition :

```text
ancienne base       → ancienne application
base conjugaison4   → nouvelle application
```

La nouvelle application doit continuer à utiliser exclusivement :

```text
NUXT_DB_NAME=conjugaison4
```

Ne pas :

- renommer `conjugaison4` pendant la transition ;
- faire pointer la nouvelle application vers l’ancienne base ;
- importer l’ancien dump par-dessus `conjugaison4` ;
- supprimer l’ancienne base après la bascule ;
- placer les identifiants MySQL dans Git ou dans un fichier versionné.

### Sauvegardes avant la bascule

Avant la création du nouveau déploiement, puis une seconde fois juste avant la
bascule publique :

1. créer un export SQL complet de l’ancienne base ;
2. créer un export SQL complet de `conjugaison4` ;
3. faire si possible une sauvegarde Plesk des deux sites et de leurs fichiers ;
4. télécharger au moins les deux exports SQL hors du serveur ;
5. noter la date, l’heure et la base correspondant à chaque sauvegarde ;
6. vérifier que les fichiers de sauvegarde ne sont pas vides.

Exemple de noms permettant d’éviter une confusion :

```text
ancienne-conjugaison-2026-07-JJ-HHMM.sql
conjugaison4-2026-07-JJ-HHMM.sql
```

### Données créées par les utilisateurs

Avant la bascule, déterminer si l’ancienne application reçoit encore des
données importantes : comptes, résultats, défis, messages ou modifications
administratives.

Si des données doivent être transférées de l’ancienne base vers
`conjugaison4`, ce transfert doit être préparé et testé avant la mise en
production. Les schémas des deux bases ne doivent pas être supposés
compatibles. Ne pas importer directement l’ancienne base dans `conjugaison4`.

Au moment de la bascule, si l’ancienne application accepte des écritures
importantes :

1. choisir une heure de faible fréquentation ;
2. empêcher temporairement les nouvelles écritures sur l’ancien site, si
   possible ;
3. effectuer les sauvegardes SQL finales ;
4. appliquer uniquement le transfert de données qui aura été préalablement
   préparé et vérifié ;
5. basculer ensuite le domaine.

Après la bascule, les nouvelles données seront créées dans `conjugaison4`.
L’ancienne base deviendra une sauvegarde de retour arrière et ne devra plus
recevoir d’écritures.

### Variables d’environnement Plesk

Dans les réglages Node.js de `conjugaison.tatitotu.ch`, reprendre les variables
qui fonctionnent déjà pour `conjugaison4.tatitotu.ch`, notamment :

```text
NUXT_DB_HOST
NUXT_DB_PORT
NUXT_DB_NAME=conjugaison4
NUXT_DB_USER
NUXT_DB_PASSWORD
NUXT_SESSION_SECRET
NODE_ENV=production
```

Reprendre également, lorsqu’elles sont utilisées :

```text
NUXT_LEARNER_SESSION_SECRET
NUXT_TURNSTILE_SECRET_KEY
NUXT_PUBLIC_TURNSTILE_SITE_KEY
NUXT_GA4_PROPERTY_ID
NUXT_GA4_CLIENT_EMAIL
NUXT_GA4_PRIVATE_KEY
NUXT_PUBLIC_GA4_MEASUREMENT_ID
```

Plesk limite parfois une variable personnelle à 255 caractères. Dans ce cas,
ne pas définir `NUXT_GA4_PRIVATE_KEY` et découper sa valeur, sans espace ni
chevauchement, dans des variables de 200 caractères maximum :

```text
NUXT_GA4_PRIVATE_KEY_1
NUXT_GA4_PRIVATE_KEY_2
NUXT_GA4_PRIVATE_KEY_3
...
```

L'application concatène les morceaux dans l'ordre au démarrage. Les séquences
`\n`, y compris celle qui suit `-----END PRIVATE KEY-----`, doivent être
conservées.

Les secrets doivent être saisis dans l’interface Node.js de Plesk. Ils ne
doivent jamais être ajoutés au dépôt Git.

Vérifier que la clé Cloudflare Turnstile accepte le nom d’hôte :

```text
conjugaison.tatitotu.ch
```

### Migrations de base

Ne jamais exécuter une migration avec « Run script » dans Plesk : les variables
de connexion MySQL du site n’y sont pas disponibles.

Les migrations nécessaires à la nouvelle version doivent être contenues dans
les fichiers versionnés et être exécutées automatiquement au démarrage de
l’application, là où les variables MySQL sont disponibles.

Elles doivent être idempotentes et réexécutables. Après la bascule, effectuer
uniquement le redémarrage normal de l’application, puis vérifier les journaux
pour confirmer :

- la connexion à `conjugaison4` ;
- la réussite des migrations automatiques ;
- l’absence d’erreur SQL ;
- le démarrage complet de l’application.

## 6. Bascule de `conjugaison.tatitotu.ch`

Avant la bascule :

1. vérifier complètement `conjugaison4.tatitotu.ch` ;
2. vérifier le paquet présent dans `/conjugaison-production` ;
3. noter et capturer les réglages actuels de
   `conjugaison.tatitotu.ch` ;
4. effectuer les sauvegardes finales des deux bases ;
5. vérifier le certificat SSL de `conjugaison.tatitotu.ch`.

Dans les réglages d’hébergement de `conjugaison.tatitotu.ch`, conserver :

```text
Domain name                 conjugaison
Hosting type                Website
SSL/TLS                     activé
HTTP vers HTTPS en 301      activé
Certificat                  certificat actuel de conjugaison.tatitotu.ch
```

Modifier le Document Root afin qu’il pointe vers :

```text
conjugaison-production/.output/public
```

Configurer ensuite Node.js pour ce domaine :

```text
Application Root         conjugaison-production
Document Root            .output/public
Application Mode         Production
Application Startup File app.mjs
Node.js Version           22.12+ ou 24.11+
```

Ajouter les variables d’environnement décrites plus haut, activer Node.js puis
effectuer le redémarrage normal de l’application.

L’adresse et le dossier seront reliés ainsi :

```text
https://conjugaison.tatitotu.ch
        ↓ configuration Plesk
/conjugaison-production
```

Les utilisateurs ne verront jamais le nom `/conjugaison-production`.

## 7. Vérifications immédiates

Après la bascule, vérifier en navigation privée :

- la page d’accueil ;
- une ancienne adresse placée en favori ;
- la consultation des conjugaisons ;
- la création et la réalisation d’un défi ;
- l’inscription et la connexion ;
- l’espace élève ;
- l’administration ;
- les impressions et les téléchargements ;
- les appels `/api/...` ;
- Turnstile ;
- l’affichage mobile ;
- les différentes langues ;
- les journaux Node.js et les erreurs SQL.

Les cookies étant liés au nom d’hôte et à la configuration de session, certains
utilisateurs pourraient devoir se reconnecter après la mise en production.

## 8. Redirections après validation

Le fichier `.htaccess` de `tatitotu.ch` doit continuer à envoyer les visiteurs
vers le domaine public :

```text
https://conjugaison.tatitotu.ch
```

Après validation de la nouvelle application, utiliser une redirection
permanente conservant les chemins :

```apache
Redirect permanent / https://conjugaison.tatitotu.ch/
```

Exemple :

```text
https://tatitotu.ch/consulter
        ↓
https://conjugaison.tatitotu.ch/consulter
```

Après quelques jours de fonctionnement correct, rediriger également :

```text
https://conjugaison4.tatitotu.ch/*
        ↓ redirection HTTP 301
https://conjugaison.tatitotu.ch/*
```

Ne pas faire la redirection dans l’autre sens : le nom public définitif doit
rester `conjugaison.tatitotu.ch`.

## 9. Retour arrière

Ne supprimer ni l’ancien dossier ni l’ancienne base pendant plusieurs semaines.

En cas de problème immédiatement après la bascule :

1. désactiver Node.js pour `conjugaison.tatitotu.ch` si nécessaire ;
2. remettre l’ancien Document Root :

   ```text
   conjugaison.tatitotu.ch
   ```

3. restaurer les anciens réglages d’hébergement ;
4. vérifier que l’ancien site utilise toujours son ancienne base ;
5. analyser séparément les données créées dans `conjugaison4` depuis la
   bascule.

Attention : si la nouvelle version a reçu des inscriptions ou des résultats
après la bascule, un retour vers l’ancienne base ne transférera pas
automatiquement ces nouvelles données. Il faudra les conserver dans
`conjugaison4` et préparer, si nécessaire, une réconciliation spécifique.

## 10. Situation définitive

Lorsque la nouvelle version est stable :

1. passer éventuellement `conjugaison.git` du mode `Manual` au mode
   `Automatic` ;
2. conserver les actions supplémentaires de déploiement désactivées ;
3. garder `/conjugaison-production` comme dossier définitif ;
4. garder `conjugaison4.tatitotu.ch` en redirection 301 ;
5. maintenir les sauvegardes de l’ancienne base selon la durée de conservation
   choisie ;
6. supprimer l’ancienne application et son ancienne base uniquement lorsque
   tout retour arrière est définitivement exclu.

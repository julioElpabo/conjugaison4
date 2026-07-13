# Conjugaison 4

Réécriture en Nuxt 4 / Node.js du site historique de défis de conjugaison.
L’ancien projet `../conjugaisonvue2` n’est utilisé que comme référence : cette
application accède exclusivement à la base MySQL définie dans son propre `.env`.

## Fonctions

- catalogue de 486 verbes, modes et temps depuis MySQL ;
- défis prédéfinis par niveau, groupe ou difficulté ;
- recherche et sélection libre des verbes et des temps ;
- conjugaison classique ou exercice conversationnel ;
- exercice d’identification du mode et du temps ;
- validation tolérante à la casse, aux espaces et aux apostrophes, mais stricte
  sur les accents et les terminaisons ;
- résultats détaillés et corrections ;
- fiche avec corrigé, impression/PDF et export Word ;
- sauvegarde et partage par un code de la forme `AB-CD-EF-GH` ;
- lecture des défis enregistrés par l’ancien site ;
- authentification administrateur, gestion des verbes/conjugaisons et statistiques.

L’administration accessible sous `/admin` comprend :

- création et modification des verbes, variantes comprises ;
- affichage des modes et temps dans l’ordre du Conjugueur ;
- exécution des tests locaux avec rapport détaillé ;
- création, modification, changement de rôle et suppression des utilisateurs.

Le lanceur de tests administrateur doit être exécuté depuis un déploiement qui
conserve le dossier `tests/` du projet (c’est le cas en développement et avec un
déploiement du dépôt complet).

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

Renseigner ensuite `.env` :

```dotenv
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=conjugaison
DB_USER=root
DB_PASSWORD=
SESSION_SECRET=une-valeur-aleatoire-d-au-moins-32-caracteres
```

`SESSION_SECRET` protège la session d’administration. Une valeur d’au moins
32 caractères est obligatoire en production.

Ouvrir <http://localhost:3000>. Si ce port est déjà occupé :

```bash
npm run dev -- --port 3001
```

## Commandes

```bash
npm run dev        # développement
npm run test       # tests métier
npm run test:conjugations # règles françaises, catalogue MySQL et collection Postman
npm run typecheck  # vérification TypeScript/Vue
npm run build      # compilation de production
npm run preview    # aperçu de la compilation
```

## Tests

Les règles métier utilisent le moteur de test intégré à Node (`node:test`) : il
ne demande ni navigateur ni serveur. Le fichier
`tests/postman-conjugation.test.mjs` lit directement la collection située dans
`postman/` et rejoue localement ses assertions sur le formateur réellement
utilisé par l'API. Postman n'est donc pas nécessaire pour ces scénarios.

`tests/conjugation-rules.test.mjs` couvre notamment les variantes, les
apostrophes, les accords, l'impératif et les formes non personnelles.
`tests/conjugation-database.test.mjs` contrôle en lecture seule la base définie
dans `.env` : temps personnels, familles orthographiques, verbes irréguliers ou
défectifs et intégrité globale du catalogue. Cette suite est ignorée si aucune
base n'est configurée.

La page `/admin/tests` organise les résultats par règle et par mode. Lorsqu'un
test échoue, elle génère aussi un prompt copiable qui réunit les cas en échec et
le journal technique nécessaire à leur réparation.

Les prochains niveaux de test à ajouter, par ordre de priorité, sont :

1. des tests d'intégration des routes publiques avec `@nuxt/test-utils` et une
   base de test isolée (`/api/questionnaires`, défis partagés et erreurs 400) ;
2. des tests de composants avec Vitest en mode navigateur pour la saisie, le
   corrigé, les dialogues, le clavier et les états d'erreur ;
3. quelques parcours complets avec Playwright : créer un défi, répondre avec
   une variante admise, consulter le résultat, partager et imprimer.

Les futurs tests qui écrivent dans MySQL devront utiliser une base isolée avec
un petit jeu de données reproductible. L'audit actuel du catalogue est
strictement en lecture seule.

## Architecture

```text
app/                 pages et composants Vue 3
shared/              types, presets et règles métier testables
server/api/           routes HTTP Nitro
server/services/      génération des questionnaires et accès métier
server/utils/         connexion MySQL et session administrateur
tests/                tests Node des règles métier et formats historiques
```

Toutes les requêtes SQL passent par `server/utils/database.ts` et utilisent des
paramètres préparés. Les erreurs SQL détaillées restent dans les journaux du
serveur et ne sont pas envoyées au navigateur.

## API publique

- `GET /api/catalogue`
- `POST /api/questionnaires`
- `POST /api/defis`
- `GET /api/defis/:code`
- `GET /api/test-db`

Les routes sous `/api/admin` nécessitent une session administrateur valide.

## Base attendue

La base configurée doit notamment contenir les tables existantes : `verbes`,
`verbesconjugues`, `personnes`, `temps`, `modes`, `defis`, `users`, `privileges`
et `logs`. La réécriture ne dépend d’aucune connexion vers l’ancienne base.

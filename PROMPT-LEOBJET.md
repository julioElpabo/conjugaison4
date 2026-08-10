# Prompt Codex — refonte complète de LEobjet

Copie-colle le prompt ci-dessous dans Codex après avoir créé et ouvert le dossier
`/Applications/MAMP/htdocs/leobjet`.

---

Tu travailles dans `/Applications/MAMP/htdocs/leobjet`, dossier neuf destiné à remplacer les deux sites historiques de LEobjet par une seule application. Exécute réellement la refonte dans ce dossier : ne te limite ni à une analyse, ni à un plan, ni à une maquette. Travaille de manière autonome, vérifie chaque étape, et poursuis jusqu’à obtenir une application locale utilisable avec une parité fonctionnelle et visuelle complète. Si l’ampleur impose plusieurs étapes, conserve un plan suivi dans le dépôt et réalise en priorité un parcours vertical complet, puis continue route par route sans remplacer les fonctions restantes par des écrans factices.

## Sources de vérité à analyser avant toute modification

Lis complètement les fichiers pertinents de ces deux projets frères :

- `../conjugaison4` est la référence obligatoire pour la pile, l’architecture Nuxt/Node/MySQL, la configuration locale, la sécurité, les tests et surtout le mécanisme Git/Plesk ;
- `../le-objet3-vuejs` est la référence fonctionnelle et visuelle obligatoire. Le nouveau site doit reproduire fidèlement sa vitrine publique, son administration, ses comportements, ses données et son responsive, tout en remplaçant Vue/Vite + PHP par Nuxt/Nitro/Node ;
- `../le-objet/site-actuel/pour-clients` est une copie complète récemment téléchargée du site actuellement servi aux clients sur `le-objet.ch` ;
- `../le-objet/site-actuel/pour-admin` est une copie complète récemment téléchargée du site d’administration actuellement servi séparément ;
- `../le-objet3-vuejs/backups-sql/LEOBJETBDD.sql` est le dump du 9 août 2026 de la base distante ;
- les médias de la vitrine sont notamment dans `../le-objet3-vuejs/site-vitrine/httpdocs` ;
- les anciens médias d’inventaire sont notamment dans `../le-objet3-vuejs/backups-sql/le-objet3/2025-12-07/api/images`, `photos` et `icones` ; utilise aussi les autres emplacements trouvés par l’audit du code et de la base.

Les deux dossiers `../le-objet/site-actuel/pour-clients` et `../le-objet/site-actuel/pour-admin` sont particulièrement importants : ils représentent les fichiers complets réellement téléchargés depuis les deux sites actuellement déployés. Analyse-les avant de porter les fonctionnalités et utilise-les pour compléter ou corriger ce qui se trouve dans `../le-objet3-vuejs`. En cas de différence sur un fichier, un média, une configuration non secrète, une route PHP ou un comportement effectivement déployé, considère d’abord la copie `site-actuel` correspondante comme la photographie la plus fidèle de la production actuelle, puis compare avec le code source et le dump pour comprendre l’écart. Ne copie aucun fichier de configuration contenant des identifiants : relève uniquement les conventions et les noms de variables nécessaires.

Le chemin du projet cible est `../leobjet` (sans trait d’union), alors que les copies des sites actuels sont bien sous `../le-objet/site-actuel` (avec trait d’union). Ne confonds pas ces deux dossiers et ne modifie jamais les copies `pour-clients` et `pour-admin` : elles sont des références en lecture seule et doivent rester disponibles pour l’audit et le retour arrière.

Lis d’abord `../conjugaison4/AGENTS.md` et applique ses contraintes à ce nouveau projet. Crée ensuite un `AGENTS.md` équivalent dans `leobjet`. Ne lis jamais un secret dans le but de l’afficher dans les journaux ou dans une réponse. Ne copie aucun secret, mot de passe, clé JWT, configuration MySQL de production ni donnée personnelle dans Git.

## Architecture cible imposée

Crée une application monolithique avec la même technologie et les mêmes conventions que `../conjugaison4` :

- Nuxt 4, Vue 3, TypeScript, Nitro et Node.js, avec des versions compatibles avec celles réellement utilisées dans `../conjugaison4` ;
- MySQL/MariaDB via `mysql2/promise`, pool centralisé, requêtes préparées et transactions pour les écritures multiples ;
- Bootstrap 5.3 installé comme dépendance npm et chargé proprement dans Nuxt ; conserve ou porte les CSS historiques spécifiques nécessaires à une restitution visuelle exacte ;
- Chart.js et les extensions réellement nécessaires aux graphiques existants ; CropperJS et les outils nécessaires aux uploads/recadrages ; évite jQuery sauf si une parité impossible à obtenir autrement est démontrée ;
- rendu SSR pour la vitrine publique, APIs Nitro dans `server/api`, services métier séparés, accès DB centralisé, composants et pages dans `app/` ;
- point d’entrée Plesk stable `app.mjs` important `.output/server/index.mjs` ;
- scripts `dev`, `dev:lan`, `build`, `start`, `preview`, `test`, `typecheck` et commandes de contrôle de la base ;
- développement local accessible sur `0.0.0.0`, avec un port documenté et modifiable.

Unifie les deux sites sous un seul domaine et un seul processus Node :

- `https://le-objet.ch/` : vitrine publique ;
- `https://le-objet.ch/admin` : connexion et administration ;
- toutes les pages du back-office sous `/admin/...` ;
- toutes les APIs sous le même origin, par exemple `/api/public/...`, `/api/auth/...` et `/api/admin/...` ;
- aucune URL applicative codée en dur vers `le-objet3.tatitotu.ch` ;
- aucun CORS nécessaire pour les appels internes ;
- prépare des redirections documentées des anciennes URLs utiles vers les nouvelles, sans faire dépendre la nouvelle application de l’ancien domaine.

Le choix `/admin` est volontaire. Ne crée pas `admin.le-objet.ch` : la vitrine et l’administration doivent partager le même déploiement, la même origine et les mêmes cookies sécurisés.

## Base locale et base distante

La base MAMP locale `le-objet` existe déjà et est vide. Elle utilise le même serveur et les mêmes identifiants MAMP locaux que `../conjugaison4/.env`, mais avec `DB_NAME=le-objet`. Crée un `.env` local gitignoré en réutilisant uniquement ces paramètres locaux et génère un nouveau secret de session fort propre à cette application. Crée un `.env.example` sans secret.

Avant l’import, vérifie à nouveau que `le-objet` est bien la base ciblée et qu’elle est vide. Importe `../le-objet3-vuejs/backups-sql/LEOBJETBDD.sql` dans cette base uniquement. N’efface, ne recrée et ne modifie aucune autre base. Le dump contient environ 74 tables et aussi des tables scolaires sans rapport direct avec LEobjet : conserve intégralement le dump importé, n’en supprime aucune, mais ne couple pas la nouvelle application aux tables étrangères inutiles.

La production doit se connecter à la base distante existante uniquement par variables d’environnement Plesk (`NUXT_DB_HOST`, `NUXT_DB_PORT`, `NUXT_DB_NAME`, `NUXT_DB_USER`, `NUXT_DB_PASSWORD`, secrets de session, SMTP, captcha/Turnstile, répertoire d’uploads, URL publique). N’embarque jamais le dump de production ni les données personnelles dans le dépôt cible. Ajoute `backups-sql/`, `.env`, fichiers de clés et médias runtime non versionnés au `.gitignore` selon leur nature.

Ne suppose jamais que « Run script » dans Plesk dispose des variables d’environnement. Toute évolution de schéma nécessaire doit être livrée par Git sous forme de migration de démarrage Nitro, idempotente, transactionnelle, réexécutable et sans perte. Le schéma actuel doit fonctionner sans migration destructive. Après déploiement, la seule action manuelle admissible est un redémarrage normal de l’application et la vérification des journaux.

## Parité exacte de la vitrine publique

Reproduis à `/` le site actuel contenu dans `site-vitrine/httpdocs/index-db.php`, ses `sections-db`, ses CSS, ses scripts utiles et les tables `vitrine_*`. La nouvelle page doit conserver le contenu actuel de la base, l’ordre, les dimensions, espacements, couleurs, typographies, animations, vidéo d’accueil, image poster, navigation à ancres, carrousels, sections LEobjet, atelier, catégories de chapeaux, élément/parallaxe, agenda et modale d’événement, lieux de vente, contact, liens Instagram/Homo Faber, PDFs, images, comportement mobile et métadonnées SEO.

Ne réinvente pas le design. Porte fidèlement le HTML/CSS et remplace les inclusions PHP par des composants Vue/Nuxt alimentés côté serveur depuis MySQL. Conserve Bootstrap et les effets visibles (AOS/carrousels/lightbox ou équivalents sans régression). Élimine les doubles chargements et les dépendances obsolètes seulement si le rendu et le comportement restent identiques.

Le formulaire de contact doit fonctionner côté serveur, valider et limiter les entrées, protéger contre le spam selon le mécanisme de `../conjugaison4` (Turnstile si c’est la convention actuelle), ne jamais exposer SMTP au navigateur et fournir des réponses utilisateur équivalentes. En local, prévois un comportement testable sans envoyer accidentellement de courriel réel.

## Parité exacte de l’administration

Porte l’intégralité des routes actives définies dans `../le-objet3-vuejs/src/router/index.js`, sous le préfixe `/admin`, y compris les routes non affichées dans le menu si elles sont encore fonctionnelles. Cela couvre notamment :

- connexion admin et connexion « espace vendeuse » par code à 8 chiffres ;
- chapeaux/voir, création, modification, commande, liste ;
- bons cadeaux ;
- dashboard ;
- stocks actuel, évolution et condensé ;
- modèles : CRUD, statistiques, plus vendus, évolution des ventes ;
- analyses, CA, performances/rentabilité, comparaisons et analyses par type ;
- couleurs, formes, tailles, types, lieux, personnes et types de personnes ;
- inventaire, contrats par lieu, tracking, attribution rapide et chapeaux en déshérence ;
- préférences, gestion/changement de mots de passe ;
- éditeur complet de la vitrine (`site.vue`) : toutes les sections, tri, agenda et dates, upload, sélection, suppression, glisser-déposer et recadrage d’images.

Conserve les règles de rôle actuelles : `admin` dispose du back-office complet ; `equipe`/vendeuse ne voit et ne peut appeler que les fonctions autorisées par l’ancien site. Les contrôles d’autorisation doivent être imposés côté serveur sur chaque API, jamais seulement masqués dans Vue.

Remplace le JWT stocké dans `localStorage` par une session serveur signée dans un cookie `HttpOnly`, `Secure` en production, `SameSite=Lax`, chemin `/`, avec rotation/révocation et expiration cohérentes avec les préférences actuelles. Préserve les comptes et hashes existants. Si un ancien hash SHA-1 est encore accepté pour compatibilité, ne l’accepte qu’au login et remplace-le automatiquement par un hash moderne après une authentification réussie. N’ajoute aucun contournement d’authentification en production. Ajoute une limitation anti-brute-force robuste pour les deux types de connexion.

Pour chaque ancien endpoint PHP appelé depuis `src/main.js` ou les vues, retrouve son contrat exact et sa requête dans `../le-objet3-vuejs/api` et `api-vitrine`, puis crée l’équivalent Nitro typé. Préserve les calculs, tris, filtres, agrégations, formats de date, montants CHF, exports/PDF et effets de bord attendus. Ne fais pas appeler les scripts PHP historiques par Node : ils sont seulement des références de migration.

## Médias et uploads

Fais un inventaire programmatique de tous les chemins médias référencés par les tables `images`, `images_objets`, les objets, les tables `vitrine_*`, le CSS et les composants historiques. Copie dans le nouveau projet uniquement les ressources utiles à la parité, en conservant des chemins stables ou en fournissant une migration de chemins idempotente. Déduplique sans casser les références.

Pour les médias de chapeaux, cherche d’abord dans la sauvegarde locale `backups-sql/le-objet3/2025-12-07/api/images` et `photos`. Si des fichiers référencés par le dump du 9 août 2026 manquent, dresse leur liste exacte puis récupère, si accessible, uniquement ces médias appartenant au site depuis l’ancien domaine. Ne remplace jamais silencieusement un média manquant par une image factice.

Les nouveaux uploads ne doivent pas disparaître lors d’un build ou d’un déploiement. Implémente un stockage runtime persistant configurable par `NUXT_UPLOADS_DIR`/`UPLOADS_DIR`, hors de `.output`, servi par une route Nitro contrôlée. Utilise un dossier local gitignoré en développement. Valide type réel, extension, taille, dimensions et nom de fichier ; empêche traversée de chemin et exécution de fichiers ; conserve le recadrage et la suppression uniquement pour un admin autorisé. Documente le chemin persistant à configurer dans Plesk, sans demander de commande post-déploiement.

## Déploiement Git/Plesk identique dans son principe à conjugaison4

Reproduis et adapte le flux réellement utilisable de `../conjugaison4` : dépôt Git, branche de développement `main`, branche de livraison `plesk-release` contenant le build `.output`, puis push Git et déploiement normal par Plesk. Comme aucune action post-déploiement n’est acceptée, le paquet Nitro compilé nécessaire au démarrage doit être présent dans les fichiers versionnés de la branche livrée à Plesk.

Le dépôt Git distant Plesk du nouveau site est déjà créé et son URL est :

```text
https://le-objet-ch@le-objet-new.le-objet.ch/plesk-git/le-objet-new.git
```

Configure cette URL comme remote `plesk-production` uniquement après avoir initialisé et vérifié le dépôt local. Ne place aucun mot de passe dans l’URL, dans Git, dans un script ou dans la documentation. Vérifie le remote en lecture avant tout push. Ne pousse vers `plesk-production` que la branche de livraison validée `plesk-release`, jamais un état de travail incomplet. Le dépôt GitHub n’a pas encore été fourni : prépare le remote `origin`, mais demande son URL au moment où elle devient réellement nécessaire et ne l’invente pas.

Adapte `scripts/release-plesk.sh` au nom `leobjet`, sans recopier des remotes ou URLs propres à conjugaison4. Le script doit : contrôler le dépôt et les remotes configurés, committer `main`, lancer `npm ci`, les tests critiques, le typecheck et le build, vérifier le paquet, versionner `.output` uniquement sur `plesk-release`, pousser les branches prévues, revenir sur `main`, puis indiquer qu’il reste seulement à faire « Restart App » dans Plesk et consulter les logs. Il ne doit jamais écrire de secret ni importer la base distante.

Crée `docs/deploiement-plesk.md` avec les réglages : Node compatible avec `package.json`, mode Production, racine de l’application = dossier déployé, racine du document = `.output/public`, fichier de démarrage = `app.mjs`, variables runtime, branche `plesk-release`, actions de déploiement supplémentaires laissées vides. N’utilise jamais `bash scripts/deploy-plesk.sh ../tmp/restart.txt`, « Run script », ni une migration manuelle après déploiement.

Ne crée pas de dépôt GitHub distant. Tu peux initialiser le dépôt local sur `main`, configurer le remote Plesk fourni ci-dessus, préparer les scripts et documenter les commandes exactes restant à renseigner. N’effectue toutefois aucun premier push vers Plesk avant que les tests, le typecheck, le build, la vérification de sécurité et la stratégie de préproduction soient prêts ; un push de production ou un basculement de domaine nécessite une instruction explicite de l’utilisateur.

## Migration de production avec interruption minimale

Le site `le-objet.ch` est actuellement en service et reçoit encore quelques visites quotidiennes. La migration doit donc être préparée comme un basculement parallèle avec retour arrière, et non comme une modification progressive du site en ligne. Le but est de limiter l’indisponibilité effective à quelques minutes au maximum.

Prépare et documente dans `docs/basculement-production.md` la procédure suivante, adaptée aux réglages réellement observés dans Plesk :

1. Développer et tester entièrement avec la base MAMP locale `le-objet`, sans écrire dans la production.
2. Déployer la nouvelle application sur l’hébergement temporaire associé à `le-objet-new.le-objet.ch` si ce domaine est bien configuré dans Plesk. Le protéger contre l’indexation (`noindex`, robots et en-tête adapté) et, si possible, contre l’accès public non autorisé.
3. Tester la préproduction d’abord avec une copie de la base. Pour la validation finale en lecture seule, permettre temporairement une connexion à la base réelle si l’utilisateur la configure, mais interdire les tests destructifs et les écritures de démonstration sur la production.
4. Préparer à l’avance toutes les variables Plesk, le build `.output`, `app.mjs`, le stockage persistant et les médias. Répéter le démarrage et mesurer le temps nécessaire sans toucher à `le-objet.ch`.
5. Puisque la base distante actuelle reste la source de vérité, ne pas réimporter le dump local en production le jour du basculement. La nouvelle application doit se connecter à la base distante existante. Les éventuelles évolutions de schéma doivent déjà être compatibles, idempotentes et non destructives.
6. Faire une copie initiale des médias bien avant le basculement, puis préparer une synchronisation différentielle des seuls médias ajoutés ou modifiés depuis cette copie. Cette synchronisation doit être réalisée avant le changement de domaine et ne doit pas dépendre d’une action post-déploiement Plesk.
7. Au moment convenu, demander une très courte suspension des modifications dans les deux anciennes interfaces, effectuer la dernière sauvegarde et le contrôle différentiel, puis basculer la configuration de `le-objet.ch` vers l’application Node déjà construite et testée. Comme le domaine reste sur le même serveur, privilégier un changement de configuration/racine d’application dans Plesk plutôt qu’un changement DNS. Ne modifie jamais seul cette configuration de production : fournis la checklist et attends l’accord explicite de l’utilisateur.
8. Après le déploiement normal, effectuer uniquement « Restart App » dans Plesk, puis contrôler immédiatement `/`, `/admin`, les deux connexions, les images, les principales lectures/écritures autorisées, le formulaire de contact et les journaux.
9. Conserver intacts les anciens dossiers téléchargés et l’ancienne configuration afin de pouvoir revenir rapidement à l’ancien document root si un défaut critique est découvert. Ne supprimer l’ancien système qu’après plusieurs jours de fonctionnement validé et une nouvelle sauvegarde, sur instruction explicite de l’utilisateur.

Le runbook doit distinguer clairement les opérations que Codex peut préparer dans Git des manipulations que l’utilisateur devra effectuer dans l’interface Plesk. Il doit comprendre une checklist avant basculement, une vérification immédiate après basculement, des critères précis de retour arrière et une estimation réaliste de la fenêtre d’intervention. Ne demande aucune commande dans « Actions de déploiement supplémentaires » ou « Run script ».

## Méthode de migration et contrôles obligatoires

1. Fais un inventaire traçable des routes, vues, menus, endpoints, tables, permissions, médias et fonctions de l’ancien système. Crée dans `docs/` une matrice de parité avec chaque élément et son état, sans considérer une page terminée si elle ne fait qu’afficher des données factices.
2. Établis des contrats d’API à partir du PHP et des composants existants, puis porte la logique par domaines cohérents. Factorise le store monolithique historique en composables/services sans changer le comportement visible.
3. Commence par un parcours vertical : base locale importée, vitrine SSR complète, login sécurisé, shell admin, consultation/création/modification d’un chapeau et images. Continue ensuite jusqu’à couvrir toutes les routes et la matrice complète.
4. Ajoute des tests Node pour les services et calculs, des tests d’intégration API sur une base de test isolée ou dans des transactions annulées, et des tests de permissions. Aucun test automatisé ne doit modifier irréversiblement `le-objet` ni contacter la production.
5. Compare visuellement l’ancien et le nouveau site à plusieurs largeurs (desktop, tablette, mobile). Utilise des captures locales et corrige les écarts de mise en page, typographie, couleurs, contenus, images, carrousels et interactions. Pour l’administration, compare directement les templates/CSS historiques et les pages accessibles ; ne demande pas de désactiver la sécurité.
6. Vérifie au minimum : `npm test`, `npm run typecheck`, `npm run build`, démarrage de `.output` via `npm start`, accès à `/`, santé DB, login/logout, refus 401/403, protections d’écriture, CRUD principal, uploads persistants, édition de la vitrine, graphiques et responsive.
7. Audite le code final : aucun secret versionné, aucune URL absolue vers l’ancien domaine, aucune requête SQL concaténant une entrée utilisateur, aucune erreur SQL détaillée envoyée au client, aucun accès admin non protégé, aucun média indispensable manquant.

## Critères de livraison

La tâche n’est terminée que lorsque :

- la vitrine à `/` est visuellement et fonctionnellement équivalente au site historique et alimentée par la base ;
- l’administration complète fonctionne sous `/admin/...` avec les deux rôles et toutes les routes historiques actives ;
- le local utilise exclusivement la base MAMP `le-objet` importée depuis le dump fourni ;
- la production peut utiliser la base distante existante via variables Plesk, sans secret dans Git ;
- les images historiques s’affichent et les nouveaux uploads sont persistants ;
- les tests, le typecheck, le build et le serveur compilé passent ;
- la documentation locale et Plesk est complète et conforme aux contraintes de `AGENTS.md` ;
- la matrice de parité ne contient plus de fonction essentielle « à faire ».

À la fin, donne un compte rendu concis avec les fichiers clés, les commandes de vérification réellement exécutées, le résultat de chaque contrôle, les éventuels médias réellement introuvables et uniquement les informations externes encore indispensables (par exemple les URLs des nouveaux remotes Git ou les valeurs à saisir manuellement dans l’interface Plesk). Ne propose aucune action post-déploiement autre que le redémarrage normal de l’application et la vérification des journaux.

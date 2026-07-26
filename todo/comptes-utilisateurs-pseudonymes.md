# Comptes utilisateurs individuels pseudonymes

Statut : prototype technique implémenté, ouverture publique non autorisée  
Créé le : 25 juillet 2026  
Objectif : permettre à une personne, y compris potentiellement mineure, de créer de manière autonome un compte sans fournir son identité civile ni son adresse électronique.

## État d'implémentation au 25 juillet 2026

Le premier prototype est disponible localement :

- [x] page cachée `/fr/signin` avec création et connexion ;
- [x] page protégée `/fr/my-page` affichant `Bonjour {Pseudonyme}` ;
- [x] pseudonymes générés depuis un vocabulaire contrôlé ;
- [x] renouvellement sans limite fonctionnelle arbitraire ;
- [x] preuve signée empêchant de soumettre un pseudonyme libre ;
- [x] index MySQL garantissant l'unicité finale ;
- [x] mots de passe hachés ;
- [x] code de récupération généré, haché et affiché une seule fois ;
- [x] sessions élèves révocables et séparées de l'administration ;
- [x] déconnexion et protection SSR de la page personnelle ;
- [x] jeton temporaire de parcours ;
- [x] champ leurre, délai minimal et limitations par parcours et par IP ;
- [x] intégration Turnstile avec validation obligatoire en production ;
- [x] comptes provisoires supprimés après 48 heures s'ils ne sont jamais activés ;
- [x] migrations idempotentes au démarrage ;
- [x] exclusion de GA4, du cache et des moteurs de recherche ;
- [x] restriction des deux pages à la locale française ;
- [x] tests unitaires, suite complète, typecheck et build ;
- [x] validation HTTP locale de l'inscription, de la page protégée, de la déconnexion et de la reconnexion ;
- [x] contrôle visuel desktop de la page d'inscription.

Restent obligatoires avant une ouverture publique :

- [ ] obtenir et configurer les clés Turnstile de production ;
- [ ] configurer un secret de session élève propre à la production ;
- [ ] faire valider le cadre juridique des inscriptions autonomes de mineurs ;
- [ ] finaliser et publier la déclaration de confidentialité ;
- [ ] implémenter l'écran qui utilise effectivement le code de récupération ;
- [ ] ajouter l'export et la suppression autonome du compte ;
- [ ] réaliser une revue de sécurité externe ou indépendante ;
- [ ] tester l'accessibilité avec des utilisateurs réels.

Variables Plesk nécessaires au démarrage :

```text
NUXT_LEARNER_SESSION_SECRET
NUXT_TURNSTILE_SECRET_KEY
NUXT_PUBLIC_TURNSTILE_SITE_KEY
```

Le secret de session doit être aléatoire et contenir au moins 32 caractères. Les clés secrètes ne doivent jamais être ajoutées au dépôt.

## Décision de produit

Le compte envisagé est individuel et indépendant :

- aucune classe et aucun compte enseignant ne sont nécessaires ;
- le site propose un pseudonyme du type `renard-1832` ;
- l'utilisateur peut accepter ce pseudonyme ou demander autant de nouvelles propositions qu'il le souhaite ;
- le site ne propose jamais un pseudonyme déjà attribué à un compte ;
- l'utilisateur choisit son propre mot de passe ;
- aucune donnée directement identifiante n'est demandée par défaut.

Le compte sert uniquement à conserver les préférences et la progression pédagogique de son propriétaire.

## Premier prototype décidé

### Résultat attendu

Le premier incrément doit permettre de vérifier toute la chaîne avec deux pages volontairement absentes de la navigation :

```text
/fr/signin
/fr/my-page
```

Parcours attendu :

1. la personne ouvre directement `/fr/signin` ;
2. elle choisit entre créer un compte et se connecter ;
3. pour créer un compte, le site lui propose un pseudonyme comme `renard-1762` ;
4. elle peut demander autant d'autres propositions qu'elle le souhaite ;
5. elle choisit et confirme son mot de passe ;
6. les protections contre les créations automatisées sont vérifiées côté serveur ;
7. le compte et une session distincte de l'administration sont créés ;
8. la personne est redirigée vers `/fr/my-page` ;
9. la page protégée affiche seulement, dans cette première version :

```text
Bonjour Renard-1762
```

Ajouter également une action de déconnexion, même si elle n'apparaît pas dans la phrase principale.

Le caractère « caché » signifie uniquement :

- aucun lien dans l'en-tête ou le pied de page ;
- aucune entrée dans la navigation ;
- aucune annonce publique pendant le prototype ;
- balise `robots` avec `noindex, nofollow` ;
- exclusion explicite dans `robots.txt`.

La sécurité ne doit jamais dépendre du secret de l'URL. Les API, l'authentification et les limitations doivent rester sûres même si l'adresse est connue.

### Routage exclusivement français

L'architecture Nuxt actuelle duplique automatiquement chaque page sans préfixe et sous les cinq préfixes de langue. Il faut éviter que ce prototype crée involontairement :

```text
/signin
/de/signin
/en/signin
/it/signin
/es/signin
```

Adapter le routage pour que les deux pages du prototype n'existent qu'aux adresses `/fr/signin` et `/fr/my-page`. Les autres variantes doivent répondre avec une page introuvable, et non rediriger silencieusement vers un espace encore non traduit.

La page `/fr/my-page` doit être protégée côté serveur :

- sans session valide : redirection vers `/fr/signin` ;
- avec session valide : rendu de la page ;
- avec une session expirée ou révoquée : suppression du cookie puis redirection ;
- ne pas se contenter d'une vérification effectuée dans le navigateur après affichage.

### Périmètre fonctionnel du prototype

Inclus :

- proposition et renouvellement du pseudonyme ;
- création du compte ;
- connexion ;
- session persistante révocable ;
- page protégée affichant le pseudonyme ;
- déconnexion ;
- code de récupération présenté une fois lors de l'inscription ;
- protection multicouche contre les bots ;
- suppression automatique des comptes provisoires inutilisés ;
- textes français uniquement ;
- absence de GA4 sur les deux pages et leurs API.

Différé :

- progression pédagogique ;
- modification du pseudonyme ;
- profil détaillé ;
- autres langues ;
- liaison avec des enseignants ou des classes ;
- classement ;
- administration complète des comptes ;
- connexion par fournisseur externe ;
- exposition du compte dans la navigation générale.

## Étapes d'implémentation du prototype

### Étape 1 — Verrouiller les décisions et les textes

- [ ] Valider le format exact `{animal}-{nombre}`.
- [ ] Constituer une première liste contrôlée d'animaux.
- [ ] Définir les mots et rôles réservés.
- [ ] Rédiger le texte court de confidentialité affiché avant l'inscription.
- [ ] Rédiger les conditions minimales du prototype.
- [ ] Définir la durée d'une session et la durée de conservation d'un compte inutilisé.
- [ ] Conserver comme condition d'ouverture publique la validation juridique relative aux inscriptions autonomes de mineurs.

Pour le prototype fermé, ne collecter ni âge ni date de naissance tant que la stratégie juridique correspondante n'est pas décidée.

### Étape 2 — Ajouter la configuration

Ajouter au `runtimeConfig` côté serveur :

```text
NUXT_LEARNER_SESSION_SECRET
NUXT_TURNSTILE_SECRET_KEY
```

Ajouter à la configuration publique uniquement :

```text
NUXT_PUBLIC_TURNSTILE_SITE_KEY
```

Contraintes :

- aucune valeur secrète versionnée ;
- clés de test officielles pour le développement local ;
- clés de production fournies par les variables d'environnement Plesk ;
- démarrage explicite en erreur en production si un secret requis manque ;
- ne jamais réutiliser le secret des sessions administrateur.

### Étape 3 — Créer la migration idempotente

Créer un plugin de migration exécuté au démarrage, par exemple :

```text
server/plugins/learner-accounts-migration.ts
```

Créer au minimum :

```text
learner_accounts
learner_sessions
learner_registration_rate_limits
```

La table des comptes contient notamment :

```text
id
username
username_normalized UNIQUE
password_hash
recovery_code_hash
status
session_version
privacy_notice_version
created_at
last_login_at
activated_at
deletion_scheduled_at
```

La table des sessions ne stocke que le condensat du jeton, l'identifiant du compte et ses dates de création, d'expiration et de dernière activité.

La migration doit :

- utiliser InnoDB et `utf8mb4` ;
- pouvoir être relancée sans erreur ni doublon ;
- créer tous les index nécessaires ;
- journaliser un message de succès identifiable ;
- ne jamais interrompre une table administrative existante ;
- être livrée et exécutée au redémarrage normal, sans action Plesk supplémentaire.

### Étape 4 — Développer le générateur

Créer un service pur et testable, par exemple :

```text
server/services/learner-username.ts
```

Il doit :

- utiliser `randomInt` de `node:crypto` ;
- générer uniquement des pseudonymes issus du dictionnaire contrôlé ;
- normaliser en minuscules ASCII pour la comparaison ;
- refuser les mots réservés ;
- vérifier les candidats disponibles par petit lot en base ;
- augmenter le nombre de chiffres si les essais deviennent trop nombreux ;
- ne jamais accepter un pseudonyme librement saisi dans ce prototype.

Créer l'API :

```text
POST /api/learner/username-suggestion
```

Elle reçoit un jeton temporaire d'inscription, applique sa propre limitation de débit et renvoie une seule proposition. Le navigateur mémorise dans un `Set` les propositions déjà refusées afin de ne pas les réafficher pendant le parcours.

### Étape 5 — Créer le jeton de parcours

À l'ouverture de `/fr/signin`, générer un jeton temporaire signé :

- durée indicative de 30 minutes ;
- cookie `HttpOnly`, `Secure` en production et `SameSite=Lax` ;
- lié logiquement au parcours d'inscription ;
- renouvelable après expiration ;
- requis par les API de suggestion et d'inscription ;
- inutilisable pour ouvrir une session de compte.

Protéger toutes les mutations `/api/learner/*` par le contrôle de même origine déjà utilisé pour l'administration.

### Étape 6 — Ajouter les protections contre les bots

Appliquer les protections avant le calcul coûteux du condensat du mot de passe.

#### Barrières toujours actives

- [ ] Jeton de parcours valide.
- [ ] Contrôle de même origine.
- [ ] Corps JSON strictement limité et validé.
- [ ] Champ leurre invisible devant rester vide.
- [ ] Délai minimal raisonnable entre l'ouverture du formulaire et son envoi.
- [ ] Jeton d'inscription à usage unique au moment de la création.
- [ ] Limitation des propositions par navigateur et par période.
- [ ] Limitation stricte des créations par navigateur.
- [ ] Limitation complémentaire par IP ou préfixe réseau.
- [ ] Index unique sur le pseudonyme.

Ne pas utiliser l'IP comme seul critère : plusieurs élèves ou familles peuvent partager une adresse. Une limite IP atteinte doit déclencher un challenge ou un ralentissement plutôt qu'un bannissement durable.

Valeurs de départ à mesurer puis ajuster :

```text
propositions : 30 par minute par jeton
créations    : 3 par heure par navigateur
créations    : 50 par jour par IP avec Turnstile toujours actif
```

#### Turnstile

Ajouter Cloudflare Turnstile en mode géré sur la validation de l'inscription :

1. le navigateur obtient un jeton Turnstile ;
2. il l'envoie avec la demande d'inscription ;
3. le serveur appelle `Siteverify` ;
4. il vérifie le succès, le nom d'hôte et l'action attendue ;
5. il refuse les jetons invalides, expirés ou déjà utilisés ;
6. il ne crée le compte qu'après cette validation.

Ne jamais envoyer à Turnstile :

- le pseudonyme ;
- le mot de passe ;
- le code de récupération ;
- l'identifiant du futur compte ;
- une réponse d'exercice.

Mettre à jour la politique de sécurité du contenu :

```text
script-src  https://challenges.cloudflare.com
frame-src   https://challenges.cloudflare.com
connect-src https://challenges.cloudflare.com
```

Conserver une procédure de test sans désactiver globalement la vérification dans le code de production.

#### Comptes provisoires

Créer le compte avec le statut `pending`. Il devient `active` lors de la première connexion réussie ou de l'arrivée authentifiée sur `/fr/my-page`.

Une tâche idempotente au démarrage ou un nettoyage périodique supprime les comptes `pending` jamais utilisés après 48 heures, ainsi que leurs sessions.

### Étape 7 — Créer l'inscription atomique

Créer :

```text
POST /api/learner/register
```

Ordre de traitement :

1. vérifier l'origine et le jeton de parcours ;
2. appliquer les limitations de débit ;
3. vérifier le champ leurre et le délai ;
4. valider le pseudonyme proposé et le mot de passe ;
5. valider le jeton Turnstile côté serveur ;
6. hacher le mot de passe et le code de récupération ;
7. insérer le compte dans une transaction ;
8. créer la session ;
9. consommer définitivement le jeton d'inscription ;
10. renvoyer le pseudonyme et la confirmation de création.

En cas de collision sur l'index unique :

- annuler la transaction ;
- renvoyer `409 Conflict` ;
- joindre une nouvelle proposition disponible ;
- demander à l'utilisateur de l'accepter ;
- ne jamais changer son pseudonyme silencieusement.

### Étape 8 — Créer la récupération

Générer un code de récupération aléatoire suffisamment robuste et l'afficher une seule fois après la création.

Pour le premier prototype, au minimum :

- afficher, copier et télécharger le code ;
- enregistrer uniquement son condensat ;
- tester qu'il n'apparaît dans aucun journal.

L'écran complet de réinitialisation peut être livré dans le même incrément ou immédiatement après, mais le format et le stockage corrects du code doivent exister dès la première création de compte.

### Étape 9 — Créer la connexion et la session

Créer :

```text
POST /api/learner/login
POST /api/learner/logout
GET  /api/learner/me
```

La connexion doit :

- accepter le pseudonyme sans distinction de casse ;
- comparer le mot de passe en temps constant au moyen de la bibliothèque prévue ;
- utiliser un condensat factice lorsque le compte n'existe pas ;
- répondre toujours `Pseudonyme ou mot de passe incorrect` en cas d'échec ;
- appliquer une limitation propre aux tentatives de connexion ;
- créer une session serveur révocable ;
- ne placer aucune information personnelle dans le cookie.

### Étape 10 — Créer les deux pages

Créer :

```text
app/pages/signin.vue
app/pages/my-page.vue
```

Puis adapter le routage pour les exposer uniquement sous :

```text
/fr/signin
/fr/my-page
```

`/fr/signin` contient :

- un onglet ou panneau de création ;
- un onglet ou panneau de connexion ;
- la proposition de pseudonyme ;
- le bouton de nouvelle proposition ;
- le mot de passe et sa confirmation ;
- le contrôle Turnstile ;
- le texte court de confidentialité ;
- l'affichage unique du code de récupération après création.

`/fr/my-page` contient uniquement :

```text
Bonjour {Pseudonyme}
```

et un bouton de déconnexion.

Les deux pages doivent avoir :

- `Cache-Control: no-store` ;
- `noindex, nofollow` ;
- aucune télémétrie GA4 ;
- aucun lien dans le layout public ;
- un affichage clavier et mobile correct ;
- des messages d'erreur qui ne révèlent pas l'existence d'un compte.

### Étape 11 — Protéger `/fr/my-page`

Créer un middleware de page ou une vérification SSR qui demande `/api/learner/me` avant le rendu utile.

Tests attendus :

- accès direct sans session : redirection ;
- accès après inscription : message correct ;
- rechargement : session conservée ;
- déconnexion : cookie et session supprimés ;
- ancien cookie après déconnexion : inutilisable ;
- compte supprimé ou suspendu : accès refusé ;
- aucune seconde d'affichage du pseudonyme précédent lors d'un changement de session.

### Étape 12 — Adapter sécurité, cache et analyses

Mettre à jour :

- `server/middleware/security.ts` pour le même origine, le CSP et `no-store` ;
- le plugin d'analyse pour ignorer `/fr/signin` et `/fr/my-page` ;
- les API d'analyse locales pour ne pas associer leurs événements au compte ;
- `public/robots.txt` pour les deux chemins ;
- les journaux pour masquer pseudonymes, secrets et corps de requêtes sensibles.

Le pseudonyme ne doit jamais être inclus dans un événement GA4, une URL, un titre de page ou des métadonnées d'analyse.

### Étape 13 — Tester

Créer des tests unitaires et d'intégration couvrant :

- format et vocabulaire du générateur ;
- absence de répétition pendant un parcours ;
- exclusion des pseudonymes existants ;
- collision concurrente ;
- limitation des suggestions et inscriptions ;
- expiration et rejeu du jeton de parcours ;
- champ leurre et délai minimal ;
- succès et échecs simulés de Turnstile ;
- impossibilité de contourner la validation serveur de Turnstile ;
- hachage des mots de passe et codes ;
- connexion sans énumération ;
- session, expiration et révocation ;
- protection et rendu de `/fr/my-page` ;
- redirections des routes non françaises ;
- absence de GA4 et présence de `no-store` ;
- purge des comptes provisoires.

Tester aussi manuellement :

- plusieurs clics rapides sur `M'en proposer un autre` ;
- deux navigateurs inscrivant simultanément le même candidat ;
- navigation privée ;
- mobile ;
- clavier seul ;
- lecteur d'écran ;
- Turnstile indisponible ;
- base temporairement indisponible ;
- rafraîchissement pendant l'affichage du code de récupération.

### Étape 14 — Vérifier et livrer

- [ ] Exécuter les tests ciblés.
- [ ] Exécuter toute la suite `npm test`.
- [ ] Exécuter `npm run typecheck`.
- [ ] Exécuter `npm run build`.
- [ ] Vérifier le rendu desktop et mobile.
- [ ] Vérifier les en-têtes HTTP et la CSP.
- [ ] Vérifier la migration sur une base de test.
- [ ] Vérifier qu'aucun secret n'est versionné.
- [ ] Déployer les fichiers versionnés par le flux Git normal.
- [ ] Redémarrer normalement l'application dans Plesk.
- [ ] Contrôler les journaux de migration et d'authentification sans exécuter de script supplémentaire.

### Découpage conseillé en lots

Lot 1 — fondation :

- migration ;
- générateur ;
- sessions ;
- limitations ;
- tests unitaires.

Lot 2 — parcours :

- APIs ;
- `/fr/signin` ;
- `/fr/my-page` ;
- déconnexion ;
- récupération.

Lot 3 — durcissement :

- Turnstile ;
- CSP ;
- purge des comptes provisoires ;
- exclusion des analyses ;
- tests concurrents et revue finale.

## Principe de minimisation

Ne pas demander :

- nom ou prénom ;
- adresse électronique ;
- numéro de téléphone ;
- adresse postale ;
- établissement ou classe ;
- date de naissance complète ;
- identité des parents ;
- diagnostic, handicap ou mesure d'appui ;
- réponse à une question secrète personnelle.

Les données minimales envisagées sont :

- un identifiant technique interne ;
- le pseudonyme ;
- le condensat cryptographique du mot de passe ;
- le condensat d'un éventuel code de récupération ;
- les langues d'interface et d'explication ;
- la progression strictement nécessaire au service ;
- les dates de création, de dernière connexion et de suppression programmée ;
- la version des informations légales présentées lors de l'inscription.

Un pseudonyme reste une donnée personnelle lorsqu'il peut être relié à l'activité d'une personne. Le compte est donc pseudonyme, et non anonyme, et reste soumis à la législation sur la protection des données.

## Point juridique à trancher avant le développement

Pour une inscription autonome proposée directement au public, l'exploitant privé relève principalement de la Loi fédérale sur la protection des données (LPD). La loi suisse ne fixe pas un âge numérique unique à partir duquel tout mineur pourrait consentir seul. La capacité de discernement dépend de l'âge, de la maturité et de la complexité du traitement.

Avant la mise en production, faire valider par un juriste suisse spécialisé ou par une prise de position appropriée :

- à partir de quelles conditions un mineur peut ouvrir seul ce compte gratuit ;
- si et dans quels cas l'accord du représentant légal doit être demandé ;
- la manière de prouver que l'information présentée était compréhensible ;
- les conditions d'utilisation applicables à un mineur ;
- la durée de conservation de la preuve d'acceptation ;
- le traitement à appliquer lorsqu'un parent demande l'accès ou la suppression ;
- l'éventuelle application du RGPD si le service vise aussi des utilisateurs situés dans l'Union européenne.

Ne pas inventer dans l'interface un seuil tel que 13 ou 16 ans sans cette validation : il ne correspondrait pas automatiquement à une règle suisse.

Préparer deux informations de confidentialité :

1. une déclaration complète pour les adultes et représentants légaux ;
2. une version courte, concrète et lisible par un enfant, par exemple :

> Nous enregistrons ton pseudonyme et tes résultats pour que tu retrouves ta progression. Nous ne te demandons pas ton vrai nom. Tu peux supprimer ton compte. Nous ne vendons pas tes données.

La validation juridique constitue un prérequis de lancement, mais pas un prérequis pour prototyper localement le parcours.

## Parcours d'inscription

### Écran 1 — Présentation

Expliquer avant toute collecte :

- ce que le compte conserve ;
- qu'il n'est pas nécessaire pour utiliser les fonctions publiques du site ;
- qu'aucun nom ni e-mail ne sera demandé ;
- que le mot de passe et le code de récupération doivent être conservés ;
- comment le compte pourra être supprimé.

### Écran 2 — Choix du pseudonyme

Afficher une proposition, par exemple :

```text
renard-1832
```

Actions :

- `Ce pseudonyme me convient`
- `M'en proposer un autre`

Chaque clic sur la seconde action appelle l'API et remplace immédiatement la proposition. L'action doit rester utilisable sans limite fonctionnelle arbitraire, sous réserve d'une limitation technique raisonnable contre les robots.

Ne pas permettre la saisie libre du pseudonyme dans la première version. Cela évite :

- les noms et prénoms réels ;
- les adresses électroniques ;
- les insultes ;
- l'usurpation de termes comme `admin` ou `support` ;
- le travail de modération.

### Écran 3 — Mot de passe

- laisser l'utilisateur choisir son mot de passe ;
- autoriser les gestionnaires de mots de passe et le collage ;
- afficher/masquer le mot de passe ;
- proposer une phrase de passe mémorisable ;
- refuser uniquement les mots de passe réellement trop faibles ou compromis selon une règle documentée ;
- ne pas imposer artificiellement une majuscule, un chiffre et un symbole si une phrase de passe longue est acceptée ;
- ne jamais journaliser ni envoyer le mot de passe à un service d'analyse.

### Écran 4 — Récupération

Sans e-mail, un mot de passe oublié est normalement irrécupérable. Générer à la création un code de récupération aléatoire affiché une seule fois.

Exemple :

```text
LUNE-KILO-7R4P-MESA
```

Permettre de :

- le copier ;
- l'imprimer ;
- le télécharger dans un petit fichier texte ;
- confirmer qu'il a été conservé.

Seul le condensat cryptographique du code est enregistré. Après utilisation, le code est invalidé et remplacé. Le support ne doit jamais pouvoir retrouver un mot de passe ni contourner la récupération sur la base d'informations personnelles.

### Écran 5 — Confirmation

Afficher :

- le pseudonyme définitif ;
- un rappel concernant le code de récupération ;
- un lien vers la politique de confidentialité ;
- la commande permettant de supprimer ultérieurement le compte.

## Générateur de pseudonymes

### Forme proposée

Première version :

```text
{animal}-{nombre}
```

Exemples :

- `renard-1832`
- `panda-6047`
- `colibri-29154`

Utiliser :

- une liste versionnée de noms d'animaux français ;
- uniquement des termes neutres, adaptés aux enfants et faciles à lire ;
- une forme normalisée en minuscules ASCII pour éviter les problèmes de clavier et d'URL ;
- un nombre initial de quatre chiffres, extensible à cinq ou six chiffres lorsque le catalogue se remplit.

Prévoir suffisamment d'animaux pour disposer de plusieurs millions de combinaisons. Exclure les termes ambigus, dévalorisants, violents ou pouvant ressembler à un rôle officiel.

### Tirage

Utiliser `randomInt` de `node:crypto`, et non `Math.random`.

Algorithme indicatif :

1. choisir cryptographiquement un animal ;
2. choisir cryptographiquement un suffixe numérique ;
3. normaliser le candidat ;
4. vérifier qu'il n'est ni réservé ni déjà présent dans la base ;
5. si le candidat est occupé, recommencer ;
6. après un nombre maximal d'essais, augmenter automatiquement la taille du suffixe ;
7. renvoyer le premier candidat disponible.

Il est préférable de produire et vérifier un petit lot de candidats en une seule requête SQL plutôt que d'effectuer une requête par essai.

### Absence de répétition pendant l'inscription

Le navigateur conserve dans un `Set` les propositions déjà refusées pendant le parcours. Elles ne sont jamais réaffichées au cours de cette inscription.

La liste complète n'a pas besoin d'être conservée durablement en base. Si une garantie absolue entre plusieurs onglets est souhaitée, créer un jeton temporaire d'inscription et une table de propositions expirant automatiquement après environ une heure. Cette complexité n'est probablement pas nécessaire pour la première version.

### Garantie réelle d'unicité

Une vérification préalable par l'API ne suffit pas : deux personnes peuvent recevoir simultanément le même pseudonyme encore libre.

La garantie finale doit être assurée par :

- une colonne normalisée ;
- un index `UNIQUE` en base ;
- une insertion atomique ;
- le traitement de l'erreur MySQL de doublon.

Si le pseudonyme a été pris entre sa proposition et la validation :

1. ne pas créer le compte sous un autre nom sans accord ;
2. répondre avec un statut de conflit ;
3. proposer immédiatement un nouveau pseudonyme ;
4. conserver le mot de passe uniquement dans l'état local du formulaire, le temps que l'utilisateur accepte la nouvelle proposition.

Ne jamais utiliser une logique « vérifier puis insérer » comme seule protection.

## Modèle de données

Ne pas réutiliser directement la table `users` actuelle. Elle contient des champs d'identité et sert à l'administration. Séparer complètement les comptes publics des administrateurs réduit les risques d'autorisation et de fuite.

Table indicative `learner_accounts` :

```text
id
username
username_normalized UNIQUE
password_hash
recovery_code_hash
interface_locale
explanation_locale
status
session_version
privacy_notice_version
terms_version
legal_acceptance_at
created_at
last_login_at
deletion_scheduled_at
deleted_at
```

Éviter de stocker l'âge exact. Si la validation juridique impose une distinction d'âge, conserver au maximum une catégorie utile ou une preuve minimale de l'autorisation, et non la date de naissance complète.

Tables séparées à prévoir :

- `learner_sessions` pour les sessions révocables ;
- `learner_progress` pour les résultats agrégés par compétence ;
- éventuellement `learner_recovery_events` pour auditer les récupérations sans conserver le code ;
- éventuellement `learner_legal_acceptances` si plusieurs versions des documents doivent être historisées.

Définir explicitement les suppressions en cascade et les données qui doivent être anonymisées plutôt que conservées.

## Sessions et authentification

Créer un système distinct de la session administrateur.

Recommandation :

- jeton de session aléatoire à forte entropie ;
- seul le condensat du jeton est enregistré en base ;
- cookie `HttpOnly`, `Secure` en production et `SameSite=Lax` ou plus strict ;
- expiration courte en cas d'inactivité et durée maximale documentée ;
- révocation au changement de mot de passe ;
- action `Déconnecter tous mes appareils` ;
- aucune identité ou progression placée directement dans le cookie ;
- protection CSRF des actions sensibles ;
- limitation des tentatives de connexion et de récupération.

Le message de connexion doit rester générique :

```text
Pseudonyme ou mot de passe incorrect.
```

Il ne doit pas révéler si un pseudonyme précis existe.

## API à prévoir

Routes indicatives :

```text
POST   /api/account/username-suggestion
POST   /api/account/register
POST   /api/account/login
POST   /api/account/logout
POST   /api/account/logout-all
GET    /api/account/me
POST   /api/account/recovery
POST   /api/account/password
GET    /api/account/export
DELETE /api/account
```

Contraintes communes :

- validation stricte de la taille et du format des corps JSON ;
- requêtes SQL paramétrées ;
- limitation de débit par adresse et par jeton d'inscription ;
- réponse uniforme pour éviter l'énumération des comptes ;
- aucun secret dans les journaux ;
- tests des accès concurrents.

L'API de suggestion peut révéler uniquement un candidat généré par le serveur. Elle ne doit pas devenir une API publique permettant de tester librement l'existence de n'importe quel pseudonyme.

## Progression pédagogique

Commencer par conserver des agrégats :

- notion ou compétence ;
- nombre de questions ;
- nombre de réussites ;
- nombre d'essais ;
- date de dernière pratique ;
- niveau de maîtrise calculé de manière transparente.

Éviter dans la première version :

- l'enregistrement illimité de chaque frappe ;
- le texte libre ;
- le classement public ;
- la comparaison nominative entre utilisateurs ;
- les prédictions sur les capacités de l'enfant ;
- les étiquettes telles que « faible », « dyslexique » ou « en difficulté » ;
- une décision importante entièrement automatisée.

Toute adaptation automatique doit pouvoir être expliquée simplement : « Nous te reproposons le passé composé parce que tu as eu trois réponses à revoir. »

## Statistiques, cookies et services externes

Séparer :

- les statistiques publiques d'audience ;
- les données de progression liées au compte.

Dans les pages de compte et d'exercice authentifié :

- désactiver GA4 par défaut ;
- ne jamais envoyer le pseudonyme, l'identifiant interne ou les réponses à GA4 ;
- ne pas utiliser de publicité comportementale ;
- ne pas utiliser la progression pour du marketing ;
- ne pas transmettre les réponses à une IA externe sans nouveau cadrage juridique ;
- documenter les pays de tous les hébergeurs et sous-traitants ;
- privilégier l'hébergement et les sauvegardes en Suisse.

Vérifier également si le cookie local `tatitotu_session` doit être conservé dans l'espace authentifié ou remplacé par des mesures anonymisées.

## Conservation et suppression

Politique initiale à valider :

- compte inactif : avertissement local lors d'une reconnexion proche de l'échéance, puis suppression après une durée définie, par exemple 12 ou 24 mois ;
- compte supprimé par l'utilisateur : blocage immédiat de l'accès et purge rapide des données actives ;
- sauvegardes : disparition lors de leur rotation normale selon un délai documenté ;
- événements de sécurité : conservation limitée et séparée ;
- statistiques de produit : conservation uniquement après anonymisation réelle.

L'utilisateur doit pouvoir depuis son compte :

- consulter les données principales conservées ;
- exporter sa progression dans un format lisible ;
- corriger ses préférences ;
- changer son mot de passe ;
- régénérer son code de récupération ;
- supprimer son compte sans devoir contacter le support.

Définir une procédure pour les demandes d'accès, de rectification et de suppression formulées par un représentant légal, sans créer une nouvelle collecte excessive d'identité.

## Sécurité opérationnelle

- Hacher les mots de passe avec un paramétrage robuste et réévaluable.
- Ne jamais chiffrer les mots de passe de manière réversible.
- Hacher également les codes de récupération.
- Ajouter des délais progressifs et une limitation distribuée des connexions.
- Prévoir une protection contre le bourrage d'identifiants.
- Journaliser les actions administratives sur les comptes, sans journaliser les réponses scolaires.
- Chiffrer les sauvegardes et tester leur restauration.
- Séparer les droits des administrateurs techniques et éditoriaux.
- Prévoir une procédure documentée en cas de violation de données.
- Éviter qu'un administrateur puisse afficher ou modifier un mot de passe ou un code de récupération.
- Réaliser une revue de sécurité avant l'ouverture publique.

## Administration

Créer une interface minimale et respectueuse de la confidentialité permettant uniquement :

- de rechercher un compte par son pseudonyme exact ;
- de voir son statut et ses dates techniques ;
- de suspendre un compte en cas d'abus ;
- de déclencher ou contrôler une suppression ;
- de consulter un historique limité des actions administratives.

Ne pas afficher par défaut un tableau complet de tous les enfants, leur progression ou leurs erreurs. Toute consultation exceptionnelle doit être motivée et journalisée.

Prévoir une liste de pseudonymes réservés et bloqués administrable ou versionnée :

```text
admin
administrateur
moderateur
support
tatitotu
systeme
```

## Migration et déploiement

Les nouvelles tables doivent être créées par une migration idempotente versionnée et exécutée au démarrage de l'application, lorsque la connexion MySQL est disponible.

Conformément aux contraintes du projet :

- ne placer aucun identifiant MySQL dans les fichiers versionnés ;
- ne demander aucune migration via « Run script » dans Plesk ;
- envoyer la migration par `git push` ;
- déployer puis effectuer uniquement le redémarrage normal de l'application ;
- journaliser clairement le succès ou l'échec de la migration ;
- rendre les redémarrages suivants sans effet secondaire.

## Tests indispensables

### Générateur

- tous les pseudonymes respectent le format attendu ;
- aucun mot interdit n'est proposé ;
- le tirage utilise la source aléatoire prévue ;
- un pseudonyme occupé n'est pas renvoyé ;
- plusieurs propositions dans le même parcours ne se répètent pas ;
- le suffixe s'allonge lorsque l'espace de noms devient insuffisant.

### Inscription concurrente

- deux inscriptions simultanées ne peuvent pas créer le même pseudonyme ;
- l'index unique est la source finale de vérité ;
- un conflit renvoie une nouvelle proposition sans créer de compte inattendu ;
- aucune donnée partielle ne reste après l'échec d'une inscription.

### Authentification

- mot de passe correctement haché ;
- temps de réponse comparable pour un compte existant ou inexistant ;
- limitation des essais ;
- révocation de toutes les sessions ;
- expiration et attributs des cookies ;
- récupération à usage unique ;
- invalidation de l'ancien code de récupération.

### Vie privée

- aucun nom ou e-mail n'est requis ;
- aucune donnée de compte n'est envoyée à GA4 ;
- export complet des données de la personne ;
- suppression des données actives et traitement correct des sauvegardes ;
- impossibilité pour un utilisateur d'accéder au compte d'un autre ;
- impossibilité pour un administrateur non autorisé de consulter la progression.

### Interface

- parcours utilisable au clavier et avec un lecteur d'écran ;
- messages compréhensibles par un enfant ;
- bouton de nouvelle proposition annoncé correctement ;
- mot de passe compatible avec les gestionnaires de mots de passe ;
- aucune perte silencieuse du code de récupération ;
- traductions disponibles dans toutes les langues de l'interface.

## Ordre de réalisation recommandé

### Phase 0 — Validation

- [ ] Valider le cadre juridique des inscriptions autonomes de mineurs.
- [ ] Valider la politique de conservation.
- [ ] Rédiger les deux niveaux d'information de confidentialité.
- [ ] Décider si une autorisation parentale est nécessaire et comment elle sera obtenue.
- [ ] Réaliser une analyse d'impact simplifiée.

### Phase 1 — Fondation technique

- [ ] Constituer et contrôler le dictionnaire des animaux.
- [ ] Développer et tester le générateur.
- [ ] Ajouter la migration idempotente des comptes et sessions.
- [ ] Créer l'API de suggestion.
- [ ] Créer l'inscription, la connexion et la déconnexion.
- [ ] Ajouter le code de récupération.

### Phase 2 — Espace personnel

- [ ] Créer la page du compte pseudonyme.
- [ ] Enregistrer les préférences linguistiques.
- [ ] Ajouter le changement de mot de passe.
- [ ] Ajouter la récupération sans e-mail.
- [ ] Ajouter l'export et la suppression autonomes.

### Phase 3 — Progression

- [ ] Définir les compétences mesurées.
- [ ] Enregistrer uniquement les agrégats nécessaires.
- [ ] Afficher une progression compréhensible.
- [ ] Ajouter ensuite une adaptation simple et explicable des exercices.

### Phase 4 — Audit avant ouverture

- [ ] Tester les accès concurrents et la charge du générateur.
- [ ] Réaliser une revue de sécurité.
- [ ] Vérifier les cookies, GA4 et transferts externes.
- [ ] Tester le parcours avec des enfants et des adultes sans recueillir leurs données réelles.
- [ ] Faire relire les textes légaux.
- [ ] Documenter la procédure de violation de données.

## Critères d'acceptation de la première version

La première version est prête uniquement si :

- aucun identifiant civil n'est nécessaire ;
- le site peut proposer indéfiniment de nouveaux pseudonymes ;
- aucun pseudonyme existant n'est proposé au moment de la requête ;
- deux comptes ne peuvent jamais conserver le même pseudonyme ;
- le mot de passe et le code de récupération ne sont jamais stockés en clair ;
- la récupération fonctionne sans e-mail ;
- la progression peut être exportée et supprimée ;
- les pages authentifiées ne transmettent aucune identité ou réponse à GA4 ;
- la durée de conservation est appliquée automatiquement ;
- le cadre des inscriptions de mineurs a été validé avant l'ouverture publique.

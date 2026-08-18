# Transformer les défis officiels en pages SEO multilingues

## 1. Contexte réel du projet

Le site `https://conjugaison.tatitotu.ch` existe en français (`fr`), allemand (`de`), anglais (`en`), italien (`it`) et espagnol (`es`).

Le projet contient deux systèmes de défis distincts. Ils ne doivent pas être confondus.

### A. Défis personnels partagés par code

Les défis créés par les utilisateurs sont stockés dans `defis` :

- leur identifiant public est un code aléatoire du type `SP-CA-CT-LU` ;
- leur configuration est enregistrée en JSON ;
- ils sont accessibles par `/fr/defi/SP-CA-CT-LU` ;
- ils sont nombreux et ne constituent pas un catalogue éditorial officiel.

Ces pages sont déjà classées comme privées par le SEO global et reçoivent `noindex, nofollow`. Ne pas créer une seconde logique concurrente. Leur création, partage, chargement, favoris et anciens codes doivent continuer à fonctionner sans changement.

### B. Défis officiels préenregistrés

Les défis administrés et proposés dans le catalogue sont stockés dans :

- `challenge_presets` ;
- `challenge_preset_categories` ;
- `challenge_preset_verbs` ;
- `challenge_preset_tenses`.

Un défi officiel possède notamment `challenge_presets.id`, un `preset_key`, une catégorie et une configuration d’exercice. Son champ `is_active` indique actuellement sa visibilité dans le catalogue.

Ce sont ces défis officiels, et uniquement eux, qui doivent pouvoir recevoir des publications SEO multilingues.

## 2. Objectif

Permettre à un administrateur de publier certaines configurations officielles sous forme de véritables pages d’entrée SEO multilingues.

Structure recommandée, cohérente avec le routeur actuel :

- `/fr/defis/exercices-verbes-en-ger` ;
- `/de/defis/uebungen-verben-auf-ger` ;
- `/en/defis/french-ger-verbs-exercises` ;
- `/it/defis/esercizi-verbi-in-ger` ;
- `/es/defis/ejercicios-verbos-en-ger`.

Le segment structurel `defis` peut rester identique dans toutes les langues. Le projet conserve déjà les mêmes segments après le préfixe linguistique. Traduire aussi ce segment ajouterait une exception de routage sans bénéfice déterminant.

Chaque publication doit réutiliser la configuration d’un seul `challenge_preset`. Ne pas dupliquer cinq fois la configuration pour produire cinq traductions.

## 3. Éviter la concurrence avec les pages SEO existantes

Le site possède déjà des pages comme :

- `/fr/exercices/passe-compose` ;
- `/fr/exercices/imparfait` ;
- `/fr/exercices/conditionnel-present` ;
- `/fr/exercices/subjonctif-present`.

Elles ont déjà un H1, une description, des métadonnées et un maillage interne. Ne pas créer automatiquement une seconde page `/fr/defis/exercices-passe-compose` visant la même recherche.

Règle :

- lorsqu’un temps est déjà couvert par `/exercices/[parcours]`, enrichir de préférence cette page et lui associer un défi officiel à lancer ;
- réserver `/defis/[slug]` à des intentions distinctes : niveau scolaire, FLE A1/A2, verbes en `-ger`, verbes irréguliers, auxiliaire avoir ou être, groupes ou sélections thématiques ;
- si deux pages proches sont nécessaires, documenter avant publication leur intention et leur contenu distincts.

## 4. Modèle de données

Créer `challenge_preset_publications`, rattachée à `challenge_presets`. Ne pas ajouter ces données à `defis` et ne pas ajouter cinq groupes de colonnes à `challenge_presets`.

Champs recommandés :

- `id` ;
- `preset_id`, clé étrangère vers `challenge_presets.id` ;
- `locale`, limitée à `fr`, `de`, `en`, `it`, `es` ;
- `slug` ;
- `title`, utilisé comme H1 ;
- `meta_title` ;
- `description`, visible dans la page ;
- `meta_description` ;
- `is_published` ;
- `is_indexable` ;
- `created_at` ;
- `updated_at`.

Contraintes :

- `UNIQUE (preset_id, locale)` ;
- `UNIQUE (locale, slug)` ;
- suppression en cascade vers `challenge_presets(id)` ;
- index `(is_published, is_indexable, locale)` ;
- encodage `utf8mb4`.

Les traductions sont reliées par leur `preset_id` commun.

Ne pas détourner `challenge_presets.is_active` : un preset peut être actif sans page SEO. Une publication possède son propre cycle brouillon, publié et indexable.

## 5. Slugs et redirections

Le slug doit être enregistré en base, propre à une langue, en minuscules, sans accents, composé de lettres, chiffres et tirets, unique dans sa langue et modifiable uniquement par un administrateur.

Le changement d’un titre ne doit jamais modifier automatiquement le slug publié.

Si un slug publié change, conserver l’ancien dans `challenge_preset_publication_redirects` afin de retourner une redirection HTTP 301.

Champs possibles :

- `publication_id` ;
- `locale` ;
- `old_slug` ;
- `created_at` ;
- `UNIQUE (locale, old_slug)`.

## 6. Routes publiques

Ajouter une route dynamique `/defis/[slug]`, automatiquement localisée par le projet.

Le chargement utilise ensemble la langue de l’URL et le slug demandé.

Comportement :

- publiée et indexable : HTTP 200, `index, follow` ;
- publiée mais non indexable : HTTP 200, `noindex, follow` ;
- brouillon ou publication désactivée : véritable HTTP 404 ;
- slug inexistant : véritable HTTP 404 ;
- ancien slug connu : HTTP 301 vers le slug actuel ;
- aucune URL fictive pour une langue absente.

Prévoir si possible une bibliothèque `/[locale]/defis` qui liste uniquement les publications disponibles dans cette langue.

## 7. Contenu visible et moteur d’exercice

La page publique doit être rendue côté serveur par Nuxt. Le projet est déjà en SSR ; aucune refonte générale ni prerender particulier n’est nécessaire.

Le HTML initial doit contenir :

- le H1 éditorial ;
- la description éditoriale ;
- un résumé utile : catégorie, temps, modes, niveau ou verbes lorsque pertinent ;
- un bouton clair pour commencer ;
- des liens internes pertinents ;
- les métadonnées SEO.

Réutiliser le moteur existant. Adapter `WizardChallengeWorkspace` pour accepter un preset initial, charger le catalogue puis appliquer le preset avec la logique existante.

Ne pas convertir une publication en défi personnel et ne pas créer de ligne dans `defis` pour la lancer.

## 8. Métadonnées SEO

### Titre

Utiliser `meta_title` s’il existe, sinon `title`. Éviter de répéter Tatitotu avec le `titleTemplate` global.

### Description

Utiliser `meta_description`, sinon la description visible, tronquée proprement si nécessaire.

### Canonical

Chaque version est canonical vers elle-même. Ne jamais canoniser toutes les langues vers le français.

### Robots

- publiée et indexable : `index, follow` ;
- publiée mais non indexable : `noindex, follow` ;
- brouillon : 404 public.

### Open Graph

Renseigner `og:title`, `og:description`, `og:type` et `og:url` à partir de la publication.

## 9. Adapter le SEO global existant

`app/app.vue` génère déjà canonical, robots, description, `hreflang` pour cinq langues et `x-default`. Cette logique suppose le même chemin dans toutes les langues. Elle ne convient pas à des slugs traduits ni aux langues absentes.

Faire évoluer le mécanisme central, ou créer un composable SEO central, afin qu’une page fournisse explicitement :

- son canonical ;
- ses variantes réellement publiées ;
- la destination éventuelle de `x-default` ;
- sa directive robots.

Ne pas ajouter un second canonical ou un second groupe de `hreflang` par-dessus ceux de `app.vue`.

Pour chaque groupe de traductions :

- chaque page référence toutes les versions disponibles, y compris elle-même ;
- les ensembles sont réciproques ;
- aucune langue non publiée n’est annoncée ;
- toutes les URL sont absolues.

Utiliser `x-default` seulement si une destination cohérente existe. La version française peut servir de repli lorsqu’elle est publiée ; sinon, ne pas inventer d’URL.

## 10. Sitemap

Étendre le sitemap existant au lieu d’en créer un second.

Faire évoluer `server/routes/sitemap.xml.get.ts` pour :

- conserver les pages statiques ;
- charger les publications publiées et indexables ;
- créer une entrée par langue publiée ;
- annoncer uniquement les traductions publiées et indexables ;
- exclure défis personnels, brouillons et publications non indexables ;
- conserver des URL absolues et échappées ;
- produire un XML valide même si la base est momentanément indisponible ;
- conserver une stratégie de cache raisonnable.

Le sitemap ne contient que les URL canoniques souhaitées dans les résultats de recherche.

## 11. Maillage interne

Les publications ne doivent pas être découvertes uniquement par le sitemap.

Créer des liens HTML depuis la bibliothèque, les catégories, les pages de temps et de modes pertinentes et, si utile, les pages scolaires ou FLE.

Réutiliser `challenge_preset_tenses`, `challenge_preset_verbs` et `challenge_preset_categories` pour déterminer les relations. Ne pas créer automatiquement des liens peu pertinents.

## 12. Traductions

Chaque langue définit indépendamment :

- slug ;
- H1 ;
- titre SEO ;
- description visible ;
- meta description ;
- publié ;
- indexable.

Ne pas traduire automatiquement au rendu.

Pour un défi FR/DE/EN : seules ces trois URL existent, IT/ES retournent 404, les `hreflang` et le sitemap ne contiennent que FR/DE/EN.

Le contenu principal doit être réellement traduit. Une interface traduite autour d’un contenu français ne suffit pas.

## 13. Administration

Étendre `app/pages/admin/challenges.vue`. Ne pas introduire Bootstrap : le projet utilise ses propres composants et styles.

Ajouter « Publications SEO » avec des onglets FR, DE, EN, IT, ES. Pour chaque langue :

- publié ;
- indexable ;
- slug ;
- H1 ;
- titre SEO ;
- description visible ;
- meta description ;
- aperçu de l’URL ;
- avertissement avant changement d’un slug publié.

Conserver l’enregistrement automatique actuel. Des API dédiées aux publications éviteront de surcharger le payload principal du preset.

Toutes les API d’administration appellent `requireAdministrator` et valident langue, longueurs, slug, booléens et identifiants.

## 14. Service public et sécurité

Créer un service serveur central pour :

- charger une publication par langue et slug ;
- charger ses traductions et son preset ;
- lister les publications du sitemap ;
- créer et modifier les publications ;
- résoudre les anciens slugs.

La réponse publique expose seulement les champs éditoriaux publiés, la configuration d’exercice nécessaire, les traductions publiées et les informations publiques utiles.

Ne jamais exposer de compte, auteur, administrateur ou suivi d’apprenant.

## 15. Anciennes URL `/defi/CODE`

Ne pas modifier automatiquement leur comportement. Elles doivent continuer à charger leur défi, rester hors sitemap et conserver leur `noindex` actuel.

Ne jamais les rediriger vers un preset sur la seule base d’une configuration ressemblante.

Si Search Console montre qu’une URL précise reçoit encore du trafic et correspond exactement à une publication officielle, établir une association explicite avant une éventuelle 301. Ne pas migrer en masse.

## 16. Données structurées

Le projet utilise déjà `LearningResource`. Le réutiliser seulement avec des propriétés exactes : nom, description, type de ressource, usage pédagogique, langue, notion enseignée et gratuité.

Ne pas ajouter automatiquement `Quiz`, `Question` ou `Answer` : les questions balisées doivent être réellement présentes et utilisables sur la page. Les exercices étant générés dynamiquement, cela nécessite une analyse séparée.

Les données structurées ne garantissent pas un résultat enrichi.

## 17. Migration compatible avec Plesk

Toute évolution de base doit :

- être une migration idempotente versionnée ;
- s’exécuter au démarrage normal lorsque MySQL est disponible ;
- ne contenir aucun identifiant MySQL ;
- ne demander aucun « Run script » ou action supplémentaire dans Plesk ;
- être déployée par `git push`, déploiement Plesk normal et redémarrage normal ;
- pouvoir être rejouée sans perte de données.

## 18. Tests minimaux

### Défi personnel

- `/fr/defi/CODE` fonctionne ;
- aucune publication automatique ;
- page `noindex` et absente du sitemap.

### Preset sans publication

- son `is_active` continue de contrôler le catalogue ;
- aucune URL SEO ;
- absence du sitemap.

### Publication française

- HTTP 200 ;
- H1 et description dans le HTML SSR ;
- title, description, canonical et robots corrects ;
- présence dans le sitemap si indexable ;
- preset appliqué au moteur.

### Publication FR/DE/EN

- trois slugs fonctionnels et contenus réellement traduits ;
- IT/ES en 404 ;
- canonical propre ;
- trois `hreflang` réciproques ;
- aucune URL fictive ;
- sitemap cohérent.

### Brouillon et non-indexable

- brouillon : 404 ;
- publiée non indexable : 200 avec `noindex, follow` ;
- aucune présence dans le sitemap.

### Slugs

- invalide refusé ;
- doublon dans une langue refusé ;
- modification publiée : ancien slug en 301 ;
- inconnu : véritable 404.

### SEO et régression

- un seul canonical ;
- aucun `hreflang` contradictoire ;
- aucun query string dans le canonical ;
- sitemap XML valide ;
- pas de concurrence involontaire avec `/exercices/[parcours]` ;
- création, modification et sélection des presets intactes ;
- création et chargement des défis personnels intacts ;
- changement de langue intact ;
- typecheck, tests et build Nuxt réussis.

## 19. Ordre de mise en œuvre

Avant de coder :

1. lister les pages `/exercices/[parcours]` existantes ;
2. lister les premiers presets candidats ;
3. éliminer ou fusionner les sujets concurrents ;
4. préparer de vraies traductions éditoriales ;
5. confirmer `/[locale]/defis/[slug]` ;
6. vérifier dans Search Console les `/defi/CODE` encore visibles.

Puis :

1. migration idempotente au démarrage ;
2. types et service serveur ;
3. API d’administration ;
4. administration multilingue ;
5. route publique SSR et application du preset ;
6. adaptation centralisée canonical, robots et `hreflang` ;
7. sitemap dynamique ;
8. maillage interne ;
9. redirections d’anciens slugs ;
10. tests et audit du HTML rendu.

## 20. Compte rendu attendu

Fournir :

- diagnostic des pages existantes et risques de concurrence ;
- fichiers créés et modifiés ;
- migration idempotente, tables, contraintes et index ;
- routes et API ;
- administration ;
- brouillons, publications et non-indexables ;
- slugs et redirections ;
- canonical et `hreflang` ;
- sitemap ;
- comportement inchangé des `/defi/CODE` ;
- tests, typecheck et build ;
- vérifications après déploiement et redémarrage normaux dans Plesk.

Ne demander aucune exécution de script supplémentaire dans Plesk.

## 21. Résultat attendu

Le résultat doit être un mini-CMS de publications pédagogiques qui :

- réutilise `challenge_presets` comme moteur ;
- sépare configuration technique et textes éditoriaux ;
- permet des traductions indépendantes ;
- ne publie que les langues préparées ;
- produit du contenu SSR compréhensible ;
- génère canonical et `hreflang` cohérents ;
- alimente le sitemap existant ;
- permet un vrai maillage interne ;
- conserve les défis personnels sans changement ;
- évite les pages faibles ou concurrentes ;
- reste administrable et extensible sans dupliquer les exercices.

## 22. Plan de réalisation opérationnel

Ce plan est la checklist de travail à suivre. Ne pas commencer une phase dépendante tant que les critères de validation de la phase précédente ne sont pas satisfaits.

### Phase 0 — Établir l’état initial

- [x] Vérifier que l’arbre de travail ne contient pas de modification utilisateur en conflit avec les fichiers concernés.
- [x] Exécuter les tests existants liés aux défis, au routage, au SEO et au sitemap.
- [x] Exécuter le typecheck et noter les éventuelles erreurs déjà présentes avant intervention.
- [x] Relever le schéma réel des tables `challenge_presets`, `challenge_preset_categories`, `challenge_preset_verbs`, `challenge_preset_tenses` et `defis`.
- [x] Inventorier les pages `/exercices/[parcours]`, leurs sujets, leurs canonical et leur présence dans le sitemap.
- [x] Inventorier les presets actifs susceptibles de recevoir une publication.
- [ ] Vérifier dans Search Console les URL `/defi/CODE` qui reçoivent encore des impressions ou des clics, si cet accès est disponible.

Validation de phase : disposer d’un inventaire écrit des pages existantes, des presets candidats et des risques de concurrence. Aucune donnée ne doit encore être modifiée.

### Phase 1 — Fixer le périmètre éditorial initial

- [x] Choisir un petit lot pilote de deux ou trois presets aux intentions distinctes des pages SEO existantes.
- [x] Choisir les langues réellement prêtes : les cinq langues sont préparées pour les 38 presets.
- [x] Préparer pour chaque langue : slug, H1, titre SEO, description visible et meta description.
- [x] Confirmer l’usage de la structure `/[locale]/defis/[slug]`.
- [x] Définir les règles exactes de publication, indexation, brouillon et changement de slug.
- [x] Décider si la bibliothèque `/[locale]/defis` fait partie du premier lot ou d’une phase suivante.

Validation de phase : chaque page pilote doit avoir une intention de recherche distincte et un contenu éditorial relu. Ne pas générer de traductions automatiques au rendu.

### Phase 2 — Écrire les tests de structure attendue

- [x] Ajouter des tests décrivant les tables, contraintes, index et migrations attendus.
- [x] Ajouter les tests des règles de validation des langues, slugs, longueurs et statuts.
- [x] Ajouter les tests de résolution d’une publication par langue et slug.
- [x] Ajouter les tests de regroupement des traductions par `preset_id`.
- [x] Ajouter les tests des anciens slugs et des redirections 301.
- [x] Ajouter les tests garantissant que les défis personnels restent séparés.

Validation de phase : les nouveaux tests doivent échouer pour les raisons attendues avant l’implémentation, sans casser les tests historiques non concernés.

### Phase 3 — Créer la migration idempotente

- [x] Créer `challenge_preset_publications` avec ses clés, contraintes et index.
- [x] Créer `challenge_preset_publication_redirects` si les redirections de slugs sont incluses dans le premier lot.
- [x] Implémenter la migration dans un plugin serveur versionné exécuté au démarrage normal.
- [x] Rendre chaque opération idempotente : détection des tables, colonnes, index et contraintes déjà présents.
- [x] Ne placer aucun secret ni identifiant MySQL dans les fichiers versionnés.
- [x] Tester la migration sur une base déjà migrée puis sur une base non migrée.
- [x] Vérifier qu’un second démarrage n’entraîne ni erreur ni modification indésirable.

Validation de phase : deux exécutions successives doivent réussir et produire le même schéma sans perte de données.

### Phase 4 — Créer les types et le service serveur

- [x] Définir les types partagés et administratifs des publications.
- [x] Créer les fonctions de normalisation et validation des slugs.
- [x] Créer la lecture publique par `(locale, slug)`.
- [x] Charger le preset, la catégorie et les traductions publiées associées.
- [x] Créer la liste des publications publiées/indexables destinée au sitemap.
- [x] Créer les opérations administratives de lecture et d’enregistrement.
- [x] Créer la résolution d’un ancien slug vers sa publication courante.
- [x] Veiller à ne jamais exposer de données privées ou administratives dans la réponse publique.

Validation de phase : tous les tests unitaires du service doivent réussir, y compris les langues absentes, brouillons, non-indexables et slugs inconnus.

### Phase 5 — Créer les API d’administration

- [x] Créer l’API de lecture des publications d’un preset.
- [x] Créer l’API de création ou modification d’une version linguistique.
- [x] Créer l’action de publication et dépublication si elle est séparée de l’enregistrement. L’état est volontairement enregistré par le même `PUT` transactionnel.
- [x] Protéger chaque endpoint avec `requireAdministrator`.
- [x] Valider strictement le preset, la langue, le slug, les textes et les booléens.
- [x] Transformer les doublons de slug en réponse HTTP 409 compréhensible.
- [x] Enregistrer automatiquement l’ancien slug lorsqu’un slug publié change.
- [x] Utiliser des transactions pour les changements qui touchent publication et historique.

Validation de phase : les tests API doivent couvrir succès, absence d’authentification, payload invalide, doublon, preset absent et changement de slug.

### Phase 6 — Étendre l’administration des défis

- [x] Ajouter la section « Publications SEO » dans `app/pages/admin/challenges.vue`.
- [x] Ajouter les onglets FR, DE, EN, IT et ES.
- [x] Afficher clairement l’état de chaque langue : absente, brouillon, publiée, non indexable.
- [x] Ajouter les champs slug, H1, titre SEO, description et meta description.
- [x] Ajouter l’aperçu de l’URL canonique.
- [x] Ajouter un avertissement avant toute modification de slug publié.
- [x] Conserver l’enregistrement automatique et ses états : en cours, enregistré, erreur.
- [ ] Vérifier l’ergonomie sur ordinateur, tablette et mobile.
- [x] Respecter le thème sombre et les styles d’administration existants.

Validation de phase : un administrateur doit pouvoir créer, enregistrer, publier, dépublier et traduire une publication sans modifier la configuration du preset.

### Phase 7 — Permettre le chargement direct d’un preset

- [x] Ajouter à `WizardChallengeWorkspace` une propriété de preset initial.
- [x] Charger le catalogue avant de rechercher le preset.
- [x] Réutiliser la fonction existante d’application d’un preset.
- [x] Ouvrir l’étape appropriée du parcours sans simuler un code personnel.
- [x] Conserver le suivi analytique indiquant que la source est un preset.
- [x] Afficher une erreur contrôlée si le preset n’existe plus ou devient inactif. La résolution publique retourne 404 avant de rendre le moteur.
- [x] Vérifier que les parcours personnalisés et `/defi/CODE` ne changent pas.

Validation de phase : le même preset doit produire la même configuration depuis le catalogue et depuis sa future page publique.

### Phase 8 — Créer la route publique SSR

- [x] Créer `app/pages/defis/[slug].vue`.
- [x] Déterminer la langue depuis l’URL localisée.
- [x] Charger la publication et ses traductions pendant le rendu serveur.
- [x] Retourner un véritable 404 pour slug inconnu, langue absente ou brouillon.
- [x] Retourner une 301 serveur pour un ancien slug.
- [x] Rendre le H1, la description, le résumé pédagogique et les liens dans le HTML initial.
- [x] Intégrer le moteur avec le preset initial.
- [x] Ajouter, si retenue dans le périmètre, la bibliothèque `/defis` filtrée par langue.

Validation de phase : l’inspection du HTML reçu sans JavaScript doit montrer le H1, la description et les métadonnées attendues.

### Phase 9 — Centraliser canonical, robots et hreflang

- [x] Identifier la manière dont les balises globales sont dédupliquées par Unhead/Nuxt.
- [x] Adapter `app/app.vue` ou créer un composable central permettant une configuration SEO par page.
- [x] Garantir un seul canonical et une seule directive robots.
- [x] Construire les `hreflang` à partir des traductions réellement publiées.
- [x] Inclure la page elle-même dans son groupe de variantes.
- [x] Ne pas annoncer une langue absente ou un brouillon.
- [x] Ajouter `x-default` uniquement lorsqu’une destination valide est définie.
- [x] Garder le canonical sans paramètres de requête.
- [x] Renseigner les métadonnées Open Graph avec l’URL canonique.

Validation de phase : comparer le `<head>` SSR des versions FR, DE et d’une langue absente ; aucune balise ne doit être dupliquée ou contradictoire.

### Phase 10 — Étendre le sitemap

- [x] Rendre le handler du sitemap asynchrone.
- [x] Conserver toutes les entrées statiques existantes.
- [x] Ajouter uniquement les publications publiées et indexables.
- [x] Produire les groupes `hreflang` réciproques avec les seules langues disponibles.
- [x] Échapper toutes les valeurs XML.
- [x] Conserver des URL absolues et canoniques.
- [x] Définir un repli sûr si la lecture de la base échoue.
- [x] Conserver ou ajuster le cache HTTP en tenant compte du délai de publication acceptable.
- [x] Valider le XML généré.

Validation de phase : aucune URL personnelle, brouillon ou non indexable ne doit apparaître dans le sitemap.

### Phase 11 — Ajouter le maillage interne sans cannibalisation

- [x] Ajouter des liens depuis les pages de temps uniquement lorsque l’intention est complémentaire. Aucun lien de temps n’est ajouté avant validation d’un sujet pilote, afin d’éviter la concurrence.
- [x] Ajouter des liens depuis les catégories ou la bibliothèque publique.
- [x] Utiliser les associations de temps, verbes et catégories déjà stockées. Le preset et sa catégorie pilotent la page et son classement, sans duplication.
- [x] Ajouter des liens de retour vers les ressources pédagogiques pertinentes. La page revient vers la bibliothèque ; les liens de temps attendent la validation éditoriale.
- [x] Vérifier que les ancres sont descriptives et traduites.
- [x] Ne pas créer deux pages visant exactement la même requête principale.

Validation de phase : chaque publication doit recevoir au moins un lien HTML pertinent hors sitemap et posséder une place claire dans l’architecture éditoriale.

### Phase 12 — Ajouter les données éditoriales

- [x] Enregistrer les publications pilotes via les données éditoriales dédiées, et non par des valeurs codées en dur dans les composants.
- [x] Relire la cohérence de chaque traduction et de sa terminologie grammaticale.
- [x] Vérifier la cohérence entre slug, H1, title et contenu.
- [x] Vérifier les accents, apostrophes, majuscules et formulations propres à chaque langue.
- [x] Vérifier que les notions grammaticales françaises restent correctement nommées dans les textes traduits.
- [x] Publier les 190 versions après l’autorisation explicite du 18 août 2026.

Validation de phase : aucune langue ne doit être publiée avec un contenu provisoire, vide ou simplement copié du français.

### Phase 13 — Tests complets et audit manuel

- [x] Exécuter les tests ciblés des publications, routes, API, sitemap et SEO.
- [x] Exécuter toute la suite de tests du projet.
- [x] Exécuter le typecheck.
- [x] Exécuter le build de production.
- [x] Exécuter `git diff --check`.
- [x] Tester les réponses HTTP 200, 301 et 404. Les 200/404 ont été vérifiés sur le serveur local et la 301 par le résolveur et le test de route, sans insérer de publication.
- [x] Inspecter le HTML SSR des cinq langues et vérifier une page « Commencer ce défi » par langue.
- [ ] Tester la navigation avec et sans JavaScript.
- [ ] Tester le changement de langue entre slugs différents.
- [ ] Tester ordinateur, tablette, mobile, thème clair et thème sombre.
- [x] Vérifier les pages historiques `/defi/CODE` et le générateur personnalisé.
- [x] Valider les données structurées éventuellement ajoutées.

Validation de phase : aucun test ou build ne doit échouer et aucune régression des défis personnels ne doit être observée.

### Phase 14 — Préparer la livraison

- [x] Relire le diff complet et écarter toute modification sans rapport avec cette fonctionnalité.
- [x] Vérifier qu’aucun secret, identifiant ou contenu privé n’est versionné.
- [x] Documenter les tables, routes, API, règles SEO et décisions de canonicalisation.
- [x] Documenter les sujets écartés pour cause de concurrence avec une page existante.
- [x] Fournir le compte rendu demandé à la section 20.
- [ ] Déployer uniquement par les fichiers versionnés et le processus Git/Plesk normal.
- [ ] Après déploiement, demander seulement le redémarrage normal et la vérification des journaux.
- [ ] Vérifier ensuite les pages publiques, le sitemap et les en-têtes HTTP en production.
- [ ] Soumettre ou contrôler le sitemap dans Search Console selon le processus habituel.

Validation finale : les publications pilotes sont accessibles, indexables uniquement lorsqu’elles doivent l’être, reliées correctement entre langues, présentes dans le sitemap et sans effet sur les défis personnels.

### État des étapes volontairement ouvertes

Les cases encore ouvertes exigent soit un accès externe indisponible (Search Console), soit des contrôles manuels multi-appareils, soit un déploiement en production. L’autorisation de préparer et publier localement les 190 fiches a été donnée ; aucun déploiement n’a été effectué.

### Phase 15 — Préparer le transfert vers une base distante plus récente

- [x] Interdire toute copie ou restauration globale de la base locale vers la production.
- [x] Exporter uniquement les publications SEO officielles dans un paquet JSON versionné.
- [x] Référencer les défis par `preset_key`, stable entre les bases, et non par leur identifiant numérique.
- [x] Forcer les exports ordinaires en brouillon et non indexables par défaut ; le lot actuel conserve explicitement son statut publié.
- [x] Préserver par défaut toute publication SEO existante ; le lot actuel autorisé remplace uniquement les mêmes couples `preset_key`/langue.
- [x] Exiger des options explicites pour remplacer une publication distante ou conserver un statut publié.
- [x] Appliquer chaque paquet une seule fois au démarrage normal grâce à un registre et un checksum.
- [x] Rendre l’import transactionnel afin qu’une erreur n’entraîne aucune application partielle.
- [x] Documenter le flux compatible avec le déploiement Git et le redémarrage normal de Plesk.
- [x] Vérifier qu’aucune donnée personnelle, aucun secret et aucune ligne de `defis` ne sont exportés.

Validation de phase : une livraison de publications SEO peut être préparée localement et ajoutée aux fichiers versionnés sans écraser la base distante, plus récente, ni publier involontairement les brouillons.

### Phase 16 — Publier tous les défis préfabriqués dans les cinq langues

- [x] Inventorier les 38 défis actifs réellement présents dans `/admin/challenges`.
- [x] Rédiger les slugs, H1, titres SEO, descriptions et meta descriptions dans les cinq langues.
- [x] Garantir l’unicité des 190 slugs par langue et respecter toutes les limites de longueur.
- [x] Traduire les catégories publiques et les indications de personnalisation.
- [x] Marquer les 190 fiches comme publiées et indexables.
- [x] Enregistrer les 190 fiches dans la base locale et vérifier qu’aucun champ n’est vide.
- [x] Versionner un paquet ciblé par `preset_key`, sans copier la base locale.
- [x] Appliquer automatiquement et de façon retentable le paquet au démarrage normal.
- [x] Vérifier 38 publications par langue, les routes publiques, le sitemap et la limitation de débit.
- [x] Exécuter les 845 tests, le typecheck, le build de production et `git diff --check`.
- [x] Ne rien déployer sans un nouvel accord explicite.

Validation de phase : les 190 publications sont complètes et visibles localement ; le prochain déploiement Git suivi d’un redémarrage normal appliquera uniquement ces publications à la base distante.

# Augmenter progressivement le catalogue des verbes

Statut : en cours  
Créé le : 25 juillet 2026  
Objectif : augmenter durablement le nombre de verbes disponibles sans diminuer la qualité grammaticale et pédagogique du site.

## Situation de départ

État observé le 25 juillet 2026 :

- 488 fiches dans la table `verbes` ;
- 435 verbes actifs ;
- 53 anciennes fiches archivées ;
- 308 verbes actifs du premier groupe ;
- 17 verbes actifs du deuxième groupe ;
- 110 verbes actifs du troisième groupe ;
- aucun rang de fréquence renseigné ;
- 2 fiches marquées `valide` et 433 fiches actives encore à vérifier ;
- 43 004 lignes de conjugaison, dont 41 281 formes principales remplies.

Le catalogue contient déjà beaucoup de verbes, mais il ne doit pas être agrandi par un import massif non contrôlé. Une erreur sur un infinitif, un radical ou un participe se propage dans de nombreux temps, dans les exercices et dans l’aide du chat.

## Principes à conserver

- Ajouter les verbes de base avant leurs emplois pronominaux.
- Ne jamais fabriquer automatiquement `se + verbe` pour tout le catalogue.
- Ajouter une forme pronominale uniquement lorsqu’un emploi est attesté et adapté aux personnes autorisées.
- Conserver séparément :
  - le verbe de base ;
  - ses conjugaisons ;
  - ses sens ;
  - ses compléments ;
  - ses emplois pronominaux.
- Utiliser l’infinitif correctement accentué comme forme canonique.
- Effectuer un audit en lecture seule avant chaque écriture en base.
- Importer par petits lots réversibles.
- Conserver la source et le statut de validation de chaque donnée.
- Ne pas rendre un nouveau verbe actif tant que ses contrôles bloquants ne passent pas.

## Sources envisagées

### 1. Lexique

Usage : découvrir les lemmes verbaux et établir leur priorité selon leur fréquence.

- Site : <https://www.lexique.org/?lang=en&page_id=790>
- Données : lemmes, catégorie grammaticale, fréquences, informations morphologiques.
- Point à vérifier avant l’import : licence exacte de la version téléchargée et obligations d’attribution.

Lexique sert à déterminer quels verbes manquent et lesquels seront les plus utiles. Il ne doit pas être l’unique autorité pour valider toutes les conjugaisons.

### 2. Morphalou

Usage : vérifier les formes fléchies et les paradigmes.

- Présentation : <https://www.cnrtl.fr/lexiques/morphalou/>
- Version contrôlée : Morphalou 3.1, ATILF-CNRS, licence LGPL-LR.
- Archive utilisée : <https://huggingface.co/datasets/datasets-CNRS/Morphalou/blob/main/Morphalou3.1_formatCSV_toutEnUn.zip>

### 3. Dictionnaire de l’Académie française

Usage : vérifier l’orthographe canonique, les variantes, les auxiliaires, les emplois pronominaux et les restrictions particulières.

- Site : <https://www.dictionnaire-academie.fr/>

### 4. Données pédagogiques propres au site

Les définitions FALC, niveaux scolaires, niveaux CECRL, compléments et exemples doivent rester des données pédagogiques contrôlées dans le projet. Ils ne doivent pas être déduits automatiquement d’une fréquence lexicale.

## Processus général

### Phase 0 — Consolider le catalogue actuel

- [ ] Produire la liste des 435 verbes actifs avec leur statut de validation.
- [ ] Repérer les infinitifs non canoniques ou sans accents.
- [ ] Comparer `infinitif` et `forme_canonique`.
- [ ] Repérer les participes présents et passés suspects.
- [ ] Repérer les conjugaisons contenant une orthographe différente de l’infinitif canonique.
- [ ] Vérifier les auxiliaires.
- [ ] Vérifier les verbes impersonnels et défectifs.
- [ ] Vérifier les personnes réellement disponibles.
- [ ] Vérifier les variantes stockées dans `conjugaison2` et `conjugaison3`.
- [ ] Définir précisément les statuts `genere`, `a_verifier` et `valide`.
- [ ] Corriger en priorité les anomalies qui pourraient être copiées dans de nouveaux verbes.

Résultat attendu : une base existante suffisamment fiable pour servir de référence aux imports suivants.

### Phase 1 — Construire le rapport des verbes manquants

Créer un script en lecture seule, par exemple :

`scripts/audit-missing-french-verbs.mjs`

Le script devra :

- [x] charger les lemmes verbaux de la source choisie ;
- [x] normaliser les apostrophes et l’Unicode sans supprimer les accents affichés ;
- [x] comparer les lemmes au catalogue actif et aux anciennes fiches archivées ;
- [x] exclure les noms et adjectifs homographes ;
- [x] conserver la fréquence et le rang de chaque lemme ;
- [x] signaler les conflits d’orthographe ;
- [x] signaler les verbes déjà présents sous une graphie incorrecte ;
- [x] produire un rapport sans modifier la base.

Rapport proposé :

`reports/missing-french-verbs.md`

Colonnes minimales :

| Priorité | Infinitif canonique | Fréquence | Présent dans le site | Famille probable | Source | Difficulté estimée |
|---|---|---:|---|---|---|---|

Le rapport devra aussi fournir :

- le nombre total de verbes candidats ;
- les 100 verbes fréquents manquants ;
- les candidats réguliers ;
- les candidats irréguliers ;
- les homographes ou cas ambigus ;
- les formes déjà présentes avec une mauvaise orthographe.

### Phase 2 — Préparer un premier lot de 100 verbes

Composition indicative :

- environ 70 verbes réguliers ou rattachables avec certitude à une famille déjà gérée ;
- environ 20 verbes fréquents du troisième groupe appartenant à une famille connue ;
- au maximum 10 verbes irréguliers ou défectifs nécessitant une validation manuelle.

Critères de priorité :

1. fréquence réelle ;
2. utilité pour les élèves et les allophones ;
3. présence dans plusieurs niveaux scolaires ;
4. famille de conjugaison déjà maîtrisée par le site ;
5. absence d’ambiguïté importante de sens ou d’auxiliaire.

Ne pas commencer par :

- les verbes très rares ;
- les verbes archaïques ;
- les verbes uniquement techniques ;
- les formes pronominales complexes avec `en` ou `y` ;
- les verbes dont le paradigme n’est pas confirmé ;
- les verbes dont l’orthographe canonique est incertaine.

#### Avancement du sous-lot 01 — priorités 1 à 20

- [x] sens principal contrôlé auprès de l’Académie ;
- [x] définition FALC rédigée ;
- [x] niveau CECRL estimé et identifié comme estimation interne ;
- [x] niveau scolaire proposé ;
- [x] transitivité et construction contrôlées ;
- [x] 150 compléments postposés naturels validés pour 15 constructions ;
- [x] quatre emplois pronominaux validés séparément ;
- [x] simulation structurelle sans écriture permanente ;
- [x] genre, nombre et forme antéposée contrôlés pour les 130 COD ;
- [x] import définitif appliqué avec sauvegardes MyISAM restaurables.

#### Avancement du sous-lot 02 — priorités 21 à 40

- [x] sens principal contrôlé auprès de l’Académie ;
- [x] définition FALC rédigée ;
- [x] niveau CECRL estimé et identifié comme estimation interne ;
- [x] niveau scolaire proposé ;
- [x] transitivité et construction contrôlées ;
- [x] 150 compléments postposés naturels validés pour 15 constructions ;
- [x] quatre emplois pronominaux validés séparément ;
- [x] simulation structurelle sans écriture permanente ;
- [x] genre, nombre et forme antéposée contrôlés pour les 120 COD ;
- [x] import définitif appliqué avec sauvegardes MyISAM restaurables.

#### Avancement du sous-lot 03 — priorités 41 à 60

- [x] sens principal contrôlé auprès de l’Académie ;
- [x] définition FALC rédigée ;
- [x] niveau CECRL estimé et identifié comme estimation interne ;
- [x] niveau scolaire proposé ;
- [x] transitivité et construction contrôlées ;
- [x] 130 compléments postposés naturels validés pour 13 constructions ;
- [x] quatre emplois pronominaux validés séparément ;
- [x] simulation structurelle sans écriture permanente ;
- [x] genre, nombre et forme antéposée contrôlés pour les 110 COD ;
- [x] import définitif appliqué avec sauvegardes MyISAM restaurables.

#### Avancement du sous-lot 04 — priorités 61 à 80

- [x] sens principal contrôlé auprès de l’Académie ;
- [x] définition FALC rédigée ;
- [x] niveau CECRL estimé et identifié comme estimation interne ;
- [x] niveau scolaire proposé ;
- [x] transitivité et construction contrôlées ;
- [x] 140 compléments postposés naturels validés pour 14 constructions ;
- [x] quatre emplois pronominaux validés séparément ;
- [x] simulation structurelle sans écriture permanente ;
- [x] genre, nombre et forme antéposée contrôlés pour les 120 COD ;
- [x] import définitif appliqué avec sauvegardes MyISAM restaurables.

#### Avancement du sous-lot 05 — priorités 81 à 100

- [x] sens principal contrôlé auprès de l’Académie ;
- [x] définition FALC rédigée ;
- [x] niveau CECRL estimé et identifié comme estimation interne ;
- [x] niveau scolaire proposé ;
- [x] transitivité et construction contrôlées ;
- [x] 160 compléments postposés naturels validés pour 16 constructions ;
- [x] quatre emplois pronominaux validés séparément ;
- [x] simulation structurelle sans écriture permanente ;
- [x] genre, nombre et forme antéposée contrôlés pour les 150 COD ;
- [x] import définitif appliqué avec sauvegardes MyISAM restaurables.

### Phase 3 — Créer un import en deux temps

L’import doit séparer la préparation et l’application.

Commandes souhaitées :

```text
npm run data:verbs:candidates
npm run data:verbs:pilot:check
npm run data:verbs:pilot:apply
```

La commande `check` doit :

- [x] ouvrir une transaction ;
- [x] préparer toutes les insertions ;
- [x] exécuter les contrôles ;
- [x] afficher un résumé ;
- [x] annuler la transaction.

La commande `apply` doit :

- [x] exécuter exactement les mêmes opérations ;
- [x] restaurer automatiquement les tables MyISAM si un contrôle bloquant échoue ;
- [x] valider la transaction InnoDB seulement à la fin ;
- [x] pouvoir être relancée sans créer de doublons.

Sécurité du lot pilote :

- sauvegarde des verbes : `backup_verbes_vfp202601` ;
- sauvegarde des conjugaisons : `backup_verbesconjugues_vfp202601` ;
- restauration : `npm run data:verbs:pilot:restore` ;
- une relance de `npm run data:verbs:pilot:apply` contrôle les données existantes sans les dupliquer.

Déploiement sur Plesk :

- ne pas lancer `npm run data:verbs:pilot:apply` depuis « Run script », car Plesk n’y transmet pas toujours les variables `DB_*` ;
- déployer puis redémarrer normalement l’application Node ;
- le plugin `server/plugins/verb-pilot-migration.ts` applique alors automatiquement le lot avec la configuration MySQL de Nitro ;
- contrôler dans le journal Plesk la ligne `[database] Lot verbs-frequency-pilot-2026-01 disponible` ;
- le traitement est idempotent : les redémarrages suivants vérifient le lot sans dupliquer les données.

Chaque lot doit posséder un identifiant stable, par exemple :

`verbs-frequency-pilot-2026-01`

### Phase 4 — Valider chaque nouveau verbe

#### Identité

- [ ] infinitif correctement accentué ;
- [ ] forme Unicode NFC ;
- [ ] aucun doublon normalisé ;
- [ ] groupe correct ;
- [ ] famille de conjugaison correcte ;
- [ ] terminaison de l’infinitif correcte.

#### Conjugaison

- [ ] présent complet lorsque le verbe n’est pas défectif ;
- [ ] imparfait ;
- [ ] futur simple ;
- [ ] passé simple ;
- [ ] conditionnel présent ;
- [ ] subjonctif présent ;
- [ ] subjonctif imparfait si le site le conserve ;
- [ ] impératif pour les personnes possibles ;
- [ ] participe présent ;
- [ ] participe passé ;
- [ ] variantes officielles conservées sans doublon.

#### Temps composés

- [ ] auxiliaire correct ;
- [ ] participe passé correct ;
- [ ] accord avec `être` ;
- [ ] absence d’accord automatique avec le sujet après `avoir` ;
- [ ] gestion des verbes à auxiliaire variable selon le sens.

#### Métadonnées

- [ ] forme canonique ;
- [ ] rang de fréquence ;
- [ ] niveau de difficulté ;
- [ ] niveau CECRL lorsqu’il est réellement établi ;
- [ ] personnes disponibles ;
- [ ] type de `h` si nécessaire ;
- [ ] statut de validation ;
- [ ] source et URL de la source.

#### Pédagogie

- [ ] définition FALC courte ;
- [ ] aucune formulation sensible ou inadaptée aux mineurs ;
- [ ] aide du chat cohérente ;
- [ ] exemples naturels ;
- [ ] complément ajouté seulement lorsqu’il est validé.

### Phase 5 — Ajouter les emplois pronominaux séparément

Pour chaque nouveau verbe de base :

- [ ] vérifier si un emploi pronominal est attesté ;
- [ ] vérifier s’il s’agit d’un emploi réfléchi, réciproque, passif, subjectif, essentiel ou idiomatique ;
- [ ] indiquer la fonction du pronom ;
- [ ] limiter les personnes lorsque l’emploi ne convient pas à toutes ;
- [ ] indiquer la règle d’accord ;
- [ ] exclure les constructions qui exigent aussi `en` ou `y` tant que le générateur ne les gère pas ;
- [ ] conserver la source ;
- [ ] ne proposer dans l’autocomplétion que les emplois actifs et validés.

Un verbe « théoriquement conjugable à la forme pronominale » ne doit pas automatiquement devenir un bon exercice. Il faut aussi vérifier que l’emploi est naturel avec la personne choisie.

### Phase 6 — Enrichir après la conjugaison

L’ordre recommandé est :

1. verbe de base et conjugaisons ;
2. métadonnées et fréquence ;
3. définition FALC ;
4. sens et auxiliaires dépendant du sens ;
5. compléments validés ;
6. emplois pronominaux ;
7. catégories, défis et parcours pédagogiques.

Un nouveau verbe peut être disponible pour un exercice simple avant de posséder dix compléments, mais il ne doit pas être proposé dans une option qui exige des compléments tant que ceux-ci ne sont pas validés.

## Contrôles automatiques obligatoires

Après chaque lot :

```text
npm test
npm run typecheck
npm run build
git diff --check
```

Ajouter ou maintenir des tests qui vérifient :

- [ ] aucun infinitif actif en double ;
- [ ] aucune conjugaison orpheline ;
- [ ] aucun verbe sans auxiliaire ou participe requis ;
- [ ] aucune variante identique à la forme principale ;
- [ ] six personnes au présent pour les verbes non défectifs ;
- [ ] aucune personne interdite pour les verbes défectifs ;
- [ ] cohérence entre infinitif, forme canonique et conjugaisons ;
- [ ] cohérence des familles ;
- [ ] correction des accents ;
- [ ] recherche et autocomplétion ;
- [ ] génération du futur proche ;
- [ ] génération des formes pronominales ;
- [ ] aide du chat sur un échantillon de chaque famille.

## Paliers proposés

### Palier A — Catalogue assaini

- [ ] anomalies actuelles corrigées ;
- [ ] statuts de validation utilisables ;
- [ ] rapport des verbes manquants reproductible.

### Palier B — Premier lot

- [ ] 100 verbes fréquents ajoutés ;
- [ ] tous les contrôles passent ;
- [ ] rapport d’import conservé.

### Palier C — 750 verbes actifs

- [ ] nouveaux lots de 100 à 150 verbes ;
- [ ] priorité maintenue sur la fréquence et l’utilité scolaire ;
- [ ] contrôle des performances de l’autocomplétion.

### Palier D — 1 000 verbes actifs

- [ ] couverture des principales familles de conjugaison ;
- [ ] irréguliers fréquents validés manuellement ;
- [ ] catalogue pronominal enrichi séparément.

Au-delà de 1 000 verbes, réévaluer l’utilité pédagogique avant de poursuivre vers des verbes rares ou spécialisés.

## Définition de « terminé » pour un lot

Un lot est terminé uniquement lorsque :

- toutes les données ont une source identifiable ;
- le mode simulation ne signale aucun blocage ;
- l’import est idempotent ;
- la base locale a été migrée ;
- les tests complets passent avec MySQL ;
- le typecheck et le build passent ;
- le rapport du lot est conservé ;
- les nouveaux verbes sont trouvables dans l’autocomplétion ;
- un exercice peut être généré pour chaque nouveau verbe ;
- aucune forme pronominale non validée n’est proposée.

## Première action à réaliser — terminée

Créer le script de comparaison en lecture seule et produire la liste des 100 verbes fréquents manquants. Ne lancer aucun import avant la lecture et la validation de cette liste.

## Journal de suivi

| Date | Lot ou action | Résultat | Décision suivante |
|---|---|---|---|
| 25.07.2026 | Création de la feuille de route | Processus documenté | Construire le rapport des verbes fréquents manquants |
| 25.07.2026 | Audit Lexique 4 | 5 014 lemmes verbaux, 4 832 absents, 8 conflits de graphie signalés | Contrôler les candidats fréquents auprès de l’Académie |
| 25.07.2026 | Contrôle Académie | 200 candidats examinés ; 100 retenus ; cas familiers, sensibles, défectifs, ambigus ou uniquement pronominaux séparés | Vérifier les paradigmes avec Morphalou |
| 25.07.2026 | Contrôle Morphalou 3.1 | 100 paradigmes sur 100 sans blocage après remplacement des cas ambigus | Simuler l’import local |
| 25.07.2026 | Simulation `verbs-frequency-pilot-2026-01` | Les tables permanentes sont MyISAM : le premier rollback a été nettoyé (retour vérifié à 488 verbes), puis 100 verbes et 10 200 lignes ont été simulés dans des tables temporaires ; la base permanente est restée à 488 verbes | Rédiger et valider les données pédagogiques avant d’autoriser `apply` |
| 25.07.2026 | Sous-lot pédagogique 01, priorités 1 à 20 | 20 définitions FALC, 20 niveaux internes, 20 sens, 15 constructions, 150 compléments, 130 COD entièrement qualifiés et 4 emplois pronominaux validés ; simulation temporaire réussie | Traiter les priorités 21 à 40 |
| 25.07.2026 | Sous-lot pédagogique 02, priorités 21 à 40 | 20 définitions FALC, 20 niveaux internes, 20 sens, 15 constructions, 150 compléments, 120 COD entièrement qualifiés et 4 emplois pronominaux validés ; la simulation cumulée prépare 40 fiches et 300 compléments sans écriture permanente | Traiter les priorités 41 à 60 |
| 25.07.2026 | Sous-lot pédagogique 03, priorités 41 à 60 | 20 définitions FALC, 20 niveaux internes, 20 sens, 13 constructions, 130 compléments, 110 COD entièrement qualifiés et 4 emplois pronominaux validés ; la simulation cumulée prépare 60 fiches et 430 compléments sans écriture permanente | Traiter les priorités 61 à 80 |
| 25.07.2026 | Sous-lot pédagogique 04, priorités 61 à 80 | 20 définitions FALC, 20 niveaux internes, 20 sens, 14 constructions, 140 compléments, 120 COD entièrement qualifiés et 4 emplois pronominaux validés ; la simulation cumulée prépare 80 fiches et 570 compléments sans écriture permanente | Traiter les priorités 81 à 100 |
| 25.07.2026 | Sous-lot pédagogique 05, priorités 81 à 100 | 20 définitions FALC, 20 niveaux internes, 20 sens, 16 constructions, 160 compléments, 150 COD entièrement qualifiés et 4 emplois pronominaux validés ; la simulation complète prépare 100 fiches, 730 compléments et 20 emplois pronominaux sans écriture permanente | Sécuriser l’application idempotente dans les tables MyISAM |
| 25.07.2026 | Application `verbs-frequency-pilot-2026-01` | Cycle application, relance idempotente et restauration validé sur une base isolée ; application locale réussie : 588 verbes, 58 124 conjugaisons, 945 sens, 474 constructions, 11 400 compléments et 231 emplois pronominaux ; 100 liens sémantiques ajoutés | Conserver les sauvegardes MyISAM jusqu’à validation après déploiement |
| 25.07.2026 | Déploiement Plesk du lot pilote | Migration automatique ajoutée au démarrage Nitro afin de réutiliser la configuration MySQL de l’application, absente de « Run script » | Déployer, redémarrer l’application et contrôler le message de réussite dans le journal Plesk |

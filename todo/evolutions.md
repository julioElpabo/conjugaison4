# Pistes d’évolution de TATITOTU

## Résumé

Cette nouvelle feuille de route repose sur un examen approfondi des parcours
publics, des deux modes d’exercice, de l’espace élève, de l’administration, des
API, des données, des tests et de la compilation de production.

TATITOTU est déjà un produit très complet. Il propose notamment trois entrées
claires depuis l’accueil, un configurateur détaillé, des défis prédéfinis, le
partage par code, l’impression en PDF ou Word, un mode classique, un mode avec
coach, des aides contextuelles, cinq langues d’interface, un espace élève
public, une analyse fine des erreurs et une administration particulièrement
riche. Ces fonctions ne doivent donc plus être présentées comme des évolutions à
créer.

Les priorités réelles se situent désormais dans la continuité des parcours, la
promesse faite aux titulaires de comptes, l’efficacité pédagogique à long
terme, la qualité mesurable dans le navigateur et la maîtrise éditoriale du
catalogue.

| Priorité | Piste | Description succincte |
|---:|---|---|
| 1 | Achever le contrat des comptes publics | Rendre le code de récupération utilisable, proposer l’export des données et publier une information de confidentialité durable. |
| 2 | Reprendre un exercice interrompu | Restaurer une séance à la question suivante au lieu d’annoncer que la progression courante sera perdue. |
| 3 | Programmer les révisions utiles | Transformer les erreurs déjà détectées en révisions différées et en une recommandation prioritaire. |
| 4 | Relier les trois espaces pédagogiques | Faire circuler naturellement l’élève entre une erreur, son explication, la fiche du verbe et un micro-exercice ciblé. |
| 5 | Tester les vrais parcours dans un navigateur | Ajouter des scénarios de bout en bout, des tests de composants et des contrôles d’accessibilité continus. |
| 6 | Assainir les URL et le référencement | Créer des fiches stables, des métadonnées riches et rediriger les anciennes entrées concurrentes. |
| 7 | Réduire le poids des interfaces et des médias | Mesurer les performances réelles, différer les fonctions lourdes et optimiser les médias des coachs. |
| 8 | Piloter la qualité des 588 verbes | Remplacer la course au volume par un tableau de couverture et un véritable statut de publication. |
| 9 | Fiabiliser les évolutions de base de données | Centraliser les migrations automatiques, leur état et leurs erreurs sans dépendre d’une action manuelle dans Plesk. |
| 10 | Mesurer la progression durable | Compléter les statistiques d’usage par des indicateurs de retour, de consolidation et de mémorisation. |
| 11 | Prolonger le partage pour les enseignants | Ajouter collections, QR codes et bilans anonymes autour des fonctions de partage déjà existantes. |

## 1. Achever le contrat des comptes publics

Le compte élève est déjà ouvert au public et bénéficie de protections sérieuses :
mot de passe haché, sessions séparées, limitation des tentatives, contrôle
d’origine, en-têtes de sécurité, changement de mot de passe et suppression des
résultats ou du compte.

Le principal problème n’est donc pas de « finaliser un prototype », mais de
tenir complètement la promesse affichée lors de l’inscription.

Le site génère un code de récupération, n’en conserve que le condensat et
explique qu’il permettra de récupérer le compte. Pourtant, aucun écran ni aucune
API ne permettent encore de l’utiliser. Ce manque est prioritaire : une personne
qui oublie son mot de passe ne peut actuellement pas retrouver son historique,
malgré le code qu’elle a soigneusement conservé.

Le chantier devrait comprendre :

- un formulaire « Mot de passe oublié » demandant le pseudonyme et le code ;
- une limitation stricte des essais par adresse et par pseudonyme ;
- la révocation des anciennes sessions après récupération ;
- le remplacement du code utilisé par un nouveau code affiché une seule fois ;
- des tests sur le rejeu, l’expiration, les erreurs et les tentatives massives ;
- un export lisible des préférences, séances, réponses conservées et erreurs ;
- une page permanente expliquant les données, leur durée de conservation, leur
  suppression et les services tiers.

La case courte de l’inscription ne remplace pas une information durable. Le
pied de page ne propose actuellement qu’un contact et l’accès à
l’administration. Il faut y ajouter une page de confidentialité accessible
avant et après la création du compte.

Cette page devra aussi expliquer la mesure d’audience. Google Analytics est
chargé sur les pages publiques et l’administration exploite notamment des
données géographiques. Il convient de documenter précisément ce traitement,
d’en vérifier la base applicable et, si nécessaire, de mettre en place un choix
de consentement. Le public mineur justifie une validation juridique explicite,
sans pour autant remettre en cause le bon principe des comptes pseudonymes.

## 2. Permettre la reprise exacte d’un exercice interrompu

Le serveur enregistre déjà chaque tentative, l’index de la question, la
configuration du défi et la date de fin éventuelle. L’historique sait donc
identifier une séance non terminée. En revanche, l’interface classique comme le
chat avertissent encore que fermer l’exercice fera perdre la progression
courante.

Il faut exploiter les données déjà présentes pour proposer :

> Reprendre « Passé composé — auxiliaire être » à la question 7 sur 10.

La reprise devrait restaurer :

- le défi et son ordre de questions ;
- le mode classique ou conversationnel ;
- la prochaine question à répondre ;
- les réussites et erreurs déjà comptabilisées ;
- le coach choisi lorsque cela est pertinent ;
- le bilan final sans compter deux fois les anciennes réponses.

Pour un élève connecté, l’état de référence peut rester côté serveur. Pour un
visiteur anonyme, une sauvegarde temporaire dans le navigateur suffirait. Les
identifiants de tentative déjà prévus doivent garantir l’idempotence en cas de
reconnexion ou de double envoi.

Ce chantier doit aussi traiter les coupures réseau. Une réponse peut être
acceptée dans l’interface alors que son enregistrement échoue silencieusement.
Une petite file locale, un indicateur « progression synchronisée » et une
relance contrôlée rendraient le suivi beaucoup plus fiable.

## 3. Passer de la reprise immédiate à la révision différée

L’espace élève offre déjà bien plus qu’un simple historique :

- reprise du même défi ;
- reprise de toutes les formes ou seulement des formes fautives ;
- regroupement des erreurs par catégorie ;
- tendances entre périodes ;
- exemples détaillés avec réponse donnée et réponse attendue ;
- conseils et aides grammaticales.

Le manque réel est temporel. Le modèle ne distingue pas encore suffisamment une
forme réussie juste après correction d’une forme retrouvée plusieurs jours plus
tard.

Chaque difficulté pourrait recevoir un état simple :

- à revoir aujourd’hui ;
- en cours de consolidation ;
- à vérifier dans quelques jours ;
- durablement maîtrisée.

La page personnelle présenterait alors une seule action prioritaire, par
exemple : « 6 formes sont prêtes à être revues ». Cette recommandation
s’appuierait sur l’ancienneté, le nombre d’échecs, la réussite différée, le type
d’erreur et l’importance scolaire de la notion.

Il n’est pas nécessaire de construire immédiatement un algorithme opaque. Une
première règle explicable — reprise le lendemain, puis après trois, sept et
vingt et un jours — permettrait déjà de mesurer l’effet. L’élève devrait pouvoir
voir pourquoi une question lui est proposée et reporter une révision sans
punition.

## 4. Relier « Apprendre », « Consulter » et les corrections

Les trois espaces publics sont actuellement de bonne qualité mais restent trop
juxtaposés.

La page « Apprendre » contient cinq chapitres structurés, mais ses seuls débouchés
sont deux boutons généraux en fin de page. La fiche « Consulter » affiche toutes
les formes, le groupe et l’auxiliaire, mais pas encore les définitions,
particularités, constructions ou boutons d’entraînement que le catalogue
possède déjà en grande partie. À l’inverse, le diagnostic des erreurs est très
riche, sans renvoi direct vers un passage précis de la synthèse.

Il faudrait créer des liens contextuels :

- depuis une fiche de verbe, « S’entraîner sur ce verbe » avec le verbe déjà
  sélectionné ;
- depuis un temps, « Faire cinq questions sur ce temps » ;
- depuis une erreur, « Comprendre cette règle » puis « Vérifier avec trois
  questions » ;
- depuis une règle, un micro-défi contrastif déjà configuré ;
- depuis une correction, la fiche exacte du verbe et du temps concernés.

Les contenus déjà disponibles dans les métadonnées du catalogue — sens,
définition, famille, fréquence, niveau, construction et particularités —
devraient être réutilisés au lieu d’être recréés dans un second système.

Cette circulation donnerait une cohérence forte au produit :

> observer, comprendre, essayer, corriger, puis vérifier plus tard.

## 5. Tester les parcours réellement exécutés

La suite actuelle est substantielle : elle compte 575 tests et couvre très bien
les règles de conjugaison, les variantes, les compléments, les aides, les
formats historiques, la sécurité et l’intégrité de la base.

Elle ne remplace toutefois pas un navigateur. Le projet ne possède pas encore
de socle Playwright, de tests de composants en mode navigateur ni de contrôle
automatique avec axe. Le fichier README identifie d’ailleurs déjà cette lacune.

Les premiers scénarios de bout en bout devraient couvrir :

1. composer un défi, répondre, se corriger et obtenir le bilan ;
2. recommencer une forme fautive dans les deux modes d’exercice ;
3. enregistrer, partager puis recharger un défi ;
4. créer un compte, se reconnecter, récupérer le compte et changer le mot de
   passe ;
5. interrompre puis reprendre une séance ;
6. exporter et supprimer ses données ;
7. utiliser les principaux dialogues uniquement au clavier ;
8. vérifier les parcours essentiels sur un petit écran ;
9. générer les aperçus d’impression sans erreur.

Quelques tests ciblés doivent aussi simuler une API lente, une réponse `500`, une
perte de réseau et une session expirée. Ce sont des situations importantes pour
un outil utilisé en classe.

L’accessibilité mérite un double contrôle : automatisé à chaque évolution et
manuel avec clavier, lecteur d’écran et zoom à 200 %. Le code possède déjà de
nombreux libellés ARIA, des dialogues avec gestion du focus et le respect de la
réduction des animations. L’objectif est de vérifier cette bonne base dans le
produit rendu, pas de repartir de zéro.

## 6. Donner des adresses stables aux contenus publics

La consultation d’un verbe utilise actuellement une adresse du type
`/fr/consulter?verbe=123`. Elle dépend d’un identifiant interne et conserve le
même titre générique pour toutes les fiches. Le projet ne contient pas encore
de plan de site, d’adresse canonique, de données structurées ou de véritable
fiche indexable par infinitif.

Une première série de routes pourrait être :

- `/fr/verbes/etre` ;
- `/fr/verbes/venir/present` ;
- `/fr/temps/passe-compose` ;
- `/fr/regles/futur-ou-conditionnel`.

Chaque fiche devrait produire côté serveur un titre, une description, une
adresse canonique, les variantes linguistiques pertinentes et des données
structurées sobres. Un plan de site ne devrait inclure que les fiches publiées
et validées.

Il faut parallèlement supprimer les entrées concurrentes. `/`, `/nouveau-defi`
et `/accueil` exposent encore plusieurs variantes du constructeur, dont une
ancienne interface. Les anciennes adresses utiles doivent rediriger en `301`
vers une route canonique, sans casser les codes de défis historiques.

Ce nettoyage améliorera à la fois le référencement, la maintenance et la
compréhension des statistiques.

## 7. Établir un budget de performance et de médias

La compilation sépare déjà correctement plusieurs dépendances lourdes : PDF,
Word et visite guidée sont chargés dynamiquement. Il faut conserver cette
approche et la vérifier avec les requêtes réellement effectuées par le
navigateur, car le préchargement automatique peut réduire le bénéfice du
découpage.

Deux zones méritent une attention particulière :

- la page de cartes statistiques de l’administration produit à elle seule un
  fichier JavaScript compilé d’environ 1,3 Mo ;
- le dossier public des coachs contient 314 médias pour environ 117 Mo, avec
  plusieurs fichiers individuels proches de 2 Mo.

Le poids de l’administration n’affecte pas directement tous les visiteurs, mais
il révèle un composant cartographique à isoler davantage. Les médias des coachs,
eux, peuvent être téléchargés pendant un exercice sur téléphone.

Il faudrait :

- fixer des budgets par route et suivre LCP, INP et CLS sur mobile ;
- charger les aperçus, cartes, dialogues et bibliothèques d’export seulement à
  la demande ;
- générer des miniatures pour l’administration ;
- imposer dimensions et poids maximaux lors d’un téléversement ;
- convertir les images adaptées en WebP ou AVIF avec plusieurs tailles ;
- précharger uniquement l’avatar choisi, puis charger les réactions au besoin ;
- vérifier la taille des réponses de l’API des coachs.

Un audit Lighthouse ponctuel est utile, mais un budget vérifié automatiquement
empêchera surtout les régressions futures.

## 8. Gouverner la qualité du catalogue avant de l’agrandir

Le catalogue n’en est plus à 488 verbes comme l’indique encore le README. Les
tests et la base actuelle en contrôlent 588, après l’intégration réussie d’un
lot de 100 verbes. La sélection dynamique par groupe, les métadonnées
grammaticales, les sens, les constructions, les compléments et les emplois
pronominaux sont déjà très développés.

La prochaine évolution ne devrait donc pas être « ajouter des verbes » sans
autre précision. Il faut d’abord rendre visible le niveau de complétude de
chaque fiche :

- paradigme vérifié ;
- auxiliaire et participe contrôlés ;
- personnes autorisées pour les verbes défectifs ;
- définition et source ;
- fréquence, niveau scolaire et CECRL ;
- construction COD ou COI validée ;
- compléments naturels disponibles ;
- emplois pronominaux attestés ;
- aides automatiques testées ;
- traductions disponibles.

L’administration pourrait calculer un score de couverture et offrir des filtres
« incomplet », « à vérifier » et « publiable ». Une fiche non validée pourrait
rester consultable par l’équipe tout en étant exclue des défis publics qui
exigent des données absentes.

Cette étape permettra ensuite d’ajouter de nouveaux lots selon des besoins
observés — recherches sans résultat, programmes scolaires ou besoins FLE — et
non selon un objectif de volume arbitraire.

Il faut également mettre à jour le README et les anciens documents TODO pour
éviter que le chiffre de 488 ou des tâches déjà terminées continuent à guider
les décisions.

## 9. Rendre les migrations automatiques observables

Le projet respecte la contrainte d’hébergement en exécutant les évolutions de
base au démarrage, là où la connexion MySQL est disponible. C’est le bon modèle
pour Plesk et il ne faut pas réintroduire de commande manuelle après
déploiement.

En revanche, les migrations sont aujourd’hui réparties entre de nombreux
plugins. Certaines enregistrent une erreur puis laissent l’application
continuer. Sans registre central, il devient difficile de savoir quelles
évolutions ont été appliquées, dans quel ordre et avec quel résultat.

Un gestionnaire léger devrait :

- attribuer un identifiant immuable à chaque migration ;
- enregistrer date, durée, résultat et éventuellement empreinte ;
- empêcher la double application ;
- distinguer une migration critique d’un enrichissement facultatif ;
- arrêter le démarrage si le schéma indispensable est incohérent ;
- exposer l’état uniquement à l’administration et dans les journaux ;
- vérifier par un test que toutes les migrations versionnées sont déclarées.

Cette évolution doit rester entièrement contenue dans les fichiers versionnés et
le démarrage normal de l’application. Elle rendra les déploiements plus
prévisibles sans ajouter d’action supplémentaire dans Plesk.

Un contrôle de disponibilité interne pourrait vérifier l’application et la
connexion à la base sans révéler son nom ni les détails du serveur. Les erreurs
importantes gagneraient aussi à recevoir un identifiant de corrélation commun au
journal serveur et au message d’administration.

## 10. Mesurer ce qui est réellement appris

L’administration dispose déjà d’un tableau de bord complet : visiteurs,
sessions, appareils, pays, villes, exercices commencés ou terminés, réponses,
taux de réussite, aides, défis, impressions et exports.

Ajouter davantage de graphiques de trafic apporterait peu. Les prochaines
mesures doivent répondre à des questions pédagogiques :

- une personne revient-elle après 7 ou 30 jours ?
- une forme corrigée est-elle encore réussie une semaine plus tard ?
- quels types d’erreurs résistent aux reprises ?
- une aide augmente-t-elle la réussite à la tentative suivante ?
- quelle étape du configurateur provoque un abandon ?
- le mode avec coach améliore-t-il la persévérance sans multiplier les essais
  au hasard ?

Ces indicateurs doivent être agrégés, pseudonymisés et soumis aux mêmes règles
de conservation que le reste des données. Ils permettront de décider si une
évolution pédagogique fonctionne réellement, au lieu de se fier uniquement au
nombre de clics.

## 11. Prolonger les fonctions destinées aux enseignants

Le site sait déjà imprimer un questionnaire avec corrigé, produire un PDF ou un
document Word, enregistrer un défi et le transmettre par code ou par lien. Il
ne faut donc plus proposer un vague « mode enseignant » comme si ces outils
n’existaient pas.

Une extension cohérente consisterait à ajouter :

- un QR code dans le dialogue de partage et sur la fiche imprimée ;
- des collections personnelles de défis ;
- la duplication d’un défi partagé avant modification ;
- une date d’archivage plutôt qu’une suppression immédiate ;
- un libellé de classe ou de séquence sans donnée nominative d’élève ;
- un bilan collectif anonyme par question et par type d’erreur.

Ce chantier est moins urgent que la récupération des comptes, la reprise des
séances ou les tests navigateur. Il devient pertinent après avoir stabilisé ces
fondations, car il prolonge une force existante sans transformer TATITOTU en
plateforme scolaire nominative.

## Ordre de réalisation conseillé

### Court terme

1. Implémenter la récupération par code et l’export des données.
2. Publier l’information de confidentialité et clarifier la mesure d’audience.
3. Ajouter les premiers tests de bout en bout et contrôles d’accessibilité.
4. Rediriger `/accueil` et `/nouveau-defi` vers l’entrée canonique.
5. Mettre à jour la documentation du catalogue à 588 verbes.
6. Mesurer les performances mobiles et fixer les premiers budgets.

### Moyen terme

1. Restaurer précisément les exercices interrompus.
2. Relier les erreurs, les règles, les fiches de verbes et les micro-défis.
3. Mettre en place la première révision différée explicable.
4. Publier les premières fiches stables par verbe et le plan de site.
5. Ajouter le tableau de couverture éditoriale du catalogue.
6. Centraliser l’historique des migrations automatiques.

### Plus long terme

1. Personnaliser la recommandation de révision selon les résultats différés.
2. Mesurer la consolidation à 7 et 30 jours.
3. Optimiser et décliner tout le fonds de médias des coachs.
4. Ajouter collections, QR codes et bilans collectifs anonymes.
5. Étendre à nouveau le catalogue selon les besoins constatés.

## Cap recommandé

Le meilleur cap n’est plus d’ajouter des écrans généraux : la plupart existent
déjà. Il consiste à rendre le parcours actuel continu, fiable et vérifiable :

> ne jamais perdre une séance, tenir toutes les promesses du compte public,
> transformer les erreurs en apprentissage durable et mesurer le résultat dans
> le vrai navigateur comme dans la durée.

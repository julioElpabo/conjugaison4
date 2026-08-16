# Refonte des statistiques

## Objectif

Construire un tableau de bord proche de Google Analytics dans sa lecture, mais centré sur les usages pédagogiques de TatiToTu.

Le tableau de bord doit répondre rapidement à quatre questions :

1. Qui utilise le site maintenant et d'où ?
2. Quels services sont réellement utilisés sur une période donnée ?
3. Jusqu'où les personnes vont-elles dans les principaux parcours ?
4. Les personnes connectées utilisent-elles les fonctions qui leur sont réservées ?

## Règles de lecture

- **Personne** : utilisateur actif unique. Pour l'audience et la géographie, la référence est GA4. Pour une fonction TatiToTu, la référence est une session locale unique ayant déclenché l'événement.
- **Session** : période d'utilisation continue. Une même personne peut avoir plusieurs sessions.
- **Utilisation** : action terminée ou réellement commencée, jamais simple affichage d'un bouton.
- **Exposition** : la fonction était visible et pouvait être choisie.
- **Taux d'adoption** : sessions ayant utilisé la fonction / sessions auxquelles elle a été exposée.
- **Taux d'achèvement** : actions terminées / actions commencées.
- Les nombres GA4 et locaux ne doivent pas être additionnés. Ils répondent à des questions différentes et leur source doit toujours être affichée.

## Sources de données

```text
Statistiques
├── GA4 — audience générale
│   ├── personnes actives et sessions
│   ├── temps réel sur les 30 dernières minutes
│   ├── pays, régions et villes
│   ├── pages d'entrée et parcours de pages
│   ├── sources d'acquisition
│   └── appareils, navigateurs et systèmes
├── Événements locaux — usages du produit
│   ├── fonctions exposées, choisies, commencées et terminées
│   ├── options pédagogiques choisies
│   ├── exercices, coachs, aides et impressions
│   ├── distinction anonyme / compte connecté
│   └── détails nécessaires aux entonnoirs
└── Base des comptes — données fiables sur les comptes
    ├── comptes existants et créations
    ├── connexions et comptes actifs
    ├── progression et reprises d'erreurs
    └── fonctions réservées aux comptes
```

GA4 doit être utilisé pour ce qu'il fait mieux : audience, temps réel, géographie, acquisition et technologie. Les événements locaux doivent rester la source de vérité pour les options pédagogiques et les parcours fonctionnels. Cela évite de dépendre de paramètres GA4 non configurés comme dimensions personnalisées et permet de conserver des définitions stables.

## Structure générale de l'écran

```text
Statistiques
├── Maintenant
├── Vue d'ensemble
├── Défis et options
├── Exercices et chat
├── Impression
├── Accessibilité et visite
├── Comptes
└── Usages                         ← section actuelle conservée
```

### Barre de contrôle commune

Tous les onglets, sauf **Maintenant**, partagent une barre fixe :

```text
Période : [7 jours] [30 jours] [90 jours] [Cette année] [Personnalisée]
Comparer : [Période précédente] [Année précédente] [Sans comparaison]
Population : [Tous] [Anonymes] [Connectés]
Langue : [Toutes] [FR] [DE] [EN] [IT] [ES]
Appareil : [Tous] [Ordinateur] [Mobile] [Tablette]
Zone : [Tous les pays / pays / région]
```

- Le choix de période est conservé en changeant d'onglet.
- Chaque carte affiche sa source : `GA4`, `Événements locaux` ou `Comptes`.
- Chaque valeur affiche l'évolution par rapport à la comparaison choisie.
- Un clic sur une légende filtre les autres graphiques de l'onglet.
- Les tableaux sont triables par volume, personnes uniques, taux, évolution et dernière utilisation.
- Les graphiques peuvent basculer entre valeurs absolues et pourcentages.

## Arbre détaillé des onglets

### 1. Maintenant — 30 dernières minutes

```text
Maintenant
├── Bandeau de synthèse
│   ├── personnes actives
│   ├── sessions actives
│   ├── pages vues
│   └── actions TatiToTu réalisées
├── Carte en direct
│   ├── points par ville
│   ├── taille du point = personnes actives
│   ├── couleur = activité dominante
│   └── détail au survol : ville, pays, personnes, pages, actions
├── Activité minute par minute
│   └── courbe des 30 minutes, actualisée automatiquement
├── En ce moment sur le site
│   ├── pages actives
│   ├── exercices classiques
│   ├── exercices chat
│   ├── création / chargement de défis
│   └── impressions et téléchargements
└── Listes latérales
    ├── pays et villes
    ├── langues
    └── appareils
```

La carte montre des positions **approximatives au niveau de la ville**, jamais la position exacte d'une personne. Un point représente le centroïde d'une ville fourni à partir des villes agrégées par GA4. Les faibles volumes doivent être regroupés ou masqués afin de ne pas donner une illusion de précision et de préserver la vie privée.

Comportement conseillé : rafraîchissement toutes les 60 secondes, heure de dernière mise à jour visible, maintien de la dernière réponse en cas de quota GA4, et bouton d'actualisation manuelle.

### 2. Vue d'ensemble — période définie

```text
Vue d'ensemble
├── Indicateurs
│   ├── personnes actives
│   ├── nouvelles / déjà venues
│   ├── sessions
│   ├── sessions avec utilisation d'un service
│   ├── exercices commencés
│   └── exercices terminés
├── Audience dans le temps
│   ├── personnes actives
│   ├── nouvelles personnes
│   └── sessions
├── Carte et classement géographique
│   ├── pays
│   ├── régions
│   └── villes
├── Services les plus utilisés
│   └── barres triées par personnes uniques puis utilisations
├── Parcours principal
│   └── visite → défi prêt → exercice lancé → exercice terminé
└── Acquisition et technique — GA4
    ├── source / support / campagne
    ├── page d'entrée
    ├── appareil
    ├── navigateur
    └── système d'exploitation
```

Le bloc « Services les plus utilisés » doit montrer côte à côte : personnes uniques, nombre total d'utilisations, taux d'adoption et évolution. Cela évite de confondre une fonction utilisée cent fois par une personne avec une fonction utilisée par cent personnes.

### 3. Défis et options

```text
Défis et options
├── Type de départ
│   ├── défi tout fait sélectionné
│   ├── défi chargé avec un code
│   └── défi personnalisé créé
├── Entonnoir de création personnalisée
│   ├── création choisie
│   ├── verbes choisis
│   ├── modes et temps choisis
│   ├── options validées
│   ├── défi prêt
│   └── premier usage lancé
├── Options d'exercice
│   ├── type de question
│   │   ├── conjuguer
│   │   ├── trouver le mode
│   │   └── trouver le mode et le temps
│   ├── voix
│   │   ├── actif
│   │   ├── passif
│   │   └── combinaison actif + passif, si autorisée
│   ├── compléments
│   │   ├── sans complément
│   │   ├── COD
│   │   ├── COI
│   │   ├── COD + COI
│   │   └── placement avant / après / mixte
│   ├── pronoms inclusifs et « on »
│   ├── nombre de questions
│   └── source des phrases d'identification
├── Défis tout faits
│   ├── classement par personnes uniques
│   ├── lancements
│   ├── achèvements
│   ├── taux d'achèvement
│   └── réutilisation
└── Chargement et partage
    ├── codes chargés avec succès / en erreur
    ├── défis enregistrés et partagés
    └── part des défis partagés ensuite chargés
```

Graphiques : barres horizontales pour les options, barres empilées à 100 % pour comparer actif/passif ou les types de questions, histogramme pour le nombre de questions, et entonnoir pour la création.

Tri du tableau des défis : personnes uniques, lancements, taux d'adoption, taux d'achèvement, réutilisation, progression et dernière utilisation.

### 4. Exercices et chat

```text
Exercices et chat
├── Comparaison des présentations
│   ├── classique
│   └── chat avec coach
│       ├── personnes uniques
│       ├── exercices commencés
│       ├── exercices terminés
│       ├── abandons
│       ├── taux de réussite
│       └── nombre moyen de réponses par exercice
├── Types d'exercice
│   ├── conjugaison
│   ├── identification du mode
│   └── identification du mode et du temps
├── Chat — coachs
│   ├── classement par personnes uniques
│   ├── sélections totales
│   ├── exercices réellement commencés
│   ├── taux d'achèvement
│   └── réutilisation du même coach
├── Chat — outils consultés
│   ├── ouverture de l'aide à droite
│   │   ├── volontaire
│   │   └── proposée après une erreur / un rappel
│   ├── consultation d'une conjugaison depuis le chat
│   └── délai moyen avant la première aide
└── Qualité pédagogique
    ├── réponses correctes du premier coup
    ├── réponses après aide
    ├── erreurs puis réussite
    └── abandon après une erreur
```

Le classement des coachs doit utiliser en priorité les **exercices commencés avec le coach**, pas la simple ouverture du sélecteur. Une seconde colonne peut conserver le nombre de sélections pour mesurer la déperdition entre choix et lancement.

Graphiques : barres groupées classique/chat, courbes d'évolution, tableau triable des coachs, et entonnoir `exercice commencé → aide ouverte → réponse correcte → exercice terminé`.

### 5. Impression

```text
Impression
├── Parcours
│   ├── aperçu ouvert
│   ├── PDF téléchargé
│   ├── Word téléchargé
│   └── aperçu quitté sans téléchargement
├── Format
│   ├── PDF
│   ├── Word
│   └── impression du navigateur, lorsqu'elle existe
├── Origine
│   ├── fiche d'exercice
│   ├── bilan d'exercice
│   └── consultation d'un verbe
├── Type d'exercice imprimé
│   ├── conjugaison
│   ├── mode
│   └── mode et temps
└── Options de mise en page
    ├── titre personnalisé
    ├── espacement des questions
    ├── espacement sous le titre
    ├── affichage inclusif
    ├── niveau / classe
    ├── liste des verbes
    ├── liste des temps
    ├── prénom
    ├── nom
    ├── date
    └── numéro aléatoire
```

Graphiques : entonnoir aperçu/téléchargement, anneau PDF/Word, barres des origines et matrice des options. Pour les options booléennes, afficher le pourcentage d'impressions où l'option est activée. Pour les espacements, utiliser un histogramme ou des classes de valeurs.

### 6. Accessibilité et visite

```text
Accessibilité et visite
├── Langues de traduction
│   ├── langue testée dans le sélecteur
│   ├── langue effectivement utilisée pour une action
│   ├── personnes uniques par langue
│   ├── sessions par langue
│   └── répartition des services utilisés dans chaque langue
├── FALC
│   ├── personnes ayant activé le mode
│   ├── personnes ayant ensuite utilisé un service
│   ├── services utilisés en FALC
│   ├── exercices commencés / terminés en FALC
│   └── taux d'abandon FALC comparé au mode standard
├── Apparence
│   ├── préférence claire / sombre observée
│   ├── changements vers clair / sombre
│   └── préférence du système / choix explicite, si mesurable
└── Visite guidée
    ├── invitation affichée
    ├── démarrage rapide / complet
    ├── progression par étape
    ├── abandon par étape
    ├── report « plus tard »
    ├── fin de la visite
    └── premier service utilisé après la visite
```

Pour les traductions, séparer impérativement **langue testée** et **langue utilisée**. Un clic sur un drapeau n'est pas une utilisation du site dans cette langue. L'indicateur principal doit être le nombre de personnes ayant effectué une action significative après le changement.

Pour le mode clair/sombre, une bascule ne suffit pas à connaître la répartition actuelle : il faut aussi enregistrer une exposition ou un état de session `theme=light|dark` une seule fois par session.

La visite guidée doit être représentée par un entonnoir et une barre de déperdition par étape. L'indicateur principal est le taux `visites terminées / visites démarrées`, décliné entre visite rapide et complète.

### 7. Comptes

```text
Comptes
├── Population
│   ├── comptes existants
│   ├── nouveaux comptes sur la période
│   ├── comptes actifs sur 7 / 30 / 365 jours
│   └── anonymes comparés aux connectés
├── Connexions
│   ├── personnes connectées
│   ├── connexions réussies
│   ├── échecs de connexion
│   └── fréquence de retour
├── Adoption après inscription
│   ├── inscription
│   ├── première connexion
│   ├── premier exercice
│   ├── premier exercice terminé
│   └── retour à J+7 / J+30
├── Fonctions propres aux comptes
│   ├── reprise d'une séance inachevée
│   ├── historique
│   ├── bilan d'une séance
│   ├── progression par défi
│   ├── analyse des erreurs
│   ├── reprise des erreurs d'une séance
│   ├── reprise des erreurs d'un défi
│   ├── défi ciblé par type d'erreur
│   ├── relance du même défi, même ordre / aléatoire
│   ├── préférences
│   └── partage du bilan
└── Comparaison connecté / anonyme
    ├── exercices par personne
    ├── taux d'achèvement
    ├── taux de retour
    ├── usage classique / chat
    └── usage des langues, FALC et options
```

Graphiques : courbe de création de comptes, cohortes J+7/J+30, barres des fonctions réservées, et comparaison anonyme/connecté. Aucun tableau ne doit afficher un identifiant, un nom ou le détail individuel d'un compte : les statistiques restent agrégées.

### 8. Usages — section actuelle conservée

```text
Usages
├── Résumé actuel
│   ├── sessions exposées
│   ├── sessions actives
│   ├── fonctions suivies
│   └── diagnostics
├── Défis tout faits
│   ├── expositions
│   ├── sélections
│   ├── démarrages
│   ├── achèvements
│   ├── répétitions
│   └── diagnostic garder / promouvoir / améliorer / retirer
└── Fonctions
    └── mêmes indicateurs et diagnostics
```

Cet onglet conserve sa logique actuelle. Il reçoit seulement la barre de période commune, le filtre anonyme/connecté et les conventions visuelles de la nouvelle interface.

## Mesures à ajouter avant de réaliser certains graphiques

Légende :

- `Disponible` : déjà suivi de manière suffisamment exploitable.
- `Partiel` : un événement existe, mais il manque un état ou un détail.
- `À ajouter` : aucune mesure fiable aujourd'hui.

| Besoin | État | Évolution de mesure proposée |
|---|---|---|
| Audience 30 minutes, pays, villes | Disponible via GA4 | Conserver GA4 comme source et utiliser le centroïde de ville pour la carte. |
| Langue testée / réellement utilisée | Disponible | Conserver `language_tested` et `language_used`; compter les sessions uniques. |
| Activation FALC | Disponible à partir de cette version | `falc` est joint aux actions significatives et agrégé dans l’onglet Accessibilité. |
| Défi chargé, partagé, personnalisé | Disponible / partiel | La création personnalisée est identifiable; ajouter les étapes du constructeur pour l'entonnoir. |
| Actif / passif, type de question, COD / COI | Disponible à partir de cette version | Un instantané normalisé des options est joint aux lancements et impressions. |
| Classique / chat | Disponible | Utiliser personnes uniques, commencés, terminés et abandons. |
| Coachs utilisés | Disponible | Le coach est présent sur les exercices chat; compter les lancements par coach. |
| Aide à droite dans le chat | Disponible à partir de cette version | `help_scrolled` est envoyé une seule fois par exercice, uniquement après un scroll initié par la personne. L’affichage automatique du panneau ne compte pas. |
| Conjugaison consultée depuis le chat | Disponible à partir de cette version | `chat_conjugation_opened` conserve seulement le contexte analytique de l’exercice. |
| PDF / Word | Disponible | Conserver les téléchargements réussis, distincts de l'ouverture de l'aperçu. |
| Options d'impression | Disponible à partir de cette version | Les options sont enregistrées au téléchargement sans conserver le titre libre. |
| Fin de visite guidée | Disponible à partir de cette version | Démarrage, étapes, abandon et fin distinguent les formats rapide et complet. |
| Clair / sombre | Disponible à partir de cette version | Le thème observé accompagne les actions significatives en plus de la bascule. |
| Comptes et connexions | Disponible | Croiser événements agrégés et tables de comptes, sans exposer les individus. |
| Fonctions réservées aux comptes | Disponible en grande partie | Uniformiser exposition, sélection, réussite et échec pour chaque fonction. |
| Impression d'une conjugaison consultée | À ajouter | Ajouter un événement réussi avec `source=consultation`. |

### Instantané d'options conseillé

Les noms doivent être stables, courts et indépendants des libellés traduits :

```text
exerciseKind       = conjugation | mode-identification | tense-identification
presentation       = classic | chat | print
voiceMode          = active | passive | mixed
complements        = none | cod | coi | cod-coi | other
complementPlacement= after | before | mixed
questionCountBand  = 1-5 | 6-10 | 11-20 | 21+
falc               = true | false
theme              = light | dark
actor               = anonymous | learner
locale              = fr | de | en | it | es
source              = preset | code | custom
```

Pour l'impression, ajouter des booléens nommés comme dans la configuration actuelle : `inclusiveDisplay`, `showGrade`, `showVerbs`, `showTenses`, `showFirstName`, `showLastName`, `showDate`, `showRandomNumber`, plus des classes pour les deux espacements. Le titre saisi ne doit pas être enregistré dans les statistiques.

## Indicateurs supplémentaires utiles

```text
Compléments utiles
├── Fidélité
│   ├── retour à J+1, J+7 et J+30
│   ├── sessions par personne
│   └── fréquence d'utilisation par langue et population
├── Parcours
│   ├── pages d'entrée qui mènent à un exercice
│   ├── temps entre arrivée et premier exercice
│   └── sorties avant lancement
├── Qualité
│   ├── erreurs techniques par fonction
│   ├── chargements de code échoués
│   ├── générations / téléchargements échoués
│   └── taux d'échec par appareil et navigateur
├── Pédagogie
│   ├── modes et temps les plus travaillés
│   ├── verbes les plus travaillés, sous forme agrégée
│   ├── catégories d'erreur les plus fréquentes
│   └── progression entre première et dernière tentative
└── Performance
    ├── temps de génération d'un défi
    ├── temps d'ouverture d'un exercice
    └── temps de production PDF / Word
```

Les erreurs techniques et les temps de réponse apportent une lecture importante : une fonction peut sembler peu adoptée parce qu'elle échoue ou répond lentement, pas parce qu'elle est inutile.

## Principes de confidentialité et de qualité

- Ne jamais stocker de réponse d'élève, phrase libre, titre personnalisé, adresse IP complète ou position GPS dans les événements analytiques.
- Ne jamais afficher de carte à l'échelle d'une adresse. La ville agrégée est le niveau maximal.
- Masquer ou regrouper les découpages trop fins lorsque le volume est très faible.
- Exclure l'administration des statistiques publiques, comme aujourd'hui.
- Afficher la date à partir de laquelle chaque mesure fine est fiable afin de ne pas comparer un historique incomplet à une période récente.
- Versionner le schéma des événements et documenter toute modification de définition.
- Dédupliquer les doubles événements de lancement déjà possibles entre l'espace de création et le composant d'exercice.
- Pour chaque indicateur, prévoir un état « données insuffisantes » plutôt qu'un pourcentage artificiel à zéro.

## Ordre de réalisation conseillé

```text
Phase 1 — fondations
├── stabiliser les définitions personne / session / utilisation
├── normaliser les métadonnées communes
├── éviter les doubles comptages
└── ajouter les événements manquants

Phase 2 — écrans prioritaires
├── Maintenant + carte GA4
├── Vue d'ensemble
├── Défis et options
└── Exercices et chat

Phase 3 — parcours spécialisés
├── Impression
├── Accessibilité et visite
├── Comptes et cohortes
└── intégration visuelle de l'onglet Usages existant

Phase 4 — approfondissement
├── acquisition GA4
├── qualité et performance
├── rétention J+1 / J+7 / J+30
└── comparaisons et exports
```

La première livraison utile devrait donc contenir **Maintenant**, **Vue d'ensemble**, **Défis et options**, **Exercices et chat**, ainsi que l'onglet **Usages** inchangé fonctionnellement. Les autres onglets peuvent ensuite être ajoutés sans modifier la structure générale.

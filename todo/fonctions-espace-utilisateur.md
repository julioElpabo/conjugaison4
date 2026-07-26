# Fonctions proposées pour l’espace utilisateur

## Intention pédagogique

L’espace utilisateur devrait soutenir une boucle simple :

> Choisir un objectif → s’entraîner → comprendre ses erreurs → recommencer → constater ses progrès.

Il ne doit pas devenir un tableau de statistiques complexe. Chaque information
affichée doit aider l’élève à décider quoi travailler ensuite.

## Fonctions prioritaires

### 1. Tableau de bord simple

Présenter trois actions principales :

- Continuer mon entraînement ;
- Revoir mes erreurs ;
- Choisir un nouveau défi.

L’élève doit comprendre immédiatement quelle action entreprendre.

### 2. Reprise automatique

Mémoriser le dernier exercice, les options choisies et l’avancement afin que
l’élève retrouve son activité là où il l’avait laissée.

### 3. Historique des entraînements

Conserver pour chaque séance :

- la date ;
- le thème travaillé ;
- le nombre de réponses ;
- les réussites ;
- les difficultés principales.

Cet historique doit servir de mémoire de travail, et non d’outil de surveillance.

### 4. Carnet d’erreurs personnel

Enregistrer les erreurs pédagogiquement utiles :

- le verbe ;
- le temps et la personne ;
- la réponse donnée ;
- la réponse attendue ;
- l’explication consultée.

Une difficulté corrigée plusieurs fois doit progressivement quitter la liste.

### 5. Révision espacée

Reproposer une difficulté rapidement après l’erreur, puis le lendemain, quelques
jours plus tard et enfin plus rarement lorsqu’elle est maîtrisée. Cette fonction
est l’une des évolutions pédagogiques les plus importantes.

### 6. Parcours personnalisé

Adapter les exercices aux résultats :

- davantage de questions sur les notions fragiles ;
- moins de répétitions sur les acquis ;
- une difficulté progressive ;
- un mélange régulier d’anciennes et de nouvelles notions.

### 7. Objectifs courts

Proposer des objectifs atteignables, par exemple :

- réussir huit formes au présent ;
- revoir cinq erreurs ;
- travailler pendant dix minutes.

Ces objectifs sont plus concrets et motivants que « maîtriser la conjugaison ».

### 8. Bilan de fin de séance

Présenter :

- ce qui a été travaillé ;
- ce qui est mieux maîtrisé ;
- une ou deux difficultés ;
- la prochaine action recommandée.

Le bilan doit valoriser la progression plutôt que le seul pourcentage de réussite.

## Évolutions complémentaires

### Carte des compétences

Organiser la progression par temps, groupes, personnes et difficultés
orthographiques, avec trois états lisibles : à découvrir, en cours et maîtrisée.

### Favoris et listes personnelles

Permettre de conserver un défi, une sélection de verbes ou une configuration
d’exercice.

### Défis personnels

L’élève pourrait définir un objectif privé, sans classement public ni compétition
obligatoire.

### Continuité d’entraînement

Une série quotidienne peut encourager la régularité, mais ne doit jamais être
punitive ni effacer brutalement les efforts après une journée manquée.

### Niveau d’aide

Permettre de demander un indice, un exemple, une explication complète ou une
nouvelle tentative. Demander de l’aide ne doit pas être présenté comme un échec.

### Mode évaluation

Séparer clairement l’entraînement avec aides de l’évaluation personnelle sans
aide, suivie d’un bilan.

## Fonctions liées au compte

- changer le mot de passe ;
- récupérer le compte avec le code personnel ;
- afficher et exporter les données enregistrées ;
- supprimer le compte ;
- fermer les autres sessions ;
- choisir la durée de conservation de l’historique.

## Ordre de développement recommandé

1. Enregistrer les séances et les réponses.
2. Créer « Continuer mon entraînement ».
3. Construire le carnet d’erreurs.
4. Ajouter « Revoir mes erreurs ».
5. Produire un bilan de séance.
6. Introduire la révision espacée.
7. Ajouter la carte des compétences.

Le premier tableau de bord de `/fr/my-page` devrait donc présenter le dernier
entraînement, les erreurs à revoir et une recommandation personnalisée.

## Structure retenue pour `/my-page`

La première version est organisée en trois onglets :

1. **Mes défis** : derniers défis réellement joués et révision exclusive des
   formes dont la dernière tentative est encore incorrecte, jusqu’à réussite.
2. **Ma progression** : timeline horizontale des connexions et des réponses,
   filtrable par réussite, échec et défi.
3. **Mes préférences** : langue de l’interface et apparence claire ou sombre,
   enregistrées avec le compte.

Seules les réponses effectivement validées dans un exercice classique ou dans
le chat alimentent la progression. Sélectionner un verbe, générer un
questionnaire ou imprimer une fiche ne crée aucun résultat pédagogique.

## Modèle de conservation compact retenu

Le suivi ne conserve pas une ligne détaillée pour chaque bonne réponse.

- Une exécution de défi conserve ses dates, sa configuration et les compteurs
  globaux de réussites et d’erreurs.
- Une seule synthèse est conservée par forme verbale et par exécution : nombre
  d’essais, nombre d’erreurs et état final « réussi » ou « à retravailler ».
- Le texte complet de la question et la réponse saisie ne sont conservés que
  pour les erreurs.
- Lorsqu’une forme ratée est ensuite réussie, sa synthèse passe à « réussi » et
  la question détaillée est retirée de la synthèse. Les erreurs déjà commises
  restent disponibles comme historique d’erreurs.
- Une question affichée mais jamais validée n’est pas comptée.

Ce modèle permet de calculer les scores, la timeline, la proportion de formes
vertes et les reprises ciblées, tout en évitant de dupliquer toutes les bonnes
réponses et toutes les questions.

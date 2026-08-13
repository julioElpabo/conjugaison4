# Rapport d’audit — accessibilité pour les personnes dyslexiques

## Conclusion

Le site possède une bonne base d’accessibilité, mais il ne devrait pas encore être présenté comme pleinement « adapté aux personnes dyslexiques ».

Il n’existe pas de conformité binaire propre à la dyslexie comparable à une certification technique. Les WCAG couvrent une partie des besoins, tandis que les recommandations cognitives du W3C vont plus loin sans être des critères obligatoires. Une certification WCAG complète demanderait aussi des tests réels à 200–400 % de zoom, avec des styles personnalisés, au clavier, avec des lecteurs d’écran et dans plusieurs navigateurs.

L’audit a été effectué en lecture seule sur les composants, les pages et les styles du site.

## Ce qui est déjà bien

| Domaine | Évaluation |
|---|---|
| Parcours guidé | Très bon : progression par étapes, avec une décision principale à la fois. |
| Exercices classiques | Bon : une seule question affichée, une grande zone centrale et une correction claire. |
| Mode chat | Bon principe pédagogique : aide contextuelle, encouragements et deuxième essai. |
| Police | Bonne famille sans sérif avec des polices système de repli. |
| Alignement | Les textes courants sont alignés à gauche, sans justification. |
| Contrastes principaux | Les couleurs principales testées dépassent généralement un ratio de 4,5:1. |
| Mouvement | Bonne prise en charge de `prefers-reduced-motion`. |
| Temps imposé | Aucun chronomètre ou délai de réponse pénalisant. |
| Structure | Titres, sections, libellés, états et nombreux attributs ARIA présents. |
| Impression | Les lignes de réponse sont continues et bien séparées. |
| Thème | Un mode clair et un mode sombre sont disponibles. |

Les recommandations du W3C insistent sur une structure claire, des libellés cohérents, un fonctionnement prévisible, des textes courts et la possibilité de réduire les distractions. Le site répond déjà assez bien à ces principes généraux.

Référence : [W3C — Cognitive and learning disabilities](https://www.w3.org/WAI/people-use-web/abilities-barriers/cognitive/)

## Principaux problèmes

### 1. Les questions classiques ont une typographie trop serrée

C’est le point le plus important.

Les questions principales utilisent actuellement :

- un interlettrage négatif de `-0.035em` ;
- un interligne de seulement `1.16` ;
- une graisse élevée de `760`.

Fichier concerné : `app/assets/css/main.css`, autour du style `.question-text`.

Pour un élève dyslexique, cette combinaison peut donner une impression de lettres collées et compliquer le passage d’une ligne à la suivante.

Recommandations :

- utiliser `letter-spacing: normal` ou un interlettrage légèrement positif ;
- utiliser un `line-height` compris entre `1.4` et `1.5` ;
- utiliser une graisse située autour de `600–700`.

### 2. Beaucoup de textes sont trop petits

De nombreux textes ont une taille comprise entre `0.62rem` et `0.8rem`, notamment :

- les indications de l’étape 3 dans `app/components/challenge/ChallengeOptions.vue` ;
- les métadonnées et les aides du chat dans `app/components/exercise/ChatExercise.vue` ;
- certains boutons de choix du mode et du temps, qui descendent jusqu’à `0.64rem` ;
- plusieurs libellés de la consultation et de l’espace élève.

La British Dyslexia Association recommande généralement un équivalent de 16 à 19 px pour le texte courant.

Recommandations :

- texte pédagogique principal : au moins `1rem` ;
- informations secondaires importantes : au moins `0.875rem` ;
- réserver les tailles inférieures aux éléments réellement accessoires.

Référence : [BDA — Dyslexia Style Guide 2023](https://cdn.bdadyslexia.org.uk/uploads/documents/Advice/style-guide/BDA-Style-Guide-2023.pdf?v=1680084017)

### 3. L’impression utilise une police trop petite

Le PDF affiche de nombreux contenus entre 8 et 10,5 points dans `app/components/challenge/PrintPreview.vue`. Le document Word emploie également souvent 19 ou 21 demi-points, soit environ 9,5 à 10,5 points.

Pour une fiche destinée à des élèves dyslexiques, il serait préférable d’utiliser :

- un corps de question de 12 points au minimum ;
- idéalement une option permettant de choisir 12, 14 ou 16 points ;
- un interligne d’environ 1,5 ;
- moins de questions par page si nécessaire ;
- éventuellement un fond crème ou pastel très léger pour l’impression.

Les traits continus récemment ajoutés constituent en revanche une amélioration pertinente.

### 4. Il manque un véritable mode d’affichage personnalisé

Les préférences actuelles proposent essentiellement la langue et le thème dans `app/components/learner/LearnerSpace.vue`.

Il serait très utile d’ajouter un bouton « Confort de lecture », accessible même sans compte, permettant de régler :

- la taille du texte ;
- l’interligne ;
- l’espacement des mots et des lettres ;
- le fond blanc, crème ou bleu très pâle ;
- la réduction des éléments décoratifs ;
- le choix entre la police actuelle et une police plus large comme Arial, Verdana ou Atkinson Hyperlegible.

Il vaut mieux proposer plusieurs réglages qu’imposer une police dite « dyslexique » : les besoins varient beaucoup d’une personne à l’autre.

Le W3C recommande explicitement la personnalisation de la police, de la taille, des marges, de l’interligne et du contraste.

Référence : [W3C — Support a Personalized and Familiar Interface](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o8p04-interface/)

### 5. Le mode chat peut devenir visuellement chargé

Le mode chat est pédagogiquement intéressant, mais il cumule :

- plusieurs bulles ;
- un avatar ;
- une progression ;
- des animations et des délais ;
- parfois un panneau d’aide parallèle ;
- beaucoup de textes en gras ;
- de petites étiquettes en majuscules.

Fichier concerné : `app/components/exercise/ChatExercise.vue`.

Améliorations possibles :

- proposer une option « Affichage calme » sans avatar animé ni délais artificiels ;
- ajouter un bouton « Afficher seulement la question actuelle » ;
- permettre de masquer les anciens messages ;
- augmenter la taille des textes dans l’aide ;
- conserver une seule colonne, y compris sur ordinateur, quand l’aide est ouverte ;
- ajouter un bouton « Lire la question ».

La réduction des animations système est déjà bien respectée, ce qui est positif. Le W3C recommande de pouvoir supprimer les mouvements et les actualisations qui gênent la lecture.

Référence : [W3C — Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)

### 6. Les majuscules et les graisses fortes sont trop fréquentes

Le site utilise beaucoup :

- de petites étiquettes en majuscules ;
- des graisses `800`, `850` ou `900` ;
- des titres avec un interlettrage négatif important.

Les majuscules sont acceptables pour une très courte étiquette, mais leur répétition augmente la fatigue visuelle. La British Dyslexia Association recommande d’éviter les majuscules inutiles dans les textes continus et de privilégier une hiérarchie plus sobre.

Il serait préférable de conserver le gras pour les informations réellement importantes et d’utiliser davantage :

- la taille ;
- l’espace blanc ;
- les encadrés ;
- une couleur suffisamment contrastée.

### 7. Certains boutons risquent de mal supporter l’agrandissement du texte

Les boutons de modes et de temps emploient fréquemment :

```css
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

C’est notamment le cas dans les exercices classiques et dans `app/components/exercise/ChatExercise.vue`.

À 200 % de zoom ou avec un espacement personnalisé, certains libellés peuvent être tronqués. Le critère WCAG 1.4.12 exige qu’un réglage utilisateur allant jusqu’à un interligne de 1,5, un espacement de mots de `0.16em` et un espacement de lettres de `0.12em` ne provoque aucune perte de contenu.

Il faudrait permettre aux boutons de :

- passer sur deux lignes ;
- augmenter automatiquement leur hauteur ;
- afficher leur libellé complet sans ellipse.

Référence : [W3C — Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing)

### 8. Les pages d’apprentissage restent assez denses

La page `app/pages/apprendre.vue` est correctement structurée avec des titres et des blocs, mais certaines sections regroupent beaucoup de règles, d’exceptions et de vocabulaire grammatical.

Améliorations possibles :

- afficher une règle à la fois ;
- proposer un résumé « En bref » ;
- permettre d’ouvrir les détails à la demande ;
- ajouter davantage d’exemples visuels ;
- proposer une version audio ;
- éviter les phrases contenant plusieurs propositions.

Le W3C recommande des mots simples, des phrases courtes, des blocs courts et des informations complexes accompagnées d’une version simplifiée.

Référence : [W3C — Clear and Understandable Content](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/)

### 9. Il n’y a pas de lecture vocale intégrée

Aucune fonction de synthèse vocale ou de lecture de la question n’a été trouvée.

Un bouton facultatif « Écouter » pourrait lire :

- la consigne ;
- la personne ;
- le verbe ;
- le temps ;
- les explications du coach.

Il faudrait éviter toute lecture automatique : l’élève doit garder le contrôle.

Une option de dictée pourrait également être pertinente, mais elle devrait être activable par l’enseignant, car elle peut modifier la nature d’un exercice d’orthographe ou de conjugaison.

### 10. L’arrière-plan peut distraire certains élèves

Le décor de montagnes, les ombres, les dégradés et les cartes semi-transparentes donnent une identité agréable au site, mais peuvent produire une charge visuelle inutile.

La British Dyslexia Association recommande des fonds simples, sans motifs distrayants, et laisse à chacun le choix d’un fond clair non éblouissant.

Un « mode calme » pourrait :

- masquer les montagnes ;
- supprimer le parallaxe ;
- réduire les ombres ;
- utiliser des surfaces opaques ;
- employer un fond crème ou bleu très pâle uniforme.

### 11. Quelques problèmes d’accessibilité générale sont à corriger

Ils ne concernent pas uniquement la dyslexie, mais influencent la facilité de navigation :

- aucun lien d’évitement « Aller au contenu » n’a été trouvé ;
- le layout contient déjà un élément `<main>` dans `app/layouts/default.vue`, alors que certaines pages ajoutent un deuxième `<main>`, par exemple `app/pages/apprendre.vue` ;
- une vérification réelle à 200 % et 400 % de zoom reste nécessaire ;
- les combinaisons clair/sombre et tous les états désactivés ne disposent pas encore d’une matrice automatisée de contraste.

Le W3C exige notamment le redimensionnement à 200 % et le reflow à une largeur équivalente à 320 px sans perte de contenu.

Référence : [W3C — Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)

## Priorités recommandées

### Priorité 1 — impact immédiat

1. Supprimer l’interlettrage négatif et augmenter l’interligne des questions.
2. Relever les textes pédagogiques trop petits.
3. Passer les PDF et les documents Word à 12 points minimum.
4. Autoriser les boutons à revenir à la ligne au lieu de tronquer leur contenu.
5. Ajouter un mode « Confort de lecture ».

### Priorité 2 — forte valeur pédagogique

6. Ajouter un mode calme sans décor ni animations.
7. Proposer une lecture vocale facultative.
8. Simplifier et fractionner les aides longues.
9. Permettre de masquer l’historique des bulles dans le chat.
10. Ajouter plusieurs tailles d’impression.

### Priorité 3 — validation

11. Tester le site à 200 % et 400 % de zoom.
12. Appliquer artificiellement les espacements WCAG 1.4.12.
13. Tester le site au clavier et avec VoiceOver ou NVDA.
14. Faire essayer les parcours classique, chat et papier à plusieurs élèves dyslexiques.
15. Ajouter des tests automatisés d’accessibilité à l’intégration continue.

## Synthèse

Le site est déjà mieux conçu que beaucoup d’outils scolaires : parcours progressif, absence de chronomètre, police sans sérif, aides contextualisées, bonne structuration et réduction des mouvements.

Les deux faiblesses principales sont :

1. une typographie parfois trop petite ou trop serrée ;
2. l’absence de personnalisation de la lecture.

La priorité devrait donc être de rendre la typographie principale plus confortable, puis d’offrir un mode « Confort de lecture » configurable plutôt que d’imposer une présentation unique à tous les élèves.

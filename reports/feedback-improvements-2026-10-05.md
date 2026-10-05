# Corrections issues des 26 feedbacks

Les appréciations « utile » sont conservées. Les commentaires sur « Il S » et
« Vous chantez » concernent une tentative précédente : ils ne justifient pas de
modifier les conjugaisons ou d’accepter ces réponses.

## Aides

- La disparition du e des verbes en -ger et de la cédille des verbes en -cer
  cite la première lettre réelle de la terminaison, notamment è dans mangèrent.
- Les impératifs particuliers de être, avoir, savoir et vouloir utilisent leur
  propre radical, sans commencer par la méthode du présent de l’indicatif.
  Les alternatives régulières de vouloir conservent leur méthode.
- L’impératif rappelle explicitement l’accent grave lorsque le radical change.
- Les temps composés expliquent l’assemblage de la phrase avant révélation.
  Le corrigé présente les phrases complètes et les accords acceptés, notamment
  allés/allées. Les réponses finales restent masquées avant la première erreur.
- L’aide condensée omet la définition du verbe et présente la règle du temps avant les détails du groupe,
  replie ces détails et l’accord du participe passé, et rappelle le e de ranger
  devant a/o dans la question concernée.

## Compléments

La comparaison avant/après de la base locale confirme :

- 10 exemples de élever avec construction remplacés par poule ;
- 10 exemples de souffrir avec attente remplacés par douleur ;
- 10 exemples de tomber avec quille désactivés ;
- 3 groupes commençant par de des corrigés : de projets, de manques,
  de personnages fictifs.

Les textes antéposés associés sont également corrigés, avec conservation des
élisions (la douleur, l’autre douleur). Les exemples dictionnairiques restent
inchangés. Le générateur de catalogue ne réintroduit plus les mauvaises amorces
ni la séquence de des. Les réponses et résultats historiques des élèves restent
inchangés.

`server/plugins/feedback-complement-repairs.ts` exécute la migration idempotente
au démarrage avec la connexion MySQL de l’application. Le serveur local en
cours d’exécution l’a déjà appliquée automatiquement ; une nouvelle exécution
ne trouve aucune correction restante.

## Validation

- Tests des aides complètes et condensées, scénarios d’erreurs et reproductions
  des feedbacks : 192 tests réussis.
- Migration testée dans des tables temporaires InnoDB masquant les tables
  réelles : simulation sans écriture, corrections, doublon préexistant,
  conservation des autres exemples et deuxième exécution sans changement.
- Vérification TypeScript et contrôle de syntaxe du générateur.

## Déploiement

Les fichiers doivent être envoyés par le déploiement Git habituel. La base
MySQL distante sera corrigée au prochain démarrage normal de l’application
après déploiement. Les journaux contiendront « Compléments des feedbacks
contrôlés ». Aucune action supplémentaire ni commande de migration dans Plesk.

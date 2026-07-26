# Suivi longitudinal des types d’erreurs

## État : première version réalisée

Le système classe désormais les premières réponses fausses des élèves dans une
taxonomie pédagogique versionnée. Le diagnostic est recalculé côté serveur :
le navigateur ne peut donc pas imposer arbitrairement une catégorie.

Les réponses justes ne sont toujours pas conservées en détail. Elles alimentent
uniquement des compteurs journaliers d’occasions, indispensables pour distinguer
« 8 erreurs sur 10 questions » de « 8 erreurs sur 300 questions ».

## Taxonomie initiale

- confusion de mode ;
- confusion de temps ;
- futur simple à la place du futur proche ;
- forme d’une autre personne ;
- terminaison impossible pour la personne ;
- auxiliaire incorrect ;
- accord avec le sujet ;
- accord avec un COD placé avant ;
- accord indu avec un COD placé après ;
- accord indu avec un COI ;
- accord indu avec avoir sans COD placé avant ;
- terminaison incorrecte ;
- accent incorrect ou manquant ;
- ponctuation ou signe incorrect ;
- forme proche de la réponse ;
- erreur indéterminée.

Une réponse peut recevoir plusieurs catégories. L’une est principale, les
autres secondaires. Chaque catégorie possède un niveau de confiance et la
version du détecteur qui l’a produite.

## Données

- `learner_error_types` : catalogue stable et versionné ;
- `learner_attempt_error_tags` : diagnostics des réponses fausses ;
- `learner_skill_daily_stats` : occasions et erreurs agrégées par jour.

Les tables sont créées et alimentées par une migration idempotente au démarrage.
Aucune opération manuelle ne doit être exécutée dans Plesk.

## Présentation dans « À revoir »

La rubrique « Mes types d’erreurs » montre :

- le taux d’erreur rapporté aux occasions ;
- la tendance entre les 30 derniers jours et les 30 jours précédents ;
- un conseil pédagogique ;
- jusqu’à trois exemples avec réponse donnée et correction ;
- une tendance dominante uniquement lorsque l’échantillon est suffisant.

Une tendance demande au moins trois occasions dans chacune des deux périodes.
Les reprises immédiates ne sont pas comptées comme de nouvelles occasions.

## Limites assumées

- Les statistiques détaillées commencent avec cette version : les anciennes
  réponses ne sont pas rétroclassées automatiquement afin d’éviter une migration
  lourde et des taux artificiellement fixés à 100 %.
- « Terminaison impossible » ne signifie pas automatiquement « mauvaise
  personne ». La catégorie « forme d’une autre personne » n’est utilisée que
  lorsque la réponse correspond exactement à une forme connue.
- Les diagnostics à faible confiance restent classés « indéterminés » et ne
  doivent pas produire d’affirmation pédagogique forte.

## Évolutions possibles

- ajouter un bouton pour générer un micro-défi ciblé sur une catégorie ;
- mesurer séparément la correction immédiate et la mémorisation plusieurs jours
  plus tard ;
- permettre à l’élève de confirmer occasionnellement la cause de son erreur ;
- auditer les erreurs « indéterminées » pour enrichir prudemment la taxonomie ;
- ajouter des filtres par période, défi, verbe, mode et temps.

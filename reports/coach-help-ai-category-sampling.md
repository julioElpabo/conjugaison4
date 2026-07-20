# Échantillonnage IA par catégories pédagogiques

## Principe

Le test aléatoire reste disponible avec `--random-forms=N`, mais il ne garantit pas de couvrir les situations pédagogiques importantes.

Le nouveau mode `--category-forms=N` choisit les formes par couverture de catégories. Il prend les formes qui couvrent le plus de situations encore non testées, puis complète si nécessaire.

Commande recommandée :

```bash
npm run data:review-coach-help-ai -- --reset --category-forms=60 --batch-size=12 --model=gpt-5.5 --reasoning=high
```

Pour reprendre après interruption :

```bash
npm run data:review-coach-help-ai -- --category-forms=60 --batch-size=12 --model=gpt-5.5 --reasoning=high
```

## Ce qui est couvert

Le script calcule des catégories à partir de chaque forme rendue :

- mode et temps ;
- personne ;
- temps simple ou composé ;
- stratégie pédagogique ;
- famille de conjugaison ;
- couche de la file IA : `sample`, `irregular`, `suspicious` ;
- risques pédagogiques connus.

Exemples de risques :

- verbe pronominal ;
- élision avec `je` ;
- terminaison vide ;
- impératif et suppression du pronom ;
- impératif `tu` avec `s` ou sans `s` ;
- choix de l'auxiliaire ;
- accord du participe passé ;
- lettre `g` ;
- lettre `c` et cédille ;
- alternance `é/è` ;
- subjonctif présent à deux formes repères ;
- subjonctif imparfait ;
- conditionnel présent avec radical du futur ;
- formes à mémoriser ;
- référence au passé simple ;
- référence à `ils` ou `nous` au présent.

## État du dernier test technique

Test mock exécuté :

```bash
npm run data:review-coach-help-ai -- --reset --category-forms=60 --batch-size=12 --mock
```

Résultat :

- 60 formes sélectionnées ;
- 88 catégories disponibles ;
- 88 catégories couvertes ;
- 60 unités traitées dans le mock ;
- 0 erreur technique.

Le résumé détaillé est dans :

```txt
reports/coach-help-ai-review-summary.mock.json
```

## Différence avec la campagne complète

`--category-forms=60` sert à faire une revue IA ciblée et rapide.

La campagne complète sans option d'échantillon reste plus exhaustive :

```bash
npm run data:review-coach-help-ai -- --reset --batch-size=12 --model=gpt-5.5 --reasoning=high
```

Elle utilise toute la file IA compacte et sert à attribuer les statuts finaux par verbe.

## Série pédagogique 2 préparée après corrections

Commande à lancer :

```bash
npm run data:review-coach-help-pedagogy-ai -- --reset --category-forms=80 --batch-size=12 --seed=serie-2-apres-corrections --model=gpt-5.5 --reasoning=high
```

Pour reprendre après interruption :

```bash
npm run data:review-coach-help-pedagogy-ai -- --category-forms=80 --batch-size=12 --seed=serie-2-apres-corrections --model=gpt-5.5 --reasoning=high
```

Contrôle mock effectué :

- 80 formes sélectionnées ;
- 86 catégories disponibles ;
- 86 catégories couvertes ;
- 0 doublon avec la série pédagogique précédente de 60 formes.

Répartition :

- indicatif : 34 formes ;
- subjonctif : 25 formes ;
- conditionnel : 11 formes ;
- impératif : 10 formes.

Détail par temps :

- indicatif présent : 12 ;
- indicatif imparfait : 9 ;
- indicatif passé simple : 9 ;
- indicatif futur : 4 ;
- subjonctif présent : 10 ;
- subjonctif imparfait : 15 ;
- conditionnel présent : 11 ;
- impératif présent : 9 ;
- impératif passé : 1.

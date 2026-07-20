# Compte rendu de correction — revue IA de l’aide "Pour allophones"

Généré le 2026-07-20.

## Compte rendu du test IA

Le dernier rapport IA disponible est :

- `reports/coach-help-ai-review-sample-summary.json`
- `reports/coach-help-ai-review-sample-state.json`

Échantillon testé :

- 60 formes contrôlées par catégorie
- 88 catégories couvertes
- 46 formes approuvées
- 14 formes rejetées

## Corrections appliquées

### Données corrigées en base

- `naître`, impératif passé :
  - `aie né` → `sois né` / `sois née`
  - `ayons né` → `soyons nés` / `soyons nées`
  - `ayez né` → `soyez nés` / `soyez nées`
- `présenter`, passé simple, `il` :
  - `présentai` → `présenta`
- `s’habiller`, subjonctif présent :
  - `s’habilles` → `s’habille`
  - `nous habillions` → `nous nous habillions`
  - `vous habilliez` → `vous vous habilliez`
  - `se habillent` → `s’habillent`
- `s’endormir`, subjonctif présent :
  - `nous endormions` → `nous nous endormions`
  - `vous endormiez` → `vous vous endormiez`
- Accents lexicaux et paradigmes corrigés :
  - `denicher` → `dénicher`
  - `deverser` → `déverser`
  - `defier` → `défier`
  - `denommer` → `dénommer`

### Générateur d’aide corrigé

- Les verbes pronominaux au subjonctif présent réaffichent le pronom réfléchi dans les formes repères et dans le résultat.
  - Exemple attendu : `Ils se souviennent`, `Nous nous souvenons`, `se souvienne`.
- La comparaison “la forme demandée est la forme repère” ne supprime plus les accents.
  - Cela évite de confondre `moulut` et `moulût`.
- Le subjonctif imparfait avec `il / elle / on` utilise maintenant une terminaison accentuée explicite :
  - `chatouilla` → radical `chatouill-` + `-ât` → `chatouillât`
  - `moulut` → radical `moul-` + `-ût` → `moulût`
- Les formes pronominales `nous nous ...` / `vous vous ...` sont réduites correctement pour les calculs internes, sans perdre le pronom réfléchi à l’affichage.

### Cas non modifié volontairement

- `déchoir`, conditionnel présent, `tu` :
  - Le test IA a proposé `décherrais`.
  - La base contient `déchoirais`.
  - Statut : non modifié, car les deux graphies sont attestées comme variantes ; ce n’est pas une erreur bloquante de l’aide.

## Ce qui est vérifié et valide

Tests ciblés du moteur d’aide :

```bash
node --import tsx --test tests/conjugation-help.test.mjs tests/radical-reference.test.mjs tests/coach-help-audit.test.mjs
```

Résultat :

- 49 tests passés
- 0 échec

Typecheck :

```bash
npm run typecheck
```

Résultat :

- terminé sans erreur

Audit déterministe complet :

```bash
npm run data:audit-coach-help-semantics -- --help-id=1
```

Résultat :

- 41 185 formes analysées
- 434 verbes
- 2 121 signatures pédagogiques
- 41 143 formes conformes
- 0 à examiner
- 42 erreurs automatiques restantes
- 54 anomalies structurelles dans la base
- 409 verbes approuvés
- 25 verbes à corriger
- file IA régénérée : `reports/coach-help-ai-review-queue.json`
- 4 144 unités IA restantes

Les 14 cas rejetés par le rapport IA ont été recherchés dans le nouvel audit déterministe : aucun de ces 14 cas ne ressort avec une erreur déterministe.

## Ce qui reste à faire

Les 42 erreurs restantes ne sont pas les 14 refus du rapport IA. Elles concernent d’autres formes en base ou d’autres signatures pédagogiques et doivent être traitées dans une passe séparée.

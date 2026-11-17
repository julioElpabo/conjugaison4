# Analyse du signalement de Lise-Marie Moser — 17 novembre 2026

Le constat initial ci-dessous a été reproduit sur le code local. Les corrections ont ensuite été implémentées et vérifiées localement, après autorisation. Aucun déploiement ni aucune réécriture des historiques n'a été effectué.

## Corrections réalisées

- `je ai cru` est refusé avec « Il faut une apostrophe pour l’élision. », accompagné de `je ai` → `j'ai` lorsque le profil montre la correction. `je` et `j’` ne sont plus présentés comme deux personnes différentes.
- `il acouru` et `on aparlé` sont refusés avec « Vérifie les espaces entre les mots. », et les comparaisons `acouru` → `a couru` et `aparlé` → `a parlé`.
- La vérification des frontières entre les mots est limitée à `validateConjugationAnswer`. Le normaliseur historique et `validateAnswer`, utilisés pour les autres comparaisons et exercices de reconnaissance, restent compatibles. Les espaces supplémentaires, les apostrophes de clavier et les représentations Unicode équivalentes sont acceptés.
- Le diagnostic repose sur une réponse admise et sur un reste de phrase exact. Aucune élision n'est inventée devant un h aspiré. Les formes pronominales, le subjonctif et les compléments sont couverts.
- La précision élision/espace survit aux traductions et à la reprise, y compris avec les profils sans correction. Elle utilise le code existant `orthography.punctuation` et un sous-type facultatif, sans migration de base. Le détecteur passe à `1.5.1`.

Contrôles réussis : `npm run test:feedback` (577 tests de non-régression et 308 rendus dans Chrome), typecheck et build. Les trois cas ont aussi été vérifiés sur de vrais questionnaires générés depuis le catalogue local, avant et après passage par les snapshots client/serveur. La comparaison avant/après sur les 489 tentatives archivées n'a changé aucune de leurs décisions de validation. Aucune tentative n'a été enregistrée par ces vérifications.

Les nouveaux tests sont dans `tests/moser-feedback-regressions.test.mjs`, le corpus rendu et le manifeste obligatoire. L'audit rejette désormais aussi un commentaire qui oppose « je » à « je » ou à « j ».

## Constat initial avant correction

| Saisie | Correction attendue | Résultat local reproduit | Origine |
| --- | --- | --- | --- |
| `je ai cru` | `j’ai cru` | Réponse refusée, mais commentaire de personne incohérent : « La forme verbale correspond à “je”, mais tu as écrit le pronom “je”. » | `subjectPronounIssue` distingue lexicalement `je` et `j`, puis utilise le pronom de la question, `je`, pour nommer la personne attendue. |
| `il acouru` | `il a couru` | Réponse acceptée ; aucun diagnostic d'erreur. | La normalisation par défaut enlève tous les espaces : les deux réponses deviennent `ilacouru`. |
| `on aparlé` | `on a parlé` | Réponse acceptée ; aucun diagnostic d'erreur. | La même normalisation transforme les deux réponses en `onaparlé`. |

## 1. Élision

`je` et `j’` représentent la même personne. Le problème doit recevoir une explication d'élision, par exemple : « Devant “ai”, écris “j’ai” : il faut l’élision de “je”. » Le rejet de la réponse est déjà correct ; le diagnostic et son rendu sont à corriger.

Les changements récents ont permis de conserver le sous-type « pronom » dans l'affichage et les traductions. Ils ne traitent pas encore le cas particulier `je`/`j’`. Le message local diffère de celui du courrier, mais conserve la même contradiction. Le nouvel audit doit également vérifier qu'une confusion de personne n'oppose pas deux personnes grammaticales identiques.

## 2. Séparation des mots

Le problème se produit avant le commentaire : le validateur classe déjà la réponse comme correcte. Changer seulement le message du coach ne suffira pas.

La suppression générale des espaces est un comportement historique, explicitement testé dans `tests/answer.test.mjs`. La désactiver globalement modifierait aussi les autres usages de `validateAnswer` : diagnostics, variantes admises, exercices de reconnaissance et comparaisons auxiliaires. La correction proposée doit donc être limitée à la validation des réponses de conjugaison.

Après comparaison tolérante, une vérification des frontières entre les mots peut refuser `acouru` et `aparlé`. Elle doit continuer d'accepter la casse, les apostrophes droites/typographiques, les formes Unicode équivalentes, ainsi que les espaces supplémentaires ou insécables. Il faut distinguer la tolérance aux espaces supplémentaires de l'effacement des frontières entre les mots.

Commentaires proposés : « Sépare l’auxiliaire du participe passé : “a couru”. » et « Il manque un espace : “a parlé”. » Ce diagnostic doit être disponible même si la comparaison historique juge les formes équivalentes ; aujourd'hui `diagnoseLearnerError` retourne immédiatement un résultat vide dans ce cas.

## Correction proposée et contrôles à prévoir

1. Reconnaître l'élision à partir d'une correction admise (`j’…`) et de la saisie (`je …`), sans la classer comme une autre personne. Une simple substitution systématique de `je` par `j’` serait incorrecte, notamment devant un h aspiré.
2. Vérifier les séparations de mots dans `validateConjugationAnswer`, en laissant le normaliseur partagé et ses autres consommateurs compatibles.
3. Ajouter une explication structurée d'élision ou d'espace, conserver cette précision dans les langues, la sauvegarde et la reprise, et respecter les profils qui ne montrent pas la correction.
4. Ajouter les trois exemples du courrier au corpus permanent lors de leur correction, avec `j'ai cru`, `j’ai cru`, `il a couru`, `on a parlé` et les espaces multiples/insécables comme cas corrects. Couvrir aussi `j'ai`, les formes pronominales et les phrases avec complément. Interdire explicitement le diagnostic « je au lieu de je » et tout résultat « correct » pour les deux fusions de mots signalées.
5. Rejouer `npm run test:feedback`, les contrôles du validateur, les rendus classiques et conversationnels, puis comparer les décisions avant/après sur les cas archivés. Les changements attendus de validation doivent être documentés ; les scores et historiques déjà enregistrés ne doivent pas être réécrits.

Ces deux problèmes sont désormais corrigés dans le code local. Leur correction sur le site public nécessite la publication normale de cette version ; elle n'a pas été effectuée pendant cette intervention.

## Annuler uniquement ce correctif

Le patch suivant restaure l'état précédant le correctif Moser, en conservant le contrôle obligatoire et les améliorations antérieures. Vérifier d'abord son applicabilité ; si la vérification échoue à cause de changements ultérieurs, ne pas forcer.

```sh
git apply --reverse --check docs/rollback/moser-feedback-2026-11-17.patch
git apply --reverse docs/rollback/moser-feedback-2026-11-17.patch
```

Le patch a été vérifié dans des copies temporaires, dans les deux sens. Après annulation, repasser `npm run test:feedback`. Le présent fichier retrouvera son état d'analyse initial ; le patch peut rester présent.

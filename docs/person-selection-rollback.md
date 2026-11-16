# Choix des personnes et retour arrière

Évolution du 16 novembre 2026. Révision de départ : `cbce9dec26d9ee550bdb5246388ef06fc6b6baae`.

## Fonctionnement

- Les six personnes sont sélectionnées par défaut. Une sélection comme « je, tu, vous » s’applique à tous les temps du défi.
- La dernière personne cochée ne peut pas être décochée. « Toutes les personnes » rétablit la sélection complète.
- Les troisièmes personnes regroupent il/elle et ils/elles ; les options on et iel/iels continuent de déterminer les variantes proposées.
- Les personnes indisponibles ne sont pas remplacées : l’impératif ne propose que tu/nous/vous et un impersonnel conserve il. Les formes sans personne restent disponibles.
- La sélection est conservée dans les défis partagés et les historiques élèves. La sélection complète est omise du JSON, comme avant.
- Les anciens défis conservent leur restriction historique au passé simple et au passé antérieur. Une indication et un bouton permettent de la retirer explicitement. Modifier les personnes adopte le nouveau réglage général.
- Aucune migration de base de données, aucune modification des défis existants, aucun déploiement dans le cadre de cette intervention.
- Le correcteur accepte déjà les variantes d’apostrophes ; son fonctionnement est conservé et des tests couvrent les claviers mobiles.

## Retour à l’ancienne interface, compatible avec les défis enregistrés

Dans `shared/config/feature-flags.ts`, passer :

```ts
export const PERSON_SELECTION_ENABLED = false
```

Les nouveaux défis retrouvent la case « Uniquement il / ils » et ne présentent plus le sélecteur de personnes. Les défis enregistrés avec une sélection spécifique restent lisibles et leur sélection reste visible et modifiable. Le filtrage enregistré est conservé.

Remettre `true` réactive le sélecteur. Il n’y a aucune restauration de données à effectuer.

Pour publier cette bascule, utiliser les fichiers versionnés et le circuit habituel : `git push`, déploiement et redémarrage normaux dans Plesk. Laisser les actions supplémentaires de Plesk vides.

## Annulation complète du code local avant publication

Le fichier `docs/rollback-person-selection.patch` contient uniquement les changements de cette intervention, nouveaux fichiers compris. Depuis la racine du projet :

```sh
git apply --reverse --check docs/rollback-person-selection.patch
git apply --reverse docs/rollback-person-selection.patch
```

La première commande vérifie la compatibilité sans modifier les fichiers. Si elle échoue après d’autres modifications, ne pas forcer : utiliser la bascule ou adapter l’annulation aux changements intervenus. Après annulation, le fichier patch reste disponible pour réappliquer les changements avec `git apply docs/rollback-person-selection.patch`.

Si des défis avec une sélection spécifique ont déjà été enregistrés, privilégier la bascule : le code antérieur à cette évolution ne connaît pas le nouveau champ JSON `personIds`. Un retour intégral à l’ancien code demanderait alors une adaptation de lecture pour conserver ces défis, sans les réécrire.

## Vérifications

- 95 tests ciblés de validation, partage, suivi, correction et diversité réussis.
- 10 tests avec la base MySQL locale, uniquement en lecture : conjugaison, identification, futur proche, verbes pronominaux, impératif, impersonnels, infinitif, anciens défis, citations et exercices mixtes.
- Build de production et vérification TypeScript.
- Les composants Vue réels ont été montés dans Chrome avec leur CSS : sélection, clavier, dernière case, réinitialisation, ancienne restriction, largeurs 1440/320/375 px, thème sombre et deux états de l’interrupteur. Ces contrôles de composants ne constituent pas un parcours complet du site déployé.

Commandes reproductibles pour les tests ciblés :

```sh
node --import tsx --test tests/challenge-persons.test.mjs tests/challenge-validation.test.mjs tests/answer.test.mjs tests/question-diversity.test.mjs tests/learner-identification-history.test.mjs tests/mixed-exercise.test.mjs tests/infinitive-identification.test.mjs
node --env-file-if-exists=.env --import tsx --test tests/challenge-persons-database.test.mjs
npm run typecheck
npm run build
```

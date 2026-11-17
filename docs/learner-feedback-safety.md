# Commentaires après une réponse incorrecte — 17 novembre 2026

Les premières corrections décrites ici concernent l’explication pédagogique, sans modifier le validateur, les points ni les historiques. Elles ont introduit le détecteur `1.5.0`. Le correctif Moser ajouté ensuite vérifie aussi la séparation des mots dans les réponses de conjugaison et introduit `1.5.1` ; voir `analyse-signalement-moser.md`. Aucune migration ni nouvelle dépendance n’est nécessaire et les anciens tags ne sont pas recalculés en base.

## Comportement

- `il racroche` → « Il manque un c : raccroche. » et comparaison visuelle des mots.
- Une faute dans `les marrons` ne devient plus une confusion de personne. Le raccourci nous/ils utilise le verbe, son radical commun, le futur simple et les personnes concernées.
- `prie/pris`, `mie/mis`, `miss/mis` et `alléss/allés` ne deviennent plus des erreurs d’accord. Les accords sont vérifiés dans les flexions du participe de base. Sans cette donnée dans un ancien questionnaire, le repli reste prudent.
- Les informations du radical, du participe, de la voix et des auxiliaires survivent à la préparation côté client et à la sauvegarde côté serveur. Le serveur reconstruit la transformation du radical ; il ne se fie pas au seul indicateur `validated` reçu.
- Une faute dans le pronom conserve son explication précise dans les sept variantes de langue. Les profils sans correction masquent la nouvelle indication du mot et de la lettre attendus.
- Un premier commentaire est visible ; un bouton accessible au clavier ouvre les autres. Tous restent conservés dans les détails de la tentative. Les sélecteurs sombres des deux composants sont limités aux commentaires.

## Contrôles et limites

Depuis l'activation du contrôle obligatoire, utiliser `npm run test:feedback` avant publication. Il regroupe les anciens et nouveaux cas et active également Chrome, sans accepter de test ignoré. Le fonctionnement et la réconciliation des anciennes attentes sont décrits dans `feedback-release-gate.md`.

`auditRenderedLearnerFeedback` vérifie le texte rendu, les sous-types de pronom, les preuves des lettres et terminaisons annoncées, les flexions d’accord lorsque le participe est connu et les données de correction des profils sans réponse. Cet audit fonctionne dans les tests ; il ne crée pas de signalement automatique en production et ne remplace pas une relecture pédagogique.

Le corpus couvre désormais onze situations, dont les trois exemples de Mme Moser, sept variantes de langue et quatre profils, soit 308 rendus contrôlés dans Chrome sur les vrais composants Vue (huit situations et 224 rendus initialement). Le test navigateur vérifie aussi le clavier, le repli, une largeur de 320 px, les couleurs sombres et le commutateur de retour à l’affichage complet.

```sh
node --import tsx --test tests/learner-feedback-safety.test.mjs tests/learner-feedback-audit.test.mjs tests/coach-stem-feedback.test.mjs tests/learner-error-diagnostics.test.mjs tests/coach-construction-feedback.test.mjs tests/learner-identification-history.test.mjs
FEEDBACK_BROWSER_TESTS=1 node --import tsx --test tests/learner-feedback-browser.test.mjs
npm run typecheck
npm run build
```

Le test navigateur est désactivé par défaut : il nécessite Chrome/Chromium. Il utilise uniquement des données de test et ne contacte pas la base. Les captures sont annoncées dans son résultat.

La relecture locale des 489 tentatives archivées a conservé les 489 décisions de validation. Trois diagnostics passent d’accord à forme du participe : `as miss`, `avez acquie`, `sont alléss`. Cette vérification est une simulation ; aucun historique n’a été réécrit. Les anciens questionnaires privés d’informations grammaticales peuvent encore recevoir une explication générale.

## Retour en arrière

Pour réafficher immédiatement toutes les explications ensemble, mettre `PROGRESSIVE_ERROR_FEEDBACK_ENABLED = false` dans `shared/config/feature-flags.ts`. Cela conserve les corrections grammaticales.

Pour annuler l’ensemble des modifications de cette intervention, le patch suivant restaure l’état au début de l’intervention, en conservant le correctif antérieur de `racroche` et son test. Depuis le dossier du projet :

```sh
git apply --reverse --check docs/rollback/learner-feedback-2026-11-17.patch
git apply --reverse docs/rollback/learner-feedback-2026-11-17.patch
```

Exécuter la seconde commande seulement si la vérification réussit. Si des changements ultérieurs entrent en conflit, ne pas forcer : revenir par un commit ciblé ou adapter le patch. Le patch ne touche ni la base, ni les fonctionnalités de sélection des personnes, ni l’import des verbes. Ce document et le patch peuvent rester présents après annulation.

Ce patch correspond à l'intervention initiale, avant l'ajout du contrôle obligatoire. Une annulation qui retire ses fichiers de tests devra être réconciliée avec le manifeste actuel ; une référence à un test manquant bloque volontairement la publication. Repasser `npm run test:feedback` après tout retour en arrière.

Le déploiement reste celui du projet : fichiers versionnés, `git push`, puis déploiement et redémarrage normaux dans Plesk, sans action supplémentaire.

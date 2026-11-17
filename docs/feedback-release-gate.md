# Contrôle obligatoire des feedbacks avant publication

Commande : `npm run test:feedback`.

Elle rejoue les anciens et nouveaux tests de réponses, de diagnostics, d'aides complètes et condensées, de traductions et de reprises, puis le test des vrais composants Vue dans Chrome. Le navigateur est activé explicitement par le lanceur : son absence produit un échec. Le bilan doit contenir au moins un test, tous réussis, aucun test ignoré, annulé ou marqué à faire. Aucun paramètre ne permet de sauter une étape.

Les suites du manifeste `scripts/lib/feedback-test-gate.mjs` ne se connectent pas à MySQL. Aucun déploiement n'est déclenché par cette commande. Les tests sur le catalogue réel restent des audits complémentaires, exécutés séparément avec la configuration locale de la base.

`scripts/release-plesk.sh` installe les dépendances et lance ce contrôle sur `main`, avant `git add`, le commit et tout push. Un échec arrête le script. Les rendus Chrome couvrent sept variantes de langue et quatre profils, le clavier, une largeur de 320 px, le thème sombre et le retour à l'affichage complet des commentaires.

Cette obligation s'applique à la commande de publication du projet. Un `git push` exécuté directement reste techniquement possible : aucun contrôle d'hébergement ou de protection de branche distant n'a été installé par cette intervention.

## Règle pour les prochaines corrections

Chaque bug corrigé doit être conservé comme cas de non-régression. Ajouter les nouveaux fichiers au manifeste, rejouer tous les anciens, vérifier les diagnostics qui doivent être présents et ceux qui doivent être absents. Les attentes existantes ne peuvent être affaiblies sans justification pédagogique documentée. Un signalement encore en analyse reste décrit comme non corrigé ; son comportement erroné ne devient pas une attente positive permanente. Ces consignes figurent dans `AGENTS.md`.

Le test `tests/feedback-release-gate.test.mjs` vérifie notamment qu'un échec du contrôle interrompt le véritable script de publication avant tout commit ou push. Il le fait dans un dossier temporaire avec des commandes Git/npm simulées, sans effet sur le dépôt ni le serveur.

## Réconciliation de quatre anciennes attentes lors de l'activation

Le nouveau contrôle inclut aussi `coach-condensed-help-audit.mjs` et `coach-complete-help-audit.mjs`. Ces fichiers ne sont pas inclus par le motif ordinaire `tests/*.test.mjs`.

Leur première exécution a donné quatre échecs. Aucun scénario n'a été retiré et aucun texte pédagogique de l'application n'a été changé pour les résoudre :

- **Falloir et pleuvoir** : les attentes cherchaient littéralement « radical du futur » ; le texte dit « radical repère du futur », avec le même sens. Le contrôle accepte l'adjectif et continue d'exiger le radical du futur et les formes repères.
- **Écrire au futur** : une ancienne attente imposait la recette « sans le e final ». L'aide actuelle du troisième groupe utilise une forme repère, pour éviter d'étendre une recette mécanique à tous les verbes irréguliers. L'attente exige maintenant explicitement le radical repère du futur, l'ajout de la terminaison de la personne et les formes repères. Le contrôle d'absence de la réponse finale est maintenu.
- **Prendre au passé simple** : la fixture portait `prit - t = pri`, puis `pri + rent`. Le tableau de la même aide présentait les terminaisons usuelles en `-is, -it, -irent`, incohérentes avec cette ancienne segmentation. Elle utilise maintenant `prit - it = pr`, puis `pr + irent = prirent`, comme le générateur actuel. L'attente du mot « passé simple », déjà fourni par le contexte de la question, est remplacée par le contrôle concret de « il prit », du retrait de `-it` et du tableau complet de la série en i. Un test supplémentaire reconstruit exactement `prirent` avec la référence du générateur. Le contrôle d'absence de la réponse finale est maintenu.

Les signalements de Mme Moser ont ensuite été corrigés avec des tests permanents supplémentaires. Le détail est dans `analyse-signalement-moser.md`. Le contrôle actuel comprend ces corrections : 577 tests de non-régression et 308 rendus dans Chrome.

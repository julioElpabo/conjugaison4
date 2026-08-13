# Prompt — intégrer Azure Speech avec Ariane et Fabrice

Utilise ce document comme prompt autonome pour reprendre ultérieurement l’intégration de la synthèse vocale Azure dans le projet `conjugaison4`.

## Objectif

Remplacer, dans les exercices, la synthèse vocale variable du navigateur par les voix neuronales suisses de Microsoft Azure Speech :

- toutes les coachs femmes utilisent `fr-CH-ArianeNeural` ;
- tous les coachs hommes utilisent `fr-CH-FabriceNeural`.

La génération doit fonctionner à la demande, mettre durablement les fichiers audio en cache et rester strictement dans le niveau gratuit Azure Speech F0. Le passage au niveau payant S0 ne doit jamais être automatique.

## Commencer par un audit

Avant toute modification :

1. Lire les consignes du fichier `AGENTS.md` du projet.
2. Examiner l’état actuel de :
   - `app/components/exercise/ClassicExercise.vue` ;
   - `app/components/exercise/ChatExercise.vue` ;
   - `app/composables/useLearnerProgress.ts` ;
   - `shared/types/conjugation.ts` ;
   - `shared/i18n/ui-messages.ts` ;
   - les routes serveur, la configuration runtime et les migrations de démarrage existantes.
3. Préserver les modifications déjà présentes dans le dépôt et ne pas réécrire les comportements sans rapport avec cette intégration.
4. Vérifier dans la documentation Microsoft que les identifiants des voix, les quotas, les réponses d’erreur et les modalités du niveau F0 sont toujours valables au moment de l’implémentation.

## Comportement fonctionnel attendu

### Génération et cache

Lorsqu’une personne clique sur un porte-voix :

1. Le serveur détermine la voix à partir du genre du coach.
2. Il calcule une clé de cache stable comprenant au minimum :
   - l’identifiant de la voix Azure ;
   - le texte exact à prononcer ;
   - la vitesse, la hauteur et les pauses demandées ;
   - une version du format audio et des réglages, afin de pouvoir invalider proprement un ancien cache.
3. Si le fichier existe déjà, il est lu sans appeler Azure.
4. S’il n’existe pas et que la génération est disponible, le serveur appelle Azure une seule fois, enregistre le résultat dans un stockage persistant, puis sert ce fichier.
5. Deux requêtes simultanées pour la même clé ne doivent jamais générer deux fichiers : ajouter un verrou ou une promesse partagée par clé.

Le cache doit survivre aux redémarrages et aux déploiements. Ne pas compter sur un répertoire temporaire. Documenter l’emplacement retenu, sa sauvegarde et sa taille. Ne jamais versionner les fichiers audio générés ni les secrets Azure.

### Prononciation lente

La lecture actuelle sépare clairement chaque mot avec une pause de 420 ms. Conserver ce comportement avec Azure, de préférence en générant une seule séquence SSML contenant une pause entre chaque mot, plutôt qu’en effectuant une requête Azure par mot.

Exemple attendu :

`tu` — 420 ms — `as` — 420 ms — `pu`

Échapper correctement le texte inséré dans le SSML.

### Quota F0

Le système doit utiliser une ressource Azure Speech configurée explicitement en F0.

- Ne jamais basculer automatiquement vers S0.
- Conserver un compteur local mensuel prudent des caractères envoyés à Azure.
- Considérer Azure comme la source définitive : si l’API renvoie une erreur de quota, marquer immédiatement la génération comme indisponible.
- Mémoriser la date et la cause de la désactivation.
- Réactiver la génération au nouveau cycle mensuel, avec une vérification sûre plutôt qu’une supposition silencieuse.
- Prévoir une marge avant 500 000 caractères afin d’éviter de dépasser le quota à cause de requêtes simultanées ou d’un décalage du compteur.
- Ajouter des journaux utiles sans texte pédagogique sensible ni secret.

### Visibilité des boutons

Ne pas afficher un bouton qui aboutira certainement à une erreur.

Le serveur doit fournir au client un état d’accessibilité pour la combinaison voix/phrase demandée :

- `cached` : le fichier est disponible ;
- `generatable` : le fichier n’est pas en cache, mais Azure peut encore le générer ;
- `unavailable` : aucune génération ne doit être tentée.

Décision produit à confirmer juste avant l’implémentation :

- comportement strict initialement demandé : lorsque le quota est épuisé, masquer tous les boutons Azure dans les exercices, y compris ceux dont le fichier est déjà en cache ;
- comportement recommandé : continuer à proposer les fichiers déjà en cache, puisqu’ils ne consomment plus Azure, et masquer uniquement les phrases absentes du cache.

Ne pas remplacer silencieusement Ariane ou Fabrice par une voix du navigateur si le quota Azure est épuisé, sauf demande explicite ultérieure.

## Emplacements actuels des boutons

Préserver les règles d’interface déjà décidées :

- exercice classique : écoute après l’erreur et dans le bilan ;
- bilan : chaque phrase disponible peut être réécoutée ;
- ne jamais ajouter de lecture aux options de réponse d’un défi ;
- chat avec aide `complete` ou `complete-avec-reponses` : afficher le petit porte-voix dans une bulle de la couleur du coach, immédiatement après les deux bulles de consigne ;
- cette bulle doit avoir la même hauteur qu’un message du coach sur une seule ligne ;
- chat avec aide `tres-condensee` : conserver la proposition d’écoute uniquement après le long délai d’inactivité ;
- avec les aides complètes, ne pas répéter le porte-voix après « Tu veux consulter la conjugaison du verbe… ».

Lorsqu’une réponse est écoutée avant sa validation :

- conserver `answerWasHeard` ;
- ne pas compter cette tentative comme une réponse autonome correcte ;
- la signaler correctement dans le bilan et dans l’historique.

## Architecture de sécurité

- Tous les appels Azure doivent passer par le serveur Nuxt/Nitro.
- Ne jamais envoyer la clé Azure au navigateur.
- Ne jamais écrire la clé, l’endpoint ou un jeton dans Git, dans le cache audio, dans les journaux ou dans une réponse d’API.
- Lire les secrets depuis des variables d’environnement serveur clairement documentées, par exemple :
  - `AZURE_SPEECH_KEY` ;
  - `AZURE_SPEECH_REGION` ou un endpoint équivalent ;
  - `AZURE_SPEECH_CACHE_DIR` si un cache fichier persistant est retenu.
- Valider et limiter la longueur des textes reçus par les routes serveur.
- Ne pas permettre au client de choisir arbitrairement une voix Azure ou de transformer la route en service public de synthèse de texte libre.
- La route doit accepter une question/réponse autorisée par l’application ou une référence signée, puis reconstruire le texte côté serveur autant que possible.
- Ajouter une limitation de débit et tenir compte de la limite de concurrence du niveau F0.

## Stockage et déploiement Plesk

Respecter impérativement les règles permanentes du projet :

- aucun script ou aucune action manuelle après déploiement dans Plesk ;
- aucune commande dans les « Actions de déploiement supplémentaires » ;
- aucun secret MySQL ou Azure dans les fichiers versionnés ;
- si une table de suivi du cache ou du quota est nécessaire, fournir une migration idempotente exécutée au démarrage normal de l’application, quand la connexion MySQL est disponible ;
- le déploiement doit reposer uniquement sur les fichiers versionnés, `git push`, le déploiement normal et le redémarrage normal de l’application.

## Résilience

- Si Azure est momentanément indisponible, ne pas confondre cette panne avec un quota mensuel épuisé.
- Retourner un état d’erreur sobre et accessible ; ne pas laisser le bouton bloqué en chargement.
- Réessayer uniquement les erreurs temporaires avec un nombre limité de tentatives et un délai progressif.
- Ne pas réessayer automatiquement une erreur de quota.
- Si l’enregistrement du fichier échoue, ne pas déclarer le fichier comme mis en cache.
- Vérifier l’intégrité et le type MIME du fichier avant de le servir.

## Suivi administratif minimal

Prévoir une vue ou, au minimum, des métriques serveur permettant de connaître :

- les caractères générés pendant le cycle courant ;
- la marge restante estimée ;
- le nombre de fichiers et la taille totale du cache ;
- le taux de succès du cache ;
- la date de la dernière génération Azure réussie ;
- la date et la cause d’une éventuelle désactivation ;
- le nombre d’erreurs temporaires et d’erreurs de quota.

Ne pas exposer ces informations sensibles aux visiteurs ordinaires.

## Tests et critères d’acceptation

Ajouter des tests automatisés couvrant au minimum :

1. Ariane est choisie pour tous les coachs de genre `female`.
2. Fabrice est choisi pour tous les coachs de genre `male`.
3. Une phrase déjà en cache ne déclenche aucun appel Azure.
4. Deux demandes simultanées identiques ne produisent qu’un appel Azure.
5. Une nouvelle phrase est générée, enregistrée puis relue depuis le cache.
6. Les pauses de 420 ms sont présentes entre tous les mots.
7. Une erreur de quota désactive les nouvelles générations sans passage à S0.
8. Une panne temporaire ne marque pas le quota comme épuisé.
9. Les boutons sont masqués ou conservés conformément à la décision produit sur les fichiers déjà en cache.
10. Une réponse écoutée avant validation reste exclue du score autonome.
11. Aucun bouton d’écoute n’apparaît parmi les options du défi.
12. La clé Azure n’apparaît ni dans le code client, ni dans les réponses réseau, ni dans les journaux.
13. Les libellés accessibles et les quatre traductions de l’interface restent complets.

Exécuter au minimum :

- `git diff --check` ;
- `npm run typecheck` ;
- les tests unitaires ciblés du chat, du questionnaire classique, du bilan, de l’historique, de l’i18n et des nouvelles routes Azure ;
- une vérification manuelle du rendu clair/sombre, sur ordinateur et mobile ;
- un test réel du cache, d’une erreur Azure simulée et de l’absence de secret côté navigateur.

## Livraison attendue

À la fin :

1. Résumer l’architecture mise en place.
2. Lister les fichiers modifiés.
3. Indiquer les variables d’environnement à configurer sans donner de valeur secrète.
4. Donner les résultats des tests.
5. Expliquer précisément le comportement lorsque le quota est épuisé.
6. Ne proposer aucune action ou aucun script supplémentaire après le déploiement Plesk ; demander uniquement le déploiement normal, le redémarrage normal et la vérification des journaux.


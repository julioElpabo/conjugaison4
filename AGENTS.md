# Consignes permanentes du projet

## Non-régression des réponses, aides et feedbacks

- Toute correction d'un bug de validation, d'aide ou de commentaire doit ajouter un cas de non-régression permanent avec le comportement pédagogique attendu. Le test doit aussi vérifier l'absence du diagnostic erroné lorsqu'il y a lieu.
- Rejouer les anciens cas avec les nouveaux via `npm run test:feedback`. Cette commande inclut les rendus Chrome, les langues, les profils d'aide, le clavier et le mobile. Un échec, un test ignoré ou un navigateur indisponible bloque la publication.
- Ajouter les nouveaux fichiers concernés au manifeste de `scripts/lib/feedback-test-gate.mjs` ; ne pas retirer les anciens pour faire passer le contrôle.
- Ne pas affaiblir une attente existante pour accepter le nouveau comportement sans justification pédagogique explicite et documentée.
- `scripts/release-plesk.sh` exécute obligatoirement ce contrôle avant tout commit ou envoi. Ne pas ajouter d'option pour le contourner. Une compilation réussie ne remplace pas ce contrôle.
- Un signalement en cours d'analyse reste documenté comme non corrigé ; ne pas figer le comportement erroné comme résultat attendu d'un test permanent.

## Déploiement Plesk

- Ne jamais proposer d’action ou de script après déploiement dans Plesk.
- La commande `bash scripts/deploy-plesk.sh ../tmp/restart.txt` n’est pas acceptée par ce serveur.
- Laisser les « Actions de déploiement supplémentaires » de Plesk vides.
- Un déploiement doit reposer sur les fichiers versionnés envoyés par `git push`, puis sur le déploiement et le redémarrage normaux dans Plesk.

## Base de données sur Plesk

- Ne jamais demander de lancer une migration avec « Run script » dans Plesk.
- Les variables d’environnement Plesk ne sont pas accessibles depuis les commandes de déploiement ou « Run script ».
- Toute évolution qui exige une mise à jour de la base doit fournir une variante dans les fichiers envoyés par `git push`.
- Cette variante doit de préférence être une migration idempotente exécutée au démarrage de l’application, où la connexion MySQL du site est disponible.
- Ne jamais placer d’identifiants ou de mots de passe MySQL dans les fichiers versionnés.
- Après déploiement, demander seulement le redémarrage normal de l’application et la vérification des journaux.

# Consignes permanentes du projet

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

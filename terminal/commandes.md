# Commandes utiles — retours sur les aides automatiques

## Préparer ou mettre à jour la table des retours

À lancer après une installation, une mise à jour du projet, ou un déploiement.

```bash
npm run data:migrate-coach-help-feedback
```

Cette commande crée ou met à jour la table `coach_help_feedback`.

Elle ajoute notamment les colonnes qui gardent le contexte complet :

- session de chat ;
- exercice en cours ;
- question précise ;
- réponses déjà données ;
- messages du chat ;
- aide affichée en JSON et en HTML ;
- contexte d’affichage ;
- statut de modération.

## Retirer des retours sans les supprimer définitivement

À utiliser quand un retour n’a pas de valeur exploitable, par exemple :

- message incompréhensible ;
- contenu insultant ;
- contenu nauséabond ;
- clic sans intérêt pédagogique ;
- remarque manifestement inutile.

```bash
npm run data:moderate-coach-help-feedback -- --remove --ids=12,15 --reason="contenu insultant ou sans valeur"
```

Cette commande ne supprime pas les lignes de la base.

Elle marque les retours comme retirés :

- `moderation_status = 'removed'` ;
- `moderation_note` contient la raison ;
- `moderated_at` indique la date de modération ;
- `deleted_at` indique que le retour ne doit plus être pris en compte.

## Restaurer un retour retiré

À utiliser si un retour a été retiré par erreur ou s’il redevient utile après vérification.

```bash
npm run data:moderate-coach-help-feedback -- --restore --ids=12 --reason="restauré après vérification"
```

Cette commande remet le retour en statut actif :

- `moderation_status = 'active'` ;
- `deleted_at = NULL` ;
- `moderation_note` garde la raison de restauration.

## Remarques pratiques

- Remplacer `12,15` par les identifiants réels des retours à traiter.
- Les identifiants correspondent à la colonne `id` de `coach_help_feedback`.
- Pour traiter un seul retour, utiliser par exemple `--ids=12`.
- Pour traiter plusieurs retours, séparer les ids par des virgules, sans espace : `--ids=12,15,18`.

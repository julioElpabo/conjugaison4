# Mise à jour courante de la production Plesk

Cette procédure sert à publier sur `conjugaison.tatitotu.ch` une nouvelle
version déjà développée, testée et commitée sur la branche `main`.

Elle conserve la séparation suivante :

```text
main           → sources de développement, sans .output
plesk-release  → sources validées + build .output prêt à exécuter
```

## Conditions préalables

Avant de commencer :

1. toutes les modifications voulues doivent être commitées sur `main` ;
2. les tests doivent avoir été effectués sur `main` ;
3. `main` doit avoir été envoyé sur GitHub avec `git push origin main` ;
4. le dépôt de travail ne doit contenir aucune modification non commitée ;
5. la branche `plesk-release` doit déjà avoir été créée une première fois.

Vérification conseillée :

```bash
# Se placer sur la branche de développement.
git switch main

# Vérifier que le dépôt ne contient aucune modification non commitée.
git status

# Sauvegarder les derniers commits de main sur GitHub.
git push origin main
```

## Préparer et envoyer la nouvelle version

Exécuter les commandes suivantes depuis la racine du projet :

```bash
# Quitter la branche de développement et ouvrir la branche réservée au paquet Plesk.
git switch plesk-release

# Intégrer dans plesk-release tous les nouveaux commits validés de main.
git merge --no-edit main

# Réinstaller exactement les dépendances inscrites dans package-lock.json.
npm ci

# Construire l’application Nuxt et recréer entièrement le dossier .output.
npm run build

# Ajouter de force tout le nouveau build, y compris les créations et suppressions,
# car .output reste volontairement exclu par .gitignore sur main.
git add -f -A .output

# Enregistrer le nouveau paquet exécutable dans l’historique de plesk-release.
git commit -m "build: actualiser le paquet Plesk"

# Sauvegarder la branche et son build sur GitHub, sans déployer le site.
git push origin plesk-release

# Envoyer la branche construite au dépôt Plesk de conjugaison.tatitotu.ch.
git push plesk-production plesk-release

# Revenir sur main afin que les prochains développements ne modifient pas
# directement la branche de production.
git switch main
```

## Terminer le déploiement dans Plesk

Après le push vers `plesk-production` :

1. ouvrir le dépôt `conjugaison.git` dans Plesk ;
2. vérifier que la branche sélectionnée est `plesk-release` ;
3. vérifier que le chemin de déploiement est
   `/conjugaison-production` ;
4. laisser les actions de déploiement supplémentaires vides ;
5. cliquer sur le bouton normal de déploiement ;
6. effectuer le redémarrage normal de l’application ;
7. vérifier les journaux Node.js, la connexion à la base `conjugaison4` et les
   migrations automatiques.

Ne jamais lancer de script après déploiement dans Plesk.

## En cas de conflit pendant la fusion

Si `git merge --no-edit main` signale un conflit, ne pas poursuivre avec
`npm ci` ou `npm run build`.

Résoudre d’abord le conflit, vérifier le résultat et terminer le commit de
fusion. La construction et le push ne doivent reprendre que lorsque :

```bash
git status
```

ne signale plus aucun conflit.

## Si le build ne change pas

Pour une modification limitée à la documentation, il est possible que
`npm run build` ne produise aucun changement dans `.output`. Dans ce cas,
`git commit` peut répondre qu’il n’y a rien à commiter. Il suffit alors
d’envoyer la branche si la fusion de `main` a déjà créé un commit :

```bash
git push origin plesk-release
git push plesk-production plesk-release
git switch main
```


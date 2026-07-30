Pour enregistrer les modifs et faire des commits et push

## Méthode automatisée

Depuis n’importe quel dossier du terminal :

```bash
deploy-conjugaison
```

Le script demande la description du commit, puis exécute automatiquement les
points 1 et 2 ci-dessous. Il s’arrête immédiatement si une commande échoue. Le
redémarrage normal de Node.js reste à effectuer dans Plesk.

## Méthode manuelle

1. Enregistrer la modification sur main
git switch main
git status
git add .
git commit -m "description de la modification"
git push origin main

2. Préparer le paquet Plesk
git switch plesk-release
git merge --no-edit main
npm ci
npm run build
git add -f -A .output
git commit -m "build: actualiser le paquet Plesk"
git push origin plesk-release
git push plesk-production plesk-release
git switch main

3. Terminer dans Plesk
Si le dépôt est toujours en mode Manual :
ouvrir Git pour conjugaison.tatitotu.ch ;
vérifier la branche plesk-release ;
cliquer sur Deploy now;
effectuer le redémarrage normal de Node.js ;
vérifier les journaux et le site.
Ne lancez aucune commande dans Plesk et laissez les actions supplémentaires vides.

# Acquisition d’un corpus littéraire

Cette procédure sert de référence pour ajouter une œuvre au réservoir de phrases de conjugaison.

## Règles obligatoires

- Utiliser une œuvre française du domaine public et enregistrer l’auteur, le titre, l’édition, l’URL Wikisource et la justification du domaine public.
- Retenir uniquement des phrases complètes de 4 à 32 mots et de 280 caractères au maximum. Favoriser une longueur proche de 16 mots afin de garder du contexte sans produire de questions difficiles à lire.
- Supprimer les marques de dialogue isolées et leur espace au début d’une réplique (`— Ils répondirent…` ou `» Ils répondirent…` devient `Ils répondirent…`) avant de calculer les positions de la forme ciblée. Répéter la normalisation si elles sont combinées (`» — Ils répondirent…`).
- Ne jamais proposer un auxiliaire comme verbe principal : si une forme simple d’`avoir` ou d’`être` est immédiatement suivie d’un participe passé connu, l’analyse au temps simple est exclue.
- Appliquer la même exclusion lorsqu’un adverbe court sépare l’auxiliaire du participe (`est donc parti`, `fut bientôt arrêté`). Les participes absents du catalogue des verbes sont recensés dans `shared/data/literary-extra-past-participles.json` et ce lexique doit être complété lors de chaque audit.
- Lorsqu’une forme composée reconnue englobe une forme simple, conserver uniquement la forme composée.
- Ne conserver qu’une occurrence d’un même texte normalisé pour une combinaison `verbe + temps + personne`, même si la forme apparaît plusieurs fois dans la phrase ou dans l’œuvre.
- Conserver au maximum 10 propositions par combinaison `verbe + temps + personne`, toutes œuvres confondues.
- Pour éviter que les formes courantes étouffent les formes rares, limiter aussi le total validé + candidat par combinaison `verbe + temps + personne` : 2 à l’indicatif présent, à l’imparfait et au passé simple ; 3 au passé composé et au futur. Ne pas appliquer cette réduction aux autres modes ni aux temps rares (notamment subjonctif imparfait et plus-que-parfait, conditionnel passé, futur antérieur et passé antérieur).
- Pour départager les candidates excédentaires, préférer une analyse sûre, une phrase proche de 16 mots et une diversité d’œuvres. Classer les autres comme `rejected` avec une note automatique, sans suppression définitive.
- Importer toutes les analyses au statut `candidate`. Une phrase ne devient utilisable dans les exercices qu’après sa validation dans l’administration.
- Ne jamais écraser une décision prise manuellement dans l’administration.

## Étapes d’acquisition

1. Vérifier le statut juridique de l’œuvre et trouver sa page `Texte entier` sur Wikisource.
2. Lancer l’extracteur depuis la racine du projet en renseignant toutes les métadonnées :

   ```sh
   node --env-file=.env scripts/import-literary-corpus.mjs \
     --output=shared/data/literary-corpus-NOM.json \
     --source-key=cle-stable-auteur-oeuvre-annee \
     --author='Auteur' \
     --title='Titre' \
     --edition='Édition utilisée' \
     --source-url='URL_DE_LA_PAGE_WIKISOURCE' \
     --api-url='https://fr.wikisource.org/w/api.php?action=parse&page=NOM_DE_PAGE/Texte_entier&prop=text&format=json&formatversion=2' \
     --public-domain-basis='Justification du domaine public.' \
     --candidate-limit=10
   ```

3. Importer le nouveau JSON dans `server/plugins/literary-corpus-migration.ts` et l’ajouter au tableau `seeds`.
4. Ajouter le fichier à la liste `corpora` de `tests/literary-corpus.test.mjs` et compléter la liste attendue des auteurs.
5. Vérifier manuellement quelques exemples de temps simples, de temps composés, de formes homographes et de phrases contenant deux fois le même verbe. Rechercher particulièrement les formes d’`avoir` et d’`être` suivies d’un mot ou d’un adverbe puis d’un participe ; compléter le lexique supplémentaire si le verbe manque au catalogue.
6. Exécuter les contrôles :

   ```sh
   node --import tsx --test tests/literary-corpus.test.mjs tests/literary-corpus-admin.test.mjs tests/print-question.test.mjs tests/tense-identification-question.test.mjs
   npm run typecheck
   npm run build
   git diff --check
   ```

7. Démarrer normalement l’application pour laisser la migration idempotente importer le corpus, puis vérifier dans `/fr/admin/phrases` les compteurs, les sources et les statuts.

## Contrôle final attendu

- zéro temps composé caché classé comme temps simple ;
- zéro doublon de texte pour un même verbe, temps et personne ;
- maximum 10 phrases validées pour chaque combinaison ;
- aucune accumulation de candidates courantes au détriment des modes et temps rares ;
- provenance complète pour chaque phrase ;
- aucune phrase utilisée automatiquement avant sa validation humaine.

## Formulation à donner dans une nouvelle conversation

> Ajoute une nouvelle œuvre au corpus littéraire en suivant intégralement `docs/acquisition-corpus-litteraire.md`. Applique les règles sur les temps composés cachés, les doublons et la limite de 10, puis régénère, importe et vérifie la base.

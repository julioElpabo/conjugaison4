# Rapport SEO et audience à fournir pour l’analyse de TATITOTU

## Objectif

Ce document décrit les données à réunir pour permettre une analyse fiable de
l’audience, du référencement et de l’utilisation de TATITOTU. Le rapport doit
permettre de répondre notamment aux questions suivantes :

- comment les visiteurs découvrent-ils le site ?
- quelles pages attirent réellement du trafic depuis les moteurs de recherche ?
- quelles recherches offrent une possibilité de progression ?
- les nouvelles pages de défis officiels et de conjugaison FLE sont-elles
  découvertes et indexées ?
- d’anciennes URL divisent-elles encore le trafic ou l’autorité SEO ?
- les visiteurs commencent-ils puis terminent-ils les exercices ?
- quelles langues, quels pays et quels appareils faut-il prioriser ?
- les variations observées sont-elles réelles ou causées par le suivi des
  données ?

Le rapport ne doit contenir aucune donnée personnelle, adresse électronique,
adresse IP, identifiant de compte ou information permettant d’identifier un
utilisateur.

## 1. Formats à fournir

Fournir idéalement les trois éléments suivants :

1. un PDF lisible donnant une vue d’ensemble ;
2. les tableaux exportés au format CSV, indispensables pour trier, regrouper et
   calculer précisément les données ;
3. quelques captures de Google Search Console pour les rapports qui ne peuvent
   pas être exportés complètement, notamment l’indexation et les Core Web
   Vitals.

Nom conseillé pour l’ensemble :

`tatitotu-seo-analytics-AAAA-MM-JJ`

Chaque page du PDF doit afficher :

- la source : GA4, Search Console ou statistiques internes TATITOTU ;
- la période exacte ;
- le fuseau horaire utilisé, de préférence `Europe/Zurich` ;
- les filtres appliqués ;
- le nom exact de la métrique ;
- l’éventuelle comparaison utilisée.

## 2. Périodes à comparer

Préparer deux vues :

### Suivi récent

- les 28 derniers jours complets ;
- comparaison avec les 28 jours précédents.

### Tendance SEO

- les 3 derniers mois complets ;
- comparaison avec les 3 mois précédents ;
- si les données existent, comparaison avec la même période de l’année
  précédente.

Ne pas mélanger dans un même graphique des périodes différentes sans
l’indiquer clairement. Éviter d’inclure la journée en cours dans une comparaison
quotidienne, car elle est incomplète.

## 3. Google Analytics 4 — synthèse générale

Afficher pour la période et la période de comparaison :

- utilisateurs actifs ;
- nouveaux utilisateurs ;
- sessions ;
- sessions avec engagement ;
- taux d’engagement ;
- durée d’engagement moyenne par utilisateur ;
- vues ;
- vues par session ;
- exercices commencés ;
- exercices terminés ;
- taux de fin des exercices, si disponible ;
- réponses envoyées, si disponible.

Ajouter une courbe quotidienne avec, au minimum :

- utilisateurs actifs ;
- sessions ;
- exercices commencés ;
- exercices terminés.

Signaler les dates de déploiement ou de changement important afin de pouvoir
interpréter les ruptures de tendance.

## 4. GA4 — acquisition

Fournir deux tableaux distincts afin de ne pas confondre l’acquisition initiale
et l’origine d’une session.

### Acquisition des utilisateurs

Dimensions :

- premier groupe de canaux principal de l’utilisateur ;
- première source et premier support de l’utilisateur.

Métriques :

- nouveaux utilisateurs ;
- utilisateurs actifs ;
- taux d’engagement.

### Acquisition du trafic

Dimensions :

- groupe de canaux principal de la session ;
- source et support de la session.

Métriques :

- sessions ;
- utilisateurs actifs ;
- sessions avec engagement ;
- taux d’engagement ;
- durée d’engagement moyenne ;
- exercices commencés et terminés, si disponibles.

Exporter au moins les 100 premières lignes. Conserver notamment les valeurs
`(direct)`, `(none)`, `(not set)`, `code`, `custom` et `preset` afin que leur
origine puisse être contrôlée.

## 5. GA4 — pages de destination

Utiliser la dimension « Page de destination + chaîne de requête » et fournir :

- sessions ;
- utilisateurs actifs ;
- nouveaux utilisateurs ;
- sessions avec engagement ;
- taux d’engagement ;
- durée d’engagement moyenne par session ;
- exercices commencés ;
- exercices terminés ;
- taux de fin, si possible.

Exporter au moins 250 lignes.

Le tableau doit permettre d’identifier séparément :

- `/fr/`, `/accueil` et `/fr/accueil` ;
- les pages `/fr/exercices...` ;
- les pages `/fr/modes...` ;
- les anciennes URL `/defi/CODE` ;
- `/fr/defis` ;
- `/fr/conjugaison-fle` ;
- les pages des défis officiels `/fr/defis/...` ;
- les équivalents allemands, anglais, italiens et espagnols.

## 6. GA4 — contenu consulté

Utiliser la dimension « Chemin de la page et classe de l’écran » sans la chaîne
de requête et fournir :

- vues ;
- utilisateurs actifs ;
- vues par utilisateur ;
- durée d’engagement moyenne ;
- nombre de sorties, si disponible.

Exporter au moins 250 lignes. Ajouter, si possible, un second tableau regroupé
par section : accueil, exercices, consultation, apprentissage, défis officiels,
défis partagés, comptes et administration.

## 7. GA4 — pays, langues et appareils

### Pays

Pour les 30 premiers pays :

- utilisateurs actifs ;
- nouveaux utilisateurs ;
- sessions ;
- taux d’engagement ;
- exercices commencés ;
- exercices terminés.

### Langues de l’interface

Pour `fr`, `de`, `en`, `it` et `es` :

- utilisateurs ;
- sessions ;
- exercices commencés ;
- exercices terminés ;
- taux de fin.

### Appareils

Pour ordinateur, mobile et tablette :

- utilisateurs ;
- sessions ;
- taux d’engagement ;
- durée d’engagement moyenne ;
- exercices commencés ;
- exercices terminés.

Ajouter navigateur et système d’exploitation seulement si une différence
importante apparaît.

## 8. Statistiques internes de TATITOTU

Depuis `/admin/charts`, fournir pour la même période :

- sessions suivies par le site ;
- visiteurs anonymes et comptes connectés ;
- évolution du total des comptes ;
- comptes actifs sur la période sélectionnée ;
- connexions réussies et échouées ;
- exercices commencés et terminés ;
- réponses envoyées et taux de réussite ;
- utilisation des défis préfabriqués ;
- utilisation des défis officiels publiés ;
- reprise des erreurs ;
- fonctions utilisées après connexion ;
- langues réellement utilisées pour faire un exercice.

Ces données doivent servir à contrôler la cohérence de GA4, pas à être
additionnées aux données GA4.

## 9. Google Search Console — performances globales

Dans le type de recherche « Web », fournir :

- clics ;
- impressions ;
- CTR moyen ;
- position moyenne ;
- courbe quotidienne avec comparaison de période.

Indiquer clairement :

- la propriété Search Console utilisée ;
- le pays filtré, ou l’absence de filtre ;
- l’appareil filtré, ou l’absence de filtre ;
- le filtre de recherche éventuel ;
- si les requêtes anonymisées ont été exclues automatiquement par Google.

## 10. Search Console — requêtes

Exporter le nombre maximal de lignes disponible avec :

- requête ;
- clics ;
- impressions ;
- CTR ;
- position moyenne.

Préparer également quatre vues filtrées :

1. requêtes contenant `tatitotu` et ses variantes ;
2. requêtes contenant `défi`, `defi`, `jeu` ou `générateur` ;
3. requêtes contenant `conjugaison`, `verbe`, un temps ou un mode ;
4. requêtes contenant `FLE`, `français langue étrangère` ou leurs équivalents
   dans les autres langues.

Le CSV complet reste nécessaire même si ces vues figurent dans le PDF.

## 11. Search Console — pages

Exporter toutes les pages avec :

- URL exacte ;
- clics ;
- impressions ;
- CTR ;
- position moyenne.

Créer ensuite des groupes distincts :

- anciennes pages d’accueil ;
- anciennes URL `/defi/CODE` ;
- pages générales d’exercices ;
- pages consacrées aux temps et aux modes ;
- bibliothèque `/fr/defis` et ses traductions ;
- pages de défis officiels ;
- page de conjugaison FLE et ses traductions.

Pour les 30 pages ayant le plus d’impressions, fournir aussi les principales
requêtes associées à chaque page. Cette correspondance requête-page est
essentielle pour repérer la concurrence entre deux pages du site.

## 12. Search Console — pays et appareils

Fournir deux tableaux :

### Pays

- clics ;
- impressions ;
- CTR ;
- position moyenne.

### Appareils

- ordinateur ;
- mobile ;
- tablette ;
- mêmes quatre métriques.

Ces tableaux doivent utiliser exactement la même période que les tableaux de
requêtes et de pages.

## 13. Search Console — indexation

Fournir une capture et les nombres affichés dans « Indexation des pages » :

- pages indexées ;
- pages non indexées ;
- détail de chaque motif d’exclusion ;
- date de la dernière actualisation.

Ouvrir et documenter en priorité les motifs suivants s’ils existent :

- page avec redirection ;
- autre page avec balise canonique correcte ;
- doublon sans URL canonique sélectionnée ;
- explorée, actuellement non indexée ;
- détectée, actuellement non indexée ;
- erreur 404 ou 404 logicielle ;
- bloquée par `robots.txt` ;
- exclue par `noindex`.

Pour chaque motif significatif, fournir quelques URL d’exemple.

## 14. Search Console — sitemap

Pour `https://conjugaison.tatitotu.ch/sitemap.xml`, fournir :

- statut de lecture ;
- date de la dernière lecture ;
- nombre d’URL découvertes ;
- erreurs éventuelles ;
- capture du détail.

Vérifier dans le sitemap la présence de :

- `/fr/defis` et ses traductions ;
- `/fr/conjugaison-fle` et ses traductions ;
- toutes les pages publiées des défis officiels ;
- leurs variantes `hreflang`.

## 15. Search Console — expérience

Fournir les synthèses suivantes pour mobile et ordinateur :

- Core Web Vitals ;
- HTTPS ;
- actions manuelles ;
- problèmes de sécurité.

Pour les Core Web Vitals, indiquer le nombre d’URL « bonnes », « à améliorer »
et « lentes », puis fournir les groupes d’URL concernés.

## 16. Inspection manuelle de quelques URL

Utiliser l’outil d’inspection d’URL pour les adresses suivantes :

- `https://conjugaison.tatitotu.ch/fr/` ;
- `https://conjugaison.tatitotu.ch/fr/exercices-de-conjugaison` ;
- `https://conjugaison.tatitotu.ch/fr/defis` ;
- `https://conjugaison.tatitotu.ch/fr/conjugaison-fle` ;
- une page de défi officiel FLE ;
- une page de défi officiel scolaire ;
- une ancienne URL `/defi/CODE` qui reçoit encore des clics ;
- `/accueil` et `/fr/accueil`.

Pour chacune, noter :

- URL connue ou inconnue de Google ;
- autorisation d’indexation ;
- dernière exploration ;
- URL canonique déclarée par le site ;
- URL canonique choisie par Google ;
- page référente ou sitemap de découverte, si affiché.

## 17. Redirections et anciennes URL

Ajouter un tableau de contrôle contenant :

| Ancienne URL | Statut HTTP | Destination | Canonique finale | Clics Search Console | Impressions | Décision |
|---|---:|---|---|---:|---:|---|

Inclure au minimum :

- `/accueil` ;
- `/fr/accueil` ;
- `/ancien/` ;
- les anciennes pages de temps ou modes qui apparaissent encore dans Search
  Console ;
- les URL `/defi/CODE` ayant des clics ou des impressions.

Ne décider aucune suppression ni redirection massive uniquement à partir du
PDF. Une URL historique qui reçoit du trafic doit être étudiée individuellement.

## 18. Questions de qualité des données

Le rapport doit préciser :

- la date de mise en place de GA4 ;
- les changements récents de balise Analytics ;
- les domaines exclus des sites référents ;
- l’existence éventuelle d’un filtre de trafic interne ;
- la durée de conservation des données GA4 ;
- les événements déclarés comme événements clés ;
- la signification exacte des sources `code`, `custom` et `preset` ;
- si le consentement aux cookies limite une partie de la mesure ;
- si des robots ou des outils de surveillance peuvent être comptabilisés ;
- les dates des principaux déploiements SEO.

## 19. Présentation recommandée du PDF

1. couverture avec site, période, comparaison et date de génération ;
2. résumé exécutif avec cinq indicateurs et cinq constats maximum ;
3. audience et engagement GA4 ;
4. acquisition GA4 ;
5. pages de destination et contenus ;
6. exercices et parcours internes ;
7. Search Console : évolution globale ;
8. requêtes ;
9. pages ;
10. correspondance entre requêtes et pages ;
11. langues, pays et appareils ;
12. indexation, sitemap et Core Web Vitals ;
13. anciennes URL et redirections ;
14. anomalies de mesure ;
15. conclusions et actions proposées.

Éviter les pages composées uniquement d’un grand tableau sans titre ni
conclusion. Une carte doit toujours préciser sa métrique et sa période. Les
colonnes ne doivent pas être tronquées dans l’export PDF.

## 20. Ensemble minimal si le temps manque

Si tout le rapport ne peut pas être produit, fournir au minimum :

- PDF GA4 avec période et comparaison ;
- CSV des sources/supports de session ;
- CSV des pages de destination ;
- CSV Search Console des requêtes ;
- CSV Search Console des pages ;
- capture de l’indexation des pages ;
- capture du sitemap ;
- inspection de `/fr/conjugaison-fle`, `/fr/defis`, `/accueil` et d’une ancienne
  URL `/defi/CODE` ;
- dates des derniers déploiements importants.

Avec cet ensemble minimal, il sera déjà possible d’établir des priorités SEO
argumentées sans confondre les utilisateurs GA4, les sessions, les clics Search
Console et les statistiques internes du site.

## 21. Fréquence de suivi

- rapport léger : une fois par mois ;
- rapport complet : une fois par trimestre ;
- contrôle spécial : quatre à six semaines après un déploiement SEO important.

Conserver les anciens exports afin de pouvoir comparer les recommandations aux
résultats réellement obtenus.

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
- pourquoi le site semble-t-il presque absent d'Afrique francophone, de
  l'outre-mer français et d'Océanie francophone ?
- cette absence vient-elle réellement des nomenclatures scolaires, ou plutôt
  de l'indexation, du positionnement, du domaine en `.ch`, de l'autorité du
  site, de l'expérience mobile ou de la mesure d'audience ?
- les internautes recherchent-ils effectivement des variantes comme `SIL`,
  `CP1`, `CI` ou `5e année primaire`, et quelles pages Google leur présente-t-il
  aujourd'hui ?
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

### Diagnostic international à faible volume

- les 6 derniers mois complets ;
- si possible, les 12 ou 16 derniers mois pour Search Console ;
- aucune comparaison obligatoire si le volume par pays est trop faible ;
- signaler séparément la date de mise en production des pages de défis
  officiels, afin de ne pas attribuer à ces pages une période pendant laquelle
  elles n'existaient pas encore en production.

Cette vue longue est nécessaire : un pays absent des 30 premières lignes sur
28 jours peut tout de même produire quelques impressions utiles sur une année.

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

Ajouter un second tableau qui conserve explicitement les pays et territoires
francophones étudiés, même lorsqu'ils ne figurent pas parmi les 30 premiers :

- Sénégal ;
- Côte d'Ivoire ;
- Cameroun ;
- République démocratique du Congo ;
- République du Congo ;
- Bénin ;
- Togo ;
- Burkina Faso ;
- Mali ;
- Niger ;
- Gabon ;
- Madagascar ;
- Maurice ;
- La Réunion ;
- Nouvelle-Calédonie ;
- Polynésie française ;
- Canada, avec le Québec lorsqu'une ventilation infranationale fiable est
  disponible.

Pour chaque ligne, distinguer `0` d'une valeur absente ou non communiquée par
GA4. Conserver le libellé exact renvoyé par GA4 afin d'éviter de fusionner par
erreur un territoire avec son État de rattachement.

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

Préparer également cinq vues filtrées :

1. requêtes contenant `tatitotu` et ses variantes ;
2. requêtes contenant `défi`, `defi`, `jeu` ou `générateur` ;
3. requêtes contenant `conjugaison`, `verbe`, un temps ou un mode ;
4. requêtes contenant `FLE`, `français langue étrangère` ou leurs équivalents
   dans les autres langues ;
5. requêtes scolaires contenant notamment `CP`, `CE1`, `CE2`, `CM1`, `CM2`,
   `6e`, `CI`, `CP1`, `CP2`, `SIL`, `année primaire`, `niveau primaire`,
   `premier groupe`, `1er groupe`, `présent`, `imparfait`, `passé composé` ou
   `futur`.

Pour la cinquième vue, produire si possible les croisements suivants :

- requête et pays d'origine ;
- requête et page affichée ;
- requête, pays et appareil mobile/ordinateur ;
- requêtes scolaires avec impressions mais sans clic ;
- requêtes scolaires pour lesquelles la position moyenne est déjà inférieure
  à 20, car elles constituent des occasions plus réalistes qu'un mot-clé encore
  totalement absent.

Ne pas déduire la demande d'une simple liste de mots-clés plausible. Une
expression comme `conjugaison SIL` doit être considérée comme une hypothèse
tant qu'elle n'apparaît pas dans Search Console ou dans une étude de mots-clés
distincte et documentée.

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

En plus du classement général, reprendre la liste des pays et territoires
francophones de la section 7. Pour chacun, indiquer l'un des états suivants :

- impressions et clics mesurés ;
- impressions sans clic ;
- aucune ligne communiquée par Search Console ;
- données trop faibles ou anonymisées pour conclure.

Ajouter, pour les principaux pays étudiés, les dix premières requêtes et les
dix premières pages. Le pays doit être celui où la recherche a été effectuée,
et non la localisation supposée du serveur ou du domaine.

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
- la page française consacrée au CM2 ;
- une page de défi fondée sur une notion ou une famille de verbes plutôt que
  sur un niveau scolaire ;
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
- les dates des principaux déploiements SEO ;
- la date à laquelle les 38 défis officiels et leurs publications SEO ont été
  réellement accessibles en production, distincte de leur date de préparation
  dans le dépôt ;
- la présence éventuelle d'un CDN, le pays d'hébergement et les problèmes de
  disponibilité observés depuis l'étranger ;
- les différences de mesure entre pays liées au consentement ou au blocage des
  scripts Analytics.

## 19. Diagnostic spécifique du référencement francophone international

Le rapport doit tester plusieurs hypothèses concurrentes. Il ne doit pas partir
du principe que les nomenclatures scolaires expliquent à elles seules l'absence
d'audience.

### Hypothèse A — nomenclatures et intentions scolaires

Vérifier si les recherches comportant `SIL`, `CI`, `CP1`, `CP2`, `5e année
primaire` ou des formulations proches existent réellement et si TATITOTU reçoit
des impressions pour elles.

Cette hypothèse est plausible, mais seulement partielle : `CE1`, `CE2`, `CM1`
et `CM2` sont déjà employés dans plusieurs systèmes africains. Une page utile
sur le CM2 peut donc répondre à plusieurs pays sans contenir leur nom.

### Hypothèse B — ciblage géographique du domaine

Documenter le fait que `.ch` est un domaine national suisse. Google considère
les domaines nationaux comme un signal fort de destination géographique. Ce
signal n'interdit pas un classement international, mais il peut favoriser la
Suisse face à des domaines génériques ou locaux.

Comparer, dans Search Console :

- la part des impressions suisses et non suisses ;
- la position moyenne de requêtes comparables en Suisse, en France, au Canada
  et dans les pays africains disposant d'assez de données ;
- le CTR hors de Suisse, afin de voir si le `.ch` réduit aussi la confiance ou
  l'attractivité du résultat.

Référence méthodologique :
<https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites>.

Ne recommander aucune migration de domaine à partir de ce seul signal. Une
éventuelle migration vers un domaine générique nécessiterait une étude séparée,
des redirections permanentes et l'absence totale de miroir concurrent.

### Hypothèse C — découverte, indexation et autorité

Vérifier si les pages internationales supposées utiles :

- existent réellement en production ;
- répondent en HTTP 200 sans authentification ;
- sont présentes dans le sitemap lu par Google ;
- ont été explorées et indexées ;
- reçoivent des liens internes HTML ;
- obtiennent des impressions ;
- disposent de liens externes ou de mentions provenant de sites éducatifs.

Une page sans impression ne souffre pas nécessairement d'un mauvais mot-clé :
elle peut être trop récente, non indexée, insuffisamment maillée ou manquer
d'autorité par rapport aux ressources scolaires déjà établies.

### Hypothèse D — mobile, connectivité et usage

Pour les pays concernés, comparer si possible :

- part du mobile ;
- engagement mobile ;
- exercices commencés et terminés ;
- Core Web Vitals et erreurs côté navigateur ;
- poids de la première page et temps avant interaction, si une mesure fiable
  est disponible.

Ne pas présenter les contraintes de connexion comme une explication acquise.
Elles deviennent pertinentes seulement si des visiteurs arrivent puis
abandonnent davantage sur mobile ou sur certains territoires.

### Hypothèse E — mesure et taille de l'échantillon

Contrôler si « aucun visiteur » signifie réellement zéro ou seulement :

- absence du pays dans un classement limité aux premières lignes ;
- trafic masqué par le consentement ou un bloqueur ;
- données regroupées dans `(not set)` ;
- volume trop faible pour apparaître dans Search Console ;
- période d'observation trop courte ;
- territoire classé sous un autre libellé.

La Réunion et le Québec doivent servir de cas de contrôle. La Réunion utilise
largement les nomenclatures françaises : son absence éventuelle affaiblit donc
l'explication par les seuls noms de niveaux. À l'inverse, un peu de trafic au
Québec malgré une nomenclature différente montre que d'autres signaux peuvent
permettre la découverte du site.

### Hypothèse F — profondeur, originalité et fiabilité pédagogique

Auditer un échantillon représentatif des 38 défis officiels et de leurs
publications dans les cinq langues. Pour chaque page étudiée, relever :

- quantité de contenu pédagogique visible avant le lancement de l'exercice ;
- caractère spécifique ou au contraire très répétitif de la description ;
- notions, temps, modes et verbes explicitement nommés ;
- liens vers des règles, exercices ou ressources complémentaires ;
- éventuelle concurrence avec une page `/exercices/[parcours]` visant la même
  intention ;
- source utilisée pour affirmer qu'un défi correspond à un programme scolaire.

Une page techniquement indexable peut rester peu compétitive si elle ne propose
qu'un court texte interchangeable. Inversement, il ne faut pas enrichir toutes
les pages avec des variations artificielles : sélectionner d'abord celles qui
reçoivent déjà des impressions ou répondent à une demande documentée.

Signaler expressément les affirmations scolaires fondées sur une source privée
ou secondaire. Avant d'étendre ces correspondances à d'autres pays, confronter
les niveaux français existants à des textes institutionnels et conserver, pour
chaque alignement international, la source et sa date de validité.

## 20. Matrice d'interprétation obligatoire

Le résumé exécutif doit classer chaque marché étudié dans l'une des situations
suivantes :

| Observation | Interprétation prioritaire | Action à étudier |
|---|---|---|
| Aucune impression Search Console | Découverte, indexation, autorité, ciblage géographique ou demande absente | Vérifier indexation, maillage, domaine et demande avant d'ajouter des pages |
| Impressions mais position faible | Pertinence ou autorité insuffisante | Enrichir la page utile et rechercher des liens ou partenariats légitimes |
| Position correcte mais CTR faible | Résultat peu attractif ou domaine peu rassurant | Tester titre, description et compréhension du `.ch` |
| Clics Search Console sans sessions GA4 cohérentes | Problème possible de mesure | Auditer consentement, balise et filtres |
| Sessions sans exercice commencé | Problème possible d'adéquation ou d'ergonomie | Examiner page d'entrée, mobile et compréhension de l'offre |
| Exercices commencés mais rarement terminés | Difficulté, performance ou expérience pédagogique | Analyser abandon, erreurs et appareils |

Une action SEO ne doit être proposée qu'après avoir identifié la ligne qui
correspond aux données observées.

## 21. Cadre de décision pour les niveaux scolaires internationaux

Si les données confirment une demande scolaire internationale, privilégier un
défi canonique unique enrichi de correspondances pédagogiques vérifiées. Ne pas
créer automatiquement une page par pays avec seulement le nom du pays qui
change.

Avant d'intégrer une correspondance, réunir :

- système scolaire ou programme exact, et pas seulement le pays ;
- autorité ou source institutionnelle ;
- version ou année du programme ;
- code et libellé complet du niveau ;
- notions, temps, modes et verbes réellement attendus ;
- nature de l'alignement : apprentissage, consolidation ou révision ;
- justification éditoriale et date de vérification.

Commencer par un pilote limité, par exemple Sénégal, Côte d'Ivoire et
Cameroun, avec quelques défis réellement alignés. Le contenu visible de la page
peut alors présenter naturellement un tableau de repères scolaires, sans créer
de nouvelle URL géographique.

Les affirmations de programme doivent être contrôlées à partir de sources
officielles. Il faut notamment distinguer une nomenclature confirmée d'une
équivalence pédagogique : deux classes portant le même nom ne suivent pas
nécessairement la même progression.

Ne créer une page régionale distincte que si elle apporte une différence utile
et substantielle de contenu ou de fonctionnalité. Les pages presque identiques
visant des requêtes géographiques proches risquent de devenir des pages de
passage ou du contenu produit à grande échelle sans valeur propre.

## 22. Présentation recommandée du PDF

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
12. diagnostic des marchés francophones internationaux ;
13. test des hypothèses de nomenclature, domaine, autorité et mobile ;
14. indexation, sitemap et Core Web Vitals ;
15. anciennes URL et redirections ;
16. anomalies de mesure ;
17. matrice d'interprétation ;
18. conclusions et actions proposées.

Éviter les pages composées uniquement d’un grand tableau sans titre ni
conclusion. Une carte doit toujours préciser sa métrique et sa période. Les
colonnes ne doivent pas être tronquées dans l’export PDF.

## 23. Ensemble minimal si le temps manque

Si tout le rapport ne peut pas être produit, fournir au minimum :

- PDF GA4 avec période et comparaison ;
- CSV des sources/supports de session ;
- CSV des pages de destination ;
- CSV Search Console des requêtes ;
- CSV Search Console des pages ;
- CSV Search Console des pays ;
- vue Search Console filtrée sur les requêtes scolaires et les pays
  francophones prioritaires ;
- capture de l’indexation des pages ;
- capture du sitemap ;
- inspection de `/fr/conjugaison-fle`, `/fr/defis`, `/accueil` et d’une ancienne
  URL `/defi/CODE` ;
- dates des derniers déploiements importants.

Avec cet ensemble minimal, il sera déjà possible d’établir des priorités SEO
argumentées sans confondre les utilisateurs GA4, les sessions, les clics Search
Console et les statistiques internes du site.

## 24. Fréquence de suivi

- rapport léger : une fois par mois ;
- rapport complet : une fois par trimestre ;
- contrôle spécial : quatre à six semaines après un déploiement SEO important.

Conserver les anciens exports afin de pouvoir comparer les recommandations aux
résultats réellement obtenus.

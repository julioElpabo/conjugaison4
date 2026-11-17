# Import des verbes FLE du 17 novembre 2026

## Choix de mise en œuvre

Un script idempotent est préférable à un SQL isolé : il vérifie les sources et les données déjà présentes, conserve les variantes admises, ajoute les emplois pronominaux à leur catalogue propre et refuse les conflits au lieu d’écraser une entrée.

Le lot a été appliqué à la base locale. Aucun déploiement en production ni `git push` n’a été effectué.

## Demande et résultat

- 42 lignes reçues, 41 sélections distinctes ; « conseiller » est demandé deux fois.
- 41 verbes de base nécessaires, dont « entendre » déjà présent.
- Ajouts : 40 verbes de base, 3 840 coordonnées conjuguées, 9 emplois pronominaux, 51 sens et 51 liens sémantiques.
- Les huit bases non demandées seules (maquiller, peigner, retrouver, connecter, garer, promener, énerver et disputer) sont nécessaires aux emplois pronominaux. Elles sont également utilisables sans pronom dans le catalogue.
- 96 coordonnées finies valides par verbe : pas de fausses personnes à l’impératif. Le futur proche et les formes non finies sont construits par le moteur existant.

## Audit avant insertion

Les données ne proviennent pas d’une génération libre des conjugaisons par une IA. Les tableaux de l’Académie ont été extraits, puis les temps simples et les participes ont été comparés au lexique Morphalou 3.1 (ATILF-CNRS).

- 1927 coordonnées simples et participes contrôlées avec les deux sources.
- 3936 coordonnées finies préparées et contrôlées dans le lot de 41 bases.
- 2 091 coordonnées composées recomposées et comparées aux auxiliaires et accords attendus.
- 864 coordonnées pronominales calculées par le moteur réel ; 768 ont un tableau Académie pour comparaison directe.
- Pour « se connecter », l’Académie fournit la base, mais pas le tableau pronominal : l’emploi est attesté par l’OQLF et le tableau est disponible chez Larousse. Les formes sont dérivées par le moteur réfléchi existant, sans table Académie prétendue.
- Les trois différences ci-dessous ne sont pas des erreurs : ce sont des variantes officielles présentes dans le tableau de l’Académie et non trouvées dans les coordonnées correspondantes du fichier Morphalou.

| Verbe | Temps/personne | Variante conservée | Référence |
|---|---|---|---|
| épeler | 14/4 | épellerais | [Académie](https://www.dictionnaire-academie.fr/conjuguer/A9E2140) |
| posséder | 14/4 | posséderais | [Académie](https://www.dictionnaire-academie.fr/conjuguer/A9P3586) |
| régler | 14/4 | réglerais | [Académie](https://www.dictionnaire-academie.fr/conjuguer/A9R1342) |

Le sceau SHA-256 du lot est vérifié avant import. Toute modification du contenu impose de régénérer et refaire l’audit. Le contrôle par une seconde IA n’est pas nécessaire pour cette validation ; il pourrait servir de relecture complémentaire des définitions, pas de référence faisant autorité.

Les définitions sont originales, rédigées pour le site et contrôlées pour leur cohérence avec les sens des sources. Les niveaux CECRL sont des estimations éditoriales, pas un classement officiel de l’Académie. Aucun nouveau jeu de compléments COD/COI n’est inventé par cet import.

Cas particuliers : « épeler », « posséder » et « régler » conservent les variantes traditionnelles et rectifiées. « revenir » utilise être ; « retourner » conserve les deux constructions. « convenir » distingue convenir à (avoir) et convenir de (être), avec acceptation des deux modèles en l’absence de contexte. Les emplois pronominaux ont leur propre définition, l’auxiliaire être et les accords appropriés à l’emploi retenu.

## Sources du lot

- [Morphalou 3.1, archive officielle ORTOLANG](https://repository.ortolang.fr/api/content/morphalou/4/Morphalou3.1_formatCSV_toutEnUn.zip), licence LGPL-LR.
- [Rectifications orthographiques, Académie française](https://www.dictionnaire-academie.fr/annexes/orthographes-recommandees).
- [Se connecter : terminologie OQLF](https://vitrinelinguistique.oqlf.gouv.qc.ca/fiche-gdt/fiche/506934/ouvrir-une-session).
- [Se connecter : conjugaison Larousse](https://www.larousse.fr/conjugaison/francais/se%20connecter/9506).

| Base | Définition du site | Source | Tableau |
|---|---|---|---|
| épeler | Dire les lettres d’un mot une par une, dans leur ordre. | [article](https://www.dictionnaire-academie.fr/article/A9E2140) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9E2140) |
| planter | Mettre une plante ou une graine dans la terre pour la faire pousser. | [article](https://www.dictionnaire-academie.fr/article/A9P2749) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9P2749) |
| décrire | Dire ou écrire comment est une personne, une chose ou un lieu. | [article](https://www.dictionnaire-academie.fr/article/A9D0648) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9D0648) |
| posséder | Avoir une chose qui nous appartient. | [article](https://www.dictionnaire-academie.fr/article/A9P3586) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9P3586) |
| coûter | Avoir un prix ou demander une certaine somme d’argent. | [article](https://www.dictionnaire-academie.fr/article/A9C4693) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9C4693) |
| détester | Ne pas aimer du tout une personne, une chose ou une activité. | [article](https://www.dictionnaire-academie.fr/article/A9D2110) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9D2110) |
| fermer | Mettre une porte, une fenêtre ou un objet dans une position qui empêche le passage. | [article](https://www.dictionnaire-academie.fr/article/A9F0498) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9F0498) |
| maquiller | Mettre des produits de maquillage sur le visage de quelqu’un. | [article](https://www.dictionnaire-academie.fr/article/A9M1009) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9M1009) |
| peigner | Passer un peigne dans les cheveux de quelqu’un. | [article](https://www.dictionnaire-academie.fr/article/A9P1218) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9P1218) |
| retrouver | Trouver de nouveau une personne ou une chose que l’on cherchait. | [article](https://www.dictionnaire-academie.fr/article/A9R2323) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9R2323) |
| revenir | Venir de nouveau dans un lieu où l’on était auparavant. | [article](https://www.dictionnaire-academie.fr/article/A9R2376) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9R2376) |
| conseiller | Dire à quelqu’un ce qui pourrait l’aider ou ce qu’il pourrait faire. | [article](https://www.dictionnaire-academie.fr/article/A9C3676) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9C3676) |
| préparer | Faire ce qui est nécessaire pour qu’une chose soit prête. | [article](https://www.dictionnaire-academie.fr/article/A9P4090) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9P4090) |
| rédiger | Écrire un texte en choisissant et en organisant ses mots. | [article](https://www.dictionnaire-academie.fr/article/A9R1104) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9R1104) |
| réserver | Demander à garder une place, une chambre ou un objet pour plus tard. | [article](https://www.dictionnaire-academie.fr/article/A9R2028) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9R2028) |
| regretter | Être triste à cause d’une chose passée ou de l’absence de quelqu’un. | [article](https://www.dictionnaire-academie.fr/article/A9R1366) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9R1366) |
| connecter | Relier un appareil à un autre appareil ou à un réseau. | [article](https://www.dictionnaire-academie.fr/article/A9C3637) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9C3637) |
| garer | Placer un véhicule à un endroit où il peut rester arrêté. | [article](https://www.dictionnaire-academie.fr/article/A9G0271) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9G0271) |
| régler | Modifier un appareil pour qu’il fonctionne comme on le souhaite. | [article](https://www.dictionnaire-academie.fr/article/A9R1342) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9R1342) |
| récapituler | Rappeler les points les plus importants de ce qui a été dit ou fait. | [article](https://www.dictionnaire-academie.fr/article/A9R0805) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9R0805) |
| promener | Faire marcher quelqu’un ou un animal pour prendre l’air. | [article](https://www.dictionnaire-academie.fr/article/A9P4558) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9P4558) |
| patienter | Attendre sans s’impatienter. | [article](https://www.dictionnaire-academie.fr/article/A9P0972) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9P0972) |
| raccrocher | Terminer une conversation téléphonique en coupant la communication. | [article](https://www.dictionnaire-academie.fr/article/A9R0081) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9R0081) |
| quitter | Partir d’un lieu ou cesser d’être avec une personne. | [article](https://www.dictionnaire-academie.fr/article/A9Q0304) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9Q0304) |
| démissionner | Décider de quitter son emploi ou sa fonction. | [article](https://www.dictionnaire-academie.fr/article/A9D1243) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9D1243) |
| fonder | Créer une entreprise, une association ou une autre organisation. | [article](https://www.dictionnaire-academie.fr/article/A9F1190) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9F1190) |
| retourner | Aller de nouveau dans un lieu où l’on était auparavant. | [article](https://www.dictionnaire-academie.fr/article/A9R2254) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9R2254) |
| remercier | Dire merci à quelqu’un pour ce qu’il a fait. | [article](https://www.dictionnaire-academie.fr/article/A9R1569) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9R1569) |
| convenir | Être adapté à une personne ou à une situation. | [article](https://www.dictionnaire-academie.fr/article/A9C4082) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9C4082) |
| remplacer | Mettre une personne ou une chose à la place d’une autre. | [article](https://www.dictionnaire-academie.fr/article/A9R1631) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9R1631) |
| préoccuper | Causer du souci à quelqu’un ou occuper beaucoup ses pensées. | [article](https://www.dictionnaire-academie.fr/article/A9P4080) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9P4080) |
| énerver | Mettre quelqu’un en colère ou lui faire perdre son calme. | [article](https://www.dictionnaire-academie.fr/article/A9E1528) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9E1528) |
| disputer | Participer à une compétition pour essayer de gagner. | [article](https://www.dictionnaire-academie.fr/article/A9D2734) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9D2734) |
| annuler | Décider qu’une chose prévue n’aura pas lieu ou n’est plus valable. | [article](https://www.dictionnaire-academie.fr/article/A9A1851) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9A1851) |
| reporter | Déplacer un évènement prévu à une autre date. | [article](https://www.dictionnaire-academie.fr/article/A9R1905) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9R1905) |
| réparer | Remettre en état une chose abîmée ou qui ne fonctionne plus. | [article](https://www.dictionnaire-academie.fr/article/A9R1820) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9R1820) |
| visser | Faire tourner une vis ou une pièce pour la fixer. | [article](https://www.dictionnaire-academie.fr/article/A9V0980) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9V0980) |
| toucher | Mettre une partie du corps en contact avec une personne ou une chose. | [article](https://www.dictionnaire-academie.fr/article/A9T1569) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9T1569) |
| supporter | Réussir à accepter une chose difficile ou désagréable. | [article](https://www.dictionnaire-academie.fr/article/A9S3474) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9S3474) |
| tousser | Rejeter brusquement de l’air par la bouche quand la gorge ou les poumons sont irrités. | [article](https://www.dictionnaire-academie.fr/article/A9T1672) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9T1672) |
| entendre | Percevoir un son avec les oreilles. | [article](https://www.dictionnaire-academie.fr/article/A9E1839) | [conjugaison](https://www.dictionnaire-academie.fr/conjuguer/A9E1839) |

## Sécurité et vérifications

- Tables de conjugaison MyISAM : les changements ne sont pas présentés comme intégralement transactionnels. Un journal InnoDB conserve l’état initial ciblé avant les écritures. Les lignes nouvellement créées portent le marqueur du lot, ce qui permet un nettoyage compensatoire ciblé après erreur et une reprise après arrêt brutal.
- Les sens et les emplois pronominaux utilisent une transaction InnoDB. Les entrées existantes ne sont pas réécrites ; leurs formes sont contrôlées avant import.
- Test sur copies temporaires des tables : audit sans écriture dans les tables du site, panne après insertion MyISAM, compensation, reprise, application complète et relance sans doublon.
- Sauvegarde locale avant insertion : `BDD-backups/fle-2026-11-17-before.json`, dossier ignoré par Git. Elle ne contient pas les identifiants de connexion.
- Après insertion : toutes les anciennes lignes ont été comparées à la sauvegarde. Seul le drapeau pronominalisable d’entendre pouvait être activé ; ses conjugaisons et ses anciens sens sont conservés.
- Le moteur a exercé les 41 sélections demandées et produit 4428 questions. Les 9 définitions pronominales ont été vérifiées dans le catalogue.
- 89 tests ciblés réussis, plus le test d’import MySQL isolé. TypeScript et build de production réussis.
- La seconde exécution de l’import local a répondu `already-applied` sans nouvel ajout.

## Commandes locales

```sh
npm run data:verbs:fle:check
npm run data:verbs:fle:apply
node --env-file-if-exists=.env --import tsx --test tests/fle-verbs-import-database.test.mjs
```

Les deux premières commandes utilisent le lot et son sceau versionnés ; la première ne fait aucune écriture en base.

Pour reconstruire le lot à partir des sources téléchargées :

```sh
node scripts/prepare-fle-verbs.mjs --sources=/chemin/vers/les-fiches --morphalou=/chemin/vers/Morphalou3.1_CSV.csv
```

Le répertoire de sources doit contenir `academy.json` et `academie/<infinitif>-article.html` / `<infinitif>-conjugation.html`. Les condensats des pages sont dans le lot versionné. La reconstruction ne touche pas MySQL.

## Plesk

Les fichiers du lot, son audit, le service d’import et le plugin `zz-fle-verb-batch-migration.ts` sont versionnés. Au démarrage, le plugin effectue les mêmes vérifications et ajoute uniquement les entrées manquantes. Il utilise la connexion du site ; aucun secret MySQL n’est versionné et aucun téléchargement de dictionnaire n’a lieu sur le serveur.

Publication : `git push`, déploiement Plesk habituel, redémarrage normal de l’application, puis lecture des journaux. Laisser les « Actions de déploiement supplémentaires » vides. Ne pas utiliser « Run script ». Une divergence dans les données de production bloque l’import du lot et doit être examinée ; elle n’entraîne aucun écrasement automatique.

Un retour au code précédent ne supprime pas les verbes déjà importés. Pour annuler des données après utilisation du site, faire d’abord un état des dépendances et une sauvegarde récente ; ne pas restaurer aveuglément une ancienne sauvegarde complète.

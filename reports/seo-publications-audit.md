# Audit initial des publications SEO de défis

Date de l’audit : 18 août 2026.

## État technique

- Les défis personnels sont stockés dans `defis` et restent accessibles par `/[locale]/defi/CODE` avec une directive globale `noindex, nofollow`.
- Les 38 défis officiels sont stockés dans `challenge_presets` et reliés aux catégories, verbes et temps par les tables dédiées.
- Le sitemap actuel est statique.
- Le SEO global suppose actuellement que toutes les langues partagent le même chemin.
- Le routeur localise automatiquement les routes sous `/fr`, `/de`, `/en`, `/it` et `/es`.
- Le typecheck et les 44 tests ciblés SEO/défis réussissaient avant l’implémentation.

## Pages de temps déjà présentes

Les sujets suivants possèdent déjà une page `/exercices/[parcours]` et ne doivent pas être recréés comme publications concurrentes :

- présent de l’indicatif ;
- imparfait ;
- passé composé ;
- plus-que-parfait ;
- futur simple ;
- futur antérieur ;
- passé simple ;
- passé antérieur ;
- conditionnel présent ;
- conditionnel passé ;
- subjonctif présent ;
- subjonctif passé.

## Premier lot documentaire — historique

Les trois propositions ci-dessous ont servi à valider la structure initiale. Elles ont depuis été remplacées par le catalogue complet et publié de 190 fiches versionné dans `shared/data/challenge-publication-deployment.json`.

### Preset `ger` — Verbes en -ger

| Langue | Slug | H1 | Titre SEO |
| --- | --- | --- | --- |
| fr | `exercices-verbes-en-ger` | Exercices de conjugaison sur les verbes en -ger | Verbes en -ger : exercices de conjugaison française |
| de | `uebungen-franzoesische-verben-auf-ger` | Übungen zu französischen Verben auf -ger | Französische Verben auf -ger – Übungen |
| en | `french-ger-verbs-exercises` | French -ger verb conjugation exercises | French -ger verbs: conjugation exercises |
| it | `esercizi-verbi-francesi-in-ger` | Esercizi sui verbi francesi in -ger | Verbi francesi in -ger: esercizi di coniugazione |
| es | `ejercicios-verbos-franceses-en-ger` | Ejercicios de verbos franceses terminados en -ger | Verbos franceses en -ger: ejercicios de conjugación |

Description française proposée : « Entraîne-toi à conjuguer les verbes français terminés par -ger et à conserver le e nécessaire devant certaines terminaisons. »

### Preset `pronominaux` — Verbes pronominaux

| Langue | Slug | H1 | Titre SEO |
| --- | --- | --- | --- |
| fr | `exercices-verbes-pronominaux` | Exercices de conjugaison sur les verbes pronominaux | Verbes pronominaux : exercices de conjugaison |
| de | `uebungen-franzoesische-reflexive-verben` | Übungen zu französischen reflexiven Verben | Französische reflexive Verben – Übungen |
| en | `french-reflexive-verbs-exercises` | French reflexive verb exercises | French reflexive verbs: conjugation exercises |
| it | `esercizi-verbi-pronominali-francesi` | Esercizi sui verbi pronominali francesi | Verbi pronominali francesi: esercizi |
| es | `ejercicios-verbos-pronominales-franceses` | Ejercicios de verbos pronominales franceses | Verbos pronominales franceses: ejercicios |

Description française proposée : « Travaille les pronoms réfléchis et la conjugaison des verbes pronominaux français dans plusieurs modes et temps. »

### Preset `sens-mouvement` — Mouvement et déplacement

| Langue | Slug | H1 | Titre SEO |
| --- | --- | --- | --- |
| fr | `exercices-verbes-mouvement` | Exercices sur les verbes de mouvement en français | Verbes de mouvement : exercices de conjugaison |
| de | `uebungen-franzoesische-bewegungsverben` | Übungen zu französischen Bewegungsverben | Französische Bewegungsverben – Übungen |
| en | `french-movement-verbs-exercises` | French movement verb exercises | French movement verbs: conjugation exercises |
| it | `esercizi-verbi-francesi-di-movimento` | Esercizi sui verbi francesi di movimento | Verbi francesi di movimento: esercizi |
| es | `ejercicios-verbos-franceses-de-movimiento` | Ejercicios de verbos franceses de movimiento | Verbos franceses de movimiento: ejercicios |

Description française proposée : « Entraîne-toi avec aller, venir, partir, arriver et d’autres verbes français qui expriment un mouvement ou un déplacement. »

## Décisions de périmètre

- Route retenue : `/[locale]/defis/[slug traduit]`.
- Une publication en brouillon retourne 404 au public.
- Publier implique désormais automatiquement l’indexation et une réponse 200 avec `index, follow`.
- Les slugs publiés ne changent jamais automatiquement.
- Un changement manuel de slug crée un historique et une redirection 301.
- La bibliothèque `/[locale]/defis` présente les 38 publications autorisées dans chaque langue.
- Aucune association automatique n’est créée entre une URL `/defi/CODE` et un preset officiel.
- Search Console n’est pas accessible depuis l’environnement de développement ; aucune redirection d’ancienne URL personnelle n’est donc engagée.

## Compte rendu d’implémentation

### Fonctionnalités réalisées

- Migration de démarrage idempotente pour les publications et l’historique des slugs.
- Service strictement séparé des défis personnels, avec validation, transactions et erreurs 400/404/409.
- API publique limitée aux contenus publiés et API d’administration protégée.
- Administration multilingue avec brouillons, états, aperçu canonique et autosave.
- Chargement direct d’un preset officiel dans le moteur existant.
- Pages SSR `/[locale]/defis` et `/[locale]/defis/[slug]`.
- Canonical, robots, Open Graph et `hreflang` centralisés et adaptés aux slugs traduits.
- Sitemap dynamique avec repli statique et maillage depuis le pied de page et la bibliothèque.

### Vérifications finales du 18 août 2026

- Migration exécutée deux fois : même schéma, zéro publication et zéro redirection.
- Suite complète : 845 tests réussis, 0 échec.
- Typecheck Nuxt : réussi.
- Build de production : réussi.
- HTTP local : 38 publications listées dans chacune des cinq langues, pages échantillonnées en 200, slug inconnu en 404, API et sitemap en 200.
- HTML SSR : un H1 traduit et une langue HTML correcte dans les cinq bibliothèques.
- Sitemap : XML validé par `xmllint`.
- `git diff --check` : réussi.

### Catalogue publié préparé le 18 août 2026

- Les 38 défis préfabriqués possèdent chacun une version française, allemande, anglaise, italienne et espagnole.
- Les 190 fiches possèdent un slug unique, un H1 contenant le terme local de conjugaison, un titre SEO, une description éditoriale et une meta description.
- Les descriptions présentent le bénéfice pédagogique propre au niveau, au groupe, au parcours ou à la difficulté travaillée.
- Les catégories publiques et les indications de personnalisation sont traduites dans les cinq langues.
- Toutes les fiches sont publiées et indexables ; la base locale contient 38 fiches complètes par langue et aucun champ vide.
- Le paquet versionné les référence par `preset_key` et remplace uniquement ces publications ciblées sur la base distante.

### Éléments volontairement non exécutés

- Aucun déploiement, redémarrage Plesk ou envoi Search Console n’a été effectué.
- Les contrôles de production et Search Console ne pourront avoir lieu qu’après un futur accord de déploiement.
